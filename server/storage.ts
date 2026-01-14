import { drizzle } from "drizzle-orm/mysql2";
import mysql, { RowDataPacket } from "mysql2/promise";
import * as schema from "@shared/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import type { Billing, InsertBilling, User, InsertLoginAttempt } from "@shared/schema";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { dbConfig, securityConfig } from "./config";

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

const db = drizzle(pool, { schema, mode: "default" });

// Constantes de seguridad desde configuración
const MAX_LOGIN_ATTEMPTS = securityConfig.maxLoginAttempts;
const LOCKOUT_DURATION_MINUTES = securityConfig.lockoutDurationMinutes;

// Interfaz de usuario autenticado (para la sesión)
export interface AuthenticatedUser {
  id: number;
  email: string;
  rut: string;
  nombre: string;
  perfil: string;
  area: string | null;
  supervisor: string | null;
  zona: string | null;
}

// Monitor Diario Dashboard Types
export interface MonitorDiarioDashboardData {
  activityTypeCounts: Array<{ name: string; value: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  closingCodeDistribution: Array<{ name: string; value: number; color: string }>;
  supervisorStats: Array<{
    name: string;
    technicianCount: number;
    px0Count: number;
    completionRate: number;
  }>;
  globalCompletionRate: number;
  // New fields for stacked bar charts
  px0TechsByStatusBySupervisor: Record<string, Array<{
    name: string; // technician name
    Cancelado: number;
    Iniciado: number;
    'No Realizada': number;
    Pendiente: number;
    Completado: number;
    'En ruta': number;
    Suspendido: number;
  }>>;
  technicianFirstActivityTime: Record<string, Array<{
    name: string; // technician name
    firstActivityTime: string; // HH:MM
    horaDecimal: number; // for sorting/charting if needed
  }>>;
  technicianRecordCount: Record<string, Array<{
    name: string; // technician name
    recordCount: number;
  }>>;
  lastIntegration: string | null;
}

export interface IStorage {
  // Billing operations
  getAllBilling(): Promise<Billing[]>;
  getBillingById(id: number): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  deleteBilling(id: number): Promise<boolean>;
  getTqwComisionData(rut: string, periodo: string): Promise<schema.TqwComisionRenew | undefined>;
  getKpiData(periodo: string): Promise<schema.TqwComisionRenew[]>;
  getKpiPeriods(): Promise<string[]>;
  getMonitorDiarioDashboard(): Promise<MonitorDiarioDashboardData>;

  // Materials operations
  getMaterialTipos(): Promise<string[]>;
  getMaterialFamilias(tipo: string): Promise<string[]>;
  getMaterialSubfamilias(tipo: string, familia: string): Promise<string[]>;
  getMaterialItems(tipo: string, familia: string, subfamilia: string): Promise<Array<{ id: string, description: string }>>;

  // Material solicitud operations
  getMaterialSolicitudes(userId: number): Promise<any[]>;
  getUserPerfil2(userId: number): Promise<string | null>;
  getItemCodeByDescription(description: string): Promise<string | null>;
  createMaterialSolicitud(data: {
    material: string;
    cantidad: number;
    tecnico: number;
    id_tecnico_traspaso: number;
    ticket: string;
    flag_regiones: string;
    flag_gestion_supervisor: number;
    campo_item: string;
  }): Promise<number>;
  getTechnicians(): Promise<Array<{ id: number, name: string, rut: string }>>;

  // Authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  validateCredentials(email: string, password: string): Promise<AuthenticatedUser | null>;
  recordLoginAttempt(data: InsertLoginAttempt): Promise<void>;
  getRecentLoginAttempts(email: string, ip: string): Promise<number>;
  isAccountLocked(email: string, ip: string): Promise<boolean>;
  createSession(rut: string, token: string): Promise<void>;
  logConnection(usuario: string, pagina: string, ip: string): Promise<number>;
  closeConnection(id: number): Promise<void>;
  getExportData(rut: string, period: string): Promise<Array<{
    'Fecha fin#': string;
    orden: string;
    'Dir# cliente': string;
    Trabajo: string;
    RGU: number;
    Puntos: number;
    'Tipo Red': string;
    producto: string;
    'Tipo vivienda': string;
    'Clase vivienda': string;
  }>>;
  getCalidadTqwPeriods(): Promise<string[]>;
  getCalidadTqwData(mesContable: string): Promise<any[]>;
  getDetalleOtPeriods(): Promise<string[]>;
  getDetalleOtData(mesContable: string): Promise<any[]>;
  getDetalleOtPeriods(): Promise<string[]>;
  getDetalleOtData(mesContable: string): Promise<any[]>;
  getPointsParameters(): Promise<schema.PuntosParameter[]>;
  updatePointsParameter(id: number, data: Partial<schema.InsertPuntosParameter>): Promise<schema.PuntosParameter | undefined>;

  // Sidebar Permissions
  getSidebarPermissions(profile: string): Promise<string[]>;
  getAllSidebarPermissions(): Promise<schema.SidebarPermission[]>;
  updateSidebarPermissions(profile: string, allowedItems: string[]): Promise<schema.SidebarPermission>;

  // Logistics Operations
  getSupervisorLogisticsMaterials(): Promise<any[]>;
  updateLogisticsMaterialStatus(id: number, status: 'approved' | 'rejected'): Promise<boolean>;

  // SME Operations
  getSmeActivities(startDate?: string, endDate?: string): Promise<any[]>;
  getSmeTechnicians(): Promise<Array<{ id: number, name: string, rut: string }>>;
  createSmeActivity(data: any): Promise<void>;
  getLocalidadesByZona(zona: string): Promise<any[]>;
}

export class MySQLStorage implements IStorage {
  async getAllBilling(): Promise<Billing[]> {
    return db.select().from(schema.billing).orderBy(desc(schema.billing.fecha_gestion));
  }

  async getBillingById(id: number): Promise<Billing | undefined> {
    const [result] = await db
      .select()
      .from(schema.billing)
      .where(eq(schema.billing.id, id));
    return result;
  }

  async createBilling(billing: InsertBilling): Promise<Billing> {
    const dataToInsert = {
      ...billing,
      valorizacion: billing.valorizacion ? billing.valorizacion.toString() : null,
    };
    const result = await db.insert(schema.billing).values(dataToInsert as any);
    const insertId = result[0].insertId;
    const created = await this.getBillingById(insertId);
    if (!created) throw new Error("Failed to create billing record");
    return created;
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    const dataToUpdate = {
      ...billing,
      valorizacion: billing.valorizacion !== undefined && billing.valorizacion !== null
        ? billing.valorizacion.toString()
        : billing.valorizacion,
    };
    await db
      .update(schema.billing)
      .set(dataToUpdate as any)
      .where(eq(schema.billing.id, id));
    return this.getBillingById(id);
  }

  async deleteBilling(id: number): Promise<boolean> {
    await db.delete(schema.billing).where(eq(schema.billing.id, id));
    return true;
  }

  async getTqwComisionData(rut: string, periodo: string): Promise<schema.TqwComisionRenew | undefined> {
    const [result] = await db
      .select()
      .from(schema.tqwComisionRenew)
      .where(and(
        eq(schema.tqwComisionRenew.RutTecnicoOrig, rut),
        eq(schema.tqwComisionRenew.periodo, periodo)
      ));
    return result;
  }

  async getKpiData(periodo: string): Promise<schema.TqwComisionRenew[]> {
    try {
      console.log(`[KPI] Fetching data for period: ${periodo}`);

      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          *,
          \`Comisión_HFC\` as Comision_HFC,
          \`Comisión_FTTH\` as Comision_FTTH,
          \`Comisión_HFC_Ponderada\` as Comision_HFC_Ponderada,
          \`Comisión_FTTH_Ponderada\` as Comision_FTTH_Ponderada
         FROM tb_tqw_comision_renew 
         WHERE periodo = ? 
         ORDER BY NombreTecnico ASC`,
        [periodo]
      );

      console.log(`[KPI] Found ${rows.length} records for period ${periodo}`);

      return rows as schema.TqwComisionRenew[];
    } catch (error) {
      console.error(`[KPI] Error fetching data for period ${periodo}:`, error);
      throw error;
    }
  }

  async getKpiPeriods(): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT periodo FROM tb_tqw_comision_renew 
         WHERE periodo IS NOT NULL AND periodo != ''
         ORDER BY periodo DESC`
      );
      return (rows as any[]).map(r => r.periodo);
    } catch (error) {
      console.error("Error fetching KPI periods:", error);
      return [];
    }
  }

  async getMonitorDiarioDashboard(): Promise<MonitorDiarioDashboardData> {
    try {
      // DEBUG LOGGING
      try {
        const [t] = await pool.execute('SELECT COUNT(*) as c FROM tb_toa_reporte_diario_mysql');
        console.log('[Monitor Diario Debug] Total Rows in Table:', (t as any)[0].c);
        const [a] = await pool.execute("SELECT COUNT(*) as c FROM tb_toa_reporte_diario_mysql WHERE Tipo_registro = 'Actividad'");
        console.log('[Monitor Diario Debug] Activity Rows (Exact):', (a as any)[0].c);
      } catch (err) {
        console.error('[Monitor Diario Debug] Error running debug queries:', err);
      }

      // Query 1: Activity type counts for bar chart
      const [activityRows] = await pool.execute<RowDataPacket[]>(
        `SELECT \`Tipo de Actividad\` as name, COUNT(*) as value
         FROM tb_toa_reporte_diario_mysql
         WHERE \`Tipo de Actividad\` IS NOT NULL AND \`Tipo de Actividad\` != ''
           AND Tipo_registro = 'Actividad'
         GROUP BY \`Tipo de Actividad\`
         ORDER BY value DESC`
      );

      // Query 2: Status distribution for pie chart
      const [statusRows] = await pool.execute<RowDataPacket[]>(
        `SELECT Estado as name, COUNT(*) as value
         FROM tb_toa_reporte_diario_mysql
         WHERE Estado IS NOT NULL AND Estado != ''
           AND Tipo_registro = 'Actividad'
         GROUP BY Estado
         ORDER BY value DESC`
      );

      // Query 3: Closing code distribution for non-completed orders
      const [closingCodeRows] = await pool.execute<RowDataPacket[]>(
        `SELECT \`Código de Cierre\` as name, COUNT(*) as value
         FROM tb_toa_reporte_diario_mysql
         WHERE Estado != 'Completado' 
           AND \`Código de Cierre\` IS NOT NULL 
           AND \`Código de Cierre\` != ''
           AND Tipo_registro = 'Actividad'
         GROUP BY \`Código de Cierre\`
         ORDER BY value DESC`
      );

      // Query 4: Supervisor statistics
      const [supervisorRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          COALESCE(supervisor, '(Blank)') as name,
          COUNT(DISTINCT \`Técnico\`) as technicianCount,
          COUNT(DISTINCT CASE WHEN Flag_Sin_Actividad_Completada = 1 THEN \`Técnico\` END) as px0Count,
          ROUND(
            SUM(CASE WHEN Estado = 'Completado' THEN 1 ELSE 0 END) * 100.0 /
            NULLIF(SUM(CASE WHEN Estado IN ('Completado', 'No Realizada') THEN 1 ELSE 0 END), 0),
            1
          ) as completionRate
         FROM tb_toa_reporte_diario_mysql
         WHERE Tipo_registro = 'Actividad'
         GROUP BY supervisor
         ORDER BY name`
      );

      // Query 5: Global completion rate
      const [globalRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          ROUND(
            SUM(CASE WHEN Estado = 'Completado' THEN 1 ELSE 0 END) * 100.0 /
            NULLIF(SUM(CASE WHEN Estado IN ('Completado', 'No Realizada') THEN 1 ELSE 0 END), 0),
            1
          ) as completionRate
         FROM tb_toa_reporte_diario_mysql
         WHERE Tipo_registro = 'Actividad'`
      );

      // Query 6: PX0 Technicians by Status per Supervisor
      const [px0Rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          \`Técnico\` as technician,
          Nombre_short,
          IFNULL(supervisor, '(Blank)') as supervisor,
          SUM(CASE WHEN Estado = 'Cancelado' THEN 1 ELSE 0 END) as Cancelado,
          SUM(CASE WHEN Estado = 'Iniciado' THEN 1 ELSE 0 END) as Iniciado,
          SUM(CASE WHEN Estado = 'No Realizada' THEN 1 ELSE 0 END) as NoRealizada,
          SUM(CASE WHEN Estado = 'Pendiente' THEN 1 ELSE 0 END) as Pendiente,
          SUM(CASE WHEN Estado = 'Completado' THEN 1 ELSE 0 END) as Completado,
          SUM(CASE WHEN Estado = 'En ruta' THEN 1 ELSE 0 END) as EnRuta,
          SUM(CASE WHEN Estado = 'Suspendido' THEN 1 ELSE 0 END) as Suspendido
         FROM tb_toa_reporte_diario_mysql
         WHERE Tipo_registro = 'Actividad' 
           AND Flag_Sin_Actividad_Completada = 1
         GROUP BY \`Técnico\`, Nombre_short, supervisor
         ORDER BY technician`
      );

      // Query 7: First Activity Time per Technician per Supervisor
      const [firstTimeRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          \`Técnico\` as technician,
          Nombre_short,
          IFNULL(supervisor, '(Blank)') as supervisor,
          MIN(Hora_Inicio_Primer_Actividad_Completada) as firstActivityTime
         FROM tb_toa_reporte_diario_mysql
         WHERE Tipo_registro = 'Actividad'
           AND Hora_Inicio_Primer_Actividad_Completada IS NOT NULL
         GROUP BY \`Técnico\`, Nombre_short, supervisor
         ORDER BY technician`
      );

      // Query 9: Count of records per Technician per Supervisor
      const [recordCountRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          \`Técnico\` as technician,
          Nombre_short,
          IFNULL(supervisor, '(Blank)') as supervisor,
          COUNT(*) as recordCount
         FROM tb_toa_reporte_diario_mysql
         WHERE Tipo_registro = 'Actividad'
         GROUP BY \`Técnico\`, Nombre_short, supervisor
         ORDER BY technician`
      );

      // Query 8: Last integration date
      const [integrationRows] = await pool.execute<RowDataPacket[]>(
        "SELECT MAX(fecha_integracion) as last_integration FROM tb_toa_reporte_diario_mysql"
      );
      const rawDate = (integrationRows as any)[0]?.last_integration;

      console.log(`[Monitor Diario] PX0 Rows: ${px0Rows.length}`);
      console.log(`[Monitor Diario] First Time Rows: ${firstTimeRows.length}`);
      console.log(`[Monitor Diario] Record Count Rows: ${recordCountRows.length}`);
      console.log(`[Monitor Diario] Last Integration: ${(integrationRows as any)[0]?.last_integration}`);

      // Map status to colors
      const statusColorMap: Record<string, string> = {
        'Completado': '#22c55e',
        'No Realizada': '#ef4444',
        'Cancelado': '#000000',
        'Suspendido': '#3b82f6',
        'Iniciado': '#f97316',
        'Pendiente': '#eab308',
        'En ruta': '#94a3b8'
      };

      // Map closing codes to colors
      const closingCodeColorMap: Record<string, string> = {
        'Sin moradores': '#3b82f6',
        'Cliente reagenda': '#3b0764',
        'Orden mal generada': '#a855f7',
        'Clte desiste': '#ec4899',
        'Dirección incorrecta': '#db2777',
        'NAP Problema': '#be185d'
      };

      const statusDistribution = statusRows.map((row: any) => ({
        name: row.name,
        value: Number(row.value),
        color: statusColorMap[row.name] || '#94a3b8'
      }));

      const closingCodeDistribution = closingCodeRows.map((row: any) => ({
        name: row.name,
        value: Number(row.value),
        color: closingCodeColorMap[row.name] || '#94a3b8'
      }));

      const supervisorStats = supervisorRows.map((row: any) => ({
        name: row.name || '(Blank)',
        technicianCount: Number(row.technicianCount) || 0,
        px0Count: Number(row.px0Count) || 0,
        completionRate: Number(row.completionRate) || 0
      }));



      // Process PX0 data
      const px0TechsByStatusBySupervisor: Record<string, any[]> = {};
      px0Rows.forEach((row: any) => {
        const supName = row.supervisor;
        if (!px0TechsByStatusBySupervisor[supName]) {
          px0TechsByStatusBySupervisor[supName] = [];
        }
        px0TechsByStatusBySupervisor[supName].push({
          name: row.Nombre_short || row.technician,
          Cancelado: Number(row.Cancelado),
          Iniciado: Number(row.Iniciado),
          'No Realizada': Number(row.NoRealizada),
          Pendiente: Number(row.Pendiente),
          Completado: Number(row.Completado),
          'En ruta': Number(row.EnRuta),
          Suspendido: Number(row.Suspendido)
        });
      });

      // Process First Activity Time data
      const technicianFirstActivityTime: Record<string, any[]> = {};
      firstTimeRows.forEach((row: any) => {
        const supName = row.supervisor;
        if (!technicianFirstActivityTime[supName]) {
          technicianFirstActivityTime[supName] = [];
        }

        // El campo llega como decimal HH.MM (ej: 10.38 para 10:38)
        let timeValue = 0;
        let displayTime = "00:00";

        if (row.firstActivityTime != null) {
          // Robust parsing: handle strings with commas too
          let rawString = row.firstActivityTime.toString();
          rawString = rawString.replace(',', '.');

          const rawValue = parseFloat(rawString);

          if (!isNaN(rawValue)) {
            const hours = Math.floor(rawValue);
            const minutes = Math.round((rawValue - hours) * 100);

            // Limit minutes to 59 to avoid overflow on invalid data
            const cleanMinutes = Math.min(59, minutes);

            // Convertir a valor decimal real para el gráfico (ej: 10:30 -> 10.5)
            timeValue = hours + (cleanMinutes / 60);
            displayTime = `${hours.toString().padStart(2, '0')}:${cleanMinutes.toString().padStart(2, '0')}`;
          } else {
            console.warn(`[Monitor Diario] Invalid time format for ${row.technician}: ${row.firstActivityTime}`);
          }
        }

        // Debug logs for first few items
        if (technicianFirstActivityTime[supName].length < 2) {
          console.log(`[Monitor Diario Debug] Tech: ${row.Nombre_short}, Raw: ${row.firstActivityTime}, Value: ${timeValue}`);
        }

        technicianFirstActivityTime[supName].push({
          name: row.Nombre_short || row.technician,
          firstActivityTime: displayTime,
          horaDecimal: timeValue
        });
      });

      // Process Record Count data
      const technicianRecordCount: Record<string, any[]> = {};
      console.log(`[Monitor Diario] Processing ${recordCountRows.length} record count rows`);
      recordCountRows.forEach((row: any) => {
        const supName = row.supervisor;
        if (!technicianRecordCount[supName]) {
          technicianRecordCount[supName] = [];
        }
        technicianRecordCount[supName].push({
          name: row.Nombre_short || row.technician,
          recordCount: Number(row.recordCount)
        });
      });
      console.log(`[Monitor Diario] technicianRecordCount keys:`, Object.keys(technicianRecordCount));

      const result = {
        activityTypeCounts: activityRows as Array<{ name: string; value: number }>,
        statusDistribution,
        closingCodeDistribution,
        supervisorStats,
        globalCompletionRate: Number((globalRows as any)[0]?.completionRate) || 0,
        px0TechsByStatusBySupervisor,
        technicianFirstActivityTime,
        technicianRecordCount,
        lastIntegration: rawDate ? new Date(rawDate).toLocaleString('es-CL') : null
      };

      console.log("[Monitor Diario] Dashboard data fetched successfully");
      return result;
    } catch (error) {
      console.error("[Monitor Diario] Error fetching dashboard data:", error);
      throw error;
    }
  }

  // ============================================
  // AUTHENTICATION OPERATIONS
  // ============================================

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return result;
  }

  async validateCredentials(email: string, password: string): Promise<AuthenticatedUser | null> {
    try {
      // Consulta que replica la lógica del documento:
      // Obtiene la contraseña más reciente del usuario y valida que esté vigente
      const [rows] = await pool.execute(
        `SELECT t.pass_new, w.id, w.email, w.nombre, w.area, w.supervisor, w.rut, w.PERFIL, w.ZONA_GEO
        FROM (
          SELECT a.usuario, a.pass_new, a.fecha_registro, 
                 (SELECT COUNT(*) FROM tb_claves_usuarios b 
                  WHERE a.usuario = b.usuario AND a.fecha_registro <= b.fecha_registro) as total
          FROM tb_claves_usuarios a
          WHERE a.usuario = ?
        ) t
        LEFT JOIN tb_user_tqw w ON t.usuario = w.email
        WHERE t.total = 1 AND w.vigente = 'Si'
        LIMIT 1`,
        [email]
      );

      const results = rows as any[];

      if (!results || results.length === 0) {
        return null;
      }

      const user = results[0];
      const storedPassword = user.pass_new;

      if (!storedPassword) {
        return null;
      }

      // Validación de contraseña (soporte dual: bcrypt y texto plano legado)
      let passwordValid = false;
      const isBcrypt = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

      if (isBcrypt) {
        try {
          passwordValid = await bcrypt.compare(password, storedPassword);
        } catch (bcryptError) {
          console.error("Error comparing bcrypt password:", bcryptError);
          passwordValid = false;
        }
      } else {
        // Simple plaintext comparison with trim
        passwordValid = storedPassword.trim() === password.trim();
      }

      if (!passwordValid) {
        return null;
      }

      console.log("User authenticated successfully:", email, "Perfil:", user.PERFIL);

      return {
        id: user.id,
        email: user.email || email,
        rut: user.rut || '',
        nombre: user.nombre || '',
        perfil: user.PERFIL || 'user',
        area: user.area,
        supervisor: user.supervisor,
        zona: user.ZONA_GEO,
      };
    } catch (error) {
      console.error("Error validating credentials:", error);
      return null;
    }
  }

  async recordLoginAttempt(data: InsertLoginAttempt): Promise<void> {
    try {
      await db.insert(schema.loginAttempts).values({
        ...data,
        created_at: new Date(),
      });
    } catch (error) {
      // Si la tabla no existe, solo logueamos el error
      console.error("Error recording login attempt:", error);
    }
  }

  async getRecentLoginAttempts(email: string, ip: string): Promise<number> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM login_attempts 
         WHERE email = ? AND ip_address = ? AND success = 0 
         AND created_at >= ?`,
        [email, ip, fifteenMinutesAgo]
      );

      const results = rows as any[];
      return results[0]?.count || 0;
    } catch (error) {
      // Si la tabla no existe, retornamos 0
      console.error("Error getting login attempts:", error);
      return 0;
    }
  }

  async isAccountLocked(email: string, ip: string): Promise<boolean> {
    const attempts = await this.getRecentLoginAttempts(email, ip);
    return attempts >= MAX_LOGIN_ATTEMPTS;
  }

  async createSession(rut: string, token: string): Promise<void> {
    try {
      await db.insert(schema.activeSessions).values({
        RUT: rut,
        TOKEN: token,
        FECH_REG: new Date(),
        FLAG_GET: 'N',
      });
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }

  async logConnection(usuario: string, pagina: string, ip: string): Promise<number> {
    try {
      const result = await db.insert(schema.connectionLogs).values({
        usuario,
        pagina,
        ip,
        estado: 'ACTIVE',
        fecha_conexion: new Date(),
        tcp_state: 1,
      });
      return result[0].insertId;
    } catch (error) {
      console.error("Error logging connection:", error);
      return 0;
    }
  }

  async closeConnection(id: number): Promise<void> {
    try {
      const connection = await db
        .select()
        .from(schema.connectionLogs)
        .where(eq(schema.connectionLogs.id, id));

      if (connection[0]) {
        const duracion = Math.floor(
          (Date.now() - new Date(connection[0].fecha_conexion!).getTime()) / 1000
        );

        await db
          .update(schema.connectionLogs)
          .set({
            estado: 'CLOSED',
            fecha_desconexion: new Date(),
            duracion,
            tcp_state: 0,
          })
          .where(eq(schema.connectionLogs.id, id));
      }
    } catch (error) {
      console.error("Error closing connection:", error);
    }
  }

  // ============================================
  // MATERIALS OPERATIONS
  // ============================================

  async getMaterialTipos(): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT \`Tipo Material\` FROM tp_logistica_mat_oracle 
         WHERE \`Tipo Material\` IS NOT NULL AND \`Tipo Material\` != '' 
         ORDER BY \`Tipo Material\` ASC`
      );
      const results = rows as any[];
      return results.map(r => r['Tipo Material']).filter(Boolean);
    } catch (error) {
      console.error("Error fetching material tipos:", error);
      return [];
    }
  }

  async getMaterialFamilias(tipo: string): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT \`Familia\` FROM tp_logistica_mat_oracle 
         WHERE \`Tipo Material\` = ? AND \`Familia\` IS NOT NULL AND \`Familia\` != '' 
         ORDER BY \`Familia\` ASC`,
        [tipo]
      );
      const results = rows as any[];
      return results.map(r => r['Familia']).filter(Boolean);
    } catch (error) {
      console.error("Error fetching material familias:", error);
      return [];
    }
  }

  async getMaterialSubfamilias(tipo: string, familia: string): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT \`Sub Familia\` FROM tp_logistica_mat_oracle 
         WHERE \`Tipo Material\` = ? AND \`Familia\` = ? 
         AND \`Sub Familia\` IS NOT NULL AND \`Sub Familia\` != '' 
         ORDER BY \`Sub Familia\` ASC`,
        [tipo, familia]
      );
      const results = rows as any[];
      return results.map(r => r['Sub Familia']).filter(Boolean);
    } catch (error) {
      console.error("Error fetching material subfamilias:", error);
      return [];
    }
  }

  async getMaterialItems(tipo: string, familia: string, subfamilia: string): Promise<Array<{ id: string, description: string }>> {
    try {
      const [rows] = await pool.execute(
        `SELECT \`Item\`, \`Item Description\` FROM tp_logistica_mat_oracle 
         WHERE \`Tipo Material\` = ? AND \`Familia\` = ? AND \`Sub Familia\` = ? 
         AND \`Item\` IS NOT NULL AND \`Item\` != '' 
         ORDER BY \`Item Description\` ASC`,
        [tipo, familia, subfamilia]
      );
      const results = rows as any[];
      return results.map(r => ({
        id: r['Item'],
        description: r['Item Description'] || r['Item']
      })).filter((item, index, self) => self.findIndex(i => i.id === item.id) === index);
    } catch (error) {
      console.error("Error fetching material items:", error);
      return [];
    }
  }

  // ============================================
  // MATERIAL SOLICITUD OPERATIONS
  // ============================================

  async getUserPerfil2(userId: number): Promise<string | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT perfil2 FROM tb_user_tqw WHERE id = ?`,
        [userId]
      );
      const results = rows as any[];
      return results[0]?.perfil2 || null;
    } catch (error) {
      console.error("Error fetching user perfil2:", error);
      return null;
    }
  }

  async getItemCodeByDescription(description: string): Promise<string | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT \`Item\`, \`Item Description\` FROM tp_logistica_mat_oracle 
         WHERE \`Item Description\` LIKE ? LIMIT 1`,
        [`%${description}%`]
      );
      const results = rows as any[];
      return results[0]?.['Item'] || null;
    } catch (error) {
      console.error("Error fetching item code by description:", error);
      return null;
    }
  }

  async createMaterialSolicitud(data: {
    material: string;
    cantidad: number;
    tecnico: number;
    id_tecnico_traspaso: number;
    ticket: string;
    flag_regiones: string;
    flag_gestion_supervisor: number;
    campo_item: string;
  }): Promise<number> {
    try {
      console.log('[createMaterialSolicitud] Starting insert with data:', JSON.stringify(data, null, 2));

      // Using raw query for insert to handle the table name case sensitivity if needed
      // and match the existing pattern in other methods
      const [result] = await pool.execute(
        `INSERT INTO tb_logis_tecnico_solicitud 
         (material, cantidad, tecnico, id_tecnico_traspaso, ticket, fecha, flag_regiones, flag_gestion_supervisor, campo_item)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
        [
          data.material,
          data.cantidad,
          data.tecnico,
          data.id_tecnico_traspaso,
          data.ticket,
          data.flag_regiones,
          data.flag_gestion_supervisor,
          data.campo_item
        ]
      );

      const insertId = (result as any).insertId;
      console.log('[createMaterialSolicitud] Successfully inserted with ID:', insertId);
      return insertId;
    } catch (error: any) {
      console.error('[createMaterialSolicitud] ERROR DETAILS:');
      console.error('  - Error message:', error.message);
      console.error('  - Error code:', error.code);
      console.error('  - SQL State:', error.sqlState);
      console.error('  - SQL Message:', error.sqlMessage);
      console.error('  - Data attempted:', JSON.stringify(data, null, 2));
      console.error('  - Full error:', error);
      throw error;
    }
  }

  async getSupervisorLogisticsMaterials(): Promise<any[]> {
    try {
      console.log('[Supervisor Logistics] Starting query for grouped tickets...');

      // Fetch all individual items
      const [allItems] = await pool.execute(`
        SELECT 
          tlts.id,
          tlts.TICKET,
          tlts.material,
          tlts.cantidad,
          tlts.campo_item,
          tlts.fecha,
          tlts.tecnico,
          tlts.id_tecnico_traspaso,
          tlts.flag_regiones,
          tlts.flag_gestion_supervisor,
          tlts.flag_gestion_bodega,
          tlts.FLAG_BODEGA,
          MAX(tut.Nombre_short) as tecnicoOrigen,
          MAX(tut2.Nombre_short) as tecnicoDestino
        FROM tb_logis_tecnico_solicitud tlts
        LEFT JOIN tb_user_tqw tut ON tut.id = tlts.tecnico
        LEFT JOIN tb_user_tqw tut2 ON tut2.id = tlts.id_tecnico_traspaso
        GROUP BY 
          tlts.id, tlts.TICKET, tlts.material, tlts.cantidad, tlts.campo_item, 
          tlts.fecha, tlts.tecnico, tlts.id_tecnico_traspaso, tlts.flag_regiones, 
          tlts.flag_gestion_supervisor, tlts.flag_gestion_bodega, tlts.FLAG_BODEGA
        ORDER BY tlts.fecha DESC, tlts.TICKET, tlts.id
        LIMIT 5000
      `);

      // Group items by TICKET in JavaScript
      const ticketMap = new Map<string, any>();

      (allItems as any[]).forEach((item: any) => {
        const ticket = item.TICKET;

        if (!ticketMap.has(ticket)) {
          ticketMap.set(ticket, {
            TICKET: ticket,
            fecha: item.fecha,
            tecnico: item.tecnico,
            tecnicoOrigen: item.tecnicoOrigen,
            id_tecnico_traspaso: item.id_tecnico_traspaso,
            tecnicoDestino: item.tecnicoDestino,
            flag_regiones: item.flag_regiones,
            flag_gestion_supervisor: item.flag_gestion_supervisor,
            flag_gestion_bodega: item.flag_gestion_bodega,
            ESTADO_BODEGA: item.FLAG_BODEGA !== null ? 'OK' : '-',
            total_items: 0,
            total_cantidad: 0,
            items: []
          });
        }

        const ticketData = ticketMap.get(ticket);

        // Prevent duplicate items (handling potential multiple rows from Joins)
        const isDuplicate = ticketData.items.some((existingItem: any) => existingItem.id === item.id);

        if (!isDuplicate) {
          ticketData.total_items++;
          ticketData.total_cantidad += Number(item.cantidad) || 0;
          ticketData.items.push({
            id: item.id,
            material: item.material || '',
            cantidad: Number(item.cantidad) || 0,
            campo_item: item.campo_item || ''
          });
        }
      });

      const groupedTickets = Array.from(ticketMap.values())
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 200);

      console.log(`[Supervisor Logistics] Fetched ${groupedTickets.length} grouped tickets`);
      if (groupedTickets.length > 0) {
        console.log(`[Supervisor Logistics] Sample ticket with ${groupedTickets[0].items.length} items`);
      }

      return groupedTickets;
    } catch (error) {
      console.error("[Supervisor Logistics] Error fetching supervisor logistics materials:", error);
      return [];
    }
  }

  async updateLogisticsMaterialStatus(id: number, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      console.log(`[Supervisor Logistics] Updating status for item ${id} to ${status}`);

      let query = '';
      if (status === 'approved') {
        query = `
          UPDATE tb_logis_tecnico_solicitud 
          SET FLAG_BODEGA = 164, 
              flag_gestion_bodega = 'APROBADO', 
              flag_gestion_supervisor = 1 
          WHERE id = ?
        `;
      } else {
        query = `
          UPDATE tb_logis_tecnico_solicitud 
          SET FLAG_BODEGA = 164, 
              flag_gestion_bodega = 'RECHAZADO', 
              flag_gestion_supervisor = 2 
          WHERE id = ?
        `;
      }

      await pool.execute(query, [id]);
      console.log(`[Supervisor Logistics] Successfully updated item ${id}`);
      return true;
    } catch (error) {
      console.error("[Supervisor Logistics] Error updating logistics material status:", error);
      return false;
    }
  }



  async getTechnicians(): Promise<Array<{ id: number, name: string, rut: string }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ID as id, nombre_short as name, Rut as rut 
       FROM tb_user_tqw 
       WHERE Vigente = 'Si' 
       ORDER BY nombre_short ASC`
    );
    return rows.map(r => ({
      id: Number(r.id),
      name: r.name || 'Sin nombre',
      rut: r.rut || ''
    }));
  }

  async getMaterialSolicitudes(userId: number): Promise<any[]> {
    try {
      let query = `
        SELECT 
          s.id,
          COALESCE(m.\`Item Description\`, s.material) as materialName,
          s.cantidad as quantity,
          s.fecha as date,
          s.TICKET as ticketToken,
          s.campo_item as itemCode,
          s.flag_regiones as flagRegiones,
          u1.nombre_short as originTechnician,
          CASE 
            WHEN u1.perfil2 IS NOT NULL AND u1.perfil2 != '' THEN '-' 
            ELSE u1.SUPERVISOR 
          END as supervisorName,
          CASE 
            WHEN s.id_tecnico_traspaso = 0 OR s.id_tecnico_traspaso IS NULL THEN 'Bodega'
            ELSE u2.nombre_short 
          END as destinationTechnician,
          CASE 
            WHEN s.flag_gestion_supervisor = 0 OR s.flag_gestion_supervisor IS NULL THEN 'PENDIENTE'
            WHEN s.flag_gestion_supervisor = 1 THEN 'APROBADO'
            WHEN s.flag_gestion_supervisor = 2 THEN 'RECHAZADO'
            ELSE 'PENDIENTE'
          END as status
        FROM tb_logis_tecnico_solicitud s
        LEFT JOIN tb_user_tqw u1 ON s.tecnico = u1.ID AND s.tecnico != '0' AND s.tecnico != ''
        LEFT JOIN tb_user_tqw u2 ON s.id_tecnico_traspaso = u2.ID AND s.id_tecnico_traspaso != 0
        LEFT JOIN tp_logistica_mat_oracle m ON s.campo_item = m.Item
        ORDER BY s.fecha DESC
        LIMIT 1000
      `;

      const [rows] = await pool.execute(query);
      console.log(`[Material Solicitudes] Query executed. Rows found: ${(rows as any[]).length}`);

      const results = (rows as any[]).map(row => ({
        ...row,
        id: Number(row.id),
        date: row.date ? (row.date instanceof Date ? row.date.toISOString() : new Date(row.date).toISOString()) : new Date().toISOString(),
        originTechnician: row.originTechnician || `Técnico ${row.tecnico || 'N/A'}`
      }));

      return results;
    } catch (error) {
      console.error("Error fetching material solicitudes:", error);
      return [];
    }
  }

  // ============================================
  // ACTIVITY OPERATIONS
  // ============================================

  async getActivityChartData(rut: string, startDate: string, endDate: string): Promise<Array<{
    fecha: string;
    puntos_hfc: number;
    puntos_ftth: number;
    puntos: number;
    q_rgu_hfc: number;
    q_rgu_ftth: number;
    q_rgu: number;
    hfc: number;
    ftth: number;
    tipo_red: string;
  }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        DATE(\`Fecha fin#\`) as fecha,
        CAST(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_hfc,
        CAST(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_ftth,
        CAST(SUM(Ptos_referencial) AS UNSIGNED) as puntos,
        ROUND(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_hfc,
        ROUND(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_ftth,
        ROUND(SUM(Q_SSPP), 2) as q_rgu,
        SUM(CASE WHEN TipoRed_rank = 'HFC' THEN total_HFC ELSE 0 END) as hfc,
        SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN total_FTTH ELSE 0 END) as ftth,
        GROUP_CONCAT(DISTINCT TipoRed_rank ORDER BY TipoRed_rank SEPARATOR ', ') as tipo_red
      FROM produccion_ndc_rank_red
      WHERE \`Fecha fin#\` BETWEEN ? AND ?
        AND rut = ?
      GROUP BY DATE(\`Fecha fin#\`)
      ORDER BY fecha ASC`,
      [startDate, endDate, rut]
    );
    return rows as Array<{
      fecha: string;
      puntos_hfc: number;
      puntos_ftth: number;
      puntos: number;
      q_rgu_hfc: number;
      q_rgu_ftth: number;
      q_rgu: number;
      hfc: number;
      ftth: number;
      tipo_red: string;
    }>;
  }

  async getActivityTableData(rut: string, startDate: string, endDate: string): Promise<Array<{
    id: number;
    fecha: string;
    tipoRed: string;
    puntos: number;
    rgu: number;
  }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY DATE(\`Fecha fin#\`) DESC, TipoRed_rank) as id,
        DATE(\`Fecha fin#\`) as fecha,
        TipoRed_rank as tipoRed,
        CAST(SUM(Ptos_referencial) AS UNSIGNED) as puntos,
        ROUND(SUM(Q_SSPP), 2) as rgu
      FROM produccion_ndc_rank_red
      WHERE \`Fecha fin#\` BETWEEN ? AND ?
        AND rut = ?
      GROUP BY DATE(\`Fecha fin#\`), TipoRed_rank
      ORDER BY fecha DESC, tipoRed`,
      [startDate, endDate, rut]
    );
    return rows as Array<{
      id: number;
      fecha: string;
      tipoRed: string;
      puntos: number;
      rgu: number;
    }>;
  }

  async getOrderDetails(fecha: string, rut: string): Promise<Array<{
    Orden: string;
    'Dir# cliente': string;
    Actividad: string;
    Trabajo: string;
    Ptos_referencial: number;
    Q_SSPP: number;
    RGU: number;
    'Fecha fin#': string;
    TipoRed_rank: string;
    'Nombre tecnico': string;
    Empresa: string;
    Zona: string;
    Localidad: string;
    Estado: string;
    producto: string;
  }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        Orden,
        \`Dir# cliente\`,
        Actividad,
        Trabajo,
        Ptos_referencial,
        Q_SSPP,
        RGU,
        \`Fecha fin#\`,
        TipoRed_rank,
        \`Nombre tecnico\`,
        Empresa,
        Zona,
        Localidad,
        Estado,
        producto
      FROM produccion_ndc_rank_red
      WHERE DATE(\`Fecha fin#\`) = ?
        AND rut = ?
      ORDER BY Orden ASC`,
      [fecha, rut]
    );
    return rows as Array<{
      Orden: string;
      'Dir# cliente': string;
      Actividad: string;
      Trabajo: string;
      Ptos_referencial: number;
      Q_SSPP: number;
      RGU: number;
      'Fecha fin#': string;
      TipoRed_rank: string;
      'Nombre tecnico': string;
      Empresa: string;
      Zona: string;
      Localidad: string;
      Estado: string;
      producto: string;
    }>;
  }

  // ============================================
  // CALIDAD REACTIVA OPERATIONS
  // ============================================

  async getCalidadReactivaSummary(rut: string, months: number = 12): Promise<Array<{
    mes_contable: string;
    anio: number;
    mes: number;
    total: number;
    cumple: number;
    no_cumple: number;
    cumple_hfc: number;
    no_cumple_hfc: number;
    cumple_ftth: number;
    no_cumple_ftth: number;
    eficiencia_general: number;
    eficiencia_hfc: number;
    eficiencia_ftth: number;
  }>> {
    const safeMonths = Math.max(1, Math.min(months, 36));

    // Usar query() en lugar de execute() para evitar problemas con LIMIT
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        DATE_FORMAT(mes_contable, '%Y-%m-01') as mes_contable_fmt,
        YEAR(mes_contable) as anio,
        MONTH(mes_contable) as mes,
        COUNT(*) as total,
        SUM(CASE WHEN CALIDAD_30 = '0' THEN 1 ELSE 0 END) as cumple,
        SUM(CASE WHEN CALIDAD_30 = '1' THEN 1 ELSE 0 END) as no_cumple,
        SUM(CASE WHEN CALIDAD_30 = '0' AND TIPO_RED_CALCULADO = 'HFC' THEN 1 ELSE 0 END) as cumple_hfc,
        SUM(CASE WHEN CALIDAD_30 = '1' AND TIPO_RED_CALCULADO = 'HFC' THEN 1 ELSE 0 END) as no_cumple_hfc,
        SUM(CASE WHEN CALIDAD_30 = '0' AND TIPO_RED_CALCULADO IN ('FTTH', 'DUAL') THEN 1 ELSE 0 END) as cumple_ftth,
        SUM(CASE WHEN CALIDAD_30 = '1' AND TIPO_RED_CALCULADO IN ('FTTH', 'DUAL') THEN 1 ELSE 0 END) as no_cumple_ftth
      FROM tb_calidad_naranja_base
      WHERE RUT_TECNICO_FS = ?
      GROUP BY DATE_FORMAT(mes_contable, '%Y-%m-01'), YEAR(mes_contable), MONTH(mes_contable)
      ORDER BY mes_contable_fmt DESC
      LIMIT ?`,
      [rut, safeMonths]
    );

    return rows.map((row: any) => {
      // Usar directamente el formato mes_contable_fmt que ya viene en formato correcto
      const formattedDate = row.mes_contable_fmt;

      const total = Number(row.total) || 0;
      const cumple = Number(row.cumple) || 0;
      const cumple_hfc = Number(row.cumple_hfc) || 0;
      const no_cumple_hfc = Number(row.no_cumple_hfc) || 0;
      const cumple_ftth = Number(row.cumple_ftth) || 0;
      const no_cumple_ftth = Number(row.no_cumple_ftth) || 0;
      const total_hfc = cumple_hfc + no_cumple_hfc;
      const total_ftth = cumple_ftth + no_cumple_ftth;

      return {
        mes_contable: formattedDate,
        anio: Number(row.anio),
        mes: Number(row.mes),
        total,
        cumple,
        no_cumple: Number(row.no_cumple) || 0,
        cumple_hfc,
        no_cumple_hfc,
        cumple_ftth,
        no_cumple_ftth,
        eficiencia_general: total > 0 ? Math.round((cumple / total) * 10000) / 100 : 0,
        eficiencia_hfc: total_hfc > 0 ? Math.round((cumple_hfc / total_hfc) * 10000) / 100 : 0,
        eficiencia_ftth: total_ftth > 0 ? Math.round((cumple_ftth / total_ftth) * 10000) / 100 : 0,
      };
    });
  }

  async getCalidadReactivaDetails(rut: string, mesContable: string): Promise<Array<{
    FECHA_EJECUCION: string;
    fecha_ejecucion_2: string;
    TIPO_RED: string;
    id_actividad: string;
    id_actividad_2: string;
    DESCRIPCION_CIERRE: string;
    DESCRIPCION_CIERRE_2: string;
    descripcion_actividad: string;
    descripcion_actividad_2: string;
    CALIDAD_30: string;
    DIFERENCIA_DIAS: string;
  }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        FECHA_EJECUCION,
        fecha_ejecucion_2,
        TIPO_RED_CALCULADO as TIPO_RED,
        id_actividad,
        id_actividad_2,
        DESCRIPCION_CIERRE,
        DESCRIPCION_CIERRE_2,
        descripcion_actividad,
        descripcion_actividad_2,
        CALIDAD_30,
        DIFERENCIA_DIAS
      FROM tb_calidad_naranja_base
      WHERE RUT_TECNICO_FS = ?
        AND DATE_FORMAT(mes_contable, '%Y-%m-01') = ?
      ORDER BY FECHA_EJECUCION DESC`,
      [rut, mesContable]
    );

    return rows as Array<{
      FECHA_EJECUCION: string;
      fecha_ejecucion_2: string;
      TIPO_RED: string;
      id_actividad: string;
      id_actividad_2: string;
      DESCRIPCION_CIERRE: string;
      DESCRIPCION_CIERRE_2: string;
      descripcion_actividad: string;
      descripcion_actividad_2: string;
      CALIDAD_30: string;
      DIFERENCIA_DIAS: string;
    }>;
  }

  async getCalidadReactivaExportData(rut: string, mesContable: string): Promise<Array<{
    id_actividad: string;
    id_actividad_2: string;
    FECHA_EJECUCION: string;
    fecha_ejecucion_2: string;
    DESCRIPCION_CIERRE: string;
    DESCRIPCION_CIERRE_2: string;
    TIPO_RED_CALCULADO: string;
    Comuna: string;
    CalidadReactiva: string;
    DIFERENCIA_DIAS: string;
  }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id_actividad,
        id_actividad_2,
        FECHA_EJECUCION,
        fecha_ejecucion_2,
        DESCRIPCION_CIERRE,
        DESCRIPCION_CIERRE_2,
        TIPO_RED_CALCULADO,
        Comuna,
        CASE 
          WHEN CALIDAD_30 = '0' THEN 'Cumple'
          WHEN CALIDAD_30 = '1' THEN 'No cumple'
          ELSE 'N/A'
        END as CalidadReactiva,
        DIFERENCIA_DIAS
      FROM tb_calidad_naranja_base
      WHERE RUT_TECNICO_FS = ?
        AND DATE_FORMAT(mes_contable, '%Y-%m-01') = ?
      ORDER BY FECHA_EJECUCION DESC`,
      [rut, mesContable]
    );

    return rows as Array<{
      id_actividad: string;
      id_actividad_2: string;
      FECHA_EJECUCION: string;
      fecha_ejecucion_2: string;
      DESCRIPCION_CIERRE: string;
      DESCRIPCION_CIERRE_2: string;
      TIPO_RED_CALCULADO: string;
      Comuna: string;
      CalidadReactiva: string;
      DIFERENCIA_DIAS: string;
    }>;
  }

  async getExportData(rut: string, period: string): Promise<Array<{
    'Fecha fin#': string;
    orden: string;
    'Dir# cliente': string;
    Trabajo: string;
    RGU: number;
    Puntos: number;
    'Tipo Red': string;
    producto: string;
    'Tipo vivienda': string;
    'Clase vivienda': string;
  }>> {
    // Convert period "202512" (or "12") to "2025-12-01" format locally
    let formattedDate = period;
    if (period.length === 2) {
      formattedDate = `2025-${period}-01`;
    } else if (period.length === 6) {
      formattedDate = `${period.substring(0, 4)}-${period.substring(4, 6)}-01`;
    } else if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Already in YYYY-MM-DD
    }

    // Ensure we query by the start of the month as likely stored in DB or exact match depending on data type
    // Based on user request, it's exact match on mes_contable
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        \`Fecha fin#\`, 
        orden, 
        \`Dir# cliente\`, 
        \`Trabajo\`, 
        \`Q_SSPP\` as RGU,
        \`Ptos_referencial\` as Puntos,
        \`Tipo Red\`, 
        producto, 
        \`Tipo vivienda\`, 
        \`Clase vivienda\`
      FROM tb_paso_pyndc
      WHERE DATE_FORMAT(mes_contable, '%Y-%m-01') = ?
        AND rut = ?`,
      [formattedDate, rut]
    );

    return rows as Array<{
      'Fecha fin#': string;
      orden: string;
      'Dir# cliente': string;
      Trabajo: string;
      RGU: number;
      Puntos: number;
      'Tipo Red': string;
      producto: string;
      'Tipo vivienda': string;
      'Clase vivienda': string;
    }>;
  }
  // ============================================
  // PASSWORD RESET METHODS
  // ============================================

  async getUserEmailExists(email: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM tb_user_tqw WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows.length > 0;
  }

  async createPasswordResetToken(email: string, code: string, expiresAt: Date, ip: string, userAgent: string): Promise<number> {
    const [result] = await pool.execute<RowDataPacket[]>(
      `INSERT INTO password_reset_tokens (email, reset_code, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, code, expiresAt, ip, userAgent]
    );
    return (result as any).insertId;
  }

  async validatePasswordResetCode(email: string, code: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM password_reset_tokens 
       WHERE email = ? AND reset_code = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );
    return rows.length > 0;
  }

  async markPasswordResetCodeUsed(email: string, code: string): Promise<void> {
    await pool.execute(
      `UPDATE password_reset_tokens 
       SET used = TRUE, used_at = NOW() 
       WHERE email = ? AND reset_code = ?`,
      [email, code]
    );
  }

  async updateUserPassword(email: string, hashedPassword: string): Promise<boolean> {
    try {
      // Primero obtener la contraseña actual (anterior)
      const [currentRows] = await pool.execute<RowDataPacket[]>(
        `SELECT pass_new FROM tb_claves_usuarios 
         WHERE usuario = ? 
         ORDER BY fecha_registro DESC 
         LIMIT 1`,
        [email]
      );

      const currentPassword = currentRows.length > 0 ? currentRows[0].pass_new : null;

      // Insertar nuevo registro con el historial completo
      const [insertResult] = await pool.execute(
        `INSERT INTO tb_claves_usuarios 
         (usuario, pass_new, pass_anterior, fecha_registro, ult_modificacion) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [email, hashedPassword, currentPassword]
      );

      console.log(`[PASSWORD UPDATE] Contraseña actualizada para ${email}, registro insertado con ID: ${(insertResult as any).insertId}`);

      return (insertResult as any).affectedRows > 0;
    } catch (error) {
      console.error('[PASSWORD UPDATE] Error actualizando contraseña:', error);
      throw error;
    }
  }

  async logPasswordChange(userId: number, email: string, changeType: string, ip: string, userAgent: string): Promise<void> {
    await pool.execute(
      `INSERT INTO password_change_log (user_id, email, change_type, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, email, changeType, ip, userAgent]
    );
  }

  async invalidateAllPasswordResetTokens(email: string): Promise<void> {
    await pool.execute(
      `UPDATE password_reset_tokens SET used = TRUE, used_at = NOW() WHERE email = ? AND used = FALSE`,
      [email]
    );
  }

  async getCalidadTqwPeriods(): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT DATE_FORMAT(mes_contable, '%Y-%m-%d') as periodo 
         FROM tb_calidad_naranja_base 
         WHERE mes_contable IS NOT NULL 
         ORDER BY periodo DESC`
      );
      return (rows as any[]).map(r => r.periodo);
    } catch (error) {
      console.error("Error fetching Calidad TQW periods:", error);
      return [];
    }
  }

  async getCalidadTqwData(mesContable: string): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT
          cb.id_actividad,
          cb.descripcion_actividad,
          cb.id_actividad_2,
          cb.descripcion_actividad_2,
          cb.FECHA_EJECUCION,
          cb.fecha_ejecucion_2,
          cb.Comuna,
          cb.DESCRIPCION_CIERRE,
          cb.DESCRIPCION_CIERRE_2,
          cb.CALIDAD_30,
          cb.TIPO_RED_CALCULADO,
          cb.num_pedido,
          cb.RUT_TECNICO_FS,
          u.nombre as NOMBRE_TECNICO,
          u.Nombre_short,
          u.supervisor,
          cb.ZONA,
          cb.mes_contable,
          cb.DIFERENCIA_DIAS
        FROM tb_calidad_naranja_base cb
        LEFT JOIN tb_user_tqw u ON TRIM(u.rut) = TRIM(cb.rut_tecnico_fs)
        WHERE cb.mes_contable = ?
        ORDER BY cb.FECHA_EJECUCION DESC`,
        [mesContable]
      );
      console.log("[Calidad TQW] Query executed. Rows returned:", (rows as any[]).length);
      return rows as any[];
    } catch (error) {
      console.error("Error fetching Calidad TQW data:", error);
      return [];
    }
  }

  async getBenchmarkData(): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT 
                  periodo as periodo,
                  tp_desc_empresa as tp_desc_empresa,
                  CAST(SUM(\`INCUMPLE_CALIDAD\`) AS SIGNED) as INCUMPLE_CALIDAD,
                  CAST(SUM(\`Total_actividad\`) AS SIGNED) as Total_actividad
                FROM tb_kpi_gerencia_calidad_tecnico
                GROUP BY periodo, tp_desc_empresa
                ORDER BY periodo DESC, tp_desc_empresa ASC`
      );
      return rows as any[];
    } catch (error) {
      console.error("Error fetching Benchmark data:", error);
      return [];
    }
  }

  async getDetalleOtPeriods(): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT DATE_FORMAT(mes_contable, '%Y-%m-%d') as periodo 
         FROM produccion_ndc_rank_red 
         WHERE mes_contable IS NOT NULL 
         ORDER BY periodo DESC`
      );
      return (rows as any[]).map(r => r.periodo);
    } catch (error) {
      console.error("Error fetching Detalle OT periods:", error);
      return [];
    }
  }

  async getDetalleOtData(mesContable: string): Promise<any[]> {
    try {
      console.log(`[Detalle OT] Fetching data for mes_contable: ${mesContable}`);

      const [rows] = await pool.execute(
        `SELECT * FROM produccion_ndc_rank_red 
         WHERE DATE(mes_contable) = DATE(?) 
         ORDER BY \`Fecha fin#\` DESC`,
        [mesContable]
      );

      console.log(`[Detalle OT] Found ${(rows as any[]).length} records for mes_contable ${mesContable}`);
      return rows as any[];
    } catch (error) {
      console.error(`[Detalle OT] Error fetching data for mes_contable ${mesContable}:`, error);
      return [];
    }
  }

  async getPointsParameters(): Promise<schema.PuntosParameter[]> {
    try {
      return await db.select().from(schema.puntosParameters);
    } catch (error) {
      console.error("Error fetching points parameters:", error);
      return [];
    }
  }

  async updatePointsParameter(id: number, data: Partial<schema.InsertPuntosParameter>): Promise<schema.PuntosParameter | undefined> {
    try {
      await db.update(schema.puntosParameters).set(data).where(eq(schema.puntosParameters.id, id));
      const [updated] = await db.select().from(schema.puntosParameters).where(eq(schema.puntosParameters.id, id));
      return updated;
    } catch (error) {
      console.error(`Error updating points parameter ${id}:`, error);
      throw error;
    }
  }

  // Sidebar Permissions
  async getSidebarPermissions(profile: string): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT allowed_menu_items FROM tb_sidebar_permissions WHERE profile = ?`,
        [profile]
      );
      const result = rows as any[];
      if (result.length > 0) {
        return result[0].allowed_menu_items;
      }
      return []; // Return empty if no permissions defined (or could default to all)
    } catch (error) {
      console.error(`Error fetching sidebar permissions for ${profile}:`, error);
      return [];
    }
  }

  async getAllSidebarPermissions(): Promise<schema.SidebarPermission[]> {
    try {
      const [rows] = await pool.execute(`SELECT * FROM tb_sidebar_permissions`);
      const result = rows as any[];
      // Map database field names to camelCase
      return result.map(row => ({
        id: row.id,
        profile: row.profile,
        allowedMenuItems: row.allowed_menu_items
      }));
    } catch (error) {
      console.error("Error fetching all sidebar permissions:", error);
      return [];
    }
  }

  async updateSidebarPermissions(profile: string, allowedItems: string[]): Promise<schema.SidebarPermission> {
    try {
      const jsonItems = JSON.stringify(allowedItems);
      // Insert or Update
      await pool.execute(
        `INSERT INTO tb_sidebar_permissions (profile, allowed_menu_items) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE allowed_menu_items = ?`,
        [profile, jsonItems, jsonItems]
      );

      const [rows] = await pool.execute(
        `SELECT * FROM tb_sidebar_permissions WHERE profile = ?`,
        [profile]
      );
      return (rows as any[])[0];
    } catch (error) {
      console.error(`Error updating sidebar permissions for ${profile}:`, error);
      throw error;
    }
  }

  // SME Operations
  async getSmeActivities(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      let query = `SELECT CAST(a.ID AS SIGNED) as ID, a.NombreTecnico, a.NombreCoordinador, a.Fecha, a.HoraInicio, a.HoraTermino, 
                a.Actividad, a.localidad, a.rut_cliente, a.zona, a.direccion, a.nombre_cliente, a.observacion,
                u.nombre_short as technicianName
         FROM TB_SME_FORM_actividad a
         LEFT JOIN tb_user_tqw u ON a.NombreTecnico = u.Rut COLLATE utf8mb4_unicode_ci`;

      const params: any[] = [];
      if (startDate && endDate) {
        query += ` WHERE a.Fecha BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }

      query += ` ORDER BY a.Fecha DESC, a.ID DESC LIMIT 200`;

      const [rows] = await pool.execute(query, params);
      return rows as any[];
    } catch (error) {
      console.error("Error fetching SME activities:", error);
      return [];
    }
  }

  async getSmeTechnicians(): Promise<Array<{ id: number, name: string, rut: string }>> {
    const smreRuts = [
      '18405333-0', '12860911-3', '18439126-0', '17924391-1', '14112874-4',
      '16230717-7', '20206906-1', '16266710-6', '18320644-3', '14034104-5',
      '16393999-1', '26413363-7', '11832936-8', '17674688-2', '10191407-0',
      '15537722-4', '18518435-8', '13622877-3'
    ];

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ID as id, nombre_short as name, Rut as rut 
       FROM tb_user_tqw 
       WHERE Rut IN (${smreRuts.map(() => '?').join(',')})
       ORDER BY nombre_short ASC`,
      smreRuts
    );
    return rows.map(r => ({
      id: Number(r.id),
      name: r.name || 'Sin nombre',
      rut: r.rut || ''
    }));
  }

  async createSmeActivity(data: any): Promise<void> {
    try {
      await pool.execute(
        `INSERT INTO TB_SME_FORM_actividad 
        (NombreTecnico, NombreCoordinador, Fecha, HoraInicio, HoraTermino, Actividad, 
         localidad, rut_cliente, zona, direccion, nombre_cliente, observacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.nombre_tecnico,
          data.nombre_coordinador,
          data.fecha,
          data.hora_inicio,
          data.hora_termino,
          data.actividad,
          data.localidad,
          data.rut_cliente,
          data.zona,
          data.direccion,
          data.nombre_cliente,
          data.observacion
        ]
      );
    } catch (error) {
      console.error("Error creating SME activity:", error);
      throw error;
    }
  }

  async getLocalidadesByZona(zona: string): Promise<any[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT Comuna_1 as COMUNA_1, Comuna_2 
         FROM tp_comunas_andes 
         WHERE Zona = ?
         ORDER BY Comuna_2 ASC`,
        [zona]
      );
      return rows as any[];
    } catch (error) {
      console.error("Error fetching localidades by zona:", error);
      return [];
    }
  }
}

export const storage = new MySQLStorage();
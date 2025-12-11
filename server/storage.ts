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

export interface IStorage {
  // Billing operations
  getAllBilling(): Promise<Billing[]>;
  getBillingById(id: number): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  deleteBilling(id: number): Promise<boolean>;
  getTqwComisionData(rut: string, periodo: string): Promise<schema.TqwComisionRenew | undefined>;

  // Materials operations
  getMaterialTipos(): Promise<string[]>;
  getMaterialFamilias(tipo: string): Promise<string[]>;
  getMaterialSubfamilias(tipo: string, familia: string): Promise<string[]>;
  getMaterialItems(tipo: string, familia: string, subfamilia: string): Promise<Array<{id: string, description: string}>>;

  // Material solicitud operations
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

  // Authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  validateCredentials(email: string, password: string): Promise<AuthenticatedUser | null>;
  recordLoginAttempt(data: InsertLoginAttempt): Promise<void>;
  getRecentLoginAttempts(email: string, ip: string): Promise<number>;
  isAccountLocked(email: string, ip: string): Promise<boolean>;
  createSession(rut: string, token: string): Promise<void>;
  logConnection(usuario: string, pagina: string, ip: string): Promise<number>;
  closeConnection(id: number): Promise<void>;
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
    const result = await db.insert(schema.billing).values(billing);
    const insertId = result[0].insertId;
    const created = await this.getBillingById(insertId);
    if (!created) throw new Error("Failed to create billing record");
    return created;
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    await db
      .update(schema.billing)
      .set(billing)
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
        console.log("No user found for email:", email);
        return null;
      }

      const user = results[0];
      const storedPassword = user.pass_new;

      console.log("User found:", { 
        email: user.email, 
        hasPassword: !!storedPassword, 
        passwordLength: storedPassword?.length,
        passwordPrefix: storedPassword?.substring(0, 10) + '...',
        perfil: user.PERFIL,
        rut: user.rut
      });

      if (!storedPassword) {
        console.log("No password found for user:", email);
        return null;
      }

      // Validación de contraseña (soporte dual: bcrypt y texto plano legado)
      let passwordValid = false;
      const isBcrypt = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

      console.log("Password type:", isBcrypt ? "bcrypt" : "plaintext");

      if (isBcrypt) {
        // Contraseña hasheada con bcrypt
        try {
          passwordValid = await bcrypt.compare(password, storedPassword);
          console.log("Bcrypt comparison result:", passwordValid);
        } catch (bcryptError) {
          console.error("Error comparing bcrypt password:", bcryptError);
          passwordValid = false;
        }
      } else {
        // Contraseña en texto plano (sistema legado)
        passwordValid = storedPassword === password;
        console.log("Plaintext comparison result:", passwordValid);
      }

      if (!passwordValid) {
        console.log("Invalid password for user:", email);
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

  async getMaterialItems(tipo: string, familia: string, subfamilia: string): Promise<Array<{id: string, description: string}>> {
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
      const [result] = await pool.execute(
        `INSERT INTO TB_LOGIS_TECNICO_SOLICITUD 
         (material, cantidad, fecha, tecnico, id_tecnico_traspaso, TICKET, flag_regiones, flag_gestion_supervisor, campo_item) 
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
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
      return (result as any).insertId;
    } catch (error) {
      console.error("Error creating material solicitud:", error);
      throw error;
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
      FROM TB_CALIDAD_NARANJA_BASE
      WHERE RUT_TECNICO_FS = ?
      GROUP BY DATE_FORMAT(mes_contable, '%Y-%m-01'), YEAR(mes_contable), MONTH(mes_contable)
      ORDER BY mes_contable_fmt DESC
      LIMIT ?`,
      [rut, safeMonths]
    );

    return rows.map((row: any) => {
      const total = Number(row.total) || 0;
      const cumple = Number(row.cumple) || 0;
      const cumple_hfc = Number(row.cumple_hfc) || 0;
      const no_cumple_hfc = Number(row.no_cumple_hfc) || 0;
      const cumple_ftth = Number(row.cumple_ftth) || 0;
      const no_cumple_ftth = Number(row.no_cumple_ftth) || 0;
      const total_hfc = cumple_hfc + no_cumple_hfc;
      const total_ftth = cumple_ftth + no_cumple_ftth;

      return {
        mes_contable: String(row.mes_contable_fmt),
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
    }).reverse();
  }

  async getCalidadReactivaDetails(rut: string, mesContable: string): Promise<Array<{
    FECHA_EJECUCION: string;
    TIPO_RED: string;
    id_actividad: string;
    id_actividad_2: string;
    DESCRIPCION_CIERRE: string;
    DESCRIPCION_CIERRE_2: string;
    descripcion_actividad: string;
    descripcion_actividad_2: string;
    CALIDAD_30: string;
  }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        FECHA_EJECUCION,
        TIPO_RED_CALCULADO as TIPO_RED,
        id_actividad,
        id_actividad_2,
        DESCRIPCION_CIERRE,
        DESCRIPCION_CIERRE_2,
        descripcion_actividad,
        descripcion_actividad_2,
        CALIDAD_30
      FROM TB_CALIDAD_NARANJA_BASE
      WHERE RUT_TECNICO_FS = ?
        AND DATE_FORMAT(mes_contable, '%Y-%m-01') = ?
      ORDER BY FECHA_EJECUCION DESC`,
      [rut, mesContable]
    );

    return rows as Array<{
      FECHA_EJECUCION: string;
      TIPO_RED: string;
      id_actividad: string;
      id_actividad_2: string;
      DESCRIPCION_CIERRE: string;
      DESCRIPCION_CIERRE_2: string;
      descripcion_actividad: string;
      descripcion_actividad_2: string;
      CALIDAD_30: string;
    }>;
  }
}

export const storage = new MySQLStorage();
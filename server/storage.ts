import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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
}

export const storage = new MySQLStorage();

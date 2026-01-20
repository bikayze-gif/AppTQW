import "dotenv/config";
import crypto from "crypto";
/**
 * Configuración centralizada del servidor
 * 
 * Este archivo maneja la configuración de la aplicación de manera segura.
 * En desarrollo/VPS: usa variables de entorno o valores por defecto
 * En Replit: usa los secrets configurados en la plataforma
 * 
 * Para migrar a VPS:
 * 1. Copia el archivo .env.example a .env
 * 2. Configura los valores reales en .env
 * 3. Asegúrate de que .env esté en .gitignore
 */

// Configuración de base de datos MySQL
export const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "operaciones_tqw",
};



// Configuración de la aplicación
export const appConfig = {
  port: parseInt(process.env.PORT || "5000"),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Período por defecto para consultas de comisiones
export const businessConfig = {
  defaultPeriodo: "202509",
};

// Configuración de seguridad
export const securityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  sessionTimeoutHours: 6,
  bcryptRounds: 10,
};

// Genera un secret por defecto si no está configurado
// NOTA: En producción, SIEMPRE configura SESSION_SECRET
function generateDefaultSecret(): string {
  if (appConfig.isProduction) {
    console.error("❌ CRITICAL: SESSION_SECRET no está configurado en producción");
    throw new Error("SESSION_SECRET es obligatorio en producción");
  }
  // Generar secreto de 256 bits (64 caracteres hex) - mucho más seguro que UUID
  const secret = crypto.randomBytes(32).toString('hex');
  console.warn("⚠️  WARNING: Usando SESSION_SECRET generado automáticamente. Configura uno permanente en .env");
  return secret;
}

// Configuración de sesiones
export const sessionConfig = {
  secret: (() => {
    const secret = process.env.SESSION_SECRET || generateDefaultSecret();
    if (secret.length < 32) {
      console.warn("⚠️  WARNING: SESSION_SECRET es demasiado corto (mínimo 32 caracteres recomendado)");
    }
    return secret;
  })(),
  maxAge: 6 * 60 * 60 * 1000, // 6 horas en milisegundos
  cookieName: "tqw_session",
};

// Validación de configuración crítica
export function validateConfig(): void {
  const errors: string[] = [];

  if (!process.env.MYSQL_HOST && appConfig.isProduction) {
    errors.push("MYSQL_HOST no está configurado");
  }
  if (!process.env.MYSQL_PASSWORD && appConfig.isProduction) {
    errors.push("MYSQL_PASSWORD no está configurado");
  }
  if (!process.env.SESSION_SECRET && appConfig.isProduction) {
    errors.push("SESSION_SECRET no está configurado");
  }

  if (errors.length > 0) {
    console.error("❌ Errores de configuración:");
    errors.forEach((e) => console.error(`   - ${e}`));
    if (appConfig.isProduction) {
      throw new Error("Configuración inválida para producción");
    }
  }
}

// Log de configuración (sin mostrar valores sensibles)
export function logConfig(): void {
  console.log("📋 Configuración cargada:");
  console.log(`   - Entorno: ${appConfig.nodeEnv}`);
  console.log(`   - Puerto: ${appConfig.port}`);
  console.log(`   - MySQL Host: ${dbConfig.host}`);
  console.log(`   - MySQL Database: ${dbConfig.database}`);
  console.log(`   - Período por defecto: ${businessConfig.defaultPeriodo}`);
}

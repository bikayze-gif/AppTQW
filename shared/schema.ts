import { mysqlTable, varchar, text, int, decimal, date, datetime, tinyint, json, bigint } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TABLAS DE AUTENTICACIÓN Y SEGURIDAD
// ============================================

// Tabla de usuarios principales (tb_user_tqw)
export const users = mysqlTable("tb_user_tqw", {
  id: int("id").primaryKey().autoincrement(),
  email: text("email"),
  pass: text("pass"),
  reg_date: datetime("reg_date"),
  nombre: text("nombre"),
  area: text("area"),
  supervisor: text("supervisor"),
  rut: text("rut"),
  correo_super: text("correo_super"),
  iden_user: text("iden_user"),
  vigente: text("vigente"),
  ZONA_GEO: text("ZONA_GEO"),
  nombre_ndc: text("nombre_ndc"),
  Nombre_short: text("Nombre_short"),
  PERFIL: text("PERFIL"),
  perfil2: varchar("perfil2", { length: 50 }),
});

export type User = typeof users.$inferSelect;

// Tabla de credenciales (tb_claves_usuarios)
export const userCredentials = mysqlTable("tb_claves_usuarios", {
  id_uniq: int("id_uniq").primaryKey().autoincrement(),
  fecha_registro: datetime("fecha_registro"),
  pass_new: text("pass_new"),
  usuario: text("usuario"),
  pass_anterior: text("pass_anterior"),
  RW_ID: decimal("RW_ID", { precision: 20, scale: 0 }),
  ult_modificacion: datetime("ult_modificacion"),
  rut_APP: text("rut_APP"),
});

export type UserCredential = typeof userCredentials.$inferSelect;

// Tabla de sesiones activas (tb_log_app)
export const activeSessions = mysqlTable("tb_log_app", {
  RUT: text("RUT"),
  FECH_REG: datetime("FECH_REG"),
  TOKEN: text("TOKEN"),
  FLAG_GET: text("FLAG_GET"),
});

export type ActiveSession = typeof activeSessions.$inferSelect;

// Tabla de intentos de login (login_attempts) - Para rate limiting
export const loginAttempts = mysqlTable("login_attempts", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  user_id: bigint("user_id", { mode: "number", unsigned: true }),
  email: varchar("email", { length: 320 }).notNull(),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: varchar("user_agent", { length: 500 }),
  login_method: varchar("login_method", { length: 20 }).default("credentials"),
  success: tinyint("success").default(0),
  failure_reason: varchar("failure_reason", { length: 100 }),
  metadata: json("metadata"),
  created_at: datetime("created_at"),
});

export type LoginAttempt = typeof loginAttempts.$inferSelect;

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts, {
  email: z.string().email(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  success: z.number().min(0).max(1).optional(),
  failure_reason: z.string().nullable().optional(),
}).omit({ id: true });

export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;

// Tabla de auditoría de conexiones (tb_conexiones_log)
export const connectionLogs = mysqlTable("tb_conexiones_log", {
  id: int("id").primaryKey().autoincrement(),
  usuario: varchar("usuario", { length: 100 }),
  pagina: varchar("pagina", { length: 255 }),
  estado: varchar("estado", { length: 50 }),
  fecha_conexion: datetime("fecha_conexion"),
  fecha_desconexion: datetime("fecha_desconexion"),
  duracion: int("duracion"),
  ip: varchar("ip", { length: 45 }),
  tcp_state: int("tcp_state").default(0),
  tcp_info: json("tcp_info"),
});

export type ConnectionLog = typeof connectionLogs.$inferSelect;

// Schema para login request
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "Contraseña requerida"),
  role: z.enum(["technician", "supervisor"]).optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// ============================================
// TABLAS DE NEGOCIO
// ============================================

export const billing = mysqlTable("tb_facturacion_bitacora", {
  id: int("id").primaryKey().autoincrement(),
  periodo: varchar("periodo", { length: 10 }).notNull(),
  linea: varchar("linea", { length: 50 }).notNull(),
  proyecto: varchar("proyecto", { length: 100 }).notNull(),
  observacion: text("observacion"),
  cantidad: int("cantidad"),
  valorizacion: decimal("valorizacion", { precision: 10, scale: 2 }),
  fecha_gestion: date("fecha_gestion"),
  responsable: varchar("responsable", { length: 100 }),
  estado: varchar("estado", { length: 50 }).default("Pendiente"),
  observacion_gestion: text("observacion_gestion"),
  archivo_detalle: varchar("archivo_detalle", { length: 255 }),
  correo_enviado: varchar("correo_enviado", { length: 255 }),
  correo_recepcionado: varchar("correo_recepcionado", { length: 255 }),
});

export const insertBillingSchema = createInsertSchema(billing, {
  periodo: z.string().min(1, "Periodo es requerido"),
  linea: z.string().min(1, "Linea es requerida"),
  proyecto: z.string().min(1, "Proyecto es requerido"),
  observacion: z.string().nullable().optional(),
  cantidad: z.number().nullable().optional(),
  valorizacion: z.union([z.string(), z.number()]).nullable().optional(),
  fecha_gestion: z.string().nullable().optional(),
  responsable: z.string().nullable().optional(),
  estado: z.string().default("Pendiente"),
  observacion_gestion: z.string().nullable().optional(),
  archivo_detalle: z.string().nullable().optional(),
  correo_enviado: z.string().nullable().optional(),
  correo_recepcionado: z.string().nullable().optional(),
}).omit({ id: true });

export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billing.$inferSelect;

// Schema for tb_tqw_comision_renew (all fields are text type in MySQL)
export const tqwComisionRenew = mysqlTable("tb_tqw_comision_renew", {
  RutTecnicoOrig: varchar("RutTecnicoOrig", { length: 20 }).primaryKey(),
  periodo: varchar("periodo", { length: 10 }).notNull(),
  NombreTecnico: text("NombreTecnico"),
  Supervisor: text("Supervisor"),
  Zona_Factura23: text("Zona_Factura23"),
  modelo_turno: text("modelo_turno"),
  categoria: text("categoria"),
  // Comisiones
  Comision_HFC: text("Comisión_HFC"),
  Comision_FTTH: text("Comisión_FTTH"),
  Comision_HFC_Ponderada: text("Comisión_HFC_Ponderada"),
  Comision_FTTH_Ponderada: text("Comisión_FTTH_Ponderada"),
  // Producción
  Puntos: text("Puntos"),
  Dias_Cantidad_HFC: text("Dias_Cantidad_HFC"),
  Promedio_HFC: text("Promedio_HFC"),
  Q_RGU: text("Q_RGU"),
  Dias_Cantidad_FTTH: text("Dias_Cantidad_FTTH"),
  Promedio_RGU: text("Promedio_RGU"),
  // Metas
  Meta_Produccion_HFC: text("Meta_Produccion_HFC"),
  _CumplimientoProduccionHFC: text("_CumplimientoProduccionHFC"),
  Meta_Produccion_FTTH: text("Meta_Produccion_FTTH"),
  _cumplimientoProduccionRGU: text("_cumplimientoProduccionRGU"),
  // Calidad
  Ratio_CalidadHFC: text("Ratio_CalidadHFC"),
  Meta_Calidad_HFC: text("Meta_Calidad_HFC"),
  _cumplimientoMeta_Calidad_HFC: text("_cumplimientoMeta_Calidad_HFC"),
  Ratio_CalidadFTTH: text("Ratio_CalidadFTTH"),
  Meta_Calidad_FTTH: text("Meta_Calidad_FTTH"),
  _cumplimientoMeta_Calidad_FTTH: text("_cumplimientoMeta_Calidad_FTTH"),
  // Asistencia
  Q_OPERATIVO_TURNO: text("Q_OPERATIVO_TURNO"),
  Q_AUSENTE_TURNO: text("Q_AUSENTE_TURNO"),
  Q_VACACIONES_TURNO: text("Q_VACACIONES_TURNO"),
  Q_LICENCIA_TURNO: text("Q_LICENCIA_TURNO"),
  FACTOR_AUSENCIA: text("FACTOR_AUSENCIA"),
  FACTOR_VACACIONES: text("FACTOR_VACACIONES"),
});

export type TqwComisionRenew = typeof tqwComisionRenew.$inferSelect;

// ============================================
// TABLA DE MATERIALES - tp_logistica_mat_oracle
// ============================================

export const materialsOracle = mysqlTable("tp_logistica_mat_oracle", {
  clear: bigint("clear", { mode: "number" }),
  Item: text("Item"),
  ItemDescription: text("Item Description"),
  Medida: text("Medida"),
  TipoMaterial: text("Tipo Material"),
  Familia: text("Familia"),
  SubFamilia: text("Sub Familia"),
  LineaNegocio: text("Linea negocio"),
  Tecnologia: text("Tecnologia"),
  VIGENCIA: text("VIGENCIA"),
  ValorTQW: text("Valor TQW"),
  UnidadPorKit: decimal("Unidad por Kit", { precision: 10, scale: 2 }),
  PorUnidadTQW: text("$ por unidad TQW"),
  ValorVTR: decimal("Valor VTR", { precision: 10, scale: 2 }),
  Funcionalidad: decimal("Funcionalidad", { precision: 10, scale: 2 }),
  FechaActualizacion: datetime("fecha_actualizacion"),
  FlagContrato: varchar("Flag contrato", { length: 255 }),
  Cruce: varchar("cruce", { length: 255 }),
  CodigoOraclePreMigracion: text("Código ORACLE Pre Migración"),
  FechaActualizacion2: text("fecha actualizacion"),
});

export type MaterialOracle = typeof materialsOracle.$inferSelect;

// ============================================
// TABLA DE SOLICITUDES DE MATERIALES - TB_LOGIS_TECNICO_SOLICITUD
// ============================================

export const materialSolicitud = mysqlTable("TB_LOGIS_TECNICO_SOLICITUD", {
  id: int("id").primaryKey().autoincrement(),
  material: text("material"),
  cantidad: int("cantidad"),
  fecha: datetime("fecha"),
  tecnico: int("tecnico"),
  id_tecnico_traspaso: int("id_tecnico_traspaso"),
  TICKET: varchar("TICKET", { length: 50 }),
  flag_regiones: varchar("flag_regiones", { length: 50 }),
  flag_gestion_supervisor: tinyint("flag_gestion_supervisor").default(0),
  campo_item: varchar("campo_item", { length: 100 }),
});

export type MaterialSolicitud = typeof materialSolicitud.$inferSelect;

export const insertMaterialSolicitudSchema = createInsertSchema(materialSolicitud, {
  material: z.string(),
  cantidad: z.number().int().positive(),
  tecnico: z.number().int(),
  id_tecnico_traspaso: z.number().int().optional(),
  TICKET: z.string(),
  flag_regiones: z.string().optional(),
  flag_gestion_supervisor: z.number().min(0).max(1).optional(),
  campo_item: z.string().optional(),
}).omit({ id: true, fecha: true });

export type InsertMaterialSolicitud = z.infer<typeof insertMaterialSolicitudSchema>;

// Schema para el request de solicitud de materiales
export const materialSolicitudRequestSchema = z.object({
  id_destino: z.number().int().optional(),
  id_supervisor: z.number().int().optional(),
  items: z.array(z.object({
    material: z.string(),
    cantidad: z.number().int().positive(),
    item: z.string().optional(),
    itemCode: z.string().optional(),
  })).min(1, "Debe incluir al menos un item"),
});

export type MaterialSolicitudRequest = z.infer<typeof materialSolicitudRequestSchema>;

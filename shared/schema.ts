import { mysqlTable, varchar, text, int, decimal, date, datetime, tinyint, json, bigint, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TABLAS DE AUTENTICACIÓN Y SEGURIDAD
// ============================================

// Tabla de usuarios principales (tb_user_tqw)
export const users = mysqlTable("tb_user_tqw", {
  id: int("ID").primaryKey().autoincrement(),
  email: text("email"),
  pass: text("PASS"),
  reg_date: text("reg_Date"), // Using text because it's varchar(255) in DB
  nombre: text("Nombre"),
  area: text("area"),
  supervisor: text("SUPERVISOR"),
  rut: text("Rut"),
  correo_super: text("correo_super"),
  iden_user: text("IDEN_USER"),
  vigente: text("Vigente"),
  ZONA_GEO: text("ZONA_GEO"),
  nombre_ndc: text("nombre_ndc"),
  nombre_short: text("nombre_short"),
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
  RutTecnicoOrig: varchar("RutTecnicoOrig", { length: 20 }).notNull(),
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
  // New fields
  Original_RUT_TECNICO: text("Original_RUT_TECNICO"),
  DIAS_BASE_DRIVE: text("DIAS_BASE_DRIVE"),
  SUM_OPERATIVO: text("SUM_OPERATIVO"),
  Q_Calidad30_FTTH: text("Q_Calidad30_FTTH"),
  Q_Cantidad_FTTH: text("Q_Cantidad_FTTH"),
  Q_Calidad30_HFC: text("Q_Calidad30_HFC"),
  Q_Cantidad_HFC: text("Q_Cantidad_HFC"),
  CalidadReactivaGrupoHFC: text("CalidadReactivaGrupoHFC"),
  CalidadReactivaGrupoFTTH: text("CalidadReactivaGrupoFTTH"),
  fecha_actualizacion: text("fecha_actualizacion"),
}, (table) => ({
  pk: { columns: [table.RutTecnicoOrig, table.periodo] }
}));

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

export const materialSolicitud = mysqlTable("tb_logis_tecnico_solicitud", {
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
// ============================================
// TABLA DE PUNTOS PARAMETRICOS - TP_PTOS_23_NEW
// ============================================

export const puntosParameters = mysqlTable("tp_ptos_23_new", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  tipoRed: varchar("Tipo red", { length: 50 }),
  trabajo: varchar("Trabajo", { length: 255 }),
  producto: varchar("Producto", { length: 255 }),
  claseVivienda: varchar("Clase vivienda", { length: 50 }),
  tipoVivienda: varchar("Tipo vivienda", { length: 50 }),
  llave: text("llave"),
  puntosVTROct2023: decimal("PuntosVTROct2023", { precision: 10, scale: 2 }),
  puntosTQWOct23: bigint("PuntosTQWOct23", { mode: "number" }),
  qActividadSSPP: decimal("Q actividad SSPP", { precision: 10, scale: 2 }),
  qActServicio: decimal("Q act. Servicio", { precision: 10, scale: 2 }),
  rgu: decimal("RGU", { precision: 10, scale: 2 }),
  clasifFinal: varchar("Clasif_final", { length: 50 }),
  segmento: varchar("Segmento", { length: 50 }),
});

export type PuntosParameter = typeof puntosParameters.$inferSelect;

export const insertPuntosParameterSchema = createInsertSchema(puntosParameters).omit({ id: true });
export type InsertPuntosParameter = z.infer<typeof insertPuntosParameterSchema>;


// ============================================
// SIDEBAR PERMISSIONS
// ============================================

export const sidebarPermissions = mysqlTable("tb_sidebar_permissions", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  profile: varchar("profile", { length: 255 }).notNull().unique(),
  allowedMenuItems: json("allowed_menu_items").notNull(),
});

export const insertSidebarPermissionSchema = createInsertSchema(sidebarPermissions);
export type InsertSidebarPermission = z.infer<typeof insertSidebarPermissionSchema>;
export type SidebarPermission = typeof sidebarPermissions.$inferSelect;

// ============================================
// NOTIFICATIONS SYSTEM
// ============================================

export const notifications = mysqlTable("tb_notifications", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("info"), // 'info', 'success', 'warning', 'error'
  createdAt: datetime("created_at").notNull(),
  expiresAt: datetime("expires_at"),
  createdBy: int("created_by").notNull(),
  isActive: tinyint("is_active").notNull().default(1),
});

export type Notification = typeof notifications.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications, {
  title: z.string().min(1, "El título es requerido").max(255),
  content: z.string().min(1, "El contenido es requerido"),
  priority: z.enum(["info", "success", "warning", "error"]).default("info"),
  expiresAt: z.string().nullable().optional(),
  isActive: z.number().min(0).max(1).default(1),
}).omit({ id: true, createdAt: true });

export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const notificationProfiles = mysqlTable("tb_notification_profiles", {
  id: int("id").primaryKey().autoincrement(),
  notificationId: int("notification_id").notNull(),
  profile: varchar("profile", { length: 100 }).notNull(),
});

export type NotificationProfile = typeof notificationProfiles.$inferSelect;

export const notificationReadStatus = mysqlTable("tb_notification_read_status", {
  id: int("id").primaryKey().autoincrement(),
  notificationId: int("notification_id").notNull(),
  userId: int("user_id").notNull(),
  readAt: datetime("read_at").notNull(),
});

export type NotificationReadStatus = typeof notificationReadStatus.$inferSelect;

// ============================================
// TABLA MAESTRO TOA PASO
// ============================================

export const maestroToaPaso = mysqlTable("tb_maestro_toa_paso", {
  id: int("id").primaryKey().autoincrement(),
  sistemaLegado: varchar("sistema_legado", { length: 50 }),
  sociedad: varchar("sociedad", { length: 20 }),
  rutTecnico: varchar("rut_tecnico", { length: 20 }),
  centro: varchar("centro", { length: 20 }),
  almacen: varchar("almacen", { length: 20 }),
  material: varchar("material", { length: 50 }),
  numeroDeSerie: varchar("numero_de_serie", { length: 100 }),
  cantidad: int("cantidad"),
  fechaEntrega: varchar("fecha_entrega", { length: 50 }),
  nombreTecnico: varchar("nombre_tecnico", { length: 255 }),
  fechaInstalacion: varchar("fecha_instalacion", { length: 50 }),
  nOrden: varchar("n_orden", { length: 50 }),
  rutCliente: varchar("rut_cliente", { length: 50 }),
  familiaMaterial: varchar("familia_material", { length: 255 }),
  resultadoCargaEnSap: varchar("resultado_carga_en_sap", { length: 255 }),
  fechaCarga: timestamp("fecha_carga").defaultNow(),
});

export type MaestroToaPaso = typeof maestroToaPaso.$inferSelect;

// ============================================
// SUPERVISOR NOTES SYSTEM
// ============================================

export const supervisorNotes = mysqlTable("tb_supervisor_notes", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 50 }).notNull().default("Notes"),
  imageUrl: varchar("image_url", { length: 500 }),
  isArchived: tinyint("is_archived").notNull().default(0),
  isPinned: tinyint("is_pinned").notNull().default(0),
  reminderDate: datetime("reminder_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SupervisorNote = typeof supervisorNotes.$inferSelect;

export const insertNoteSchema = createInsertSchema(supervisorNotes, {
  userId: z.coerce.number().int().positive(),
  title: z.string().min(1, "El título es requerido").max(255),
  content: z.string().nullable().optional(),
  category: z.string().max(50).optional().default("Notes"),
  imageUrl: z.string().max(500).nullable().optional(),
  isArchived: z.number().min(0).max(1).optional().default(0),
  isPinned: z.number().min(0).max(1).optional().default(0),
  reminderDate: z.string().nullable().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertNote = z.infer<typeof insertNoteSchema>;

export const supervisorNoteLabels = mysqlTable("tb_supervisor_note_labels", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("FileText"),
  color: varchar("color", { length: 100 }).default("bg-slate-100 text-slate-800"),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type NoteLabel = typeof supervisorNoteLabels.$inferSelect;

export const insertNoteLabelSchema = createInsertSchema(supervisorNoteLabels, {
  userId: z.coerce.number().int().positive(),
  name: z.string().min(1, "El nombre es requerido").max(50),
  icon: z.string().max(50).default("FileText"),
  color: z.string().max(100).optional(),
  sortOrder: z.number().int().default(0),
}).omit({ id: true, createdAt: true });

export type InsertNoteLabel = z.infer<typeof insertNoteLabelSchema>;

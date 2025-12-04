import { mysqlTable, varchar, text, int, decimal, date } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

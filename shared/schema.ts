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

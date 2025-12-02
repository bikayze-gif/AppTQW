import { pgTable, varchar, text, integer, decimal, date, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const billing = pgTable("billing", {
  id: serial("id").primaryKey(),
  periodo: varchar("periodo", { length: 20 }).notNull(),
  linea: varchar("linea", { length: 100 }).notNull(),
  proyecto: varchar("proyecto", { length: 255 }).notNull(),
  observacion: text("observacion").notNull().default(""),
  cantidad: integer("cantidad").notNull().default(0),
  valorizacion: decimal("valorizacion", { precision: 15, scale: 2 }).notNull().default("0"),
  fecha_gestion: date("fecha_gestion").notNull(),
  responsable: varchar("responsable", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 20 }).notNull().default("Pendiente"),
  observacion_gestion: text("observacion_gestion").notNull().default(""),
  archivo_detalle: varchar("archivo_detalle", { length: 255 }).notNull().default(""),
  correo_enviado: varchar("correo_enviado", { length: 255 }).notNull().default(""),
  correo_recepcionado: varchar("correo_recepcionado", { length: 255 }).notNull().default(""),
});

export const insertBillingSchema = createInsertSchema(billing).omit({ id: true });

export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billing.$inferSelect;

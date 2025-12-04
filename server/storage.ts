import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Billing, InsertBilling } from "@shared/schema";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "170.239.85.233",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "ncornejo",
  password: process.env.MYSQL_PASSWORD || "N1c0l7as17",
  database: process.env.MYSQL_DATABASE || "operaciones_tqw",
});

const db = drizzle(pool, { schema, mode: "default" });

export interface IStorage {
  getAllBilling(): Promise<Billing[]>;
  getBillingById(id: number): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  deleteBilling(id: number): Promise<boolean>;
  getTqwComisionData(rut: string, periodo: string): Promise<schema.TqwComisionRenew | undefined>;
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
      .where(eq(schema.tqwComisionRenew.RutTecnicoOrig, rut))
      .where(eq(schema.tqwComisionRenew.periodo, periodo));
    return result;
  }
}

export const storage = new MySQLStorage();

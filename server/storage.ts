import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Billing, InsertBilling } from "@shared/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

export interface IStorage {
  getAllBilling(): Promise<Billing[]>;
  getBillingById(id: number): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  deleteBilling(id: number): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
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
    const [result] = await db
      .insert(schema.billing)
      .values(billing)
      .returning();
    return result;
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    const [result] = await db
      .update(schema.billing)
      .set(billing)
      .where(eq(schema.billing.id, id))
      .returning();
    return result;
  }

  async deleteBilling(id: number): Promise<boolean> {
    await db.delete(schema.billing).where(eq(schema.billing.id, id));
    return true;
  }
}

export const storage = new PostgresStorage();

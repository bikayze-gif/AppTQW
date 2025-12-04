
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema";

const pool = mysql.createPool({
  host: "170.239.85.233",
  port: 3306,
  user: "ncornejo",
  password: "N1c0l7as17",
  database: "ncornejo",
});

const db = drizzle(pool, { schema, mode: "default" });

async function debugDatabase() {
  try {
    // Check first 10 records
    console.log("\n=== Primeros 10 registros de tb_tqw_comision_renew ===");
    const allRecords = await db.select().from(schema.tqwComisionRenew).limit(10);
    allRecords.forEach((record, idx) => {
      console.log(`${idx + 1}. RUT: ${record.RutTecnicoOrig}, Período: ${record.periodo}, Nombre: ${record.NombreTecnico}`);
    });

    // Check for the specific RUT
    console.log("\n=== Buscando RUT 14777223-8 o variaciones ===");
    const specificRut = await db
      .select()
      .from(schema.tqwComisionRenew)
      .limit(50);
    
    const filtered = specificRut.filter(r => 
      r.RutTecnicoOrig?.includes("14777223") || 
      r.RutTecnicoOrig?.includes("147772238")
    );
    
    if (filtered.length > 0) {
      console.log(`Encontrados ${filtered.length} registros:`);
      filtered.forEach((record, idx) => {
        console.log(`${idx + 1}. RUT: ${record.RutTecnicoOrig}, Período: ${record.periodo}`);
      });
    } else {
      console.log("No se encontraron registros con ese RUT");
    }

    // Show all unique periods
    console.log("\n=== Períodos disponibles (únicos) ===");
    const periods = new Set(allRecords.map(r => r.periodo).filter(Boolean));
    console.log(Array.from(periods).sort());

    // Show all unique RUTs (first 20)
    console.log("\n=== Primeros 20 RUTs únicos ===");
    const ruts = new Set(allRecords.map(r => r.RutTecnicoOrig).filter(Boolean));
    console.log(Array.from(ruts).slice(0, 20));

  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
  } finally {
    await pool.end();
  }
}

debugDatabase();

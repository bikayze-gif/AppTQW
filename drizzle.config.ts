
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: "170.239.85.233",
    port: 3306,
    user: "ncornejo",
    password: "N1c0l7as17",
    database: "operaciones_tqw",
  },
});


import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function checkAudit() {
    console.log("Intentando conectar a la base de datos...");
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: Number(process.env.MYSQL_PORT) || 3306
        });

        console.log("Conexión exitosa.");

        // Verificar si la tabla existe
        try {
            await connection.execute("SELECT 1 FROM tb_password_reset_audit LIMIT 1");
            console.log("La tabla tb_password_reset_audit existe.");

            // Consultar últimos registros
            const [rows] = await connection.execute("SELECT * FROM tb_password_reset_audit ORDER BY id DESC LIMIT 20");
            console.log("Últimos registros de auditoría:");
            console.table(rows);

        } catch (err: any) {
            if (err.code === 'ER_NO_SUCH_TABLE') {
                console.error("La tabla tb_password_reset_audit NO EXISTE.");
                console.log("Intentando crear la tabla...");
                const createTableQuery = `
                CREATE TABLE IF NOT EXISTS tb_password_reset_audit (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    action VARCHAR(50) NOT NULL,
                    success BOOLEAN DEFAULT false,
                    ip_address VARCHAR(45),
                    details TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
                await connection.execute(createTableQuery);
                console.log("Tabla creada exitosamente. Intenta realizar una prueba de recuperación de contraseña ahora.");
            } else {
                console.error("Error consultando la tabla:", err.message);
            }
        }

        await connection.end();
    } catch (err: any) {
        console.error("Error de conexión:", err.message);
        console.log("\nSi no puedes conectar desde aquí, por favor ejecuta esta consulta SQL manual en tu cliente de base de datos:");
        console.log("SELECT * FROM tb_password_reset_audit ORDER BY id DESC LIMIT 20;");
    }
}

checkAudit();

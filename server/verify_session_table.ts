
import mysql from 'mysql2/promise';
import { dbConfig } from './config';
import 'dotenv/config';

async function verifySetup() {
    console.log('--- Verificación de Configuración de Sesiones ---');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Database: ${dbConfig.database}`);

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password) {
        console.error('❌ Falta configuración de base de datos en variables de entorno');
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });

        console.log('✅ Conexión a MySQL exitosa');

        const [rows] = await connection.execute("SHOW TABLES LIKE 'sessions'");
        const tables = rows as any[];

        if (tables.length > 0) {
            console.log('✅ Tabla `sessions` encontrada correctamente');

            const [desc] = await connection.execute("DESCRIBE sessions");
            console.log('Estructura de la tabla:');
            console.table(desc);
        } else {
            console.log('⚠️ Tabla `sessions` NO encontrada. Se creará automáticamente al iniciar el servidor.');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error verificando base de datos:', error);
        process.exit(1);
    }
}

verifySetup();

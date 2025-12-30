
import mysql from 'mysql2/promise';
import { dbConfig } from './config';

async function checkTime() {
    console.log('Connecting to DB...', dbConfig.host);
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port
    });

    try {
        const [rows] = await connection.execute(
            "SELECT MAX(fecha_integracion) as last_integration FROM tb_toa_reporte_diario_mysql"
        );
        const dbTime = (rows as any)[0].last_integration;
        const now = new Date();

        console.log('----------------------------------------');
        console.log('Current System Time:', now.toLocaleString());
        console.log('DB Max Fecha Integracion:', dbTime ? new Date(dbTime).toLocaleString() : 'NULL');
        console.log('----------------------------------------');

        if (dbTime) {
            const diff = now.getTime() - new Date(dbTime).getTime();
            console.log(`Difference in minutes: ${Math.floor(diff / 1000 / 60)} minutes`);
        }

    } catch (error) {
        console.error('Error querying DB:', error);
    } finally {
        await connection.end();
    }
}

checkTime();

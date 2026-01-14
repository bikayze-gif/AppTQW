
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'operaciones_tqw',
    port: Number(process.env.MYSQL_PORT) || 3306,
};

async function createTable() {
    console.log('Connecting to database...', dbConfig.host);
    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log('Creating table tb_sidebar_permissions...');
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS tb_sidebar_permissions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        profile VARCHAR(255) NOT NULL UNIQUE,
        allowed_menu_items JSON NOT NULL
      )
    `);
        console.log('Table created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await connection.end();
    }
}

createTable();

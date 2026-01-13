
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'operaciones_tqw',
    port: Number(process.env.DB_PORT) || 3306,
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

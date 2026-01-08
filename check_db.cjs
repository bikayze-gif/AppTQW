// Temporary script to check database structure
const mysql = require('mysql2/promise');

async function checkDatabase() {
    const pool = mysql.createPool({
        host: '170.239.85.233',
        port: 3306,
        user: 'ncornejo',
        password: process.env.MYSQL_PASSWORD || 'N1c0l7as17', // Fallback for script
        database: 'operaciones_tqw',
    });

    try {
        console.log('=== Checking TP_PTOS_23_NEW table in MySQL ===\n');

        // Check if table exists
        const [tables] = await pool.execute(
            "SHOW TABLES LIKE 'TP_PTOS_23_NEW'"
        );
        console.log('Table exists:', tables.length > 0);

        if (tables.length > 0) {
            // Get table structure
            console.log('\n=== Table Structure ===');
            const [structure] = await pool.execute('DESCRIBE TP_PTOS_23_NEW');
            console.log(structure);
            
            // Count rows
             const [count] = await pool.execute('SELECT COUNT(*) as c FROM TP_PTOS_23_NEW');
             console.log('\nRow count:', count[0].c);
        } else {
             console.log('Table TP_PTOS_23_NEW NOT found in this MySQL database.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase();

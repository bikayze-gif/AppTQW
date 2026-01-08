// Temporary script to check database structure (ES module)
import mysql from 'mysql2/promise';

async function checkDatabase() {
    const pool = mysql.createPool({
        host: '170.239.85.233',
        port: 3306,
        user: 'root',
        password: 'Tqw.2023',
        database: 'operaciones_tqw',
    });

    try {
        console.log('=== Checking PRODUCCION_NDC_RANK_Red table ===\n');

        // Check if table exists
        const [tables] = await pool.execute(
            "SHOW TABLES LIKE 'PRODUCCION_NDC_RANK_Red'"
        );
        console.log('Table exists:', tables.length > 0);

        if (tables.length === 0) {
            console.log('\nSearching for similar table names...');
            const [allTables] = await pool.execute("SHOW TABLES LIKE '%PRODUCCION%'");
            console.log('Tables with PRODUCCION:', allTables);
        } else {
            // Get table structure
            console.log('\n=== Table Structure ===');
            const [structure] = await pool.execute('DESCRIBE PRODUCCION_NDC_RANK_Red');
            console.table(structure);

            // Get distinct mes_contable values
            console.log('\n=== Distinct mes_contable values (first 10) ===');
            const [periods] = await pool.execute(
                'SELECT DISTINCT mes_contable FROM PRODUCCION_NDC_RANK_Red ORDER BY mes_contable DESC LIMIT 10'
            );
            console.table(periods);

            // Get sample row
            console.log('\n=== Sample row ===');
            const [sample] = await pool.execute(
                'SELECT * FROM PRODUCCION_NDC_RANK_Red LIMIT 1'
            );
            if (sample.length > 0) {
                console.log('Column names:', Object.keys(sample[0]));
                console.log('\nSample data (first few fields):');
                const sampleData = sample[0];
                Object.keys(sampleData).slice(0, 10).forEach(key => {
                    console.log(`  ${key}:`, sampleData[key]);
                });
            }

            // Count total rows
            console.log('\n=== Row count ===');
            const [count] = await pool.execute(
                'SELECT COUNT(*) as total FROM PRODUCCION_NDC_RANK_Red'
            );
            console.log('Total rows:', count[0].total);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();

/**
 * Script Node.js para analizar la estructura de la tabla TP_META_GEO_2023_V3
 * y comprender cómo insertar los datos de las metas de producción.
 */

import sql from 'mssql';

// Configuración de conexión a SQL Server
const config = {
    server: '181.212.32.10',
    port: 1433,
    database: 'telqway',
    user: 'ncornejo',
    password: 'N1c0l7as17',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function analyzeTableStructure() {
    console.log('='.repeat(80));
    console.log('ANÁLISIS DE ESTRUCTURA: TP_META_GEO_2023_V3');
    console.log('='.repeat(80));

    try {
        await sql.connect(config);

        // 1. Obtener estructura de la tabla
        const structureQuery = `
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'TP_META_GEO_2023_V3'
            ORDER BY ORDINAL_POSITION;
        `;

        const structureResult = await sql.query(structureQuery);
        console.log('\n📋 ESTRUCTURA DE LA TABLA:');
        console.log('-'.repeat(80));
        console.table(structureResult.recordset);

        // 2. Obtener datos de ejemplo
        const sampleQuery = `
            SELECT TOP 10 *
            FROM TP_META_GEO_2023_V3
            ORDER BY 1 DESC;
        `;

        const sampleResult = await sql.query(sampleQuery);
        console.log('\n📊 PRIMEROS 10 REGISTROS:');
        console.log('-'.repeat(80));
        console.table(sampleResult.recordset);

        // 3. Obtener períodos existentes
        const periodsQuery = `
            SELECT DISTINCT 
                periodo,
                COUNT(*) as Total_Registros
            FROM TP_META_GEO_2023_V3
            WHERE periodo >= 202501
            GROUP BY periodo
            ORDER BY periodo DESC;
        `;

        const periodsResult = await sql.query(periodsQuery);
        console.log('\n📅 PERÍODOS EXISTENTES (2025 en adelante):');
        console.log('-'.repeat(80));
        console.table(periodsResult.recordset);

        // 4. Obtener nombres de columnas para buscar campos categóricos
        const columns = structureResult.recordset.map(row => row.COLUMN_NAME);

        // Buscar columnas que probablemente contengan zonas, turnos, tipos de servicio
        const categoricalKeywords = ['zona', 'turno', 'tipo', 'servicio', 'red', 'geo'];

        console.log('\n='.repeat(80));
        console.log('VALORES ÚNICOS EN CAMPOS CATEGÓRICOS');
        console.log('='.repeat(80));

        for (const column of columns) {
            if (categoricalKeywords.some(keyword => column.toLowerCase().includes(keyword))) {
                try {
                    const uniqueQuery = `
                        SELECT DISTINCT ${column}, COUNT(*) as Cantidad
                        FROM TP_META_GEO_2023_V3
                        GROUP BY ${column}
                        ORDER BY ${column};
                    `;
                    const uniqueResult = await sql.query(uniqueQuery);
                    console.log(`\n🔍 Valores únicos en '${column}':`);
                    console.log('-'.repeat(40));
                    console.table(uniqueResult.recordset);
                } catch (error) {
                    console.log(`Error al consultar ${column}: ${error.message}`);
                }
            }
        }

        // 5. Obtener detalles del período más reciente
        const recentQuery = `
            SELECT TOP 20 *
            FROM TP_META_GEO_2023_V3
            WHERE periodo = (SELECT MAX(periodo) FROM TP_META_GEO_2023_V3)
            ORDER BY 1;
        `;

        const recentResult = await sql.query(recentQuery);
        console.log('\n='.repeat(80));
        console.log('DETALLE DE PERÍODO RECIENTE (PLANTILLA)');
        console.log('='.repeat(80));
        console.log('\n📋 REGISTROS DEL PERÍODO MÁS RECIENTE:');
        console.log('-'.repeat(80));
        console.table(recentResult.recordset);

        // Resumen
        console.log('\n' + '='.repeat(80));
        console.log('✅ ANÁLISIS COMPLETADO');
        console.log('='.repeat(80));
        console.log('\n📝 RESUMEN:');
        console.log(`   - Total de columnas: ${structureResult.recordset.length}`);
        console.log(`   - Períodos únicos encontrados: ${periodsResult.recordset.length}`);
        console.log(`   - Registros en período más reciente: ${recentResult.recordset.length}`);
        console.log('\n💡 PRÓXIMO PASO:');
        console.log('   Con esta información, podemos crear el script de INSERT');
        console.log('   para los períodos 202601, 202602 y 202603.');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error(error);
    } finally {
        await sql.close();
    }
}

// Ejecutar el análisis
analyzeTableStructure()
    .then(() => {
        console.log('\n✅ Script finalizado correctamente');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });

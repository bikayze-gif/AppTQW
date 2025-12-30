const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });

    const query = `
        SELECT 
          s.id,
          s.material as materialName,
          s.cantidad as quantity,
          s.fecha as date,
          s.TICKET as ticketToken,
          s.campo_item as itemCode,
          s.flag_regiones as flagRegiones,
          u1.nombre as originTechnician,
          CASE 
            WHEN u1.perfil2 IS NOT NULL AND u1.perfil2 != '' THEN '-' 
            ELSE u1.supervisor 
          END as supervisorName,
          CASE 
            WHEN s.id_tecnico_traspaso = 0 THEN 'Bodega'
            ELSE u2.nombre 
          END as destinationTechnician,
          CASE 
            WHEN s.flag_gestion_supervisor = 0 THEN 'PENDIENTE'
            WHEN s.flag_gestion_supervisor = 1 THEN 'APROBADO'
            WHEN s.flag_gestion_supervisor = 2 THEN 'RECHAZADO'
            ELSE 'PENDIENTE'
          END as status
        FROM TB_LOGIS_TECNICO_SOLICITUD s
        LEFT JOIN tb_user_tqw u1 ON s.tecnico = u1.id
        LEFT JOIN tb_user_tqw u2 ON s.id_tecnico_traspaso = u2.id
        ORDER BY s.fecha DESC
        LIMIT 10
      `;

    try {
        const [rows] = await pool.execute(query);
        console.log('Rows found:', rows.length);
        if (rows.length > 0) {
            console.log('Sample row:', JSON.stringify(rows[0], null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

test();

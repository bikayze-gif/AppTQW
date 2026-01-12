-- ============================================================
-- STORED PROCEDURES - Migración Manual
-- Base de datos: operaciones_tqw_bkp
-- Fecha: 2026-01-09
-- ============================================================

-- ============================================================
-- 3. refresh_mv_asignacion_tecnico_serie
-- ============================================================
DROP PROCEDURE IF EXISTS `refresh_mv_asignacion_tecnico_serie`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `refresh_mv_asignacion_tecnico_serie`()
BEGIN

    TRUNCATE TABLE mv_asignacion_tecnico_serie;

    INSERT INTO mv_asignacion_tecnico_serie

    SELECT 

        tut.Nombre_short,

        tut2.Nombre_short as Nombre2,

        A.serie as Serial,

        NULL as flag_bodega,

        A.id as last_id

    FROM TB_LOGIS_TECNICO_SERIE_TRANSFIERE A 

    LEFT JOIN tb_user_tqw tut ON tut.id = A.id_origen

    LEFT JOIN tb_user_tqw tut2 ON tut2.id = A.id_destino  

    LEFT JOIN TB_LOGIS_LOG_BODEGA_materialTecnico tllbmt ON tllbmt.serie = A.serie  

    WHERE A.flagacepta = 'Si'

    AND A.flag_bodega IS NULL;



    -- CREATE INDEX idx_mv_asignacion_tecnico_serie_id ON mv_asignacion_tecnico_serie(last_id);

END$$

DELIMITER ;

-- ============================================================
-- 5. SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL
-- ============================================================
DROP PROCEDURE IF EXISTS `SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL`()
BEGIN

    DROP TABLE IF EXISTS TB_INVENTARIO_RESULTADO_FINAL;

    CREATE TABLE TB_INVENTARIO_RESULTADO_FINAL

    AS (       

SELECT

        `tlci`.`id_cierre`,

        `tlci`.`fecha`,

        `tlci`.`serial` AS `serie`,

        `id_tecnico`,

         `locator_inv`,

         A.`id_movimiento`,

        '' AS `Costo`,

        '' AS `Depreciación`,

        `tluct`.`serie` AS `SerieCargada`,

        CASE

            WHEN `tluct`.`serie` IS NOT NULL OR `fisico`.`SERIES` IS NOT NULL THEN 'CUADRADO'

            ELSE 'FALTANTE'

        END AS `ESTADO_APP`,

        CASE

            WHEN `tlm`.`Semantica` IS NULL OR `A`.`id_movimiento` = 0 THEN

                CASE

                    WHEN `flujo` = 'Reversa' THEN 'Pendiente por entregar'

                    WHEN `flujo` = 'Directa' THEN 'Entregado'

                END

            ELSE `tlm`.`Semantica`

        END AS `Semantica`,

        `flujo`,

        `Valorfinal`,

        CASE WHEN  `tlm`.`descuento` is null THEN 1 

        ELSE `tlm`.`descuento`

        END AS `descuento`

        ,

        `Geo_inv`,

        `Flag_Gestion`,

        tut.supervisor , 

        tut.vigente

    FROM

        `TB_LOGIS_CIERRE_INVENTARIO2` `tlci`

        LEFT JOIN tb_user_tqw tut 

        ON tut.Nombre_short = tlci.id_tecnico

        LEFT JOIN `TB_LOGIS_UploadCierreTecnico` `tluct` ON `tluct`.`serie` = `tlci`.`serial` AND `tluct`.`id` = `tlci`.`ID_CIERRE`

        LEFT JOIN (

            SELECT DISTINCT `SERIES`, `id_cierre`

            FROM (

                SELECT `SERIES`, 'Fisico' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO`

                UNION ALL

                SELECT `SERIES`, 'Bodega' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO_BODEGA`

                UNION ALL

                SELECT `SERIES`, 'Reversa' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO_reversa`

                UNION ALL

                SELECT `SERIES`, 'Ticket' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO_ticket`

            ) AS `A`

        ) `fisico` ON `fisico`.`SERIES` = `tlci`.`Serial` AND `fisico`.`id_cierre` = `tlci`.`ID_CIERRE`

        LEFT JOIN (

            SELECT ranked.id, fecha_hora, ranked.serie,

                ranked.id_tecnico_origen, ranked.id_tecnico_destino,

                observacion, ranked.id_movimiento, motivo, ticket

            FROM (

                SELECT id, fecha_hora, serie,

                    id_tecnico_origen, id_tecnico_destino, ticket,

                    observacion, id_movimiento, motivo,

                    ROW_NUMBER() OVER (PARTITION BY serie ORDER BY fecha_hora DESC) AS row_num

                FROM TB_LOGIS_MOVIMIENTOS X

            ) AS ranked

            WHERE row_num = 1

        ) A ON A.serie = tlci.serial

        LEFT JOIN TP_LOGIS_MOVIMIENTOS tlm ON tlm.id = A.id_movimiento

    WHERE

        CASE

            WHEN `tlci`.`state` = 'Issued out of stores' THEN 'NO'

            ELSE 'SI'

        END = 'SI'

    );



    CREATE INDEX idx_id_cierre ON TB_INVENTARIO_RESULTADO_FINAL (id_cierre(255));

END$$

DELIMITER ;

-- ============================================================
-- 7. sp_insert_faltantes
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_insert_faltantes`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_insert_faltantes`(p_id_cierre VARCHAR(255))
BEGIN

      -- Delete existing records first

      DELETE FROM TB_CIERRE_INVENTARIO_FALTANTE

      WHERE id_cierre = p_id_cierre;



      -- Insert new records with RUT

      INSERT INTO TB_CIERRE_INVENTARIO_FALTANTE (

          id_cierre,

          fecha,

          Serial,

          id_tecnico,

          rut,

          id_movimiento,

          SerieCargada,

          ESTADO_APP,

          Semantica,

          flujo,

          monto_valor,

          Geo_inv,

          flag_job,

          fecha_ejec,

          item

      )

      SELECT

          A.id_cierre,

          fecha,

          Serial,

          id_tecnico,

          tut.rut,

          id_movimiento,

          '' SerieCargada,

          fisico.id_cierre as ESTADO_APP,

          tlm.Semantica as Semantica,

          flujo,

          CAST(REGEXP_REPLACE(valores.`Valor TQW`, '[^0-9]', '') AS UNSIGNED) as        

  monto_valor,

          A.Geo_inv,

          A.flag_job,

          NOW(),

          A.flag_modelo_serie as item

      FROM tb_logis_cierre_inventario2 A

      LEFT JOIN (

          SELECT DISTINCT SERIES, id_cierre

          FROM (

              SELECT SERIES, 'Fisico' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO

              UNION ALL

              SELECT SERIES, 'Bodega' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO_BODEGA

              UNION ALL

              SELECT SERIES, 'Reversa' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO_reversa

              UNION ALL

              SELECT SERIES, 'Ticket' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO_ticket

          ) AS A

      ) fisico ON fisico.SERIES = A.Serial AND fisico.id_cierre = A.ID_CIERRE

      LEFT JOIN tp_logis_movimientos tlm ON A.id_movimiento = tlm.id

      LEFT JOIN tp_logistica_mat_oracle valores ON valores.item =

  A.flag_modelo_serie

      LEFT JOIN tb_user_tqw tut ON tut.Nombre_short = A.id_tecnico

      WHERE A.ID_CIERRE = p_id_cierre

      AND fisico.id_cierre IS NULL

      AND id_tecnico NOT IN ('ANALISIS','NO_ACTIVA')

      AND (A.id_movimiento != 12 OR A.id_movimiento IS NULL);

  END$$

DELIMITER ;

-- ============================================================
-- 8. sp_insert_movimiento
-- ============================================================
DROP PROCEDURE IF EXISTS `sp_insert_movimiento`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_insert_movimiento`(
    IN p_serie VARCHAR(255),
    IN p_id_usuario INT
)
BEGIN
    INSERT INTO tb_logis_movimientos (
        fecha_hora, 
        serie, 
        id_tecnico_origen, 
        id_tecnico_destino, 
        observacion, 
        id_movimiento
    )
    VALUES (
        NOW(), 
        p_serie, 
        164, 
        p_id_usuario, 
        'Asignado a técnico', 
        0
    );
END$$

DELIMITER ;

-- ============================================================
-- 12. UpdateLogisticaDirecta
-- ============================================================
DROP PROCEDURE IF EXISTS `UpdateLogisticaDirecta`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `UpdateLogisticaDirecta`()
BEGIN

    -- Crear tabla temporal con los últimos movimientos

    CREATE TEMPORARY TABLE temp_last_movements AS

    SELECT 

        serie,

        MAX(id) AS max_id    

    FROM 

        TB_LOGIS_MOVIMIENTOS

    GROUP BY 

        serie;

    -- Indexar la tabla temporal

    ALTER TABLE temp_last_movements ADD INDEX idx_serie_fecha (serie(255), max_id);

    -- Realizar el UPDATE con la tabla temporal

    UPDATE tb_ferret_directa1 RZ

    LEFT JOIN temp_last_movements tlm ON RZ.Serial = tlm.serie

    SET 

        RZ.`Unit Number` = tlm.max_id;

    -- Eliminar la tabla temporal

    DROP TEMPORARY TABLE IF EXISTS temp_last_movements;

    

END$$

DELIMITER ;

-- ============================================================
-- 13. UpdateLogisticaReversa
-- ============================================================
DROP PROCEDURE IF EXISTS `UpdateLogisticaReversa`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `UpdateLogisticaReversa`()
BEGIN

    -- Crear tabla temporal con los últimos movimientos

    CREATE TEMPORARY TABLE temp_last_movements AS

    SELECT 

        serie,

        MAX(id) AS max_id    

    FROM 

        TB_LOGIS_MOVIMIENTOS

    GROUP BY 

        serie;
    -- Indexar la tabla temporal

    ALTER TABLE temp_last_movements ADD INDEX idx_serie_fecha (serie(255), max_id);
    -- Realizar el UPDATE con la tabla temporal

    UPDATE tb_logist_bdreversa RZ

    LEFT JOIN temp_last_movements tlm ON RZ.Serial = tlm.serie

    SET 

        RZ.`Unit Number` = tlm.max_id;
    -- Eliminar la tabla temporal

    DROP TEMPORARY TABLE IF EXISTS temp_last_movements;
END$$

DELIMITER ;

-- ============================================================
-- FIN DE STORED PROCEDURES
-- ============================================================

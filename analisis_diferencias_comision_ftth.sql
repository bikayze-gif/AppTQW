-- =====================================================
-- ANÁLISIS DE DIFERENCIAS EN Comisión_FTTH_Ponderada
-- Periodo: 202601
-- Tabla Correcta: TB_TQW_COMISION_RENEW_TEST_DIC
-- Tabla a Verificar: TB_TQW_COMISION_RENEW
-- =====================================================

-- 1. RESUMEN GENERAL DE DIFERENCIAS
-- =====================================================
SELECT 
    COUNT(*) AS Total_Registros_Con_Diferencias,
    SUM(CASE WHEN a.Comisión_FTTH_Ponderada IS NULL THEN 1 ELSE 0 END) AS Faltan_En_TB_TQW_COMISION_RENEW,
    SUM(CASE WHEN b.Comisión_FTTH_Ponderada IS NULL THEN 1 ELSE 0 END) AS Faltan_En_TB_TQW_COMISION_RENEW_TEST_DIC,
    SUM(CASE WHEN a.Comisión_FTTH_Ponderada IS NOT NULL AND b.Comisión_FTTH_Ponderada IS NOT NULL 
             AND ABS(a.Comisión_FTTH_Ponderada - b.Comisión_FTTH_Ponderada) > 0.01 THEN 1 ELSE 0 END) AS Valores_Diferentes,
    SUM(CASE WHEN a.Comisión_FTTH_Ponderada IS NULL THEN 0 
             ELSE ABS(ISNULL(b.Comisión_FTTH_Ponderada, 0) - a.Comisión_FTTH_Ponderada) END) AS Suma_Total_Diferencias
FROM 
    TB_TQW_COMISION_RENEW a
FULL OUTER JOIN 
    TB_TQW_COMISION_RENEW_TEST_DIC b 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    (a.periodo = '202601' OR b.periodo = '202601')
    AND (
        a.Comisión_FTTH_Ponderada IS NULL 
        OR b.Comisión_FTTH_Ponderada IS NULL 
        OR ABS(a.Comisión_FTTH_Ponderada - b.Comisión_FTTH_Ponderada) > 0.01
    );

-- 2. DETALLE DE TODAS LAS DIFERENCIAS
-- =====================================================
SELECT 
    COALESCE(a.RutTecnicoOrig, b.RutTecnicoOrig) AS RutTecnicoOrig,
    COALESCE(a.NombreTecnico, b.NombreTecnico) AS NombreTecnico,
    COALESCE(a.Supervisor, b.Supervisor) AS Supervisor,
    COALESCE(a.Zona_Factura23, b.Zona_Factura23) AS Zona,
    a.Comisión_FTTH_Ponderada AS Valor_Actual_TB_TQW_COMISION_RENEW,
    b.Comisión_FTTH_Ponderada AS Valor_Correcto_TB_TQW_COMISION_RENEW_TEST_DIC,
    (b.Comisión_FTTH_Ponderada - ISNULL(a.Comisión_FTTH_Ponderada, 0)) AS Diferencia,
    CASE 
        WHEN a.Comisión_FTTH_Ponderada IS NULL THEN 'Falta en TB_TQW_COMISION_RENEW'
        WHEN b.Comisión_FTTH_Ponderada IS NULL THEN 'Falta en TB_TQW_COMISION_RENEW_TEST_DIC'
        WHEN ABS(a.Comisión_FTTH_Ponderada - b.Comisión_FTTH_Ponderada) > 0.01 THEN 'Valores diferentes'
        ELSE 'Valores iguales'
    END AS Estado
FROM 
    TB_TQW_COMISION_RENEW a
FULL OUTER JOIN 
    TB_TQW_COMISION_RENEW_TEST_DIC b 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    (a.periodo = '202601' OR b.periodo = '202601')
    AND (
        a.Comisión_FTTH_Ponderada IS NULL 
        OR b.Comisión_FTTH_Ponderada IS NULL 
        OR ABS(a.Comisión_FTTH_Ponderada - b.Comisión_FTTH_Ponderada) > 0.01
    )
ORDER BY 
    ABS(ISNULL(b.Comisión_FTTH_Ponderada, 0) - ISNULL(a.Comisión_FTTH_Ponderada, 0)) DESC;

-- 3. RESUMEN POR SUPERVISOR
-- =====================================================
SELECT 
    COALESCE(a.Supervisor, b.Supervisor) AS Supervisor,
    COUNT(*) AS Total_Diferencias,
    SUM(CASE WHEN a.Comisión_FTTH_Ponderada IS NULL THEN 1 ELSE 0 END) AS Faltan_En_RENEW,
    SUM(ISNULL(b.Comisión_FTTH_Ponderada, 0)) AS Total_Comision_Correcta,
    SUM(ISNULL(a.Comisión_FTTH_Ponderada, 0)) AS Total_Comision_Actual,
    SUM(ISNULL(b.Comisión_FTTH_Ponderada, 0) - ISNULL(a.Comisión_FTTH_Ponderada, 0)) AS Diferencia_Total
FROM 
    TB_TQW_COMISION_RENEW a
FULL OUTER JOIN 
    TB_TQW_COMISION_RENEW_TEST_DIC b 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    (a.periodo = '202601' OR b.periodo = '202601')
    AND (
        a.Comisión_FTTH_Ponderada IS NULL 
        OR b.Comisión_FTTH_Ponderada IS NULL 
        OR ABS(a.Comisión_FTTH_Ponderada - b.Comisión_FTTH_Ponderada) > 0.01
    )
GROUP BY 
    COALESCE(a.Supervisor, b.Supervisor)
ORDER BY 
    Diferencia_Total DESC;

-- 4. REGISTROS QUE FALTAN EN TB_TQW_COMISION_RENEW
-- =====================================================
SELECT 
    b.RutTecnicoOrig,
    b.NombreTecnico,
    b.Supervisor,
    b.Zona_Factura23,
    b.modelo_turno,
    b.categoria,
    b.Comisión_FTTH_Ponderada AS Valor_Correcto,
    b.Comisión_HFC_Ponderada,
    b.periodo
FROM 
    TB_TQW_COMISION_RENEW_TEST_DIC b
LEFT JOIN 
    TB_TQW_COMISION_RENEW a 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    b.periodo = '202601'
    AND a.RutTecnicoOrig IS NULL
ORDER BY 
    b.Comisión_FTTH_Ponderada DESC;

-- 5. SCRIPT PARA INSERTAR REGISTROS FALTANTES
-- =====================================================
-- ADVERTENCIA: Revisa cuidadosamente antes de ejecutar
-- Este script insertará los registros que faltan en TB_TQW_COMISION_RENEW

/*
INSERT INTO TB_TQW_COMISION_RENEW (
    RutTecnicoOrig,
    NombreTecnico,
    Supervisor,
    Zona_Factura23,
    modelo_turno,
    categoria,
    Original_RUT_TECNICO,
    DIAS_BASE_DRIVE,
    SUM_OPERATIVO,
    Dias_Cantidad_HFC,
    Dias_Cantidad_FTTH,
    Puntos,
    Q_RGU,
    Promedio_HFC,
    Promedio_RGU,
    Q_OPERATIVO_TURNO,
    Promedio_FTTH,
    Calidad_FTTH,
    Calidad_HFC,
    Q_Calidad30_FTTH,
    Q_Cantidad_FTTH,
    Q_Calidad30_HFC,
    Q_Cantidad_HFC,
    Meta_Calidad_FTTH,
    Meta_Calidad_HFC,
    _cumplimientoMeta_Calidad_FTTH,
    _cumplimientoMeta_Calidad_HFC,
    CalidadReactivaGrupoHFC,
    CalidadReactivaGrupoFTTH,
    Comisión_FTTH,
    Comisión_HFC,
    Comisión_FTTH_Ponderada,
    Comisión_HFC_Ponderada,
    periodo
)
SELECT 
    b.RutTecnicoOrig,
    b.NombreTecnico,
    b.Supervisor,
    b.Zona_Factura23,
    b.modelo_turno,
    b.categoria,
    b.Original_RUT_TECNICO,
    b.DIAS_BASE_DRIVE,
    b.SUM_OPERATIVO,
    b.Dias_Cantidad_HFC,
    b.Dias_Cantidad_FTTH,
    b.Puntos,
    b.Q_RGU,
    b.Promedio_HFC,
    b.Promedio_RGU,
    b.Q_OPERATIVO_TURNO,
    b.Promedio_FTTH,
    b.Calidad_FTTH,
    b.Calidad_HFC,
    b.Q_Calidad30_FTTH,
    b.Q_Cantidad_FTTH,
    b.Q_Calidad30_HFC,
    b.Q_Cantidad_HFC,
    b.Meta_Calidad_FTTH,
    b.Meta_Calidad_HFC,
    b._cumplimientoMeta_Calidad_FTTH,
    b._cumplimientoMeta_Calidad_HFC,
    b.CalidadReactivaGrupoHFC,
    b.CalidadReactivaGrupoFTTH,
    b.Comisión_FTTH,
    b.Comisión_HFC,
    b.Comisión_FTTH_Ponderada,
    b.Comisión_HFC_Ponderada,
    b.periodo
FROM 
    TB_TQW_COMISION_RENEW_TEST_DIC b
LEFT JOIN 
    TB_TQW_COMISION_RENEW a 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    b.periodo = '202601'
    AND a.RutTecnicoOrig IS NULL;
*/

-- 6. SCRIPT PARA ACTUALIZAR VALORES DIFERENTES
-- =====================================================
-- ADVERTENCIA: Revisa cuidadosamente antes de ejecutar
-- Este script actualizará los valores que son diferentes

/*
UPDATE a
SET a.Comisión_FTTH_Ponderada = b.Comisión_FTTH_Ponderada
FROM 
    TB_TQW_COMISION_RENEW a
INNER JOIN 
    TB_TQW_COMISION_RENEW_TEST_DIC b 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    a.periodo = '202601'
    AND ABS(a.Comisión_FTTH_Ponderada - b.Comisión_FTTH_Ponderada) > 0.01;
*/

-- 7. VERIFICACIÓN POST-CORRECCIÓN
-- =====================================================
-- Ejecuta esta consulta después de aplicar las correcciones para verificar

/*
SELECT 
    COUNT(*) AS Total_Registros_Verificados,
    SUM(CASE WHEN ABS(ISNULL(a.Comisión_FTTH_Ponderada, 0) - ISNULL(b.Comisión_FTTH_Ponderada, 0)) > 0.01 THEN 1 ELSE 0 END) AS Diferencias_Restantes
FROM 
    TB_TQW_COMISION_RENEW a
FULL OUTER JOIN 
    TB_TQW_COMISION_RENEW_TEST_DIC b 
    ON a.RutTecnicoOrig = b.RutTecnicoOrig 
    AND a.periodo = b.periodo
WHERE 
    a.periodo = '202601' OR b.periodo = '202601';
*/

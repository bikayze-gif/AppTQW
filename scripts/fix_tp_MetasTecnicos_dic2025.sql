-- =====================================================
-- SCRIPT PARA ELIMINAR DUPLICADOS DE DICIEMBRE 2025
-- =====================================================
-- Fecha: 06-01-2026
-- Periodo específico: DICIEMBRE 2025
-- Descripción: Elimina registros duplicados SOLO de diciembre 2025

-- =====================================================
-- PASO 1: VERIFICACIÓN INICIAL - DICIEMBRE 2025
-- =====================================================

-- 1.1. Mostrar todos los registros de diciembre 2025
SELECT 
    ID_METAS,
    FORMAT(Mes, 'yyyy-MM-dd') as Fecha_Completa,
    [Número de Identificación],
    Nombre + ' ' + [Apellido Paterno] + ' ' + ISNULL([Apellido Materno], '') as Nombre_Completo,
    [Jefe directo],
    metas,
    DOTACION,
    [Modelo facturacion]
FROM tp_MetasTecnicos
WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01'
ORDER BY 
    [Número de Identificación],
    [Jefe directo],
    metas,
    ID_METAS;

-- 1.2. Identificar duplicados en diciembre 2025
-- (Mismo técnico + Mismo jefe directo + Mismo tipo de meta)
SELECT 
    t1.ID_METAS,
    FORMAT(t1.Mes, 'yyyy-MM-dd') as Fecha,
    t1.[Número de Identificación],
    t1.Nombre,
    t1.[Apellido Paterno],
    t1.[Apellido Materno],
    t1.[Jefe directo],
    t1.metas,
    t1.DOTACION,
    'DUPLICADO - SE ELIMINARÁ' as Estado,
    ROW_NUMBER() OVER (
        PARTITION BY t1.[Número de Identificación], t1.[Jefe directo], t1.metas
        ORDER BY t1.ID_METAS
    ) as Numero_Duplicado
FROM tp_MetasTecnicos t1
WHERE t1.Mes >= '2025-12-01' AND t1.Mes < '2026-01-01'
  AND EXISTS (
      SELECT 1 
      FROM tp_MetasTecnicos t2
      WHERE t2.[Número de Identificación] = t1.[Número de Identificación]
        AND t2.Mes >= '2025-12-01' AND t2.Mes < '2026-01-01'
        AND t2.[Jefe directo] = t1.[Jefe directo]
        AND t2.metas = t1.metas
        AND t2.ID_METAS > t1.ID_METAS
  )
ORDER BY 
    t1.[Número de Identificación],
    t1.[Jefe directo],
    t1.metas,
    t1.ID_METAS;

-- 1.3. Resumen de duplicados por jefe directo
SELECT 
    [Jefe directo] as Jefe_Directo,
    COUNT(DISTINCT [Número de Identificación]) as Tecnicos_Con_Duplicados,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM tp_MetasTecnicos t2 
        WHERE t2.[Número de Identificación] = t1.[Número de Identificación]
          AND t2.Mes >= '2025-12-01' AND t2.Mes < '2026-01-01'
          AND t2.[Jefe directo] = t1.[Jefe directo]
          AND t2.metas = t1.metas
          AND t2.ID_METAS > t1.ID_METAS
    ) THEN 1 ELSE 0 END) as Registros_Duplicados_Eliminar
FROM tp_MetasTecnicos t1
WHERE t1.Mes >= '2025-12-01' AND t1.Mes < '2026-01-01'
GROUP BY [Jefe directo]
ORDER BY Registros_Duplicados_Eliminar DESC;

-- 1.4. Resumen de duplicados por tipo de meta
SELECT 
    metas as Tipo_Meta,
    COUNT(DISTINCT [Número de Identificación]) as Tecnicos_Con_Duplicados,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM tp_MetasTecnicos t2 
        WHERE t2.[Número de Identificación] = t1.[Número de Identificación]
          AND t2.Mes >= '2025-12-01' AND t2.Mes < '2026-01-01'
          AND t2.[Jefe directo] = t1.[Jefe directo]
          AND t2.metas = t1.metas
          AND t2.ID_METAS > t1.ID_METAS
    ) THEN 1 ELSE 0 END) as Registros_Duplicados_Eliminar
FROM tp_MetasTecnicos t1
WHERE t1.Mes >= '2025-12-01' AND t1.Mes < '2026-01-01'
GROUP BY metas
ORDER BY Registros_Duplicados_Eliminar DESC;

-- 1.5. Total de duplicados en diciembre 2025
SELECT 
    'DICIEMBRE 2025' as Periodo,
    COUNT(*) as Total_Registros,
    COUNT(DISTINCT [Número de Identificación]) as Tecnicos_Unicos,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM tp_MetasTecnicos t2 
        WHERE t2.[Número de Identificación] = t1.[Número de Identificación]
          AND t2.Mes >= '2025-12-01' AND t2.Mes < '2026-01-01'
          AND t2.[Jefe directo] = t1.[Jefe directo]
          AND t2.metas = t1.metas
          AND t2.ID_METAS > t1.ID_METAS
    ) THEN 1 ELSE 0 END) as Duplicados_Eliminar
FROM tp_MetasTecnicos t1
WHERE t1.Mes >= '2025-12-01' AND t1.Mes < '2026-01-01';

-- =====================================================
-- PASO 2: ELIMINACIÓN DE DUPLICADOS - DICIEMBRE 2025
-- =====================================================
-- Ejecutar SOLO después de revisar los resultados del PASO 1
-- Este query elimina solo duplicados de diciembre 2025

-- DESCOMENTAR LAS SIGUIENTES LÍNEAS PARA EJECUTAR LA ELIMINACIÓN:
-- DELETE FROM tp_MetasTecnicos
-- WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01'
--   AND EXISTS (
--       SELECT 1 
--       FROM tp_MetasTecnicos t2
--       WHERE t2.[Número de Identificación] = tp_MetasTecnicos.[Número de Identificación]
--         AND t2.Mes >= '2025-12-01' AND t2.Mes < '2026-01-01'
--         AND t2.[Jefe directo] = tp_MetasTecnicos.[Jefe directo]
--         AND t2.metas = tp_MetasTecnicos.metas
--         AND t2.ID_METAS > tp_MetasTecnicos.ID_METAS
--   );

-- =====================================================
-- PASO 3: VERIFICACIÓN DESPUÉS DE LA ELIMINACIÓN
-- =====================================================

-- 3.1. Verificar que no quedan duplicados en diciembre 2025
-- Debería retornar 0 filas si la eliminación fue exitosa
SELECT 
    [Número de Identificación],
    FORMAT(Mes, 'yyyy-MM-dd') as Fecha,
    [Jefe directo],
    metas,
    COUNT(*) as Cantidad,
    STRING_AGG(CAST(ID_METAS AS VARCHAR), ', ') as IDs_Encontrados
FROM tp_MetasTecnicos
WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01'
GROUP BY 
    [Número de Identificación],
    FORMAT(Mes, 'yyyy-MM-dd'),
    [Jefe directo],
    metas
HAVING COUNT(*) > 1
ORDER BY [Número de Identificación];

-- 3.2. Resumen final de diciembre 2025 después de limpieza
SELECT 
    'DICIEMBRE 2025 (DESPUÉS DE LIMPIEZA)' as Periodo,
    COUNT(*) as Total_Registros,
    COUNT(DISTINCT [Número de Identificación]) as Tecnicos_Unicos,
    COUNT(DISTINCT [Jefe directo]) as Jefes_Unicos,
    SUM(CASE WHEN metas = 'SME' THEN 1 ELSE 0 END) as Registros_SME,
    SUM(CASE WHEN metas = 'SOHO' THEN 1 ELSE 0 END) as Registros_SOHO
FROM tp_MetasTecnicos
WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01';

-- 3.3. Mostrar registros únicos de diciembre 2025
SELECT 
    ID_METAS,
    FORMAT(Mes, 'yyyy-MM-dd') as Fecha,
    [Número de Identificación],
    Nombre + ' ' + [Apellido Paterno] as Nombre_Tecnico,
    [Jefe directo],
    metas,
    DOTACION,
    [Modelo facturacion]
FROM tp_MetasTecnicos
WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01'
ORDER BY 
    [Jefe directo],
    [Número de Identificación];

-- =====================================================
-- PASO 4: COMPARATIVA ANTES/DESPUÉS
-- =====================================================

-- Si se hizo backup antes, comparar con la tabla original
-- SELECT 
--     'ANTES' as Estado,
--     COUNT(*) as Total_Registros
-- FROM tp_MetasTecnicos_backup_20260106
-- WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01'
-- UNION ALL
-- SELECT 
--     'DESPUÉS' as Estado,
--     COUNT(*) as Total_Registros
-- FROM tp_MetasTecnicos
-- WHERE Mes >= '2025-12-01' AND Mes < '2026-01-01';

-- =====================================================
-- RESUMEN DE ACCIONES PARA DICIEMBRE 2025
-- =====================================================

SELECT 
    '========================================' as Linea
UNION ALL
SELECT 
    'RESUMEN - DICIEMBRE 2025'
UNION ALL
SELECT 
    '========================================'
UNION ALL
SELECT 
    '1. Ejecutar PASO 1 (Verificación)'
UNION ALL
SELECT 
    '2. Revisar todos los resultados del PASO 1'
UNION ALL
SELECT 
    '3. Aprobar los duplicados a eliminar'
UNION ALL
SELECT 
    '4. Ejecutar PASO 2 (Eliminación)'
UNION ALL
SELECT 
    '5. Ejecutar PASO 3 (Verificación)'
UNION ALL
SELECT 
    '6. Verificar que el query 3.1 retorne 0 filas'
UNION ALL
SELECT 
    ''
UNION ALL
SELECT 
    'RESULTADO ESPERADO:'
UNION ALL
SELECT 
    '- 0 duplicados en query 3.1'
UNION ALL
SELECT 
    '- Cada técnico debería tener 1 solo registro por combinación'
UNION ALL
SELECT 
    '========================================';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script trabaja SOLAMENTE con diciembre 2025
-- 2. Mantiene el registro con ID_METAS más alto
-- 3. Criterio de duplicidad: Mismo técnico + Mismo jefe + Mismo tipo de meta
-- 4. SE RECOMIENDA HACER BACKUP antes de ejecutar el DELETE
-- 5. Verificar TODOS los queries del PASO 1 antes de la eliminación
-- 6. El PASO 3 confirma que la limpieza fue exitosa
-- =====================================================

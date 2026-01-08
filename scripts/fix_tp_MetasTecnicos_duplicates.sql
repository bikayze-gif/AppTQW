-- =====================================================
-- SCRIPT PARA ELIMINAR REGISTROS DUPLICADOS EN tp_MetasTecnicos
-- =====================================================
-- Fecha: 06-01-2026
-- Descripción: Elimina registros duplicados por MES manteniendo solo el ID_METAS más alto
-- Criterio de duplicidad: Mismo técnico + Mismo mes + Mismo jefe directo + Mismo tipo de meta

-- =====================================================
-- PASO 1: BACKUP DE SEGURIDAD
-- =====================================================
-- Crear tabla de respaldo antes de eliminar duplicados
-- DESCOMENTAR LA SIGUIENTE LÍNEA PARA HACER BACKUP:
-- SELECT * INTO tp_MetasTecnicos_backup_20260106 FROM tp_MetasTecnicos

-- =====================================================
-- PASO 2: ANÁLISIS - Ver duplicados por mes
-- =====================================================

-- 2.1. Contar duplicados por cada mes
SELECT 
    FORMAT(Mes, 'yyyy-MM') as Mes,
    COUNT(DISTINCT [Número de Identificación]) as Tecnicos_Con_Duplicados,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM tp_MetasTecnicos t2 
        WHERE t2.[Número de Identificación] = t1.[Número de Identificación]
          AND t2.Mes = t1.Mes
          AND t2.[Jefe directo] = t1.[Jefe directo]
          AND t2.metas = t1.metas
          AND t2.ID_METAS > t1.ID_METAS
    ) THEN 1 ELSE 0 END) as Total_Registros_Duplicados_Eliminar
FROM tp_MetasTecnicos t1
GROUP BY FORMAT(Mes, 'yyyy-MM')
ORDER BY Mes;

-- 2.2. Mostrar los duplicados específicos que serán eliminados
-- Por mes, técnico, jefe directo y tipo de meta
SELECT 
    t1.ID_METAS,
    FORMAT(t1.Mes, 'yyyy-MM') as Mes,
    t1.[Número de Identificación],
    t1.Nombre,
    t1.[Jefe directo],
    t1.metas,
    t1.DOTACION,
    'SE ELIMINARÁ' as Accion
FROM tp_MetasTecnicos t1
WHERE EXISTS (
    SELECT 1 
    FROM tp_MetasTecnicos t2
    WHERE t2.[Número de Identificación] = t1.[Número de Identificación]
      AND t2.Mes = t1.Mes
      AND t2.[Jefe directo] = t1.[Jefe directo]
      AND t2.metas = t1.metas
      AND t2.ID_METAS > t1.ID_METAS
)
ORDER BY 
    t1.Mes,
    t1.[Número de Identificación],
    t1.ID_METAS;

-- =====================================================
-- PASO 3: ELIMINACIÓN DE DUPLICADOS
-- =====================================================
-- Ejecutar SOLO después de verificar los resultados anteriores
-- Este query elimina los duplicados, manteniendo el ID_METAS más alto para cada combinación

-- PARA EJECUTAR LA ELIMINACIÓN, DESCOMENTAR LAS SIGUIENTES LÍNEAS:
-- DELETE FROM tp_MetasTecnicos
-- WHERE EXISTS (
--     SELECT 1 
--     FROM tp_MetasTecnicos t2
--     WHERE t2.[Número de Identificación] = tp_MetasTecnicos.[Número de Identificación]
--       AND t2.Mes = tp_MetasTecnicos.Mes
--       AND t2.[Jefe directo] = tp_MetasTecnicos.[Jefe directo]
--       AND t2.metas = tp_MetasTecnicos.metas
--       AND t2.ID_METAS > tp_MetasTecnicos.ID_METAS
-- );

-- =====================================================
-- PASO 4: VERIFICACIÓN FINAL
-- =====================================================

-- 4.1. Verificar que ya no existen duplicados
-- Debería retornar 0 filas si la eliminación fue exitosa
SELECT 
    FORMAT(Mes, 'yyyy-MM') as Mes,
    [Número de Identificación],
    [Jefe directo],
    metas,
    COUNT(*) as Cantidad,
    STRING_AGG(CAST(ID_METAS AS VARCHAR), ', ') as IDs_Encontrados
FROM tp_MetasTecnicos
GROUP BY 
    FORMAT(Mes, 'yyyy-MM'),
    [Número de Identificación],
    [Jefe directo],
    metas
HAVING COUNT(*) > 1
ORDER BY Mes, [Número de Identificación];

-- 4.2. Resumen de registros por mes después de la limpieza
SELECT 
    FORMAT(Mes, 'yyyy-MM') as Mes,
    COUNT(*) as Total_Registros,
    COUNT(DISTINCT [Número de Identificación]) as Tecnicos_Unicos,
    COUNT(DISTINCT [Jefe directo]) as Jefes_Unicos
FROM tp_MetasTecnicos
GROUP BY FORMAT(Mes, 'yyyy-MM')
ORDER BY Mes;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Este script elimina duplicados MANTENIENDO el registro con ID_METAS más alto
-- 2. La unicidad se considera POR MES: mismo técnico + mismo mes + mismo jefe + mismo tipo de meta
-- 3. SE RECOMIENDA HACER BACKUP antes de ejecutar el DELETE
-- 4. Ejecutar los queries de verificación (Paso 2) antes de la eliminación
-- 5. Verificar resultados finales (Paso 4) después de la eliminación
-- =====================================================

-- =====================================================
-- SCRIPT PARA PREVENIR FUTUROS DUPLICADOS EN tp_MetasTecnicos
-- =====================================================
-- Fecha: 06-01-2026
-- Descripción: Agrega una restricción UNIQUE para prevenir duplicados
-- Criterio de unicidad: Mismo técnico + Mismo mes + Mismo jefe directo + Mismo tipo de meta

-- =====================================================
-- PASO 1: LIMPIEZA DE DUPLICADOS EXISTENTES
-- =====================================================
-- IMPORTANTE: Ejecutar primero el script fix_tp_MetasTecnicos_duplicates.sql
-- para eliminar los duplicados existentes antes de crear la restricción

-- Verificar si existen duplicados antes de crear la restricción
SELECT 
    'EXISTEN DUPLICADOS - Debes eliminarlos primero' as Mensaje,
    COUNT(*) as Cantidad_Duplicados
FROM (
    SELECT 
        [Número de Identificación],
        Mes,
        [Jefe directo],
        metas,
        COUNT(*) as cnt
    FROM tp_MetasTecnicos
    GROUP BY 
        [Número de Identificación],
        Mes,
        [Jefe directo],
        metas
    HAVING COUNT(*) > 1
) as duplicados;

-- =====================================================
-- PASO 2: ELIMINAR RESTRICCIÓN EXISTENTE (si existe)
-- =====================================================

-- Verificar si ya existe una restricción con el mismo nombre
SELECT 
    name as Nombre_Restriccion,
    type_desc as Tipo,
    is_disabled as Esta_Deshabilitada
FROM sys.objects
WHERE parent_object_id = OBJECT_ID('tp_MetasTecnicos')
  AND type = 'UQ'
  AND name = 'UQ_tp_MetasTecnicos_UniqueTecnicoMes';

-- Si existe la restricción, eliminarla (descomentar si es necesario)
-- ALTER TABLE tp_MetasTecnicos
-- DROP CONSTRAINT IF EXISTS UQ_tp_MetasTecnicos_UniqueTecnicoMes;

-- =====================================================
-- PASO 3: CREAR RESTRICCIÓN ÚNICA
-- =====================================================
-- Esta restricción previene futuros duplicados
-- Combinación única: Número de Identificación + Mes + Jefe directo + metas

ALTER TABLE tp_MetasTecnicos
ADD CONSTRAINT UQ_tp_MetasTecnicos_UniqueTecnicoMes
UNIQUE NONCLUSTERED (
    [Número de Identificación],
    Mes,
    [Jefe directo],
    metas
);

-- =====================================================
-- PASO 4: VERIFICACIÓN
-- =====================================================

-- 4.1. Verificar que la restricción fue creada exitosamente
SELECT 
    name as Nombre_Restriccion,
    type_desc as Tipo,
    create_date as Fecha_Creacion,
    is_disabled as Esta_Deshabilitada
FROM sys.objects
WHERE parent_object_id = OBJECT_ID('tp_MetasTecnicos')
  AND type = 'UQ'
  AND name = 'UQ_tp_MetasTecnicos_UniqueTecnicoMes';

-- 4.2. Mostrar todas las restricciones de la tabla
SELECT 
    t.name as Nombre_Tabla,
    c.name as Nombre_Restriccion,
    c.type_desc as Tipo,
    c.create_date as Fecha_Creacion,
    c.is_disabled as Esta_Deshabilitada,
    'Campos: ' + STUFF((
        SELECT ', ' + COL_NAME(ac.name)
        FROM sys.index_columns ic
        INNER JOIN sys.all_columns ac 
            ON ic.object_id = ac.object_id 
            AND ic.column_id = ac.column_id
        WHERE ic.object_id = c.object_id 
          AND ic.index_id = c.object_id
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') as Campos_Incluidos
FROM sys.tables t
INNER JOIN sys.objects c 
    ON t.object_id = c.parent_object_id
WHERE t.name = 'tp_MetasTecnicos'
  AND c.type IN ('UQ', 'PK')
ORDER BY 
    CASE WHEN c.type = 'PK' THEN 0 ELSE 1 END,
    c.name;

-- =====================================================
-- PASO 5: PRUEBA DE INSERCIÓN (OPCIONAL)
-- =====================================================
-- Intentar insertar un duplicado debería fallar
-- Descomentar para probar:

-- BEGIN TRY
--     INSERT INTO tp_MetasTecnicos (
--         [Número de Identificación],
--         Mes,
--         Nombre,
--         [Apellido Paterno],
--         [Apellido Materno],
--         [Email Corporativo],
--         Posición,
--         Unidad,
--         [Descriptor de Cargo],
--         [Jefe directo],
--         metas,
--         [Modelo facturacion],
--         DOTACION
--     )
--     SELECT TOP 1 
--         [Número de Identificación],
--         Mes,
--         Nombre,
--         [Apellido Paterno],
--         [Apellido Materno],
--         [Email Corporativo],
--         Posición,
--         Unidad,
--         [Descriptor de Cargo],
--         [Jefe directo],
--         metas,
--         [Modelo facturacion],
--         DOTACION
--     FROM tp_MetasTecnicos;
--     PRINT 'ERROR: La prueba no debería funcionar - existen duplicados';
-- END TRY
-- BEGIN CATCH
--     PRINT 'EXITOSO: La restricción está funcionando correctamente';
--     PRINT 'Mensaje de error: ' + ERROR_MESSAGE();
-- END CATCH

-- =====================================================
-- PASO 6: DOCUMENTACIÓN DE LA SOLUCIÓN
-- =====================================================
-- Mostrar resumen de la solución implementada

SELECT 
    '===================================================' as Linea
UNION ALL
SELECT 
    'SOLUCIÓN IMPLEMENTADA PARA tp_MetasTecnicos'
UNION ALL
SELECT 
    '==================================================='
UNION ALL
SELECT 
    'RESTRICCIÓN ÚNICA AGREGADA:'
UNION ALL
SELECT 
    '- Número de Identificación'
UNION ALL
SELECT 
    '- Mes'
UNION ALL
SELECT 
    '- Jefe directo'
UNION ALL
SELECT 
    '- metas'
UNION ALL
SELECT 
    ''
UNION ALL
SELECT 
    'EFECTO:'
UNION ALL
SELECT 
    '- Previene futuros duplicados por técnico y mes'
UNION ALL
SELECT 
    '- Cualquier intento de insertar duplicado fallará'
UNION ALL
SELECT 
    '- El mensaje de error indicará la restricción violada'
UNION ALL
SELECT 
    ''
UNION ALL
SELECT 
    'NOTAS:'
UNION ALL
SELECT 
    '- La restricción se aplica POR MES'
UNION ALL
SELECT 
    '- Permite mismo técnico en diferentes meses'
UNION ALL
SELECT 
    '- Permite mismo técnico con diferentes jefe/metas en el mismo mes'
UNION ALL
SELECT 
    '===================================================';

-- =====================================================
-- INSTRUCCIONES PARA ELIMINAR ESTA RESTRICCIÓN (si es necesario)
-- =====================================================
-- ALTER TABLE tp_MetasTecnicos
-- DROP CONSTRAINT UQ_tp_MetasTecnicos_UniqueTecnicoMes;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

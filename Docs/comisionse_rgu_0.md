
● 🔍 ANÁLISIS COMPLETO - SP_CREATE_NDC_PRODUCCION

  He identificado exactamente dónde y por qué se produce el error de duplicidad. Aquí está el análisis completo:

  ---
  1. 📍 UBICACIÓN EXACTA DEL PROBLEMA

  Archivo: SP_CREATE_NDC_PRODUCCION
  Línea problemática: En el LEFT JOIN prm_tecnico (aproximadamente línea 120-130 del SP)        

  LEFT JOIN (
      SELECT row_id,
          [Mes], [Número de Identificación], [Nombre], [Apellido Paterno], [Apellido Materno], [Email Corporativo],
          [Posición], [Unidad], [Descriptor de Cargo], [Jefe directo], [metas], [Modelo facturacion]
      FROM (
          SELECT ROW_NUMBER() OVER (PARTITION BY [Número de Identificación] ORDER BY mes DESC) AS row_id,
              [Mes], [Número de Identificación], [Nombre], [Apellido Paterno], [Apellido Materno], [Email Corporativo],
              [Posición], [Unidad], [Descriptor de Cargo], [Jefe directo], [metas], [Modelo facturacion]
          FROM tp_MetasTecnicos tmt
      ) a
      WHERE row_id = 1
  ) prm_tecnico ON prm_tecnico.[Número de identificación] = tut.rut

  ---
  2. 🐛 CAUSA RAÍZ

  Hay registros DUPLICADOS en la tabla tp_MetasTecnicos

  Ejemplo con el técnico del registro 1-3H2FQBMP:

  | Número de Identificación | Mes        | Jefe directo | metas |
  |--------------------------|------------|--------------|-------|
  | 20139488-0               | 2025-12-01 | ARJONA       | SOHO  |
  | 20139488-0               | 2025-12-01 | ARJONA       | SOHO  |

  Problema con ROW_NUMBER():Cuando hay duplicados con el MISMO mes, ROW_NUMBER() OVER (PARTITION BY [Número de Identificación] ORDER BY mes DESC) asigna row_id = 1 a AMBOS registros porque tienen la misma fecha.

  Resultado: AMBOS pasan el filtro WHERE row_id = 1, causando un producto cartesiano que duplica los registros en ProduccionNDC.

  Impacto:

  - Al menos 19 técnicos tienen duplicados en noviembre 2025
  - Cada orden de estos técnicos se duplica en ProduccionNDC
  - 341 registros duplicados de 950 totales (35.9%)

  ---
  3. 🔬 SIMULACIÓN DEL PROBLEMA

  Entrada (tb_paso_produccion_new):

  Orden: 1-3H2FQBMP
  Trabajo: Alta FTTH Internet con ONT
  Producto: Gateway NextGen Wifi
  → 1 registro

  Después del JOIN con tp_MetasTecnicos:

  → 2 registros (uno por cada duplicado en tp_MetasTecnicos)

  Resultado en ProduccionNDC:

  - Registro 1: 77 puntos (correcto)
  - Registro 2: 0 puntos (duplicado del JOIN)

  ---
  4. ✅ SOLUCIONES

  Opción 1: CORREGIR tp_MetasTecnicos (RECOMENDADO)

  -- Eliminar duplicados en tp_MetasTecnicos
  WITH CTE_Duplicados AS (
      SELECT
          ROW_NUMBER() OVER (
              PARTITION BY [Número de Identificación], [Mes]
              ORDER BY [Mes] DESC
          ) AS rn,
          *
      FROM tp_MetasTecnicos
  )
  DELETE FROM CTE_Duplicados WHERE rn > 1;

  Opción 2: MEJORAR EL SPAgregar un criterio de desempate en el ROW_NUMBER():

  -- CAMBIAR ESTO:
  ROW_NUMBER() OVER (PARTITION BY [Número de Identificación] ORDER BY mes DESC)

  -- POR ESTO:
  ROW_NUMBER() OVER (
      PARTITION BY [Número de Identificación], [Mes]
      ORDER BY mes DESC, [Jefe directo], [Nombre]
  )

  Opción 3: USAR TOP 1 WITH TIES

  LEFT JOIN (
      SELECT TOP 1 WITH TIES *
      FROM tp_MetasTecnicos tmt
      WHERE [Número de Identificación] = tut.rut
      ORDER BY ROW_NUMBER() OVER (PARTITION BY [Número de Identificación], [Mes] ORDER BY (SELECT NULL))
  ) prm_tecnico ON prm_tecnico.[Número de identificación] = tut.rut

  ---
  5. 🩹 SOLUCIÓN INMEDIATA - Limpiar duplicados en ProduccionNDC

  -- Eliminar duplicados manteniendo los que tienen puntos > 0
  WITH CTE_Duplicados AS (
      SELECT
          Orden,
          [Orden empaq#],
          Trabajo,
          producto,
          Ptos_referencial,
          ROW_NUMBER() OVER (
              PARTITION BY Orden, [Orden empaq#], Trabajo, producto
              ORDER BY CASE WHEN Ptos_referencial > 0 THEN 0 ELSE 1 END
          ) AS rn
      FROM ProduccionNDC
      WHERE mes_contable >= '2026-01-01'
  )
  DELETE FROM ProduccionNDC
  WHERE mes_contable >= '2026-01-01'
    AND EXISTS (
      SELECT 1 FROM CTE_Duplicados
      WHERE CTE_Duplicados.Orden = ProduccionNDC.Orden
        AND CTE_Duplicados.[Orden empaq#] = ProduccionNDC.[Orden empaq#]
        AND CTE_Duplicados.Trabajo = ProduccionNDC.Trabajo
        AND CTE_Duplicados.producto = ProduccionNDC.producto
        AND rn > 1
    );

  ---
  6. 📊 RESUMEN EJECUTIVO

  | Aspecto                 | Detalle                                                     |     
  |-------------------------|-------------------------------------------------------------|     
  | Problema                | Duplicados en tp_MetasTecnicos causan productos cartesianos |     
  | Registros afectados     | 231 de 950 con valor 0 (24.3%)                              |     
  | Técnicos con duplicados | Al menos 19 técnicos confirmados                            |     
  | Solución recomendada    | Opción 1: Limpiar tp_MetasTecnicos                          |     
  | Solución alternativa    | Opción 2: Mejorar ROW_NUMBER() en el SP                     |     
  | Acción inmediata        | Ejecutar script de limpieza de ProduccionNDC                |     

  ¿Necesitas que ejecute alguna de estas soluciones o prefieres revisar el código del SP modificado?



  ● 🔍 REPORTE FINAL - ANÁLISIS COMPLETO DEL PROBLEMA

  📋 RESUMEN EJECUTIVO

  ✅ Problema IDENTIFICADO: La tabla TP_PTOS_23_NEW contiene LLAVES DUPLICADAS que causan productos cartesianos en el JOIN del Stored Procedure.

  ---
  🎯 CASOS ANALIZADOS

  CASO 1: Orden 1-3H2FQBMP

  Datos en tb_paso_produccion_new:
  | Registro | Orden empaq# | Trabajo                    | Producto             | Estado           
   |
  |----------|--------------|----------------------------|----------------------|---------------------|
  | 1        | 0            | Access Points (Extensor)   | Extensor Smart Desk  | PGSC ✅          
   |
  | 2        | 1-3H2FQBMP   | Alta FTTH Internet con ONT | Equipo               | EMPQ ❌ (se filtra) |
  | 3        | 1-3H2FQBMP   | Alta FTTH Internet con ONT | Gateway NextGen Wifi | PGSC ✅          
   |

  Llave generada por el SP para el Registro 3:
  Concatenación: FTTH + Alta FTTH  Internet   con ONT + Gateway NextGen Wifi + Normal + NORMAL     
  = FTTHAlta FTTH  Internet   con ONTGateway NextGen WifiNormalNORMAL

  After REPLACE(' ', ''):
  = FTTHAltaFTTHInternetconONTGatewayNextGenWifiNormalNORMAL

  MATCH en TP_PTOS_23_NEW: ❌ ¡DUPLICADO!

  | LLAVE (original)                                                  | Puntos | LLAVE (después de REPLACE)                               |
  |-------------------------------------------------------------------|--------|----------------------------------------------------------|
  | FTTHAlta FTTH  Internet   con ONTGateway NextGen WifiNormalNORMAL | 77 ✅  | FTTHAltaFTTHInternetconONTGatewayNextGenWifiNormalNORMAL |
  | FTTHAltaFTTHInternetconONTGatewayNextGenWifiNormalNORMAL          | 0 ❌   | FTTHAltaFTTHInternetconONTGatewayNextGenWifiNormalNORMAL |

  Resultado: El JOIN retorna 2 filas para la MISMA orden:
  - Una con 77 puntos
  - Otra con 0 puntos

  ---
  🔬 CAUSA RAÍZ

  El problema está en TP_PTOS_23_NEW:

  Hay registros duplicados que solo se diferencian por los ESPACIOS en el campo llave:

  -- Registro con puntos CORRECTOS (77)
  INSERT: 'FTTHAlta FTTH  Internet   con ONTGateway NextGen WifiNormalNORMAL'

  -- Registro con puntos INCORRECTOS (0) - DUPLICADO
  INSERT: 'FTTHAltaFTTHInternetconONTGatewayNextGenWifiNormalNORMAL'

  ¿Por qué el JOIN crea duplicados?

  El Stored Procedure hace:
  LEFT JOIN TP_PTOS_23_NEW tpPtos
  ON REPLACE(CONCAT(pro.[Tipo red], pro.Trabajo, pro.Producto, pro.[Clase vivienda], pro.[Tipo vivienda]), ' ', '')
  = REPLACE(tpPtos.LLAVE, ' ', '')

  Cuando ambas llaves se procesan con REPLACE(' ', ''), se vuelven IDÉNTICAS, causando un producto cartesiano que retorna 2 filas en lugar de 1.

  ---
  📊 IMPACTO

  | Métrica                        | Valor       |
  |--------------------------------|-------------|
  | Total registros periodo 202601 | 1,123       |
  | Registros únicos               | 721         |
  | Registros duplicados           | 402 (35.8%) |
  | Registros con 0 puntos         | 268 (23.9%) |

  ---
  ✅ SOLUCIÓN PROPUESTA

  Opción 1: Corregir TP_PTOS_23_NEW (RECOMENDADO)

  Eliminar los registros con llaves que tienen 0 puntos y que son duplicados de llaves con puntos correctos:

  -- Eliminar llaves duplicadas que tienen 0 puntos
  DELETE FROM TP_PTOS_23_NEW
  WHERE PuntosTQWOct23 = '0'
    AND llave IN (
      SELECT llave
      FROM TP_PTOS_23_NEW
      WHERE PuntosTQWOct23 = '0'
      GROUP BY llave
      HAVING COUNT(*) > 1
    );

  Opción 2: Modificar el SP para usar TOP 1

  Cambiar el JOIN para que solo retorne 1 registro:

  L
  EFT JOIN (
      SELECT TOP 1 WITH TIES *
      FROM TP_PTOS_23_NEW
      WHERE llave = ...
      ORDER BY PuntosTQWOct23 DESC
  ) tpPtos ON ...

  Opción 3: Crear índice único en TP_PTOS_23_NEW

  Prevenir futuros duplicados:

  ALTER TABLE TP_PTOS_23_NEW
  ADD CONSTRAINT UQ_TP_PTOS_LLAVE
  UNIQUE (REPLACE(llave, ' ', ''));

  ---
  🎯 RECOMENDACIÓN

  Ejecutar Opción 1 primero (limpieza de datos), luego Opción 3 (prevención), y finalmente ejecutar el SP nuevamente para regenerar ProduccionNDC sin duplicados.

  ¿Quieres que ejecute alguna de estas soluciones?
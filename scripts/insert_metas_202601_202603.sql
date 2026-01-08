/*
================================================================================
SCRIPT DE INSERCIÓN DE METAS DE PRODUCCIÓN Y CALIDAD
Períodos: 202601, 202602, 202603
Tabla: TP_META_GEO_2023_V3
================================================================================

ESTRUCTURA DE LA TABLA:
- Zona: varchar (Zona geográfica: ZMSU, ZMPO, ZMOR, ZCEN)
- Meta: float (Valor de la meta - Producción o Calidad)
- Tipo: varchar (Junior o Senior)
- Categoria: varchar (Produccion o Calidad)
- PERIODO: varchar (Formato: YYYYMM)
- modelo_turno: varchar (6x1 o 5x2)
- id_uniq: int (ID único autoincremental - NO INSERTAR)
- tipoRed_meta: varchar (HFC o FTTH)

DATOS EXTRAÍDOS DE LA IMAGEN:
- Período 202601 (ENERO 2026): Primera fila de cada tabla
- Períodos 202602 y 202603 (FEBRERO-MARZO 2026): Segunda fila de cada tabla
- Ambos turnos (6x1 y 5x2) tienen los mismos valores
- Ambos tipos (Junior y Senior) deben tener los mismos valores
*/

use telqway;

-- ============================================================================
-- PERÍODO 202601 (ENERO 2026)
-- ============================================================================

-- HFC - TURNO 6x1 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'HFC'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'HFC');

-- HFC - TURNO 6x1 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0505, 'Junior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZMSU', 0.0505, 'Senior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZMPO', 0.0667, 'Junior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZMPO', 0.0667, 'Senior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZMOR', 0.1081, 'Junior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZMOR', 0.1081, 'Senior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZCEN', 0.0762, 'Junior', 'Calidad', '202601', '6x1', 'HFC'),
    ('ZCEN', 0.0762, 'Senior', 'Calidad', '202601', '6x1', 'HFC');

-- FTTH - TURNO 6x1 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202601', '6x1', 'FTTH'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202601', '6x1', 'FTTH');

-- FTTH - TURNO 6x1 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.1070, 'Junior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZMSU', 0.1070, 'Senior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZMPO', 0.1110, 'Junior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZMPO', 0.1110, 'Senior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZMOR', 0.1490, 'Junior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZMOR', 0.1490, 'Senior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZCEN', 0.1100, 'Junior', 'Calidad', '202601', '6x1', 'FTTH'),
    ('ZCEN', 0.1100, 'Senior', 'Calidad', '202601', '6x1', 'FTTH');

-- HFC - TURNO 5x2 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'HFC'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'HFC');

-- HFC - TURNO 5x2 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0505, 'Junior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZMSU', 0.0505, 'Senior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZMPO', 0.0667, 'Junior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZMPO', 0.0667, 'Senior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZMOR', 0.1081, 'Junior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZMOR', 0.1081, 'Senior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZCEN', 0.0762, 'Junior', 'Calidad', '202601', '5x2', 'HFC'),
    ('ZCEN', 0.0762, 'Senior', 'Calidad', '202601', '5x2', 'HFC');

-- FTTH - TURNO 5x2 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202601', '5x2', 'FTTH'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202601', '5x2', 'FTTH');

-- FTTH - TURNO 5x2 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.1070, 'Junior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZMSU', 0.1070, 'Senior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZMPO', 0.1110, 'Junior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZMPO', 0.1110, 'Senior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZMOR', 0.1490, 'Junior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZMOR', 0.1490, 'Senior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZCEN', 0.1100, 'Junior', 'Calidad', '202601', '5x2', 'FTTH'),
    ('ZCEN', 0.1100, 'Senior', 'Calidad', '202601', '5x2', 'FTTH');

-- ============================================================================
-- PERÍODO 202602 (FEBRERO 2026)
-- ============================================================================

-- HFC - TURNO 6x1 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'HFC'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'HFC');

-- HFC - TURNO 6x1 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0714, 'Junior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZMSU', 0.0714, 'Senior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZMPO', 0.0714, 'Junior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZMPO', 0.0714, 'Senior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZMOR', 0.0769, 'Junior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZMOR', 0.0769, 'Senior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZCEN', 0.0588, 'Junior', 'Calidad', '202602', '6x1', 'HFC'),
    ('ZCEN', 0.0588, 'Senior', 'Calidad', '202602', '6x1', 'HFC');

-- FTTH - TURNO 6x1 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202602', '6x1', 'FTTH'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202602', '6x1', 'FTTH');

-- FTTH - TURNO 6x1 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0670, 'Junior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZMSU', 0.0670, 'Senior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZMPO', 0.0690, 'Junior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZMPO', 0.0690, 'Senior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZMOR', 0.0882, 'Junior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZMOR', 0.0882, 'Senior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZCEN', 0.0652, 'Junior', 'Calidad', '202602', '6x1', 'FTTH'),
    ('ZCEN', 0.0652, 'Senior', 'Calidad', '202602', '6x1', 'FTTH');

-- HFC - TURNO 5x2 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'HFC'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'HFC');

-- HFC - TURNO 5x2 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0714, 'Junior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZMSU', 0.0714, 'Senior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZMPO', 0.0714, 'Junior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZMPO', 0.0714, 'Senior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZMOR', 0.0769, 'Junior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZMOR', 0.0769, 'Senior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZCEN', 0.0588, 'Junior', 'Calidad', '202602', '5x2', 'HFC'),
    ('ZCEN', 0.0588, 'Senior', 'Calidad', '202602', '5x2', 'HFC');

-- FTTH - TURNO 5x2 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202602', '5x2', 'FTTH'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202602', '5x2', 'FTTH');

-- FTTH - TURNO 5x2 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0670, 'Junior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZMSU', 0.0670, 'Senior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZMPO', 0.0690, 'Junior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZMPO', 0.0690, 'Senior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZMOR', 0.0882, 'Junior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZMOR', 0.0882, 'Senior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZCEN', 0.0652, 'Junior', 'Calidad', '202602', '5x2', 'FTTH'),
    ('ZCEN', 0.0652, 'Senior', 'Calidad', '202602', '5x2', 'FTTH');

-- ============================================================================
-- PERÍODO 202603 (MARZO 2026)
-- ============================================================================

-- HFC - TURNO 6x1 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'HFC'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'HFC');

-- HFC - TURNO 6x1 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0714, 'Junior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZMSU', 0.0714, 'Senior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZMPO', 0.0714, 'Junior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZMPO', 0.0714, 'Senior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZMOR', 0.0769, 'Junior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZMOR', 0.0769, 'Senior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZCEN', 0.0588, 'Junior', 'Calidad', '202603', '6x1', 'HFC'),
    ('ZCEN', 0.0588, 'Senior', 'Calidad', '202603', '6x1', 'HFC');

-- FTTH - TURNO 6x1 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202603', '6x1', 'FTTH'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202603', '6x1', 'FTTH');

-- FTTH - TURNO 6x1 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0670, 'Junior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZMSU', 0.0670, 'Senior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZMPO', 0.0690, 'Junior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZMPO', 0.0690, 'Senior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZMOR', 0.0882, 'Junior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZMOR', 0.0882, 'Senior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZCEN', 0.0652, 'Junior', 'Calidad', '202603', '6x1', 'FTTH'),
    ('ZCEN', 0.0652, 'Senior', 'Calidad', '202603', '6x1', 'FTTH');

-- HFC - TURNO 5x2 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'HFC'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'HFC');

-- HFC - TURNO 5x2 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0714, 'Junior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZMSU', 0.0714, 'Senior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZMPO', 0.0714, 'Junior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZMPO', 0.0714, 'Senior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZMOR', 0.0769, 'Junior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZMOR', 0.0769, 'Senior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZCEN', 0.0588, 'Junior', 'Calidad', '202603', '5x2', 'HFC'),
    ('ZCEN', 0.0588, 'Senior', 'Calidad', '202603', '5x2', 'HFC');

-- FTTH - TURNO 5x2 - PRODUCCIÓN
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZMSU', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZMPO', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZMPO', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZMOR', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZMOR', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZCEN', 4.0, 'Junior', 'Produccion', '202603', '5x2', 'FTTH'),
    ('ZCEN', 4.0, 'Senior', 'Produccion', '202603', '5x2', 'FTTH');

-- FTTH - TURNO 5x2 - CALIDAD
INSERT INTO TP_META_GEO_2023_V3 (Zona, Meta, Tipo, Categoria, PERIODO, modelo_turno, tipoRed_meta)
VALUES 
    ('ZMSU', 0.0670, 'Junior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZMSU', 0.0670, 'Senior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZMPO', 0.0690, 'Junior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZMPO', 0.0690, 'Senior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZMOR', 0.0882, 'Junior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZMOR', 0.0882, 'Senior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZCEN', 0.0652, 'Junior', 'Calidad', '202603', '5x2', 'FTTH'),
    ('ZCEN', 0.0652, 'Senior', 'Calidad', '202603', '5x2', 'FTTH');

-- ============================================================================
-- CONSULTAS DE VALIDACIÓN
-- ============================================================================

-- Verificar conteo de registros insertados
SELECT 
    PERIODO,
    COUNT(*) as Total_Registros
FROM TP_META_GEO_2023_V3
WHERE PERIODO IN ('202601', '202602', '202603')
GROUP BY PERIODO
ORDER BY PERIODO;

-- Verificar datos por zona, tipo de red y turno
SELECT 
    PERIODO,
    Zona,
    tipoRed_meta,
    modelo_turno,
    Tipo,
    Categoria,
    Meta
FROM TP_META_GEO_2023_V3
WHERE PERIODO IN ('202601', '202602', '202603')
ORDER BY PERIODO, tipoRed_meta, modelo_turno, Zona, Categoria, Tipo;

-- Verificar totales esperados
-- Debería haber 64 registros por período (4 zonas × 2 tipos de red × 2 turnos × 2 categorías × 2 tipos)
SELECT 
    'Total esperado por período' as Descripcion,
    64 as Esperado,
    COUNT(*) / 3 as Real
FROM TP_META_GEO_2023_V3
WHERE PERIODO IN ('202601', '202602', '202603');

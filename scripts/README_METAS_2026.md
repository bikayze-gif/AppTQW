# Resumen de Transformación de Datos - Metas de Producción 2026

## 📋 Archivos Generados

### 1. **analyze_meta_geo_table.py**
Script de Python para analizar la estructura de la tabla `TP_META_GEO_2023_V3`.

**Ubicación:** `c:\Users\pc\Documents\GitHub\AppTQW\scripts\analyze_meta_geo_table.py`

**Ejecución:**
```bash
py scripts\analyze_meta_geo_table.py
```

### 2. **insert_metas_202601_202603.sql**
Script SQL con todas las sentencias INSERT para los períodos 202601, 202602 y 202603.

**Ubicación:** `c:\Users\pc\Documents\GitHub\AppTQW\scripts\insert_metas_202601_202603.sql`

## 📊 Estructura de la Tabla TP_META_GEO_2023_V3

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Zona` | varchar | Zona geográfica (ZMSU, ZMPO, ZMOR, ZCEN) |
| `Meta` | float | Valor de la meta (Producción o Calidad) |
| `Tipo` | varchar | Tipo de técnico (Junior o Senior) |
| `Categoria` | varchar | Categoría (Produccion o Calidad) |
| `PERIODO` | varchar | Período en formato YYYYMM |
| `modelo_turno` | varchar | Modelo de turno (6x1 o 5x2) |
| `id_uniq` | int | ID único (autoincremental - NO insertar) |
| `tipoRed_meta` | varchar | Tipo de red (HFC o FTTH) |

## 📈 Datos Extraídos de la Imagen

### Período 202601 (ENERO 2026)

#### HFC - Producción
- **Todas las zonas:** 4.0

#### HFC - Calidad
| Zona | Calidad |
|------|---------|
| ZMSU | 5.05% |
| ZMPO | 6.67% |
| ZMOR | 10.81% |
| ZCEN | 7.62% |

#### FTTH - Producción
- **Todas las zonas:** 4.0

#### FTTH - Calidad
| Zona | Calidad |
|------|---------|
| ZMSU | 10.70% |
| ZMPO | 11.10% |
| ZMOR | 14.90% |
| ZCEN | 11.00% |

### Períodos 202602 y 202603 (FEBRERO-MARZO 2026)

#### HFC - Producción
- **Todas las zonas:** 4.0

#### HFC - Calidad
| Zona | Calidad |
|------|---------|
| ZMSU | 7.14% |
| ZMPO | 7.14% |
| ZMOR | 7.69% |
| ZCEN | 5.88% |

#### FTTH - Producción
- **Todas las zonas:** 4.0

#### FTTH - Calidad
| Zona | Calidad |
|------|---------|
| ZMSU | 6.70% |
| ZMPO | 6.90% |
| ZMOR | 8.82% |
| ZCEN | 6.52% |

## 🔢 Resumen de Registros

**Total de registros a insertar:** 192

**Desglose por período:**
- Período 202601: 64 registros
- Período 202602: 64 registros
- Período 202603: 64 registros

**Desglose por registro:**
- 4 zonas (ZMSU, ZMPO, ZMOR, ZCEN)
- × 2 tipos de red (HFC, FTTH)
- × 2 turnos (6x1, 5x2)
- × 2 categorías (Produccion, Calidad)
- × 2 tipos de técnico (Junior, Senior)
- = **64 registros por período**

## ✅ Validación

El script SQL incluye consultas de validación al final:

### 1. Conteo por período
```sql
SELECT 
    PERIODO,
    COUNT(*) as Total_Registros
FROM TP_META_GEO_2023_V3
WHERE PERIODO IN ('202601', '202602', '202603')
GROUP BY PERIODO
ORDER BY PERIODO;
```

**Resultado esperado:**
- 202601: 64 registros
- 202602: 64 registros
- 202603: 64 registros

### 2. Verificación detallada
```sql
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
```

## 🚀 Próximos Pasos

1. **Revisar el script SQL** (`insert_metas_202601_202603.sql`)
2. **Ejecutar el script** en SQL Server Management Studio o tu herramienta preferida
3. **Ejecutar las consultas de validación** para verificar que los datos se insertaron correctamente
4. **Comparar los resultados** con los valores de la imagen original

## ⚠️ Notas Importantes

- Los valores de **Calidad** en la imagen están en porcentaje (ej: 5.05%), pero en la base de datos se almacenan como decimales (0.0505)
- Los períodos **202602** y **202603** tienen los mismos valores según la imagen
- Ambos turnos (**6x1** y **5x2**) tienen los mismos valores para cada período
- Ambos tipos de técnico (**Junior** y **Senior**) tienen los mismos valores para cada combinación

## 📞 Soporte

Si encuentras algún problema o necesitas ajustar algún valor, revisa:
1. La imagen original para verificar los valores
2. El script de análisis Python para entender la estructura
3. El script SQL para modificar los valores según sea necesario

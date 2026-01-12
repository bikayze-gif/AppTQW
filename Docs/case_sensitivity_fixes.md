# Correcciones de Case Sensitivity - Base de Datos MySQL

## Fecha: 2026-01-09

### Problema
MySQL en Linux es **case-sensitive** para nombres de tablas, mientras que en Windows no lo es. Esto causaba errores al migrar la aplicación al VPS.

### Tablas Corregidas

#### 1. `tb_logis_tecnico_solicitud`
- **Antes**: `TB_LOGIS_TECNICO_SOLICITUD`
- **Ubicaciones corregidas**:
  - Línea 796: `INSERT INTO` statement
  - Línea 857: `FROM` clause en `getMaterialSolicitudes()`

#### 2. `tb_calidad_naranja_base`
- **Antes**: `TB_CALIDAD_NARANJA_BASE`
- **Ubicaciones corregidas**:
  - Línea 1054: `FROM` clause en `getCalidadReactivaSummary()`
  - Línea 1115: `FROM` clause en `getCalidadReactivaDetails()`

#### 3. `produccion_ndc_rank_red`
- **Antes**: `PRODUCCION_NDC_RANK_Red`
- **Ubicaciones corregidas**:
  - Línea 1392: `FROM` clause en `getDetalleOtPeriods()`
  - Línea 1408: `FROM` clause en `getDetalleOtData()`

### Correcciones Adicionales de SQL

#### 4. ORDER BY con DISTINCT
- **Problema**: MySQL 8.0 no permite `ORDER BY` con columnas que no están en `SELECT` cuando se usa `DISTINCT`
- **Solución**: Cambiar `ORDER BY mes_contable DESC` → `ORDER BY periodo DESC`
- **Ubicaciones**:
  - Línea 1394: `getDetalleOtPeriods()`
  - Línea 1323: `getCalidadTqwPeriods()`

### Archivo Modificado
- `server/storage.ts`

### Total de Correcciones
- **4 tablas** corregidas
- **6 ubicaciones** modificadas
- **2 queries SQL** optimizadas

### Verificación
Todas las tablas ahora usan nombres en **minúsculas** que coinciden exactamente con los nombres en la base de datos MySQL en el VPS.

### Comando para Verificar
```bash
# Verificar que no queden referencias en mayúsculas
grep -rn 'FROM [A-Z]' server/storage.ts | grep -v 'FROM ('
```

Resultado esperado: Sin coincidencias (excepto nombres de columnas que pueden estar en mayúsculas).

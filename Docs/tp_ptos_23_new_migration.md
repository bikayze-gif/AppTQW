# Migración de Tabla tp_ptos_23_new

## Fecha: 2026-01-09 21:18

### Problema Detectado
La página **Settings/Parámetros** no cargaba datos porque la tabla `tp_ptos_23_new` estaba vacía en la base de datos migrada `operaciones_tqw_bkp`.

### Causa
Durante la migración inicial, la tabla fue creada pero los datos no fueron migrados (probablemente porque el script de migración la saltó o falló silenciosamente).

### Solución Aplicada

1. **Verificación del problema**:
   - Base de datos original (`operaciones_tqw`): **525 registros**
   - Base de datos migrada (`operaciones_tqw_bkp`): **0 registros**

2. **Migración de datos**:
   ```bash
   mysqldump -h 170.239.85.233 -u ncornejo -pN1c0l7as17 operaciones_tqw tp_ptos_23_new > /tmp/tp_ptos_23_new.sql
   mysql operaciones_tqw_bkp < /tmp/tp_ptos_23_new.sql
   ```

3. **Verificación post-migración**:
   - Base de datos migrada (`operaciones_tqw_bkp`): **525 registros** ✅

### Correcciones de Case Sensitivity Aplicadas

También se corrigieron los nombres de tablas en el schema de Drizzle:

#### `shared/schema.ts`
- **Línea 236**: `TB_LOGIS_TECNICO_SOLICITUD` → `tb_logis_tecnico_solicitud`
- **Línea 281**: `TP_PTOS_23_NEW` → `tp_ptos_23_new`

### Estructura de la Tabla

```sql
CREATE TABLE `tp_ptos_23_new` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Tipo red` text,
  `Trabajo` text,
  `Producto` text,
  `Clase vivienda` text,
  `Tipo vivienda` text,
  `llave` varchar(255),
  `PuntosVTROct2023` double,
  `PuntosTQWOct23` bigint,
  `Q actividad SSPP` double,
  `Q act. Servicio` double,
  `RGU` double,
  `Clasif_final` text,
  `Segmento` text,
  `llave_control` varchar(255) GENERATED ALWAYS AS (replace(`llave`,' ','')) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `llave_control` (`llave_control`)
)
```

### Estado Final
✅ **Tabla migrada**: 525 registros
✅ **Schema corregido**: Nombres en minúsculas
✅ **Aplicación reiniciada**: PID 50960
✅ **Funcionalidad**: Settings/Parámetros debería cargar correctamente

### API Endpoint
- **GET** `/api/points-parameters` - Obtiene todos los parámetros de puntos
- **PATCH** `/api/points-parameters/:id` - Actualiza un parámetro específico

### Página Frontend
- `client/src/pages/supervisor/settings/parametrico-puntaje.tsx`

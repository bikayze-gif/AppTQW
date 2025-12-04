# Mapping KPIs Dashboard - Activity Dashboard

## Resumen Ejecutivo

El documento presenta el mapeo completo entre los indicadores clave de rendimiento (KPIs) visualizados en el `activity_dashboard.php` y los campos correspondientes en la base de datos MySQL `operaciones_tqw`. El dashboard obtiene datos principalmente de la tabla `tb_tqw_comision_renew`.

**Tabla Principal**: `tb_tqw_comision_renew`  
**Período**: Formato YYYYMM (líneas 34-44)  
**Filtro Principal**: `RutTecnicoOrig` y `periodo` (línea 57)  
**Conexión**: MySQL Server 170.239.85.233:3306  

## Tabla Principal de Mapping KPIs

### 1. Información del Técnico

| KPI Interfaz | Campo MySQL | Transformación | Línea PHP |
|---------------|------------|----------------|------------|
| Técnico (nombre) | `NombreTecnico` | Texto directo, fallback 'Sin datos' | 852 |
| Zona | `Zona_Factura23` | Texto directo, fallback 'N/A' | 861 |
| Modelo Turno | `modelo_turno` | Texto directo, fallback 'N/A' | 869 |
| Categoría | `categoria` | Texto directo, fallback 'N/A' | 877 |
| Supervisor | `Supervisor` | Texto directo, fallback '' | 73 |

### 2. Comisiones (Base y Ponderadas)

| KPI Interfaz | Campo MySQL | Transformación | Línea PHP |
|---------------|------------|----------------|------------|
| Calculo HFC | `Comisión_HFC` | `intval()` + formato moneda `$` | 901 |
| Calculo FTTH | `Comisión_FTTH` | `intval()` + formato moneda `$` | 909 |
| Comisión HFC Ponderada | `Comisión_HFC_Ponderada` | `intval()` + formato moneda `$` | 935 |
| Comisión FTTH Ponderada | `Comisión_FTTH_Ponderada` | `intval()` + formato moneda `$` | 943 |
| Comisión Total | Calculado | Suma de comisiones HFC + FTTH ponderadas | 951 |

### 3. Producción (HFC y FTTH)

| KPI Interfaz | Campo MySQL | Transformación | Línea PHP |
|---------------|------------|----------------|------------|
| Puntos HFC | `Puntos` | `number_format(x, 0, ',', '.')` | 973 |
| Cantidad Días HFC | `Dias_Cantidad_HFC` | `intval()` | 981 |
| Promedio HFC | `Promedio_HFC` | `number_format(x, 2, '.', ',')` | 989 |
| RGU FTTH | `Q_RGU` | `number_format(x, 0, ',', '.')` | 998 |
| Cantidad Días FTTH | `Dias_Cantidad_FTTH` | `intval()` | 1006 |
| Promedio RGU | `Promedio_RGU` | `number_format(x, 2, '.', ',')` | 1014 |

### 4. Metas y Cumplimiento

| KPI Interfaz | Campo MySQL | Transformación | Línea PHP |
|---------------|------------|----------------|------------|
| Meta Producción HFC | `Meta_Produccion_HFC` | `number_format(x, 0, ',', '.')` | 1026 |
| Cumplimiento HFC | `_CumplimientoProduccionHFC` | `x * 100` + formato porcentaje | 1034 |
| Meta Producción FTTH | `Meta_Produccion_FTTH` | `number_format(x, 1, ',', '.')` | 1043 |
| Cumplimiento FTTH | `_cumplimientoProduccionRGU` | `x * 100` + formato porcentaje | 1051 |

### 5. Indicadores de Calidad

| KPI Interfaz | Campo MySQL | Transformación | Línea PHP |
|---------------|------------|----------------|------------|
| KPI Calidad HFC | `Ratio_CalidadHFC` | `x * 100` + formato porcentaje | 1073 |
| Meta Calidad HFC | `Meta_Calidad_HFC` | `x * 100` + formato porcentaje | 1081 |
| Cumplimiento Calidad HFC | `_cumplimientoMeta_Calidad_HFC` | `x * 100` + formato porcentaje | 1089 |
| KPI Calidad FTTH | `Ratio_CalidadFTTH` | `x * 100` + formato porcentaje | 1098 |
| Meta Calidad FTTH | `Meta_Calidad_FTTH` | `x * 100` + formato porcentaje | 1106 |
| Cumplimiento Calidad FTTH | `_cumplimientoMeta_Calidad_FTTH` | `x * 100` + formato porcentaje | 1114 |

### 6. Asistencia y Factores

| KPI Interfaz | Campo MySQL | Transformación | Línea PHP |
|---------------|------------|----------------|------------|
| Días Operativos | `Q_OPERATIVO_TURNO` | `intval()` | 1152 |
| Días Ausente | `Q_AUSENTE_TURNO` | `intval()` | 1160 |
| Días Vacaciones | `Q_VACACIONES_TURNO` | `intval()` | 1168 |
| Días Licencia | `Q_LICENCIA_TURNO` | `intval()` | 1176 |
| Factor Ausencia | `FACTOR_AUSENCIA` | `x * 100` + formato porcentaje | 1184 |
| Factor Vacaciones | `FACTOR_VACACIONES` | `x * 100` + formato porcentaje | 1192 |

## Transformaciones Comunes

### Formatos Numéricos
- **Moneda**: `intval()` + `$` + `number_format(valor, 0, ',', '.')`
- **Porcentajes**: Multiplicación por 100 + `number_format(valor, 1, '.', ',')` + `%`
- **Decimales**: `number_format(valor, 2, '.', ',')` para promedios
- **Enteros**: `intval()` para conteos de días

### Manejo de Nulos y Valores Predeterminados
Todos los campos tienen valores fallback definidos en las líneas 76-118:
- Textos: 'Sin datos', 'N/A', ''
- Numéricos: 0
- Período: `date('Ym')` si no se proporciona

### Formato de Período
- **Entrada**: Puede ser YYYYMM o YYYY-MM
- **Procesamiento**: Eliminación de caracteres no numéricos (línea 35)
- **Salida**: Siempre formato YYYYMM (líneas 36-44)

## Campos No Utilizados o Comentados

### Campos en BD pero no mostrados en interfaz:
- `Original_RUT_TECNICO` - Almacenamiento interno
- `DIAS_BASE_DRIVE` - No utilizado en dashboard
- `SUM_OPERATIVO` - No utilizado en dashboard
- `Q_Calidad30_FTTH` - Comentado en líneas 1118-1133
- `Q_Cantidad_FTTH` - Comentado en líneas 1118-1133
- `Q_Calidad30_HFC` - Comentado en líneas 1118-1133
- `Q_Cantidad_HFC` - Comentado en líneas 1118-1133
- `CalidadReactivaGrupoHFC` - No utilizado en dashboard
- `CalidadReactivaGrupoFTTH` - No utilizado en dashboard
- `fecha_actualizacion` - Campo de auditoría interna

### Campos de otras tablas:
- **tb_user_tqw**: Solo para obtener `id` del usuario (líneas 212-219)

## Consulta SQL Principal

```sql
SELECT RutTecnicoOrig, NombreTecnico, Supervisor, Zona_Factura23, modelo_turno, categoria,
Original_RUT_TECNICO, DIAS_BASE_DRIVE, SUM_OPERATIVO, Dias_Cantidad_HFC, Dias_Cantidad_FTTH,
Puntos, Q_RGU, Promedio_HFC, Promedio_RGU, Q_OPERATIVO_TURNO, Q_AUSENTE_TURNO, Q_VACACIONES_TURNO,
Q_LICENCIA_TURNO, FACTOR_AUSENCIA, FACTOR_VACACIONES, Meta_Produccion_FTTH, Meta_Produccion_HFC,
_cumplimientoProduccionRGU, _CumplimientoProduccionHFC, Ratio_CalidadFTTH, Ratio_CalidadHFC,
Q_Calidad30_FTTH, Q_Cantidad_FTTH, Q_Calidad30_HFC, Q_Cantidad_HFC, Meta_Calidad_FTTH,
Meta_Calidad_HFC, _cumplimientoMeta_Calidad_FTTH, _cumplimientoMeta_Calidad_HFC,
CalidadReactivaGrupoHFC, CalidadReactivaGrupoFTTH, Comisión_FTTH, Comisión_HFC,
Comisión_FTTH_Ponderada, Comisión_HFC_Ponderada
FROM tb_tqw_comision_renew
WHERE RutTecnicoOrig = ? AND periodo = ?
```

**Parámetros**: 
1. `RutTecnico` (desde POST o sesión)
2. `periodo` (YYYYMM formateado)

## Consultas Secundarias

### ID de Usuario
```sql
SELECT id FROM tb_user_tqw WHERE rut = ?
```

## Notas Técnicas

1. **Tipos de Datos**: Todos los campos en `tb_tqw_comision_renew` son tipo `text`, requieren conversión explícita
2. **Seguridad**: Uso de prepared statements con `bind_param()` (líneas 58-59)
3. **Manejo de Errores**: Verificación de `num_rows > 0` (línea 64)
4. **Formateo RUT**: Función para manejo de múltiples formatos de RUT
5. **Sesión**: Dependencia de variables de sesión `$_SESSION['rut']` y `$_SESSION['id_sesion']`

## Estructura de Archivos Relacionados

- **Principal**: `activity_dashboard.php` (1511 líneas)
- **Estilos**: `css/activity_dashboard.css`, `css/metric-cards.css`
- **Scripts**: `js/activity_dashboard.js`, `js/collapsible-sections.js`
- **Componentes**: `components/footer_modular.php`
- **Configuración**: `GlobalConfig.php`, `DatabaseConnection.php`

---
*Documento generado el 2025-12-04 - Sistema TQW Dashboard*
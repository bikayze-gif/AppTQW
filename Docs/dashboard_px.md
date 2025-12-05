# Documentación Técnica - charts_dashboard.php

## Objetivo Principal
Documentar todos los endpoints, consultas SQL y estructuras de tablas que alimentan los gráficos y tablas de la página `charts_dashboard.php`, para facilitar la migración a un nuevo mockup manteniendo los mismos elementos visuales.

## 1. Endpoints y APIs

### 1.1 Endpoints Principales

#### charts_dashboard.php
- **Ruta**: `charts_dashboard.php`
- **Método**: GET
- **Parámetros**:
  - `filtro` (opcional): Define el período de datos a mostrar
    - `week`: Última semana
    - `last2weeks`: Últimas 2 semanas
    - `month`: Mes completo (valor por defecto)
- **Formato de respuesta**: HTML con datos incrustados en JavaScript
- **Elementos visuales que alimenta**:
  - Gráfico de rendimiento principal
  - Gráfico de tecnología
  - Tabla de métricas
  - Selector de período para exportación

#### get_order_details.php
- **Ruta**: `get_order_details.php`
- **Método**: GET
- **Parámetros**:
  - `fecha` (requerido): Fecha en formato YYYY-MM-DD o DD-MM-YYYY
- **Formato de respuesta**: JSON
- **Elementos visuales que alimenta**:
  - Vista de detalles de órdenes al hacer clic en el botón de ver detalles
- **Estructura de respuesta**:
  ```json
  {
    "success": true,
    "fecha": "2025-01-15",
    "totalRegistros": 10,
    "detalles": [
      {
        "Orden": "12345",
        "Dir# cliente": "Dirección del cliente",
        "Actividad": "Tipo de actividad",
        "Trabajo": "Tipo de trabajo",
        "Ptos_referencial": 100,
        "Q_SSPP": 1.5,
        "RGU": 1.5,
        "Fecha fin#": "15-01-2025 14:30",
        "TipoRed_rank": "HFC"
      }
    ]
  }
  ```

#### Export.php
- **Ruta**: `Export.php`
- **Método**: GET
- **Parámetros**:
  - `variable=exportarNDCData` (requerido): Indica que se exportarán datos de NDC
  - `mes_contable` (requerido): Período en formato YYYY-MM-DD
- **Formato de respuesta**: Archivo Excel (.xls)
- **Elementos visuales que alimenta**:
  - Función de exportación de datos

#### session_ping.php
- **Ruta**: `session_ping.php`
- **Método**: GET
- **Parámetros**: Ninguno (usa timestamp para evitar caché)
- **Formato de respuesta**: JSON
- **Elementos visuales que alimenta**:
  - Mantenimiento de sesión activa
- **Estructura de respuesta**:
  ```json
  {
    "success": true,
    "sessionActive": true,
    "sessionExpired": false,
    "timestamp": "2025-01-15 10:30:00",
    "maxInactiveTime": 21600,
    "lastActivity": "2025-01-15 10:25:00"
  }
  ```

### 1.2 Componentes y Formularios

#### footer_modular.php
- **Ruta**: `components/footer_modular.php`
- **Función**: Proporciona navegación inferior y formularios modales
- **Formularios incluidos**:
  - Solicitud de Materiales (`forms/form_materiales.php`)
  - Formulario de Revisión (`forms/form_revision.php`)
  - Formulario de Soporte (`forms/form_soporte.php`)

## 2. Consultas SQL

### 2.1 Consultas Principales de charts_dashboard.php

#### getMonthlyData()
```sql
SELECT
    DATE(`Fecha fin#`) as fecha,
    CAST(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_hfc,
    CAST(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_ftth,
    CAST(SUM(Ptos_referencial) AS UNSIGNED) as puntos,
    ROUND(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_hfc,
    ROUND(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_ftth,
    ROUND(SUM(Q_SSPP), 2) as q_rgu,
    SUM(CASE WHEN TipoRed_rank = 'HFC' THEN total_HFC ELSE 0 END) as hfc,
    SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN total_FTTH ELSE 0 END) as ftth,
    MIN(TipoRed_rank) as min_tipo_red,
    GROUP_CONCAT(DISTINCT TipoRed_rank ORDER BY TipoRed_rank SEPARATOR ', ') as tipo_red
FROM produccion_ndc_rank_red USE INDEX (fecha_idx)
WHERE `Fecha fin#` BETWEEN ? AND ?
    [AND rut = ?]  -- Opcional, filtrar por técnico
GROUP BY DATE(`Fecha fin#`) 
ORDER BY fecha ASC
```
- **Parámetros**:
  - `firstDayOfMonth`: Primer día del mes actual (YYYY-MM-DD)
  - `currentDate`: Fecha actual (YYYY-MM-DD)
  - `rutTecnico` (opcional): RUT del técnico para filtrar
- **Uso**: Alimenta el gráfico principal y la tabla de métricas con datos del mes actual

#### getLastWeekData()
```sql
SELECT
    DATE(`Fecha fin#`) as fecha,
    CAST(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_hfc,
    CAST(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_ftth,
    CAST(SUM(Ptos_referencial) AS UNSIGNED) as puntos,
    ROUND(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_hfc,
    ROUND(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_ftth,
    ROUND(SUM(Q_SSPP), 2) as q_rgu,
    SUM(CASE WHEN TipoRed_rank = 'HFC' THEN total_HFC ELSE 0 END) as hfc,
    SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN total_FTTH ELSE 0 END) as ftth,
    MIN(TipoRed_rank) as min_tipo_red,
    GROUP_CONCAT(DISTINCT TipoRed_rank ORDER BY TipoRed_rank SEPARATOR ', ') as tipo_red
FROM produccion_ndc_rank_red USE INDEX (fecha_idx)
WHERE `Fecha fin#` BETWEEN ? AND ?
    [AND rut = ?]  -- Opcional, filtrar por técnico
GROUP BY DATE(`Fecha fin#`) 
ORDER BY fecha ASC
```
- **Parámetros**:
  - `weekAgo`: Fecha de hace 7 días (YYYY-MM-DD)
  - `currentDate`: Fecha actual (YYYY-MM-DD)
  - `rutTecnico` (opcional): RUT del técnico para filtrar
- **Uso**: Alimenta el gráfico principal y la tabla de métricas con datos de la última semana

#### getLast2WeeksData()
```sql
SELECT
    DATE(`Fecha fin#`) as fecha,
    CAST(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_hfc,
    CAST(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Ptos_referencial ELSE 0 END) AS UNSIGNED) as puntos_ftth,
    CAST(SUM(Ptos_referencial) AS UNSIGNED) as puntos,
    ROUND(SUM(CASE WHEN TipoRed_rank = 'HFC' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_hfc,
    ROUND(SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN Q_SSPP ELSE 0 END), 2) as q_rgu_ftth,
    ROUND(SUM(Q_SSPP), 2) as q_rgu,
    SUM(CASE WHEN TipoRed_rank = 'HFC' THEN total_HFC ELSE 0 END) as hfc,
    SUM(CASE WHEN TipoRed_rank = 'FTTH' THEN total_FTTH ELSE 0 END) as ftth,
    MIN(TipoRed_rank) as min_tipo_red,
    GROUP_CONCAT(DISTINCT TipoRed_rank ORDER BY TipoRed_rank SEPARATOR ', ') as tipo_red
FROM produccion_ndc_rank_red USE INDEX (fecha_idx)
WHERE `Fecha fin#` BETWEEN ? AND ?
    [AND rut = ?]  -- Opcional, filtrar por técnico
GROUP BY DATE(`Fecha fin#`) 
ORDER BY fecha ASC
```
- **Parámetros**:
  - `twoWeeksAgo`: Fecha de hace 14 días (YYYY-MM-DD)
  - `currentDate`: Fecha actual (YYYY-MM-DD)
  - `rutTecnico` (opcional): RUT del técnico para filtrar
- **Uso**: Alimenta el gráfico principal y la tabla de métricas con datos de las últimas 2 semanas

#### Consulta para períodos disponibles en selector de exportación
```sql
SELECT DISTINCT
    DATE_FORMAT(mes_contable, '%Y-%m-01') as periodo_fecha,
    DATE_FORMAT(mes_contable, '%Y-%m') as periodo_valor,
    mes_contable as fecha_completa
FROM produccion_ndc_rank_red
WHERE mes_contable IS NOT NULL
GROUP BY periodo_fecha
ORDER BY periodo_fecha DESC
LIMIT 12
```
- **Uso**: Pobla el selector de períodos para exportación con los últimos 12 meses disponibles

### 2.2 Consultas de get_order_details.php

#### Consulta principal para detalles de órdenes
```sql
SELECT 
    `Orden`, 
    `Dir# cliente`, 
    `Actividad`, 
    `Trabajo`, 
    `Ptos_referencial`, 
    `Q_SSPP`, 
    `RGU`, 
    `Fecha fin#`,
    `TipoRed_rank`
FROM produccion_ndc_rank_red
WHERE DATE(`Fecha fin#`) = ?
    [AND rut = ?]  -- Opcional, filtrar por técnico
ORDER BY `Orden` ASC
```
- **Parámetros**:
  - `fecha`: Fecha específica (YYYY-MM-DD)
  - `rutTecnico` (opcional): RUT del técnico para filtrar
- **Uso**: Obtiene detalles de órdenes para una fecha específica cuando se hace clic en "Ver detalles"

### 2.3 Consultas de Export.php

#### Consulta para exportarNDCData
```sql
SELECT 
    `Fecha fin#`,
    Orden,
    `Dir# cliente`,
    Actividad,
    Trabajo,
    TipoRed_rank,
    `Q_SSPP` as RGU,
    Ptos_referencial,
    rut,            
    mes_contable
FROM produccion_ndc_rank_red
WHERE DATE_FORMAT(mes_contable, '%Y-%m') = ?
    AND rut = ?
ORDER BY `Fecha fin#` ASC
```
- **Parámetros**:
  - `anio_mes_filtro`: Período en formato YYYY-MM
  - `rutTecnico`: RUT del técnico (requerido)
- **Uso**: Genera archivo Excel con los datos del período seleccionado para el técnico actual

## 3. Estructuras de Tablas

### 3.1 Tabla Principal: produccion_ndc_rank_red

Esta es la tabla principal que contiene todos los datos de producción y rendimiento.

#### Campos principales:
- `Fecha fin#`: Fecha de finalización de la orden (datetime)
- `Orden`: Número de orden (varchar)
- `Dir# cliente`: Dirección del cliente (varchar)
- `Actividad`: Tipo de actividad (varchar)
- `Trabajo`: Tipo de trabajo (varchar)
- `TipoRed_rank`: Tipo de red ('HFC' o 'FTTH')
- `Q_SSPP`: Cantidad de RGU (decimal)
- `RGU`: RGU (decimal, posiblemente redundante con Q_SSPP)
- `Ptos_referencial`: Puntos de referencia (int)
- `rut`: RUT del técnico (varchar)
- `mes_contable`: Mes contable (date)
- `total_HFC`: Total HFC (int)
- `total_FTTH`: Total FTTH (int)

#### Índices:
- `fecha_idx`: Índice en el campo `Fecha fin#` para optimizar consultas por rango de fechas

### 3.2 Tablas Secundarias

#### tb_conexiones_log
- **Uso**: Registro de conexiones a la base de datos
- **Campos principales**:
  - `id`: Identificador único
  - `usuario`: Nombre de usuario
  - `pagina`: Página visitada
  - `estado`: Estado de la conexión ('ACTIVE', 'CLOSED', 'TIMEOUT')
  - `fecha_conexion`: Fecha y hora de conexión
  - `fecha_desconexion`: Fecha y hora de desconexión
  - `ip`: Dirección IP del cliente
  - `tcp_state`: Estado de la conexión TCP
  - `tcp_info`: Información adicional de la conexión TCP

## 4. Mapeo Visual

### 4.1 Gráfico Principal de Rendimiento
- **Elemento visual**: Gráfico de líneas con dos ejes Y
- **Endpoint**: `charts_dashboard.php` (datos incrustados)
- **Consultas SQL**: 
  - `getMonthlyData()` para filtro "month"
  - `getLastWeekData()` para filtro "week"
  - `getLast2WeeksData()` para filtro "last2weeks"
- **Tablas**: `produccion_ndc_rank_red`
- **Datos visualizados**:
  - Eje Y izquierdo: Puntos (HFC)
  - Eje Y derecho: RGU (FTTH)
  - Eje X: Fechas del período seleccionado

### 4.2 Gráfico de Tecnología
- **Elemento visual**: Gráfico de barras apiladas
- **Endpoint**: `charts_dashboard.php` (datos incrustados)
- **Consultas SQL**: 
  - `getMonthlyData()` para filtro "month"
  - `getLastWeekData()` para filtro "week"
  - `getLast2WeeksData()` para filtro "last2weeks"
- **Tablas**: `produccion_ndc_rank_red`
- **Datos visualizados**:
  - Barras apiladas mostrando distribución por tipo de red (HFC/FTTH)
  - Eje X: Fechas del período seleccionado

### 4.3 Tabla de Métricas
- **Elemento visual**: Tabla con datos resumidos
- **Endpoint**: `charts_dashboard.php` (datos incrustados)
- **Consultas SQL**: 
  - `getMonthlyData()` para filtro "month"
  - `getLastWeekData()` para filtro "week"
  - `getLast2WeeksData()` para filtro "last2weeks"
- **Tablas**: `produccion_ndc_rank_red`
- **Columnas**:
  - Fecha
  - Tipo Red
  - Puntos (solo para HFC)
  - RGU (solo para FTTH)
  - Acciones (botón para ver detalles)

### 4.4 Vista de Detalles de Órdenes
- **Elemento visual**: Modal con tabla detallada
- **Endpoint**: `get_order_details.php`
- **Consulta SQL**: Consulta principal para detalles de órdenes
- **Tablas**: `produccion_ndc_rank_red`
- **Columnas**:
  - Orden
  - Dirección Cliente
  - Actividad
  - Trabajo
  - Puntos
  - RGU
  - Tipo Red

### 4.5 Función de Exportación
- **Elemento visual**: Botón de descarga con selector de período
- **Endpoint**: `Export.php?variable=exportarNDCData`
- **Consulta SQL**: Consulta para exportarNDCData
- **Tablas**: `produccion_ndc_rank_red`
- **Formato de salida**: Archivo Excel (.xls)

## 5. Flujo de Datos

### 5.1 Carga Inicial de la Página
1. `charts_dashboard.php` se carga con parámetros de sesión (rut, periodo, id_sesion)
2. Se establece conexión a la base de datos mediante `DatabaseConnection.php`
3. Se verifica y crea el índice `fecha_idx` si no existe
4. Según el parámetro `filtro`, se ejecuta una de las funciones:
   - `getMonthlyData()` para "month"
   - `getLastWeekData()` para "week"
   - `getLast2WeeksData()` para "last2weeks"
5. Los datos se formatean y se incrustan en variables JavaScript
6. Se renderiza el HTML con los gráficos y tablas

### 5.2 Interacción del Usuario
1. Al hacer clic en botones de filtro, se recarga la página con el parámetro `filtro` correspondiente
2. Al hacer clic en "Ver detalles" en la tabla, se llama a `get_order_details.php` vía AJAX
3. Al seleccionar un período y hacer clic en exportar, se redirige a `Export.php?variable=exportarNDCData`

### 5.3 Mantenimiento de Sesión
1. Cada 5 minutos, se realiza una llamada a `session_ping.php` para mantener la sesión activa
2. Si la sesión ha expirado, se redirige al login

## 6. Consideraciones para la Migración

### 6.1 Puntos Críticos
1. **Conexión a la base de datos**: Asegurar que la nueva implementación utilice la misma configuración de conexión
2. **Manejo de sesiones**: Implementar el mismo mecanismo de verificación y mantenimiento de sesiones
3. **Formato de datos**: Mantener el mismo formato de datos para los gráficos ApexCharts
4. **Filtros por técnico**: Preservar la funcionalidad de filtrado por RUT de técnico

### 6.2 Optimizaciones Implementadas
1. **Índice de fecha**: Uso del índice `fecha_idx` para optimizar consultas por rango de fechas
2. **Configuración de MySQL**: Ajustes de caché y modo SQL para mejorar rendimiento
3. **Consultas preparadas**: Uso de sentencias preparadas para seguridad y rendimiento

### 6.3 Dependencias Externas
1. **ApexCharts**: Biblioteca para visualización de gráficos
2. **Bootstrap**: Framework CSS para componentes UI
3. **Bootstrap Icons**: Iconos para la interfaz
4. **PHPMailer**: Para funcionalidades de correo (no usado directamente en charts_dashboard.php)

## 7. Estructura de Archivos Relacionados

```
charts_dashboard.php                 ← Página principal
├── includes/
│   └── session_manager.php          ← Gestión de sesiones
├── config/
│   └── database.php                ← Configuración de BD
├── components/
│   └── footer_modular.php          ← Navegación y formularios
├── js/
│   ├── charts_dashboard.js          ← Lógica de gráficos
│   ├── unified-menu.js              ← Menú flotante
│   └── logout.js                   ← Cierre de sesión
├── css/
│   ├── charts_dashboard.css         ← Estilos específicos
│   ├── activity_dashboard.css       ← Estilos generales
│   └── common_charts.css          ← Estilos comunes de gráficos
├── forms/                          ← Formularios modales
├── get_order_details.php           ← API para detalles de órdenes
├── Export.php                      ← API para exportación de datos
├── session_ping.php                ← API para mantenimiento de sesión
└── DatabaseConnection.php          ← Clase de conexión a BD
```

## 8. Notas Adicionales

1. **Seguridad**: La implementación incluye medidas de seguridad como validación de entrada, consultas preparadas y manejo seguro de errores.
2. **Rendimiento**: Se han implementado optimizaciones como índices de base de datos y configuración de caché.
3. **Mantenimiento**: La página incluye un sistema de ping para mantener la sesión activa y evitar expiraciones.
4. **Responsive**: El diseño está adaptado para funcionar en dispositivos móviles y escritorio.
5. **Accesibilidad**: Se incluyen atributos ARIA y etiquetas descriptivas para mejorar la accesibilidad.
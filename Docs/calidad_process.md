# Diagrama de Flujo de Información - Sistema de Calidad Reactiva

## Diagrama de Arquitectura

```mermaid
graph TD
    A[Usuario en calidad_reactiva_rebuild.php] --> B[Carga inicial de página]
    B --> C[Conexión a MySQL]
    C --> D[Consulta a TB_CALIDAD_NARANJA_BASE]
    D --> E[Procesamiento PHP de datos]
    E --> F[Generación de arrays de datos]
    F --> G[Paso a JavaScript phpData]
    G --> H[Inicialización de ApexCharts]
    H --> I[Renderizado de gráficos]
    I --> J[Mostrar tabla de métricas]
    J --> K[Interacción del usuario]
    K --> L{Tipo de interacción}
    L -->|Filtro período| M[Actualización de gráficos]
    L -->|Click en tabla| N[Redirección a detalles]
    M --> O[Actualización dinámica sin recarga]
    N --> P[calidad_reactiva_detalle.php]

    style A fill:#e1f5fe
    style P fill:#e8f5e8
    style D fill:#fff3e0
    style H fill:#fce4ec
```

## Flujo de Datos Detallado

### 1. Capa de Datos (Base de Datos)
```
TB_CALIDAD_NARANJA_BASE (58 campos)
├── Información de Identificación
│   ├── LLAVE1
│   ├── num_pedido, num_pedido_2
│   └── ORDEN_CALIDAD_*
├── Información del Técnico
│   ├── RUT_TECNICO_FS, RUT_TECNICO_FS_2
│   ├── DESC_EMPRESA, DESC_EMPRESA_2
│   └── Empresa_Homologada
├── Información del Cliente
│   ├── id_cliente
│   ├── nombre_cuenta
│   ├── tipo_cuenta
│   └── tipo_cliente
├── Información Geográfica
│   ├── ZONA, ZONA2
│   ├── Comuna
│   ├── codi_localidad
│   ├── bucket, Nombre_Bucket
├── Información de Actividades
│   ├── ACTIVIDAD, ACTIVIDAD_FINAL
│   ├── TIPO_ACTIVIDAD
│   ├── id_actividad, id_actividad_2
│   └── descripcion_actividad*
├── Información Temporal
│   ├── FECHA_CREACION_PEDIDO
│   ├── FECHA_EJECUCION
│   ├── FECHA_AGENDAMIENTO
│   ├── DIA_EJE, MES_EJE, AÑO_EJE
│   └── mes_contable
├── Información de Calidad
│   ├── CALIDAD_30, CALIDAD_60, CALIDAD_7
│   ├── CALIDAD_15, CALIDAD_3
│   └── ORDEN_CALIDAD_*
└── Información Adicional
    ├── estado_pedido, ESTADO_TOA
    ├── TIPO_RED, TIPO_RED_PRODUCTO , TIPO_RED_CALCULADO
    ├── Base, Delivery
    └── DIFERENCIA_DIAS
```

### 2. Capa de Lógica de Negocio (PHP)
```
calidad_reactiva_rebuild.php
├── Conexión a base de datos
├── Consulta SQL principal
├── Procesamiento de resultados
├── Cálculo de eficiencias
├── Generación de arrays JavaScript
└── Renderizado HTML inicial
```

#### Consulta SQL Principal
```sql
SELECT
    YEAR(mes_contable) as anio,
    MONTH(mes_contable) as mes,
    mes_contable,
    COUNT(*) as total,
    SUM(CASE WHEN `CALIDAD_30` = '0' THEN 1 ELSE 0 END) as cumple,
    SUM(CASE WHEN `CALIDAD_30` = '1' THEN 1 ELSE 0 END) as no_cumple,
    SUM(CASE WHEN `CALIDAD_30` = '0' AND `TIPO_RED_CALCULADO` = 'HFC' THEN 1 ELSE 0 END) as cumple_hfc,
    SUM(CASE WHEN `CALIDAD_30` = '1' AND `TIPO_RED_CALCULADO` = 'HFC' THEN 1 ELSE 0 END) as no_cumple_hfc,
    SUM(CASE WHEN `CALIDAD_30` = '0' AND `TIPO_RED_CALCULADO` IN ('FTTH', 'DUAL') THEN 1 ELSE 0 END) as cumple_ftth,
    SUM(CASE WHEN `CALIDAD_30` = '1' AND `TIPO_RED_CALCULADO` IN ('FTTH', 'DUAL') THEN 1 ELSE 0 END) as no_cumple_ftth
FROM TB_CALIDAD_NARANJA_BASE
WHERE `RUT_TECNICO_FS` = ?
GROUP BY mes_contable
ORDER BY mes_contable
```

### 3. Capa de Presentación (JavaScript)
```
calidad_reactiva_rebuild.js
├── Inicialización de gráficos
├── Configuración de filtros
├── Manejo de interacciones
├── Actualización dinámica
└── Navegación a detalles
```

## Secuencia de Interacción

```mermaid
sequenceDiagram
    participant U as Usuario
    participant PHP as calidad_reactiva_rebuild.php
    participant DB as Base de Datos
    participant JS as JavaScript
    participant Chart as ApexCharts

    U->>PHP: Accede a la página
    PHP->>DB: Conecta a MySQL
    PHP->>DB: Consulta TB_CALIDAD_NARANJA_BASE
    DB->>PHP: Retorna datos agregados
    PHP->>PHP: Calcula eficiencias
    PHP->>PHP: Genera phpData object
    PHP->>JS: Pasa datos a JavaScript
    JS->>Chart: Inicializa gráfico de calidad
    JS->>Chart: Inicializa gráfico de tecnología
    JS->>Chart: Renderiza gráficos
    JS->>U: Muestra interfaz completa

    U->>JS: Cambia filtro de período
    JS->>JS: Filtra datos localmente
    JS->>Chart: Actualiza gráficos
    Chart->>U: Muestra vista actualizada

    U->>JS: Click en fila de tabla
    JS->>PHP: Redirección a detalles
    Note over PHP,JS: calidad_reactiva_detalle.php
```

## Mapeo de Campos a Visualizaciones

### Campos Principales en Gráficos
```mermaid
graph LR
    A[TB_CALIDAD_NARANJA_BASE] --> B[Datos Procesados]
    B --> C[Gráfico de Calidad General]
    B --> D[Gráfico por Tecnología]
    B --> E[Tabla de Métricas]

    C --> F[Eficiencia General %]
    D --> G[Eficiencia HFC %]
    D --> H[Eficiencia FTTH %]
    E --> I[Totales por mes]
    E --> J[Cumplen/No cumplen]

    style C fill:#6f42c1
    style D fill:#4CAF50
    style E fill:#2196F3
```

### Transformación de Datos
```mermaid
graph TD
    A[Datos Crudos] --> B[Procesamiento PHP]
    B --> C[Cálculo de Eficiencias]
    C --> D[Generación de Arrays]
    D --> E[Objeto phpData]
    E --> F[Visualización JavaScript]

    A1[CALIDAD_30: 0/1] --> C1[Cumple/No cumple]
    A2[TIPO_RED_CALCULADO: HFC/FTTH] --> C2[Separación por tecnología]
    A3[mes_contable] --> C3[Agrupación mensual]
    A4[RUT_TECNICO_FS] --> C4[Filtro por técnico]

    C1 --> D1[Array eficienciaGeneral]
    C2 --> D2[Array eficienciaHFC/FTTH]
    C3 --> D3[Array meses/totales]
    C4 --> D4[Filtro condicional]

    D1 --> E1[phpData.chartData]
    D2 --> E1
    D3 --> E1
    D4 --> E1

    E1 --> F1[ApexCharts]
```

## Componentes de la Interfaz

### 1. Estructura HTML Principal
```html
<div class="app-container">
    <div id="mainView" class="view active">
        <header class="app-header">
            <h1>Calidad Reactiva (Reconstrucción)</h1>
            <div class="user-info">RUT: [técnico]</div>
        </header>

        <div class="content-container">
            <!-- Sección de gráficos -->
            <div class="chart-section">
                <div id="calidadReactivaChart"></div>
                <div id="tecnologiaChart"></div>
                <!-- Filtros de período -->
            </div>

            <!-- Sección de tabla -->
            <div class="table-section">
                <table class="data-table">
                    <!-- Datos dinámicos -->
                </table>
            </div>
        </div>
    </div>

    <div id="detailsView" class="view">
        <!-- Vista de detalles (slide-in) -->
    </div>
</div>
```

### 2. Configuración de Gráficos ApexCharts

#### Gráfico Principal - Calidad Reactiva
```javascript
{
    series: [{
        name: 'Calidad Reactiva',
        data: [85.5, 87.2, 89.1, ...]
    }],
    chart: {
        type: 'line',
        height: 400,
        background: 'transparent',
        colors: ['#6f42c1'] // Púrpura
    },
    yaxis: {
        title: { text: 'Eficiencia (%)' },
        min: 0,
        max: 100
    }
}
```

#### Gráfico Secundario - Tecnología
```javascript
{
    series: [
        { name: 'HFC', data: [82.1, 84.3, 85.7, ...] },
        { name: 'FTTH', data: [88.2, 89.8, 91.4, ...] }
    ],
    chart: {
        type: 'line',
        height: 350,
        colors: ['#4CAF50', '#2196F3'] // Verde, Azul
    }
}
```

### 3. Sistema de Filtros
```javascript
// Botones de período
const buttons = {
    12: document.getElementById('monthsFilter12'),
    6: document.getElementById('monthsFilter6'),
    3: document.getElementById('monthsFilter3')
};

// Lógica de filtrado
function getFilteredData(months) {
    const totalMonths = data.meses.length;
    const start = Math.max(0, totalMonths - months);

    return {
        meses: data.meses.slice(start),
        eficienciaGeneral: data.eficienciaGeneral.slice(start),
        eficienciaHFC: data.eficienciaHFC.slice(start),
        eficienciaFTTH: data.eficienciaFTTH.slice(start)
    };
}
```

## Flujo de Navegación a Detalles

### 1. Interacción en Tabla
```javascript
tableBody.addEventListener('click', function (e) {
    const row = e.target.closest('tr');
    if (row && row.hasAttribute('data-mes')) {
        const mes = row.getAttribute('data-mes');
        const mesCompleto = row.getAttribute('data-mes-completo');
        showDetails(mes, mesCompleto);
    }
});

async function showDetails(mes, mesCompleto) {
    // Redirección a página de detalles
    window.location.href = `calidad_reactiva_detalle.php?mes=${encodeURIComponent(mes)}&mes_completo=${encodeURIComponent(mesCompleto)}`;
}
```

### 2. Parámetros de URL
```
calidad_reactiva_detalle.php
├── mes: "2025-10" (formato YYYY-MM)
├── mes_completo: "2025-10-01" (formato YYYY-MM-DD)
└── [otros parámetros de sesión]
```

## Consideraciones de Rendimiento

### 1. Optimización del Lado del Servidor
- **Agrupación SQL**: `GROUP BY mes_contable` reduce registros
- **Índices**: En `mes_contable` y `RUT_TECNICO_FS`
- **Consultas preparadas**: Previenen inyección SQL
- **Caching**: Datos procesados una vez por carga

### 2. Optimización del Lado del Cliente
- **Filtrado local**: Sin recargas al cambiar período
- **Actualización incremental**: Solo datos necesarios
- **Lazy loading**: Gráficos inicializadas cuando sea necesario
- **Event delegation**: Un solo listener para tabla dinámica

### 3. Manejo de Datos Masivos
```php
// Límite de registros para rendimiento
if (count($datosCalidad) > 24) {
    // Mantener solo últimos 2 años
    $datosCalidad = array_slice($datosCalidad, -24);
}
```

## Flujo de Errores y Logging

### 1. Logging en Servidor
```php
function logToFile($message, $type = 'INFO', $data = null) {
    $logFile = __DIR__ . '/logs/calidad_reactiva_rebuild.log';
    $timestamp = date('Y-m-d H:i:s');
    $formattedMessage = "[$timestamp] [$type] $message";
    if ($data !== null) { 
        $formattedMessage .= " - Data: " . json_encode($data, JSON_UNESCAPED_UNICODE); 
    }
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $formattedMessage .= " - IP: $ip" . PHP_EOL;
    file_put_contents($logFile, $formattedMessage, FILE_APPEND);
}
```

### 2. Manejo de Errores en JavaScript
```javascript
// Validación de datos
if (typeof phpData === 'undefined') {
    console.error('phpData is not defined. Charts cannot be initialized.');
    return;
}

// Manejo de contenedores no encontrados
const calidadContainer = document.querySelector("#calidadReactivaChart");
if (!calidadContainer) {
    console.error('El contenedor #calidadReactivaChart no existe en el DOM');
    return;
}
```

## Arquitectura de Escalabilidad

### 1. Separación de Responsabilidades
- **PHP**: Procesamiento de datos y lógica de negocio
- **JavaScript**: Presentación e interacciones
- **MySQL**: Almacenamiento y consultas optimizadas
- **CSS**: Estilos y responsive design

### 2. Modularidad
```
calidad_reactiva_rebuild.php
├── Conexión a DB
├── Consultas SQL
├── Procesamiento de datos
└── Renderizado inicial

js/calidad_reactiva_rebuild.js
├── Configuración de gráficos
├── Manejo de filtros
├── Actualizaciones dinámicas
└── Navegación

css/calidad_reactiva.css
├── Estilos de gráficos
├── Diseño responsive
└── Animaciones y transiciones
```

### 3. Puntos de Extensión
- **Nuevas métricas**: `CALIDAD_60`, `CALIDAD_7`, `CALIDAD_15`
- **Filtros adicionales**: Por zona, por tipo de actividad
- **Exportación de datos**: CSV, PDF, Excel
- **Integraciones**: API externas, notificaciones
- **Dashboard en tiempo real**: WebSocket o Server-Sent Events
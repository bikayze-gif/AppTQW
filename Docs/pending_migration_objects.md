# Objetos Pendientes de Migración - operaciones_tqw

Este documento contiene las definiciones SQL de todos los objetos que no fueron migrados automáticamente.

**Fecha de exportación**: 2026-01-09

**Base de datos origen**: operaciones_tqw @ 170.239.85.233

**Base de datos destino**: operaciones_tqw_bkp @ localhost (VPS)

---

## 📋 Índice de Contenidos

### Resumen de Tablas Pendientes (21 tablas)

| # | Tabla | Filas | Tamaño | Descripción |
|---|-------|-------|--------|-------------|
| 1 | `tb_conexiones_log` | 1,624,033 | 1.3 GB | Log de conexiones de usuarios |
| 2 | `ventas` | 679,950 | 22.6 MB | Ventas particionadas por año |
| 3 | `ventas_no_particionada` | 679,946 | 15.1 MB | Ventas sin particiones |
| 4 | `tb_inventario_base_david` | 3,136,380 | 417.9 MB | Base de inventario completa |
| 5 | `tb_kpi_gerencia_calidad_tecnico` | 242,276 | 17.9 MB | KPIs de calidad por técnico |
| 6 | `tb_paso_pyndc` | 135,509 | 64.0 MB | Datos de producción NDC |
| 7 | `tb_toa_30dias_cloud` | 18,980 | 107.7 MB | TOA últimos 30 días |
| 8 | `tb_turnos` | 95,325 | 12.5 MB | Turnos de técnicos |
| 9 | `tb_gestiona` | 94,370 | 19.7 MB | Gestión de actividades |
| 10 | `tb_logis_movimientos` | 94,181 | 13.2 MB | Movimientos logísticos |
| 11 | `tb_logis_movimientos_hist` | 84,434 | 5.2 MB | Histórico de movimientos |
| 12 | `tb_logis_movimientosiii` | 88,300 | 5.8 MB | Movimientos logísticos v3 |
| 13 | `view_turnos` | 95,325 | 12.3 MB | Vista de turnos |
| 14 | `tb_calidad_plan_proactivo` | 59,315 | 12.0 MB | Plan proactivo de calidad |
| 15 | `tb_py_flujo_calidad` | 54,223 | 30.9 MB | Flujo de calidad Python |
| 16 | `tqw_produccion` | 51,236 | 3.3 MB | Producción TQW |
| 17 | `tb_cpe_analyzed` | 95,134 | 51.6 MB | Análisis de CPE |
| 18 | `tb_inventario_resultado_final` | 56,226 | 6.8 MB | Resultado final de inventario |
| 19 | `tb_logis_cierre_inventario2` | 65,781 | 10.0 MB | Cierre de inventario v2 |
| 20 | `tb_vtr_px_diaria` | 30,520 | 8.3 MB | Producción diaria VTR |
| 21 | `tb_vtr_px_diaria_lv2` | 30,229 | 8.2 MB | Producción diaria VTR nivel 2 |

**Total de datos en tablas pendientes:** ~1.9 GB

### Resumen de Vistas (13)

| # | Vista | Descripción |
|---|-------|-------------|
| 1 | `tb_logistica_usabilidad_mensual` | Usabilidad logística mensual |
| 2 | `tb_logistica_usabilidad_mensual_super` | Usabilidad logística mensual (supervisor) |
| 3 | `v_active_sessions` | Sesiones activas de usuarios |
| 4 | `v_oauth_performance_history` | Historial de rendimiento OAuth |
| 5 | `v_oauth_provider_status` | Estado de proveedores OAuth |
| 6 | `v_recent_critical_events` | Eventos críticos recientes |
| 7 | `v_recent_login_activity` | Actividad de login reciente |
| 8 | `vw_cumplimiento_por_tipo_auditoria` | Cumplimiento por tipo de auditoría |
| 9 | `vw_logis_semaforo` | Semáforo logístico |
| 10 | `vw_produccion_ndc_rank_red_factura` | Ranking de producción NDC |
| 11 | `vw_resumen_auditorias_por_tecnico` | Resumen de auditorías por técnico |
| 12 | `vw_user_tqw_limited` | Vista limitada de usuarios TQW |
| 13 | `vw_user_tqw_readonly` | Vista de solo lectura de usuarios TQW |

### Resumen de Stored Procedures (13)

| # | Procedimiento | Descripción |
|---|---------------|-------------|
| 1 | `check_truncate_protection` | Verificar protección contra truncate |
| 2 | `insertar_datos_prueba` | Insertar datos de prueba |
| 3 | `refresh_mv_asignacion_tecnico_serie` | Refrescar vista materializada de asignación |
| 4 | `sp_auditorias_por_tecnico` | Obtener auditorías por técnico |
| 5 | `SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL` | Crear tabla de resultado final de inventario |
| 6 | `sp_estadisticas_auditoria_por_fecha` | Estadísticas de auditoría por fecha |
| 7 | `sp_insert_faltantes` | Insertar faltantes |
| 8 | `sp_insert_movimiento` | Insertar movimiento |
| 9 | `sp_user_delete` | Eliminar usuario |
| 10 | `sp_user_insert` | Insertar usuario |
| 11 | `sp_user_update` | Actualizar usuario |
| 12 | `UpdateLogisticaDirecta` | Actualizar logística directa |
| 13 | `UpdateLogisticaReversa` | Actualizar logística reversa |

### Resumen de Triggers (7)

| # | Trigger | Tabla | Evento | Descripción |
|---|---------|-------|--------|-------------|
| 1 | `before_delete_tp_modelo_seni_juni` | `tp_modelo_seni_juni` | BEFORE DELETE | Validación antes de eliminar |
| 2 | `before_update_tp_modelo_seni_juni` | `tp_modelo_seni_juni` | BEFORE UPDATE | Validación antes de actualizar |
| 3 | `tr_user_tqw_after_delete` | `tb_user_tqw` | AFTER DELETE | Auditoría después de eliminar usuario |
| 4 | `tr_user_tqw_after_insert` | `tb_user_tqw` | AFTER INSERT | Auditoría después de insertar usuario |
| 5 | `tr_user_tqw_after_update` | `tb_user_tqw` | AFTER UPDATE | Auditoría después de actualizar usuario |
| 6 | `tr_user_tqw_before_delete` | `tb_user_tqw` | BEFORE DELETE | Validación antes de eliminar usuario |
| 7 | `update_attributes_after_insert` | - | AFTER INSERT | Actualizar atributos después de insertar |

---

# Tablas Pendientes de Migración

Las siguientes tablas fueron omitidas por su tamaño (>50,000 filas).

---

## tb_conexiones_log

- **Filas**: 1,624,033
- **Tamaño**: 1325.83 MB

```sql
CREATE TABLE `tb_conexiones_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(100) DEFAULT NULL,
  `pagina` varchar(255) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `fecha_conexion` datetime DEFAULT NULL,
  `fecha_desconexion` datetime DEFAULT NULL,
  `duracion` int DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `tcp_state` int DEFAULT '0',
  `tcp_info` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_conexion` (`fecha_conexion`),
  KEY `idx_estado_fecha` (`estado`,`fecha_conexion`),
  KEY `idx_pagina` (`pagina`(250))
) ENGINE=MyISAM AUTO_INCREMENT=1624034 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## ventas

- **Filas**: 679,950
- **Tamaño**: 22.56 MB

```sql
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`,`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=679951 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
/*!50100 PARTITION BY RANGE (year(`fecha`))
(PARTITION p2022 VALUES LESS THAN (2023) ENGINE = InnoDB,
 PARTITION p2023 VALUES LESS THAN (2024) ENGINE = InnoDB,
 PARTITION p2024 VALUES LESS THAN (2025) ENGINE = InnoDB,
 PARTITION p_future VALUES LESS THAN MAXVALUE ENGINE = InnoDB) */;
```

---

## ventas_no_particionada

- **Filas**: 679,946
- **Tamaño**: 15.09 MB

```sql
CREATE TABLE `ventas_no_particionada` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=679947 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_inventario_base_david

- **Filas**: 3,136,380
- **Tamaño**: 417.86 MB

```sql
CREATE TABLE `tb_inventario_base_david` (
  `Serial` text,
  `Item` text,
  `Org` text,
  `Revision` text,
  `Subinventory` text,
  `Locator` text,
  `Operation` text,
  `Job` text,
  `Step` text,
  `Lot` text,
  `State` text,
  `Status` text,
  `Receipt Date` text,
  `Ship Date` text,
  `Supplier Name` text,
  `Supplier Lot` text,
  `Supplier Serial` text,
  `Unit Number` text,
  `Attributes` text,
  `Unnamed: 20` text,
  `fecha_carga` datetime DEFAULT NULL,
  `ID_CIERRE` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_kpi_gerencia_calidad_tecnico

- **Filas**: 242,276
- **Tamaño**: 17.93 MB

```sql
CREATE TABLE `tb_kpi_gerencia_calidad_tecnico` (
  `PERIODO` text,
  `supervisor` text,
  `vigente` text,
  `TP_DESC_EMPRESA` text,
  `INCUMPLE_CALIDAD` bigint DEFAULT NULL,
  `Total_actividad` bigint DEFAULT NULL,
  `RUT_TECNICO_FS` text,
  `Nombre_short` text,
  `ZONA` text,
  `ACTIVIDAD` text,
  `TIPO_RED` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_paso_pyndc

- **Filas**: 135,509
- **Tamaño**: 63.96 MB

```sql
CREATE TABLE `tb_paso_pyndc` (
  `Empresa` text,
  `Zona` text,
  `Fecha fin#` datetime DEFAULT NULL,
  `Orden` text,
  `Orden empaq#` text,
  `Localidad` text,
  `Cod# tecnico` text,
  `Nombre tecnico` text,
  `Rut cliente` text,
  `Dir# cliente` text,
  `Clase vivienda` text,
  `Tipo vivienda` text,
  `Actividad` text,
  `Desc# Clave Fin#` text,
  `Concepto` text,
  `Est# concepto` text,
  `Grupo trabajo` text,
  `Tipo trabajo` text,
  `Trabajo` text,
  `Estado` text,
  `Declarada` text,
  `Usuario fin#` text,
  `Cantidad` bigint DEFAULT NULL,
  `concatena` text,
  `Ptos_referencial` double DEFAULT NULL,
  `Q_SSPP` double DEFAULT NULL,
  `Precio` double DEFAULT NULL,
  `Q_servicio` double DEFAULT NULL,
  `RGU` double DEFAULT NULL,
  `Nombre_tecnico_2` text,
  `rut` text,
  `Supervisor` text,
  `fecha_carga` date DEFAULT NULL,
  `Equipo` text,
  `ModeloFactura` text,
  `mes_contable` datetime DEFAULT NULL,
  `Nombre Bucket` text,
  `Tarifa` double DEFAULT NULL,
  `RutTecnicoOrig` text,
  `TP_DECLARADA` text,
  `Categoria` text,
  `FechaDeclaracion` datetime DEFAULT NULL,
  `DIFDIAS` double DEFAULT NULL,
  `SLA_DECLARACION` text,
  `HORA_CARGA` datetime DEFAULT NULL,
  `producto` text,
  `Tipo Red` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_toa_30dias_cloud

- **Filas**: 18,980
- **Tamaño**: 107.69 MB

```sql
CREATE TABLE `tb_toa_30dias_cloud` (
  `Técnico` text,
  `Orden de Trabajo` text,
  `Tipo de Actividad` text,
  `Subtipo` text,
  `Tipo de Orden` text,
  `Franja` text,
  `Inicio` text,
  `Fin` text,
  `Cliente` text,
  `Dirección` text,
  `Ciudad` text,
  `Número Cliente` text,
  `Celular` bigint DEFAULT NULL,
  `Clase de Vivienda` text,
  `Código Ciudad` text,
  `Código Localidad` text,
  `Código Territorio` text,
  `Código Zona` text,
  `Comentarios de la actividad` text,
  `Coord X` double DEFAULT NULL,
  `Coord Y` double DEFAULT NULL,
  `Fecha` text,
  `Ventana de Entrega` text,
  `Descripción de la actividad` text,
  `Duración` text,
  `email` text,
  `Estado de la actividad` text,
  `Fecha Certificada` text,
  `Flag Estado Aprovisión` text,
  `Flag Fallas Masivas` text,
  `Flag Materiales` text,
  `Notas Materiales` text,
  `Flag Niveles` text,
  `Grupo Socioeconomico` text,
  `Indicador Capacidad` int DEFAULT NULL,
  `Area derivación` text,
  `Nodo` int DEFAULT NULL,
  `Nombre Completo Persona` text,
  `Nro Orden` text,
  `Nro Solicitud de Servicio` text,
  `Teléfono` int DEFAULT NULL,
  `Prioridad` int DEFAULT NULL,
  `Razón de Cancelación` text,
  `Inicio - Fin` text,
  `Estado` text,
  `Provincia` text,
  `Subnodo` int DEFAULT NULL,
  `Territorio` text,
  `Tipo de Vivienda` text,
  `Tiempo de viaje` text,
  `Usuario Creador Actividad` text,
  `Zona de trabajo` text,
  `Código postal` text,
  `Zona` text,
  `Ventana de Servicio` text,
  `Código de Cierre` text,
  `Notas de Cierre (máx 500 caract. , sin caract especial "&")` text,
  `ID de actividad` int DEFAULT NULL,
  `Rut o Bucket` text,
  `Pasos` text,
  `Hora de reserva de actividad` text,
  `Flag Corte de Acometida` text,
  `Flag Retiro de Materiales` text,
  `Flag Televisión Análoga` text,
  `Flag que indica si hay Internet` text,
  `Flag que indica si hay Telefonía` text,
  `Flag que indica si hay Televisión` text,
  `Equipos sin retirar` text,
  `Inicio SLA` text,
  `Activity status change by` text,
  `MAC del MTA` text,
  `Tipo Red` text,
  `Código GIS` text,
  `Categorización del número de derivaciones` text,
  `Agenda confirmada` text,
  `Criterios de priorización` text,
  `Cantidad de derivaciones NO terreno` int DEFAULT NULL,
  `Cantidad de derivaciones terreno` int DEFAULT NULL,
  `Bucket Original` text,
  `Tipo de work skill Siebel` text,
  `Items Orden` text,
  `Notas de Suspensión (máx 500 caract. , sin caract especial "&")` text,
  `Usuario que suspende` text,
  `Hora de asignación de actividad` text,
  `Cierre Suspender` text,
  `Marca` text,
  `Tipo red producto` text,
  `Access ID` text,
  `Aptitud laboral` text,
  `Flag Resultado DROP` text,
  `Flag Resultado NAP` text,
  `Tipo NAP` text,
  `QR DROP` text,
  `Nap ID` text,
  `Nap Ubicación` text,
  `Puerto NAP` text,
  `EOS asociado` text,
  `Flag Cambio Pelo` text,
  `Respuesta Intervencion Cambio Pelo` text,
  `Flag Consulta Vecino` text,
  `Notas Consulta Vecino` text,
  `fecha_carga` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_turnos

- **Filas**: 95,325
- **Tamaño**: 12.46 MB

```sql
CREATE TABLE `tb_turnos` (
  `Mes_Cntble` datetime DEFAULT NULL,
  `Mes_crono` datetime DEFAULT NULL,
  `Fecha` datetime DEFAULT NULL,
  `Bases` text,
  `Superv` text,
  `Móvil` text,
  `Patente` text,
  `ID_RADIO` text,
  `FONO` text,
  `Codi` text,
  `RUT` text,
  `Cargo` text,
  `NOMBRE` text,
  `Hora_ingreso` text,
  `Hora_Salida` text,
  `Territorio` text,
  `ESTADO` text,
  `OBSERVACION` text,
  `planificacion` text,
  `area_trabajo` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_gestiona

- **Filas**: 94,370
- **Tamaño**: 19.67 MB

```sql
CREATE TABLE `tb_gestiona` (
  `ID` text,
  `Rut_Cliente` text,
  `Cod_Comuna` text,
  `Tipo_Actividad` text,
  `Plataforma` text,
  `Direccion` text,
  `NombreCliente` text,
  `TotalVisitas` text,
  `EPS` text,
  `Bucket` text,
  `FechaAgenda` text,
  `Accion` text,
  `Ejecutivo` text,
  `Observacion` text,
  `Nombre_de_Carga` text,
  `Fecha_de_Carga` text,
  `Fecha_de_Gestion` text,
  `Motivo` text,
  `Cant_de_Llamadas` text,
  `Valida_Agenda` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_logis_movimientos

- **Filas**: 94,181
- **Tamaño**: 13.16 MB

```sql
CREATE TABLE `tb_logis_movimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT NULL,
  `serie` text,
  `id_tecnico_origen` double DEFAULT NULL,
  `id_tecnico_destino` double DEFAULT NULL,
  `observacion` text,
  `id_movimiento` bigint DEFAULT NULL,
  `motivo` text,
  `ticket` text,
  `archivo_adj` text,
  `fecha_flag_cierre` datetime DEFAULT NULL,
  `flag_bodega_final` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_serie_fecha_completo` (`serie`(50),`fecha_hora`,`id_tecnico_origen`,`id_tecnico_destino`,`id_movimiento`)
) ENGINE=MyISAM AUTO_INCREMENT=220559 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_logis_movimientos_hist

- **Filas**: 84,434
- **Tamaño**: 5.17 MB

```sql
CREATE TABLE `tb_logis_movimientos_hist` (
  `id` int NOT NULL DEFAULT '0',
  `fecha_hora` datetime DEFAULT NULL,
  `serie` text,
  `id_tecnico_origen` double DEFAULT NULL,
  `id_tecnico_destino` double DEFAULT NULL,
  `observacion` text,
  `id_movimiento` bigint DEFAULT NULL,
  `motivo` text,
  `ticket` text,
  `archivo_adj` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_logis_movimientosiii

- **Filas**: 88,300
- **Tamaño**: 5.78 MB

```sql
CREATE TABLE `tb_logis_movimientosiii` (
  `id` bigint DEFAULT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  `serie` text,
  `id_tecnico_origen` double DEFAULT NULL,
  `id_tecnico_destino` double DEFAULT NULL,
  `observacion` text,
  `id_movimiento` bigint DEFAULT NULL,
  `motivo` text,
  `ticket` text,
  `archivo_adj` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## view_turnos

- **Filas**: 95,325
- **Tamaño**: 12.33 MB

```sql
CREATE TABLE `view_turnos` (
  `Mes_Cntble` datetime DEFAULT NULL,
  `Mes_crono` datetime DEFAULT NULL,
  `Fecha` datetime DEFAULT NULL,
  `Bases` text,
  `Superv` text,
  `Patente` text,
  `ID_RADIO` text,
  `FONO` text,
  `Codi` text,
  `RUT` text,
  `Cargo` text,
  `NOMBRE` text,
  `Hora_ingreso` text,
  `Hora_Salida` text,
  `Territorio` text,
  `ESTADO` text,
  `OBSERVACION` text,
  `binario_dias` bigint DEFAULT NULL,
  `dias_vacaciones_turno` bigint DEFAULT NULL,
  `dias_vacaciones_corrido` bigint DEFAULT NULL,
  `dias_licencia` bigint DEFAULT NULL,
  `dias_varios` bigint DEFAULT NULL,
  `dias_ausente` bigint DEFAULT NULL,
  `Turno_Base` bigint DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_calidad_plan_proactivo

- **Filas**: 59,315
- **Tamaño**: 12.00 MB

```sql
CREATE TABLE `tb_calidad_plan_proactivo` (
  `Fecha2` text,
  `Actividad2` text,
  `Tecnico2` text,
  `Orden2` text,
  `N_visitas_30` text,
  `Equipo_ult_visita` text,
  `Técnico1` text,
  `Fecha1` datetime DEFAULT NULL,
  `TipoActividad1` text,
  `RutCliente` text,
  `NombrePersona` text,
  `Estado1` text,
  `CódigoCierre1` text,
  `Estado2` text,
  `Rut o Bucket` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_py_flujo_calidad

- **Filas**: 54,223
- **Tamaño**: 30.88 MB

```sql
CREATE TABLE `tb_py_flujo_calidad` (
  `ot_sinflag` text,
  `FLAG_30_2` text,
  `RUT_TECNICO` text,
  `CODI_TECNICO` text,
  `TQWNombre` text,
  `Supervisor` text,
  `AREA` text,
  `FLAG_CALIDAD_30` text,
  `ACTIVIDAD` text,
  `DESC_CLAVEFIN` text,
  `DESC_CLAVEFIN_2` text,
  `IDEN_ORDEN` text,
  `IDEN_ORDEN_2` text,
  `RUT_PERSONA` text,
  `FECH_FIN` text,
  `FECH_FIN_2` text,
  `CODI_TECNICO_2` text,
  `DESC_EMPRESA_2` text,
  `GLSA_DIRECC` text,
  `IDEN_VIVIENDA` text,
  `COMUNA` text,
  `MES_CONTABLE` text,
  `MES_CRONO` text,
  `fecha_carga` text,
  `responsable` text,
  `sub_categoria` text,
  `flag_calidad_final` text,
  `tipo_cliente` text,
  `Q_reiterado` text,
  `CUMPLE30` text,
  `Original_RUT_TECNICO` text,
  `CodigoCierre` text,
  `CodigoCierre2` text,
  `mot_gen_super` text,
  `motivo_rechazo` text,
  `motivo` text,
  `HaySolicitud` text,
  `Calidad60TQW` text,
  `Calidad30TQW` text,
  `Calidad30TQW_bin` text,
  `Calidad60VTR` text,
  `Calidad30VTR` text,
  `OrigenExcepcion` text,
  `HayGestionSoporte` text,
  `SoporteEjecutivo` text,
  `SoporteFechaReg` text,
  `observacion` text,
  `ID_SOLICITUD` text,
  `tipo_red` text,
  `fecha_actualizacion` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tqw_produccion

- **Filas**: 51,236
- **Tamaño**: 3.29 MB

```sql
CREATE TABLE `tqw_produccion` (
  `Tipo_cliente` text,
  `Mes` bigint DEFAULT NULL,
  `ZONA_OPERACIONAL` text,
  `Comuna` text,
  `Total` bigint DEFAULT NULL,
  `anual` bigint DEFAULT NULL,
  `dia` bigint DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_cpe_analyzed

- **Filas**: 95,134
- **Tamaño**: 51.58 MB

```sql
CREATE TABLE `tb_cpe_analyzed` (
  `ID_CLIENTE` text,
  `TIPO_CLIENTE` text,
  `NOMBRE_CUENTA` text,
  `CODI_LOCALIDAD` text,
  `NODO` text,
  `SUBNODO` text,
  `BUCKET` text,
  `FUENTE_BASE` text,
  `NOMBRE_PEDIDO` text,
  `NUM_PEDIDO` text,
  `FECHA_CREACION_PEDIDO` text,
  `FECHA_ESTADO_PEDIDO` text,
  `ESTADO_PEDIDO` text,
  `NUM_SOL_SERV` text,
  `FECHA_CIERRE_ACT_SOL` text,
  `AREA_SS` text,
  `ESTADO_SS` text,
  `FECHA_SOLUCION_SOL` text,
  `FECHA_CREACION_SOL` text,
  `ID_ACTIVIDAD` text,
  `FECHA_ACTUALIZACION_ACTIVIDAD` text,
  `FECHA_FIN_ACTIVIDAD` text,
  `ESTADO_ACTIVIDAD` text,
  `DESCRIPCION_ACTIVIDAD` text,
  `TIPO_ACTIVIDAD` text,
  `RUT_TECNICO_FS` text,
  `TIPO_RESOLUCION` text,
  `CODIGO_LOCALIDAD_TOA` text,
  `CODIGO_CIERRE` text,
  `ETA` text,
  `TRAVEL` text,
  `LONGITUD_TOA` text,
  `FECHA_COLA` text,
  `VENT_INI_SERV` text,
  `VENT_FIN_SERV` text,
  `ESTADO` text,
  `DESC_EMPRESA` text,
  `ULTIMO_PEDIDO_CREADO` text,
  `ULTIMA_ACTIVIDAD_TERRENO` text,
  `FLAG_CAMBIOPROMO_VENTA` text,
  `FLAG_CAMBIOPROMO_DX` text,
  `FLAG_MODIFICACION_CAMBIO` text,
  `ACTIVIDAD` text,
  `DIA` text,
  `LINEA_PROD` text,
  `ZONA` text,
  `COMUNA` text,
  `INSTALL_MOD_EQUIPO_1` text,
  `INSTALL_MOD_EQUIPO_2` text,
  `INSTALL_MOD_EQUIPO_3` text,
  `INSTALL_MOD_EQUIPO_4` text,
  `DEINSTALL_MOD_EQUIPO_1` text,
  `DEINSTALL_MOD_EQUIPO_2` text,
  `DEINSTALL_MOD_EQUIPO_3` text,
  `DEINSTALL_MOD_EQUIPO_4` text,
  `INSTALL_SERIAL_NO_1` text,
  `INSTALL_SERIAL_NO_2` text,
  `INSTALL_SERIAL_NO_3` text,
  `INSTALL_SERIAL_NO_4` text,
  `DEINSTALL_SERIAL_NO_1` text,
  `DEINSTALL_SERIAL_NO_2` text,
  `DEINSTALL_SERIAL_NO_3` text,
  `DEINSTALL_SERIAL_NO_4` text,
  `N_Conteo` text,
  `Nombre_pedido_o_solicitud` text,
  `FLAG_CAMBIO_IDACTIVIDAD` text,
  `ID_VIVIENDA` text,
  `TIPO_SOL_SER` text,
  `X_Ocs_Tipo_Red` text,
  `TIPO_RED_PRODUCTO_TOA` text,
  `MARCA_TOA` text,
  `ID_CIA` text,
  `TIPO_RED_TOA` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_inventario_resultado_final

- **Filas**: 56,226
- **Tamaño**: 6.79 MB

```sql
CREATE TABLE `tb_inventario_resultado_final` (
  `id_cierre` text,
  `fecha` datetime DEFAULT NULL,
  `serie` text,
  `id_tecnico` text,
  `locator_inv` text,
  `id_movimiento` bigint DEFAULT NULL,
  `Costo` char(0) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Depreciación` char(0) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `SerieCargada` text,
  `ESTADO_APP` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `Semantica` longtext,
  `flujo` text,
  `Valorfinal` double DEFAULT NULL,
  `descuento` bigint DEFAULT NULL,
  `Geo_inv` text,
  `Flag_Gestion` double DEFAULT NULL,
  `supervisor` text,
  `vigente` text,
  KEY `idx_id_cierre` (`id_cierre`(250))
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_logis_cierre_inventario2

- **Filas**: 65,781
- **Tamaño**: 10.01 MB

```sql
CREATE TABLE `tb_logis_cierre_inventario2` (
  `id_auto` bigint NOT NULL AUTO_INCREMENT,
  `ID_CIERRE` text,
  `fecha` datetime DEFAULT NULL,
  `Serial` text,
  `id_usuario` double DEFAULT NULL,
  `id_tecnico` text,
  `id_movimiento` double DEFAULT NULL,
  `flujo` text,
  `fecha_envio` text,
  `state` text,
  `fecha_carga_reversa` datetime DEFAULT NULL,
  `ValorFinal` double DEFAULT NULL,
  `Geo_inv` text,
  `FLAG_GESTION` double DEFAULT NULL,
  `locator_inv` text,
  `flag_job` varchar(1) DEFAULT NULL,
  `flag_modelo_serie` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_auto`),
  KEY `idx_inv_serial` (`Serial`(50))
) ENGINE=MyISAM AUTO_INCREMENT=100249 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_vtr_px_diaria

- **Filas**: 30,520
- **Tamaño**: 8.28 MB

```sql
CREATE TABLE `tb_vtr_px_diaria` (
  `XXXXXXXX` text,
  `ZONA` text,
  `COMUNA` text,
  `EMPRESA` text,
  `Rut Tecnico` text,
  `Tecnico` text,
  `CODI_TECNICO` text,
  `Día` bigint DEFAULT NULL,
  `Q Tecnicos` bigint DEFAULT NULL,
  `Total Actividades` bigint DEFAULT NULL,
  `Plataforma` text,
  `TIPO RED` text,
  `CATEGORIA` text,
  `SUB-CATEGORIA` text,
  `Productividad` text,
  `Bucket` text,
  `Nombre Bucket` text,
  `SERVICIO EPS` text,
  `Tipo Operación` text,
  `Tec. Poli-Funcional` text,
  `Nombre` text,
  `Tipo Red Producto` text,
  `Marca` text,
  `EPS` text,
  `AGRUPA(A&T).Recuento` bigint DEFAULT NULL,
  `REGION` double DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

## tb_vtr_px_diaria_lv2

- **Filas**: 30,229
- **Tamaño**: 8.21 MB

```sql
CREATE TABLE `tb_vtr_px_diaria_lv2` (
  `XXXXXXXX` text,
  `ZONA` text,
  `COMUNA` text,
  `EMPRESA` text,
  `Rut Tecnico` text,
  `Tecnico` text,
  `CODI_TECNICO` text,
  `Día` bigint DEFAULT NULL,
  `Q Tecnicos` bigint DEFAULT NULL,
  `Total Actividades` bigint DEFAULT NULL,
  `Plataforma` text,
  `TIPO RED` text,
  `CATEGORIA` text,
  `SUB-CATEGORIA` text,
  `Productividad` text,
  `Bucket` text,
  `Nombre Bucket` text,
  `SERVICIO EPS` text,
  `Tipo Operación` text,
  `Tec. Poli-Funcional` text,
  `Nombre` text,
  `Tipo Red Producto` text,
  `Marca` text,
  `EPS` text,
  `AGRUPA(A&T).Recuento` bigint DEFAULT NULL,
  `REGION` double DEFAULT NULL,
  `supervisor` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---



# Vistas (Views)

Las siguientes vistas necesitan ser recreadas manualmente.

---

## tb_logistica_usabilidad_mensual

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `tb_logistica_usabilidad_mensual` AS with `base_data` as (select `a`.`RUT` AS `RUT`,`a`.`FECHA` AS `FECHA`,coalesce(`b`.`cantidad_registros`,0) AS `cantidad_registros`,`a`.`nombre` AS `nombre`,month(`a`.`FECHA`) AS `mes`,week(`a`.`FECHA`,0) AS `semana` from ((select `tb_turnos_py`.`RUT` AS `RUT`,str_to_date(`tb_turnos_py`.`FECHA`,'%d/%m/%Y') AS `FECHA`,`tb_turnos_py`.`NOMBRE` AS `nombre` from `tb_turnos_py` where ((str_to_date(`tb_turnos_py`.`FECHA`,'%d/%m/%Y') >= '2024-05-01') and (str_to_date(`tb_turnos_py`.`FECHA`,'%d/%m/%Y') < '2024-12-01') and (`tb_turnos_py`.`Estado` = 'OPERATIVO') and (`tb_turnos_py`.`SUPERVISOR` in ('ARIAS','BARRERA','CORROTEA','GOMEZ','GUERRERO'))) group by `tb_turnos_py`.`RUT`,str_to_date(`tb_turnos_py`.`FECHA`,'%d/%m/%Y'),`tb_turnos_py`.`SUPERVISOR`,`tb_turnos_py`.`NOMBRE`) `a` left join (select cast(`a`.`fecha_hora` as date) AS `fecha_hora`,`b`.`Rut` AS `rut`,count(0) AS `cantidad_registros` from (`tb_logis_movimientos` `a` left join `tb_user_tqw` `b` on((`a`.`id_tecnico_origen` = `b`.`ID`))) where ((cast(`a`.`fecha_hora` as date) >= '2024-05-01') and (cast(`a`.`fecha_hora` as date) < '2024-12-01')) group by cast(`a`.`fecha_hora` as date),`b`.`Rut`) `b` on(((`a`.`RUT` = `b`.`rut`) and (`a`.`FECHA` = cast(`b`.`fecha_hora` as date)))))) select `base_data`.`FECHA` AS `FECHA`,count(distinct `base_data`.`RUT`) AS `total_ruts`,count(distinct (case when (`base_data`.`cantidad_registros` > 0) then `base_data`.`RUT` end)) AS `ruts_with_records`,cast(((count(distinct (case when (`base_data`.`cantidad_registros` > 0) then `base_data`.`RUT` end)) * 100.0) / count(distinct `base_data`.`RUT`)) as decimal(5,2)) AS `percentage_ruts_with_records`,`base_data`.`mes` AS `mes`,`base_data`.`semana` AS `semana` from `base_data` group by `base_data`.`FECHA`,`base_data`.`mes`,`base_data`.`semana`;
```

---

## tb_logistica_usabilidad_mensual_super

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `tb_logistica_usabilidad_mensual_super` AS with `base_data` as (select `a`.`RUT` AS `RUT`,`a`.`FECHA` AS `FECHA`,ifnull(`b`.`cantidad_registros`,0) AS `cantidad_registros`,`a`.`supervisor` AS `supervisor`,`a`.`nombre` AS `nombre`,week(str_to_date(`a`.`FECHA`,'%d/%m/%Y'),0) AS `semana`,month(str_to_date(`a`.`FECHA`,'%d/%m/%Y')) AS `mes` from ((select `ttp`.`RUT` AS `RUT`,`ttp`.`FECHA` AS `FECHA`,`ttp`.`SUPERVISOR` AS `supervisor`,`ttp`.`NOMBRE` AS `nombre` from `tb_turnos_py` `ttp` where ((str_to_date(`ttp`.`FECHA`,'%d/%m/%Y') >= '2024-05-01') and (str_to_date(`ttp`.`FECHA`,'%d/%m/%Y') < '2024-12-01') and (`ttp`.`Estado` = 'OPERATIVO') and (`ttp`.`SUPERVISOR` in ('ARIAS','BARRERA','CORROTEA','GOMEZ','GUERRERO'))) group by `ttp`.`RUT`,`ttp`.`FECHA`,`ttp`.`SUPERVISOR`,`ttp`.`NOMBRE`) `a` left join (select cast(`a`.`fecha_hora` as date) AS `fecha_hora`,`b`.`Rut` AS `rut`,count(0) AS `cantidad_registros` from (`tb_logis_movimientos` `a` left join `tb_user_tqw` `b` on((`a`.`id_tecnico_origen` = `b`.`ID`))) where ((cast(`a`.`fecha_hora` as date) >= '2024-05-01') and (cast(`a`.`fecha_hora` as date) < '2024-12-01')) group by cast(`a`.`fecha_hora` as date),`b`.`Rut`) `b` on(((`a`.`RUT` = `b`.`rut`) and (str_to_date(`a`.`FECHA`,'%d/%m/%Y') = `b`.`fecha_hora`))))) select `base_data`.`FECHA` AS `FECHA`,`base_data`.`supervisor` AS `supervisor`,count(distinct `base_data`.`RUT`) AS `total_ruts`,count(distinct (case when (`base_data`.`cantidad_registros` > 0) then `base_data`.`RUT` end)) AS `ruts_with_records`,((count(distinct (case when (`base_data`.`cantidad_registros` > 0) then `base_data`.`RUT` end)) * 100.0) / count(distinct `base_data`.`RUT`)) AS `percentage_ruts_with_records`,`base_data`.`semana` AS `semana`,`base_data`.`mes` AS `mes` from `base_data` group by `base_data`.`FECHA`,`base_data`.`supervisor`,`base_data`.`semana`,`base_data`.`mes` order by str_to_date(`base_data`.`FECHA`,'%d/%m/%Y');
```

---

## v_active_sessions

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `v_active_sessions` AS select `u`.`id` AS `user_id`,`u`.`usuario` AS `email`,`u`.`usuario` AS `nombre`,count(`us`.`id`) AS `active_sessions`,max(`us`.`last_activity`) AS `most_recent_activity`,group_concat(distinct `us`.`device_name` separator ',') AS `active_devices` from (`tb_usuarios` `u` left join `user_sessions` `us` on(((`u`.`id` = `us`.`user_id`) and (`us`.`is_active` = true) and (`us`.`expires_at` > now())))) group by `u`.`id`,`u`.`usuario`,`u`.`usuario`;
```

---

## v_oauth_performance_history

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `v_oauth_performance_history` AS select cast(`la`.`created_at` as date) AS `date`,`la`.`login_method` AS `provider`,count(0) AS `total_attempts`,sum((case when (`la`.`success` = true) then 1 else 0 end)) AS `successful_attempts`,sum((case when (`la`.`success` = false) then 1 else 0 end)) AS `failed_attempts`,round(((sum((case when (`la`.`success` = true) then 1 else 0 end)) / count(0)) * 100),2) AS `success_rate`,count(distinct `la`.`email`) AS `unique_users` from `login_attempts` `la` where ((`la`.`login_method` in ('google','facebook')) and (`la`.`created_at` >= (now() - interval 30 day))) group by cast(`la`.`created_at` as date),`la`.`login_method` order by `date` desc,`provider`;
```

---

## v_oauth_provider_status

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `v_oauth_provider_status` AS select `ops`.`provider` AS `provider`,`ops`.`is_available` AS `is_available`,`ops`.`last_check` AS `last_check`,`ops`.`last_error` AS `last_error`,`ops`.`error_count` AS `error_count`,`ops`.`success_rate` AS `success_rate`,`ops`.`avg_response_time_ms` AS `avg_response_time_ms`,(case when `ops`.`is_available` then 'Available' else 'Unavailable (Circuit Breaker)' end) AS `status_text`,(case when (`ops`.`error_count` >= 10) then 'Critical' when (`ops`.`error_count` >= 5) then 'Warning' when (`ops`.`error_count` >= 1) then 'Caution' else 'Healthy' end) AS `health_status`,`ops`.`metadata` AS `metadata`,(select count(0) from `login_attempts` `la` where ((`la`.`login_method` = `ops`.`provider`) and (`la`.`created_at` >= (now() - interval 24 hour)))) AS `attempts_24h`,(select count(0) from `login_attempts` `la` where ((`la`.`login_method` = `ops`.`provider`) and (`la`.`success` = true) and (`la`.`created_at` >= (now() - interval 24 hour)))) AS `successes_24h`,(select count(0) from `login_attempts` `la` where ((`la`.`login_method` = `ops`.`provider`) and (`la`.`success` = false) and (`la`.`created_at` >= (now() - interval 24 hour)))) AS `failures_24h` from `oauth_provider_status` `ops`;
```

---

## v_recent_critical_events

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `v_recent_critical_events` AS select `se`.`id` AS `id`,`se`.`event_type` AS `event_type`,`se`.`severity` AS `severity`,`u`.`usuario` AS `user_email`,`u`.`usuario` AS `user_name`,`se`.`description` AS `description`,`se`.`ip_address` AS `ip_address`,`se`.`created_at` AS `created_at` from (`security_events` `se` left join `tb_usuarios` `u` on((`se`.`user_id` = `u`.`id`))) where ((`se`.`severity` in ('high','critical')) and (`se`.`created_at` >= (now() - interval 7 day))) order by `se`.`created_at` desc;
```

---

## v_recent_login_activity

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `v_recent_login_activity` AS select `u`.`id` AS `id`,`u`.`usuario` AS `email`,`u`.`usuario` AS `nombre`,count((case when (`la`.`success` = true) then 1 end)) AS `successful_logins`,count((case when (`la`.`success` = false) then 1 end)) AS `failed_logins`,max(`la`.`created_at`) AS `last_login_attempt`,group_concat(distinct `la`.`failure_reason` separator ',') AS `recent_failure_reasons` from (`tb_usuarios` `u` left join `login_attempts` `la` on(((`u`.`id` = `la`.`user_id`) and (`la`.`created_at` >= (now() - interval 24 hour))))) group by `u`.`id`,`u`.`usuario`,`u`.`usuario`;
```

---

## vw_cumplimiento_por_tipo_auditoria

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `vw_cumplimiento_por_tipo_auditoria` AS select `tb_auditorias_terreno`.`tipo_auditoria` AS `tipo_auditoria`,count(0) AS `total`,((sum((case when (`tb_auditorias_terreno`.`insp_estado_acometida` = 'CUMPLE') then 1 else 0 end)) / nullif(sum((case when ((`tb_auditorias_terreno`.`insp_estado_acometida` is not null) and (`tb_auditorias_terreno`.`insp_estado_acometida` <> 'N/A')) then 1 else 0 end)),0)) * 100) AS `pct_cumple_acometida`,((sum((case when (`tb_auditorias_terreno`.`insp_estado_conectores` = 'CUMPLE') then 1 else 0 end)) / nullif(sum((case when ((`tb_auditorias_terreno`.`insp_estado_conectores` is not null) and (`tb_auditorias_terreno`.`insp_estado_conectores` <> 'N/A')) then 1 else 0 end)),0)) * 100) AS `pct_cumple_conectores`,((sum((case when (`tb_auditorias_terreno`.`insp_estado_cableado` = 'CUMPLE') then 1 else 0 end)) / nullif(sum((case when ((`tb_auditorias_terreno`.`insp_estado_cableado` is not null) and (`tb_auditorias_terreno`.`insp_estado_cableado` <> 'N/A')) then 1 else 0 end)),0)) * 100) AS `pct_cumple_cableado`,((sum((case when (`tb_auditorias_terreno`.`estado_cpe_tx` = 'CUMPLE') then 1 else 0 end)) / nullif(sum((case when ((`tb_auditorias_terreno`.`estado_cpe_tx` is not null) and (`tb_auditorias_terreno`.`estado_cpe_tx` <> 'N/A')) then 1 else 0 end)),0)) * 100) AS `pct_cumple_cpe_tx`,((sum((case when (`tb_auditorias_terreno`.`estado_cpe_rx` = 'CUMPLE') then 1 else 0 end)) / nullif(sum((case when ((`tb_auditorias_terreno`.`estado_cpe_rx` is not null) and (`tb_auditorias_terreno`.`estado_cpe_rx` <> 'N/A')) then 1 else 0 end)),0)) * 100) AS `pct_cumple_cpe_rx`,((sum((case when (`tb_auditorias_terreno`.`estado_cpe_snr` = 'CUMPLE') then 1 else 0 end)) / nullif(sum((case when ((`tb_auditorias_terreno`.`estado_cpe_snr` is not null) and (`tb_auditorias_terreno`.`estado_cpe_snr` <> 'N/A')) then 1 else 0 end)),0)) * 100) AS `pct_cumple_cpe_snr` from `tb_auditorias_terreno` group by `tb_auditorias_terreno`.`tipo_auditoria`;
```

---

## vw_logis_semaforo

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `vw_logis_semaforo` AS with `ultima_transferencia` as (select `tlsst`.`serie` AS `serie`,`tut3`.`Rut` AS `rut_destino` from ((`tb_logis_tecnico_serie_transfiere` `tlsst` left join `tb_user_tqw` `tut3` on((`tut3`.`ID` = `tlsst`.`id_destino`))) join (select `tb_logis_tecnico_serie_transfiere`.`serie` AS `serie`,max(`tb_logis_tecnico_serie_transfiere`.`Fecha`) AS `max_fecha` from `tb_logis_tecnico_serie_transfiere` where (`tb_logis_tecnico_serie_transfiere`.`flag_gest` <> 0) group by `tb_logis_tecnico_serie_transfiere`.`serie`) `max_dates` on(((`tlsst`.`serie` = `max_dates`.`serie`) and (`tlsst`.`Fecha` = `max_dates`.`max_fecha`)))) where (`tlsst`.`flag_gest` <> 0)), `tb_logis_union_seriado` as (select `a`.`Serial` AS `Serial`,`a`.`Item` AS `Item`,`a`.`Org` AS `Org`,`a`.`Revision` AS `Revision`,`a`.`State` AS `State`,`a`.`Job` AS `job`,`a`.`Subinventory` AS `Subinventory`,`a`.`Flujo` AS `Flujo`,`a`.`Unit Number` AS `Unit Number`,`b`.`id_movimiento` AS `ult_movimiento` from ((select `directa`.`Serial` AS `Serial`,`directa`.`Item` AS `Item`,`directa`.`Org` AS `Org`,`directa`.`Revision` AS `Revision`,`directa`.`State` AS `State`,`directa`.`Job` AS `Job`,(case when (`ut`.`rut_destino` is not null) then `ut`.`rut_destino` else `directa`.`Subinventory` end) AS `Subinventory`,'DIRECTA' AS `Flujo`,`directa`.`Unit Number` AS `Unit Number` from (`tb_ferret_directa1` `directa` left join `ultima_transferencia` `ut` on((`ut`.`serie` = `directa`.`Serial`))) where (`directa`.`State` <> 'Issued out of stores') union all select `reversa`.`Serial` AS `Serial`,`reversa`.`Item` AS `Item`,`reversa`.`Org` AS `Org`,`reversa`.`Revision` AS `Revision`,`reversa`.`State` AS `State`,`reversa`.`Job` AS `Job`,`reversa`.`Locator` AS `Subinventory`,'REVERSA' AS `Flujo`,`reversa`.`Unit Number` AS `Unit Number` from `tb_logist_bdreversa` `reversa`) `a` left join `tb_logis_movimientos` `b` on((`a`.`Unit Number` = `b`.`id`)))), `rut_prefijos` as (select `tb_user_tqw`.`ID` AS `id`,`tb_user_tqw`.`nombre_short` AS `nombre_short`,`tb_user_tqw`.`Rut` AS `rut`,left(`tb_user_tqw`.`Rut`,(char_length(`tb_user_tqw`.`Rut`) - 2)) AS `rut_prefijo` from `tb_user_tqw` where (`tb_user_tqw`.`nombre_short` <> '')), `directa_stats` as (select `tut`.`nombre_short` AS `nombre_short`,count((case when ((`rz`.`ult_movimiento` is null) or (`rz`.`ult_movimiento` in (0,8,9,11,18))) then 1 end)) AS `PendientesCountDirecta`,sum((case when ((`rz`.`ult_movimiento` not in (8,9,11,18,0)) and (`rz`.`ult_movimiento` is not null)) then 1 else 0 end)) AS `GestionadosDirecta`,round(((count((case when ((`rz`.`ult_movimiento` is null) or (`rz`.`ult_movimiento` in (0,8,9,11,18))) then 1 end)) * 100.0) / nullif(count(0),0)),2) AS `PorcentajeDirecta`,sum((case when (`rz`.`ult_movimiento` in (3,12,5,4,20,16,13,7,2)) then 0 else `rz`.`job` end)) AS `Job`,sum((case when ((`rz`.`job` = 1) and ((`rz`.`ult_movimiento` <> 3) or (`rz`.`ult_movimiento` is null))) then 1 else 0 end)) AS `SUM_JOB`,`rz`.`Org` AS `Org` from (`tb_logis_union_seriado` `rz` left join `rut_prefijos` `tut` on((left(`rz`.`Subinventory`,(char_length(`rz`.`Subinventory`) - 2)) = `tut`.`rut_prefijo`))) where (`rz`.`Flujo` = 'DIRECTA') group by `tut`.`nombre_short`,`rz`.`Org` having (`tut`.`nombre_short` is not null)), `reversa_stats` as (select `tut`.`nombre_short` AS `nombre_short`,count((case when ((`rz_reversa`.`ult_movimiento` is null) or (`rz_reversa`.`ult_movimiento` in (8,9,11,18,10,23))) then 1 end)) AS `PendientesCountReversa`,sum((case when (`rz_reversa`.`ult_movimiento` in (6,7,22)) then 1 else 0 end)) AS `transitoReversa`,sum((case when (`rz_reversa`.`ult_movimiento` = 12) then 1 else 0 end)) AS `GestionadosReversa`,round(((count((case when ((`rz_reversa`.`ult_movimiento` is null) or (`rz_reversa`.`ult_movimiento` in (0,8,9,11,18,10))) then 1 end)) * 100.0) / nullif(count(0),0)),2) AS `PorcentajeReversa` from (`tb_logis_union_seriado` `rz_reversa` left join `rut_prefijos` `tut` on((left(`rz_reversa`.`Subinventory`,(char_length(`rz_reversa`.`Subinventory`) - 2)) = `tut`.`rut_prefijo`))) where (`rz_reversa`.`Flujo` = 'REVERSA') group by `tut`.`nombre_short` having (`tut`.`nombre_short` is not null)) select `tut`.`nombre_short` AS `Nombre_Short`,coalesce(`directa`.`PendientesCountDirecta`,0) AS `PendientesCount`,coalesce(`directa`.`GestionadosDirecta`,0) AS `Gestionados`,coalesce(`directa`.`PorcentajeDirecta`,0) AS `PorcentajeDirecta`,coalesce(`reversa`.`PendientesCountReversa`,0) AS `PendientesCountReversa`,coalesce(`reversa`.`transitoReversa`,0) AS `transitoReversa`,coalesce(`reversa`.`GestionadosReversa`,0) AS `GestionadosReversa`,coalesce(`reversa`.`PorcentajeReversa`,0) AS `PorcentajeReversa`,coalesce(`directa`.`SUM_JOB`,0) AS `SUM_JOB`,`directa`.`Org` AS `Org` from ((`tb_user_tqw` `tut` left join `directa_stats` `directa` on((`tut`.`nombre_short` = `directa`.`nombre_short`))) left join `reversa_stats` `reversa` on((`tut`.`nombre_short` = `reversa`.`nombre_short`))) where (((`directa`.`nombre_short` is not null) or (`reversa`.`nombre_short` is not null)) and (`tut`.`nombre_short` <> ''));
```

---

## vw_produccion_ndc_rank_red_factura

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `vw_produccion_ndc_rank_red_factura` AS with `ftth_daily` as (select `produccion_ndc_rank_red`.`rut` AS `rut`,`produccion_ndc_rank_red`.`Nombre tecnico` AS `nombre_tecnico`,count(distinct cast(`produccion_ndc_rank_red`.`Fecha fin#` as date)) AS `dias_ftth`,sum(`produccion_ndc_rank_red`.`RGU`) AS `total_rgu` from `produccion_ndc_rank_red` where ((`produccion_ndc_rank_red`.`Fecha fin#` between '2025-05-01 00:00:00' and '2025-05-22 23:59:59') and (`produccion_ndc_rank_red`.`Tipo Red` = 'FTTH')) group by `produccion_ndc_rank_red`.`rut`,`produccion_ndc_rank_red`.`Nombre tecnico`), `hfc_daily` as (select `produccion_ndc_rank_red`.`rut` AS `rut`,`produccion_ndc_rank_red`.`Nombre tecnico` AS `nombre_tecnico`,count(distinct cast(`produccion_ndc_rank_red`.`Fecha fin#` as date)) AS `dias_hfc`,sum(`produccion_ndc_rank_red`.`Ptos_referencial`) AS `total_ptos` from `produccion_ndc_rank_red` where ((`produccion_ndc_rank_red`.`Fecha fin#` between '2025-05-01 00:00:00' and '2025-05-22 23:59:59') and (`produccion_ndc_rank_red`.`Tipo Red` = 'HFC')) group by `produccion_ndc_rank_red`.`rut`,`produccion_ndc_rank_red`.`Nombre tecnico`), `all_techs` as (select distinct `produccion_ndc_rank_red`.`rut` AS `rut`,`produccion_ndc_rank_red`.`Nombre tecnico` AS `nombre_tecnico` from `produccion_ndc_rank_red` where (`produccion_ndc_rank_red`.`Fecha fin#` between '2025-05-01 00:00:00' and '2025-05-22 23:59:59')) select `a`.`rut` AS `rut`,`a`.`nombre_tecnico` AS `nombre_tecnico`,ifnull(`f`.`total_rgu`,0) AS `total_rgu`,ifnull(`f`.`dias_ftth`,0) AS `dias_ftth`,ifnull(`h`.`total_ptos`,0) AS `total_ptos`,ifnull(`h`.`dias_hfc`,0) AS `dias_hfc`,(case when (ifnull(`f`.`dias_ftth`,0) > 0) then round((ifnull(`f`.`total_rgu`,0) / `f`.`dias_ftth`),2) else 0 end) AS `promedio_diario_ftth`,(case when (ifnull(`h`.`dias_hfc`,0) > 0) then round((ifnull(`h`.`total_ptos`,0) / `h`.`dias_hfc`),2) else 0 end) AS `promedio_diario_hfc` from ((`all_techs` `a` left join `ftth_daily` `f` on(((`a`.`rut` = `f`.`rut`) and (`a`.`nombre_tecnico` = `f`.`nombre_tecnico`)))) left join `hfc_daily` `h` on(((`a`.`rut` = `h`.`rut`) and (`a`.`nombre_tecnico` = `h`.`nombre_tecnico`)))) where ((`f`.`rut` is not null) or (`h`.`rut` is not null)) order by `a`.`rut`,`a`.`nombre_tecnico`;
```

---

## vw_resumen_auditorias_por_tecnico

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `vw_resumen_auditorias_por_tecnico` AS select `tb_auditorias_terreno`.`nombre_tecnico` AS `nombre_tecnico`,count(0) AS `total_auditorias`,sum((case when (`tb_auditorias_terreno`.`tipo_auditoria` = 'Inspeccion en terreno') then 1 else 0 end)) AS `inspecciones_terreno`,sum((case when (`tb_auditorias_terreno`.`tipo_auditoria` = 'Auditoria Herramientas') then 1 else 0 end)) AS `auditorias_herramientas`,sum((case when (`tb_auditorias_terreno`.`tipo_auditoria` = 'Prevencion de riesgos') then 1 else 0 end)) AS `auditorias_prevencion`,sum((case when (`tb_auditorias_terreno`.`tipo_auditoria` = 'Auditoria Vehiculo') then 1 else 0 end)) AS `auditorias_vehiculo`,min(`tb_auditorias_terreno`.`fecha`) AS `primera_auditoria`,max(`tb_auditorias_terreno`.`fecha`) AS `ultima_auditoria` from `tb_auditorias_terreno` group by `tb_auditorias_terreno`.`nombre_tecnico`;
```

---

## vw_user_tqw_limited

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `vw_user_tqw_limited` AS select `tb_user_tqw`.`ID` AS `ID`,`tb_user_tqw`.`email` AS `email`,`tb_user_tqw`.`Nombre` AS `Nombre`,`tb_user_tqw`.`area` AS `area`,`tb_user_tqw`.`ZONA_GEO` AS `ZONA_GEO`,`tb_user_tqw`.`nombre_ndc` AS `nombre_ndc`,`tb_user_tqw`.`nombre_short` AS `nombre_short`,`tb_user_tqw`.`PERFIL` AS `PERFIL`,`tb_user_tqw`.`Vigente` AS `Vigente` from `tb_user_tqw` where (((`tb_user_tqw`.`Vigente` = 'S') or (`tb_user_tqw`.`Vigente` is null)) and (`tb_user_tqw`.`PERFIL` in ('TECNICO','SUPERVISOR','ADMINISTRATIVO')));
```

---

## vw_user_tqw_readonly

```sql
CREATE ALGORITHM=UNDEFINED DEFINER=`ncornejo`@`%` SQL SECURITY DEFINER VIEW `vw_user_tqw_readonly` AS select `tb_user_tqw`.`ID` AS `ID`,`tb_user_tqw`.`email` AS `email`,`tb_user_tqw`.`reg_Date` AS `reg_Date`,`tb_user_tqw`.`Nombre` AS `Nombre`,`tb_user_tqw`.`area` AS `area`,`tb_user_tqw`.`SUPERVISOR` AS `SUPERVISOR`,`tb_user_tqw`.`Rut` AS `Rut`,`tb_user_tqw`.`correo_super` AS `correo_super`,`tb_user_tqw`.`IDEN_USER` AS `IDEN_USER`,`tb_user_tqw`.`Vigente` AS `Vigente`,`tb_user_tqw`.`ZONA_GEO` AS `ZONA_GEO`,`tb_user_tqw`.`nombre_ndc` AS `nombre_ndc`,`tb_user_tqw`.`nombre_short` AS `nombre_short`,`tb_user_tqw`.`PERFIL` AS `PERFIL` from `tb_user_tqw` where ((`tb_user_tqw`.`Vigente` = 'S') or (`tb_user_tqw`.`Vigente` is null));
```

---



# Stored Procedures

Los siguientes procedimientos almacenados necesitan ser recreados manualmente.

---

## check_truncate_protection

```sql
DROP PROCEDURE IF EXISTS `check_truncate_protection`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `check_truncate_protection`(IN table_name VARCHAR(255))
BEGIN IF table_name = 'tp_modelo_seni_juni' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'TRUNCATE no permitido en la tabla tp_modelo_seni_juni - tabla protegida'; END IF; END$$

DELIMITER ;
```

---

## insertar_datos_prueba

```sql
DROP PROCEDURE IF EXISTS `insertar_datos_prueba`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `insertar_datos_prueba`()
BEGIN

    DECLARE i INT DEFAULT 0;
    WHILE i < 1000000 DO

        INSERT INTO ventas_no_particionada (fecha, monto) VALUES

        (DATE_ADD('2022-01-01', INTERVAL FLOOR(RAND() * 1095) DAY), RAND() * 10000);
        INSERT INTO ventas (fecha, monto) VALUES

        (DATE_ADD('2022-01-01', INTERVAL FLOOR(RAND() * 1095) DAY), RAND() * 10000);
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;
```

---

## refresh_mv_asignacion_tecnico_serie

```sql
DROP PROCEDURE IF EXISTS `refresh_mv_asignacion_tecnico_serie`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `refresh_mv_asignacion_tecnico_serie`()
BEGIN

    TRUNCATE TABLE mv_asignacion_tecnico_serie;

    INSERT INTO mv_asignacion_tecnico_serie

    SELECT 

        tut.Nombre_short,

        tut2.Nombre_short as Nombre2,

        A.serie as Serial,

        NULL as flag_bodega,

        A.id as last_id

    FROM TB_LOGIS_TECNICO_SERIE_TRANSFIERE A 

    LEFT JOIN tb_user_tqw tut ON tut.id = A.id_origen

    LEFT JOIN tb_user_tqw tut2 ON tut2.id = A.id_destino  

    LEFT JOIN TB_LOGIS_LOG_BODEGA_materialTecnico tllbmt ON tllbmt.serie = A.serie  

    WHERE A.flagacepta = 'Si'

    AND A.flag_bodega IS NULL;



    -- CREATE INDEX idx_mv_asignacion_tecnico_serie_id ON mv_asignacion_tecnico_serie(last_id);

END$$

DELIMITER ;
```

---

## sp_auditorias_por_tecnico

```sql
DROP PROCEDURE IF EXISTS `sp_auditorias_por_tecnico`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_auditorias_por_tecnico`(
    IN p_nombre_tecnico VARCHAR(100)
)
BEGIN
    SELECT 
        id,
        fecha,
        tipo_auditoria,
        supervisor_auditor,
        comuna,
        tipo_actividad,
        tipo_servicio,
        responsable_falla,
        observaciones,
        evidencia_fotografica
    FROM 
        tb_auditorias_terreno
    WHERE 
        nombre_tecnico = p_nombre_tecnico
    ORDER BY 
        fecha DESC;
END$$

DELIMITER ;
```

---

## SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL

```sql
DROP PROCEDURE IF EXISTS `SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `SP_CREAR_TABLA_INVENTARIO_RESULTADO_FINAL`()
BEGIN

    DROP TABLE IF EXISTS TB_INVENTARIO_RESULTADO_FINAL;

    CREATE TABLE TB_INVENTARIO_RESULTADO_FINAL

    AS (       

SELECT

        `tlci`.`id_cierre`,

        `tlci`.`fecha`,

        `tlci`.`serial` AS `serie`,

        `id_tecnico`,

         `locator_inv`,

         A.`id_movimiento`,

        '' AS `Costo`,

        '' AS `Depreciación`,

        `tluct`.`serie` AS `SerieCargada`,

        CASE

            WHEN `tluct`.`serie` IS NOT NULL OR `fisico`.`SERIES` IS NOT NULL THEN 'CUADRADO'

            ELSE 'FALTANTE'

        END AS `ESTADO_APP`,

        CASE

            WHEN `tlm`.`Semantica` IS NULL OR `A`.`id_movimiento` = 0 THEN

                CASE

                    WHEN `flujo` = 'Reversa' THEN 'Pendiente por entregar'

                    WHEN `flujo` = 'Directa' THEN 'Entregado'

                END

            ELSE `tlm`.`Semantica`

        END AS `Semantica`,

        `flujo`,

        `Valorfinal`,

        CASE WHEN  `tlm`.`descuento` is null THEN 1 

        ELSE `tlm`.`descuento`

        END AS `descuento`

        ,

        `Geo_inv`,

        `Flag_Gestion`,

        tut.supervisor , 

        tut.vigente

    FROM

        `TB_LOGIS_CIERRE_INVENTARIO2` `tlci`

        LEFT JOIN tb_user_tqw tut 

        ON tut.Nombre_short = tlci.id_tecnico

        LEFT JOIN `TB_LOGIS_UploadCierreTecnico` `tluct` ON `tluct`.`serie` = `tlci`.`serial` AND `tluct`.`id` = `tlci`.`ID_CIERRE`

        LEFT JOIN (

            SELECT DISTINCT `SERIES`, `id_cierre`

            FROM (

                SELECT `SERIES`, 'Fisico' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO`

                UNION ALL

                SELECT `SERIES`, 'Bodega' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO_BODEGA`

                UNION ALL

                SELECT `SERIES`, 'Reversa' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO_reversa`

                UNION ALL

                SELECT `SERIES`, 'Ticket' AS `tipo_inventario`, `id_cierre` FROM `TB_LOGIS_INVENTARIO_FISICO_ticket`

            ) AS `A`

        ) `fisico` ON `fisico`.`SERIES` = `tlci`.`Serial` AND `fisico`.`id_cierre` = `tlci`.`ID_CIERRE`

        LEFT JOIN (

            SELECT ranked.id, fecha_hora, ranked.serie,

                ranked.id_tecnico_origen, ranked.id_tecnico_destino,

                observacion, ranked.id_movimiento, motivo, ticket

            FROM (

                SELECT id, fecha_hora, serie,

                    id_tecnico_origen, id_tecnico_destino, ticket,

                    observacion, id_movimiento, motivo,

                    ROW_NUMBER() OVER (PARTITION BY serie ORDER BY fecha_hora DESC) AS row_num

                FROM TB_LOGIS_MOVIMIENTOS X

            ) AS ranked

            WHERE row_num = 1

        ) A ON A.serie = tlci.serial

        LEFT JOIN TP_LOGIS_MOVIMIENTOS tlm ON tlm.id = A.id_movimiento

    WHERE

        CASE

            WHEN `tlci`.`state` = 'Issued out of stores' THEN 'NO'

            ELSE 'SI'

        END = 'SI'

    );



    CREATE INDEX idx_id_cierre ON TB_INVENTARIO_RESULTADO_FINAL (id_cierre(255));

END$$

DELIMITER ;
```

---

## sp_estadisticas_auditoria_por_fecha

```sql
DROP PROCEDURE IF EXISTS `sp_estadisticas_auditoria_por_fecha`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_estadisticas_auditoria_por_fecha`(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        tipo_auditoria,
        COUNT(*) AS cantidad,
        COUNT(DISTINCT nombre_tecnico) AS tecnicos_auditados,
        COUNT(DISTINCT supervisor_auditor) AS supervisores
    FROM 
        tb_auditorias_terreno
    WHERE 
        fecha BETWEEN fecha_inicio AND fecha_fin
    GROUP BY 
        DATE_FORMAT(fecha, '%Y-%m'),
        tipo_auditoria
    ORDER BY 
        mes, tipo_auditoria;
END$$

DELIMITER ;
```

---

## sp_insert_faltantes

```sql
DROP PROCEDURE IF EXISTS `sp_insert_faltantes`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_insert_faltantes`(p_id_cierre VARCHAR(255))
BEGIN

      -- Delete existing records first

      DELETE FROM TB_CIERRE_INVENTARIO_FALTANTE

      WHERE id_cierre = p_id_cierre;



      -- Insert new records with RUT

      INSERT INTO TB_CIERRE_INVENTARIO_FALTANTE (

          id_cierre,

          fecha,

          Serial,

          id_tecnico,

          rut,

          id_movimiento,

          SerieCargada,

          ESTADO_APP,

          Semantica,

          flujo,

          monto_valor,

          Geo_inv,

          flag_job,

          fecha_ejec,

          item

      )

      SELECT

          A.id_cierre,

          fecha,

          Serial,

          id_tecnico,

          tut.rut,

          id_movimiento,

          '' SerieCargada,

          fisico.id_cierre as ESTADO_APP,

          tlm.Semantica as Semantica,

          flujo,

          CAST(REGEXP_REPLACE(valores.`Valor TQW`, '[^0-9]', '') AS UNSIGNED) as        

  monto_valor,

          A.Geo_inv,

          A.flag_job,

          NOW(),

          A.flag_modelo_serie as item

      FROM tb_logis_cierre_inventario2 A

      LEFT JOIN (

          SELECT DISTINCT SERIES, id_cierre

          FROM (

              SELECT SERIES, 'Fisico' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO

              UNION ALL

              SELECT SERIES, 'Bodega' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO_BODEGA

              UNION ALL

              SELECT SERIES, 'Reversa' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO_reversa

              UNION ALL

              SELECT SERIES, 'Ticket' AS tipo_inventario, id_cierre FROM

  TB_LOGIS_INVENTARIO_FISICO_ticket

          ) AS A

      ) fisico ON fisico.SERIES = A.Serial AND fisico.id_cierre = A.ID_CIERRE

      LEFT JOIN tp_logis_movimientos tlm ON A.id_movimiento = tlm.id

      LEFT JOIN tp_logistica_mat_oracle valores ON valores.item =

  A.flag_modelo_serie

      LEFT JOIN tb_user_tqw tut ON tut.Nombre_short = A.id_tecnico

      WHERE A.ID_CIERRE = p_id_cierre

      AND fisico.id_cierre IS NULL

      AND id_tecnico NOT IN ('ANALISIS','NO_ACTIVA')

      AND (A.id_movimiento != 12 OR A.id_movimiento IS NULL);

  END$$

DELIMITER ;
```

---

## sp_insert_movimiento

```sql
DROP PROCEDURE IF EXISTS `sp_insert_movimiento`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_insert_movimiento`(
    IN p_serie VARCHAR(255),
    IN p_id_usuario INT
)
BEGIN
    INSERT INTO tb_logis_movimientos (
        fecha_hora, 
        serie, 
        id_tecnico_origen, 
        id_tecnico_destino, 
        observacion, 
        id_movimiento
    )
    VALUES (
        NOW(), 
        p_serie, 
        164, 
        p_id_usuario, 
        'Asignado a técnico', 
        0
    );
END$$

DELIMITER ;
```

---

## sp_user_delete

```sql
DROP PROCEDURE IF EXISTS `sp_user_delete`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_user_delete`(
    IN p_id VARCHAR(255),
    IN p_autorizacion VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_current_user VARCHAR(255);
    
    -- Obtener usuario actual
    SET v_current_user = CURRENT_USER();
    
    -- Validaciones básicas
    IF p_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID es obligatorio';
    END IF;
    
    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO v_count FROM tb_user_tqw WHERE ID = p_id;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe';
    END IF;
    
    -- Verificar autorización (solo admin_master puede eliminar)
    IF v_current_user NOT IN ('ncornejo@%', 'root@%') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Eliminación no autorizada. Se requiere rol admin_master';
    END IF;
    
    -- Verificar código de autorización (capa adicional de seguridad)
    IF p_autorizacion != 'DELETE_AUTH_2024' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Código de autorización inválido';
    END IF;
    
    -- Eliminar usuario
    DELETE FROM tb_user_tqw WHERE ID = p_id;
    
    SELECT 'Usuario eliminado correctamente' AS resultado;
END$$

DELIMITER ;
```

---

## sp_user_insert

```sql
DROP PROCEDURE IF EXISTS `sp_user_insert`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_user_insert`(
    IN p_id VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_nombre VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    -- Validaciones básicas
    IF p_id IS NULL OR p_email IS NULL OR p_nombre IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID, email y nombre son obligatorios';
    END IF;
    
    -- Verificar si el ID ya existe
    SELECT COUNT(*) INTO v_count FROM tb_user_tqw WHERE ID = p_id;
    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El ID ya existe';
    END IF;
    
    -- Insertar usuario con valores básicos
    INSERT INTO tb_user_tqw (ID, email, Nombre, reg_Date)
    VALUES (p_id, p_email, p_nombre, CURDATE());
    
    SELECT 'Usuario insertado correctamente' AS resultado;
END$$

DELIMITER ;
```

---

## sp_user_update

```sql
DROP PROCEDURE IF EXISTS `sp_user_update`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `sp_user_update`(
    IN p_id VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_nombre VARCHAR(255),
    IN p_area VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    -- Validaciones básicas
    IF p_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID es obligatorio';
    END IF;
    
    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO v_count FROM tb_user_tqw WHERE ID = p_id;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no existe';
    END IF;
    
    -- Actualizar usuario
    UPDATE tb_user_tqw 
    SET email = COALESCE(p_email, email),
        Nombre = COALESCE(p_nombre, Nombre),
        area = COALESCE(p_area, area)
    WHERE ID = p_id;
    
    SELECT 'Usuario actualizado correctamente' AS resultado;
END$$

DELIMITER ;
```

---

## UpdateLogisticaDirecta

```sql
DROP PROCEDURE IF EXISTS `UpdateLogisticaDirecta`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `UpdateLogisticaDirecta`()
BEGIN

    -- Crear tabla temporal con los últimos movimientos

    CREATE TEMPORARY TABLE temp_last_movements AS

    SELECT 

        serie,

        MAX(id) AS max_id    

    FROM 

        TB_LOGIS_MOVIMIENTOS

    GROUP BY 

        serie;

    -- Indexar la tabla temporal

    ALTER TABLE temp_last_movements ADD INDEX idx_serie_fecha (serie(255), max_id);

    -- Realizar el UPDATE con la tabla temporal

    UPDATE tb_ferret_directa1 RZ

    LEFT JOIN temp_last_movements tlm ON RZ.Serial = tlm.serie

    SET 

        RZ.`Unit Number` = tlm.max_id;

    -- Eliminar la tabla temporal

    DROP TEMPORARY TABLE IF EXISTS temp_last_movements;

    

END$$

DELIMITER ;
```

---

## UpdateLogisticaReversa

```sql
DROP PROCEDURE IF EXISTS `UpdateLogisticaReversa`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` PROCEDURE `UpdateLogisticaReversa`()
BEGIN

    -- Crear tabla temporal con los últimos movimientos

    CREATE TEMPORARY TABLE temp_last_movements AS

    SELECT 

        serie,

        MAX(id) AS max_id    

    FROM 

        TB_LOGIS_MOVIMIENTOS

    GROUP BY 

        serie;
    -- Indexar la tabla temporal

    ALTER TABLE temp_last_movements ADD INDEX idx_serie_fecha (serie(255), max_id);
    -- Realizar el UPDATE con la tabla temporal

    UPDATE tb_logist_bdreversa RZ

    LEFT JOIN temp_last_movements tlm ON RZ.Serial = tlm.serie

    SET 

        RZ.`Unit Number` = tlm.max_id;
    -- Eliminar la tabla temporal

    DROP TEMPORARY TABLE IF EXISTS temp_last_movements;
END$$

DELIMITER ;
```

---



# Triggers

Los siguientes triggers necesitan ser recreados manualmente.

---

## before_delete_tp_modelo_seni_juni

**Tabla**: `tp_modelo_seni_juni`

```sql
DROP TRIGGER IF EXISTS `before_delete_tp_modelo_seni_juni`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `before_delete_tp_modelo_seni_juni` BEFORE DELETE ON `tp_modelo_seni_juni` FOR EACH ROW BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DELETE no permitido en la tabla tp_modelo_seni_juni - tabla protegida'; END$$

DELIMITER ;
```

---

## before_update_tp_modelo_seni_juni

**Tabla**: `tp_modelo_seni_juni`

```sql
DROP TRIGGER IF EXISTS `before_update_tp_modelo_seni_juni`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `before_update_tp_modelo_seni_juni` BEFORE UPDATE ON `tp_modelo_seni_juni` FOR EACH ROW BEGIN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UPDATE no permitido en la tabla tp_modelo_seni_juni - tabla protegida'; END$$

DELIMITER ;
```

---

## tr_user_tqw_after_delete

**Tabla**: `tb_user_tqw`

```sql
DROP TRIGGER IF EXISTS `tr_user_tqw_after_delete`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `tr_user_tqw_after_delete` AFTER DELETE ON `tb_user_tqw` FOR EACH ROW BEGIN
    -- Registrar eliminación autorizada en auditoría
    INSERT INTO tb_user_tqw_audit (
        usuario, operacion, tabla_afectada, datos_anteriores, 
        ip_address, exito
    ) VALUES (
        CURRENT_USER(), 'DELETE', 'tb_user_tqw', 
        JSON_OBJECT('ID', OLD.ID, 'Nombre', OLD.Nombre, 'email', OLD.email, 'area', OLD.area),
        CONNECTION_ID(), 1
    );
    
    -- Crear backup del registro eliminado
    INSERT INTO tb_user_tqw_backup (
        operacion, usuario, ID, email, PASS, reg_Date, Nombre, area, 
        SUPERVISOR, Rut, correo_super, IDEN_USER, Vigente, ZONA_GEO, 
        nombre_ndc, nombre_short, PERFIL, datos_completos
    ) VALUES (
        'DELETE', CURRENT_USER(), OLD.ID, OLD.email, OLD.PASS, OLD.reg_Date, 
        OLD.Nombre, OLD.area, OLD.SUPERVISOR, OLD.Rut, OLD.correo_super, 
        OLD.IDEN_USER, OLD.Vigente, OLD.ZONA_GEO, OLD.nombre_ndc, 
        OLD.nombre_short, OLD.PERFIL, 
        JSON_OBJECT('ID', OLD.ID, 'email', OLD.email, 'Nombre', OLD.Nombre, 
                  'area', OLD.area, 'SUPERVISOR', OLD.SUPERVISOR, 'Rut', OLD.Rut)
    );
END$$

DELIMITER ;
```

---

## tr_user_tqw_after_insert

**Tabla**: `tb_user_tqw`

```sql
DROP TRIGGER IF EXISTS `tr_user_tqw_after_insert`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `tr_user_tqw_after_insert` AFTER INSERT ON `tb_user_tqw` FOR EACH ROW BEGIN
    -- Registrar en tabla de auditoría
    INSERT INTO tb_user_tqw_audit (
        usuario, operacion, tabla_afectada, datos_nuevos, 
        ip_address, exito
    ) VALUES (
        CURRENT_USER(), 'INSERT', 'tb_user_tqw', 
        JSON_OBJECT('ID', NEW.ID, 'Nombre', NEW.Nombre, 'email', NEW.email, 'area', NEW.area),
        CONNECTION_ID(), 1
    );
    
    -- Crear backup del registro insertado
    INSERT INTO tb_user_tqw_backup (
        operacion, usuario, ID, email, PASS, reg_Date, Nombre, area, 
        SUPERVISOR, Rut, correo_super, IDEN_USER, Vigente, ZONA_GEO, 
        nombre_ndc, nombre_short, PERFIL, datos_completos
    ) VALUES (
        'INSERT', CURRENT_USER(), NEW.ID, NEW.email, NEW.PASS, NEW.reg_Date, 
        NEW.Nombre, NEW.area, NEW.SUPERVISOR, NEW.Rut, NEW.correo_super, 
        NEW.IDEN_USER, NEW.Vigente, NEW.ZONA_GEO, NEW.nombre_ndc, 
        NEW.nombre_short, NEW.PERFIL, 
        JSON_OBJECT('ID', NEW.ID, 'email', NEW.email, 'Nombre', NEW.Nombre, 
                  'area', NEW.area, 'SUPERVISOR', NEW.SUPERVISOR, 'Rut', NEW.Rut)
    );
END$$

DELIMITER ;
```

---

## tr_user_tqw_after_update

**Tabla**: `tb_user_tqw`

```sql
DROP TRIGGER IF EXISTS `tr_user_tqw_after_update`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `tr_user_tqw_after_update` AFTER UPDATE ON `tb_user_tqw` FOR EACH ROW BEGIN
    -- Registrar en tabla de auditoría
    INSERT INTO tb_user_tqw_audit (
        usuario, operacion, tabla_afectada, datos_anteriores, datos_nuevos, 
        ip_address, exito
    ) VALUES (
        CURRENT_USER(), 'UPDATE', 'tb_user_tqw', 
        JSON_OBJECT('ID', OLD.ID, 'Nombre', OLD.Nombre, 'email', OLD.email, 'area', OLD.area),
        JSON_OBJECT('ID', NEW.ID, 'Nombre', NEW.Nombre, 'email', NEW.email, 'area', NEW.area),
        CONNECTION_ID(), 1
    );
    
    -- Crear backup del registro actualizado (estado anterior)
    INSERT INTO tb_user_tqw_backup (
        operacion, usuario, ID, email, PASS, reg_Date, Nombre, area, 
        SUPERVISOR, Rut, correo_super, IDEN_USER, Vigente, ZONA_GEO, 
        nombre_ndc, nombre_short, PERFIL, datos_completos
    ) VALUES (
        'UPDATE', CURRENT_USER(), OLD.ID, OLD.email, OLD.PASS, OLD.reg_Date, 
        OLD.Nombre, OLD.area, OLD.SUPERVISOR, OLD.Rut, OLD.correo_super, 
        OLD.IDEN_USER, OLD.Vigente, OLD.ZONA_GEO, OLD.nombre_ndc, 
        OLD.nombre_short, OLD.PERFIL, 
        JSON_OBJECT('ID', OLD.ID, 'email', OLD.email, 'Nombre', OLD.Nombre, 
                  'area', OLD.area, 'SUPERVISOR', OLD.SUPERVISOR, 'Rut', OLD.Rut)
    );
END$$

DELIMITER ;
```

---

## tr_user_tqw_before_delete

**Tabla**: `tb_user_tqw`

```sql
DROP TRIGGER IF EXISTS `tr_user_tqw_before_delete`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `tr_user_tqw_before_delete` BEFORE DELETE ON `tb_user_tqw` FOR EACH ROW BEGIN
    -- Verificar si el usuario actual tiene permisos de admin_master
    IF CURRENT_USER() NOT IN ('ncornejo@%', 'root@%') THEN
        -- Registrar intento de eliminación no autorizada
        INSERT INTO tb_user_tqw_audit (
            usuario, operacion, tabla_afectada, datos_anteriores, 
            ip_address, exito, mensaje_error
        ) VALUES (
            CURRENT_USER(), 'DELETE', 'tb_user_tqw', 
            JSON_OBJECT('ID', OLD.ID, 'Nombre', OLD.Nombre, 'email', OLD.email),
            CONNECTION_ID(), 0, 'DELETE no autorizado: se requiere rol admin_master'
        );
        
        -- Bloquear la eliminación
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Eliminación no autorizada. Solo usuarios con rol admin_master pueden eliminar registros.';
    END IF;
END$$

DELIMITER ;
```

---

## update_attributes_after_insert

**Tabla**: `tb_logis_movimientos`

```sql
DROP TRIGGER IF EXISTS `update_attributes_after_insert`;

DELIMITER $$

CREATE DEFINER=`ncornejo`@`%` TRIGGER `update_attributes_after_insert` AFTER INSERT ON `tb_logis_movimientos` FOR EACH ROW BEGIN

    UPDATE tb_ferret_directa1

    SET Attributes = NEW.id

    WHERE Serial = NEW.serie;
END$$

DELIMITER ;
```

---


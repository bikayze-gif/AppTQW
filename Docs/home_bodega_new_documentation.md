# Documentación Técnica: Home Bodega New (Solicitudes y Asignación de Material)

## 1. Visión General
Este documento detalla la funcionalidad de la sección "Solicitudes y Asignación de Material" y "Pool de Transferencia" en la página `home_bodega_new.php`. El objetivo es proporcionar la información técnica necesaria para replicar esta funcionalidad en un nuevo stack tecnológico.

## 2. Componentes del Frontend (JavaScript)

### 2.1. Funciones Principales
Las siguientes funciones en `js/home_bodega_new.js` gestionan la interactividad:

| Función | Propósito | Parámetros | Endpoint Asociado |
|---------|-----------|------------|-------------------|
| `hacerSolicitudAjax` | Carga el detalle de una solicitud específica en el panel lateral. | `ticket` | `GET_LOGIS_BODEGA_solicitud.php` |
| `solicitudOK` | Aprueba una solicitud de material, marcándola como gestionada por bodega. | `ticket`, `idUsuario`, `buttonElement` | `POST_API.php?proceso=solicitudOK` |
| `solicitudOK_tecnico` | Confirma la recepción/transferencia de una serie en el pool de transferencias. | `ticket` (usado como serie), `idUsuario`, `buttonElement` | `POST_API.php?proceso=solicitudOK_tecnico` |
| `redirigirEnTransferencia` | Gestiona acciones de visualización de historial, justificación o gestión de series. | `serial`, `item`, `idUsuario`, `accion` | `GET_LOGISTICA.php` / `GET_API.php` |
| `handleAction` (en PHP) | Gestiona la aceptación o rechazo desde el modal de solicitudes filtradas. | `id`, `accion` | `procesar_solicitud.php` |

## 3. Endpoints y Lógica Backend (PHP)

### 3.1. Listado Principal (Vista Inicial)
Cargado directamente en `home_bodega_new.php` al renderizar la página.

*   **Tabla:** "Solicitudes y Asignación de Material"
*   **Variable PHP:** `$solicitud_material`
*   **Query SQL:**
    ```sql
    SELECT TICKET, tut.Nombre_short, fecha, id_tecnico_traspaso,
           tut2.Nombre_short as tecnicoDestino,
           CASE WHEN FLAG_BODEGA IS NOT NULL THEN 'OK' ELSE '-' END AS ESTADO
    FROM TB_LOGIS_TECNICO_SOLICITUD tlts
    LEFT JOIN tb_user_tqw tut ON tut.id = tlts.tecnico
    LEFT JOIN tb_user_tqw tut2 ON tut2.id = tlts.id_tecnico_traspaso
    WHERE CASE WHEN FLAG_BODEGA IS NOT NULL THEN 'OK' ELSE '-' END = '-'
    GROUP BY tlts.TICKET, tut.Nombre_short, fecha, tut2.Nombre_short
    ORDER BY fecha DESC
    ```

### 3.2. Listado Filtrado (Modal)
Endpoint: `get_solicitudes_filtradas.php`
*   **Propósito:** Proporciona la vista detallada dentro del modal con filtros avanzados.
*   **Query SQL Base:**
    ```sql
    SELECT tlts.id, TICKET, fecha, tlts.material, cantidad,
           tut.nombre_short as desde,
           tut2.nombre_short as hacia,
           CASE WHEN tut.perfil2 IS NOT NULL AND tut.perfil2 != '' THEN '-' ELSE tut.supervisor END AS supervisor,
           CASE WHEN tlts.FLAG_BODEGA IS NOT NULL THEN 'APROBADO' ELSE 'PENDIENTE' END AS FLAG_BODEGA,
           flag_gestion_supervisor,
           tlmo.Familia as familia,
           tlmo.`Sub Familia` as subfamilia,
           tlmo.Item as campo_item_codigo
    FROM tb_logis_tecnico_solicitud tlts
    LEFT JOIN tb_user_tqw tut ON tlts.tecnico = tut.id
    LEFT JOIN tb_user_tqw tut2 ON tlts.id_tecnico_traspaso = tut2.id
    LEFT JOIN tp_logistica_mat_oracle tlmo ON tlts.campo_item = tlmo.Item
    WHERE 1=1
    -- Filtros dinámicos aplican aquí (tecnico, fechas, tipo_solicitud)
    ORDER BY fecha DESC LIMIT 150
    ```

### 3.3. Detalle de Solicitud
Endpoint: `GET_LOGIS_BODEGA_solicitud.php`
*   **Método:** GET
*   **Parámetros:** `ticket`
*   **Query SQL:**
    ```sql
    SELECT material, cantidad, fecha, tecnico, TICKET, FLAG_BODEGA
    FROM TB_LOGIS_TECNICO_SOLICITUD tlts
    LEFT JOIN tb_user_tqw tut ON tut.id = tlts.tecnico
    WHERE TICKET = '{ticket}'
    ```

### 3.4. Procesar Solicitud (Aprobar/Rechazar - Modal)
Endpoint: `procesar_solicitud.php`
*   **Método:** POST
*   **Parámetros:** `id` (ID de la fila), `accion` ('ACEPTAR' | 'RECHAZAR')
*   **Query SQL:**
    ```sql
    UPDATE tb_logis_tecnico_solicitud
    SET FLAG_BODEGA = ?,
        fecha_aprobacion = ?,
        usuario_aprobacion = ?
    WHERE id = ?
    ```

### 3.5. Terminar Solicitud (Aprobar - Panel Principal)
Endpoint: `POST_API.php?proceso=solicitudOK`
*   **Método:** POST
*   **Parámetros:** `ticket`, `idUsuario`, `estado`
*   **Query SQL:**
    ```sql
    UPDATE tb_logis_tecnico_solicitud
    SET flag_gestion_supervisor = 1,
        FLAG_BODEGA = 164,
        flag_gestion_bodega = ?
    WHERE TICKET = ?
    ```

### 3.6. Confirmar Transferencia (Pool Transferencia)
Endpoint: `POST_API.php?proceso=solicitudOK_tecnico`
*   **Método:** POST
*   **Parámetros:** `ticket` (contiene la serie), `idUsuario`, `var_ip`
*   **Query SQL:**
    ```sql
    INSERT INTO TB_LOGIS_LOG_BODEGA_materialTecnico (fecha, id_usuario, serie, var_ip)
    VALUES (NOW(), {idUsuario}, '{serie}', '{var_ip}')
    ```

## 4. Esquema de Datos (Deducido)

### 4.1. TB_LOGIS_TECNICO_SOLICITUD
Tabla principal de solicitudes.
| Columna | Tipo Sugerido | Descripción |
|---------|---------------|-------------|
| `id` | INT (PK) | Identificador único de la línea de solicitud. |
| `TICKET` | VARCHAR/INT | Agrupador. Un ticket puede tener múltiples materiales. |
| `tecnico` | INT (FK) | ID del técnico solicitante (`tb_user_tqw.id`). |
| `id_tecnico_traspaso` | INT (FK) | ID del técnico destino (para traspasos). |
| `material` | VARCHAR | Nombre o descripción del material. |
| `cantidad` | INT | Cantidad solicitada. |
| `fecha` | DATETIME | Fecha de la solicitud. |
| `FLAG_BODEGA` | VARCHAR | Estado desde la perspectiva de bodega (NULL, 'APROBADO', '164'). |
| `flag_gestion_supervisor`| INT/BOOL | Estado de gestión del supervisor (1 = Gestionado). |
| `flag_gestion_bodega` | VARCHAR | Comentario o estado específico de la gestión de bodega. |
| `campo_item` | VARCHAR | Código SKU/Item para cruce con Oracle. |
| `fecha_aprobacion` | DATETIME | Fecha de aprobación/rechazo. |
| `usuario_aprobacion` | INT (FK) | ID del usuario que gestionó la solicitud. |

### 4.2. TB_LOGIS_TECNICO_SERIE_TRANSFIERE
Tabla para el control de series en tránsito entre técnicos.
| Columna | Tipo Sugerido | Descripción |
|---------|---------------|-------------|
| `serie` | VARCHAR | Número de serie del equipo. |
| `id_origen` | INT (FK) | ID del técnico origen. |
| `id_destino` | INT (FK) | ID del técnico destino. |
| `fecha` | DATETIME | Fecha de la transferencia. |
| `flagacepta` | VARCHAR | Indica si el técnico destino aceptó ('Si'). |

### 4.3. TB_LOGIS_LOG_BODEGA_materialTecnico
Log de confirmaciones de recepción/gestión por bodega.
| Columna | Tipo Sugerido | Descripción |
|---------|---------------|-------------|
| `id_log` | INT (PK) | Identificador autoincremental (probable). |
| `serie` | VARCHAR | Serie del equipo o Ticket asociado. |
| `id_usuario` | INT (FK) | ID del usuario de bodega que realiza la acción. |
| `fecha` | DATETIME | Fecha de la acción. |
| `var_ip` | VARCHAR | IP del usuario. |

### 4.4. tb_user_tqw
Tabla de usuarios.
| Columna | Tipo Sugerido | Descripción |
|---------|---------------|-------------|
| `id` | INT (PK) | Identificador único. |
| `rut` | VARCHAR | RUT del usuario. |
| `nombre` | VARCHAR | Nombre completo. |
| `nombre_short` | VARCHAR | Nombre corto para visualización. |
| `email` | VARCHAR | Correo electrónico. |
| `PERFIL` | VARCHAR | Perfil/Rol principal. |
| `PERFIL2` | VARCHAR | Perfil secundario (usado para flujos regionales). |
| `supervisor` | VARCHAR | Nombre del supervisor asignado. |

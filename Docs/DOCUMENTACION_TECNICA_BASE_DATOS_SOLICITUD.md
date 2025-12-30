# Documentación Técnica Detallada: Módulo Solicitud de Materiales

Este documento describe la arquitectura de datos y la lógica técnica de base de datos para el módulo de **Solicitud de Materiales** del sistema TQW. Su propósito es servir como guía para la reconstrucción del módulo en otros entornos.

---

## 1. Entidades de Base de Datos (MySQL)

### 1.1 `tb_logis_tecnico_solicitud` (Tabla Transaccional principal)
Es la tabla donde se registran todas las peticiones de materiales y los traspasos entre técnicos.

| Campo | Tipo | Descripción | Uso en el Módulo |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK, AI) | Identificador único del registro. | Referencia para aprobaciones. |
| `TICKET` | VARCHAR(8) | Token alfanumérico generado por `md5(uniqid())`. | Agrupa varios materiales en una sola solicitud. |
| `fecha` | DATETIME | Fecha y hora en que se creó la solicitud. | Ordenamiento y filtrado por rangos. |
| `material` | VARCHAR(255) | Descripción del material solicitado. | Enlace visual con el catálogo. |
| `campo_item` | VARCHAR(50) | Código "Item" de Oracle asociado al material. | Integración con sistemas logísticos externos. |
| `cantidad` | INT | Número de unidades solicitadas/transferidas. | Control de volumen. |
| `tecnico` | INT (FK) | ID del usuario que solicita o transfiere (`tb_user_tqw.id`). | Identificación del origen. |
| `id_tecnico_traspaso` | INT (FK) | ID del técnico que recibe (`tb_user_tqw.id`). | Solo para asignaciones entre técnicos. |
| `flag_regiones` | VARCHAR(20) | Indica si la solicitud pertenece a una región específica. | Filtrado por permisos de supervisión. |
| `flag_gestion_supervisor` | TINYINT | `1` si fue pre-aprobada por supervisor, `0` si no. | Control de flujo de jerarquía. |
| `FLAG_BODEGA` | VARCHAR(20) | Estado: `NULL` (Pendiente), `APROBADO`, `RECHAZADO`. | Estado final de la solicitud. |
| `fecha_aprobacion` | DATETIME | Fecha en que bodega procesó el registro. | Auditoría de tiempos de respuesta. |
| `usuario_aprobacion` | INT (FK) | ID del usuario de bodega que aprobó (`tb_user_tqw.id`). | Responsabilidad del despacho. |

### 1.2 `tp_logistica_mat_oracle` (Catálogo de Materiales)
Base de conocimiento de los materiales disponibles para solicitud.

| Campo | Tipo | Descripción | Rol |
| :--- | :--- | :--- | :--- |
| `Item` | VARCHAR(50) | Código único de producto. | Integridad con ERP. |
| `Item Description` | VARCHAR(255) | Nombre descriptivo del material. | Fuente para el select dinámico. |
| `Tipo Material` | VARCHAR(50) | Categoría macro (ej. Herramientas, Equipos). | Filtro de primer nivel. |
| `Familia` | VARCHAR(50) | Agrupación lógica (ej. Fibra Óptica, HFC). | Filtro de segundo nivel. |
| `Sub Familia` | VARCHAR(50) | Detalle específico de la familia. | Filtro de tercer nivel. |

### 1.3 `tb_user_tqw` (Gestión de Usuarios)
Proporciona la identidad y la jerarquía necesaria para el flujo de aprobación.

| Campo | Tipo | Uso en Solicitudes |
| :--- | :--- | :--- |
| `id` | INT | Identificador usado en los campos `tecnico` y `id_tecnico_traspaso`. |
| `rut` | VARCHAR | Usado como respaldo de identidad en transacciones. |
| `Nombre_short` | VARCHAR | Nombre visual mostrado en la columna "Desde" y "Hacia". |
| `PERFIL` | VARCHAR | Determina si el usuario carga el dashboard de técnico o supervisor. |
| `PERFIL2` | VARCHAR | Define la región o grupo de control (ej. "Andes", "Norte"). |
| `supervisor` | VARCHAR | Nombre del supervisor asignado. |
| `correo_super` | VARCHAR | Email utilizado para enviar notificaciones de solicitud. |

---

## 2. Vistas y Lógica de Negocio

### 2.1 `VW_LOGIS_SEMAFORO`
Esta vista es crítica para la funcionalidad de "Asignación de Material".
- **Lógica**: Agrega datos de inventario pendiente de entrega de equipos (`Porcentaje`), OTs no finalizadas (`SUM_JOB`) y reversas pendientes (`PorcentajeReversa`).
- **Uso Técnico**: El archivo `GET_API.php?proceso=get_semaforo_asignacion` consulta esta vista. Si `Semaforo_gen` es `1`, el sistema interpreta que el técnico está apto para recibir o gestionar series, desbloqueando los inputs de escaneo en el frontend.

---

## 3. Relaciones y Flujo de Datos (Workflow Técnico)

1.  **Captura del Item**: En el frontend (`form_materiales.js`), al elegir un material, se captura no solo la descripción sino el atributo `data-item` (obtenido de `tp_logistica_mat_oracle`).
2.  **Generación de Ticket**: El script `guardar_carrito.php` genera un único `$token` de 8 caracteres. Este token se replica en todos los registros de la tabla `tb_logis_tecnico_solicitud` que pertenezcan a esa sesión de "carrito". Esto permite tratar una lista de materiales como un solo pedido.
3.  **Detección de Traspasos**: El sistema diferencia una **Solicitud a Bodega** de una **Asignación entre Técnicos** mediante el campo `id_tecnico_traspaso`.
    - Si es `0` o `NULL`: Es pedido a bodega.
    - Si tiene un valor `> 0`: Se trata de un técnico transfiriendo material a otro.
4.  **Permisos por Región**: El campo `flag_regiones` en la tabla de solicitudes se llena basándose en el `perfil2` del usuario solicitante. En el backend `get_solicitudes.php`, las consultas filtran los registros permitiendo que los supervisores vean solo las solicitudes de su respectiva región.
5.  **Notificaciones**: Al finalizar el `INSERT` exitoso, el campo `correo_super` de `tb_user_tqw` se utiliza para disparar un correo electrónico informando al supervisor sobre la nueva solicitud pendiente de revisión.

---

## 4. Consultas SQL Clave

### Para poblar el formulario (Materiales):
```sql
SELECT Item, `Item Description` 
FROM tp_logistica_mat_oracle 
WHERE `Tipo Material` = ? AND `Familia` = ? AND `Sub Familia` = ?
ORDER BY `Item Description` ASC;
```

### Para listar solicitudes (Dashboard):
```sql
SELECT tlts.id, TICKET, fecha, tlts.material, cantidad, 
       tut.nombre_short as desde, tut2.nombre_short as hacia,
       CASE WHEN tlts.FLAG_BODEGA IS NOT NULL THEN 'APROBADO' ELSE 'PENDIENTE' END AS estado_bodega
FROM tb_logis_tecnico_solicitud tlts
LEFT JOIN tb_user_tqw tut ON tlts.tecnico = tut.id
LEFT JOIN tb_user_tqw tut2 ON tlts.id_tecnico_traspaso = tut2.id
WHERE (tlts.flag_regiones = ? OR tut.perfil2 = ?)
ORDER BY fecha DESC;
```

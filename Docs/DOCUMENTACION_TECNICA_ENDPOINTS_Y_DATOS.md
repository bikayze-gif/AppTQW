# Documentación Técnica Profunda: Endpoints, Tablas y Campos (Módulo Solicitud Material)

Este documento es un diccionario de datos y referencia de API exhaustivo para el módulo de Solicitud de Materiales. Su objetivo es proporcionar la información exacta de **qué datos entran, qué tablas se consultan y qué datos salen** de cada endpoint actualmente en producción.

---

## 1. Diccionario de Datos (Schema Reference)

### 1.1 `tb_logis_tecnico_solicitud`
**Propósito**: Tabla transaccional central. Almacena cada línea de material solicitada. Un conjunto de filas comparte el mismo `TICKET` si fueron pedidas juntas.

| Campo | Tipo SQL | Semántica / Origen de Datos | Relevancia para Migración |
| :--- | :--- | :--- | :--- |
| `id` | `INT(11) AI` | Primary Key. | Usado en `procesar_solicitud.php` como identificador de acción. |
| `TICKET` | `VARCHAR(8)` | Token generado (`substr(md5(uniqid()),0,8)`). | **CRÍTICO**: Agrupa N materiales en un solo pedido. |
| `fecha` | `DATETIME` | Timestamp de creación (`NOW()`). | Clave para filtros de fecha en el dashboard. |
| `material` | `VARCHAR(255)` | Descripción legible del material. | Viene del `Material Select` del frontend. |
| `cantidad` | `INT(11)` | Cantidad solicitada. | - |
| `tecnico` | `INT(11)` | ID (`tb_user_tqw.id`) del solicitante. | Representa el "Origen". |
| `id_tecnico_traspaso` | `INT(11)` | ID (`tb_user_tqw.id`) del receptor. | **Lógica de Negocio**: `0`/`NULL` = A Bodega. `>0` = Traspaso a Técnico. |
| `flag_regiones` | `VARCHAR(50)` | Valor de `perfil2` del solicitante. | Usado para segmentar la visibilidad de supervisores. |
| `flag_gestion_supervisor` | `TINYINT(1)` | Flag (`0` o `1`). | Indica si el usuario tiene `perfil2` (aprobación implícita/jerarquía). |
| `FLAG_BODEGA` | `VARCHAR(20)` | `NULL` (Pendiente), `'APROBADO'`, `'RECHAZADO'`. | Estado final del ciclo de vida. |
| `campo_item` | `VARCHAR(50)` | Código Oracle (ej. `123-456`). | **Integridad**: Debe existir en `tp_logistica_mat_oracle`. |
| `fecha_aprobacion` | `DATETIME` | Timestamp de actualización. | Seteado al momento de Aceptar/Rechazar. |
| `usuario_aprobacion` | `INT(11)` | ID del usuario que ejecutó la acción. | Auditoría. |

### 1.2 `tp_logistica_mat_oracle`
**Propósito**: Maestro de materiales.

| Campo | Semántica |
| :--- | :--- |
| `Item` | Código único de producto (SKU). Se guarda en `campo_item`. |
| `Item Description` | Descripción usada en el select del frontend. |
| `Tipo Material` | Categoría Nivel 1 (Filtro). |
| `Familia` | Categoría Nivel 2 (Filtro). |
| `Sub Familia` | Categoría Nivel 3 (Filtro). |

### 1.3 `VW_LOGIS_SEMAFORO`
**Propósito**: Vista lógica para validar si un técnico puede recibir asignaciones.

| Campo Consultado | Lógica |
| :--- | :--- |
| `Semaforo_gen` | Calculado: `CASE WHEN Porcentaje > 0 OR SUM_JOB > 0 ... THEN 1 ELSE 0`. |

---

## 2. Definición Detallada de Endpoints

### 2.1 `GET /get_solicitudes.php` (Dashboard Principal)

Recupera el historial de solicitudes para visualizar en la tabla principal.

**Parámetros de Entrada (Query String):**
- `id_sesion` (Required): Token de validación.
- `tecnico` (Optional): Nombre corto del técnico (`tb_user_tqw.Nombre_short`).
- `fecha_inicio` (Optional): Formato `YYYY-MM-DD`.
- `fecha_fin` (Optional): Formato `YYYY-MM-DD`.
- `tipo_solicitud` (Optional):
    - Valor `"solicitud_tecnico"` -> Filtra donde `hacia` (destino) es NULL.
    - Valor `"asignacion_serie"` -> Filtra donde `hacia` (destino) NO es NULL.

**Lógica SQL (Simplificada):**
```sql
SELECT 
    tlts.id, tlts.TICKET, tlts.fecha, tlts.material, tlts.cantidad,
    tut.nombre_short as desde,
    tut2.nombre_short as hacia,
    tlts.FLAG_BODEGA
FROM tb_logis_tecnico_solicitud tlts
LEFT JOIN tb_user_tqw tut ON tlts.tecnico = tut.id
LEFT JOIN tb_user_tqw tut2 ON tlts.id_tecnico_traspaso = tut2.id
WHERE 
    DATE(fecha) BETWEEN ? AND ?
    AND (tut.nombre_short = ? OR tut2.nombre_short = ?)
ORDER BY fecha DESC LIMIT 140
```

---

### 2.2 `GET /get_materiales.php` (Catálogo Dinámico)

Provee la lista de materiales filtrada para el formulario de ingreso.

**Parámetros de Entrada:**
- `familia`: String (ej. "FIBRA OPTICA").
- `subfamilia`: String.
- `q`: String (Término de búsqueda opcional).

**Lógica SQL:**
```sql
SELECT Item, `Item Description`
FROM tp_logistica_mat_oracle
WHERE `Familia` = ? AND `Sub Familia` = ?
[AND `Item Description` LIKE %?%]
LIMIT 50
```

**Salida:**
- HTML `<option value="Desc" data-item="Código">Desc</option>` (Legacy).
- JSON `[{ "value": "Desc", "item": "Code" }]` (Si se solicita formato JSON).

---

### 2.3 `POST /guardar_carrito.php` (Creación de Solicitud)

Procesa el "Checkout" del carrito de materiales.

**Payload JSON (Entrada):**
```json
{
  "id_usuario": 123,      // ID del solicitante
  "id_destino": 456,      // 0 si es a bodega, ID si es traspaso
  "carrito_items": [
    {
      "material": "CABLE UTP",
      "cantidad": 10,
      "item": "CBL-UTP-06" // Código opcional enviado por frontend, si no, se busca.
    }
  ]
}
```

**Lógica de Negocio (Backend):**
1.  Genera `$token = substr(md5(uniqid()), 0, 8)`.
2.  Obtiene datos del usuario (`perfil2`, `flag_regiones`) desde `tb_user_tqw` usando `id_usuario`.
3.  Itera sobre `carrito_items`:
    - Valida existencia del material en `tp_logistica_mat_oracle`.
    - Recupera/Verifica el código `Item` oficial.
4.  **Insert Atomico**:
    ```sql
    INSERT INTO tb_logis_tecnico_solicitud 
    (material, cantidad, fecha, tecnico, id_tecnico_traspaso, TICKET, flag_regiones, campo_item)
    VALUES (?, ?, NOW(), ?, ?, $token, ?, ?)
    ```
5.  Dispara `NotificationService` (PHP Mailer) al correo del supervisor.

---

### 2.4 `POST /procesar_solicitud.php` (Gestión de Estado)

Permite a Bodega o Supervisores cambiar el estado de una solicitud individual.

**Parámetros (Form Data):**
- `id`: ID de la fila (`tb_logis_tecnico_solicitud.id`).
- `accion`: `"ACEPTAR"` o `"RECHAZAR"`.

**Lógica SQL:**
```sql
UPDATE tb_logis_tecnico_solicitud 
SET FLAG_BODEGA = ?,          -- 'APROBADO' / 'RECHAZADO'
    fecha_aprobacion = NOW(), 
    usuario_aprobacion = ?    -- ID usuario sesión
WHERE id = ?
```

---

### 2.5 `GET /GET_API.php?proceso=get_semaforo_asignacion` (Validación de Bloqueo)

Endpoint de seguridad preventiva.

**Parámetros:**
- `nombre_short`: Nombre del técnico destino.

**Lógica SQL:**
```sql
SELECT Semaforo_gen FROM VW_LOGIS_SEMAFORO WHERE Nombre_Short = ?
```

**Salida:**
- `1`: El técnico está bloqueado (deudas/pendientes). El frontend debe inhabilitar la asignación.
- `0`: El técnico está limpio. Se permite la asignación.

# Documentación Técnica Integral: Módulo de Solicitud de Materiales (TQW)

Este documento proporciona una visión completa de la arquitectura, funcionamiento, endpoints y estructura de datos del módulo de **Solicitud de Materiales** implementado en el sistema TQW.

---

## 1. Perspectiva General del Funcionamiento
El módulo permite a técnicos y supervisores gestionar el flujo de materiales a través de dos modalidades:
1.  **Solicitud a Bodega**: Pedido directo de insumos para reposición.
2.  **Asignación/Traspaso**: Transferencia de materiales seriados o insumos entre dos usuarios (técnico a técnico).

El sistema utiliza un concepto de **"Carrito Logístico"**, permitiendo que múltiples materiales se agrupen bajo un mismo número de **Ticket**, facilitando la gestión masiva de inventario.

---

## 2. Componentes de la Interfaz (UI)

### 2.1 Panel de Gestión y Filtros (`get_solicitudes.php`)
Visualiza el historial y estado de las solicitudes.
- **Tabla principal**: Muestra ID, Ticket, Material, Cantidad, Origen (Desde), Destino (Hacia) y el estado de aprobación.
- **Sistema de Filtros**: Permite filtrar por técnico, rangos de fecha y tipo de solicitud (solicitud vs asignación).
- **Control de Acciones**: Botones dinámicos para Aceptar o Rechazar solicitudes (visibles para perfiles con privilegios de supervisor o bodega).

### 2.2 Formulario de Ingreso y Carrito (`new_dash.php` + `js/form_materiales.js`)
- **Filtros en Cascada**: Selección de Familia -> Subfamilia -> Material.
- **Captura de Series**: Un input específico para escaneo de códigos de barra que añade automáticamente el registro al carrito al detectar el ingreso.
- **Visualización del Carrito**: Lista dinámica que permite eliminar items antes de la confirmación final.

---

## 3. Arquitectura de Base de Datos (MySQL)

### 3.1 Tabla Transaccional: `tb_logis_tecnico_solicitud`
Almacena el detalle de cada item solicitado o transferido.

| Campo | Tipo | Función Técnica |
| :--- | :--- | :--- |
| `TICKET` | VARCHAR(8) | Identificador único generado por solicitud (agrupa múltiples IDs). |
| `material` | VARCHAR(255) | Descripción visual del material. |
| `campo_item` | VARCHAR(50) | Código "Item" oficial de Oracle (integridad logística). |
| `tecnico` | INT | FK del usuario origen (`tb_user_tqw.id`). |
| `id_tecnico_traspaso` | INT | FK del usuario destino (si es `0`, es pedido a bodega). |
| `FLAG_BODEGA` | VARCHAR(20) | Estado final: `NULL`, `APROBADO` o `RECHAZADO`. |
| `flag_regiones` | VARCHAR(20) | Basado en `perfil2` del usuario, controla el alcance visual del supervisor. |

### 3.2 Tabla de Referencia: `tp_logistica_mat_oracle`
Catálogo maestro de materiales.
- **Campos clave**: `Item`, `Item Description`, `Tipo Material`, `Familia`, `Sub Familia`.

### 3.3 Vista de Control: `VW_LOGIS_SEMAFORO`
- **Función**: Verifica si un técnico tiene pendientes de inventario, OTs críticas o reversas sin entregar.
- **Impacto**: Si el semáforo está en rojo (`1`), se condiciona la habilitación de ciertos inputs de asignación en el formulario.

---

## 4. Flujo de Datos y Endpoints (API)

### 4.1 Ciclo de Vida de una Solicitud
1.  **Carga Dinámica (`get_materiales.php`)**: El frontend solicita materiales filtrados por familia. Retorna un HTML de `<option>` con el atributo `data-item`.
2.  **Persistencia (`guardar_carrito.php`)**:
    - Recibe un JSON con el array de materiales.
    - Genera un token único `$token = substr(md5(uniqid()), 0, 8)`.
    - Inserta cada material como una fila independiente en `tb_logis_tecnico_solicitud` vinculada al mismo ticket.
3.  **Procesamiento (`procesar_solicitud.php`)**:
    - Endpoint para que bodega/supervisor cambie el estado.
    - Actualiza `FLAG_BODEGA`, `fecha_aprobacion` y `usuario_aprobacion`.
4.  **Notificación**: Se utiliza `NotificationService` para enviar un correo automático al supervisor asociado (obtenido de `tb_user_tqw.correo_super`).

---

## 5. Lógica de Negocio Relevante para Reconstrucción

- **Reglas de Relación**: Un registro de solicitud se considera "Traspaso" si `id_tecnico_traspaso > 0`.
- **Seguridad y Permisos**: El filtrado por región se implementa comparando el `flag_regiones` del registro con el `perfil2` de la sesión del usuario.
- **Integridad de Series**: El módulo de asignación de equipos exige que el material exista en `tp_logistica_mat_oracle` para capturar el código `Item` correcto, asegurando la trazabilidad con sistemas externos de bodega.

---

## 6. Consultas SQL Críticas

### Ingreso de Datos (Loop en PHP):
```sql
INSERT INTO tb_logis_tecnico_solicitud 
(material, cantidad, fecha, tecnico, id_tecnico_traspaso, TICKET, flag_regiones, flag_gestion_supervisor, campo_item)
VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?);
```

### Visualización con Jerarquía:
```sql
SELECT tlts.*, tut.nombre_short as solicitante
FROM tb_logis_tecnico_solicitud tlts
LEFT JOIN tb_user_tqw tut ON tlts.tecnico = tut.id
WHERE tlts.flag_regiones = 'Andes' -- Ejemplo de filtro por perfil2
ORDER BY tlts.fecha DESC;
```

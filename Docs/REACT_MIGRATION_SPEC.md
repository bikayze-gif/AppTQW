# Especificación de Migración a React: Módulo Solicitud de Materiales

Este documento define la arquitectura técnica para reimplementar el módulo de "Solicitud de Materiales" en una aplicación React moderna con TypeScript.

---

## 1. Arquitectura de Componentes

### 1.1 Jerarquía de Componentes Propuesta

```text
src/features/MaterialRequest/
├── MaterialRequestModule.tsx        (Contenedor principal, maneja el estado global del módulo)
├── context/
│   └── MaterialRequestContext.tsx   (Store: Carrito, Filtros, Usuario)
├── components/
│   ├── Dashboard/
│   │   ├── RequestDashboard.tsx     (Vista principal de tabla)
│   │   ├── FilterBar.tsx            (Barra de filtros técnicos/fechas)
│   │   └── RequestTable.tsx         (Tabla de solicitudes con acciones)
│   └── Form/
│       ├── MaterialRequestForm.tsx  (Drawer/Modal de ingreso)
│       ├── TechnicianSelector.tsx   (Select con búsqueda para traspasos)
│       ├── ScannerInput.tsx         (Input optimizado para lectores de código)
│       ├── CatalogSelector.tsx      (Selects en cascada: Familia -> Material)
│       └── Cart/
│           ├── CartSummary.tsx      (Lista visual de items)
│           └── CartItem.tsx         (Item individual con opción de eliminar)
└── hooks/
    ├── useMaterialScanner.ts        (Lógica de detección de scanner)
    └── useMaterialCatalog.ts        (Fetching de materiales)
```

---

## 2. Contratos de Datos (TypeScript Interfaces)

Estas interfaces aseguran la integridad de datos entre el frontend y el backend legacy (o nuevo).

### 2.1 Modelos de Dominio

```typescript
// Modelo del Item en el Carrito
interface CartItem {
  materialName: string; // "CABLE UTP CAT6"
  itemCode: string;     // "123-456-789" (Oracle Item Code)
  quantity: number;
  // Metadatos adicionales opcionales
  isSerialized: boolean;
  scannedSeries?: string; 
}

// Modelo de una Solicitud Histórica (para la Tabla)
interface MaterialRequest {
  id: number;
  ticketToken: string;
  date: string; // ISO 8601
  materialName: string;
  quantity: number;
  originTechnician: string;
  destinationTechnician: string; // Null si es a Bodega
  supervisorName: string;
  statusBodega: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  statusSupervisor: boolean; // true = Aprobado
}

// Modelo de Material del Catálogo
interface CatalogItem {
  itemCode: string;
  description: string;
  family: string;
  subFamily: string;
}
```

### 2.2 Payload de Envío (API Contract)

```typescript
interface SubmitRequestPayload {
  userId: number;          // ID del usuario que crea la solicitud (Logueado)
  destinationId: number;   // 0 para Bodega, ID > 0 para Traspaso
  supervisorId?: number;   // Opcional, si se requiere forzar un supervisor
  items: Array<{
    material: string;      // Descripción
    itemCode: string;      // CRÍTICO: Debe venir del catálogo
    cantidad: number;
  }>;
}
```

---

## 3. Gestión de Estado (State Management)

Se recomienda usar un `Context` + `useReducer` para manejar el estado del carrito, ya que es una estructura compleja cliente-lado antes de persistir.

### 3.1 Estado del Carrito (`CartContext`)

```typescript
type CartState = {
  items: CartItem[];
  destinationTechnician: number | null; // null = Bodega
  isSubmitting: boolean;
};

type CartAction = 
  | { type: 'ADD_ITEM', payload: CartItem }
  | { type: 'REMOVE_ITEM', payload: { index: number } }
  | { type: 'SET_DESTINATION', payload: number }
  | { type: 'CLEAR_CART' };

// Lógica de Reducer sugerida:
// Al recibir 'ADD_ITEM', buscar si itemCode ya existe.
// - Si existe: incrementar quantity.
// - Si no existe: push al array.
```

---

## 4. Lógica de Negocio Crítica

### 4.1 Comportamiento del Escáner (`useMaterialScanner`)
Basado en el análisis de `js/form_materiales_seriado_fix.js`, el hook debe implementar:

1.  **Auto-Submit**: Detectar la tecla `Enter` (keyCode 13) en el input de serie.
2.  **Validación de Dependencia**: El input de escáner debe estar **deshabilitado** o mostrar un error si no se ha seleccionado un `Technician` destino (en caso de traspaso).
3.  **Debounce**: Implementar un pequeño debounce (50-100ms) si el lector envía caracteres muy rápido, aunque la detección principal es el `Enter`.
4.  **Auto-Agregado**: Al detectar un código válido, invocar inmediatamente la acción `ADD_ITEM` del carrito con `quantity: 1` y limpiar el input.

### 4.2 Validaciones de Integridad
1.  **Item Code Obligatorio**: No permitir agregar materiales "libres" que no tengan un `itemCode` asociado en el catálogo `tp_logistica_mat_oracle`. Esto previene errores de sincronización con bodega.
2.  **Bloqueo por Semáforo**: Consultar el endpoint de semáforo (`GET_API.php?proceso=get_semaforo_asignacion`) al seleccionar un técnico destino. Si retorna `0`, bloquear la capacidad de asignarle series.

---

## 5. Estrategia de Modernización de API

Para reemplazar los scripts actuales que devuelven HTML (`get_solicitudes.php`), se debe implementar una capa de API JSON:

### 5.1 Endpoints Requeridos (JSON)

| Verbo | Ruta Sugerida | Reemplaza a |
| :--- | :--- | :--- |
| `GET` | `/api/materials/requests` | `get_solicitudes.php` (Refactorizar para devolver JSON) |
| `GET` | `/api/materials/catalog` | `get_materiales.php` |
| `POST` | `/api/materials/requests` | `guardar_carrito.php` |
| `PATCH` | `/api/materials/requests/:id/status` | `procesar_solicitud.php` |
| `GET` | `/api/technicians/:id/status` | `GET_API.php?proceso=get_semaforo_asignacion`|

---

## 6. Consideraciones de UX (Diseño)
- **Feedback Inmediato**: Usar "Toasts" (notificaciones flotantes) al escanear un producto exitosamente.
- **Modo Oscuro/Claro**: Utilizar variables CSS o Tailwind para respetar el tema del dashboard padre.
- **Accesibilidad**: Asegurar que el input de escáner mantenga el foco (`autoFocus` o re-focus tras blur) para permitir escaneo continuo sin usar el mouse.

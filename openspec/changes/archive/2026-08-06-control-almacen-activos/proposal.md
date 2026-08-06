## Why

Punto D del roadmap de mejoras Bocam 2026-07-12: hoy `apps/almacen` solo
gestiona materiales consumibles (`ItemInventario`/`MovimientoAlmacen` —
stock que se consume, no se rastrea individualmente). Bocam necesita
además controlar **activos fijos** (equipo, herramienta, maquinaria,
vehículos): altas/bajas, en qué proyecto está cada uno, a qué trabajador
está asignado, y un historial rastreable de todos sus movimientos —
nada de esto existe hoy en ningún microservicio.

## What Changes

- **Modelos nuevos en `apps/almacen`** (mismo microservicio, no uno
  nuevo — decisión ya tomada, ver roadmap): `Activo` (ficha del bien:
  clasificación, estado, ubicación actual, asignación actual) y
  `TraspasoActivo` (solicitud de movimiento con flujo de aprobación —
  ver Decisión D3 de design.md).
- **CRUD de Activos**: alta (clave, descripción, clasificación —
  `EQUIPO`/`HERRAMIENTA`/`MAQUINARIA`/`VEHICULO` —, proyecto inicial),
  edición de datos descriptivos, baja (con motivo, no se puede volver a
  activar).
- **Traspasos con aprobación**: solicitar mover un activo a otro
  proyecto y/o asignarlo a un trabajador (`Empleado` real de
  `apps/personal`, referenciado por id con snapshot de nombre — mismo
  patrón que el solicitante de una Requisición) deja el activo en
  estado `EN_TRASPASO` y crea una solicitud `PENDIENTE`; alguien con
  rol de almacén operando ya en el proyecto destino debe confirmarla
  (o rechazarla) para que se aplique. Cubre tanto "traspaso entre
  proyectos" como "asignación a trabajador" con el mismo flujo (pueden
  combinarse en una sola solicitud).
- **Rastreabilidad histórica**: cada solicitud de traspaso
  (confirmada o rechazada) queda como registro permanente — la
  "bitácora" de un activo es la lista de sus `TraspasoActivo` en orden
  cronológico, sin necesidad de una tabla de historial separada.
- **Frontend**: nueva tab "Activos" en `AlmacenView.tsx` (catálogo +
  alta + solicitar traspaso/asignación + bandeja de traspasos
  pendientes de confirmar + historial por activo).

## Capabilities

### New Capabilities
- `activos-fijos-crud`: alta, edición, baja y catálogo de activos fijos
  clasificados por tipo.
- `activos-fijos-traspasos`: solicitud y confirmación/rechazo de
  traspasos de proyecto y/o asignación a empleado, con historial
  derivado de las solicitudes.

### Modified Capabilities
(ninguna)

## Impact

- **Backend (`apps/almacen`)**: `prisma/schema.prisma` (2 modelos
  nuevos), `src/main.ts` (endpoints nuevos bajo `/api/v1/almacen/activos`).
- **Frontend (`apps/app-shell`)**: `AlmacenView.tsx` (nueva tab),
  `Layout.tsx` (nuevo sub-item de navegación "Activos").
- Sin cambios en otros microservicios — la referencia a `Empleado` es
  por id + snapshot, sin llamada B2B síncrona (mismo patrón que
  `insumo_id` en `ItemInventario`, que tampoco valida contra Gerencia
  Técnica en cada request).

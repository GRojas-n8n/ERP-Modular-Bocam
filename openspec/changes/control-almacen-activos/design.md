## Context

`apps/almacen/prisma/schema.prisma` hoy solo tiene `ItemInventario`
(stock consumible por proyecto) y `MovimientoAlmacen` (ledger de
INGRESO/EGRESO/TRASPASO/EGRESO_OBRA). Ninguno de los dos sirve para
activos fijos: un activo no se "consume" (no tiene `stock_actual`), se
rastrea individualmente (un vehículo específico, no "5 unidades de
vehículo"), y necesita saber en todo momento quién lo tiene (proyecto +
opcionalmente un empleado específico).

`apps/almacen/src/main.ts` sigue el patrón `createTenantContext` +
`requireRoles('admin', 'superintendent', 'procurement', 'warehouse')`
para escrituras, igual que el resto del backend. `apps/personal` expone
`GET /api/v1/personal/empleados` (sin filtro de proyecto — es por
tenant) para poblar el picker de asignación en el frontend.

## Goals / Non-Goals

**Goals:**
- Alta, edición y baja de activos fijos, clasificados por tipo.
- Mover un activo de proyecto y/o asignarlo a un empleado con un flujo
  de aprobación (quien recibe confirma), sin aplicarse de inmediato.
- Historial completo y rastreable de dónde ha estado y a quién ha sido
  asignado cada activo.

**Non-Goals:**
- No se valida `empleado_id` contra `apps/personal` con una llamada B2B
  síncrona al crear el traspaso — se confía en el id que manda el
  frontend (que lo obtuvo de `GET /personal/empleados` real), mismo
  nivel de confianza que `insumo_id` en `ItemInventario` hoy.
- No hay mantenimiento/depreciación/valuación contable de activos en
  este change — solo el campo opcional `valor_adquisicion` para
  referencia, sin cálculos financieros. Eso es un módulo aparte si
  Bocam lo pide.
- Un activo dado de baja no se puede reactivar en este change — si se
  necesita, es un fix/change aparte con su propio spec.
- No se permite traspasar un activo que ya tiene una solicitud
  `PENDIENTE` — debe resolverse (confirmar o rechazar) esa antes de
  crear otra.

## Decisions

### D1 — `Activo` y `TraspasoActivo`, sin tabla de historial separada
Un solo modelo `TraspasoActivo` cubre traspaso de proyecto, asignación
a empleado, o ambos a la vez en una sola solicitud — con `estado`
(`PENDIENTE`/`CONFIRMADO`/`RECHAZADO`). El historial de un activo es
simplemente `TraspasoActivo` filtrado por `activo_id`, ordenado por
fecha — igual que `MovimientoAlmacen` ya sirve como ledger e historial
a la vez para inventario consumible. Evita una tabla de auditoría
redundante.

Campos de `Activo`:
- `numero_activo` (autoincremental `ACT-XXX` por tenant, mismo patrón
  que `numero_empleado` en `apps/personal`).
- `clave`, `descripcion`, `clasificacion`
  (`EQUIPO`|`HERRAMIENTA`|`MAQUINARIA`|`VEHICULO`).
- `estado` (`DISPONIBLE`|`ASIGNADO`|`EN_TRASPASO`|`BAJA`) — `ASIGNADO`
  cuando tiene `asignado_a_empleado_id`, `DISPONIBLE` cuando está en un
  proyecto sin asignar, `EN_TRASPASO` mientras tiene una solicitud
  pendiente (bloquea nuevas solicitudes, ver Non-Goals).
- `proyecto_id` (ubicación actual), `ubicacion` (texto libre dentro del
  proyecto — patio, bodega, obra — mismo campo que `ItemInventario.ubicacion`).
- `asignado_a_empleado_id` + `asignado_a_empleado_nombre` (snapshot,
  nullable — un activo puede estar en un proyecto sin asignar a nadie).
- `fecha_alta`, `fecha_baja`, `motivo_baja` (nullable), `valor_adquisicion`
  (nullable, referencia).

Campos de `TraspasoActivo`:
- `activo_id`, `tipo` (`PROYECTO`|`ASIGNACION`|`AMBOS` — qué cambia).
- `proyecto_origen_id`, `proyecto_destino_id` (nullable si `tipo=ASIGNACION` puro).
- `empleado_origen_id`/`nombre`, `empleado_destino_id`/`nombre`
  (nullable si `tipo=PROYECTO` puro, o si es una liberación —
  `empleado_destino_id = null` libera al activo de su asignación actual).
- `estado` (`PENDIENTE`|`CONFIRMADO`|`RECHAZADO`).
- `solicitado_por` (nombre snapshot), `solicitado_en`.
- `confirmado_por`/`rechazado_por` (nombre snapshot), `resuelto_en`,
  `notas` (motivo de rechazo, opcional en confirmación).

### D2 — Clasificación como enum de string, no tabla catálogo
`EQUIPO`/`HERRAMIENTA`/`MAQUINARIA`/`VEHICULO` es un `String` con
validación en el endpoint (mismo patrón que `estado`/`tipo` en
`MovimientoAlmacen`), no una tabla de catálogo aparte — son 4 valores
fijos pedidos explícitamente por Bocam, no una lista que el usuario
vaya a administrar.

### D3 — Traspaso requiere confirmación de quien recibe, aplicado a la BD solo al confirmar
Al **solicitar** un traspaso: se crea `TraspasoActivo` en `PENDIENTE`,
el `Activo.estado` pasa a `EN_TRASPASO` — pero `proyecto_id`/
`asignado_a_empleado_id` del activo **no cambian todavía**. Al
**confirmar**: se aplican los cambios al `Activo` (nuevo `proyecto_id`
y/o `asignado_a_empleado_id`), `estado` vuelve a `DISPONIBLE` o
`ASIGNADO` según corresponda. Al **rechazar**: el activo vuelve a su
`estado` previo sin cambios, sin aplicar nada.

**Quién puede confirmar**: mismos roles que pueden solicitar
(`admin`, `superintendent`, `procurement`, `warehouse`) — el sistema no
tiene login por empleado individual, así que "quien recibe confirma" se
implementa como "alguien con rol de almacén, operando con el
`proyecto_id` **destino** activo en su sesión (vía el switch de
proyecto ya existente), confirma la recepción". Si el traspaso es
`ASIGNACION` pura (mismo proyecto, solo cambia el empleado), cualquiera
con esos roles en ese proyecto puede confirmar — no se modela
aprobación por parte del empleado mismo (no tiene cuenta en el
sistema).

**Un activo con traspaso pendiente no admite otro traspaso** — el
endpoint de solicitud rechaza con 409 si `Activo.estado === 'EN_TRASPASO'`.
Evita que dos solicitudes conflictivas compitan por resolver el mismo
activo.

## Risks / Trade-offs

- **[Riesgo] Confirmar "operando con el proyecto destino activo"
  depende de que el usuario haga el switch de proyecto correctamente
  antes de confirmar — no hay una notificación push que se lo recuerde
  en este change.** → Mitigación: el endpoint de confirmación valida
  `proyecto_id` de la sesión contra `TraspasoActivo.proyecto_destino_id`
  y responde 403 si no coincide, así que un error de UX no puede
  aplicar el traspaso al proyecto equivocado — en el peor caso, el
  usuario ve el error y hace el switch correcto. La bandeja de
  pendientes en el frontend lo hace visible por proyecto.
- **[Riesgo] Sin notificación real-time, un traspaso puede quedar
  `PENDIENTE` indefinidamente si nadie revisa la bandeja.** → Fuera de
  alcance de este change (no hay sistema de notificaciones push en el
  proyecto todavía); la bandeja de pendientes es visible en el
  dashboard de Almacén.

## Migration Plan

- 2 modelos nuevos en `apps/almacen/prisma/schema.prisma` — migración
  aditiva, sin tocar `ItemInventario`/`MovimientoAlmacen`.
- Branch `feat/control-almacen-activos`.
- Deploy: `apps/almacen` requiere rebuild/restart manual del contenedor
  en el VPS tras mergear (sin CI/CD), más `prisma migrate deploy`.
- Rollback: revertir el commit — modelos nuevos sin FK hacia tablas
  existentes, sin riesgo para datos de inventario.

## Open Questions

- Ninguna abierta (asignación a Empleado real y flujo de aprobación
  confirmados con el usuario antes de especificar).

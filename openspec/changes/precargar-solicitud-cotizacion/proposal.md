## Why

El botón "Crear Cuadro Comparativo" / "Continuar comparativa" en la tarjeta de una
requisición `APROBADA` (`ComprasView.tsx`) depende de `solicitudesMap[req.id]` (con al
menos un proveedor `RESPONDIO`) cuando el cuadro aún no existe. Pero `solicitudesMap` solo
se llena bajo demanda — al abrir el panel "Ver Solicitud de Cotización"
(`handleOpenSolicitudPanel`) o al crear/reabrir el cuadro (`openComparativa`) — nunca al
cargar la lista de requisiciones (`fetchData`). Confirmado en producción (2026-07-13,
usuario administrador): tras marcar proveedores como respondidos y salir de la vista, al
volver el botón desaparece, aunque los datos en el backend siguen intactos (proveedores
respondidos, solicitud vigente) — el usuario tiene que reabrir y volver a cerrar "Ver
Solicitud de Cotización" para que `loadSolicitud` se dispare de nuevo y el botón reaparezca.

## What Changes

- `fetchData` (`ComprasView.tsx`) precarga la Solicitud de Cotización de cada requisición en
  estado `APROBADA` en paralelo, igual que ya hace con `requisiciones`/`comparativas`/etc. —
  sin esperar a que el usuario abra ningún panel.
- Sin cambios de backend ni de contrato de API — reutiliza el endpoint
  `GET /requisiciones/:reqId/solicitud-cotizacion` ya existente, llamado ahora de forma
  proactiva en vez de solo bajo demanda.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: el botón "Crear Cuadro Comparativo" debe reflejar el estado real
  de la Solicitud de Cotización sin depender de una acción previa del usuario en la sesión
  actual.

## Impact

- **Frontend únicamente**: `apps/app-shell/src/views/ComprasView.tsx` (`fetchData`).
- Afecta el flujo real de Compras en producción — bloqueaba retomar una requisición de
  imprevistos ya cotizada sin repetir un paso manual innecesario.

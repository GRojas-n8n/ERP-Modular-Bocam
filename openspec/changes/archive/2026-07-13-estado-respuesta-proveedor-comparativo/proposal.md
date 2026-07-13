## Why

Compras marca manualmente el estado de respuesta de cada proveedor
(`PENDIENTE`/`RESPONDIO`/`DECLINO`) en el panel "Solicitud de Cotización",
pero ese estado nunca llega al Cuadro Comparativo. Ahí, el chip de cada
proveedor solo muestra su nombre y un ícono de PDF si ya se subió una
cotización — no hay ningún indicador de quién ya respondió. Compras no
puede saber de un vistazo, sin salir a la otra pantalla, si ya tiene
información de todos los proveedores invitados o si aún faltan respuestas,
lo que dificulta saber cuándo el cuadro está "listo" para enviarse a
evaluación técnica.

## What Changes

- El endpoint `GET /api/v1/compras/comparativas/:id` incluye, por cada
  proveedor del comparativo, el `estado` (`PENDIENTE`/`RESPONDIO`/
  `DECLINO`) y `fecha_respuesta` de su `SolicitudCotizacionProveedor`
  correspondiente, cuando existe tal registro.
- El chip de cada proveedor en `ComparativaDetail.tsx` muestra un badge de
  color junto al nombre: verde "Respondió", rojo "Declinó", gris
  "Pendiente"; sin badge si el proveedor fue agregado manualmente desde el
  catálogo (nunca pasó por Solicitud de Cotización).
- **Sin cambios** a dónde se sube el PDF de cotización (se queda en el
  Cuadro Comparativo, decisión ya tomada en
  `2026-07-10-unificar-pdf-cotizacion-comparativa`) ni al panel de
  Solicitud de Cotización.
- **Fuera de alcance explícito**: no se cambia el filtro de
  `seedProveedoresDesdeSolicitud` (hoy trae a todos los invitados, no solo
  a los que respondieron — discrepancia conocida con el criterio CA-16 del
  diseño original de `flujo-solicitud-cotizacion`, se deja para una
  decisión de producto aparte).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `cotizacion-compras-ux`: el Cuadro Comparativo gana visibilidad del
  estado de respuesta del proveedor (dato que hoy solo vive en el panel de
  Solicitud de Cotización), sin cambiar dónde se sube el PDF ni el
  routing por rol ya definido.

## Impact

- **Backend (`apps/compras`)**: `GET /api/v1/compras/comparativas/:id`
  (`apps/compras/src/main.ts`, handler actual ~línea 2230-2260) — agregar
  join/lookup de `SolicitudCotizacionProveedor` por
  `requisicion_id`+`proveedor_id`. Sin cambios de schema (los campos
  `estado`/`fecha_respuesta` ya existen en `SolicitudCotizacionProveedor`).
- **Frontend (`apps/app-shell`)**: `ComparativaDetail.tsx` (interfaz
  `ProveedorComp`, chip de proveedor ~líneas 1646-1682) y
  `lib/comparativa-proveedores.ts` (`seedProveedoresDesdeSolicitud`, copiar
  el campo nuevo sin cambiar qué proveedores se seedean).
- Ambos servicios ya conviven en el mismo microservicio (`compras`); no
  hay llamada cross-service nueva desde el frontend.
- Sin cambios de schema/migraciones.

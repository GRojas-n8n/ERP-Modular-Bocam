## Context

`GET /api/v1/compras/comparativas/:id` (`apps/compras/src/main.ts:2228-2260+`)
ya resuelve varias colecciones relacionadas en paralelo con `Promise.all` y
las adjunta al payload de respuesta como mapas planos junto a `cuadro`
(patrón existente: `comparativaProveedorArchivo.findMany(...)` se adjunta
como `archivos_proveedor` en la respuesta, línea 2365). El estado de
respuesta de cada proveedor vive en `SolicitudCotizacionProveedor.estado`
(`apps/compras/prisma/schema.prisma:510-524`), enlazado a través de
`SolicitudCotizacion` (única por `(tenant_id, requisicion_id)`, línea
489-508) y de ahí a `SolicitudCotizacionProveedor` (única por
`(solicitud_id, proveedor_id)`, línea 524).

`cuadro.requisicion_id` ya está disponible en el mismo handler (se usa en
la línea 2315 para buscar Órdenes de Compra relacionadas) — así que
resolver la `SolicitudCotizacion` de esa requisición y sus
`SolicitudCotizacionProveedor` es una consulta más del mismo
`Promise.all`, sin nueva llamada cross-service.

En el frontend, `ProveedorComp` (`ComparativaDetail.tsx:79-82`) hoy es
`{ id, nombre }`; el chip de proveedor (líneas 1646-1682) no tiene ningún
elemento visual para estado de respuesta.

## Goals / Non-Goals

**Goals:**
- Que Compras vea, sin salir del Cuadro Comparativo, si cada proveedor ya
  respondió, declinó o sigue pendiente — mismo dato que ya ve en Solicitud
  de Cotización, solo que también aquí.
- Degradar con gracia: un proveedor agregado manualmente desde catálogo
  (nunca invitado vía Solicitud de Cotización) no tiene
  `SolicitudCotizacionProveedor` — no debe mostrar ningún badge, ni error.

**Non-Goals:**
- No se toca dónde se sube el PDF (sigue en el Cuadro Comparativo).
- No se cambia el filtro de `seedProveedoresDesdeSolicitud` (sigue trayendo
  a todos los invitados, no solo a `RESPONDIO`) — es la discrepancia con
  CA-16 documentada en el proposal, explícitamente fuera de alcance.
- No se agrega la posibilidad de cambiar el estado desde el Cuadro
  Comparativo (eso se sigue haciendo solo desde Solicitud de Cotización) —
  este change es de solo lectura/visibilidad.

## Decisions

### D1 — Resolver el estado vía una consulta más en el mismo `Promise.all`, no un nuevo endpoint
En el handler de `GET /comparativas/:id`, agregar al `Promise.all` existente
(línea 2236) una consulta:
```ts
prisma.solicitudCotizacion.findUnique({
  where: { tenant_id_requisicion_id: { tenant_id: tenantId, requisicion_id: cuadro.requisicion_id } },
  include: { proveedores: { select: { proveedor_id: true, estado: true, fecha_respuesta: true } } },
})
```
Nota: como `cuadro.requisicion_id` solo se conoce después del primer
`findUnique` de `cuadro` (línea 2237), esta consulta no puede ir dentro del
mismo `Promise.all` inicial — se resuelve justo después, en paralelo con
las demás consultas que también dependen de `cuadro` (patrón ya usado en
la línea 2274 para `especificaciones`/`reqItems`, y en la línea 2316 para
`ordenesRaw`). Se adjunta a la respuesta como
`estado_respuesta_proveedor: Record<string, { estado: string; fecha_respuesta: string | null }>`
(mapa `proveedor_id -> estado`), siguiendo el mismo patrón que
`archivos_proveedor` (línea 2365).
Alternativa descartada: crear un endpoint nuevo
`GET /comparativas/:id/estado-respuesta` — innecesario, es un dato de
solo lectura que siempre se necesita junto con el resto del comparativo;
un round-trip adicional no aporta nada y complica el frontend.

### D2 — Frontend: campo opcional en `ProveedorComp`, no un tipo nuevo
```ts
interface ProveedorComp {
  id: string;
  nombre: string;
  estado_respuesta?: 'PENDIENTE' | 'RESPONDIO' | 'DECLINO';
  fecha_respuesta?: string | null;
}
```
`seedProveedoresDesdeSolicitud` y el mapeo de `cuadro.detalles`/`proveedores`
en `ComparativaDetail.tsx` copian estos campos desde
`estado_respuesta_proveedor[prov.id]` si existe; si no existe (proveedor
agregado manualmente), quedan `undefined` y el chip no renderiza badge.

### D3 — Badge visual junto al nombre en el chip, no una columna nueva
Reutilizar el patrón de badges de color ya usado en el propio archivo para
`evaluacion_tecnica` (C/NC/DA, ver clases `border-green-500/30
bg-green-500/10 text-green-700` etc. en la tabla de líneas) para mantener
consistencia visual: verde "Respondió", rojo "Declinó", gris "Pendiente".
Se coloca junto al nombre en el chip (líneas ~1646-1682), no como columna
separada de la tabla — el chip ya es el lugar donde vive la identidad del
proveedor.

## Risks / Trade-offs

- **[Riesgo] Un comparativo puede tener proveedores agregados manualmente
  Y proveedores invitados por Solicitud de Cotización mezclados —
  confusión visual si el badge no dice claramente "sin invitación" para
  los manuales.**
  → Mitigación: ausencia de badge (no un badge gris "Pendiente" por
  default) para proveedores sin `SolicitudCotizacionProveedor` asociado;
  el gris "Pendiente" se reserva solo para quien sí fue invitado pero aún
  no contesta.
- **[Riesgo] Requisición sin `SolicitudCotizacion` en absoluto (comparativo
  armado 100% manual, sin invitación previa)** → el `findUnique` regresa
  `null`, el mapa queda vacío, todos los proveedores sin badge — caso ya
  cubierto por el mismo mecanismo de "ausencia de dato", sin manejo
  especial adicional.
- **[Riesgo] Costo de una consulta extra por carga de comparativo** →
  Mitigación: es una consulta indexada por `(tenant_id, requisicion_id)`
  (índice único existente, línea 508) sobre una tabla pequeña por
  requisición (máx. ~3 proveedores) — impacto de performance despreciable,
  mismo patrón ya aceptado para `ordenesRaw`/`archivosProveedor`.

## Migration Plan

- Sin migración de datos — los campos `estado`/`fecha_respuesta` ya
  existen en `SolicitudCotizacionProveedor`, solo se exponen.
- Sin cambios de schema/Prisma.
- Branch `feat/estado-respuesta-proveedor-comparativo`.
- Deploy: backend (`apps/compras`) requiere rebuild/restart manual del
  contenedor en el VPS (sin CI/CD, igual que el resto del backend);
  frontend se despliega solo al mergear a `main`.
- Rollback: revertir el commit — cambio aditivo y de solo lectura, sin
  riesgo de romper datos existentes si se revierte.

## Open Questions

- Ninguna abierta.

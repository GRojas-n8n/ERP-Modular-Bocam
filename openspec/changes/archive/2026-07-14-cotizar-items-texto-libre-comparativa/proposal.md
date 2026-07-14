## Why

Los ítems de requisición de texto libre (imprevistos, sin `insumo_id` de catálogo — el
catálogo `Insumo` vive en el microservicio `gerencia-tecnica`, fuera del alcance de
`compras`) nunca pueden tener precio guardado en el Cuadro Comparativo, ni por PDF
automático ni por captura manual. Confirmado en producción (2026-07-13, usuario
administrador, requisición `a9b073fc-a74b-4fc4-9b74-7d6a4e6fc09a`, ítem "Mini Split..." sin
`insumo_id`):

- `POST /comparativas` (`apps/compras/src/main.ts`, bloque de auto-populate) salta por
  completo los ítems sin `insumo_id` (`if (!item.insumo_id) continue;`) — nunca se crea
  `ComparativaLinea` para ellos.
- `PUT /comparativas/:id/cotizaciones` descarta cualquier precio cuyo `insumo_id` venga
  vacío (`if (!p.insumo_id || p.precio === undefined) continue;`).
- El frontend deja a Compras escribir el precio en la celda (estado local), pero se pierde
  sin aviso en el primer guardado real (al enviar a evaluación técnica).

Es un problema estructural, no un caso aislado: en todo `apps/compras`, los ítems
`es_imprevisto` se excluyen sistemáticamente de la lógica basada en `insumo_id` (mismo
patrón en `main.ts:884,890`, filtros de stock).

## What Changes

- `ComparativaLinea.insumo_id` y `ComparativaDetalle.insumo_id` pasan a ser **opcionales**.
  Se usa `detalle_req_id` (referencia al `RequisicionItem` de origen, ya existe en
  `ComparativaLinea`, se agrega a `ComparativaDetalle`) como llave alterna cuando no hay
  `insumo_id` — sin crear ningún registro sintético en el catálogo de `gerencia-tecnica`.
- `POST /comparativas` crea la línea también para ítems sin `insumo_id`, usando
  `detalle_req_id` como llave de upsert.
- `PUT /comparativas/:id/cotizaciones` acepta y persiste precios para líneas identificadas
  por `detalle_req_id` cuando no tienen `insumo_id`.
- El panel de "Detalles técnicos" (marca/especificaciones) funciona igual para estas líneas.
- La respuesta de `GET /comparativas` / `GET /comparativas/:id` y la normalización del
  frontend agrupan correctamente usando `insumo_id ?? detalle_req_id` como llave estable de
  línea.
- **BREAKING** (interno, sin impacto en datos existentes): el payload de
  `PUT /cotizaciones` acepta ahora `insumo_id` opcional + `detalle_req_id` opcional (al
  menos uno de los dos requerido) en vez de `insumo_id` obligatorio.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: agrega el comportamiento de creación/cotización de líneas sin
  `insumo_id` de catálogo.

## Impact

- **Backend**: `apps/compras/prisma/schema.prisma` (`ComparativaLinea.insumo_id` nullable,
  `ComparativaDetalle.insumo_id` nullable + `detalle_req_id` nuevo), migración de Prisma.
  `apps/compras/src/main.ts`: `POST /comparativas`, `PUT /comparativas/:id/cotizaciones`,
  `PUT /comparativas/:id/lineas/:insumoId` (o ruta alterna), `GET /comparativas`,
  `GET /comparativas/:id`.
- **Frontend**: `apps/app-shell/src/views/ComprasView.tsx` (`buildLineasFromReq`,
  `normalizeComp`, payload de `handleEnviarEvaluacion`), `ComparativaDetail.tsx`
  (identificación de línea para precios/marca/especificaciones).
- **Fuera de alcance de este change** (se especificará aparte cuando la prueba manual del
  usuario llegue a ese punto del flujo): evaluación técnica por línea
  (`evaluacion_tecnica`/`comentario_tecnico` en `ComparativaDetalle`) y generación de Orden
  de Compra (`convertir-oc`) para líneas sin `insumo_id` — ambos asumen hoy `insumo_id`
  también, pero no bloquean el paso actual del usuario (captura de precios).
- No afecta datos existentes: todas las líneas/detalles ya persistidos tienen `insumo_id`
  poblado, la migración es aditiva (columna nueva + constraint relajado).

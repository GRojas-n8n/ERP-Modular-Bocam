## Context

`insumo_id` es la llave de correlación de facto de todo el subsistema de Cuadro Comparativo
en `apps/compras/src/main.ts` — no solo de creación y precios. Un relevamiento completo
encontró `insumo_id` como llave en ~15 puntos distintos: creación del cuadro, guardar
precios, marca/especificaciones por línea, subir PDF por proveedor, aclaraciones técnicas
por celda, evaluación técnica por especificación (matriz), clonado de revisión
(`nueva-revision`), y `convertir-oc`.

Hacer que **todo** ese subsistema soporte líneas sin `insumo_id` en un solo change es
demasiado riesgo para una sola sesión sobre código de producción con datos reales. Este
change cubre únicamente lo que bloquea el paso actual del usuario en su prueba manual:
**crear la línea y poder guardarle un precio**, con marca/especificaciones y lectura
correctos. El resto (aclaraciones, evaluación técnica, clonado de revisión, conversión a
OC) queda documentado como trabajo de seguimiento, a especificarse cuando la prueba manual
llegue a ese punto — mismo patrón ya usado con éxito en esta sesión para los 3 bugs
anteriores (auto-poblar-proveedores, fix-emparejamiento-pdf, marca-especificaciones).

## Goals / Non-Goals

**Goals:**
- Un ítem de requisición sin `insumo_id` (imprevisto/texto libre) obtiene una
  `ComparativaLinea` al crear el cuadro.
- Compras puede guardarle un precio por proveedor (`PUT /cotizaciones`) que persiste
  correctamente.
- El panel de "Detalles técnicos" (marca/especificaciones) funciona igual para esta línea.
- La lectura del cuadro (`GET /comparativas`, `GET /comparativas/:id`) y su normalización en
  frontend muestran la línea correctamente, con precios por proveedor.
- Ningún dato existente (líneas/detalles ya persistidos, todos con `insumo_id`) se ve
  afectado — migración puramente aditiva.

**Non-Goals (documentado explícitamente, no se implementa en este change):**
- Aclaraciones técnicas por celda (`AclaracionComparativa`, endpoints ~2455-2520/5336-5390)
  para líneas sin `insumo_id`.
- Evaluación técnica por especificación / matriz C-NC-DA-? (`evaluacion_tecnica`,
  `comentario_tecnico` en `ComparativaDetalle`, ~3343-3394) para líneas sin `insumo_id`.
- Clonado de revisión (`nueva-revision`, ~5279-5299/5634-5658) para líneas sin `insumo_id`.
- `convertir-oc` (~2668-2910) para líneas sin `insumo_id` — generar una Orden de Compra a
  partir de un ítem de texto libre requiere decidir cómo se describe el ítem en el PDF de
  la OC sin un `Insumo` de catálogo detrás; se resuelve en un change aparte cuando la prueba
  llegue a ese paso.
- Subir PDF de cotización por proveedor (`PUT
  .../proveedores/:provId/cotizacion-pdf`) ya funciona hoy (no está keyed por línea/insumo,
  es por proveedor) — sin cambios necesarios ahí.

Si Compras intenta avanzar una línea sin `insumo_id` más allá de "tiene precio guardado"
(evaluación técnica, aclaración, conversión a OC), el comportamiento actual (silencioso o
con error genérico) puede seguir presente hasta que se cubra en un change de seguimiento —
esto se documentará como limitación conocida, no se oculta.

## Decisions

### D1: `insumo_id` opcional en `ComparativaLinea` y `ComparativaDetalle`, `detalle_req_id` como llave alterna

- `ComparativaLinea.insumo_id`: `String @db.Uuid` → `String? @db.Uuid`. Ya tiene
  `detalle_req_id String? @db.Uuid` — pasa a ser efectivamente obligatorio (a nivel de
  aplicación, no de schema, para no romper filas antiguas) cuando `insumo_id` es nulo.
  Constraint: agregar `@@unique([cuadro_id, detalle_req_id])` (Postgres permite múltiples
  `NULL` en un índice único, así que no colisiona con las líneas que sí tienen `insumo_id`
  y `detalle_req_id` nulo por ser de cuadros antiguos).
- `ComparativaDetalle.insumo_id`: `String @db.Uuid` → `String? @db.Uuid`. Se agrega
  `detalle_req_id String? @db.Uuid` (columna nueva). No se agrega constraint único nuevo
  aquí — la unicidad de `(cuadro_id, proveedor_id, insumo_id|detalle_req_id)` ya se maneja a
  nivel de aplicación en `PUT /cotizaciones` (`deleteMany` + recreate completo en cada
  guardado, no upsert por fila).

**Alternativa descartada** (ver AskUserQuestion con el usuario): crear automáticamente un
`Insumo` "ad-hoc" en el catálogo de `gerencia-tecnica` vía llamada backend-to-backend. Se
descarta porque `Insumo` es el catálogo técnico oficial de GT — llenarlo de entradas de un
solo uso lo ensucia, y requiere un endpoint nuevo en un microservicio distinto para un
problema que es enteramente interno de `compras`.

### D2: Identificar la línea con `insumo_id ?? detalle_req_id` en toda lectura/escritura tocada

Backend (`POST /comparativas`, `PUT /cotizaciones`, `PUT /lineas/:insumoId`, `GET
/comparativas`, `GET /comparativas/:id`) y frontend (`normalizeComp`, `buildLineasFromReq`,
payload de `handleEnviarEvaluacion`) usan `insumo_id` cuando existe; si no, `detalle_req_id`.
El campo `linea.id` en el frontend (`CotizacionLinea.id`) ya es independiente de
`insumo_id` en la práctica (mapea a `id_detalle`/`id_item` según el caso) — no requiere
cambio de forma, solo que el backend deje de exigir `insumo_id` para poblarlo.

### D3: `PUT /comparativas/:id/lineas/:insumoId` (marca/especificaciones) acepta un `detalle_req_id` en el parámetro de ruta

En vez de crear una ruta nueva, el parámetro `:insumoId` de la ruta existente acepta
también un `detalle_req_id` cuando la línea no tiene `insumo_id` — el backend intenta
`upsert` por `(cuadro_id, insumo_id)` primero y, si el valor no es un `insumo_id` real de
esa línea, cae a `(cuadro_id, detalle_req_id)`. El frontend ya sabe cuál de los dos usar
porque tiene el objeto línea completo.

**Alternativa descartada**: ruta nueva `PUT /comparativas/:id/lineas/detalle/:detalleReqId`.
Se descarta por simplicidad — un único endpoint con lógica de "intentar por insumo, si no
por detalle" es menos superficie de API que mantener sincronizada.

### D4: Payload de `PUT /cotizaciones`

`precios: Array<{ insumo_id?: string; detalle_req_id?: string; precio: number;
fecha_entrega_estimada?: string }>` — al menos uno de `insumo_id`/`detalle_req_id` requerido
por renglón. El backend crea `ComparativaDetalle` con el campo que corresponda poblado y el
otro `null`.

## Risks / Trade-offs

- **[Riesgo]** Superficie de cambio real (schema + 5 endpoints backend + 3 puntos de
  frontend) es considerable para un solo change, aun acotado. **[Mitigación]** Todos los
  cambios son aditivos/opcionales — ninguna línea/detalle existente pierde su `insumo_id` ni
  cambia de comportamiento; el riesgo de regresión sobre datos ya persistidos es bajo.
- **[Riesgo]** El Non-Goals explícito (aclaraciones, evaluación técnica, revisión, OC) deja
  al usuario con un límite claro y predecible: una vez capturado el precio, si intenta
  evaluar técnicamente o convertir a OC una línea sin `insumo_id`, puede volver a
  encontrarse un comportamiento roto o silencioso — igual que hoy, no es una regresión, pero
  tampoco queda resuelto. **[Mitigación]** Documentado explícitamente en Non-Goals y se
  abordará como change de seguimiento en cuanto la prueba manual llegue a ese punto.

## Migration Plan

Migración de Prisma aditiva: `ALTER COLUMN insumo_id DROP NOT NULL` en ambas tablas +
`ADD COLUMN detalle_req_id` en `ComparativaDetalle` + nuevo índice único en
`ComparativaLinea`. Sin backfill necesario (todas las filas existentes ya tienen
`insumo_id`). Rollback: revertir el PR: es seguro porque las filas nuevas con `insumo_id`
nulo simplemente no existirán aún si se revierte antes de que Compras las cree.

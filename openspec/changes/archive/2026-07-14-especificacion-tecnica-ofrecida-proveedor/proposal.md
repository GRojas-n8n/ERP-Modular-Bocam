## Why

Reporte del usuario: al abrir el Cuadro Comparativo para hacer la evaluación técnica, el
Residente no ve ninguna especificación técnica de lo que cada proveedor está ofreciendo
por renglón — solo el precio y la fecha de entrega. Investigado a fondo: el campo para
esto (`ComparativaDetalle.valor_ofrecido_spec`, "Lo que el proveedor ofrece") **existe en
la base de datos y el backend lo acepta**, pero:

- No hay ningún campo de captura en la pantalla donde Compras arma el cuadro
  (`ComparativaDetail.tsx`) — solo se captura precio y fecha de entrega por
  (renglón, proveedor).
- El único lugar donde se lee ese campo es un `<span>` de solo lectura en modo Residente
  (línea ~2266), pero **nunca se popula desde el backend** al cargar el cuadro — el
  frontend nunca lo asigna en `normalizeComp`. Es código muerto: el campo jamás tiene
  valor.
- Además el tipo TypeScript del campo es un `string` único por renglón (no por proveedor),
  cuando el dato real en BD es por `(cuadro, proveedor, renglón)` — mismo patrón de bug ya
  corregido para evaluación técnica en `fix-evaluacion-tecnica-por-proveedor` (PR #59), que
  aquí nunca se llegó a implementar en primer lugar.

Resultado: el Residente evalúa C/NC/DA/? completamente a ciegas respecto a qué especificó
cada proveedor, salvo que Compras se lo comunique fuera del sistema (WhatsApp, verbal,
etc.) — contradice el propósito mismo de la evaluación técnica documentada.

## What Changes

- **Backend** (`PUT /api/v1/compras/comparativas/:id/cotizaciones`, `apps/compras/src/main.ts`):
  aceptar un campo opcional `especificacion_ofrecida` por cada item de `precios[]` en el
  payload, y persistirlo en la columna ya existente `ComparativaDetalle.valor_ofrecido_spec`
  (sin migración de esquema — la columna ya existe, solo nunca se escribía desde este
  endpoint).
- **Frontend — captura** (`ComparativaDetail.tsx`, modo Compras, `comp.estado === 'BORRADOR'`):
  agregar un campo de texto libre por (renglón, proveedor) junto a los inputs de precio y
  fecha de entrega ya existentes, con el mismo patrón de estado (`Record<proveedor_id,
  string>`, análogo a `precios`/`fechasEntrega`) para no repetir el bug de colapsar a un
  solo valor por renglón.
- **Frontend — envío**: incluir `especificacion_ofrecida` en el payload que ya arma
  `handleEnviarEvaluacion` al guardar cotizaciones, junto a `precio` y
  `fecha_entrega_estimada`.
- **Frontend — carga**: `normalizeComp` (en `ComprasView.tsx`, usado por las 3 listas:
  cuadros, pendientes de evaluación, pendientes GT) debe popular el nuevo campo por
  proveedor desde `d.valor_ofrecido_spec` al construir cada línea, igual que ya hace con
  `precios`/`fechasEntrega`.
- **Frontend — visualización Residente**: en la celda de modo Residente (línea ~2263-2273)
  reemplazar la lectura de `linea.valor_ofrecido_spec` (string único, siempre vacío) por
  lectura keyed por `prov.id` del nuevo campo, para que se muestre correctamente por
  proveedor durante la evaluación.
- Sin cambios de alcance: **por renglón × proveedor** (no por característica individual —
  el flujo más granular de `EvaluacionEspecificacion` queda fuera de este change), y
  **captura exclusiva de Compras mientras el cuadro está en `BORRADOR`** (mismo estado en
  que ya se edita precio/fecha de entrega hoy — no se agrega edición posterior).

## Capabilities

### New Capabilities
- `especificacion-tecnica-ofrecida-proveedor`: captura y visualización de la
  especificación técnica que cada proveedor ofrece por renglón del Cuadro Comparativo, para
  que la evaluación técnica del Residente esté informada.

### Modified Capabilities
(ninguna — el campo de BD y el endpoint ya existían; se documenta como capability nueva
porque el comportamiento observable, tanto de captura como de lectura, no existía hasta
ahora)

## Impact

- **Backend**: `apps/compras/src/main.ts` (`PUT /comparativas/:id/cotizaciones`) — un
  campo nuevo en el body, sin migración de Prisma.
- **Frontend**: `apps/app-shell/src/components/ComparativaDetail.tsx` (captura + display),
  `apps/app-shell/src/views/ComprasView.tsx` (`normalizeComp`, 3 call sites).
- **Sin impacto en el flujo de evaluación por especificación individual**
  (`EvaluacionEspecificacion`) ni en la lectura de PDF por IA (`apps/asistente`) — ninguno
  se toca en este change.

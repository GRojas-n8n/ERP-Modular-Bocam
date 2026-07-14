## Why

Hoy Compras puede solicitar cotización externa a proveedores para cualquier
insumo de una Requisición sin ninguna señal de que ese insumo ya podría
estar disponible en Almacén — el código ya tiene un stub explícito
reconociendo el hueco (`apps/compras/src/main.ts:998-1001`: *"stock en
almacén — consultar microservicio almacen ... cantidad_surtida se reporta
como 0 hasta integrar llamada B2B"*). Esto puede llevar a comprar de más
algo que ya está en existencia, sin que nadie lo note hasta después. Es el
punto 7 del roadmap del usuario.

## What Changes

- `apps/almacen` expone un endpoint nuevo de consulta batch de stock por
  lista de `insumo_id` (`GET /api/v1/almacen/stock?insumo_ids=...`), para
  que Compras pueda resolver el stock de todos los insumos de una
  requisición en una sola llamada B2B — mismo patrón fail-soft ya usado
  hacia gerencia-tecnica (`apps/compras/src/main.ts:119`).
- `apps/compras` consulta ese endpoint al abrir el panel de "Solicitar
  Cotización" y, si algún insumo (no imprevisto) de la requisición ya
  tiene `stock_actual > 0` en el proyecto activo, muestra una advertencia
  con el detalle (insumo, cantidad solicitada, stock disponible) dentro
  del mismo panel.
- La advertencia **no bloquea** el envío — Compras debe confirmar
  explícitamente ("Enviar de todos modos") para proceder, sin fricción
  adicional si no hay insumos con stock.
- Ítems `es_imprevisto = true` (sin `insumo_id`, texto libre) quedan
  explícitamente fuera de la validación — no se pueden cruzar contra el
  catálogo de Almacén.
- Si la llamada B2B a Almacén falla (timeout, servicio caído), la
  solicitud de cotización se sigue pudiendo enviar sin advertencia
  (degradación fail-soft, mismo criterio que la integración existente con
  gerencia-tecnica) — se documenta el trade-off de que en ese escenario no
  hay aviso de stock.
- **BREAKING**: ninguno — es aditivo; el flujo de envío sin insumos con
  stock queda idéntico al actual (sin pasos ni clics nuevos).

## Capabilities

### New Capabilities
- `validacion-stock-cotizacion-externa`: consulta de stock batch desde
  Compras hacia Almacén antes de solicitar cotización externa, y la
  advertencia con confirmación en el panel de "Solicitar Cotización".

### Modified Capabilities
(ninguna — no existe spec previo para el endpoint de stock de Almacén ni
para el panel de solicitud de cotización de Compras)

## Impact

- **Backend `apps/almacen`**: `src/main.ts` — nuevo endpoint
  `GET /api/v1/almacen/stock?insumo_ids=a,b,c` (o extensión de
  `GET /api/v1/almacen/inventario` con filtro `insumo_ids`), scoped por
  `tenant_id`+`proyecto_id` de la sesión, igual que el resto de endpoints
  de este servicio.
- **Backend `apps/compras`**: `src/main.ts` — nueva función B2B
  `consultarStockAlmacen(insumoIds, ctx)` siguiendo el patrón de
  `axios.get` fail-soft ya usado hacia gerencia-tecnica; se invoca al
  abrir el panel de solicitud de cotización (`GET
  .../requisiciones/:reqId/solicitud-cotizacion`, línea 843, o un
  endpoint nuevo dedicado si conviene separarlo).
- **Frontend `apps/app-shell`**: `src/views/ComprasView.tsx` — el panel de
  "Solicitar Cotización" (`solicitudPanelReqId`, líneas ~2711-2999) gana
  una sección de advertencia de stock y un segundo estado del botón de
  envío ("Enviar de todos modos") cuando aplica.

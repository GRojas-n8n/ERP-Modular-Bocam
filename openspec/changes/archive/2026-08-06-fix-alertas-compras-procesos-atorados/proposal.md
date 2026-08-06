## Why

Verificado en producción (VPS, consulta de solo lectura a `bocam_compras`): 3 de las 4
requisiciones reales llevan entre 9 y 14 días atoradas en algún punto del flujo
Requisición → Cuadro Comparativo → Orden de Compra, sin que nadie lo note. En un caso, el
backend ya generó la OC automáticamente y esta cayó en `ERROR_FINANZAS` ("Presupuesto
insuficiente") hace 9 días — el endpoint que la resolvería (`POST
/ordenes-compra/:id/reconciliar-finanzas`) ya existe y funciona, pero ningún componente del
frontend lo llama ni muestra la alerta correspondiente (`alertaOcError`, tabla
`alertas_oc_error`). En los otros dos casos, una `Requisicion` `APROBADA` nunca obtuvo un
`CuadroComparativo`, y una revisión de un `CuadroComparativo` quedó en `BORRADOR` sin que
nadie la retomara — no existe ningún mecanismo, ni en backend ni en frontend, que detecte
antigüedad excesiva en estos estados intermedios.

El endpoint estándar del módulo (`GET /api/v1/compras/dashboard`) ya tiene un array
`alertas[]` (spec `endpoint-dashboard-compras`), pero hoy solo cubre
`cotizacion_vencida` — es la superficie natural para exponer ambos huecos sin introducir un
endpoint nuevo.

## What Changes

- `GET /api/v1/compras/dashboard`: el array `alertas[]` incluye ahora también las OCs en
  `ERROR_FINANZAS` no resueltas (leídas de `alertaOcError` donde `resuelta = false`), con
  `tipo: "oc_error_finanzas"`.
- `GET /api/v1/compras/dashboard`: `alertas[]` incluye `Requisicion` en estado `APROBADA`
  sin ningún `CuadroComparativo` asociado, con más de N días de antigüedad desde
  `fecha_solicitud` (`tipo: "requisicion_sin_cuadro"`).
- `GET /api/v1/compras/dashboard`: `alertas[]` incluye `CuadroComparativo` en estado no
  terminal (todo estado salvo `APROBADO_GT`, `RECHAZADO_GT`, `CERRADO`, `SUPERSEDIDO` — incluye
  `BORRADOR`, `CON_SOLICITUD`, `EN_COTIZACION`, `EN_EVALUACION_TECNICA`,
  `EVALUADO_TECNICAMENTE`, `EN_APROBACION_GT`, `REVISION_SOLICITADA`, `FIRMADO_BLOQUEADO`,
  `LOCKED`) con más de N días de antigüedad desde `fecha_creacion` (`tipo: "cuadro_atorado"`).
  Se incluye `FIRMADO_BLOQUEADO`/`LOCKED` a propósito: firmar el cuadro NO lo envía
  automáticamente a GT (`ESTADOS_ENVIABLES` en `main.ts:3733` exige un paso separado de
  "enviar a GT"), así que un cuadro firmado y nunca enviado es el mismo patrón de atasco que
  los demás.
- `POST /api/v1/compras/ordenes-compra/:id/reconciliar-finanzas`: al tener éxito, marca la
  fila correspondiente de `alertaOcError` como `resuelta = true` (verificado que hoy no lo
  hace), para que la alerta deje de listarse una vez resuelta.
- Frontend (`ComprasView.tsx`): nueva sección visible de "Alertas" en el dashboard de
  Compras que lista las tres alertas anteriores. Las de tipo `oc_error_finanzas` incluyen un
  botón "Reintentar" que llama a `reconciliar-finanzas` y refresca el dashboard; muestra el
  error de forma explícita si el reintento vuelve a fallar (no lo silencia).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `endpoint-dashboard-compras`: `alertas[]` gana tres tipos nuevos (`oc_error_finanzas`,
  `requisicion_sin_cuadro`, `cuadro_atorado`) además del existente `cotizacion_vencida`.
- `multi-oc-generacion`: `reconciliar-finanzas` ahora marca `resuelta = true` en
  `AlertaOcError` cuando el reintento tiene éxito.

## Impact

- **Backend**: `apps/compras/src/main.ts` — handler de `GET /api/v1/compras/dashboard`
  (~línea 4111) y handler de `POST /ordenes-compra/:id/reconciliar-finanzas` (~línea 4473).
  Sin cambios de schema (no se requiere `updated_at` nuevo; `fecha_creacion` /
  `fecha_solicitud` ya existentes son suficientes como proxy de antigüedad).
- **Frontend**: `apps/app-shell/src/views/ComprasView.tsx` (o el componente de
  dashboard/alertas que consuma ese endpoint).
- No cruza a otros microservicios más allá de la llamada B2B a Finanzas que
  `reconciliar-finanzas` ya hace hoy.
- Bug de producción activo: 3 de 4 requisiciones reales están atoradas hoy por esta causa.

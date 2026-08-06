## Context

`GET /api/v1/compras/dashboard` (`apps/compras/src/main.ts:4111`) ya calcula `alertas[]` para
`cotizacion_vencida`. El resto de la maquinaria necesaria para las alertas nuevas ya existe
en el backend pero está desconectada de esa superficie:

- `alertaOcError` (tabla `alertas_oc_error`) ya se llena cuando el evento
  `finanzas.presupuesto_insuficiente` llega (línea ~5007) o cuando la conversión síncrona a
  OC falla (línea ~3002-3013). Tiene su propio endpoint de lectura
  (`GET /api/v1/compras/alertas/oc-error`, línea ~5083) que ningún frontend consume.
  Verificado en prod: 1 fila real con `resuelta = false` desde hace 9 días.
- `POST /ordenes-compra/:id/reconciliar-finanzas` (línea ~4473) ya reintenta
  `comprometer-fondos` contra Finanzas y pasa la OC a `EMITIDA` si tiene éxito, pero **no
  toca `alertaOcError`** — la fila queda `resuelta = false` para siempre aunque el reintento
  haya funcionado.
- `Requisicion` y `CuadroComparativo` no tienen ningún campo de "antigüedad excedida"
  precalculado. `CuadroComparativo` no tiene `updated_at`, solo `fecha_creacion`.

## Goals / Non-Goals

**Goals:**
- Que las tres alertas (OC en `ERROR_FINANZAS`, requisición sin cuadro, cuadro atorado)
  aparezcan en el dashboard estándar de Compras sin introducir un endpoint nuevo.
- Que resolver una OC en `ERROR_FINANZAS` desde la UI (reintento con éxito) apague la alerta
  correspondiente automáticamente.
- Cambios mínimos y reversibles: sin migración de schema, sin nuevas tablas.

**Non-Goals:**
- No se agrega un mecanismo de notificación push/email — solo visibilidad en el dashboard
  que el usuario ya consulta.
- No se hace configurable el umbral de días vía UI/admin en este change — queda como
  constante en código, ajustable después si hace falta.
- No se resuelve la causa raíz de por qué Finanzas rechaza el presupuesto (eso es lógica de
  negocio de `finanzas`, fuera de alcance — aquí solo se hace visible y accionable el
  reintento que ya existe).
- No se agrega `updated_at` a `CuadroComparativo` — se usa `fecha_creacion` como proxy de
  antigüedad (ver Decisión 2).

## Decisions

### Decisión 1 — Alertas calculadas en el mismo handler del dashboard, no un endpoint nuevo
Las tres queries nuevas (OCs en error, requisiciones sin cuadro, cuadros atorados) se
agregan al `Promise.all` existente en el handler de `GET /api/v1/compras/dashboard`, junto a
`solicitudesVencidas`. Se descarta crear endpoints nuevos por-alerta: el problema real no es
que falte backend (`/alertas/oc-error` ya existe y nadie lo usa), es que el frontend nunca
consulta una superficie unificada. Consolidar todo en `alertas[]` del dashboard reduce el
riesgo de repetir el mismo error (backend correcto, sin consumidor).

### Decisión 2 — `fecha_creacion`/`fecha_solicitud` como proxy de antigüedad, sin `updated_at` nuevo
Alternativas consideradas:
- (a) Agregar `updated_at` a `CuadroComparativo` vía migración y usarlo como antigüedad real
  desde el último cambio de estado.
- (b) Usar `fecha_creacion` (ya existe) como proxy: "cuántos días lleva vivo el cuadro sin
  llegar a un estado terminal". Terminal = `APROBADO_GT`, `RECHAZADO_GT`, `CERRADO`,
  `SUPERSEDIDO` (confirmado por grep de todos los literales `estado: '...'`/comparaciones de
  `cuadro.estado` en `main.ts`; el resto — incluyendo `FIRMADO_BLOQUEADO`/`LOCKED`, que
  representan "firmado pero no enviado a GT" ya que `ESTADOS_ENVIABLES` en `main.ts:3733`
  exige un paso separado de envío — cuenta como no-terminal).

Se elige (b). El caso real observado en producción (revisión B en `BORRADOR` 11 días,
requisición sin cuadro 9 días) ya se detecta correctamente con `fecha_creacion` /
`fecha_solicitud` — no hace falta distinguir "creado hace mucho pero con actividad reciente"
del caso real que se está resolviendo. Agregar `updated_at` es una migración con impacto en
12 microservicios más ownership/RLS (ver `[[hallazgo-rls-bypass-bocam-admin]]` en memoria) y
no la justifica el problema observado hoy. Si en el futuro aparecen falsos positivos
(cuadros con actividad reciente marcados como atorados), se revisita esta decisión.

### Decisión 3 — Umbral de antigüedad: constante `DIAS_ALERTA_PROCESO_ATORADO = 5`
Los 3 casos reales en producción llevan 9-14 días atorados; un umbral de 5 días calendario
los habría detectado con margen sin generar ruido para flujos normales (aprobar → cotizar
suele tomar 1-3 días según los datos de `actividad_reciente` observados). Mismo umbral para
`requisicion_sin_cuadro` y `cuadro_atorado` — no hay evidencia hoy de que deban diferir.
Constante única exportada cerca de `OC_STATUS` en `main.ts`, no en variable de entorno (no
hay necesidad operativa de cambiarla sin redeploy todavía).

### Decisión 4 — Resolución de `alertaOcError` dentro de `reconciliar-finanzas`
Al llegar al branch `oc.estado === OC_STATUS.ERROR_FINANZAS` y tener éxito la llamada a
Finanzas, se agrega `prisma.alertaOcError.updateMany({ where: { tenant_id, oc_id: id },
data: { resuelta: true } })` antes de responder. Se usa `updateMany` (no `update`) porque
puede no existir fila de alerta si la OC se marcó `ERROR_FINANZAS` por otra vía sin haber
pasado por el flujo que crea la alerta — no debe fallar si no hay fila que actualizar.

### Decisión 5 — Shape de las alertas nuevas
Consistente con el objeto existente de `cotizacion_vencida` (`tipo`, id de referencia,
`dias_vencida`):
```json
{ "tipo": "oc_error_finanzas", "oc_id": string, "oc_codigo": string, "error_message": string, "dias_vencida": number }
{ "tipo": "requisicion_sin_cuadro", "req_id": string, "folio": string, "dias_vencida": number }
{ "tipo": "cuadro_atorado", "cuadro_id": string, "folio": string, "estado": string, "dias_vencida": number }
```
Roles que ven `alertas[]`: los mismos que ya acceden al dashboard
(`superintendent`, `procurement`, `admin`, `resident`) — no se restringe por tipo de alerta
dentro de la misma respuesta para no fragmentar el endpoint; el frontend decide qué botones
de acción mostrar según el rol del usuario actual (el botón "Reintentar" de
`oc_error_finanzas` ya está protegido en el backend por `requireRoles('admin',
'superintendent', 'procurement')` en `reconciliar-finanzas`, así que un `resident` que vea la
alerta simplemente no tendrá el botón habilitado).

## Risks / Trade-offs

- **[Riesgo] Falso positivo si `fecha_creacion` no refleja actividad reciente** (ej. un
  cuadro con comentarios/revisiones recientes pero mismo `fecha_creacion` original) →
  Mitigación: aceptado como trade-off consciente (Decisión 2); el caso real que motiva este
  fix no lo sufre. Si aparece, se resuelve agregando `updated_at` en un change posterior.
- **[Riesgo] `updateMany` en `reconciliar-finanzas` no encuentra fila si `alertaOcError` usa
  `oc_id` de otro tenant por error de contexto** → Mitigación: el `where` incluye
  `tenant_id` explícito (mismo patrón ya usado en el resto del archivo), no depende solo de
  RLS.
- **[Riesgo] Costo de las 2 queries nuevas en el dashboard (requisiciones sin cuadro, cuadros
  atorados) si el volumen crece** → Mitigación: hoy son 4 requisiciones y 4 cuadros en
  producción; ambas queries usan los índices existentes (`tenant_id`, `proyecto_id`,
  `estado`). Revisitar solo si el volumen real lo justifica.

## Migration Plan

- Sin migración de base de datos.
- Deploy estándar del servicio `compras` (rebuild + restart, sin downtime — no cambia el
  contrato de ningún endpoint existente, solo agrega campos a `alertas[]`).
- Deploy del `app-shell` (frontend) para la nueva sección de alertas.
- Rollback: revertir el commit y redeploy: no hay cambios de datos que revertir (no hay
  migración).

## Open Questions

(ninguna — alcance y umbral quedaron definidos en las Decisiones 3 y 5 con base en los datos
reales observados)

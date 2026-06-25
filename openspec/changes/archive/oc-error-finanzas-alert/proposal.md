## Why

Cuando la saga distribuida de Compras falla en su segunda fase (comprometer fondos en Finanzas), la Orden de Compra queda en estado `ERROR_FINANZAS` de forma silenciosa: nadie recibe aviso, el presupuesto queda en un limbo indeterminado y la inconsistencia puede acumularse sin que el equipo de procuración lo sepa. Con volúmenes reales de operación, esto representa un riesgo de integridad financiera directo.

## What Changes

- Nuevo evento `compras.oc_error_finanzas` publicado al bus RabbitMQ cada vez que una OC transiciona al estado `ERROR_FINANZAS`.
- Nuevo handler en el módulo de Compras que escucha ese evento y lo registra en una tabla de alertas persistente.
- Endpoint `GET /api/v1/compras/alertas/oc-error` que expone las OCs en estado inconsistente para que el frontend pueda mostrarlas.
- Tests de integración que simulan el fallo de Finanzas y verifican que la alerta se genera y persiste correctamente.

## Capabilities

### New Capabilities

- `oc-error-alert`: Detección, publicación y persistencia de alertas cuando una OC entra en `ERROR_FINANZAS`. Incluye el endpoint de consulta y los tests de cobertura obligatorios.

### Modified Capabilities

_(ninguna — la saga existente no se modifica, solo se añade la capa de observabilidad)_

## Impact

- **Módulo afectado:** `apps/compras`
- **Nuevos archivos:** tabla `AlertaOcError` en `schema.prisma`, handler de evento, endpoint REST, tests de integración
- **Eventos:** nuevo tipo `compras.oc_error_finanzas` en RabbitMQ
- **Sin breaking changes:** no se modifica ningún endpoint existente ni la lógica de la saga
- **Dependencias:** `@bocam/event-bus`, `@bocam/observability` (ya presentes en el módulo)

# Hito 15 - Prueba de Integracion Real RabbitMQ para Correlation ID

Fecha: 2026-03-18

## Objetivo

Validar con un broker RabbitMQ real que el `correlation_id` no solo viaja por el EventBus, sino que llega intacto al consumer y queda visible en el log del handler.

## Cambios implementados

### 1. Prueba de integracion real

Se agrego:

- `packages/event-bus/test/integration/rabbitmq.integration.test.ts`

La prueba:

- conecta un publisher real al exchange `bocam.events`
- conecta un consumer real con una cola temporal unica
- publica un evento con `context.correlation_id`
- espera recepcion real via RabbitMQ
- valida que el consumer reciba el mismo `correlation_id`
- valida que el handler escriba un log con ese mismo valor

### 2. Scripts del paquete y raiz

Se agregaron:

- `packages/event-bus/package.json`
  - `test:integration:rabbitmq`
- `package.json`
  - `test:integration:event-bus`

### 3. tsconfig del paquete event-bus

Se agrego:

- `packages/event-bus/tsconfig.json`

Para soportar typecheck y ejecucion tipada de la prueba de integracion.

### 4. Pipeline CI actualizado

Se actualizo:

- `.github/workflows/backend-e2e.yml`

Ahora el workflow:

- levanta PostgreSQL
- levanta RabbitMQ
- expone `RABBITMQ_URL`
- corre `npm run test:integration:event-bus`
- y despues ejecuta la suite E2E critica existente

## Validacion ejecutada

Typecheck:

- `npx tsc --noEmit -p packages/event-bus/tsconfig.json`

Conectividad RabbitMQ:

- `Test-NetConnection 127.0.0.1 -Port 5672`

Prueba real:

- `npm run test:integration:event-bus`

## Resultado observado

La prueba paso correctamente y confirmo los tres puntos clave:

1. El publisher publico el evento con `correlation_id`.
2. El EventBus consumidor recibio el mismo `correlation_id`.
3. El handler emitio un log explicito con el mismo `correlation_id`.

Evidencia funcional observada en runtime:

- log de publish con correlation
- log de receive con correlation
- log del handler:
  - `{"action":"handler.received","event_type":"...","correlation_id":"..."}`

## Estado despues del hito

La trazabilidad del sistema ya cubre ambos canales:

- HTTP sincronico
- RabbitMQ asincrono

Con esto, una saga distribuida ya puede seguirse sin perder correlacion al cambiar de request a evento.

## Siguiente paso recomendado

Agregar pruebas de integracion o E2E donde un modulo real publique y otro modulo real consuma, por ejemplo:

1. `Compras -> Finanzas` con `compras.oc_creada`
2. `Control de Obra -> Finanzas` con `control_obra.estimacion_aprobada`

Eso cerraria la validacion no solo del bus compartido, sino del contrato inter-modulo completo.

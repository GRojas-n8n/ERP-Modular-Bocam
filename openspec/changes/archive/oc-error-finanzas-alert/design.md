## Context

El módulo `apps/compras` implementa una saga distribuida de dos fases para emitir Órdenes de Compra: (1) verificar suficiencia presupuestal en Finanzas vía HTTP síncrono, (2) comprometer los fondos. Si la fase 2 falla (timeout, Finanzas caído, saldo insuficiente en race condition), la OC queda en `estado = ERROR_FINANZAS` en la BD de Compras, pero **no existe ningún mecanismo que notifique este hecho**. El estado inconsistente puede persistir días hasta que alguien lo note revisando manualmente la pantalla de reconciliación.

El sistema ya dispone de `@bocam/event-bus` (RabbitMQ), `@bocam/observability` (logging estructurado) y el patrón de `logTerminalState` para registrar transiciones de estado. La solución debe aprovechar esta infraestructura existente sin modificar la lógica de la saga.

## Goals / Non-Goals

**Goals:**
- Publicar evento `compras.oc_error_finanzas` cada vez que una OC transiciona a `ERROR_FINANZAS`
- Persistir la alerta en una tabla `AlertaOcError` con timestamp, `oc_id`, `tenant_id`, `proyecto_id` y mensaje de error
- Exponer endpoint `GET /api/v1/compras/alertas/oc-error` protegido con roles `admin`, `superintendent`, `procurement`
- Garantizar cobertura de test que valide el disparo de la alerta bajo condición de error simulada

**Non-Goals:**
- No se modifica la saga distribuida ni su mecanismo de recuperación
- No se implementa resolución automática del estado `ERROR_FINANZAS`
- No se construye un sistema de notificaciones push/email en este cambio
- No se crean alertas para otros estados de error (CANCELACION_PENDIENTE se gestiona por otro mecanismo)

## Decisions

### D1: Dónde publicar el evento — en el handler de request vs. en el handler de evento entrante

**Decisión:** Publicar `compras.oc_error_finanzas` directamente en el route handler `POST /comparativas/:id/convertir-oc`, inmediatamente después de que la OC se actualiza a `ERROR_FINANZAS` (línea ~270 del main.ts actual), y también dentro de `handlePresupuestoInsuficienteEvent` cuando aplica.

**Alternativa descartada:** Publicarlo solo desde `handlePresupuestoInsuficienteEvent`. El problema: ese handler solo cubre el caso de evento asíncrono entrante de Finanzas. El caso síncrono (la llamada HTTP a `/comprometer-fondos` falla) no lo cubre.

**Rationale:** Hay dos caminos que llevan a `ERROR_FINANZAS`: el path síncrono (HTTP falla) y el path asíncrono (evento `finanzas.presupuesto_insuficiente`). Ambos deben disparar la alerta.

### D2: Persistencia de alertas — tabla nueva vs. tabla de log existente

**Decisión:** Nueva tabla `AlertaOcError` en el schema de Compras.

**Alternativa descartada:** Usar solo el log de observability (`logError`). Los logs son efímeros y no son consultables por el frontend sin parsing.

**Rationale:** La tabla permite al endpoint de alertas servir datos estructurados y filtrados por `tenant_id`/`proyecto_id` respetando el aislamiento multi-tenant y el RLS existente.

### D3: Idempotencia de la alerta

**Decisión:** La tabla `AlertaOcError` tiene `@@unique([tenant_id, oc_id])` para que reintentos de la misma OC no generen alertas duplicadas — se usa `upsert`.

**Rationale:** El patrón `applyTerminalMutationInContext` ya cubre idempotencia en handlers de eventos; la misma lógica aplicada a la tabla de alertas.

## Risks / Trade-offs

- **[Riesgo] EventBus caído al publicar la alerta** → La tabla `AlertaOcError` se persiste en la misma transacción que actualiza la OC a `ERROR_FINANZAS` (antes de publicar el evento). Si el bus está caído, la alerta ya está en BD y es consultable por el endpoint. El evento se pierde pero el dato no.
- **[Trade-off] Doble persistencia** → La alerta se guarda en BD Y se publica al bus. Esto es intencional: la BD garantiza que el dato no se pierde si el bus falla; el evento permite que futuros módulos (ej. notificaciones push) reaccionen sin modificar Compras.
- **[Riesgo] La OC en `ERROR_FINANZAS` puede reconciliarse antes de que alguien vea la alerta** → El endpoint de alertas devuelve todas las alertas históricas; agregar campo `resuelta` en la tabla para que el endpoint de `/reconciliar-finanzas` la marque como resuelta queda como mejora futura.

## Migration Plan

1. Agregar modelo `AlertaOcError` al `schema.prisma` de Compras
2. Ejecutar `prisma migrate dev --name add-alerta-oc-error` en dev
3. Desplegar en VPS con `prisma migrate deploy` (sin downtime, solo additive)
4. No se requiere rollback especial: la tabla nueva no rompe código existente si se revierte antes de la migración

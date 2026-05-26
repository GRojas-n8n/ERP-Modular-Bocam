## 1. Schema y Migración de Base de Datos

- [x] 1.1 Agregar modelo `AlertaOcError` en `apps/compras/prisma/schema.prisma` con campos: `id` (UUID PK), `tenant_id` (UUID), `proyecto_id` (UUID), `oc_id` (UUID), `oc_codigo` (String), `presupuesto_id` (String nullable), `error_message` (Text), `resuelta` (Boolean, default false), `created_at` (DateTime), `updated_at` (DateTime)
- [x] 1.2 Agregar `@@unique([tenant_id, oc_id])` e `@@index([tenant_id, proyecto_id])` al modelo `AlertaOcError`
- [x] 1.3 `prisma generate` OK — cliente tipado regenerado. `prisma migrate dev` pendiente: requiere DB activa → ejecutar con `docker compose up` antes del siguiente bloque

## 2. Lógica de Publicación del Evento (Path Síncrono)

- [x] 2.1 En `apps/compras/src/main.ts`, dentro del bloque `catch` del `POST /comparativas/:id/convertir-oc` (donde la OC se actualiza a `ERROR_FINANZAS`), agregar el upsert en `AlertaOcError` **antes** del `return res.status()` usando `createTenantContext`
- [x] 2.2 En el mismo bloque, agregar `eventBus.publish({ event_type: 'compras.oc_error_finanzas', ... })` con el payload `{ oc_id, oc_codigo, presupuesto_id, error_message }` envuelto en `try/catch` silencioso con `logWarn` en caso de fallo del bus
- [x] 2.3 Usar `buildEventContext(req)` para el campo `context` del evento

## 3. Lógica de Publicación del Evento (Path Asíncrono)

- [x] 3.1 En `handlePresupuestoInsuficienteEvent` (dentro de `apps/compras/src/main.ts`), al final del bloque `apply` donde se actualiza la OC a `ERROR_FINANZAS`, agregar el upsert en `AlertaOcError` usando el contexto del evento (`event.context.tenant_id`, `event.context.proyecto_id`)
- [x] 3.2 Publicar `compras.oc_error_finanzas` con el mismo payload estándar, envuelto en `try/catch` con `logWarn`

## 4. Endpoint de Consulta de Alertas

- [x] 4.1 Agregar el endpoint `GET /api/v1/compras/alertas/oc-error` con `requireRoles('admin', 'superintendent', 'procurement')` en `apps/compras/src/main.ts`
- [x] 4.2 El endpoint debe usar `createTenantContext` y consultar `prisma.alertaOcError.findMany({ where: { resuelta: false }, orderBy: { created_at: 'desc' } })`
- [x] 4.3 Devolver respuesta estándar `{ success: true, data }` con logging via `logInfo`

## 5. Tests de Integración

- [x] 5.1 Crear archivo `apps/compras/test/integration/oc-error-alert.integration.test.ts` (ajustado a la convención del proyecto; se añadió script `test:integration:oc-error-alert` en `package.json`)
- [x] 5.2 Escribir test **"Alerta generada en fallo síncrono"**: stub Finanzas devuelve 500 para `/comprometer-fondos`, se llama al endpoint de conversión y se verifica que `AlertaOcError` contiene un registro con `resuelta=false` y los campos correctos. **Pass.**
- [x] 5.3 Escribir test **"Evento proxy por BD"**: el EventBus falla silenciosamente (RABBITMQ_URL inválido) pero la alerta en BD actúa como contrato verificable del evento — se verifica `oc_id` y `oc_codigo` correctos. **Pass.**
- [x] 5.4 Escribir test **"Idempotencia de la alerta"**: `handlePresupuestoInsuficienteEvent` ejecutado dos veces con el mismo `oc_id` → exactamente 1 registro en `AlertaOcError`. **Pass.**
- [x] 5.5 Escribir test **"Aislamiento multi-tenant del endpoint"**: alertas de `proyectoA` y `proyectoB` en BD; JWT de `proyectoA` solo devuelve alertas de `proyectoA`. También verifica 403 para rol `resident`. **Pass.** — Nota: se añadió `tenant_id` y `proyecto_id` al `where` del `findMany` en el endpoint (defensa en profundidad, complementa RLS)
- [x] 5.6 Todos los tests verificados con `npm run test:integration:oc-error-alert` en `apps/compras`. Resultado: **5/5 ok.**

## 6. Registro en Log de Observabilidad

- [x] 6.1 Path síncrono: `logInfo(req, 'compras', 'compras.oc_error_finanzas.alerta_creada', ...)` confirmado en la salida de los tests (campo `action` visible en JSON estructurado). Path asíncrono: `console.log(JSON.stringify({action: 'compras.oc_error_finanzas.alerta_creada', path: 'async', ...}))` (no tiene `req`, se usa `console.log` como sustituto de `logInfo` para el path de eventos).
- [x] 6.2 Fallo del EventBus en path síncrono usa `logWarn` (confirmado en código, línea del catch de `busError`). Path asíncrono usa `console.warn(JSON.stringify(...))`. El test muestra `⚠️ Canal no disponible. Evento compras.oc_error_finanzas NO publicado.` sin lanzar excepción.

## 7. Migración en Producción (VPS)

- [ ] 7.1 En el servidor VPS, ejecutar `docker compose exec compras npx prisma migrate deploy` para aplicar la migración `add-alerta-oc-error`
- [ ] 7.2 Verificar que el endpoint `GET /api/v1/compras/alertas/oc-error` responde correctamente vía `curl` o el frontend
- [ ] 7.3 Hacer una OC de prueba con Finanzas caído y confirmar que aparece en el endpoint de alertas

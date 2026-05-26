## ADDED Requirements

### Requirement: El sistema SHALL publicar un evento cuando una OC entra en ERROR_FINANZAS

Cada vez que el estado de una `OrdenCompra` transicione a `ERROR_FINANZAS` — ya sea por fallo síncrono en la llamada HTTP a Finanzas o por recepción del evento asíncrono `finanzas.presupuesto_insuficiente` — el módulo de Compras DEBE publicar un evento `compras.oc_error_finanzas` al bus de eventos con el payload mínimo requerido.

#### Scenario: Fallo síncrono — Finanzas no confirma el compromiso
- **WHEN** el endpoint `POST /comparativas/:id/convertir-oc` actualiza la OC a `ERROR_FINANZAS` porque la llamada a `/comprometer-fondos` devuelve error
- **THEN** el sistema publica el evento `compras.oc_error_finanzas` con `{ oc_id, oc_codigo, presupuesto_id, error_message, tenant_id, proyecto_id }`

#### Scenario: Fallo asíncrono — evento finanzas.presupuesto_insuficiente recibido
- **WHEN** el handler `handlePresupuestoInsuficienteEvent` actualiza la OC a `ERROR_FINANZAS`
- **THEN** el sistema publica el evento `compras.oc_error_finanzas` con el mismo payload estándar

#### Scenario: EventBus no disponible al momento de publicar
- **WHEN** el bus de RabbitMQ está caído al intentar publicar `compras.oc_error_finanzas`
- **THEN** la actualización de estado de la OC NO se revierte y la alerta persiste en BD
- **THEN** el fallo del bus se registra con `logWarn` y no eleva una excepción que rompa el flujo principal

---

### Requirement: El sistema SHALL persistir una alerta en BD cuando una OC entra en ERROR_FINANZAS

El módulo de Compras DEBE crear o actualizar un registro en la tabla `AlertaOcError` de forma idempotente (upsert por `[tenant_id, oc_id]`) cada vez que una OC transiciona a `ERROR_FINANZAS`.

#### Scenario: Primera vez que la OC entra en ERROR_FINANZAS
- **WHEN** la OC `oc_id` transiciona a `ERROR_FINANZAS` por primera vez
- **THEN** se crea un registro `AlertaOcError` con `tenant_id`, `proyecto_id`, `oc_id`, `oc_codigo`, `error_message`, `created_at = now()`, `resuelta = false`

#### Scenario: Reintento — la misma OC ya tiene alerta registrada
- **WHEN** la OC `oc_id` vuelve a entrar en `ERROR_FINANZAS` (ej. por reintento del handler de evento)
- **THEN** el sistema actualiza el registro existente en lugar de crear un duplicado
- **THEN** el `error_message` se actualiza con la información del último fallo

---

### Requirement: El sistema SHALL exponer un endpoint para consultar alertas de OCs en ERROR_FINANZAS

El módulo de Compras DEBE proveer el endpoint `GET /api/v1/compras/alertas/oc-error` que devuelva todas las alertas activas (`resuelta = false`) del `proyecto_id` y `tenant_id` extraídos del JWT.

#### Scenario: Consulta exitosa con alertas pendientes
- **WHEN** un usuario con rol `admin`, `superintendent` o `procurement` llama `GET /api/v1/compras/alertas/oc-error`
- **THEN** el sistema devuelve `{ success: true, data: AlertaOcError[] }` con las alertas no resueltas del proyecto actual, ordenadas por `created_at` descendente

#### Scenario: Sin alertas pendientes
- **WHEN** no hay OCs en `ERROR_FINANZAS` para el proyecto actual
- **THEN** el sistema devuelve `{ success: true, data: [] }`

#### Scenario: Acceso sin rol autorizado
- **WHEN** un usuario con rol `resident` llama al endpoint
- **THEN** el sistema devuelve `403 Forbidden`

---

### Requirement: El módulo de Compras DEBE tener tests que verifiquen el disparo de alertas

Dado que el módulo de Compras tiene deuda de tests, esta funcionalidad DEBE incluir tests de integración que simulen el fallo de Finanzas y verifiquen que la alerta se genera y persiste.

#### Scenario: Test — Alerta generada en fallo síncrono
- **WHEN** el test simula que la llamada HTTP a Finanzas devuelve error 500 (mock de axios)
- **THEN** el test verifica que la tabla `AlertaOcError` contiene un registro para la OC procesada
- **THEN** el test verifica que el `event_type` del evento publicado es `compras.oc_error_finanzas`

#### Scenario: Test — Idempotencia de la alerta
- **WHEN** el test llama al handler de error dos veces con el mismo `oc_id`
- **THEN** el test verifica que solo existe UN registro en `AlertaOcError` para esa OC (no duplicados)

#### Scenario: Test — Endpoint devuelve alertas del proyecto correcto
- **WHEN** el test llama `GET /api/v1/compras/alertas/oc-error` con JWT de `proyecto_A`
- **THEN** el test verifica que la respuesta NO contiene alertas de `proyecto_B` (aislamiento multi-tenant)

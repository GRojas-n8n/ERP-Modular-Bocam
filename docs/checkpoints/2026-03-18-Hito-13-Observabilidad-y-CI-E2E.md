# Hito 13 - Observabilidad Estructurada y Pipeline E2E Critico

Fecha: 2026-03-18

## Objetivo

Endurecer la observabilidad del SaaS multi-tenant y multi-proyecto con trazabilidad uniforme por request, y formalizar un pipeline CI para las E2E criticas que validan seguridad, sagas e idempotencia.

## Cambios implementados

### 1. Paquete compartido de observabilidad

Se creo `@bocam/observability` en:

- `packages/observability/src/index.ts`
- `packages/observability/package.json`
- `packages/observability/tsconfig.json`

Capacidades incorporadas:

- Middleware HTTP para generar o propagar `x-correlation-id`
- Header de respuesta `x-correlation-id`
- Logging estructurado JSON
- Contexto de trazabilidad por request con:
  - `tenant_id`
  - `proyecto_id`
  - `user_id`
  - `correlation_id`
  - `module`
  - `method`
  - `path`
- Helpers para:
  - `logInfo`
  - `logWarn`
  - `logError`
  - `buildForwardHeaders`

### 2. Propagacion de correlation_id entre modulos

Se conecto el middleware de observabilidad en:

- `apps/compras/src/main.ts`
- `apps/finanzas/src/main.ts`
- `apps/control-obra/src/main.ts`

Los llamados HTTP entre modulos ahora propagan el mismo `x-correlation-id` hacia Finanzas, especialmente en los flujos de saga:

- `Compras -> Finanzas`
  - `GET /suficiencia`
  - `POST /comprometer-fondos`
  - `POST /liberar-fondos`
- `Control de Obra -> Finanzas`
  - `POST /pagos`

Esto permite seguir un mismo flujo distribuido extremo a extremo sin depender de memoria compartida ni de joins entre modulos.

### 3. Logs estructurados en operaciones criticas

#### Finanzas

Se instrumentaron logs estructurados para:

- `finanzas.comprometer_fondos.idempotent`
- `finanzas.comprometer_fondos.insufficient_budget`
- `finanzas.comprometer_fondos.error`
- `finanzas.liberar_fondos.created`
- `finanzas.liberar_fondos.idempotent`
- `finanzas.liberar_fondos.error`
- `finanzas.pagos.created`
- `finanzas.pagos.idempotent`
- `finanzas.pagos.error`
- `http.request.completed`

Punto importante:

- ya queda explicitamente distinguido cuando una operacion fue `idempotent: true`
- en pagos, la respuesta ya incluye `idempotente`

#### Compras

Se agregaron logs estructurados para:

- `compras.orden_compra.emitida`
- `compras.orden_compra.cancelada`
- `compras.orden_compra.cancelacion_pendiente`
- `compras.orden_compra.emitir.error`
- `compras.orden_compra.cancelar.error`
- `http.request.completed`

#### Control de Obra

Se agregaron logs estructurados para:

- `control_obra.estimacion.finanzas_pending`
- `control_obra.estimacion.aprobada_financiera`
- `control_obra.estimacion.aprobar.error`
- `http.request.completed`

### 4. Meta de trazabilidad en respuestas clave

Se extendio `createApiResponse` y `createApiError` en:

- `apps/finanzas/src/types.ts`
- `apps/control-obra/src/types.ts`

Ahora aceptan `correlation_id` en `meta`, para que frontend y soporte puedan correlacionar respuesta HTTP con logs de backend.

### 5. Pipeline CI para E2E criticas

Se creo:

- `.github/workflows/backend-e2e.yml`

El workflow:

- levanta PostgreSQL 16 como servicio
- instala dependencias con `npm ci`
- genera clientes Prisma de `compras`, `finanzas` y `control-obra`
- ejecuta `prisma db push` para los tres modulos
- corre `tsc --noEmit` sobre modulos criticos
- ejecuta la suite consolidada `npm run test:e2e:criticas`

Tambien se agrego en raiz:

- `package.json` -> `test:e2e:criticas`

## Validacion ejecutada

Typecheck:

- `npx tsc --noEmit -p packages/observability/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`

Runtime / E2E:

- `npm run test:e2e:criticas`
- `npm run test:e2e:reconciliacion -w @bocam/compras`

Resultado:

- Todo paso correctamente
- Los logs ya muestran `tenant_id`, `proyecto_id` y `correlation_id`
- Las operaciones idempotentes en Finanzas quedan marcadas explicitamente
- El flujo de saga entre Compras / Control de Obra y Finanzas conserva trazabilidad de request

## Estado despues del hito

El sistema sube de una instrumentacion manual y dispersa a una base de observabilidad operativa reutilizable para backend SaaS.

Queda ya cubierto:

- trazabilidad por tenant y proyecto
- correlacion HTTP distribuida
- distincion explicita de idempotencia
- automatizacion CI de las E2E backend mas sensibles

## Siguiente paso recomendado

Completar observabilidad de segundo nivel:

1. Propagar `correlation_id` tambien por eventos del EventBus.
2. Estandarizar logs estructurados en `auth`, `seguridad`, `personal` y `gerencia-tecnica`.
3. Agregar assertions E2E sobre `x-correlation-id` y `meta.correlation_id`.
4. Publicar artefactos o resumen de pruebas en CI para auditoria operativa.

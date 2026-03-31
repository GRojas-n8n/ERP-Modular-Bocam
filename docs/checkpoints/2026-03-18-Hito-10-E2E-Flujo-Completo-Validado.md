# Hito 10: E2E de flujo completo validadas

Fecha: 2026-03-18

## Objetivo

Cerrar la validacion runtime del flujo completo multi-modulo sobre PostgreSQL activo para:

- `Compras`
- `Control de Obra`

## Resultado

La validacion quedo completa y pasando.

Comando raiz ejecutado:

```bash
npm run test:e2e:reconciliacion
```

## Cobertura validada

### Compras

Archivo:

- `apps/compras/test/e2e/reconciliacion.e2e.test.ts`

Escenarios que pasaron:

- `comparativa -> OC emitida`
- `OC emitida -> cancelada`
- `ERROR_FINANZAS -> EMITIDA`
- `CANCELACION_PENDIENTE -> CANCELADA`

Validaciones comprobadas:

- consulta de suficiencia presupuestal por HTTP
- compromiso de fondos por HTTP
- liberacion de fondos por HTTP
- cierre de comparativa ganadora
- persistencia correcta de estados en OC

### Control de Obra

Archivo:

- `apps/control-obra/test/e2e/reconciliacion.e2e.test.ts`

Escenarios que pasaron:

- `avances validados -> estimacion BORRADOR -> APROBADA_FINANCIERA`
- listado de estimaciones pendientes de reconciliacion
- `ERROR_FINANZAS -> APROBADA_FINANCIERA`

Validaciones comprobadas:

- creacion de estimacion desde avances validados
- vinculacion de avances a la estimacion
- programacion de pago por HTTP contra Finanzas
- persistencia de estados en estimaciones

## Infraestructura utilizada

- PostgreSQL local expuesto en `localhost:5432`
- contenedor `postgres` levantado desde `docker compose`
- stubs HTTP de Finanzas para mantener soberania de datos entre modulos

## Notas de arquitectura

- Se mantuvo el aislamiento SaaS por `tenant_id` y `proyecto_id`
- No se introdujeron joins cruzados entre modulos
- Las pruebas siguen el patron correcto: BD propia del modulo + frontera HTTP hacia Finanzas
- Los warnings del EventBus son esperados mientras RabbitMQ no este conectado en estas suites

## Estado resultante

Este frente ya subio de madurez:

- la reconciliacion ya no solo existe en codigo, tambien esta probada
- el flujo feliz primario de `Compras` y `Control de Obra` ya tiene cobertura E2E ejecutable
- el monorepo ya puede validar desde raiz los escenarios criticos de compra y estimacion

## Siguiente paso recomendado

El siguiente hito natural es endurecer la capa de autorizacion y operacion:

1. E2E negativas de RBAC y limites de aprobacion
2. pruebas de idempotencia repetida sobre endpoints financieros
3. observabilidad por `tenant_id` y `proyecto_id`
4. automatizar estas E2E en CI

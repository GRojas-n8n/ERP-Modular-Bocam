# Hito 47 - Shared logging terminal en Control de Obra y rutas operativas de Contabilidad

Fecha: 2026-03-19

## Objetivo

Extender `logTerminalState(...)` a:

- `Control de Obra`
- rutas operativas de `Contabilidad` que todavia armaban manualmente el mismo envelope terminal

para consolidar mejor la tercera capa compartida sin mezclar semantica de dominio.

## Cambios aplicados

### 1. Control de Obra

Se actualizo:

- `apps/control-obra/src/main.ts`

en:

- `handlePagoRegistradoEvent(...)`

Ahora los tres estados terminales:

- `estimacion_not_found`
- `idempotent`
- `applied`

usan `logTerminalState(...)` desde:

- `packages/tenant-idempotency/src/index.ts`

manteniendo como extras de dominio:

- `referencia_id`
- `id_pago`

### 2. Contabilidad

Se actualizo:

- `apps/contabilidad/src/main.ts`

en estas operaciones internas repetitivas:

- `persistAsientoFromEvent(...)`
- `ensureFiscalReconciliationPlaceholder(...)`
- `ensureBankReconciliationPlaceholder(...)`

Con esto, tambien esas rutas operativas dejan de construir manualmente:

- `event_type`
- `correlation_id`
- `tenant_id`
- `proyecto_id`

y delegan ese envelope comun al helper compartido.

## Resultado tecnico

El helper compartido `logTerminalState(...)` ya quedo validado en tres modulos:

- `Compras`
- `Control de Obra`
- `Contabilidad`

y en dos tipos de uso distintos:

1. consumers asincronos terminales
2. operaciones internas idempotentes/repetitivas

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npx tsc --noEmit -p apps/contabilidad/tsconfig.json`
- `npm run test:integration:finanzas-pago-feedback -w @bocam/control-obra`
- `npm run test:integration:finanzas-compromiso-conciliacion -w @bocam/contabilidad`
- `npm run test:integration:finanzas-liberacion-conciliacion -w @bocam/contabilidad`

Resultado:

- paquete compartido: OK
- `Control de Obra`: OK
- `Contabilidad`: OK
- `finanzas.pago_registrado -> control-obra`: OK
- `finanzas.fondos_comprometidos -> contabilidad`: OK
- `finanzas.fondos_liberados -> contabilidad`: OK

## Resultado arquitectonico

Con este hito, la tercera capa compartida deja de ser experimental y pasa a ser una pieza reutilizada transversalmente.

Todavia sigue siendo una capa delgada:

- comparte envelope
- comparte estado terminal
- comparte severidad

pero no centraliza:

- nombres de accion de negocio
- payloads de dominio
- reglas funcionales del modulo

Eso preserva soberania modular y evita acoplar `tenant-idempotency` a contabilidad, compras o control de obra.

## Siguiente paso recomendado

El siguiente paso con mas valor es extender `logTerminalState(...)` a:

- eventos de error terminal de `Compras` como `finanzas.presupuesto_insuficiente`
- rutas HTTP operativas de `Contabilidad` que hoy devuelven respuestas idempotentes y loguean en paralelo

y despues evaluar si conviene un helper hermano para respuestas terminales HTTP (`not_found`, `idempotent`, `applied`) sin duplicar tambien esa capa.

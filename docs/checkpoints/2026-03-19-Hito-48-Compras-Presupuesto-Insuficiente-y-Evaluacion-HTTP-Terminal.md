# Hito 48 - Compras presupuesto insuficiente y evaluacion de helper HTTP terminal

Fecha: 2026-03-19

## Objetivo

1. Extender `logTerminalState(...)` a `finanzas.presupuesto_insuficiente` en `Compras`.
2. Evaluar si ya conviene extraer un helper hermano para respuestas terminales HTTP, no solo para flujos asincronos.

## Cambio aplicado

Se actualizo:

- `apps/compras/src/main.ts`

en:

- `handlePresupuestoInsuficienteEvent(...)`

Ahora los tres estados terminales de ese flujo:

- `oc_not_found`
- `idempotent`
- `applied`

usan el helper compartido:

- `packages/tenant-idempotency/src/index.ts`
- `logTerminalState(...)`

manteniendo los extras de dominio propios de `Compras`:

- `referencia_oc_id`
- `oc_codigo`

## Resultado tecnico

Con este ajuste, `Compras` ya usa el helper de logging terminal en todo su feedback loop financiero con `Finanzas`:

- `finanzas.fondos_comprometidos`
- `finanzas.fondos_liberados`
- `finanzas.presupuesto_insuficiente`

Eso deja mas uniforme la trazabilidad del modulo y reduce repeticion real en consumers asincronos terminales.

## Validacion ejecutada

Se validaron:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p packages/tenant-idempotency/tsconfig.json`
- `npm run test:integration:finanzas-feedback -w @bocam/compras`

Resultado:

- `Compras`: OK
- paquete compartido: OK
- ciclo `Compras -> Finanzas -> Compras`: OK

## Evaluacion del helper hermano para respuestas HTTP terminales

### Conclusion

Si conviene, pero todavia debe nacer como una capa mas delgada que la asincrona.

### Por que ya vale la pena

En `Contabilidad` ya se repite un patron claro en varias rutas HTTP:

- mutacion idempotente
- log estructurado
- respuesta `createApiResponse(...)`
- bandera `idempotente`
- manejo paralelo de `not_found`, `unprocessable` o `accepted`

La repeticion no es identica a la asincrona, pero ya es suficiente para una pequeña abstraccion.

### Lo que si conviene compartir

Un helper hermano podria estandarizar solo:

- el estado terminal HTTP
- la forma de devolver `createApiResponse(...)`
- la bandera `idempotente`
- el envelope comun de log asociado
- la distincion entre `200`, `202`, `404` y `422`

### Lo que no conviene compartir todavia

No conviene subir aun:

- catalogos completos de errores por modulo
- mensajes de negocio
- conversion de excepciones de dominio a codigos HTTP

Eso sigue siendo responsabilidad del modulo dueno.

### Recomendacion concreta

El siguiente paso natural es un helper pequeno, por ejemplo:

- `respondTerminalMutation(...)`

que reciba:

- `res`
- `correlationId`
- `tenantId`
- `proyectoId`
- `terminalState`
- `data`
- `actions`
- `extras`

y delegue a cada ruta solo su semantica de dominio.

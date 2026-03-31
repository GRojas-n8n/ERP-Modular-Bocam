# Hito 18 - Consumers adicionales en Finanzas y contratos negativos

Fecha: 2026-03-18
Estado: Completado y validado

## Objetivo

Endurecer consumidores reales adicionales en `Finanzas` para eventos que todavia eran solo informativos y agregar pruebas negativas de contrato para payloads invalidos o incompletos.

## Decision arquitectonica

Se mantuvo la separacion estricta entre modulos:

1. `Control de Obra` sigue siendo dueno del evento `control_obra.avance_fisico_validado`.
2. `Finanzas` no consulta la BD de `Control de Obra`.
3. Para automatizar un efecto financiero real, el evento debe incluir `presupuesto_id` desde el modulo emisor.
4. El efecto elegido para un avance validado no es un pago definitivo ni un movimiento presupuestal irreversible, sino una proyeccion financiera preliminar en `programa_pagos`, consistente con el flujo de caja y sin sobrepasar el proceso de estimacion.

## Cambios realizados

### 1. Contrato enriquecido en Control de Obra

Archivo:

- `apps/control-obra/src/main.ts`

Cambio:

- El evento `control_obra.avance_fisico_validado` ahora puede publicar:
  - `avance_id`
  - `concepto`
  - `porcentaje`
  - `importe`
  - `presupuesto_id`

Nota:

- `presupuesto_id` se toma del body de la accion de validacion.
- Esto mantiene la soberania de datos: `Finanzas` recibe el UUID de su propia entidad y ya no necesita derivarlo externamente.

### 2. Nuevo consumer real en Finanzas

Archivo:

- `apps/finanzas/src/main.ts`

Nuevo handler:

- `handleAvanceFisicoValidadoEvent(event)`

Comportamiento:

- Valida contrato minimo del evento.
- Rechaza payloads incompletos sin generar efectos.
- Ejecuta dentro de `createTenantContext(...)`.
- Verifica que el `presupuesto_id` exista en el tenant/proyecto correcto.
- Crea una entrada provisional en `programa_pagos` con:
  - `referencia_modulo = control-obra`
  - `referencia_entidad = AvanceFisicoValidado`
  - `estado = PENDIENTE`
- Resuelve idempotencia por `avance_id`.
- Registra logs estructurados:
  - `finanzas.event.avance_fisico_validado.invalid_payload`
  - `finanzas.event.avance_fisico_validado.created`
  - `finanzas.event.avance_fisico_validado.idempotent`

Adicionalmente:

- `Finanzas` ahora se suscribe explicitamente a `control_obra.avance_fisico_validado`.
- `control_obra.avance_fisico_registrado` permanece como señal informativa operativa.

### 3. Prueba de integracion real del nuevo consumer

Archivo:

- `apps/finanzas/test/integration/control-obra.avance-validado.integration.test.ts`

Cobertura:

1. Publicacion real por RabbitMQ de `control_obra.avance_fisico_validado`.
2. Consumo real en `Finanzas`.
3. Creacion de una sola proyeccion preliminar en `programa_pagos`.
4. Reenvio del mismo evento sin duplicacion.
5. Verificacion de logs `created` e `idempotent` con el mismo `correlation_id`.

### 4. Pruebas negativas de contrato

Archivo:

- `apps/finanzas/test/integration/event-contracts.integration.test.ts`

Se validaron payloads invalidos o incompletos para:

- `compras.oc_creada`
- `compras.oc_cancelada`
- `control_obra.estimacion_aprobada`
- `control_obra.avance_fisico_validado`

Resultado esperado y confirmado:

- No se crean movimientos presupuestales.
- No se crean entradas en `programa_pagos`.
- Se emite el log `invalid_payload` correspondiente.

### 5. Scripts y pipeline

Archivos:

- `apps/finanzas/package.json`
- `package.json`
- `.github/workflows/backend-e2e.yml`

Cambios:

- Nuevo script:
  - `test:integration:control-obra-avance`
- Nuevo script:
  - `test:integration:event-contracts`
- El runner raiz `test:integration:intermodulo` ahora incluye:
  - `control-obra.estimacion_aprobada`
  - `control_obra.avance_fisico_validado`
  - `compras.oc_creada / compras.oc_cancelada`
- El workflow CI ahora ejecuta tambien la suite de contratos invalidos.

## Validaciones ejecutadas

Typecheck:

- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Integracion RabbitMQ:

- `npm run test:integration:intermodulo`

Contratos negativos:

- `npm run test:integration:event-contracts`

Resultado:

- Todo paso correctamente.

## Estado resultante

`Finanzas` quedo mas maduro en dos dimensiones:

1. Automatizacion asincrona:
   ya no solo reacciona con pagos por estimaciones y movimientos por OCs; ahora tambien genera una proyeccion preliminar de flujo cuando `Control de Obra` valida avances con contrato completo.

2. Blindaje de contratos:
   los handlers criticos ya tienen pruebas que confirman que un payload roto no genera efectos financieros colaterales.

## Siguiente paso recomendado

El siguiente endurecimiento de mayor valor es cerrar el ciclo de eventos salientes de `Finanzas`:

- publicar realmente `finanzas.fondos_comprometidos`
- publicar realmente `finanzas.fondos_liberados`
- publicar realmente `finanzas.presupuesto_insuficiente`

y montar pruebas de integracion consumidoras en los modulos aguas abajo para validar el contrato completo de ida y vuelta.

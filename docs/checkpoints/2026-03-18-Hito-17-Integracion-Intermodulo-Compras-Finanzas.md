# Hito 17 - Integracion Intermodulo Compras -> Finanzas

Fecha: 2026-03-18
Estado: Completado y validado con RabbitMQ real

## Objetivo

Cerrar la automatizacion event-driven entre `Compras` y `Finanzas` para que los eventos:

- `compras.oc_creada`
- `compras.oc_cancelada`

produzcan efectos financieros reales, idempotentes y trazables por `tenant_id`, `proyecto_id` y `correlation_id`.

## Decision arquitectonica

Se replica el mismo patron ya aprobado en `Control de Obra -> Finanzas`:

1. `Compras` publica eventos enriquecidos con el contexto minimo necesario.
2. `Finanzas` consume el evento y ejecuta la mutacion dentro de su propia BD.
3. No hay joins cruzados ni acceso directo a datos de `Compras`.
4. La idempotencia se resuelve en `Finanzas` con base en `referencia_modulo + referencia_entidad + referencia_id + tipo`.

## Cambios realizados

### 1. Contrato de eventos de Compras enriquecido

Archivo:

- `apps/compras/src/main.ts`

Cambios:

- `compras.oc_creada` ahora publica `presupuesto_id` junto con `oc_id`, `codigo`, `total` y `proveedor_id`.
- `compras.oc_cancelada` ahora publica `presupuesto_id` junto con `oc_id`, `codigo` y `total`.

Impacto:

- `Finanzas` puede comprometer o liberar fondos sin consultar datos internos de `Compras`.
- Se preserva soberania de datos por modulo.

### 2. Consumers reales en Finanzas

Archivo:

- `apps/finanzas/src/main.ts`

Se implementaron y conectaron:

- `handleOrdenCompraCreadaEvent(event)`
- `handleOrdenCompraCanceladaEvent(event)`

Comportamiento:

- Validan payload minimo requerido.
- Ejecutan en contexto aislado con `createTenantContext(...)`.
- Verifican presupuesto objetivo dentro del tenant/proyecto.
- Registran movimiento presupuestal real:
  - `COMPROMISO` para `compras.oc_creada`
  - `LIBERACION` para `compras.oc_cancelada`
- Actualizan saldos del presupuesto correspondiente.
- Detectan reenvios del mismo evento y responden de forma idempotente.
- Registran logs estructurados con `correlation_id`.

Ademas, las suscripciones del EventBus dejaron de ser placeholders y ahora invocan handlers reales:

- `compras.oc_creada -> handleOrdenCompraCreadaEvent`
- `compras.oc_cancelada -> handleOrdenCompraCanceladaEvent`

### 3. Prueba de integracion real RabbitMQ

Archivo:

- `apps/finanzas/test/integration/compras.events.integration.test.ts`

Cobertura validada:

1. Publicacion real de `compras.oc_creada`.
2. Consumo real en `Finanzas`.
3. Creacion de un solo movimiento `COMPROMISO`.
4. Actualizacion real del presupuesto:
   - `monto_comprometido` incrementa
   - `monto_disponible` decrementa
5. Reenvio del mismo evento sin duplicacion.
6. Publicacion real de `compras.oc_cancelada`.
7. Creacion de un solo movimiento `LIBERACION`.
8. Restauracion del presupuesto:
   - `monto_comprometido` regresa a `0`
   - `monto_disponible` vuelve al monto original
9. Reenvio del mismo evento sin duplicacion.
10. Presencia de `correlation_id` en logs `created` e `idempotent`.

### 4. Scripts y pipeline

Archivos:

- `apps/finanzas/package.json`
- `package.json`

Cambios:

- Nuevo script:
  - `test:integration:compras-events`
- El script raiz `test:integration:intermodulo` ahora ejecuta:
  - `control-obra -> finanzas`
  - `compras -> finanzas`

Impacto:

- El pipeline ya valida ambos contratos inter-modulo reales sobre RabbitMQ.

## Validaciones ejecutadas

Typecheck:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Integracion real:

- `npm run test:integration:intermodulo`

Resultado:

- Todo paso correctamente.

## Estado resultante

Con este hito, `Finanzas` ya no depende solo de llamadas HTTP sincronas para congelar o liberar presupuesto ante OCs. Ahora existe tambien una via event-driven real, validada e idempotente, alineada con la arquitectura SaaS modular multi-tenant/multi-proyecto.

Esto mejora:

- resiliencia ante desacoplamiento de modulos
- trazabilidad distribuida con `correlation_id`
- operacion asincrona segura
- consistencia presupuestal sin joins cruzados

## Siguiente paso recomendado

Extender este mismo nivel de endurecimiento a consumidores reales adicionales en `Finanzas`, especialmente:

- `control_obra.avance_fisico_registrado`
- automatizaciones derivadas de cierre financiero o devengo
- pruebas negativas de contratos de eventos invalidos o incompletos

## ADDED Requirements

### Requirement: Como máximo un COMPROMISO por OC
Finanzas SHALL registrar como máximo un movimiento `COMPROMISO` por OC, sin importar cuántos caminos (HTTP, `gerencia_tecnica.partida_comprometida`, `compras.oc_creada`) lo intenten ni si lo hacen a la vez. La garantía SHALL imponerla la base de datos; NO SHALL depender únicamente de una lectura seguida de una inserción.

#### Scenario: Dos caminos concurrentes
- **WHEN** el evento `partida_comprometida` y el evento `oc_creada` de la misma OC se procesan al mismo tiempo
- **THEN** existe un solo `COMPROMISO` y `monto_comprometido` aumenta una sola vez

#### Scenario: Evento duplicado
- **WHEN** el mismo evento llega dos veces
- **THEN** el segundo no crea movimientos ni altera el presupuesto

### Requirement: Como máximo una LIBERACION por OC
Finanzas SHALL registrar como máximo un movimiento `LIBERACION` por OC, con la misma garantía de base de datos.

#### Scenario: Dos cancelaciones concurrentes
- **WHEN** la liberación por HTTP y el evento `oc_cancelada` de la misma OC concurren
- **THEN** existe una sola `LIBERACION` y `monto_disponible` aumenta una sola vez

### Requirement: Una liberación NO SHALL usar el compromiso de otra OC
Una liberación SHALL exigir un `COMPROMISO` de la misma OC. NO SHALL basarse en el saldo agregado del presupuesto.

#### Scenario: Liberación sin compromiso
- **WHEN** llega una cancelación de una OC sin `COMPROMISO` y el presupuesto tiene compromisos de otras OC
- **THEN** no se libera nada y se registra la cancelación para ignorar una creación tardía

#### Scenario: Respuesta HTTP de liberar-fondos sin compromiso
- **WHEN** `POST liberar-fondos` recibe una OC sin `COMPROMISO`
- **THEN** responde `201` con `monto_liberado: 0`, `idempotente: true`, `no_op: true`, `motivo: SIN_COMPROMISO` y `tombstone_registrado: true`, no publica `fondos_liberados` y registra un log estructurado sin montos

### Requirement: Creación y cancelación fuera de orden SHALL tener comportamiento definido
Si la cancelación de una OC se procesa antes que su creación, la creación tardía SHALL ser un no-op y NO SHALL dejar un compromiso sobre una OC cancelada.

#### Scenario: Cancelación antes de creación
- **WHEN** `oc_cancelada` se procesa antes que `oc_creada` de la misma OC
- **THEN** al procesar `oc_creada` no se crea ningún compromiso

#### Scenario: Creación después de cancelación
- **WHEN** `oc_creada` llega cuando la OC ya fue cancelada y liberada
- **THEN** no se crea ningún compromiso

### Requirement: Una OC cancelada NO SHALL volver a EMITIDA
Un evento `finanzas.fondos_comprometidos` tardío SHALL cambiar el estado de una OC a `EMITIDA` únicamente desde `PENDIENTE_CONFIRMACION_FINANZAS` o `ERROR_FINANZAS`, mediante una actualización condicional atómica. En particular, NO SHALL regresar `CANCELADA`, `CANCELACION_PENDIENTE`, `PARCIALMENTE_RECIBIDA` ni `RECIBIDA` a `EMITIDA`. Al aplicarse desde `ERROR_FINANZAS`, la alerta de error de la OC SHALL quedar resuelta en la misma transacción.

#### Scenario: Fondos comprometidos tardíos
- **WHEN** llega `fondos_comprometidos` de una OC ya `CANCELADA`
- **THEN** el estado permanece `CANCELADA`

### Requirement: Una OC emitida NO SHALL regresar a ERROR_FINANZAS por un evento tardío
Un evento `finanzas.presupuesto_insuficiente` NO SHALL cambiar el estado de una OC que no esté en `PENDIENTE_CONFIRMACION_FINANZAS`, ni crear la alerta de error ni publicar `compras.oc_error_finanzas` cuando la transición no se aplicó.

#### Scenario: Presupuesto insuficiente tardío
- **WHEN** llega `presupuesto_insuficiente` de una OC ya `EMITIDA`
- **THEN** el estado permanece `EMITIDA`

#### Scenario: Eventos concurrentes sobre la misma OC
- **WHEN** `fondos_comprometidos` y `presupuesto_insuficiente` de la misma OC se procesan a la vez
- **THEN** el estado final es `EMITIDA` sin alerta activa o `ERROR_FINANZAS` con alerta activa, nunca una combinación divergente

#### Scenario: Cancelación concurrente con un evento tardío
- **WHEN** una cancelación y un evento tardío de Finanzas concurren sobre la misma OC
- **THEN** la OC queda `CANCELADA`

#### Scenario: Evento duplicado
- **WHEN** el mismo evento llega dos veces
- **THEN** el segundo es un no-op idempotente

### Requirement: Un evento idempotente NO SHALL republicar información falsa
Si el compromiso o la liberación ya existían, el handler NO SHALL publicar un evento con valores inventados (p. ej. `monto_disponible_restante: 0`). SHALL no publicar, o publicar con el valor real del presupuesto.

#### Scenario: Compromiso ya existente
- **WHEN** `oc_creada` encuentra un compromiso ya registrado por otro camino
- **THEN** cualquier evento que publique contiene el `monto_disponible_restante` real o no se publica ninguno

### Requirement: La migración SHALL auditar duplicados antes de crear la restricción
La migración que crea la restricción única SHALL contar duplicados por la clave lógica antes de crearla y abortar sin modificar datos si los hay. SHALL poder revertirse sin pérdida de datos de negocio.

#### Scenario: Datos duplicados preexistentes
- **WHEN** la migración se ejecuta sobre una base con duplicados de `COMPROMISO` o `LIBERACION`
- **THEN** aborta con un mensaje que indica cuántos grupos duplicados hay y no modifica ninguna fila

#### Scenario: Sin duplicados
- **WHEN** no hay duplicados
- **THEN** crea la restricción y su reversión restituye el esquema anterior

### Requirement: Un movimiento de OC SHALL tener una referencia válida
Ningún `COMPROMISO` ni `LIBERACION` de una OC SHALL registrarse sin `referencia_id`, y ningún camino SHALL intentar el INSERT con un identificador de OC que no sea un UUID válido. La base de datos SHALL imponerlo con una restricción CHECK para que un valor NULL no evada el índice único.

#### Scenario: OC sin referencia válida
- **WHEN** un endpoint o evento recibe un `oc_id` que no es un UUID válido
- **THEN** el endpoint responde `400` y el handler registra `invalid_payload`, sin insertar nada ni dejar tombstone

#### Scenario: Movimiento de OC con referencia_id NULL
- **WHEN** se intenta insertar un `COMPROMISO` o `LIBERACION` de `compras`/`OrdenCompra` con `referencia_id` NULL
- **THEN** la base de datos lo rechaza

### Requirement: La migración SHALL ser atómica
La migración SHALL ejecutarse dentro de una transacción explícita, con la comprobación de datos previos antes de cualquier DDL. Cualquier fallo SHALL revertir por completo índice, restricción, tabla, funciones y políticas.

#### Scenario: Fallo posterior al precheck
- **WHEN** un paso de la migración posterior al precheck falla
- **THEN** no queda ningún objeto de la migración en el esquema

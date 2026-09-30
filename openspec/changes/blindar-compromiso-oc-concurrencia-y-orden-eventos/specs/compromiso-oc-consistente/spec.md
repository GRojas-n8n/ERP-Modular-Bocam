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

### Requirement: Creación y cancelación fuera de orden SHALL tener comportamiento definido
Si la cancelación de una OC se procesa antes que su creación, la creación tardía SHALL ser un no-op y NO SHALL dejar un compromiso sobre una OC cancelada.

#### Scenario: Cancelación antes de creación
- **WHEN** `oc_cancelada` se procesa antes que `oc_creada` de la misma OC
- **THEN** al procesar `oc_creada` no se crea ningún compromiso

#### Scenario: Creación después de cancelación
- **WHEN** `oc_creada` llega cuando la OC ya fue cancelada y liberada
- **THEN** no se crea ningún compromiso

### Requirement: Una OC cancelada NO SHALL volver a EMITIDA
Un evento `finanzas.fondos_comprometidos` tardío NO SHALL cambiar el estado de una OC que no esté en `PENDIENTE_CONFIRMACION_FINANZAS`. En particular, NO SHALL regresar `CANCELADA`, `CANCELACION_PENDIENTE`, `PARCIALMENTE_RECIBIDA` ni `RECIBIDA` a `EMITIDA`.

#### Scenario: Fondos comprometidos tardíos
- **WHEN** llega `fondos_comprometidos` de una OC ya `CANCELADA`
- **THEN** el estado permanece `CANCELADA`

### Requirement: Una OC emitida NO SHALL regresar a ERROR_FINANZAS por un evento tardío
Un evento `finanzas.presupuesto_insuficiente` NO SHALL cambiar el estado de una OC que no esté en `PENDIENTE_CONFIRMACION_FINANZAS`.

#### Scenario: Presupuesto insuficiente tardío
- **WHEN** llega `presupuesto_insuficiente` de una OC ya `EMITIDA`
- **THEN** el estado permanece `EMITIDA`

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

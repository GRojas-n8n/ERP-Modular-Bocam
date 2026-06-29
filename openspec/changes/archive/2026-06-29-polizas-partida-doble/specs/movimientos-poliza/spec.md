## ADDED Requirements

### Requirement: Generación automática de MovimientoPoliza desde eventos de dominio

El sistema SHALL crear líneas de `MovimientoPoliza` (cargo/abono) automáticamente al persistir un `AsientoContable` cuya `fecha_poliza >= 2026-06-29`, usando el mapper hardcoded por `tipo_poliza`. Los movimientos se crean en la misma transacción que el asiento.

#### Scenario: Póliza de egreso genera 2 movimientos
- **WHEN** llega evento `finanzas.pago_registrado` con `fecha_pago_real >= 2026-06-29`
- **THEN** se crean 2 `MovimientoPoliza`:
  - cargo en cuenta `2100` (Cuentas por Pagar Proveedores) por `monto_pagado`
  - abono en cuenta `1100` (Bancos) por `monto_pagado`
- **THEN** `sum(cargo) === sum(abono)` (cuadre contable)

#### Scenario: Pasivo proyectado por OC genera 2 movimientos
- **WHEN** llega evento `compras.oc_creada` con fecha >= cutoff
- **THEN** cargo en `5110` (Materiales en Proceso), abono en `2100` (Cuentas por Pagar)

#### Scenario: Reversión de OC cancelada genera 2 movimientos
- **WHEN** llega evento `compras.oc_cancelada` con fecha >= cutoff
- **THEN** cargo en `2100` (Cuentas por Pagar), abono en `5110` (Materiales en Proceso)

#### Scenario: Transferencia interna genera 2 movimientos
- **WHEN** llega evento `finanzas.transferencia_presupuestal` con fecha >= cutoff
- **THEN** cargo en `6100` (Gastos Administración — cuenta origen), abono en `6100` (cuenta destino)

#### Scenario: Estimación aprobada genera 2 movimientos (NUEVO evento)
- **WHEN** llega evento `control_obra.estimacion_aprobada` con fecha >= cutoff
- **THEN** cargo en `1200` (Cuentas por Cobrar), abono en `4100` (Ingresos por Contratos de Obra)

#### Scenario: Avance físico validado genera 2 movimientos (NUEVO evento)
- **WHEN** llega evento `control_obra.avance_fisico_validado` con fecha >= cutoff
- **THEN** cargo en `5100` (Costo Directo de Obra), abono en `2100` (Cuentas por Pagar)

#### Scenario: Asiento anterior al cutoff no genera movimientos
- **WHEN** el `AsientoContable` tiene `fecha_poliza < 2026-06-29`
- **THEN** NO se crean `MovimientoPoliza` (partida simple)

### Requirement: Validación de cuadre contable

El sistema SHALL validar que `sum(cargo) === sum(abono)` en el conjunto de movimientos de una póliza antes de persistirlos. Si no cuadran, el asiento se registra sin movimientos y se emite log de error.

#### Scenario: Cuadre exitoso
- **WHEN** el mapper genera movimientos con `sum(cargo) = sum(abono)`
- **THEN** todos los movimientos se persisten junto con el asiento

#### Scenario: Descuadre detectado
- **WHEN** el mapper genera movimientos donde `sum(cargo) ≠ sum(abono)`
- **THEN** NO se persisten movimientos, se loggea `error` con `action: contabilidad.mapper.descuadre_detectado` y el asiento queda en partida simple

### Requirement: Endpoint GET movimientos por asiento

El sistema SHALL exponer `GET /api/v1/contabilidad/asientos/:id/movimientos` para obtener las líneas cargo/abono de un asiento.

#### Scenario: Asiento con movimientos
- **WHEN** usuario autorizado solicita movimientos de un asiento post-cutoff
- **THEN** retorna array `[{ id_movimiento, cuenta: { clave, nombre }, cargo, abono, descripcion, orden }]`

#### Scenario: Asiento sin movimientos (pre-cutoff)
- **WHEN** usuario solicita movimientos de un asiento anterior al cutoff
- **THEN** retorna array vacío `[]` con status 200

### Requirement: Idempotencia en creación de movimientos

El sistema SHALL garantizar que los movimientos de una póliza se crean una sola vez, aunque el mismo evento se procese múltiples veces.

#### Scenario: Evento duplicado no duplica movimientos
- **WHEN** el mismo evento de dominio se procesa dos veces (reintento RabbitMQ)
- **THEN** la segunda ejecución detecta que el `AsientoContable` ya existe (por `external_event_key`) y NO crea movimientos adicionales

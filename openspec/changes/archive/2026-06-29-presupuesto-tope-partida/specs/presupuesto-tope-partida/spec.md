## ADDED Requirements

### Requirement: SaldoPartida creado al aprobar presupuesto
Cuando GT aprueba un presupuesto (`PATCH /presupuestos/:id/aprobar`), el sistema SHALL crear automáticamente un `SaldoPartida` por cada `Concepto` del presupuesto con `monto_aprobado = concepto.precio_unitario × concepto.cantidad` y `estado_tope = 'LIBRE'`.

#### Scenario: Presupuesto aprobado con 15 conceptos crea 15 SaldoPartida
- **WHEN** se aprueba un presupuesto con 15 conceptos
- **THEN** el sistema crea 15 registros en `SaldoPartida`
- **THEN** la suma de todos los `monto_aprobado` iguala `Presupuesto.monto_total`

#### Scenario: Re-aprobación es idempotente
- **WHEN** se intenta aprobar un presupuesto que ya está `APROBADO`
- **THEN** el sistema retorna 409 y no duplica `SaldoPartida`

### Requirement: Endpoint GET /partidas/:concepto_id/saldo retorna saldo completo
El sistema SHALL exponer este endpoint disponible para roles `admin`, `superintendent`, `gerencia_tecnica`, `control_proyectos`.

#### Scenario: Retorna los 5 campos monetarios y el estado_tope
- **WHEN** se llama `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/saldo`
- **THEN** retorna `{ monto_aprobado, monto_en_proceso, monto_comprometido, monto_ejercido, monto_disponible, pct_disponible, estado_tope, bloqueo_automatico }`

#### Scenario: Partida sin SaldoPartida (proyecto sin presupuesto aprobado)
- **WHEN** el concepto existe pero no tiene `SaldoPartida`
- **THEN** retorna 404 con `{ error: 'SALDO_NO_INICIALIZADO' }`

### Requirement: Endpoint POST /partidas/:concepto_id/comprometer actualiza saldo
Llamado internamente por Compras y Personal. Actualiza `monto_comprometido`, recalcula `monto_disponible` y `estado_tope`. Idempotente por `referencia_id`.

#### Scenario: Compromiso registrado exitosamente
- **WHEN** Compras llama `POST /partidas/:id/comprometer` con `{ monto: 50000, referencia_id: "uuid-oc", tipo: "OC" }`
- **THEN** `monto_comprometido += 50000`
- **THEN** `monto_disponible` se recalcula
- **THEN** `estado_tope` se actualiza según umbrales

#### Scenario: Idempotencia por referencia_id
- **WHEN** el mismo `referencia_id` se envía dos veces
- **THEN** el segundo call es ignorado (noop) y retorna 200

### Requirement: Estado BLOQUEADO cuando monto_disponible <= 0
El sistema SHALL actualizar `estado_tope` automáticamente según los umbrales tras cada cambio de saldo.

#### Scenario: Saldo agotado → BLOQUEADO
- **WHEN** `monto_disponible <= 0` tras actualización
- **THEN** `estado_tope = 'BLOQUEADO'`
- **THEN** se publica evento `gerencia_tecnica.partida_bloqueada`

#### Scenario: Disponible < 20% → LIMITADO
- **WHEN** `monto_disponible / monto_aprobado < 0.20`
- **THEN** `estado_tope = 'LIMITADO'`

#### Scenario: Disponible > 20% → LIBRE
- **WHEN** `monto_disponible / monto_aprobado >= 0.20`
- **THEN** `estado_tope = 'LIBRE'`

### Requirement: Director puede anular bloqueo con justificación
El sistema SHALL permitir a roles `admin` y `director` desactivar el bloqueo automático de una partida.

#### Scenario: Anulación de bloqueo registrada en audit log
- **WHEN** `PATCH /partidas/:id/anular-bloqueo` con `{ justificacion: "Autorización dirección ..." }`
- **THEN** `bloqueo_automatico = false`
- **THEN** queda registrado en audit log con `user_id`, `justificacion`, `timestamp`

#### Scenario: Bloqueo se reestablece al ejecutar reconciliación
- **WHEN** job de reconciliación recalcula saldo y `monto_disponible` sigue <= 0 con `bloqueo_automatico = false`
- **THEN** el estado permanece desbloqueado (solo el director puede re-activar el bloqueo)

### Requirement: Endpoint GET /partidas/resumen lista estado de todas las partidas del proyecto
El sistema SHALL exponer un endpoint resumen sin detalle de movimientos, para uso del dashboard de CP.

#### Scenario: Lista todas las partidas con semáforo
- **WHEN** `GET /api/v1/gerencia-tecnica/partidas/resumen?proyecto_id=uuid`
- **THEN** retorna array con `{ concepto_clave, estado_tope, monto_aprobado, monto_disponible, pct_ejecutado }` por partida

### Requirement: Evento gerencia_tecnica.partida_bloqueada publicado al agotar partida
El sistema SHALL publicar este evento en el exchange `bocam.events` cada vez que una partida transita a BLOQUEADO.

#### Scenario: Evento publicado al comprometer fondos que agotan la partida
- **WHEN** un `POST /comprometer` hace que `monto_disponible <= 0`
- **THEN** se publica `{ event_type: 'gerencia_tecnica.partida_bloqueada', payload: { concepto_id, concepto_clave, monto_aprobado, monto_disponible, trigger, referencia_id, referencia_codigo } }`

#### Scenario: Evento no se duplica si ya estaba BLOQUEADO
- **WHEN** la partida ya tiene `estado_tope = 'BLOQUEADO'` y llega otro comprometer
- **THEN** el evento NO se vuelve a publicar (idempotente)

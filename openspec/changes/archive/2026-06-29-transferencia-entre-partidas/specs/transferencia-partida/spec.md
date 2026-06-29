## ADDED Requirements

### Requirement: POST /transferencias-partida crea solicitud en estado PENDIENTE
El endpoint `POST /api/v1/gerencia-tecnica/transferencias-partida` SHALL crear una `TransferenciaPartida` con `estado = 'PENDIENTE'` cuando los datos son válidos. Roles permitidos: `gerencia_tecnica`, `control_proyectos`, `admin`.

#### Scenario: Transferencia interna creada exitosamente
- **WHEN** se envía POST con `tipo=INTERNA`, `concepto_origen_id`, `concepto_destino_id`, `monto > 0` y `justificacion.length >= 50`
- **THEN** el sistema crea `TransferenciaPartida` con `estado='PENDIENTE'` y retorna 201

#### Scenario: Origen con saldo insuficiente
- **WHEN** `SaldoPartida[concepto_origen].monto_disponible < monto`
- **THEN** retorna 422 con mensaje `"La partida origen solo tiene $X disponibles para transferir"`

#### Scenario: Justificación corta
- **WHEN** `justificacion.length < 50`
- **THEN** retorna 422 con mensaje `"La justificación debe tener al menos 50 caracteres"`

#### Scenario: Origen y destino iguales
- **WHEN** `concepto_origen_id === concepto_destino_id`
- **THEN** retorna 422 con mensaje `"Origen y destino no pueden ser la misma partida"`

### Requirement: PATCH /transferencias-partida/:id/aprobar ajusta saldos atómicamente
El endpoint SHALL, en una transacción única: cambiar estado a `APROBADA`, decrementar `SaldoPartida[origen].monto_aprobado` y incrementar `SaldoPartida[destino].monto_aprobado`. Rol: `admin`, `director`.

#### Scenario: Aprobación exitosa
- **WHEN** director aprueba una transferencia `PENDIENTE` con saldo origen aún suficiente
- **THEN** `TransferenciaPartida.estado = 'APROBADA'`, `SaldoPartida[origen].monto_aprobado -= monto`, `SaldoPartida[destino].monto_aprobado += monto`
- **THEN** se publica evento `gerencia_tecnica.transferencia_partida_aprobada`
- **THEN** retorna 200 con la transferencia actualizada

#### Scenario: Saldo origen insuficiente al momento de aprobar
- **WHEN** entre la creación y la aprobación el origen comprometió más saldo y `monto_disponible < monto`
- **THEN** retorna 422 y el estado permanece `PENDIENTE`

#### Scenario: Transferencia ya aprobada (idempotencia)
- **WHEN** se intenta aprobar una transferencia ya `APROBADA`
- **THEN** retorna 409 `"La transferencia ya fue procesada"`

### Requirement: PATCH /transferencias-partida/:id/rechazar registra motivo
El endpoint SHALL cambiar estado a `RECHAZADA` y guardar `motivo_rechazo`. Publica evento `gerencia_tecnica.transferencia_partida_rechazada`. Rol: `admin`, `director`.

#### Scenario: Rechazo con motivo
- **WHEN** director rechaza con `{ "motivo_rechazo": "texto" }`
- **THEN** `estado = 'RECHAZADA'`, `motivo_rechazo` guardado, evento publicado, retorna 200

#### Scenario: Rechazo sin motivo
- **WHEN** se llama PATCH rechazar sin `motivo_rechazo`
- **THEN** retorna 422 `"El motivo de rechazo es obligatorio"`

### Requirement: GET /transferencias-partida lista transferencias del proyecto activo
El endpoint SHALL retornar todas las transferencias del `proyecto_id` del JWT, ordenadas por `created_at` desc. Soporta filtro `?estado=PENDIENTE|APROBADA|RECHAZADA`.

#### Scenario: Lista con transferencias pendientes
- **WHEN** GET /transferencias-partida?estado=PENDIENTE
- **THEN** retorna array con solo las transferencias en estado PENDIENTE del proyecto

#### Scenario: Lista vacía
- **WHEN** no hay transferencias en el proyecto
- **THEN** retorna 200 con array vacío `[]`

### Requirement: GET /partidas/:concepto_id/transferencias historial de una partida
El endpoint SHALL retornar todas las transferencias donde la partida fue origen o destino, con campo `direccion: 'ENVIADA' | 'RECIBIDA'`.

#### Scenario: Partida con transferencias en ambas direcciones
- **WHEN** una partida fue origen de una transferencia y destino de otra
- **THEN** el historial incluye ambas con los valores correctos de `direccion`

#### Scenario: Partida sin transferencias
- **WHEN** la partida nunca participó en una transferencia
- **THEN** retorna 200 con array vacío

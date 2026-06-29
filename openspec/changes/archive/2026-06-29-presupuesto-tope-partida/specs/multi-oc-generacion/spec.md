## ADDED Requirements

### Requirement: Verificación de SaldoPartida antes de crear cada OC del lote
Antes de crear las OCs, el endpoint `POST /comparativas/:id/convertir-oc` SHALL verificar para cada OC a crear si la partida correspondiente (`concepto_id` de la req origen) tiene saldo suficiente en GT.

La verificación se hace vía `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/saldo`. Si GT no responde en 2 segundos, la OC se crea de igual forma (fail-open) con un warning en log.

#### Scenario: Partida BLOQUEADA — OC del lote no se crea
- **WHEN** la partida del ítem tiene `estado_tope = 'BLOQUEADO'` (y `bloqueo_automatico = true`)
- **THEN** esa OC del lote NO se crea
- **THEN** la respuesta incluye `{ oc_bloqueadas: [{ concepto_clave, monto_requerido, monto_disponible }] }`
- **THEN** las OCs de otras partidas con saldo sí se crean normalmente

#### Scenario: Partida LIMITADA — OC se crea con advertencia
- **WHEN** la partida tiene `estado_tope = 'LIMITADO'` (disponible < 20%)
- **THEN** la OC se crea y el item incluye `warning: "Partida al X% de ejecución. Disponible: $Y"`

#### Scenario: GT no responde en 2s — fail-open
- **WHEN** la llamada B2B a GT excede 2 segundos de timeout
- **THEN** la OC se crea normalmente
- **THEN** se registra en log: `[WARN] GT timeout en verificación partida ${concepto_id} — OC creada en modo degradado`

#### Scenario: Partida BLOQUEADA con bloqueo_automatico = false (director anuló)
- **WHEN** `estado_tope = 'BLOQUEADO'` pero `bloqueo_automatico = false`
- **THEN** la OC se crea con flag `requiere_aprobacion_director = true`
- **THEN** el flujo de aprobación de la OC requiere firma de `director`

### Requirement: Llamada POST /comprometer tras crear OC exitosa
Tras crear cada OC exitosamente, Compras SHALL llamar `POST /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer` con `{ monto, referencia_id: oc.id, tipo: "OC" }` para actualizar el saldo de la partida.

#### Scenario: Comprometer exitoso actualiza saldo en GT
- **WHEN** OC creada y `POST /comprometer` ejecutado correctamente
- **THEN** `SaldoPartida.monto_comprometido` aumenta en el monto de la OC
- **THEN** `SaldoPartida.monto_disponible` disminuye en el mismo monto

#### Scenario: Comprometer falla — OC ya existe, saldo puede quedar desactualizado
- **WHEN** el `POST /comprometer` falla (timeout o error de GT)
- **THEN** la OC queda EMITIDA de todos modos
- **THEN** el saldo de GT queda desactualizado hasta la reconciliación diaria
- **THEN** se registra en log: `[ERROR] Falla al comprometer saldo partida ${concepto_id} para OC ${oc.id}`

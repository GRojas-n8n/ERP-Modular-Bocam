# Spec: cobertura-saldo-partida-limitado

## Propósito

Garantiza que la suite de regresión de `presupuesto-tope-partida`
(`apps/gerencia-tecnica/test/integration/saldo-partida.integration.test.ts`)
ejerza de verdad el estado `LIMITADO` del tope por partida, no solo
`LIBRE`/`BLOQUEADO`. Sin esto, un cambio futuro que rompa el umbral de
`LIMITADO` podría pasar desapercibido pese a que la suite siga en verde.

## Requirements

### Requirement: La suite de regresión de tope por partida SHALL ejercer el estado LIMITADO
La suite de tests de integración de `presupuesto-tope-partida`
(`apps/gerencia-tecnica/test/integration/saldo-partida.integration.test.ts`)
SHALL incluir al menos un escenario donde, tras comprometer fondos de una
partida, el `monto_disponible` resultante quede entre 1% y 20% del
`monto_aprobado` — el rango que produce `estado_tope = 'LIMITADO'` según
`calcularEstadoTope` — y verificar que el sistema efectivamente reporta
`LIMITADO`.

#### Scenario: Compromiso deja la partida en el rango LIMITADO
- **WHEN** se compromete un monto sobre una partida tal que el disponible
  resultante es mayor a 0% y menor o igual a 20% del monto aprobado
- **THEN** `SaldoPartida.estado_tope` es `'LIMITADO'`

#### Scenario: Compromiso deja la partida en el rango LIBRE
- **WHEN** se compromete un monto sobre una partida tal que el disponible
  resultante es mayor al 20% del monto aprobado
- **THEN** `SaldoPartida.estado_tope` es `'LIBRE'`

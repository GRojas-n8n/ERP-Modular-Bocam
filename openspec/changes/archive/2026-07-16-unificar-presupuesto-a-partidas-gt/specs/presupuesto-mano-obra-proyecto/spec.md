## ADDED Requirements

### Requirement: La nómina SHALL comprometer un presupuesto de Mano de Obra a nivel proyecto, no una partida individual
El gasto de nómina (fiscal y complementaria) SHALL comprometerse y
ejercerse contra un `PresupuestoAsignado` de Finanzas con `capitulo =
'MANO_OBRA'` y `concepto_id = null` (bolsa a nivel proyecto), NO contra
el `SaldoPartida` de ninguna partida individual — la nómina es un costo
recurrente que no está ligado a un alcance de obra puntual.

#### Scenario: Autorizar una PreNomina compromete el presupuesto de Mano de Obra del proyecto
- **WHEN** Personal transiciona una `PreNomina` a `AUTORIZADA` (publica
  `personal.nomina_autorizada`, evento ya existente) y existe un
  `PresupuestoAsignado` `ACTIVO` con `capitulo = 'MANO_OBRA'` para ese
  `proyecto_id`
- **THEN** Finanzas crea un `MovimientoPresupuestal` tipo `COMPROMISO`
  por `total_neto`, con `referencia_modulo: 'personal'`,
  `referencia_entidad: 'PreNomina'`, `referencia_id: prenomina_id`
- **THEN** `PresupuestoAsignado.monto_comprometido` aumenta en
  `total_neto`

#### Scenario: Pagar una PreNomina ejerce el compromiso
- **WHEN** Personal transiciona una `PreNomina` a `PAGADA` (publica
  `personal.nomina_pagada`, evento ya existente)
- **THEN** Finanzas crea un `MovimientoPresupuestal` tipo `EJERCIDO` por
  `total_neto` sobre el mismo `PresupuestoAsignado`
- **THEN** `monto_comprometido` disminuye y `monto_ejercido` aumenta en
  `total_neto`

#### Scenario: Sin presupuesto de Mano de Obra activo para el proyecto
- **WHEN** llega `personal.nomina_autorizada` y no existe ningún
  `PresupuestoAsignado` `ACTIVO` con `capitulo = 'MANO_OBRA'` para ese
  `proyecto_id`
- **THEN** la autorización de nómina NO se bloquea ni falla — la nómina
  nunca depende de que exista presupuesto
- **THEN** se registra una alerta/log indicando que falta presupuesto de
  Mano de Obra para ese proyecto, sin crear ningún `MovimientoPresupuestal`

#### Scenario: Evento duplicado
- **WHEN** `personal.nomina_autorizada` o `personal.nomina_pagada`
  llegan dos veces para el mismo `prenomina_id`
- **THEN** el segundo se ignora (idempotencia por
  `referencia_entidad + referencia_id`, sin duplicar el
  `MovimientoPresupuestal`)

## MODIFIED Requirements

### Requirement: GET /api/v1/control-proyectos/evm
El sistema SHALL calcular el Costo Real (AC) de cada partida como la suma de
`ac_comprometido` (monto de órdenes de compra activas asociadas al
`concepto_id`) y `ac_ejercido` (monto de pagos a proveedor ya realizados
sobre esas órdenes de compra), y SHALL calcular el Valor Planeado (PV) de
cada partida interpolando `ProgramacionObra.curva_programada` a la fecha de
corte actual, en vez de derivar AC del mismo valor que EV o PV del mismo
porcentaje de avance físico que EV.

#### Scenario: AC se compone de comprometido y ejercido, no del avance físico
- **WHEN** se recalcula el EVM de una partida con `ac_comprometido = $50,000`
  y `ac_ejercido = $30,000`
- **THEN** `ac = $80,000` para esa partida, independientemente del valor de
  `ev` (avance físico valorizado)

#### Scenario: Una orden de compra nueva incrementa el comprometido de su partida
- **WHEN** se recibe el evento `compras.oc_creada` con `concepto_id` y
  `total`
- **THEN** el sistema incrementa `ac_comprometido` de la
  `ProgramacionObra` con ese `concepto_id` en el monto de la OC
- **AND** registra la relación `oc_id → concepto_id` para poder resolverla
  cuando la OC se cancele o se pague

#### Scenario: Una orden de compra cancelada revierte el comprometido de su partida
- **WHEN** se recibe el evento `compras.oc_cancelada` (payload sin
  `concepto_id`)
- **THEN** el sistema resuelve el `concepto_id` de esa orden mediante el
  registro guardado al procesar su `oc_creada`, y decrementa
  `ac_comprometido` de esa partida en el monto de la OC

#### Scenario: Un pago a proveedor mueve comprometido a ejercido
- **WHEN** se recibe el evento `finanzas.pago_registrado` con
  `referencia_entidad = 'OrdenCompra'`
- **THEN** el sistema resuelve el `concepto_id` de esa orden y decrementa
  `ac_comprometido` e incrementa `ac_ejercido` de esa partida en el monto
  pagado

#### Scenario: Un pago de estimación al cliente no afecta el AC de ninguna partida
- **WHEN** se recibe el evento `finanzas.pago_registrado` con
  `referencia_entidad = 'Estimacion'`
- **THEN** el sistema procesa la reconciliación de la estimación como ya lo
  hacía (comportamiento sin cambios) y no modifica `ac_comprometido` ni
  `ac_ejercido` de ninguna partida

#### Scenario: PV interpolado de la curva programada
- **WHEN** `ProgramacionObra.curva_programada` tiene puntos
  `[{semana: "2026-W20", pct_acumulado: 40}, {semana: "2026-W24", pct_acumulado: 70}]`
  y la fecha de corte cae en la semana `"2026-W22"`
- **THEN** `pv` se calcula con el `pct_acumulado` del último punto con
  semana `<=` la semana de corte (`40%` del `bac` en este ejemplo), no con
  el `pct_avance_real` de la partida

#### Scenario: Partida sin programación cargada no tiene SPI
- **WHEN** `ProgramacionObra.curva_programada` está vacío para una partida
- **THEN** `pv` y `spi` de esa partida son `null` en la respuesta, en vez de
  un valor calculado a partir del avance físico

### Requirement: Snapshot periódico de ProyeccionCierre
El sistema SHALL calcular y persistir un snapshot de `ProyeccionCierre` por
proyecto una vez al día, agregando el AC/EV/PV de todas sus partidas
(`ProgramacionObra`) más el AC de mano de obra a nivel proyecto tomado de
`finanzas.pago_registrado` con `referencia_entidad = 'PreNomina'`, para que
`GET /evm` y `GET /dashboard` dejen de devolver el bloque `global` en
`null`.

#### Scenario: El job nocturno persiste un snapshot nuevo cada día
- **WHEN** corre el job nocturno de recálculo (cada 24 horas)
- **THEN** por cada proyecto con `ProgramacionObra` activa, se crea un
  registro nuevo en `ProyeccionCierre` con `bac`/`pv`/`ev`/`ac` agregados de
  todas sus partidas más la mano de obra pagada del proyecto, y sus métricas
  derivadas (`cpi`, `spi`, `cv`, `sv`, `eac`, `etc`, `vac`)

#### Scenario: Mano de obra no se distribuye por partida
- **WHEN** se recibe el evento `finanzas.pago_registrado` con
  `referencia_entidad = 'PreNomina'`
- **THEN** el monto pagado se suma únicamente al AC global del proyecto (vía
  el próximo snapshot de `ProyeccionCierre`), sin intentar atribuirlo a
  ninguna `ProgramacionObra`/`concepto_id` individual

#### Scenario: Dashboard deja de mostrar el resumen EVM global vacío
- **WHEN** un usuario consulta `GET /api/v1/control-proyectos/dashboard`
  después de que exista al menos un snapshot de `ProyeccionCierre`
- **THEN** `resumen_evm.cpi`, `resumen_evm.spi` y `resumen_evm.vac` devuelven
  valores numéricos, no `null`

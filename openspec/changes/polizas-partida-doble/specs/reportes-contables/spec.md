## ADDED Requirements

### Requirement: Balanza de comprobación por período

El sistema SHALL exponer `GET /api/v1/contabilidad/reportes/balanza-comprobacion?desde=&hasta=` que retorna, para cada `CuentaContable` con movimientos en el período, el total de cargos, total de abonos y saldo (cargo - abono para cuentas deudoras; abono - cargo para cuentas acreedoras).

#### Scenario: Balanza con movimientos en período
- **WHEN** usuario con rol `admin` o `finance` solicita la balanza con `desde=2026-06-29&hasta=2026-07-31`
- **THEN** retorna array `[{ clave, nombre, tipo, naturaleza, total_cargo, total_abono, saldo }]` ordenado por `clave`
- **THEN** únicamente aparecen cuentas con al menos 1 movimiento en el período

#### Scenario: Suma de saldos deudores = suma de saldos acreedores
- **WHEN** la balanza está correctamente generada
- **THEN** `sum(saldo de cuentas DEUDORAS) === sum(saldo de cuentas ACREEDORAS)` (principio de partida doble)

#### Scenario: Período sin movimientos retorna array vacío
- **WHEN** no hay movimientos en el rango de fechas solicitado
- **THEN** retorna `{ data: [], periodo: { desde, hasta }, total_cargos: 0, total_abonos: 0 }`

### Requirement: Estado de resultados por período

El sistema SHALL exponer `GET /api/v1/contabilidad/reportes/estado-resultados?desde=&hasta=` que retorna ingresos (4xxx), costos (5xxx) y gastos (6xxx) agrupados, con utilidad neta calculada.

#### Scenario: Estado de resultados con datos
- **WHEN** usuario autorizado solicita el estado de resultados para un período
- **THEN** retorna `{ ingresos: [{ clave, nombre, total }], costos: [...], gastos: [...], total_ingresos, total_costos, total_gastos, utilidad_neta }`
- **THEN** `utilidad_neta = total_ingresos - total_costos - total_gastos`

#### Scenario: Utilidad neta negativa (pérdida)
- **WHEN** los costos + gastos superan los ingresos
- **THEN** `utilidad_neta` es negativo y el campo adicional `es_perdida: true`

### Requirement: Balance general a una fecha

El sistema SHALL exponer `GET /api/v1/contabilidad/reportes/balance-general?fecha=` que retorna los saldos acumulados de activos (1xxx), pasivos (2xxx) y capital (3xxx) hasta la fecha indicada.

#### Scenario: Balance cuadrado
- **WHEN** usuario autorizado solicita el balance general a una fecha
- **THEN** retorna `{ activos: [...], pasivos: [...], capital: [...], total_activos, total_pasivos_capital }`
- **THEN** `total_activos === total_pasivos_capital` (ecuación contable A = P + C)

#### Scenario: Balance sin datos previos a la fecha
- **WHEN** la fecha solicitada es anterior al cutoff 2026-06-29
- **THEN** retorna todos los saldos en 0 con `aviso: "Sin movimientos de partida doble anteriores a esta fecha"`

### Requirement: Libro diario por período

El sistema SHALL exponer `GET /api/v1/contabilidad/reportes/libro-diario?desde=&hasta=&page=&limit=` que lista los asientos contables con sus movimientos en orden cronológico, con paginación.

#### Scenario: Libro diario paginado
- **WHEN** usuario autorizado solicita el libro diario para un período
- **THEN** retorna `{ data: [{ folio_poliza, fecha_poliza, concepto, movimientos: [{ clave, nombre, cargo, abono }] }], total, page, limit }`
- **THEN** los asientos vienen ordenados por `fecha_poliza ASC`

#### Scenario: Solo asientos con movimientos en el libro diario
- **WHEN** hay asientos pre-cutoff (sin movimientos) dentro del rango de fechas
- **THEN** esos asientos NO aparecen en el libro diario (el libro diario es exclusivo de partida doble)

### Requirement: Dashboard contable

El sistema SHALL exponer `GET /api/v1/contabilidad/dashboard` con KPIs contables del proyecto activo.

#### Scenario: Dashboard con datos
- **WHEN** usuario autorizado solicita el dashboard de contabilidad
- **THEN** retorna `{ kpis: { total_asientos, asientos_cerrados, pendientes_cfdi, pendientes_banco, total_egreso_mes, total_ingreso_mes }, alertas: [...] }`

#### Scenario: Alerta de pólizas descuadradas
- **WHEN** existen asientos post-cutoff sin movimientos por error de mapper
- **THEN** el dashboard incluye alerta con `tipo: "MAPPER_ERROR"` y el conteo de asientos afectados

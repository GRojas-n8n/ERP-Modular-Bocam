## ADDED Requirements

### Requirement: Registro de avance físico por concepto
El sistema SHALL permitir registrar el avance físico de un periodo para un
concepto del presupuesto base bajo
`POST /api/v1/control-proyectos/avances`, calculando cantidades y montos
acumulados a partir del avance anterior.

#### Scenario: Residente registra avance del periodo
- **WHEN** un usuario con rol `residencia`/`control_obra` envía
  `POST /api/v1/control-proyectos/avances` con `concepto_presupuesto`,
  `cantidad_periodo`, `periodo_inicio` y `periodo_fin`
- **THEN** el sistema calcula `cantidad_acumulada = cantidad_anterior + cantidad_periodo`,
  `importe_periodo`/`importe_acumulado` con el precio unitario del
  presupuesto, y crea el registro en estado `PENDIENTE`
- **AND** publica `control_obra.avance_fisico_registrado`

### Requirement: Validación o rechazo de avance físico
El sistema SHALL permitir a un superintendente validar o rechazar un
avance físico pendiente.

#### Scenario: Superintendente valida un avance
- **WHEN** un usuario con rol `superintendent`/`admin` hace
  `PATCH /api/v1/control-proyectos/avances/:id/validar` sobre un avance en
  estado `PENDIENTE`
- **THEN** el estado pasa a `VALIDADO`, se registra `validado_por_id`/`validado_por_nombre`
- **AND** el sistema recalcula en la misma operación (llamada de función
  directa, no vía cola) `pct_avance_real`, `cpi`, `spi` y `eac` de la
  `ProgramacionObra` correspondiente al mismo `concepto_id`
- **AND** publica `control_obra.avance_fisico_validado` con el mismo
  nombre y payload que tenía el servicio `control-obra` original, para que
  `finanzas` y `contabilidad` sigan funcionando sin cambios

#### Scenario: Superintendente rechaza un avance
- **WHEN** un usuario con rol `superintendent`/`admin` hace
  `PATCH /api/v1/control-proyectos/avances/:id/rechazar` con un motivo
- **THEN** el estado pasa a `RECHAZADO` y el avance no se incluye en
  ninguna estimación ni dispara recálculo de EVM

### Requirement: Estimación de facturación agrupando avances validados
El sistema SHALL permitir crear una estimación de facturación que agrupa
avances físicos validados de un periodo, con workflow de aprobación técnica
y financiera.

#### Scenario: Se crea una estimación con avances validados
- **WHEN** un usuario autorizado hace `POST /api/v1/control-proyectos/estimaciones`
  con un conjunto de `avance_id` en estado `VALIDADO` del mismo proyecto
- **THEN** el sistema calcula `subtotal`, `retencion_fondo_garantia`,
  `amortizacion_anticipo`, `iva` y `total_neto`, asigna `numero_estimacion`
  consecutivo por proyecto, y crea la estimación en estado `BORRADOR`

#### Scenario: Aprobación financiera de una estimación
- **WHEN** un usuario autorizado hace
  `PATCH /api/v1/control-proyectos/estimaciones/:id/aprobar` sobre una
  estimación en `EN_REVISION` o `APROBADA_TECNICA`
- **THEN** el estado pasa a `APROBADA_FINANCIERA`, se registra
  `aprobado_por_id`/`fecha_aprobacion`
- **AND** el sistema publica `control_obra.estimacion_aprobada` con el
  mismo nombre y payload que tenía el servicio `control-obra` original
- **AND** intenta la reconciliación B2B con Finanzas (fail-soft): si
  Finanzas no confirma la programación de pago, la estimación queda
  marcada como pendiente de reconciliación sin bloquear la aprobación

### Requirement: Recálculo de EVM disparado en el mismo proceso al validar un avance
El sistema SHALL recalcular `pct_avance_real`, `cpi`, `spi` y `eac` de
`ProgramacionObra` como una llamada de función directa dentro de la
transacción que valida un avance físico, en vez de depender de un
consumidor de RabbitMQ interno (comportamiento previo, cuando
`control-obra` y `control-proyectos` eran servicios separados).

#### Scenario: Validar un avance actualiza la programación en la misma operación
- **WHEN** se valida un avance físico cuyo `concepto_presupuesto` coincide
  con un `concepto_id` existente en `ProgramacionObra`
- **THEN** `ProgramacionObra.pct_avance_real`, `cpi`, `spi` y `eac` quedan
  actualizados antes de que la respuesta HTTP de
  `PATCH .../avances/:id/validar` regrese al cliente, sin depender de que
  RabbitMQ procese un evento de forma asíncrona

### Requirement: Registro de material consumido en obra por evento de almacén
El sistema SHALL registrar el costo real de materiales consumidos por
concepto al recibir el evento `almacen.salida_obra`, de forma idempotente
por `movimiento_id`.

#### Scenario: Se recibe una salida de almacén hacia obra
- **WHEN** llega el evento `almacen.salida_obra` con un `movimiento_id` no
  procesado antes
- **THEN** el sistema crea un registro de `MaterialConsumidoObra` con el
  costo total del movimiento, asociado al `concepto_id` correspondiente

#### Scenario: Evento duplicado (mismo movimiento_id)
- **WHEN** llega un evento `almacen.salida_obra` cuyo `movimiento_id` ya
  fue procesado
- **THEN** el sistema lo ignora sin crear un segundo registro

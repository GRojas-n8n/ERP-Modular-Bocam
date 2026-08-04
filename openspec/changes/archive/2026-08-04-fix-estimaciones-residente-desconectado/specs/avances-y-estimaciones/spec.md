## MODIFIED Requirements

### Requirement: Registro de avance físico por concepto
El sistema SHALL permitir registrar el avance físico de un periodo para un
concepto del presupuesto base bajo
`POST /api/v1/control-proyectos/avances`, resolviendo `concepto_id`,
`clave`, `descripción`, `unidad_medida`, `precio_unitario` y
`cantidad_presupuestada` contra el catálogo de conceptos de
`gerencia-tecnica` en el momento de creación (ignorando cualquier valor de
esos campos que el cliente envíe), derivando `cantidad_anterior` como la
suma de `cantidad_periodo` de los avances previos en estado distinto de
`RECHAZADO` del mismo `concepto_id` en el proyecto, calculando cantidades y
montos acumulados a partir de esos valores, y SHALL rechazar la petición
con `403` si el usuario no tiene rol `residencia`, `control_proyectos`,
`control_obra`, `director` o `admin`.

#### Scenario: Residente registra avance del periodo
- **WHEN** un usuario con rol `residencia` envía
  `POST /api/v1/control-proyectos/avances` con `concepto_id`,
  `cantidad_periodo`, `periodo_inicio` y `periodo_fin`
- **THEN** el sistema resuelve `clave`, `descripción`, `unidad_medida` y
  `precio_unitario` consultando el catálogo de conceptos de
  `gerencia-tecnica` por ese `concepto_id`
- **AND** calcula `cantidad_anterior` sumando `cantidad_periodo` de los
  avances previos no `RECHAZADO` del mismo `concepto_id` en el proyecto
- **AND** calcula `cantidad_acumulada = cantidad_anterior + cantidad_periodo`,
  `importe_periodo`/`importe_acumulado` con el precio unitario resuelto del
  catálogo, y crea el registro en estado `PENDIENTE`
- **AND** publica `control_obra.avance_fisico_registrado`

#### Scenario: Control de Obra registra avance del periodo
- **WHEN** un usuario con rol `control_proyectos`, `control_obra`,
  `director` o `admin` envía `POST /api/v1/control-proyectos/avances` con
  los mismos campos
- **THEN** el sistema lo procesa igual que si lo hiciera un usuario con rol
  `residencia`

#### Scenario: Usuario sin rol autorizado intenta registrar un avance
- **WHEN** un usuario sin rol `residencia`, `control_proyectos`,
  `control_obra`, `director` ni `admin` envía
  `POST /api/v1/control-proyectos/avances`
- **THEN** el sistema responde `403` y no crea ningún registro

#### Scenario: El cliente envía precio o cantidad presupuestada manualmente
- **WHEN** el body de `POST /api/v1/control-proyectos/avances` incluye
  `precio_unitario` o `cantidad_presupuestada`
- **THEN** el sistema ignora esos valores y usa los que resuelve del
  catálogo de conceptos de `gerencia-tecnica`

#### Scenario: El concepto no existe en el catálogo del proyecto activo
- **WHEN** el `concepto_id` enviado no existe en el presupuesto activo del
  proyecto
- **THEN** el sistema responde `400` y no crea ningún registro

#### Scenario: El catálogo de conceptos no está disponible
- **WHEN** la consulta a `gerencia-tecnica` para resolver el concepto falla
  o excede el tiempo de espera
- **THEN** el sistema responde con un error explícito y no crea el avance
  con datos sin validar

#### Scenario: El precio del concepto cambia después de crear un avance
- **WHEN** el `precio_unitario` de un concepto se actualiza en
  `gerencia-tecnica` después de que ya existen avances creados con ese
  concepto
- **THEN** los avances ya creados conservan el `precio_unitario` con el que
  se calcularon (no se recalculan retroactivamente)

### Requirement: Estimación de facturación agrupando avances validados
El sistema SHALL permitir crear una estimación de facturación que agrupa
avances físicos validados de un periodo, con workflow de aprobación técnica
y financiera, y SHALL rechazar la petición de creación con `403` si el
usuario no tiene rol `residencia`, `control_proyectos` o `admin`.

#### Scenario: Se crea una estimación con avances validados
- **WHEN** un usuario con rol `residencia`, `control_proyectos` o `admin`
  hace `POST /api/v1/control-proyectos/estimaciones`
  con un conjunto de `avance_id` en estado `VALIDADO` del mismo proyecto
- **THEN** el sistema calcula `subtotal`, `retencion_fondo_garantia`,
  `amortizacion_anticipo`, `iva` y `total_neto`, asigna `numero_estimacion`
  consecutivo por proyecto, y crea la estimación en estado `BORRADOR`

#### Scenario: Usuario sin rol autorizado intenta crear una estimación
- **WHEN** un usuario sin rol `residencia`, `control_proyectos` o `admin`
  hace `POST /api/v1/control-proyectos/estimaciones`
- **THEN** el sistema responde `403` y no crea ninguna estimación

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

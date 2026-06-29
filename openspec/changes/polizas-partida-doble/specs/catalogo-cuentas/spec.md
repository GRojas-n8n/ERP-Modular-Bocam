## ADDED Requirements

### Requirement: Catálogo de cuentas contables sembrado en BD

El sistema SHALL proveer un catálogo de cuentas contables (`CuentaContable`) sembrado en la base de datos de contabilidad al momento del deploy, con al menos las 15 cuentas definidas para constructora (claves 1100–6100), con jerarquía padre-hijo hasta 4 niveles, tipo (`ACTIVO`, `PASIVO`, `CAPITAL`, `INGRESO`, `COSTO`, `GASTO`) y naturaleza (`DEUDORA`, `ACREEDORA`).

#### Scenario: Seed inicial exitoso
- **WHEN** se ejecuta la migración Prisma en un ambiente limpio
- **THEN** la tabla `cuentas_contables` contiene exactamente las cuentas del catálogo base con `activa = true`

#### Scenario: Cuenta padre existe antes que hija
- **WHEN** el seed inserta una cuenta de nivel 2 (ej. 5110-Materiales)
- **THEN** su `padre_id` apunta a la cuenta de nivel 1 (5100-Costo Directo de Obra) ya existente

### Requirement: Lookup de cuenta por clave

El sistema SHALL resolver `CuentaContable` por `clave` (ej. `"1100"`) dentro del mapper de movimientos, fallando gracefully si la cuenta no existe.

#### Scenario: Cuenta encontrada
- **WHEN** el mapper busca la clave `"2100"` en la BD
- **THEN** retorna el `id_cuenta` correspondiente

#### Scenario: Cuenta no encontrada — degradación graceful
- **WHEN** el mapper busca una clave que no existe en `cuentas_contables`
- **THEN** loggea `warn` con `action: contabilidad.mapper.cuenta_not_found` y NO genera movimientos para ese asiento (el asiento queda en partida simple)

### Requirement: Endpoint GET catálogo de cuentas

El sistema SHALL exponer `GET /api/v1/contabilidad/cuentas` para que la UI pueda listar el catálogo de cuentas activas.

#### Scenario: Lista de cuentas activas
- **WHEN** usuario con rol `admin`, `finance` o `superintendent` llama `GET /api/v1/contabilidad/cuentas`
- **THEN** retorna array de cuentas con `id_cuenta`, `clave`, `nombre`, `tipo`, `naturaleza`, `nivel`, `padre_id`

#### Scenario: Solo cuentas activas
- **WHEN** una cuenta tiene `activa = false`
- **THEN** no aparece en la respuesta del endpoint

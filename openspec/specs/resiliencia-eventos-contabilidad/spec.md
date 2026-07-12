# Spec: resiliencia-eventos-contabilidad

## Propósito

Define cómo `apps/contabilidad` debe degradarse cuando el procesamiento de
un evento de dominio (pago registrado, OC creada, transferencia
presupuestal, etc.) no puede resolver por completo una línea de la póliza
de partida doble — por ejemplo, cuando falta una clave en el catálogo
`CuentaContable`. El procesamiento del evento completo (creación del
asiento contable, conciliación fiscal, etc.) no debe abortarse por el fallo
de una sola línea de póliza.

## Requirements

### Requirement: Una línea de póliza no resoluble SHALL degradarse sin abortar el evento
Cuando `apps/contabilidad` procesa un evento de dominio (pago registrado, OC
creada, transferencia presupuestal, etc.) y necesita resolver una cuenta
contable del catálogo (`CuentaContable`) para construir una línea de la
póliza de partida doble, si esa clave no existe en el catálogo el sistema
SHALL registrar una advertencia estructurada y omitir únicamente esa línea,
sin lanzar una excepción que aborte el resto del procesamiento del evento
(incluyendo pasos posteriores como la creación de la conciliación fiscal
placeholder).

#### Scenario: Clave contable ausente del catálogo
- **WHEN** `resolveCuentaId` busca una clave que no existe en
  `CuentaContable`
- **THEN** el sistema registra una advertencia con la clave faltante (sin
  lanzar excepción) y la línea de póliza correspondiente se omite

#### Scenario: El resto del evento se procesa igual pese a una línea omitida
- **WHEN** un evento `finanzas.pago_registrado` genera un asiento contable y
  una de sus líneas de póliza no puede resolver su cuenta contable
- **THEN** el asiento contable y la conciliación fiscal placeholder
  asociada se crean de todas formas — solo la línea de póliza afectada se
  omite

#### Scenario: Advertencia registrada sin contexto de request HTTP
- **WHEN** el código de resolución de cuentas corre desde un manejador de
  eventos de RabbitMQ (sin objeto `req` de Express disponible)
- **THEN** la advertencia se registra sin depender de un `req` HTTP-scoped
  (no usa el logger `logWarn`/`logInfo`/`logError` de
  `packages/observability`, que requiere `req.securityContext`)

## MODIFIED Requirements

### Requirement: Cálculo ISR con tablas SAT
El motor SHALL calcular ISR usando la tabla correspondiente a la periodicidad de la `PreNomina`: `SEMANAL`, `QUINCENAL` o `MENSUAL`. `base_isr = total_percepciones - 50% del monto de horas_extra` (parte exenta LFT art. 93). `isr_bruto = cuota_fija + (base_isr - limite_inferior) × tasa_marginal` del tramo correspondiente a la tabla de la periodicidad usada. `subsidio` se obtiene de la tabla de subsidio correspondiente a esa misma periodicidad (`SUBSIDIO_SEMANAL`, `SUBSIDIO_QUINCENAL` o `SUBSIDIO_MENSUAL`). `deduccion_isr = MAX(0, isr_bruto - subsidio)`, redondeado a 2 decimales.

#### Scenario: Cálculo ISR semanal (comportamiento previo sin cambios)
- **WHEN** el motor calcula ISR para una `PreNomina` con `periodo_tipo = SEMANAL`
- **THEN** usa la tabla y subsidio semanales, sin cambios respecto al comportamiento anterior

#### Scenario: Cálculo ISR quincenal (comportamiento previo sin cambios)
- **WHEN** el motor calcula ISR para una `PreNomina` con `periodo_tipo = QUINCENAL`
- **THEN** usa la tabla y subsidio quincenales, sin cambios respecto al comportamiento anterior

#### Scenario: Cálculo ISR mensual (nuevo)
- **WHEN** el motor calcula ISR para una `PreNomina` con `periodo_tipo = MENSUAL`
- **THEN** usa la tabla ISR mensual y el subsidio mensual vigentes, calculando `dias` del período por mes calendario (no por factor aproximado)

#### Scenario: Periodicidad sin tabla disponible
- **WHEN** el motor recibe una `PreNomina` con un `periodo_tipo` fuera de `SEMANAL`/`QUINCENAL`/`MENSUAL`
- **THEN** el sistema responde `400` indicando periodicidad no soportada, sin generar detalles con montos incorrectos

## ADDED Requirements

### Requirement: Una estimación cobrada por completo SHALL pasar a FACTURADA
Al recibir `finanzas.cobro_registrado` con `origen = ESTIMACION` y `estado = COBRADA`, la estimación del mismo
proyecto SHALL pasar a FACTURADA con una nota del cobro. Un cobro parcial SHALL agregar solo la nota.

#### Scenario: Reentrega
- **WHEN** el mismo cobro llega dos veces
- **THEN** la nota SHALL aparecer una sola vez

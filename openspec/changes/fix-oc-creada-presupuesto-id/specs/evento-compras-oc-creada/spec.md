## ADDED Requirements

### Requirement: El evento compras.oc_creada SHALL incluir presupuesto_id
Todo evento `compras.oc_creada` publicado por Compras SHALL incluir `presupuesto_id`, el mismo valor persistido en la OC, junto con `oc_id`, `codigo`, `total` y `proveedor_id`. La adición NO SHALL renombrar ni quitar campos existentes.

#### Scenario: OC emitida por convertir-oc
- **WHEN** Compras crea y emite una OC desde un cuadro comparativo aprobado
- **THEN** el payload de `compras.oc_creada` incluye el `presupuesto_id` con el que se creó la OC

#### Scenario: Consumidores aceptan el payload real
- **WHEN** el payload construido por el publicador se entrega a Contabilidad y a Finanzas
- **THEN** ambos lo aceptan como válido y procesan la OC

#### Scenario: Reenvío idempotente
- **WHEN** el mismo evento se entrega dos veces
- **THEN** Contabilidad conserva un solo asiento y Finanzas un solo compromiso

### Requirement: Los eventos de OC SHALL tener un contrato simétrico
`compras.oc_creada` y `compras.oc_cancelada` SHALL compartir `oc_id`, `codigo`, `total` y `presupuesto_id`.

#### Scenario: Simetría de campos
- **WHEN** se construyen los payloads de creación y cancelación de una misma OC
- **THEN** ambos contienen los mismos valores de `oc_id`, `codigo`, `total` y `presupuesto_id`

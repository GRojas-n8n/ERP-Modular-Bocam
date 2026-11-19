## MODIFIED Requirements

### Requirement: La póliza de pasivo proyectado SHALL nombrar al proveedor
Al consumir `compras.oc_creada`, Contabilidad SHALL registrar como beneficiario de la póliza `PASIVO_PROYECTADO` el
`proveedor_nombre` del evento. Si el evento no lo trae, SHALL usar `proveedor_id`.

#### Scenario: Evento con nombre
- **WHEN** llega `compras.oc_creada` con `proveedor_nombre: "Proveedora Demo, S.A. de C.V."`
- **THEN** la póliza SHALL tener ese beneficiario

#### Scenario: Evento antiguo sin nombre
- **WHEN** llega `compras.oc_creada` sin `proveedor_nombre`
- **THEN** la póliza SHALL tener `proveedor_id` como beneficiario, como antes

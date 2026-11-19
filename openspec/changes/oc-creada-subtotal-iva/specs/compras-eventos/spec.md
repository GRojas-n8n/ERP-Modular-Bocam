## MODIFIED Requirements

### Requirement: compras.oc_creada SHALL incluir subtotal e IVA
Cada `compras.oc_creada` SHALL incluir `subtotal` e `iva` de la OC como números, con `total = subtotal + iva`, además
de los campos existentes, que no cambian. Si la OC no los tiene, SHALL publicarlos como `null`.

#### Scenario: OC con IVA
- **WHEN** se emite una OC con subtotal 1000 e IVA 160
- **THEN** el evento SHALL traer `subtotal: 1000`, `iva: 160` y `total: 1160`

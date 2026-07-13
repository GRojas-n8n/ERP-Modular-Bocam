## ADDED Requirements

### Requirement: Los ítems de requisición sin insumo de catálogo SHALL poder cotizarse en el Cuadro Comparativo
El sistema SHALL crear una línea en el Cuadro Comparativo para todo ítem de requisición,
incluyendo los capturados como texto libre (imprevisto, sin `insumo_id` de catálogo) —
identificada por el ítem de requisición de origen en vez de por un insumo de catálogo, sin
requerir crear ningún registro nuevo en el catálogo de insumos. Compras SHALL poder
capturar el precio de esa línea por proveedor (manualmente o vía aplicación de PDF), y ese
precio SHALL persistir de la misma forma que para líneas con insumo de catálogo. El panel
de marca/modelo y especificaciones técnicas SHALL funcionar igual para estas líneas.

#### Scenario: Crear el cuadro con un ítem de texto libre
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem no tiene
  `insumo_id` (capturado como texto libre)
- **THEN** el cuadro se crea con una línea para ese ítem, identificada por el ítem de
  requisición de origen

#### Scenario: Capturar precio manualmente en una línea de texto libre
- **WHEN** Compras captura manualmente el precio de un proveedor para una línea sin
  `insumo_id` y guarda las cotizaciones
- **THEN** el precio persiste correctamente y es visible al recargar el cuadro, igual que
  para una línea con insumo de catálogo

#### Scenario: Aplicar un PDF de cotización sobre una línea de texto libre
- **WHEN** Compras sube y aplica un PDF de cotización cuyo renglón emparejado corresponde a
  una línea sin `insumo_id`
- **THEN** el precio extraído se persiste para esa línea, igual que para una línea con
  insumo de catálogo

#### Scenario: Editar marca/especificaciones de una línea de texto libre
- **WHEN** Compras edita la marca/modelo o la especificación técnica de una línea sin
  `insumo_id` desde el panel de "Detalles técnicos"
- **THEN** los cambios se guardan y persisten correctamente

#### Scenario: Líneas con insumo de catálogo no cambian de comportamiento
- **WHEN** Compras trabaja con un cuadro cuyos ítems todos tienen `insumo_id` de catálogo
- **THEN** el comportamiento de creación, captura de precios y edición de detalles técnicos
  es idéntico al actual, sin regresión

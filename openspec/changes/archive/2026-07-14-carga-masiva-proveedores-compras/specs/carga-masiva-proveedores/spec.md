## ADDED Requirements

### Requirement: Un usuario procurement/admin SHALL poder importar Proveedores en lote desde CSV/Excel
El sistema SHALL permitir a un usuario con rol `procurement` o `admin`
importar múltiples Proveedores de una sola vez a partir de un archivo
CSV o Excel, validando cada registro con las mismas reglas que la alta
individual (`rfc_tax_id`/`razon_social` obligatorios;
`calificacion_desempeno` opcional entre 0.00 y 5.00 si se envía).

#### Scenario: Lote con todos los registros válidos
- **WHEN** se envía un lote de registros donde todos cumplen las reglas
  de validación y ningún `rfc_tax_id` está duplicado
- **THEN** el sistema crea todos los proveedores y responde con el
  conteo de creados y la lista de errores vacía

#### Scenario: Lote con registros mixtos, válidos e inválidos
- **WHEN** se envía un lote donde algunos registros son válidos y otros
  no (faltan campos obligatorios, `calificacion_desempeno` fuera de
  0.00–5.00, o el RFC ya existe en el tenant)
- **THEN** el sistema crea los registros válidos y reporta cada registro
  inválido con el número de fila y el motivo, sin abortar el lote
  completo

#### Scenario: RFC duplicado dentro del mismo archivo
- **WHEN** el mismo `rfc_tax_id` (normalizado con `trim().toUpperCase()`)
  aparece en más de una fila del archivo importado
- **THEN** ninguna de esas filas se crea — ambas se reportan como error
  de "RFC duplicado dentro del archivo"

#### Scenario: Rol sin permiso intenta importar
- **WHEN** un usuario sin rol `procurement` ni `admin` intenta usar el
  endpoint de importación masiva
- **THEN** el sistema responde 403 y no crea ningún registro

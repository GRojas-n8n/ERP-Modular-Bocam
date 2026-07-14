## ADDED Requirements

### Requirement: Un usuario personal_rh/admin SHALL poder importar Empleados en lote desde CSV/Excel
El sistema SHALL permitir a un usuario con rol `personal_rh` o `admin`
importar múltiples Empleados de una sola vez a partir de un archivo CSV
o Excel, validando cada registro con las mismas reglas que la alta
individual (`nombre`/`apellido_paterno`/`rfc`/`puesto`/`salario_diario`
obligatorios) y asignando `numero_empleado` autoincremental sin
colisiones.

#### Scenario: Lote con todos los registros válidos
- **WHEN** se envía un lote de registros donde todos cumplen las reglas
  de validación y ningún `rfc` está duplicado
- **THEN** el sistema crea todos los empleados, cada uno con un
  `numero_empleado` correlativo único, y responde con el conteo de
  creados y la lista de errores vacía

#### Scenario: Lote con registros mixtos, válidos e inválidos
- **WHEN** se envía un lote donde algunos registros son válidos y otros
  no (faltan campos obligatorios, `salario_diario` no numérico, o el RFC
  ya existe en el tenant)
- **THEN** el sistema crea los registros válidos y reporta cada registro
  inválido con el número de fila y el motivo, sin abortar el lote
  completo

#### Scenario: RFC duplicado dentro del mismo archivo
- **WHEN** el mismo `rfc` aparece en más de una fila del archivo
  importado
- **THEN** ninguna de esas filas se crea — ambas se reportan como error
  de "RFC duplicado dentro del archivo"

#### Scenario: Rol sin permiso intenta importar
- **WHEN** un usuario sin rol `personal_rh` ni `admin` intenta usar el
  endpoint de importación masiva
- **THEN** el sistema responde 403 y no crea ningún registro

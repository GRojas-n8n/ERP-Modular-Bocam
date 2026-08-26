## ADDED Requirements

### Requirement: Los parsers de OPUS SHALL reportar qué columnas secundarias no se confirmaron contra el encabezado real
`parsearArchivoAPU` y `parsearArchivoExplosion` SHALL retornar la lista de nombres de columna secundaria (`Unidad`, `Cantidad`, `Rendimiento`, `Costo Unitario`, según aplique a cada parser) cuyo nombre esperado no apareció en la fila de encabezado detectada del archivo, y que por lo tanto se leyeron desde una posición de columna por defecto.

#### Scenario: Encabezado sin columna de Costo Unitario reconocible
- **WHEN** `parsearArchivoAPU` procesa un archivo cuyo encabezado tiene `CLAVE` y `DESCRIPCION` pero ninguna celda coincide con el patrón de "costo unitario"/"costo directo"
- **THEN** el resultado SHALL incluir `'Costo Unitario'` en `columnasNoConfirmadas`

#### Scenario: Encabezado con todas las columnas reconocibles
- **WHEN** `parsearArchivoExplosion` procesa un archivo cuyo encabezado tiene `CLAVE`, `DESCRIPCION`, `UNIDAD` y `COSTO UNITARIO` reconocibles
- **THEN** el resultado SHALL tener `columnasNoConfirmadas` vacío

### Requirement: La vista previa de importación SHALL advertir sobre columnas no confirmadas antes de que el usuario confirme
Cuando `columnasNoConfirmadas` no está vacío, el panel de vista previa de importación (APU o Explosión) SHALL mostrar un banner indicando qué columnas se asumieron por posición en vez de confirmarse por nombre de encabezado, sin bloquear la confirmación.

#### Scenario: El usuario ve la advertencia antes de confirmar
- **WHEN** el usuario carga un archivo APU cuya columna de Rendimiento no se pudo confirmar
- **THEN** el panel de vista previa SHALL mostrar un banner mencionando "Rendimiento" antes de que el usuario pueda hacer clic en "Confirmar"

#### Scenario: Sin columnas no confirmadas, no aparece el banner
- **WHEN** el usuario carga un archivo cuyo encabezado permite confirmar todas las columnas secundarias
- **THEN** el panel de vista previa NO SHALL mostrar el banner de columnas no confirmadas

### Requirement: El comportamiento de parseo existente SHALL permanecer sin cambios
Este change SHALL ser puramente informativo — los insumos extraídos, sus valores (`clave`, `descripcion`, `unidad_medida`, `costo_base`, `tipo_insumo`) y las composiciones APU generadas SHALL ser idénticos a los que producían los parsers antes de este change, para el mismo archivo de entrada.

#### Scenario: Un archivo que hoy se importa correctamente sigue importándose igual
- **WHEN** se procesa un archivo cuyo encabezado confirma todas las columnas (caso ya cubierto por los tests existentes de estos parsers)
- **THEN** los insumos y composiciones extraídos SHALL ser idénticos a los del comportamiento anterior a este change

## ADDED Requirements

### Requirement: Los parsers de APU y Explosión descartan filas de boilerplate por longitud implausible
El sistema SHALL descartar, sin agregarla al catálogo de insumos en vista previa, cualquier fila de un archivo de APU o Explosión de Insumos cuya `clave` extraída exceda 50 caracteres o cuya `unidad_medida` extraída exceda 20 caracteres.

#### Scenario: Fila de firma al final del reporte se descarta
- **WHEN** el archivo importado (APU o Explosión) contiene, tras la última sección de insumos, una fila cuyo texto (repetido en todas las columnas por celdas combinadas) es el nombre de una persona o un cargo (ej. "L.A.E. IVONNE OBREGON GUTIERREZ")
- **THEN** esa fila no aparece en el catálogo de insumos en vista previa ni se envía al backend

#### Scenario: Título de página repetido a media hoja se descarta (APU)
- **WHEN** el archivo de APU repite el título del reporte (ej. "ANÁLISIS DETALLADO DE PRECIOS UNITARIOS") en una fila intermedia sin que la preceda un disparador de nuevo concepto
- **THEN** esa fila no se interpreta como insumo

#### Scenario: Insumos reales con claves y unidades normales se siguen importando
- **WHEN** el archivo contiene filas de insumo reales con `clave` y `unidad_medida` dentro de los límites normales (ej. "HBD001" / "JOR")
- **THEN** esas filas se agregan al catálogo de insumos en vista previa como hasta ahora

### Requirement: `POST /insumos/importar-lote` valida longitud y rango antes de insertar
El sistema SHALL validar que `clave` (máx. 50 caracteres), `unidad_medida` (máx. 20 caracteres) y `costo_base` (no negativo, dentro del rango de `Decimal(12,4)`) cumplan los límites de columna antes de incluir un ítem en la operación de inserción por lote, contabilizándolo como omitido en caso contrario, en lugar de dejar que la base de datos rechace la operación completa.

#### Scenario: Ítem fuera de rango se cuenta como omitido sin tumbar el lote
- **WHEN** el body de `POST /insumos/importar-lote` incluye un ítem cuya `unidad_medida` excede 20 caracteres, junto con otros ítems válidos
- **THEN** el endpoint responde 200, crea/actualiza los ítems válidos, y el conteo de `omitidos` incluye el ítem fuera de rango

#### Scenario: Lote compuesto solo por ítems fuera de rango
- **WHEN** todos los ítems del body exceden algún límite de longitud o rango
- **THEN** el endpoint responde 400 con un mensaje indicando que ningún insumo del lote es válido, igual que ya ocurre para otras validaciones existentes

### Requirement: La composición APU agrupa por la clave real del concepto, no por texto duplicado de celdas combinadas
El sistema SHALL extraer, como clave del concepto en el parser de APU, el valor real que sigue a la etiqueta "Clave:" en el archivo, ignorando celdas adicionales que sean copias de la misma etiqueta producidas por combinación de celdas.

#### Scenario: Celdas combinadas repiten "Clave:" antes del valor real
- **WHEN** una fila del archivo de APU tiene la etiqueta "Clave:" duplicada en varias celdas consecutivas (por combinación de celdas) antes de la celda que contiene el valor real (ej. "2.1.1")
- **THEN** la composición del concepto se registra con clave "2.1.1", no con el texto "Clave:"

### Requirement: El mensaje de error de importación de insumos muestra la causa real
El sistema SHALL mostrar, cuando `POST /insumos/importar-lote` responde con un error, el mensaje de error devuelto por el backend (`error.message`) en el toast de error, en lugar de un mensaje genérico de la librería HTTP.

#### Scenario: El backend responde con un mensaje de error específico
- **WHEN** `POST /insumos/importar-lote` falla y responde `{ success: false, error: { message: '...' } }`
- **THEN** el toast de error mostrado al usuario incluye ese mensaje específico, no el texto genérico de la petición HTTP fallida

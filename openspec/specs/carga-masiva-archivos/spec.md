## Requirements

### Requirement: El emparejamiento de columnas de un archivo importado SHALL tolerar acentos, espacios y guiones
El sistema SHALL reconocer una columna de un archivo Excel/CSV importado (Clientes,
Proveedores o Empleados) cuyo encabezado use acentos, espacios o guiones en vez de la forma
snake_case exacta de sus alias internos, siempre que el texto normalizado (sin acentos, en
minúsculas, con espacios/guiones tratados como equivalentes al guion bajo, y sin palabras
conectoras como "de"/"del"/"la"/"el") coincida con alguno de los alias configurados para esa
columna.

#### Scenario: Encabezado con acento y espacio
- **WHEN** el archivo importado tiene una columna con encabezado "RAZÓN SOCIAL"
- **THEN** el sistema la reconoce como la columna `razon_social`, igual que si el
  encabezado hubiera sido escrito exactamente `razon_social`

#### Scenario: Encabezado con palabra conectora
- **WHEN** el archivo importado tiene una columna con encabezado "Fecha de Ingreso"
- **THEN** el sistema la reconoce como la columna `fecha_ingreso`

#### Scenario: Encabezado sin ninguna coincidencia
- **WHEN** el archivo importado tiene una columna cuyo encabezado normalizado no coincide
  con ningún alias configurado (ej. "Compañía" para razón social)
- **THEN** el sistema no la reconoce — comportamiento sin cambios respecto a hoy, el dato de
  esa columna no se extrae y la fila se marca con el error correspondiente si el campo es
  obligatorio

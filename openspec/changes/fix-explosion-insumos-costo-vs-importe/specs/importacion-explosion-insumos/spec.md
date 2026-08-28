## ADDED Requirements

### Requirement: El sistema SHALL usar la columna Importe para insumos de mano de obra e indirectos reportados como monto directo
Al importar un archivo de Explosión de Insumos (formato OPUS), para filas cuya clave de insumo tenga prefijo `HH` (mano de obra / herramienta menor) o `HS` (seguridad / indirectos), el sistema SHALL tomar el precio del insumo desde la columna IMPORTE del archivo, no desde la columna Costo Unitario, cuando la columna IMPORTE esté presente en el archivo.

#### Scenario: Fila HH Herramienta Menor con Costo Unitario e Importe distintos
- **WHEN** se importa un archivo de Explosión de Insumos con una fila de clave `HH-001 Herramienta Menor` cuya columna Costo Unitario vale `0.00` y cuya columna Importe vale `1,250.00`
- **THEN** el sistema registra el precio de ese insumo como `1,250.00`, no como `0.00`

#### Scenario: Fila HS Equipo de Seguridad Básico Industrial
- **WHEN** se importa un archivo de Explosión de Insumos con una fila de clave `HS-002 Equipo de Seguridad Básico Industrial` cuya columna Importe difiere de la columna Costo Unitario
- **THEN** el sistema registra el precio de ese insumo tomando el valor de la columna Importe

### Requirement: El sistema SHALL preservar el comportamiento actual para insumos de materiales y equipo
Para filas cuya clave de insumo no tenga prefijo `HH` ni `HS`, el sistema SHALL continuar tomando el precio desde la columna Costo Unitario (o Precio Unitario / Costo Directo, según el encabezado detectado), igual que antes de este cambio.

#### Scenario: Fila de material estándar
- **WHEN** se importa un archivo de Explosión de Insumos con una fila de clave de material (sin prefijo `HH`/`HS`) con Costo Unitario `85.50`
- **THEN** el sistema registra el precio de ese insumo como `85.50`, igual que el comportamiento previo a este cambio

### Requirement: El sistema SHALL usar Costo Unitario como respaldo si el archivo no trae columna Importe
Si el archivo importado no tiene una columna reconocible como Importe, el sistema SHALL usar la columna Costo Unitario para todas las filas, incluidas las de prefijo `HH`/`HS`, sin fallar la importación.

#### Scenario: Archivo sin columna Importe
- **WHEN** se importa un archivo de Explosión de Insumos cuyos encabezados no incluyen ninguna columna reconocible como Importe
- **THEN** el sistema importa todas las filas usando la columna Costo Unitario, tal como el comportamiento anterior a este cambio

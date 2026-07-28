# feedback-progreso-carga-masiva Specification

## Purpose
TBD - created by archiving change feedback-en-vivo-carga-masiva. Update Purpose after archive.
## Requirements
### Requirement: La carga masiva SHALL mostrar cada fila y su error conforme se procesa
Durante la carga masiva de Clientes, Proveedores o Empleados, el sistema SHALL agregar cada
fila procesada (junto con su error de validación, si lo tiene) a la vista previa conforme se
procesa, en vez de esperar a que el archivo completo termine de leerse y validarse antes de
mostrar cualquier fila.

#### Scenario: Un archivo CSV con un error en una fila avanzada
- **WHEN** un usuario carga un archivo `.csv` de 100 filas donde la fila 50 tiene un RFC
  faltante
- **THEN** las filas 1-49 aparecen en la vista previa antes de que la fila 50 se haya
  procesado, y la fila 50 aparece marcada con su error específico en cuanto se procesa, sin
  esperar a que las filas 51-100 también se procesen

#### Scenario: Un archivo XLSX con un error en una fila avanzada
- **WHEN** un usuario carga un archivo `.xlsx` de 100 filas donde la fila 50 tiene un RFC
  duplicado
- **THEN** la vista previa se llena progresivamente por lotes conforme se validan las filas,
  sin esperar a que las 100 filas terminen de validarse antes de mostrar la primera

### Requirement: El panel de importación SHALL mostrar progreso mientras el archivo se procesa
Mientras un archivo de carga masiva se está leyendo y validando, el sistema SHALL mostrar
cuántas filas se han procesado hasta el momento y cuántos errores se han encontrado hasta
ese punto.

#### Scenario: El usuario ve el conteo de progreso mientras carga un archivo grande
- **WHEN** un archivo de carga masiva está siendo procesado y aún no ha terminado
- **THEN** el panel de importación muestra un conteo de filas procesadas y errores
  encontrados hasta el momento, actualizado conforme avanza el procesamiento

### Requirement: El resultado final de la carga masiva SHALL ser idéntico al comportamiento sin feedback en vivo
El cambio a feedback progresivo SHALL preservar exactamente el mismo conjunto final de filas,
errores y reglas de validación (RFC duplicado, campos obligatorios, formato de código) que ya
existían antes de este change.

#### Scenario: El resultado final no cambia
- **WHEN** un archivo de carga masiva termina de procesarse, ya sea con feedback progresivo
  activado
- **THEN** el conjunto final de filas válidas e inválidas, y el motivo de cada error, es
  idéntico al que se habría obtenido con el procesamiento en un solo paso


## ADDED Requirements

### Requirement: El frontend SHALL NOT depender del paquete xlsx (SheetJS)
El sistema SHALL leer y generar archivos Excel/CSV en `app-shell` sin depender del paquete npm `xlsx`, dado que su versión publicada en el registro npm tiene vulnerabilidades sin parche disponible. El motor de lectura de archivos binarios `.xlsx`/`.xls` SHALL ser `exceljs`; el motor de lectura de archivos `.csv`/`.txt` SHALL ser una librería dedicada a CSV sin vulnerabilidades conocidas en su versión instalada.

#### Scenario: Sin xlsx en las dependencias de app-shell
- **WHEN** se audita `apps/app-shell/package.json` y el lockfile raíz
- **THEN** el paquete `xlsx` no aparece como dependencia de `app-shell`

#### Scenario: npm audit sin alertas de xlsx
- **WHEN** se ejecuta `npm audit` sobre el monorepo después de este cambio
- **THEN** no aparece ninguna vulnerabilidad asociada al paquete `xlsx`

### Requirement: El parseo de archivos importados SHALL preservar el comportamiento observable actual
Para un archivo `.xlsx`, `.xls`, `.csv` o `.txt` importado, el sistema SHALL producir el mismo resultado observable que producía con el motor anterior: una fila vacía en cualquier celda SHALL producirse como cadena vacía (`''`), no como `null`/`undefined`; los valores numéricos y de fecha SHALL convertirse a su representación de texto (no valores crudos); y la primera fila SHALL usarse como encabezados de columna cuando el llamador lo solicite en modo objeto, o SHALL devolverse como arreglo de arreglos cuando el llamador lo solicite en modo `header:1`.

#### Scenario: Celda vacía en un archivo importado
- **WHEN** una fila de un archivo `.xlsx` importado tiene una celda sin valor
- **THEN** el sistema devuelve cadena vacía para esa celda, igual que con el motor anterior

#### Scenario: Celda numérica o de fecha
- **WHEN** una celda de un archivo `.xlsx` importado contiene un número o una fecha
- **THEN** el sistema devuelve su representación en texto, no el valor crudo de la celda

#### Scenario: Modo arreglo de arreglos para presupuestos OPUS
- **WHEN** `InsumosView.tsx` importa un archivo de presupuesto solicitando el modo `header:1`
- **THEN** el sistema devuelve un arreglo de arreglos (una fila = un arreglo de valores de celda), igual que con el motor anterior

#### Scenario: Modo arreglo de objetos para carga masiva
- **WHEN** una vista de carga masiva (Clientes, Proveedores o Empleados) importa un archivo sin solicitar `header:1`
- **THEN** el sistema devuelve un arreglo de objetos usando la primera fila como llaves, igual que con el motor anterior

### Requirement: La plantilla descargable SHALL generarse client-side con el mismo contenido
El sistema SHALL generar el archivo `.xlsx` de plantilla (encabezados + fila de ejemplo) enteramente en el navegador, sin llamada a backend, con el mismo contenido y nombre de archivo que el motor anterior producía.

#### Scenario: Descargar plantilla de carga masiva
- **WHEN** un usuario hace clic en "Descargar plantilla" en cualquier vista de carga masiva
- **THEN** el navegador descarga un archivo `.xlsx` cuya primera fila son los encabezados configurados y cuya segunda fila es la fila de ejemplo configurada, sin ninguna llamada de red

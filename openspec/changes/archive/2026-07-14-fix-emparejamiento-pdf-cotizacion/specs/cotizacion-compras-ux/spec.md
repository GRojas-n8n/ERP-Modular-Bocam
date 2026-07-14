## MODIFIED Requirements

### Requirement: El PDF de cotización SHALL subirse y persistirse únicamente desde el cuadro comparativo
El cuadro comparativo (`ComparativaDetail`) SHALL ser el único lugar donde Compras
sube el PDF de cotización de un proveedor. Al aplicar una cotización extraída por
IA (botón "Aplicar cotización" sobre los renglones revisados), el sistema SHALL
persistir el archivo PDF original asociado a ese proveedor dentro del cuadro
comparativo, para que quede disponible como respaldo/auditoría independientemente
de futuras ediciones de precios.

El emparejamiento entre cada renglón extraído del PDF y la línea del cuadro correspondiente
SHALL basarse en el solapamiento de palabras significativas entre ambas descripciones
(tokenizado, normalizado sin acentos/mayúsculas), no en una comparación literal de prefijo.
El sistema SHALL informar explícitamente al usuario, tras aplicar la cotización, cuántas
líneas del cuadro no lograron emparejarse automáticamente con ningún renglón del PDF, en vez
de mostrar siempre el mismo mensaje de éxito genérico.

#### Scenario: Compras sube el PDF de un proveedor y aplica la cotización extraída
- **WHEN** Compras sube el PDF de un proveedor, revisa los renglones extraídos por
  la IA y confirma "Aplicar cotización"
- **THEN** el sistema guarda los precios aplicados en el cuadro comparativo Y
  persiste el archivo PDF original asociado a ese proveedor, recuperable
  posteriormente

#### Scenario: Compras sube un PDF pero no aplica la cotización
- **WHEN** Compras sube un PDF, revisa los renglones extraídos, pero cierra el
  panel de revisión sin pulsar "Aplicar cotización"
- **THEN** el sistema NO persiste ningún archivo — solo se guardan los PDF que el
  usuario confirma aplicar

#### Scenario: Servicio de extracción por IA no disponible
- **WHEN** Compras sube un PDF y el servicio de extracción por IA responde con
  error (p. ej. no disponible)
- **THEN** el sistema permite a Compras capturar los precios manualmente y, al
  aplicar, persiste igualmente el PDF original como respaldo de la cotización

#### Scenario: El renglón del PDF describe el ítem con palabras en distinto orden o redacción
- **WHEN** Compras aplica una cotización cuyo renglón extraído describe el ítem con las
  mismas palabras significativas que la línea del cuadro, pero en distinto orden o con
  redacción propia del proveedor (ej. línea "Mini Split Inverter de 1 Tonelada (12,000 BTU)
  a 220V" vs renglón del PDF "Minisplit Inverter 1 Ton 220V")
- **THEN** el sistema empareja correctamente el renglón con la línea por solapamiento de
  palabras significativas y aplica su precio, aunque las cadenas no compartan un prefijo
  literal

#### Scenario: Ninguna línea del cuadro logra emparejarse con los renglones del PDF
- **WHEN** Compras aplica una cotización cuyos renglones extraídos no comparten ninguna
  palabra significativa con ninguna línea del cuadro
- **THEN** el sistema no aplica ningún precio, persiste igualmente el PDF como respaldo, y
  muestra una advertencia indicando que ninguna línea pudo emparejarse automáticamente y que
  deben capturarse los precios manualmente — no un mensaje de éxito genérico

#### Scenario: Solo algunas líneas del cuadro logran emparejarse con los renglones del PDF
- **WHEN** Compras aplica una cotización donde, de varias líneas del cuadro, solo algunas
  encuentran un renglón del PDF con al menos una palabra significativa en común
- **THEN** el sistema aplica el precio a las líneas que sí emparejaron, persiste el PDF como
  respaldo, y muestra una advertencia indicando cuántas líneas (de cuántas en total) no se
  pudieron relacionar automáticamente y deben capturarse manualmente

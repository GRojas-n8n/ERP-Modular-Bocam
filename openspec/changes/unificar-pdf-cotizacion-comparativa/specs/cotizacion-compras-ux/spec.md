## ADDED Requirements

### Requirement: El cuadro comparativo SHALL prepoblarse con los proveedores ya invitados
El sistema SHALL prepoblar la lista de proveedores, al crear o abrir por primera vez el cuadro comparativo de una requisición (botón "Iniciar comparativa"), con los proveedores que ya fueron invitados en la Solicitud de Cotización de esa misma requisición, sin requerir que Compras los vuelva a capturar manualmente. Compras SHALL poder seguir agregando proveedores adicionales del catálogo general para casos no cubiertos por la invitación original.

#### Scenario: Requisición con Solicitud de Cotización ya enviada a 3 proveedores
- **WHEN** Compras hace clic en "Iniciar comparativa" en una requisición cuya
  Solicitud de Cotización ya fue enviada a 3 proveedores
- **THEN** el cuadro comparativo se crea con esos 3 proveedores ya listados,
  listos para capturar o aplicar precios, sin que Compras tenga que agregarlos de
  nuevo

#### Scenario: Requisición sin Solicitud de Cotización previa
- **WHEN** Compras hace clic en "Iniciar comparativa" en una requisición que nunca
  tuvo una Solicitud de Cotización enviada
- **THEN** el cuadro comparativo se crea sin proveedores prepoblados, igual que el
  comportamiento actual, y Compras los agrega manualmente desde el catálogo

### Requirement: El PDF de cotización SHALL subirse y persistirse únicamente desde el cuadro comparativo
El cuadro comparativo (`ComparativaDetail`) SHALL ser el único lugar donde Compras
sube el PDF de cotización de un proveedor. Al aplicar una cotización extraída por
IA (botón "Aplicar cotización" sobre los renglones revisados), el sistema SHALL
persistir el archivo PDF original asociado a ese proveedor dentro del cuadro
comparativo, para que quede disponible como respaldo/auditoría independientemente
de futuras ediciones de precios.

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

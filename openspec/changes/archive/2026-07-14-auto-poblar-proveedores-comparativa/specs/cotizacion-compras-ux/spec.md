## MODIFIED Requirements

### Requirement: El cuadro comparativo SHALL prepoblarse con los proveedores ya invitados
El sistema SHALL prepoblar la lista de proveedores del cuadro comparativo de una
requisición, con los proveedores que ya fueron invitados en la Solicitud de Cotización de
esa misma requisición, sin requerir que Compras los vuelva a capturar manualmente. Esto
SHALL aplicar tanto al crear el cuadro por primera vez ("Iniciar comparativa") como al
reabrir un cuadro ya creado previamente ("Continuar comparativa"), incluyendo después de
recargar la página o de haber abandonado y vuelto a entrar en otra sesión. El prepoblado
SHALL conservar cualquier proveedor que ya tenga precios capturados en el cuadro (incluyendo
proveedores agregados manualmente del catálogo general que no estén en la Solicitud de
Cotización), sin descartarlos al fusionar con los invitados. Compras SHALL poder seguir
agregando proveedores adicionales del catálogo general para casos no cubiertos por la
invitación original, respetando el tope máximo de proveedores por cuadro.

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

#### Scenario: Compras reabre un cuadro ya creado ("Continuar comparativa") en una sesión nueva
- **WHEN** Compras hace clic en "Continuar comparativa" sobre una requisición cuyo cuadro ya
  fue creado anteriormente (en esta sesión o en una sesión previa, incluyendo tras recargar
  la página) y cuya Solicitud de Cotización tiene proveedores invitados
- **THEN** el cuadro se abre mostrando los proveedores invitados en la Solicitud de
  Cotización, sin que Compras tenga que volver a buscarlos y agregarlos manualmente desde el
  catálogo general

#### Scenario: Cuadro reabierto que ya tiene precios capturados para algunos proveedores
- **WHEN** Compras reabre un cuadro que ya tiene precios capturados (`ComparativaDetalle`)
  para 1 proveedor, y la Solicitud de Cotización de la misma requisición tiene 2 proveedores
  invitados adicionales sin precios capturados aún
- **THEN** el cuadro muestra los 3 proveedores: el que ya tiene precios capturados (sin
  perder su información) más los 2 invitados adicionales

#### Scenario: Falla la consulta de la Solicitud de Cotización al reabrir el cuadro
- **WHEN** Compras reabre un cuadro comparativo y la consulta a la Solicitud de Cotización
  de esa requisición falla (error de red o del servidor)
- **THEN** el cuadro se abre igualmente con los proveedores que ya tenía (los que cuentan
  con precios capturados), sin bloquear a Compras para seguir trabajando el cuadro

## ADDED Requirements

### Requirement: Las acciones críticas/irreversibles SHALL requerir confirmación explícita con el nombre del proyecto activo
El sistema SHALL mostrar un diálogo de confirmación, con el nombre del proyecto activo incluido
en el texto del diálogo, antes de ejecutar cualquiera de las siguientes acciones: aprobar una
Orden de Compra/Requisición, firmar una evaluación técnica/económica de Cuadro Comparativo, y
autorizar/pagar nómina. El sistema NO SHALL ejecutar estas acciones directamente desde el clic
inicial del botón sin pasar por el diálogo de confirmación.

#### Scenario: Usuario aprueba una requisición
- **WHEN** un usuario con permisos hace clic en "Aprobar" sobre una Requisición en el proyecto
  activo "Torre Corporativa Norte"
- **THEN** el sistema muestra un diálogo de confirmación que incluye el texto "Torre Corporativa
  Norte" antes de enviar la petición de aprobación al backend

#### Scenario: Usuario cancela la confirmación
- **WHEN** el diálogo de confirmación de una acción crítica está abierto
- **AND** el usuario hace clic en "Cancelar" o cierra el diálogo sin confirmar
- **THEN** el sistema NO SHALL ejecutar la acción ni enviar ninguna petición al backend

#### Scenario: Usuario firma una evaluación técnica/económica
- **WHEN** un usuario hace clic en "Firmar y Bloquear" sobre un Cuadro Comparativo del proyecto
  activo
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo y la
  advertencia de que el cuadro quedará bloqueado permanentemente, y solo procede si el usuario
  confirma explícitamente

#### Scenario: Usuario autoriza o paga nómina
- **WHEN** un usuario con permisos de nómina ejecuta la acción de autorizar o pagar una
  pre-nómina del proyecto activo
- **THEN** el sistema muestra el diálogo de confirmación con el nombre del proyecto activo antes
  de ejecutar la autorización/pago

### Requirement: La confirmación crítica SHALL usar un componente compartido, no implementaciones duplicadas por vista
El sistema SHALL implementar el diálogo de confirmación de acciones críticas como un componente
reutilizable expuesto desde `packages/ui-core`, consumido por cada vista que lo necesite, en vez
de que cada vista implemente su propio modal ad-hoc para el mismo propósito.

#### Scenario: Dos vistas distintas requieren confirmación crítica
- **WHEN** tanto la vista de Compras (aprobar OC) como la vista de Personal (pagar nómina)
  necesitan mostrar una confirmación crítica
- **THEN** ambas usan la misma implementación de componente de diálogo de `ui-core`, con
  distintos textos/props, no dos componentes de modal separados

### Requirement: Las acciones no destructivas NO SHALL requerir confirmación crítica
El sistema NO SHALL mostrar el diálogo de confirmación de acción crítica para navegación,
lectura de datos, filtros, exportación de reportes, ni formularios que aún no han sido enviados.

#### Scenario: Usuario navega o filtra sin confirmación
- **WHEN** un usuario cambia de vista, aplica un filtro, o exporta un reporte
- **THEN** el sistema NO SHALL mostrar ningún diálogo de confirmación de acción crítica

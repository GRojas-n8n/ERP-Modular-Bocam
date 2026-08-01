## ADDED Requirements

### Requirement: Filtrado del listado de empleados antes de seleccionar para credencial o QR
El sistema SHALL permitir a RH acotar, dentro del panel de selección de credenciales de Personal, el listado de empleados por: residente asignado vigente (relación empleado↔residente sin `fecha_fin`), cuadrilla o frente de trabajo, categoría del empleado (`categoria`), y texto libre sobre nombre/número de empleado. Los filtros SHALL combinarse con lógica AND y SHALL aplicarse sobre los empleados ya cargados en la vista (sin llamada adicional al backend). La selección de "todos" (checkbox maestro) SHALL operar solo sobre los empleados visibles tras aplicar los filtros activos, no sobre el total del proyecto.

#### Scenario: Filtrar por residente vigente
- **WHEN** RH elige un residente en el filtro
- **THEN** el listado seleccionable muestra únicamente empleados con una asignación a ese residente sin `fecha_fin` (vigente)

#### Scenario: Filtrar por cuadrilla o frente de trabajo
- **WHEN** RH elige una cuadrilla o un frente de trabajo en el filtro
- **THEN** el listado seleccionable muestra únicamente empleados con esa cuadrilla o con una `AsignacionFrente` activa a ese frente

#### Scenario: Filtrar por categoría
- **WHEN** RH elige una categoría (ej. OBRERO, TECNICO, SUPERVISOR, ADMINISTRATIVO) en el filtro
- **THEN** el listado seleccionable muestra únicamente empleados con esa `categoria`

#### Scenario: Filtrar por nombre o número de empleado
- **WHEN** RH escribe texto en el buscador del panel de selección
- **THEN** el listado seleccionable muestra únicamente empleados cuyo nombre completo o `numero_empleado` contienen ese texto (sin distinguir mayúsculas/minúsculas)

#### Scenario: Combinar varios filtros
- **WHEN** RH tiene activos dos o más filtros a la vez (ej. cuadrilla + categoría)
- **THEN** el listado seleccionable muestra únicamente empleados que cumplen TODOS los filtros activos simultáneamente

#### Scenario: "Seleccionar todos" respeta los filtros activos
- **WHEN** RH usa el control de "seleccionar todos" con uno o más filtros activos
- **THEN** solo se marcan como seleccionados los empleados actualmente visibles tras el filtrado, no el total de empleados del proyecto

### Requirement: Descarga de hoja de solo QR sobre la selección filtrada
El sistema SHALL ofrecer, además de "Imprimir credenciales", una acción independiente "Descargar QR" que genera una hoja imprimible con únicamente QR, nombre y número de empleado por cada empleado seleccionado — sin foto, reverso, ni datos de contacto de emergencia. Esta acción SHALL reutilizar el mismo endpoint `POST /api/v1/personal/empleados/credenciales/imprimir-lote` (mismo contrato, mismo criterio de elegibilidad por proyecto activo, misma emisión automática de credencial nueva para quien no tenga una activa) y SHALL codificar el QR como `BOCAM:CRED:{token}`, igual que la hoja de credencial completa.

#### Scenario: Descargar QR de la selección filtrada
- **WHEN** RH filtra el listado, selecciona uno o más empleados, y hace clic en "Descargar QR"
- **THEN** el sistema genera una hoja con un QR, nombre y número por cada empleado seleccionado, sin abrir la hoja de credencial completa

#### Scenario: Emisión automática de credencial al descargar QR
- **WHEN** RH descarga el QR de un empleado seleccionado que no tiene ninguna credencial activa
- **THEN** el sistema emite una credencial nueva para ese empleado (igual que en impresión de credenciales) antes de generar su QR

#### Scenario: Exclusión de empleados no elegibles del proyecto activo
- **WHEN** RH selecciona empleados para "Descargar QR" y alguno no es elegible del proyecto activo
- **THEN** el sistema genera la hoja únicamente con los empleados elegibles y notifica a RH cuántos fueron excluidos, con el mismo comportamiento de aviso que ya aplica a "Imprimir credenciales"

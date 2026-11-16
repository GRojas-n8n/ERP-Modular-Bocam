## ADDED Requirements

### Requirement: El smoke test SHALL verificar los guards de proyecto activo con el alcance de cada módulo declarado explícitamente
Con una sesión sin proyecto activo, el smoke post-deploy SHALL comprobar que los módulos project-scoped muestran el estado "Proyecto activo requerido" y que no salen peticiones project-scoped, salvo las excepciones tenant-scoped declaradas, que SHALL coincidir por método y ruta exactos (la query string no forma parte de la ruta) y nunca por prefijo. Para Ventas la única excepción es `GET /api/v1/ventas/clientes`.

#### Scenario: Clientes de Ventas se consulta sin proyecto
- **WHEN** el smoke abre Ventas con una sesión sin proyecto activo
- **THEN** Ventas no muestra "Proyecto activo requerido", muestra la pestaña Clientes y sale `GET /api/v1/ventas/clientes` (con o sin query string)

#### Scenario: Cotizaciones y Facturas siguen exigiendo proyecto
- **WHEN** el smoke abre las pestañas Cotizaciones y Facturas sin proyecto activo
- **THEN** cada una muestra el aviso "Selecciona un proyecto activo para consultar cotizaciones y facturas." y no sale ninguna petición a `/api/v1/ventas/cotizaciones` ni a `/api/v1/ventas/facturas`

#### Scenario: Una petición project-scoped no declarada hace fallar el smoke
- **WHEN** sin proyecto activo sale cualquier petición project-scoped distinta de la excepción exacta (otro método o ruta de Clientes, Cotizaciones, Facturas u otro módulo)
- **THEN** el smoke falla listando `MÉTODO /ruta` (sin query string)

#### Scenario: Módulos completamente bloqueados
- **WHEN** el smoke abre Gerencia Técnica, Compras, Almacén, Control de Obra, Residencia o Seguridad HSE sin proyecto activo
- **THEN** cada uno muestra "Proyecto activo requerido"

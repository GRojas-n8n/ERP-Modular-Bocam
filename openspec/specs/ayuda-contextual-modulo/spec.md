# ayuda-contextual-modulo Specification

## Purpose
Ofrecer, dentro de la app, ayuda contextual por módulo (botón `?` + panel lateral) que explique qué hace cada módulo del sidebar, sus roles típicos, su flujo de negocio end-to-end, con qué otros módulos se conecta y cómo, una sección por cada pestaña visible, y errores comunes con causa y solución — reemplazando la dependencia de `docs/manual-de-usuario.md`, que vive fuera de la app y se desactualiza en silencio.

## Requirements

### Requirement: Botón de ayuda por módulo
El sistema SHALL mostrar un botón de ayuda (`?`) en el encabezado de cada una de las vistas de módulo listadas en el sidebar (`ALL_NAV_ITEMS` de `Layout.tsx`), sin excluir ninguna por rol.

#### Scenario: Usuario ve el botón de ayuda en el módulo al que tiene acceso
- **WHEN** un usuario con rol autorizado navega a cualquier módulo del sidebar (ej. Almacén, Compras, Residencia)
- **THEN** el encabezado de esa vista muestra un botón de ayuda visible e identificable (ícono `?`, `aria-label` descriptivo)

### Requirement: Panel de ayuda con contenido estructurado del módulo
El sistema SHALL abrir, al hacer clic en el botón de ayuda de un módulo, un panel lateral con: qué hace el módulo, los roles típicos que lo usan, el flujo end-to-end del proceso de negocio, los módulos con los que se conecta (y el mecanismo: evento, backend-to-backend, etc.), una sección por cada pestaña visible en el sidebar de ese módulo, y una lista de errores comunes con causa y solución.

#### Scenario: Usuario abre la ayuda de un módulo con pestañas
- **WHEN** el usuario hace clic en el botón de ayuda de un módulo que tiene `subItems` en el nav (ej. Compras)
- **THEN** el panel muestra una sección de ayuda por cada `subItem` del nav de ese módulo, además del resumen general (qué hace, roles, flujo, conexiones) y los errores comunes

#### Scenario: Usuario abre la ayuda de un módulo sin pestañas
- **WHEN** el usuario hace clic en el botón de ayuda de un módulo sin `subItems` (ej. Ventas)
- **THEN** el panel muestra el resumen general y los errores comunes, sin fallar por ausencia de secciones

### Requirement: Sección activa expandida al abrir el panel
El sistema SHALL abrir el panel de ayuda con la sección correspondiente a la pestaña actualmente activa (`activeSubView`) ya expandida, dejando el resto de las secciones colapsadas pero navegables.

#### Scenario: Usuario abre la ayuda estando en una pestaña específica
- **WHEN** el usuario está en la pestaña "Movimientos" del módulo Almacén y hace clic en el botón de ayuda
- **THEN** el panel abre con la sección "Movimientos" expandida y las demás secciones (ej. "Inventario") colapsadas

#### Scenario: El viewId no tiene contenido de ayuda registrado
- **WHEN** el panel de ayuda se invoca con un `viewId` que no existe en el registro de contenido
- **THEN** el panel no lanza una excepción ni rompe el render de la vista (se degrada a un estado vacío o no se muestra)

### Requirement: Cobertura de ayuda contra el sidebar real
El sistema SHALL mantener, mediante una prueba automatizada, que todo `NavItem.id` y `SubItem.id` presente en `ALL_NAV_ITEMS` tenga contenido de ayuda correspondiente registrado, y que no exista contenido de ayuda para un módulo o pestaña que ya no exista en el sidebar.

#### Scenario: Se agrega una pestaña nueva al sidebar sin agregar su ayuda
- **WHEN** se agrega un `SubItem` nuevo a un `NavItem` en `ALL_NAV_ITEMS` sin crear su `HelpSection` correspondiente
- **THEN** la prueba de cobertura de ayuda falla, señalando el `id` faltante

#### Scenario: Se elimina una pestaña del sidebar sin eliminar su ayuda
- **WHEN** un `SubItem` se elimina de `ALL_NAV_ITEMS` pero su `HelpSection` permanece en el contenido de ayuda
- **THEN** la prueba de cobertura de ayuda falla, señalando la sección huérfana

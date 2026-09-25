## ADDED Requirements

### Requirement: Búsqueda por clave o descripción en la tabla de Control Presupuestal
El sistema SHALL permitir al usuario filtrar las filas de `ControlPresupuestalTabla` mediante un campo de búsqueda por clave o descripción de partida, combinado (AND) con el filtro de categoría existente, sin realizar una llamada adicional al backend.

#### Scenario: Búsqueda filtra por clave
- **WHEN** el usuario escribe un texto que coincide con la clave de una o más partidas en el campo de búsqueda de `ControlPresupuestalTabla`
- **THEN** la tabla muestra solo las filas cuya clave contiene ese texto (sin distinguir mayúsculas/minúsculas)

#### Scenario: Búsqueda filtra por descripción
- **WHEN** el usuario escribe un texto que no coincide con ninguna clave pero sí con la descripción de una o más partidas
- **THEN** la tabla muestra las filas cuya descripción contiene ese texto

#### Scenario: Búsqueda y filtro de categoría se combinan
- **WHEN** el usuario tiene seleccionada una categoría distinta de "TODAS" y además escribe un término de búsqueda
- **THEN** la tabla muestra solo las filas que cumplen ambos criterios a la vez

#### Scenario: Fila "[Sin partida]" respeta la búsqueda
- **WHEN** hay montos sin `concepto_id` (fila "[Sin partida]") y el usuario tiene un término de búsqueda activo que no coincide con "sin partida"
- **THEN** la fila "[Sin partida]" no se muestra

#### Scenario: Sin resultados
- **WHEN** ningún registro coincide con la combinación de búsqueda y categoría seleccionada
- **THEN** la tabla muestra un estado vacío indicando que no hay partidas que coincidan con el filtro

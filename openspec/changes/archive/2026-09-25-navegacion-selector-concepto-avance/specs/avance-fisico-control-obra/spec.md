## ADDED Requirements

### Requirement: Navegación de teclado en el selector de concepto de Registrar Avance
El sistema SHALL permitir resaltar y confirmar un concepto en el selector del panel "Registrar Avance" usando teclado: `ArrowDown`/`ArrowUp` mueven el resaltado entre las opciones de la lista actualmente filtrada (sin wrap-around), y `Enter` confirma la opción resaltada.

#### Scenario: Resaltar la siguiente opción
- **WHEN** el usuario tiene el selector de concepto abierto y presiona `ArrowDown`
- **THEN** el sistema resalta la siguiente opción de la lista filtrada visible

#### Scenario: Confirmar la opción resaltada
- **WHEN** el usuario tiene una opción resaltada en el selector y presiona `Enter`
- **THEN** el sistema selecciona ese concepto, igual que si el usuario hubiera hecho clic en él

#### Scenario: Sin wrap-around en los límites
- **WHEN** la primera opción está resaltada y el usuario presiona `ArrowUp`, o la última opción está resaltada y presiona `ArrowDown`
- **THEN** el resaltado no cambia

#### Scenario: La navegación respeta el filtro de búsqueda activo
- **WHEN** el usuario tiene un término de búsqueda que reduce la lista a un subconjunto, y navega con las flechas
- **THEN** el resaltado se mueve solo dentro del subconjunto filtrado visible

### Requirement: Conceptos recientes en el selector de Registrar Avance
El sistema SHALL mostrar, cuando el campo de búsqueda del selector de concepto está vacío, hasta 5 conceptos seleccionados recientemente durante la sesión actual del panel "Registrar Avance" (más reciente primero), antes de mostrar la lista completa del catálogo.

#### Scenario: Concepto recién usado aparece en recientes
- **WHEN** el usuario confirma un avance para un concepto y el panel permanece abierto para capturar otro avance
- **THEN** al abrir el selector de concepto de nuevo con el campo de búsqueda vacío, ese concepto aparece en la sección "Recientes"

#### Scenario: Escribir en la búsqueda oculta los recientes
- **WHEN** el usuario escribe un texto en el campo de búsqueda del selector
- **THEN** el sistema muestra el filtrado normal por texto, sin la sección "Recientes"

#### Scenario: Sin recientes al abrir el panel por primera vez en la sesión
- **WHEN** el usuario abre el panel "Registrar Avance" y no ha confirmado ningún avance todavía en esta sesión del panel
- **THEN** el selector muestra la lista completa del catálogo filtrada, sin sección "Recientes"

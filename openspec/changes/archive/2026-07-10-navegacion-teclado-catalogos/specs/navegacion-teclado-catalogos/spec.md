## ADDED Requirements

### Requirement: El panel de detalle SHALL navegar al renglón anterior o siguiente con las flechas del teclado
Mientras un panel de detalle (fichas técnicas de insumo, take-off/APU de concepto, o saldo de partida) esté abierto, el sistema SHALL escuchar las teclas `ArrowUp` y `ArrowDown` y, al presionarlas, SHALL reemplazar el contenido del panel por el renglón anterior o siguiente del listado actualmente filtrado, sin cerrar el panel.

#### Scenario: Avanzar al siguiente renglón
- **WHEN** el panel de fichas técnicas está abierto sobre el insumo en la posición N de la lista filtrada, y el usuario presiona `ArrowDown`
- **THEN** el panel muestra el insumo en la posición N+1 sin que el usuario tenga que cerrar el panel ni volver a hacer clic en la tabla

#### Scenario: Retroceder al renglón anterior
- **WHEN** el panel está abierto sobre el renglón en la posición N, y el usuario presiona `ArrowUp`
- **THEN** el panel muestra el renglón en la posición N-1

#### Scenario: Navegación respeta el filtro activo
- **WHEN** el usuario tiene un filtro de búsqueda activo que reduce el listado a un subconjunto, y navega con las flechas
- **THEN** la navegación se mueve solo dentro del subconjunto filtrado visible, no sobre el catálogo completo sin filtrar

### Requirement: La navegación SHALL detenerse en los límites de la lista sin dar la vuelta
En el primer renglón de la lista, `ArrowUp` SHALL no hacer nada; en el último renglón, `ArrowDown` SHALL no hacer nada (sin wrap-around al otro extremo).

#### Scenario: Límite superior
- **WHEN** el panel muestra el primer renglón de la lista y el usuario presiona `ArrowUp`
- **THEN** el panel no cambia de contenido

#### Scenario: Límite inferior
- **WHEN** el panel muestra el último renglón de la lista y el usuario presiona `ArrowDown`
- **THEN** el panel no cambia de contenido

### Requirement: Las flechas NO SHALL interceptarse cuando el foco está en un campo de texto
Si el elemento con foco es un `input`, `textarea` o `select` dentro del panel (ej. un buscador), las teclas `ArrowUp`/`ArrowDown` SHALL preservar su comportamiento nativo (mover el cursor o el valor del select) en vez de navegar entre renglones.

#### Scenario: Usuario escribiendo en un buscador dentro del panel
- **WHEN** el foco está en un input de texto dentro del panel y el usuario presiona `ArrowUp` o `ArrowDown`
- **THEN** el cursor se mueve dentro del campo de texto como es comportamiento nativo del navegador, y el panel NO cambia de renglón

# visibilidad-acciones-guardar-adjuntar Specification

## Purpose

Los botones de "Guardar" y las zonas de "Subir PDF / adjuntar archivo" del
app-shell tienen contraste suficiente para ser claramente visibles en tema
claro y oscuro, con un estilo consistente entre vistas.

## Requirements

### Requirement: El botón "Guardar" SHALL ser visible en tema claro y oscuro
Todo botón que confirme el guardado de un formulario o registro en el app-shell
(texto "Guardar" o equivalente de confirmación de guardado) SHALL usar fondo
verde sólido `#059669` con texto blanco (`#ffffff`) en estado habilitado, y
`#047857` en `hover`. El botón NO SHALL depender de opacidad reducida ni de
tintes de color por debajo del 100% de opacidad de fondo para su estado
habilitado normal.

#### Scenario: Usuario ve el botón "Guardar" en tema claro
- **WHEN** el usuario abre un formulario con botón "Guardar" habilitado con la
  app en tema claro
- **THEN** el botón se distingue claramente del fondo de la página y de la
  tarjeta/panel que lo contiene, con fondo verde sólido y texto blanco legible

#### Scenario: Usuario ve el botón "Guardar" en tema oscuro
- **WHEN** el usuario abre el mismo formulario con la app en tema oscuro
- **THEN** el botón mantiene el mismo fondo verde sólido y texto blanco,
  distinguiéndose igual de claramente del fondo oscuro de la página/tarjeta

#### Scenario: Botón "Guardar" en estado deshabilitado
- **WHEN** el formulario no cumple las condiciones para guardar (ej. campos
  requeridos vacíos) y el botón está deshabilitado
- **THEN** el botón puede reducir opacidad o cambiar de color para comunicar el
  estado deshabilitado, siempre que el estado habilitado normal no use esa
  misma reducción de opacidad

### Requirement: La zona de "Subir PDF / adjuntar" SHALL ser visible en tema claro y oscuro
Toda zona de arrastrar-y-soltar o botón para adjuntar/subir un archivo PDF en el
app-shell SHALL usar borde punteado verde y texto verde oscuro reales (no gris
sobre gris ni un tinte de color con opacidad de fondo menor al 10%), con un
fondo de tinte verde suave perceptible sobre el fondo de página o tarjeta que lo
contiene.

#### Scenario: Usuario ve la zona de subir PDF en tema claro
- **WHEN** el usuario abre una vista con una zona de "Subir PDF" o "adjuntar
  archivo" en tema claro, sin archivo aún cargado
- **THEN** el borde punteado y el texto de la zona son claramente visibles
  contra el fondo de la página, no solo perceptibles al pasar el mouse

#### Scenario: Usuario ve la zona de subir PDF en tema oscuro
- **WHEN** el usuario abre la misma vista en tema oscuro
- **THEN** el borde punteado y el texto mantienen contraste suficiente contra
  el fondo oscuro de la página o tarjeta

### Requirement: El mismo estilo de "Guardar" y de "Subir PDF" SHALL ser consistente entre vistas
Todas las vistas del app-shell que contengan un botón de "Guardar" o una zona de
"Subir PDF/adjuntar" SHALL usar exactamente el mismo par de estilos (colores,
bordes, pesos de texto) definidos en este spec, sin variaciones de tono por
vista.

#### Scenario: Usuario navega entre distintas vistas con botón "Guardar"
- **WHEN** el usuario guarda un registro en Comparativa, Compras, Admin,
  Calidad, Master, Insumos o Personal
- **THEN** el botón "Guardar" se ve visualmente idéntico (mismo verde, mismo
  texto blanco) en todas esas vistas

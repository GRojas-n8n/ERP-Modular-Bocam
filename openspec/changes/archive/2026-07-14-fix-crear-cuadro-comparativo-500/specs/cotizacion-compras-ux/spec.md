## ADDED Requirements

### Requirement: La creación del Cuadro Comparativo SHALL tolerar el rango completo de longitud de marca/modelo de la requisición
El sistema SHALL crear el Cuadro Comparativo correctamente para cualquier ítem cuya
`especificacion_marca_modelo` use el rango completo permitido en la requisición (hasta 200
caracteres), sin fallar por límite de longitud de columna. Si la creación del cuadro falla
por cualquier motivo, el sistema SHALL informar el error explícitamente a Compras y NO SHALL
abrir una vista de cuadro comparativo que no fue persistido en el backend.

#### Scenario: Ítem con marca/modelo de más de 100 caracteres
- **WHEN** Compras crea el Cuadro Comparativo de una requisición cuyo ítem tiene
  `especificacion_marca_modelo` de entre 101 y 200 caracteres
- **THEN** el cuadro se crea correctamente, con esa marca/modelo completa (sin truncar)
  visible en el panel de "Detalles técnicos"

#### Scenario: Falla la creación del cuadro por cualquier motivo
- **WHEN** Compras hace clic en "Crear Cuadro Comparativo" y la llamada al backend falla
- **THEN** el sistema muestra un mensaje de error explícito y Compras permanece en la lista
  de requisiciones — no se abre ningún cuadro comparativo local no persistido

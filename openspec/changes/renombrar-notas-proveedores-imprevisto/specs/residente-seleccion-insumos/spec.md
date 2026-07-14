## MODIFIED Requirements

### Requirement: El campo común de notas de la requisición SHALL identificarse como visible para proveedores en todos los tipos de requisición

En el formulario "Nueva Requisición" de ResidenciaView, el campo común de notas
(`reqNotas`, persistido como `observaciones` de la requisición) SHALL mostrarse con la
etiqueta "Notas para Proveedores", el placeholder orientado a proveedores y la leyenda
"Se verán en la Solicitud de Cotización y pueden llegar a los proveedores." para TODOS
los tipos de requisición, incluido IMPREVISTO — nunca como "Justificación". La
justificación interna del imprevisto se captura exclusivamente en el campo obligatorio
por ítem (`item.justificacion`), que no cambia.

#### Scenario: Requisición imprevista muestra el campo como notas para proveedores

- **WHEN** el Residente crea una requisición de tipo IMPREVISTO
- **THEN** el campo común de notas se titula "Notas para Proveedores" (no
  "Justificación"), su placeholder es el mismo que en los demás tipos y la leyenda de
  advertencia sobre visibilidad ante proveedores es visible

#### Scenario: Requisición normal conserva su etiqueta

- **WHEN** el Residente crea una requisición de tipo distinto a IMPREVISTO
- **THEN** el campo se sigue mostrando como "Notas para Proveedores" con su leyenda de
  advertencia, sin cambios respecto al comportamiento previo

#### Scenario: La justificación interna por ítem sigue siendo obligatoria

- **WHEN** el Residente intenta enviar una requisición IMPREVISTO con algún ítem sin
  texto en su campo "Justificación *"
- **THEN** el envío se bloquea con el error de justificación requerida por ítem
  (comportamiento existente, sin cambios)

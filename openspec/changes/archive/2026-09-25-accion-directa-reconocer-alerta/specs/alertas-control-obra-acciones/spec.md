## ADDED Requirements

### Requirement: Reconocer una alerta activa en un clic
El sistema SHALL permitir reconocer una alerta activa en la pestaña "Alertas" de `ControlObraView` con un solo clic en el botón "Reconocer", sin abrir ningún modal ni requerir ningún dato adicional, enviando `PATCH /api/v1/control-proyectos/alertas/:id/reconocer` con `nota_cp` vacío.

#### Scenario: Reconocer sin nota en un clic
- **WHEN** el usuario hace clic en "Reconocer" sobre una alerta con `estado = 'ACTIVA'`
- **THEN** el sistema envía el `PATCH` correspondiente sin abrir ningún modal, y la alerta deja de mostrarse como activa una vez confirmada la respuesta

#### Scenario: Retroalimentación mientras se procesa
- **WHEN** el usuario hace clic en "Reconocer" y la petición está en curso
- **THEN** el botón de esa alerta muestra un estado de carga, sin bloquear las acciones de otras alertas en la lista

### Requirement: Reconocer con nota sigue disponible como acción secundaria
El sistema SHALL ofrecer, junto al botón "Reconocer", una acción secundaria "Agregar nota" que abre un modal para reconocer la alerta con una nota opcional para el expediente, preservando el comportamiento existente de captura de nota al reconocer.

#### Scenario: Reconocer con nota desde la acción secundaria
- **WHEN** el usuario hace clic en "Agregar nota" sobre una alerta activa
- **THEN** el sistema abre un modal donde puede escribir una nota opcional y confirmar el reconocimiento con esa nota incluida en el `PATCH`

### Requirement: Ignorar una alerta requiere justificación (sin cambios de comportamiento)
El sistema SHALL seguir exigiendo una justificación de al menos 20 caracteres para ignorar una alerta activa, mediante el modal existente, sin ofrecer un camino de un clic para esta acción.

#### Scenario: Ignorar sigue requiriendo el modal y la justificación mínima
- **WHEN** el usuario hace clic en "Ignorar" sobre una alerta activa
- **THEN** el sistema abre el modal con el campo de justificación obligatoria, y el botón de confirmación permanece deshabilitado mientras la nota tenga menos de 20 caracteres

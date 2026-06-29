## ADDED Requirements

### Requirement: NC detail panel con causa raíz editable y acciones correctivas

El sistema SHALL ampliar el panel de detalle de NC en `CalidadView.tsx` para mostrar una sección "Causa Raíz" editable y una sección "Acciones Correctivas" con lista de acciones, formulario de nueva acción y botones de cambio de estado por acción.

#### Scenario: Sección Causa Raíz visible y editable
- **WHEN** el usuario abre el detalle de una NC
- **THEN** se muestra una sección "Causa Raíz" con el texto actual (o placeholder si vacío) y un botón "Editar"
- **WHEN** el usuario hace clic en "Editar" y escribe la causa raíz
- **THEN** se llama `PATCH /api/v1/calidad/no-conformidades/:id` con `{ causa_raiz }` y se actualiza la sección

#### Scenario: Sección Acciones Correctivas lista existentes
- **WHEN** el usuario abre el detalle de NC
- **THEN** se listan todas las `AccionCorrectiva` de la NC con: descripción, responsable, fecha compromiso, estado (badge coloreado)

#### Scenario: Agregar nueva acción correctiva desde detail
- **WHEN** el usuario hace clic en "+ Agregar acción"
- **THEN** aparece formulario inline con campos descripción, responsable y fecha compromiso
- **WHEN** confirma
- **THEN** llama `POST /api/v1/calidad/no-conformidades/:id/acciones` y recarga la lista

#### Scenario: Cambiar estado de acción desde detail
- **WHEN** el usuario hace clic en el estado de una acción (badge clicable)
- **THEN** aparece selector con los estados disponibles (PENDIENTE, EN_PROCESO, COMPLETADA, VERIFICADA, CANCELADA)
- **WHEN** selecciona nuevo estado
- **THEN** llama `PATCH /api/v1/calidad/no-conformidades/:id/acciones/:aid` con `{ estado }`

#### Scenario: Indicador visual de NC vencida
- **WHEN** la NC tiene `fecha_limite` pasada y estado ≠ CERRADA
- **THEN** el header del detalle muestra un badge rojo "VENCIDA" junto al código de la NC

#### Scenario: Botones de workflow muestran precondición no cumplida
- **WHEN** el usuario intenta hacer clic en un botón de transición cuya precondición no se cumple (ej. "Pasar a EN_VERIFICACION" sin acciones completadas)
- **THEN** el botón está deshabilitado con tooltip explicativo ("Requiere al menos 1 acción COMPLETADA")

### Requirement: Auditoría detail panel con workflow y conversión hallazgo→NC

El sistema SHALL ampliar el panel de detalle de auditoría para mostrar botones de cambio de estado de la auditoría, estado editable por hallazgo y botón "Convertir a NC" en cada hallazgo.

#### Scenario: Botones de transición de estado de auditoría
- **WHEN** el usuario abre el detalle de una auditoría en estado `PROGRAMADA`
- **THEN** aparece botón "Iniciar auditoría" que llama `PATCH /calidad/auditorias/:id` con `{ estado: "EN_CURSO" }`
- **WHEN** la auditoría está en `EN_CURSO`
- **THEN** aparece botón "Completar auditoría" que llama PATCH con `{ estado: "COMPLETADA" }`

#### Scenario: Estado de hallazgo editable inline
- **WHEN** el usuario hace clic en el estado de un hallazgo dentro del detalle de auditoría
- **THEN** aparece selector (ABIERTO, EN_SEGUIMIENTO, CERRADO)
- **WHEN** selecciona nuevo estado
- **THEN** llama `PATCH /calidad/auditorias/:id/hallazgos/:hid` con `{ estado }`

#### Scenario: Botón "Convertir a NC" en hallazgo sin NC
- **WHEN** un hallazgo no tiene `nc_id` asignado
- **THEN** aparece botón "→ Crear NC" junto al hallazgo
- **WHEN** el usuario hace clic y confirma
- **THEN** llama `POST /calidad/auditorias/:id/hallazgos/:hid/crear-nc` y el botón se reemplaza por el código de la NC creada con enlace a la vista de NCs

#### Scenario: Hallazgo ya convertido muestra enlace a NC
- **WHEN** el hallazgo tiene `nc_id` asignado
- **THEN** muestra badge "NC: NC-2026-XXX" (en lugar del botón) que navega al tab de NCs filtrado por ese código

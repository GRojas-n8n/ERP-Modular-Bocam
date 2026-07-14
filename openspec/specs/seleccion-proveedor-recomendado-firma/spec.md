## Requirements

### Requirement: La segunda opción de proveedor SHALL pertenecer al cuadro comparativo
El sistema SHALL rechazar un `segunda_opcion_proveedor_id` que no participe
en el cuadro comparativo (sin `ComparativaDetalle` para ese proveedor en ese
cuadro), con el mismo criterio que ya aplica a la primera opción.

#### Scenario: Segunda opción con proveedor ajeno al cuadro
- **WHEN** se llama `PUT .../seleccion` con `segunda_opcion_proveedor_id` de
  un proveedor que no cotizó en ese cuadro
- **THEN** el sistema responde 400 y no persiste la selección

#### Scenario: Segunda opción vacía sigue siendo válida
- **WHEN** se llama `PUT .../seleccion` sin `segunda_opcion_proveedor_id`
- **THEN** el sistema guarda la selección con `segunda_opcion_proveedor_id: null`,
  sin exigirla

### Requirement: La segunda opción SHALL ser distinta de la primera
El sistema SHALL rechazar una selección donde `segunda_opcion_proveedor_id`
sea igual a `primera_opcion_proveedor_id`.

#### Scenario: Mismo proveedor en ambas opciones
- **WHEN** se llama `PUT .../seleccion` con el mismo `id` en
  `primera_opcion_proveedor_id` y `segunda_opcion_proveedor_id`
- **THEN** el sistema responde 400 y no persiste la selección

### Requirement: La firma SHALL rechazar una segunda opción con renglones NC o "?"
El sistema SHALL verificar, al firmar, que la `segunda_opcion_proveedor_id`
guardada (si existe) no tenga renglones evaluados como `NC` ni `?` — igual
que ya exige para la primera opción.

#### Scenario: Segunda opción con un renglón NC
- **WHEN** se firma un cuadro cuya `segunda_opcion_proveedor_id` tiene al
  menos un renglón `NC`
- **THEN** el sistema responde 400 `SEGUNDA_OPCION_INVALIDA_NC` y no firma
  el cuadro

#### Scenario: Cuadro sin segunda opción no se ve afectado
- **WHEN** se firma un cuadro sin `segunda_opcion_proveedor_id`
- **THEN** la firma procede sin evaluar esta regla, igual que hoy

### Requirement: El botón de firma SHALL permanecer deshabilitado sin selección de proveedor guardada
La interfaz SHALL exigir `primera_opcion_proveedor_id` guardado (además del
veredicto y los proveedores sugeridos ya requeridos) antes de habilitar la
acción de firmar, para no depender del rechazo del backend como única
validación.

#### Scenario: Veredicto completo pero sin selección guardada
- **WHEN** el Residente completó el veredicto y los proveedores sugeridos,
  pero no guardó ninguna selección de 1ª opción
- **THEN** el botón de firma permanece deshabilitado

#### Scenario: Selección, veredicto y sugeridos completos
- **WHEN** el Residente guardó 1ª opción, escribió el veredicto y seleccionó
  al menos un proveedor sugerido, y todos los renglones están evaluados sin
  `PENDIENTE` ni `?`
- **THEN** el botón de firma se habilita

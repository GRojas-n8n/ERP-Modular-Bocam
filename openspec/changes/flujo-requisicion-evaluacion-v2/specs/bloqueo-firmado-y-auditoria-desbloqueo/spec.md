## ADDED Requirements

### Requirement: Firma del Residente transiciona el cuadro a FIRMADO_BLOQUEADO

Cuando el Residente confirma la firma (modal de confirmación con checkbox), el sistema SHALL:
1. Guardar veredicto y proveedores sugeridos
2. Registrar `firmado_por` (userId), `fecha_firma` (timestamp)
3. Transicionar el cuadro a estado `FIRMADO_BLOQUEADO`
4. Impedir cualquier modificación al cuadro (renglones, precios, proveedores, evaluaciones)

#### Scenario: Cuadro pasa a FIRMADO_BLOQUEADO al confirmar firma

- **WHEN** el Residente confirma la firma en el modal de confirmación
- **THEN** el cuadro transiciona a `FIRMADO_BLOQUEADO`
- **THEN** todos los campos del cuadro y la tabla de cotizaciones pasan a modo solo lectura para todos los roles excepto admin (que puede desbloquear)
- **THEN** el stepper muestra el paso de evaluación como completado con fecha/hora de firma

#### Scenario: Modal de confirmación requiere acción consciente

- **WHEN** el Residente hace clic en "Firmar y Bloquear"
- **THEN** se muestra un modal con el texto: "Al firmar, este cuadro quedará bloqueado permanentemente. Solo el administrador podrá desbloquearlo. ¿Confirmas?"
- **THEN** el Residente debe marcar un checkbox y hacer clic en "Confirmar firma" para proceder

### Requirement: Solo el administrador puede desbloquear un cuadro FIRMADO_BLOQUEADO

El sistema SHALL restringir el desbloqueo de un cuadro `FIRMADO_BLOQUEADO` exclusivamente a usuarios con rol `admin`. Cualquier intento de modificar el cuadro desde otro rol SHALL ser rechazado con `403`.

#### Scenario: Admin ve botón de desbloqueo

- **WHEN** un usuario con rol `admin` abre un cuadro en estado `FIRMADO_BLOQUEADO`
- **THEN** ve un botón "Desbloquear" con tono destructivo (rojo)
- **THEN** ningún otro rol ve ese botón

#### Scenario: Intento de modificación por rol no-admin rechazado

- **WHEN** un usuario sin rol `admin` intenta modificar un cuadro `FIRMADO_BLOQUEADO` vía API
- **THEN** el backend responde `403 Forbidden`

### Requirement: Desbloqueo por admin genera registro de auditoría obligatorio

Al desbloquear un cuadro, el sistema SHALL requerir que el admin ingrese una justificación (texto libre, obligatorio, mínimo 10 caracteres). El desbloqueo genera un registro en `auditoria_desbloqueo_comparativa` con: cuadro_id, admin_id, timestamp exacto (UTC), justificación. El cuadro regresa a estado `EN_EVALUACION_TECNICA`.

#### Scenario: Admin debe ingresar justificación para desbloquear

- **WHEN** el admin hace clic en "Desbloquear"
- **THEN** se muestra un modal con un campo de texto "Justificación del desbloqueo (obligatorio)"
- **THEN** el botón de confirmar permanece deshabilitado hasta que el campo tenga al menos 10 caracteres

#### Scenario: Registro de auditoría creado al desbloquear

- **WHEN** el admin confirma el desbloqueo con justificación
- **THEN** se crea un registro en `auditoria_desbloqueo_comparativa` con: `desbloqueado_por` (admin userId), `timestamp_desbloqueo` (UTC exacto), `justificacion` (texto ingresado)
- **THEN** el cuadro regresa a estado `EN_EVALUACION_TECNICA`
- **THEN** se muestra notificación: "Cuadro desbloqueado. El Residente puede re-evaluar."

#### Scenario: Historial de desbloqueos visible en el cuadro

- **WHEN** un usuario con rol `admin` abre un cuadro que ha sido desbloqueado al menos una vez
- **THEN** ve una sección "Historial de desbloqueos" con: fecha/hora, nombre del admin que desbloqueó, y justificación

#### Scenario: Múltiples desbloqueos generan múltiples registros

- **WHEN** un cuadro es firmado, desbloqueado, re-firmado y vuelto a desbloquear
- **THEN** existen dos registros en `auditoria_desbloqueo_comparativa` para ese cuadro, cada uno con su propio timestamp y justificación

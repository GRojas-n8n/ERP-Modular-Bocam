# Spec: Control de Versiones

## Criterios de Aceptación

### CA-1 — Crear nueva versión (con upload de archivo)
- `POST /api/v1/calidad/documentos/:id/versiones` acepta `multipart/form-data`.
- Campos requeridos en el body: `numero_version` (string, ej. `"1.0"`), `cambios` (string).
- Campo opcional: archivo adjunto (campo `archivo` en el form).
- El `numero_version` debe ser único dentro del documento. Si ya existe → `409`.
- No se puede crear una versión nueva si ya existe una en estado `EN_REVISION` para el mismo documento → `409` con mensaje "Ya existe una versión en revisión".
- Si se adjunta archivo, se valida tipo y tamaño antes de guardar (ver spec almacenamiento-archivos).
- Al crear, la versión queda en estado `BORRADOR`.
- Se actualiza `version_actual` del documento padre al `numero_version` de la nueva versión.
- `creado_por` se lee del JWT.

### CA-2 — Transición BORRADOR → EN_REVISION
- `PATCH /documentos/:id/versiones/:vid/estado` con body `{ "accion": "enviar_revision" }`.
- Solo válido si el estado actual es `BORRADOR`.
- No se puede enviar a revisión si no tiene archivo adjunto (`archivo_ruta` es null) → `422` con mensaje "La versión debe tener un archivo adjunto antes de enviarse a revisión".
- Al transicionar: `estado = EN_REVISION`, `revisado_por = userId del JWT`.

### CA-3 — Transición EN_REVISION → VIGENTE (aprobación)
- `PATCH /documentos/:id/versiones/:vid/estado` con body `{ "accion": "aprobar" }`.
- Solo válido si el estado actual es `EN_REVISION`.
- **Operación atómica en una sola transacción:**
  1. La versión aprobada pasa a `VIGENTE`, se registra `aprobado_por`, `fecha_emision = now()`.
  2. Cualquier otra versión del mismo documento que esté en `VIGENTE` pasa a `OBSOLETO`, se registra `fecha_obsoleto = now()`.
  3. Se actualiza `estado_actual = VIGENTE` y `version_actual = numero_version` en el documento padre.
- Si la operación atómica falla → rollback completo, `500`.

### CA-4 — Transición EN_REVISION → BORRADOR (rechazo)
- `PATCH /documentos/:id/versiones/:vid/estado` con body `{ "accion": "rechazar" }`.
- Solo válido si el estado actual es `EN_REVISION`.
- Al rechazar: `estado = BORRADOR`, se limpia `revisado_por`.
- El documento padre no cambia de estado (puede que haya otra versión VIGENTE).

### CA-5 — Transición VIGENTE → OBSOLETO (obsolescencia manual)
- `PATCH /documentos/:id/versiones/:vid/estado` con body `{ "accion": "obsoleto" }`.
- Solo válido si el estado actual es `VIGENTE`.
- Al marcar como obsoleto: `estado = OBSOLETO`, `fecha_obsoleto = now()`.
- Se actualiza `estado_actual = OBSOLETO` en el documento padre (si era la versión actual).
- **Advertencia:** esta acción deja el documento sin versión vigente. El frontend debe mostrar confirmación.

### CA-6 — Transición inválida
- Cualquier transición no contemplada en CA-2 a CA-5 → `400` con mensaje que describe el estado actual y las transiciones válidas.

### CA-7 — Historial de versiones en orden
- El array `versiones` en el detalle del documento se ordena por `created_at DESC` (más reciente primero).

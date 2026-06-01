# Spec: Gestión de Documentos

## Criterios de Aceptación

### CA-1 — Crear documento
- El usuario con rol `calidad` o `admin` puede crear un documento proporcionando: `codigo`, `titulo`, `tipo`, y `responsable_id`.
- El campo `descripcion` y `proyecto_id` son opcionales.
- El `codigo` debe ser único dentro del tenant. Si ya existe, el backend responde `409`.
- El `tipo` debe ser uno de: `PLANO`, `PROCEDIMIENTO`, `INSTRUCTIVO`, `ESPECIFICACION`, `MANUAL`, `REGISTRO`, `OTRO`.
- Al crear, el documento queda en estado `BORRADOR` y sin `version_actual`.
- `tenant_id` se lee del JWT, nunca del body.

### CA-2 — Listar documentos
- `GET /api/v1/calidad/documentos` retorna todos los documentos del tenant activo.
- Soporta filtros opcionales por query string: `tipo`, `estado`, `q` (búsqueda en `codigo` y `titulo`).
- La respuesta incluye para cada documento: `id_documento`, `codigo`, `titulo`, `tipo`, `estado_actual`, `version_actual`, `responsable_id`, `created_at`.
- Usuarios con rol `superintendent` tienen acceso de solo lectura (pueden listar y ver detalle, no crear/editar).

### CA-3 — Detalle de documento
- `GET /api/v1/calidad/documentos/:id` retorna el documento con el array completo de versiones.
- Cada versión incluye: `id_version`, `numero_version`, `estado`, `cambios`, `archivo_nombre`, `archivo_tamano`, `archivo_mime`, `creado_por`, `revisado_por`, `aprobado_por`, `fecha_emision`, `created_at`.
- Si el documento no existe en el tenant del JWT → `404`.

### CA-4 — Actualizar metadatos
- `PATCH /api/v1/calidad/documentos/:id` permite actualizar: `titulo`, `descripcion`, `responsable_id`, `proyecto_id`.
- No se permite cambiar `codigo` ni `tipo` después de creado (son inmutables).
- Si el documento no existe en el tenant → `404`.

### CA-5 — Eliminar documento
- `DELETE /api/v1/calidad/documentos/:id` elimina el documento y en cascada todas sus versiones.
- Solo se permite eliminar si **ninguna** versión está en estado `VIGENTE` o `EN_REVISION`.
- Si tiene versiones en esos estados → `409` con mensaje claro.
- Si el documento no existe → `404`.

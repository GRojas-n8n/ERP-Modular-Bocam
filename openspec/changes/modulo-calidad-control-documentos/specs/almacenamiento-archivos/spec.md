# Spec: Almacenamiento de Archivos

## Criterios de Aceptación

### CA-1 — Tipos de archivo permitidos
- El backend acepta únicamente: `.pdf`, `.dwg`, `.dxf`, `.docx`, `.xlsx`, `.png`, `.jpg`, `.jpeg`.
- Validación por extensión del nombre original Y por MIME type.
- Si el tipo no está permitido → `400` con mensaje "Tipo de archivo no permitido: {mime}".

### CA-2 — Límite de tamaño
- Tamaño máximo por archivo: **50 MB**.
- Si el archivo supera el límite → `400` con mensaje "El archivo supera el límite de 50 MB".
- El nginx de app-shell debe tener `client_max_body_size 55m` para el bloque `/api/v1/calidad/`.

### CA-3 — Almacenamiento en volumen
- El archivo se guarda en la ruta: `/data/calidad/uploads/{tenant_id}/{documento_id}/{version_id}{extension}`
- El directorio se crea si no existe (`mkdir -p` equivalente).
- Si el guardado del archivo falla → no se crea el registro en BD → `500`.
- Si el registro en BD falla después de guardar el archivo → el archivo se elimina del disco → `500` limpio.

### CA-4 — Descarga autenticada
- `GET /api/v1/calidad/documentos/:id/versiones/:vid/archivo` requiere JWT válido.
- El backend verifica que `documento.tenant_id === jwt.tenantId` antes de servir el archivo.
- Si la versión no tiene archivo (`archivo_ruta` es null) → `404` con mensaje "Esta versión no tiene archivo adjunto".
- Si el archivo no existe en el disco (inconsistencia) → `500` con mensaje de error.
- La respuesta incluye:
  - `Content-Disposition: attachment; filename="{archivo_nombre}"`
  - `Content-Type: {archivo_mime}`
  - `Content-Length: {archivo_tamano}`
- El archivo se sirve como stream con `res.sendFile()`.

### CA-5 — Nombre de archivo en BD
- Se guarda el nombre original del archivo (`originalname` de multer) en `archivo_nombre`.
- La `archivo_ruta` almacenada es **relativa** al volumen: `{tenant_id}/{documento_id}/{version_id}{ext}`.
- Nunca se almacena la ruta absoluta (`/data/calidad/uploads/`).

### CA-6 — Reemplazo de archivo en versión BORRADOR
- Si una versión en estado `BORRADOR` ya tiene archivo y se llama de nuevo a `POST /versiones` para actualizarlo (re-upload), el archivo anterior se elimina del disco antes de guardar el nuevo.
- *Nota: este caso se maneja como un endpoint separado o via PATCH si se implementa en iteraciones futuras. En MVP, una vez creada la versión con archivo no se re-sube (crear nueva versión si necesita corrección).*

# Proposal — proveedores-catalogo-v2

## Why

El catálogo de proveedores actual es un registro mínimo de contacto (RFC, razón social, email, teléfono). No soporta decisiones estratégicas de compra: no hay segmentación logística para evaluar tiempos de entrega, no hay control crediticio para validar límites financieros, no hay perfil de cumplimiento para auditorías, y no hay documentación fiscal vinculada. Esto obliga al equipo de Compras a gestionar esta información fuera del sistema (Excel, correos), rompiendo la trazabilidad.

## What Changes

### Modelo `Proveedor` — campos adicionales

**Segmentación Logística:**
- `ciudad` (VarChar 100, nullable) — ciudad de operación del proveedor
- `tipo_ubicacion` (VarChar 20, default `LOCAL`) — enum: `LOCAL` | `FORANEO`
- `entrega_en_sitio` (Boolean, default `false`) — capacidad de entregar en obra

**Calificación Crediticia:**
- `estatus_credito` (VarChar 20, default `ACTIVO`) — enum: `ACTIVO` | `BLOQUEADO`
- `limite_credito` (Decimal 18,2, nullable) — límite en MXN; null = sin límite definido

**Perfil de Cumplimiento:**
- `tipo_proveedor` (VarChar 20, default `NACIONAL`) — enum: `NACIONAL` | `EXTRANJERO`
- `calificacion_desempeno` (Decimal 3,2, nullable) — score 0.00–5.00 actualizable manualmente

### Modelo nuevo: `DocumentoProveedor`

Mismo patrón que `FichaTecnicaInsumo` (multer, volumen Docker). Campos: `id_doc`, `tenant_id`, `proveedor_id`, `tipo_doc` (enum: `CSD` | `OPINION_SAT` | `ISO` | `OTRO`), `nombre_doc`, `ruta_archivo`, `mime_type`, `tamano_bytes`, `subido_por`, `created_at`.

Extensiones permitidas: `.pdf .xml .jpg .jpeg .png`.

### Endpoints nuevos

- `POST /api/v1/compras/proveedores/:id/documentos` — upload (multer), roles: `procurement`, `admin`
- `GET /api/v1/compras/proveedores/:id/documentos` — listado de metadatos (sin ruta_archivo)
- `GET /api/v1/compras/proveedores/:id/documentos/:did/descargar` — descarga con `res.download()`
- `DELETE /api/v1/compras/proveedores/:id/documentos/:did` — elimina archivo y registro

### Frontend

Formulario de proveedor (`ComprasView`) ampliado con los nuevos campos. SideSheet de detalle de proveedor con sección "Documentos" (listado + botón subir + botón eliminar + botón descargar).

## Capabilities

**Nueva:** Perfil completo de proveedor con logística, crédito y cumplimiento.
**Nueva:** Repositorio de documentos fiscales y de calidad por proveedor.
**Modificada:** Formulario de alta/edición de proveedor.

## Impact

- Migración de schema en `apps/compras` (ALTER TABLE + nueva tabla).
- Nuevo volumen Docker `vps_docs_proveedores` en `docker-compose.vps.yml`.
- Sin cambios en otros módulos.
- Sin breaking changes — todos los campos nuevos son nullable o tienen default.

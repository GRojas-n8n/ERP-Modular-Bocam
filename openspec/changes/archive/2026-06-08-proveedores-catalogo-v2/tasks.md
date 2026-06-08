# Tasks — proveedores-catalogo-v2

## 1. Schema compras — Ampliar modelo Proveedor

- [x] 1.1 Agregar campos en `apps/compras/prisma/schema.prisma` en el modelo `Proveedor`: `ciudad` (VarChar 100, nullable), `tipo_ubicacion` (VarChar 20, default `"LOCAL"`), `entrega_en_sitio` (Boolean, default `false`), `estatus_credito` (VarChar 20, default `"ACTIVO"`), `limite_credito` (Decimal 18,2, nullable), `tipo_proveedor` (VarChar 20, default `"NACIONAL"`), `calificacion_desempeno` (Decimal 3,2, nullable)
- [x] 1.2 Agregar relación `documentos DocumentoProveedor[]` en el modelo `Proveedor`

## 2. Schema compras — Modelo DocumentoProveedor

- [x] 2.1 Crear modelo `DocumentoProveedor` en `apps/compras/prisma/schema.prisma` con campos: `id_doc` (UUID PK), `tenant_id` (Uuid), `proveedor_id` (Uuid, FK → Proveedor), `tipo_doc` (VarChar 20 — `CSD` | `OPINION_SAT` | `ISO` | `OTRO`), `nombre_doc` (VarChar 255), `ruta_archivo` (Text), `mime_type` (VarChar 100), `tamano_bytes` (Int), `subido_por` (Uuid), `created_at` (DateTime default now). Índices: `@@index([tenant_id, proveedor_id])`. Map: `documentos_proveedor`
- [x] 2.2 Ejecutar `npx prisma migrate dev --name add_proveedor_campos_v2_y_documentos` en `apps/compras`
- [x] 2.3 Ejecutar `npx prisma generate` en `apps/compras`

## 3. Dependencias y configuración compras

- [x] 3.1 Verificar que `multer` y `@types/multer` ya están en `apps/compras/package.json` (pueden ya existir del módulo calidad o gerencia-tecnica). Agregar si faltan.
- [x] 3.2 Agregar variables de entorno `DOCS_PROVEEDORES_UPLOAD_DIR` (default `/tmp/docs-proveedores`) y `DOCS_PROVEEDORES_MAX_SIZE_MB` (default `10`) al inicio de `apps/compras/src/main.ts` usando `requireEnv` pattern
- [x] 3.3 Agregar `DOCS_PROVEEDORES_UPLOAD_DIR: /data/compras/docs-proveedores` en el bloque `environment:` del servicio `compras` en `docker-compose.vps.yml`
- [x] 3.4 Agregar volume `vps_docs_proveedores:/data/compras/docs-proveedores` al servicio `compras` en `docker-compose.vps.yml`
- [x] 3.5 Declarar `vps_docs_proveedores:` en la sección `volumes:` global de `docker-compose.vps.yml`

## 4. Backend compras — Endpoints DocumentoProveedor

- [x] 4.1 Configurar instancia `multer` para `DOCS_PROVEEDORES_UPLOAD_DIR/_tmp`, `limits.fileSize = MAX_SIZE_MB * 1024 * 1024`, `fileFilter` para extensiones `.pdf .xml .jpg .jpeg .png`
- [x] 4.2 Implementar `POST /api/v1/compras/proveedores/:id/documentos` — roles: `procurement`, `admin`; validar proveedor existe (tenant-scoped); `fs.renameSync` a ruta final `<UPLOAD_DIR>/<tenantId>/<proveedorId>/<docId><ext>`; crear registro `DocumentoProveedor`; respuesta 201 con metadatos (sin `ruta_archivo`)
- [x] 4.3 Implementar `GET /api/v1/compras/proveedores/:id/documentos` — roles: `procurement`, `admin`, `finance`, `gerencia_tecnica`, `superintendent`; devuelve array de metadatos sin `ruta_archivo`; ordenado por `created_at DESC`
- [x] 4.4 Implementar `GET /api/v1/compras/proveedores/:id/documentos/:did/descargar` — mismos roles que GET listado; validar tenant y que `id_doc` pertenezca al proveedor; `res.download()` con `nombre_doc`
- [x] 4.5 Implementar `DELETE /api/v1/compras/proveedores/:id/documentos/:did` — roles: `procurement`, `admin`; `fs.unlinkSync` con try/catch (log warn si no existe el archivo físico); eliminar registro; respuesta 200
- [x] 4.6 Verificar que el handler de error Multer global está al final del app (agregar si no existe)

## 5. Backend compras — Endpoints Proveedor actualizados

- [x] 5.1 Actualizar `POST /api/v1/compras/proveedores` para aceptar los nuevos campos opcionales: `ciudad`, `tipo_ubicacion`, `entrega_en_sitio`, `estatus_credito`, `limite_credito`, `tipo_proveedor`, `calificacion_desempeno`
- [x] 5.2 Actualizar `PUT /api/v1/compras/proveedores/:id` (o el endpoint de edición que exista) para permitir actualizar los nuevos campos. Validar que `calificacion_desempeno` sea 0.00–5.00 si se envía.
- [x] 5.3 Verificar que `GET /api/v1/compras/proveedores` retorna los nuevos campos en el payload de respuesta

## 6. Frontend — Formulario de Proveedor

- [x] 6.1 Ampliar el formulario de alta/edición de proveedor en `ComprasView.tsx`: agregar sección "Logística" con campos `ciudad` (Input), `tipo_ubicacion` (Select: LOCAL/FORANEO), `entrega_en_sitio` (checkbox)
- [x] 6.2 Agregar sección "Condiciones Comerciales" en el formulario: `estatus_credito` (Select: ACTIVO/BLOQUEADO), `limite_credito` (Input numérico, opcional), `tipo_proveedor` (Select: NACIONAL/EXTRANJERO), `calificacion_desempeno` (Input 0–5, opcional)
- [x] 6.3 En la tabla/lista de proveedores, agregar columnas visuales: badge de `tipo_ubicacion`, badge de `estatus_credito` (rojo si BLOQUEADO), estrella o score de `calificacion_desempeno`

## 7. Frontend — SideSheet de Documentos de Proveedor

- [x] 7.1 Agregar estado local `docsProveedor: Record<string, DocProveedor[]>` y `sideSheetDocsProveedorId: string | null` en `ComprasView`
- [x] 7.2 Implementar `fetchDocsProveedor(proveedorId)` que llama `GET /api/v1/compras/proveedores/:id/documentos`
- [x] 7.3 En el detalle o fila de cada proveedor agregar botón "📎 Documentos" que abre SideSheet y dispara `fetchDocsProveedor`
- [x] 7.4 Implementar SideSheet de documentos: listado con `nombre_doc`, `tipo_doc` (badge color: CSD=blue, OPINION_SAT=emerald, ISO=violet, OTRO=gray), `created_at`; botón de descarga (link a `/descargar`); botón eliminar (solo `procurement`/`admin`); botón "Subir documento" con input file oculto y select de `tipo_doc`
- [x] 7.5 Implementar upload desde el SideSheet: `FormData` con `tipo_doc` → `POST /compras/proveedores/:id/documentos`; refrescar listado; notificación de éxito/error

## 8. Integración y verificación en producción

- [x] 8.1 Migrar en VPS: SQL aplicado via `prisma db execute` + registrado con `prisma migrate resolve --applied`
- [x] 8.2 Build y restart de `compras` y `app-shell` en VPS: todos los contenedores `Healthy`
- [x] 8.3 Verificar: GET /proveedores retorna campos nuevos (`tipo_ubicacion`, `estatus_credito`, `limite_credito`, `calificacion_desempeno`, etc.) con valores por defecto correctos
- [x] 8.4 Verificar: upload PDF OPINION_SAT + descarga funcionando ✓ (fix fetch+blob aplicado)
- [x] 8.5 Verificar: badge rojo BLOQUEADO visible en tabla ✓

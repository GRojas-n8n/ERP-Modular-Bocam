## 1. Schema compras — ComparativaLinea

- [x] 1.1 Agregar modelo `ComparativaLinea` en `apps/compras/prisma/schema.prisma` con campos: `id_linea` (UUID PK), `tenant_id`, `proyecto_id`, `cuadro_id` (FK → CuadroComparativo), `insumo_id` (UUID, referencia externa), `marca_modelo_ref` (VarChar 100, nullable), `especificaciones_requeridas` (Text, nullable), `@@unique([cuadro_id, insumo_id])`, `@@index([tenant_id, cuadro_id])`
- [x] 1.2 Ejecutar `npx prisma migrate dev --name add_comparativa_linea` en `apps/compras`
- [x] 1.3 Regenerar cliente Prisma: `npx prisma generate` en `apps/compras`

## 2. Schema gerencia-tecnica — FichaTecnicaInsumo

- [x] 2.1 Agregar modelo `FichaTecnicaInsumo` en `apps/gerencia-tecnica/prisma/schema.prisma` con campos: `id_ficha` (UUID PK), `tenant_id`, `insumo_id` (UUID, referencia externa sin @relation), `proveedor_ref` (VarChar 100, nullable), `nombre_doc` (VarChar 255), `ruta_archivo` (Text), `mime_type` (VarChar 100), `tamano_bytes` (Int), `subido_por` (UUID), `created_at` (DateTime default now), `@@index([tenant_id, insumo_id])`
- [x] 2.2 Ejecutar `npx prisma migrate dev --name add_ficha_tecnica_insumo` en `apps/gerencia-tecnica`
- [x] 2.3 Regenerar cliente Prisma: `npx prisma generate` en `apps/gerencia-tecnica`

## 3. Dependencias y configuración gerencia-tecnica

- [x] 3.1 Agregar `multer` y `@types/multer` a `apps/gerencia-tecnica/package.json`
- [x] 3.2 Ejecutar `pnpm install` en la raíz del monorepo
- [x] 3.3 Agregar `FICHAS_UPLOAD_DIR` y `FICHAS_MAX_SIZE_MB` a `apps/gerencia-tecnica/src/main.ts` (con defaults `/tmp/fichas-insumos` y `20`)
- [x] 3.4 Agregar volume `vps_fichas_uploads:/data/gerencia-tecnica/fichas` al servicio `gerencia-tecnica` en `docker-compose.vps.yml`
- [x] 3.5 Declarar `vps_fichas_uploads:` en la sección `volumes:` global de `docker-compose.vps.yml`
- [x] 3.6 Agregar `FICHAS_UPLOAD_DIR: /data/gerencia-tecnica/fichas` en el bloque `environment:` de `gerencia-tecnica` en `docker-compose.vps.yml`

## 4. Backend gerencia-tecnica — Endpoints fichas

- [x] 4.1 Configurar `multer` en `apps/gerencia-tecnica/src/main.ts`: `dest: FICHAS_UPLOAD_DIR/_tmp`, `limits.fileSize`, `fileFilter` para extensiones `.pdf .doc .docx .jpg .jpeg .png`
- [x] 4.2 Implementar `POST /api/v1/gerencia-tecnica/insumos/:id/fichas` — roles: `procurement`, `gerencia_tecnica`, `admin`; validar insumo existe (tenant-scoped); `fs.renameSync` a ruta final `<UPLOAD_DIR>/<tenantId>/<insumoId>/<fichaId><ext>`; crear registro `FichaTecnicaInsumo`; respuesta 201
- [x] 4.3 Implementar `GET /api/v1/gerencia-tecnica/insumos/:id/fichas` — roles: `resident`, `control_obra`, `gerencia_tecnica`, `superintendent`, `procurement`, `admin`; devuelve array de metadatos (sin `ruta_archivo` en la respuesta)
- [x] 4.4 Implementar `GET /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid/descargar` — mismos roles que GET listado; validar tenant; `res.download()` con `nombre_doc` como nombre del archivo
- [x] 4.5 Implementar `DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid` — roles: `procurement`, `gerencia_tecnica`, `admin`; `fs.unlinkSync` con try/catch; eliminar registro BD; respuesta 200
- [x] 4.6 Agregar handler de error Multer al final del app (igual que en `calidad`)

## 5. Backend compras — Endpoints ComparativaLinea

- [x] 5.1 Implementar `PUT /api/v1/compras/comparativas/:id/lineas/:insumoId` — roles: `procurement`, `admin`; validar estado === `BORRADOR` (403 si no); upsert en `ComparativaLinea`; respuesta 200 con `{ marca_modelo_ref, especificaciones_requeridas }`
- [x] 5.2 Ampliar el endpoint `GET /api/v1/compras/comparativas/:id` para incluir las filas de `ComparativaLinea` del cuadro en el payload de respuesta (campo `lineas_detalle: { insumo_id, marca_modelo_ref, especificaciones_requeridas }[]`)

## 6. Frontend — ComparativaDetail: detalles técnicos por partida

- [x] 6.1 Ampliar la interfaz `CotizacionLinea` en `ComparativaDetail.tsx` con `marca_modelo_ref?: string` y `especificaciones_requeridas?: string`
- [x] 6.2 Ampliar `ComparativaLocal` con `lineas_detalle?: { insumo_id: string; marca_modelo_ref?: string; especificaciones_requeridas?: string }[]`
- [x] 6.3 En la tabla principal del cuadro, agregar en el encabezado de cada fila de partida (columna de descripción) los campos `marca_modelo_ref` y `especificaciones_requeridas` en modo solo lectura si existen
- [x] 6.4 Cuando `locked === false` (estado BORRADOR) y rol es `procurement`/`admin`, renderizar inputs inline editables para `marca_modelo_ref` y `especificaciones_requeridas` en cada fila de partida; al blur llamar `PUT /compras/comparativas/:id/lineas/:insumoId`

## 7. Frontend — ComparativaDetail: SideSheet de fichas técnicas

- [x] 7.1 Agregar estado local `fichasInsumo: Record<string, FichaTecnica[]>` y `sideSheetFichasInsumoId: string | null` en `ComparativaDetail`
- [x] 7.2 Implementar `fetchFichas(insumoId)` que llama `GET /api/v1/gerencia-tecnica/insumos/:id/fichas` y popula `fichasInsumo[insumoId]`
- [x] 7.3 En cada fila de partida de la tabla, agregar un badge `📎 N` (donde N = fichas disponibles) o un botón `+ Subir ficha` (solo para roles upload). Al click abre el SideSheet y llama `fetchFichas`
- [x] 7.4 Implementar el SideSheet de fichas: listado con `nombre_doc`, `proveedor_ref`, `created_at`, botón de descarga (link al endpoint `descargar`), botón de eliminar (roles permitidos), botón `Subir ficha` con input file oculto
- [x] 7.5 Implementar upload desde el SideSheet: `FormData` → `POST /gerencia-tecnica/insumos/:id/fichas`; refrescar listado al completar; notificación de éxito/error

## 8. Frontend — Panel de evaluación técnica: mostrar contexto técnico

- [x] 8.1 En el SideSheet de evaluación técnica del Residente, por cada partida mostrar (solo lectura): `marca_modelo_ref` y `especificaciones_requeridas` si están capturados
- [x] 8.2 En el SideSheet de evaluación técnica, agregar badge `📎 N fichas` por partida (mismo mecanismo del task 7.3); al click abre el SideSheet de fichas sin cerrar el panel de evaluación (usar z-index superior o navegación)

## 9. Frontend — InsumosView: sección fichas técnicas

- [x] 9.1 En el panel de detalle de un insumo en `InsumosView` agregar una sección "Fichas Técnicas" con listado, botón de descarga y (roles permitidos) botón de subir y eliminar — reutilizar la misma lógica de fetch del task 7.2

## 10. Integración y verificación

- [x] 10.1 Migrar en VPS: `docker exec bocam-vps-compras npx prisma migrate deploy` y `docker exec bocam-vps-gerencia-tecnica npx prisma migrate deploy`
- [x] 10.2 Build y restart de `gerencia-tecnica` y `app-shell` en VPS
- [ ] 10.3 Verificar: subir una ficha técnica desde la comparativa y confirmar que aparece en InsumosView del mismo insumo
- [ ] 10.4 Verificar: el Residente ve `marca_modelo_ref` y el badge de fichas en su panel de evaluación técnica
- [ ] 10.5 Verificar: cuadros comparativos anteriores a la migración cargan sin errores (campos vacíos, sin crash)

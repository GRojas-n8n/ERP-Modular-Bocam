## 1. Auditoría de aislamiento

- [x] 1.1 Revisar todos los endpoints de `apps/calidad/src/main.ts` e identificar cuáles filtraban solo por `tenant_id` (sin `proyecto_id`)
- [x] 1.2 Confirmar que el schema Prisma de Calidad ya incluía `proyecto_id` en `NoConformidad`, `AuditoriaInterna` y `Documento` — campo presente, sin migración necesaria
- [x] 1.3 Confirmar que `VersionDocumento`, `AccionCorrectiva` y `HallazgoAuditoria` NO tienen `proyecto_id` propio (son sub-entidades)

## 2. Backend — aislamiento por proyecto_id

- [x] 2.1 `GET /no-conformidades`: agregar `where: { proyecto_id: proyectoId }` al findMany
- [x] 2.2 `POST /no-conformidades`: usar `proyectoId` del `req.securityContext` en el create (no del body)
- [x] 2.3 `GET /auditorias`: agregar `where: { proyecto_id: proyectoId }` al findMany
- [x] 2.4 `POST /auditorias`: usar `proyectoId` del `req.securityContext` en el create
- [x] 2.5 `POST /auditorias/:id/hallazgos/:hid/crear-nc`: agregar `proyecto_id: proyectoId` al create de NC (para que la NC creada desde un hallazgo también quede aislada)
- [x] 2.6 `GET /dashboard`: agregar `proyecto_id: proyectoId` a los 8 counts (NC×4, Auditoría×2, Documento×2)
- [x] 2.7 `GET /documentos`: agregar `where: { proyecto_id: proyectoId }` al findMany
- [x] 2.8 `POST /documentos`: usar `proyectoId` del `req.securityContext` en el create
- [x] 2.9 `GET /documentos/:id`: agregar `proyecto_id: proyectoId` al findFirst (bloqueo acceso cruzado)
- [x] 2.10 `PATCH /documentos/:id`: agregar `proyecto_id: proyectoId` al findFirst de verificación
- [x] 2.11 `DELETE /documentos/:id`: agregar `proyecto_id: proyectoId` al findFirst de verificación

## 3. Frontend — re-fetch al cambiar Centro de Costos

- [x] 3.1 En `CalidadView.tsx`: agregar `currentProjectId` a la destructuración de `useTenant()`
- [x] 3.2 `fetchDashboard`: agregar `currentProjectId` a deps del useCallback
- [x] 3.3 `fetchDocumentos`: agregar `currentProjectId` a deps del useCallback
- [x] 3.4 Renderizado de sub-vistas: pasar `currentProjectId` como prop a `NoConformidadesView` y `AuditoriasView`
- [x] 3.5 `NoConformidadesView`: extender props type con `currentProjectId: string | null`; agregar a deps de `load`
- [x] 3.6 `AuditoriasView`: extender props type con `currentProjectId: string | null`; agregar a deps de `load`

## 4. Tests retroactivos

- [ ] 4.1 `apps/calidad/test/integration/aislamiento-proyecto.integration.test.ts` — test: crear NC en proyecto A, verificar que GET /no-conformidades con token de proyecto B NO la devuelve
- [ ] 4.2 Test: crear Auditoría en proyecto A, verificar que GET /auditorias con token B NO la devuelve
- [ ] 4.3 Test: GET /documentos/:id con token de proyecto incorrecto devuelve 404
- [ ] 4.4 Test: POST /no-conformidades ignora `proyecto_id` del body y usa el del JWT

## 5. Commit y cierre

- [x] 5.1 Commit `745f561` — incluye backend calidad + frontend CalidadView + TenantContext
- [x] 5.2 Fix DB en VPS: `prisma db push` (schema ya estaba sincronizado — hallazgos_auditoria.nc_id ya existía)
- [x] 5.3 Deploy en VPS — containers calidad y app-shell reconstruidos y healthy
- [x] 5.4 Verificar endpoints en producción: GET /calidad/dashboard, /no-conformidades, /auditorias devuelven 200

## Estado

**Código:** ✅ Completado (commit 745f561, 2026-06-30)
**Tests retroactivos (tasks 4.x):** ⏳ Pendiente

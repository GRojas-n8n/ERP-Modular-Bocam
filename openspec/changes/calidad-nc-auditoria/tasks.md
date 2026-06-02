# Tasks — Calidad: No Conformidades y Auditorías Internas

## 1. Schema Prisma

- [ ] 1.1 Agregar modelo `NoConformidad` con `acciones AccionCorrectiva[]`
- [ ] 1.2 Agregar modelo `AccionCorrectiva` con FK `nc_id`
- [ ] 1.3 Agregar modelo `AuditoriaInterna` con `hallazgos HallazgoAuditoria[]`
- [ ] 1.4 Agregar modelo `HallazgoAuditoria` con FK `auditoria_id`
- [ ] 1.5 `npx prisma generate` en `apps/calidad/`
- [ ] 1.6 Crear migración SQL manual en `apps/calidad/prisma/migrations/20260602200000_nc_auditorias/`

## 2. Backend — No Conformidades (6 endpoints)

- [ ] 2.1 `GET /api/v1/calidad/no-conformidades` — lista con `acciones` incluidas
- [ ] 2.2 `POST /api/v1/calidad/no-conformidades` — crea, código auto `NC-YYYY-NNN`
- [ ] 2.3 `GET /api/v1/calidad/no-conformidades/:id` — detalle completo
- [ ] 2.4 `PATCH /api/v1/calidad/no-conformidades/:id` — actualiza estado, causa_raiz, responsable, fecha_limite
- [ ] 2.5 `POST /api/v1/calidad/no-conformidades/:id/acciones` — agrega acción correctiva
- [ ] 2.6 `PATCH /api/v1/calidad/no-conformidades/:id/acciones/:aid` — actualiza estado/evidencia de AC

## 3. Backend — Auditorías (4 endpoints)

- [ ] 3.1 `GET /api/v1/calidad/auditorias` — lista con conteo de hallazgos
- [ ] 3.2 `POST /api/v1/calidad/auditorias` — crea, código auto `AUD-YYYY-NN`
- [ ] 3.3 `GET /api/v1/calidad/auditorias/:id` — detalle con `hallazgos` incluidos
- [ ] 3.4 `POST /api/v1/calidad/auditorias/:id/hallazgos` — agrega hallazgo

## 4. Frontend — Layout

- [ ] 4.1 Agregar `{ id: 'no-conformidades', label: 'No Conformidades', icon: IconAlertCircle }` a subItems de calidad
- [ ] 4.2 Agregar `{ id: 'auditorias', label: 'Auditorías', icon: IconClipboardCheck }` a subItems de calidad

## 5. Frontend — CalidadView (sub-vistas)

- [ ] 5.1 Activar routing por `activeSubView`: `documentos` | `no-conformidades` | `auditorias`
- [ ] 5.2 **Vista No Conformidades**: tabla (código, título, fuente, estado, fecha_límite) + botón crear + detalle con acciones
- [ ] 5.3 SlidePanel crear NC: título, descripción, fuente, responsable_id, fecha_límite
- [ ] 5.4 En detalle NC: botones cambiar estado + agregar acción correctiva
- [ ] 5.5 **Vista Auditorías**: tabla (código, título, estado, fecha_inicio, hallazgos count) + botón crear
- [ ] 5.6 SlidePanel crear Auditoría: título, alcance, criterios, auditor_lider_id, fechas
- [ ] 5.7 En detalle Auditoría: lista de hallazgos + botón agregar hallazgo (tipo, descripción, proceso)

## 6. Deploy

- [ ] 6.1 Aplicar migración SQL en VPS
- [ ] 6.2 Build y redeploy `calidad` + `app-shell`
- [ ] 6.3 Verificar endpoints en producción

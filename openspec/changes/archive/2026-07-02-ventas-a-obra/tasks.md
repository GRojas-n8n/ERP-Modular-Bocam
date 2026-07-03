# Tasks — ventas-a-obra

## 1. Schema GT — ProyectoObraVinculado

- [x] 1.1 Agregar modelo `ProyectoObraVinculado` en `apps/gerencia-tecnica/prisma/schema.prisma`
  - campos: `id`, `tenant_id`, `proyecto_id`, `cotizacion_id`, `monto_contrato`, `moneda`, `cliente_nombre`, `fecha_contrato`, `estado`, `notas`, `created_at`, `updated_at`
  - `@@unique([tenant_id, cotizacion_id])` para idempotencia
  - tabla: `proyectos_obra_vinculados`
- [x] 1.2 Migración aplicada en VPS (tabla confirmada en bocam_gerencia_tecnica)
- [x] 1.3 Prisma client regenerado (ProyectoObraVinculado ausente en cliente generado → regenerado 2026-07-02)

## 2. Ventas — enriquecer evento

- [x] 2.1 `ventas/main.ts`: agregar `fecha_aceptacion: new Date().toISOString()` al payload de `ventas.cotizacion_aceptada`

## 3. GT — subscriber

- [x] 3.1 `apps/gerencia-tecnica/src/main.ts`: exportar `handleCotizacionAceptadaEvent` + suscribir en bootstrap
- [x] 3.2 Handler: upsert `ProyectoObraVinculado` con `estado = 'SIN_PRESUPUESTO'`; idempotente por `@@unique([tenant_id, cotizacion_id])`
- [x] 3.3 `main.ts`: guardar bootstrap bajo `if (require.main === module)` para testabilidad

## 4. GT — estado CON_PRESUPUESTO al aprobar presupuesto

- [x] 4.1 `PATCH /presupuestos/:id/aprobar` actualiza `ProyectoObraVinculado.estado → CON_PRESUPUESTO` vía `updateMany` (try/catch ignora proyectos sin vínculo)

## 5. GT — endpoint GET /proyectos-vinculados

- [x] 5.1 Endpoint `GET /api/v1/gerencia-tecnica/proyectos-vinculados` listando todos los vínculos del tenant, con filtro opcional `?estado=`
- [x] 5.2 Solo aparecen proyectos que nacieron de cotizaciones (no los manuales)

## 6. GT — dashboard KPIs

- [x] 6.1 `GET /api/v1/gerencia-tecnica/dashboard` incluye `proyectos_sin_presupuesto`, `proyectos_en_ejecucion`, `monto_contratado_activo`
- [x] 6.2 Verificado en producción: HTTP 200 con todos los KPIs (0 proyectos vinculados en entorno de prueba)

## 7. GT — db.ts testabilidad

- [x] 7.1 `apps/gerencia-tecnica/src/db.ts`: `PrismaClient` lee `GERENCIA_TECNICA_DATABASE_URL || DATABASE_URL` (patrón finanzas)

## 8. Tests

- [x] 8.1 `apps/gerencia-tecnica/test/integration/ventas-a-obra.integration.test.ts` — 4/4 passing ✅ (2026-07-02):
  - Evento `ventas.cotizacion_aceptada` → `ProyectoObraVinculado` creado con `SIN_PRESUPUESTO`
  - Evento duplicado → idempotente (upsert sin duplicar)
  - `GET /proyectos-vinculados` → retorna vínculo creado
  - `GET /proyectos-vinculados?estado=SIN_PRESUPUESTO` → filtra correctamente

## Notas de implementación

- Todo el código backend ya estaba implementado. El spec fue escrito retroactivamente.
- El modelo `ProyectoObraVinculado` faltaba en el cliente Prisma generado — se regeneró durante esta sesión.
- El `require.main` guard añadido a GT permite reusar el `app` en tests sin auto-iniciar el servidor.

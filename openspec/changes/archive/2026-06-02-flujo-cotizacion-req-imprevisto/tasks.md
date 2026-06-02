## 1. Migración del Schema Prisma (Compras)

- [x] 1.1 Agregar campo `tipo VARCHAR(20) NOT NULL DEFAULT 'NORMAL'` a `requisiciones`
- [x] 1.2 Hacer `insumo_id` nullable en `requisiciones_items`
- [x] 1.3 Agregar campos `descripcion_libre TEXT`, `unidad_libre VARCHAR(20)`, `es_imprevisto BOOLEAN NOT NULL DEFAULT false` a `requisiciones_items`
- [x] 1.4 Agregar índice parcial `idx_req_imprevisto` sobre `(tenant_id, tipo) WHERE tipo = 'IMPREVISTO'`
- [x] 1.5 Actualizar `schema.prisma` con los nuevos campos y sus anotaciones (`@db.VarChar`, `@db.Text`, `@default`)
- [x] 1.6 Agregar `@@index([tenant_id, tipo])` al modelo `Requisicion` en el schema Prisma

## 2. Migración SQL Manual (VPS)

- [x] 2.1 Crear archivo de migración en `apps/compras/prisma/migrations/20260527140000_add_req_imprevisto_y_aprobacion/migration.sql`
- [x] 2.2 Aplicar `ALTER TABLE` para `tipo` en `requisiciones` en VPS (con `ADD COLUMN IF NOT EXISTS`)
- [x] 2.3 Aplicar `ALTER COLUMN insumo_id DROP NOT NULL` en VPS
- [x] 2.4 Aplicar `ADD COLUMN IF NOT EXISTS` para los 3 campos de ítems imprevisto en VPS
- [x] 2.5 Aplicar `CREATE INDEX IF NOT EXISTS idx_req_imprevisto` en VPS
- [x] 2.6 Registrar migración en tabla `_prisma_migrations` de `bocam_compras`

## 3. Backend — Endpoint modificado: POST /requisiciones

- [x] 3.1 Extraer `tipo` del body; normalizar a `'IMPREVISTO'` o `'NORMAL'`
- [x] 3.2 Mapear ítems IMPREVISTO: `insumo_id: null`, `descripcion_libre`, `unidad_libre`, `es_imprevisto: true`
- [x] 3.3 Mapear ítems NORMAL: `insumo_id` requerido, resto null
- [x] 3.4 Estado inicial siempre `PENDIENTE` (independiente del tipo)
- [x] 3.5 Logear con `logInfo` incluyendo `tipo` e `items.length`

## 4. Backend — Endpoint nuevo: PATCH /requisiciones/:id/aprobar

- [x] 4.1 Proteger con `requireRoles('procurement', 'admin', 'superintendent')`
- [x] 4.2 Buscar requisición por `id_requisicion` dentro de `createTenantContext`
- [x] 4.3 Retornar `404` si no existe
- [x] 4.4 Retornar `200` idempotente si ya está en `APROBADA`
- [x] 4.5 Retornar `400` si estado no es `PENDIENTE` ni `BORRADOR`
- [x] 4.6 Actualizar `estado = 'APROBADA'` y retornar la requisición con items
- [x] 4.7 Publicar evento `compras.requisicion_aprobada` con degradación elegante

## 5. Frontend — Normalización de campos API (ComprasView.tsx)

- [x] 5.1 Agregar campo `tipo?: string` a la interfaz `Requisicion`
- [x] 5.2 En `fetchData()`, mapear `id_requisicion→id`, `codigo→folio`, `fecha_solicitud→fecha`, `solicitante_id→solicitante`, `prioridad`, `estado`, `tipo`
- [x] 5.3 Verificar que el modo demo sigue funcionando (usa `DEMO_REQUISICIONES` que ya tiene los campos del frontend)

## 6. Frontend — Botón "Aprobar" y badge IMPREVISTO (ComprasView.tsx)

- [x] 6.1 Agregar `isProcurement = roles.some(r => ['procurement', 'admin', 'superintendent'].includes(r))`
- [x] 6.2 Agregar estado `aprobando: string | null` para loading por tarjeta
- [x] 6.3 Implementar `handleAprobar(reqId)`: llama `PATCH /requisiciones/:id/aprobar`, refresca lista, muestra toast
- [x] 6.4 Mostrar botón "Aprobar Requisición" en tarjetas con `estado === 'PENDIENTE' || 'BORRADOR'` cuando `isProcurement`
- [x] 6.5 El botón muestra `disabled` y texto "Aprobando..." durante la llamada
- [x] 6.6 En modo demo: simular aprobación localmente con `setRequisiciones(prev => prev.map(...))`
- [x] 6.7 Mostrar badge naranja "Imprevisto" en tarjetas con `tipo === 'IMPREVISTO'`

## 7. Frontend — Formulario tipo NORMAL/IMPREVISTO (ComprasView.tsx)

- [x] 7.1 Agregar campo `tipo: 'NORMAL'` al estado inicial de `reqForm`
- [x] 7.2 Extender ítems de reqForm con `descripcion_libre: ''` y `unidad_libre: 'PZA'`
- [x] 7.3 Agregar selector visual NORMAL / IMPREVISTO al inicio del SlidePanel (dos botones tipo card)
- [x] 7.4 Cuando `tipo === 'IMPREVISTO'`: mostrar banner informativo sobre desviación presupuestal
- [x] 7.5 Cuando `tipo === 'IMPREVISTO'`: cada ítem muestra `Input descripcion_libre` + `Select unidad_libre` + `Input cantidad` + `Input notas`
- [x] 7.6 Cuando `tipo === 'NORMAL'`: mantener flujo existente de búsqueda en catálogo
- [x] 7.7 Validación diferenciada: IMPREVISTO valida `descripcion_libre && cantidad`; NORMAL valida `insumo_id && cantidad`
- [x] 7.8 En el POST, incluir `tipo` y mapear ítems según tipo
- [x] 7.9 Cambiar `accentColor` del SlidePanel a `amber` cuando `tipo === 'IMPREVISTO'`
- [x] 7.10 Cambiar label del botón submit según tipo

## 8. Deploy

- [x] 8.1 Commit `feat(compras): flujo cotización — aprobar req + tipo IMPREVISTO` (hash c93f07c)
- [x] 8.2 Push a `origin/main`
- [x] 8.3 `git pull` en VPS
- [x] 8.4 Rebuild `compras` y `app-shell` sin cache
- [x] 8.5 `docker compose up -d compras app-shell`
- [x] 8.6 Verificar health check `compras:3002/health` → `{"status":"ok"}`
- [x] 8.7 Verificar logs de inicio: EventBus conectado, suscripciones activas

## 9. Tests de integración

- [x] 9.1 Test: `POST /requisiciones` con `tipo: 'IMPREVISTO'` y ítems sin `insumo_id` → `201`, `estado = 'PENDIENTE'`
- [x] 9.2 Test: `POST /requisiciones` con ítem IMPREVISTO que tiene `insumo_id` → comportamiento definido: `insumo_id` se conserva
- [x] 9.3 Test: `PATCH /aprobar` con rol `procurement` → `200`, `estado = 'APROBADA'`
- [x] 9.4 Test: `PATCH /aprobar` idempotente — segunda llamada → `200` sin error
- [x] 9.5 Test: `PATCH /aprobar` con rol `resident` → `403`
- [x] 9.6 Test: `PATCH /aprobar` con `estado = 'COMPRADA'` → `400`

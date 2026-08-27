## Why

El catálogo de `Insumo` en Gerencia Técnica (`apps/gerencia-tecnica/prisma/schema.prisma:60-86`) no tiene columna `proyecto_id` — es único por `(tenant_id, clave)` y su política RLS (`rls_insumos_tenant`, `apps/gerencia-tecnica/prisma/rls-policies.sql:54-60`) solo aísla por tenant. Esto fue una decisión de diseño deliberada y documentada (`openspec/changes/archive/2026-08-20-wbs-jerarquico-conceptos/design.md`, línea 3: "reutilizable entre obras del mismo tenant"), pero en la práctica produce exactamente el problema que reporta el Gerente Técnico: la pantalla de Insumos muestra el catálogo completo del tenant — materiales, mano de obra y equipo de **todas** las obras — sin separar por proyecto, violando la regla del proyecto de no mezclar datos entre obras (`CLAUDE.md`).

El mismo `GET /insumos/explosion` (`main.ts:123-162`) que alimenta la pantalla del Gerente es también la fuente del catálogo que usa un Residente para armar una requisición "Por Insumo" (`RequisicionesTab.tsx:219`, spec `residente-seleccion-insumos`) — sin filtro de proyecto en la consulta base (`db.insumo.findMany({ where: { activo: true } })`, `main.ts:129`), un Residente puede hoy seleccionar, en su requisición, un insumo que pertenece únicamente a la obra de otro proyecto del mismo tenant. No es solo un problema de visualización: afecta qué puede pedir un Residente en una requisición real.

El usuario (dueño del producto) pidió explícitamente: mostrar los insumos solo del proyecto activo, sin excepción.

## What Changes

- **BREAKING**: `Insumo` gana una columna `proyecto_id` (UUID, nullable para preservar filas históricas — ver design.md, Decisions). La unicidad de `clave` pasa de `(tenant_id, clave)` a `(tenant_id, proyecto_id, clave)` — la misma clave puede existir de forma independiente en cada proyecto a partir de este change; deja de asumirse "un insumo, reutilizable en toda obra del tenant".
- `POST /insumos`, `POST /insumos/importar-lote` y `PATCH /insumos/:id` (`apps/gerencia-tecnica/src/main.ts`) estampan `proyecto_id` del proyecto activo de la sesión (`req.securityContext.proyectoId`, ya disponible — mismo origen que usa `presupuestos_base`) en cada fila que crean/actualizan.
- `GET /insumos` y `GET /insumos/explosion` filtran estrictamente por el proyecto activo para roles de nivel-proyecto (`gerencia_tecnica`, `technical`) — estos roles siempre tienen `proyecto_id` en contexto (`requireProjectAccess()` los trata como nivel-proyecto, `packages/auth-middleware/src/middleware.ts:252`). Para roles de nivel-tenant sin proyecto activo (`admin`, `superintendent`), se conserva el patrón "Global con Trazabilidad" que este mismo servicio ya usa en `presupuestos_base`/`conceptos` (`proyecto_id IS NULL en contexto → consolida todo el tenant`, cada fila con su `proyecto_id` expuesto) — no una mezcla nueva, sino la vista consolidada explícita que ya existe para ese caso, ahora también trazable por fila.
- La política RLS de `insumos` (`rls-policies.sql`) se actualiza de "solo tenant" a "tenant + proyecto con fallback de consolidación para contexto sin proyecto", igual patrón que ya usan `presupuestos_base`/`conceptos` en este mismo archivo.
- Filas de `Insumo` creadas antes de este change (`proyecto_id IS NULL` tras la migración) dejan de aparecer en la vista de un proyecto específico — se archivan (`activo = false`) tras un backfill de mejor esfuerzo (ver design.md) y quedan fuera de las vistas activas; no se borran (preserva integridad referencial con `insumo_id` ya usado en Compras/Almacén).

## Capabilities

### New Capabilities
- `aislamiento-insumos-por-proyecto-gt`: el catálogo de `Insumo` se aísla por `(tenant_id, proyecto_id)`, con el mismo patrón "Global con Trazabilidad" ya usado en `presupuestos_base`/`conceptos` para roles de nivel-tenant sin proyecto activo.

### Modified Capabilities
Ninguna — no hay spec previo en `openspec/specs/` que documente el comportamiento actual de `GET /insumos`, `GET /insumos/explosion` o la unicidad de `Insumo` (`permisos-catalogo-gerencia-tecnica` solo cubre qué roles pueden llamar a estos endpoints, no su alcance de datos — sin cambios ahí).

## Impact

- `apps/gerencia-tecnica/prisma/schema.prisma`: modelo `Insumo` — nueva columna `proyecto_id String? @db.Uuid`, índice `[tenant_id, proyecto_id]`, unique constraint cambia a `[tenant_id, proyecto_id, clave]`.
- `apps/gerencia-tecnica/prisma/migrations/`: migración nueva + script de backfill (ver design.md, no es una migración Prisma estándar de datos).
- `apps/gerencia-tecnica/prisma/rls-policies.sql`: política `rls_insumos_tenant` → `rls_insumos_context` (tenant + proyecto, con fallback de consolidación).
- `apps/gerencia-tecnica/src/main.ts`: `GET /insumos` (~L78), `GET /insumos/explosion` (~L123), `POST /insumos` (~L269), `POST /insumos/importar-lote` (~L316), `PATCH /insumos/:id` (~L435) — y cualquier otro endpoint que lea/escriba `Insumo` directamente (fichas técnicas, clasificación bulk, categoría — ver tasks.md para el inventario completo).
- `apps/app-shell/src/views/InsumosView.tsx` y `apps/app-shell/src/views/residencia/RequisicionesTab.tsx`: sin cambio de contrato esperado (ambos ya operan con el proyecto activo de la sesión) — verificar en pruebas que el catálogo mostrado/seleccionable queda acotado al proyecto.
- `apps/compras/src/main.ts`: la llamada B2B a `GT_URL/insumos` (`enviarCorreosSolicitudCotizacion`, ~L124) ya envía `x-proyecto-id` de la requisición — sin cambio de código, pero una requisición histórica cuyo insumo quedó archivado por el backfill (ver Risks en design.md) puede mostrar "Insumo no encontrado en catálogo" en el correo — comportamiento ya contemplado por el fallback existente (`main.ts:141`), no un crash nuevo.
- Sin cambios en Compras/Almacén/Control de Proyectos más allá de lo anterior — `insumo_id` sigue siendo un UUID opaco almacenado en sus propias bases, sin FK cruzada (regla "SIN JOINs cruzados").

## Context

`apps/gerencia-tecnica/prisma/rls-policies.sql` cubre solo 3 tablas
(`insumos`, `presupuestos_base`, `conceptos`) desde 2026-07-10/11. Usa sus
propias funciones auxiliares `get_current_tenant_id()`/`get_current_proyecto_id()`
(plpgsql, con manejo de excepción que retorna `NULL` si el cast falla), un
patrón distinto pero igual de válido al `current_tenant_id()`/
`current_proyecto_id()` de `compras` o al `current_setting(...)` directo de
`personal`/`finanzas` — cada servicio tiene su propio estilo ya establecido en
su archivo; este change sigue el de `gerencia-tecnica`, no introduce un cuarto
patrón.

La política de `presupuestos_base`/`conceptos` tiene un fallback
`get_current_proyecto_id() IS NULL OR proyecto_id = get_current_proyecto_id()`
que permite acceso tenant-wide cuando no hay proyecto en el contexto de sesión.
Verificado por grep: **ningún endpoint real en `main.ts` llama a
`createTenantContext()` sin `proyecto_id`** — todas las llamadas pasan ambos
valores. Ese fallback es código muerto en la práctica hoy (no se elimina de
las tablas existentes en este change, fuera de alcance), pero las políticas
NUEVAS de este change no deben replicarlo — usan `AND` estricto, igual que el
patrón ya usado en `personal`/`finanzas`/`compras`.

Auditoría línea por línea de `apps/gerencia-tecnica/src/main.ts` confirmó que
las 9 tablas sin RLS ya se consultan con filtro explícito de `tenant_id`
(y `proyecto_id` cuando aplica) en cada endpoint HTTP — vía composite unique
keys (`uq_proyecto_costos_config`, `uq_concepto_insumo`, `uq_saldo_partida`,
`uq_compra_proyectada_oc_insumo`) o vía `findFirst({ where: { ..., tenant_id }
})` antes de actuar sobre una PK con `.update()`/`.delete()`. Único gap de
código real: 2 handlers de evento de RabbitMQ
(`handleOcCanceladaParaProyeccion`) que hacen
`compraProyectada.updateMany({ where: { oc_id } })` sin `tenant_id` — el input
viene del event bus interno (publicado por `compras`), no de un request
externo directo, así que el riesgo real es bajo (un `oc_id` es UUID,
colisión entre tenants es prácticamente imposible), pero se corrige por
consistencia con la disciplina exigida en el resto del proyecto.

## Goals / Non-Goals

**Goals:**
- Habilitar y forzar RLS en las 9 tablas con el patrón correcto (una política
  por tabla, `get_current_tenant_id()`/`get_current_proyecto_id()`, `AND`
  estricto donde aplica `proyecto_id`).
- Clasificar correctamente cada tabla como tenant+proyecto o solo-tenant según
  cómo el código la usa realmente, no solo por las columnas del schema —
  `proyectos_obra_vinculados` es el caso especial (tiene `proyecto_id` pero se
  lista tenant-wide).
- Verificar con el mismo rigor que `compras` dado que hay datos reales.

**Non-Goals:**
- No se toca el fallback `IS NULL` de la política existente de
  `presupuestos_base`/`conceptos` — es código muerto hoy pero cambiarlo es un
  cambio de comportamiento no relacionado con el gap que este change cierra.
- No se corrige ningún otro microservicio en este change (`personal` y
  `compras` ya resueltos en sesiones previas).
- No se refactoriza el código ya correcto que filtra `tenant_id`
  explícitamente — solo se agrega el backstop de RLS y el único gap real
  encontrado (el handler de evento).

## Decisions

**Clasificación tenant+proyecto vs solo-tenant, por uso real de código:**
- `categorias_gasto`, `compras_proyectadas`, `concepto_insumos`,
  `proyecto_costos_config`, `saldo_partidas`: tenant+proyecto (`AND`
  estricto) — todas se consultan siempre con ambos valores en el `where` o
  clave compuesta.
- `fichas_tecnicas_insumo`, `saldo_movimientos`, `transferencia_partidas`:
  solo tenant — no tienen columna `proyecto_id` propia en el schema.
- `proyectos_obra_vinculados`: solo tenant, PESE A tener columna
  `proyecto_id` — el código la trata como catálogo tenant-wide
  (`GET /trazabilidad/vinculos-obra` lista todos los proyectos vinculados del
  tenant sin acotar al proyecto "actual" de la sesión). Una política
  tenant+proyecto rompería ese listado. Mismo criterio de juicio ya aplicado
  en `personal` (`empleados` es solo-tenant aunque el negocio tenga noción de
  proyecto) y en `compras`.

**Sin `DROP POLICY` de nada existente** — a diferencia de `personal`
(política huérfana con patrón distinto) y de `compras` (política declarada
pero sin `ENABLE`), aquí las 9 tablas no tienen ninguna política previa que
limpiar; es una extensión limpia del archivo.

**Fix del handler de evento**: agregar `tenant_id: event.context.tenant_id`
al `where` de `compraProyectada.updateMany()` en
`handleOcCanceladaParaProyeccion`. Cambio de una línea, sin tocar la lógica de
negocio.

## Risks / Trade-offs

**[Riesgo] Aplicar `FORCE ROW LEVEL SECURITY` sobre tablas con datos reales
(`saldo_partidas`=100, `categorias_gasto`=30) podría romper un endpoint que
dependa de un `app.current_proyecto_id` mal seteado en algún code path no
auditado.** → Mitigación: `createTenantContext` en `apps/gerencia-tecnica/src/db.ts`
solo omite `set_config` de `proyecto_id` si `ctx.proyecto_id` es falsy —
confirmado por grep que eso nunca ocurre en el código actual. Smoke test con
JWT real sobre los endpoints de `saldo-partida`, `categorias-gasto` y
`trazabilidad/vinculos-obra` antes/después de aplicar.

**[Riesgo] La política solo-tenant de `proyectos_obra_vinculados` permite que
una sesión de cualquier proyecto del tenant vea/modifique vínculos de OTROS
proyectos del mismo tenant.** → Aceptado explícitamente: es el comportamiento
ya intencional del código (`WHERE tenant_id` sin `proyecto_id` en el listado,
`UPDATE ... WHERE tenant_id AND proyecto_id AND estado` sí acota al proyecto
específico para escrituras puntuales) — la política solo-tenant no relaja
nada que el código ya no permitiera; solo iguala el nivel de RLS al nivel de
aislamiento que el propio diseño de la tabla ya tiene.

**[Trade-off] No se corrige el fallback `IS NULL` de las 3 tablas originales**
aunque sea código muerto — cambiar una política ya en producción con 14 días
de antigüedad y sin problema activo conocido está fuera del alcance de este
bug-fix puntual.

## Migration Plan

1. Extender `apps/gerencia-tecnica/prisma/rls-policies.sql` con las 9 tablas.
2. Agregar `tenant_id` al `where` de `handleOcCanceladaParaProyeccion` en
   `main.ts`.
3. `tsc --noEmit` limpio en `apps/gerencia-tecnica`.
4. Aplicar el SQL contra `bocam_gerencia_tecnica` en producción.
5. Verificar en rojo→verde con transacciones `BEGIN...ROLLBACK` contra el VPS
   real (mismo mecanismo que `personal`/`compras`) para al menos una tabla
   tenant+proyecto (`saldo_partidas`, ya tiene datos reales) y una solo-tenant
   (`proyectos_obra_vinculados`).
6. Smoke test con JWT real sobre los endpoints reales.
7. Confirmar conteo de filas sin cambios (vía `bocam_admin` bypass).
8. Commit + push; rebuild/restart de `bocam-vps-gerencia-tecnica` solo por el
   cambio de una línea en el handler de evento (el RLS no requiere redeploy,
   se aplica directo en Postgres).
9. Rollback por tabla: `ALTER TABLE <tabla> NO FORCE ROW LEVEL SECURITY;
   ALTER TABLE <tabla> DISABLE ROW LEVEL SECURITY;` si algo bloquea tráfico
   legítimo.

## Open Questions

Ninguna pendiente — el alcance de este change quedó acotado a `gerencia-tecnica`
tras la auditoría completa de todos los microservicios en la sesión previa
(ver memoria `hallazgo-rls-drift-compras-gerencia-tecnica-2026-07-26`).

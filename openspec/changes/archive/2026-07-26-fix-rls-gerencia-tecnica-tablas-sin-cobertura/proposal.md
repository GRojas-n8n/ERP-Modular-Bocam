## Why

Auditoría de hoy (2026-07-26) contra `bocam-vps-postgres`, continuando el barrido iniciado
tras cerrar `fix-rls-personal-tablas-nuevas` y `fix-rls-compras-tablas-sin-cobertura`,
encontró que **9 tablas de `bocam_gerencia_tecnica`** con columnas
`tenant_id`/`proyecto_id` tienen `relrowsecurity=false` — sin ninguna política RLS.
Solo 3 tablas del servicio (`insumos`, `presupuestos_base`, `conceptos`) tienen RLS,
desde el change original `fix-rls-bypass-bocam-admin` (2026-07-10/11). Las 9 restantes
se agregaron por features posteriores (control-costos-wbs, trazabilidad-partida-gt-cp,
unificar-presupuesto-a-partidas-gt, fichas-tecnicas-insumos) y nunca extendieron
`apps/gerencia-tecnica/prisma/rls-policies.sql`.

A diferencia de `compras` (`openspec/changes/archive/2026-07-26-fix-rls-compras-tablas-sin-cobertura`,
que tenía una fuga IDOR activa real), aquí se auditó línea por línea cada endpoint HTTP
que toca estas 9 tablas en `apps/gerencia-tecnica/src/main.ts` y **todos filtran
`tenant_id` (y `proyecto_id` cuando aplica) explícitamente** antes de leer o escribir —
vía composite unique keys (`uq_proyecto_costos_config`, `uq_concepto_insumo`,
`uq_saldo_partida`, `uq_compra_proyectada_oc_insumo`) o vía `findFirst`/`where` con
`tenant_id` antes de actuar sobre una PK. El código ya está bien; el problema es puro
backstop de base de datos faltante — mismo patrón y severidad que ya se resolvió en
`personal`, no como el caso de `compras`.

## What Changes

- Extender `apps/gerencia-tecnica/prisma/rls-policies.sql` con las 9 tablas, usando el
  patrón de funciones auxiliares ya establecido en este archivo
  (`get_current_tenant_id()`/`get_current_proyecto_id()`), con `AND` estricto (sin el
  fallback `OR ... IS NULL` que tiene la política existente de `presupuestos_base`/
  `conceptos` — confirmado por grep que ningún endpoint real llama a
  `createTenantContext()` sin `proyecto_id` hoy, así que ese fallback es código muerto
  en la práctica y no debe replicarse en las políticas nuevas).
- Clasificar cada tabla como tenant+proyecto o solo-tenant según cómo el código
  realmente la consulta (no solo por qué columnas tiene el schema): `proyectos_obra_vinculados`
  tiene columna `proyecto_id` pero se lista de forma tenant-wide en
  `GET /trazabilidad/vinculos-obra`, así que necesita política solo-tenant pese a la
  columna.
- Agregar `tenant_id` explícito al `where` de
  `handleOcCanceladaParaProyeccion` (`compraProyectada.updateMany({ where: { oc_id } })`)
  — hallazgo menor de código, un handler de evento de RabbitMQ que confía solo en
  `oc_id` sin `tenant_id`; riesgo bajo (input viene del event bus interno, no de un
  request externo) pero corregible por consistencia con el resto del código.
- Aplicar en producción con el mismo rigor que `compras` — hay datos reales
  (`saldo_partidas`=100 filas, `categorias_gasto`=30 filas).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `despliegue-completo-microservicios`: se agrega un requisito nuevo (ADDED) que
  documenta explícitamente el criterio de juicio usado aquí para
  `proyectos_obra_vinculados` — una tabla con columna `proyecto_id` no debe asumirse
  tenant+proyecto sin verificar primero cómo el código realmente la consulta. El
  requisito general de cobertura de RLS ya existía desde
  `fix-rls-compras-tablas-sin-cobertura`; este change solo implementa ese requisito
  para `gerencia-tecnica` y añade esta precisión adicional descubierta en el proceso.

## Impact

- **Código**: `apps/gerencia-tecnica/prisma/rls-policies.sql` (extendido),
  `apps/gerencia-tecnica/src/main.ts` (1 línea en `handleOcCanceladaParaProyeccion`).
- **Infra**: aplicar SQL contra `bocam_gerencia_tecnica` en el VPS de producción. Sin
  cambio de rol de conexión (`bocam_app` ya es correcto, sin `BYPASSRLS`/`SUPERUSER`).
- **Riesgo de regresión**: hay datos reales en varias de las 9 tablas — verificar con
  cuidado (smoke test con JWT real, comparar conteo de filas antes/después), mismo
  procedimiento que `compras`.
- **Severidad**: media (defensa en profundidad, sin fuga activa confirmada) — menos
  urgente que `compras`, pero mismo tipo de gap de seguridad que debe cerrarse.

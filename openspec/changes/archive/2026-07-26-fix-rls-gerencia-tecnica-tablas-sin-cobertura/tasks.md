## 1. Escribir la extensión de rls-policies.sql

- [x] 1.1 Extender `apps/gerencia-tecnica/prisma/rls-policies.sql`: `ENABLE` +
      `FORCE ROW LEVEL SECURITY` en las 9 tablas.
- [x] 1.2 Política combinada `get_current_tenant_id() = tenant_id AND
      get_current_proyecto_id() = proyecto_id` (AND estricto, sin fallback
      `IS NULL`) para `categorias_gasto`, `compras_proyectadas`,
      `concepto_insumos`, `proyecto_costos_config`, `saldo_partidas`.
- [x] 1.3 Política solo `tenant_id = get_current_tenant_id()` para
      `fichas_tecnicas_insumo`, `saldo_movimientos`, `transferencia_partidas`,
      `proyectos_obra_vinculados` (esta última pese a tener columna
      `proyecto_id` — ver design.md).
- [x] 1.4 Confirmado por grep: 12 `CREATE POLICY` (3 originales + 9 nuevas),
      1 por tabla, sin patrón de OR-duplicado.

## 2. Fix de código menor

- [x] 2.1 Agregado `tenant_id: event.context.tenant_id` al `where` de
      `compraProyectada.updateMany()` en `handleOcCanceladaParaProyeccion`
      (`apps/gerencia-tecnica/src/main.ts`).
- [x] 2.2 `tsc --noEmit` limpio en `apps/gerencia-tecnica`.

## 3. Aplicar en producción y verificar

- [x] 3.1 Confirmado ownership de las 9 tablas: `bocam_app` en todas.
- [x] 3.2 Aplicado `rls-policies.sql` completo contra `bocam_gerencia_tecnica`
      en el VPS, sin errores.
- [x] 3.3 Confirmado `relrowsecurity=true`/`relforcerowsecurity=true`/1
      política en las 9 tablas (12 tablas totales del servicio).
- [x] 3.4 Verificado en rojo→verde con transacciones `BEGIN...ROLLBACK`
      contra el VPS real: `saldo_partidas` (tenant+proyecto) — 2 filas
      sintéticas mismo tenant, distinto proyecto, solo 1 visible desde el
      contexto correcto; `proyectos_obra_vinculados` (solo tenant) — 2 filas
      del mismo tenant en distintos proyectos SÍ ambas visibles (confirma que
      el listado tenant-wide sigue funcionando), 1 fila de otro tenant
      correctamente invisible.
- [x] 3.5 Confirmado conteo de filas sin cambios (vía `bocam_admin` bypass):
      `categorias_gasto`=30, `concepto_insumos`=1927, `saldo_partidas`=100,
      `saldo_movimientos`=1, resto en 0 — sin pérdida de datos.
- [x] 3.6 Smoke test con JWT real (`iretum@bocam.com.mx`, tenant/proyecto
      reales): `GET /proyectos/:id/categorias-gasto` → 200 con datos reales;
      `GET /proyectos-vinculados` → 200 (`[]`, sin datos para este
      tenant/proyecto); `GET /partidas/:concepto_id/saldo` con un
      `concepto_id` real → 200 con datos reales completos. Nota: la tarea
      original decía `GET /trazabilidad/vinculos-obra` — el path real es
      `GET /proyectos-vinculados` (corrección de una referencia incorrecta en
      el proposal/design, no un bug funcional).

## 4. Desplegar el fix de código y cerrar

- [x] 4.1 Commit + push del cambio de `rls-policies.sql` + `main.ts` (1
      línea).
- [x] 4.2 Rebuild + restart de `bocam-vps-gerencia-tecnica`.
- [x] 4.3 Contenedor healthy tras el redeploy.
- [x] 4.4 Memoria del hallazgo actualizada marcando `gerencia-tecnica` como
      resuelto.

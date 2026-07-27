## 1. Confirmar alcance y capturar estado rojo

- [x] 1.1 Auditoría completa de código (agente Explore): 2 modelos, 13 sitios de acceso
      a datos revisados. Confirmado 1 gap real: `PATCH /inventario/:id`
      (`main.ts:147-153`), sin verificación de tenant y devolviendo la fila completa
      actualizada.
- [x] 1.2 Confirmado ownership `bocam_app`, sin políticas/funciones huérfanas.
- [x] 1.3 Confirmado ambas tablas vacías en producción (0 filas) — sin riesgo de
      pérdida de datos al aplicar `FORCE ROW LEVEL SECURITY`.

## 2. RLS

- [x] 2.1 Escrito `apps/almacen/prisma/rls-policies.sql` — `inventario_almacen` y
      `movimientos_almacen`, política `tenant_id AND proyecto_id`.
- [x] 2.2 Aplicado contra `bocam_almacen` en producción, sin errores.
- [x] 2.3 Confirmado `relrowsecurity=true`/`relforcerowsecurity=true`/1 política en
      ambas tablas.
- [x] 2.4 Verificado en verde con datos sintéticos en transacción `BEGIN...ROLLBACK`:
      cross-tenant y cross-proyecto (mismo tenant) ambos bloqueados; `UPDATE`
      cross-proyecto afectó 0 filas.
- [x] 2.5 Confirmado conteo de filas sin cambios (0 en ambas tablas, antes y después).
- [x] 2.6 Smoke test con JWT real sobre el código todavía no desplegado: `GET
      /inventario` y `/dashboard` sin regresión.

## 3. Fix de código

- [x] 3.1 `PATCH /inventario/:id` — reemplazado `update` directo por `findFirst`
      tenant+proyecto-scoped + 404 explícito si no pertenece a la sesión, siguiendo el
      idioma ya usado en `POST /inventario` del mismo archivo.
- [x] 3.2 `tsc --noEmit` limpio en `apps/almacen`.

## 4. Tests

- [x] 4.1 `apps/almacen/test/integration/rls-idor-inventario.integration.test.ts`
      escrito (reproduce el IDOR contra el endpoint HTTP real). **No ejecutado** — sin
      Postgres local en esta sesión.

## 5. Deploy y cierre

- [x] 5.1 Commit (`34e8783`) + push a `origin main`.
- [x] 5.2 VPS: `git pull` + `docker compose build almacen` + `up -d`; contenedor
      `bocam-vps-almacen` healthy.
- [x] 5.3 Smoke test end-to-end contra el código desplegado: ítem real creado vía API
      (tenant A), atacado vía `PATCH` (tenant B) → `404` confirmado, datos del ítem
      intactos (`ubicacion` sin cambiar); ítem de prueba limpiado tras la verificación.
- [x] 5.4 Memoria del hallazgo actualizada.

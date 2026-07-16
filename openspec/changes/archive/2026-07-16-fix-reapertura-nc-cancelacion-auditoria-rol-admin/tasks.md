## 1. Tests que reproducen el bug (primero, en rojo)

- [x] 1.1 Confirmar que `apps/calidad/test/integration/workflow-nc.integration.test.ts`
      → `testReaperturaAdmin` (ya existente) falla en rojo contra el código
      actual (`403 !== 200` en el intento de reapertura de admin).
      → Confirmado 2026-07-16 contra 127.0.0.1:5432 local.
- [x] 1.2 Nuevo `apps/calidad/test/integration/workflow-auditoria.integration.test.ts`:
      caso admin cancela una auditoría `PROGRAMADA` → hoy falla (403); caso
      rol no-admin intenta cancelar → debe seguir en 403. En rojo contra el
      código actual para el primer caso.
      → Confirmado en rojo (`403 !== 200`) antes del fix.

## 2. Fix

- [x] 2.1 `apps/calidad/src/main.ts` línea ~178/190 (`PATCH
      /no-conformidades/:id`, gate de reapertura): reemplazar `const { rol
      } = req.securityContext as any; ... rol !== 'admin'` por
      `!req.securityContext.roles.includes('admin')`.
- [x] 2.2 `apps/calidad/src/main.ts` línea ~363/383 (`PATCH
      /auditorias/:id`, gate de cancelación): mismo reemplazo.
      → Adicional: `validarTransicionNC` tenía un 4º parámetro `rol` sin
      uso real dentro de la función (dead parameter) que dependía de la
      misma variable eliminada — se quitó de la firma y del call site
      (línea ~198) para no dejar una referencia rota; no afecta ningún
      gate real (confirmado por lectura antes de tocarlo, ver design.md).

## 3. Verificación

- [x] 3.1 `testReaperturaAdmin` en verde (sin modificarlo). → 4 passed, 0
      failed en `workflow-nc.integration.test.ts` completo.
- [x] 3.2 `workflow-auditoria.integration.test.ts` en verde. → 1 passed, 0
      failed.
- [x] 3.3 `tsc --noEmit` en `apps/calidad` limpio.
- [x] 3.4 Resto de la suite de integración de `calidad` sigue en verde (sin
      regresión): `adjuntos-upload-multer` (3/3 ok), `aislamiento-proyecto`
      (4/4), `hallazgo-a-nc` (5/5).

## 4. Cierre

- [x] 4.1 PR contra `main`, CI verde, merge.
      → PR #72 mergeado (squash `23976b1`).
- [x] 4.2 Redeploy VPS de `calidad` (build + `up -d`, sin migración).
      → Hecho 2026-07-16: build limpio, contenedor recreado, healthy.

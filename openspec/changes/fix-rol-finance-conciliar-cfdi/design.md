## Context

`apps/contabilidad/src/main.ts:1997` protege `POST
/api/v1/contabilidad/asientos/:id/conciliar-cfdi` con `requireRoles('admin',
'finance')`. `'finance'` no es un rol real del sistema; el rol real de
Finanzas es `'finanzas'` (verificado en PR #76 para el microservicio
`apps/finanzas`, mismo hallazgo, servicio distinto). El resto de
`requireRoles(...)` en este mismo archivo también usa `'finance'` en
lugar de `'finanzas'` (confirmado por grep: 17 ocurrencias), por lo que
el alcance real de este fix es más amplio que un solo endpoint.

## Goals / Non-Goals

**Goals:**
- Que los endpoints de `apps/contabilidad/src/main.ts` que hoy exigen
  `'finance'` exijan `'finanzas'` en su lugar.
- Reproducir el bug con un test de integración ANTES del fix (TDD del
  bug, regla del proyecto).

**Non-Goals:**
- No se tocan otros microservicios (`apps/compras`, `apps/asistente`,
  `apps/auth`, `packages/auth-middleware`) — cada uno requiere su propio
  spec de bug-fix si se confirma que el mismatch los afecta realmente.
- No se refactoriza `requireRoles` ni el sistema de roles en general.

## Decisions

- **Corregir las 17 ocurrencias de `'finance'` en
  `apps/contabilidad/src/main.ts`, no solo `conciliar-cfdi`.** El
  hallazgo original solo reportaba el endpoint de conciliación, pero el
  grep de verificación (2026-07-28) encontró el mismo string en otros 16
  `requireRoles(...)` del mismo archivo. Dejarlos sin corregir
  significaría repetir este mismo bug-fix cycle completo por cada
  endpoint descubierto después. Alternativa considerada: corregir solo
  `conciliar-cfdi` (alcance mínimo del hallazgo original) — se descarta
  porque el patrón de causa raíz es idéntico y ya está confirmado en el
  mismo archivo.
- **Test de integración reutiliza el patrón de PR #76**: un token con
  `roles: ['finanzas']` debe recibir 2xx/lo que corresponda por lógica de
  negocio (no 403 por rol); un token con `roles: ['finance']` (rol
  inexistente) debe recibir 403 `CONT_FORBIDDEN` o el código de error que
  ya use `requireRoles` en este servicio.
- **Buscar tokens de test en otros microservicios que usen `'finance'`
  para llamar a estos endpoints de contabilidad**, siguiendo el patrón
  documentado en PR #76 (`grep -rn "roles:\s*\['finance'\]"` sobre todo
  el repo, no solo `apps/contabilidad/test/`), para no romper tests
  existentes que dependían del string viejo.

## Risks / Trade-offs

- [Ampliar el alcance a las 17 ocurrencias puede tocar endpoints no
  relacionados con conciliación de CFDI] → Mitigación: cada endpoint ya
  usa el mismo `requireRoles('admin', 'finance', ...)` con la misma
  intención (autorizar al rol de Finanzas); no hay lógica adicional que
  dependa del string exacto `'finance'`.
- [Tests de otros microservicios podrían romperse si construían tokens
  con `roles: ['finance']` para llamar a contabilidad] → Mitigación:
  grep de todo el repo antes de mergear, igual que en PR #76.

## Migration Plan

No aplica migración de datos. Es un cambio de código (string de rol en
middleware de autorización) desplegado vía el CI/CD normal de
`apps/contabilidad`. Rollback: revertir el commit/PR.

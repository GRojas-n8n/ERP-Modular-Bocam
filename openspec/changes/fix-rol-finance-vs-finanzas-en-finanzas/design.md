## Context

`apps/finanzas/prisma` no tiene enum de roles — `rol_global` en
`apps/auth/prisma/schema.prisma` es `String[]` de texto libre. No existe
una constante ni un enum compartido que centralice el catálogo de roles
válidos entre `auth`, `app-shell` y cada microservicio — cada uno los
hardcodea por su cuenta. Esto ya causó el mismo tipo de bug antes en este
repo (ver `packages/auth-middleware` vs `apps/calidad` en el fix de
`rol` singular vs `roles[]`, sesión 2026-07-16) — aquí es una variante:
ambos lados usan `roles[]` correctamente, pero el *valor* del string no
coincide.

`grep -n "'finance'" apps/finanzas/src/main.ts` confirma 6 ocurrencias,
todas en checks RBAC manuales inline (no vía el helper `requireRoles` de
`auth-middleware`, que si se hubiera usado con `'finanzas'` desde el
principio habría evitado el bug — las otras 9 rutas del mismo archivo que
sí usan `requireRoles('finanzas', ...)` nunca tuvieron este problema).

## Goals / Non-Goals

**Goals:**
- Que un usuario real con rol `finanzas` pueda usar las 6 acciones de su
  propio módulo que hoy le devuelven 403.

**Non-Goals:**
- No se centraliza el catálogo de roles en una constante/enum compartida
  — sería la corrección estructural correcta a largo plazo (evitaría que
  esto vuelva a pasar en otro microservicio), pero es un refactor de
  arquitectura fuera de alcance de un bug-fix puntual, y el proyecto
  prohíbe refactorizar sin spec propio.
- No se audita ni se toca el string `'finance'` encontrado en otros
  microservicios (`compras`, `contabilidad`, `gerencia-tecnica`,
  `packages/auth-middleware/src/middleware.ts:248`,
  `apps/auth/src/main.ts:729`) — cada uno requeriría su propia
  verificación contra roles reales antes de tocarlo; no se asume que
  todos son bugs sin confirmarlo primero.

## Decisions

- **Renombrar `'finance'` → `'finanzas'` en vez de aceptar ambos
  strings**: no existe ningún usuario real ni de prueba con rol
  `'finance'` literal (verificado en BD de prod y en el seed de `auth`),
  así que no hay necesidad de mantener compatibilidad con ese valor —
  aceptar ambos sería cargar deuda técnica innecesaria a futuro.
- **Actualizar los 2 tests e2e existentes en vez de agregar uno nuevo
  paralelo**: `seguridad.e2e.test.ts` y `idempotencia.e2e.test.ts` ya
  representan a "un usuario de Finanzas autorizado" con
  `roles: ['finance']` — ese es exactamente el bug (un rol que nunca
  existió en la realidad). Corregirlos a `'finanzas'` los alinea con un
  usuario real y sirve como test de regresión permanente.

## Risks / Trade-offs

- **[Riesgo] Ninguno relevante para producción** — nadie tiene el rol
  `'finance'` hoy, así que no se le quita acceso a nadie; dos usuarios
  reales ganan acceso a funciones que ya deberían haber tenido.

## Migration Plan

1. Test nuevo/temporal con `roles: ['finanzas']` (el rol real) contra
   `POST /presupuestos` — confirmar en rojo (403) contra el código
   actual antes del fix.
2. Fix: 6 gates + 6 mensajes en `apps/finanzas/src/main.ts`.
3. Actualizar `seguridad.e2e.test.ts` e `idempotencia.e2e.test.ts` a
   `roles: ['finanzas']`.
4. Suite completa de tests de `finanzas` en verde. `tsc --noEmit` limpio.
5. PR, merge, redeploy VPS de `finanzas`.

**Rollback**: revertir el commit — sin cambios de esquema ni de datos.

## Open Questions

(ninguna)

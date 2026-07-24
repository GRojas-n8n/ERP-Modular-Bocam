## Context

`apps/personal/prisma` no tiene enum de roles — `rol_global` en
`apps/auth/prisma/schema.prisma` es `String[]` de texto libre, igual que en
`finanzas`. No existe un catálogo compartido de roles válidos entre `auth`,
`app-shell` y cada microservicio — cada uno los hardcodea. Esto ya causó el
mismo tipo de bug antes en este repo: `'finance'` vs `'finanzas'` en
Finanzas (PR #76) y `rol` singular vs `roles[]` en Calidad. Aquí es la misma
variante que en Finanzas: ambos lados usan `roles[]` correctamente, pero el
*valor* del string de rol no coincide.

`grep -rn "rh_manager" apps/` confirma exactamente 2 ocurrencias, ambas en
`apps/personal/src/main.ts` (líneas 686 y 736), ninguna en ningún seed,
test, ni catálogo de roles del sistema. Las otras 17 rutas del mismo archivo
que usan el helper `requireRoles('personal_rh', 'admin')` nunca tuvieron
este problema — la diferencia es que `autorizar` y `pagar` implementan el
check de rol manualmente inline (`if (!roles.includes(...))`) en vez de usar
`requireRoles`, igual que en el bug de Finanzas.

## Goals / Non-Goals

**Goals:**
- Que el usuario real con rol `personal_rh` pueda autorizar y marcar como
  pagada una pre-nómina, sin depender de que un `admin` lo haga por él.

**Non-Goals:**
- No se centraliza el catálogo de roles en una constante/enum compartida —
  sería la corrección estructural correcta a largo plazo, pero es un
  refactor de arquitectura fuera de alcance de un bug-fix puntual, y el
  proyecto prohíbe refactorizar sin spec propio.
- No se migra `autorizar`/`pagar` a usar el helper `requireRoles` (que
  evitaría este tipo de bug a futuro) — cambiar el mecanismo de gate es un
  cambio más amplio que el bug puntual reportado; el fix mínimo es corregir
  el string de rol dentro del mismo patrón inline ya existente.
- No se toca ningún otro microservicio, aunque el mismo patrón de bug
  (rol ficticio sin usuarios reales) podría existir en otro lugar — cada
  caso requeriría su propia verificación antes de tocarlo.

## Decisions

- **Renombrar `'rh_manager'` → `'personal_rh'` en vez de aceptar ambos
  strings**: no existe ningún usuario real ni de prueba con rol
  `rh_manager` (verificado por grep global — 0 ocurrencias fuera de estas
  dos condiciones), así que no hay necesidad de mantener compatibilidad con
  ese valor. Mismo criterio que PR #76.
- **Mantener el gate como check manual inline (`roles.includes(...)`) en
  vez de migrar a `requireRoles(...)`**: consistente con el alcance mínimo
  de un bug-fix; migrar el mecanismo es una mejora estructural que merece
  su propio change si se decide hacerla.

## Risks / Trade-offs

- **[Riesgo] Ninguno relevante para producción** — nadie tiene el rol
  `rh_manager` hoy, así que no se le quita acceso a nadie; el usuario real
  de RH gana acceso a acciones que ya debería haber tenido.
- **[Riesgo] Tests de integración en otros servicios podrían simular a RH
  con el rol ficticio `rh_manager` contra estos dos endpoints** (igual que
  PR #76 encontró 9 tests de otros servicios con `'finance'`) → Mitigación:
  correr la suite completa de `apps/personal` y grep de `rh_manager` en
  todo el monorepo antes de cerrar el change (ver tasks.md sección 3).

## Migration Plan

1. Test nuevo/temporal con `roles: ['personal_rh']` (el rol real) contra
   `PATCH /prenominas/:id/autorizar` sobre una pre-nómina `CALCULADA` —
   confirmar en rojo (403) contra el código actual antes del fix.
2. Mismo test contra `PATCH /prenominas/:id/pagar` sobre una pre-nómina
   `AUTORIZADA`.
3. Fix: 2 gates + 2 mensajes en `apps/personal/src/main.ts`.
4. Grep global de `rh_manager` en el monorepo — corregir cualquier test que
   lo use para simular RH.
5. Suite completa de tests de `personal` en verde. `tsc --noEmit` limpio.
6. PR, merge, redeploy VPS de `personal`.

**Rollback**: revertir el commit — sin cambios de esquema ni de datos.

## Open Questions

(ninguna)

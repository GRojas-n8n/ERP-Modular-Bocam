## Context

`apps/seguridad/src/main.ts` protege hoy sus 19 rutas de negocio con
`requireRoles('seguridad_hse', 'superintendent', 'admin')` (18 rutas, fijadas
en `df8b858`) más `resumen-dashboard`, que exige `requireRoles('superintendent',
'admin')` a propósito (dashboard ejecutivo, sin consumidor `seguridad_hse`
— fuera de alcance, ver `feat(dashboard): dashboard ejecutivo consolidado
para superintendent/admin`).

`packages/roles/src/index.ts` no se tocó en `df8b858`: sigue marcando
`seguridad_hse` como `sin-backend`, estado que en `AdminView.tsx` dispara un
punto ámbar y una nota de advertencia junto al botón del rol, y que en
`ROLES_ASIGNABLES` sigue ofreciéndolo igual (ese filtro ya incluye
`sin-backend`) — es decir, el catálogo desactualizado no bloquea el alta, solo
miente sobre el resultado.

## Goals / Non-Goals

**Goals:**
- Que el catálogo refleje el estado real: `seguridad_hse` abre su módulo.
- Que quede un test automático que hubiera detectado este lapso, para que no
  vuelva a pasar con otro rol tras un fix de backend futuro.

**Non-Goals:**
- No se toca `apps/seguridad/src/main.ts` — ya está correcto.
- No se revisa `resumen-dashboard` — su alcance a `superintendent`/`admin` es
  una decisión de diseño previa y documentada, no un bug.
- No se revisa el rol `ventas` (mismo estado `sin-backend`, pero su nota sí
  es precisa hoy: `apps/ventas` únicamente comprueba `admin`). Ese caso es un
  bug de backend real, no documental — sigue el patrón de
  `rbac-contabilidad-rol-sin-backend`, no el de este cambio.

## Decisions

**Guardián automático en vez de una corrección puntual únicamente.** El bug
no fue "alguien escribió mal el estado": fue que un cambio de backend
(`df8b858`) tenía alcance explícito a `apps/seguridad/src/main.ts` y nadie
recordó tocar `packages/roles/src/index.ts` en el mismo PR. Corregir solo la
entrada de `seguridad_hse` deja el mismo lapso disponible para el próximo rol
que se arregle en el backend. Se añade una prueba en `catalogo.test.ts` —el
mismo archivo que ya recorre `apps/*/src` buscando `requireRoles(...)`— que
falla si un rol `sin-backend` aparece en algún `requireRoles(...)` real.

## Risks / Trade-offs

- [El nuevo test guardián podría marcar falso positivo si un servicio usa el
  nombre de un rol `sin-backend` en un comentario o string no relacionado] →
  Mismo riesgo que ya asume `rolesExigidosPorBackend()` para las pruebas
  existentes (usa el mismo regex sobre `requireRoles(...)`); no es un riesgo
  nuevo introducido por este cambio.

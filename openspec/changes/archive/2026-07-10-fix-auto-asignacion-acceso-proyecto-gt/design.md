## Context

`apps/auth` es el microservicio dueño de las tablas `Proyecto` y
`UserProjectAccess` (control de acceso a proyectos por usuario individual, no
por rol). El endpoint `POST /api/v1/auth/admin/proyectos` crea el proyecto y,
en la misma transacción Prisma, auto-asigna acceso a un subconjunto de
usuarios para que el proyecto aparezca de inmediato en su selector — hoy ese
subconjunto es `['admin', 'superintendent']`, una lista embebida inline en el
handler sin ningún test que la cubra.

## Goals / Non-Goals

**Goals:**
1. `gerencia_tecnica` recibe acceso automático a todo proyecto nuevo del
   tenant, igual que `admin`/`superintendent`.
2. La lista de roles con auto-asignación queda en una función pura y testeada,
   no inline en el handler.

**Non-Goals:**
- No se cambia el modelo de datos (`UserProjectAccess` sigue siendo por
  usuario individual, no por rol) — sería una migración mayor fuera de este
  bug-fix.
- No se toca el flujo manual de asignación en `AdminView.tsx`.
- No se auto-asignan otros roles (compras, residentes, seguridad, calidad) —
  el usuario del producto solo pidió ampliar a `gerencia_tecnica`.

## Decisions

**D1 — Lista blanca ampliada a `['admin', 'superintendent', 'gerencia_tecnica']`,
en vez de auto-asignar a todos los roles del tenant.**
Alternativa considerada — auto-asignar a todo usuario activo del tenant sin
filtrar por rol: se descartó explícitamente por decisión del usuario del
producto, que solo pidió ampliar a `gerencia_tecnica` y mantener el resto del
comportamiento (acceso restringido, asignación manual para otros roles).

**D2 — Extraer a `project-access-policy.ts` como función pura, siguiendo el
patrón ya establecido por `login-policy.ts` en el mismo servicio.**
Permite testear con `node --test` (convención real de este servicio — el
`package.json` usa `node --test`, no Jest, pese a que `CLAUDE.md` documenta
Jest como stack de testing general) sin necesitar una base de datos ni mockear
Prisma completo. Alternativa considerada — test de integración con Prisma real
contra una BD de prueba: se descartó por ser desproporcionado para una función
de filtrado de roles sin efectos secundarios.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Proyectos ya creados antes de este fix siguen sin acceso para gerentes técnicos existentes (el fix solo aplica a creaciones futuras) | Fuera de alcance de este bug-fix — es una migración de datos retroactiva; si se necesita, es un change aparte. Se puede resolver manualmente vía `AdminView.tsx` mientras tanto. |
| Ampliar la lista blanca podría no ser lo que el negocio quiere para todos los tenants | Decisión explícita confirmada con el usuario del producto antes de implementar (no es una suposición) |

## Migration Plan

1. Crear `project-access-policy.ts` con la función pura + su test (test primero,
   debe fallar contra el comportamiento actual).
2. Actualizar `main.ts` para usar la función extraída.
3. Verificar que el test pasa.
4. **Rollback:** revertir el commit — no hay migración de datos, es lógica de
   aplicación pura.

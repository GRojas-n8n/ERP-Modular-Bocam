## Context

Un solo microservicio (`auth`), tres líneas, sin cambio de esquema ni de
dependencias. Se documenta aquí solo porque el schema de OpenSpec de este
repo exige `design.md` antes de `tasks.md`; no hay decisión arquitectónica
real que tomar — el valor correcto (`residencia`) ya está determinado por
`packages/roles/src/index.ts` como el canónico de `resident`.

## Goals / Non-Goals

**Goals:**
- Que un usuario nuevo creado sin `roles` explícito (vía `/register` o vía
  `/admin/users`) reciba `residencia`, no `resident`.
- Que el usuario semilla `residente@alfa.bocam.com` en `seed.ts` quede
  consistente con el valor real que ya tiene en las bases locales y de
  producción.

**Non-Goals:**
- No se migra a los usuarios existentes (no hay ninguno con `resident` como
  único rol hoy — ver proposal.md).
- No se elimina `resident` del catálogo de roles ni se toca la validación de
  `packages/roles` — sigue siendo un alias aceptado para edición
  (`actualizarUsuarioSchema`) y para JWTs ya emitidos.
- No se toca ningún otro microservicio: `personal` y `control-proyectos` ya
  exigen `residencia` correctamente; `compras` ya acepta ambos.

## Decisions

- **Cambiar el literal del fallback, no añadir normalización de alias.** Se
  consideró interceptar `resident` en el middleware de auth (`packages/auth-middleware`)
  y traducirlo a `residencia` en tiempo de request, pero eso ocultaría el
  problema real (el punto de creación de usuarios) detrás de una capa de
  compatibilidad permanente, y afectaría a todos los servicios que ya
  aceptan `resident` explícitamente (`compras`, `almacen`) sin necesidad.
  Corregir el default en `auth` es más simple, más local, y no introduce
  ningún comportamiento nuevo en tiempo de request.
- **No tocar el catálogo de roles.** `resident` sigue listado como alias
  (`estado: 'alias'`) — eso es correcto y deliberado: JWTs viejos y usuarios
  ya existentes con ese rol deben seguir autenticando y accediendo a lo que
  ya accedían (Compras).

## Risks / Trade-offs

- [Un test o script externo que asuma que un usuario creado sin `roles`
  recibe `resident`] → Ningún test del repo depende de ese valor (se
  confirma en tasks.md, paso de verificación previa); es un detalle de
  implementación no documentado en ningún spec como comportamiento
  esperado.

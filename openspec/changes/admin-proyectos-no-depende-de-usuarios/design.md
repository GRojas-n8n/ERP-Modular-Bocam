## Context

`AdminView.tsx` (`loadAll`, ~línea 715) cargaba `GET /admin/users` y `GET /admin/proyectos` con
`Promise.all` al montar, sin importar qué pestaña (`usuarios`/`proyectos`/`categorias`) esté
activa. `GET /admin/users` está protegido con `requireAdminRole` (solo `admin`); `GET
/admin/proyectos` acepta `ROLES_VER_CENTRO_COSTOS` (`admin`, `gerencia_tecnica`,
`control_proyectos`, `control_obra`, agregado en `acceso-proyectos-gt-control-obra`). Con
`Promise.all`, el rechazo de cualquiera de las dos promesas tumba el `try` completo.

## Decisions

- **`Promise.allSettled` en vez de `Promise.all`, con `setError` solo si ambas fallan**: opción
  mínima y quirúrgica — no cambia el contrato de ningún endpoint ni agrega checks de rol en el
  frontend (el backend ya es la fuente de verdad de permisos). Alternativa descartada: solo
  disparar el fetch de usuarios cuando `activeTab === 'usuarios'` — más "correcto" a largo plazo,
  pero mayor superficie de cambio para un hotfix; se deja como posible mejora futura fuera de
  alcance.

## Risks / Trade-offs

- [Riesgo] Un usuario sin acceso a Usuarios que de algún modo cae en la pestaña `usuarios` (no
  hay entrada de menú para eso, pero la prop `activeSubView` no está protegida) vería la tabla de
  usuarios vacía en vez de un error explícito → Aceptado: es el mismo comportamiento silencioso
  que ya tienen otras pestañas ante datos ausentes en este archivo, y esa combinación de rol+ruta
  no es alcanzable desde el sidebar real.

## Migration Plan

Cambio de frontend puro, un solo archivo. Sin migración de datos ni rollback especial.

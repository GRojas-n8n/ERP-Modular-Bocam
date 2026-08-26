## Why

`apps/auth/src/main.ts` asigna `['resident']` como rol por defecto a cualquier
usuario nuevo creado sin `roles` explícito, tanto en `POST
/api/v1/auth/register` (línea 391) como en `POST /api/v1/auth/admin/users`
(línea 946). `resident` es un alias histórico (`packages/roles/src/index.ts:109-114`,
`canonico: 'residencia'`, nota: "Compras lo acepta; Personal y Control de
Proyectos no. Usar residencia."), y de hecho `crearUsuarioSchema`
(`apps/auth/src/validation/schemas/admin-users.schema.ts:39`) **rechazaría**
`'resident'` si se enviara explícito en el alta — solo se cuela porque el
fallback vive después del parseo, cuando `roles` viene `undefined`. Un
residente nuevo que reciba ese default por omisión pierde, sin aviso, acceso a
"Mi Equipo" (403 total en Personal) y no puede registrar avances ni crear
estimaciones en Control de Proyectos (aunque sí puede leerlos, porque esas
rutas de lectura sí aceptan ambos).

Verificado hoy (2026-08-21) con sesión real de `residente@alfa.bocam.com`: su
fila en BD ya trae `rol_global: ['residencia']` (canónico), así que las 5
pestañas de `ResidenciaView.tsx` responden 200 sin excepción — el bug no
afecta a ningún usuario existente. Pero `apps/auth/prisma/seed.ts:147` sigue
creando a ese mismo usuario semilla con `['resident']` (solo no se nota
porque el `upsert` usa `update: {}` y la fila ya existía con el valor
correcto), así que un reseed desde cero, o cualquier alta nueva sin rol
explícito, reintroduce el gap.

## What Changes

- `apps/auth/src/main.ts:391` (`POST /api/v1/auth/register`): cambiar el
  fallback `roles || ['resident']` a `roles || ['residencia']`.
- `apps/auth/src/main.ts:946` (`POST /api/v1/auth/admin/users`): cambiar el
  fallback `Array.isArray(userRoles) ? userRoles : ['resident']` a
  `Array.isArray(userRoles) ? userRoles : ['residencia']`.
- `apps/auth/prisma/seed.ts:147`: cambiar `rol_global: ['resident']` a
  `rol_global: ['residencia']` para el usuario semilla
  `residente@alfa.bocam.com`, consistente con el valor real que ya tiene en
  BD.
- No se toca `packages/roles/src/index.ts`: `resident` sigue existiendo como
  alias reconocido (JWTs viejos que ya lo traigan deben seguir funcionando),
  solo deja de ser el valor que el sistema asigna por defecto a usuarios
  nuevos.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `catalogo-de-roles`: el alta de usuarios sin rol explícito (`POST
  /api/v1/auth/register` y `POST /api/v1/auth/admin/users`) SHALL asignar el
  rol canónico `residencia`, nunca el alias `resident` — mismo principio que
  ya rige el rechazo de roles no reconocidos en el alta explícita.

## Impact

- **Código**: `apps/auth/src/main.ts` (2 líneas), `apps/auth/prisma/seed.ts`
  (1 línea). Ningún otro servicio requiere cambios — `personal` y
  `control-proyectos` ya exigen `residencia` correctamente; `compras` ya
  acepta ambos y sigue aceptándolos.
- **Datos existentes**: ningún usuario en BD local o de producción tiene hoy
  `resident` como único rol (el residente semilla ya está en `residencia`),
  así que no se requiere migración de datos.
- **Compatibilidad**: sin `BREAKING` — `resident` se conserva en el catálogo
  como alias válido para JWTs y usuarios ya existentes que lo traigan; solo
  cambia qué rol reciben los usuarios *nuevos* creados sin selección
  explícita.

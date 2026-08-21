## Why

`openspec/changes/archive/2026-08-20-catalogo-canonico-de-roles` catalogó
`resident`, `compras` y `technical` como `estado: 'alias'` de `residencia`,
`procurement` y `gerencia_tecnica` — dejando explícitamente fuera de alcance
"Unificar los alias" por requerir tocar `requireRoles` y migrar usuarios
existentes (proposal.md líneas 46-52 de ese change). Ese trabajo sigue
pendiente:

- **Backend**: 20 `requireRoles(...)` en `apps/compras` y `apps/almacen` siguen
  aceptando `'resident'` junto a `'residencia'`; 5 en `apps/gerencia-tecnica` y
  `apps/finanzas` siguen aceptando `'technical'` junto a `'gerencia_tecnica'`.
  Un JWT con el alias sigue abriendo los mismos endpoints que el rol canónico —
  exactamente la ambigüedad que el catálogo documenta pero no resuelve.
- **Alta de usuarios**: `apps/auth/src/main.ts` sigue usando `'resident'` como
  default (`rol_global: roles || ['resident']` en `POST /register`, y el mismo
  patrón en `POST /admin/users`) cuando no se especifican roles. Cada usuario
  dado de alta sin rol explícito **sigue creando filas con el alias**, pese a
  que el selector de Administración ya no lo ofrece — el bug se sigue
  reproduciendo por una ruta que el fix anterior no cubrió.
- **Datos existentes**: los usuarios que ya traen `resident`, `compras` o
  `technical` en `rol_global` (confirmado que el seed de desarrollo trae uno)
  nunca se convirtieron a su rol canónico.

Mientras esto no se cierre, un mismo usuario puede tener accesos distintos
según qué alias tenga y qué endpoint llame (ver nota de `resident` en
`packages/roles/src/index.ts`: "Compras lo acepta; Personal y Control de
Proyectos no"), y el catálogo sigue prometiendo un estado transitorio
("alias... aún exigido por algunos requireRoles") que ya no describe una
migración en progreso sino una que nunca se completó.

No bloquea el piloto (los tres alias ya están marcados y no se ofrecen a
usuarios nuevos desde el fix anterior), pero es la deuda que ese fix dejó
documentada y pendiente.

## What Changes

- Quitar `'resident'` de los 20 `requireRoles(...)` de `apps/compras` y
  `apps/almacen` que ya listan también `'residencia'`; en el único caso que
  falta `'residencia'` (`apps/compras/src/main.ts:4123`), sustituir
  `'resident'` por `'residencia'` en vez de solo quitarlo, para no perder
  acceso.
- Quitar `'technical'` de los 5 `requireRoles(...)` de `apps/gerencia-tecnica`
  y `apps/finanzas` que ya listan también `'gerencia_tecnica'`.
- Cambiar el default de rol en `apps/auth/src/main.ts` (`POST /register` y
  `POST /admin/users`) de `'resident'` a `'residencia'`, y actualizar el seed
  de desarrollo (`apps/auth/prisma/seed.ts`) para no reintroducir el alias en
  cada `prisma db seed`.
- Nuevo script de migración de datos (`apps/auth/scripts/migrar-roles-alias.ts`,
  siguiendo el patrón de `apps/personal/scripts/migrar-config-nomina-proyecto.ts`)
  que reescribe `rol_global` de todo usuario existente: `resident` →
  `residencia`, `compras` → `procurement`, `technical` → `gerencia_tecnica`.
  Idempotente, con conteo de filas migradas por alias.
- Retirar por completo `resident`, `compras` y `technical` de
  `packages/roles/src/index.ts`: una vez que ningún `requireRoles` los exige y
  la migración de datos los elimina de la BD, ya no son "sinónimo histórico
  aún exigido" — dejan de existir. **BREAKING** para cualquier JWT emitido
  antes del deploy que aún traiga el alias: al expirar o en el siguiente
  login, el usuario recibe su rol canónico (migrado en BD); si vuelve a
  editarse antes de reautenticar con `PATCH .../admin/users/:id` enviando el
  alias explícitamente, la petición se rechaza (ver spec).
- Test guardián simétrico en `packages/roles/src/catalogo.test.ts`: un rol
  `estado: 'alias'` que ya no aparece en ningún `requireRoles` real SHALL
  fallar la suite, para forzar su retiro del catálogo en vez de dejarlo
  como documentación obsoleta (mismo patrón que el guardián de `sin-backend`
  agregado en `rbac-seguridad-rol-catalogo-desactualizado`, PR #102).
- El alias también leaked al frontend de `apps/app-shell` (auditoría completa
  tras la primera versión de este proposal, ver Impact): quitar `'resident'`
  de la lógica de permisos de `ComparativaDetail.tsx` (`isResident`) y del
  menú (`Layout.tsx`, 2 entradas), quitar `'compras'` de las 6 entradas de
  `Layout.tsx` que ya listan `'procurement'`, y renombrar `'compras'` →
  `'procurement'` en el usuario demo de `TenantContext.tsx` (único caso
  frontend donde el canónico no está ya presente).
- Actualizar ~30 fixtures de test que firman un JWT o mockean un usuario con
  el alias (`roles: ['resident']` etc.) en `apps/compras`, `apps/finanzas`,
  `apps/control-proyectos`, `apps/auth` y `apps/app-shell` — renombrar al
  canónico, preservando el resultado esperado de cada test (positivo o
  negativo, ver Impact). Sin esto, retirar el alias del backend/catálogo
  rompe esos tests aunque el comportamiento de producción sea correcto.

## Capabilities

### Modified Capabilities

- `catalogo-de-roles`: `resident`, `compras` y `technical` dejan de existir en
  el catálogo (antes: `estado: 'alias'`). El alta y edición de usuarios
  rechazan los tres explícitamente. Se añade una regla estructural que impide
  que un alias quede catalogado sin que ningún `requireRoles` lo exija ya.

## Impact

- **Código backend**: `apps/compras/src/main.ts`, `apps/almacen/src/main.ts`,
  `apps/gerencia-tecnica/src/main.ts`, `apps/finanzas/src/main.ts`,
  `apps/auth/src/main.ts`, `apps/auth/src/validation/schemas/register.schema.ts`,
  `apps/auth/prisma/seed.ts`, `packages/roles/src/index.ts`,
  `packages/roles/src/catalogo.test.ts`,
  `apps/auth/src/validation/schemas/admin-users.roles.test.ts`.
- **Código frontend** (`apps/app-shell/src`): `components/ComparativaDetail.tsx`
  (permiso `isResident`), `components/Layout.tsx` (menú, 8 entradas),
  `context/TenantContext.tsx` (usuario demo).
- **Tests que fijan el alias como fixture** (renombrar al canónico, sin
  cambiar la aserción de cada test): `apps/compras/test/integration/{especificacion-simple-post-creacion,cuadro-comparativo-dos-etapas,revision-especificaciones,seleccion-proveedor-recomendado,firma-cierre-requisicion,evaluar-especificaciones,req-imprevisto-aprobar,oc-error-alert}.integration.test.ts`,
  `apps/compras/test/e2e/seguridad.e2e.test.ts`,
  `apps/finanzas/test/e2e/seguridad.e2e.test.ts`,
  `apps/control-proyectos/test/e2e/seguridad.e2e.test.ts`,
  `apps/auth/test/integration/centro-costos-alta.integration.test.ts`,
  `apps/app-shell/src/components/ComparativaDetail.{confirmacion-proyecto-firma,evaluacion-especificacion,firma-seleccion}.test.tsx`.
  `apps/auth/src/project-access-policy.test.ts` usa `'compras'` y `'residente'`
  (tercer deletreo, no catalogado) en un contexto no relacionado — confirmado
  que no forma parte de este alias y se deja intacto.
- **Datos**: script de migración de una sola vez sobre `apps/auth` (tabla
  `users`, columna `rol_global`), a ejecutar en el VPS. Ningún cambio de
  esquema Prisma.
- **Otros microservicios**: confirmado por grep completo sobre `apps/*/src` que
  ningún otro servicio referencia `resident`, `technical` ni `compras` en
  `requireRoles` fuera de los 4 archivos listados (`compras`, `almacen`,
  `gerencia-tecnica`, `finanzas`); `compras` (alias de `procurement`) no
  aparece en ningún `requireRoles` del repo, así que no requiere cambios de
  backend, solo migración de datos.
- **Riesgo**: bajo y acotado — cambios de un string por línea en la mayoría de
  los 25 `requireRoles`, sin lógica nueva; el caso con comportamiento real
  (retirar el alias del catálogo) solo afecta a usuarios que hoy tengan
  `resident`/`compras`/`technical` y no hayan vuelto a autenticarse tras el
  deploy, mitigado por correr la migración de datos antes de que el nuevo
  código quede activo.

## Why

No había una fuente de verdad de qué roles existen. El selector de alta de
usuarios (`AdminView.tsx`) tenía su propia lista de 12, los `requireRoles` de los
13 servicios exigían 14, y el menú del app-shell filtraba por 17. Las tres listas
derivaron por separado, con dos consecuencias opuestas:

**Roles que el backend exige y no se podían asignar** — `warehouse`,
`control_proyectos`, `director`, más los alias `resident` y `technical`. En la
práctica: **no había forma de dar de alta un almacenista** sin convertirlo en
`admin`, lo que anula justamente la prueba de permisos que interesa hacer en el
piloto. Igual para un director y para Control de Proyectos.

**Roles asignables que no abren nada** — `contabilidad`, `seguridad_hse` y
`ventas`. Un administrador los elige de buena fe, el usuario ve su módulo en el
menú, y recibe 403 en cada llamada. Son los P0·3 y P0·4 del documento de
arranque; este change no los corrige, pero deja de esconderlos.

Y como `roles` se validaba con `z.array(z.string())`, cualquier errata
(`'finanzs'`, `'almacen'`) se guardaba sin ruido y reaparecía días después como
un 403 inexplicable.

Ya hubo un precedente de esta misma clase de bug con `finance` vs `finanzas`,
corregido a mano. Sin una fuente única, se repite.

## What Changes

- Nuevo paquete `packages/roles`: catálogo canónico, sin dependencias,
  importable tanto por servicios Express como por el bundle del navegador. Cada
  rol declara `id`, `label` y un `estado`:
  - `asignable` — el caso normal.
  - `sin-backend` — reconocido, pero ningún endpoint lo comprueba todavía.
  - `alias` — sinónimo histórico de otro rol; se acepta en un JWT existente pero
    no se ofrece para usuarios nuevos.
- `AdminView` consume `ROLES_ASIGNABLES` en vez de su lista propia. Los roles
  `sin-backend` se marcan con un punto ámbar y, al seleccionarlos, aparece un
  aviso de que el usuario verá el módulo y recibirá acceso denegado.
- `apps/auth` valida `roles` contra el catálogo. Al **crear** se exige un rol
  asignable; al **editar** se aceptan además los alias, para no bloquear la
  edición de usuarios que ya los traen.
- **Test guardián** en `packages/roles`: recorre `apps/*/src/*.ts` y
  `Layout.tsx`, extrae cada rol mencionado en `requireRoles`, `rolesAutorizados`
  y el menú, y falla si alguno no está catalogado o si el backend exige un rol no
  asignable. Es lo que impide que las listas vuelvan a derivar en silencio.

## Out of scope

- **Unificar los alias.** `resident` a `residencia`, `technical` a
  `gerencia_tecnica`, y `compras` a `procurement` en el menú. Requiere tocar los
  `requireRoles` de Compras y Gerencia Técnica y migrar los usuarios existentes;
  con el catálogo en su sitio ya se puede hacer de forma verificable, pero es un
  change aparte con migración de datos.
- **Darles endpoints a `contabilidad`, `seguridad_hse` y `ventas`.** Son P0·3,
  P0·4 y el módulo de Ventas. Aquí solo se hacen visibles.

## Capabilities

### New Capabilities
- `catalogo-de-roles`: fuente única de verdad de los roles del sistema, y la
  garantía de que el alta de usuarios cubre lo que el backend exige.

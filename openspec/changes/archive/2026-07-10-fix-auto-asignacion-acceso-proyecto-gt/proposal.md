## Why

Un admin creó un proyecto/centro de costos nuevo y el gerente técnico (rol
`gerencia_tecnica`) no podía verlo, ni siquiera tras cerrar e iniciar sesión de
nuevo. Causa raíz confirmada: `apps/auth/src/main.ts` líneas 843-858, al crear
un proyecto se auto-asigna acceso (`UserProjectAccess`) únicamente a usuarios
con rol `admin` o `superintendent` — cualquier otro rol, incluido
`gerencia_tecnica`, nunca recibe esa fila automáticamente. No es un problema de
caché de JWT ni de sesión: el frontend (`TenantContext.tsx`) siempre pide la
lista de proyectos fresca del backend en cada login; el dato simplemente no
existe en la base. Existe una vía manual (editor de usuario en `AdminView.tsx`)
pero requiere que el admin la ejecute aparte, y en este caso no se hizo.

## What Changes

- Se amplía la lista blanca de auto-asignación de acceso a proyecto nuevo para
  incluir el rol `gerencia_tecnica`, además de `admin` y `superintendent`. Los
  demás roles (compras, residentes, etc.) siguen requiriendo asignación manual
  por proyecto vía `AdminView.tsx`, sin cambios.
- Se extrae la lógica de "qué usuarios deben auto-asignarse a un proyecto
  nuevo" a una función pura y testeable en `apps/auth/src/project-access-policy.ts`
  (mismo patrón que `login-policy.ts` ya existente en este servicio), en vez de
  dejarla inline en el handler de la ruta.

## Capabilities

### New Capabilities
- `auto-asignacion-acceso-proyecto`: Al crear un proyecto nuevo, el sistema
  SHALL auto-asignar acceso a los usuarios activos del tenant cuyo rol esté en
  la lista de roles con acceso automático (`admin`, `superintendent`,
  `gerencia_tecnica`).

## Impact

- `apps/auth/src/main.ts` líneas 843-858 (handler `POST /api/v1/auth/admin/proyectos`)
- `apps/auth/src/project-access-policy.ts` (nuevo módulo con la lógica pura)
- `apps/auth/src/project-access-policy.test.ts` (nuevo, test que reproduce el bug)

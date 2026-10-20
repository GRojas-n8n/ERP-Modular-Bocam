## Why

`packages/roles/src/index.ts` cataloga `seguridad_hse` con `estado:
'sin-backend'` y la nota "El servicio de Seguridad todavía no comprueba este
rol en sus endpoints". Eso ya no es cierto: `df8b858` (fusionado a `main`)
agregó `requireRoles('seguridad_hse', 'superintendent', 'admin')` a las 18
rutas de `apps/seguridad/src/main.ts` que antes no comprobaban ningún rol.
El propio `design.md` de `rbac-contabilidad-rol-sin-backend` señaló esta
deuda documental al pasar y la dejó fuera de alcance explícitamente.

Efecto visible: Administración sigue mostrando el aviso ámbar "este rol
todavía no abre nada" (`AdminView.tsx`) al asignar `seguridad_hse`, cuando en
realidad el usuario sí obtiene acceso a los cinco endpoints de lectura que usa
`SeguridadView` (incidentes, inspecciones, permisos, capacitaciones, epp) y al
resto de rutas del módulo. Es una advertencia falsa, no un 403 real — a
diferencia del bug de `contabilidad`, aquí el backend ya está correcto y solo
el catálogo quedó desactualizado.

## What Changes

- Actualizar `packages/roles/src/index.ts`: mover `seguridad_hse` de
  `estado: 'sin-backend'` a `estado: 'asignable'` y retirar la nota
  desactualizada.
- Agregar un test guardián a `packages/roles/src/catalogo.test.ts` que
  reproduce el gap: todo rol catalogado como `sin-backend` SHALL no aparecer
  ya en ningún `requireRoles(...)` real del backend; si aparece, el catálogo
  está desactualizado y el test debe fallar. Este test falla hoy contra
  `seguridad_hse` (antes del fix) y queda en verde permanentemente para
  prevenir que el mismo lapso (fix de backend sin actualizar el catálogo)
  se repita con otro rol.

## Capabilities

### Modified Capabilities

- `catalogo-de-roles`: el rol `seguridad_hse` deja de estar en estado
  `sin-backend` (ya no se advierte al asignarlo desde Administración); se
  añade una regla estructural que impide que un rol quede marcado
  `sin-backend` mientras un servicio ya lo exige.

## Impact

- `packages/roles/src/index.ts` y `packages/roles/src/catalogo.test.ts`
  (único paquete tocado).
- Ningún cambio en `apps/seguridad` — sus rutas ya están correctas desde
  `df8b858`.
- Ningún cambio de esquema de base de datos ni de eventos RabbitMQ.

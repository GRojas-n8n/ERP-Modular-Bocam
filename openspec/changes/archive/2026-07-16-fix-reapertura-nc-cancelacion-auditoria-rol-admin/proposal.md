## Why

En `apps/calidad/src/main.ts` dos gates de permiso exclusivos de `admin`
(reapertura de una No Conformidad cerrada, y cancelación de una Auditoría
Interna) leen `const { rol } = req.securityContext as any` — pero
`packages/auth-middleware` nunca coloca un campo `rol` singular en
`securityContext`, solo `roles: string[]` (ver
`packages/auth-middleware/src/types.ts:31,59` y `middleware.ts:146`).
`rol` es siempre `undefined`, así que `rol !== 'admin'` es siempre `true`
y **ningún usuario, ni siquiera admin, puede reabrir una NC cerrada ni
cancelar una auditoría** — ambas acciones devuelven 403
(`REABRIR_SOLO_ADMIN` / forbidden genérico) al 100% del tiempo.

Encontrado el 2026-07-14 corriendo la suite de integración de `calidad`
(test `testReaperturaAdmin` en `workflow-nc.integration.test.ts`, ya
existente, no relacionado al cambio que se estaba verificando en ese
momento). Confirmado de nuevo el 2026-07-16 contra el código actual en
`main`: el test sigue en rojo (`403 !== 200`). Preexistente desde el
commit `dc95f22` (feat calidad workflow NC); no corre en CI, por eso pasó
inadvertido hasta ahora.

## What Changes

- `apps/calidad/src/main.ts`: en el gate de reapertura de NC (línea ~190,
  `PATCH /api/v1/calidad/no-conformidades/:id` con `reabrir: true`) y en
  el gate de cancelación de auditoría (línea ~383, `PATCH
  /api/v1/calidad/auditorias/:id` con `estado: 'CANCELADA'`), reemplazar
  `const { rol } = req.securityContext as any; ... rol !== 'admin'` por
  `req.securityContext.roles.includes('admin')` (el campo real que sí
  existe, ya tipado en `SecurityContext`).
- No cambia ningún otro comportamiento del workflow de NC ni de
  auditorías — mismas transiciones, mismos códigos de error, mismo
  contrato de API. Es exclusivamente la corrección del campo leído.
- Se agrega cobertura de test para el gate de cancelación de auditoría
  (no tenía ningún test, a diferencia de la reapertura de NC que ya tenía
  `testReaperturaAdmin`).

## Capabilities

### New Capabilities
- `control-acceso-workflow-calidad`: define que las acciones exclusivas
  de `admin` en los workflows de No Conformidad y Auditoría Interna
  (reapertura, cancelación) SHALL verificarse contra `roles[]` del
  `securityContext`, y SHALL permitir la acción a cualquier usuario cuyo
  arreglo de roles incluya `admin`.

## Impact

- **Archivos afectados**: `apps/calidad/src/main.ts` (2 gates),
  `apps/calidad/test/integration/workflow-nc.integration.test.ts` (test ya
  existente, debe pasar a verde sin modificarse), nuevo archivo
  `apps/calidad/test/integration/workflow-auditoria.integration.test.ts`
  (cobertura nueva para el gate de cancelación).
- Sin cambios de esquema, sin cambios de API pública (mismos endpoints,
  mismo payload), sin nueva dependencia.
- Requiere redeploy VPS de `calidad` tras merge (sin migración).

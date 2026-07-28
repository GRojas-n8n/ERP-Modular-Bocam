## Why

El flujo de autorización y pago de nómina está bloqueado para el rol real de
RH. `apps/personal/src/main.ts` verifica en dos endpoints
`roles.includes('rh_manager')`, pero el rol real de RH usado en los otros 17
endpoints del mismo archivo (vía `requireRoles('personal_rh', 'admin')`) y
asignado al usuario real de producción (`recursoshumanos@bocam.com.mx`,
`rol_global = personal_rh` verificado en `bocam_auth.users`) es
`personal_rh`. `rh_manager` no existe en ningún usuario real ni en ningún
otro punto del repo. Resultado: RH recibe 403 siempre al intentar autorizar
o marcar como pagada una pre-nómina; solo el admin general
(`iretum@bocam.com.mx`) puede hacerlo hoy, lo que convierte cada ciclo de
nómina (semanal o quincenal) en un cuello de botella manual sobre una sola
cuenta que no debería estar involucrada en esta operación.

Es el mismo patrón de bug ya corregido antes en este repo (rol `'finance'`
vs `'finanzas'` en Finanzas, PR #76; rol `'rol'` singular vs `'roles[]'` en
Calidad) — un string de rol que nunca correspondió a ningún usuario real.

## What Changes

- `PATCH /api/v1/personal/prenominas/:id/autorizar`
  (`apps/personal/src/main.ts` línea ~686): cambiar la condición de rol de
  `roles.includes('rh_manager')` a `roles.includes('personal_rh')`, y
  actualizar el mensaje de error 403 correspondiente (menciona
  `rh_manager`).
- `PATCH /api/v1/personal/prenominas/:id/pagar` (línea ~736): mismo cambio.
- Ningún otro endpoint de `apps/personal/src/main.ts` se toca — los 17
  restantes ya usan `personal_rh` correctamente.
- Se revisan (y corrigen si aplica) tests de integración en
  `apps/personal/test/` u otros servicios que construyan tokens con
  `roles: ['rh_manager']` para simular a RH contra estos dos endpoints.

## Capabilities

### New Capabilities
- `control-acceso-autorizacion-nomina`: define que autorizar y marcar como
  pagada una pre-nómina SHALL verificar el rol real `personal_rh` (además de
  `admin`), no `rh_manager`.

### Modified Capabilities
(ninguna — no existe spec previo que documentara el rol correcto para estas
dos acciones; `nomina-a-contabilidad` cubre la emisión de eventos al
autorizar, no el control de acceso)

## Impact

- **Archivos afectados**: `apps/personal/src/main.ts` (2 gates + 2
  mensajes de error). Posibles tests de integración en `apps/personal/test/`
  u otros servicios si simulan RH con el rol ficticio `rh_manager` (a
  confirmar durante implementación, igual que PR #76 encontró tests de
  otros servicios afectados).
- Sin cambios de esquema, sin cambios de contrato de API (mismo shape de
  respuesta, solo cambia qué rol pasa el gate).
- Requiere redeploy VPS de `personal` tras merge (sin migración).
- **Impacto en producción**: desbloquea inmediatamente al usuario real de
  RH (`recursoshumanos@bocam.com.mx`) para autorizar y pagar nómina sin
  depender del admin general.

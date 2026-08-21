## Why

`apps/seguridad/src/main.ts` expone 19 rutas de negocio bajo
`/api/v1/seguridad` (más `GET /health`, público por diseño — excluido del
middleware de autenticación, fuera de alcance). Solo una de las 19 —
`GET /resumen-dashboard` — exige rol (`requireRoles('superintendent',
'admin')`). Las otras 18 solo pasan por `requireProjectAccess()`: cualquier
sesión JWT válida con acceso al proyecto activo, sin importar su rol de
negocio, puede reportar y cerrar incidentes, autorizar permisos de trabajo de
alto riesgo (alturas, espacio confinado, trabajo caliente, excavación, izaje,
eléctrico), programar y completar capacitaciones, y dar de alta/actualizar
registros de EPP.

Es la misma inconsistencia de RBAC ya corregida en `personal`
(`fix-rbac-endpoints-personal-sin-rol`) y en `finanzas`
(`rbac-finanzas-saga-fondos`, `rbac-finanzas-lecturas`): endpoints hermanos en
el mismo archivo con protección desigual, no una decisión de diseño
documentada.

Dos hallazgos adicionales del barrido (ver `design.md`):

1. El catálogo canónico de roles (`packages/roles`) declara `seguridad_hse`
   como el rol del módulo, pero en estado `sin-backend`: **ningún endpoint de
   Seguridad lo comprueba todavía**. Un usuario dado de alta con ese rol ve el
   módulo en el menú (`Layout.tsx` ya lo gatea a `seguridad_hse`) y hoy no
   recibe ningún control de acceso real al usarlo.
2. `PATCH /permisos/:id/autorizar` sí tiene una comprobación de rol, pero
   inline (`roles.includes('hse_manager')`) en vez de `requireRoles(...)`.
   `hse_manager` no existe en el catálogo canónico — no es asignable desde
   Administración ni aparece en ningún otro servicio — así que es, en la
   práctica, código muerto: nadie puede tener ese rol en un JWT real. Al no
   usar `requireRoles(...)`, además escapa al test guardián de
   `packages/roles` (que solo rastrea `requireRoles(...)` y `rolesAutorizados
   = [...]`), por eso esta inconsistencia no la detectó ese cambio.

## What Changes

- Agregar `requireRoles('seguridad_hse', 'superintendent', 'admin')` a las 18
  rutas sin protección de rol (ver lista completa en `tasks.md`), incluida
  `GET /dashboard` (sin consumidor real hoy, pero mismo criterio del módulo).
- Convertir el chequeo inline de `PATCH /permisos/:id/autorizar` a
  `requireRoles('seguridad_hse', 'superintendent', 'admin')`, reemplazando el
  rol huérfano `hse_manager` por el rol canónico `seguridad_hse`. Mismo efecto
  para `admin`/`superintendent`, que ya estaban.
- **BREAKING** para cualquier sesión que hoy use estos 18 endpoints sin uno de
  esos tres roles. El barrido de consumidores (`design.md`) no encontró
  ningún caller real en `apps/app-shell` ni backend-to-backend — `SeguridadView`
  solo hace `GET` de lectura y no está wireada a ningún `POST`/`PATCH` del
  módulo — así que el riesgo de romper un flujo en producción es bajo, pero se
  marca como breaking por si un script o integración externa dependiera de
  ello sin constar en las specs existentes.

## Capabilities

### New Capabilities
- `control-acceso-modulo-seguridad`: RBAC de todas las rutas de negocio de
  Seguridad/HSE (incidentes, inspecciones, permisos de trabajo,
  capacitaciones, EPP) — solo `seguridad_hse`, `superintendent` o `admin`
  pueden usarlas. `/resumen-dashboard` ya cumplía este contrato; este change
  lo extiende a las 18 rutas restantes.

## Impact

- **Código afectado**: `apps/seguridad/src/main.ts` (18 `requireRoles(...)`
  agregados + 1 conversión de chequeo inline a `requireRoles(...)`, sin
  cambios de lógica interna de negocio).
- **Tests**: `apps/seguridad/test/e2e/rbac-endpoints-sin-rol.e2e.test.ts`
  (nuevo — el módulo no tenía carpeta de tests), con casos que reproducen el
  gap (403 antes del fix) y casos de no-regresión para
  `seguridad_hse`/`superintendent`/`admin`.
- **Frontend**: ningún cambio de contrato esperado. `SeguridadView.tsx` solo
  lee (`GET incidentes/inspecciones/permisos/capacitaciones/epp`), y el ítem
  de menú "Seguridad HSE" ya está gateado a `seguridad_hse` (+ `admin` por
  bypass) en `Layout.tsx`, así que los únicos usuarios que hoy llegan a la
  vista ya tienen uno de los roles autorizados.
- **Otros microservicios**: ninguno — `asistente` y el dashboard ejecutivo
  solo consumen `GET /resumen-dashboard`, que no cambia.

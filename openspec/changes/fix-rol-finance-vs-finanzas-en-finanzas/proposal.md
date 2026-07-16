## Why

Un usuario con rol de Finanzas reporta que al hacer clic en "Nuevo
Presupuesto" en su propio módulo Finanzas recibe: *"No tienes permisos
para crear presupuestos. Roles requeridos: admin, superintendent o
finance."*

Causa raíz confirmada: `apps/finanzas/src/main.ts` tiene 6 endpoints cuyo
gate RBAC compara `roles` contra el string en **inglés** `'finance'`
(líneas 231, 331, 487, 1074, 1199, 1260) — pero el rol real que usa el
resto del sistema es `'finanzas'` en **español**:

- El catálogo de alta de usuarios en Admin (`AdminView.tsx:44`) asigna
  `'finanzas'`.
- El gate del menú lateral que muestra el módulo (`Layout.tsx:123`) usa
  `'finanzas'` — por eso el usuario sí ve y entra a su módulo, pero no
  puede usar sus acciones principales.
- El JWT copia literal el `rol_global` persistido, que es `'finanzas'`.
- Verificado contra la BD real de producción (VPS,
  `SELECT email, rol_global FROM bocam_auth.users`): los 2 usuarios reales
  de Finanzas (`finanzasbocam@bocam.com.mx`,
  `cuentasporpagar@bocam.com.mx`) tienen `rol_global = {finanzas}`.
  Ningún usuario real tiene `'finance'`.
- El mismo archivo `apps/finanzas/src/main.ts` ya usa `'finanzas'`
  correctamente en 9 rutas distintas vía `requireRoles('finanzas', ...)`
  (cuentas bancarias, anticipos, pagos-oc, reportes) — confirma que
  `'finanzas'` es la convención real y `'finance'` es el error.

El bug bloquea, para todo usuario real de Finanzas: crear presupuesto,
registrar movimiento presupuestal, transferir presupuesto entre partidas,
programar pagos (individual y por lote), y marcar un pago como pagado —
las 6 acciones principales del módulo.

## What Changes

- `apps/finanzas/src/main.ts`: cambiar los 6 arreglos `rolesAutorizados`
  que contienen `'finance'` a `'finanzas'`, y actualizar el texto de los
  mensajes de error correspondientes (que citan `'finance'` en el
  mensaje al usuario) a `'finanzas'`.
- `apps/finanzas/test/e2e/seguridad.e2e.test.ts` y
  `apps/finanzas/test/e2e/idempotencia.e2e.test.ts`: el rol usado en los
  tokens de prueba para representar a un usuario de Finanzas autorizado
  era `'finance'` (el rol ficticio que coincidía con el bug) — se cambia
  a `'finanzas'` (el rol real).
- No se toca ningún otro microservicio (`compras`, `contabilidad`,
  `gerencia-tecnica`, `packages/auth-middleware`, `apps/asistente`)
  aunque la investigación encontró el mismo string `'finance'` en otros
  lugares — fuera de alcance de este bug puntual (módulo Finanzas), y
  cada uno necesitaría su propia verificación de si realmente rompe algo
  antes de tocarlo.

## Capabilities

### New Capabilities
- `control-acceso-modulo-finanzas`: define que las acciones de Finanzas
  restringidas a roles `admin`/`superintendent`/`finanzas` SHALL
  verificar el rol `'finanzas'` (español), consistente con el rol real
  asignado a los usuarios de Finanzas en el sistema.

## Impact

- **Archivos afectados**: `apps/finanzas/src/main.ts` (6 gates + 6
  mensajes), `apps/finanzas/test/e2e/seguridad.e2e.test.ts`,
  `apps/finanzas/test/e2e/idempotencia.e2e.test.ts`.
- Sin cambios de esquema, sin cambios de contrato de API (mismo shape de
  respuesta, solo cambia qué rol pasa el gate).
- Requiere redeploy VPS de `finanzas` tras merge (sin migración).
- **Impacto en producción**: desbloquea inmediatamente a los 2 usuarios
  reales de Finanzas (`finanzasbocam@bocam.com.mx`,
  `cuentasporpagar@bocam.com.mx`), que hoy no pueden usar ninguna de las
  6 acciones afectadas de su propio módulo.

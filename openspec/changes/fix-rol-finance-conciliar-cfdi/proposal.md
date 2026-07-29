## Why

El endpoint `POST /api/v1/contabilidad/asientos/:id/conciliar-cfdi`
(`apps/contabilidad/src/main.ts:1997`) exige el rol `'finance'` (inglés),
un rol que no existe en el sistema. El rol real asignado a los usuarios
de Finanzas en producción es `'finanzas'` (español) — verificado en
`AdminView.tsx`, `Layout.tsx`, el JWT y la BD real de producción
(`finanzasbocam@bocam.com.mx`, `cuentasporpagar@bocam.com.mx`). Es el
mismo bug ya corregido en `apps/finanzas/src/main.ts` (PR #76), pero este
endpoint gemelo en `apps/contabilidad` quedó fuera de alcance de ese fix
y fue documentado como pendiente en ese momento.

Al verificar el archivo completo (2026-07-28) se confirmó que el
mismatch no es de un solo endpoint: las 17 rutas protegidas de
`apps/contabilidad/src/main.ts` (asientos, cuentas, dashboard, todos los
reportes contables, conciliaciones fiscales y conciliaciones bancarias)
usan `'finance'`; **cero** usan `'finanzas'` correctamente. En la
práctica, ningún usuario real de Finanzas puede usar el módulo de
Contabilidad salvo que además tenga rol `admin` o `superintendent`.

## What Changes

- Cambiar `'finance'` por `'finanzas'` en las 17 llamadas a
  `requireRoles(...)` de `apps/contabilidad/src/main.ts` (líneas 1716,
  1750, 1771, 1794, 1838, 1876, 1914, 1956, 1997, 2202, 2288, 2359, 2465,
  2812, 2940, 3005, 3216).
- Agregar tests de integración que reproduzcan el bug primero (token con
  rol `'finanzas'` real debe poder llamar estos endpoints sin 403 por
  rol; token con `'finance'` en inglés — rol inexistente — debe seguir
  recibiendo 403), y luego aplicar el fix.
- Buscar en todo el repo (no solo en `apps/contabilidad/test/`) tests de
  integración de otros microservicios que construyan tokens con
  `roles: ['finance']` para llamar a estos endpoints de contabilidad, y
  actualizarlos — mismo patrón que en PR #76.

**Fuera de alcance** (documentado para specs futuros, no se toca aquí —
son otros microservicios): los usos de `'finance'` en
`apps/compras/src/main.ts` y
`apps/asistente/src/routes/alertas-predictivas.ts`.

## Capabilities

### New Capabilities
- `control-acceso-rol-finanzas-contabilidad`: todos los endpoints protegidos del microservicio de contabilidad verifican el rol real `'finanzas'` de los usuarios de Finanzas (no `'finance'`).

### Modified Capabilities
(ninguna — no existe spec previo para el control de acceso de este
microservicio; `control-acceso-modulo-finanzas` cubre el microservicio
`apps/finanzas`, distinto al de `apps/contabilidad`, y no se modifica)

## Impact

- **Código afectado:** `apps/contabilidad/src/main.ts` (17 endpoints protegidos).
- **Tests:** nuevos tests de integración en `apps/contabilidad/test/` (o carpeta equivalente) que reproducen el bug antes del fix.
- **Usuarios reales afectados:** usuarios con rol `finanzas` en producción (`finanzasbocam@bocam.com.mx`, `cuentasporpagar@bocam.com.mx`) que hoy no pueden usar el módulo de Contabilidad.
- **Sin impacto cruzado de microservicios** (regla de un spec por microservicio).

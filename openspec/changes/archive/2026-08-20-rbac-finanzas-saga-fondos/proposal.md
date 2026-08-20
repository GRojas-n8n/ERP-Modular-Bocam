## Why

Preparando el piloto con usuarios reales en `iretum.com` se revisó la cobertura de
control de acceso por ruta en `apps/finanzas/src/main.ts`. El servicio usa dos
mecanismos distintos para autorizar por rol:

- el middleware `requireRoles(...)` de `@bocam/auth-middleware` (rutas de
  cuentas bancarias, anticipos y pagos-oc), y
- una comprobación dentro del handler (`const rolesAutorizados = [...]` +
  `roles.some(...)` → 403 `FIN_FORBIDDEN`), que es el patrón usado por las
  mutaciones más antiguas del módulo.

Contando solo `requireRoles` se concluiría que 17 de 26 rutas están abiertas. Al
revisar ruta por ruta contemplando **ambos** mecanismos, la realidad es distinta:
todas las mutaciones de dinero operadas por humanos ya están protegidas
(`POST /presupuestos`, `POST /movimientos`,
`POST /transferencias-presupuestales`, `POST /pagos`, `POST /pagos/bulk`,
`PATCH /pagos/:id/pagar`).

Quedan **dos mutaciones sin ninguna comprobación de rol**:

- `POST /api/v1/finanzas/comprometer-fondos`
- `POST /api/v1/finanzas/liberar-fondos`

Son los dos endpoints de la saga Compras → Finanzas: congelan y liberan fondos
contra un presupuesto asignado y emiten los eventos `FondosComprometidos` /
`FondosLiberados`, que Contabilidad consume para registrar y revertir pasivos.
Hoy los protege únicamente `createAuthMiddleware` + `requireProjectAccess()`, es
decir: **cualquier usuario autenticado con acceso al proyecto puede congelar o
liberar fondos**, sin pasar por Compras y sin límite de autoridad financiera.
Un residente, un usuario de HSE o uno de Calidad pueden hacerlo con una petición
directa, y el movimiento resultante se propaga a Contabilidad como si viniera de
una orden de compra legítima.

No es explotable desde la interfaz — el app-shell nunca llama a estos dos
endpoints — pero sí desde cualquier cliente HTTP con un token válido, que es
exactamente la condición del piloto: usuarios reales, tokens reales, un solo
proyecto compartido.

## What Changes

- `POST /api/v1/finanzas/comprometer-fondos` y `POST /api/v1/finanzas/liberar-fondos`
  SHALL exigir uno de los roles `finanzas`, `admin`, `superintendent` o
  `procurement`.
- El conjunto de roles NO es el de las demás mutaciones de Finanzas
  (`finanzas`/`admin`/`superintendent`) a propósito: estos dos endpoints se
  invocan **backend-to-backend desde Compras**, que reenvía el JWT del usuario
  original (`buildForwardHeaders(req, { Authorization: token })`). Los tres
  endpoints de Compras que los llaman
  (`comparativas/:id/convertir-oc`, `ordenes-compra/:id/cancelar`,
  `ordenes-compra/:id/reconciliar-finanzas`) exigen
  `requireRoles('admin', 'superintendent', 'procurement')`. Omitir `procurement`
  rompería la emisión de órdenes de compra y dejaría las OC en
  `ERROR_FINANZAS`.
- Se usa el middleware `requireRoles(...)` y no el patrón in-handler, por ser el
  mecanismo compartido y declarativo; las mutaciones existentes que usan el
  patrón in-handler **no se tocan** (regla 1 del CLAUDE.md: no refactorizar
  legacy sin spec propio).
- Sin cambios de comportamiento para clientes legítimos: la saga de Compras sigue
  funcionando igual, y un usuario de Finanzas o un admin siguen pudiendo operar
  directamente.

## Out of scope

Se documentan aquí para no perderlos, pero NO se corrigen en este change:

- **Ocho rutas de lectura sin rol** en Finanzas: `GET /suficiencia`,
  `/presupuestos`, `/presupuestos/por-concepto/:conceptoId`, `/presupuestos/:id`,
  `/movimientos`, `/pagos`, `/dashboard` y `/reportes/pagado-por-concepto`.
  Exponen la salud financiera del proyecto a cualquier sesión válida. Requieren
  su propio análisis porque tienen consumidores cruzados con roles heterogéneos
  (Compras llama `/suficiencia` y `/presupuestos/por-concepto`; `InsumosView` y
  `ControlObraView` llaman `/movimientos`; el asistente llama `/dashboard`), y
  cerrarlas mal produce pantallas vacías en tres módulos.
- **Inconsistencia en los conjuntos de roles** de las mutaciones existentes:
  `PATCH /pagos/:id/pagar` admite `['admin', 'finanzas']` mientras que
  `POST /pagos` admite `['admin', 'superintendent', 'finanzas']`. Puede ser
  deliberado (ejecutar el pago es más restrictivo que programarlo) o un descuido;
  hay que confirmarlo con negocio antes de tocarlo.
- **Unificar el patrón** de autorización del módulo en `requireRoles`.

## Capabilities

### New Capabilities
- `finanzas-control-de-acceso`: política de autorización por rol de las
  mutaciones de la saga de fondos de Finanzas.

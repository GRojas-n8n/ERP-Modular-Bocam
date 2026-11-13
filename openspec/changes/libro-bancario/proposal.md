## Why

El saldo de una cuenta bancaria es un número que cambia sin historia:
- Egresos de OCs, pagos programados, nóminas y cobros lo mueven, pero no queda registro de cuánto había antes ni
  qué operación lo cambió.
- `PATCH /cuentas-bancarias/:id` acepta `saldo`: cualquier usuario de Finanzas puede fijar un saldo arbitrario sin
  motivo, sin límite de autoridad y sin rastro.
- La conciliación bancaria y el reparto por proyecto (M12) no tienen contra qué comparar.
- El número de cuenta y la CLABE salen completos en la API.

Auditoría de Finanzas del 5 nov 2026, M6.

## What Changes

- Tabla `movimientos_bancarios` (libro bancario):
  - Un movimiento por cada cambio de saldo: `tipo` (CARGO | ABONO), `origen` (SALDO_INICIAL | AJUSTE | EGRESO_OC |
    PAGO_PROGRAMADO | NOMINA | COBRO_CXC), `origen_id`, `referencia`, `motivo`, `monto`, `saldo_anterior`,
    `saldo_posterior`, `proyecto_id` de la operación, `usuario_id` y `secuencia` creciente.
  - `tesoreria.ts` escribe el movimiento en la MISMA sentencia que el UPDATE de la cuenta (CTE). Con cargos
    simultáneos la cadena saldo_anterior/saldo_posterior no tiene huecos.
  - CHECK de monto, tipo, origen, aritmética del saldo y ajuste con motivo y folio. Único por
    (tenant, origen, origen_id) y por (tenant, cuenta, folio) en ajustes.
  - Inmutable por trigger (también para el superusuario). RLS habilitado y forzado, por tenant.
- Los cuatro llamadores pasan su origen: egreso (`id_pago`, fijado antes de mover la cuenta), pago programado
  (`id_pago`), nómina (`prenomina_id`) y cobro (`id_cobro`, fijado antes de abonar).
- `POST /cuentas-bancarias`: el saldo inicial queda como movimiento SALDO_INICIAL y respeta el límite de autoridad.
  Saldo negativo o con más de 2 decimales: 400.
- `PATCH /cuentas-bancarias/:id`: rechaza `saldo` con 400 `FIN_SALDO_NO_EDITABLE`.
- `POST /cuentas-bancarias/:id/ajustes` (`tipo`, `monto`, `folio`, `motivo` de 10 a 500 caracteres):
  - Límite de autoridad; roles finanzas y admin.
  - Idempotente por (cuenta, folio): mismo contenido 200; otro contenido 409 `FIN_AJUSTE_DUPLICADO`.
  - Un cargo nunca deja la cuenta en negativo: 422 `FIN_SALDO_INSUFICIENTE`.
- `GET /cuentas-bancarias/:id/movimientos`: más reciente primero; `?limit=`, `?cursor=`, `?origen=`.
- Número de cuenta y CLABE enmascarados (`****1234`) en lista, alta, edición y baja.
- `scripts/finanzas/saldo-inicial-libro-bancario.sql`: registra el saldo de las cuentas previas al libro y lista los
  descuadres. Simulación por defecto; `-v aplicar=1` para guardar. Re-ejecutable.

## Impact

- Servicio: `apps/finanzas` (tesoreria, egreso-oc, programa-pagos, nomina-por-pagar, cuentas-por-cobrar, main).
- Migración `20261114120000_libro_bancario` con `rollback.sql`; RLS 9g en `rls-policies.sql`.
- Producción migra como `bocam_app` con RLS forzado: el saldo inicial NO se carga en la migración (vería 0 cuentas).
  Se carga después del despliegue con el script, como `bocam_admin`.
- La pantalla no cambia: solo usa `id_cuenta`, `banco`, `alias` y `saldo`.
- Base: `pantalla-egreso-multiproveedor` (M10). Prepara M12 (fondos por proyecto): cada movimiento lleva el proyecto
  de la operación.

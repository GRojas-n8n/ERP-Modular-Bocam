## Why

Hallazgos de la auditoría de Finanzas (5 nov 2026):

- **F14:** cuentas bancarias, anticipo, pagos de OC y el reporte para GT respondían errores `{ success, message }` con
  el mensaje interno de la excepción; el resto del módulo usa `createApiError(code, message)`.
- **F15:** `GET /pagos-oc?proveedorId` traía todos los pagos y filtraba en memoria.
- **F16:** el dashboard devolvía `cuentas_bancarias: []` y `ocs_por_pagar: 0` fijos.
- Además, los listados (`/pagos`, `/pagos-oc`, `/movimientos`) no tenían paginación y `GET /presupuestos/:id` traía todo
  su programa de pagos.

## What Changes

- Formato único de errores en todas las rutas, con código estable y sin exponer el mensaje interno en 500.
  - Códigos nuevos: `FIN_CUENTA_NO_ENCONTRADA`, `FIN_CUENTA_CON_PAGOS`, `FIN_PAGO_NO_ENCONTRADO`,
    `FIN_ANTICIPO_MENOR_A_USADO`, `FIN_SOLO_SERVICIO_INTERNO`, `FIN_LIMIT_INVALIDO` y `FIN_CURSOR_INVALIDO`.
- Validación de UUID en ids de cuentas y pagos de OC, y en el proyecto del anticipo.
- Anticipo: monto positivo y nunca menor a lo ya usado.
- `src/paginacion.ts`: paginación por llave con `?limit` (1 a 500; 500 por defecto) y `?cursor`.
  - `data` sigue siendo un arreglo; el cursor siguiente viaja en `meta.paginacion.next_cursor`.
  - Sin repetidos ni huecos entre páginas.
- `/pagos-oc`: filtro de proveedor en SQL (`detalles: { some: { proveedor_id } }`).
- Filtros explícitos por tenant y proyecto en los listados, además del RLS.
- Dashboard: agrega `kpis`, `alertas` y `actividad_reciente` (estándar de `CLAUDE.md`).
  - Saldo real por cuenta bancaria activa.
  - OCs por pagar y cuentas por cobrar del proyecto, con conteo y saldo.
  - Alertas nuevas: `COBROS_VENCIDOS` y `LIQUIDEZ_INSUFICIENTE`.
  - Conserva los campos que ya lee la pantalla.
- `GET /presupuestos/:id`: `programa_pagos` acotado a 50.
- F25: `handleOrdenCompraCreadaEvent` documentado como respaldo; no se elimina sin spec.

## Impact

- Servicio: `apps/finanzas`.
- Contrato: aditivo para la pantalla, que lee `data` y `error.message`, y para el consumidor B2B de Gerencia
  Técnica, que lee `success` y `data`. El único cambio visible es el cuerpo de los errores de las rutas citadas.
- Fuera de alcance: el saldo editable y el enmascarado de cuentas bancarias (M6, F24).
- Base: `cuentas-por-cobrar-estimaciones`.

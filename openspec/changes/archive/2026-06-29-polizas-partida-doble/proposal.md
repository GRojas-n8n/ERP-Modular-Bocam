## Why

El módulo de contabilidad genera asientos en partida simple (un monto total por póliza), lo que impide producir los reportes contables estándar requeridos por el contador de Bocam: balanza de comprobación, estado de resultados, balance general y libro diario. Sin partida doble no hay trazabilidad cargo/abono por cuenta contable.

## What Changes

- **Nuevo modelo `CuentaContable`**: catálogo de cuentas SAT-compatible para constructora (1xxx–6xxx), sembrado en la BD de contabilidad.
- **Nuevo modelo `MovimientoPoliza`**: líneas de cargo/abono vinculadas a cada `AsientoContable` y a una `CuentaContable`.
- **Mapper hardcoded `tipo_poliza → movimientos`**: función que genera los movimientos cargo/abono correctos para cada tipo de póliza (EGRESO, PASIVO_PROYECTADO, REVERSION, TRANSFERENCIA_INTERNA, ESTIMACION, AVANCE).
- **Cutoff 2026-06-29**: asientos anteriores no reciben movimientos; los nuevos los generan automáticamente al momento del evento.
- **Nuevos event handlers**: `control_obra.estimacion_aprobada` y `control_obra.avance_fisico_validado` se traducen a asientos con movimientos de partida doble.
- **4 endpoints de reportes**: balanza de comprobación, estado de resultados, balance general, libro diario.
- **Endpoint de dashboard** contable con KPIs.
- **`ContabilidadView.tsx`**: nueva vista frontend con 3 tabs — Pólizas (tabla + detalle movimientos), Conciliación (CFDI + banco pendientes), Reportes (4 reportes con filtros de fecha).
- **Nginx + Vite proxy**: enrutar `/api/v1/contabilidad` desde la app-shell.

## Capabilities

### New Capabilities

- `catalogo-cuentas`: Catálogo de cuentas contables (CuentaContable) con jerarquía 4 niveles, seed SAT-compatible para constructora, CRUD admin.
- `movimientos-poliza`: Líneas de partida doble (MovimientoPoliza) cargo/abono por cuenta, generadas automáticamente desde eventos de dominio vía mapper hardcoded.
- `reportes-contables`: Cuatro reportes contables — balanza de comprobación, estado de resultados, balance general, libro diario — con filtros de fecha y datos listos para PDF/Excel.
- `contabilidad-view`: Vista React `ContabilidadView.tsx` con tabs Pólizas, Conciliación y Reportes; muestra pólizas con movimientos expandibles y reportes interactivos.

### Modified Capabilities

- `pago-oc`: El handler `finanzas.pago_registrado` ahora genera MovimientoPoliza además del AsientoContable (cargo 2100, abono 1100). Requiere extensión del spec existente.

## Impact

- **`apps/contabilidad/prisma/schema.prisma`**: 2 nuevos modelos + migración Prisma.
- **`apps/contabilidad/src/main.ts`**: mapper, handlers existentes extendidos, nuevos handlers control_obra, 4 endpoints reportes + dashboard.
- **`apps/contabilidad/src/types.ts`**: nuevos tipos payload y enums.
- **`apps/app-shell/src/views/ContabilidadView.tsx`**: nueva vista.
- **`apps/app-shell/nginx.conf`** + **`vite.config.ts`**: proxy `/api/v1/contabilidad`.
- **Dependencia nueva**: ninguna (sin librerías externas; los reportes usan Prisma agregaciones).
- **Tests**: 4 integration tests nuevos (mapper + eventos control_obra + reportes).

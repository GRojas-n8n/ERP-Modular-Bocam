## Why

Hallazgos de la auditoría de Finanzas (5 nov 2026):

- **F18:** la sincronización de partidas de GT ponía `monto_disponible = monto_autorizado` al actualizar. Si GT
  reemitía el presupuesto, el disponible se restablecía sin descontar lo comprometido ni lo ejercido y permitía
  sobrecomprometer.
- **F22:** `POST /movimientos` y `/transferencias-presupuestales` validaban `!monto` pero no `monto > 0`, no
  bloqueaban la fila (dos movimientos simultáneos comprometían más que el disponible), `/movimientos` aceptaba
  TRANSFERENCIA sin destino (el dinero "desaparecía") y aceptaba movimientos manuales sobre partidas de GT, que son
  de solo lectura.
- **F23:** `transferencia_id` era opcional y sin índice único: un doble clic duplicaba la transferencia.
- Además, la transferencia movía el disponible sin mover el autorizado y rompía la invariante
  `disponible = autorizado - comprometido - ejercido`.

## What Changes

- `src/montos.ts`: validación única de montos (> 0, máximo 2 decimales). La usa también `egreso-oc.ts`.
- `src/presupuesto-blindado.ts`: `registrarMovimientoManual`, `transferirPresupuesto` y `sincronizarPartidasGt`,
  con `SELECT ... FOR UPDATE` y validación de saldos dentro de la transacción.
- `POST /movimientos`: rechaza TRANSFERENCIA (400), partidas de GT (422), LIBERACION/DEVENGADO por encima de lo
  comprometido (422) y montos inválidos (400).
- `POST /transferencias-presupuestales`: `transferencia_id` obligatorio (UUID), idempotente (200 en reintento,
  409 con otro contenido), mueve autorizado y disponible, rechaza partidas de GT; el evento se publica una sola vez.
- `handleSaldoPartidaCreadoEvent`: alta idempotente o actualización relativa (`disponible = autorizado nuevo -
  comprometido - ejercido`); una reducción por debajo de lo comprometido queda como sobregiro y se registra en log.
- Migración `20261111120000_unicidad_transferencias` (`uq_transferencia_presupuesto`), con precheck y rollback.

## Impact

- Servicio: `apps/finanzas` únicamente. Ningún servicio ni pantalla hace POST a `/movimientos` o
  `/transferencias-presupuestales` (verificado con grep); el front solo los consulta.
- Contrato: el límite de autoridad sigue evaluándose antes de cualquier validación nueva (`seguridad.e2e`).

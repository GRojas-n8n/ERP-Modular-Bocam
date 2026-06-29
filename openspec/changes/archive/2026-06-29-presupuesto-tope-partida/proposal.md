## Why

El control presupuestal existe hoy a nivel proyecto (`PresupuestoAsignado.monto_autorizado`) pero no a nivel partida: una OC puede agotar el presupuesto de Cimentación comprando Acabados y el sistema no lo detecta. El presupuesto del APU (precio unitario × cantidad por concepto) es un documento de referencia, no un control operativo. Esto genera sobre-costos por partida que solo se descubren al cierre de la obra.

## What Changes

- Nueva tabla `SaldoPartida` en Gerencia Técnica: un registro por concepto del catálogo con `monto_aprobado`, `monto_comprometido`, `monto_ejercido`, `monto_en_proceso`, `monto_disponible`
- Población automática al aprobar presupuesto: cada concepto crea su SaldoPartida con `monto_aprobado = precio_unitario × cantidad`
- Gate de verificación en generación de OC: Compras llama a GT antes de emitir; si partida BLOQUEADA → 422
- Gate en aprobación de req: si partida BLOQUEADA → req queda en `PENDIENTE_TRANSFERENCIA`
- Ciclo de vida del saldo: cada evento del sistema (req, OC, pago, nómina) actualiza automáticamente los campos via B2B call al GT
- Estados de tope: `LIBRE` (>20% disponible) → `LIMITADO` (<20%) → `BLOQUEADO` (≤0)
- Director puede anular el bloqueo con justificación (`bloqueo_automatico = false`) — queda en audit log
- Evento `gerencia_tecnica.partida_bloqueada` para consumo por Control de Proyectos

## Capabilities

### New Capabilities
- `presupuesto-tope-partida`: Control presupuestal a nivel de concepto APU con gate en OC/req y ciclo de vida del saldo

### Modified Capabilities
- `multi-oc-generacion`: Flujo de generación de OC debe verificar SaldoPartida antes de proceder
- `pre-req-gt`: Aprobación de requisición en GT debe verificar SaldoPartida y manejar estado `PENDIENTE_TRANSFERENCIA`

## Impact

- **`apps/gerencia-tecnica/prisma/schema.prisma`**: nueva tabla `SaldoPartida`
- **`apps/gerencia-tecnica/src/main.ts`**: endpoint `POST /presupuestos/:id/aprobar` crea SaldoPartida; nuevos endpoints `/partidas/:id/saldo`, `/partidas/:id/comprometer`, `/partidas/resumen`; evento `gerencia_tecnica.partida_bloqueada`
- **`apps/compras/src/main.ts`**: verificación B2B a GT antes de generar OC; bloqueo si BLOQUEADO
- **`apps/requisiciones/src/main.ts`** (o donde viva la aprobación de req): estado `PENDIENTE_TRANSFERENCIA` nuevo
- **RabbitMQ**: nuevo evento `gerencia_tecnica.partida_bloqueada` en exchange `bocam.events`

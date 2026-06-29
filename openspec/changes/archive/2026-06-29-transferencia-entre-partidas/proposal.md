## Why

Cuando una partida APU llega a su tope (estado `BLOQUEADO`), las requisiciones quedan en `PENDIENTE_TRANSFERENCIA` sin mecanismo formal para resolverlo. Se necesita un flujo documentado y aprobado para mover presupuesto entre partidas — con justificación obligatoria, trazabilidad contable y desbloqueo automático de las requisiciones afectadas.

## What Changes

- Nuevo endpoint `POST /api/v1/gerencia-tecnica/transferencias-partida` para solicitar transferencia entre partidas
- Nuevos endpoints `PATCH …/:id/aprobar` y `PATCH …/:id/rechazar` para el director
- Nuevo endpoint `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/transferencias` para historial
- Al aprobar: ajuste automático de `SaldoPartida` origen y destino + desbloqueo de requisiciones en `PENDIENTE_TRANSFERENCIA`
- Publicación de evento `gerencia_tecnica.transferencia_partida_aprobada` → Contabilidad registra asiento `TRANSFERENCIA_INTERNA`
- Soporte para transferencias internas (misma obra) y externas (entre proyectos)
- Panel de transferencias pendientes en `InsumosView` (pestaña "Transferencias")

## Capabilities

### New Capabilities

- `transferencia-partida`: Entidad `TransferenciaPartida` con flujo PENDIENTE→APROBADA/RECHAZADA/REVERTIDA, validaciones de saldo disponible, justificación obligatoria ≥50 chars, desbloqueo automático de reqs, evento al aprobar

### Modified Capabilities

- `presupuesto-tope-partida`: Ajuste de `SaldoPartida.monto_aprobado` al aprobar transferencia (nuevo flujo de modificación post-inicialización)

## Impact

- **GT backend** (`apps/gerencia-tecnica/src/main.ts`): nuevas rutas + modelo Prisma `TransferenciaPartida`
- **Compras backend** (`apps/compras/src/main.ts`): subscriber `gerencia_tecnica.transferencia_partida_aprobada` ya existe — solo necesita lógica de desbloqueo adicional (hoy solo re-evalúa; ya implementado en `presupuesto-tope-partida`)
- **Contabilidad** (`apps/contabilidad/src/main.ts`): handler del evento ya existe para `TRANSFERENCIA_INTERNA`
- **Frontend** (`apps/app-shell/src/views/InsumosView.tsx`): nueva pestaña "Transferencias" con lista pendientes + botón aprobar/rechazar para roles director/admin
- **DB GT**: nueva tabla `transferencia_partidas`

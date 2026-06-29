## Context

`presupuesto-tope-partida` (completo) introdujo `SaldoPartida` con estados LIBRE/LIMITADO/BLOQUEADO/SUSPENDIDO y el estado `PENDIENTE_TRANSFERENCIA` en requisiciones bloqueadas. El event `gerencia_tecnica.transferencia_partida_aprobada` ya está suscrito en Compras (auto-desbloqueo) y en Contabilidad (asiento TRANSFERENCIA_INTERNA). Esta change cierra el ciclo creando la entidad y los endpoints que disparan ese evento.

GT backend corre en `apps/gerencia-tecnica/src/main.ts` (monolito express). DB: `bocam_gerencia_tecnica` (Prisma). Puerto 3001.

## Goals / Non-Goals

**Goals:**
- CRUD de `TransferenciaPartida` con máquina de estados PENDIENTE → APROBADA/RECHAZADA/REVERTIDA
- Validación: solo se transfiere `monto_disponible` (no comprometido ni ejercido)
- Al aprobar: ajuste atómico de `SaldoPartida` origen y destino + evento RabbitMQ
- Historial de transferencias por partida
- Panel frontend en InsumosView (pestaña "Transferencias") para director/admin
- Tests de integración para el flujo completo

**Non-Goals:**
- Transferencias externas entre proyectos (doble aprobación) — se implementa la estructura pero el flujo de doble aprobación queda para iteración futura; en esta change solo transferencias INTERNAS
- Reversión de transferencias aprobadas — también futura iteración
- Notificaciones push/email al director

## Decisions

### D1: Solo INTERNAS en esta iteración
Las transferencias externas (entre proyectos) requieren doble aprobación (GT origen + director) y lógica de proyectos cruzados que complejiza significativamente. El 95% del valor de negocio está en las internas. Se diseña la entidad con `tipo INTERNA|EXTERNA` para que la externa no requiera migración futura.

### D2: Ajuste de SaldoPartida en la misma transacción de BD que el cambio de estado
Al aprobar, usamos `prisma.$transaction([...])` para:
1. Actualizar `TransferenciaPartida.estado = 'APROBADA'`
2. Decrementar `SaldoPartida[origen].monto_aprobado -= monto`
3. Incrementar `SaldoPartida[destino].monto_aprobado += monto`

Si cualquier paso falla, todo revierte. El evento RabbitMQ se publica DESPUÉS de que la transacción confirma (best-effort, fallo silencioso).

### D3: Desbloqueo de requisiciones lo maneja el subscriber de Compras
El event `gerencia_tecnica.transferencia_partida_aprobada` ya tiene subscriber en Compras que re-evalúa requisiciones en `PENDIENTE_TRANSFERENCIA`. GT no necesita lógica de desbloqueo — solo publicar el evento correctamente.

### D4: Validación de saldo en el momento de aprobar, no al crear
Al crear la transferencia (POST), validamos que el origen tiene `monto_disponible >= monto`. Al aprobar (PATCH), re-validamos porque puede haber cambiado entre la solicitud y la aprobación.

### D5: Prisma migration vía raw SQL en VPS
El mismo patrón de `presupuesto-tope-partida`: `prisma db push` falla en prod por cambios pre-existentes en la tabla `concepto_insumos`. Creamos `transferencia_partidas` directamente con SQL en deploy.

## Risks / Trade-offs

- **Race condition en aprobación simultánea** → Mitigación: `prisma.$transaction` con isolation level READ COMMITTED; la segunda aprobación fallará porque el estado ya no es `PENDIENTE`
- **Fallo de evento después de transacción** → Mitigación: el handler es idempotente (ya existe en Compras), el director puede re-aprobar si detecta que el desbloqueo no ocurrió (pero el saldo ya se ajustó — solo el evento falla)
- **Ajuste de `monto_aprobado` negativo en origen** → Mitigación: validación antes de la transacción + constraint `CHECK (monto_aprobado >= 0)` en la tabla

## Migration Plan

1. `git push` + `docker compose up -d gerencia-tecnica app-shell`
2. En VPS: ejecutar SQL para crear tabla `transferencia_partidas`
3. Smoke test: POST transferencia → aparece en panel → PATCH aprobar → verificar saldos ajustados

**Rollback:** DROP TABLE `transferencia_partidas` + revertir imagen anterior de gerencia-tecnica y app-shell.

## Open Questions

- ¿El director quiere notificación por email o es suficiente con la alerta en UI? → Fuera de scope por ahora.
- ¿Las transferencias rechazadas deben liberar la req de `PENDIENTE_TRANSFERENCIA` → `PENDIENTE`? → Sí, el subscriber de Compras recibirá `gerencia_tecnica.transferencia_partida_rechazada` y regresará la req a `PENDIENTE`.

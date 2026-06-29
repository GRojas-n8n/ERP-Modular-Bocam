## 1. Prisma Schema — tabla transferencia_partidas

- [ ] 1.1 Agregar modelo `TransferenciaPartida` a `apps/gerencia-tecnica/prisma/schema.prisma`
- [ ] 1.2 Crear SQL directo para VPS (`apps/gerencia-tecnica/prisma/create_transferencia_partidas.sql`)
- [ ] 1.3 Ejecutar `prisma generate` localmente para regenerar el cliente

## 2. Backend GT — endpoints CRUD

- [ ] 2.1 `POST /api/v1/gerencia-tecnica/transferencias-partida` — crear solicitud con validaciones (saldo disponible, justificación ≥50 chars, origen ≠ destino)
- [ ] 2.2 `PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/aprobar` — transacción atómica: estado APROBADA + ajuste de SaldoPartidas + evento
- [ ] 2.3 `PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/rechazar` — estado RECHAZADA + motivo_rechazo + evento
- [ ] 2.4 `GET /api/v1/gerencia-tecnica/transferencias-partida` — lista por proyecto con filtro `?estado=`
- [ ] 2.5 `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/transferencias` — historial con dirección ENVIADA/RECIBIDA

## 3. Eventos RabbitMQ

- [ ] 3.1 Publicar `gerencia_tecnica.transferencia_partida_aprobada` al aprobar (payload completo según spec)
- [ ] 3.2 Publicar `gerencia_tecnica.transferencia_partida_rechazada` al rechazar (incluye `concepto_destino_id` para que Compras re-evalúe)
- [ ] 3.3 Verificar que el subscriber de Compras (`gerencia_tecnica.transferencia_partida_aprobada`) recibe el nuevo payload y desbloquea correctamente

## 4. Frontend — pestaña Transferencias en InsumosView

- [ ] 4.1 Agregar tab "Transferencias" con badge de conteo pendientes en `InsumosView.tsx`
- [ ] 4.2 Fetch `GET /api/v1/gerencia-tecnica/transferencias-partida?estado=PENDIENTE` y mostrar lista de solicitudes
- [ ] 4.3 Botones "Aprobar" / "Rechazar" visibles para roles `admin` (modal de rechazo con textarea de motivo)
- [ ] 4.4 Formulario "Nueva Transferencia" — selector concepto origen/destino, campo monto, textarea justificación (visible para roles `gerencia_tecnica`, `control_proyectos`, `admin`)
- [ ] 4.5 Historial de transferencias aprobadas/rechazadas con estado y fecha

## 5. Tests de integración

- [ ] 5.1 Test: crear transferencia válida → estado PENDIENTE
- [ ] 5.2 Test: rechazar por saldo insuficiente (422)
- [ ] 5.3 Test: aprobar → verificar SaldoPartida origen decrementado + destino incrementado
- [ ] 5.4 Test: rechazar con motivo → estado RECHAZADA
- [ ] 5.5 Test: historial de partida incluye dirección correcta (ENVIADA/RECIBIDA)

## 6. Deploy VPS

- [ ] 6.1 Ejecutar SQL `create_transferencia_partidas.sql` en `bocam_gerencia_tecnica` DB
- [ ] 6.2 `docker compose up -d gerencia-tecnica app-shell` con la nueva imagen
- [ ] 6.3 Smoke test: crear transferencia en prod → aprobar → verificar saldos

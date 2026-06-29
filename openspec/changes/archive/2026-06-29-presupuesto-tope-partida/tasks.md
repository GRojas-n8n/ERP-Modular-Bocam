## 1. Esquema de BD — Gerencia Técnica

- [x] 1.1 Añadir modelo `SaldoPartida` a `apps/gerencia-tecnica/prisma/schema.prisma`
- [x] 1.2 Añadir modelo `SaldoMovimiento` para audit trail de cada cambio
- [x] 1.3 Ejecutar `npx prisma generate` en `apps/gerencia-tecnica`

## 2. Backend — Gerencia Técnica

- [x] 2.1 En `PATCH /presupuestos/:id/aprobar`: crear `SaldoPartida` por cada `Concepto` (upsert idempotente)
- [x] 2.2 Función `calcularEstadoTope()`: BLOQUEADO si disponible≤0, LIMITADO si <20%, LIBRE si ≥20%
- [x] 2.3 `GET /api/v1/gerencia-tecnica/partidas/:concepto_id/saldo`: saldo completo con porcentajes; 404 si no existe
- [x] 2.4 `POST /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer`: actualiza comprometido, idempotente por referencia_id, emite evento BLOQUEADO
- [x] 2.5 `POST /api/v1/gerencia-tecnica/partidas/:concepto_id/ejercer`: mueve comprometido → ejercido al pagar
- [x] 2.6 `DELETE /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer/:referencia_id`: reversa de compromiso
- [x] 2.7 `GET /api/v1/gerencia-tecnica/partidas/resumen`: array con estado_tope de todas las partidas
- [x] 2.8 `PATCH /api/v1/gerencia-tecnica/partidas/:concepto_id/anular-bloqueo`: admin/director; audit log
- [x] 2.9 Publicar evento `gerencia_tecnica.partida_bloqueada` al transitar a BLOQUEADO (idempotente)
- [x] 2.10 `POST /api/v1/gerencia-tecnica/saldo-partida/inicializar-proyecto` (admin): migración para proyectos existentes
- [x] 2.11 `GET /api/v1/gerencia-tecnica/requisiciones-bloqueadas`: lista de partidas BLOQUEADAS

## 3. Backend — Compras (modificación)

- [x] 3.1 `GT_URL` constante en Compras
- [x] 3.2 En `convertir-oc`: obtener `concepto_id` de la req origen antes de crear OCs
- [x] 3.3 Gate: llamar `GET .../partidas/:concepto_id/saldo` con timeout 2s antes de crear OCs (fail-open)
- [x] 3.4 Si BLOQUEADO y `bloqueo_automatico=true`: retornar 422 con `oc_bloqueadas[]` sin crear OC
- [x] 3.5 Si LIMITADO: advertencia incluida en respuesta, OC sí se crea
- [x] 3.6 Tras OC EMITIDA: llamar `POST .../comprometer` en GT (fire-and-forget)
- [x] 3.7 Al cancelar OC: llamar `DELETE .../comprometer/:oc_id` en GT para revertir

## 4. Backend — Aprobación de requisición (GT/Compras)

- [x] 4.1 Identificar dónde se aprueba la req actualmente y añadir verificación de SaldoPartida
- [x] 4.2 Si BLOQUEADO: req pasa a `PENDIENTE_TRANSFERENCIA`
- [x] 4.3 Si LIMITADO: aprobar con warning
- [x] 4.4 Actualizar `monto_en_proceso` cuando req es APROBADA
- [x] 4.5 Reducir `monto_en_proceso` cuando req genera OC

## 5. Backend — Desbloqueo automático de reqs (GT)

- [x] 5.1 Subscriber para `gerencia_tecnica.transferencia_partida_aprobada`: re-evaluar reqs PENDIENTE_TRANSFERENCIA
- [x] 5.2 Si saldo suficiente: req → APROBADA y notificar a Compras

## 6. Frontend — InsumosView / Presupuesto GT (indicadores de saldo)

- [x] 6.1 Columna "Saldo" con `monto_disponible` + badge `estado_tope` (verde/amarillo/rojo)
- [x] 6.2 SlidePanel al click: desglose aprobado/en proceso/comprometido/ejercido/disponible
- [x] 6.3 Partidas BLOQUEADAS: icono candado + fondo rojo suave

## 7. Frontend — ComprasView / alerta de bloqueo en generación OC

- [x] 7.1 Si respuesta incluye `oc_bloqueadas[]`: mostrar alerta con lista de partidas bloqueadas
- [x] 7.2 Mensaje de instrucción para solicitar transferencia presupuestal en GT

## 8. Frontend — Lista de requisiciones (badge PENDIENTE_TRANSFERENCIA)

- [x] 8.1 Badge amber "Esperando transferencia" para reqs en `PENDIENTE_TRANSFERENCIA`
- [x] 8.2 Info block con partida bloqueada y nota de desbloqueo automático al aprobar transferencia

## 9. Tests de integración

- [x] 9.1 Test: aprobar presupuesto crea SaldoPartida por cada concepto
- [x] 9.2 Test: GET /partidas/:id/saldo retorna saldo completo
- [x] 9.3 Test: comprometer actualiza monto y estado_tope
- [x] 9.4 Test: saldo transita a BLOQUEADO cuando disponible ≤ 0
- [x] 9.5 Test: idempotencia de POST /comprometer con mismo referencia_id
- [x] 9.6 Test: DELETE /comprometer revierte compromiso y restaura LIBRE
- [x] 9.7 Test: GET /partidas/:id/saldo retorna 404 si no existe
- [x] 9.8 Test: GET /partidas/resumen lista partidas con estado_tope correcto
- [x] 9.9 Test: req con partida BLOQUEADA pasa a PENDIENTE_TRANSFERENCIA

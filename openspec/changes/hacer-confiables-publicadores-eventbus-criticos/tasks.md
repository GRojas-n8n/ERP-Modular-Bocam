## 1. Inventario y decisión (esta fase, documental)

- [x] 1.1 Inventariar los publicadores de Finanzas y su comportamiento (`inventario-publicadores.md`, lectura estática de `main` `750c591`).
- [x] 1.2 Listar por servicio los eventos críticos de los lotes P2–P6 (nombres verificados en el código; el detalle por evento se completa en cada lote).
- [x] 1.3 Registrar las deudas independientes (`deudas-independientes.md`).
- [x] 1.4 **Titular (2026-09-30):** aprobados el modo `direct|outbox` (predeterminado `direct` y despachador `off`, sin modo dual), la retención de `PUBLICADO` a 90 días y el orden de lotes (ver `design.md`, «Decisiones del titular»).
- [x] 1.5 Responsables: implementación, Claude Code; aprobación y activación productiva, el titular; reglas contables, el responsable contable.

## 2. P1 — Outbox de Finanzas (change hijo o PR propio; pruebas primero)

- [ ] 2.0 Auditar la idempotencia de los consumidores de P1 (Compras y Contabilidad) y, si Contabilidad no es idempotente, corregirla en un PR previo y separado antes de activar.
- [ ] 2.1 Completar el inventario de P1 con una consulta de solo lectura a producción: filas de outbox inexistentes; `movimientos_presupuestales` por OC con/sin `fondos_comprometidos` observado en Compras (estado `PENDIENTE_CONFIRMACION_FINANZAS` antiguo).
- [x] 2.2 Pruebas con PostgreSQL y RabbitMQ reales (`outbox-eventos` 25, `outbox-eventos-rls-ready` 17, `outbox-eventos-migracion` 10): caída tras el commit (atomicidad), sin canal, sin cola enlazada (`mandatory`), reintento con el mismo `event_id`, duplicado, orden por OC, varios despachadores, `ERROR` y reintento manual, RLS con rol sin `BYPASSRLS`, modo `direct` idéntico al actual, reversa sin pérdida, limpieza. 13 mutaciones (sin transacción, sin confirms, sin `mandatory`, sin lock, sin orden, sin `SKIP LOCKED`, limpieza sin filtro, `direct` que escribe, `event_id` no determinista, RLS abierto, sin `FORCE`, `/ready` sin despachador, migración sin `BEGIN/COMMIT`) fueron detectadas (ver `p1-outbox-finanzas.md`).
- [x] 2.3 Migración `20260930180000_outbox_eventos_finanzas`: aditiva, atómica e idempotente; tabla `outbox_eventos` con RLS habilitado y forzado (la aplicación solo lee/inserta lo propio; solo el despachador actualiza y borra), CHECKs, únicos `(tenant_id, event_id)` y `(tenant_id, aggregate_type, aggregate_id, aggregate_seq)`, `rollback.sql` que se niega a borrar con pendientes.
- [x] 2.4 `fondos_comprometidos`, `fondos_liberados` y `presupuesto_insuficiente` se encolan en la transacción de `compromiso-oc.ts` (`presupuesto_insuficiente` en transacción propia, porque no persiste movimiento); modo `direct` intacto.
- [x] 2.5 Despachador (`publishConfirmed` + `mandatory`, `SKIP LOCKED`, orden por OC, backoff, `ERROR`, apagado por defecto), `/ready` con base, RabbitMQ, despachador, consumidores y backlog, y métricas en `/ready`. Las alertas externas sobre esas métricas quedan para la activación (no hay sistema de alertas versionado en el repositorio).
- [x] 2.6 Catálogo de consumidores esperados y verificación de colas (cola existente con consumidor activo); límite documentado: no detecta un binding borrado a mano con el consumidor aún activo.
- [x] 2.7 Limpieza de `PUBLICADO` > 90 días por lotes (CTE materializada, observable, desactivada por defecto; nunca toca `PENDIENTE` ni `ERROR`).
- [ ] 2.8 CI en verde (cableado en `backend-e2e.yml`); despliegue de Finanzas solo, en modo `direct` y despachador apagado; verificar que el comportamiento no cambia. **Pendiente de CI, revisión y fusión autorizada por el titular; ver `p1-outbox-finanzas.md`.**
- [ ] 2.9 Activación (operación aparte, con backup y precondiciones del diseño, sección 5): idempotencia de Contabilidad demostrada, colas con consumidor, `/ready` ok.
- [ ] 2.10 Post-activación: outbox vacía tras el tráfico, cero `ERROR`, Compras y Contabilidad reciben los eventos.
- [ ] 2.11 `P1b`: `transferencia_presupuestal`, `pago_registrado`, `oc_pagada_*` cuando sus consumidores sean idempotentes.

## 3. Lotes siguientes (un change o PR por servicio)

- [ ] 3.1 P2 Compras (`oc_creada` tras #182; `oc_cancelada`, `oc_error_finanzas`, `requisicion_aprobada`, `comparativa_aprobada_gt`, `partida_bloqueada`).
- [ ] 3.2 P3 Control-Proyectos (tras B1).
- [ ] 3.3 P4 Personal (`nomina_autorizada`, `nomina_pagada`; hoy `void … .catch(console.error)`).
- [ ] 3.4 P5 Gerencia Técnica (migración al bus compartido; `partida_comprometida` incluido).
- [ ] 3.5 P6 Almacén, Ventas, Seguridad, Auth, Contabilidad.

## 4. Cierre

- [ ] 4.1 Todos los eventos críticos del inventario en modo `outbox`, o con exclusión justificada por escrito.
- [ ] 4.2 Sincronizar la spec canónica y archivar el change.

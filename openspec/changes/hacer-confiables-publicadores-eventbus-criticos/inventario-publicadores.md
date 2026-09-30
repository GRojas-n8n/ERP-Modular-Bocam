# Inventario de publicadores críticos — 2026-09-30

Fuente: lectura estática de `main` (`750c591`). No se consultó producción. Lo marcado «verificar» se completa en el inventario del lote antes de su primera prueba.

## Comportamiento común (`packages/event-bus/src/index.ts`, `apps/gerencia-tecnica/src/event-bus.ts`)

- `publish()` devuelve `false` si falta `tenant_id`/`proyecto_id` o si no hay canal (`Canal no disponible … NO publicado`); no lanza. Con canal, `channel.publish` no espera confirmación del broker y no usa `mandatory`: un mensaje sin cola enlazada se descarta sin aviso.
- `publish()` captura todo error y devuelve `false`. Sin canal no hay buffer ni reintento.
- `publishConfirmed()` (#167) espera la confirmación del broker, usa `mandatory` y **rechaza** si no hay canal, no hay confirmación, vence el plazo o no hay cola enlazada. Hoy solo la usa el despachador del outbox de Compras.
- Gerencia Técnica usa su propio cliente (`publishEvent`): mismo comportamiento (`false` sin canal, sin confirmación) y sin `event_id`.

## P1 — Finanzas (`apps/finanzas/src/main.ts`, `publishFinanceDomainEvent`, línea 60)

`publishFinanceDomainEvent` hace `await eventBus.publish(...)` y **descarta el booleano**. Todos los caminos publican **después** de que la transacción de negocio se confirmó; ninguno escribe el evento en esa transacción.

| Evento | Transacción de negocio | Sitios | Sin canal / `false` | Error | Consumidores | Efecto de un duplicado | Idempotencia del consumidor | Orden requerido |
|---|---|---|---|---|---|---|---|---|
| `finanzas.fondos_comprometidos` | `COMPROMISO` de la OC (`comprometer-fondos`, `oc_creada`; `compromiso-oc.ts`) | main.ts:883 (HTTP), 2189 (evento) | se ignora; el compromiso queda creado y **no se republica** (#185) | capturado en `publish`; el llamador no lo ve | Compras (`→ EMITIDA`), Contabilidad (pasivo proyectado) | Compras: no-op (#186). Contabilidad: verificar (riesgo de doble pasivo) | Compras sí (estado). Contabilidad: no demostrada | antes de `fondos_liberados` de la misma OC; Compras tolera el desorden |
| `finanzas.fondos_liberados` | `LIBERACION` de la OC (`liberar-fondos`, `oc_cancelada`) | 993 (HTTP), 2262 (evento) | ídem; un duplicado sí republica (datos reales, `idempotente: true`) | ídem | Compras (`CANCELACION_PENDIENTE → CANCELADA`), Contabilidad | Compras: no-op. Contabilidad: verificar | Compras sí. Contabilidad: no demostrada | después de `fondos_comprometidos` de la misma OC |
| `finanzas.presupuesto_insuficiente` | rechazo de compromiso por saldo (mismos caminos); no persiste movimiento | 839 (HTTP), 2176 (evento) | ídem | ídem | Compras (`→ ERROR_FINANZAS` solo desde pendiente) | Compras: no-op | Compras sí (#186) | antes de cualquier `fondos_comprometidos` de esa OC; tardío sobre OC `EMITIDA` es no-op |
| `finanzas.transferencia_presupuestal` | transferencia entre presupuestos | 718 | ídem | ídem | Contabilidad | verificar | verificar | por transferencia |
| `finanzas.pago_registrado` | alta de pago | 1336 | ídem | ídem | Contabilidad, Control-Proyectos | Contabilidad: riesgo de asiento duplicado/parcial (auditoría, riesgo 3) | no demostrada | por pago |
| `finanzas.oc_pagada_total` / `oc_pagada_parcial` | pago de OC (un evento por detalle) | 1788 (bucle posterior a la transacción) | ídem; un fallo a mitad del bucle deja detalles sin evento | ídem | Compras (`estado_pago`) | sobrescribe; una `parcial` tardía puede degradar `PAGADA` | no (auditoría, riesgo 2, lote L1) | por OC: `parcial` antes de `total`; el consumidor no lo garantiza aún |

**Alcance de P1:** los tres primeros eventos (los que dejó expuestos #185). Los otros cuatro usan la misma tabla de outbox y se incorporan en `P1b`, cuando sus consumidores sean idempotentes.

## Lotes siguientes (cada uno completa su inventario antes de sus pruebas)

| Lote | Servicio | Eventos críticos (nombres verificados en el código) | Publicación actual | Nota |
|---|---|---|---|---|
| P2 | Compras | `compras.oc_creada`, `compras.oc_cancelada`, `compras.oc_error_finanzas`, `compras.requisicion_aprobada`, `compras.comparativa_aprobada_gt`, `gerencia_tecnica.partida_bloqueada` (emitido desde Compras) | `await eventBus.publish` tras la transacción; varios con `try { … } catch (_) { /* best-effort */ }` (p. ej. `oc_error_finanzas`, `requisicion_aprobada`) | `compras.recepcion_oc_registrada.v1` ya usa outbox (#169): es la referencia. `oc_creada` espera a #182 |
| P3 | Control-Proyectos | `control_obra.estimacion_aprobada`, `avance_fisico_validado`, `avance_fisico_registrado` | `await eventBus.publish` (5 sitios) | depende de B1 (contrato canónico) |
| P4 | Personal | `personal.nomina_autorizada`, `personal.nomina_pagada` | `void eventBus.publish(...).catch(console.error)` (`main.ts:958`, `1001`): el error solo llega a consola | Finanzas los consume (críticos) |
| P5 | Gerencia Técnica | `gerencia_tecnica.partida_comprometida`, `saldo_partida_creado`, `transferencia_partida_solicitada/aprobada/rechazada`, `partida_bloqueada`, `presupuesto_base_liberado` | cliente propio, sin confirmación ni `event_id` | `partida_comprometida` es uno de los tres caminos de compromiso de Finanzas; requiere migrar al bus compartido (lote L5 de la auditoría) |
| P6 | Almacén, Ventas, Seguridad, Auth, Contabilidad | `almacen.salida_obra/stock_bajo/stock_agotado`, `ventas.cotizacion_aceptada`, 6 eventos de Seguridad, `auth.centro_costos_creado`, publicación de Contabilidad (`main.ts:67`, `sat-worker.ts:309`) | `publish` simple | `centro_costos_creado` crea proyectos en otros servicios: priorizar dentro del lote |

# Auditoría de idempotencia de los consumidores de P1 — 2026-09-30

Alcance: consumidores de `finanzas.fondos_comprometidos`, `finanzas.fondos_liberados` y `finanzas.presupuesto_insuficiente` en Compras y Contabilidad (`main` `1d16bd4`). Método: lectura del código y pruebas nuevas con PostgreSQL y RabbitMQ reales que entregan el **mismo evento** (mismo `event_id`, payload idéntico) de forma secuencial, concurrente (6 entregas simultáneas) y por RabbitMQ. No se modificó código de producción.

Por qué importa: el outbox entrega *al menos una vez*. Si el proceso cae entre la confirmación del broker y el marcado `PUBLICADO`, la fila se republica con el mismo `event_id`.

## Resultado

**Ningún consumidor de P1 bloquea la activación por falta de idempotencia ante duplicados.** Ambos son idempotentes por una clave de negocio, no por `event_id`. Contabilidad no necesita un PR previo para duplicados. Los límites que sí existen (sección «Límites») no son de idempotencia y se ubican en B1/B2 y en el lote L2.

## Matriz

| | Compras | Contabilidad |
|---|---|---|
| Eventos que consume | los tres | `fondos_comprometidos`, `fondos_liberados` (no consume `presupuesto_insuficiente`) |
| Uso de `event_id` | no | no |
| Clave de idempotencia real | el **estado de la OC**: `UPDATE … WHERE id_orden AND tenant_id AND proyecto_id AND estado IN (lista blanca)` (#186) | `evento_conciliacion_key = <routing key>:<movimiento_id>` sobre el asiento hallado por `referencia_funcional` (`OC:<oc_id>`) y `tipo_poliza`; única por tenant en BD (`@@unique([tenant_id, evento_conciliacion_key])`) |
| Mismo evento dos veces | segundo = no-op, log `idempotent`; una sola aplicación | segundo = log `idempotent`; nota y `conciliado_at` intactos |
| Mismo evento concurrente (×6) | una sola aplicada, una sola alerta, ningún error | todas terminan sin error; nota y clave una sola vez; sin asientos nuevos. Puede haber más de una `applied` porque no hay bloqueo de fila: solo cambia `conciliado_at` (benigno) |
| Otro `event_id`, mismo contenido | mismo resultado (la clave es el estado) | mismo resultado (la clave es el movimiento) |
| `fondos_liberados` antes de `fondos_comprometidos` | la liberación solo actúa desde `CANCELACION_PENDIENTE`: sobre una OC pendiente es no-op y el compromiso posterior la emite | cada evento concilia **su** asiento (`REVERSION_PASIVO_PROYECTADO` / `PASIVO_PROYECTADO`); no se tocan entre sí |
| Fuera de orden (tardíos) | `comprometidos` sobre `CANCELADA` no la resucita; `insuficiente` sobre `EMITIDA` no la degrada y no crea alerta ni publica (#186) | no hay estado que degradar: solo anota un asiento |
| Escrituras | `ordenes_compra.estado`; `alerta_oc_error` (alta/resolución); publica `compras.oc_error_finanzas` solo si se aplicó | `asientos_contables`: `evento_conciliacion_key`, `conciliado_at`, `notas`. No crea asientos |
| Atomicidad | una transacción por evento (transición + alerta) | una transacción por evento (`createTenantContext`); carga, comprobación y actualización en la misma transacción, `READ COMMITTED` sin `FOR UPDATE` |
| Objeto inexistente | OC no encontrada: log `oc_not_found`, ACK, sin efecto | asiento no encontrado tras 6 intentos × 250 ms: log `…_not_found` (warn), ACK, sin efecto |
| Pruebas existentes | `oc-transiciones-eventos-finanzas` (18, #186); `finanzas.feedback` | `finanzas.fondos-comprometidos.conciliacion`, `finanzas.fondos-liberados.conciliacion` (flujo completo, una reentrega de `oc_creada`) |
| Pruebas nuevas (este PR) | `finanzas-eventos-idempotencia-event-id` (10) | `finanzas.fondos-idempotencia-event-id` (8, incluye RabbitMQ real) |

## Límites (no son fallos de idempotencia)

1. **`not_found` es terminal.** Tanto Compras como Contabilidad confirman (ACK) un evento cuyo objeto aún no existe y no lo reintentan. Con el outbox, esa pérdida se vuelve recuperable únicamente si el evento se reencola; una fila `PUBLICADO` no se reenvía sola. Las pruebas muestran que reentregar el evento cuando el objeto ya existe lo aplica. **Recomendación:** una herramienta de reenvío manual de filas `PUBLICADO` (operación del titular) y/o el retry del consumidor del lote L1/L2 (fuera de este change, y no debe activarse sin idempotencia, que ahora está demostrada para estos tres eventos).
2. **Contabilidad solo concilia, no crea.** El asiento `PASIVO_PROYECTADO` lo crea el consumidor de `compras.oc_creada`; ese evento hoy no lleva `presupuesto_id` (B2/#182, bloqueado). Mientras tanto la conciliación de `fondos_comprometidos` terminará en `not_found` en producción. El outbox no cambia eso. Comprobación pendiente (solo lectura): contar asientos `PASIVO_PROYECTADO` y `REVERSION_PASIVO_PROYECTADO` (auditoría §8c).
3. **`applied` duplicado en concurrencia** en Contabilidad solo mueve `conciliado_at`. Si se quisiera una sola aplicación exacta, bastaría `UPDATE … WHERE evento_conciliacion_key IS DISTINCT FROM :clave` dentro de la misma transacción (lote L2; no se cambia aquí).
4. **Payload inválido → ACK sin rastro** en ambos (lotes L1/L2). No afecta a eventos emitidos por P1, que validan su payload.
5. `event_id` no es usado por ningún consumidor: el outbox lo emite de forma estable y queda disponible, pero la idempotencia actual no depende de él.

## Conclusión para P1

- No hace falta un PR previo de Contabilidad por idempotencia.
- El bloqueo concreto que queda para que la conciliación contable **aporte valor** es B2/#182 (presupuesto_id en `oc_creada`) y la decisión contable de B1; no bloquean la implementación ni la activación técnica de P1.
- Precondición cumplida para activar el modo `outbox` de los tres eventos (diseño §5, punto 1). Siguen pendientes las demás precondiciones (colas con consumidor activo, backup, `/ready`).

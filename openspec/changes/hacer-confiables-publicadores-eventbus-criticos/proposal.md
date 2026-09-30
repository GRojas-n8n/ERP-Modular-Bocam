## Why

Los publicadores críticos del EventBus son *fire-and-forget*: el evento se publica después de confirmar la transacción de negocio, con `eventBus.publish()`, que devuelve `false` (sin lanzar) si no hay canal y captura cualquier error. Los llamadores ignoran ese valor o lo envuelven en `try/catch` vacío. Si el proceso cae entre el commit y la publicación, o el bus no está disponible, el evento se pierde sin rastro y sin reintento posible.

Esta deuda quedó registrada como riesgo en `blindar-compromiso-oc-concurrencia-y-orden-eventos` (archivado 2026-09-30): tras #185, un `fondos_comprometidos` ya existente **no se republica** (antes se republicaba con saldo ficticio, una recuperación accidental). Hoy, si el primer `fondos_comprometidos` se pierde, nada lo repara: Compras puede quedar en `PENDIENTE_CONFIRMACION_FINANZAS` y Contabilidad no concilia el pasivo proyectado. La auditoría `auditar-consumidores-eventbus-sin-perdida-silenciosa` lista este change como «change separado de confiabilidad de publicadores (outbox y confirmación)».

Ya existe el patrón probado: Compras implementó un outbox transaccional (`compras.recepcion_oc_registrada.v1`, #169) y `@bocam/event-bus` ofrece `publishConfirmed` (confirmación del broker y `mandatory`). Falta generalizarlo a los demás eventos críticos.

## What Changes

Esta fase es solo documental: inventario, requisitos, diseño y lotes. No se implementa código, migraciones, variables ni despliegues.

- Inventario de publicadores críticos por servicio y lote (`inventario-publicadores.md`), empezando por Finanzas.
- Requisitos del outbox transaccional por servicio (spec `publicadores-eventbus-confiables`).
- Diseño: patrón, modo de transición sin regresión, activación y reversa por servicio.
- Lotes P1–P6; el primero es **P1 — Outbox de Finanzas**.
- Registro de deudas independientes observadas (`deudas-independientes.md`), sin implementarlas.

## Capabilities

### New Capabilities

- `publicadores-eventbus-confiables`: los eventos críticos de un servicio se registran en una outbox local en la misma transacción que el cambio de negocio y se publican con confirmación del broker, con reintento, estado observable y sin pérdida silenciosa.

### Modified Capabilities

(ninguna)

## Impact

- Fase futura, un PR por servicio, pruebas primero: `apps/finanzas` (P1), luego Compras, Control-Proyectos, Personal, Gerencia Técnica y el resto. Cada servicio añade una migración propia (tabla de outbox con RLS forzado) y su despliegue es independiente.
- `packages/event-bus`: posible extracción del despachador genérico hoy en `apps/compras/src/outbox.ts` (decisión del diseño).
- No cambia contratos de payload ni routing keys. No cambia los consumidores; los exige idempotentes antes de activar la publicación con reintentos.
- Fuera de alcance: #182 (bloqueado por B1), el retry/DLQ de los consumidores (lotes L1–L6 de la auditoría), `deploy-ssh-host-key-pinning` y la deuda del test flaky (ver `deudas-independientes.md`).

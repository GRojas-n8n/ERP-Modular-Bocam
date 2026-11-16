## Context

Ver `proposal.md` e `inventario-publicadores.md`. Resumen: los publicadores críticos publican después del commit con `publish()`, sin confirmación, sin reintento y descartando el resultado. El bus ofrece `publishConfirmed` y Compras tiene un outbox funcional (`apps/compras/src/outbox.ts`, migración `20260925130000_outbox_eventos`: RLS habilitado y forzado, despachador apagado por defecto con `COMPRAS_OUTBOX_DISPATCHER`, `FOR UPDATE SKIP LOCKED`, backoff, estado `ERROR`, `/ready` con `outbox_dispatcher`).

## Goals / Non-Goals

**Goals**

- Ningún evento crítico se pierde por caída del proceso, ausencia de canal, falta de confirmación o ausencia de cola enlazada.
- Un fallo de publicación es observable y recuperable.
- Adopción por servicio, sin regresión del comportamiento actual durante la transición.

**Non-Goals**

- Retry/DLQ de los consumidores (lotes L1–L6 de `auditar-consumidores-eventbus-sin-perdida-silenciosa`).
- Garantía de entrega exactamente una vez: el contrato es *al menos una vez* con `event_id` estable.
- Cambiar payloads o routing keys; decidir B1 o #182.
- Un broker distinto o CDC.

## Decisions

### 1. Patrón

Outbox transaccional **local por servicio** (una tabla `outbox_eventos` por base de datos, sin JOINs cruzados), reutilizando el diseño de Compras:

- La escritura de negocio y la fila de outbox se confirman en la **misma transacción** (`createTenantContext` en Finanzas).
- Columnas mínimas: `id`, `event_id` (UUID estable, único por `(tenant_id, event_id)`), `event_type`, `event_version`, `tenant_id`, `proyecto_id`, `aggregate_type`, `aggregate_id` (p. ej. la OC), `payload` (JSON), `correlation_id`, `created_at`, `estado` (`PENDIENTE` / `PUBLICADO` / `ERROR`), `intentos`, `proximo_intento_at`, `ultimo_error`, `publicado_at`.
- Tenant, proyecto, fecha y versión de esquema viajan en el evento (contexto del `BocamEvent` más `event_version`).
- RLS habilitado y **forzado**, con las mismas políticas tenant/proyecto que el resto del servicio; el despachador corre con el rol de runtime y su propio contexto por fila (no `BYPASSRLS`).
- El `event_id` se genera al escribir la fila, no al publicar; un reintento publica el mismo `event_id`.

### 2. Despachador

- Publica con `publishConfirmed` (confirmación del broker + `mandatory`). Solo marca `PUBLICADO` tras la confirmación.
- «Routing efectivo»: `mandatory` detecta que **ninguna** cola está enlazada a la routing key (mensaje devuelto → rechazo → reintento). No prueba que *cada* consumidor esperado tenga su cola. Por eso el diseño añade un **catálogo de consumidores esperados por evento** y una verificación al arrancar y periódica (colas declaradas y con consumidor activo); la ausencia genera alerta y marca `/ready` degradado. Se acepta que un evento con al menos una cola pero sin la de un consumidor concreto se publique como entregado; lo cubre esa verificación, no el `mandatory`.
- Reintento con backoff exponencial acotado y máximo de intentos; al agotarlos la fila pasa a `ERROR`, **no se borra** y es reintentable manualmente (`ERROR → PENDIENTE`).
- Varias instancias: `FOR UPDATE SKIP LOCKED`.
- Orden: las filas de un mismo `aggregate_id` se publican en orden de inserción y una fila en reintento retiene a las posteriores de **ese** agregado (no de los demás). No se garantiza orden entre agregados. Los consumidores siguen tolerando el desorden (p. ej. `fondos_liberados` antes de `fondos_comprometidos`, ya cubierto por #185/#186).
- Semántica al menos una vez: si el proceso cae entre la confirmación y el marcado, la fila se republica con el mismo `event_id`.

### 3. Activación sin regresión (modo de publicación por servicio)

El despachador debe nacer **apagado**. Con eventos ya existentes y en uso (a diferencia de la recepción de Compras, nueva), un outbox con despachador apagado y sin publicación directa dejaría de emitir `fondos_comprometidos` y rompería Compras. Por eso cada servicio tiene dos modos excluyentes:

| Modo | Escritura de negocio | Publicación | Uso |
|---|---|---|---|
| `direct` (por defecto al desplegar) | sin fila de outbox | la actual (`publish`) | estado de hoy; no cambia nada |
| `outbox` | fila de outbox en la misma transacción | solo el despachador, con confirmación | activación |

- No se escriben filas en modo `direct`: así, al activar, no se republica historia.
- La variable de modo y la del despachador se activan por servicio, en una operación explícita y auditada, **después** de cumplir las precondiciones de la sección 5.
- **Reversa:** volver a `direct` **no borra** filas `PENDIENTE`/`ERROR`. Antes de revertir, el despachador debe vaciar lo pendiente o las filas se conservan para reanudar al reactivar. Nunca se elimina un evento pendiente.
- **Decisión del titular (2026-09-30):** modo `direct|outbox` aprobado por servicio. Valor predeterminado al desplegar: `direct` con despachador `off`. **No** existe modo dual que publique directamente y por outbox a la vez.

### 4. Extracción del despachador

El despachador de Compras está acoplado a su esquema Prisma (`apps/compras/src/outbox.ts`). Recomendación: P1 **copia el patrón** a Finanzas con su propio esquema y extrae a `packages/event-bus` solo lo que sea idéntico y probado (cálculo de backoff, bucle de despacho con un adaptador de almacenamiento), en un PR aparte si reduce riesgo. No se modifica Compras en P1.

### 5. Precondiciones de activación (por servicio y por evento)

1. Consumidores **idempotentes por `event_id`** (o por estado demostrado) antes de activar `outbox` (al menos una vez implica duplicados). Estado hoy: Compras sí para los tres eventos de P1 (#186); **Contabilidad no demostrada** para `fondos_comprometidos`/`fondos_liberados` (auditoría, matriz de consumidores).
2. **No activar retry del consumidor** (lotes L1–L6) hasta garantizar esa idempotencia; son frentes independientes y el outbox no los sustituye.
3. Colas de los consumidores esperados declaradas y con consumidor activo (verificación del catálogo).
4. Backup verificado y preflight del VPS; despliegue del servicio **solo**, nunca global.
5. `/ready` del servicio en `ok` y cola del outbox vacía antes y después de activar; cero filas `ERROR`.

### 6. Observabilidad, retención y limpieza

- `/ready` incluye `outbox_dispatcher` (como Compras): degradado si el despachador está apagado en modo `outbox`, si hay filas `ERROR` o si la más antigua `PENDIENTE` supera un umbral.
- Métricas: pendientes, edad de la más antigua, `ERROR`, publicaciones fallidas, eventos devueltos por `mandatory` (sin routing), latencia de confirmación. Alertas sobre pendientes antiguos, `ERROR` > 0 y devoluciones por falta de cola.
- Retención (decisión del titular): `PUBLICADO` se conserva **90 días** y se limpia con un trabajo controlado (lotes pequeños, observable, registro de lo borrado, desactivable; desactivado por defecto al inicio). `PENDIENTE` y `ERROR` **nunca** se eliminan automáticamente.
- Logs estructurados sin montos ni datos de negocio (mismo criterio que #185).

### 7. Lotes

Cada lote = un change hijo o PR por servicio, pruebas primero, despliegue independiente. Orden recomendado: **P1 Finanzas** → P2 Compras (`oc_creada` tras #182) → P3 Control-Proyectos (tras B1) → P4 Personal → P5 Gerencia Técnica (con su migración al bus compartido) → P6 resto. Detalle de eventos en `inventario-publicadores.md`.

**P1 — Outbox de Finanzas:** cubre `fondos_comprometidos`, `fondos_liberados` y `presupuesto_insuficiente` en los cinco caminos de `compromiso-oc.ts` y los endpoints HTTP. El evento se encola dentro de la transacción del compromiso/liberación (o, para `presupuesto_insuficiente`, en una transacción propia de registro del rechazo, dado que no persiste movimiento). Con esto deja de depender de la republicación accidental: un compromiso ya existente puede seguir sin republicar porque el evento original está garantizado en la outbox. `P1b`: `transferencia_presupuestal`, `pago_registrado`, `oc_pagada_*`, cuando sus consumidores estén listos.

## Dependencias y estado

- #185 (Finanzas) y #186 (Compras) desplegados; el blindaje del compromiso ya está archivado.
- #182 sigue **bloqueado** (draft) por B1 y la aprobación contable; este change no lo desbloquea ni depende de él para P1.
- Contabilidad todavía puede confirmar pérdidas silenciosas como consumidor (lote L2): el outbox garantiza la **publicación**, no que Contabilidad procese el evento. No debe activarse retry del consumidor hasta su idempotencia.
- Fuera de alcance: `deploy-ssh-host-key-pinning` y el test flaky `outbox-dispatcher-arranque` (ver `deudas-independientes.md`).

## Risks / Trade-offs

- Más tablas y escritura por transacción de negocio (costo bajo en el volumen actual).
- Semántica al menos una vez: obliga a consumidores idempotentes; hasta entonces, el modo `direct` se conserva.
- El orden por agregado puede retener eventos posteriores de una misma OC mientras uno falla; se mitiga con alerta y reintento manual.
- `mandatory` no prueba la cola de cada consumidor (ver decisión 2).
- Mientras un servicio esté en `direct`, su riesgo actual de pérdida persiste; se acepta, porque es el estado actual.

## Decisiones del titular (2026-09-30)

1. Configuración por servicio: `direct` (comportamiento actual, sin escribir outbox) u `outbox` (escritura transaccional y publicación exclusiva por despachador).
2. Predeterminado durante el despliegue: modo `direct` y despachador `off`.
3. Sin modo dual (publicar directo y por outbox al mismo tiempo).
4. Retención: `PUBLICADO` 90 días; `PENDIENTE` y `ERROR` nunca se eliminan automáticamente; limpieza por lotes pequeños, observable y desactivable.
5. Orden de trabajo: P1 Finanzas (tres eventos de compromiso) → demostrar o arreglar la idempotencia de los consumidores → activar P1 → después P1b y P2–P6.
6. Responsables: implementación, Claude Code; aprobación y activación productiva, el titular; reglas contables, el responsable contable.

## Context

Inventario por búsqueda estática de suscripciones al 2026-09-29 sobre `main` (`08417dc`); detalle, referencias `archivo:línea` y matriz completa en `audit-2026-09-29.md`. Reemplaza el inventario del 2026-09-25, que omitía servicios y estaba desfasado.

| Servicio | Suscripciones | Observaciones |
|---|---:|---|
| `compras` | 7 | fondos comprometidos/liberados, presupuesto insuficiente, `oc_pagada_total/parcial` (el `catch` traga el error), transferencia de partida aprobada, centro de costos creado |
| `contabilidad` | 10 + centro de costos + worker SAT | eventos financieros, de nómina y de obra; SAT con DLX y retry propios pero apagado (perfil `sat`) |
| `finanzas` | 10 | `oc_creada/cancelada`, estimación, avance, nómina, GT, centro de costos; **omitido** en el inventario original |
| `control-proyectos` | 7 | GT (partida bloqueada, transferencia), pago registrado, salida de obra, OC creada/cancelada, centro de costos |
| `gerencia-tecnica` | 4 | cliente RabbitMQ propio (`apps/gerencia-tecnica/src/event-bus.ts`): cola anónima `exclusive`/`autoDelete`, sin TTL, sin resuscripción; **omitido** |
| `almacen` | 3 | recepción v1 (`.v3`, ya cubierta con retry/DLQ), `oc_recibida_total/parcial` (legacy, sin publicador) y centro de costos |
| `personal` | 1 | centro de costos; **omitido** |
| `calidad`, `seguridad`, `ventas` | 1 c/u | solo centro de costos creado |

Total: ~47 suscripciones más el worker SAT.

### Comportamiento por defecto del bus (todas las suscripciones salvo excepciones)

- Cola durable `<módulo>.<routing_key con . → _>` con TTL de 24 h; sin retry ni DLQ.
- Falla del handler → `nack(msg, false, false)`: mensaje perdido. El comentario del código "Envía a DLQ si está configurado" es engañoso: en la rama por defecto nunca lo está.
- El parseo del mensaje está dentro del `try`: un mensaje ininterpretable también se pierde.
- El ACK ocurre tras el handler; el bus no ofrece idempotencia.
- Un consumidor caído más de 24 h pierde eventos sin dejar registro (TTL sin DLX).

Clases de pérdida observadas: **ACK-perdido** (el handler retorna o traga el error y el bus confirma) y **nack-perdido** (el error se propaga y el bus descarta).

### Contratos incompatibles (confirmados en código)

| Evento | Publicador | Consumidor | Discrepancia |
|---|---|---|---|
| `control_obra.estimacion_aprobada` | Control-Proyectos `{estimacion_id, codigo, total_neto, presupuesto_id, total_conceptos}` | Contabilidad exige `monto_total` | todo evento real → `invalid_payload` → ACK-perdido |
| `control_obra.avance_fisico_validado` | Control-Proyectos `{avance_id, concepto, porcentaje, importe, presupuesto_id}` | Contabilidad exige `codigo` y `monto_avaluado` | descartado siempre |
| `compras.oc_creada` | Compras (único publicador, `best-effort`) sin `presupuesto_id` | Contabilidad y Finanzas lo exigen y hacen `return` | descartado; Finanzas podría sincronizar además por HTTP (por confirmar en logs) |

Las pruebas de integración de Contabilidad para estos tres flujos usan `monto_total`, `codigo`/`monto_avaluado` y `presupuesto_id` respectivamente, es decir, payloads que ningún publicador real emite; pasan en CI aunque el flujo real falle. En los demás servicios no se ha verificado.

### Riesgos de atomicidad e idempotencia

- `pago_registrado` (Contabilidad): crea el asiento y solo `if (!idempotent)` los movimientos; una falla entre ambos deja un reintento sin movimientos.
- Compras (`transferencia_partida_aprobada`) y Control-Proyectos: varias transacciones por evento.
- Control-Proyectos `ac_comprometido: { increment }`: su seguridad depende del chequeo `idempotent`, por revisar antes de activar retry.
- Compras `oc_pagada_*`: idempotencia por sobrescritura, sin control de orden (una `parcial` tardía puede degradar `PAGADA`).

### Salud

Solo Almacén y Compras exponen `/ready`. Los demás solo tienen `/health`, que no refleja el estado de los consumidores. Gerencia Técnica y Personal no tienen equivalente a `EventBus.isReady()`.

## Goals / Non-Goals

**Goals**

- Un inventario completo y una clasificación por riesgo (hecho).
- Un contrato canónico por evento consumido, verificado contra el publicador real.
- Una decisión explícita y documentada de política de fallo por suscripción.
- Un plan de adopción por lotes con criterios de prueba y orden de dependencias.

**Non-Goals**

- Cambiar consumidores, publicadores, colas o configuración de RabbitMQ en esta fase.
- Aplicar políticas globales de RabbitMQ ni modificar colas durables existentes.
- Corregir la publicación fire-and-forget (change separado, ver decisión 8).
- Consultar producción: las lecturas pendientes (sección 8 de la auditoría) las ejecuta el titular.

## Decisions

### 1. Clasificación por consecuencia de la pérdida

Cada suscripción es **crítica** (pérdida afecta dinero, inventario, nómina o cumplimiento fiscal), **relevante** (afecta proyecciones o alertas recuperables) o **informativa** (solo registro).

### 2. Política mínima por clase

Crítica: reintentos con espera, DLQ, idempotencia y atomicidad comprobadas por prueba, `/ready` y monitoreo. Relevante: reintentos y DLQ. Informativa: DLQ o descarte explícito y documentado.

### 3. Clasificación de fallos

- **Payload inválido o contrato incumplido** → `NonRetryableError`: va a la DLQ sin reintentos, con payload y motivo. Nunca `return` ni ACK silencioso.
- **Error transitorio** (BD, red, timeout) y **no-encontrado por carrera** (p. ej. OC aún no visible) → reintento con espera; agotados los intentos, DLQ.
- El log de `invalid_payload` no imprime el payload completo ni montos.

### 4. Ningún retry sin idempotencia y atomicidad

Antes de activar retry en una suscripción debe existir una prueba de idempotencia (mismo evento dos veces = mismo estado) y la escritura de negocio debe ser una sola transacción. Excepción explícita a corregir primero: `pago_registrado` de Contabilidad (L2).

### 5. Contrato canónico y pruebas con el publicador real

Cada evento consumido tiene un contrato canónico (campos, tipos, obligatorios) ubicado junto al publicador o en un paquete compartido. Las pruebas del consumidor construyen el payload con el mismo contrato o con un fixture verificado contra el publicador real, no con payloads escritos a mano. Una prueba de conformidad falla si publicador y consumidor divergen.

### 6. Colas nuevas con convención versionada y rollback

RabbitMQ no permite redeclarar una cola durable con argumentos distintos. La adopción crea colas nuevas por suscripción con nombre `<módulo>.<routing_key con . → _>.v<N>`, donde N es mayor que cualquier versión existente en el broker (Almacén ya usa `.v2` y `.v3`; no se reutilizan). Rollback: la suscripción anterior se conserva detrás de una bandera y solo una de las dos versiones consume a la vez; la cola anterior no se elimina hasta terminar la ventana de observación. La convención exacta (y el manejo de mensajes que queden en la cola anterior) se cierra en la tarea 3.1.

### 7. Lotes de adopción

Bug-fix previos, cada uno con su propio change (ciclo: spec del bug → prueba que lo reproduce → fix → PR), antes de activar retry en los consumidores afectados para no llenar la DLQ de eventos siempre inválidos:

| Lote | Alcance | Depende de | Responsable funcional |
|---|---|---|---|
| **B1** | Alinear `estimacion_aprobada` y `avance_fisico_validado` entre Control-Proyectos y Contabilidad | decisión del titular sobre el contrato canónico | Control de Proyectos + Contabilidad |
| **B2** | `presupuesto_id` en `compras.oc_creada` (o relajar los consumidores) | decisión del titular | Compras (publicador) |
| **L1 Compras** | `oc_pagada_*`, fondos, transferencia: no tragar errores, `NonRetryableError` para lo inválido, retry para carreras, control de orden en `estado_pago` | — | Compras |
| **L2 Contabilidad** | 10 suscripciones; `pago_registrado` en una sola transacción | B1, B2 | Contabilidad |
| **L3 Finanzas** | empezando por `oc_creada`, estimación y nómina | B1, B2 | Finanzas |
| **L4 Control-Proyectos** | 7 suscripciones; revisar `increment` | — | Control de Proyectos |
| **L5 Gerencia Técnica** | migrar al bus compartido con colas durables, resuscripción y `/ready` | — | Gerencia Técnica |
| **L6 Informativas y legacy** | documentar el descarte explícito de `centro_costos_creado`; retirar `oc_recibida_*` (con autorización expresa) | — | Almacén, Calidad, Seguridad, Ventas, Personal |
| **Change aparte: publicadores** | confirmación y outbox para eventos críticos | fuera de este change | por definir en su propio change |

Orden recomendado: B1 → B2 → L1 (independiente, puede ir en paralelo con B1) → L2 → L3 → L4 → L5 → L6.

### 8. Publicación fuera de alcance

`EventBus.publish` es fire-and-forget y devuelve `false` sin excepción si no hay canal; `compras.oc_creada` se publica con `try/catch` "best-effort". Esto es un hallazgo del lado publicador y se trata en un change separado de confiabilidad de publicadores. Este change lo referencia pero no lo corrige.

### 9. Colas sin consumidor

Se inventarían con su última actividad conocida (lectura del titular) y se propone retirar las de servicios retirados o de pruebas (hay nombres con UUID como `finanzas-in-…`, `compras-in-…`, hipótesis por confirmar). Ningún retiro se ejecuta sin autorización expresa.

## Risks / Trade-offs

- Activar reintentos sin idempotencia y atomicidad comprobadas puede duplicar efectos: se exige la prueba antes de cada adopción.
- Activar retry antes de B1/B2 llenaría la DLQ con eventos siempre inválidos: B1 y B2 van primero.
- Una DLQ sin vigilancia solo traslada la pérdida: el monitoreo es parte de cada lote.
- Los logs de Contabilidad y Finanzas imprimen montos y payloads completos: los lotes los reducen.
- Las conclusiones vienen de análisis estático; lo hipotético (colas huérfanas, si Finanzas se sincroniza por HTTP, si hay asientos de estimación) queda sujeto a las lecturas de la sección 8 de la auditoría.

# P1 — Outbox de Finanzas: implementación, despliegue y activación

Estado: **implementado y NO activado.** El PR de implementación despliega el código con `FINANZAS_EVENT_MODE=direct` (comportamiento actual, sin escribir outbox) y el despachador y la limpieza apagados. Activar es una operación aparte, aprobada y ejecutada por el titular.

## Qué se implementó (solo Finanzas)

| Pieza | Archivo | Resumen |
|---|---|---|
| Tabla y RLS | `prisma/migrations/20260930180000_outbox_eventos_finanzas/` | Migración aditiva, atómica (`BEGIN/COMMIT`) e idempotente, con `rollback.sql` que se niega a borrar si hay filas `PENDIENTE`/`ERROR`. RLS habilitado y **forzado**: la aplicación lee e inserta solo filas de su tenant y proyecto; **no** actualiza ni borra. El despachador (`app.internal_worker = 'outbox'`) lee todo, actualiza y borra `PUBLICADO` antiguos. Paridad con `prisma/rls-policies.sql`. |
| Escritura | `src/outbox-eventos.ts`, `src/compromiso-oc.ts` | En modo `outbox` el evento se escribe en **la misma transacción** que el movimiento presupuestal, bajo el lock advisory de la OC. `event_id` derivado del movimiento (un mismo hecho de negocio nunca produce dos filas). `aggregate_seq` monotónica por OC, asignada bajo el lock y respaldada por un índice único. |
| Despachador | `src/outbox-dispatcher.ts` | `publishConfirmed` + `mandatory`; `FOR UPDATE … SKIP LOCKED`; orden estricto por OC (una fila solo es elegible si no hay una anterior de la misma OC sin `PUBLICADO`); backoff; `ERROR` tras agotar intentos; error sanitizado; métricas; limpieza de `PUBLICADO` > 90 días por lotes. |
| Consumidores esperados | `src/outbox-consumidores.ts` | Catálogo por evento y verificación pasiva (cola existente con consumidor activo). |
| Observabilidad | `GET /ready` (sin auth) | Distingue base, RabbitMQ, despachador, consumidores y backlog/errores. |

Eventos cubiertos: `finanzas.fondos_comprometidos`, `finanzas.fondos_liberados`, `finanzas.presupuesto_insuficiente` (HTTP `comprometer-fondos`/`liberar-fondos` y eventos `compras.oc_creada`/`compras.oc_cancelada`). `partida_comprometida` no publica estos eventos hoy y no cambia.

## Configuración (por servicio; todos los valores predeterminados son seguros)

| Variable | Predeterminado | Efecto |
|---|---|---|
| `FINANZAS_EVENT_MODE` | `direct` | `direct`: publica como siempre y **no escribe outbox**. `outbox`: escribe en la outbox y **no publica directamente**. Solo el valor exacto `outbox` activa el modo; cualquier otro es `direct`. No existe modo dual. |
| `FINANZAS_OUTBOX_DISPATCHER` | apagado | Solo el valor exacto `on` lo enciende. |
| `FINANZAS_OUTBOX_CLEANUP` | apagado | Solo `on` activa la limpieza de `PUBLICADO`. |
| `FINANZAS_OUTBOX_RETENCION_DIAS` | `90` | Retención de `PUBLICADO`. `PENDIENTE` y `ERROR` nunca se borran. |
| `FINANZAS_OUTBOX_LIMPIEZA_LOTE` | `100` | Filas por lote de limpieza. |
| `FINANZAS_OUTBOX_INTERVALO_MS` / `_MAX_INTENTOS` | `5000` / `10` | Cadencia y reintentos del despachador. |
| `FINANZAS_OUTBOX_MAX_PENDIENTE_SEG` | `300` | Antigüedad a partir de la cual `/ready` considera atascado el backlog. |
| `FINANZAS_OUTBOX_VERIFICACION_MS` | `60000` | Periodo de la verificación de consumidores. |

Ninguna de estas variables está definida en `docker-compose.vps.yml` ni en `.env.vps.example`; una prueba estática lo vigila.

## Semántica de `/ready`

- **Modo `direct`:** la outbox es informativa; `/ready` es 200 si base y RabbitMQ responden.
- **Modo `outbox`:** 503 si el despachador está apagado o falló, hay filas en `ERROR`, hay pendientes más antiguos que el umbral o falta la cola de un consumidor esperado.
- El `healthcheck` de Docker usa `/health`, no `/ready`: un `/ready` en 503 no reinicia ni detiene el contenedor.

## Plan de despliegue (código en modo `direct`)

1. PR de implementación con CI verde (suites del outbox con PostgreSQL y RabbitMQ reales) y revisión del titular. No se fusiona sin autorización.
2. Tras fusionar, el despliegue del backend afecta **solo a Finanzas** (el detector de servicios toma `apps/finanzas/`). El arranque ejecuta `prisma migrate deploy`, que crea la tabla vacía (migración aditiva, sin tocar datos).
3. Verificaciones posteriores (solo lectura): Finanzas healthy; `GET /ready` → 200 con `event_mode: direct` y `dispatcher: disabled`; tabla `outbox_eventos` con 0 filas; `/ready` muestra en `consumers` el estado de las colas; RabbitMQ sin mensajes pendientes; ningún cambio de comportamiento de los tres eventos.
4. **Fin del despliegue.** El modo sigue en `direct`: el riesgo de pérdida actual persiste hasta la activación.

## Activación controlada (operación del titular, posterior)

Precondiciones (todas verificables):

1. P1 desplegado en modo `direct` y estable (sin errores nuevos).
2. Consumidores idempotentes: demostrado para Compras y Contabilidad (`auditoria-idempotencia-consumidores-p1.md`, PR #190).
3. `/ready` muestra `consumers.estado = ok` (colas de Compras y Contabilidad con consumidor).
4. Backup verificado y `movimientos_presupuestales`/`outbox_eventos` revisadas en solo lectura.
5. Ventana de baja actividad; titular presente.

Pasos: (a) encender **primero** el despachador (`FINANZAS_OUTBOX_DISPATCHER=on`) manteniendo `direct` (no hay filas; solo prueba que arranca y `/ready` sigue 200); (b) cambiar `FINANZAS_EVENT_MODE=outbox` y reiniciar **solo Finanzas**; (c) ejercitar un compromiso/liberación controlado con autorización del titular y comprobar fila → `PUBLICADO` → consumo en Compras y Contabilidad; (d) `/ready` 200, outbox sin `ERROR` ni atascos; (e) la limpieza (`FINANZAS_OUTBOX_CLEANUP`) se enciende después, por separado.

**Reversa** (sin eliminar eventos pendientes): volver `FINANZAS_EVENT_MODE=direct` y reiniciar solo Finanzas. Las filas `PENDIENTE`/`ERROR` se conservan; con el despachador encendido se vacían, y si no, esperan. `ERROR` → `PENDIENTE` con `reintentarFilasEnError()` (operación manual). `rollback.sql` solo procede con la tabla sin pendientes.

## Límites y riesgos conocidos

1. **Prisma 5.22 no propaga un fallo de `COMMIT` diferido** en `$transaction` interactivo: la transacción se revierte completa (movimiento y evento), pero la llamada vuelve sin error y la API podría responder éxito. Hoy ningún camino usa restricciones diferidas, por lo que es un riesgo latente y de plataforma, no introducido por P1; P1 mantiene la atomicidad (nada persiste a medias). Se registra como deuda de plataforma (revisar al actualizar Prisma).
2. **`mandatory` solo detecta «ninguna cola enlazada»**, no que cada consumidor tenga la suya: lo cubre la verificación de consumidores (cola existente con consumidor activo). No detecta un binding eliminado a mano con el consumidor aún activo (exigiría la API de gestión de RabbitMQ; fuera de este lote).
3. **Un evento `ERROR` retiene los posteriores de su misma OC** (orden estricto). Es deliberado: se ve en `/ready` y se libera con el reintento manual.
4. **Semántica al menos una vez:** ante caída entre la confirmación y el marcado, el evento se republica con el mismo `event_id`; los consumidores de P1 lo toleran (auditoría).
5. **`presupuesto_insuficiente`** usa un `event_id` por decisión de rechazo (no determinista, para no suprimir un rechazo legítimo posterior de la misma OC); un reintento tras un fallo puede emitir más de uno, y Compras es idempotente.
6. **`not_found` es terminal en los consumidores** (Compras sin OC, Contabilidad sin asiento): el outbox garantiza la publicación, no el procesamiento. Reenviar filas `PUBLICADO` requiere una herramienta manual aún no implementada (recomendación en la auditoría).
7. **Migración y rol de runtime:** `prisma migrate deploy` corre con el rol de runtime; la migración no reemplaza funciones ajenas y solo crea objetos propios de la tabla nueva (lección de #185). Prueba estática y de ejecución.

## Evidencia de pruebas (local, PostgreSQL 16 y RabbitMQ 3.12 reales en contenedores desechables)

- `outbox-eventos` 25/25, `outbox-eventos-rls-ready` 17/17, `outbox-eventos-migracion` 10/10; las suites previas de Finanzas (`compromiso-oc-concurrencia` 16, `compromiso-oc-rls` 7, `compromiso-oc-migracion` 8) siguen en verde. `tsc` limpio.
- **Rojo previo:** sin los módulos del outbox las tres suites no cargan (no existen `outbox-eventos`, `outbox-dispatcher` ni la tabla). La evidencia de que las pruebas detectan defectos reales está en las mutaciones.
- **Mutaciones (13/13 detectadas):** sin transacción (2 fallos), sin publisher confirms (7), sin `mandatory` (1), sin lock advisory (1), sin orden por agregado (2), sin `SKIP LOCKED` (1), limpieza sin filtro de estado (1), `direct` que escribe (3), `event_id` de liberación no determinista (1), política UPDATE abierta (2), migración sin `FORCE` (1, en la suite de esquema limpio), `/ready` sin considerar el despachador apagado (1), migración sin `BEGIN/COMMIT` (1).
- **Defectos reales que las pruebas encontraron durante el desarrollo:** la limpieza por lotes borraba más filas que el lote (un `IN (SELECT … LIMIT … FOR UPDATE)` se re-evalúa como semi-join; se corrigió con una CTE `MATERIALIZED`); y el hallazgo de plataforma sobre `COMMIT` diferido (ver «Límites», punto 1).

## Why

`@bocam/event-bus` hace `nack(msg, false, false)` cuando un handler lanza una excepción y sus colas solo declaran un TTL de 24 h, sin exchange de mensajes muertos (`packages/event-bus/src/index.ts:343-406`). Por defecto, un error descarta el mensaje. Además, muchos handlers confirman (ACK) un payload inválido con un `return` o tragan el error en un `catch`, de modo que el evento se pierde sin rastro recuperable. Solo Almacén (recepción de OC, cola `.v3`) y el worker SAT de Contabilidad (apagado en producción) configuran reintento y cola de mensajes fallidos.

La auditoría de repositorio del 2026-09-29 (`audit-2026-09-29.md`, sobre `main` en `08417dc`) confirma que el problema sigue vigente tras #167, #168, #169, #171 y #179, y encontró que:

- hay unas **47 suscripciones** más el worker SAT, no las ~28 del inventario original: faltaban Finanzas (10), Personal (1) y Gerencia Técnica (4), y Control-Proyectos tiene 7, no 6;
- **tres contratos publicador→consumidor son incompatibles** (`control_obra.estimacion_aprobada`, `control_obra.avance_fisico_validado`, `compras.oc_creada`), por lo que Contabilidad descarta en silencio todo evento real de esos tipos;
- las pruebas de Contabilidad de esos flujos usan payloads que ningún publicador real emite, y por eso pasan en CI;
- Gerencia Técnica usa un cliente RabbitMQ propio con cola anónima y sin resuscripción tras una reconexión;
- solo Almacén y Compras exponen `/ready`; ningún otro consumidor crítico refleja el estado de su suscripción;
- varios handlers no son atómicos (p. ej. `pago_registrado` en Contabilidad) y activar reintentos sin corregirlos duplicaría efectos o dejaría estados parciales.

Las cifras de RabbitMQ del original (67 colas, 20 sin consumidor, 2 con DLX) son anteriores a #171 y deben volver a medirse.

## What Changes

- Inventariar todos los consumidores del bus (incluido el cliente propio de Gerencia Técnica) y clasificar cada suscripción por consecuencia de perder el evento, idempotencia, atomicidad y comportamiento ante errores del handler. **Hecho** en `audit-2026-09-29.md`.
- Establecer una matriz de contratos: cada evento consumido tiene un contrato canónico y una prueba con el payload del publicador real.
- Definir la política de fallo por suscripción: payload inválido → DLQ como no reintentable; error transitorio → reintento; ningún retry sin idempotencia y atomicidad verificadas.
- Exigir `/ready` en los consumidores críticos y resuscripción tras reconexión.
- Definir una convención versionada de nombres de cola que permita rollback, sin redeclarar colas durables existentes.
- Auditar las colas sin consumidor (requiere lectura del titular) y proponer su retiro.
- Definir el monitoreo y el procedimiento de reproceso de las colas de mensajes fallidos.
- Producir un plan de adopción por lotes (B1, B2, L1–L6) priorizado por riesgo, **sin cambiar aún ningún consumidor**.

## Capabilities

### New Capabilities

- `consumidores-eventbus-sin-perdida-silenciosa`: toda suscripción declara su política de fallo, todo evento consumido tiene contrato canónico verificado contra el publicador real, y ningún error de handler o payload inválido descarta un evento de negocio en silencio.

### Modified Capabilities

(ninguna)

## Impact

- Este change (fase de auditoría y planificación): solo documentación; sin cambios en servicios, colas, datos ni producción.
- Fases posteriores, cada una con su propio change, spec y PR: pre-lotes B1 y B2 (bug-fix) y lotes L1–L6 por servicio (ver `design.md`, decisión 7).
- **Fuera de alcance:** la publicación fire-and-forget (`EventBus.publish` devuelve `false` sin excepción si no hay canal; solo Compras tiene outbox con `publishConfirmed`, y solo para la recepción de OC). Se trata en un change separado de confiabilidad de publicadores.
- Depende de las opciones `retry` y `deadLetter` del bus, ya entregadas por #167 (cumplido).
- La tarea 7.3 de `fix-ingresos-almacen-por-recepcion-oc` se considera transferida cuando se cumplan las condiciones de la tarea 4.3; este change no modifica el otro change.

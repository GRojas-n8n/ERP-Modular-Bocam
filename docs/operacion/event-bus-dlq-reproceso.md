# Cola de mensajes fallidos del bus de eventos: inspección y reproceso

Aplica a las suscripciones que activan `retry` o `deadLetter` en `@bocam/event-bus`. Una suscripción sin esas opciones no tiene DLQ y descarta el mensaje ante un error del handler.

## Colas de una suscripción resiliente

Para una cola principal `Q`:

| Cola | Función |
|---|---|
| `Q` | Cola de trabajo de la suscripción. |
| `Q.retry` | Espera de `delayMs` y regreso automático a `Q`. Solo existe si se activó `retry`. |
| `Q.dlq` | Mensajes que agotaron los intentos o no se pudieron interpretar. No tiene TTL. |

`delayMs` forma parte de la identidad de `Q.retry`: RabbitMQ no permite redeclarar una cola durable con argumentos distintos. Cambiar la espera exige un nombre de cola nuevo.

## Qué contiene un mensaje en la DLQ

El cuerpo es el evento original, sin cambios. Los headers explican por qué llegó ahí:

- `x-attempt`: intentos realizados.
- `x-failure-reason`: último error, o `MENSAJE_ININTERPRETABLE: …`.
- `x-original-queue`, `x-original-routing-key` y `x-dead-lettered-at`.
- `x-event-id`, `x-tenant-id` y `x-correlation-id` cuando el emisor los incluyó.

Cada envío a la DLQ deja un log de error con `action: "event_bus.dlq.enviado"`, `event_type`, `event_id`, `tenant_id`, `correlation_id` y el motivo.

## Procedimiento de reproceso

1. **Diagnosticar.** Buscar en los logs `event_bus.dlq.enviado` y agrupar por `reason`. No reprocesar antes de conocer la causa.
2. **Corregir la causa** (código, datos o dependencia) y desplegarla por el flujo normal.
3. **Confirmar la idempotencia.** Solo se reprocesa si el consumidor es idempotente para ese evento (`event_id` o su clave natural). Si no lo es, no reprocesar sin una revisión específica.
4. **Acotar el alcance.** Anotar cuántos mensajes hay en `Q.dlq` y cuáles se reprocesarán. Un mensaje de formato antiguo o de versión no soportada no se arregla reprocesándolo: se descarta con decisión documentada.
5. **Mover los mensajes** de `Q.dlq` a `Q` con la herramienta de gestión de RabbitMQ (mover mensajes o Shovel), o con un script que lea `Q.dlq` y republique a `Q` con confirmación, retirando cada mensaje solo después de la confirmación.
6. **Verificar.** `Q.dlq` vacía, `Q` sin acumulación y el efecto esperado en el servicio consumidor. Si un mensaje vuelve a la DLQ, repetir desde el paso 1.
7. **Registrar** fecha, cola, cantidad, causa y responsable.

## Reglas

- La DLQ nunca se purga sin autorización expresa del titular y sin copia de los mensajes.
- El reproceso en producción requiere autorización expresa y un alcance presentado de antemano.
- Vigilar la profundidad de cada DLQ: una DLQ sin vigilancia solo cambia dónde se pierde la información.

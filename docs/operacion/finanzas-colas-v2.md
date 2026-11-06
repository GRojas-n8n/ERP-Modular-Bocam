# Colas `.v2` de los consumidores de Finanzas

Change: `blindar-consumidores-finanzas` (hallazgo F21 de la auditoría del 5 nov 2026).

## Por qué

Las 10 suscripciones de Finanzas usaban la cola por defecto del EventBus (`finanzas.<patrón>`): sin reintento, sin DLQ y con `x-message-ttl` de 24 h. Un error del handler (BD caída, deadlock, timeout) descartaba el evento (`nack` sin reencolar) y un evento sin consumir más de 24 h caducaba. Así se podían perder en silencio compromisos de OC, sincronizaciones de presupuesto de GT y movimientos de nómina.

Los argumentos de una cola existente son inmutables en RabbitMQ, así que la corrección son colas nuevas.

| Cola | Estado | Argumentos |
|---|---|---|
| `finanzas.<patrón>` (10 colas) | Obsoletas tras el despliegue. Se eliminan cuando estén vacías | `x-message-ttl: 86400000` |
| `finanzas.<patrón>.v2` | Vigentes | **sin `x-message-ttl`**; dead-letter hacia `<cola>.dlq` |
| `finanzas.<patrón>.v2.retry` | Vigentes | `x-message-ttl` = espera entre intentos; dead-letter de vuelta a `.v2` |
| `finanzas.<patrón>.v2.dlq` | Vigentes. Durables, sin TTL | sin argumentos |

Configuración (variables de entorno del servicio `finanzas`, opcionales):

| Variable | Por defecto | Uso |
|---|---|---|
| `FINANZAS_EVENTOS_MAX_INTENTOS` | 5 | Intentos antes de mandar a `.dlq` |
| `FINANZAS_EVENTOS_ESPERA_MS` | 30000 | Espera entre intentos |

Los handlers son idempotentes: compromiso y liberación de OC por índice parcial, presupuesto de GT por `upsert`, proyección de OCs por `ON CONFLICT DO NOTHING`, nómina por `uq_movimiento_nomina` (migración `20261110120000_unicidad_movimientos_nomina`, incluida en este change).

## Despliegue (lunes a primera hora, antes de operar la semana)

En la Consola web del VPS.

### 1. Antes de integrar el PR

```bash
docker exec bocam-vps-rabbitmq rabbitmqctl -q list_queues name messages consumers | grep '^finanzas\.'
```

Las 10 colas `finanzas.<patrón>` deben tener **0 mensajes**. Si alguna tiene mensajes, esperar a que Finanzas los consuma.

Respaldo de `bocam_finanzas` (`claude/vps-comandos-verificados.md`, Bloque 1): la migración del índice de nómina corre al arrancar el servicio.

### 2. Integrar el PR y esperar el despliegue en verde

### 3. Verificar

```bash
docker exec bocam-vps-rabbitmq rabbitmqctl -q list_queues name messages consumers arguments | grep '^finanzas\.'
docker exec -w /workspace bocam-vps-finanzas npx prisma migrate status --schema apps/finanzas/prisma/schema.prisma 2>&1 | tail -3
```

Esperado:

- 10 colas `finanzas.<patrón>.v2` con **1 consumidor** cada una y argumentos solo de dead-letter (sin `x-message-ttl`).
- 10 colas `.v2.retry` y 10 `.v2.dlq` con 0 mensajes.
- Las colas antiguas `finanzas.<patrón>` con **0 consumidores**.
- 7 migraciones, "up to date".

### 4. Eliminar las colas antiguas

Siguen enlazadas al exchange: sin eliminarlas acumulan copias de cada evento que nadie consume. Solo si están en 0 mensajes:

```bash
for q in compras_oc_creada compras_oc_cancelada control_obra_estimacion_aprobada control_obra_avance_fisico_validado \
         control_obra_avance_fisico_registrado auth_centro_costos_creado gerencia_tecnica_saldo_partida_creado \
         gerencia_tecnica_partida_comprometida personal_nomina_autorizada personal_nomina_pagada; do
  n=$(docker exec bocam-vps-rabbitmq rabbitmqctl -q list_queues name messages | awk -v q="finanzas.$q" '$1==q {print $2}')
  if [ "$n" = "0" ]; then docker exec bocam-vps-rabbitmq rabbitmqctl -q delete_queue "finanzas.$q" && echo "eliminada finanzas.$q"
  else echo "CONSERVADA finanzas.$q (mensajes: ${n:-no existe})"; fi
done
```

## Operación diaria

```bash
docker exec bocam-vps-rabbitmq rabbitmqctl -q list_queues name messages | grep -E '^finanzas\..*\.dlq' | awk '$2 > 0'
```

Sin salida = sin eventos fallidos. Un mensaje en `.dlq` trae `x-failure-reason` y `x-attempt` en sus headers; se revisa la causa, se corrige y se reinyecta con el mecanismo de reproceso del EventBus.

## Rollback

Redesplegar la imagen anterior de `finanzas`. Vuelve a declarar las colas `finanzas.<patrón>` (sin sufijo) y deja de consumir las `.v2`. Los mensajes que hubiera en una `.v2` en ese momento se quedan ahí (no caducan) y se reprocesan al volver a desplegar este cambio. El índice `uq_movimiento_nomina` es compatible con el código anterior: el handler viejo ya revisaba duplicados antes de insertar.

/**
 * Cola de Almacén para `compras.recepcion_oc_registrada.v1`.
 * Change: fix-ingresos-almacen-por-recepcion-oc.
 *
 * Historia de la cola (los argumentos de una cola existente son inmutables en RabbitMQ; por eso cada corrección
 * es una cola nueva y las anteriores se conservan sin tocar):
 *   - `.v2`: creada con el TTL de 24 h que el EventBus aplica por defecto y sin dead-letter. Un mensaje no
 *            consumido en 24 h desaparecía sin dejar rastro. Ya no se consume; se conserva para rollback.
 *   - `.v3`: cola vigente. Sin TTL y con dead-letter a su DLQ.
 */
export const RECEPCION_OC_EVENT = 'compras.recepcion_oc_registrada.v1';
export const RECEPCION_OC_COLA = 'almacen.compras_recepcion_oc_registrada_v1.v3';
export const RECEPCION_OC_COLA_V2 = 'almacen.compras_recepcion_oc_registrada_v1.v2';

/**
 * Argumentos de la cola principal `.v3`.
 *
 * - Sin `x-message-ttl`: el EventBus lo pone por defecto (86400000) antes de mezclar `queueArguments`; el valor
 *   `undefined` lo sustituye y amqplib omite las claves `undefined` al declarar la cola. Una recepción confirmada
 *   por el broker NO puede expirar mientras Almacén esté detenido: el outbox de Compras ya la dio por publicada.
 *   Lo comprueba `almacen-recepcion-oc-retencion.integration.test.ts` declarando la cola con RabbitMQ real.
 * - Dead-letter a `<cola>.dlq` por el exchange por defecto: si por cualquier motivo un mensaje deja de poder
 *   permanecer en la cola (rechazo sin reencolar, expiración por una política futura), termina en la DLQ durable
 *   y observable en lugar de desaparecer.
 */
export function argumentosColaRecepcionOc(cola: string = RECEPCION_OC_COLA): Record<string, unknown> {
  return {
    'x-message-ttl': undefined,
    'x-dead-letter-exchange': '',
    'x-dead-letter-routing-key': `${cola}.dlq`,
  };
}

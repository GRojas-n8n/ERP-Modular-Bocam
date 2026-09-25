/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Paquete: @bocam/event-bus
 * Bus de Eventos compartido basado en RabbitMQ (Topic Exchange).
 *
 * Capacidades:
 * - Publicar eventos tipados con contexto de seguridad obligatorio.
 * - Suscribirse a patrones de eventos (ej: "compras.*", "#").
 * - Reconexión automática con backoff exponencial.
 * - Validación defensiva de tenant_id y proyecto_id.
 *
 * Regla Arquitectónica: TODO evento DEBE incluir tenant_id y proyecto_id
 * en su payload. Un evento sin contexto es un evento inválido y será
 * rechazado silenciosamente.
 * ---------------------------------------------------------------------------
 */

import { randomUUID } from 'node:crypto';
import * as amqplib from 'amqplib';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface BocamEvent<T = unknown> {
  /** Identificador único del evento. Si falta, el bus asigna un UUID al publicar. */
  event_id?: string;
  /** Versión del contrato del evento (opcional; la routing key versionada es la fuente de verdad). */
  event_version?: number;
  event_type: string;
  timestamp: string;
  context: {
    tenant_id: string;
    proyecto_id: string;
    user_id: string;
    correlation_id?: string;
  };
  payload: T;
}

export interface EventBusConfig {
  amqpUrl?: string;
  exchangeName?: string;
  sourceModule: string;
  prefetchCount?: number;
}

export type EventHandler<T = unknown> = (event: BocamEvent<T>) => Promise<void>;

export interface PublishOptions {
  routingKey?: string;
  headers?: Record<string, unknown>;
}

export interface PublishConfirmedOptions extends PublishOptions {
  /** Tiempo máximo de espera de la confirmación del broker (ms). Por defecto 5000. */
  timeoutMs?: number;
}

export interface RetryOptions {
  /** Intentos totales, incluido el primero. */
  maxAttempts: number;
  /** Espera entre intentos (ms). Forma parte de la identidad de la cola `<cola>.retry`. */
  delayMs: number;
}

export interface SubscriptionOptions {
  queueName?: string;
  queueArguments?: Record<string, unknown>;
  /**
   * Opt-in. Con `retry`, un fallo del handler republica el mensaje a `<cola>.retry` (espera) y de ahí
   * vuelve a la cola principal; agotados los intentos va a `<cola>.dlq`. Sin `retry` ni `deadLetter`,
   * un error del handler descarta el mensaje (`nack` sin reencolar), como siempre.
   */
  retry?: RetryOptions;
  /** Opt-in. Declara `<cola>.dlq` y envía ahí los mensajes ininterpretables o que agotaron los intentos. */
  deadLetter?: boolean;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const DEFAULT_EXCHANGE = 'bocam.events';
const EXCHANGE_TYPE = 'topic';
const MAX_RECONNECT_DELAY = 30000;
const DEFAULT_CONFIRM_TIMEOUT_MS = 5000;

// ─── Clase EventBus ─────────────────────────────────────────────────────────

export class EventBus {
  private config: Required<Omit<EventBusConfig, 'prefetchCount'>> & { prefetchCount: number };
  private connection: amqplib.ChannelModel | null = null;
  private publishChannel: amqplib.Channel | null = null;
  private subscribeChannel: amqplib.Channel | null = null;
  /** Canal con confirmaciones del broker: publicación confirmada y republicación a reintento/DLQ. */
  private confirmChannel: amqplib.ConfirmChannel | null = null;
  /** messageId de mensajes `mandatory` devueltos por el broker por no tener cola enlazada. */
  private returnedMessageIds = new Set<string>();
  private reconnectAttempts = 0;
  private isShuttingDown = false;
  private subscriptions: Array<{
    pattern: string;
    queueName: string;
    handler: EventHandler;
    options?: SubscriptionOptions;
  }> = [];

  constructor(config: EventBusConfig) {
    this.config = {
      amqpUrl: config.amqpUrl || process.env.RABBITMQ_URL || '',
      exchangeName: config.exchangeName || DEFAULT_EXCHANGE,
      sourceModule: config.sourceModule,
      prefetchCount: config.prefetchCount || 10,
    };
  }

  // ── Conexión ──────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (!this.config.amqpUrl) {
      console.warn(
        `[EventBus:${this.config.sourceModule}] RABBITMQ_URL no configurado. Event Bus deshabilitado de forma explicita.`
      );
      return;
    }

    try {
      const connection = await amqplib.connect(this.config.amqpUrl);
      const publishChannel = await connection.createChannel();
      const subscribeChannel = await connection.createChannel();
      const confirmChannel = await connection.createConfirmChannel();

      this.connection = connection;
      this.publishChannel = publishChannel;
      this.subscribeChannel = subscribeChannel;
      this.confirmChannel = confirmChannel;

      confirmChannel.on('return', (msg) => {
        const id = msg?.properties?.messageId;
        if (typeof id === 'string') this.returnedMessageIds.add(id);
      });
      confirmChannel.on('error', (err) => {
        console.error(`[EventBus:${this.config.sourceModule}] ❌ Error en el canal de confirmación:`, err.message);
      });

      await publishChannel.assertExchange(this.config.exchangeName, EXCHANGE_TYPE, { durable: true });
      await subscribeChannel.assertExchange(this.config.exchangeName, EXCHANGE_TYPE, { durable: true });
      await subscribeChannel.prefetch(this.config.prefetchCount);

      this.reconnectAttempts = 0;
      console.log(`[EventBus:${this.config.sourceModule}] ✅ Conectado a RabbitMQ. Exchange: ${this.config.exchangeName}`);

      // Reconexión automática
      connection.on('error', (err) => {
        console.error(`[EventBus:${this.config.sourceModule}] ❌ Error de conexión:`, err.message);
      });

      connection.on('close', () => {
        if (!this.isShuttingDown) {
          console.warn(`[EventBus:${this.config.sourceModule}] ⚠️ Conexión cerrada. Reintentando...`);
          this.publishChannel = null;
          this.subscribeChannel = null;
          this.confirmChannel = null;
          this.connection = null;
          this.scheduleReconnect();
        }
      });

      // Re-suscribir si había suscripciones previas (reconexión)
      if (this.subscriptions.length > 0) {
        console.log(`[EventBus:${this.config.sourceModule}] 🔄 Re-suscribiendo ${this.subscriptions.length} handlers...`);
        for (const sub of this.subscriptions) {
          await this.bindAndConsume(sub.pattern, sub.queueName, sub.handler, sub.options);
        }
      }
    } catch (error: any) {
      console.error(`[EventBus:${this.config.sourceModule}] ❌ No se pudo conectar:`, error.message);
      console.warn(`[EventBus:${this.config.sourceModule}] ⚠️ Operando SIN bus de eventos.`);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isShuttingDown) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), MAX_RECONNECT_DELAY);
    console.log(`[EventBus:${this.config.sourceModule}] ⏳ Reconexión en ${delay / 1000}s (intento ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  // ── Publicar ──────────────────────────────────────────────────────────────

  async publish<T>(event: BocamEvent<T>, options?: PublishOptions): Promise<boolean> {
    if (!event.context.tenant_id || !event.context.proyecto_id) {
      console.error(`[EventBus:${this.config.sourceModule}] ❌ VIOLACIÓN: Evento sin tenant_id o proyecto_id.`, { event_type: event.event_type });
      return false;
    }

    if (!this.publishChannel) {
      console.warn(`[EventBus:${this.config.sourceModule}] ⚠️ Canal no disponible. Evento ${event.event_type} NO publicado.`);
      return false;
    }

    try {
      const routingKey = options?.routingKey || event.event_type;
      const outgoing = this.withEventId(event);
      const message = Buffer.from(JSON.stringify(outgoing));

      this.publishChannel.publish(this.config.exchangeName, routingKey, message, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        messageId: outgoing.event_id,
        headers: {
          'x-tenant-id': event.context.tenant_id,
          'x-proyecto-id': event.context.proyecto_id,
          'x-correlation-id': event.context.correlation_id || '',
          'x-source-module': this.config.sourceModule,
          'x-event-id': outgoing.event_id,
          ...(options?.headers || {}),
        },
      });

      console.log(`[EventBus:${this.config.sourceModule}] 📤 Publicado: ${routingKey} (correlation: ${event.context.correlation_id || 'n/a'})`);
      return true;
    } catch (error: any) {
      console.error(`[EventBus:${this.config.sourceModule}] ❌ Error publicando ${event.event_type}:`, error.message);
      return false;
    }
  }

  private withEventId<T>(event: BocamEvent<T>): BocamEvent<T> & { event_id: string } {
    return { ...event, event_id: event.event_id ?? randomUUID() };
  }

  /**
   * Publicación confirmada: se resuelve únicamente cuando el broker confirma el mensaje. Se rechaza si no hay
   * canal, si el broker no confirma, si vence `timeoutMs`, o si devuelve el mensaje por no haber ninguna
   * cola enlazada a la routing key (`mandatory`). A diferencia de `publish`, nunca informa éxito en silencio.
   * La usa el despachador del outbox para marcar `PUBLICADO` solo tras la confirmación real.
   */
  async publishConfirmed<T>(event: BocamEvent<T>, options?: PublishConfirmedOptions): Promise<void> {
    if (!event.context?.tenant_id || !event.context?.proyecto_id) {
      throw new Error('EVENT_BUS_EVENTO_INVALIDO: el evento no incluye tenant_id y proyecto_id.');
    }
    const channel = this.confirmChannel;
    if (!channel) {
      throw new Error('EVENT_BUS_SIN_CANAL: no hay conexión ni canal de confirmación disponible.');
    }

    const routingKey = options?.routingKey || event.event_type;
    const outgoing = this.withEventId(event);
    const messageId = outgoing.event_id;
    const timeoutMs = options?.timeoutMs ?? DEFAULT_CONFIRM_TIMEOUT_MS;

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.returnedMessageIds.delete(messageId);
        reject(new Error(`EVENT_BUS_TIMEOUT: el broker no confirmó ${routingKey} en ${timeoutMs} ms.`));
      }, timeoutMs);

      try {
        channel.publish(
          this.config.exchangeName,
          routingKey,
          Buffer.from(JSON.stringify(outgoing)),
          {
            persistent: true,
            mandatory: true,
            contentType: 'application/json',
            timestamp: Date.now(),
            messageId,
            headers: {
              'x-tenant-id': event.context.tenant_id,
              'x-proyecto-id': event.context.proyecto_id,
              'x-correlation-id': event.context.correlation_id || '',
              'x-source-module': this.config.sourceModule,
              'x-event-id': messageId,
              ...(options?.headers || {}),
            },
          },
          (error) => {
            clearTimeout(timer);
            const returned = this.returnedMessageIds.delete(messageId);
            if (error) {
              reject(new Error(`EVENT_BUS_NO_CONFIRMADO: el broker rechazó ${routingKey}: ${error.message}`));
            } else if (returned) {
              reject(new Error(`EVENT_BUS_SIN_COLA: mensaje sin cola enlazada a ${routingKey} (no rutable).`));
            } else {
              resolve();
            }
          },
        );
      } catch (error: any) {
        clearTimeout(timer);
        reject(new Error(`EVENT_BUS_SIN_CANAL: ${error.message}`));
      }
    });
    console.log(`[EventBus:${this.config.sourceModule}] 📤 Publicado y confirmado: ${routingKey} (event_id: ${messageId})`);
  }

  // ── Suscribir ─────────────────────────────────────────────────────────────

  /**
   * Suscribirse a un patrón de eventos.
   * 
   * @param pattern - Patrón de routing key (ej: "compras.*", "control_obra.estimacion_aprobada")
   * @param handler - Función async que procesa el evento
   *
   * Patrones:
   *   "compras.*"        → Todos los eventos de Compras
   *   "compras.oc_creada" → Solo OC creada
   *   "#"                → TODO (debug)
   */
  async subscribe<T = unknown>(pattern: string, handler: EventHandler<T>, options?: SubscriptionOptions): Promise<void> {
    const queueName = options?.queueName || `${this.config.sourceModule}.${pattern.replace(/[.*#]/g, '_')}`;

    // Guardar para re-suscripción en reconexión
    this.subscriptions.push({ pattern, queueName, handler: handler as EventHandler, options });

    if (this.subscribeChannel) {
      await this.bindAndConsume(pattern, queueName, handler as EventHandler, options);
    }
  }

  async ensureQueue(pattern: string, queueName: string, options?: SubscriptionOptions): Promise<void> {
    if (!this.subscribeChannel) return;

    await this.subscribeChannel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000,
        ...(options?.queueArguments || {}),
      },
    });

    await this.subscribeChannel.bindQueue(queueName, this.config.exchangeName, pattern);
  }

  private async bindAndConsume(pattern: string, queueName: string, handler: EventHandler, options?: SubscriptionOptions): Promise<void> {
    if (!this.subscribeChannel) return;

    try {
      await this.ensureQueue(pattern, queueName, options);
      const resilient = Boolean(options?.retry || options?.deadLetter);
      if (resilient) await this.ensureResilienceQueues(queueName, options);

      await this.subscribeChannel.consume(queueName, async (msg) => {
        if (!msg) return;

        if (resilient) {
          await this.handleResilientMessage(queueName, msg, handler, options as SubscriptionOptions);
          return;
        }

        try {
          const event: BocamEvent = JSON.parse(msg.content.toString());
          const messageHeaders = msg.properties.headers || {};
          const headerCorrelationId = typeof messageHeaders['x-correlation-id'] === 'string'
            ? messageHeaders['x-correlation-id']
            : undefined;

          event.context = {
            ...event.context,
            correlation_id: event.context?.correlation_id || headerCorrelationId,
          };
          console.log(
            `[EventBus:${this.config.sourceModule}] 📥 Recibido: ${event.event_type} ` +
            `(tenant: ${event.context.tenant_id.substring(0, 8)}..., correlation: ${event.context.correlation_id || 'n/a'})`
          );

          await handler(event);
          this.subscribeChannel?.ack(msg);
        } catch (error: any) {
          console.error(`[EventBus:${this.config.sourceModule}] ❌ Error procesando evento:`, error.message);
          // Requeue: false → Envía a DLQ si está configurado
          this.subscribeChannel?.nack(msg, false, false);
        }
      });

      console.log(`[EventBus:${this.config.sourceModule}] 📥 Suscrito: ${pattern} → cola: ${queueName}`);
    } catch (error: any) {
      console.error(`[EventBus:${this.config.sourceModule}] ❌ Error suscribiendo a ${pattern}:`, error.message);
    }
  }

  // ── Reintentos y cola de mensajes fallidos (opt-in por suscripción) ─────────

  /**
   * Declara `<cola>.retry` (espera + regreso a la cola principal por el exchange por defecto) y `<cola>.dlq`.
   * Solo se llama para las suscripciones que activan `retry` o `deadLetter`; no toca la cola principal.
   */
  private async ensureResilienceQueues(queueName: string, options?: SubscriptionOptions): Promise<void> {
    const channel = this.subscribeChannel;
    if (!channel) return;

    if (options?.retry) {
      await channel.assertQueue(`${queueName}.retry`, {
        durable: true,
        arguments: {
          'x-message-ttl': options.retry.delayMs,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': queueName,
        },
      });
    }
    // `retry` implica cola de mensajes fallidos: agotados los intentos el mensaje no puede perderse.
    await channel.assertQueue(`${queueName}.dlq`, { durable: true });
  }

  private describeMessage(msg: amqplib.ConsumeMessage, event?: Partial<BocamEvent>): Record<string, unknown> {
    let parsed: any = event;
    if (!parsed) {
      try { parsed = JSON.parse(msg.content.toString()); } catch { parsed = undefined; }
    }
    const headers = msg.properties.headers || {};
    return {
      event_type: parsed?.event_type ?? msg.fields.routingKey,
      event_id: parsed?.event_id ?? (typeof headers['x-event-id'] === 'string' ? headers['x-event-id'] : null),
      tenant_id: parsed?.context?.tenant_id ?? (typeof headers['x-tenant-id'] === 'string' ? headers['x-tenant-id'] : null),
      correlation_id: parsed?.context?.correlation_id
        ?? (typeof headers['x-correlation-id'] === 'string' && headers['x-correlation-id'] ? headers['x-correlation-id'] : null),
    };
  }

  /** Republica el mensaje a una cola con confirmación del broker; solo entonces se confirma el original. */
  private async republishConfirmed(target: string, msg: amqplib.ConsumeMessage, extraHeaders: Record<string, unknown>): Promise<void> {
    const channel = this.confirmChannel;
    if (!channel) throw new Error('EVENT_BUS_SIN_CANAL: no hay canal de confirmación para republicar.');
    await new Promise<void>((resolve, reject) => {
      channel.sendToQueue(
        target,
        msg.content,
        {
          persistent: true,
          contentType: msg.properties.contentType || 'application/json',
          messageId: msg.properties.messageId,
          headers: { ...(msg.properties.headers || {}), ...extraHeaders },
        },
        (error) => (error ? reject(new Error(`EVENT_BUS_NO_CONFIRMADO: ${error.message}`)) : resolve()),
      );
    });
  }

  private async sendToDeadLetter(
    queueName: string,
    msg: amqplib.ConsumeMessage,
    event: BocamEvent | undefined,
    reason: string,
    attempt: number,
  ): Promise<void> {
    const dlq = `${queueName}.dlq`;
    try {
      await this.republishConfirmed(dlq, msg, {
        'x-attempt': attempt,
        'x-failure-reason': reason.slice(0, 1000),
        'x-original-queue': queueName,
        'x-original-routing-key': msg.fields.routingKey,
        'x-dead-lettered-at': new Date().toISOString(),
      });
      console.error(JSON.stringify({
        action: 'event_bus.dlq.enviado',
        source_module: this.config.sourceModule,
        dlq,
        ...this.describeMessage(msg, event),
        attempts: attempt,
        reason,
      }));
      this.subscribeChannel?.ack(msg);
    } catch (error: any) {
      // Sin confirmación de la DLQ el mensaje no se descarta: vuelve a la cola y se reintenta más tarde.
      console.error(JSON.stringify({ action: 'event_bus.dlq.fallo', dlq, reason: error.message }));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.subscribeChannel?.nack(msg, false, true);
    }
  }

  private async handleResilientMessage(
    queueName: string,
    msg: amqplib.ConsumeMessage,
    handler: EventHandler,
    options: SubscriptionOptions,
  ): Promise<void> {
    const attempt = Number(msg.properties.headers?.['x-attempt'] ?? 1) || 1;

    let event: BocamEvent;
    try {
      event = JSON.parse(msg.content.toString());
      if (!event || typeof event !== 'object' || typeof event.event_type !== 'string'
        || !event.context || typeof event.context.tenant_id !== 'string' || !event.context.tenant_id) {
        throw new Error('el evento no incluye contexto de tenant');
      }
    } catch (error: any) {
      await this.sendToDeadLetter(queueName, msg, undefined, `MENSAJE_ININTERPRETABLE: ${error.message}`, attempt);
      return;
    }

    const headerCorrelationId = msg.properties.headers?.['x-correlation-id'];
    event.context = {
      ...event.context,
      correlation_id: event.context.correlation_id || (typeof headerCorrelationId === 'string' && headerCorrelationId ? headerCorrelationId : undefined),
    };
    console.log(
      `[EventBus:${this.config.sourceModule}] 📥 Recibido: ${event.event_type} ` +
      `(tenant: ${event.context.tenant_id.substring(0, 8)}..., correlation: ${event.context.correlation_id || 'n/a'}, intento: ${attempt})`
    );

    try {
      await handler(event);
      this.subscribeChannel?.ack(msg);
      return;
    } catch (error: any) {
      const reason = error?.message ?? String(error);
      console.error(`[EventBus:${this.config.sourceModule}] ❌ Error procesando evento (intento ${attempt}):`, reason);

      if (options.retry && attempt < options.retry.maxAttempts) {
        try {
          await this.republishConfirmed(`${queueName}.retry`, msg, { 'x-attempt': attempt + 1, 'x-failure-reason': reason.slice(0, 1000) });
          this.subscribeChannel?.ack(msg);
        } catch (republishError: any) {
          console.error(JSON.stringify({ action: 'event_bus.retry.fallo', queue: queueName, reason: republishError.message }));
          await new Promise((resolve) => setTimeout(resolve, 1000));
          this.subscribeChannel?.nack(msg, false, true);
        }
        return;
      }
      await this.sendToDeadLetter(queueName, msg, event, reason, attempt);
    }
  }

  // ── Cierre ────────────────────────────────────────────────────────────────

  async close(): Promise<void> {
    this.isShuttingDown = true;
    try {
      if (this.publishChannel) await this.publishChannel.close();
      if (this.subscribeChannel) await this.subscribeChannel.close();
      if (this.confirmChannel) await this.confirmChannel.close();
      if (this.connection) await this.connection.close();
      console.log(`[EventBus:${this.config.sourceModule}] 🔌 Desconectado limpiamente.`);
    } catch (error: any) {
      console.error(`[EventBus:${this.config.sourceModule}] Error al cerrar:`, error.message);
    }
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createEventBus(sourceModule: string): EventBus {
  return new EventBus({ sourceModule });
}

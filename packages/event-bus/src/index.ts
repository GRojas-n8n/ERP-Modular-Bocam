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

import * as amqplib from 'amqplib';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface BocamEvent<T = unknown> {
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

export interface SubscriptionOptions {
  queueName?: string;
  queueArguments?: Record<string, unknown>;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const DEFAULT_EXCHANGE = 'bocam.events';
const EXCHANGE_TYPE = 'topic';
const MAX_RECONNECT_DELAY = 30000;

// ─── Clase EventBus ─────────────────────────────────────────────────────────

export class EventBus {
  private config: Required<Omit<EventBusConfig, 'prefetchCount'>> & { prefetchCount: number };
  private connection: amqplib.ChannelModel | null = null;
  private publishChannel: amqplib.Channel | null = null;
  private subscribeChannel: amqplib.Channel | null = null;
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

      this.connection = connection;
      this.publishChannel = publishChannel;
      this.subscribeChannel = subscribeChannel;

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
      const message = Buffer.from(JSON.stringify(event));

      this.publishChannel.publish(this.config.exchangeName, routingKey, message, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
        headers: {
          'x-tenant-id': event.context.tenant_id,
          'x-proyecto-id': event.context.proyecto_id,
          'x-correlation-id': event.context.correlation_id || '',
          'x-source-module': this.config.sourceModule,
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

      await this.subscribeChannel.consume(queueName, async (msg) => {
        if (!msg) return;

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

  // ── Cierre ────────────────────────────────────────────────────────────────

  async close(): Promise<void> {
    this.isShuttingDown = true;
    try {
      if (this.publishChannel) await this.publishChannel.close();
      if (this.subscribeChannel) await this.subscribeChannel.close();
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

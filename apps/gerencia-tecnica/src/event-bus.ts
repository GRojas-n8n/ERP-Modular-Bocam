/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Gerencia Técnica
 * Archivo: event-bus.ts — Interfaz del Bus de Eventos (RabbitMQ).
 *
 * Responsabilidad: Publicar eventos a RabbitMQ cuando ocurren mutaciones
 * relevantes (ej. PresupuestoBaseLiberado) para que otros módulos
 * (Programación, Control de Proyectos, etc.) reaccionen de forma asíncrona.
 *
 * Regla Arquitectónica: TODO evento debe incluir tenant_id y proyecto_id
 * en su payload de contexto. Un evento sin contexto es un evento inválido.
 * ---------------------------------------------------------------------------
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as amqplib from 'amqplib';
import { BocamEvent } from './types';

const EXCHANGE_NAME = 'bocam.events';
const EXCHANGE_TYPE = 'topic'; // Permite enrutamiento por patrones (ej. gerencia_tecnica.*)

// Usamos `any` para evitar conflictos de tipos entre @types/amqplib y la versión runtime.
// La validación se hace en runtime con null checks.
let connection: any = null;
let channel: any = null;

/**
 * Inicializa la conexión con RabbitMQ.
 * Se debe llamar UNA VEZ al arrancar el módulo.
 */
export async function initEventBus(): Promise<void> {
  const amqpUrl = process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672';

  try {
    const conn = await amqplib.connect(amqpUrl);
    const ch = await conn.createChannel();

    // Declarar el exchange como durable (sobrevive reinicios de RabbitMQ)
    await ch.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

    // Asignar a las variables de módulo después de la inicialización exitosa
    connection = conn;
    channel = ch;

    console.log(`[EventBus] ✅ Conectado a RabbitMQ. Exchange: ${EXCHANGE_NAME}`);

    // Manejo de errores de conexión
    conn.on('error', (err) => {
      console.error('[EventBus] ❌ Error de conexión RabbitMQ:', err.message);
      connection = null;
      channel = null;
    });

    conn.on('close', () => {
      console.warn('[EventBus] ⚠️ Conexión RabbitMQ cerrada. Reintentando...');
      connection = null;
      channel = null;
      // Reintentar conexión después de 5 segundos
      setTimeout(() => initEventBus(), 5000);
    });
  } catch (error: any) {
    console.error('[EventBus] ❌ No se pudo conectar a RabbitMQ:', error.message);
    console.warn('[EventBus] ⚠️ El módulo operará SIN bus de eventos. Las mutaciones no se propagarán.');
  }
}

/**
 * Publica un evento en el bus de mensajes.
 *
 * @param event - Evento tipado con contexto de seguridad obligatorio.
 *
 * @example
 * ```typescript
 * await publishEvent({
 *   event_type: GerenciaTecnicaEvents.PRESUPUESTO_BASE_LIBERADO,
 *   timestamp: new Date().toISOString(),
 *   context: {
 *     tenant_id: 'uuid-tenant',
 *     proyecto_id: 'uuid-proyecto',
 *     user_id: 'uuid-user',
 *   },
 *   payload: { presupuesto_id: 'uuid', version: 1, importe_total: 150000 },
 * });
 * ```
 */
export async function publishEvent<T>(event: BocamEvent<T>): Promise<boolean> {
  // Validación defensiva del contexto obligatorio
  if (!event.context.tenant_id || !event.context.proyecto_id) {
    console.error(
      '[EventBus] ❌ VIOLACIÓN: Intento de publicar evento sin tenant_id o proyecto_id.',
      { event_type: event.event_type }
    );
    return false;
  }

  if (!channel) {
    console.warn(
      `[EventBus] ⚠️ Canal no disponible. Evento ${event.event_type} NO fue publicado.`
    );
    return false;
  }

  try {
    const routingKey = event.event_type; // Ej: "gerencia_tecnica.presupuesto_base_liberado"
    const message = Buffer.from(JSON.stringify(event));

    channel.publish(EXCHANGE_NAME, routingKey, message, {
      persistent: true,         // El mensaje sobrevive reinicios de RabbitMQ
      contentType: 'application/json',
      timestamp: Date.now(),
      headers: {
        'x-tenant-id': event.context.tenant_id,
        'x-proyecto-id': event.context.proyecto_id,
        'x-source-module': 'gerencia-tecnica',
      },
    });

    console.log(`[EventBus] 📤 Evento publicado: ${routingKey}`);
    return true;
  } catch (error: any) {
    console.error(`[EventBus] ❌ Error al publicar evento ${event.event_type}:`, error.message);
    return false;
  }
}

/**
 * Cierra la conexión con RabbitMQ limpiamente.
 * Se debe llamar al apagar el módulo (graceful shutdown).
 */
export async function closeEventBus(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('[EventBus] 🔌 Conexión RabbitMQ cerrada limpiamente.');
  } catch (error: any) {
    console.error('[EventBus] Error al cerrar conexión:', error.message);
  }
}

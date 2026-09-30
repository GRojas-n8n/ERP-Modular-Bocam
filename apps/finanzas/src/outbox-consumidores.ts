/**
 * Catálogo de consumidores esperados por evento y verificación de sus colas (lote P1).
 * Change: hacer-confiables-publicadores-eventbus-criticos.
 *
 * `publishConfirmed` con `mandatory` detecta que NINGUNA cola está enlazada a la routing key, pero no prueba que cada
 * consumidor esperado tenga la suya. Este módulo cubre ese hueco: por cada evento del lote P1 declara quién debe
 * consumirlo y comprueba, con una consulta pasiva al broker, que su cola exista y tenga al menos un consumidor activo.
 *
 * Alcance de la verificación (límite conocido): el consumidor declara la cola, la enlaza (bindQueue) y solo entonces
 * empieza a consumir; por eso «cola existente con consumidor activo» implica que su binding fue creado por ese
 * consumidor. NO detecta un binding eliminado a mano mientras el consumidor sigue activo (eso exige la API de gestión de
 * RabbitMQ, fuera de alcance de este lote).
 *
 * Nombre de cola: `<módulo>.<routing key con . → _>` (convención de packages/event-bus: subscribe()).
 */

import * as amqplib from 'amqplib';
import { FinanzasEvents } from './types';

export interface ConsumidorEsperado {
  servicio: string;
  cola: string;
}

const cola = (servicio: string, routingKey: string) => `${servicio}.${routingKey.replace(/[.*#]/g, '_')}`;

/** Quién debe consumir cada evento de P1 (ver inventario-publicadores.md). */
export const CONSUMIDORES_ESPERADOS: Record<string, ConsumidorEsperado[]> = {
  [FinanzasEvents.FONDOS_COMPROMETIDOS]: [
    { servicio: 'compras', cola: cola('compras', FinanzasEvents.FONDOS_COMPROMETIDOS) },
    { servicio: 'contabilidad', cola: cola('contabilidad', FinanzasEvents.FONDOS_COMPROMETIDOS) },
  ],
  [FinanzasEvents.FONDOS_LIBERADOS]: [
    { servicio: 'compras', cola: cola('compras', FinanzasEvents.FONDOS_LIBERADOS) },
    { servicio: 'contabilidad', cola: cola('contabilidad', FinanzasEvents.FONDOS_LIBERADOS) },
  ],
  [FinanzasEvents.PRESUPUESTO_INSUFICIENTE]: [
    { servicio: 'compras', cola: cola('compras', FinanzasEvents.PRESUPUESTO_INSUFICIENTE) },
  ],
};

export interface EstadoCola {
  servicio: string;
  cola: string;
  existe: boolean;
  consumidores: number;
  ok: boolean;
  error?: string;
}

export interface InformeConsumidores {
  /** `ok`: todas las colas esperadas existen con consumidor. `degradado`: falta alguna. `sin_broker`: no hay RABBITMQ_URL. `error`: no se pudo consultar. */
  estado: 'ok' | 'degradado' | 'sin_broker' | 'error' | 'no_verificado';
  verificado_en: string | null;
  eventos: Record<string, EstadoCola[]>;
  faltantes: string[];
  error?: string;
}

const VACIO: InformeConsumidores = { estado: 'no_verificado', verificado_en: null, eventos: {}, faltantes: [] };
let ultimo: InformeConsumidores = VACIO;

export function ultimoInformeConsumidores(): InformeConsumidores {
  return ultimo;
}

/** Consulta pasiva de cada cola esperada. Una cola inexistente cierra el canal, por eso cada consulta usa un canal propio. */
export async function verificarConsumidoresEsperados(
  opciones: { url?: string; catalogo?: Record<string, ConsumidorEsperado[]>; timeoutMs?: number } = {},
): Promise<InformeConsumidores> {
  const url = opciones.url ?? process.env.RABBITMQ_URL ?? '';
  const catalogo = opciones.catalogo ?? CONSUMIDORES_ESPERADOS;
  if (!url) {
    ultimo = { estado: 'sin_broker', verificado_en: new Date().toISOString(), eventos: {}, faltantes: [], error: 'RABBITMQ_URL no está definida' };
    return ultimo;
  }

  let conexion: amqplib.ChannelModel | null = null;
  try {
    conexion = await Promise.race([
      amqplib.connect(url),
      new Promise<never>((_, rechazar) => setTimeout(() => rechazar(new Error('timeout conectando a RabbitMQ')), opciones.timeoutMs ?? 5000)),
    ]);
    // Un error de conexión asíncrono no debe tumbar el proceso.
    conexion.on('error', () => undefined);

    const eventos: Record<string, EstadoCola[]> = {};
    const faltantes: string[] = [];
    for (const [evento, esperados] of Object.entries(catalogo)) {
      eventos[evento] = [];
      for (const e of esperados) {
        const estado: EstadoCola = { servicio: e.servicio, cola: e.cola, existe: false, consumidores: 0, ok: false };
        const canal = await conexion.createChannel();
        canal.on('error', () => undefined);
        try {
          const r = await canal.checkQueue(e.cola);
          estado.existe = true;
          estado.consumidores = r.consumerCount;
          estado.ok = r.consumerCount > 0;
          if (!estado.ok) estado.error = 'la cola existe pero no tiene consumidores activos';
        } catch (error: any) {
          estado.error = /NOT_FOUND/.test(String(error?.message)) ? 'la cola no existe' : String(error?.message ?? error).slice(0, 200);
        } finally {
          await canal.close().catch(() => undefined);
        }
        if (!estado.ok) faltantes.push(`${evento} → ${e.cola}`);
        eventos[evento].push(estado);
      }
    }
    ultimo = { estado: faltantes.length === 0 ? 'ok' : 'degradado', verificado_en: new Date().toISOString(), eventos, faltantes };
  } catch (error: any) {
    ultimo = { estado: 'error', verificado_en: new Date().toISOString(), eventos: {}, faltantes: [], error: String(error?.message ?? error).slice(0, 200) };
  } finally {
    await conexion?.close().catch(() => undefined);
  }
  return ultimo;
}

export interface VerificacionActiva { detener(): void; ejecutarAhora(): Promise<InformeConsumidores> }

/** Verificación periódica (al arrancar y cada `intervaloMs`). Registra en log el paso a degradado y la recuperación. */
export function iniciarVerificacionConsumidores(intervaloMs = 60_000): VerificacionActiva {
  let previo: InformeConsumidores['estado'] = 'no_verificado';
  const correr = async () => {
    const r = await verificarConsumidoresEsperados();
    if (r.estado !== previo) {
      const degradado = r.estado === 'degradado' || r.estado === 'error';
      (degradado ? console.warn : console.log)(JSON.stringify({
        action: degradado ? 'finanzas.outbox.consumidores_degradado' : 'finanzas.outbox.consumidores_ok',
        estado: r.estado, faltantes: r.faltantes, error: r.error,
      }));
      previo = r.estado;
    }
    return r;
  };
  const timer = setInterval(() => { void correr(); }, intervaloMs);
  timer.unref?.();
  void correr();
  return { detener() { clearInterval(timer); }, ejecutarAhora: correr };
}

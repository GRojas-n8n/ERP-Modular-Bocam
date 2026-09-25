/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Compras — outbox transaccional de eventos
 *
 * Change: fix-ingresos-almacen-por-recepcion-oc.
 *
 * Garantías:
 *  - la recepción de OC y su evento se escriben en la MISMA transacción (registrarEventoRecepcion);
 *  - un despachador publica lo PENDIENTE con confirmación del broker (publishConfirmed) y solo entonces
 *    marca PUBLICADO; un fallo reprograma con espera creciente y, agotados los intentos, deja la fila en ERROR;
 *  - varias instancias no publican la misma fila (FOR UPDATE SKIP LOCKED);
 *  - el estado vive en la base: tras un reinicio, el despachador retoma lo pendiente. Si el proceso cae entre
 *    la confirmación y el marcado, la fila se republica con el MISMO event_id (semántica al menos una vez;
 *    el consumidor es idempotente por event_id y por recepcion_item_id).
 * ---------------------------------------------------------------------------
 */

import type { PrismaClient } from './generated/prisma';
import type { BocamEvent } from '../../../packages/event-bus/src';
import basePrisma from './db';

export const RECEPCION_EVENT_TYPE = 'compras.recepcion_oc_registrada.v1';
export const RECEPCION_EVENT_VERSION = 1;

const MAX_BACKOFF_MS = 15 * 60 * 1000;

export interface SnapshotInsumo {
  clave: string;
  descripcion: string;
  unidad: string;
  categoria?: string;
}

export interface ItemRecibido {
  recepcionItemId: string;
  ordenItemId: string;
  insumoId: string | null;
  cantidadRecibida: number;
  descripcionLibre?: string | null;
  unidadLibre?: string | null;
}

export interface EntradaEventoRecepcion {
  eventId: string;
  tenantId: string;
  proyectoId: string;
  ordenId: string;
  ordenCodigo: string;
  proveedorId: string;
  recepcionId: string;
  fechaRecepcion: Date;
  estadoOc: string;
  recibidoPor: string;
  items: ItemRecibido[];
  /** Snapshot por insumo_id resuelto desde Gerencia Técnica; puede faltar si no respondió. */
  snapshots: Map<string, SnapshotInsumo>;
}

/** Arma el payload del contrato `compras.recepcion_oc_registrada.v1`: solo lo recibido en ESA recepción. */
export function construirPayloadRecepcion(e: EntradaEventoRecepcion): Record<string, unknown> {
  return {
    event_id: e.eventId,
    event_version: RECEPCION_EVENT_VERSION,
    occurred_at: new Date().toISOString(),
    tenant_id: e.tenantId,
    proyecto_id: e.proyectoId,
    orden_compra_id: e.ordenId,
    orden_compra_codigo: e.ordenCodigo,
    proveedor_id: e.proveedorId,
    recepcion_id: e.recepcionId,
    fecha_recepcion: e.fechaRecepcion.toISOString(),
    estado_oc_resultante: e.estadoOc,
    recibido_por: e.recibidoPor,
    items: e.items.map((item) => {
      const base = {
        recepcion_item_id: item.recepcionItemId,
        orden_item_id: item.ordenItemId,
        insumo_id: item.insumoId,
        cantidad_recibida: item.cantidadRecibida,
      };
      if (!item.insumoId) {
        // Texto libre o imprevisto: el snapshot es la descripción y unidad libres de la propia OC.
        return { ...base, descripcion: item.descripcionLibre ?? null, unidad: item.unidadLibre ?? null };
      }
      const snap = e.snapshots.get(item.insumoId);
      return snap
        ? { ...base, clave: snap.clave, descripcion: snap.descripcion, unidad: snap.unidad, ...(snap.categoria ? { categoria: snap.categoria } : {}) }
        : base; // sin snapshot: no se inventan datos; Almacén decide según su inventario
    }),
  };
}

/** Escribe la fila del outbox. Se invoca DENTRO de la transacción de la recepción. */
export async function registrarEventoRecepcion(tx: PrismaClient, entrada: EntradaEventoRecepcion): Promise<void> {
  await tx.outboxEvento.create({
    data: {
      id_evento: entrada.eventId,
      tenant_id: entrada.tenantId,
      proyecto_id: entrada.proyectoId,
      orden_id: entrada.ordenId,
      recepcion_id: entrada.recepcionId,
      event_type: RECEPCION_EVENT_TYPE,
      event_version: RECEPCION_EVENT_VERSION,
      payload: construirPayloadRecepcion(entrada) as any,
    },
  });
}

export interface OutboxPublisher {
  /** Se resuelve solo cuando el broker confirma el mensaje; se rechaza en cualquier otro caso. */
  publishConfirmed(event: BocamEvent): Promise<void>;
}

export interface OpcionesDespacho {
  publisher: OutboxPublisher;
  /** Cliente sin contexto de tenant; por defecto el de Compras. */
  prisma?: PrismaClient;
  batchSize?: number;
  maxAttempts?: number;
  baseBackoffMs?: number;
}

export interface ResultadoDespacho {
  publicados: number;
  fallidos: number;
  errores: number;
}

function esperaSegunIntentos(intentos: number, baseMs: number): number {
  return Math.min(baseMs * 2 ** Math.max(intentos - 1, 0), MAX_BACKOFF_MS);
}

/**
 * Publica una tanda de eventos pendientes. Toma las filas con FOR UPDATE SKIP LOCKED dentro de una transacción
 * y las marca PUBLICADO solo tras la confirmación del broker. Si el marcado falla, la transacción se revierte y
 * la fila se republicará con el mismo event_id.
 */
export async function despacharOutbox(opciones: OpcionesDespacho): Promise<ResultadoDespacho> {
  const db = opciones.prisma ?? basePrisma;
  const batchSize = opciones.batchSize ?? 10;
  const maxAttempts = opciones.maxAttempts ?? 10;
  const baseBackoffMs = opciones.baseBackoffMs ?? 5000;
  const resultado: ResultadoDespacho = { publicados: 0, fallidos: 0, errores: 0 };

  await db.$transaction(
    async (tx) => {
      // El despachador recorre filas de todos los tenants: la política RLS lo admite solo con esta variable.
      await tx.$executeRaw`SELECT set_config('app.internal_worker', 'outbox', true)`;
      const reclamadas = await tx.$queryRaw<Array<{ id_evento: string }>>`
        SELECT id_evento FROM outbox_eventos
        WHERE estado = 'PENDIENTE' AND proximo_intento_en <= (now() AT TIME ZONE 'UTC')
        ORDER BY created_at
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED`;
      if (reclamadas.length === 0) return;

      const filas = await tx.outboxEvento.findMany({
        where: { id_evento: { in: reclamadas.map((r) => r.id_evento) } },
        orderBy: { created_at: 'asc' },
      });

      for (const fila of filas) {
        const payload = fila.payload as Record<string, any>;
        const evento: BocamEvent = {
          event_id: fila.id_evento,
          event_version: fila.event_version,
          event_type: fila.event_type,
          timestamp: payload.occurred_at ?? new Date().toISOString(),
          context: { tenant_id: fila.tenant_id, proyecto_id: fila.proyecto_id, user_id: payload.recibido_por ?? '' },
          payload,
        };

        try {
          await opciones.publisher.publishConfirmed(evento);
        } catch (error: any) {
          const intentos = fila.intentos + 1;
          const agotado = intentos >= maxAttempts;
          await tx.outboxEvento.update({
            where: { id_evento: fila.id_evento },
            data: {
              intentos,
              ultimo_error: String(error?.message ?? error).slice(0, 1000),
              estado: agotado ? 'ERROR' : 'PENDIENTE',
              proximo_intento_en: new Date(Date.now() + esperaSegunIntentos(intentos, baseBackoffMs)),
            },
          });
          if (agotado) {
            resultado.errores++;
            console.error(JSON.stringify({
              action: 'compras.outbox.evento_en_error',
              event_id: fila.id_evento, recepcion_id: fila.recepcion_id, orden_id: fila.orden_id, tenant_id: fila.tenant_id,
              intentos, error: String(error?.message ?? error),
            }));
          } else {
            resultado.fallidos++;
            console.error(JSON.stringify({
              action: 'compras.outbox.publicacion_fallida',
              event_id: fila.id_evento, recepcion_id: fila.recepcion_id, intentos, error: String(error?.message ?? error),
            }));
          }
          continue;
        }

        // Confirmado por el broker: recién ahora se marca. Si esto falla, la transacción se revierte.
        await tx.outboxEvento.update({
          where: { id_evento: fila.id_evento },
          data: { estado: 'PUBLICADO', publicado_en: new Date(), intentos: fila.intentos + 1, ultimo_error: null },
        });
        resultado.publicados++;
      }
    },
    { maxWait: 10_000, timeout: 30_000 + batchSize * 10_000 },
  );

  return resultado;
}

export interface DespachadorActivo {
  detener(): void;
  ejecutarAhora(): Promise<void>;
}

/** Arranca el despachador periódico. Al iniciar, corre de inmediato para retomar lo pendiente tras un reinicio. */
export function iniciarDespachadorOutbox(
  publisher: OutboxPublisher,
  opciones: { intervaloMs?: number; batchSize?: number; maxAttempts?: number } = {},
): DespachadorActivo {
  let ejecutando = false;
  let detenido = false;

  const tick = async () => {
    if (ejecutando || detenido) return;
    ejecutando = true;
    try {
      const r = await despacharOutbox({ publisher, batchSize: opciones.batchSize, maxAttempts: opciones.maxAttempts });
      if (r.publicados || r.fallidos || r.errores) {
        console.log(JSON.stringify({ action: 'compras.outbox.tanda', ...r }));
      }
    } catch (error: any) {
      console.error(JSON.stringify({ action: 'compras.outbox.tanda_fallida', error: error?.message ?? String(error) }));
    } finally {
      ejecutando = false;
    }
  };

  const timer = setInterval(() => { void tick(); }, opciones.intervaloMs ?? 5000);
  timer.unref?.();
  void tick();

  return {
    detener() { detenido = true; clearInterval(timer); },
    ejecutarAhora: tick,
  };
}

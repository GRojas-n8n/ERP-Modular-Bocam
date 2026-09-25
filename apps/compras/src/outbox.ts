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
  categoria: string;
}

const CAMPOS_SNAPSHOT = ['clave', 'descripcion', 'unidad', 'categoria'] as const;

/**
 * Snapshot completo del renglón de una OC, tomado de las columnas persistidas; null si falta cualquier campo.
 * Es la ÚNICA fuente del snapshot del evento: nunca se consulta a Gerencia Técnica al armar ni al despachar.
 */
export function snapshotDeItemOc(item: {
  clave_snapshot?: string | null; descripcion_snapshot?: string | null; unidad_snapshot?: string | null; categoria_snapshot?: string | null;
}): SnapshotInsumo | null {
  const s = { clave: item.clave_snapshot, descripcion: item.descripcion_snapshot, unidad: item.unidad_snapshot, categoria: item.categoria_snapshot };
  return CAMPOS_SNAPSHOT.every((c) => typeof s[c] === 'string' && String(s[c]).trim())
    ? { clave: s.clave!, descripcion: s.descripcion!, unidad: s.unidad!, categoria: s.categoria! }
    : null;
}

export class SnapshotIncompletoError extends Error {
  readonly code = 'SNAPSHOT_INCOMPLETO';

  constructor(public readonly problemas: string[]) {
    super(`SNAPSHOT_INCOMPLETO: ${problemas.join('; ')}`);
    this.name = 'SnapshotIncompletoError';
  }
}

/** Problemas que impedirían a Almacén procesar el evento; vacío si el payload es completo. */
export function problemasDePayload(payload: Record<string, any>): string[] {
  const problemas: string[] = [];
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (items.length === 0) problemas.push('el evento no trae ítems');
  for (const item of items) {
    if (!item?.recepcion_item_id) problemas.push('un ítem no trae recepcion_item_id');
    if (item?.insumo_id) {
      const faltan = CAMPOS_SNAPSHOT.filter((c) => typeof item[c] !== 'string' || !String(item[c]).trim());
      if (faltan.length > 0) problemas.push(`el ítem ${item.recepcion_item_id} (insumo ${item.insumo_id}) no trae ${faltan.join(', ')}`);
    }
  }
  return problemas;
}

export interface ItemRecibido {
  recepcionItemId: string;
  ordenItemId: string;
  insumoId: string | null;
  cantidadRecibida: number;
  descripcionLibre?: string | null;
  unidadLibre?: string | null;
  /** Snapshot persistido en el renglón de la OC (obligatorio si hay insumo de catálogo). */
  snapshot?: SnapshotInsumo | null;
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
  /** Conserva la marca de tiempo original al reconstruir un evento (reemisión). */
  occurredAt?: string;
}

/** Arma el payload del contrato `compras.recepcion_oc_registrada.v1`: solo lo recibido en ESA recepción. */
export function construirPayloadRecepcion(e: EntradaEventoRecepcion): Record<string, unknown> {
  return {
    event_id: e.eventId,
    event_version: RECEPCION_EVENT_VERSION,
    occurred_at: e.occurredAt ?? new Date().toISOString(),
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
      // Sin snapshot completo el ítem queda sin esos campos: el payload resultante es incompleto y NUNCA se publica
      // (registrarEventoRecepcion y el despachador lo rechazan); no se inventan datos ni se consulta a nadie.
      const snap = item.snapshot;
      return snap
        ? { ...base, clave: snap.clave, descripcion: snap.descripcion, unidad: snap.unidad, categoria: snap.categoria }
        : base;
    }),
  };
}

/** Escribe la fila del outbox. Se invoca DENTRO de la transacción de la recepción. */
export async function registrarEventoRecepcion(tx: PrismaClient, entrada: EntradaEventoRecepcion): Promise<void> {
  const payload = construirPayloadRecepcion(entrada);
  const problemas = problemasDePayload(payload);
  // Defensa final dentro de la transacción: un evento incompleto no se escribe y la recepción no se confirma.
  if (problemas.length > 0) throw new SnapshotIncompletoError(problemas);
  await tx.outboxEvento.create({
    data: {
      id_evento: entrada.eventId,
      tenant_id: entrada.tenantId,
      proyecto_id: entrada.proyectoId,
      orden_id: entrada.ordenId,
      recepcion_id: entrada.recepcionId,
      event_type: RECEPCION_EVENT_TYPE,
      event_version: RECEPCION_EVENT_VERSION,
      payload: payload as any,
    },
  });
}

/**
 * Reconstruye el payload de una recepción existente SOLO con datos persistidos en Compras (recepción, OC y el
 * snapshot de sus renglones). Lanza SnapshotIncompletoError si aún falta algún dato. Lo usa la reemisión.
 */
export async function reconstruirPayloadRecepcion(
  tx: PrismaClient,
  datos: { tenantId: string; proyectoId: string; ordenId: string; recepcionId: string; eventId: string; occurredAt?: string; estadoOc?: string },
): Promise<Record<string, unknown>> {
  const recepcion = await tx.recepcionOC.findFirst({
    where: { id_recepcion: datos.recepcionId, orden_id: datos.ordenId, tenant_id: datos.tenantId },
    include: { items: true },
  });
  const orden = await tx.ordenCompra.findFirst({ where: { id_orden: datos.ordenId, tenant_id: datos.tenantId }, include: { items: true } });
  if (!recepcion || !orden) throw new SnapshotIncompletoError(['no existe la recepción o la OC para reconstruir el evento']);
  const itemsOrden = new Map(orden.items.map((i: any) => [i.id_item, i]));
  const payload = construirPayloadRecepcion({
    eventId: datos.eventId,
    tenantId: datos.tenantId,
    proyectoId: datos.proyectoId,
    ordenId: orden.id_orden,
    ordenCodigo: orden.codigo,
    proveedorId: orden.proveedor_id,
    recepcionId: recepcion.id_recepcion,
    fechaRecepcion: recepcion.fecha_recepcion,
    estadoOc: datos.estadoOc ?? (orden.estado === 'RECIBIDA' ? 'RECIBIDA' : 'PARCIALMENTE_RECIBIDA'),
    recibidoPor: recepcion.recibido_por,
    occurredAt: datos.occurredAt,
    items: recepcion.items.map((ri: any) => {
      const itemOc: any = itemsOrden.get(ri.orden_item_id);
      return {
        recepcionItemId: ri.id_recepcion_item,
        ordenItemId: ri.orden_item_id,
        insumoId: itemOc?.insumo_id ?? null,
        cantidadRecibida: Number(ri.cantidad_recibida),
        descripcionLibre: itemOc?.descripcion_libre ?? null,
        unidadLibre: itemOc?.unidad_libre ?? null,
        snapshot: itemOc ? snapshotDeItemOc(itemOc) : null,
      };
    }),
  });
  const problemas = problemasDePayload(payload);
  if (problemas.length > 0) throw new SnapshotIncompletoError(problemas);
  return payload;
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

        // Guarda final: un payload incompleto no se envía al broker (terminaría en la DLQ y seguiría inválido al
        // reprocesarlo). Se retiene en ERROR con causa explícita; la reemisión lo reconstruye desde datos persistidos.
        const problemas = problemasDePayload(payload);
        if (problemas.length > 0) {
          const causa = `PAYLOAD_INCOMPLETO: ${problemas.join('; ')}`.slice(0, 1000);
          await tx.outboxEvento.update({ where: { id_evento: fila.id_evento }, data: { estado: 'ERROR', ultimo_error: causa } });
          resultado.errores++;
          console.error(JSON.stringify({
            action: 'compras.outbox.evento_en_error',
            event_id: fila.id_evento, recepcion_id: fila.recepcion_id, orden_id: fila.orden_id, tenant_id: fila.tenant_id, error: causa,
          }));
          continue;
        }

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
  opciones: {
    intervaloMs?: number; batchSize?: number; maxAttempts?: number;
    /** Se invoca al terminar cada tanda: sin argumento si salió bien, con el mensaje si la tanda falló. */
    alFinalizarTanda?: (error?: string) => void;
  } = {},
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
      opciones.alFinalizarTanda?.();
    } catch (error: any) {
      console.error(JSON.stringify({ action: 'compras.outbox.tanda_fallida', error: error?.message ?? String(error) }));
      opciones.alFinalizarTanda?.(error?.message ?? String(error));
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

// ── Activación del despachador ────────────────────────────────────────────────────────────────────────────
// El despachador está APAGADO por defecto. El outbox siempre guarda los eventos (en la transacción de la recepción),
// pero solo un despachador encendido los publica y los marca PUBLICADO. Solo el valor exacto `on` lo enciende:
// ausente, vacío, `off` o cualquier otro valor lo dejan apagado.

export const VARIABLE_DESPACHADOR = 'COMPRAS_OUTBOX_DISPATCHER';

export interface ModoDespachador {
  activo: boolean;
  motivo: string;
}

export function resolverModoDespachador(valor: string | undefined): ModoDespachador {
  if (valor === undefined) return { activo: false, motivo: `${VARIABLE_DESPACHADOR} no está definida` };
  if (valor === 'on') return { activo: true, motivo: `${VARIABLE_DESPACHADOR}=on` };
  if (valor === 'off') return { activo: false, motivo: `${VARIABLE_DESPACHADOR}=off` };
  if (valor.trim() === '') return { activo: false, motivo: `${VARIABLE_DESPACHADOR} está vacía` };
  return { activo: false, motivo: `${VARIABLE_DESPACHADOR} tiene un valor no reconocido (${JSON.stringify(valor.slice(0, 20))}); solo "on" lo enciende` };
}

/** `disabled` = apagado a propósito (no es un fallo). `error` = encendido pero la última tanda falló. */
export type EstadoDespachador = 'disabled' | 'starting' | 'ok' | 'error';

export interface InformeDespachador {
  estado: EstadoDespachador;
  motivo: string;
  ultima_tanda_en: string | null;
  ultimo_error: string | null;
}

let informeActual: InformeDespachador = { estado: 'disabled', motivo: 'el despachador aún no se configuró', ultima_tanda_en: null, ultimo_error: null };

export function estadoDespachadorOutbox(): InformeDespachador {
  return { ...informeActual };
}

/**
 * Arranca el despachador solo si `valor` es exactamente `on`; en cualquier otro caso registra `dispatcher disabled`,
 * no publica ni marca nada y devuelve `null`.
 */
export function configurarDespachadorOutbox(
  publisher: OutboxPublisher,
  config: { valor: string | undefined; intervaloMs?: number; batchSize?: number; maxAttempts?: number },
): DespachadorActivo | null {
  const modo = resolverModoDespachador(config.valor);
  if (!modo.activo) {
    informeActual = { estado: 'disabled', motivo: modo.motivo, ultima_tanda_en: null, ultimo_error: null };
    const registro = {
      action: 'compras.outbox.dispatcher_disabled',
      message: 'dispatcher disabled',
      motivo: modo.motivo,
      detalle: 'Las recepciones siguen guardando su evento en outbox_eventos (PENDIENTE); no se publica ni se marca ninguno.',
    };
    // Un valor presente pero mal escrito merece un aviso, porque casi siempre es un error de configuración.
    if (config.valor !== undefined && config.valor !== 'off' && config.valor.trim() !== '') console.warn(JSON.stringify(registro));
    else console.log(JSON.stringify(registro));
    return null;
  }
  informeActual = { estado: 'starting', motivo: modo.motivo, ultima_tanda_en: null, ultimo_error: null };
  console.log(JSON.stringify({ action: 'compras.outbox.dispatcher_enabled', message: 'dispatcher enabled', motivo: modo.motivo }));
  return iniciarDespachadorOutbox(publisher, {
    intervaloMs: config.intervaloMs,
    batchSize: config.batchSize,
    maxAttempts: config.maxAttempts,
    alFinalizarTanda: (error) => {
      informeActual = {
        estado: error ? 'error' : 'ok',
        motivo: modo.motivo,
        ultima_tanda_en: new Date().toISOString(),
        ultimo_error: error ?? null,
      };
    },
  });
}

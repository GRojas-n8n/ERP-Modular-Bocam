/**
 * Despachador del outbox de Finanzas (lote P1).
 * Change: hacer-confiables-publicadores-eventbus-criticos.
 *
 * Garantías:
 *  - APAGADO por defecto: solo FINANZAS_OUTBOX_DISPATCHER=on (valor exacto) lo enciende.
 *  - Publica con `publishConfirmed` (confirmación del broker + `mandatory`): un mensaje sin cola enlazada, sin canal, sin
 *    confirmación o fuera de plazo es un FALLO del intento (nunca se marca PUBLICADO). El retorno sin routing queda
 *    contado y registrado (`finanzas.outbox.sin_routing`).
 *  - Las filas se reclaman con FOR UPDATE SKIP LOCKED dentro de una transacción: dos despachadores nunca procesan la misma fila.
 *  - Orden por agregado (la OC): una fila solo es elegible si no existe una anterior (aggregate_seq menor) del mismo
 *    agregado que no esté PUBLICADO. Una fila en reintento o en ERROR retiene a las posteriores de ESE agregado, no a las de otros.
 *  - Reintento con espera exponencial acotada; agotados los intentos pasa a ERROR (no se borra; reintento manual ERROR → PENDIENTE).
 *  - Semántica al menos una vez: si el proceso cae entre la confirmación y el marcado, la fila se republica con el MISMO event_id.
 *  - Corre con la variable interna app.internal_worker = 'outbox', la única que la política RLS admite para leer todas las filas.
 *  - Limpieza (desactivada por defecto): solo borra PUBLICADO con más de N días, por lotes pequeños; nunca PENDIENTE ni ERROR.
 *  - Volver FINANZAS_EVENT_MODE a `direct` no elimina ni modifica filas: si el despachador sigue encendido, vacía lo pendiente.
 */

import basePrisma from './db';
import type { BocamEvent } from '../../../packages/event-bus/src';
import { sanitizarError } from './outbox-eventos';

export const VARIABLE_DESPACHADOR = 'FINANZAS_OUTBOX_DISPATCHER';
export const VARIABLE_LIMPIEZA = 'FINANZAS_OUTBOX_CLEANUP';
const MAX_BACKOFF_MS = 15 * 60 * 1000;

export interface OutboxPublisher {
  /** Se resuelve solo cuando el broker confirma el mensaje; se rechaza en cualquier otro caso. */
  publishConfirmed(event: BocamEvent): Promise<void>;
}

export interface OpcionesDespacho {
  publisher: OutboxPublisher;
  batchSize?: number;
  maxAttempts?: number;
  baseBackoffMs?: number;
}

export interface ResultadoDespacho {
  publicados: number;
  fallidos: number;
  errores: number;
  sinRouting: number;
}

interface FilaOutbox {
  id_evento: string;
  event_id: string;
  event_type: string;
  event_version: number;
  tenant_id: string;
  proyecto_id: string;
  aggregate_id: string;
  usuario_id: string | null;
  correlation_id: string | null;
  payload: Record<string, unknown>;
  intentos: number;
  created_at: Date;
}

// Contadores del proceso (para /ready y métricas). Se reinician al reiniciar el servicio.
export const metricasOutbox = { publicados: 0, fallidos: 0, errores: 0, sin_routing: 0, tandas: 0 };

function esperaSegunIntentos(intentos: number, baseMs: number): number {
  return Math.min(baseMs * 2 ** Math.max(intentos - 1, 0), MAX_BACKOFF_MS);
}

export function esErrorSinRouting(error: unknown): boolean {
  return /EVENT_BUS_SIN_COLA/.test(error instanceof Error ? error.message : String(error));
}

/** Publica una tanda de eventos elegibles. Marca PUBLICADO solo tras la confirmación del broker. */
export async function despacharOutbox(opciones: OpcionesDespacho): Promise<ResultadoDespacho> {
  const batchSize = opciones.batchSize ?? 10;
  const maxAttempts = opciones.maxAttempts ?? 10;
  const baseBackoffMs = opciones.baseBackoffMs ?? 5000;
  const resultado: ResultadoDespacho = { publicados: 0, fallidos: 0, errores: 0, sinRouting: 0 };

  await basePrisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.internal_worker', 'outbox', true)`;
      const reclamadas = await tx.$queryRaw<Array<{ id_evento: string }>>`
        SELECT o."id_evento" FROM "outbox_eventos" o
        WHERE o."estado" = 'PENDIENTE' AND o."proximo_intento_en" <= now()
          AND NOT EXISTS (
            SELECT 1 FROM "outbox_eventos" a
            WHERE a."tenant_id" = o."tenant_id" AND a."aggregate_type" = o."aggregate_type" AND a."aggregate_id" = o."aggregate_id"
              AND a."aggregate_seq" < o."aggregate_seq" AND a."estado" <> 'PUBLICADO'
          )
        ORDER BY o."orden_global"
        LIMIT ${batchSize}
        FOR UPDATE OF o SKIP LOCKED`;
      if (reclamadas.length === 0) return;

      const ids = reclamadas.map((r) => r.id_evento);
      const filas = await tx.$queryRaw<FilaOutbox[]>`
        SELECT "id_evento", "event_id", "event_type", "event_version", "tenant_id", "proyecto_id", "aggregate_id", "usuario_id",
               "correlation_id", "payload", "intentos", "created_at"
        FROM "outbox_eventos" WHERE "id_evento" = ANY(${ids}::uuid[]) ORDER BY "orden_global"`;

      for (const fila of filas) {
        const evento: BocamEvent = {
          event_id: fila.event_id,
          event_version: fila.event_version,
          event_type: fila.event_type,
          timestamp: new Date(fila.created_at).toISOString(),
          context: {
            tenant_id: fila.tenant_id,
            proyecto_id: fila.proyecto_id,
            user_id: fila.usuario_id ?? '',
            correlation_id: fila.correlation_id ?? undefined,
          },
          payload: fila.payload,
        } as BocamEvent;

        try {
          await opciones.publisher.publishConfirmed(evento);
        } catch (error) {
          const intentos = fila.intentos + 1;
          const agotado = intentos >= maxAttempts;
          const causa = sanitizarError(error);
          const espera = esperaSegunIntentos(intentos, baseBackoffMs);
          const nuevoEstado = agotado ? 'ERROR' : 'PENDIENTE';
          await tx.$executeRaw`
            UPDATE "outbox_eventos"
            SET "intentos" = ${intentos}::int, "ultimo_error" = ${causa}, "estado" = ${nuevoEstado},
                "proximo_intento_en" = now() + (${espera}::int * interval '1 millisecond')
            WHERE "id_evento" = ${fila.id_evento}::uuid`;
          if (esErrorSinRouting(error)) {
            resultado.sinRouting++;
            metricasOutbox.sin_routing++;
            console.error(JSON.stringify({
              action: 'finanzas.outbox.sin_routing', event_id: fila.event_id, event_type: fila.event_type, aggregate_id: fila.aggregate_id, intentos,
            }));
          }
          if (agotado) {
            resultado.errores++;
            metricasOutbox.errores++;
            console.error(JSON.stringify({
              action: 'finanzas.outbox.evento_en_error', event_id: fila.event_id, event_type: fila.event_type, aggregate_id: fila.aggregate_id, intentos, error: causa,
            }));
          } else {
            resultado.fallidos++;
            metricasOutbox.fallidos++;
            console.error(JSON.stringify({
              action: 'finanzas.outbox.publicacion_fallida', event_id: fila.event_id, event_type: fila.event_type, aggregate_id: fila.aggregate_id, intentos, error: causa,
            }));
          }
          // Una fila fallida retiene a las posteriores de su agregado; las de otros agregados siguen su curso.
          continue;
        }

        // Confirmado por el broker: recién ahora se marca. Si esto falla, la transacción se revierte y la fila se republica.
        await tx.$executeRaw`
          UPDATE "outbox_eventos"
          SET "estado" = 'PUBLICADO', "publicado_en" = now(), "intentos" = ${fila.intentos + 1}::int, "ultimo_error" = NULL
          WHERE "id_evento" = ${fila.id_evento}::uuid`;
        resultado.publicados++;
        metricasOutbox.publicados++;
      }
    },
    { maxWait: 10_000, timeout: 30_000 + batchSize * 10_000 },
  );

  metricasOutbox.tandas++;
  return resultado;
}

/** Devuelve a PENDIENTE las filas en ERROR (reintento manual, operación del titular). No borra nada. */
export async function reintentarFilasEnError(): Promise<number> {
  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.internal_worker', 'outbox', true)`;
    return tx.$executeRaw`
      UPDATE "outbox_eventos" SET "estado" = 'PENDIENTE', "intentos" = 0, "proximo_intento_en" = now()
      WHERE "estado" = 'ERROR'`;
  });
}

export interface BacklogOutbox {
  pendientes: number;
  errores: number;
  publicados: number;
  mas_antiguo_pendiente_segundos: number | null;
}

/** Estado de la cola para /ready y métricas. Usa la variable interna del despachador (lee todos los tenants). */
export async function consultarBacklog(): Promise<BacklogOutbox> {
  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.internal_worker', 'outbox', true)`;
    const r = await tx.$queryRaw<Array<{ pendientes: bigint; errores: bigint; publicados: bigint; antiguo: number | null }>>`
      SELECT count(*) FILTER (WHERE "estado" = 'PENDIENTE') AS pendientes,
             count(*) FILTER (WHERE "estado" = 'ERROR') AS errores,
             count(*) FILTER (WHERE "estado" = 'PUBLICADO') AS publicados,
             EXTRACT(EPOCH FROM (now() - min("created_at") FILTER (WHERE "estado" = 'PENDIENTE')))::float8 AS antiguo
      FROM "outbox_eventos"`;
    const f = r[0];
    return {
      pendientes: Number(f.pendientes),
      errores: Number(f.errores),
      publicados: Number(f.publicados),
      mas_antiguo_pendiente_segundos: f.antiguo === null ? null : Math.round(f.antiguo),
    };
  });
}

// ── Activación ───────────────────────────────────────────────────────────────────────────────────────────────

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

export interface DespachadorActivo {
  detener(): void;
  ejecutarAhora(): Promise<void>;
}

export function iniciarDespachadorOutbox(
  publisher: OutboxPublisher,
  opciones: {
    intervaloMs?: number; batchSize?: number; maxAttempts?: number; baseBackoffMs?: number;
    alFinalizarTanda?: (error?: string) => void;
  } = {},
): DespachadorActivo {
  let ejecutando = false;
  let detenido = false;

  const tick = async () => {
    if (ejecutando || detenido) return;
    ejecutando = true;
    try {
      // Drena por rondas: cada ronda publica como máximo una fila por agregado (orden estricto por OC).
      for (let ronda = 0; ronda < 20 && !detenido; ronda++) {
        const r = await despacharOutbox({ publisher, batchSize: opciones.batchSize, maxAttempts: opciones.maxAttempts, baseBackoffMs: opciones.baseBackoffMs });
        if (r.publicados || r.fallidos || r.errores) console.log(JSON.stringify({ action: 'finanzas.outbox.tanda', ...r }));
        if (r.publicados === 0) break;
      }
      opciones.alFinalizarTanda?.();
    } catch (error) {
      const causa = sanitizarError(error);
      console.error(JSON.stringify({ action: 'finanzas.outbox.tanda_fallida', error: causa }));
      opciones.alFinalizarTanda?.(causa);
    } finally {
      ejecutando = false;
    }
  };

  const timer = setInterval(() => { void tick(); }, opciones.intervaloMs ?? 5000);
  timer.unref?.();
  void tick();

  return { detener() { detenido = true; clearInterval(timer); }, ejecutarAhora: tick };
}

/** Arranca el despachador solo si `valor` es exactamente `on`; en otro caso registra `dispatcher disabled` y no hace nada. */
export function configurarDespachadorOutbox(
  publisher: OutboxPublisher,
  config: { valor: string | undefined; intervaloMs?: number; batchSize?: number; maxAttempts?: number; baseBackoffMs?: number },
): DespachadorActivo | null {
  const modo = resolverModoDespachador(config.valor);
  if (!modo.activo) {
    informeActual = { estado: 'disabled', motivo: modo.motivo, ultima_tanda_en: null, ultimo_error: null };
    const registro = {
      action: 'finanzas.outbox.dispatcher_disabled', message: 'dispatcher disabled', motivo: modo.motivo,
      detalle: 'Con FINANZAS_EVENT_MODE=outbox los eventos se acumulan en outbox_eventos (PENDIENTE) sin publicarse.',
    };
    if (config.valor !== undefined && config.valor !== 'off' && config.valor.trim() !== '') console.warn(JSON.stringify(registro));
    else console.log(JSON.stringify(registro));
    return null;
  }
  informeActual = { estado: 'starting', motivo: modo.motivo, ultima_tanda_en: null, ultimo_error: null };
  console.log(JSON.stringify({ action: 'finanzas.outbox.dispatcher_enabled', message: 'dispatcher enabled', motivo: modo.motivo }));
  return iniciarDespachadorOutbox(publisher, {
    ...config,
    alFinalizarTanda: (error) => {
      informeActual = { estado: error ? 'error' : 'ok', motivo: modo.motivo, ultima_tanda_en: new Date().toISOString(), ultimo_error: error ?? null };
    },
  });
}

// ── Limpieza controlada de PUBLICADO ─────────────────────────────────────────────────────────────────────────

export const RETENCION_DIAS_POR_DEFECTO = 90;

/** Borra como máximo `lote` filas PUBLICADO con más de `retencionDias` días. NUNCA toca PENDIENTE ni ERROR. */
export async function limpiarPublicados(opciones: { retencionDias?: number; lote?: number } = {}): Promise<number> {
  const dias = Math.max(1, Math.floor(opciones.retencionDias ?? RETENCION_DIAS_POR_DEFECTO));
  const lote = Math.max(1, Math.floor(opciones.lote ?? 100));
  return basePrisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.internal_worker', 'outbox', true)`;
    // CTE MATERIALIZED: un `IN (SELECT ... LIMIT n FOR UPDATE)` se re-evalúa como semi-join y puede borrar más de `n` filas.
    return tx.$executeRaw`
      WITH lote AS MATERIALIZED (
        SELECT "id_evento" FROM "outbox_eventos"
        WHERE "estado" = 'PUBLICADO' AND "publicado_en" < now() - (${dias}::int * interval '1 day')
        ORDER BY "publicado_en" LIMIT ${lote}::int FOR UPDATE SKIP LOCKED
      )
      DELETE FROM "outbox_eventos" o USING lote
      WHERE o."id_evento" = lote."id_evento" AND o."estado" = 'PUBLICADO'`;
  });
}

export interface LimpiezaActiva { detener(): void; ejecutarAhora(): Promise<number> }

/** Desactivada por defecto: solo FINANZAS_OUTBOX_CLEANUP=on (valor exacto) la enciende. Cada pasada queda registrada. */
export function configurarLimpiezaOutbox(config: {
  valor: string | undefined; intervaloMs?: number; retencionDias?: number; lote?: number; maxLotesPorPasada?: number;
}): LimpiezaActiva | null {
  if (config.valor !== 'on') {
    console.log(JSON.stringify({ action: 'finanzas.outbox.cleanup_disabled', motivo: config.valor === undefined ? `${VARIABLE_LIMPIEZA} no está definida` : `${VARIABLE_LIMPIEZA}=${JSON.stringify(config.valor.slice(0, 20))}` }));
    return null;
  }
  const pasada = async (): Promise<number> => {
    let total = 0;
    try {
      for (let i = 0; i < (config.maxLotesPorPasada ?? 20); i++) {
        const n = await limpiarPublicados({ retencionDias: config.retencionDias, lote: config.lote });
        total += n;
        if (n < (config.lote ?? 100)) break;
      }
      console.log(JSON.stringify({ action: 'finanzas.outbox.cleanup', eliminados: total, retencion_dias: config.retencionDias ?? RETENCION_DIAS_POR_DEFECTO }));
    } catch (error) {
      console.error(JSON.stringify({ action: 'finanzas.outbox.cleanup_fallida', error: sanitizarError(error) }));
    }
    return total;
  };
  const timer = setInterval(() => { void pasada(); }, config.intervaloMs ?? 60 * 60 * 1000);
  timer.unref?.();
  console.log(JSON.stringify({ action: 'finanzas.outbox.cleanup_enabled', retencion_dias: config.retencionDias ?? RETENCION_DIAS_POR_DEFECTO }));
  return { detener() { clearInterval(timer); }, ejecutarAhora: pasada };
}

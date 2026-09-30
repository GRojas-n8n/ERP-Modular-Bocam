/**
 * Outbox transaccional de eventos de Finanzas (lote P1).
 * Change: hacer-confiables-publicadores-eventbus-criticos.
 *
 * Dos modos excluyentes, por servicio (variable FINANZAS_EVENT_MODE):
 *   - `direct` (predeterminado): comportamiento de siempre. Se publica con eventBus.publish() después del commit y
 *     NO se escribe ninguna fila de outbox.
 *   - `outbox`: el evento se escribe en `outbox_eventos` DENTRO de la misma transacción que el cambio de negocio y
 *     solo el despachador (outbox-dispatcher.ts) lo publica, con confirmación del broker. No existe modo dual.
 * Solo el valor exacto `outbox` activa el modo outbox; cualquier otro (ausente, vacío, `direct`, inválido) es `direct`.
 *
 * Garantías de la escritura (todas dentro de la transacción de negocio, con RLS):
 *   - lock advisory por (tenant, OC) (el mismo que serializa compromiso y cancelación): protege la secuencia por agregado;
 *   - event_id estable: para fondos_comprometidos/fondos_liberados se deriva del movimiento presupuestal, así que un
 *     mismo hecho de negocio nunca produce dos filas (UNIQUE (tenant_id, event_id) + ON CONFLICT DO NOTHING);
 *   - aggregate_seq monotónica por OC, asignada bajo el lock y respaldada por un índice único (orden determinista
 *     que no depende de marcas de tiempo).
 */

import { createHash, randomUUID } from 'node:crypto';
import { FinanzasEvents } from './types';

type TxSql = {
  $executeRaw: (query: TemplateStringsArray, ...values: any[]) => Promise<number>;
  $queryRaw: <T = unknown>(query: TemplateStringsArray, ...values: any[]) => Promise<T>;
};

export const VARIABLE_MODO_EVENTOS = 'FINANZAS_EVENT_MODE';
export type ModoEventos = 'direct' | 'outbox';

export const AGREGADO_OC = 'OrdenCompra';
export const VERSION_EVENTO = 1;

/** Eventos del lote P1: los únicos que pasan por la outbox. */
export const EVENTOS_P1: readonly string[] = [
  FinanzasEvents.FONDOS_COMPROMETIDOS,
  FinanzasEvents.FONDOS_LIBERADOS,
  FinanzasEvents.PRESUPUESTO_INSUFICIENTE,
];

export function resolverModoEventos(valor: string | undefined): { modo: ModoEventos; motivo: string } {
  if (valor === undefined || valor.trim() === '') return { modo: 'direct', motivo: `${VARIABLE_MODO_EVENTOS} no está definida` };
  if (valor === 'outbox') return { modo: 'outbox', motivo: `${VARIABLE_MODO_EVENTOS}=outbox` };
  if (valor === 'direct') return { modo: 'direct', motivo: `${VARIABLE_MODO_EVENTOS}=direct` };
  return { modo: 'direct', motivo: `${VARIABLE_MODO_EVENTOS} tiene un valor no reconocido (${JSON.stringify(valor.slice(0, 20))}); solo "outbox" lo activa` };
}

let avisoModoInvalido = false;
/** Se lee en cada llamada (no se cachea): el modo puede cambiarse reiniciando el servicio con otra variable. */
export function modoEventos(): ModoEventos {
  const valor = process.env[VARIABLE_MODO_EVENTOS];
  const r = resolverModoEventos(valor);
  if (valor !== undefined && valor.trim() !== '' && valor !== 'direct' && valor !== 'outbox' && !avisoModoInvalido) {
    avisoModoInvalido = true;
    console.warn(JSON.stringify({ action: 'finanzas.outbox.modo_no_reconocido', motivo: r.motivo, modo: r.modo }));
  }
  return r.modo;
}

/** UUID determinista (formato v5) derivado de un nombre: mismo hecho de negocio, mismo event_id. */
export function uuidDeterminista(nombre: string): string {
  const h = createHash('sha1').update(`finanzas-outbox:${nombre}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
}

/** Lock transaccional por (tenant, OC): se libera solo al terminar la transacción. Reentrante en la misma sesión. */
export async function bloquearOc(tx: TxSql, tenantId: string, ocId: string): Promise<void> {
  const clave = `oc-compromiso:${tenantId}:${ocId}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}::text, 0))`;
}

export interface EventoParaOutbox {
  tenantId: string;
  proyectoId: string;
  userId: string;
  correlationId?: string;
  eventType: string;
  ocId: string;
  /** Si se omite se genera uno aleatorio (p. ej. presupuesto_insuficiente: cada decisión de rechazo es un evento). */
  eventId?: string;
  payload: Record<string, unknown>;
}

/**
 * Escribe el evento en la outbox usando la transacción de negocio `tx`. Devuelve true si insertó una fila nueva y false si
 * ya existía (mismo event_id): en ese caso el evento original ya está garantizado y no se duplica.
 */
export async function encolarEventoTx(tx: TxSql, e: EventoParaOutbox): Promise<boolean> {
  if (!EVENTOS_P1.includes(e.eventType)) throw new Error(`OUTBOX_EVENTO_NO_SOPORTADO: ${e.eventType}`);
  await bloquearOc(tx, e.tenantId, e.ocId);
  const eventId = e.eventId ?? randomUUID();
  const filas = await tx.$queryRaw<Array<{ id_evento: string }>>`
    INSERT INTO "outbox_eventos"
      ("event_id", "event_type", "event_version", "tenant_id", "proyecto_id", "aggregate_type", "aggregate_id",
       "aggregate_seq", "usuario_id", "correlation_id", "payload")
    SELECT ${eventId}::uuid, ${e.eventType}, ${VERSION_EVENTO}::int, ${e.tenantId}::uuid, ${e.proyectoId}::uuid, ${AGREGADO_OC},
           ${e.ocId}::uuid,
           COALESCE((SELECT MAX("aggregate_seq") FROM "outbox_eventos"
                     WHERE "tenant_id" = ${e.tenantId}::uuid AND "aggregate_type" = ${AGREGADO_OC} AND "aggregate_id" = ${e.ocId}::uuid), 0) + 1,
           ${e.userId}::uuid, ${e.correlationId ?? null}, ${JSON.stringify(e.payload)}::jsonb
    ON CONFLICT ("tenant_id", "event_id") DO NOTHING
    RETURNING "id_evento"`;
  return filas.length > 0;
}

// ── Payloads (idénticos a los que publicaba publishFinanceDomainEvent) ───────────────────────────────────────────

export const payloadFondosComprometidos = (r: {
  presupuestoId: string; movimientoId: string; monto: number; montoDisponibleRestante: number; ocId: string; ocCodigo: string;
}) => ({
  presupuesto_id: r.presupuestoId,
  movimiento_id: r.movimientoId,
  monto_comprometido: r.monto,
  monto_disponible_restante: r.montoDisponibleRestante,
  referencia_oc_id: r.ocId,
  referencia_oc_codigo: r.ocCodigo,
  idempotente: false,
});

export const payloadFondosLiberados = (r: {
  presupuestoId: string; movimientoId: string; monto: number; ocId: string; ocCodigo: string; idempotente: boolean;
}) => ({
  presupuesto_id: r.presupuestoId,
  movimiento_id: r.movimientoId,
  monto_liberado: r.monto,
  referencia_oc_id: r.ocId,
  referencia_oc_codigo: r.ocCodigo,
  idempotente: r.idempotente,
});

export const payloadPresupuestoInsuficiente = (r: {
  presupuestoId: string; montoSolicitado: number; montoDisponible: number; ocId: string; ocCodigo: string;
}) => ({
  presupuesto_id: r.presupuestoId,
  monto_solicitado: r.montoSolicitado,
  monto_disponible: r.montoDisponible,
  deficit: r.montoSolicitado - r.montoDisponible,
  referencia_oc_id: r.ocId,
  referencia_oc_codigo: r.ocCodigo,
  idempotente: false,
});

/** Mensaje de error apto para guardar y mostrar: una línea, sin caracteres de control, acotado y sin contenido del evento. */
export function sanitizarError(error: unknown): string {
  const crudo = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  // eslint-disable-next-line no-control-regex
  return crudo.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

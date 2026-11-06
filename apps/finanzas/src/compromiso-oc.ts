/**
 * Compromiso y liberación presupuestal de una OC — punto único de escritura.
 * Change: blindar-compromiso-oc-concurrencia-y-orden-eventos (primer PR: Finanzas).
 *
 * Los cinco caminos que tocan el compromiso de una OC (POST comprometer-fondos, POST liberar-fondos, y los eventos
 * compras.oc_creada, compras.oc_cancelada y gerencia_tecnica.partida_comprometida) pasan por estas dos funciones.
 *
 * Garantías (todas dentro de UNA transacción de createTenantContext, con RLS):
 *   1. pg_advisory_xact_lock por (tenant, OC): serializa creación y cancelación de la misma OC. No se hace ninguna
 *      llamada HTTP ni publicación de eventos mientras se mantiene el lock (el llamador publica después del commit).
 *   2. INSERT ... ON CONFLICT DO NOTHING sobre el índice único parcial uq_movimiento_oc_compromiso_liberacion:
 *      como máximo un COMPROMISO y una LIBERACION por OC, aunque exista un camino que no tome el lock.
 *   3. Tombstone (oc_cancelaciones_tombstone): una cancelación anterior a la creación se registra sin liberar fondos
 *      inexistentes, y una creación posterior no compromete.
 *   4. La liberación usa el COMPROMISO exacto de la misma OC (monto y presupuesto), nunca saldos agregados.
 *   5. El saldo del presupuesto se actualiza con UPDATE condicional atómico (disponible >= monto): no hay
 *      sobrecompromiso entre OC distintas que concurren sobre el mismo presupuesto.
 * No se usa aislamiento SERIALIZABLE.
 */

import { createTenantContext } from './db';
import {
  bloquearOc,
  encolarEventoTx,
  modoEventos,
  payloadFondosComprometidos,
  payloadFondosLiberados,
  payloadPresupuestoInsuficiente,
  uuidDeterminista,
} from './outbox-eventos';
import { FinanzasEvents } from './types';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];

export interface ContextoOc {
  tenantId: string;
  proyectoId: string;
  userId: string;
  correlationId?: string;
}

// `eventoEncolado`: en modo `outbox` el evento ya quedo escrito en la outbox (dentro de la misma transaccion); el llamador
// NO debe publicarlo directamente. En modo `direct` (o si el camino no publica el evento) es false/ausente.
export type ResultadoCompromiso =
  | { estado: 'creado'; movimientoId: string; presupuestoId: string; monto: number; montoDisponibleRestante: number; eventoEncolado?: boolean }
  | { estado: 'idempotente'; movimientoId: string; presupuestoId: string; monto: number; montoDisponibleActual: number }
  | { estado: 'oc_cancelada' }
  | { estado: 'presupuesto_no_encontrado' }
  | { estado: 'presupuesto_insuficiente'; montoSolicitado: number; montoDisponible: number; eventoEncolado?: boolean };

export type ResultadoCancelacion =
  | { estado: 'liberado'; movimientoId: string; presupuestoId: string; monto: number; eventoEncolado?: boolean }
  | { estado: 'idempotente'; movimientoId: string; presupuestoId: string; monto: number; eventoEncolado?: boolean }
  | { estado: 'sin_compromiso' };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** true si el valor es un UUID textual válido (una OC sin referencia válida no debe llegar al INSERT). */
export function esUuid(valor: unknown): valor is string {
  return typeof valor === 'string' && UUID_RE.test(valor);
}

export class ReferenciaOcInvalida extends Error {
  constructor(campo: string) {
    super(`REFERENCIA_OC_INVALIDA: ${campo}`);
  }
}

class PresupuestoInsuficiente extends Error {
  constructor(readonly montoSolicitado: number, readonly montoDisponible: number, readonly presupuestoId: string) {
    super('PRESUPUESTO_INSUFICIENTE');
  }
}

const MODULO = 'compras';
const ENTIDAD = 'OrdenCompra';

const claveMovimiento = (tenantId: string, ocId: string, tipo: 'COMPROMISO' | 'LIBERACION') => ({
  tenant_id: tenantId,
  referencia_modulo: MODULO,
  referencia_entidad: ENTIDAD,
  referencia_id: ocId,
  tipo,
});

async function insertarMovimiento(
  tx: Tx,
  ctx: ContextoOc,
  m: { presupuestoId: string; tipo: 'COMPROMISO' | 'LIBERACION'; concepto: string; monto: number; ocId: string; ocCodigo: string; notas: string },
): Promise<string | null> {
  const rows = await tx.$queryRaw<Array<{ id_movimiento: string }>>`
    INSERT INTO "movimientos_presupuestales"
      ("id_movimiento", "tenant_id", "proyecto_id", "presupuesto_id", "tipo", "concepto", "monto",
       "referencia_modulo", "referencia_entidad", "referencia_id", "referencia_codigo", "usuario_id", "notas")
    VALUES
      (gen_random_uuid(), ${ctx.tenantId}::uuid, ${ctx.proyectoId}::uuid, ${m.presupuestoId}::uuid, ${m.tipo}, ${m.concepto},
       ${m.monto}::numeric, 'compras', 'OrdenCompra', ${m.ocId}::uuid, ${m.ocCodigo}, ${ctx.userId}::uuid, ${m.notas})
    ON CONFLICT ("tenant_id", "referencia_modulo", "referencia_entidad", "referencia_id", "tipo")
      WHERE "tipo" IN ('COMPROMISO', 'LIBERACION') AND "referencia_modulo" = 'compras'
        AND "referencia_entidad" = 'OrdenCompra' AND "referencia_id" IS NOT NULL
    DO NOTHING
    RETURNING "id_movimiento"`;
  return rows.length > 0 ? rows[0].id_movimiento : null;
}

async function disponibleActual(tx: Tx, presupuestoId: string): Promise<number> {
  const p = await tx.presupuestoAsignado.findUnique({ where: { id_presupuesto: presupuestoId } });
  return p ? Number(p.monto_disponible) : 0;
}

/**
 * Registra el compromiso de una OC. `presupuestoId` (HTTP y oc_creada) o `conceptoId` (partida_comprometida, que
 * resuelve el presupuesto por partida). `validarSuficiencia=false` conserva el comportamiento de partida_comprometida,
 * donde Gerencia Técnica es la fuente de verdad del saldo.
 */
export async function registrarCompromisoOc(
  ctx: ContextoOc,
  p: {
    ocId: string;
    ocCodigo: string;
    monto: number;
    presupuestoId?: string;
    conceptoId?: string;
    validarSuficiencia: boolean;
    concepto: string;
    notas: string;
    /** true si este camino publica fondos_comprometidos / presupuesto_insuficiente (HTTP y oc_creada; no partida_comprometida). */
    publicaEvento?: boolean;
  },
): Promise<ResultadoCompromiso> {
  // Defensa en profundidad: los llamadores validan antes; aquí se rechaza antes de abrir la transacción o hacer INSERT.
  if (!esUuid(p.ocId)) throw new ReferenciaOcInvalida('oc_id');
  if (p.presupuestoId !== undefined && !esUuid(p.presupuestoId)) throw new ReferenciaOcInvalida('presupuesto_id');
  if (p.conceptoId !== undefined && !esUuid(p.conceptoId)) throw new ReferenciaOcInvalida('concepto_id');
  const enOutbox = Boolean(p.publicaEvento) && modoEventos() === 'outbox';
  try {
    return await createTenantContext(ctx, async (tx): Promise<ResultadoCompromiso> => {
      await bloquearOc(tx, ctx.tenantId, p.ocId);

      // Cancelada antes (tombstone) o ya liberada: la creación tardía no compromete.
      const tombstone = await tx.ocCancelacionTombstone.findUnique({
        where: { tenant_id_oc_id: { tenant_id: ctx.tenantId, oc_id: p.ocId } },
      });
      if (tombstone) return { estado: 'oc_cancelada' };
      const liberada = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'LIBERACION') });
      if (liberada) return { estado: 'oc_cancelada' };

      const existente = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'COMPROMISO') });
      if (existente) {
        return {
          estado: 'idempotente',
          movimientoId: existente.id_movimiento,
          presupuestoId: existente.presupuesto_id,
          monto: Number(existente.monto),
          montoDisponibleActual: await disponibleActual(tx, existente.presupuesto_id),
        };
      }

      const presupuesto = p.presupuestoId
        ? await tx.presupuestoAsignado.findUnique({ where: { id_presupuesto: p.presupuestoId } })
        : await tx.presupuestoAsignado.findFirst({
            where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, concepto_id: p.conceptoId },
          });
      if (!presupuesto) return { estado: 'presupuesto_no_encontrado' };

      const movimientoId = await insertarMovimiento(tx, ctx, {
        presupuestoId: presupuesto.id_presupuesto, tipo: 'COMPROMISO', concepto: p.concepto, monto: p.monto,
        ocId: p.ocId, ocCodigo: p.ocCodigo, notas: p.notas,
      });
      if (!movimientoId) {
        // Otro camino sin lock ganó la carrera: el índice único lo impidió; el resultado es idempotente.
        const ganador = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'COMPROMISO') });
        if (!ganador) throw new Error('Conflicto de compromiso sin movimiento existente.');
        return {
          estado: 'idempotente',
          movimientoId: ganador.id_movimiento,
          presupuestoId: ganador.presupuesto_id,
          monto: Number(ganador.monto),
          montoDisponibleActual: await disponibleActual(tx, ganador.presupuesto_id),
        };
      }

      // UPDATE condicional atómico: serializa a las OC distintas que concurren sobre el mismo presupuesto.
      const actualizado = await tx.$queryRaw<Array<{ monto_disponible: unknown }>>`
        UPDATE "presupuestos_asignados"
        SET "monto_comprometido" = "monto_comprometido" + ${p.monto}::numeric,
            "monto_disponible" = "monto_disponible" - ${p.monto}::numeric,
            "updated_at" = now()
        WHERE "id_presupuesto" = ${presupuesto.id_presupuesto}::uuid
          AND (${!p.validarSuficiencia}::boolean OR "monto_disponible" >= ${p.monto}::numeric)
        RETURNING "monto_disponible"`;
      if (actualizado.length === 0) {
        // Aborta la transacción: el movimiento recién insertado no debe persistir.
        throw new PresupuestoInsuficiente(p.monto, Number(presupuesto.monto_disponible), presupuesto.id_presupuesto);
      }

      const montoDisponibleRestante = Number(actualizado[0].monto_disponible);
      // Modo outbox: el evento se escribe en ESTA transaccion (si algo falla despues, ambos se revierten).
      if (enOutbox) {
        await encolarEventoTx(tx, {
          tenantId: ctx.tenantId, proyectoId: ctx.proyectoId, userId: ctx.userId, correlationId: ctx.correlationId,
          eventType: FinanzasEvents.FONDOS_COMPROMETIDOS,
          ocId: p.ocId,
          eventId: uuidDeterminista(`${FinanzasEvents.FONDOS_COMPROMETIDOS}:${movimientoId}`),
          payload: payloadFondosComprometidos({
            presupuestoId: presupuesto.id_presupuesto, movimientoId, monto: p.monto, montoDisponibleRestante, ocId: p.ocId, ocCodigo: p.ocCodigo,
          }),
        });
      }

      return {
        estado: 'creado',
        movimientoId,
        presupuestoId: presupuesto.id_presupuesto,
        monto: p.monto,
        montoDisponibleRestante,
        ...(enOutbox ? { eventoEncolado: true } : {}),
      };
    });
  } catch (error) {
    if (error instanceof PresupuestoInsuficiente) {
      // El rechazo no persiste ningun movimiento (la transaccion de negocio se aborto a proposito), asi que el evento se
      // escribe en una transaccion propia. Si esa escritura falla, el error se propaga: nunca se pierde en silencio
      // (HTTP responde 500; el consumidor de oc_creada no confirma el mensaje y el broker lo reentrega).
      if (enOutbox) {
        await createTenantContext(ctx, async (tx) => encolarEventoTx(tx, {
          tenantId: ctx.tenantId, proyectoId: ctx.proyectoId, userId: ctx.userId, correlationId: ctx.correlationId,
          eventType: FinanzasEvents.PRESUPUESTO_INSUFICIENTE,
          ocId: p.ocId,
          payload: payloadPresupuestoInsuficiente({
            presupuestoId: error.presupuestoId, montoSolicitado: error.montoSolicitado, montoDisponible: error.montoDisponible,
            ocId: p.ocId, ocCodigo: p.ocCodigo,
          }),
        }));
        return { estado: 'presupuesto_insuficiente', montoSolicitado: error.montoSolicitado, montoDisponible: error.montoDisponible, eventoEncolado: true };
      }
      return { estado: 'presupuesto_insuficiente', montoSolicitado: error.montoSolicitado, montoDisponible: error.montoDisponible };
    }
    throw error;
  }
}

/**
 * Registra la cancelación de una OC: siempre deja el tombstone; libera únicamente el COMPROMISO exacto de esa OC
 * (monto y presupuesto del propio movimiento). Sin compromiso no libera nada.
 */
export async function registrarCancelacionOc(
  ctx: ContextoOc,
  p: { ocId: string; ocCodigo: string; origen: 'HTTP' | 'EVENTO'; concepto: string; notas: string; publicaEvento?: boolean },
): Promise<ResultadoCancelacion> {
  if (!esUuid(p.ocId)) throw new ReferenciaOcInvalida('oc_id');
  const enOutbox = Boolean(p.publicaEvento) && modoEventos() === 'outbox';
  return createTenantContext(ctx, async (tx): Promise<ResultadoCancelacion> => {
    await bloquearOc(tx, ctx.tenantId, p.ocId);

    await tx.$executeRaw`
      INSERT INTO "oc_cancelaciones_tombstone" ("tenant_id", "oc_id", "proyecto_id", "oc_codigo", "origen", "usuario_id")
      VALUES (${ctx.tenantId}::uuid, ${p.ocId}::uuid, ${ctx.proyectoId}::uuid, ${p.ocCodigo}, ${p.origen}, ${ctx.userId}::uuid)
      ON CONFLICT ("tenant_id", "oc_id") DO NOTHING`;

    // Modo outbox: fondos_liberados se encola con event_id derivado del movimiento; si ya existia (liberacion repetida) el
    // INSERT es un no-op y no se duplica el evento. El llamador no publica directamente.
    const encolarLiberacion = async (movimientoId: string, presupuestoId: string, monto: number, idempotente: boolean) => {
      await encolarEventoTx(tx, {
        tenantId: ctx.tenantId, proyectoId: ctx.proyectoId, userId: ctx.userId, correlationId: ctx.correlationId,
        eventType: FinanzasEvents.FONDOS_LIBERADOS,
        ocId: p.ocId,
        eventId: uuidDeterminista(`${FinanzasEvents.FONDOS_LIBERADOS}:${movimientoId}`),
        payload: payloadFondosLiberados({ presupuestoId, movimientoId, monto, ocId: p.ocId, ocCodigo: p.ocCodigo, idempotente }),
      });
    };

    const liberacion = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'LIBERACION') });
    if (liberacion) {
      if (enOutbox) await encolarLiberacion(liberacion.id_movimiento, liberacion.presupuesto_id, Number(liberacion.monto), true);
      return {
        estado: 'idempotente', movimientoId: liberacion.id_movimiento, presupuestoId: liberacion.presupuesto_id, monto: Number(liberacion.monto),
        ...(enOutbox ? { eventoEncolado: true } : {}),
      };
    }

    const compromiso = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'COMPROMISO') });
    if (!compromiso) return { estado: 'sin_compromiso' };

    const monto = Number(compromiso.monto);
    const movimientoId = await insertarMovimiento(tx, ctx, {
      presupuestoId: compromiso.presupuesto_id, tipo: 'LIBERACION', concepto: p.concepto, monto,
      ocId: p.ocId, ocCodigo: p.ocCodigo, notas: p.notas,
    });
    if (!movimientoId) {
      const ganador = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'LIBERACION') });
      if (!ganador) throw new Error('Conflicto de liberación sin movimiento existente.');
      if (enOutbox) await encolarLiberacion(ganador.id_movimiento, ganador.presupuesto_id, Number(ganador.monto), true);
      return {
        estado: 'idempotente', movimientoId: ganador.id_movimiento, presupuestoId: ganador.presupuesto_id, monto: Number(ganador.monto),
        ...(enOutbox ? { eventoEncolado: true } : {}),
      };
    }

    const actualizado = await tx.$queryRaw<Array<{ id_presupuesto: string }>>`
      UPDATE "presupuestos_asignados"
      SET "monto_comprometido" = "monto_comprometido" - ${monto}::numeric,
          "monto_disponible" = "monto_disponible" + ${monto}::numeric,
          "updated_at" = now()
      WHERE "id_presupuesto" = ${compromiso.presupuesto_id}::uuid AND "monto_comprometido" >= ${monto}::numeric
      RETURNING "id_presupuesto"`;
    if (actualizado.length === 0) {
      throw new Error('No hay fondos comprometidos suficientes para liberar este monto.');
    }

    if (enOutbox) await encolarLiberacion(movimientoId, compromiso.presupuesto_id, monto, false);
    return { estado: 'liberado', movimientoId, presupuestoId: compromiso.presupuesto_id, monto, ...(enOutbox ? { eventoEncolado: true } : {}) };
  });
}

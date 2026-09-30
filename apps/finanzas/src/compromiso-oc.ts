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

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];

export interface ContextoOc {
  tenantId: string;
  proyectoId: string;
  userId: string;
}

export type ResultadoCompromiso =
  | { estado: 'creado'; movimientoId: string; presupuestoId: string; monto: number; montoDisponibleRestante: number }
  | { estado: 'idempotente'; movimientoId: string; presupuestoId: string; monto: number; montoDisponibleActual: number }
  | { estado: 'oc_cancelada' }
  | { estado: 'presupuesto_no_encontrado' }
  | { estado: 'presupuesto_insuficiente'; montoSolicitado: number; montoDisponible: number };

export type ResultadoCancelacion =
  | { estado: 'liberado'; movimientoId: string; presupuestoId: string; monto: number }
  | { estado: 'idempotente'; movimientoId: string; presupuestoId: string; monto: number }
  | { estado: 'sin_compromiso' };

class PresupuestoInsuficiente extends Error {
  constructor(readonly montoSolicitado: number, readonly montoDisponible: number) {
    super('PRESUPUESTO_INSUFICIENTE');
  }
}

const MODULO = 'compras';
const ENTIDAD = 'OrdenCompra';

/** Lock transaccional por (tenant, OC): se libera solo al terminar la transacción. */
async function bloquearOc(tx: Tx, tenantId: string, ocId: string): Promise<void> {
  const clave = `oc-compromiso:${tenantId}:${ocId}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}::text, 0))`;
}

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
  },
): Promise<ResultadoCompromiso> {
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
        throw new PresupuestoInsuficiente(p.monto, Number(presupuesto.monto_disponible));
      }

      return {
        estado: 'creado',
        movimientoId,
        presupuestoId: presupuesto.id_presupuesto,
        monto: p.monto,
        montoDisponibleRestante: Number(actualizado[0].monto_disponible),
      };
    });
  } catch (error) {
    if (error instanceof PresupuestoInsuficiente) {
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
  p: { ocId: string; ocCodigo: string; origen: 'HTTP' | 'EVENTO'; concepto: string; notas: string },
): Promise<ResultadoCancelacion> {
  return createTenantContext(ctx, async (tx): Promise<ResultadoCancelacion> => {
    await bloquearOc(tx, ctx.tenantId, p.ocId);

    await tx.$executeRaw`
      INSERT INTO "oc_cancelaciones_tombstone" ("tenant_id", "oc_id", "proyecto_id", "oc_codigo", "origen", "usuario_id")
      VALUES (${ctx.tenantId}::uuid, ${p.ocId}::uuid, ${ctx.proyectoId}::uuid, ${p.ocCodigo}, ${p.origen}, ${ctx.userId}::uuid)
      ON CONFLICT ("tenant_id", "oc_id") DO NOTHING`;

    const liberacion = await tx.movimientoPresupuestal.findFirst({ where: claveMovimiento(ctx.tenantId, p.ocId, 'LIBERACION') });
    if (liberacion) {
      return { estado: 'idempotente', movimientoId: liberacion.id_movimiento, presupuestoId: liberacion.presupuesto_id, monto: Number(liberacion.monto) };
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
      return { estado: 'idempotente', movimientoId: ganador.id_movimiento, presupuestoId: ganador.presupuesto_id, monto: Number(ganador.monto) };
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

    return { estado: 'liberado', movimientoId, presupuestoId: compromiso.presupuesto_id, monto };
  });
}

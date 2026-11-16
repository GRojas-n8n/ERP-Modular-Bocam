/**
 * Programa de pagos: programar (individual o en lote) y ejecutar un pago con tesorería y presupuesto correctos.
 * Change: corregir-ejecucion-programa-pagos (hallazgos F13 y F19 de la auditoría del 5 nov 2026).
 *
 * Ejecutar un pago, en una sola transacción:
 *   1. Bloquea la fila del pago (FOR UPDATE): dos ejecuciones simultáneas no pagan dos veces.
 *   2. Bloquea el presupuesto y busca el COMPROMISO con la misma referencia (módulo, entidad, id).
 *      - Con compromiso: DEVENGADO (comprometido → ejercido) hasta agotar lo que queda de ese compromiso.
 *      - El excedente, o todo el pago si no hubo compromiso: EJERCIDO directo, solo si el disponible alcanza.
 *      Antes se restaba comprometido siempre: sin compromiso previo dejaba comprometido negativo y disponible
 *      inflado.
 *   3. Descuenta la cuenta bancaria (obligatoria) de forma atómica (tesoreria.ts).
 *   4. Marca el pago PAGADO con cuenta, referencia bancaria y fecha.
 */

import { createTenantContext } from './db';
import { esUuid } from './compromiso-oc';
import { ErrorFinanzas } from './errores';
import { Decimal, parsearMontoPositivo, type Dec } from './montos';
import { descontarCuentaBancaria } from './tesoreria';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];
type Ctx = { tenantId: string; proyectoId: string; userId: string };

const MAX_LOTE = 500;

export interface PagoProgramado {
  presupuesto_id: string;
  concepto: string;
  beneficiario: string;
  beneficiario_id: string | null;
  monto_programado: Dec;
  fecha_programada: Date;
  metodo_pago: string | null;
  banco: string | null;
  referencia_modulo: string | null;
  referencia_entidad: string | null;
  referencia_id: string | null;
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const opcional = (v: unknown, max: number) => {
  const t = texto(v, max);
  return t ? t : null;
};

/** Valida un pago del body. `prefijo` identifica el renglón en los mensajes de un lote. */
export function parsearPagoProgramado(b: any, prefijo = ''): PagoProgramado {
  const p = b ?? {};
  const campo = (n: string) => `${prefijo}${n}`;
  if (!esUuid(p.presupuesto_id)) throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', `${campo('presupuesto_id')} debe ser un UUID válido.`);
  const concepto = texto(p.concepto, 500);
  const beneficiario = texto(p.beneficiario, 255);
  if (!concepto || !beneficiario) {
    throw new ErrorFinanzas(400, 'FIN_MISSING_FIELDS', `${campo('concepto')} y ${campo('beneficiario')} son obligatorios.`);
  }
  const monto = parsearMontoPositivo(p.monto_programado, campo('monto_programado'));
  if (monto.motivo !== undefined) throw new ErrorFinanzas(400, 'FIN_MONTO_INVALIDO', monto.motivo);
  const fecha = new Date(p.fecha_programada);
  if (!p.fecha_programada || Number.isNaN(fecha.getTime())) {
    throw new ErrorFinanzas(400, 'FIN_FECHA_INVALIDA', `${campo('fecha_programada')} debe ser una fecha ISO válida.`);
  }
  if (p.beneficiario_id && !esUuid(p.beneficiario_id)) {
    throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', `${campo('beneficiario_id')} debe ser un UUID válido.`);
  }
  if (p.referencia_id && !esUuid(p.referencia_id)) {
    throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', `${campo('referencia_id')} debe ser un UUID válido.`);
  }
  return {
    presupuesto_id: p.presupuesto_id.toLowerCase(),
    concepto,
    beneficiario,
    beneficiario_id: p.beneficiario_id ? String(p.beneficiario_id).toLowerCase() : null,
    monto_programado: monto.monto!,
    fecha_programada: fecha,
    metodo_pago: opcional(p.metodo_pago, 50),
    banco: opcional(p.banco, 100),
    referencia_modulo: opcional(p.referencia_modulo, 50),
    referencia_entidad: opcional(p.referencia_entidad, 50),
    referencia_id: p.referencia_id ? String(p.referencia_id).toLowerCase() : null,
  };
}

async function exigirPresupuestos(tx: Tx, ids: string[]) {
  const unicos = [...new Set(ids)];
  const encontrados = await tx.presupuestoAsignado.findMany({
    where: { id_presupuesto: { in: unicos } },
    select: { id_presupuesto: true, estatus: true },
  });
  const porId = new Map(encontrados.map((e) => [e.id_presupuesto, e]));
  for (const id of unicos) {
    const e = porId.get(id);
    if (!e) throw new ErrorFinanzas(404, 'FIN_PRESUPUESTO_NO_ENCONTRADO', `Presupuesto ${id} no encontrado en el proyecto.`);
    if (e.estatus !== 'ACTIVO') throw new ErrorFinanzas(422, 'FIN_PRESUPUESTO_INACTIVO', `El presupuesto ${id} no está activo.`);
  }
}

const filaPago = (ctx: Ctx, p: PagoProgramado) => ({
  tenant_id: ctx.tenantId,
  proyecto_id: ctx.proyectoId,
  presupuesto_id: p.presupuesto_id,
  concepto: p.concepto,
  beneficiario: p.beneficiario,
  beneficiario_id: p.beneficiario_id,
  monto_programado: p.monto_programado.toFixed(2),
  fecha_programada: p.fecha_programada,
  estado: 'PENDIENTE',
  metodo_pago: p.metodo_pago,
  banco: p.banco,
  referencia_modulo: p.referencia_modulo,
  referencia_entidad: p.referencia_entidad,
  referencia_id: p.referencia_id,
});

/** Programa un pago. Idempotente por referencia (módulo, entidad, id) cuando viene completa. */
export async function programarPago(ctx: Ctx, p: PagoProgramado) {
  return createTenantContext(ctx, async (tx) => {
    if (p.referencia_modulo && p.referencia_entidad && p.referencia_id) {
      const existente = await tx.programaPagos.findFirst({
        where: { referencia_modulo: p.referencia_modulo, referencia_entidad: p.referencia_entidad, referencia_id: p.referencia_id },
      });
      if (existente) return { pago: existente, idempotente: true };
    }
    await exigirPresupuestos(tx, [p.presupuesto_id]);
    const pago = await tx.programaPagos.create({ data: filaPago(ctx, p) as any });
    return { pago, idempotente: false };
  });
}

/** Lote todo o nada: si un renglón es inválido o su presupuesto no existe, no se programa ninguno. */
export function parsearLote(pagos: unknown): PagoProgramado[] {
  if (!Array.isArray(pagos) || pagos.length === 0 || pagos.length > MAX_LOTE) {
    throw new ErrorFinanzas(400, 'FIN_INVALID_PAYLOAD', `Se requiere un arreglo de entre 1 y ${MAX_LOTE} pagos.`);
  }
  return pagos.map((p, i) => parsearPagoProgramado(p, `pagos[${i}].`));
}

export async function programarLote(ctx: Ctx, pagos: PagoProgramado[]) {
  return createTenantContext(ctx, async (tx) => {
    await exigirPresupuestos(tx, pagos.map((p) => p.presupuesto_id));
    return tx.programaPagos.createMany({ data: pagos.map((p) => filaPago(ctx, p)) as any });
  });
}

// ─── Ejecución ────────────────────────────────────────────────────────────────

export interface EjecucionPago {
  cuenta_id: string;
  referencia_bancaria: string | null;
  metodo_pago: string | null;
  banco: string | null;
}

export function parsearEjecucion(b: any): EjecucionPago {
  const p = b ?? {};
  if (!esUuid(p.cuenta_id)) {
    throw new ErrorFinanzas(400, 'FIN_CUENTA_REQUERIDA', 'cuenta_id (UUID de la cuenta bancaria de la que sale el pago) es obligatorio.');
  }
  return {
    cuenta_id: String(p.cuenta_id).toLowerCase(),
    referencia_bancaria: opcional(p.referencia_bancaria, 100),
    metodo_pago: opcional(p.metodo_pago, 50),
    banco: opcional(p.banco, 100),
  };
}

interface FilaPagoBloqueada {
  id_pago: string;
  presupuesto_id: string;
  monto_programado: Dec;
  estado: string;
}

/**
 * Ejecuta un pago programado. `limiteAprobacion` se evalúa con el monto real del pago, antes de mover dinero.
 * Devuelve el pago actualizado y la división presupuestal aplicada.
 */
export async function ejecutarPago(ctx: Ctx, idPago: string, e: EjecucionPago, limiteAprobacion: number) {
  return createTenantContext(ctx, async (tx) => {
    const filas = await tx.$queryRaw<FilaPagoBloqueada[]>`
      SELECT "id_pago"::text, "presupuesto_id"::text, "monto_programado", "estado"
        FROM "programa_pagos" WHERE "id_pago" = ${idPago}::uuid FOR UPDATE`;
    const fila = filas[0];
    if (!fila) throw new ErrorFinanzas(404, 'FIN_PAGO_NO_ENCONTRADO', 'Pago no encontrado.');
    if (fila.estado === 'PAGADO') throw new ErrorFinanzas(409, 'FIN_PAGO_YA_PAGADO', 'Este pago ya fue procesado.');
    if (fila.estado === 'CANCELADO') throw new ErrorFinanzas(409, 'FIN_PAGO_CANCELADO', 'No se puede pagar un registro cancelado.');

    const monto = new Decimal(String(fila.monto_programado));
    if (monto.gt(limiteAprobacion)) {
      throw new ErrorFinanzas(403, 'FIN_LIMIT_EXCEEDED',
        `LIMITE_EXCEDIDO: El monto $${monto.toNumber().toLocaleString()} excede tu límite ($${limiteAprobacion.toLocaleString()}).`);
    }

    const pago = await tx.programaPagos.findUniqueOrThrow({ where: { id_pago: idPago } });

    // Presupuesto bloqueado: comprometido, ejercido y disponible no cambian bajo nosotros.
    const pres = (await tx.$queryRaw<Array<{ monto_comprometido: unknown; monto_disponible: unknown }>>`
      SELECT "monto_comprometido", "monto_disponible" FROM "presupuestos_asignados"
       WHERE "id_presupuesto" = ${fila.presupuesto_id}::uuid FOR UPDATE`)[0];
    if (!pres) throw new ErrorFinanzas(404, 'FIN_PRESUPUESTO_NO_ENCONTRADO', 'El presupuesto del pago no existe en el proyecto.');

    let restanteCompromiso = new Decimal(0);
    if (pago.referencia_modulo && pago.referencia_entidad && pago.referencia_id) {
      const ref = { referencia_modulo: pago.referencia_modulo, referencia_entidad: pago.referencia_entidad, referencia_id: pago.referencia_id };
      const comprometido = await tx.movimientoPresupuestal.aggregate({
        where: { ...ref, presupuesto_id: fila.presupuesto_id, tipo: 'COMPROMISO' as any }, _sum: { monto: true },
      });
      const consumido = await tx.movimientoPresupuestal.aggregate({
        where: { ...ref, presupuesto_id: fila.presupuesto_id, tipo: { in: ['DEVENGADO', 'LIBERACION'] } as any }, _sum: { monto: true },
      });
      restanteCompromiso = Decimal.max(
        new Decimal(String(comprometido._sum.monto ?? 0)).minus(String(consumido._sum.monto ?? 0)), new Decimal(0));
    }
    // Nunca devengar más de lo que el presupuesto tiene comprometido en total.
    const devengar = Decimal.min(monto, restanteCompromiso, new Decimal(String(pres.monto_comprometido)));
    const ejercerDirecto = monto.minus(devengar);
    const disponible = new Decimal(String(pres.monto_disponible));
    if (ejercerDirecto.gt(disponible)) {
      throw new ErrorFinanzas(422, 'FIN_INSUFFICIENT_BUDGET',
        `El pago requiere $${ejercerDirecto.toFixed(2)} sin compromiso previo y el disponible es $${disponible.toFixed(2)}.`);
    }

    await descontarCuentaBancaria(tx, ctx.tenantId, ctx.proyectoId, e.cuenta_id, monto);

    const actualizado = await tx.programaPagos.update({
      where: { id_pago: idPago },
      data: {
        estado: 'PAGADO',
        monto_pagado: monto.toFixed(2),
        fecha_pago_real: new Date(),
        referencia_bancaria: e.referencia_bancaria,
        metodo_pago: e.metodo_pago || pago.metodo_pago,
        banco: e.banco || pago.banco,
      },
    });

    const base = {
      tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, presupuesto_id: fila.presupuesto_id,
      referencia_modulo: pago.referencia_modulo, referencia_entidad: pago.referencia_entidad, referencia_id: pago.referencia_id,
      usuario_id: ctx.userId, notas: `Pago ${idPago} · cuenta ${e.cuenta_id} · ref. bancaria ${e.referencia_bancaria || 'N/A'}`,
    };
    if (devengar.gt(0)) {
      await tx.movimientoPresupuestal.create({ data: { ...base, tipo: 'DEVENGADO', concepto: `Pago procesado: ${pago.concepto}`.slice(0, 500), monto: devengar.toFixed(2) } as any });
      await tx.presupuestoAsignado.update({
        where: { id_presupuesto: fila.presupuesto_id },
        data: { monto_comprometido: { decrement: devengar.toFixed(2) }, monto_ejercido: { increment: devengar.toFixed(2) } },
      });
    }
    if (ejercerDirecto.gt(0)) {
      await tx.movimientoPresupuestal.create({ data: { ...base, tipo: 'EJERCIDO', concepto: `Pago procesado: ${pago.concepto}`.slice(0, 500), monto: ejercerDirecto.toFixed(2) } as any });
      await tx.presupuestoAsignado.update({
        where: { id_presupuesto: fila.presupuesto_id },
        data: { monto_ejercido: { increment: ejercerDirecto.toFixed(2) }, monto_disponible: { decrement: ejercerDirecto.toFixed(2) } },
      });
    }

    return { pago: actualizado, devengado: Number(devengar.toFixed(2)), ejercido_directo: Number(ejercerDirecto.toFixed(2)) };
  });
}

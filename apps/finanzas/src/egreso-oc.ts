/**
 * Egreso contra N órdenes de compra: un solo movimiento bancario (cheque, transferencia, SPEI, efectivo) liquida OCs
 * de N proveedores de cualquier giro, siempre que todas pertenezcan al proyecto del egreso. Punto único de escritura
 * de `pagos_oc` / `detalles_pago_oc` / `ocs_por_pagar`.
 * Change: corregir-egreso-oc-multiproveedor.
 *
 * Garantías (todas dentro de UNA transacción de createTenantContext, con RLS del proyecto del egreso):
 *   1. Idempotencia natural por folio: (tenant, fuente, cuenta|proyecto, tipo_pago, referencia). Mismo folio con el
 *      mismo contenido devuelve el egreso existente; mismo folio con contenido distinto es 409. Respaldo en BD con el
 *      índice único uq_pagos_oc_folio.
 *   2. Lock por OC (el mismo de compromiso-oc.ts, definido en outbox-eventos.ts) y SELECT ... FOR UPDATE sobre ocs_por_pagar, ambos en orden de
 *      oc_id: egresos concurrentes y cancelaciones de la misma OC se serializan sin deadlock; nunca se paga más que
 *      el saldo ni se libera presupuesto ya pagado.
 *   3. Cada OC pertenece al proyecto del egreso; el saldo antes/después lo calcula el servidor; monto en (0, saldo].
 *   4. La fuente se descuenta con UPDATE condicional atómico (saldo >= monto). Una cuenta de proyecto solo paga OCs
 *      de su proyecto; una cuenta de empresa (proyecto_id null) paga cualquier proyecto del tenant.
 *   5. Presupuesto: el monto aplicado pasa de comprometido a ejercido (DEVENGADO) hasta agotar el compromiso de esa
 *      OC; el excedente (OC sin compromiso o pagada por encima de lo comprometido) se registra como EJERCIDO directo.
 * No hay HTTP ni publicación de eventos dentro de la transacción: el llamador publica después del commit.
 */

import { Prisma } from './generated/prisma';
import { createTenantContext } from './db';
import { esUuid } from './compromiso-oc';
import { bloquearOc } from './outbox-eventos';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];
const Decimal = Prisma.Decimal;
type Dec = Prisma.Decimal;

export const FUENTES_EGRESO = ['ANTICIPO', 'CUENTA_BANCARIA'] as const;
export const TIPOS_EGRESO = ['TRANSFERENCIA', 'SPEI', 'CHEQUE', 'EFECTIVO'] as const;
const MAX_DETALLES = 200;

export type FuenteEgreso = (typeof FUENTES_EGRESO)[number];
export type TipoEgreso = (typeof TIPOS_EGRESO)[number];

export interface EgresoOcEntrada {
  proyecto_id: string;
  fuente: FuenteEgreso;
  cuenta_id: string | null;
  tipo_pago: TipoEgreso;
  referencia: string;
  concepto: string;
  fecha_pago: Date;
  detalles: Array<{ oc_id: string; monto_aplicado: Dec }>;
  monto_total: Dec;
}

export interface DetalleEgreso {
  oc_id: string;
  oc_codigo: string;
  proveedor_id: string;
  proveedor_nombre: string;
  concepto_id: string | null;
  monto_aplicado: number;
  saldo_oc_antes: number;
  saldo_oc_despues: number;
}

export interface ResultadoEgreso {
  idempotente: boolean;
  pago_id: string;
  proyecto_id: string;
  fuente: FuenteEgreso;
  cuenta_id: string | null;
  tipo_pago: TipoEgreso;
  referencia: string;
  fecha_pago: string;
  monto_total: number;
  detalles: DetalleEgreso[];
}

export class ErrorEgreso extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

function montoValido(valor: unknown, campo: string): Dec {
  if (valor === null || valor === undefined || valor === '') {
    throw new ErrorEgreso(400, 'FIN_MONTO_INVALIDO', `${campo} es obligatorio.`);
  }
  let d: Dec;
  try {
    d = new Decimal(String(valor));
  } catch {
    throw new ErrorEgreso(400, 'FIN_MONTO_INVALIDO', `${campo} no es un número válido.`);
  }
  if (!d.isFinite() || d.lte(0)) throw new ErrorEgreso(400, 'FIN_MONTO_INVALIDO', `${campo} debe ser mayor a 0.`);
  if (d.decimalPlaces() > 2) throw new ErrorEgreso(400, 'FIN_MONTO_INVALIDO', `${campo} admite máximo 2 decimales.`);
  return d;
}

/** Valida y normaliza el body. Nunca acepta saldos, proveedor ni código de OC del cliente: los resuelve el servidor. */
export function parsearEgresoOc(body: any): EgresoOcEntrada {
  const b = body ?? {};
  if (!esUuid(b.proyecto_id)) throw new ErrorEgreso(400, 'FIN_PROYECTO_INVALIDO', 'proyecto_id debe ser un UUID válido.');
  if (!FUENTES_EGRESO.includes(b.fuente)) {
    throw new ErrorEgreso(400, 'FIN_FUENTE_INVALIDA', 'fuente debe ser ANTICIPO o CUENTA_BANCARIA.');
  }
  if (b.fuente === 'CUENTA_BANCARIA' && !esUuid(b.cuenta_id)) {
    throw new ErrorEgreso(400, 'FIN_CUENTA_REQUERIDA', 'cuenta_id (UUID) es obligatorio con fuente CUENTA_BANCARIA.');
  }
  if (!TIPOS_EGRESO.includes(b.tipo_pago)) {
    throw new ErrorEgreso(400, 'FIN_TIPO_PAGO_INVALIDO', `tipo_pago debe ser ${TIPOS_EGRESO.join(', ')}.`);
  }
  const referencia = typeof b.referencia === 'string' ? b.referencia.trim() : '';
  if (!referencia || referencia.length > 100) {
    throw new ErrorEgreso(400, 'FIN_REFERENCIA_INVALIDA', 'referencia (folio de cheque o transferencia) es obligatoria, máximo 100 caracteres.');
  }
  const concepto = typeof b.concepto === 'string' ? b.concepto.trim() : '';
  if (!concepto || concepto.length > 500) {
    throw new ErrorEgreso(400, 'FIN_CONCEPTO_INVALIDO', 'concepto es obligatorio, máximo 500 caracteres.');
  }
  const fecha = new Date(b.fecha_pago);
  if (!b.fecha_pago || Number.isNaN(fecha.getTime())) {
    throw new ErrorEgreso(400, 'FIN_FECHA_INVALIDA', 'fecha_pago debe ser una fecha ISO válida.');
  }
  if (!Array.isArray(b.detalles) || b.detalles.length === 0 || b.detalles.length > MAX_DETALLES) {
    throw new ErrorEgreso(400, 'FIN_DETALLES_INVALIDOS', `detalles debe tener entre 1 y ${MAX_DETALLES} OCs.`);
  }
  const vistos = new Set<string>();
  const detalles = b.detalles.map((d: any, i: number) => {
    if (!esUuid(d?.oc_id)) throw new ErrorEgreso(400, 'FIN_OC_INVALIDA', `detalles[${i}].oc_id debe ser un UUID válido.`);
    const ocId = d.oc_id.toLowerCase();
    if (vistos.has(ocId)) throw new ErrorEgreso(400, 'FIN_OC_DUPLICADA', `La OC ${ocId} aparece más de una vez en el egreso.`);
    vistos.add(ocId);
    return { oc_id: ocId, monto_aplicado: montoValido(d.monto_aplicado, `detalles[${i}].monto_aplicado`) };
  });
  const monto_total = detalles.reduce((acc: Dec, d: { monto_aplicado: Dec }) => acc.plus(d.monto_aplicado), new Decimal(0));
  return {
    proyecto_id: b.proyecto_id.toLowerCase(),
    fuente: b.fuente,
    cuenta_id: b.fuente === 'CUENTA_BANCARIA' ? b.cuenta_id.toLowerCase() : null,
    tipo_pago: b.tipo_pago,
    referencia,
    concepto,
    fecha_pago: fecha,
    detalles,
    monto_total,
  };
}

interface FilaOc {
  oc_id: string;
  proyecto_id: string;
  oc_codigo: string;
  proveedor_id: string;
  proveedor_nombre: string;
  concepto_id: string | null;
  total: Dec;
  pagado: Dec;
  estado: string;
}

const num = (d: Dec | number | string) => Number(new Decimal(String(d)).toFixed(2));

async function bloquearFolio(tx: Tx, tenantId: string, e: EgresoOcEntrada): Promise<void> {
  const clave = `egreso-oc:${tenantId}:${e.fuente}:${e.cuenta_id ?? e.proyecto_id}:${e.tipo_pago}:${e.referencia}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}::text, 0))`;
}

function aResultado(pago: any, idempotente: boolean): ResultadoEgreso {
  return {
    idempotente,
    pago_id: pago.id_pago,
    proyecto_id: pago.proyecto_id,
    fuente: pago.fuente,
    cuenta_id: pago.cuenta_id ?? null,
    tipo_pago: pago.tipo_pago,
    referencia: pago.referencia,
    fecha_pago: new Date(pago.fecha_pago).toISOString(),
    monto_total: num(pago.monto_total),
    detalles: (pago.detalles as any[]).map((d) => ({
      oc_id: d.oc_id,
      oc_codigo: d.oc_codigo,
      proveedor_id: d.proveedor_id,
      proveedor_nombre: d.proveedor_nombre,
      concepto_id: d.concepto_id ?? null,
      monto_aplicado: num(d.monto_aplicado),
      saldo_oc_antes: num(d.saldo_oc_antes),
      saldo_oc_despues: num(d.saldo_oc_despues),
    })),
  };
}

/** Mismo folio, mismo contenido: reintento legítimo. Mismo folio, contenido distinto: error de captura. */
function mismoContenido(pago: any, e: EgresoOcEntrada): boolean {
  if (!new Decimal(String(pago.monto_total)).eq(e.monto_total)) return false;
  const previos = new Map<string, string>((pago.detalles as any[]).map((d) => [d.oc_id, new Decimal(String(d.monto_aplicado)).toFixed(2)]));
  if (previos.size !== e.detalles.length) return false;
  return e.detalles.every((d) => previos.get(d.oc_id) === d.monto_aplicado.toFixed(2));
}

async function descontarFuente(tx: Tx, tenantId: string, e: EgresoOcEntrada): Promise<void> {
  const total = e.monto_total.toFixed(2);
  if (e.fuente === 'CUENTA_BANCARIA') {
    const n = await tx.$executeRaw`
      UPDATE "cuentas_bancarias"
         SET "saldo" = "saldo" - ${total}::numeric, "updated_at" = now()
       WHERE "id_cuenta" = ${e.cuenta_id}::uuid
         AND "tenant_id" = ${tenantId}::uuid
         AND "activa" = true
         AND ("proyecto_id" IS NULL OR "proyecto_id" = ${e.proyecto_id}::uuid)
         AND "saldo" >= ${total}::numeric`;
    if (n === 1) return;
    const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: e.cuenta_id!, tenant_id: tenantId } });
    if (!cuenta || !cuenta.activa) throw new ErrorEgreso(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada o inactiva.');
    if (cuenta.proyecto_id && cuenta.proyecto_id !== e.proyecto_id) {
      throw new ErrorEgreso(422, 'FIN_CUENTA_OTRO_PROYECTO', 'La cuenta pertenece a otro proyecto; no puede pagar OCs de este proyecto.');
    }
    throw new ErrorEgreso(422, 'FIN_SALDO_INSUFICIENTE',
      `Saldo insuficiente. Disponible: $${num(cuenta.saldo).toFixed(2)}, requerido: $${total}.`);
  }
  const n = await tx.$executeRaw`
    UPDATE "proyectos_finanzas"
       SET "anticipo_usado" = "anticipo_usado" + ${total}::numeric, "updated_at" = now()
     WHERE "tenant_id" = ${tenantId}::uuid
       AND "proyecto_id" = ${e.proyecto_id}::uuid
       AND "anticipo_total" - "anticipo_usado" >= ${total}::numeric`;
  if (n === 1) return;
  const pf = await tx.proyectoFinanzas.findFirst({ where: { tenant_id: tenantId, proyecto_id: e.proyecto_id } });
  const disponible = pf ? new Decimal(String(pf.anticipo_total)).minus(String(pf.anticipo_usado)) : new Decimal(0);
  throw new ErrorEgreso(422, 'FIN_ANTICIPO_INSUFICIENTE',
    `Anticipo insuficiente. Disponible: $${disponible.toFixed(2)}, requerido: $${total}.`);
}

/** Pasa el monto de comprometido a ejercido contra el COMPROMISO de la OC; el excedente es EJERCIDO directo. */
async function ejercerPresupuesto(
  tx: Tx,
  ctx: { tenantId: string; userId: string },
  e: EgresoOcEntrada,
  pagoId: string,
  oc: FilaOc,
  monto: Dec,
): Promise<void> {
  const compromiso = await tx.movimientoPresupuestal.findFirst({
    where: { referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id: oc.oc_id, tipo: 'COMPROMISO' },
  });
  if (!compromiso) return; // OC sin compromiso presupuestal (p. ej. emitida antes de sincronizar partidas): solo tesorería.

  const liberado = await tx.movimientoPresupuestal.findFirst({
    where: { referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id: oc.oc_id, tipo: 'LIBERACION' },
    select: { id_movimiento: true },
  });
  const devengadoPrevio = await tx.movimientoPresupuestal.aggregate({
    where: { referencia_modulo: 'finanzas', referencia_entidad: 'OrdenCompra', referencia_id: oc.oc_id, tipo: 'DEVENGADO' },
    _sum: { monto: true },
  });
  const restante = liberado
    ? new Decimal(0)
    : Decimal.max(new Decimal(String(compromiso.monto)).minus(String(devengadoPrevio._sum.monto ?? 0)), new Decimal(0));
  const devengar = Decimal.min(monto, restante);
  const excedente = monto.minus(devengar);
  const base = {
    tenant_id: ctx.tenantId,
    proyecto_id: e.proyecto_id,
    presupuesto_id: compromiso.presupuesto_id,
    referencia_modulo: 'finanzas',
    referencia_entidad: 'OrdenCompra',
    referencia_id: oc.oc_id,
    referencia_codigo: oc.oc_codigo,
    usuario_id: ctx.userId,
    notas: `Egreso ${pagoId} (${e.tipo_pago} ${e.referencia})`,
  };

  if (devengar.gt(0)) {
    await tx.movimientoPresupuestal.create({
      data: { ...base, tipo: 'DEVENGADO', concepto: `Pago OC ${oc.oc_codigo} a ${oc.proveedor_nombre}`.slice(0, 500), monto: devengar.toFixed(2) },
    });
    await tx.presupuestoAsignado.update({
      where: { id_presupuesto: compromiso.presupuesto_id },
      data: { monto_comprometido: { decrement: devengar.toFixed(2) }, monto_ejercido: { increment: devengar.toFixed(2) } },
    });
  }
  if (excedente.gt(0)) {
    await tx.movimientoPresupuestal.create({
      data: { ...base, tipo: 'EJERCIDO', concepto: `Pago OC ${oc.oc_codigo} por encima de lo comprometido`.slice(0, 500), monto: excedente.toFixed(2) },
    });
    await tx.presupuestoAsignado.update({
      where: { id_presupuesto: compromiso.presupuesto_id },
      data: { monto_ejercido: { increment: excedente.toFixed(2) }, monto_disponible: { decrement: excedente.toFixed(2) } },
    });
  }
}

export async function registrarEgresoOc(
  ctx: { tenantId: string; userId: string },
  e: EgresoOcEntrada,
): Promise<ResultadoEgreso> {
  return createTenantContext({ tenantId: ctx.tenantId, proyectoId: e.proyecto_id, userId: ctx.userId }, async (tx) => {
    await bloquearFolio(tx, ctx.tenantId, e);

    const previo = await tx.pagoOC.findFirst({
      where: {
        tenant_id: ctx.tenantId,
        proyecto_id: e.proyecto_id,
        fuente: e.fuente,
        cuenta_id: e.cuenta_id,
        tipo_pago: e.tipo_pago,
        referencia: e.referencia,
      },
      include: { detalles: true },
    });
    if (previo) {
      if (!mismoContenido(previo, e)) {
        throw new ErrorEgreso(409, 'FIN_FOLIO_DUPLICADO',
          `El folio ${e.referencia} ya está registrado con otro contenido (egreso ${previo.id_pago}).`);
      }
      return aResultado(previo, true);
    }

    // Mismo lock por OC que compromiso/cancelación (orden fijo: sin deadlock entre egresos con OCs compartidas).
    const ocIds = e.detalles.map((d) => d.oc_id).sort();
    for (const ocId of ocIds) await bloquearOc(tx, ctx.tenantId, ocId);
    const filas = await tx.$queryRaw<FilaOc[]>`
      SELECT "oc_id"::text, "proyecto_id"::text, "oc_codigo", "proveedor_id"::text, "proveedor_nombre",
             "concepto_id"::text, "total", "pagado", "estado"
        FROM "ocs_por_pagar"
       WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "oc_id" = ANY(${ocIds}::uuid[])
       ORDER BY "oc_id"
         FOR UPDATE`;
    const porId = new Map(filas.map((f) => [f.oc_id, f]));

    const aplicaciones = e.detalles.map((d) => {
      const oc = porId.get(d.oc_id);
      if (!oc) throw new ErrorEgreso(422, 'FIN_OC_NO_POR_PAGAR', `La OC ${d.oc_id} no está registrada como por pagar en Finanzas.`);
      if (oc.proyecto_id !== e.proyecto_id) {
        throw new ErrorEgreso(422, 'FIN_OC_OTRO_PROYECTO', `La OC ${oc.oc_codigo} pertenece a otro proyecto; un egreso solo liquida OCs de un proyecto.`);
      }
      if (oc.estado === 'CANCELADA') throw new ErrorEgreso(409, 'FIN_OC_CANCELADA', `La OC ${oc.oc_codigo} está cancelada.`);
      const saldo = new Decimal(String(oc.total)).minus(String(oc.pagado));
      if (oc.estado === 'PAGADA' || saldo.lte(0)) throw new ErrorEgreso(409, 'FIN_OC_PAGADA', `La OC ${oc.oc_codigo} ya está pagada.`);
      if (d.monto_aplicado.gt(saldo)) {
        throw new ErrorEgreso(422, 'FIN_MONTO_EXCEDE_SALDO',
          `El monto para la OC ${oc.oc_codigo} ($${d.monto_aplicado.toFixed(2)}) excede su saldo ($${saldo.toFixed(2)}).`);
      }
      return { oc, monto: d.monto_aplicado, saldoAntes: saldo, saldoDespues: saldo.minus(d.monto_aplicado) };
    });

    await descontarFuente(tx, ctx.tenantId, e);

    const pago = await tx.pagoOC.create({
      data: {
        tenant_id: ctx.tenantId,
        proyecto_id: e.proyecto_id,
        fuente: e.fuente,
        cuenta_id: e.cuenta_id,
        tipo_pago: e.tipo_pago,
        referencia: e.referencia,
        concepto: e.concepto,
        fecha_pago: e.fecha_pago,
        monto_total: e.monto_total.toFixed(2),
        moneda: 'MXN',
        usuario_id: ctx.userId,
        detalles: {
          create: aplicaciones.map((a) => ({
            oc_id: a.oc.oc_id,
            oc_codigo: a.oc.oc_codigo,
            proveedor_id: a.oc.proveedor_id,
            proveedor_nombre: a.oc.proveedor_nombre,
            monto_aplicado: a.monto.toFixed(2),
            saldo_oc_antes: a.saldoAntes.toFixed(2),
            saldo_oc_despues: a.saldoDespues.toFixed(2),
            concepto_id: a.oc.concepto_id,
            concepto_clave: null,
          })),
        },
      },
      include: { detalles: true },
    });

    for (const a of aplicaciones) {
      await tx.$executeRaw`
        UPDATE "ocs_por_pagar"
           SET "pagado" = "pagado" + ${a.monto.toFixed(2)}::numeric,
               "estado" = CASE WHEN "total" - ("pagado" + ${a.monto.toFixed(2)}::numeric) <= 0 THEN 'PAGADA' ELSE 'PAGO_PARCIAL' END,
               "updated_at" = now()
         WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "oc_id" = ${a.oc.oc_id}::uuid`;
      await ejercerPresupuesto(tx, ctx, e, pago.id_pago, a.oc, a.monto);
    }

    return aResultado(pago, false);
  });
}

/** Proyección: alta de OC por pagar desde compras.oc_creada. Idempotente; nunca pisa pagos ya aplicados. */
export async function registrarOcPorPagar(
  ctx: { tenantId: string; proyectoId: string; userId: string },
  oc: { oc_id: string; codigo: string; total: number; proveedor_id: string; proveedor_nombre?: string | null; concepto_id?: string | null },
): Promise<void> {
  if (!esUuid(oc.oc_id) || !esUuid(oc.proveedor_id) || !esUuid(ctx.proyectoId)) return;
  const total = new Decimal(String(oc.total));
  if (!total.isFinite() || total.lte(0)) return;
  await createTenantContext(ctx, async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "ocs_por_pagar"
        ("tenant_id", "oc_id", "proyecto_id", "oc_codigo", "proveedor_id", "proveedor_nombre", "concepto_id", "total")
      VALUES
        (${ctx.tenantId}::uuid, ${oc.oc_id}::uuid, ${ctx.proyectoId}::uuid, ${oc.codigo}, ${oc.proveedor_id}::uuid,
         ${(oc.proveedor_nombre ?? '').slice(0, 255)}, ${esUuid(oc.concepto_id) ? oc.concepto_id : null}::uuid, ${total.toFixed(2)}::numeric)
      ON CONFLICT ("tenant_id", "oc_id") DO NOTHING`;
  });
}

/** Proyección: compras.oc_cancelada. Una OC con pagos aplicados conserva su historial y queda bloqueada para nuevos pagos. */
export async function cancelarOcPorPagar(ctx: { tenantId: string; proyectoId: string; userId: string }, ocId: string): Promise<void> {
  if (!esUuid(ocId)) return;
  await createTenantContext(ctx, async (tx) => {
    await tx.$executeRaw`
      UPDATE "ocs_por_pagar" SET "estado" = 'CANCELADA', "updated_at" = now()
       WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "oc_id" = ${ocId}::uuid AND "estado" <> 'PAGADA'`;
  });
}

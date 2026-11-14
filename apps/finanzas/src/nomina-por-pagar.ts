/**
 * Nómina pagada por Finanzas. Las prenóminas autorizadas (personal.nomina_autorizada) se proyectan en
 * `nominas_por_pagar`; Finanzas las paga desde una cuenta bancaria y publica finanzas.nomina_pagada, que Personal
 * consume para marcar la prenómina PAGADA. Mismo patrón que las OCs por pagar. openspec: nomina-pagada-por-finanzas.
 *
 * Garantías del pago (UNA transacción de createTenantContext, con RLS y filtro explícito por proyecto):
 *   1. SELECT ... FOR UPDATE de la nómina por pagar: dos pagos simultáneos no descuentan dos veces.
 *   2. Idempotente: repetir con la misma cuenta y referencia devuelve el pago; otra cuenta o referencia es 409.
 *   3. Descuento atómico de la cuenta (tesoreria.ts).
 *   4. Presupuesto MANO_OBRA: el monto pasa de comprometido a ejercido contra el COMPROMISO de la autorización. Sin
 *      compromiso, se ejerce del disponible si alcanza. La nómina es obligación laboral: el presupuesto no bloquea el
 *      pago; si no alcanza, se registra sin efecto presupuestal y se reporta (`sin_presupuesto`).
 */

import { createTenantContext } from './db';
import { esUuid } from './compromiso-oc';
import { Decimal, parsearMontoPositivo, type Dec } from './montos';
import { ErrorFinanzas } from './errores';
import { descontarCuentaBancaria } from './tesoreria';

type Ctx = { tenantId: string; proyectoId: string; userId: string };
const num = (d: Dec | number | string) => Number(new Decimal(String(d)).toFixed(2));

export interface AltaNomina {
  prenomina_id: string;
  codigo: string;
  periodo_inicio: Date | null;
  periodo_fin: Date | null;
  total_neto: Dec;
  total_empleados: number;
}

/** Valida el payload de personal.nomina_autorizada. Devuelve null si no es utilizable. */
export function parsearNominaAutorizada(payload: any): AltaNomina | null {
  const p = payload ?? {};
  const m = parsearMontoPositivo(p.total_neto, 'total_neto');
  if (!esUuid(p.prenomina_id) || !p.codigo || m.motivo !== undefined) return null;
  const fecha = (v: unknown) => {
    if (v === undefined || v === null) return null;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d;
  };
  return {
    prenomina_id: p.prenomina_id.toLowerCase(),
    codigo: String(p.codigo).slice(0, 60),
    periodo_inicio: fecha(p.periodo_inicio),
    periodo_fin: fecha(p.periodo_fin),
    total_neto: m.monto,
    total_empleados: Number.isInteger(Number(p.total_empleados)) ? Number(p.total_empleados) : 0,
  };
}

/** Alta idempotente de la nómina por pagar (ON CONFLICT DO NOTHING). */
export async function registrarNominaPorPagar(ctx: Ctx, n: AltaNomina): Promise<boolean> {
  return createTenantContext(ctx, async (tx) => {
    const filas = await tx.$executeRaw`
      INSERT INTO "nominas_por_pagar"
        ("tenant_id", "prenomina_id", "proyecto_id", "codigo", "periodo_inicio", "periodo_fin", "total_neto", "total_empleados", "updated_at")
      VALUES (${ctx.tenantId}::uuid, ${n.prenomina_id}::uuid, ${ctx.proyectoId}::uuid, ${n.codigo}, ${n.periodo_inicio}, ${n.periodo_fin},
              ${n.total_neto.toFixed(2)}::numeric, ${n.total_empleados}, now())
      ON CONFLICT ("tenant_id", "prenomina_id") DO NOTHING`;
    return filas === 1;
  });
}

export interface PagoNominaEntrada {
  cuenta_id: string;
  referencia: string;
  fecha_pago: Date;
}

export function parsearPagoNomina(body: any): PagoNominaEntrada {
  const b = body ?? {};
  if (!esUuid(b.cuenta_id)) throw new ErrorFinanzas(400, 'FIN_CUENTA_REQUERIDA', 'cuenta_id (UUID) es obligatorio: indica la cuenta de la que sale la nómina.');
  const referencia = typeof b.referencia === 'string' ? b.referencia.trim() : '';
  if (!referencia || referencia.length > 100) throw new ErrorFinanzas(400, 'FIN_REFERENCIA_INVALIDA', 'referencia es obligatoria (máximo 100 caracteres).');
  const fecha = b.fecha_pago === undefined ? new Date() : new Date(b.fecha_pago);
  if (Number.isNaN(fecha.getTime())) throw new ErrorFinanzas(400, 'FIN_FECHA_INVALIDA', 'fecha_pago no es una fecha válida.');
  return { cuenta_id: b.cuenta_id.toLowerCase(), referencia, fecha_pago: fecha };
}

export interface ResultadoPagoNomina {
  idempotente: boolean;
  prenomina_id: string;
  proyecto_id: string;
  codigo: string;
  total_neto: number;
  total_empleados: number;
  periodo_inicio: string | null;
  periodo_fin: string | null;
  cuenta_id: string;
  referencia: string;
  fecha_pago: string;
  efecto_presupuestal: 'devengado' | 'ejercido_directo' | 'sin_presupuesto';
}

function aResultado(f: any, idempotente: boolean, efecto: ResultadoPagoNomina['efecto_presupuestal']): ResultadoPagoNomina {
  return {
    idempotente,
    prenomina_id: f.prenomina_id,
    proyecto_id: f.proyecto_id,
    codigo: f.codigo,
    total_neto: num(f.total_neto),
    total_empleados: Number(f.total_empleados),
    periodo_inicio: f.periodo_inicio ? new Date(f.periodo_inicio).toISOString() : null,
    periodo_fin: f.periodo_fin ? new Date(f.periodo_fin).toISOString() : null,
    cuenta_id: f.cuenta_id,
    referencia: f.referencia,
    fecha_pago: new Date(f.fecha_pago).toISOString(),
    efecto_presupuestal: efecto,
  };
}

export async function pagarNomina(ctx: Ctx, prenominaId: string, e: PagoNominaEntrada, limiteAprobacion: number): Promise<ResultadoPagoNomina> {
  if (!esUuid(prenominaId)) throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', 'El id de la prenómina debe ser un UUID válido.');
  return createTenantContext(ctx, async (tx) => {
    const filas = await tx.$queryRaw<any[]>`
      SELECT * FROM "nominas_por_pagar"
       WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "prenomina_id" = ${prenominaId}::uuid AND "proyecto_id" = ${ctx.proyectoId}::uuid
       FOR UPDATE`;
    const f = filas[0];
    if (!f) throw new ErrorFinanzas(404, 'FIN_NOMINA_NO_ENCONTRADA', 'Nómina por pagar no encontrada en el proyecto activo.');
    if (f.estado === 'PAGADA') {
      if (f.cuenta_id === e.cuenta_id && f.referencia === e.referencia) return aResultado(f, true, f.efecto_presupuestal);
      throw new ErrorFinanzas(409, 'FIN_NOMINA_YA_PAGADA', `La nómina ${f.codigo} ya se pagó con la referencia ${f.referencia}.`);
    }
    if (f.estado !== 'POR_PAGAR') throw new ErrorFinanzas(409, 'FIN_NOMINA_CANCELADA', `La nómina ${f.codigo} está ${f.estado}.`);

    const monto = new Decimal(String(f.total_neto));
    if (monto.gt(limiteAprobacion)) {
      throw new ErrorFinanzas(403, 'FIN_LIMIT_EXCEEDED',
        `El monto $${monto.toFixed(2)} excede tu límite de autoridad financiera ($${Number(limiteAprobacion).toLocaleString()}).`);
    }

    await descontarCuentaBancaria(tx, ctx.tenantId, ctx.proyectoId, e.cuenta_id, monto,
      { origen: 'NOMINA', origenId: prenominaId, referencia: e.referencia, usuarioId: ctx.userId });
    const efecto = await aplicarPresupuestoNomina(tx, ctx, f, monto);

    const [pagada] = await tx.$queryRaw<any[]>`
      UPDATE "nominas_por_pagar"
         SET "estado" = 'PAGADA', "cuenta_id" = ${e.cuenta_id}::uuid, "referencia" = ${e.referencia}, "fecha_pago" = ${e.fecha_pago},
             "pagado_por" = ${ctx.userId}::uuid, "efecto_presupuestal" = ${efecto}, "updated_at" = now()
       WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "prenomina_id" = ${prenominaId}::uuid
       RETURNING *`;
    return aResultado(pagada, false, efecto);
  });
}

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];

async function aplicarPresupuestoNomina(tx: Tx, ctx: Ctx, f: any, monto: Dec): Promise<ResultadoPagoNomina['efecto_presupuestal']> {
  const ref = { referencia_modulo: 'personal', referencia_entidad: 'PreNomina', referencia_id: f.prenomina_id };
  const ya = await tx.movimientoPresupuestal.findFirst({ where: { tenant_id: ctx.tenantId, ...ref, tipo: 'EJERCIDO' } });
  if (ya) return 'devengado';

  const compromiso = await tx.movimientoPresupuestal.findFirst({ where: { tenant_id: ctx.tenantId, ...ref, tipo: 'COMPROMISO' } });
  const base = {
    tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, tipo: 'EJERCIDO', concepto: `Pago nómina ${f.codigo}`,
    monto: monto.toFixed(2), ...ref, referencia_codigo: f.codigo, usuario_id: ctx.userId,
  };

  if (compromiso) {
    const n = await tx.$executeRaw`
      UPDATE "presupuestos_asignados"
         SET "monto_comprometido" = "monto_comprometido" - ${monto.toFixed(2)}::numeric,
             "monto_ejercido" = "monto_ejercido" + ${monto.toFixed(2)}::numeric, "updated_at" = now()
       WHERE "id_presupuesto" = ${compromiso.presupuesto_id}::uuid AND "monto_comprometido" >= ${monto.toFixed(2)}::numeric`;
    if (n === 1) {
      await tx.movimientoPresupuestal.create({
        data: { ...base, presupuesto_id: compromiso.presupuesto_id, notas: 'Devengado al pagar la nómina en Finanzas (nomina-pagada-por-finanzas).' } as any,
      });
      return 'devengado';
    }
  }

  const pres = await tx.presupuestoAsignado.findFirst({
    where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, capitulo: 'MANO_OBRA', concepto_id: null, estatus: 'ACTIVO' },
    select: { id_presupuesto: true },
  });
  if (pres) {
    const n = await tx.$executeRaw`
      UPDATE "presupuestos_asignados"
         SET "monto_disponible" = "monto_disponible" - ${monto.toFixed(2)}::numeric,
             "monto_ejercido" = "monto_ejercido" + ${monto.toFixed(2)}::numeric, "updated_at" = now()
       WHERE "id_presupuesto" = ${pres.id_presupuesto}::uuid AND "monto_disponible" >= ${monto.toFixed(2)}::numeric`;
    if (n === 1) {
      await tx.movimientoPresupuestal.create({
        data: { ...base, presupuesto_id: pres.id_presupuesto, notas: 'Ejercido directo al pagar la nómina sin compromiso previo.' } as any,
      });
      return 'ejercido_directo';
    }
  }
  console.warn(JSON.stringify({
    action: 'finanzas.nomina.pago.sin_presupuesto', tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId,
    prenomina_id: f.prenomina_id, monto: monto.toFixed(2),
  }));
  return 'sin_presupuesto';
}

export async function listarNominasPorPagar(ctx: Ctx, estado: string | undefined) {
  if (estado !== undefined && !['POR_PAGAR', 'PAGADA', 'CANCELADA'].includes(estado)) {
    throw new ErrorFinanzas(400, 'FIN_ESTADO_INVALIDO', 'estado debe ser POR_PAGAR, PAGADA o CANCELADA.');
  }
  return createTenantContext(ctx, async (tx) => {
    const filas = await tx.$queryRaw<any[]>`
      SELECT "prenomina_id", "proyecto_id", "codigo", "periodo_inicio", "periodo_fin", "total_neto"::float8 AS "total_neto",
             "total_empleados", "estado", "cuenta_id", "referencia", "fecha_pago", "efecto_presupuestal"
        FROM "nominas_por_pagar"
       WHERE "tenant_id" = ${ctx.tenantId}::uuid
         AND (${ctx.proyectoId || null}::uuid IS NULL OR "proyecto_id" = ${ctx.proyectoId || null}::uuid)
         AND "estado" = ${estado ?? 'POR_PAGAR'}
       ORDER BY "periodo_inicio" NULLS LAST, "codigo"
       LIMIT 500`;
    return filas;
  });
}

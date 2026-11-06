/**
 * Cuentas por cobrar: una estimación aprobada es dinero que el cliente debe a la constructora, no un egreso.
 * Punto único de escritura de `cuentas_por_cobrar` y `cobros_cxc`. Change: cuentas-por-cobrar-estimaciones (F20).
 *
 * Garantías (todo dentro de UNA transacción de createTenantContext, con RLS del proyecto de la cuenta por cobrar):
 *   1. Alta idempotente por origen: (tenant, origen, origen_id) único; una reentrega del evento no duplica.
 *   2. Cobro idempotente por folio: (tenant, folio) único. Mismo folio con el mismo contenido devuelve el cobro
 *      existente; con contenido distinto es 409. Lock advisory por folio y respaldo con uq_cobros_cxc_folio.
 *   3. SELECT ... FOR UPDATE de la cuenta por cobrar: cobros simultáneos nunca exceden el saldo (CHECK en BD de
 *      respaldo: 0 <= cobrado <= monto).
 *   4. El cobro abona la cuenta bancaria (de empresa o del mismo proyecto) en la misma transacción.
 * Sin HTTP ni eventos dentro de la transacción: el llamador publica finanzas.cobro_registrado después del commit.
 */

import { createTenantContext } from './db';
import { esUuid } from './compromiso-oc';
import { Decimal, parsearMontoPositivo, type Dec } from './montos';
import { ErrorFinanzas } from './errores';
import { abonarCuentaBancaria } from './tesoreria';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];
type Ctx = { tenantId: string; proyectoId: string; userId: string };

export const ORIGENES_CXC = ['ESTIMACION'] as const;
export const ESTADOS_CXC = ['POR_COBRAR', 'COBRO_PARCIAL', 'COBRADA', 'CANCELADA'] as const;
export type OrigenCxc = (typeof ORIGENES_CXC)[number];
export type EstadoCxc = (typeof ESTADOS_CXC)[number];

/** Plazo de cobro por defecto: el mismo que usaba el programa de pagos para estimaciones. */
const DIAS_VENCIMIENTO = 15;
const num = (d: Dec | number | string) => Number(new Decimal(String(d)).toFixed(2));

export interface AltaCxc {
  origen: OrigenCxc;
  origen_id: string;
  codigo: string;
  concepto: string;
  monto: Dec;
  presupuesto_id: string | null;
}

/** Inserta la cuenta por cobrar si no existe. Devuelve el id y si ya existía. */
export async function registrarCuentaPorCobrar(ctx: Ctx, a: AltaCxc): Promise<{ id_cxc: string; idempotente: boolean }> {
  return createTenantContext(ctx, async (tx) => {
    const vence = new Date(Date.now() + DIAS_VENCIMIENTO * 24 * 60 * 60 * 1000);
    const creada = await tx.$queryRaw<Array<{ id_cxc: string }>>`
      INSERT INTO "cuentas_por_cobrar"
        ("id_cxc", "tenant_id", "proyecto_id", "origen", "origen_id", "codigo", "concepto", "presupuesto_id",
         "monto", "fecha_vencimiento", "updated_at")
      VALUES (gen_random_uuid(), ${ctx.tenantId}::uuid, ${ctx.proyectoId}::uuid, ${a.origen}, ${a.origen_id}::uuid,
              ${a.codigo}, ${a.concepto}, ${a.presupuesto_id}::uuid, ${a.monto.toFixed(2)}::numeric, ${vence}, now())
      ON CONFLICT ("tenant_id", "origen", "origen_id") DO NOTHING
      RETURNING "id_cxc"`;
    if (creada.length === 1) return { id_cxc: creada[0].id_cxc, idempotente: false };
    const existente = await tx.cuentaPorCobrar.findFirstOrThrow({
      where: { tenant_id: ctx.tenantId, origen: a.origen, origen_id: a.origen_id },
      select: { id_cxc: true },
    });
    return { id_cxc: existente.id_cxc, idempotente: true };
  });
}

export interface CobroEntrada {
  cuenta_id: string;
  folio: string;
  monto: Dec;
  fecha_cobro: Date;
}

export function parsearCobro(body: any): CobroEntrada {
  const b = body ?? {};
  if (!esUuid(b.cuenta_id)) throw new ErrorFinanzas(400, 'FIN_CUENTA_REQUERIDA', 'cuenta_id (UUID) es obligatorio: indica la cuenta que recibe el cobro.');
  const folio = typeof b.folio === 'string' ? b.folio.trim() : '';
  if (!folio || folio.length > 60) throw new ErrorFinanzas(400, 'FIN_FOLIO_INVALIDO', 'folio es obligatorio (máximo 60 caracteres).');
  const m = parsearMontoPositivo(b.monto, 'monto');
  if (m.motivo !== undefined) throw new ErrorFinanzas(400, 'FIN_MONTO_INVALIDO', m.motivo);
  const fecha = b.fecha_cobro === undefined ? new Date() : new Date(b.fecha_cobro);
  if (Number.isNaN(fecha.getTime())) throw new ErrorFinanzas(400, 'FIN_FECHA_INVALIDA', 'fecha_cobro no es una fecha válida.');
  return { cuenta_id: b.cuenta_id.toLowerCase(), folio, monto: m.monto, fecha_cobro: fecha };
}

export interface ResultadoCobro {
  idempotente: boolean;
  id_cobro: string;
  cxc_id: string;
  proyecto_id: string;
  origen: string;
  origen_id: string;
  codigo: string;
  cuenta_id: string;
  folio: string;
  monto: number;
  moneda: string;
  fecha_cobro: string;
  cobrado_total: number;
  saldo: number;
  estado: EstadoCxc;
}

function aResultado(cobro: any, cxc: any, idempotente: boolean): ResultadoCobro {
  return {
    idempotente,
    id_cobro: cobro.id_cobro,
    cxc_id: cxc.id_cxc,
    proyecto_id: cxc.proyecto_id,
    origen: cxc.origen,
    origen_id: cxc.origen_id,
    codigo: cxc.codigo,
    cuenta_id: cobro.cuenta_id,
    folio: cobro.folio,
    monto: num(cobro.monto),
    moneda: cxc.moneda,
    fecha_cobro: new Date(cobro.fecha_cobro).toISOString(),
    cobrado_total: num(cxc.cobrado),
    saldo: num(new Decimal(String(cxc.monto)).minus(String(cxc.cobrado))),
    estado: cxc.estado,
  };
}

async function bloquearFolio(tx: Tx, tenantId: string, folio: string): Promise<void> {
  const clave = `cobro-cxc:${tenantId}:${folio}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}::text, 0))`;
}

export async function registrarCobro(ctx: Ctx, idCxc: string, c: CobroEntrada): Promise<ResultadoCobro> {
  if (!esUuid(idCxc)) throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', 'El id de la cuenta por cobrar debe ser un UUID válido.');
  return createTenantContext(ctx, async (tx) => {
    await bloquearFolio(tx, ctx.tenantId, c.folio);

    const previo = await tx.cobroCxc.findFirst({ where: { tenant_id: ctx.tenantId, folio: c.folio } });
    if (previo) {
      const mismo = previo.cxc_id === idCxc && previo.cuenta_id === c.cuenta_id && new Decimal(String(previo.monto)).equals(c.monto);
      if (!mismo) throw new ErrorFinanzas(409, 'FIN_COBRO_DUPLICADO', `El folio ${c.folio} ya se registró en otro cobro.`);
      const cxc = await tx.cuentaPorCobrar.findUniqueOrThrow({ where: { id_cxc: previo.cxc_id } });
      return aResultado(previo, cxc, true);
    }

    const filas = await tx.$queryRaw<Array<{ id_cxc: string; monto: Dec; cobrado: Dec; estado: string }>>`
      SELECT "id_cxc", "monto", "cobrado", "estado" FROM "cuentas_por_cobrar"
       WHERE "id_cxc" = ${idCxc}::uuid AND "tenant_id" = ${ctx.tenantId}::uuid
       FOR UPDATE`;
    const fila = filas[0];
    if (!fila) throw new ErrorFinanzas(404, 'FIN_CXC_NO_ENCONTRADA', 'Cuenta por cobrar no encontrada en el proyecto activo.');
    if (fila.estado === 'CANCELADA') throw new ErrorFinanzas(409, 'FIN_CXC_CANCELADA', 'La cuenta por cobrar está cancelada.');
    if (fila.estado === 'COBRADA') throw new ErrorFinanzas(409, 'FIN_CXC_COBRADA', 'La cuenta por cobrar ya está cobrada por completo.');

    const saldo = new Decimal(String(fila.monto)).minus(String(fila.cobrado));
    if (c.monto.gt(saldo)) {
      throw new ErrorFinanzas(422, 'FIN_COBRO_EXCEDE_SALDO', `El cobro ($${c.monto.toFixed(2)}) excede el saldo por cobrar ($${saldo.toFixed(2)}).`);
    }

    await abonarCuentaBancaria(tx, ctx.tenantId, ctx.proyectoId, c.cuenta_id, c.monto);

    const cobro = await tx.cobroCxc.create({
      data: {
        tenant_id: ctx.tenantId,
        proyecto_id: ctx.proyectoId,
        cxc_id: idCxc,
        cuenta_id: c.cuenta_id,
        folio: c.folio,
        monto: c.monto.toFixed(2),
        fecha_cobro: c.fecha_cobro,
        usuario_id: ctx.userId,
      },
    });

    const nuevoCobrado = new Decimal(String(fila.cobrado)).plus(c.monto);
    const estado: EstadoCxc = nuevoCobrado.gte(String(fila.monto)) ? 'COBRADA' : 'COBRO_PARCIAL';
    const cxc = await tx.cuentaPorCobrar.update({
      where: { id_cxc: idCxc },
      data: { cobrado: nuevoCobrado.toFixed(2), estado },
    });
    return aResultado(cobro, cxc, false);
  });
}

export interface FiltroCxc {
  estado?: EstadoCxc;
  limit: number;
}

export function parsearFiltroCxc(query: any): FiltroCxc {
  const estado = query?.estado;
  if (estado !== undefined && !(ESTADOS_CXC as readonly string[]).includes(estado)) {
    throw new ErrorFinanzas(400, 'FIN_ESTADO_INVALIDO', `estado debe ser uno de: ${ESTADOS_CXC.join(', ')}.`);
  }
  const limit = query?.limit === undefined ? 200 : Number(query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new ErrorFinanzas(400, 'FIN_LIMIT_INVALIDO', 'limit debe ser un entero entre 1 y 500.');
  return { estado, limit };
}

/** Lista bajo RLS: con proyecto activo, solo ese proyecto; un rol tenant-level sin proyecto ve todo el tenant. */
export async function listarCuentasPorCobrar(ctx: Ctx, f: FiltroCxc) {
  return createTenantContext(ctx, async (tx) => {
    const filas = await tx.cuentaPorCobrar.findMany({
      where: { tenant_id: ctx.tenantId, ...(f.estado ? { estado: f.estado } : { estado: { in: ['POR_COBRAR', 'COBRO_PARCIAL'] } }) },
      orderBy: [{ fecha_vencimiento: 'asc' }, { codigo: 'asc' }],
      take: f.limit,
    });
    return filas.map((r) => ({
      id_cxc: r.id_cxc,
      proyecto_id: r.proyecto_id,
      origen: r.origen,
      origen_id: r.origen_id,
      codigo: r.codigo,
      concepto: r.concepto,
      presupuesto_id: r.presupuesto_id,
      monto: num(r.monto),
      cobrado: num(r.cobrado),
      saldo: num(new Decimal(String(r.monto)).minus(String(r.cobrado))),
      moneda: r.moneda,
      fecha_vencimiento: r.fecha_vencimiento.toISOString(),
      estado: r.estado,
    }));
  });
}

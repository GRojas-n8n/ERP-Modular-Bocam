/**
 * Tesorería: punto único para todo cambio de saldo de una cuenta bancaria y su libro.
 * openspec: corregir-ejecucion-programa-pagos, cuentas-por-cobrar-estimaciones, libro-bancario (M6).
 *
 * Invariantes:
 *   1. Cada cambio de saldo escribe su movimiento en `movimientos_bancarios` en la MISMA sentencia (CTE: UPDATE de la
 *      cuenta + INSERT del movimiento). No hay saldo sin movimiento ni movimiento sin saldo.
 *   2. saldo_anterior y saldo_posterior salen del propio UPDATE: con cargos simultáneos la cadena no tiene huecos y
 *      saldo de la cuenta = Σ ABONO - Σ CARGO.
 *   3. Cargo con UPDATE condicional (saldo >= monto, cuenta activa, de empresa o del mismo proyecto): nunca negativo.
 *   4. El saldo solo cambia por una operación con origen (egreso, pago programado, nómina, cobro) o por un ajuste con
 *      motivo, folio y límite de autoridad. PATCH de la cuenta ya no lo acepta.
 *   5. Número de cuenta y CLABE salen enmascarados de la API.
 */
import { randomUUID } from 'node:crypto';
import { Prisma } from './generated/prisma';
import { createTenantContext } from './db';
import { esUuid } from './compromiso-oc';
import { ErrorFinanzas } from './errores';
import { Decimal, parsearMontoPositivo, type Dec } from './montos';
import { LIMITE_MAXIMO } from './paginacion';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];
type Ctx = { tenantId: string; proyectoId: string; userId: string };

export type TipoMovimiento = 'CARGO' | 'ABONO';
export type OrigenMovimiento = 'SALDO_INICIAL' | 'AJUSTE' | 'EGRESO_OC' | 'PAGO_PROGRAMADO' | 'NOMINA' | 'COBRO_CXC';
export const ORIGENES: readonly OrigenMovimiento[] = ['SALDO_INICIAL', 'AJUSTE', 'EGRESO_OC', 'PAGO_PROGRAMADO', 'NOMINA', 'COBRO_CXC'];

/** Qué operación movió el dinero. `origenId` es el id de esa operación (egreso, pago, prenómina, cobro, ajuste). */
export interface OrigenMov {
  origen: OrigenMovimiento;
  origenId: string;
  referencia?: string | null;
  motivo?: string | null;
  usuarioId?: string | null;
}

interface FilaMovimiento {
  id_movimiento: string;
  secuencia: bigint;
  cuenta_id: string;
  proyecto_id: string | null;
  tipo: TipoMovimiento;
  origen: OrigenMovimiento;
  origen_id: string;
  referencia: string | null;
  motivo: string | null;
  monto: Dec;
  saldo_anterior: Dec;
  saldo_posterior: Dec;
  usuario_id: string | null;
  created_at: Date;
}

const COLUMNAS = Prisma.sql`"id_movimiento"::text, "secuencia", "cuenta_id"::text, "proyecto_id"::text, "tipo", "origen",
  "origen_id"::text, "referencia", "motivo", "monto", "saldo_anterior", "saldo_posterior", "usuario_id"::text, "created_at"`;

/**
 * Mueve la cuenta y escribe el movimiento en una sola sentencia. `proyectoId` null: ajuste o saldo inicial, sin
 * regla de pertenencia; el movimiento toma el proyecto de la cuenta. Devuelve null si el UPDATE no aplicó.
 */
async function moverCuenta(
  tx: Tx, tenantId: string, proyectoId: string | null, cuentaId: string, tipo: TipoMovimiento, monto: Dec, o: OrigenMov,
): Promise<FilaMovimiento | null> {
  const total = monto.toFixed(2);
  const delta = tipo === 'CARGO' ? Prisma.sql`- ${total}::numeric` : Prisma.sql`+ ${total}::numeric`;
  const pertenencia = proyectoId === null
    ? Prisma.empty
    : Prisma.sql`AND ("proyecto_id" IS NULL OR "proyecto_id" = ${proyectoId}::uuid)`;
  const suficiente = tipo === 'CARGO' ? Prisma.sql`AND "saldo" >= ${total}::numeric` : Prisma.empty;
  const anterior = tipo === 'CARGO' ? Prisma.sql`c."saldo" + ${total}::numeric` : Prisma.sql`c."saldo" - ${total}::numeric`;
  const filas = await tx.$queryRaw<FilaMovimiento[]>`
    WITH c AS (
      UPDATE "cuentas_bancarias"
         SET "saldo" = "saldo" ${delta}, "updated_at" = now()
       WHERE "id_cuenta" = ${cuentaId}::uuid
         AND "tenant_id" = ${tenantId}::uuid
         AND "activa" = true
         ${pertenencia}
         ${suficiente}
      RETURNING "id_cuenta", "tenant_id", "proyecto_id", "saldo"
    )
    INSERT INTO "movimientos_bancarios"
      ("id_movimiento", "tenant_id", "cuenta_id", "proyecto_id", "tipo", "origen", "origen_id", "referencia", "motivo",
       "monto", "saldo_anterior", "saldo_posterior", "usuario_id")
    SELECT gen_random_uuid(), c."tenant_id", c."id_cuenta", COALESCE(${proyectoId}::uuid, c."proyecto_id"), ${tipo}::varchar, ${o.origen}::varchar,
           ${o.origenId}::uuid, ${o.referencia ?? null}::varchar, ${o.motivo ?? null}::varchar, ${total}::numeric, ${anterior}, c."saldo",
           ${o.usuarioId ?? null}::uuid
      FROM c
    RETURNING ${COLUMNAS}`;
  return filas[0] ?? null;
}

/** Cargo atómico: egreso de OCs, pago programado y nómina. */
export async function descontarCuentaBancaria(
  tx: Tx, tenantId: string, proyectoId: string, cuentaId: string, monto: Dec, o: OrigenMov,
): Promise<FilaMovimiento> {
  const mov = await moverCuenta(tx, tenantId, proyectoId, cuentaId, 'CARGO', monto, o);
  if (mov) return mov;
  const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: cuentaId, tenant_id: tenantId } });
  if (!cuenta || !cuenta.activa) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada o inactiva.');
  if (cuenta.proyecto_id && cuenta.proyecto_id !== proyectoId) {
    throw new ErrorFinanzas(422, 'FIN_CUENTA_OTRO_PROYECTO', 'La cuenta pertenece a otro proyecto; no puede pagar compromisos de este proyecto.');
  }
  throw new ErrorFinanzas(422, 'FIN_SALDO_INSUFICIENTE',
    `Saldo insuficiente. Disponible: $${Number(cuenta.saldo).toFixed(2)}, requerido: $${monto.toFixed(2)}.`);
}

/** Abono atómico: cobro de cuentas por cobrar. Misma regla de pertenencia que el cargo. */
export async function abonarCuentaBancaria(
  tx: Tx, tenantId: string, proyectoId: string, cuentaId: string, monto: Dec, o: OrigenMov,
): Promise<FilaMovimiento> {
  const mov = await moverCuenta(tx, tenantId, proyectoId, cuentaId, 'ABONO', monto, o);
  if (mov) return mov;
  const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: cuentaId, tenant_id: tenantId } });
  if (!cuenta || !cuenta.activa) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada o inactiva.');
  throw new ErrorFinanzas(422, 'FIN_CUENTA_OTRO_PROYECTO', 'La cuenta pertenece a otro proyecto; no puede recibir cobros de este proyecto.');
}

// ─── Enmascarado ───────────────────────────────────────────────────────────

/** `0123456789` → `****6789`. Valores de 4 caracteres o menos se enmascaran completos. */
export function enmascarar(valor: string | null | undefined): string | null {
  if (valor === null || valor === undefined || valor === '') return valor ?? null;
  const limpio = String(valor).replace(/\s+/g, '');
  return limpio.length <= 4 ? '****' : `****${limpio.slice(-4)}`;
}

export function cuentaPublica<T extends { numero_cuenta: string; clabe: string | null }>(c: T): T {
  return { ...c, numero_cuenta: enmascarar(c.numero_cuenta) as string, clabe: enmascarar(c.clabe) };
}

// ─── Alta con saldo inicial ────────────────────────────────────────────────

export interface AltaCuenta {
  banco: string;
  numero_cuenta: string;
  clabe: string | null;
  alias: string;
  moneda: string;
  proyecto_id: string | null;
  saldo_inicial: Dec | null;
}

export function validarAltaCuenta(body: any, limiteAprobacion: number): AltaCuenta {
  const { banco, numero_cuenta, clabe, alias, moneda, saldo, proyecto_id } = body ?? {};
  if (!banco || !numero_cuenta || !alias) {
    throw new ErrorFinanzas(400, 'FIN_MISSING_FIELDS', 'banco, numero_cuenta y alias son obligatorios.');
  }
  if (proyecto_id !== undefined && proyecto_id !== null && !esUuid(proyecto_id)) {
    throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', 'proyecto_id debe ser un UUID válido.');
  }
  let saldoInicial: Dec | null = null;
  if (saldo !== undefined && saldo !== null && saldo !== '' && Number(saldo) !== 0) {
    const r = parsearMontoPositivo(saldo, 'saldo');
    if (r.motivo) throw new ErrorFinanzas(400, 'FIN_MONTO_INVALIDO', r.motivo);
    saldoInicial = r.monto!;
    if (saldoInicial.gt(limiteAprobacion)) {
      throw new ErrorFinanzas(403, 'FIN_LIMIT_EXCEEDED',
        `El saldo inicial $${saldoInicial.toFixed(2)} excede tu límite de autoridad financiera ($${Number(limiteAprobacion).toLocaleString()}).`);
    }
  }
  return {
    banco: String(banco), numero_cuenta: String(numero_cuenta), clabe: clabe ? String(clabe) : null, alias: String(alias),
    moneda: moneda ? String(moneda) : 'MXN', proyecto_id: proyecto_id ?? null, saldo_inicial: saldoInicial,
  };
}

/** Crea la cuenta en 0 y registra el saldo inicial como movimiento SALDO_INICIAL (origen_id = id de la cuenta). */
export async function crearCuentaBancaria(ctx: Ctx, a: AltaCuenta) {
  return createTenantContext(ctx, async (tx) => {
    const cuenta = await tx.cuentaBancaria.create({
      data: {
        tenant_id: ctx.tenantId, proyecto_id: a.proyecto_id, banco: a.banco, numero_cuenta: a.numero_cuenta,
        clabe: a.clabe, alias: a.alias, moneda: a.moneda, saldo: 0,
      },
    });
    if (!a.saldo_inicial) return cuentaPublica(cuenta);
    const mov = await moverCuenta(tx, ctx.tenantId, null, cuenta.id_cuenta, 'ABONO', a.saldo_inicial, {
      origen: 'SALDO_INICIAL', origenId: cuenta.id_cuenta, usuarioId: ctx.userId,
    });
    if (!mov) throw new Error('No se registró el saldo inicial de la cuenta recién creada.');
    return cuentaPublica({ ...cuenta, saldo: mov.saldo_posterior });
  });
}

/** PATCH de datos de la cuenta. El saldo no es editable: se corrige con un ajuste. */
export async function actualizarCuentaBancaria(ctx: Ctx, idCuenta: string, body: any) {
  if (!esUuid(idCuenta)) throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', 'El id de la cuenta debe ser un UUID válido.');
  if (body && Object.prototype.hasOwnProperty.call(body, 'saldo')) {
    throw new ErrorFinanzas(400, 'FIN_SALDO_NO_EDITABLE',
      'El saldo no se edita. Regístralo con POST /cuentas-bancarias/:id/ajustes (tipo, monto, folio y motivo).');
  }
  const { banco, numero_cuenta, clabe, alias, moneda } = body ?? {};
  return createTenantContext(ctx, async (tx) => {
    const existe = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: idCuenta, tenant_id: ctx.tenantId }, select: { id_cuenta: true } });
    if (!existe) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada.');
    const cuenta = await tx.cuentaBancaria.update({
      where: { id_cuenta: idCuenta },
      data: {
        ...(banco !== undefined ? { banco } : {}),
        ...(numero_cuenta !== undefined ? { numero_cuenta } : {}),
        ...(clabe !== undefined ? { clabe } : {}),
        ...(alias !== undefined ? { alias } : {}),
        ...(moneda !== undefined ? { moneda } : {}),
      },
    });
    return cuentaPublica(cuenta);
  });
}

// ─── Ajustes ───────────────────────────────────────────────────────────────

export interface AjusteEntrada {
  tipo: TipoMovimiento;
  monto: Dec;
  folio: string;
  motivo: string;
}

export function validarAjuste(body: any): AjusteEntrada {
  const tipo = String(body?.tipo ?? '').toUpperCase();
  if (tipo !== 'CARGO' && tipo !== 'ABONO') throw new ErrorFinanzas(400, 'FIN_TIPO_INVALIDO', 'tipo debe ser CARGO o ABONO.');
  const m = parsearMontoPositivo(body?.monto, 'monto');
  if (m.motivo) throw new ErrorFinanzas(400, 'FIN_MONTO_INVALIDO', m.motivo);
  const folio = typeof body?.folio === 'string' ? body.folio.trim() : '';
  if (!folio || folio.length > 100) throw new ErrorFinanzas(400, 'FIN_FOLIO_INVALIDO', 'folio es obligatorio (máximo 100 caracteres).');
  const motivo = typeof body?.motivo === 'string' ? body.motivo.trim() : '';
  if (motivo.length < 10 || motivo.length > 500) {
    throw new ErrorFinanzas(400, 'FIN_MOTIVO_INVALIDO', 'motivo es obligatorio, entre 10 y 500 caracteres.');
  }
  return { tipo, monto: m.monto!, folio, motivo };
}

export interface ResultadoAjuste extends MovimientoPublico {
  idempotente: boolean;
}

/**
 * Ajuste de saldo con motivo. Idempotente por (cuenta, folio): el mismo folio con el mismo tipo y monto devuelve el
 * ajuste existente; con otro contenido es 409. El límite de autoridad se evalúa antes de mover dinero.
 */
export async function registrarAjuste(ctx: Ctx, idCuenta: string, a: AjusteEntrada, limiteAprobacion: number): Promise<ResultadoAjuste> {
  if (!esUuid(idCuenta)) throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', 'El id de la cuenta debe ser un UUID válido.');
  if (a.monto.gt(limiteAprobacion)) {
    throw new ErrorFinanzas(403, 'FIN_LIMIT_EXCEEDED',
      `El ajuste $${a.monto.toFixed(2)} excede tu límite de autoridad financiera ($${Number(limiteAprobacion).toLocaleString()}).`);
  }
  return createTenantContext(ctx, async (tx) => {
    const clave = `ajuste-bancario:${ctx.tenantId}:${idCuenta}:${a.folio}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${clave}::text, 0))`;

    const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: idCuenta, tenant_id: ctx.tenantId } });
    if (!cuenta || !cuenta.activa) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada o inactiva.');

    const previo = (await tx.$queryRaw<FilaMovimiento[]>`
      SELECT ${COLUMNAS} FROM "movimientos_bancarios"
       WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "cuenta_id" = ${idCuenta}::uuid
         AND "origen" = 'AJUSTE' AND "referencia" = ${a.folio}`)[0];
    if (previo) {
      if (previo.tipo !== a.tipo || !new Decimal(String(previo.monto)).equals(a.monto)) {
        throw new ErrorFinanzas(409, 'FIN_AJUSTE_DUPLICADO', `El folio ${a.folio} ya se usó en otro ajuste de esta cuenta.`);
      }
      return { ...movimientoPublico(previo), idempotente: true };
    }

    const mov = await moverCuenta(tx, ctx.tenantId, null, idCuenta, a.tipo, a.monto, {
      origen: 'AJUSTE', origenId: randomUUID(), referencia: a.folio, motivo: a.motivo, usuarioId: ctx.userId,
    });
    if (!mov) {
      throw new ErrorFinanzas(422, 'FIN_SALDO_INSUFICIENTE',
        `Saldo insuficiente. Disponible: $${Number(cuenta.saldo).toFixed(2)}, cargo: $${a.monto.toFixed(2)}.`);
    }
    return { ...movimientoPublico(mov), idempotente: false };
  });
}

// ─── Consulta del libro ────────────────────────────────────────────────────

export interface MovimientoPublico {
  id_movimiento: string;
  secuencia: string;
  cuenta_id: string;
  proyecto_id: string | null;
  tipo: TipoMovimiento;
  origen: OrigenMovimiento;
  origen_id: string;
  referencia: string | null;
  motivo: string | null;
  monto: number;
  saldo_anterior: number;
  saldo_posterior: number;
  usuario_id: string | null;
  created_at: string;
}

function movimientoPublico(f: FilaMovimiento): MovimientoPublico {
  return {
    id_movimiento: f.id_movimiento,
    secuencia: String(f.secuencia),
    cuenta_id: f.cuenta_id,
    proyecto_id: f.proyecto_id,
    tipo: f.tipo,
    origen: f.origen,
    origen_id: f.origen_id,
    referencia: f.referencia,
    motivo: f.motivo,
    monto: Number(f.monto),
    saldo_anterior: Number(f.saldo_anterior),
    saldo_posterior: Number(f.saldo_posterior),
    usuario_id: f.usuario_id,
    created_at: new Date(f.created_at).toISOString(),
  };
}

function parsearConsulta(query: any): { limit: number; antesDe: bigint | null; origen: OrigenMovimiento | null } {
  const limit = query?.limit === undefined ? 100 : Number(query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > LIMITE_MAXIMO) {
    throw new ErrorFinanzas(400, 'FIN_LIMIT_INVALIDO', `limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}.`);
  }
  let antesDe: bigint | null = null;
  if (query?.cursor !== undefined && query.cursor !== '') {
    const texto = Buffer.from(String(query.cursor), 'base64url').toString('utf8');
    if (!/^-?\d{1,19}$/.test(texto)) throw new ErrorFinanzas(400, 'FIN_CURSOR_INVALIDO', 'cursor no es válido; usa el next_cursor de la respuesta anterior.');
    antesDe = BigInt(texto);
  }
  let origen: OrigenMovimiento | null = null;
  if (query?.origen !== undefined && query.origen !== '') {
    origen = String(query.origen).toUpperCase() as OrigenMovimiento;
    if (!ORIGENES.includes(origen)) throw new ErrorFinanzas(400, 'FIN_ORIGEN_INVALIDO', `origen debe ser uno de: ${ORIGENES.join(', ')}.`);
  }
  return { limit, antesDe, origen };
}

/** Libro de una cuenta, del más reciente al más antiguo. Paginado por secuencia (`?limit=`, `?cursor=`, `?origen=`). */
export async function listarMovimientos(ctx: Ctx, idCuenta: string, query: any) {
  if (!esUuid(idCuenta)) throw new ErrorFinanzas(400, 'FIN_INVALID_REFERENCE', 'El id de la cuenta debe ser un UUID válido.');
  const q = parsearConsulta(query);
  return createTenantContext(ctx, async (tx) => {
    const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: idCuenta, tenant_id: ctx.tenantId }, select: { id_cuenta: true } });
    if (!cuenta) throw new ErrorFinanzas(404, 'FIN_CUENTA_NO_ENCONTRADA', 'Cuenta bancaria no encontrada.');
    const filas = await tx.$queryRaw<FilaMovimiento[]>`
      SELECT ${COLUMNAS} FROM "movimientos_bancarios"
       WHERE "tenant_id" = ${ctx.tenantId}::uuid AND "cuenta_id" = ${idCuenta}::uuid
         ${q.antesDe === null ? Prisma.empty : Prisma.sql`AND "secuencia" < ${q.antesDe}`}
         ${q.origen === null ? Prisma.empty : Prisma.sql`AND "origen" = ${q.origen}`}
       ORDER BY "secuencia" DESC
       LIMIT ${q.limit + 1}`;
    const hayMas = filas.length > q.limit;
    const pagina = (hayMas ? filas.slice(0, q.limit) : filas).map(movimientoPublico);
    const ultima = pagina[pagina.length - 1];
    return {
      data: pagina,
      paginacion: { limit: q.limit, next_cursor: hayMas && ultima ? Buffer.from(ultima.secuencia, 'utf8').toString('base64url') : null },
    };
  });
}

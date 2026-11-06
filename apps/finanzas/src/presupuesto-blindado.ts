/**
 * Escrituras presupuestales manuales y sincronización con Gerencia Técnica, a prueba de concurrencia.
 * Change: blindar-movimientos-y-sincronizacion-gt (hallazgos F18, F22 y F23 de la auditoría del 5 nov 2026).
 *
 * Invariante que protege: monto_disponible = monto_autorizado - monto_comprometido - monto_ejercido.
 *
 *   - Cada escritura bloquea la fila del presupuesto (SELECT ... FOR UPDATE) antes de validar saldos: dos
 *     movimientos simultáneos nunca comprometen más que el disponible.
 *   - Montos > 0 con máximo 2 decimales (montos.ts): un monto negativo ya no invierte el sentido del movimiento.
 *   - Las partidas sincronizadas desde GT (concepto_id no nulo) no aceptan movimientos ni transferencias manuales:
 *     GT es la fuente de verdad de su autorizado.
 *   - Una transferencia mueve autorizado y disponible de origen a destino, en una transacción, con los dos
 *     presupuestos bloqueados en orden fijo (sin deadlock) e idempotencia por transferencia_id.
 *   - La resincronización de una partida de GT recalcula el disponible respetando comprometido y ejercido.
 */

import { Prisma } from './generated/prisma';
import { createTenantContext } from './db';
import { esUuid } from './compromiso-oc';
import { Decimal, type Dec } from './montos';

type Tx = Parameters<Parameters<typeof createTenantContext>[1]>[0];
type Ctx = { tenantId: string; proyectoId: string; userId: string };

export class ErrorPresupuesto extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

interface FilaPresupuesto {
  id_presupuesto: string;
  codigo: string;
  capitulo: string;
  concepto_id: string | null;
  monto_autorizado: Dec;
  monto_comprometido: Dec;
  monto_ejercido: Dec;
  monto_disponible: Dec;
}

const fmt = (d: Dec) => `$${Number(d.toFixed(2)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

async function bloquearPresupuestos(tx: Tx, ids: string[]): Promise<Map<string, FilaPresupuesto>> {
  const ordenados = [...new Set(ids)].sort();
  const filas = await tx.$queryRaw<FilaPresupuesto[]>`
    SELECT "id_presupuesto"::text, "codigo", "capitulo", "concepto_id"::text,
           "monto_autorizado", "monto_comprometido", "monto_ejercido", "monto_disponible"
      FROM "presupuestos_asignados"
     WHERE "id_presupuesto" = ANY(${ordenados}::uuid[])
     ORDER BY "id_presupuesto"
       FOR UPDATE`;
  return new Map(filas.map((f) => [f.id_presupuesto, {
    ...f,
    monto_autorizado: new Decimal(String(f.monto_autorizado)),
    monto_comprometido: new Decimal(String(f.monto_comprometido)),
    monto_ejercido: new Decimal(String(f.monto_ejercido)),
    monto_disponible: new Decimal(String(f.monto_disponible)),
  }]));
}

function exigir(fila: FilaPresupuesto | undefined, id: string): FilaPresupuesto {
  if (!fila) throw new ErrorPresupuesto(404, 'FIN_PRESUPUESTO_NO_ENCONTRADO', `Presupuesto ${id} no encontrado en el proyecto.`);
  return fila;
}

function noSincronizado(fila: FilaPresupuesto, operacion: string) {
  if (fila.concepto_id) {
    throw new ErrorPresupuesto(422, 'FIN_PARTIDA_SINCRONIZADA',
      `El presupuesto ${fila.codigo} es una partida sincronizada desde Gerencia Técnica; ${operacion} se hace en GT.`);
  }
}

// ─── Movimiento manual ────────────────────────────────────────────────────────

export const TIPOS_MOVIMIENTO_MANUAL = ['COMPROMISO', 'DEVENGADO', 'EJERCIDO', 'LIBERACION'] as const;
export type TipoMovimientoManual = (typeof TIPOS_MOVIMIENTO_MANUAL)[number];

export interface MovimientoManual {
  presupuesto_id: string;
  tipo: TipoMovimientoManual;
  concepto: string;
  monto: Dec;
  moneda?: string | null;
  referencia_modulo?: string | null;
  referencia_entidad?: string | null;
  referencia_id?: string | null;
  referencia_codigo?: string | null;
  notas?: string | null;
}

export async function registrarMovimientoManual(ctx: Ctx, m: MovimientoManual) {
  return createTenantContext(ctx, async (tx) => {
    const pres = exigir((await bloquearPresupuestos(tx, [m.presupuesto_id])).get(m.presupuesto_id), m.presupuesto_id);
    noSincronizado(pres, 'cualquier movimiento');

    const monto = m.monto;
    if ((m.tipo === 'COMPROMISO' || m.tipo === 'EJERCIDO') && monto.gt(pres.monto_disponible)) {
      throw new ErrorPresupuesto(422, 'FIN_INSUFFICIENT_BUDGET',
        `PRESUPUESTO_INSUFICIENTE: Disponible ${fmt(pres.monto_disponible)}, Solicitado ${fmt(monto)}, Déficit ${fmt(monto.minus(pres.monto_disponible))}`);
    }
    if ((m.tipo === 'DEVENGADO' || m.tipo === 'LIBERACION') && monto.gt(pres.monto_comprometido)) {
      throw new ErrorPresupuesto(422, 'FIN_EXCEDE_COMPROMETIDO',
        `El ${m.tipo.toLowerCase()} (${fmt(monto)}) excede lo comprometido (${fmt(pres.monto_comprometido)}).`);
    }

    const movimiento = await tx.movimientoPresupuestal.create({
      data: {
        tenant_id: ctx.tenantId,
        proyecto_id: ctx.proyectoId,
        presupuesto_id: m.presupuesto_id,
        tipo: m.tipo as any,
        concepto: m.concepto,
        monto: monto.toFixed(2),
        moneda: m.moneda || 'MXN',
        referencia_modulo: m.referencia_modulo ?? null,
        referencia_entidad: m.referencia_entidad ?? null,
        referencia_id: m.referencia_id ?? null,
        referencia_codigo: m.referencia_codigo ?? null,
        usuario_id: ctx.userId,
        notas: m.notas ?? null,
      } as any,
    });

    const v = monto.toFixed(2);
    const cambios: Record<TipoMovimientoManual, Prisma.PresupuestoAsignadoUpdateInput> = {
      COMPROMISO: { monto_comprometido: { increment: v }, monto_disponible: { decrement: v } },
      EJERCIDO: { monto_ejercido: { increment: v }, monto_disponible: { decrement: v } },
      DEVENGADO: { monto_comprometido: { decrement: v }, monto_ejercido: { increment: v } },
      LIBERACION: { monto_comprometido: { decrement: v }, monto_disponible: { increment: v } },
    };
    await tx.presupuestoAsignado.update({ where: { id_presupuesto: m.presupuesto_id }, data: cambios[m.tipo] });
    return movimiento;
  });
}

// ─── Transferencia presupuestal ───────────────────────────────────────────────

export interface Transferencia {
  transferencia_id: string;
  presupuesto_origen_id: string;
  presupuesto_destino_id: string;
  monto: Dec;
  concepto: string;
}

export interface ResultadoTransferencia {
  transferencia_id: string;
  movimiento_origen_id: string;
  movimiento_destino_id: string;
  presupuesto_origen_id: string;
  presupuesto_destino_id: string;
  codigo_origen: string;
  codigo_destino: string;
  capitulo_origen: string;
  capitulo_destino: string;
  monto_transferido: number;
  concepto: string;
  idempotente: boolean;
}

export async function transferirPresupuesto(ctx: Ctx, t: Transferencia): Promise<ResultadoTransferencia> {
  return createTenantContext(ctx, async (tx) => {
    // Reintentos simultáneos con el mismo transferencia_id se serializan aquí.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`transferencia:${ctx.tenantId}:${t.transferencia_id}`}::text, 0))`;

    const filas = await bloquearPresupuestos(tx, [t.presupuesto_origen_id, t.presupuesto_destino_id]);
    const origen = exigir(filas.get(t.presupuesto_origen_id), t.presupuesto_origen_id);
    const destino = exigir(filas.get(t.presupuesto_destino_id), t.presupuesto_destino_id);

    const previos = await tx.movimientoPresupuestal.findMany({
      where: {
        referencia_modulo: 'finanzas', referencia_entidad: 'TransferenciaPresupuestal',
        referencia_id: t.transferencia_id, tipo: 'TRANSFERENCIA' as any,
      },
      orderBy: { fecha_registro: 'asc' },
    });
    const base = {
      transferencia_id: t.transferencia_id,
      presupuesto_origen_id: t.presupuesto_origen_id,
      presupuesto_destino_id: t.presupuesto_destino_id,
      codigo_origen: origen.codigo,
      codigo_destino: destino.codigo,
      capitulo_origen: origen.capitulo,
      capitulo_destino: destino.capitulo,
      monto_transferido: Number(t.monto.toFixed(2)),
      concepto: t.concepto,
    };
    if (previos.length > 0) {
      const salida = previos.find((p) => p.presupuesto_id === t.presupuesto_origen_id);
      const entrada = previos.find((p) => p.presupuesto_id === t.presupuesto_destino_id);
      const mismo = salida && entrada && previos.length === 2 && new Decimal(String(salida.monto)).eq(t.monto);
      if (!mismo) {
        throw new ErrorPresupuesto(409, 'FIN_TRANSFERENCIA_DUPLICADA',
          `La transferencia ${t.transferencia_id} ya existe con otros presupuestos o con otro monto.`);
      }
      return { ...base, movimiento_origen_id: salida!.id_movimiento, movimiento_destino_id: entrada!.id_movimiento, idempotente: true };
    }

    noSincronizado(origen, 'la transferencia');
    noSincronizado(destino, 'la transferencia');
    if (t.monto.gt(origen.monto_disponible)) {
      throw new ErrorPresupuesto(422, 'FIN_INSUFFICIENT_BUDGET',
        `No hay presupuesto disponible suficiente para la transferencia. Disponible ${fmt(origen.monto_disponible)}, solicitado ${fmt(t.monto)}.`);
    }

    const v = t.monto.toFixed(2);
    const movimiento = (presupuesto_id: string, notas: string) => tx.movimientoPresupuestal.create({
      data: {
        tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, presupuesto_id,
        tipo: 'TRANSFERENCIA' as any, concepto: t.concepto, monto: v,
        referencia_modulo: 'finanzas', referencia_entidad: 'TransferenciaPresupuestal', referencia_id: t.transferencia_id,
        usuario_id: ctx.userId, notas,
      } as any,
    });
    const salida = await movimiento(t.presupuesto_origen_id, 'Transferencia presupuestal - salida.');
    const entrada = await movimiento(t.presupuesto_destino_id, 'Transferencia presupuestal - entrada.');

    // Se mueve el autorizado junto con el disponible: la invariante disponible = autorizado - comprometido - ejercido
    // se conserva en los dos presupuestos.
    await tx.presupuestoAsignado.update({
      where: { id_presupuesto: t.presupuesto_origen_id },
      data: { monto_autorizado: { decrement: v }, monto_disponible: { decrement: v } },
    });
    await tx.presupuestoAsignado.update({
      where: { id_presupuesto: t.presupuesto_destino_id },
      data: { monto_autorizado: { increment: v }, monto_disponible: { increment: v } },
    });

    return { ...base, movimiento_origen_id: salida.id_movimiento, movimiento_destino_id: entrada.id_movimiento, idempotente: false };
  });
}

// ─── Sincronización de partidas de Gerencia Técnica ───────────────────────────

export interface PartidaGt {
  concepto_id: string;
  concepto_clave: string;
  concepto_desc: string;
  monto: Dec;
  capitulo: string;
}

/**
 * Alta idempotente de la partida o actualización relativa: el nuevo autorizado de GT reemplaza al anterior y el
 * disponible se recalcula como autorizado - comprometido - ejercido. Antes se restablecía al autorizado completo
 * y una reemisión de GT permitía sobrecomprometer. Devuelve las partidas que quedaron sobregiradas (disponible < 0).
 */
export async function sincronizarPartidasGt(tx: Tx, ctx: Ctx, partidas: PartidaGt[]): Promise<Array<{ concepto_id: string; disponible: number }>> {
  const sobregiradas: Array<{ concepto_id: string; disponible: number }> = [];
  for (const p of partidas) {
    if (!esUuid(p.concepto_id)) continue;
    const v = p.monto.toFixed(2);
    const filas = await tx.$queryRaw<Array<{ monto_disponible: unknown }>>`
      INSERT INTO "presupuestos_asignados"
        ("id_presupuesto", "tenant_id", "proyecto_id", "concepto_id", "concepto_clave", "codigo", "descripcion",
         "monto_autorizado", "monto_disponible", "capitulo", "estatus", "updated_at")
      VALUES
        (gen_random_uuid(), ${ctx.tenantId}::uuid, ${ctx.proyectoId}::uuid, ${p.concepto_id}::uuid, ${p.concepto_clave},
         ${p.concepto_clave}, ${p.concepto_desc}, ${v}::numeric, ${v}::numeric, ${p.capitulo}, 'ACTIVO', now())
      ON CONFLICT ("tenant_id", "proyecto_id", "concepto_id") DO UPDATE
         SET "monto_autorizado" = EXCLUDED."monto_autorizado",
             "monto_disponible" = EXCLUDED."monto_autorizado" - "presupuestos_asignados"."monto_comprometido"
                                                              - "presupuestos_asignados"."monto_ejercido",
             "concepto_clave"   = EXCLUDED."concepto_clave",
             "capitulo"         = EXCLUDED."capitulo",
             "updated_at"       = now()
      RETURNING "monto_disponible"`;
    const disponible = Number(filas[0]?.monto_disponible ?? 0);
    if (disponible < 0) sobregiradas.push({ concepto_id: p.concepto_id, disponible });
  }
  return sobregiradas;
}

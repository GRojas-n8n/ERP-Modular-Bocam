/**
 * Estados de la Orden de Compra y transiciones que pueden provocar los eventos de Finanzas.
 * Change: blindar-compromiso-oc-concurrencia-y-orden-eventos (segundo PR: Compras).
 *
 * OrdenCompra.estado es un String libre en Prisma (sin enum ni restricción en BD): esta tabla es la única
 * fuente de verdad en el código. El valor almacenado para el estado pendiente de confirmación es
 * 'PENDIENTE_CONFIRMACION_FINANZAS'. La clave PENDIENTE_FINANZAS es solo el nombre del identificador en el código;
 * el literal 'PENDIENTE_FINANZAS' no existe como valor almacenado en ninguna parte.
 */

export const OC_STATUS = {
  PENDIENTE_FINANZAS: 'PENDIENTE_CONFIRMACION_FINANZAS',
  ERROR_FINANZAS: 'ERROR_FINANZAS',
  EMITIDA: 'EMITIDA',
  PARCIALMENTE_RECIBIDA: 'PARCIALMENTE_RECIBIDA',
  RECIBIDA: 'RECIBIDA',
  CANCELACION_PENDIENTE: 'CANCELACION_PENDIENTE',
  CANCELADA: 'CANCELADA',
} as const;

export type EstadoOc = (typeof OC_STATUS)[keyof typeof OC_STATUS];

/** Estados que Compras realmente asigna a una OC. */
export const ESTADOS_OC: readonly EstadoOc[] = Object.values(OC_STATUS);

/**
 * Estados heredados que existen en el esquema (comentario/valor por defecto) pero que ningún camino de Compras
 * asigna hoy a una OC. Ningún evento de Finanzas puede transicionarlos.
 */
export const ESTADOS_OC_HEREDADOS = ['BORRADOR', 'PENDIENTE', 'APROBADA'] as const;

/** Estados en los que la OC ya no admite cambios provocados por Finanzas. */
export const ESTADOS_OC_TERMINALES: readonly EstadoOc[] = [OC_STATUS.CANCELADA, OC_STATUS.RECIBIDA];

/**
 * Transiciones permitidas por evento de Finanzas: `desde` es la lista blanca de estados de origen. Cualquier otro
 * estado (incluidos los terminales, PARCIALMENTE_RECIBIDA, CANCELACION_PENDIENTE y los heredados) es un no-op.
 *
 *   finanzas.fondos_comprometidos     PENDIENTE_CONFIRMACION_FINANZAS | ERROR_FINANZAS  -> EMITIDA
 *       (desde ERROR_FINANZAS: Finanzas confirma un compromiso real, p. ej. tras un timeout de la llamada HTTP)
 *   finanzas.presupuesto_insuficiente PENDIENTE_CONFIRMACION_FINANZAS                   -> ERROR_FINANZAS
 */
export const TRANSICIONES_EVENTO_FINANZAS = {
  fondos_comprometidos: {
    destino: OC_STATUS.EMITIDA,
    desde: [OC_STATUS.PENDIENTE_FINANZAS, OC_STATUS.ERROR_FINANZAS],
  },
  presupuesto_insuficiente: {
    destino: OC_STATUS.ERROR_FINANZAS,
    desde: [OC_STATUS.PENDIENTE_FINANZAS],
  },
} as const;

export type ResultadoTransicion =
  | { resultado: 'aplicada' }
  | { resultado: 'no_op'; estadoActual: string }
  | { resultado: 'oc_no_encontrada' };

interface PrismaOcLike {
  ordenCompra: {
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
    findUnique(args: { where: Record<string, unknown>; select?: Record<string, unknown> }): Promise<{ estado: string } | null>;
  };
}

/**
 * Transición de estado atómica: UPDATE ... WHERE id AND estado IN (lista blanca). La protección es la propia
 * cláusula WHERE evaluada por la base de datos (PostgreSQL vuelve a evaluarla tras esperar el bloqueo de la fila),
 * no una lectura previa. Si no actualiza nada, se lee el estado solo para registrar el no-op; no se modifica.
 */
export async function transicionarEstadoOc(
  prisma: PrismaOcLike,
  p: { ocId: string; tenantId: string; destino: string; desde: readonly string[] },
): Promise<ResultadoTransicion> {
  const r = await prisma.ordenCompra.updateMany({
    where: { id_orden: p.ocId, tenant_id: p.tenantId, estado: { in: [...p.desde] } },
    data: { estado: p.destino },
  });
  if (r.count > 0) return { resultado: 'aplicada' };

  const actual = await prisma.ordenCompra.findUnique({ where: { id_orden: p.ocId }, select: { estado: true } });
  if (!actual) return { resultado: 'oc_no_encontrada' };
  return { resultado: 'no_op', estadoActual: actual.estado };
}

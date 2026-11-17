/**
 * Payloads de los eventos de OC que publica Compras. Se arman aquí para que la ruta y las pruebas de contrato usen
 * exactamente la misma forma (change fix-oc-creada-presupuesto-id).
 */

type Decimalish = { toNumber(): number };

export interface OcCreadaItem {
  insumo_id: string | null;
  cantidad: number;
  precio_unitario: number;
}

export interface OcCreadaPayload {
  oc_id: string;
  codigo: string;
  total: number;
  proveedor_id: string;
  presupuesto_id: string;
  proyecto_id: string;
  requisicion_id: string | null;
  concepto_id: string | null;
  items: OcCreadaItem[];
}

export interface OcCanceladaPayload {
  oc_id: string;
  codigo: string;
  total: number;
  presupuesto_id: string | null;
  requisicion_id: string | null;
}

export function buildOcCreadaPayload(params: {
  oc: { id_orden: string; codigo: string; total: Decimalish; proveedor_id: string };
  proyectoId: string;
  presupuestoId: string;
  requisicionId?: string | null;
  conceptoId?: string | null;
  items: OcCreadaItem[];
}): OcCreadaPayload {
  return {
    oc_id:          params.oc.id_orden,
    codigo:         params.oc.codigo,
    total:          params.oc.total.toNumber(),
    proveedor_id:   params.oc.proveedor_id,
    presupuesto_id: params.presupuestoId,
    proyecto_id:    params.proyectoId,
    requisicion_id: params.requisicionId || null,
    concepto_id:    params.conceptoId || null,
    items:          params.items,
  };
}

export function buildOcCanceladaPayload(oc: {
  id_orden: string;
  codigo: string;
  total: Decimalish;
  presupuesto_id: string | null;
  requisicion_id: string | null;
}): OcCanceladaPayload {
  return {
    oc_id:          oc.id_orden,
    codigo:         oc.codigo,
    total:          oc.total.toNumber(),
    presupuesto_id: oc.presupuesto_id,
    requisicion_id: oc.requisicion_id,
  };
}

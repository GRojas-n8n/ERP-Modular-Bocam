export interface OrdenCompraItemConInsumo {
  insumo_id: string | null;
  // Descripción/unidad de texto libre (imprevisto) — presentes cuando insumo_id es null.
  // Ver openspec/changes/generar-oc-imprevisto-y-ganador-automatico.
  descripcion_libre?: string | null;
  unidad_libre?: string | null;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

export interface InsumoCatalogo {
  id: string;
  clave?: string;
  descripcion: string;
  unidad_medida?: string;
}

export interface OrdenCompraParaPdf {
  codigo: string;
  proveedor_nombre: string;
  subtotal: number;
  iva: number;
  total: number;
  items: OrdenCompraItemConInsumo[];
}

/**
 * Arma el payload `{ oc: {...} }` que espera `POST /api/v1/reportes/oc-pdf`
 * (ver apps/reportes/src/main.ts) a partir de una OC ya persistida en BD,
 * resolviendo la descripción/unidad de cada item contra el catálogo de
 * insumos de gerencia-tecnica (mismo patrón que enviarCorreosCotizacion en
 * main.ts). Se genera server-side para no depender del estado del cliente
 * que originó la OC (ver capability envio-oc-proveedor).
 */
export function buildOcPdfPayload(
  orden: OrdenCompraParaPdf,
  insumoById: Map<string, InsumoCatalogo>,
): { oc: { numero: string; proveedor: string; items: Array<{ descripcion: string; unidad: string; cantidad: number; precio_unitario: number; importe: number }>; subtotal: number; iva: number; total: number } } {
  const items = orden.items.map((it) => {
    if (!it.insumo_id) {
      return {
        descripcion: it.descripcion_libre || 'Material imprevisto (sin catálogo)',
        unidad: it.unidad_libre || '',
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
        importe: it.importe,
      };
    }
    const insumo = insumoById.get(it.insumo_id);
    return {
      descripcion: insumo ? `[${insumo.clave ?? ''}] ${insumo.descripcion}`.trim() : 'Insumo no encontrado en catálogo',
      unidad: insumo?.unidad_medida || '',
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      importe: it.importe,
    };
  });

  return {
    oc: {
      numero: orden.codigo,
      proveedor: orden.proveedor_nombre,
      items,
      subtotal: orden.subtotal,
      iva: orden.iva,
      total: orden.total,
    },
  };
}

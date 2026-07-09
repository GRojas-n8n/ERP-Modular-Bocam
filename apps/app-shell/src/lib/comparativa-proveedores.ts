import type { ProveedorComp } from '../components/ComparativaDetail';

export interface ProveedorInvitadoSolicitud {
  proveedor_id: string;
  proveedor_nombre: string;
}

const MAX_PROVEEDORES_COMPARATIVO = 3;

/**
 * Prepobla la lista de proveedores de un cuadro comparativo nuevo con los
 * proveedores ya invitados en la Solicitud de Cotización de la requisición,
 * para que Compras no tenga que volver a capturarlos manualmente.
 */
export function seedProveedoresDesdeSolicitud(
  proveedoresInvitados: ProveedorInvitadoSolicitud[],
  maxProveedores: number = MAX_PROVEEDORES_COMPARATIVO,
): ProveedorComp[] {
  return proveedoresInvitados.slice(0, maxProveedores).map(p => ({
    id: p.proveedor_id,
    nombre: p.proveedor_nombre?.trim() || '—',
  }));
}

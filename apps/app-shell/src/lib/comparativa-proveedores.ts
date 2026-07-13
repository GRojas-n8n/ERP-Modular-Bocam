import type { ProveedorComp } from '../components/ComparativaDetail';

export interface ProveedorInvitadoSolicitud {
  proveedor_id: string;
  proveedor_nombre: string;
}

const MAX_PROVEEDORES_COMPARATIVO = 3;

/**
 * Fusiona los proveedores que ya tiene un cuadro comparativo (p. ej. con precios
 * ya capturados, o agregados manualmente del catálogo) con los proveedores
 * invitados en la Solicitud de Cotización de la misma requisición, sin
 * duplicar y respetando el tope máximo. Se usa tanto al crear el cuadro como
 * al reabrirlo, para que el prepoblado sobreviva a recargas de página.
 */
export function mergeProveedoresConSolicitud(
  proveedoresActuales: ProveedorComp[],
  proveedoresInvitados: ProveedorInvitadoSolicitud[],
  maxProveedores: number = MAX_PROVEEDORES_COMPARATIVO,
): ProveedorComp[] {
  const resultado = [...proveedoresActuales];
  const idsExistentes = new Set(resultado.map(p => p.id));

  for (const invitado of proveedoresInvitados) {
    if (resultado.length >= maxProveedores) break;
    if (idsExistentes.has(invitado.proveedor_id)) continue;
    resultado.push({
      id: invitado.proveedor_id,
      nombre: invitado.proveedor_nombre?.trim() || '—',
    });
    idsExistentes.add(invitado.proveedor_id);
  }

  return resultado;
}

/**
 * Prepobla la lista de proveedores de un cuadro comparativo nuevo con los
 * proveedores ya invitados en la Solicitud de Cotización de la requisición,
 * para que Compras no tenga que volver a capturarlos manualmente.
 */
export function seedProveedoresDesdeSolicitud(
  proveedoresInvitados: ProveedorInvitadoSolicitud[],
  maxProveedores: number = MAX_PROVEEDORES_COMPARATIVO,
): ProveedorComp[] {
  return mergeProveedoresConSolicitud([], proveedoresInvitados, maxProveedores);
}

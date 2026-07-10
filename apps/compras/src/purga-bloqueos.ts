/**
 * Ver openspec/changes/panel-purga-datos-prueba-compras/design.md.
 * Funciones puras: reciben los IDs ya consultados por el caller y solo
 * calculan qué bloquea una purga, sin tocar la base de datos.
 */

export interface Bloqueo {
  tipo: string;
  cantidad: number;
  ids: string[];
}

export function calcularBloqueosRequisicion(
  ocAsociadas: string[],
  ocSeleccionadas: string[],
): Bloqueo[] {
  const seleccionadas = new Set(ocSeleccionadas);
  const noSeleccionadas = ocAsociadas.filter((id) => !seleccionadas.has(id));
  if (noSeleccionadas.length === 0) return [];
  return [{ tipo: 'ORDEN_COMPRA', cantidad: noSeleccionadas.length, ids: noSeleccionadas }];
}

export interface ReferenciasProveedor {
  ordenesCompra: string[];
  comparativaDetalle: string[];
  evaluacionEspecificacion: string[];
  solicitudCotizacionProveedor: string[];
}

export interface LoteProveedor {
  ordenesCompra: string[];
}

const TIPO_POR_CAMPO: Record<keyof ReferenciasProveedor, string> = {
  ordenesCompra: 'ORDEN_COMPRA',
  comparativaDetalle: 'COMPARATIVA_DETALLE',
  evaluacionEspecificacion: 'EVALUACION_ESPECIFICACION',
  solicitudCotizacionProveedor: 'SOLICITUD_COTIZACION_PROVEEDOR',
};

export function calcularBloqueosProveedor(
  referencias: ReferenciasProveedor,
  lote: LoteProveedor,
): Bloqueo[] {
  const ocSeleccionadas = new Set(lote.ordenesCompra);
  const bloqueos: Bloqueo[] = [];

  for (const campo of Object.keys(TIPO_POR_CAMPO) as (keyof ReferenciasProveedor)[]) {
    const ids = referencias[campo];
    const restantes = campo === 'ordenesCompra' ? ids.filter((id) => !ocSeleccionadas.has(id)) : ids;
    if (restantes.length > 0) {
      bloqueos.push({ tipo: TIPO_POR_CAMPO[campo], cantidad: restantes.length, ids: restantes });
    }
  }

  return bloqueos;
}

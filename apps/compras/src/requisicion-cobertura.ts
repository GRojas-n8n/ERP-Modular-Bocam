export interface GrupoOcEmitido {
  detalles: Array<{ insumo_id: string }>;
}

/**
 * Determina si TODOS los renglones de una Requisición quedaron cubiertos por
 * las OCs que efectivamente se emitieron en el lote de `convertir-oc` (ver
 * capability multi-oc-generacion, delta de este change). Solo se consideran
 * los grupos cuya OC terminó `EMITIDA` — un grupo en `ERROR_FINANZAS` no
 * cuenta como cobertura. Si algún renglón ganador no tiene `detalle_req_id`
 * (no se puede vincular con un item real de la requisición), la cobertura se
 * considera incierta y la función retorna `false` — nunca se asume cobertura
 * completa sin poder verificarla.
 */
export function requisicionQuedoCubiertaPorLote(
  todosLosItemIds: string[],
  gruposEmitidos: GrupoOcEmitido[],
  detalleReqIdPorInsumo: Map<string, string | null>,
): boolean {
  if (todosLosItemIds.length === 0) return false;

  const cubiertos = new Set<string>();
  for (const grupo of gruposEmitidos) {
    for (const d of grupo.detalles) {
      const detalleReqId = detalleReqIdPorInsumo.get(d.insumo_id) ?? null;
      if (!detalleReqId) return false;
      cubiertos.add(detalleReqId);
    }
  }

  return todosLosItemIds.every((id) => cubiertos.has(id));
}

export interface GrupoOcEmitido {
  // insumo_id es null para renglones de texto libre/imprevisto (ver
  // openspec/changes/generar-oc-imprevisto-y-ganador-automatico) — en ese caso
  // detalle_req_id viaja directo, no se deriva del mapa insumo->detalle_req_id.
  detalles: Array<{ insumo_id: string | null; detalle_req_id?: string | null }>;
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
      const detalleReqId = d.detalle_req_id ?? (d.insumo_id ? detalleReqIdPorInsumo.get(d.insumo_id) ?? null : null);
      if (!detalleReqId) return false;
      cubiertos.add(detalleReqId);
    }
  }

  return todosLosItemIds.every((id) => cubiertos.has(id));
}

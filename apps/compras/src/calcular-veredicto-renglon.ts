/**
 * Calcula el veredicto de renglón (ComparativaDetalle.evaluacion_tecnica)
 * como el peor caso entre las evaluaciones por característica de ese
 * renglón×proveedor. Ver openspec/changes/evaluacion-tecnica-por-especificacion.
 * Prioridad: PENDIENTE > NC > ? > DA > C.
 */
export function calcularVeredictoRenglon(evaluaciones: string[]): string {
  if (evaluaciones.includes('PENDIENTE')) return 'PENDIENTE';
  if (evaluaciones.includes('NC')) return 'NC';
  if (evaluaciones.includes('?')) return '?';
  if (evaluaciones.includes('DA')) return 'DA';
  return 'C';
}

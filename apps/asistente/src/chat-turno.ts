import type Anthropic from '@anthropic-ai/sdk';

export interface InvocacionTool {
  nombre: string;
  esError: boolean;
}

/**
 * Reconstruye qué tools se invocaron en un turno (y si fallaron) a partir del
 * historial acumulado de mensajes del Tool Runner. Cruza los bloques
 * `tool_use` (mensajes assistant, dan el nombre) con los `tool_result`
 * (mensajes user, dan si hubo error) por `id`/`tool_use_id`.
 */
export function extraerInvocacionesTools(
  mensajes: Anthropic.Beta.Messages.BetaMessageParam[],
): InvocacionTool[] {
  const nombrePorId = new Map<string, string>();

  for (const mensaje of mensajes) {
    if (mensaje.role !== 'assistant' || typeof mensaje.content === 'string') continue;
    for (const bloque of mensaje.content) {
      if (bloque.type === 'tool_use') {
        nombrePorId.set(bloque.id, bloque.name);
      }
    }
  }

  const invocaciones: InvocacionTool[] = [];
  for (const mensaje of mensajes) {
    if (mensaje.role !== 'user' || typeof mensaje.content === 'string') continue;
    for (const bloque of mensaje.content) {
      if (bloque.type === 'tool_result') {
        const nombre = nombrePorId.get(bloque.tool_use_id) ?? bloque.tool_use_id;
        invocaciones.push({ nombre, esError: bloque.is_error === true });
      }
    }
  }
  return invocaciones;
}

/**
 * Ver openspec/changes/asistente-ia-agente-conversacional
 * spec asistente-degradacion-parcial-cross-servicio: `parcial: true` y la
 * lista de servicios fallidos cuando uno o más tools del turno fallaron.
 */
export function construirParcial(invocaciones: InvocacionTool[]): {
  parcial: boolean;
  servicios_fallidos: string[];
} {
  const serviciosFallidos = [...new Set(invocaciones.filter((i) => i.esError).map((i) => i.nombre))];
  return { parcial: serviciosFallidos.length > 0, servicios_fallidos: serviciosFallidos };
}

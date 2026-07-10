import { Request } from 'express';
import axios from 'axios';
import { betaTool } from '@anthropic-ai/sdk/helpers/beta/json-schema';
import type { BetaRunnableTool } from '@anthropic-ai/sdk/lib/tools/BetaRunnableTool';
import { buildForwardHeaders } from '../../../../packages/observability/src';

// Ver openspec/changes/asistente-ia-agente-conversacional design D4: cada tool
// envuelve una llamada backend-to-backend de solo lectura existente, con su
// propio timeout corto e independiente del timeout total del turno.
const TOOL_TIMEOUT_MS = 5000;

interface CrearToolDashboardOpts {
  nombre: string;
  descripcion: string;
  url: string;
}

/**
 * Registra en `registroTiemposMs` cuánto tardó la tool (éxito o error) para
 * que el turno pueda auditar tiempos de respuesta por tool (ver
 * asistente-auditoria-consultas). Al fallar, lanza — el propio Tool Runner
 * del SDK convierte cualquier excepción en un tool_result con is_error: true,
 * sin interrumpir las demás tools del turno.
 */
export function crearToolDashboard(
  opts: CrearToolDashboardOpts,
  req: Request,
  registroTiemposMs: Map<string, number>,
): BetaRunnableTool {
  return betaTool({
    name: opts.nombre,
    description: opts.descripcion,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => {
      const inicio = Date.now();
      try {
        const headers = buildForwardHeaders(req);
        const resp = await axios.get(opts.url, { headers, timeout: TOOL_TIMEOUT_MS });
        registroTiemposMs.set(opts.nombre, Date.now() - inicio);
        return JSON.stringify(resp.data?.data ?? resp.data ?? {});
      } catch (err) {
        registroTiemposMs.set(opts.nombre, Date.now() - inicio);
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`No se pudo consultar ${opts.nombre}: ${msg}`);
      }
    },
  });
}

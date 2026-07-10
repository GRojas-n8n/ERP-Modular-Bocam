import { Request } from 'express';
import type { BetaRunnableTool } from '@anthropic-ai/sdk/lib/tools/BetaRunnableTool';
import { crearToolCompras } from './compras';
import { crearToolFinanzas } from './finanzas';
import { crearToolControlObra } from './control-obra';
import { crearToolPersonal } from './personal';
import { crearToolSeguridad } from './seguridad';
import { crearToolCalidad } from './calidad';
import { crearToolGerenciaTecnica } from './gerencia-tecnica';

/**
 * Registro central de tools disponibles para /chat. Ver
 * openspec/changes/asistente-ia-agente-conversacional design.md — el
 * subconjunto de microservicios cubierto es el ya wireado en `asistente`
 * (compras, finanzas, control-obra, personal, seguridad, calidad) más
 * gerencia-tecnica (nuevo); ventas/contabilidad/almacen/control-proyectos
 * quedan fuera de este change (Open Question de design.md).
 *
 * `registroTiemposMs` se llena durante la ejecución del turno (cada tool
 * registra su propia duración) y se usa después para el evento de auditoría.
 */
export function crearToolsChat(req: Request, registroTiemposMs: Map<string, number>): BetaRunnableTool[] {
  return [
    crearToolCompras(req, registroTiemposMs),
    crearToolFinanzas(req, registroTiemposMs),
    crearToolControlObra(req, registroTiemposMs),
    crearToolPersonal(req, registroTiemposMs),
    crearToolSeguridad(req, registroTiemposMs),
    crearToolCalidad(req, registroTiemposMs),
    crearToolGerenciaTecnica(req, registroTiemposMs),
  ];
}

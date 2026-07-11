import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

// Migrado a control-proyectos (openspec: fusionar-control-obra-a-control-proyectos)
const CONTROL_PROYECTOS_URL = process.env.CONTROL_PROYECTOS_URL ?? 'http://control-proyectos:3013/api/v1/control-proyectos';

export function crearToolControlObra(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_control_obra',
      descripcion: 'Consulta el dashboard de Control de Obra del proyecto activo: avance físico, estimaciones aprobadas y avances pendientes de validar.',
      url: `${CONTROL_PROYECTOS_URL}/resumen-dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

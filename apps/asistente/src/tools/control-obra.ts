import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const CONTROL_OBRA_URL = process.env.CONTROL_OBRA_URL ?? 'http://control-obra:3005/api/v1/control-obra';

export function crearToolControlObra(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_control_obra',
      descripcion: 'Consulta el dashboard de Control de Obra del proyecto activo: avance físico, estimaciones aprobadas y avances pendientes de validar.',
      url: `${CONTROL_OBRA_URL}/resumen-dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

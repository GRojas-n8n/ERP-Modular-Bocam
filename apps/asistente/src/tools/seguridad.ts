import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const SEGURIDAD_URL = process.env.SEGURIDAD_URL ?? 'http://seguridad:3007/api/v1/seguridad';

export function crearToolSeguridad(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_seguridad',
      descripcion: 'Consulta el dashboard de Seguridad e Higiene (HSE) del proyecto activo: incidentes registrados, días sin accidentes y hallazgos pendientes.',
      url: `${SEGURIDAD_URL}/resumen-dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

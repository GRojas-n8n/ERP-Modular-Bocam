import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const CALIDAD_URL = process.env.CALIDAD_URL ?? 'http://calidad:3009/api/v1/calidad';

export function crearToolCalidad(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_calidad',
      descripcion: 'Consulta el dashboard de Calidad (ISO 9001:2015) del proyecto activo: no conformidades abiertas, hallazgos y estado de auditorías.',
      url: `${CALIDAD_URL}/resumen-dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const PERSONAL_URL = process.env.PERSONAL_URL ?? 'http://personal:3006/api/v1/personal';

export function crearToolPersonal(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_personal',
      descripcion: 'Consulta el dashboard de Recursos Humanos del proyecto activo: empleados activos, cuadrillas y estado de nómina.',
      url: `${PERSONAL_URL}/resumen-dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const GERENCIA_TECNICA_URL = process.env.GERENCIA_TECNICA_URL ?? 'http://gerencia-tecnica:3001/api/v1/gerencia-tecnica';

export function crearToolGerenciaTecnica(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_gerencia_tecnica',
      descripcion: 'Consulta el dashboard de Gerencia Técnica del proyecto activo: comparativos pendientes de aprobación, monto comprometido y alertas de cuadros esperando revisión.',
      url: `${GERENCIA_TECNICA_URL}/dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const FINANZAS_URL = process.env.FINANZAS_URL ?? 'http://finanzas:3004/api/v1/finanzas';

export function crearToolFinanzas(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_finanzas',
      descripcion: 'Consulta el dashboard de Finanzas del proyecto activo: presupuesto autorizado, monto ejercido, pagos pendientes y capítulos de gasto.',
      url: `${FINANZAS_URL}/dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

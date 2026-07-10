import { Request } from 'express';
import { crearToolDashboard } from './http-tool';

const COMPRAS_URL = process.env.COMPRAS_URL ?? 'http://compras:3002/api/v1/compras';

export function crearToolCompras(req: Request, registroTiemposMs: Map<string, number>) {
  return crearToolDashboard(
    {
      nombre: 'consultar_compras',
      descripcion: 'Consulta el dashboard de Compras del proyecto activo: requisiciones pendientes, órdenes de compra por emitir o en proceso, y monto comprometido.',
      url: `${COMPRAS_URL}/resumen-dashboard`,
    },
    req,
    registroTiemposMs,
  );
}

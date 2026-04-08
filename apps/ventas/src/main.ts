import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import { createEventBus } from '../../../packages/event-bus/src';
import { createAuthMiddleware, requireEnv, requireProjectAccess } from '../../../packages/auth-middleware/src';
import {
  buildEventContext,
  createObservabilityMiddleware,
  logError,
  logInfo,
} from '../../../packages/observability/src';
import { buildTerminalHttpResponse } from '../../../packages/tenant-idempotency/src';

const eventBus = createEventBus('ventas');

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('ventas'));

const PORT = process.env.PORT_VENTAS || process.env.PORT || 3012;
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(
  createAuthMiddleware({
    jwtSecret: JWT_SECRET,
    excludePaths: ['/health'],
  })
);
app.use(requireProjectAccess());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'ventas', timestamp: new Date().toISOString() });
});

app.get('/api/v1/ventas/clientes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.cliente.findMany({ orderBy: { razon_social: 'asc' } })
    );
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, message });
  }
});

app.get('/api/v1/ventas/cotizaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.cotizacion.findMany({
        include: { cliente: true },
        orderBy: { fecha_emision: 'desc' },
      })
    );
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, message });
  }
});

app.get('/api/v1/ventas/facturas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) =>
      prisma.factura.findMany({
        include: { cliente: true, cotizacion: true },
        orderBy: { fecha_emision: 'desc' },
      })
    );
    res.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ success: false, message });
  }
});

/**
 * Ejemplo de respuesta terminal alineada con @bocam/tenant-idempotency (mismo patrón que Compras).
 */
app.post('/api/v1/ventas/cotizaciones/:id/aceptar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const updated = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const row = await prisma.cotizacion.findUnique({ where: { id_cotizacion: id } });
      if (!row) {
        return { kind: 'missing' as const };
      }
      if (row.estado === 'ACEPTADA') {
        return { kind: 'already' as const, row };
      }
      const next = await prisma.cotizacion.update({
        where: { id_cotizacion: id },
        data: { estado: 'ACEPTADA' },
      });
      return { kind: 'applied' as const, row: next };
    });

    if (updated.kind === 'missing') {
      return res.status(404).json({ success: false, message: 'Cotización no encontrada.' });
    }

    if (updated.kind === 'already') {
      const response = buildTerminalHttpResponse({
        terminalState: 'idempotent',
        data: {
          ...updated.row,
          subtotal: updated.row.subtotal.toNumber(),
          iva: updated.row.iva.toNumber(),
          total: updated.row.total.toNumber(),
          idempotente: true,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });
      return res.status(response.statusCode).json(response.body);
    }

    await eventBus.publish({
      event_type: 'ventas.cotizacion_aceptada',
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        cotizacion_id: updated.row.id_cotizacion,
        codigo: updated.row.codigo,
        total: updated.row.total.toNumber(),
      },
    });

    logInfo(req, 'ventas', 'ventas.cotizacion.aceptada', 'Cotización aceptada', {
      cotizacion_id: updated.row.id_cotizacion,
    });

    const response = buildTerminalHttpResponse({
      terminalState: 'applied',
      data: {
        ...updated.row,
        subtotal: updated.row.subtotal.toNumber(),
        iva: updated.row.iva.toNumber(),
        total: updated.row.total.toNumber(),
        idempotente: false,
      },
      context: { tenantId, proyectoId },
      buildBody: (result) => ({ success: true, data: result }),
    });
    return res.status(response.statusCode).json(response.body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logError(req, 'ventas', 'ventas.cotizacion.aceptar.error', message, {});
    res.status(500).json({ success: false, message });
  }
});

export async function startServer() {
  return app.listen(PORT, async () => {
    console.log('----------------------------------------------------');
    console.log(` MODULO VENTAS: ACTIVO (Puerto ${PORT})`);
    console.log(' Autenticación: JWT (Bearer Token)');
    console.log('----------------------------------------------------');
    await eventBus.connect();
    console.log('[Ventas] Event bus conectado. Emite: ventas.cotizacion_aceptada');
  });
}

if (require.main === module) {
  void startServer();
}

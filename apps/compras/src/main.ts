import express, { Request, Response } from 'express';
import axios from 'axios';
import { createTenantContext } from './db';
import type { PrismaClient } from './generated/prisma';
import { BocamEvent, createEventBus } from '../../../packages/event-bus/src';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import {
  buildEventContext,
  buildForwardHeaders,
  createObservabilityMiddleware,
  logError,
  logInfo,
  logWarn,
} from '../../../packages/observability/src';
import { applyTerminalMutationInContext, buildTerminalHttpResponse, logTerminalState } from '../../../packages/tenant-idempotency/src';

const eventBus = createEventBus('compras');

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('compras'));

const PORT = process.env.PORT || 3002;
const JWT_SECRET = requireEnv('JWT_SECRET');
const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004/api/v1/finanzas';

const OC_STATUS = {
  PENDIENTE_FINANZAS: 'PENDIENTE_CONFIRMACION_FINANZAS',
  ERROR_FINANZAS: 'ERROR_FINANZAS',
  EMITIDA: 'EMITIDA',
  CANCELACION_PENDIENTE: 'CANCELACION_PENDIENTE',
  CANCELADA: 'CANCELADA',
} as const;

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(requireProjectAccess());

app.get('/api/v1/compras/requisiciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.requisicion.findMany({
        include: { items: true },
        orderBy: { fecha_solicitud: 'desc' }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/compras/requisiciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { codigo, items, observaciones, prioridad } = req.body;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.requisicion.create({
        data: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          codigo: codigo || `REQ-${Date.now()}`,
          solicitante_id: userId,
          prioridad: prioridad || 'NORMAL',
          observaciones,
          items: {
            create: items.map((item: any) => ({
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              insumo_id: item.insumo_id,
              cantidad: item.cantidad,
              notas: item.notas
            }))
          }
        },
        include: { items: true }
      })
    );

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/compras/ordenes-compra', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.findMany({
        include: { items: true, proveedor: true },
        orderBy: { fecha_emision: 'desc' }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/compras/proveedores', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.proveedor.findMany()
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/compras/comparativas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.cuadroComparativo.findMany({
        include: { detalles: { include: { proveedor: true } } },
        orderBy: { fecha_creacion: 'desc' }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/compras/comparativas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.cuadroComparativo.findUnique({
        where: { id_cuadro: id },
        include: { detalles: { include: { proveedor: true } } }
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/compras/comparativas/:id/convertir-oc', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { presupuesto_id } = req.body;
    const token = req.headers.authorization;

    if (!presupuesto_id) {
      return res.status(400).json({
        success: false,
        message: 'Es obligatorio proporcionar un presupuesto_id para validar la suficiencia financiera.'
      });
    }

    const orderSeed = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const comparativa = await prisma.cuadroComparativo.findUnique({
          where: { id_cuadro: id },
          include: { detalles: { where: { es_ganador: true }, include: { proveedor: true } } }
        });

        if (!comparativa || comparativa.detalles.length === 0) {
          throw new Error('No se encontró un proveedor ganador seleccionado en este cuadro.');
        }

        if (comparativa.estado === 'CERRADO') {
          throw new Error('La comparativa ya fue cerrada y no puede convertirse nuevamente.');
        }

        const ganador = comparativa.detalles[0];
        const subtotal = ganador.precio_ofertado.toNumber();
        const montoTotal = subtotal * 1.16;

        return {
          comparativaId: comparativa.id_cuadro,
          proveedorId: ganador.proveedor_id,
          insumoId: ganador.insumo_id,
          subtotal,
          montoTotal,
        };
      }
    );

    try {
      const checkResp = await axios.get(`${FINANZAS_URL}/suficiencia`, {
        params: { monto: orderSeed.montoTotal },
        headers: buildForwardHeaders(req, { Authorization: token || '' }),
      });

      if (!checkResp.data.success || !checkResp.data.data.tiene_suficiencia) {
        throw new Error('PRESUPUESTO_INSUFICIENTE: Finanzas reporta fondos insuficientes para este movimiento.');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      throw new Error(`Error de validación financiera: ${errMsg}`);
    }

    const oc = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.create({
        data: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          proveedor_id: orderSeed.proveedorId,
          codigo: `OC-AUTO-${Date.now()}`,
          subtotal: orderSeed.subtotal,
          iva: orderSeed.subtotal * 0.16,
          total: orderSeed.montoTotal,
          estado: OC_STATUS.PENDIENTE_FINANZAS,
          presupuesto_id,
          items: {
            create: [{
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              insumo_id: orderSeed.insumoId,
              cantidad: 1,
              precio_unitario: orderSeed.subtotal,
              importe: orderSeed.subtotal
            }]
          }
        }
      })
    );

    try {
      await axios.post(`${FINANZAS_URL}/comprometer-fondos`, {
        presupuesto_id,
        monto: oc.total.toNumber(),
        oc_id: oc.id_orden,
        oc_codigo: oc.codigo,
        concepto: `Compromiso por Orden de Compra ${oc.codigo}`
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' }),
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;

      await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          await prisma.ordenCompra.update({
            where: { id_orden: oc.id_orden },
            data: { estado: OC_STATUS.ERROR_FINANZAS }
          });
        }
      );

      return res.status(error.response?.status === 422 ? 422 : 502).json({
        success: false,
        code: 'COMPRAS_OC_PENDIENTE_RESOLUCION',
        message: `La OC fue creada localmente pero Finanzas no confirmó el compromiso: ${errMsg}`,
        data: {
          oc_id: oc.id_orden,
          codigo: oc.codigo,
          estado: OC_STATUS.ERROR_FINANZAS
        }
      });
    }

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const emitida = await prisma.ordenCompra.update({
          where: { id_orden: oc.id_orden },
          data: { estado: OC_STATUS.EMITIDA }
        });

        await prisma.cuadroComparativo.update({
          where: { id_cuadro: orderSeed.comparativaId },
          data: { estado: 'CERRADO' }
        });

        await eventBus.publish({
          event_type: 'compras.oc_creada',
          timestamp: new Date().toISOString(),
          context: buildEventContext(req),
          payload: {
            oc_id: emitida.id_orden,
            codigo: emitida.codigo,
            total: emitida.total.toNumber(),
            proveedor_id: emitida.proveedor_id,
            presupuesto_id: emitida.presupuesto_id,
          },
        });

        return emitida;
      }
    );

    logInfo(req, 'compras', 'compras.orden_compra.emitida', 'Orden de compra emitida y confirmada por Finanzas', {
      comparativa_id: orderSeed.comparativaId,
      oc_id: result.id_orden,
      oc_codigo: result.codigo,
      presupuesto_id,
      downstream_module: 'finanzas',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    logError(req, 'compras', 'compras.orden_compra.emitir.error', 'Error en conversion de comparativa a orden de compra', {
      error_message: error.message,
    });
    console.error('[Compras] Error en conversión OC:', error.message);
    res.status(error.message.includes('PRESUPUESTO_INSUFICIENTE') ? 422 : 500)
      .json({ success: false, message: error.message });
  }
});

app.get('/api/v1/compras/ordenes-compra/reconciliacion/pendientes', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.findMany({
        where: {
          estado: {
            in: [OC_STATUS.ERROR_FINANZAS, OC_STATUS.CANCELACION_PENDIENTE],
          },
        },
        include: { proveedor: true, items: true },
        orderBy: { fecha_emision: 'desc' },
      })
    );

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'compras', timestamp: new Date().toISOString() });
});

app.post('/api/v1/compras/ordenes-compra/:id/cancelar', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const token = req.headers.authorization;

    const oc = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const found = await prisma.ordenCompra.findUnique({
          where: { id_orden: id }
        });

        if (!found) {
          throw new Error('Orden de Compra no encontrada.');
        }

        if (found.estado === OC_STATUS.CANCELADA) {
          throw new Error('La Orden de Compra ya está cancelada.');
        }

        if (found.estado === 'RECIBIDA' || found.estado === 'COBRADA') {
          throw new Error('No se puede cancelar una OC que ya ha sido recibida o cobrada.');
        }

        if (found.estado === OC_STATUS.CANCELACION_PENDIENTE) {
          throw new Error('La Orden de Compra ya está pendiente de confirmación de cancelación.');
        }

        return found;
      }
    );

    if (oc.presupuesto_id) {
      await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          await prisma.ordenCompra.update({
            where: { id_orden: id },
            data: { estado: OC_STATUS.CANCELACION_PENDIENTE }
          });
        }
      );

      try {
        await axios.post(`${FINANZAS_URL}/liberar-fondos`, {
          presupuesto_id: oc.presupuesto_id,
          monto: oc.total.toNumber(),
          oc_id: oc.id_orden,
          oc_codigo: oc.codigo,
          concepto: `Liberación por cancelación de OC ${oc.codigo}`
        }, {
          headers: buildForwardHeaders(req, { Authorization: token || '' })
        });
      } catch (error: any) {
        const errMsg = error.response?.data?.error?.message || error.message;
        logWarn(req, 'compras', 'compras.orden_compra.cancelacion_pendiente', 'Finanzas no confirmo la liberacion durante la cancelacion de la OC', {
          oc_id: oc.id_orden,
          oc_codigo: oc.codigo,
          presupuesto_id: oc.presupuesto_id,
          downstream_module: 'finanzas',
          error_message: errMsg,
        });
        console.error('[Compras] Error liberando fondos:', errMsg);
        return res.status(502).json({
          success: false,
          message: `La OC quedó en cancelación pendiente porque Finanzas no confirmó la liberación: ${errMsg}`,
          data: {
            oc_id: oc.id_orden,
            codigo: oc.codigo,
            estado: OC_STATUS.CANCELACION_PENDIENTE
          }
        });
      }
    }

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const cancelada = await prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: OC_STATUS.CANCELADA }
        });

        await eventBus.publish({
          event_type: 'compras.oc_cancelada',
          timestamp: new Date().toISOString(),
          context: buildEventContext(req),
          payload: {
            oc_id: cancelada.id_orden,
            codigo: cancelada.codigo,
            total: cancelada.total.toNumber(),
            presupuesto_id: cancelada.presupuesto_id,
          },
        });

        return cancelada;
      }
    );

    logInfo(req, 'compras', 'compras.orden_compra.cancelada', 'Orden de compra cancelada y conciliada con Finanzas', {
      oc_id: result.id_orden,
      oc_codigo: result.codigo,
      presupuesto_id: result.presupuesto_id,
      downstream_module: 'finanzas',
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    logError(req, 'compras', 'compras.orden_compra.cancelar.error', 'Error cancelando orden de compra', {
      error_message: error.message,
    });
    console.error('[Compras] Error cancelando OC:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/compras/ordenes-compra/:id/reconciliar-finanzas', requireRoles('admin', 'superintendent', 'procurement'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const token = req.headers.authorization;

    const oc = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.ordenCompra.findUnique({
        where: { id_orden: id },
      })
    );

    if (!oc) {
      return res.status(404).json({ success: false, message: 'Orden de Compra no encontrada.' });
    }

    if (oc.estado === OC_STATUS.EMITIDA || oc.estado === OC_STATUS.CANCELADA) {
      const response = buildTerminalHttpResponse({
        terminalState: 'idempotent',
        data: {
          ...oc,
          total: oc.total.toNumber(),
          idempotente: true,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });

      return res.status(response.statusCode).json(response.body);
    }

    if (oc.estado === OC_STATUS.ERROR_FINANZAS) {
      if (!oc.presupuesto_id) {
        return res.status(422).json({ success: false, message: 'La OC no tiene presupuesto_id para reconciliar.' });
      }

      await axios.post(`${FINANZAS_URL}/comprometer-fondos`, {
        presupuesto_id: oc.presupuesto_id,
        monto: oc.total.toNumber(),
        oc_id: oc.id_orden,
        oc_codigo: oc.codigo,
        concepto: `Reconciliación de compromiso por Orden de Compra ${oc.codigo}`
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' })
      });

      const updated = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: OC_STATUS.EMITIDA },
        })
      );

      const response = buildTerminalHttpResponse({
        terminalState: 'applied',
        data: {
          ...updated,
          total: updated.total.toNumber(),
          idempotente: false,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });

      return res.status(response.statusCode).json(response.body);
    }

    if (oc.estado === OC_STATUS.CANCELACION_PENDIENTE) {
      if (!oc.presupuesto_id) {
        const updated = await createTenantContext(
          { tenantId, proyectoId, userId },
          async (prisma) => prisma.ordenCompra.update({
            where: { id_orden: id },
            data: { estado: OC_STATUS.CANCELADA },
          })
        );

        const response = buildTerminalHttpResponse({
          terminalState: 'applied',
          data: {
            ...updated,
            total: updated.total.toNumber(),
            idempotente: false,
          },
          context: { tenantId, proyectoId },
          buildBody: (result) => ({ success: true, data: result }),
        });

        return res.status(response.statusCode).json(response.body);
      }

      await axios.post(`${FINANZAS_URL}/liberar-fondos`, {
        presupuesto_id: oc.presupuesto_id,
        monto: oc.total.toNumber(),
        oc_id: oc.id_orden,
        oc_codigo: oc.codigo,
        concepto: `Reconciliación de liberación por cancelación de OC ${oc.codigo}`
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' })
      });

      const updated = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.ordenCompra.update({
          where: { id_orden: id },
          data: { estado: OC_STATUS.CANCELADA },
        })
      );

      await eventBus.publish({
        event_type: 'compras.oc_cancelada',
        timestamp: new Date().toISOString(),
        context: buildEventContext(req),
        payload: {
          oc_id: updated.id_orden,
          codigo: updated.codigo,
          total: updated.total.toNumber(),
          presupuesto_id: updated.presupuesto_id,
        },
      });

      const response = buildTerminalHttpResponse({
        terminalState: 'applied',
        data: {
          ...updated,
          total: updated.total.toNumber(),
          idempotente: false,
        },
        context: { tenantId, proyectoId },
        buildBody: (result) => ({ success: true, data: result }),
      });

      return res.status(response.statusCode).json(response.body);
    }

    return res.status(409).json({
      success: false,
      message: `La OC no requiere reconciliación financiera. Estado actual: ${oc.estado}`,
    });
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(502).json({ success: false, message: errMsg });
  }
});

export async function handleFondosComprometidosEvent(event: BocamEvent): Promise<void> {
  const {
    referencia_oc_id,
    referencia_oc_codigo,
    presupuesto_id,
  } = event.payload as {
    referencia_oc_id?: string;
    referencia_oc_codigo?: string;
    presupuesto_id?: string;
  };

  if (!referencia_oc_id || !referencia_oc_codigo || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'compras.event.finanzas.fondos_comprometidos.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_oc_id,
      presupuesto_id,
    }));
    return;
  }

  type FondosComprometidosLoaded = {
    oc: Awaited<ReturnType<PrismaClient['ordenCompra']['findUnique']>>;
  };

  type FondosComprometidosResult =
    | {
        status: 'oc_not_found';
      }
    | {
        status: 'idempotent';
        oc_codigo: string;
      }
    | {
        status: 'applied';
        oc_codigo: string;
      };

  const result = await applyTerminalMutationInContext<
    { tenantId: string; proyectoId: string; userId: string },
    PrismaClient,
    FondosComprometidosLoaded,
    { status: 'oc_not_found' },
    { status: 'idempotent'; oc_codigo: string },
    { status: 'applied'; oc_codigo: string }
  >({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    runInContext: createTenantContext,
    load: async (prisma) => {
      const oc = await prisma.ordenCompra.findUnique({
        where: { id_orden: referencia_oc_id },
      });

      return { oc };
    },
    notFoundResult: async (loaded) => {
      if (loaded.oc) {
        return null;
      }

      logTerminalState({
        terminalState: 'not_found',
        actions: {
          notFound: 'compras.event.finanzas.fondos_comprometidos.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_comprometidos.idempotent',
          applied: 'compras.event.finanzas.fondos_comprometidos.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
        },
      });

      return { status: 'oc_not_found' };
    },
    idempotentResult: async (loaded) => {
      if (!loaded.oc || loaded.oc.estado !== OC_STATUS.EMITIDA) {
        return null;
      }

      logTerminalState({
        terminalState: 'idempotent',
        actions: {
          notFound: 'compras.event.finanzas.fondos_comprometidos.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_comprometidos.idempotent',
          applied: 'compras.event.finanzas.fondos_comprometidos.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: loaded.oc.codigo,
        },
      });

      return {
        status: 'idempotent',
        oc_codigo: loaded.oc.codigo,
      };
    },
    apply: async (loaded, prisma) => {
      await prisma.ordenCompra.update({
        where: { id_orden: referencia_oc_id },
        data: { estado: OC_STATUS.EMITIDA },
      });

      return {
        status: 'applied',
        oc_codigo: loaded.oc!.codigo,
      };
    },
  });

  if (result.status === 'applied') {
    logTerminalState({
      terminalState: 'applied',
      actions: {
        notFound: 'compras.event.finanzas.fondos_comprometidos.oc_not_found',
        idempotent: 'compras.event.finanzas.fondos_comprometidos.idempotent',
        applied: 'compras.event.finanzas.fondos_comprometidos.applied',
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: {
        referencia_oc_id,
        oc_codigo: result.oc_codigo,
      },
    });
  }
}

export async function handleFondosLiberadosEvent(event: BocamEvent): Promise<void> {
  const {
    referencia_oc_id,
    referencia_oc_codigo,
    presupuesto_id,
  } = event.payload as {
    referencia_oc_id?: string;
    referencia_oc_codigo?: string;
    presupuesto_id?: string;
  };

  if (!referencia_oc_id || !referencia_oc_codigo || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'compras.event.finanzas.fondos_liberados.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_oc_id,
      presupuesto_id,
    }));
    return;
  }

  type FondosLiberadosLoaded = {
    oc: Awaited<ReturnType<PrismaClient['ordenCompra']['findUnique']>>;
  };

  type FondosLiberadosResult =
    | {
        status: 'oc_not_found';
      }
    | {
        status: 'idempotent';
        oc_codigo: string;
      }
    | {
        status: 'applied';
        oc_codigo: string;
      };

  const result = await applyTerminalMutationInContext<
    { tenantId: string; proyectoId: string; userId: string },
    PrismaClient,
    FondosLiberadosLoaded,
    { status: 'oc_not_found' },
    { status: 'idempotent'; oc_codigo: string },
    { status: 'applied'; oc_codigo: string }
  >({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    runInContext: createTenantContext,
    load: async (prisma) => {
      const oc = await prisma.ordenCompra.findUnique({
        where: { id_orden: referencia_oc_id },
      });

      return { oc };
    },
    notFoundResult: async (loaded) => {
      if (loaded.oc) {
        return null;
      }

      logTerminalState({
        terminalState: 'not_found',
        actions: {
          notFound: 'compras.event.finanzas.fondos_liberados.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_liberados.idempotent',
          applied: 'compras.event.finanzas.fondos_liberados.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
        },
      });

      return { status: 'oc_not_found' };
    },
    idempotentResult: async (loaded) => {
      if (!loaded.oc || loaded.oc.estado !== OC_STATUS.CANCELADA) {
        return null;
      }

      logTerminalState({
        terminalState: 'idempotent',
        actions: {
          notFound: 'compras.event.finanzas.fondos_liberados.oc_not_found',
          idempotent: 'compras.event.finanzas.fondos_liberados.idempotent',
          applied: 'compras.event.finanzas.fondos_liberados.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: loaded.oc.codigo,
        },
      });

      return {
        status: 'idempotent',
        oc_codigo: loaded.oc.codigo,
      };
    },
    apply: async (loaded, prisma) => {
      await prisma.ordenCompra.update({
        where: { id_orden: referencia_oc_id },
        data: { estado: OC_STATUS.CANCELADA },
      });

      return {
        status: 'applied',
        oc_codigo: loaded.oc!.codigo,
      };
    },
  });

  if (result.status === 'applied') {
    logTerminalState({
      terminalState: 'applied',
      actions: {
        notFound: 'compras.event.finanzas.fondos_liberados.oc_not_found',
        idempotent: 'compras.event.finanzas.fondos_liberados.idempotent',
        applied: 'compras.event.finanzas.fondos_liberados.applied',
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: {
        referencia_oc_id,
        oc_codigo: result.oc_codigo,
      },
    });
  }
}

export async function handlePresupuestoInsuficienteEvent(event: BocamEvent): Promise<void> {
  const {
    referencia_oc_id,
    referencia_oc_codigo,
    presupuesto_id,
  } = event.payload as {
    referencia_oc_id?: string;
    referencia_oc_codigo?: string;
    presupuesto_id?: string;
  };

  if (!referencia_oc_id || !referencia_oc_codigo || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'compras.event.finanzas.presupuesto_insuficiente.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_oc_id,
      presupuesto_id,
    }));
    return;
  }

  await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const oc = await prisma.ordenCompra.findUnique({
        where: { id_orden: referencia_oc_id },
      });

      if (!oc) {
        logTerminalState({
          terminalState: 'not_found',
          actions: {
            notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
            idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
            applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
          },
          context: {
            eventType: event.event_type,
            correlationId: event.context.correlation_id,
            tenantId: event.context.tenant_id,
            proyectoId: event.context.proyecto_id,
          },
          extras: {
            referencia_oc_id,
          },
        });
        return;
      }

      if (oc.estado === OC_STATUS.ERROR_FINANZAS) {
        logTerminalState({
          terminalState: 'idempotent',
          actions: {
            notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
            idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
            applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
          },
          context: {
            eventType: event.event_type,
            correlationId: event.context.correlation_id,
            tenantId: event.context.tenant_id,
            proyectoId: event.context.proyecto_id,
          },
          extras: {
            referencia_oc_id,
            oc_codigo: oc.codigo,
          },
        });
        return;
      }

      await prisma.ordenCompra.update({
        where: { id_orden: referencia_oc_id },
        data: { estado: OC_STATUS.ERROR_FINANZAS },
      });

      logTerminalState({
        terminalState: 'applied',
        actions: {
          notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
          idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
          applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: oc.codigo,
        },
      });
    }
  );
}

export async function startServer() {
  return app.listen(PORT, async () => {
  console.log('----------------------------------------------------');
  console.log(` MODULO COMPRAS: ACTIVO (Puerto ${PORT})`);
  console.log(' Autenticación: JWT REAL (Bearer Token)');
  console.log('----------------------------------------------------');

  await eventBus.connect();
  await eventBus.subscribe('finanzas.fondos_comprometidos', handleFondosComprometidosEvent);
  await eventBus.subscribe('finanzas.fondos_liberados', handleFondosLiberadosEvent);
  await eventBus.subscribe('finanzas.presupuesto_insuficiente', handlePresupuestoInsuficienteEvent);
  console.log('[Compras] Eventos: compras.oc_creada, compras.oc_cancelada, finanzas.fondos_comprometidos, finanzas.fondos_liberados, finanzas.presupuesto_insuficiente');
  });
}

if (require.main === module) {
  void startServer();
}

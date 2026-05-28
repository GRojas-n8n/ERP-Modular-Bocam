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
    const { codigo, items, observaciones, prioridad, tipo } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere al menos un ítem en la requisición.' });
    }

    const tipoReq: string = tipo === 'IMPREVISTO' ? 'IMPREVISTO' : 'NORMAL';

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.requisicion.create({
        data: {
          tenant_id:     tenantId,
          proyecto_id:   proyectoId,
          codigo:        codigo || `REQ-${Date.now()}`,
          solicitante_id: userId,
          prioridad:     prioridad || 'NORMAL',
          estado:        'PENDIENTE', // siempre inicia PENDIENTE — requiere aprobación de procurement
          tipo:          tipoReq,
          observaciones,
          items: {
            create: items.map((item: any) => ({
              tenant_id:         tenantId,
              proyecto_id:       proyectoId,
              insumo_id:         item.insumo_id   || null,
              cantidad:          item.cantidad,
              notas:             item.notas        || null,
              descripcion_libre: item.descripcion_libre || null,
              unidad_libre:      item.unidad_libre       || null,
              es_imprevisto:     Boolean(item.es_imprevisto),
            }))
          }
        },
        include: { items: true }
      })
    );

    logInfo(req, 'compras', 'compras.requisicion_creada', `Requisición ${data.codigo} creada`, {
      tipo: tipoReq, items: items.length,
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    logError(req, 'compras', 'compras.requisicion_create_error', 'Error al crear requisición', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/v1/compras/requisiciones/:id/aprobar
 * Procurement o Admin aprueba una requisición PENDIENTE → APROBADA.
 * Sólo cambia el estado — no modifica ítems ni prioridad.
 */
app.patch(
  '/api/v1/compras/requisiciones/:id/aprobar',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const req_obj = await prisma.requisicion.findUnique({
            where: { id_requisicion: id },
          });
          if (!req_obj) {
            return null;
          }
          if (req_obj.estado === 'APROBADA') {
            return req_obj; // idempotente: ya estaba aprobada
          }
          if (!['PENDIENTE', 'BORRADOR'].includes(req_obj.estado)) {
            throw new Error(`La requisición está en estado ${req_obj.estado} y no puede aprobarse.`);
          }
          return prisma.requisicion.update({
            where: { id_requisicion: id },
            data: { estado: 'APROBADA' },
            include: { items: true },
          });
        }
      );

      if (!data) {
        return res.status(404).json({ success: false, message: 'Requisición no encontrada.' });
      }

      logInfo(req, 'compras', 'compras.requisicion_aprobada', `Requisición ${(data as any).codigo} aprobada por ${userId}`);

      try {
        await eventBus.publish({
          event_type:  'compras.requisicion_aprobada',
          timestamp:   new Date().toISOString(),
          context:     buildEventContext(req),
          payload: {
            requisicion_id: id,
            codigo:         (data as any).codigo,
            tipo:           (data as any).tipo,
            prioridad:      (data as any).prioridad,
            aprobado_por:   userId,
          },
        });
      } catch (_) { /* EventBus offline — degradación elegante */ }

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.requisicion_aprobar_error', 'Error al aprobar requisición', { error_message: error.message });
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

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

// ── Bandejas de trabajo (deben ir ANTES de /:id para que Express no capture el path estático) ──

// GET pendientes-evaluacion — bandeja del Residente
app.get('/api/v1/compras/comparativas/pendientes-evaluacion',
  requireRoles('resident', 'control_obra', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.cuadroComparativo.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'EN_EVALUACION_TECNICA' },
          include: { detalles: { include: { proveedor: true } } },
          orderBy: { fecha_creacion: 'desc' },
        })
      );
      logInfo(req, 'compras', 'compras.comparativas.pendientes_evaluacion.listadas', 'Bandeja evaluación técnica consultada', { total: data.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativas.pendientes_evaluacion.error', 'Error al listar pendientes de evaluación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET pendientes-gt — bandeja del Gerente Técnico
app.get('/api/v1/compras/comparativas/pendientes-gt',
  requireRoles('gerencia_tecnica', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.cuadroComparativo.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'EN_APROBACION_GT' },
          include: { detalles: { include: { proveedor: true } } },
          orderBy: { fecha_creacion: 'desc' },
        })
      );
      logInfo(req, 'compras', 'compras.comparativas.pendientes_gt.listadas', 'Bandeja aprobación GT consultada', { total: data.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativas.pendientes_gt.error', 'Error al listar pendientes de GT', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

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
          // 5.2: filtrar solo detalles con aprobacion_gt=APROBADO y es_ganador=true
          include: { detalles: { where: { es_ganador: true, aprobacion_gt: 'APROBADO' }, include: { proveedor: true } } }
        });

        if (!comparativa) {
          throw new Error('Cuadro comparativo no encontrado.');
        }

        // 5.1: solo se puede convertir si el cuadro fue aprobado por GT
        if (comparativa.estado !== 'APROBADO_GT') {
          throw new Error(`La OC solo puede generarse de un cuadro aprobado por Gerencia Técnica. Estado actual: ${comparativa.estado}`);
        }

        if (comparativa.detalles.length === 0) {
          throw new Error('No hay renglones aprobados por Gerencia Técnica con proveedor ganador seleccionado.');
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

      // ── [ALERTA] 2.1 Persistir inconsistencia en BD (idempotente por @@unique[tenant_id, oc_id]) ──
      await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          await prisma.alertaOcError.upsert({
            where: { tenant_id_oc_id: { tenant_id: tenantId, oc_id: oc.id_orden } },
            update: { error_message: errMsg, updated_at: new Date() },
            create: {
              tenant_id: tenantId,
              proyecto_id: proyectoId,
              oc_id: oc.id_orden,
              oc_codigo: oc.codigo,
              presupuesto_id: presupuesto_id ?? null,
              error_message: errMsg,
            },
          });
        }
      );
      logInfo(req, 'compras', 'compras.oc_error_finanzas.alerta_creada',
        'Alerta de OC en ERROR_FINANZAS persistida en BD', {
          oc_id: oc.id_orden,
          oc_codigo: oc.codigo,
          presupuesto_id,
        });

      // ── [ALERTA] 2.2 + 2.3 Publicar evento al bus (best-effort, usa buildEventContext) ──
      try {
        await eventBus.publish({
          event_type: 'compras.oc_error_finanzas',
          timestamp: new Date().toISOString(),
          context: buildEventContext(req),
          payload: {
            oc_id: oc.id_orden,
            oc_codigo: oc.codigo,
            presupuesto_id: presupuesto_id ?? null,
            error_message: errMsg,
          },
        });
      } catch (busError: any) {
        logWarn(req, 'compras', 'compras.oc_error_finanzas.bus_offline',
          'EventBus no disponible al publicar alerta — la alerta ya persiste en BD', {
            oc_id: oc.id_orden,
            bus_error: busError.message,
          });
      }

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

        // 5.3: solo cerrar el cuadro cuando la OC queda EMITIDA (no en ERROR_FINANZAS)
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

// ── Crear cuadro comparativo ──────────────────────────────────────────────────

// POST /comparativas — crea un cuadro comparativo para una requisición (idempotente)
app.post('/api/v1/compras/comparativas',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { requisicion_id } = req.body;

      if (!requisicion_id) {
        return res.status(400).json({ success: false, message: 'Se requiere requisicion_id.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // Idempotente: si ya existe, devolver el existente
          const existing = await prisma.cuadroComparativo.findFirst({
            where: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id },
            include: { detalles: { include: { proveedor: true } } },
          });
          if (existing) return existing;

          return prisma.cuadroComparativo.create({
            data: {
              tenant_id:      tenantId,
              proyecto_id:    proyectoId,
              requisicion_id,
              codigo:         `CC-${Date.now()}`,
              estado:         'BORRADOR',
            },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      logInfo(req, 'compras', 'compras.comparativa.creada', `Cuadro comparativo ${(data as any).codigo} creado`, { requisicion_id });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.crear.error', 'Error al crear cuadro comparativo', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /comparativas/:id/cotizaciones — guarda proveedores y precios de cotización (batch upsert)
// Body: { proveedores: [{ nombre: string, precios: [{ insumo_id, precio, tiempo_entrega? }] }] }
app.put('/api/v1/compras/comparativas/:id/cotizaciones',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { proveedores } = req.body as {
        proveedores: Array<{
          nombre: string;
          precios: Array<{ insumo_id: string; precio: number; tiempo_entrega?: string }>;
        }>;
      };

      if (!Array.isArray(proveedores)) {
        return res.status(400).json({ success: false, message: 'proveedores debe ser un array.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // Verificar que el cuadro existe
          const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: id } });
          if (!cuadro) throw new Error('Cuadro comparativo no encontrado.');
          if (cuadro.estado !== 'BORRADOR') throw new Error(`El cuadro está en estado ${cuadro.estado} y no puede modificarse.`);

          // Eliminar detalles anteriores para hacer un reemplazo limpio
          await prisma.comparativaDetalle.deleteMany({ where: { cuadro_id: id } });

          // Crear/encontrar proveedores y sus detalles
          for (const prov of proveedores) {
            if (!prov.nombre?.trim()) continue;
            // Buscar o crear proveedor por nombre (dentro del tenant)
            let proveedor = await prisma.proveedor.findFirst({
              where: { tenant_id: tenantId, razon_social: prov.nombre.trim() },
            });
            if (!proveedor) {
              proveedor = await prisma.proveedor.create({
                data: {
                  tenant_id:      tenantId,
                  rfc_tax_id:     `RFC-${Date.now()}`, // placeholder hasta tener RFC real
                  razon_social:   prov.nombre.trim(),
                  estatus:        'ACTIVO',
                },
              });
            }

            // Crear detalles (un detalle por insumo por proveedor)
            for (const p of prov.precios || []) {
              if (!p.insumo_id || p.precio === undefined) continue;
              await prisma.comparativaDetalle.create({
                data: {
                  tenant_id:      tenantId,
                  proyecto_id:    proyectoId,
                  cuadro_id:      id,
                  proveedor_id:   proveedor.id_proveedor,
                  insumo_id:      p.insumo_id,
                  precio_ofertado: p.precio,
                  tiempo_entrega: p.tiempo_entrega || null,
                },
              });
            }
          }

          // Devolver cuadro actualizado
          return prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      logInfo(req, 'compras', 'compras.comparativa.cotizaciones.guardadas', `Cotizaciones guardadas para cuadro ${id}`, { proveedores: proveedores.length });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.cotizaciones.error', 'Error al guardar cotizaciones', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Flujo de aprobación en dos etapas del Cuadro Comparativo ─────────────────

// 2.1 PATCH enviar-evaluacion — Compras envía al Residente
app.patch('/api/v1/compras/comparativas/:id/enviar-evaluacion',
  requireRoles('procurement', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado !== 'BORRADOR') {
            return res.status(400).json({
              success: false,
              message: `Solo se pueden enviar a evaluación cuadros en estado BORRADOR. Estado actual: ${cuadro.estado}`,
            });
          }

          if (cuadro.detalles.length === 0) {
            return res.status(400).json({ success: false, message: 'El cuadro no tiene renglones para evaluar.' });
          }

          // Marcar todos los detalles como PENDIENTE de evaluación técnica
          await prisma.comparativaDetalle.updateMany({
            where: { cuadro_id: id, tenant_id: tenantId },
            data: { evaluacion_tecnica: 'PENDIENTE' },
          });

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: { estado: 'EN_EVALUACION_TECNICA' },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.enviada_evaluacion', 'Cuadro enviado a evaluación técnica', { cuadro_id: id });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.enviar_evaluacion.error', 'Error al enviar cuadro a evaluación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 2.2 PATCH evaluar — Residente registra evaluación técnica por renglón
app.patch('/api/v1/compras/comparativas/:id/evaluar',
  requireRoles('resident', 'control_obra', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { evaluaciones } = req.body as {
        evaluaciones: { detalle_id: string; evaluacion_tecnica: 'APROBADO' | 'RECHAZADO'; comentario_tecnico?: string }[];
      };

      if (!evaluaciones || !Array.isArray(evaluaciones) || evaluaciones.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere un array "evaluaciones" con al menos un ítem.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado !== 'EN_EVALUACION_TECNICA') {
            return res.status(400).json({
              success: false,
              message: `El cuadro no está en evaluación técnica. Estado actual: ${cuadro.estado}`,
            });
          }

          // Validar que los detalle_id pertenecen a este cuadro
          const detalleIds = new Set(cuadro.detalles.map(d => d.id_detalle));
          const invalid = evaluaciones.find(e => !detalleIds.has(e.detalle_id));
          if (invalid) {
            return res.status(400).json({
              success: false,
              message: `Renglón ${invalid.detalle_id} no pertenece a este cuadro comparativo.`,
            });
          }

          // Actualizar evaluación técnica por renglón
          await Promise.all(
            evaluaciones.map(ev =>
              prisma.comparativaDetalle.update({
                where: { id_detalle: ev.detalle_id },
                data: {
                  evaluacion_tecnica: ev.evaluacion_tecnica,
                  comentario_tecnico: ev.comentario_tecnico ?? null,
                },
              })
            )
          );

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: {
              estado: 'EVALUADO_TECNICAMENTE',
              evaluacion_residente_id: userId,
              fecha_evaluacion_tecnica: new Date(),
            },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.evaluada_tecnicamente', 'Evaluación técnica registrada', { cuadro_id: id, evaluador: userId });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.evaluar.error', 'Error al registrar evaluación técnica', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 2.3 PATCH enviar-gt — Residente/Compras envía al Gerente Técnico
app.patch('/api/v1/compras/comparativas/:id/enviar-gt',
  requireRoles('resident', 'control_obra', 'procurement', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado !== 'EVALUADO_TECNICAMENTE') {
            return res.status(400).json({
              success: false,
              message: `El cuadro no está en estado EVALUADO_TECNICAMENTE. Estado actual: ${cuadro.estado}`,
            });
          }

          const hayAprobados = cuadro.detalles.some(d => d.evaluacion_tecnica === 'APROBADO');
          if (!hayAprobados) {
            return res.status(400).json({
              success: false,
              message: 'Sin renglones aprobados técnicamente — no es posible remitir al Gerente Técnico.',
            });
          }

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: { estado: 'EN_APROBACION_GT' },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;
      logInfo(req, 'compras', 'compras.comparativa.enviada_gt', 'Cuadro enviado a aprobación de Gerencia Técnica', { cuadro_id: id });
      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.enviar_gt.error', 'Error al enviar cuadro al GT', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 2.4 + 3.1 PATCH revisar-gt — Gerente Técnico aprueba/rechaza por renglón + evento
app.patch('/api/v1/compras/comparativas/:id/revisar-gt',
  requireRoles('gerencia_tecnica', 'superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { aprobaciones, comentario_gt_general } = req.body as {
        aprobaciones: { detalle_id: string; aprobacion_gt: 'APROBADO' | 'RECHAZADO'; comentario_gt?: string }[];
        comentario_gt_general?: string;
      };

      if (!aprobaciones || !Array.isArray(aprobaciones) || aprobaciones.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere un array "aprobaciones" con al menos un ítem.' });
      }

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const cuadro = await prisma.cuadroComparativo.findUnique({
            where: { id_cuadro: id },
            include: { detalles: true },
          });

          if (!cuadro) return res.status(404).json({ success: false, message: 'Cuadro comparativo no encontrado.' });

          if (cuadro.estado !== 'EN_APROBACION_GT') {
            return res.status(400).json({
              success: false,
              message: `El cuadro no está en aprobación GT. Estado actual: ${cuadro.estado}`,
            });
          }

          // Mapa de detalles para validación rápida
          const detalleMap = new Map(cuadro.detalles.map(d => [d.id_detalle, d]));

          // Regla: GT no puede APROBAR un renglón rechazado por el Residente
          for (const ap of aprobaciones) {
            const detalle = detalleMap.get(ap.detalle_id);
            if (!detalle) {
              return res.status(400).json({
                success: false,
                message: `Renglón ${ap.detalle_id} no pertenece a este cuadro comparativo.`,
              });
            }
            if (ap.aprobacion_gt === 'APROBADO' && detalle.evaluacion_tecnica === 'RECHAZADO') {
              return res.status(400).json({
                success: false,
                message: `No es posible aprobar el renglón ${detalle.id_detalle}: fue rechazado en la evaluación técnica del Residente.`,
              });
            }
          }

          // Actualizar aprobación GT por renglón
          await Promise.all(
            aprobaciones.map(ap =>
              prisma.comparativaDetalle.update({
                where: { id_detalle: ap.detalle_id },
                data: {
                  aprobacion_gt: ap.aprobacion_gt,
                  comentario_gt: ap.comentario_gt ?? null,
                },
              })
            )
          );

          // Determinar estado final: si al menos uno aprobado → APROBADO_GT, si todos rechazados → RECHAZADO_GT
          const hayAprobadosGT = aprobaciones.some(ap => ap.aprobacion_gt === 'APROBADO');
          const estadoFinal = hayAprobadosGT ? 'APROBADO_GT' : 'RECHAZADO_GT';

          return prisma.cuadroComparativo.update({
            where: { id_cuadro: id },
            data: {
              estado: estadoFinal,
              gerente_tecnico_id: userId,
              fecha_aprobacion_gt: new Date(),
              comentario_gt_general: comentario_gt_general ?? null,
            },
            include: { detalles: { include: { proveedor: true } } },
          });
        }
      );

      if (res.headersSent) return;

      const cuadroActualizado = result as any;
      const estadoFinal = cuadroActualizado.estado;
      const renglones_aprobados = (cuadroActualizado.detalles || []).filter((d: any) => d.aprobacion_gt === 'APROBADO').length;

      logInfo(req, 'compras', `compras.comparativa.${estadoFinal === 'APROBADO_GT' ? 'aprobada_gt' : 'rechazada_gt'}`,
        `Cuadro comparativo ${estadoFinal} por Gerencia Técnica`,
        { cuadro_id: id, estado_final: estadoFinal, renglones_aprobados, gerente_id: userId }
      );

      // 3.1 Publicar evento al bus (best-effort)
      if (estadoFinal === 'APROBADO_GT') {
        try {
          await eventBus.publish({
            event_type: 'compras.comparativa_aprobada_gt',
            timestamp: new Date().toISOString(),
            context: buildEventContext(req),
            payload: {
              cuadro_id: id,
              codigo: cuadroActualizado.codigo,
              requisicion_id: cuadroActualizado.requisicion_id,
              renglones_aprobados,
            },
          });
        } catch (_) {
          logWarn(req, 'compras', 'compras.comparativa_aprobada_gt.bus_offline',
            'EventBus no disponible al publicar comparativa_aprobada_gt — la aprobación ya está persistida', { cuadro_id: id });
        }
      }

      res.json({ success: true, data: result });
    } catch (error: any) {
      logError(req, 'compras', 'compras.comparativa.revisar_gt.error', 'Error en revisión GT', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

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

      // ── [ALERTA] 3.1 Persistir alerta en BD (mismo contexto RLS, idempotente) ──────
      await prisma.alertaOcError.upsert({
        where: { tenant_id_oc_id: { tenant_id: event.context.tenant_id, oc_id: referencia_oc_id } },
        update: {
          error_message: 'Presupuesto insuficiente — evento asíncrono de Finanzas',
          updated_at: new Date(),
        },
        create: {
          tenant_id:     event.context.tenant_id,
          proyecto_id:   event.context.proyecto_id,
          oc_id:         referencia_oc_id,
          oc_codigo:     referencia_oc_codigo,
          presupuesto_id: presupuesto_id ?? null,
          error_message: 'Presupuesto insuficiente — evento asíncrono de Finanzas',
        },
      });
      console.log(JSON.stringify({
        action:     'compras.oc_error_finanzas.alerta_creada',
        path:       'async',
        oc_id:      referencia_oc_id,
        tenant_id:  event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
      }));

      logTerminalState({
        terminalState: 'applied',
        actions: {
          notFound: 'compras.event.finanzas.presupuesto_insuficiente.oc_not_found',
          idempotent: 'compras.event.finanzas.presupuesto_insuficiente.idempotent',
          applied: 'compras.event.finanzas.presupuesto_insuficiente.applied',
        },
        context: {
          eventType:     event.event_type,
          correlationId: event.context.correlation_id,
          tenantId:      event.context.tenant_id,
          proyectoId:    event.context.proyecto_id,
        },
        extras: {
          referencia_oc_id,
          oc_codigo: oc.codigo,
        },
      });
    }
  );

  // ── [ALERTA] 3.2 Publicar evento al bus (best-effort, fuera del contexto prisma) ──
  try {
    await eventBus.publish({
      event_type: 'compras.oc_error_finanzas',
      timestamp:  new Date().toISOString(),
      context: {
        tenant_id:      event.context.tenant_id,
        proyecto_id:    event.context.proyecto_id,
        user_id:        event.context.user_id,
        correlation_id: event.context.correlation_id,
      },
      payload: {
        oc_id:         referencia_oc_id,
        oc_codigo:     referencia_oc_codigo,
        presupuesto_id: presupuesto_id ?? null,
        error_message: 'Presupuesto insuficiente — evento asíncrono de Finanzas',
      },
    });
  } catch (busError: any) {
    console.warn(JSON.stringify({
      action:    'compras.oc_error_finanzas.bus_offline',
      path:      'async',
      oc_id:     referencia_oc_id,
      bus_error: busError.message,
    }));
  }
}

// ── Alertas de Integridad Financiera ─────────────────────────────────────────
// 4.1 Endpoint de consulta de OCs en ERROR_FINANZAS para procuración.
// Solo roles con capacidad de intervención financiera pueden verlas.

app.get('/api/v1/compras/alertas/oc-error',
  requireRoles('admin', 'superintendent', 'procurement'),
  async (req: Request, res: Response) => {
    try {
      // 4.2 Extraer contexto del JWT (nunca del body)
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.alertaOcError.findMany({
          where:    { resuelta: false, tenant_id: tenantId, proyecto_id: proyectoId },
          orderBy:  { created_at: 'desc' },
        })
      );

      // 4.3 Respuesta estándar + log de observabilidad
      logInfo(req, 'compras', 'compras.alertas.oc_error.listadas',
        'Alertas de OC en ERROR_FINANZAS consultadas', { total: data.length });

      res.json({ success: true, data });
    } catch (error: any) {
      logError(req, 'compras', 'compras.alertas.oc_error.error',
        'Error al consultar alertas de OC en error', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

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

// ── Almacén ──────────────────────────────────────────────────────────────────

// GET inventario — lista ítems con filtro tenant/proyecto (defensa en profundidad + RLS)
app.get('/api/v1/compras/almacen/inventario', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.itemInventario.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { clave: 'asc' },
      })
    );

    const serialized = data.map((item) => ({
      ...item,
      stock_actual: Number(item.stock_actual),
      stock_minimo: Number(item.stock_minimo),
    }));

    logInfo(req, 'compras', 'compras.almacen.inventario.listado', 'Inventario consultado', { total: serialized.length });
    res.json({ success: true, data: serialized });
  } catch (error: any) {
    logError(req, 'compras', 'compras.almacen.inventario.error', 'Error al listar inventario', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST inventario — creación manual de ítem (admin puede pre-cargar stock inicial)
app.post('/api/v1/compras/almacen/inventario',
  requireRoles('admin', 'superintendent', 'procurement'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { insumo_id, clave, descripcion, unidad, categoria, stock_actual, stock_minimo, ubicacion } = req.body;

      if (!clave || !descripcion || !unidad || !categoria) {
        return res.status(400).json({ success: false, message: 'clave, descripcion, unidad y categoria son obligatorios.' });
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const existing = await prisma.itemInventario.findFirst({
            where: { tenant_id: tenantId, proyecto_id: proyectoId, clave },
          });
          if (existing) {
            const err = new Error(`Ya existe un ítem con la clave "${clave}" en este proyecto.`) as any;
            err.status = 409;
            throw err;
          }
          return prisma.itemInventario.create({
            data: {
              tenant_id:   tenantId,
              proyecto_id: proyectoId,
              insumo_id:   insumo_id ?? null,
              clave,
              descripcion,
              unidad,
              categoria,
              stock_actual: stock_actual ?? 0,
              stock_minimo: stock_minimo ?? 0,
              ubicacion:   ubicacion ?? null,
            },
          });
        }
      );

      const serialized = { ...data, stock_actual: Number(data.stock_actual), stock_minimo: Number(data.stock_minimo) };
      logInfo(req, 'compras', 'compras.almacen.item.creado', 'Ítem de inventario creado', { id: data.id, clave });
      res.status(201).json({ success: true, data: serialized });
    } catch (error: any) {
      const status = (error as any).status ?? 500;
      logError(req, 'compras', 'compras.almacen.item.crear.error', 'Error al crear ítem de inventario', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

// GET movimientos — filtro tenant/proyecto + filtros opcionales tipo/fecha
app.get('/api/v1/compras/almacen/movimientos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { tipo, desde, hasta } = req.query;

    const where: Record<string, any> = { tenant_id: tenantId, proyecto_id: proyectoId };
    if (tipo) where.tipo = tipo as string;
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde as string);
      if (hasta) where.fecha.lte = new Date(hasta as string);
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.movimientoAlmacen.findMany({
        where,
        include: { item: { select: { clave: true, descripcion: true, unidad: true } } },
        orderBy: { fecha: 'desc' },
        take: 200,
      })
    );

    const serialized = data.map((mov) => ({
      id:                  mov.id,
      tipo:                mov.tipo,
      fecha:               mov.fecha,
      cantidad:            Number(mov.cantidad),
      unidad:              mov.unidad,
      origen:              mov.origen,
      destino:             mov.destino,
      responsable:         mov.responsable,
      referencia:          mov.referencia,
      insumo_clave:        mov.item?.clave        ?? '',
      insumo_descripcion:  mov.item?.descripcion  ?? '',
    }));

    logInfo(req, 'compras', 'compras.almacen.movimientos.listados', 'Movimientos consultados', { total: serialized.length });
    res.json({ success: true, data: serialized });
  } catch (error: any) {
    logError(req, 'compras', 'compras.almacen.movimientos.error', 'Error al listar movimientos', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST movimientos — registra INGRESO/EGRESO/TRASPASO con actualización atómica de stock.
// Acepta insumo_id (referencia al catálogo). Auto-crea el ítem en inventario en el primer INGRESO.
app.post('/api/v1/compras/almacen/movimientos',
  requireRoles('admin', 'superintendent', 'procurement', 'resident', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { insumo_id, clave, descripcion, unidad, categoria,
              tipo, cantidad, origen, destino, responsable, referencia } = req.body;

      if (!insumo_id || !tipo || !cantidad) {
        return res.status(400).json({ success: false, message: 'insumo_id, tipo y cantidad son obligatorios.' });
      }
      const TIPOS_VALIDOS = ['INGRESO', 'EGRESO', 'TRASPASO'];
      if (!TIPOS_VALIDOS.includes(tipo)) {
        return res.status(400).json({ success: false, message: `tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}` });
      }

      const result = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          // Buscar ítem existente por insumo_id del catálogo
          let item = await prisma.itemInventario.findFirst({
            where: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id },
          });

          // Auto-crear ítem en el primer INGRESO — requiere datos del catálogo
          if (!item) {
            if (tipo !== 'INGRESO') {
              const err = new Error('Este insumo no tiene existencias en el almacén de este proyecto. Registra primero un INGRESO.') as any;
              err.status = 404;
              throw err;
            }
            if (!clave || !descripcion || !unidad || !categoria) {
              throw new Error('Para el primer ingreso de un insumo se requieren: clave, descripcion, unidad y categoria.');
            }
            item = await prisma.itemInventario.create({
              data: {
                tenant_id:   tenantId,
                proyecto_id: proyectoId,
                insumo_id,
                clave,
                descripcion,
                unidad,
                categoria,
                stock_actual: 0,
                stock_minimo: 0,
              },
            });
          }

          const cant = Number(cantidad);
          let nuevoStock = Number(item.stock_actual);
          if (tipo === 'INGRESO') nuevoStock += cant;
          if (tipo === 'EGRESO')  nuevoStock = Math.max(0, nuevoStock - cant);
          // TRASPASO: no modifica el stock total del proyecto (origen → destino)

          // Operaciones secuenciales dentro del mismo contexto transaccional de createTenantContext
          const movimiento = await prisma.movimientoAlmacen.create({
            data: {
              tenant_id:   tenantId,
              proyecto_id: proyectoId,
              item_id:     item.id,
              tipo,
              cantidad:    cant,
              unidad:      item.unidad,
              origen:      origen  ?? null,
              destino:     destino ?? null,
              responsable: responsable ?? null,
              referencia:  referencia  ?? null,
            },
          });

          await prisma.itemInventario.update({
            where: { id: item.id },
            data:  { stock_actual: nuevoStock },
          });

          return {
            movimiento:  { ...movimiento, cantidad: Number(movimiento.cantidad) },
            nuevo_stock: nuevoStock,
            item_clave:  item.clave,
          };
        }
      );

      logInfo(req, 'compras', 'compras.almacen.movimiento.creado',
        `Movimiento ${tipo} registrado`, {
          insumo_id, tipo,
          cantidad:    Number(cantidad),
          nuevo_stock: result.nuevo_stock,
          item_clave:  result.item_clave,
        });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      const status = (error as any).status ?? 500;
      logError(req, 'compras', 'compras.almacen.movimiento.crear.error',
        'Error al registrar movimiento de almacén', { error_message: error.message });
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

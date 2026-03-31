import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import type { PrismaClient } from './generated/prisma';
import axios from 'axios';
import {
  createApiResponse,
  createApiError,
  ControlObraEvents,
  EstadoAvance,
  EstadoEstimacion,
} from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess } from '../../../packages/auth-middleware/src';
import { createEventBus } from '../../../packages/event-bus/src';
import {
  buildEventContext,
  buildForwardHeaders,
  createObservabilityMiddleware,
  getCorrelationId,
  logError,
  logInfo,
  logWarn,
} from '../../../packages/observability/src';
import { applyTerminalMutationInContext, buildTerminalHttpResponse, logTerminalState } from '../../../packages/tenant-idempotency/src';

// ─── EventBus (RabbitMQ) ─────────────────────────────────────────────────────
const eventBus = createEventBus('control-obra');

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Control de Obra (Bitácoras, Avances, Estimaciones)
 * Puerto: 3005
 *
 * Responsabilidades:
 * 1. Registrar bitácoras de obra diarias por frente de trabajo.
 * 2. Capturar avances físicos por concepto del presupuesto base.
 * 3. Generar y aprobar estimaciones de facturación.
 * 4. Emitir evento EstimacionAprobada → Finanzas programa pago.
 * ---------------------------------------------------------------------------
 */

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('control-obra'));

const PORT = process.env.PORT || 3005;
const JWT_SECRET = requireEnv('JWT_SECRET');
const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004/api/v1/finanzas';
const ESTIMACION_STATUS = {
  PENDIENTE_FINANZAS: EstadoEstimacion.PENDIENTE_CONFIRMACION_FINANZAS,
  ERROR_FINANZAS: EstadoEstimacion.ERROR_FINANZAS,
  APROBADA_FINANCIERA: EstadoEstimacion.APROBADA_FINANCIERA,
} as const;

export async function handlePagoRegistradoEvent(event: any): Promise<void> {
  const {
    id_pago,
    referencia_modulo,
    referencia_entidad,
    referencia_id,
    monto_pagado,
    fecha_pago_real,
  } = event.payload as {
    id_pago?: string;
    referencia_modulo?: string;
    referencia_entidad?: string;
    referencia_id?: string;
    monto_pagado?: number;
    fecha_pago_real?: string;
  };

  if (!id_pago || !referencia_modulo || !referencia_entidad || !referencia_id) {
    console.error(JSON.stringify({
      action: 'control_obra.event.finanzas.pago_registrado.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      id_pago,
      referencia_id,
    }));
    return;
  }

  if (referencia_modulo !== 'control-obra' || referencia_entidad !== 'Estimacion') {
    console.log(JSON.stringify({
      action: 'control_obra.event.finanzas.pago_registrado.ignored',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      referencia_modulo,
      referencia_entidad,
      referencia_id,
    }));
    return;
  }

  type PagoRegistradoLoaded = {
    estimacion: Awaited<ReturnType<PrismaClient['estimacion']['findUnique']>>;
  };

  type PagoRegistradoResult =
    | {
        status: 'estimacion_not_found';
      }
    | {
        status: 'idempotent';
      }
    | {
        status: 'applied';
      };

  const result = await applyTerminalMutationInContext<
    { tenantId: string; proyectoId: string; userId: string },
    PrismaClient,
    PagoRegistradoLoaded,
    { status: 'estimacion_not_found' },
    { status: 'idempotent' },
    { status: 'applied' }
  >({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    runInContext: createTenantContext,
    load: async (prisma) => {
      const estimacion = await prisma.estimacion.findUnique({
        where: { id_estimacion: referencia_id },
      });

      return { estimacion };
    },
    notFoundResult: async (loaded) => {
      if (loaded.estimacion) {
        return null;
      }

      logTerminalState({
        terminalState: 'not_found',
        actions: {
          notFound: 'control_obra.event.finanzas.pago_registrado.estimacion_not_found',
          idempotent: 'control_obra.event.finanzas.pago_registrado.idempotent',
          applied: 'control_obra.event.finanzas.pago_registrado.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_id,
          id_pago,
        },
      });

      return { status: 'estimacion_not_found' };
    },
    idempotentResult: async (loaded) => {
      if (!loaded.estimacion || loaded.estimacion.estado !== EstadoEstimacion.FACTURADA) {
        return null;
      }

      logTerminalState({
        terminalState: 'idempotent',
        actions: {
          notFound: 'control_obra.event.finanzas.pago_registrado.estimacion_not_found',
          idempotent: 'control_obra.event.finanzas.pago_registrado.idempotent',
          applied: 'control_obra.event.finanzas.pago_registrado.applied',
        },
        context: {
          eventType: event.event_type,
          correlationId: event.context.correlation_id,
          tenantId: event.context.tenant_id,
          proyectoId: event.context.proyecto_id,
        },
        extras: {
          referencia_id,
          id_pago,
        },
      });

      return { status: 'idempotent' };
    },
    apply: async (loaded, prisma) => {
      const notaPago = `Pago registrado en Finanzas. Pago: ${id_pago}. Monto: ${Number(monto_pagado || 0).toFixed(2)}. Fecha: ${fecha_pago_real || 'N/A'}.`;
      const notasActualizadas = loaded.estimacion!.notas ? `${loaded.estimacion!.notas}\n${notaPago}` : notaPago;

      await prisma.estimacion.update({
        where: { id_estimacion: referencia_id },
        data: {
          estado: EstadoEstimacion.FACTURADA,
          notas: notasActualizadas,
        },
      });

      return { status: 'applied' };
    },
  });

  if (result.status === 'applied') {
    logTerminalState({
      terminalState: 'applied',
      actions: {
        notFound: 'control_obra.event.finanzas.pago_registrado.estimacion_not_found',
        idempotent: 'control_obra.event.finanzas.pago_registrado.idempotent',
        applied: 'control_obra.event.finanzas.pago_registrado.applied',
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: {
        referencia_id,
        id_pago,
      },
    });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT REAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(requireProjectAccess());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BITÁCORAS DE OBRA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Listar bitácoras del proyecto activo
app.get('/api/v1/control-obra/bitacoras', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.bitacoraObra.findMany({
          orderBy: { fecha: 'desc' },
          take: 50,
        });
      }
    );
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Control Obra] Error listando bitácoras:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Crear nueva entrada de bitácora
app.post('/api/v1/control-obra/bitacoras', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const {
      frente_trabajo, turno, clima, temperatura_c,
      actividades_realizadas, personal_en_sitio,
      incidencias, material_recibido, observaciones, fecha,
    } = req.body;

    if (!frente_trabajo || !actividades_realizadas) {
      res.status(400).json(createApiError('CO_MISSING_FIELDS', 'frente_trabajo y actividades_realizadas son obligatorios.'));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        // Obtener el siguiente número de entrada
        const lastEntry = await prisma.bitacoraObra.findFirst({
          orderBy: { numero_entrada: 'desc' },
          select: { numero_entrada: true },
        });
        const nextNumber = (lastEntry?.numero_entrada || 0) + 1;

        return await prisma.bitacoraObra.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            numero_entrada: nextNumber,
            fecha: fecha ? new Date(fecha) : new Date(),
            frente_trabajo,
            turno: turno || 'DIURNO',
            clima,
            temperatura_c: temperatura_c ? Number(temperatura_c) : null,
            actividades_realizadas,
            personal_en_sitio: personal_en_sitio || 0,
            incidencias,
            material_recibido,
            observaciones,
            residente_id: userId,
            residente_nombre: userName || 'Residente',
            estado: 'BORRADOR',
          },
        });
      }
    );

    console.log(`[Control Obra] ✅ Bitácora #${data.numero_entrada} creada`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Control Obra] Error creando bitácora:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Firmar bitácora (cambiar a FIRMADA)
app.patch('/api/v1/control-obra/bitacoras/:id/firmar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const bitacora = await prisma.bitacoraObra.findUnique({ where: { id_bitacora: id } });
        if (!bitacora) throw new Error('Bitácora no encontrada.');
        if (bitacora.estado !== 'BORRADOR') throw new Error('Solo se pueden firmar bitácoras en BORRADOR.');

        return await prisma.bitacoraObra.update({
          where: { id_bitacora: id },
          data: { estado: 'FIRMADA', superintendente_id: userId },
        });
      }
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AVANCES FÍSICOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Listar avances del proyecto
app.get('/api/v1/control-obra/avances', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const estado = req.query.estado as string;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.avanceFisico.findMany({
          where: estado ? { estado } : undefined,
          include: { estimacion: { select: { codigo: true, estado: true } } },
          orderBy: { created_at: 'desc' },
        });
      }
    );
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Registrar avance físico
app.post('/api/v1/control-obra/avances', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const {
      concepto_presupuesto, descripcion_concepto, cantidad_presupuestada,
      cantidad_anterior, cantidad_periodo, unidad, precio_unitario,
      periodo_inicio, periodo_fin,
    } = req.body;

    if (!concepto_presupuesto || !cantidad_periodo || !precio_unitario) {
      res.status(400).json(createApiError('CO_MISSING_FIELDS', 'concepto_presupuesto, cantidad_periodo y precio_unitario son obligatorios.'));
      return;
    }

    const cantAnterior = Number(cantidad_anterior || 0);
    const cantPeriodo = Number(cantidad_periodo);
    const cantAcumulada = cantAnterior + cantPeriodo;
    const pu = Number(precio_unitario);
    const cantPresupuestada = Number(cantidad_presupuestada || cantAcumulada);
    const porcentaje = cantPresupuestada > 0 ? (cantAcumulada / cantPresupuestada) * 100 : 0;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.avanceFisico.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            concepto_presupuesto,
            descripcion_concepto: descripcion_concepto || concepto_presupuesto,
            cantidad_presupuestada: cantPresupuestada,
            cantidad_anterior: cantAnterior,
            cantidad_periodo: cantPeriodo,
            cantidad_acumulada: cantAcumulada,
            unidad: unidad || 'pza',
            precio_unitario: pu,
            importe_periodo: cantPeriodo * pu,
            importe_acumulado: cantAcumulada * pu,
            porcentaje_avance: Math.min(porcentaje, 100),
            periodo_inicio: new Date(periodo_inicio || new Date()),
            periodo_fin: new Date(periodo_fin || new Date()),
            registrado_por_id: userId,
            registrado_por_nombre: userName || 'Residente',
            estado: EstadoAvance.PENDIENTE,
          },
        });
      }
    );

    console.log(`[Control Obra] ✅ Avance registrado: ${concepto_presupuesto} → ${porcentaje.toFixed(1)}%`);

    // [EVENT BUS] Publicar avance registrado
    await eventBus.publish({
      event_type: ControlObraEvents.AVANCE_FISICO_REGISTRADO,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: { avance_id: data.id_avance, concepto: concepto_presupuesto, porcentaje: porcentaje.toFixed(1), importe: cantPeriodo * pu },
    });

    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Validar avance (Superintendente)
app.patch('/api/v1/control-obra/avances/:id/validar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName, roles } = req.securityContext;
    const { presupuesto_id } = req.body;

    const rolesAutorizados = ['admin', 'superintendent'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes pueden validar avances.'));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const avance = await prisma.avanceFisico.findUnique({ where: { id_avance: id } });
        if (!avance) throw new Error('Avance no encontrado.');
        if (avance.estado !== EstadoAvance.PENDIENTE) throw new Error('Solo avances PENDIENTE pueden validarse.');

        return await prisma.avanceFisico.update({
          where: { id_avance: id },
          data: {
            estado: EstadoAvance.VALIDADO,
            validado_por_id: userId,
            validado_por_nombre: userName || 'Superintendente',
          },
        });
      }
    );

    console.log(`[Control Obra] ✅ Avance validado: ${data.concepto_presupuesto}`);

    // [EVENT BUS] Publicar avance validado
    await eventBus.publish({
      event_type: ControlObraEvents.AVANCE_FISICO_VALIDADO,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        avance_id: data.id_avance,
        concepto: data.concepto_presupuesto,
        porcentaje: Number(data.porcentaje_avance),
        importe: Number(data.importe_periodo),
        presupuesto_id,
      },
    });

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Rechazar avance
app.patch('/api/v1/control-obra/avances/:id/rechazar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.avanceFisico.update({
          where: { id_avance: id },
          data: { estado: EstadoAvance.RECHAZADO },
        });
      }
    );
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESTIMACIONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Listar estimaciones
app.get('/api/v1/control-obra/estimaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.estimacion.findMany({
          include: { avances: { select: { id_avance: true, concepto_presupuesto: true, importe_periodo: true, porcentaje_avance: true } } },
          orderBy: { numero_estimacion: 'desc' },
        });
      }
    );
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Obtener estimación por ID
app.get('/api/v1/control-obra/estimaciones/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.estimacion.findUnique({
          where: { id_estimacion: id },
          include: { avances: true },
        });
      }
    );

    if (!data) { res.status(404).json(createApiError('CO_NOT_FOUND', 'Estimación no encontrada.')); return; }
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// Crear estimación agrupando avances validados
app.post('/api/v1/control-obra/estimaciones', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const { avance_ids, periodo_inicio, periodo_fin, notas } = req.body;

    if (!avance_ids || !Array.isArray(avance_ids) || avance_ids.length === 0) {
      res.status(400).json(createApiError('CO_MISSING_FIELDS', 'Se requiere un array de avance_ids validados.'));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        // 1. Verificar que los avances existen y están VALIDADOS
        const avances = await prisma.avanceFisico.findMany({
          where: { id_avance: { in: avance_ids }, estado: EstadoAvance.VALIDADO },
        });

        if (avances.length !== avance_ids.length) {
          const found = avances.map((a: any) => a.id_avance);
          const missing = avance_ids.filter((id: string) => !found.includes(id));
          throw new Error(`${avance_ids.length - avances.length} avance(s) no encontrados o no están VALIDADOS: ${missing.join(', ')}`);
        }

        // 2. Verificar que no están ya en otra estimación
        const yaAsignados = avances.filter((a: any) => a.estimacion_id !== null);
        if (yaAsignados.length > 0) {
          throw new Error(`${yaAsignados.length} avance(s) ya pertenecen a otra estimación.`);
        }

        // 3. Calcular montos
        const subtotal = avances.reduce((sum: number, a: any) => sum + Number(a.importe_periodo), 0);
        const retencion = subtotal * 0.05; // 5% fondo de garantía
        const iva = (subtotal - retencion) * 0.16;
        const totalNeto = subtotal - retencion + iva;

        // 4. Obtener número consecutivo
        const lastEst = await prisma.estimacion.findFirst({
          orderBy: { numero_estimacion: 'desc' },
          select: { numero_estimacion: true },
        });
        const nextNum = (lastEst?.numero_estimacion || 0) + 1;

        // 5. Crear la estimación
        const estimacion = await prisma.estimacion.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            numero_estimacion: nextNum,
            codigo: `EST-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`,
            periodo_inicio: new Date(periodo_inicio || new Date()),
            periodo_fin: new Date(periodo_fin || new Date()),
            subtotal,
            retencion_fondo_garantia: retencion,
            iva,
            total_neto: totalNeto,
            estado: EstadoEstimacion.BORRADOR,
            elaborado_por_id: userId,
            elaborado_por_nombre: userName || 'Residente',
            notas,
          },
        });

        // 6. Vincular avances a la estimación
        await prisma.avanceFisico.updateMany({
          where: { id_avance: { in: avance_ids } },
          data: { estimacion_id: estimacion.id_estimacion },
        });

        return { ...estimacion, avances_incluidos: avances.length, subtotal, total_neto: totalNeto };
      }
    );

    console.log(`[Control Obra] ✅ Estimación #${data.numero_estimacion} creada → $${Number(data.total_neto).toLocaleString()}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Control Obra] Error creando estimación:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APROBAR ESTIMACIÓN (Integración con Finanzas)
// Al aprobarse, se solicita a Finanzas programar el pago correspondiente.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.patch('/api/v1/control-obra/estimaciones/:id/aprobar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName, roles } = req.securityContext;
    const token = req.headers.authorization;
    const { presupuesto_id } = req.body;
    const correlationId = getCorrelationId(req);

    const rolesAutorizados = ['admin', 'superintendent'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes o admin pueden aprobar estimaciones.'));
      return;
    }

    if (!presupuesto_id) {
      res.status(400).json(createApiError('CO_MISSING_BUDGET', 'presupuesto_id es obligatorio para disparar efectos financieros.'));
      return;
    }

    const estimacion = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const found = await prisma.estimacion.findUnique({
          where: { id_estimacion: id },
          include: { avances: { select: { id_avance: true, concepto_presupuesto: true } } },
        });

        if (!found) throw new Error('Estimación no encontrada.');
        if (found.estado !== EstadoEstimacion.BORRADOR && found.estado !== EstadoEstimacion.EN_REVISION) {
          throw new Error(`No se puede aprobar una estimación en estado ${found.estado}.`);
        }

        return prisma.estimacion.update({
          where: { id_estimacion: id },
          data: {
            estado: ESTIMACION_STATUS.PENDIENTE_FINANZAS,
            revisado_por_id: userId,
            revisado_por_nombre: userName || 'Superintendente',
            fecha_aprobacion: new Date(),
          },
          include: { avances: { select: { id_avance: true, concepto_presupuesto: true } } },
        });
      }
    );

    try {
      await axios.post(`${FINANZAS_URL}/pagos`, {
        presupuesto_id,
        concepto: `Estimación ${estimacion.codigo} - ${estimacion.avances.length} conceptos`,
        beneficiario: 'Constructora (Self)',
        monto_programado: Number(estimacion.total_neto),
        fecha_programada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        referencia_modulo: 'control-obra',
        referencia_entidad: 'Estimacion',
        referencia_id: estimacion.id_estimacion,
      }, {
        headers: buildForwardHeaders(req, { Authorization: token || '' }),
      });
    } catch (finError: any) {
      const errMsg = finError.response?.data?.error?.message || finError.message;
      logWarn(req, 'control-obra', 'control_obra.estimacion.finanzas_pending', 'Finanzas no confirmo la programacion de pago para la estimacion', {
        estimacion_id: estimacion.id_estimacion,
        estimacion_codigo: estimacion.codigo,
        presupuesto_id,
        downstream_module: 'finanzas',
        error_message: errMsg,
      });

      const failed = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => prisma.estimacion.update({
          where: { id_estimacion: id },
          data: { estado: ESTIMACION_STATUS.ERROR_FINANZAS },
        })
      );

      return res.status(502).json(createApiError(
        'CO_FINANZAS_PENDING',
        `La estimación fue aprobada técnicamente pero Finanzas no confirmó la programación: ${errMsg}`,
        {
          estimacion_id: failed.id_estimacion,
          codigo: failed.codigo,
          estado: failed.estado,
        }
      ));
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.estimacion.update({
        where: { id_estimacion: id },
        data: { estado: ESTIMACION_STATUS.APROBADA_FINANCIERA },
      })
    );

    await eventBus.publish({
      event_type: ControlObraEvents.ESTIMACION_APROBADA,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        estimacion_id: data.id_estimacion,
        codigo: data.codigo,
        total_neto: Number(data.total_neto),
        presupuesto_id,
        total_conceptos: estimacion.avances.length,
      },
    });

    logInfo(req, 'control-obra', 'control_obra.estimacion.aprobada_financiera', 'Estimacion aprobada y programada en Finanzas', {
      estimacion_id: data.id_estimacion,
      estimacion_codigo: data.codigo,
      presupuesto_id,
      downstream_module: 'finanzas',
    });
    res.json(createApiResponse(data, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'control-obra', 'control_obra.estimacion.aprobar.error', 'Error aprobando estimacion', {
      error_message: error.message,
    });
    console.error('[Control Obra] Error aprobando estimación:', error.message);
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message, undefined, getCorrelationId(req)));
  }
});

app.get('/api/v1/control-obra/estimaciones/reconciliacion/pendientes', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const rolesAutorizados = ['admin', 'superintendent'];

    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes o admin pueden consultar reconciliaciones.'));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.estimacion.findMany({
        where: {
          estado: {
            in: [ESTIMACION_STATUS.PENDIENTE_FINANZAS, ESTIMACION_STATUS.ERROR_FINANZAS],
          },
        },
        orderBy: { numero_estimacion: 'desc' },
      })
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

app.post('/api/v1/control-obra/estimaciones/:id/reconciliar-finanzas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const token = req.headers.authorization;
    const { presupuesto_id } = req.body;
    const rolesAutorizados = ['admin', 'superintendent'];

    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError('CO_FORBIDDEN', 'Solo superintendentes o admin pueden reconciliar estimaciones.'));
      return;
    }

    if (!presupuesto_id) {
      res.status(400).json(createApiError('CO_MISSING_BUDGET', 'presupuesto_id es obligatorio para reconciliar.'));
      return;
    }

    const estimacion = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.estimacion.findUnique({
        where: { id_estimacion: id },
        include: { avances: { select: { id_avance: true } } },
      })
    );

    if (!estimacion) {
      res.status(404).json(createApiError('CO_NOT_FOUND', 'Estimación no encontrada.'));
      return;
    }

    if (estimacion.estado === ESTIMACION_STATUS.APROBADA_FINANCIERA) {
      const response = buildTerminalHttpResponse({
        terminalState: 'idempotent',
        data: {
          ...estimacion,
          idempotente: true,
        },
        context: { tenantId, proyectoId, correlationId },
        buildBody: (result, context) => createApiResponse(result, context.tenantId, context.proyectoId, context.correlationId),
      });

      res.status(response.statusCode).json(response.body);
      return;
    }

    if (![ESTIMACION_STATUS.PENDIENTE_FINANZAS, ESTIMACION_STATUS.ERROR_FINANZAS].includes(estimacion.estado as any)) {
      res.status(409).json(createApiError('CO_INVALID_STATE', `La estimación no requiere reconciliación. Estado actual: ${estimacion.estado}`));
      return;
    }

    await axios.post(`${FINANZAS_URL}/pagos`, {
      presupuesto_id,
      concepto: `Estimación ${estimacion.codigo} - ${estimacion.avances.length} conceptos`,
      beneficiario: 'Constructora (Self)',
      monto_programado: Number(estimacion.total_neto),
      fecha_programada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: estimacion.id_estimacion,
    }, {
      headers: buildForwardHeaders(req, { Authorization: token || '' }),
    });

    const updated = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.estimacion.update({
        where: { id_estimacion: id },
        data: { estado: ESTIMACION_STATUS.APROBADA_FINANCIERA },
      })
    );

    await eventBus.publish({
      event_type: ControlObraEvents.ESTIMACION_APROBADA,
      timestamp: new Date().toISOString(),
      context: buildEventContext(req),
      payload: {
        estimacion_id: updated.id_estimacion,
        codigo: updated.codigo,
        total_neto: Number(updated.total_neto),
        presupuesto_id,
        total_conceptos: estimacion.avances.length,
      },
    });

    const response = buildTerminalHttpResponse({
      terminalState: 'applied',
      data: {
        ...updated,
        idempotente: false,
      },
      context: { tenantId, proyectoId, correlationId },
      buildBody: (result, context) => createApiResponse(result, context.tenantId, context.proyectoId, context.correlationId),
    });

    res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(502).json(createApiError('CO_RECONCILIATION_FAILED', errMsg));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD DE CONTROL DE OBRA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/control-obra/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const [totalBitacoras, totalAvances, avancesPendientes, avancesValidados, estimaciones] = await Promise.all([
          prisma.bitacoraObra.count(),
          prisma.avanceFisico.count(),
          prisma.avanceFisico.count({ where: { estado: EstadoAvance.PENDIENTE } }),
          prisma.avanceFisico.count({ where: { estado: EstadoAvance.VALIDADO } }),
          prisma.estimacion.findMany({
            select: { id_estimacion: true, codigo: true, estado: true, total_neto: true, numero_estimacion: true },
            orderBy: { numero_estimacion: 'desc' },
            take: 5,
          }),
        ]);

        return {
          resumen: {
            total_bitacoras: totalBitacoras,
            total_avances: totalAvances,
            avances_pendientes: avancesPendientes,
            avances_validados: avancesValidados,
            total_estimaciones: estimaciones.length,
          },
          ultimas_estimaciones: estimaciones,
        };
      }
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    res.status(500).json(createApiError('CO_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'control-obra', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function startServer() {
  return app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏗️  Módulo: CONTROL DE OBRA (Bitácoras · Avances · Estimaciones)');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('  🔐  Autenticación: JWT REAL (Bearer Token)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Control Obra] ✅ Servidor en puerto ${PORT}`);

  // Inicializar EventBus
  await eventBus.connect();
  await eventBus.subscribe('finanzas.pago_registrado', handlePagoRegistradoEvent);
  console.log(`[Control Obra] 📡 Eventos: avance_registrado, avance_validado, estimacion_aprobada`);
});
}

export async function initEventBus() {
  await eventBus.connect();
}

export async function shutdownEventBus() {
  await eventBus.close();
}

if (require.main === module) {
  void startServer();
}

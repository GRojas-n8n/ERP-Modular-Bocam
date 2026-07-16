/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Finanzas (Tesorería y Flujo de Caja)
 * Puerto: 3004
 *
 * Responsabilidades:
 * 1. Consulta de suficiencia presupuestal (GET /suficiencia).
 * 2. Gestión de presupuestos asignados por proyecto.
 * 3. Registro inmutable de movimientos presupuestales.
 * 4. Programación y seguimiento de pagos (flujo de caja).
 * 5. Consumo de eventos: OrdenCompraEmitida → congela fondos.
 * 6. Emisión de eventos: FondosComprometidos, PresupuestoInsuficiente.
 *
 * SEGURIDAD:
 * - JWT verificado criptográficamente via @bocam/auth-middleware.
 * - RLS en PostgreSQL con schema separado 'finanzas'.
 * - Límites de Autoridad Financiera validados antes de mutaciones.
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import { v4 as uuidv4 } from 'uuid';
import {
  createApiResponse,
  createApiError,
  FondosComprometidosPayload,
  FondosLiberadosPayload,
  PagoRegistradoPayload,
  TransferenciaPresupuestalPayload,
  TipoMovimiento,
  FinanzasEvents,
  PresupuestoInsuficientePayload,
  SuficienciaPresupuestal,
} from './types';
import type { PrismaClient } from './generated/prisma';

// ─── Importar middleware JWT compartido ──────────────────────────────────────
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { createEventBus, BocamEvent } from '../../../packages/event-bus/src';
import {
  createObservabilityMiddleware,
  getCorrelationId,
  initSentry,
  logError,
  logInfo,
  logWarn,
  setupSentryExpressHandler,
} from '../../../packages/observability/src';
import { applyIdempotentMutationInContext } from '../../../packages/tenant-idempotency/src';

// ─── EventBus (RabbitMQ) ─────────────────────────────────────────────────────
const eventBus = createEventBus('finanzas');

async function publishFinanceDomainEvent(
  eventType: FinanzasEvents,
  context: { tenant_id: string; proyecto_id: string; user_id: string; correlation_id?: string },
  payload: FondosComprometidosPayload | FondosLiberadosPayload | PresupuestoInsuficientePayload | PagoRegistradoPayload | TransferenciaPresupuestalPayload
) {
  await eventBus.publish({
    event_type: eventType,
    timestamp: new Date().toISOString(),
    context,
    payload,
  });
}

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('finanzas'));

const PORT = process.env.PORT || 3004;
const JWT_SECRET = requireEnv('JWT_SECRET');
initSentry(process.env.SENTRY_DSN || '', 'finanzas');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT REAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(requireProjectAccess());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT CRÍTICO: GET /api/v1/finanzas/suficiencia
//
// Consulta la disponibilidad presupuestal de un proyecto.
// Compras DEBE llamar este endpoint ANTES de emitir una Orden de Compra.
// Retorna resumen global + desglose por capítulo de gasto.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/finanzas/suficiencia', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const montoRequerido = req.query.monto ? Number(req.query.monto) : undefined;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const presupuestos = await prisma.presupuestoAsignado.findMany({
          where: { estatus: 'ACTIVO' },
        });

        // Calcular totales
        let totalAutorizado = 0;
        let totalEjercido = 0;
        let totalComprometido = 0;
        let totalDisponible = 0;

        const porCapitulo = presupuestos.map((p) => {
          const autorizado = Number(p.monto_autorizado);
          const ejercido = Number(p.monto_ejercido);
          const comprometido = Number(p.monto_comprometido);
          const disponible = Number(p.monto_disponible);

          totalAutorizado += autorizado;
          totalEjercido += ejercido;
          totalComprometido += comprometido;
          totalDisponible += disponible;

          return {
            capitulo: p.capitulo,
            presupuesto_id: p.id_presupuesto,
            codigo: p.codigo,
            monto_autorizado: autorizado,
            monto_ejercido: ejercido,
            monto_comprometido: comprometido,
            monto_disponible: disponible,
          };
        });

        const resultado: SuficienciaPresupuestal = {
          proyecto_id: proyectoId,
          resumen: {
            total_autorizado: totalAutorizado,
            total_ejercido: totalEjercido,
            total_comprometido: totalComprometido,
            total_disponible: totalDisponible,
            moneda: 'MXN',
          },
          por_capitulo: porCapitulo,
          tiene_suficiencia: montoRequerido
            ? totalDisponible >= montoRequerido
            : totalDisponible > 0,
        };

        return resultado;
      }
    );

    res.json(createApiResponse(data, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'finanzas', 'finanzas.suficiencia.error', 'Error al consultar suficiencia presupuestal', {
      error_message: error.message,
    });
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al consultar suficiencia presupuestal.', undefined, getCorrelationId(req)));
  }
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRESUPUESTOS ASIGNADOS — CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Listar presupuestos del proyecto activo
app.get('/api/v1/finanzas/presupuestos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.presupuestoAsignado.findMany({
          where: { estatus: 'ACTIVO' },
          include: {
            _count: { select: { movimientos: true, programa_pagos: true } },
          },
          orderBy: { capitulo: 'asc' },
        });
      }
    );
    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error listando presupuestos:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al listar presupuestos.'));
  }
});

// Resolver el presupuesto sincronizado de una partida real de GT — usado por
// Compras para resolver presupuesto_id automáticamente en convertir-oc sin
// selector manual (ver openspec/changes/unificar-presupuesto-a-partidas-gt).
// Debe registrarse ANTES de /presupuestos/:id para no ser capturado por ese
// parámetro genérico.
app.get('/api/v1/finanzas/presupuestos/por-concepto/:conceptoId', async (req: Request, res: Response) => {
  try {
    const { conceptoId } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => prisma.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoId, estatus: 'ACTIVO' } })
    );

    if (!data) {
      res.status(404).json(createApiError('FIN_NOT_FOUND', 'Sin presupuesto sincronizado para esta partida.'));
      return;
    }

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error resolviendo presupuesto por concepto:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al resolver presupuesto por partida.'));
  }
});

// Obtener un presupuesto por ID con sus movimientos
app.get('/api/v1/finanzas/presupuestos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.presupuestoAsignado.findUnique({
          where: { id_presupuesto: id },
          include: {
            movimientos: { orderBy: { fecha_registro: 'desc' }, take: 50 },
            programa_pagos: { orderBy: { fecha_programada: 'asc' } },
          },
        });
      }
    );

    if (!data) {
      res.status(404).json(createApiError('FIN_NOT_FOUND', 'Presupuesto no encontrado.'));
      return;
    }

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error obteniendo presupuesto:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al obtener presupuesto.'));
  }
});

// Crear nuevo presupuesto asignado
app.post('/api/v1/finanzas/presupuestos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles, limiteAprobacion } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const { codigo, descripcion, monto_autorizado, capitulo, moneda } = req.body;

    // Validación RBAC: Solo admin, superintendent o finanzas pueden crear presupuestos
    const rolesAutorizados = ['admin', 'superintendent', 'finanzas'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'No tienes permisos para crear presupuestos. Roles requeridos: admin, superintendent o finanzas.'
      ));
      return;
    }

    // Validar campos obligatorios
    if (!codigo || !descripcion || !monto_autorizado) {
      res.status(400).json(createApiError(
        'FIN_MISSING_FIELDS',
        'Los campos codigo, descripcion y monto_autorizado son obligatorios.'
      ));
      return;
    }

    // Los presupuestos de partida (MATERIALES/SUBCONTRATOS/EQUIPOS/INDIRECTOS) se
    // sincronizan automáticamente desde el presupuesto de obra aprobado en Gerencia
    // Técnica — solo MANO_OBRA (bolsa a nivel proyecto para nómina) se crea a mano.
    // Ver openspec/changes/unificar-presupuesto-a-partidas-gt.
    const capituloSolicitado = capitulo || 'MATERIALES';
    if (capituloSolicitado !== 'MANO_OBRA') {
      res.status(422).json(createApiError(
        'FIN_CAPITULO_SINCRONIZADO',
        'Los presupuestos de MATERIALES, SUBCONTRATOS, EQUIPOS e INDIRECTOS se sincronizan automáticamente desde el presupuesto de obra aprobado en Gerencia Técnica — no se crean manualmente. Solo el presupuesto de MANO_OBRA (a nivel proyecto, para nómina) se crea aquí.'
      ));
      return;
    }

    // Validar Límite de Autoridad Financiera
    if (Number(monto_autorizado) > limiteAprobacion) {
      res.status(403).json(createApiError(
        'FIN_LIMIT_EXCEEDED',
        `El monto $${Number(monto_autorizado).toLocaleString()} excede tu límite de autoridad financiera ($${limiteAprobacion.toLocaleString()}).`
      ));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.presupuestoAsignado.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            codigo,
            descripcion,
            monto_autorizado: Number(monto_autorizado),
            monto_disponible: Number(monto_autorizado), // Al crear, todo está disponible
            capitulo: capitulo || 'MATERIALES',
            moneda: moneda || 'MXN',
          },
        });
      }
    );

    console.log(`[Finanzas] ✅ Presupuesto creado: ${codigo} → $${monto_autorizado}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error creando presupuesto:', error.message);
    if (error.code === 'P2002') {
      res.status(409).json(createApiError(
        'FIN_DUPLICATE',
        'Ya existe un presupuesto con este código en el proyecto.'
      ));
      return;
    }
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al crear presupuesto.'));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOVIMIENTOS PRESUPUESTALES — Registro y Consulta
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Listar movimientos del proyecto
// ?presupuesto_id= filtra directo; ?concepto_id= resuelve primero el presupuesto
// ACTIVO sincronizado a esa partida (ver openspec/changes/trazabilidad-partida-gt-cp) —
// permite a GT/CP consultar sin conocer el presupuesto_id interno de Finanzas.
// presupuesto_id tiene precedencia si ambos se envían.
app.get('/api/v1/finanzas/movimientos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const presupuestoId = req.query.presupuesto_id as string | undefined;
    const conceptoId    = req.query.concepto_id as string | undefined;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        let resolvedPresupuestoId = presupuestoId;

        if (!resolvedPresupuestoId && conceptoId) {
          const presupuesto = await prisma.presupuestoAsignado.findFirst({
            where: { concepto_id: conceptoId, estatus: 'ACTIVO' },
          });
          if (!presupuesto) return [];
          resolvedPresupuestoId = presupuesto.id_presupuesto;
        }

        return await prisma.movimientoPresupuestal.findMany({
          where: resolvedPresupuestoId ? { presupuesto_id: resolvedPresupuestoId } : undefined,
          include: { presupuesto: { select: { codigo: true, capitulo: true } } },
          orderBy: { fecha_registro: 'desc' },
          take: 100,
        });
      }
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error listando movimientos:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al listar movimientos.'));
  }
});

// Registrar nuevo movimiento presupuestal (inmutable)
app.post('/api/v1/finanzas/movimientos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles, limiteAprobacion } = req.securityContext;
    const {
      presupuesto_id, tipo, concepto, monto, moneda,
      referencia_modulo, referencia_entidad, referencia_id, referencia_codigo,
      notas,
    } = req.body;

    // Validación RBAC
    const rolesAutorizados = ['admin', 'superintendent', 'finanzas'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'No tienes permisos para registrar movimientos presupuestales.'
      ));
      return;
    }

    // Validar campos obligatorios
    if (!presupuesto_id || !tipo || !concepto || !monto) {
      res.status(400).json(createApiError(
        'FIN_MISSING_FIELDS',
        'Los campos presupuesto_id, tipo, concepto y monto son obligatorios.'
      ));
      return;
    }

    // Validar tipo de movimiento
    const tiposValidos = Object.values(TipoMovimiento);
    if (!tiposValidos.includes(tipo as TipoMovimiento)) {
      res.status(400).json(createApiError(
        'FIN_INVALID_TYPE',
        `Tipo de movimiento inválido. Valores permitidos: ${tiposValidos.join(', ')}`
      ));
      return;
    }

    // Validar Límite de Autoridad Financiera
    if (Number(monto) > limiteAprobacion) {
      res.status(403).json(createApiError(
        'FIN_LIMIT_EXCEEDED',
        `El monto $${Number(monto).toLocaleString()} excede tu límite de autoridad financiera.`
      ));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        // 1. Verificar que el presupuesto existe
        const presupuesto = await prisma.presupuestoAsignado.findUnique({
          where: { id_presupuesto: presupuesto_id },
        });

        if (!presupuesto) {
          throw new Error('Presupuesto no encontrado.');
        }
        const montoNum = Number(monto);
        const disponible = Number(presupuesto.monto_disponible);

        // 2. Validar suficiencia según tipo
        if (tipo === TipoMovimiento.COMPROMISO || tipo === TipoMovimiento.EJERCIDO) {
          if (montoNum > disponible) {
            throw new Error(
              `PRESUPUESTO_INSUFICIENTE: Disponible $${disponible.toLocaleString()}, ` +
              `Solicitado $${montoNum.toLocaleString()}, ` +
              `Déficit $${(montoNum - disponible).toLocaleString()}`
            );
          }
        }

        // 3. Crear movimiento (inmutable)
        const movimiento = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id,
            tipo,
            concepto,
            monto: montoNum,
            moneda: moneda || 'MXN',
            referencia_modulo,
            referencia_entidad,
            referencia_id,
            referencia_codigo,
            usuario_id: userId,
            notas,
          },
        });

        // 4. Actualizar saldos del presupuesto
        let updateData: any = {};
        switch (tipo) {
          case TipoMovimiento.COMPROMISO:
            updateData = {
              monto_comprometido: { increment: montoNum },
              monto_disponible: { decrement: montoNum },
            };
            break;
          case TipoMovimiento.EJERCIDO:
            updateData = {
              monto_ejercido: { increment: montoNum },
              monto_disponible: { decrement: montoNum },
            };
            break;
          case TipoMovimiento.DEVENGADO:
            // Devengado mueve de comprometido a ejercido (transición)
            updateData = {
              monto_comprometido: { decrement: montoNum },
              monto_ejercido: { increment: montoNum },
            };
            break;
          case TipoMovimiento.LIBERACION:
            updateData = {
              monto_comprometido: { decrement: montoNum },
              monto_disponible: { increment: montoNum },
            };
            break;
          case TipoMovimiento.TRANSFERENCIA:
            // Las transferencias se manejan con 2 movimientos (origen + destino)
            // Aquí solo procesamos la salida; el destino se registra en otro call
            updateData = {
              monto_disponible: { decrement: montoNum },
            };
            break;
        }

        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_id },
          data: updateData,
        });

        return movimiento;
      }
    );

    console.log(`[Finanzas] ✅ Movimiento registrado: ${tipo} → $${monto}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error registrando movimiento:', error.message);

    if (error.message.includes('PRESUPUESTO_INSUFICIENTE')) {
      res.status(422).json(createApiError(
        'FIN_INSUFFICIENT_BUDGET',
        error.message
      ));
      return;
    }

    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al registrar movimiento.'));
  }
});

app.post('/api/v1/finanzas/transferencias-presupuestales', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const {
      transferencia_id,
      presupuesto_origen_id,
      presupuesto_destino_id,
      monto,
      concepto,
    } = req.body;

    const rolesAutorizados = ['admin', 'finanzas', 'superintendent'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'No tienes permisos para transferir presupuesto.'
      ));
      return;
    }

    if (!presupuesto_origen_id || !presupuesto_destino_id || !monto || !concepto) {
      res.status(400).json(createApiError(
        'FIN_MISSING_FIELDS',
        'Los campos presupuesto_origen_id, presupuesto_destino_id, monto y concepto son obligatorios.'
      ));
      return;
    }

    if (presupuesto_origen_id === presupuesto_destino_id) {
      res.status(422).json(createApiError(
        'FIN_INVALID_TRANSFER',
        'El presupuesto de origen y destino deben ser distintos.'
      ));
      return;
    }

    const transferenciaId = transferencia_id || uuidv4();
    const montoNum = Number(monto);

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const movimientosExistentes = await prisma.movimientoPresupuestal.findMany({
          where: {
            referencia_modulo: 'finanzas',
            referencia_entidad: 'TransferenciaPresupuestal',
            referencia_id: transferenciaId,
            tipo: TipoMovimiento.TRANSFERENCIA,
          },
          orderBy: { fecha_registro: 'asc' },
        });

        const origen = await prisma.presupuestoAsignado.findUniqueOrThrow({
          where: { id_presupuesto: presupuesto_origen_id },
        });

        const destino = await prisma.presupuestoAsignado.findUniqueOrThrow({
          where: { id_presupuesto: presupuesto_destino_id },
        });

        if (movimientosExistentes.length >= 2) {
          return {
            evento: FinanzasEvents.TRANSFERENCIA_PRESUPUESTAL,
            transferencia_id: transferenciaId,
            movimiento_origen_id: movimientosExistentes[0].id_movimiento,
            movimiento_destino_id: movimientosExistentes[1].id_movimiento,
            presupuesto_origen_id,
            presupuesto_destino_id,
            codigo_origen: origen.codigo,
            codigo_destino: destino.codigo,
            capitulo_origen: origen.capitulo,
            capitulo_destino: destino.capitulo,
            monto_transferido: montoNum,
            concepto,
            idempotente: true,
          };
        }

        if (Number(origen.monto_disponible) < montoNum) {
          throw new Error('No hay presupuesto disponible suficiente para la transferencia.');
        }

        const movimientoOrigen = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id: presupuesto_origen_id,
            tipo: TipoMovimiento.TRANSFERENCIA,
            concepto,
            monto: montoNum,
            referencia_modulo: 'finanzas',
            referencia_entidad: 'TransferenciaPresupuestal',
            referencia_id: transferenciaId,
            usuario_id: userId,
            notas: 'Transferencia presupuestal - salida.',
          },
        });

        const movimientoDestino = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id: presupuesto_destino_id,
            tipo: TipoMovimiento.TRANSFERENCIA,
            concepto,
            monto: montoNum,
            referencia_modulo: 'finanzas',
            referencia_entidad: 'TransferenciaPresupuestal',
            referencia_id: transferenciaId,
            usuario_id: userId,
            notas: 'Transferencia presupuestal - entrada.',
          },
        });

        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_origen_id },
          data: {
            monto_disponible: { decrement: montoNum },
          },
        });

        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_destino_id },
          data: {
            monto_disponible: { increment: montoNum },
          },
        });

        return {
          evento: FinanzasEvents.TRANSFERENCIA_PRESUPUESTAL,
          transferencia_id: transferenciaId,
          movimiento_origen_id: movimientoOrigen.id_movimiento,
          movimiento_destino_id: movimientoDestino.id_movimiento,
          presupuesto_origen_id,
          presupuesto_destino_id,
          codigo_origen: origen.codigo,
          codigo_destino: destino.codigo,
          capitulo_origen: origen.capitulo,
          capitulo_destino: destino.capitulo,
          monto_transferido: montoNum,
          concepto,
          idempotente: false,
        };
      }
    );

    await publishFinanceDomainEvent(FinanzasEvents.TRANSFERENCIA_PRESUPUESTAL, {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      user_id: userId,
      correlation_id: correlationId,
    }, {
      transferencia_id: result.transferencia_id,
      movimiento_origen_id: result.movimiento_origen_id,
      movimiento_destino_id: result.movimiento_destino_id,
      presupuesto_origen_id: result.presupuesto_origen_id,
      presupuesto_destino_id: result.presupuesto_destino_id,
      codigo_origen: result.codigo_origen,
      codigo_destino: result.codigo_destino,
      capitulo_origen: result.capitulo_origen,
      capitulo_destino: result.capitulo_destino,
      monto_transferido: result.monto_transferido,
      concepto: result.concepto,
      idempotente: result.idempotente,
    });

    res.status(201).json(createApiResponse(result, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'finanzas', 'finanzas.transferencias.error', 'Error al transferir presupuesto', {
      error_message: error.message,
    });

    const statusCode = error.message.includes('No hay presupuesto disponible suficiente') ? 422 : 500;
    res.status(statusCode).json(createApiError('FIN_INTERNAL_ERROR', 'Error al transferir presupuesto.', undefined, getCorrelationId(req)));
  }
});

// ENDPOINT: POST /api/v1/finanzas/comprometer-fondos
app.post('/api/v1/finanzas/comprometer-fondos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const {
      presupuesto_id, monto, oc_id, oc_codigo, concepto,
    } = req.body;

    if (!presupuesto_id || !monto || !oc_id || !oc_codigo) {
      res.status(400).json(createApiError(
        'FIN_MISSING_FIELDS',
        'Los campos presupuesto_id, monto, oc_id y oc_codigo son obligatorios.'
      ));
      return;
    }

    type ComprometerFondosLoaded = {
      compromisoExistente: Awaited<ReturnType<PrismaClient['movimientoPresupuestal']['findFirst']>>;
      montoNum: number;
      disponible: number;
    };

    type ComprometerFondosResult =
      | {
          evento: FinanzasEvents.FONDOS_COMPROMETIDOS;
          suficiencia: true;
          movimiento_id: string;
          presupuesto_id: string;
          monto_comprometido: number;
          monto_disponible_restante: number;
          oc_id: string;
          oc_codigo: string;
          idempotente: boolean;
        }
      | {
          evento: FinanzasEvents.PRESUPUESTO_INSUFICIENTE;
          suficiencia: false;
          presupuesto_id: string;
          monto_solicitado: number;
          monto_disponible: number;
          deficit: number;
          oc_id: string;
          oc_codigo: string;
          idempotente: boolean;
        };

    const result = await applyIdempotentMutationInContext<
      { tenantId: string; proyectoId: string; userId: string },
      PrismaClient,
      ComprometerFondosLoaded,
      ComprometerFondosResult
    >({
      context: { tenantId, proyectoId, userId },
      runInContext: createTenantContext,
      load: async (prisma) => {
        const compromisoExistente = await prisma.movimientoPresupuestal.findFirst({
          where: {
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: oc_id,
            tipo: TipoMovimiento.COMPROMISO,
          },
        });

        const presupuesto = await prisma.presupuestoAsignado.findUnique({
          where: { id_presupuesto: presupuesto_id },
        });

        if (!presupuesto) {
          throw new Error('Presupuesto no encontrado.');
        }

        return {
          compromisoExistente,
          montoNum: Number(monto),
          disponible: Number(presupuesto.monto_disponible),
        };
      },
      idempotentResult: async (loaded) => {
        if (!loaded.compromisoExistente) {
          return null;
        }

        logInfo(req, 'finanzas', 'finanzas.comprometer_fondos.idempotent', 'Compromiso de fondos resuelto en modo idempotente', {
          idempotent: true,
          presupuesto_id,
          oc_id,
          oc_codigo,
          movimiento_id: loaded.compromisoExistente.id_movimiento,
        });

        return {
          evento: FinanzasEvents.FONDOS_COMPROMETIDOS,
          suficiencia: true,
          movimiento_id: loaded.compromisoExistente.id_movimiento,
          presupuesto_id,
          monto_comprometido: Number(loaded.compromisoExistente.monto),
          monto_disponible_restante: 0,
          oc_id,
          oc_codigo,
          idempotente: true,
        };
      },
      apply: async (loaded, prisma) => {
        if (loaded.montoNum > loaded.disponible) {
          logWarn(req, 'finanzas', 'finanzas.comprometer_fondos.insufficient_budget', 'Presupuesto insuficiente para comprometer fondos', {
            idempotent: false,
            presupuesto_id,
            oc_id,
            oc_codigo,
            monto_solicitado: loaded.montoNum,
            monto_disponible: loaded.disponible,
            deficit: loaded.montoNum - loaded.disponible,
          });

          console.log(`[Finanzas] PRESUPUESTO INSUFICIENTE para OC ${oc_codigo}`);
          console.log(`   Disponible: ${loaded.disponible.toLocaleString()}`);
          console.log(`   Solicitado: ${loaded.montoNum.toLocaleString()}`);
          console.log(`   Deficit:    ${(loaded.montoNum - loaded.disponible).toLocaleString()}`);

          return {
            evento: FinanzasEvents.PRESUPUESTO_INSUFICIENTE,
            suficiencia: false,
            presupuesto_id,
            monto_solicitado: loaded.montoNum,
            monto_disponible: loaded.disponible,
            deficit: loaded.montoNum - loaded.disponible,
            oc_id,
            oc_codigo,
            idempotente: false,
          };
        }

        const movimiento = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id,
            tipo: TipoMovimiento.COMPROMISO,
            concepto: concepto || `Fondos comprometidos por OC ${oc_codigo}`,
            monto: loaded.montoNum,
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: oc_id,
            referencia_codigo: oc_codigo,
            usuario_id: userId,
            notas: 'Compromiso automatico por emision de Orden de Compra.',
          },
        });

        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_id },
          data: {
            monto_comprometido: { increment: loaded.montoNum },
            monto_disponible: { decrement: loaded.montoNum },
          },
        });

        console.log(`[Finanzas] FONDOS COMPROMETIDOS: ${loaded.montoNum.toLocaleString()} para OC ${oc_codigo}`);

        return {
          evento: FinanzasEvents.FONDOS_COMPROMETIDOS,
          suficiencia: true,
          movimiento_id: movimiento.id_movimiento,
          presupuesto_id,
          monto_comprometido: loaded.montoNum,
          monto_disponible_restante: loaded.disponible - loaded.montoNum,
          oc_id,
          oc_codigo,
          idempotente: false,
        };
      },
    });

    if (result.evento === FinanzasEvents.FONDOS_COMPROMETIDOS) {
      await publishFinanceDomainEvent(FinanzasEvents.FONDOS_COMPROMETIDOS, {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: correlationId,
      }, {
        presupuesto_id: result.presupuesto_id,
        movimiento_id: result.movimiento_id,
        monto_comprometido: result.monto_comprometido,
        monto_disponible_restante: result.monto_disponible_restante,
        referencia_oc_id: result.oc_id,
        referencia_oc_codigo: result.oc_codigo,
        idempotente: result.idempotente,
      });
    }

    if (result.evento === FinanzasEvents.PRESUPUESTO_INSUFICIENTE) {
      await publishFinanceDomainEvent(FinanzasEvents.PRESUPUESTO_INSUFICIENTE, {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: correlationId,
      }, {
        presupuesto_id: result.presupuesto_id,
        monto_solicitado: result.monto_solicitado,
        monto_disponible: result.monto_disponible,
        deficit: result.deficit,
        referencia_oc_id: result.oc_id,
        referencia_oc_codigo: result.oc_codigo,
        idempotente: false,
      });
    }

    const statusCode = result.suficiencia ? 201 : 422;
    res.status(statusCode).json(createApiResponse(result, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'finanzas', 'finanzas.comprometer_fondos.error', 'Error al comprometer fondos', {
      error_message: error.message,
    });
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al comprometer fondos.', undefined, getCorrelationId(req)));
  }
});

// ENDPOINT: POST /api/v1/finanzas/liberar-fondos
app.post('/api/v1/finanzas/liberar-fondos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const {
      presupuesto_id, monto, oc_id, oc_codigo, concepto,
    } = req.body;

    if (!presupuesto_id || !monto || !oc_id || !oc_codigo) {
      res.status(400).json(createApiError(
        'FIN_MISSING_FIELDS',
        'Los campos presupuesto_id, monto, oc_id y oc_codigo son obligatorios.'
      ));
      return;
    }

    type LiberarFondosLoaded = {
      liberacionExistente: Awaited<ReturnType<PrismaClient['movimientoPresupuestal']['findFirst']>>;
      montoNum: number;
      montoComprometido: number;
    };

    type LiberarFondosResult = {
      evento: FinanzasEvents.FONDOS_LIBERADOS;
      movimiento_id: string;
      presupuesto_id: string;
      monto_liberado: number;
      oc_id: string;
      oc_codigo: string;
      idempotente: boolean;
    };

    const result = await applyIdempotentMutationInContext<
      { tenantId: string; proyectoId: string; userId: string },
      PrismaClient,
      LiberarFondosLoaded,
      LiberarFondosResult
    >({
      context: { tenantId, proyectoId, userId },
      runInContext: createTenantContext,
      load: async (prisma) => {
        const liberacionExistente = await prisma.movimientoPresupuestal.findFirst({
          where: {
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: oc_id,
            tipo: TipoMovimiento.LIBERACION,
          },
        });

        const presupuesto = await prisma.presupuestoAsignado.findUnique({
          where: { id_presupuesto: presupuesto_id },
        });

        if (!presupuesto) {
          throw new Error('Presupuesto no encontrado.');
        }

        return {
          liberacionExistente,
          montoNum: Number(monto),
          montoComprometido: Number(presupuesto.monto_comprometido),
        };
      },
      idempotentResult: async (loaded) => {
        if (!loaded.liberacionExistente) {
          return null;
        }

        logInfo(req, 'finanzas', 'finanzas.liberar_fondos.idempotent', 'Liberacion de fondos resuelta en modo idempotente', {
          idempotent: true,
          presupuesto_id,
          oc_id,
          oc_codigo,
          movimiento_id: loaded.liberacionExistente.id_movimiento,
        });

        return {
          evento: FinanzasEvents.FONDOS_LIBERADOS,
          movimiento_id: loaded.liberacionExistente.id_movimiento,
          presupuesto_id,
          monto_liberado: Number(loaded.liberacionExistente.monto),
          oc_id,
          oc_codigo,
          idempotente: true,
        };
      },
      apply: async (loaded, prisma) => {
        if (loaded.montoComprometido < loaded.montoNum) {
          throw new Error('No hay fondos comprometidos suficientes para liberar este monto.');
        }

        const movimiento = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id,
            tipo: TipoMovimiento.LIBERACION,
            concepto: concepto || `Liberacion de fondos por OC ${oc_codigo} (Cancelacion/Ajuste)`,
            monto: loaded.montoNum,
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: oc_id,
            referencia_codigo: oc_codigo,
            usuario_id: userId,
            notas: 'Proceso automatico de liberacion de fondos.',
          },
        });

        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_id },
          data: {
            monto_comprometido: { decrement: loaded.montoNum },
            monto_disponible: { increment: loaded.montoNum },
          },
        });

        console.log(`[Finanzas] FONDOS LIBERADOS: ${loaded.montoNum.toLocaleString()} para OC ${oc_codigo}`);
        logInfo(req, 'finanzas', 'finanzas.liberar_fondos.created', 'Fondos liberados exitosamente', {
          idempotent: false,
          presupuesto_id,
          oc_id,
          oc_codigo,
          movimiento_id: movimiento.id_movimiento,
          monto_liberado: loaded.montoNum,
        });

        return {
          evento: FinanzasEvents.FONDOS_LIBERADOS,
          movimiento_id: movimiento.id_movimiento,
          presupuesto_id,
          monto_liberado: loaded.montoNum,
          oc_id,
          oc_codigo,
          idempotente: false,
        };
      },
    });

    await publishFinanceDomainEvent(FinanzasEvents.FONDOS_LIBERADOS, {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      user_id: userId,
      correlation_id: correlationId,
    }, {
      presupuesto_id: result.presupuesto_id,
      movimiento_id: result.movimiento_id,
      monto_liberado: result.monto_liberado,
      referencia_oc_id: result.oc_id,
      referencia_oc_codigo: result.oc_codigo,
      idempotente: result.idempotente,
    });

    res.status(201).json(createApiResponse(result, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'finanzas', 'finanzas.liberar_fondos.error', 'Error al liberar fondos', {
      error_message: error.message,
    });
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al liberar fondos.', undefined, getCorrelationId(req)));
  }
});

// PROGRAMA DE PAGOS — CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Listar pagos programados (flujo de caja)
app.get('/api/v1/finanzas/pagos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const estado = req.query.estado as string;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.programaPagos.findMany({
          where: estado ? { estado } : undefined,
          include: { presupuesto: { select: { codigo: true, capitulo: true } } },
          orderBy: { fecha_programada: 'asc' },
        });
      }
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error listando pagos:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al listar pagos.'));
  }
});

// Crear pago programado
app.post('/api/v1/finanzas/pagos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const correlationId = getCorrelationId(req);
    const {
      presupuesto_id, concepto, beneficiario, beneficiario_id,
      monto_programado, fecha_programada, metodo_pago, banco,
      referencia_modulo, referencia_entidad, referencia_id,
    } = req.body;

    // Validación RBAC
    const rolesAutorizados = ['admin', 'superintendent', 'finanzas'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'No tienes permisos para programar pagos.'
      ));
      return;
    }

    if (!presupuesto_id || !concepto || !beneficiario || !monto_programado || !fecha_programada) {
      res.status(400).json(createApiError(
        'FIN_MISSING_FIELDS',
        'Los campos presupuesto_id, concepto, beneficiario, monto_programado y fecha_programada son obligatorios.'
      ));
      return;
    }

    type PagoRecord = Awaited<ReturnType<PrismaClient['programaPagos']['create']>>;
    type PagosLoaded = {
      existente: PagoRecord | null;
    };
    type PagosResult = {
      pago: PagoRecord;
      idempotente: boolean;
    };

    const data = await applyIdempotentMutationInContext<
      { tenantId: string; proyectoId: string; userId: string },
      PrismaClient,
      PagosLoaded,
      PagosResult
    >({
      context: { tenantId, proyectoId, userId },
      runInContext: createTenantContext,
      load: async (prisma) => {
        let existente: PagoRecord | null = null;

        if (referencia_modulo && referencia_entidad && referencia_id) {
          existente = await prisma.programaPagos.findFirst({
            where: {
              referencia_modulo,
              referencia_entidad,
              referencia_id,
            },
          });
        }

        return { existente };
      },
      idempotentResult: async (loaded) => {
        if (!loaded.existente) {
          return null;
        }

        logInfo(req, 'finanzas', 'finanzas.pagos.idempotent', 'Pago programado resuelto en modo idempotente', {
          idempotent: true,
          presupuesto_id,
          referencia_modulo,
          referencia_entidad,
          referencia_id,
          id_pago: loaded.existente.id_pago,
        });

        return {
          pago: loaded.existente,
          idempotente: true,
        };
      },
      apply: async (_loaded, prisma) => {
        const pago = await prisma.programaPagos.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id,
            concepto,
            beneficiario,
            beneficiario_id,
            monto_programado: Number(monto_programado),
            fecha_programada: new Date(fecha_programada),
            estado: 'PENDIENTE',
            metodo_pago,
            banco,
            referencia_modulo,
            referencia_entidad,
            referencia_id,
          },
        });

        logInfo(req, 'finanzas', 'finanzas.pagos.created', 'Pago programado exitosamente', {
          idempotent: false,
          presupuesto_id,
          referencia_modulo,
          referencia_entidad,
          referencia_id,
          id_pago: pago.id_pago,
          monto_programado: Number(monto_programado),
        });

        return {
          pago,
          idempotente: false,
        };
      },
    });

    console.log(`[Finanzas] ✅ Pago programado: $${monto_programado} → ${beneficiario}`);
    res.status(201).json(createApiResponse({
      ...data.pago,
      idempotente: data.idempotente,
    }, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    logError(req, 'finanzas', 'finanzas.pagos.error', 'Error al programar pago', {
      error_message: error.message,
    });
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al programar pago.', undefined, getCorrelationId(req)));
  }
});

// Crear programación de pagos masiva
app.post('/api/v1/finanzas/pagos/bulk', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const { pagos } = req.body; // Array de pagos

    // Validación RBAC
    const rolesAutorizados = ['admin', 'superintendent', 'finanzas'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'No tienes permisos para programar pagos.'
      ));
      return;
    }

    if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
      res.status(400).json(createApiError(
        'FIN_INVALID_PAYLOAD',
        'Se requiere un array de pagos no vacío.'
      ));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const payload = pagos.map((p: any) => ({
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          presupuesto_id: p.presupuesto_id,
          concepto: p.concepto,
          beneficiario: p.beneficiario,
          beneficiario_id: p.beneficiario_id,
          monto_programado: Number(p.monto_programado),
          fecha_programada: new Date(p.fecha_programada),
          estado: 'PENDIENTE',
          metodo_pago: p.metodo_pago,
          banco: p.banco,
          referencia_modulo: p.referencia_modulo,
          referencia_entidad: p.referencia_entidad,
          referencia_id: p.referencia_id,
        }));

        return await prisma.programaPagos.createMany({
          data: payload,
        });
      }
    );

    console.log(`[Finanzas] ✅ Carga masiva completada: ${pagos.length} pagos registrados.`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error en carga masiva de pagos:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al procesar carga masiva.'));
  }
});


// Registrar pago realizado (cambiar estado a PAGADO)
app.patch('/api/v1/finanzas/pagos/:id/pagar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, roles, limiteAprobacion } = req.securityContext;
    const { referencia_bancaria, metodo_pago, banco } = req.body;
    const correlationId = getCorrelationId(req);

    // Validación RBAC
    const rolesAutorizados = ['admin', 'finanzas'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'Solo admin o finanzas pueden registrar pagos.'
      ));
      return;
    }

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const pago = await prisma.programaPagos.findUnique({
          where: { id_pago: id },
        });

        if (!pago) {
          throw new Error('Pago no encontrado.');
        }

        if (pago.estado === 'PAGADO') {
          throw new Error('Este pago ya fue procesado.');
        }

        if (pago.estado === 'CANCELADO') {
          throw new Error('No se puede pagar un registro cancelado.');
        }

        const montoPago = Number(pago.monto_programado);

        // Validar Límite de Autoridad Financiera
        if (montoPago > limiteAprobacion) {
          throw new Error(
            `LIMITE_EXCEDIDO: El monto $${montoPago.toLocaleString()} excede tu límite ($${limiteAprobacion.toLocaleString()}).`
          );
        }

        // 1. Actualizar el pago
        const pagoActualizado = await prisma.programaPagos.update({
          where: { id_pago: id },
          data: {
            estado: 'PAGADO',
            monto_pagado: montoPago,
            fecha_pago_real: new Date(),
            referencia_bancaria,
            metodo_pago: metodo_pago || pago.metodo_pago,
            banco: banco || pago.banco,
          },
        });

        // 2. Registrar movimiento de tipo EJERCIDO
        await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id: pago.presupuesto_id,
            tipo: TipoMovimiento.EJERCIDO,
            concepto: `Pago procesado: ${pago.concepto}`,
            monto: montoPago,
            referencia_modulo: pago.referencia_modulo,
            referencia_entidad: pago.referencia_entidad,
            referencia_id: pago.referencia_id,
            usuario_id: userId,
            notas: `Ref. bancaria: ${referencia_bancaria || 'N/A'}`,
          },
        });

        // 3. Actualizar saldos del presupuesto
        // El pago mueve de comprometido a ejercido
        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: pago.presupuesto_id },
          data: {
            monto_comprometido: { decrement: montoPago },
            monto_ejercido: { increment: montoPago },
          },
        });

        return pagoActualizado;
      }
    );

    await publishFinanceDomainEvent(FinanzasEvents.PAGO_REGISTRADO, {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      user_id: userId,
      correlation_id: correlationId,
    }, {
      id_pago: data.id_pago,
      presupuesto_id: data.presupuesto_id,
      monto_pagado: Number(data.monto_pagado ?? 0),
      moneda: data.moneda,
      fecha_pago_real: data.fecha_pago_real?.toISOString() || new Date().toISOString(),
      referencia_bancaria: data.referencia_bancaria || undefined,
      metodo_pago: data.metodo_pago || undefined,
      banco: data.banco || undefined,
      referencia_modulo: data.referencia_modulo || undefined,
      referencia_entidad: data.referencia_entidad || undefined,
      referencia_id: data.referencia_id || undefined,
      concepto: data.concepto,
      beneficiario: data.beneficiario,
    });

    console.log(`[Finanzas] ✅ Pago procesado: ${id}`);
    res.json(createApiResponse(data, tenantId, proyectoId, correlationId));
  } catch (error: any) {
    console.error('[Finanzas] Error procesando pago:', error.message);

    if (error.message.includes('LIMITE_EXCEDIDO')) {
      res.status(403).json(createApiError('FIN_LIMIT_EXCEEDED', error.message));
      return;
    }

    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', error.message));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD DE FLUJO DE CAJA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/finanzas/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        // 1. Resumen presupuestal
        const presupuestos = await prisma.presupuestoAsignado.findMany({
          where: { estatus: 'ACTIVO' },
        });

        const resumenPresupuestal = {
          total_autorizado: presupuestos.reduce((sum, p) => sum + Number(p.monto_autorizado), 0),
          total_ejercido: presupuestos.reduce((sum, p) => sum + Number(p.monto_ejercido), 0),
          total_comprometido: presupuestos.reduce((sum, p) => sum + Number(p.monto_comprometido), 0),
          total_disponible: presupuestos.reduce((sum, p) => sum + Number(p.monto_disponible), 0),
          porcentaje_ejercido: 0,
        };
        resumenPresupuestal.porcentaje_ejercido = resumenPresupuestal.total_autorizado > 0
          ? Math.round((resumenPresupuestal.total_ejercido / resumenPresupuestal.total_autorizado) * 100)
          : 0;

        // 2. Pagos próximos (siguiente 30 días)
        const hoy = new Date();
        const en30Dias = new Date();
        en30Dias.setDate(en30Dias.getDate() + 30);

        const pagosProximos = await prisma.programaPagos.findMany({
          where: {
            fecha_programada: { gte: hoy, lte: en30Dias },
            estado: { in: ['PENDIENTE', 'PROGRAMADO'] },
          },
          orderBy: { fecha_programada: 'asc' },
          take: 10,
        });

        const totalPagosProximos = pagosProximos.reduce(
          (sum, p) => sum + Number(p.monto_programado), 0
        );

        // 3. Últimos 10 movimientos
        const ultimosMovimientos = await prisma.movimientoPresupuestal.findMany({
          orderBy: { fecha_registro: 'desc' },
          take: 10,
          include: { presupuesto: { select: { codigo: true } } },
        });

        // 4. Pagos vencidos
        const pagosVencidos = await prisma.programaPagos.count({
          where: {
            fecha_programada: { lt: hoy },
            estado: { in: ['PENDIENTE', 'PROGRAMADO'] },
          },
        });

        const alertas: Array<{ tipo: string; mensaje: string; severidad: string }> = [];
        if (resumenPresupuestal.porcentaje_ejercido > 80) {
          alertas.push({
            tipo: 'PRESUPUESTO_BAJO',
            mensaje: `Presupuesto ejercido al ${resumenPresupuestal.porcentaje_ejercido}% — disponibilidad limitada`,
            severidad: resumenPresupuestal.porcentaje_ejercido > 90 ? 'critical' : 'warning',
          });
        }
        if (pagosVencidos > 0) {
          alertas.push({
            tipo: 'PAGOS_VENCIDOS',
            mensaje: `${pagosVencidos} pago${pagosVencidos !== 1 ? 's' : ''} vencido${pagosVencidos !== 1 ? 's' : ''} sin procesar`,
            severidad: 'critical',
          });
        }

        return {
          resumen_presupuestal: resumenPresupuestal,
          pagos_proximos: {
            cantidad: pagosProximos.length,
            monto_total: totalPagosProximos,
            detalle: pagosProximos,
          },
          pagos_vencidos: pagosVencidos,
          ultimos_movimientos: ultimosMovimientos,
          alertas,
          cuentas_bancarias: [],
          ocs_por_pagar: 0,
        };
      }
    );

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error en dashboard:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al cargar dashboard financiero.'));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUENTAS BANCARIAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/finanzas/cuentas-bancarias',
  requireRoles('finanzas', 'admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).cuentaBancaria.findMany({
          where: { tenant_id: tenantId, activa: true },
          orderBy: { banco: 'asc' },
        });
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.post('/api/v1/finanzas/cuentas-bancarias',
  requireRoles('finanzas', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { banco, numero_cuenta, clabe, alias, moneda, saldo, proyecto_id } = req.body;
      if (!banco || !numero_cuenta || !alias) {
        return res.status(400).json({ success: false, message: 'banco, numero_cuenta y alias son obligatorios.' });
      }
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).cuentaBancaria.create({
          data: {
            tenant_id:     tenantId,
            proyecto_id:   proyecto_id ?? null,
            banco,
            numero_cuenta,
            clabe:         clabe ?? null,
            alias,
            moneda:        moneda ?? 'MXN',
            saldo:         saldo ? Number(saldo) : 0,
          },
        });
      });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.patch('/api/v1/finanzas/cuentas-bancarias/:id',
  requireRoles('finanzas', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { banco, numero_cuenta, clabe, alias, moneda, saldo } = req.body;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).cuentaBancaria.update({
          where: { id_cuenta: id },
          data: {
            ...(banco         !== undefined ? { banco }         : {}),
            ...(numero_cuenta !== undefined ? { numero_cuenta } : {}),
            ...(clabe         !== undefined ? { clabe }         : {}),
            ...(alias         !== undefined ? { alias }         : {}),
            ...(moneda        !== undefined ? { moneda }        : {}),
            ...(saldo         !== undefined ? { saldo: Number(saldo) } : {}),
          },
        });
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.delete('/api/v1/finanzas/cuentas-bancarias/:id',
  requireRoles('finanzas', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const tiene = await (prisma as any).pagoOC.count({ where: { cuenta_id: id } });
        if (tiene > 0) {
          const err: any = new Error('No se puede eliminar: la cuenta tiene pagos registrados.');
          err.status = 409;
          throw err;
        }
        return (prisma as any).cuentaBancaria.update({
          where: { id_cuenta: id },
          data: { activa: false },
        });
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.status ?? 500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTICIPO POR PROYECTO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/finanzas/proyectos/:proyectoId/anticipo',
  requireRoles('finanzas', 'admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { proyectoId: pId } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).proyectoFinanzas.findFirst({
          where: { tenant_id: tenantId, proyecto_id: pId },
        }) ?? { anticipo_total: 0, anticipo_usado: 0, disponible: 0 };
      });
      const record = data as any;
      res.json({ success: true, data: { ...record, disponible: Number(record.anticipo_total ?? 0) - Number(record.anticipo_usado ?? 0) } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.post('/api/v1/finanzas/proyectos/:proyectoId/anticipo',
  requireRoles('finanzas', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { proyectoId: pId } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { anticipo_total } = req.body;
      if (anticipo_total === undefined) {
        return res.status(400).json({ success: false, message: 'anticipo_total es obligatorio.' });
      }
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).proyectoFinanzas.upsert({
          where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: pId } },
          update: { anticipo_total: Number(anticipo_total) },
          create: { tenant_id: tenantId, proyecto_id: pId, anticipo_total: Number(anticipo_total), anticipo_usado: 0 },
        });
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAGOS DE OCS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/finanzas/pagos-oc',
  requireRoles('finanzas', 'admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { proyectoId: pId, proveedorId } = req.query as Record<string, string | undefined>;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).pagoOC.findMany({
          where: {
            tenant_id:  tenantId,
            ...(pId          ? { proyecto_id: pId }            : {}),
          },
          include: {
            detalles: true,
            cuenta:   { select: { banco: true, alias: true } },
          },
          orderBy: { created_at: 'desc' },
        });
      });
      const result = proveedorId
        ? (data as any[]).filter((p: any) => p.detalles.some((d: any) => d.proveedor_id === proveedorId))
        : data;
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.get('/api/v1/finanzas/pagos-oc/:id',
  requireRoles('finanzas', 'admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        return (prisma as any).pagoOC.findFirst({
          where: { id_pago: id, tenant_id: tenantId },
          include: { detalles: true, cuenta: true },
        });
      });
      if (!data) return res.status(404).json({ success: false, message: 'Pago no encontrado.' });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.post('/api/v1/finanzas/pagos-oc',
  requireRoles('finanzas', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId: ctxPid, userId } = req.securityContext;
      const { fuente, cuenta_id, tipo_pago, referencia, concepto, fecha_pago, proyecto_id, detalles } = req.body;

      if (!fuente || !tipo_pago || !referencia || !concepto || !fecha_pago || !proyecto_id || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }
      if (!['ANTICIPO', 'CUENTA_BANCARIA'].includes(fuente)) {
        return res.status(400).json({ success: false, message: 'fuente debe ser ANTICIPO o CUENTA_BANCARIA.' });
      }
      if (fuente === 'CUENTA_BANCARIA' && !cuenta_id) {
        return res.status(400).json({ success: false, message: 'cuenta_id es requerido para fuente CUENTA_BANCARIA.' });
      }

      const montoTotal = (detalles as any[]).reduce((sum: number, d: any) => sum + Number(d.monto_aplicado), 0);

      const data = await createTenantContext({ tenantId, proyectoId: ctxPid, userId }, async (prisma) => {
        return (prisma as any).$transaction(async (tx: any) => {
          // Validar y descontar fuente
          if (fuente === 'ANTICIPO') {
            const pf = await tx.proyectoFinanzas.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyecto_id } });
            const disponible = Number(pf?.anticipo_total ?? 0) - Number(pf?.anticipo_usado ?? 0);
            if (disponible < montoTotal) {
              throw Object.assign(new Error(`Anticipo insuficiente. Disponible: $${disponible.toFixed(2)}, Requerido: $${montoTotal.toFixed(2)}`), { status: 422 });
            }
            if (pf) {
              await tx.proyectoFinanzas.update({
                where: { id_proyecto_finanzas: pf.id_proyecto_finanzas },
                data: { anticipo_usado: { increment: montoTotal } },
              });
            }
          } else {
            const cuenta = await tx.cuentaBancaria.findFirst({ where: { id_cuenta: cuenta_id, tenant_id: tenantId, activa: true } });
            if (!cuenta) throw Object.assign(new Error('Cuenta bancaria no encontrada.'), { status: 404 });
            if (Number(cuenta.saldo) < montoTotal) {
              throw Object.assign(new Error(`Saldo insuficiente. Disponible: $${Number(cuenta.saldo).toFixed(2)}, Requerido: $${montoTotal.toFixed(2)}`), { status: 422 });
            }
            await tx.cuentaBancaria.update({
              where: { id_cuenta: cuenta_id },
              data: { saldo: { decrement: montoTotal } },
            });
          }

          // Crear pago
          const pago = await tx.pagoOC.create({
            data: {
              tenant_id:   tenantId,
              proyecto_id: proyecto_id,
              fuente,
              cuenta_id:   fuente === 'CUENTA_BANCARIA' ? cuenta_id : null,
              tipo_pago,
              referencia,
              concepto,
              fecha_pago:  new Date(fecha_pago),
              monto_total: montoTotal,
              moneda:      'MXN',
              usuario_id:  userId,
              detalles: {
                create: (detalles as any[]).map((d: any) => ({
                  oc_id:            d.oc_id,
                  oc_codigo:        d.oc_codigo ?? d.oc_id.slice(0, 8),
                  proveedor_id:     d.proveedor_id,
                  proveedor_nombre: d.proveedor_nombre ?? '',
                  monto_aplicado:   Number(d.monto_aplicado),
                  saldo_oc_antes:   Number(d.saldo_oc_antes ?? 0),
                  saldo_oc_despues: Number(d.saldo_oc_despues ?? 0),
                  concepto_id:      d.concepto_id   ?? null,
                  concepto_clave:   d.concepto_clave ?? null,
                })),
              },
            },
            include: { detalles: true },
          });

          return pago;
        });
      });

      // Publicar eventos por OC pagada
      const correlationId = getCorrelationId(req);
      const context = { tenant_id: tenantId, proyecto_id: proyecto_id, user_id: userId, correlation_id: correlationId };
      for (const d of (data as any).detalles) {
        const isPagadaTotal = Number(d.saldo_oc_despues) <= 0;
        await publishFinanceDomainEvent(
          isPagadaTotal ? FinanzasEvents.OC_PAGADA_TOTAL : FinanzasEvents.OC_PAGADA_PARCIAL,
          context,
          {
            oc_id:           d.oc_id,
            oc_codigo:       d.oc_codigo,
            proveedor_id:    d.proveedor_id,
            monto_aplicado:  d.monto_aplicado,
            saldo_pendiente: d.saldo_oc_despues,
            pago_id:         (data as any).id_pago,
          } as any,
        );
      }

      logInfo(req, 'finanzas', 'finanzas.pago_oc.created', 'Pago OC registrado', { pago_id: (data as any).id_pago, monto: montoTotal });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(error.status ?? 500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORTES B2B (solo consumo interno desde otros microservicios)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function requireInternalService(serviceName: string) {
  return (req: Request, res: Response, next: any) => {
    const header = req.headers['x-internal-service'];
    if (header !== serviceName) {
      res.status(403).json({ success: false, message: 'Acceso restringido a servicios internos.' });
      return;
    }
    next();
  };
}

// GET /api/v1/finanzas/reportes/pagado-por-concepto?proyectoId=<uuid>
// Agrega SUM(monto_aplicado) por concepto_id para reporte de control presupuestal.
// Uso: B2B desde gerencia-tecnica.
app.get('/api/v1/finanzas/reportes/pagado-por-concepto',
  requireInternalService('gerencia-tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const proyectoId = (req.query.proyectoId ?? req.query.proyecto_id) as string;

      if (!proyectoId) {
        res.status(400).json({ success: false, message: 'proyectoId es requerido.' });
        return;
      }

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const rows = await (prisma as any).$queryRaw`
          SELECT
            concepto_id,
            concepto_clave,
            SUM(monto_aplicado)::numeric  AS monto_pagado,
            COUNT(*)::int                 AS count_pagos
          FROM detalles_pago_oc d
          JOIN pagos_oc p ON p.id_pago = d.pago_id
          WHERE p.tenant_id = ${tenantId}::uuid
            AND p.proyecto_id = ${proyectoId}::uuid
          GROUP BY concepto_id, concepto_clave
        `;
        return (rows as any[]).map((r: any) => ({
          concepto_id:    r.concepto_id ?? null,
          concepto_clave: r.concepto_clave ?? null,
          monto_pagado:   Number(r.monto_pagado),
          count_pagos:    Number(r.count_pagos),
        }));
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK (sin auth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    module: 'finanzas',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function handleEstimacionAprobadaEvent(event: BocamEvent): Promise<void> {
  const {
    estimacion_id,
    codigo,
    total_neto,
    presupuesto_id,
    total_conceptos,
  } = event.payload as {
    estimacion_id: string;
    codigo: string;
    total_neto: number;
    presupuesto_id?: string;
    total_conceptos?: number;
  };

  if (!estimacion_id || !codigo || !total_neto || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'finanzas.event.estimacion_aprobada.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      estimacion_id,
      presupuesto_id,
    }));
    return;
  }

  const result = await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const existente = await prisma.programaPagos.findFirst({
        where: {
          referencia_modulo: 'control-obra',
          referencia_entidad: 'Estimacion',
          referencia_id: estimacion_id,
        },
      });

      if (existente) {
        console.log(JSON.stringify({
          action: 'finanzas.event.estimacion_aprobada.idempotent',
          event_type: event.event_type,
          correlation_id: event.context.correlation_id,
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          estimacion_id,
          id_pago: existente.id_pago,
        }));
        return;
      }

      const pago = await prisma.programaPagos.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          presupuesto_id,
          concepto: `Estimacion ${codigo} - ${total_conceptos || 0} conceptos`,
          beneficiario: 'Constructora (Self)',
          monto_programado: Number(total_neto),
          fecha_programada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          estado: 'PENDIENTE',
          referencia_modulo: 'control-obra',
          referencia_entidad: 'Estimacion',
          referencia_id: estimacion_id,
        },
      });

      console.log(JSON.stringify({
        action: 'finanzas.event.estimacion_aprobada.created',
        event_type: event.event_type,
        correlation_id: event.context.correlation_id,
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        estimacion_id,
        presupuesto_id,
        id_pago: pago.id_pago,
      }));
    }
  );
}

export async function handleAvanceFisicoValidadoEvent(event: BocamEvent): Promise<void> {
  const {
    avance_id,
    concepto,
    importe,
    porcentaje,
    presupuesto_id,
  } = event.payload as {
    avance_id: string;
    concepto: string;
    importe: number;
    porcentaje?: number;
    presupuesto_id?: string;
  };

  if (!avance_id || !concepto || !importe || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'finanzas.event.avance_fisico_validado.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      avance_id,
      presupuesto_id,
    }));
    return;
  }

  const result = await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const existente = await prisma.programaPagos.findFirst({
        where: {
          referencia_modulo: 'control-obra',
          referencia_entidad: 'AvanceFisicoValidado',
          referencia_id: avance_id,
        },
      });

      if (existente) {
        console.log(JSON.stringify({
          action: 'finanzas.event.avance_fisico_validado.idempotent',
          event_type: event.event_type,
          correlation_id: event.context.correlation_id,
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          avance_id,
          id_pago: existente.id_pago,
        }));
        return;
      }

      const presupuesto = await prisma.presupuestoAsignado.findUnique({
        where: { id_presupuesto: presupuesto_id },
      });

      if (!presupuesto) {
        throw new Error(`Presupuesto ${presupuesto_id} no encontrado para el avance ${avance_id}.`);
      }

      const pago = await prisma.programaPagos.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          presupuesto_id,
          concepto: `Proyeccion por avance validado ${concepto}${porcentaje ? ` (${Number(porcentaje).toFixed(2)}%)` : ''}`,
          beneficiario: 'Pendiente de estimacion',
          monto_programado: Number(importe),
          fecha_programada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estado: 'PENDIENTE',
          referencia_modulo: 'control-obra',
          referencia_entidad: 'AvanceFisicoValidado',
          referencia_id: avance_id,
        },
      });

      console.log(JSON.stringify({
        action: 'finanzas.event.avance_fisico_validado.created',
        event_type: event.event_type,
        correlation_id: event.context.correlation_id,
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        avance_id,
        presupuesto_id,
        id_pago: pago.id_pago,
      }));
    }
  );
}

export async function handleCentroCostosCreadoEvent(event: BocamEvent): Promise<void> {
  const tenantId = event.context?.tenant_id;
  const proyectoId = event.context?.proyecto_id;

  if (!tenantId || !proyectoId) {
    console.error(JSON.stringify({
      action: 'finanzas.event.centro_costos_creado.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      payload: event.payload,
    }));
    return;
  }

  await createTenantContext(
    { tenantId, proyectoId, userId: event.context.user_id },
    async (prisma) => {
      // Reemplaza la creación manual: en vez de esperar al primer POST de
      // anticipo (que hoy es el único lugar que crea esta fila), se crea
      // proactivamente en 0/0 al nacer el centro de costos. Si la fila ya
      // existe (creada antes por ese flujo manual, o por reentrega del
      // evento), `update: {}` es un no-op — nunca sobreescribe valores
      // reales de anticipo ya registrados.
      await (prisma as any).proyectoFinanzas.upsert({
        where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
        update: {},
        create: { tenant_id: tenantId, proyecto_id: proyectoId, anticipo_total: 0, anticipo_usado: 0 },
      });
    }
  );

  console.log(JSON.stringify({
    action: 'finanzas.event.centro_costos_creado.processed',
    event_type: event.event_type,
    correlation_id: event.context.correlation_id,
    tenant_id: tenantId,
    proyecto_id: proyectoId,
  }));
}

export async function handleOrdenCompraCreadaEvent(event: BocamEvent): Promise<void> {
  const {
    oc_id,
    codigo,
    total,
    presupuesto_id,
  } = event.payload as {
    oc_id: string;
    codigo: string;
    total: number;
    presupuesto_id?: string;
  };

  if (!oc_id || !codigo || !total || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'finanzas.event.orden_compra_creada.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      oc_id,
      presupuesto_id,
    }));
    return;
  }

  const result = await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const existente = await prisma.movimientoPresupuestal.findFirst({
        where: {
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: oc_id,
          tipo: TipoMovimiento.COMPROMISO,
        },
      });

      if (existente) {
        console.log(JSON.stringify({
          action: 'finanzas.event.orden_compra_creada.idempotent',
          event_type: event.event_type,
          correlation_id: event.context.correlation_id,
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          oc_id,
          id_movimiento: existente.id_movimiento,
        }));
        return {
          evento: FinanzasEvents.FONDOS_COMPROMETIDOS,
          payload: {
            presupuesto_id,
            movimiento_id: existente.id_movimiento,
            monto_comprometido: Number(existente.monto),
            monto_disponible_restante: 0,
            referencia_oc_id: oc_id,
            referencia_oc_codigo: codigo,
            idempotente: true,
          } satisfies FondosComprometidosPayload,
        };
      }

      const presupuesto = await prisma.presupuestoAsignado.findUnique({
        where: { id_presupuesto: presupuesto_id },
      });

      if (!presupuesto) {
        throw new Error(`Presupuesto ${presupuesto_id} no encontrado para la OC ${codigo}.`);
      }

      const montoNum = Number(total);

      if (Number(presupuesto.monto_disponible) < montoNum) {
        console.warn(JSON.stringify({
          action: 'finanzas.event.orden_compra_creada.insufficient_budget',
          event_type: event.event_type,
          correlation_id: event.context.correlation_id,
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          oc_id,
          presupuesto_id,
          monto_solicitado: montoNum,
          monto_disponible: Number(presupuesto.monto_disponible),
        }));
        return {
          evento: FinanzasEvents.PRESUPUESTO_INSUFICIENTE,
          payload: {
            presupuesto_id,
            monto_solicitado: montoNum,
            monto_disponible: Number(presupuesto.monto_disponible),
            deficit: montoNum - Number(presupuesto.monto_disponible),
            referencia_oc_id: oc_id,
            referencia_oc_codigo: codigo,
            idempotente: false,
          } satisfies PresupuestoInsuficientePayload,
        };
      }

      const movimiento = await prisma.movimientoPresupuestal.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          presupuesto_id,
          tipo: TipoMovimiento.COMPROMISO,
          concepto: `Fondos comprometidos por OC ${codigo}`,
          monto: montoNum,
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: oc_id,
          referencia_codigo: codigo,
          usuario_id: event.context.user_id,
          notas: 'Compromiso automatico desde evento compras.oc_creada.',
        },
      });

      await prisma.presupuestoAsignado.update({
        where: { id_presupuesto: presupuesto_id },
        data: {
          monto_comprometido: { increment: montoNum },
          monto_disponible: { decrement: montoNum },
        },
      });

      console.log(JSON.stringify({
        action: 'finanzas.event.orden_compra_creada.created',
        event_type: event.event_type,
        correlation_id: event.context.correlation_id,
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        oc_id,
        presupuesto_id,
        id_movimiento: movimiento.id_movimiento,
      }));

      return {
        evento: FinanzasEvents.FONDOS_COMPROMETIDOS,
        payload: {
          presupuesto_id,
          movimiento_id: movimiento.id_movimiento,
          monto_comprometido: montoNum,
          monto_disponible_restante: Number(presupuesto.monto_disponible) - montoNum,
          referencia_oc_id: oc_id,
          referencia_oc_codigo: codigo,
          idempotente: false,
        } satisfies FondosComprometidosPayload,
      };
    }
  );

  await publishFinanceDomainEvent(result.evento, event.context, result.payload);
}

export async function handleOrdenCompraCanceladaEvent(event: BocamEvent): Promise<void> {
  const {
    oc_id,
    codigo,
    total,
    presupuesto_id,
  } = event.payload as {
    oc_id: string;
    codigo: string;
    total: number;
    presupuesto_id?: string;
  };

  if (!oc_id || !codigo || !total || !presupuesto_id) {
    console.error(JSON.stringify({
      action: 'finanzas.event.orden_compra_cancelada.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      oc_id,
      presupuesto_id,
    }));
    return;
  }

  const result = await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const existente = await prisma.movimientoPresupuestal.findFirst({
        where: {
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: oc_id,
          tipo: TipoMovimiento.LIBERACION,
        },
      });

      if (existente) {
        console.log(JSON.stringify({
          action: 'finanzas.event.orden_compra_cancelada.idempotent',
          event_type: event.event_type,
          correlation_id: event.context.correlation_id,
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          oc_id,
          id_movimiento: existente.id_movimiento,
        }));
        return {
          evento: FinanzasEvents.FONDOS_LIBERADOS,
          payload: {
            presupuesto_id,
            movimiento_id: existente.id_movimiento,
            monto_liberado: Number(existente.monto),
            referencia_oc_id: oc_id,
            referencia_oc_codigo: codigo,
            idempotente: true,
          } satisfies FondosLiberadosPayload,
        };
      }

      const presupuesto = await prisma.presupuestoAsignado.findUnique({
        where: { id_presupuesto: presupuesto_id },
      });

      if (!presupuesto) {
        throw new Error(`Presupuesto ${presupuesto_id} no encontrado para la cancelacion de OC ${codigo}.`);
      }

      const montoNum = Number(total);

      if (Number(presupuesto.monto_comprometido) < montoNum) {
        console.warn(JSON.stringify({
          action: 'finanzas.event.orden_compra_cancelada.insufficient_commitment',
          event_type: event.event_type,
          correlation_id: event.context.correlation_id,
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          oc_id,
          presupuesto_id,
          monto_liberar: montoNum,
          monto_comprometido: Number(presupuesto.monto_comprometido),
        }));
        return {
          evento: FinanzasEvents.FONDOS_LIBERADOS,
          payload: {
            presupuesto_id,
            movimiento_id: '',
            monto_liberado: 0,
            referencia_oc_id: oc_id,
            referencia_oc_codigo: codigo,
            idempotente: false,
          } satisfies FondosLiberadosPayload,
          skipPublish: true,
        };
      }

      const movimiento = await prisma.movimientoPresupuestal.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          presupuesto_id,
          tipo: TipoMovimiento.LIBERACION,
          concepto: `Liberacion de fondos por OC ${codigo}`,
          monto: montoNum,
          referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra',
          referencia_id: oc_id,
          referencia_codigo: codigo,
          usuario_id: event.context.user_id,
          notas: 'Liberacion automatica desde evento compras.oc_cancelada.',
        },
      });

      await prisma.presupuestoAsignado.update({
        where: { id_presupuesto: presupuesto_id },
        data: {
          monto_comprometido: { decrement: montoNum },
          monto_disponible: { increment: montoNum },
        },
      });

      console.log(JSON.stringify({
        action: 'finanzas.event.orden_compra_cancelada.created',
        event_type: event.event_type,
        correlation_id: event.context.correlation_id,
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        oc_id,
        presupuesto_id,
        id_movimiento: movimiento.id_movimiento,
      }));

      return {
        evento: FinanzasEvents.FONDOS_LIBERADOS,
        payload: {
          presupuesto_id,
          movimiento_id: movimiento.id_movimiento,
          monto_liberado: montoNum,
          referencia_oc_id: oc_id,
          referencia_oc_codigo: codigo,
          idempotente: false,
        } satisfies FondosLiberadosPayload,
      };
    }
  );

  if (!result.skipPublish) {
    await publishFinanceDomainEvent(result.evento, event.context, result.payload);
  }
}

// ─── Sincronización de presupuesto por partida (Gerencia Técnica) ─────────────
// Ver openspec/changes/unificar-presupuesto-a-partidas-gt. GT es la única fuente
// de verdad para el saldo/gate de bloqueo por partida (SaldoPartida) — este
// espejo en Finanzas solo sirve para programación de pagos y reportes propios.
const CATEGORIA_A_CAPITULO: Record<string, string> = {
  MATERIAL: 'MATERIALES',
  MANO_DE_OBRA: 'MANO_OBRA',
  EQUIPO: 'EQUIPOS',
  SUBCONTRATO: 'SUBCONTRATOS',
  INDIRECTO: 'INDIRECTOS',
};

export async function handleSaldoPartidaCreadoEvent(event: BocamEvent): Promise<void> {
  const { partidas } = event.payload as {
    partidas: Array<{
      concepto_id: string;
      concepto_clave: string;
      concepto_desc: string;
      monto_aprobado: number;
      categoria_predominante: string | null;
    }>;
  };

  if (!Array.isArray(partidas) || partidas.length === 0) {
    console.error(JSON.stringify({
      action: 'finanzas.event.saldo_partida_creado.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
    }));
    return;
  }

  const tenantId = event.context.tenant_id;
  const proyectoId = event.context.proyecto_id;

  await createTenantContext({ tenantId, proyectoId, userId: event.context.user_id }, async (prisma) => {
    for (const partida of partidas) {
      const monto = Number(partida.monto_aprobado);
      const capitulo = CATEGORIA_A_CAPITULO[partida.categoria_predominante || ''] || 'INDIRECTOS';

      await prisma.presupuestoAsignado.upsert({
        where: {
          uq_presupuesto_concepto: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: partida.concepto_id },
        },
        update: {
          monto_autorizado: monto,
          monto_disponible: monto,
          concepto_clave: partida.concepto_clave,
          capitulo,
        },
        create: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          concepto_id: partida.concepto_id,
          concepto_clave: partida.concepto_clave,
          codigo: partida.concepto_clave,
          descripcion: partida.concepto_desc,
          monto_autorizado: monto,
          monto_disponible: monto,
          capitulo,
          estatus: 'ACTIVO',
        },
      });
    }
  });

  console.log(JSON.stringify({
    action: 'finanzas.event.saldo_partida_creado.processed',
    event_type: event.event_type,
    correlation_id: event.context.correlation_id,
    tenant_id: tenantId,
    proyecto_id: proyectoId,
    partidas_sincronizadas: partidas.length,
  }));
}

// Sincroniza monto_comprometido cuando GT compromete el saldo de una partida
// (POST /partidas/:concepto_id/comprometer). Usa DELIBERADAMENTE la misma clave
// de idempotencia (referencia_modulo='compras', referencia_entidad='OrdenCompra')
// que ya usa handleOrdenCompraCreadaEvent — así este evento y el flujo existente
// de compras.oc_creada / POST comprometer-fondos son caminos intercambiables que
// nunca duplican el compromiso, sin importar cuál llegue primero.
export async function handlePartidaComprometidaEvent(event: BocamEvent): Promise<void> {
  const { concepto_id, monto, referencia_id, referencia_codigo, tipo } = event.payload as {
    concepto_id: string; monto: number; referencia_id: string; referencia_codigo?: string; tipo: string;
  };

  if (!concepto_id || !monto || !referencia_id) {
    console.error(JSON.stringify({
      action: 'finanzas.event.partida_comprometida.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context.correlation_id,
    }));
    return;
  }

  const tenantId = event.context.tenant_id;
  const proyectoId = event.context.proyecto_id;

  await createTenantContext({ tenantId, proyectoId, userId: event.context.user_id }, async (prisma) => {
    const existente = await prisma.movimientoPresupuestal.findFirst({
      where: { referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id, tipo: TipoMovimiento.COMPROMISO },
    });
    if (existente) {
      console.log(JSON.stringify({ action: 'finanzas.event.partida_comprometida.idempotent', referencia_id }));
      return;
    }

    const presupuesto = await prisma.presupuestoAsignado.findFirst({
      where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id },
    });
    if (!presupuesto) {
      console.warn(JSON.stringify({
        action: 'finanzas.event.partida_comprometida.sin_presupuesto_sincronizado',
        tenant_id: tenantId, proyecto_id: proyectoId, concepto_id, referencia_id,
      }));
      return;
    }

    const montoNum = Number(monto);
    await prisma.movimientoPresupuestal.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id_presupuesto,
        tipo: TipoMovimiento.COMPROMISO, concepto: `Compromiso por ${tipo} ${referencia_codigo || referencia_id}`, monto: montoNum,
        referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id, referencia_codigo: referencia_codigo || null,
        usuario_id: event.context.user_id,
        notas: 'Compromiso sincronizado desde evento gerencia_tecnica.partida_comprometida.',
      },
    });
    await prisma.presupuestoAsignado.update({
      where: { id_presupuesto: presupuesto.id_presupuesto },
      data: { monto_comprometido: { increment: montoNum }, monto_disponible: { decrement: montoNum } },
    });
  });

  console.log(JSON.stringify({ action: 'finanzas.event.partida_comprometida.processed', concepto_id, referencia_id, tenant_id: tenantId, proyecto_id: proyectoId }));
}

// ─── Presupuesto de Mano de Obra a nivel proyecto (nómina) ─────────────────────
// Ver openspec/changes/unificar-presupuesto-a-partidas-gt, capacidad
// presupuesto-mano-obra-proyecto. La nómina NUNCA debe bloquearse por falta de
// presupuesto — best-effort, solo alerta si no hay bolsa MANO_OBRA activa.
async function resolvePresupuestoManoObra(tenantId: string, proyectoId: string, prisma: PrismaClient) {
  return (prisma as any).presupuestoAsignado.findFirst({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, capitulo: 'MANO_OBRA', concepto_id: null, estatus: 'ACTIVO' },
  });
}

export async function handleNominaAutorizadaEvent(event: BocamEvent): Promise<void> {
  const { prenomina_id, codigo, total_neto } = event.payload as {
    prenomina_id: string; codigo: string; total_neto: number;
  };
  const tenantId = event.context.tenant_id;
  const proyectoId = event.context.proyecto_id;

  await createTenantContext({ tenantId, proyectoId, userId: event.context.user_id }, async (prisma) => {
    const existente = await prisma.movimientoPresupuestal.findFirst({
      where: { referencia_modulo: 'personal', referencia_entidad: 'PreNomina', referencia_id: prenomina_id, tipo: TipoMovimiento.COMPROMISO },
    });
    if (existente) {
      console.log(JSON.stringify({ action: 'finanzas.event.nomina_autorizada.idempotent', prenomina_id }));
      return;
    }

    const presupuesto = await resolvePresupuestoManoObra(tenantId, proyectoId, prisma);
    if (!presupuesto) {
      console.warn(JSON.stringify({
        action: 'finanzas.event.nomina_autorizada.sin_presupuesto_mano_obra',
        tenant_id: tenantId, proyecto_id: proyectoId, prenomina_id, codigo,
        mensaje: 'No hay presupuesto MANO_OBRA activo para este proyecto — la nómina se autorizó igual, sin afectar ningún presupuesto.',
      }));
      return;
    }

    const monto = Number(total_neto);
    await prisma.movimientoPresupuestal.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id_presupuesto,
        tipo: TipoMovimiento.COMPROMISO, concepto: `Nómina ${codigo}`, monto,
        referencia_modulo: 'personal', referencia_entidad: 'PreNomina', referencia_id: prenomina_id, referencia_codigo: codigo,
        usuario_id: event.context.user_id,
        notas: 'Compromiso automático desde evento personal.nomina_autorizada.',
      },
    });
    await prisma.presupuestoAsignado.update({
      where: { id_presupuesto: presupuesto.id_presupuesto },
      data: { monto_comprometido: { increment: monto }, monto_disponible: { decrement: monto } },
    });
  });

  console.log(JSON.stringify({ action: 'finanzas.event.nomina_autorizada.processed', prenomina_id, tenant_id: tenantId, proyecto_id: proyectoId }));
}

export async function handleNominaPagadaEvent(event: BocamEvent): Promise<void> {
  const { prenomina_id, codigo, total_neto } = event.payload as {
    prenomina_id: string; codigo: string; total_neto: number;
  };
  const tenantId = event.context.tenant_id;
  const proyectoId = event.context.proyecto_id;

  await createTenantContext({ tenantId, proyectoId, userId: event.context.user_id }, async (prisma) => {
    const existente = await prisma.movimientoPresupuestal.findFirst({
      where: { referencia_modulo: 'personal', referencia_entidad: 'PreNomina', referencia_id: prenomina_id, tipo: TipoMovimiento.EJERCIDO },
    });
    if (existente) {
      console.log(JSON.stringify({ action: 'finanzas.event.nomina_pagada.idempotent', prenomina_id }));
      return;
    }

    const presupuesto = await resolvePresupuestoManoObra(tenantId, proyectoId, prisma);
    if (!presupuesto) {
      console.warn(JSON.stringify({
        action: 'finanzas.event.nomina_pagada.sin_presupuesto_mano_obra',
        tenant_id: tenantId, proyecto_id: proyectoId, prenomina_id, codigo,
      }));
      return;
    }

    const monto = Number(total_neto);
    await prisma.movimientoPresupuestal.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id_presupuesto,
        tipo: TipoMovimiento.EJERCIDO, concepto: `Pago nómina ${codigo}`, monto,
        referencia_modulo: 'personal', referencia_entidad: 'PreNomina', referencia_id: prenomina_id, referencia_codigo: codigo,
        usuario_id: event.context.user_id,
        notas: 'Ejercido automático desde evento personal.nomina_pagada.',
      },
    });
    await prisma.presupuestoAsignado.update({
      where: { id_presupuesto: presupuesto.id_presupuesto },
      data: { monto_comprometido: { decrement: monto }, monto_ejercido: { increment: monto } },
    });
  });

  console.log(JSON.stringify({ action: 'finanzas.event.nomina_pagada.processed', prenomina_id, tenant_id: tenantId, proyecto_id: proyectoId }));
}

setupSentryExpressHandler(app);

export async function startServer() {
  return app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  💰  Módulo: FINANZAS (Tesorería y Flujo de Caja)');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('  🔐  Autenticación: JWT REAL (Bearer Token)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Finanzas] ✅ Servidor en puerto ${PORT}`);

  // Inicializar EventBus y suscribirse a eventos
  await eventBus.connect();

  // ─── SUSCRIPCIÓN: Eventos de Compras ──────────────────────────────────────
  await eventBus.subscribe('compras.oc_creada', async (event: BocamEvent) => {
    const { oc_id, codigo, total, proveedor_id } = event.payload as any;
    console.log(`[Finanzas] 📥 EVENTO recibido: OC Creada`);
    console.log(`           └─ OC: ${codigo} | Total: $${Number(total).toLocaleString()} | Proveedor: ${proveedor_id}`);
    console.log(`           └─ Tenant: ${event.context.tenant_id.substring(0, 8)}... | Proyecto: ${event.context.proyecto_id.substring(0, 8)}...`);
    await handleOrdenCompraCreadaEvent(event);
  });

  await eventBus.subscribe('compras.oc_cancelada', async (event: BocamEvent) => {
    const { oc_id, codigo } = event.payload as any;
    console.log(`[Finanzas] 📥 EVENTO recibido: OC Cancelada`);
    console.log(`           └─ OC: ${codigo} | Liberando fondos comprometidos`);
    await handleOrdenCompraCanceladaEvent(event);
  });

  // ─── SUSCRIPCIÓN: Eventos de Control de Obra ────────────────────────────────
  await eventBus.subscribe('control_obra.estimacion_aprobada', async (event: BocamEvent) => {
    const { estimacion_id, codigo, total_neto } = event.payload as any;
    console.log(`[Finanzas] 📥 EVENTO recibido: Estimación Aprobada`);
    console.log(`           └─ EST: ${codigo} | Neto: $${Number(total_neto).toLocaleString()}`);
    console.log(`           └─ Programando pago automático a 15 días...`);
    await handleEstimacionAprobadaEvent(event);
  });

  await eventBus.subscribe('control_obra.avance_fisico_validado', async (event: BocamEvent) => {
    const { avance_id, concepto, importe } = event.payload as any;
    console.log(`[Finanzas] EVENTO recibido: Avance Fisico Validado`);
    console.log(`Avance: ${avance_id} | ${concepto} | $${Number(importe).toLocaleString()}`);
    console.log(`Registrando proyeccion financiera preliminar...`);
    await handleAvanceFisicoValidadoEvent(event);
  });

  await eventBus.subscribe('control_obra.avance_fisico_registrado', async (event: BocamEvent) => {
    const { concepto, porcentaje, importe } = event.payload as any;
    console.log(`[Finanzas] 📥 EVENTO recibido: Avance Físico Registrado`);
    console.log(`           └─ ${concepto} | ${porcentaje}% | $${Number(importe).toLocaleString()}`);
  });

  // ─── SUSCRIPCIÓN: Eventos de Auth (Administración) ──────────────────────────
  await eventBus.subscribe('auth.centro_costos_creado', async (event: BocamEvent) => {
    console.log(`[Finanzas] 📥 EVENTO recibido: Centro de Costos Creado`);
    console.log(`           └─ Tenant: ${event.context.tenant_id.substring(0, 8)}... | Proyecto: ${event.context.proyecto_id.substring(0, 8)}...`);
    await handleCentroCostosCreadoEvent(event);
  });

  // ─── SUSCRIPCIÓN: Sincronización de presupuesto por partida (Gerencia Técnica) ──
  await eventBus.subscribe('gerencia_tecnica.saldo_partida_creado', async (event: BocamEvent) => {
    console.log(`[Finanzas] 📥 EVENTO recibido: Saldo Partida Creado (sincronizando presupuesto por partida)`);
    await handleSaldoPartidaCreadoEvent(event);
  });
  await eventBus.subscribe('gerencia_tecnica.partida_comprometida', async (event: BocamEvent) => {
    console.log(`[Finanzas] 📥 EVENTO recibido: Partida Comprometida (GT)`);
    await handlePartidaComprometidaEvent(event);
  });

  // ─── SUSCRIPCIÓN: Nómina compromete/ejerce el presupuesto de Mano de Obra ──────
  await eventBus.subscribe('personal.nomina_autorizada', async (event: BocamEvent) => {
    console.log(`[Finanzas] 📥 EVENTO recibido: Nómina Autorizada`);
    await handleNominaAutorizadaEvent(event);
  });
  await eventBus.subscribe('personal.nomina_pagada', async (event: BocamEvent) => {
    console.log(`[Finanzas] 📥 EVENTO recibido: Nómina Pagada`);
    await handleNominaPagadaEvent(event);
  });

  console.log('[Finanzas] 📡 Suscrito a: compras.oc_creada, compras.oc_cancelada, control_obra.estimacion_aprobada, control_obra.avance_fisico_validado, control_obra.avance_fisico_registrado, auth.centro_costos_creado, gerencia_tecnica.saldo_partida_creado, personal.nomina_autorizada, personal.nomina_pagada');
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

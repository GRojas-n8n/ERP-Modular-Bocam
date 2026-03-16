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
  TipoMovimiento,
  FinanzasEvents,
  SuficienciaPresupuestal,
} from './types';

// ─── Importar middleware JWT compartido ──────────────────────────────────────
import { createAuthMiddleware } from '../../../packages/auth-middleware/src';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'bocam_dev_secret_CAMBIAR_EN_PRODUCCION_2026';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT REAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));

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

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error en suficiencia:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al consultar suficiencia presupuestal.'));
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
    const { codigo, descripcion, monto_autorizado, capitulo, moneda } = req.body;

    // Validación RBAC: Solo admin, superintendent o finance pueden crear presupuestos
    const rolesAutorizados = ['admin', 'superintendent', 'finance'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'No tienes permisos para crear presupuestos. Roles requeridos: admin, superintendent o finance.'
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
app.get('/api/v1/finanzas/movimientos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const presupuestoId = req.query.presupuesto_id as string;

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.movimientoPresupuestal.findMany({
          where: presupuestoId ? { presupuesto_id: presupuestoId } : undefined,
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
    const rolesAutorizados = ['admin', 'superintendent', 'finance'];
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: POST /api/v1/finanzas/comprometer-fondos
//
// Endpoint específico para el evento OrdenCompraEmitida.
// Compras llama este endpoint (o se invoca vía suscriptor de eventos)
// para congelar fondos automáticamente.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/v1/finanzas/comprometer-fondos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
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

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const presupuesto = await prisma.presupuestoAsignado.findUnique({
          where: { id_presupuesto: presupuesto_id },
        });

        if (!presupuesto) {
          throw new Error('Presupuesto no encontrado.');
        }

        const montoNum = Number(monto);
        const disponible = Number(presupuesto.monto_disponible);

        // Verificar suficiencia
        if (montoNum > disponible) {
          // Emitir evento: PresupuestoInsuficiente
          console.log(`[Finanzas] ⚠️ PRESUPUESTO INSUFICIENTE para OC ${oc_codigo}`);
          console.log(`   Disponible: $${disponible.toLocaleString()}`);
          console.log(`   Solicitado: $${montoNum.toLocaleString()}`);
          console.log(`   Déficit:    $${(montoNum - disponible).toLocaleString()}`);

          // TODO: Emitir evento via RabbitMQ → finanzas.presupuesto_insuficiente
          return {
            evento: FinanzasEvents.PRESUPUESTO_INSUFICIENTE,
            suficiencia: false,
            presupuesto_id,
            monto_solicitado: montoNum,
            monto_disponible: disponible,
            deficit: montoNum - disponible,
            oc_id,
            oc_codigo,
          };
        }

        // Crear movimiento de compromiso
        const movimiento = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id,
            tipo: TipoMovimiento.COMPROMISO,
            concepto: concepto || `Fondos comprometidos por OC ${oc_codigo}`,
            monto: montoNum,
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: oc_id,
            referencia_codigo: oc_codigo,
            usuario_id: userId,
            notas: 'Compromiso automático por emisión de Orden de Compra.',
          },
        });

        // Actualizar saldos
        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_id },
          data: {
            monto_comprometido: { increment: montoNum },
            monto_disponible: { decrement: montoNum },
          },
        });

        console.log(`[Finanzas] ✅ FONDOS COMPROMETIDOS: $${montoNum.toLocaleString()} para OC ${oc_codigo}`);

        // TODO: Emitir evento via RabbitMQ → finanzas.fondos_comprometidos
        return {
          evento: FinanzasEvents.FONDOS_COMPROMETIDOS,
          suficiencia: true,
          movimiento_id: movimiento.id_movimiento,
          presupuesto_id,
          monto_comprometido: montoNum,
          monto_disponible_restante: disponible - montoNum,
          oc_id,
          oc_codigo,
        };
      }
    );

    const statusCode = result.suficiencia ? 201 : 422;
    res.status(statusCode).json(createApiResponse(result, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error comprometiendo fondos:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al comprometer fondos.'));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: POST /api/v1/finanzas/liberar-fondos
//
// Complemento de comprometer-fondos. Se usa cuando una OC es cancelada
// o el monto final de la factura es menor al comprometido.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/v1/finanzas/liberar-fondos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
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

    const result = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        const presupuesto = await prisma.presupuestoAsignado.findUnique({
          where: { id_presupuesto: presupuesto_id },
        });

        if (!presupuesto) {
          throw new Error('Presupuesto no encontrado.');
        }

        const montoNum = Number(monto);

        // Crear movimiento de liberación
        const movimiento = await prisma.movimientoPresupuestal.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            presupuesto_id,
            tipo: TipoMovimiento.LIBERACION,
            concepto: concepto || `Liberación de fondos por OC ${oc_codigo} (Cancelación/Ajuste)`,
            monto: montoNum,
            referencia_modulo: 'compras',
            referencia_entidad: 'OrdenCompra',
            referencia_id: oc_id,
            referencia_codigo: oc_codigo,
            usuario_id: userId,
            notas: 'Proceso automático de liberación de fondos.',
          },
        });

        // Actualizar saldos: Disminuir comprometido, Aumentar disponible
        await prisma.presupuestoAsignado.update({
          where: { id_presupuesto: presupuesto_id },
          data: {
            monto_comprometido: { decrement: montoNum },
            monto_disponible: { increment: montoNum },
          },
        });

        console.log(`[Finanzas] 🔓 FONDOS LIBERADOS: $${montoNum.toLocaleString()} para OC ${oc_codigo}`);

        return {
          evento: FinanzasEvents.FONDOS_LIBERADOS,
          movimiento_id: movimiento.id_movimiento,
          presupuesto_id,
          monto_liberado: montoNum,
          oc_id,
          oc_codigo,
        };
      }
    );

    res.status(201).json(createApiResponse(result, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error liberando fondos:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al liberar fondos.'));
  }
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    const {
      presupuesto_id, concepto, beneficiario, beneficiario_id,
      monto_programado, fecha_programada, metodo_pago, banco,
      referencia_modulo, referencia_entidad, referencia_id,
    } = req.body;

    // Validación RBAC
    const rolesAutorizados = ['admin', 'superintendent', 'finance'];
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

    const data = await createTenantContext(
      { tenantId, proyectoId, userId },
      async (prisma) => {
        return await prisma.programaPagos.create({
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
      }
    );

    console.log(`[Finanzas] ✅ Pago programado: $${monto_programado} → ${beneficiario}`);
    res.status(201).json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Finanzas] Error programando pago:', error.message);
    res.status(500).json(createApiError('FIN_INTERNAL_ERROR', 'Error al programar pago.'));
  }
});

// Crear programación de pagos masiva
app.post('/api/v1/finanzas/pagos/bulk', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId, roles } = req.securityContext;
    const { pagos } = req.body; // Array de pagos

    // Validación RBAC
    const rolesAutorizados = ['admin', 'superintendent', 'finance'];
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

    // Validación RBAC
    const rolesAutorizados = ['admin', 'finance'];
    if (!roles.some((r: string) => rolesAutorizados.includes(r))) {
      res.status(403).json(createApiError(
        'FIN_FORBIDDEN',
        'Solo admin o finance pueden registrar pagos.'
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

    console.log(`[Finanzas] ✅ Pago procesado: ${id}`);
    res.json(createApiResponse(data, tenantId, proyectoId));
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

        return {
          resumen_presupuestal: resumenPresupuestal,
          pagos_proximos: {
            cantidad: pagosProximos.length,
            monto_total: totalPagosProximos,
            detalle: pagosProximos,
          },
          pagos_vencidos: pagosVencidos,
          ultimos_movimientos: ultimosMovimientos,
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
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  💰  Módulo: FINANZAS (Tesorería y Flujo de Caja)');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('  🔐  Autenticación: JWT REAL (Bearer Token)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Finanzas] ✅ Servidor en puerto ${PORT}`);
  console.log(`[Finanzas] 📡 Rutas disponibles:`);
  console.log(`   GET  /api/v1/finanzas/suficiencia        → Consulta disponibilidad (Compras lo usa)`);
  console.log(`   GET  /api/v1/finanzas/presupuestos       → Listar presupuestos del proyecto`);
  console.log(`   GET  /api/v1/finanzas/presupuestos/:id   → Detalle con movimientos`);
  console.log(`   POST /api/v1/finanzas/presupuestos       → Crear presupuesto`);
  console.log(`   GET  /api/v1/finanzas/movimientos        → Listar movimientos`);
  console.log(`   POST /api/v1/finanzas/movimientos        → Registrar movimiento`);
  console.log(`   POST /api/v1/finanzas/comprometer-fondos → Congelar fondos por OC`);
  console.log(`   GET  /api/v1/finanzas/pagos              → Programa de pagos`);
  console.log(`   POST /api/v1/finanzas/pagos              → Programar pago`);
  console.log(`   PATCH /api/v1/finanzas/pagos/:id/pagar   → Registrar pago procesado`);
  console.log(`   GET  /api/v1/finanzas/dashboard          → Dashboard financiero`);
  console.log(`   GET  /health                             → Health check`);
});

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Almacén — Inventario y Movimientos
 * Puerto: 3012
 *
 * Responsabilidades:
 * 1. Gestión de inventario de materiales por proyecto.
 * 2. Registro de movimientos INGRESO/EGRESO/TRASPASO.
 * 3. Auto-ingreso al recibir OCs (suscriptor RabbitMQ).
 * 4. Dashboard de KPIs de almacén.
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response } from 'express';
import { createTenantContext } from './db';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { createRateLimiter } from '../../../packages/rate-limiter/src';
import { createEventBus, BocamEvent } from '../../../packages/event-bus/src';
import {
  createObservabilityMiddleware,
  initSentry,
  logError,
  logInfo,
  setupSentryExpressHandler,
} from '../../../packages/observability/src';

initSentry(process.env.SENTRY_DSN || '', 'almacen');

const eventBus = createEventBus('almacen');
export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('almacen'));

const PORT = process.env.PORT || 3012;
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, serviceName: 'almacen' }));
app.use(requireProjectAccess());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INVENTARIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/almacen/inventario', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const q = (req.query.q as string | undefined)?.toLowerCase();

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.itemInventario.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { clave: 'asc' },
      });
    });

    const serialized = data
      .filter(item => !q || item.clave.toLowerCase().includes(q) || item.descripcion.toLowerCase().includes(q))
      .map(item => ({
        ...item,
        stock_actual:  Number(item.stock_actual),
        stock_minimo:  Number(item.stock_minimo),
        bajo_minimo:   Number(item.stock_actual) > 0 && Number(item.stock_actual) <= Number(item.stock_minimo),
        agotado:       Number(item.stock_actual) <= 0,
      }));

    logInfo(req, 'almacen', 'almacen.inventario.listado', 'Inventario consultado', { total: serialized.length });
    res.json({ success: true, data: serialized });
  } catch (error: any) {
    logError(req, 'almacen', 'almacen.inventario.error', 'Error al listar inventario', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/almacen/stock?insumo_ids=a,b,c — consulta batch de stock por
// insumo, para integraciones B2B (ej. Compras antes de solicitar cotización
// externa). Devuelve solo los insumo_id con fila en ItemInventario; los que
// no tienen fila simplemente no aparecen (equivalente a stock cero).
app.get('/api/v1/almacen/stock', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const insumoIdsParam = (req.query.insumo_ids as string | undefined) || '';
    const insumoIds = insumoIdsParam.split(',').map(s => s.trim()).filter(Boolean);

    if (insumoIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.itemInventario.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: { in: insumoIds } },
        select: { insumo_id: true, stock_actual: true },
      });
    });

    const serialized = data.map(item => ({
      insumo_id: item.insumo_id,
      stock_actual: Number(item.stock_actual),
    }));

    logInfo(req, 'almacen', 'almacen.stock.consultado', 'Stock por insumo consultado (B2B)', { insumos_solicitados: insumoIds.length, insumos_con_stock: serialized.length });
    res.json({ success: true, data: serialized });
  } catch (error: any) {
    logError(req, 'almacen', 'almacen.stock.error', 'Error al consultar stock por insumo', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/almacen/inventario',
  requireRoles('admin', 'superintendent', 'procurement', 'warehouse'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { insumo_id, clave, descripcion, unidad, categoria, stock_actual, stock_minimo, ubicacion } = req.body;

      if (!clave || !descripcion || !unidad || !categoria) {
        return res.status(400).json({ success: false, message: 'clave, descripcion, unidad y categoria son obligatorios.' });
      }

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const existing = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId, clave } });
        if (existing) {
          const err = new Error(`Ya existe un ítem con clave "${clave}" en este proyecto.`) as any;
          err.status = 409;
          throw err;
        }
        return prisma.itemInventario.create({
          data: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: insumo_id ?? null, clave, descripcion, unidad, categoria, stock_actual: stock_actual ?? 0, stock_minimo: stock_minimo ?? 0, ubicacion: ubicacion ?? null },
        });
      });

      res.status(201).json({ success: true, data: { ...data, stock_actual: Number(data.stock_actual), stock_minimo: Number(data.stock_minimo) } });
    } catch (error: any) {
      res.status((error as any).status ?? 500).json({ success: false, message: error.message });
    }
  }
);

app.patch('/api/v1/almacen/inventario/:id',
  requireRoles('admin', 'superintendent', 'procurement', 'warehouse'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { stock_minimo, ubicacion } = req.body;

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const existing = await prisma.itemInventario.findFirst({
          where: { id, tenant_id: tenantId, proyecto_id: proyectoId },
        });
        if (!existing) {
          const err = new Error('Ítem de inventario no encontrado.') as any;
          err.status = 404;
          throw err;
        }
        return prisma.itemInventario.update({
          where: { id },
          data: {
            ...(stock_minimo !== undefined ? { stock_minimo: Number(stock_minimo) } : {}),
            ...(ubicacion    !== undefined ? { ubicacion }                          : {}),
          },
        });
      });
      res.json({ success: true, data: { ...data, stock_actual: Number(data.stock_actual), stock_minimo: Number(data.stock_minimo) } });
    } catch (error: any) {
      res.status((error as any).status ?? 500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOVIMIENTOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/almacen/movimientos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { tipo, item_id } = req.query as Record<string, string | undefined>;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.movimientoAlmacen.findMany({
        where: {
          tenant_id:  tenantId,
          proyecto_id: proyectoId,
          ...(tipo    ? { tipo }             : {}),
          ...(item_id ? { item_id }          : {}),
        },
        include: { item: { select: { clave: true, descripcion: true, unidad: true } } },
        orderBy: { fecha: 'desc' },
        take: 200,
      });
    });

    const serialized = data.map(mov => ({
      id:                  mov.id,
      tipo:                mov.tipo,
      fecha:               mov.fecha,
      cantidad:            Number(mov.cantidad),
      unidad:              mov.unidad,
      origen:              mov.origen,
      destino:             mov.destino,
      responsable:         mov.responsable,
      referencia:          mov.referencia,
      insumo_clave:        mov.item?.clave       ?? '',
      insumo_descripcion:  mov.item?.descripcion ?? '',
    }));

    res.json({ success: true, data: serialized });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/almacen/movimientos',
  requireRoles('admin', 'superintendent', 'procurement', 'warehouse', 'resident', 'residencia', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { insumo_id, clave, descripcion, unidad, categoria, tipo, cantidad, origen, destino, responsable, referencia, concepto_id, concepto_clave, frente_trabajo, oc_item_id } = req.body;

      if (!insumo_id || !tipo || !cantidad) {
        return res.status(400).json({ success: false, message: 'insumo_id, tipo y cantidad son obligatorios.' });
      }
      if (!['INGRESO', 'EGRESO', 'TRASPASO', 'EGRESO_OBRA'].includes(tipo)) {
        return res.status(400).json({ success: false, message: 'tipo debe ser INGRESO, EGRESO, TRASPASO o EGRESO_OBRA.' });
      }
      if (tipo === 'EGRESO_OBRA' && !req.body.concepto_id) {
        return res.status(422).json({ success: false, message: 'concepto_id es obligatorio para EGRESO_OBRA.' });
      }

      const result = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        let item = await prisma.itemInventario.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id } });

        if (!item) {
          if (tipo !== 'INGRESO') {
            const err = new Error('Sin existencias en almacén. Registra primero un INGRESO.') as any;
            err.status = 404;
            throw err;
          }
          if (!clave || !descripcion || !unidad || !categoria) {
            throw new Error('Para el primer ingreso se requieren: clave, descripcion, unidad y categoria.');
          }
          item = await prisma.itemInventario.create({ data: { tenant_id: tenantId, proyecto_id: proyectoId, insumo_id, clave, descripcion, unidad, categoria, stock_actual: 0, stock_minimo: 0 } });
        }

        const qty = Number(cantidad);
        const stockNuevo = tipo === 'INGRESO'
          ? Number(item.stock_actual) + qty
          : Number(item.stock_actual) - qty;

        if ((tipo === 'EGRESO' || tipo === 'TRASPASO' || tipo === 'EGRESO_OBRA') && stockNuevo < 0) {
          const err = new Error(`Stock insuficiente. Disponible: ${Number(item.stock_actual)} — Solicitado: ${qty}`) as any;
          err.status = 422;
          throw err;
        }

        await prisma.itemInventario.update({ where: { id: item.id }, data: { stock_actual: stockNuevo } });
        const mov = await prisma.movimientoAlmacen.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            item_id: item.id,
            tipo,
            cantidad: qty,
            unidad: item.unidad,
            origen: origen ?? null,
            destino: destino ?? null,
            responsable: responsable ?? null,
            referencia: referencia ?? null,
            concepto_id: concepto_id ?? null,
            concepto_clave: concepto_clave ?? null,
            frente_trabajo: frente_trabajo ?? null,
            oc_item_id: oc_item_id ?? null,
          },
        });

        return { mov, item: { ...item, stock_actual: stockNuevo } };
      });

      // Publicar evento EGRESO_OBRA best-effort
      if (tipo === 'EGRESO_OBRA') {
        await eventBus.publish({
          event_type: 'almacen.salida_obra',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
          payload: {
            movimiento_id:  result.mov.id,
            item_id:        result.item.id,
            insumo_id:      result.item.insumo_id ?? null,
            clave:          result.item.clave,
            descripcion:    result.item.descripcion,
            unidad:         result.item.unidad,
            cantidad:       Number(result.mov.cantidad),
            concepto_id:    concepto_id,
            concepto_clave: concepto_clave ?? '',
            frente_trabajo: frente_trabajo ?? null,
            responsable:    responsable ?? null,
            fecha:          new Date().toISOString(),
          },
        }).catch((err: any) => {
          logError(req, 'almacen', 'almacen.salida_obra.event_error', 'No se pudo publicar almacen.salida_obra', { error_message: err.message });
        });
      }

      // Publicar alertas stock best-effort
      const stockActual = Number(result.item.stock_actual);
      const stockMin    = Number(result.item.stock_minimo);
      if (tipo !== 'INGRESO') {
        if (stockActual <= 0) {
          await eventBus.publish({ event_type: 'almacen.stock_agotado', timestamp: new Date().toISOString(), context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId }, payload: { item_id: result.item.id, clave: result.item.clave } }).catch(() => {});
        } else if (stockMin > 0 && stockActual <= stockMin) {
          await eventBus.publish({ event_type: 'almacen.stock_bajo', timestamp: new Date().toISOString(), context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId }, payload: { item_id: result.item.id, clave: result.item.clave, stock_actual: stockActual, stock_minimo: stockMin } }).catch(() => {});
        }
      }

      res.status(201).json({ success: true, data: { ...result.mov, cantidad: Number(result.mov.cantidad) } });
    } catch (error: any) {
      res.status((error as any).status ?? 500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACTIVOS FIJOS (equipo/herramienta/maquinaria/vehículos)
// Ver openspec/changes/control-almacen-activos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ACTIVO_ROLES_ESCRITURA = ['admin', 'superintendent', 'procurement', 'warehouse'] as const;
const CLASIFICACIONES_ACTIVO = ['EQUIPO', 'HERRAMIENTA', 'MAQUINARIA', 'VEHICULO'] as const;

function serializeActivo(a: any) {
  return { ...a, valor_adquisicion: a.valor_adquisicion != null ? Number(a.valor_adquisicion) : null };
}

app.get('/api/v1/almacen/activos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { clasificacion, estado, q } = req.query as Record<string, string | undefined>;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.activo.findMany({
        where: {
          tenant_id: tenantId,
          ...(clasificacion ? { clasificacion } : {}),
          ...(estado ? { estado } : {}),
          ...(q ? {
            OR: [
              { clave: { contains: q, mode: 'insensitive' } },
              { descripcion: { contains: q, mode: 'insensitive' } },
            ],
          } : {}),
        },
        orderBy: { numero_activo: 'asc' },
      });
    });

    res.json({ success: true, data: data.map(serializeActivo) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/almacen/activos', requireRoles(...ACTIVO_ROLES_ESCRITURA), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { clave, descripcion, clasificacion, proyecto_id, ubicacion, valor_adquisicion } = req.body;

    if (!clave || !descripcion || !clasificacion || !proyecto_id) {
      return res.status(400).json({ success: false, message: 'clave, descripcion, clasificacion y proyecto_id son obligatorios.' });
    }
    if (!CLASIFICACIONES_ACTIVO.includes(clasificacion)) {
      return res.status(400).json({ success: false, message: `clasificacion debe ser una de: ${CLASIFICACIONES_ACTIVO.join(', ')}.` });
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      // numero_activo autoincremental por tenant — mismo patrón que
      // numero_empleado en apps/personal/src/main.ts.
      const last = await prisma.activo.findFirst({
        where: { tenant_id: tenantId },
        orderBy: { numero_activo: 'desc' },
        select: { numero_activo: true },
      });
      const lastNum = last ? parseInt(last.numero_activo.replace('ACT-', '')) : 0;
      const numero_activo = `ACT-${String(lastNum + 1).padStart(3, '0')}`;

      return prisma.activo.create({
        data: {
          tenant_id: tenantId,
          numero_activo,
          clave,
          descripcion,
          clasificacion,
          proyecto_id,
          ubicacion: ubicacion ?? null,
          valor_adquisicion: valor_adquisicion != null ? Number(valor_adquisicion) : null,
        },
      });
    });

    logInfo(req, 'almacen', 'almacen.activo.creado', `Activo ${data.numero_activo} registrado`, { activo_id: data.id_activo });
    res.status(201).json({ success: true, data: serializeActivo(data) });
  } catch (error: any) {
    logError(req, 'almacen', 'almacen.activo.crear.error', 'Error al crear activo', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/v1/almacen/activos/:id', requireRoles(...ACTIVO_ROLES_ESCRITURA), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    // proyecto_id/asignado_a_empleado_id se ignoran deliberadamente aquí —
    // esos cambios solo pueden aplicarse vía el flujo de traspasos (ver
    // Requirement "El sistema SHALL NOT permitir cambiar proyecto_id ni
    // asignado_a_empleado_id desde este endpoint").
    const { descripcion, ubicacion, valor_adquisicion } = req.body;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const existe = await prisma.activo.findFirst({ where: { id_activo: id, tenant_id: tenantId } });
      if (!existe) {
        const err = new Error('Activo no encontrado.') as any;
        err.status = 404;
        throw err;
      }
      return prisma.activo.update({
        where: { id_activo: id },
        data: {
          ...(descripcion !== undefined ? { descripcion } : {}),
          ...(ubicacion !== undefined ? { ubicacion } : {}),
          ...(valor_adquisicion !== undefined ? { valor_adquisicion: valor_adquisicion != null ? Number(valor_adquisicion) : null } : {}),
        },
      });
    });

    res.json({ success: true, data: serializeActivo(data) });
  } catch (error: any) {
    res.status((error as any).status ?? 500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/almacen/activos/:id/baja', requireRoles(...ACTIVO_ROLES_ESCRITURA), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({ success: false, message: 'motivo es obligatorio para dar de baja un activo.' });
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const existe = await prisma.activo.findFirst({ where: { id_activo: id, tenant_id: tenantId } });
      if (!existe) {
        const err = new Error('Activo no encontrado.') as any;
        err.status = 404;
        throw err;
      }
      return prisma.activo.update({
        where: { id_activo: id },
        data: { estado: 'BAJA', fecha_baja: new Date(), motivo_baja: motivo },
      });
    });

    logInfo(req, 'almacen', 'almacen.activo.baja', `Activo ${data.numero_activo} dado de baja`, { activo_id: data.id_activo, motivo });
    res.json({ success: true, data: serializeActivo(data) });
  } catch (error: any) {
    res.status((error as any).status ?? 500).json({ success: false, message: error.message });
  }
});

// ── Traspasos (proyecto y/o asignación a empleado, con aprobación) ────────
// Ver Decisión D3 de openspec/changes/control-almacen-activos/design.md.

const TRASPASO_TIPOS = ['PROYECTO', 'ASIGNACION', 'AMBOS'] as const;

app.post('/api/v1/almacen/activos/:id/traspasos', requireRoles(...ACTIVO_ROLES_ESCRITURA), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const { tipo, proyecto_destino_id, empleado_destino_id, empleado_destino_nombre } = req.body;

    if (!tipo || !TRASPASO_TIPOS.includes(tipo)) {
      return res.status(400).json({ success: false, message: `tipo debe ser una de: ${TRASPASO_TIPOS.join(', ')}.` });
    }
    if ((tipo === 'PROYECTO' || tipo === 'AMBOS') && !proyecto_destino_id) {
      return res.status(400).json({ success: false, message: 'proyecto_destino_id es obligatorio para tipo PROYECTO o AMBOS.' });
    }
    if ((tipo === 'ASIGNACION' || tipo === 'AMBOS') && empleado_destino_id === undefined) {
      return res.status(400).json({ success: false, message: 'empleado_destino_id es obligatorio para tipo ASIGNACION o AMBOS (usar null para liberar).' });
    }

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const activo = await prisma.activo.findFirst({ where: { id_activo: id, tenant_id: tenantId } });
      if (!activo) {
        const err = new Error('Activo no encontrado.') as any;
        err.status = 404;
        throw err;
      }
      if (activo.estado === 'BAJA' || activo.estado === 'EN_TRASPASO') {
        const err = new Error(`El activo está en estado ${activo.estado} y no admite una nueva solicitud de traspaso.`) as any;
        err.status = 409;
        throw err;
      }

      const solicitud = await prisma.traspasoActivo.create({
        data: {
          tenant_id: tenantId,
          activo_id: id,
          tipo,
          proyecto_origen_id: activo.proyecto_id,
          proyecto_destino_id: proyecto_destino_id ?? null,
          empleado_origen_id: activo.asignado_a_empleado_id,
          empleado_origen_nombre: activo.asignado_a_empleado_nombre,
          empleado_destino_id: empleado_destino_id ?? null,
          empleado_destino_nombre: empleado_destino_nombre ?? null,
          solicitado_por: userName || userId,
        },
      });

      await prisma.activo.update({ where: { id_activo: id }, data: { estado: 'EN_TRASPASO' } });

      return solicitud;
    });

    logInfo(req, 'almacen', 'almacen.activo.traspaso.solicitado', `Traspaso solicitado para activo ${id}`, { activo_id: id, traspaso_id: data.id_traspaso, tipo });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status((error as any).status ?? 500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/almacen/activos/traspasos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { estado, proyecto_destino_id } = req.query as Record<string, string | undefined>;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.traspasoActivo.findMany({
        where: {
          tenant_id: tenantId,
          ...(estado ? { estado } : {}),
          ...(proyecto_destino_id ? { proyecto_destino_id } : {}),
        },
        include: { activo: { select: { numero_activo: true, clave: true, descripcion: true } } },
        orderBy: { solicitado_en: 'desc' },
      });
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/v1/almacen/activos/traspasos/:id/confirmar', requireRoles(...ACTIVO_ROLES_ESCRITURA), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const solicitud = await prisma.traspasoActivo.findFirst({ where: { id_traspaso: id, tenant_id: tenantId } });
      if (!solicitud) {
        const err = new Error('Solicitud de traspaso no encontrada.') as any;
        err.status = 404;
        throw err;
      }
      if (solicitud.estado !== 'PENDIENTE') {
        const err = new Error(`La solicitud ya está ${solicitud.estado}.`) as any;
        err.status = 409;
        throw err;
      }
      // Quien confirma un cambio de proyecto SHALL estar operando con el
      // proyecto destino activo en su sesión (ver Requirement en
      // specs/activos-fijos-traspasos).
      if (solicitud.proyecto_destino_id && solicitud.proyecto_destino_id !== proyectoId) {
        const err = new Error('Debes tener el proyecto destino activo en tu sesión para confirmar este traspaso.') as any;
        err.status = 403;
        throw err;
      }

      const nuevoEstadoActivo = solicitud.empleado_destino_id ? 'ASIGNADO' : 'DISPONIBLE';
      await prisma.activo.update({
        where: { id_activo: solicitud.activo_id },
        data: {
          ...(solicitud.proyecto_destino_id ? { proyecto_id: solicitud.proyecto_destino_id } : {}),
          ...(solicitud.tipo !== 'PROYECTO' ? {
            asignado_a_empleado_id: solicitud.empleado_destino_id,
            asignado_a_empleado_nombre: solicitud.empleado_destino_nombre,
          } : {}),
          estado: nuevoEstadoActivo,
        },
      });

      return prisma.traspasoActivo.update({
        where: { id_traspaso: id },
        data: { estado: 'CONFIRMADO', confirmado_por: userName || userId, resuelto_en: new Date() },
      });
    });

    logInfo(req, 'almacen', 'almacen.activo.traspaso.confirmado', `Traspaso confirmado`, { traspaso_id: id, activo_id: data.activo_id });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status((error as any).status ?? 500).json({ success: false, message: error.message });
  }
});

app.patch('/api/v1/almacen/activos/traspasos/:id/rechazar', requireRoles(...ACTIVO_ROLES_ESCRITURA), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const { notas } = req.body;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      const solicitud = await prisma.traspasoActivo.findFirst({ where: { id_traspaso: id, tenant_id: tenantId } });
      if (!solicitud) {
        const err = new Error('Solicitud de traspaso no encontrada.') as any;
        err.status = 404;
        throw err;
      }
      if (solicitud.estado !== 'PENDIENTE') {
        const err = new Error(`La solicitud ya está ${solicitud.estado}.`) as any;
        err.status = 409;
        throw err;
      }

      // El activo vuelve a su estado previo — DISPONIBLE si no tenía
      // asignación, ASIGNADO si ya tenía un empleado asignado antes de
      // esta solicitud (snapshot en empleado_origen_id).
      await prisma.activo.update({
        where: { id_activo: solicitud.activo_id },
        data: { estado: solicitud.empleado_origen_id ? 'ASIGNADO' : 'DISPONIBLE' },
      });

      return prisma.traspasoActivo.update({
        where: { id_traspaso: id },
        data: { estado: 'RECHAZADO', rechazado_por: userName || userId, resuelto_en: new Date(), notas: notas ?? null },
      });
    });

    logInfo(req, 'almacen', 'almacen.activo.traspaso.rechazado', `Traspaso rechazado`, { traspaso_id: id, activo_id: data.activo_id });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status((error as any).status ?? 500).json({ success: false, message: error.message });
  }
});

app.get('/api/v1/almacen/activos/:id/historial', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, proyectoId, userId } = req.securityContext;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.traspasoActivo.findMany({
        where: { tenant_id: tenantId, activo_id: id },
        orderBy: { solicitado_en: 'desc' },
      });
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SALIDAS DE OBRA (EGRESO_OBRA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/almacen/salidas-obra', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { concepto_id, frente_trabajo } = req.query as Record<string, string | undefined>;

    const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
      return prisma.movimientoAlmacen.findMany({
        where: {
          tenant_id:   tenantId,
          proyecto_id: proyectoId,
          tipo:        'EGRESO_OBRA',
          ...(concepto_id    ? { concepto_id }    : {}),
          ...(frente_trabajo ? { frente_trabajo } : {}),
        },
        include: { item: { select: { clave: true, descripcion: true, unidad: true, insumo_id: true } } },
        orderBy: { fecha: 'desc' },
        take: 500,
      });
    });

    const serialized = data.map(mov => ({
      id:             mov.id,
      fecha:          mov.fecha,
      cantidad:       Number(mov.cantidad),
      unidad:         mov.unidad,
      concepto_id:    mov.concepto_id,
      concepto_clave: mov.concepto_clave,
      frente_trabajo: mov.frente_trabajo,
      responsable:    mov.responsable,
      clave:          mov.item?.clave       ?? '',
      descripcion:    mov.item?.descripcion ?? '',
      insumo_id:      mov.item?.insumo_id   ?? null,
    }));

    res.json({ success: true, data: serialized });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/almacen/dashboard',
  requireRoles('admin', 'superintendent', 'procurement', 'warehouse', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;

      const data = await createTenantContext({ tenantId, proyectoId, userId }, async (prisma) => {
        const now = new Date();
        const inicioDia = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [items, movimientosHoy] = await Promise.all([
          prisma.itemInventario.findMany({ where: { tenant_id: tenantId, proyecto_id: proyectoId } }),
          prisma.movimientoAlmacen.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, fecha: { gte: inicioDia } } }),
        ]);

        const itemsBajoMinimo = items.filter(i => Number(i.stock_actual) > 0 && Number(i.stock_actual) <= Number(i.stock_minimo));
        const itemsAgotados   = items.filter(i => Number(i.stock_actual) <= 0);

        const alertas = itemsBajoMinimo.slice(0, 5).map(i => ({
          item_id:     i.id,
          clave:       i.clave,
          descripcion: i.descripcion,
          stock_actual: Number(i.stock_actual),
          stock_minimo: Number(i.stock_minimo),
          mensaje:     `${i.clave}: stock ${Number(i.stock_actual)} ≤ mínimo ${Number(i.stock_minimo)}`,
        }));

        return {
          total_items:        items.length,
          items_bajo_minimo:  itemsBajoMinimo.length,
          items_agotados:     itemsAgotados.length,
          movimientos_hoy:    movimientosHoy,
          alertas,
        };
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBSCRIBER RabbitMQ — compras.oc_recibida_*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleOcRecibida(event: BocamEvent, cantidadField: 'cantidad_recibida' | 'cantidad_recibida_parcial'): Promise<void> {
  const payload = event.payload as {
    orden_compra_id?: string;
    items?: Array<{
      insumo_id: string;
      clave: string;
      descripcion: string;
      unidad: string;
      categoria: string;
      cantidad_recibida?: number;
      cantidad_recibida_parcial?: number;
    }>;
  };

  if (!payload.orden_compra_id || !Array.isArray(payload.items) || payload.items.length === 0) {
    console.warn(JSON.stringify({ action: 'almacen.event.oc_recibida.skip_no_items', event_type: event.event_type, orden_compra_id: payload.orden_compra_id }));
    return;
  }

  const ctx = { tenantId: event.context.tenant_id, proyectoId: event.context.proyecto_id, userId: event.context.user_id };

  for (const item of payload.items) {
    const cantidad = Number(item[cantidadField] ?? 0);
    if (cantidad <= 0) continue;

    try {
      await createTenantContext(ctx, async (prisma) => {
        // Idempotencia: verificar si ya existe el INGRESO para esta OC+item
        const existing = await prisma.movimientoAlmacen.findFirst({
          where: {
            tenant_id:  ctx.tenantId,
            proyecto_id: ctx.proyectoId,
            referencia: payload.orden_compra_id,
            tipo: 'INGRESO',
            item: { insumo_id: item.insumo_id },
          },
          include: { item: true },
        });
        if (existing) {
          console.log(JSON.stringify({ action: 'almacen.event.oc_recibida.idempotent', insumo_id: item.insumo_id, oc_id: payload.orden_compra_id }));
          return;
        }

        // Buscar o crear ItemInventario
        let inventarioItem = await prisma.itemInventario.findFirst({
          where: { tenant_id: ctx.tenantId, proyecto_id: ctx.proyectoId, insumo_id: item.insumo_id },
        });

        if (!inventarioItem) {
          inventarioItem = await prisma.itemInventario.create({
            data: {
              tenant_id:   ctx.tenantId,
              proyecto_id: ctx.proyectoId,
              insumo_id:   item.insumo_id,
              clave:       item.clave,
              descripcion: item.descripcion,
              unidad:      item.unidad,
              categoria:   item.categoria ?? 'MATERIAL',
              stock_actual: 0,
              stock_minimo: 0,
            },
          });
        }

        // Crear movimiento INGRESO y actualizar stock
        const nuevoStock = Number(inventarioItem.stock_actual) + cantidad;
        await prisma.itemInventario.update({ where: { id: inventarioItem.id }, data: { stock_actual: nuevoStock } });
        await prisma.movimientoAlmacen.create({
          data: {
            tenant_id:   ctx.tenantId,
            proyecto_id: ctx.proyectoId,
            item_id:     inventarioItem.id,
            tipo:        'INGRESO',
            cantidad,
            unidad:      item.unidad,
            origen:      'OC',
            referencia:  payload.orden_compra_id,
          },
        });

        console.log(JSON.stringify({ action: 'almacen.event.oc_recibida.applied', insumo_id: item.insumo_id, cantidad, oc_id: payload.orden_compra_id }));
      });
    } catch (err: any) {
      console.error(JSON.stringify({ action: 'almacen.event.oc_recibida.error', insumo_id: item.insumo_id, error: err.message }));
    }
  }
}

// Exports for testing
export const handleOcRecibidaTotal   = (e: BocamEvent) => handleOcRecibida(e, 'cantidad_recibida');
export const handleOcRecibidaParcial = (e: BocamEvent) => handleOcRecibida(e, 'cantidad_recibida_parcial');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'almacen', version: '1.0.0', timestamp: new Date().toISOString() });
});

setupSentryExpressHandler(app);

// Registro liviano — sin tabla de proyección nueva en este change (ver
// design.md de evento-centro-costos-creado, Decisión 3).
export async function handleCentroCostosCreadoEvent(event: BocamEvent): Promise<void> {
  const { codigo_centro_costos } = (event.payload || {}) as { codigo_centro_costos?: string };
  console.log(JSON.stringify({
    action: 'almacen.event.centro_costos_creado.registrado',
    correlation_id: event.context?.correlation_id,
    tenant_id: event.context?.tenant_id,
    proyecto_id: event.context?.proyecto_id,
    codigo_centro_costos,
  }));
}

export async function startServer() {
  return app.listen(PORT, async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📦  Módulo: ALMACÉN (Inventario · Movimientos)');
    console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
    console.log(`  🔌  Puerto: ${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await eventBus.connect();
    await eventBus.subscribe('compras.oc_recibida_total',   handleOcRecibidaTotal);
    await eventBus.subscribe('compras.oc_recibida_parcial', handleOcRecibidaParcial);
    await eventBus.subscribe('auth.centro_costos_creado',   handleCentroCostosCreadoEvent);
    console.log('[Almacén] Suscrito a: compras.oc_recibida_total, compras.oc_recibida_parcial, auth.centro_costos_creado');
  });
}

if (require.main === module) {
  void startServer();
}

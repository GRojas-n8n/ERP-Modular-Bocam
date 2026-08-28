/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Gerencia Técnica — Punto de Entrada Principal.
 *
 * Responsabilidades:
 * 1. Inicializar Express con middleware JWT real (@bocam/auth-middleware).
 * 2. Inyectar contexto Multi-Tenant (RLS) desde el JWT verificado.
 * 3. Exponer endpoints RESTful para Insumos y Presupuestos.
 * 4. Inicializar el EventBus (RabbitMQ) para comunicación inter-módulos.
 * 5. Gestionar el apagado limpio (graceful shutdown).
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createTenantContext, disconnectDb } from './db';
import { initEventBus, closeEventBus, publishEvent, subscribeToEvent } from './event-bus';
import {
  createApiResponse,
  createApiError,
} from './types';

// ─── Importar middleware JWT compartido ──────────────────────────────────────
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { createRateLimiter } from '../../../packages/rate-limiter/src';
import { initSentry, setupSentryExpressHandler } from '../../../packages/observability/src';
import type { SecurityContext } from '../../../packages/auth-middleware/src';

// ─── Configuración de upload de fichas técnicas ──────────────────────────────
const FICHAS_UPLOAD_DIR = process.env.FICHAS_UPLOAD_DIR || '/tmp/fichas-insumos';
const FICHAS_MAX_MB     = parseInt(process.env.FICHAS_MAX_SIZE_MB || '20', 10);
const FICHAS_EXTS       = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

fs.mkdirSync(path.join(FICHAS_UPLOAD_DIR, '_tmp'), { recursive: true });

const fichasUpload = multer({
  dest: path.join(FICHAS_UPLOAD_DIR, '_tmp'),
  limits: { fileSize: FICHAS_MAX_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!FICHAS_EXTS.includes(ext)) {
      return cb(new Error(`Tipo de archivo no permitido: ${ext}`));
    }
    cb(null, true);
  },
});

export const app = express();
app.use(express.json({ limit: '15mb' }));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT: Verificación real con firma criptográfica
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, serviceName: 'gerencia-tecnica' }));
app.use(requireProjectAccess());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RUTAS: /api/v1/gerencia-tecnica/insumos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/v1/gerencia-tecnica/insumos
 * Lista todos los insumos del tenant actual (filtrado por RLS).
 * El tenant_id y proyecto_id se extraen del JWT verificado.
 */
app.get('/api/v1/gerencia-tecnica/insumos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const db = createTenantContext({
      tenant_id: tenantId,
      proyecto_id: proyectoId,
    });

    const insumos = await db.insumo.findMany({
      where: { activo: true },
      orderBy: { clave: 'asc' },
      include: {
        categoria_gasto: { select: { id_categoria: true, nombre: true } },
      },
    });

    const data = insumos.map((i: any) => ({
      id: i.id,
      proyecto_id: i.proyecto_id,
      clave: i.clave,
      descripcion: i.descripcion,
      unidad_medida: i.unidad_medida,
      tipo_insumo: i.tipo_insumo,
      costo_base: Number(i.costo_base),
      activo: i.activo,
      categoria_gasto_id: i.categoria_gasto_id,
      categoria_gasto_nombre: i.categoria_gasto?.nombre ?? null,
    }));

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en GET /insumos:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al obtener insumos.', error.message)
    );
  }
});

/**
 * GET /api/v1/gerencia-tecnica/insumos/explosion
 * Devuelve cada insumo activo con su cantidad_presupuestada total:
 * suma de (concepto.cantidad × composicion.cantidad) para todos los conceptos del presupuesto activo.
 * Usado por ResidenciaView para mostrar las cantidades del presupuesto al crear una requisición Por Insumo.
 * DEBE estar antes de /insumos/:id para que Express no lo capture como un :id.
 */
app.get('/api/v1/gerencia-tecnica/insumos/explosion', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    // Cargar todos los insumos activos
    const insumos = await db.insumo.findMany({ where: { activo: true }, orderBy: { clave: 'asc' } });

    // Cargar la composición APU de todos los conceptos del presupuesto activo del proyecto
    const conceptosConComp = await db.concepto.findMany({
      include: { insumos: true },
    });

    // Calcular la explosión: suma de (concepto.cantidad × ci.cantidad) por insumo
    const explosion = new Map<string, number>();
    for (const c of conceptosConComp) {
      const cantConcepto = Number((c as any).cantidad ?? 1);
      for (const ci of c.insumos ?? []) {
        const prev = explosion.get(ci.insumo_id) ?? 0;
        explosion.set(ci.insumo_id, prev + (Number(ci.cantidad) * cantConcepto));
      }
    }

    const result = insumos.map((i: any) => ({
      id: i.id,
      proyecto_id: i.proyecto_id,
      clave: i.clave,
      descripcion: i.descripcion,
      tipo_insumo: i.tipo_insumo,
      unidad_medida: i.unidad_medida,
      costo_base: Number(i.costo_base),
      activo: i.activo,
      cantidad_presupuestada: Math.round((explosion.get(i.id) ?? 0) * 10000) / 10000,
    }));

    res.json(createApiResponse(result, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en GET /insumos/explosion:', error.message);
    res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al calcular explosión de insumos.', error.message));
  }
});

/**
 * GET /api/v1/gerencia-tecnica/presupuestos
 * Lista los presupuestos del tenant, opcionalmente filtrados por proyecto.
 */
app.get('/api/v1/gerencia-tecnica/presupuestos', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const db = createTenantContext({
      tenant_id: tenantId,
      proyecto_id: proyectoId,
    });

    const whereClause: any = {};
    if (proyectoId) {
      whereClause.proyecto_id = proyectoId;
    }

    const presupuestos = await db.presupuestoBase.findMany({
      where: whereClause,
      include: {
        conceptos: {
          orderBy: { clave: 'asc' },
          include: {
            insumos: {
              select: { cantidad: true, insumo: { select: { costo_base: true } } },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Calcular precio_actual y delta_pct por concepto
    const presupuestosConDelta = presupuestos.map(p => ({
      ...p,
      conceptos: p.conceptos.map(c => {
        const precioPresupuestado = Number(c.precio_unitario);
        const precioActual = c.insumos.reduce(
          (sum, ci) => sum + Number(ci.cantidad) * Number(ci.insumo.costo_base), 0
        );
        const delta_pct = c.insumos.length > 0 && precioPresupuestado > 0
          ? Number(((precioActual - precioPresupuestado) / precioPresupuestado * 100).toFixed(1))
          : null;
        const { insumos: _insumos, ...concepto } = c;
        return { ...concepto, precio_actual: c.insumos.length > 0 ? precioActual : null, delta_pct };
      }),
    }));

    res.json(createApiResponse(presupuestosConDelta, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en GET /presupuestos:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al obtener presupuestos.', error.message)
    );
  }
});

/**
 * GET /api/v1/gerencia-tecnica/presupuesto/activo
 *
 * Devuelve el presupuesto más reciente del proyecto activo con sus conceptos.
 * El frontend de Residencia lo usa para el autocomplete de partidas APU.
 * control-proyectos lo consulta B2B para resolver precio/cantidad de un
 * concepto al registrar un avance físico (ver capability avances-y-estimaciones).
 * Returns: { id, nombre, conceptos: [{ id, clave, descripcion, unidad_medida, precio_unitario, cantidad }] }
 */
app.get('/api/v1/gerencia-tecnica/presupuesto/activo', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    const presupuesto = await db.presupuestoBase.findFirst({
      where: { proyecto_id: proyectoId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        version: true,
        conceptos: {
          select: { id: true, clave: true, descripcion: true, unidad_medida: true, precio_unitario: true, cantidad: true, capitulo_id: true },
          orderBy: { clave: 'asc' },
        },
      },
    });

    if (!presupuesto) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'No hay presupuesto registrado para el proyecto activo.')
      );
    }

    res.json(createApiResponse(presupuesto, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en GET /presupuesto/activo:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al obtener el presupuesto activo.', error.message)
    );
  }
});

/**
 * POST /api/v1/gerencia-tecnica/insumos
 * Crea un nuevo insumo en el catálogo SSOT del tenant.
 */
app.post('/api/v1/gerencia-tecnica/insumos', requireRoles('admin', 'superintendent', 'technical', 'gerencia_tecnica'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const { clave, descripcion, unidad_medida, costo_base, tipo_insumo } = req.body;

    if (!clave || !descripcion || !unidad_medida || costo_base === undefined || !tipo_insumo) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Campos requeridos: clave, descripcion, unidad_medida, costo_base, tipo_insumo.')
      );
    }

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    const insumoExistente = await db.insumo.findFirst({ where: { clave } });
    if (insumoExistente) {
      return res.status(409).json(
        createApiError('DUPLICATE_KEY', `Ya existe un insumo con la clave "${clave}".`)
      );
    }

    const insumo = await db.insumo.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        clave,
        descripcion,
        unidad_medida,
        costo_base: parseFloat(costo_base),
        tipo_insumo,
        activo: true,
      },
    });

    res.status(201).json(createApiResponse(insumo, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en POST /insumos:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al crear insumo.', error.message)
    );
  }
});

/**
 * POST /api/v1/gerencia-tecnica/insumos/importar-lote
 * Importación masiva de insumos desde OPUS (APU o Explosión de Insumos).
 * Upsert semántico: crea si no existe (por clave), actualiza si ya existe.
 * Retorna { creados, actualizados, omitidos }.
 */
app.post('/api/v1/gerencia-tecnica/insumos/importar-lote', requireRoles('admin', 'superintendent', 'gerencia_tecnica'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const { insumos } = req.body;

    if (!Array.isArray(insumos) || insumos.length === 0) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Se requiere un array de insumos no vacío.')
      );
    }

    if (insumos.length > 5000) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Máximo 5 000 insumos por lote.')
      );
    }

    const TIPOS_VALIDOS = ['MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'SUBCONTRATO', 'INDIRECTO'];

    // ── Validar y normalizar ────────────────────────────────────────────────────
    const validos: Array<{
      clave: string;
      descripcion: string;
      unidad_medida: string;
      tipo_insumo: string;
      costo_base: number;
    }> = [];
    let omitidos = 0;

    for (const item of insumos) {
      const { clave, descripcion, unidad_medida, tipo_insumo, costo_base } = item ?? {};
      const costoNormalizado = Math.max(0, parseFloat(String(costo_base ?? 0)) || 0);
      if (
        !clave || typeof clave !== 'string' || clave.trim().length > 50 ||
        !descripcion || typeof descripcion !== 'string' ||
        !unidad_medida || typeof unidad_medida !== 'string' || unidad_medida.trim().length > 20 ||
        !TIPOS_VALIDOS.includes(tipo_insumo) ||
        // costo_base es Decimal(12,4) — protege contra desbordamiento igual
        // que los checks de longitud de arriba (ver
        // openspec/changes/fix-500-importar-apu-explosion-filas-boilerplate).
        costoNormalizado > 99999999.9999
      ) {
        omitidos++;
        continue;
      }
      validos.push({
        clave: String(clave).trim().toUpperCase(),
        descripcion: String(descripcion).trim(),
        unidad_medida: String(unidad_medida).trim().toUpperCase(),
        tipo_insumo,
        costo_base: costoNormalizado,
      });
    }

    if (validos.length === 0) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', `Ningún insumo válido en el lote. Omitidos: ${omitidos}.`)
      );
    }

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    // ── Registrar el lote de importación (permite revertirlo como unidad —
    //    ver eliminacion-admin-archivos-importaciones-gt) ───────────────────────
    const lote = await db.loteImportacion.create({
      data: {
        tenant_id: tenantId,
        importado_por: req.securityContext.userId,
      },
    });

    // ── Obtener existentes en una sola consulta ─────────────────────────────────
    const existentes = await db.insumo.findMany({
      select: { id: true, clave: true },
    });
    const claveAId = new Map(existentes.map(i => [i.clave.toUpperCase(), i.id]));

    const nuevos  = validos.filter(i => !claveAId.has(i.clave));
    const aActualizar = validos.filter(i =>  claveAId.has(i.clave));

    // ── Crear nuevos en lote ────────────────────────────────────────────────────
    let creados = 0;
    if (nuevos.length > 0) {
      const result = await db.insumo.createMany({
        data: nuevos.map(i => ({
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          clave: i.clave,
          descripcion: i.descripcion,
          unidad_medida: i.unidad_medida,
          tipo_insumo: i.tipo_insumo as any,
          costo_base: i.costo_base,
          activo: true,
          lote_importacion_id: lote.id,
        })),
        skipDuplicates: true,
      });
      creados = result.count;
    }

    // ── Actualizar existentes ───────────────────────────────────────────────────
    let actualizados = 0;
    for (const item of aActualizar) {
      const id = claveAId.get(item.clave)!;
      try {
        await db.insumo.update({
          where: { id },
          data: {
            descripcion: item.descripcion,
            unidad_medida: item.unidad_medida,
            tipo_insumo: item.tipo_insumo as any,
            costo_base: item.costo_base,
            activo: true,
            lote_importacion_id: lote.id,
          },
        });
        actualizados++;
      } catch (_) {
        omitidos++;
      }
    }

    await db.loteImportacion.update({
      where: { id: lote.id },
      data: { cantidad_registros: creados + actualizados },
    });

    console.log(`[Gerencia Técnica] Importación lote ${lote.id}: +${creados} nuevos, ~${actualizados} actualizados, ✗${omitidos} omitidos`);
    res.json(createApiResponse({ creados, actualizados, omitidos, lote_importacion_id: lote.id }, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en POST /insumos/importar-lote:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al importar lote de insumos.', error.message)
    );
  }
});

/**
 * DELETE /api/v1/gerencia-tecnica/insumos/importar-lote/:loteId
 * Revierte (desactiva) todos los insumos creados/actualizados por un lote de
 * Explosión de Insumos importado por error, para poder volver a importarlo.
 * Ver openspec/changes/eliminacion-admin-archivos-importaciones-gt.
 */
app.delete(
  '/api/v1/gerencia-tecnica/insumos/importar-lote/:loteId',
  requireRoles('admin', 'gerencia_tecnica', 'control_proyectos'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { loteId } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const lote = await db.loteImportacion.findFirst({
        where: { id: loteId, tenant_id: tenantId },
      });
      if (!lote || lote.estado === 'revertido') {
        return res.status(404).json(
          createApiError('NOT_FOUND', 'Lote de importación no encontrado o ya revertido.')
        );
      }

      const insumosDelLote = await db.insumo.findMany({
        where: { tenant_id: tenantId, lote_importacion_id: loteId },
        select: { id: true },
      });
      const insumoIds = insumosDelLote.map(i => i.id);

      if (insumoIds.length > 0) {
        const [enComposicion, enCompra] = await Promise.all([
          db.conceptoInsumo.count({ where: { insumo_id: { in: insumoIds } } }),
          db.compraProyectada.count({ where: { insumo_id: { in: insumoIds } } }),
        ]);
        if (enComposicion > 0 || enCompra > 0) {
          return res.status(409).json(
            createApiError(
              'LOTE_EN_USO',
              'El lote tiene insumos ya usados en una composición APU o una compra proyectada; no se puede revertir.'
            )
          );
        }
      }

      await db.insumo.updateMany({
        where: { tenant_id: tenantId, lote_importacion_id: loteId },
        data: { activo: false },
      });
      await db.loteImportacion.update({
        where: { id: loteId },
        data: { estado: 'revertido' },
      });

      res.json(createApiResponse({ desactivados: insumoIds.length }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[Gerencia Técnica] Error en DELETE /insumos/importar-lote/:loteId:', error.message);
      res.status(500).json(
        createApiError('INTERNAL_ERROR', 'Error al revertir el lote de insumos.', error.message)
      );
    }
  }
);

/**
 * PATCH /api/v1/gerencia-tecnica/insumos/:id
 * Actualiza un insumo existente (precio, descripción, unidad).
 */
app.patch('/api/v1/gerencia-tecnica/insumos/:id', requireRoles('admin', 'superintendent', 'technical', 'gerencia_tecnica'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const { id } = req.params;
    const { descripcion, unidad_medida, costo_base, tipo_insumo } = req.body;

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    const insumo = await db.insumo.findFirst({ where: { id, activo: true } });
    if (!insumo) {
      return res.status(404).json(
        createApiError('NOT_FOUND', `Insumo con id "${id}" no encontrado.`)
      );
    }

    const insumoActualizado = await db.insumo.update({
      where: { id },
      data: {
        ...(descripcion !== undefined && { descripcion }),
        ...(unidad_medida !== undefined && { unidad_medida }),
        ...(costo_base !== undefined && { costo_base: parseFloat(costo_base) }),
        ...(tipo_insumo !== undefined && { tipo_insumo }),
      },
    });

    res.json(createApiResponse(insumoActualizado, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en PATCH /insumos/:id:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al actualizar insumo.', error.message)
    );
  }
});

/**
 * DELETE /api/v1/gerencia-tecnica/insumos/:id
 * Desactiva un insumo (soft delete — nunca se borra físicamente).
 */
app.delete('/api/v1/gerencia-tecnica/insumos/:id', requireRoles('admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const { id } = req.params;

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    const insumo = await db.insumo.findFirst({ where: { id, activo: true } });
    if (!insumo) {
      return res.status(404).json(
        createApiError('NOT_FOUND', `Insumo con id "${id}" no encontrado o ya desactivado.`)
      );
    }

    const insumoDesactivado = await db.insumo.update({
      where: { id },
      data: { activo: false },
    });

    res.json(createApiResponse(insumoDesactivado, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en DELETE /insumos/:id:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al desactivar insumo.', error.message)
    );
  }
});

/**
 * POST /api/v1/gerencia-tecnica/presupuestos
 * Crea un nuevo presupuesto base para un proyecto.
 *
 * Ver openspec/changes/wbs-jerarquico-conceptos:
 * - Rechaza con 422 si el LOTE trae dos o más conceptos con la misma
 *   `clave` (validado antes de tocar Prisma, no solo confiando en el
 *   error de BD, para poder devolver qué clave(s) chocaron).
 * - Resuelve cada `clave` contra el catálogo maestro (`ConceptoCatalogo`,
 *   único por tenant): si ya existe con descripción/unidad distinta, se
 *   agrega una advertencia (no bloquea); si no existe, se agrega al
 *   catálogo. `precio_unitario`/`cantidad` SIEMPRE vienen del archivo
 *   importado, nunca del catálogo (que no los guarda).
 * - Si el body trae `capitulo_clave`/`capitulo_nombre` por concepto,
 *   resuelve/crea el `Capitulo` correspondiente a este presupuesto y
 *   asocia `capitulo_id`. Conceptos sin esa referencia quedan con
 *   `capitulo_id = null` (no se rechaza la importación).
 */
app.post('/api/v1/gerencia-tecnica/presupuestos', requireRoles('admin', 'superintendent', 'technical', 'gerencia_tecnica'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const { proyecto_id, version, conceptos } = req.body;

    if (!proyecto_id) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Campos requeridos: proyecto_id.')
      );
    }

    const conceptosBody: any[] = Array.isArray(conceptos) ? conceptos : [];

    // ── Validar duplicados de clave DENTRO del mismo lote, antes de tocar Prisma ──
    // Así podemos devolver un 422 con la(s) clave(s) exacta(s) que chocaron, en
    // vez de depender del error de BD del índice único (que no distingue cuál
    // de las N filas del lote es la duplicada).
    const conteoClaves = new Map<string, number>();
    for (const c of conceptosBody) {
      const clave = String(c?.clave ?? '');
      if (!clave) continue;
      conteoClaves.set(clave, (conteoClaves.get(clave) ?? 0) + 1);
    }
    const clavesDuplicadas = [...conteoClaves.entries()]
      .filter(([, count]) => count > 1)
      .map(([clave]) => clave);

    if (clavesDuplicadas.length > 0) {
      return res.status(422).json(
        createApiError(
          'CLAVE_DUPLICADA',
          `El presupuesto trae conceptos con clave duplicada en el mismo lote: ${clavesDuplicadas.join(', ')}.`,
          { claves_duplicadas: clavesDuplicadas }
        )
      );
    }

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    // ── Resolver catálogo maestro de conceptos (ConceptoCatalogo, único por tenant) ──
    const clavesUnicas = [...new Set(
      conceptosBody.map((c: any) => String(c?.clave ?? '')).filter(Boolean)
    )];
    const catalogoExistente = clavesUnicas.length > 0
      ? await db.conceptoCatalogo.findMany({
          where: { tenant_id: tenantId, clave: { in: clavesUnicas } },
        })
      : [];
    const catalogoPorClave = new Map(catalogoExistente.map((cc: any) => [cc.clave, cc]));

    const advertencias: string[] = [];
    for (const c of conceptosBody) {
      const clave = String(c?.clave ?? '');
      if (!clave) continue;
      const descripcion = String(c?.descripcion ?? '');
      const unidadMedida = String(c?.unidad_medida ?? '');
      const existente = catalogoPorClave.get(clave);

      if (!existente) {
        try {
          const creado = await db.conceptoCatalogo.create({
            data: { tenant_id: tenantId, clave, descripcion, unidad_medida: unidadMedida },
          });
          catalogoPorClave.set(clave, creado);
        } catch (_e) {
          // Carrera (otro request ya la creó) o error no bloqueante — no
          // detiene la importación, ver Decision 3 del design.md.
        }
      } else if (existente.descripcion !== descripcion || existente.unidad_medida !== unidadMedida) {
        advertencias.push(
          `La clave "${clave}" ya existe en el catálogo maestro de conceptos con datos distintos ` +
          `(catálogo: "${existente.descripcion}" / "${existente.unidad_medida}"; ` +
          `importado: "${descripcion}" / "${unidadMedida}").`
        );
      }
    }

    // Calcular importe_total sumando los importes de cada concepto.
    // precio_unitario/cantidad SIEMPRE vienen del archivo importado, nunca del catálogo.
    let importeTotal = 0;
    const conceptosNormalizados = conceptosBody.map((c: any) => {
      const cantidad = parseFloat(c.cantidad);
      const precioUnitario = parseFloat(c.precio_unitario);
      const importe = cantidad * precioUnitario;
      importeTotal += importe;
      return {
        tenant_id: tenantId,
        proyecto_id,
        clave: c.clave,
        descripcion: c.descripcion,
        unidad_medida: c.unidad_medida,
        cantidad,
        precio_unitario: precioUnitario,
        importe,
        capitulo_clave: c?.capitulo_clave ? String(c.capitulo_clave) : null,
        capitulo_nombre: c?.capitulo_nombre ? String(c.capitulo_nombre) : null,
      };
    });

    // Crear el presupuesto + conceptos en una sola operación atómica (misma
    // garantía que antes de este change: o se crean todos los conceptos del
    // lote, o ninguno).
    let presupuesto = await db.presupuestoBase.create({
      data: {
        tenant_id: tenantId,
        proyecto_id,
        version: parseInt(String(version), 10) || 1,
        importe_total: importeTotal,
        conceptos: conceptosNormalizados.length > 0
          ? { create: conceptosNormalizados.map(({ capitulo_clave, capitulo_nombre, ...concepto }) => concepto) }
          : undefined,
      },
      include: { conceptos: true },
    });

    // ── Resolver/crear capítulos referenciados en el lote y asociar capitulo_id ──
    const capituloAConceptoClaves = new Map<string, string[]>();
    const capituloANombre = new Map<string, string>();
    for (const c of conceptosNormalizados) {
      if (c.capitulo_clave) {
        const arr = capituloAConceptoClaves.get(c.capitulo_clave) ?? [];
        arr.push(c.clave);
        capituloAConceptoClaves.set(c.capitulo_clave, arr);
        if (!capituloANombre.has(c.capitulo_clave)) {
          capituloANombre.set(c.capitulo_clave, c.capitulo_nombre || c.capitulo_clave);
        }
      }
    }

    if (capituloAConceptoClaves.size > 0) {
      let orden = 0;
      for (const [claveCap, conceptoClaves] of capituloAConceptoClaves) {
        const capitulo = await db.capitulo.create({
          data: {
            tenant_id: tenantId,
            proyecto_id,
            presupuesto_id: presupuesto.id,
            clave: claveCap,
            nombre: capituloANombre.get(claveCap) || claveCap,
            orden: orden++,
          },
        });
        await db.concepto.updateMany({
          where: { presupuesto_id: presupuesto.id, clave: { in: conceptoClaves } },
          data: { capitulo_id: capitulo.id },
        });
      }

      // Refrescar la respuesta para reflejar el capitulo_id ya asociado.
      presupuesto = await db.presupuestoBase.findUnique({
        where: { id: presupuesto.id },
        include: { conceptos: true },
      }) as typeof presupuesto;
    }

    const responseData = {
      ...presupuesto,
      ...(advertencias.length > 0 ? { advertencias } : {}),
    };

    res.status(201).json(createApiResponse(responseData, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en POST /presupuestos:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al crear presupuesto.', error.message)
    );
  }
});

/**
 * DELETE /api/v1/gerencia-tecnica/presupuestos/:id
 * Elimina en cascada un Catálogo de Conceptos (PresupuestoBase) importado por
 * error, junto con sus Capitulo/Concepto/ConceptoInsumo, para poder
 * re-importarlo. Ver openspec/changes/eliminacion-admin-archivos-importaciones-gt.
 */
app.delete(
  '/api/v1/gerencia-tecnica/presupuestos/:id',
  requireRoles('admin', 'gerencia_tecnica', 'control_proyectos'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const presupuesto = await db.presupuestoBase.findFirst({
        where: { id, tenant_id: tenantId },
        select: { id: true, conceptos: { select: { id: true } } },
      });
      if (!presupuesto) {
        return res.status(404).json(
          createApiError('NOT_FOUND', 'Presupuesto no encontrado.')
        );
      }

      const conceptoIds = presupuesto.conceptos.map(c => c.id);
      if (conceptoIds.length > 0) {
        const [comprometido, proyectado] = await Promise.all([
          db.saldoPartida.count({
            where: {
              concepto_id: { in: conceptoIds },
              OR: [{ monto_comprometido: { gt: 0 } }, { monto_ejercido: { gt: 0 } }],
            },
          }),
          db.compraProyectada.count({ where: { concepto_id: { in: conceptoIds } } }),
        ]);
        if (comprometido > 0 || proyectado > 0) {
          return res.status(409).json(
            createApiError(
              'PRESUPUESTO_EN_USO',
              'El presupuesto tiene partidas con compromiso financiero (OC o pago) registrado; no se puede eliminar.'
            )
          );
        }
      }

      await db.presupuestoBase.delete({ where: { id } });

      res.json(createApiResponse({ id }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[Gerencia Técnica] Error en DELETE /presupuestos/:id:', error.message);
      res.status(500).json(
        createApiError('INTERNAL_ERROR', 'Error al eliminar presupuesto.', error.message)
      );
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOSICIÓN APU — Relación Concepto ↔ Insumos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/v1/gerencia-tecnica/composicion-apu
 *
 * Importa la composición APU buscando el presupuesto más reciente del
 * proyecto activo (del JWT). El frontend NO necesita conocer el presupuesto_id.
 * Hace upsert por (concepto_id, insumo_id): crea o actualiza.
 *
 * Body: { composiciones: Array<{ concepto_clave: string, insumos: [...] }> }
 * Returns: { presupuesto_id, vinculados, actualizados, omitidos }
 */
app.post(
  '/api/v1/gerencia-tecnica/composicion-apu',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { composiciones } = req.body;

      if (!Array.isArray(composiciones) || composiciones.length === 0) {
        return res.status(400).json(
          createApiError('VALIDATION_ERROR', 'Se requiere un array de composiciones no vacío.')
        );
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      // Buscar el presupuesto más reciente del proyecto activo (del JWT)
      // No se necesita presupuesto_id del frontend — el backend lo resuelve.
      const presupuesto = await db.presupuestoBase.findFirst({
        where: { proyecto_id: proyectoId },
        orderBy: { created_at: 'desc' },
        include: { conceptos: { select: { id: true, clave: true } } },
      });
      if (!presupuesto) {
        return res.status(404).json(
          createApiError('NOT_FOUND', 'No hay presupuesto registrado para el proyecto activo. Importa el Catálogo de Obra primero.')
        );
      }
      if (presupuesto.estado === 'APROBADO') {
        return res.status(409).json(
          createApiError('PRESUPUESTO_APROBADO', 'El presupuesto está APROBADO y no puede modificarse. Crea una nueva versión si necesitas cambios.')
        );
      }
      const presupuesto_id = presupuesto.id;

      // Mapa clave (normalizada) → concepto_id
      const claveAConceptoId = new Map(
        presupuesto.conceptos.map(c => [c.clave.trim().toUpperCase(), c.id])
      );

      // Mapa clave → insumo_id del catálogo del tenant
      const insumos = await db.insumo.findMany({ select: { id: true, clave: true } });
      const claveAInsumoId = new Map(insumos.map(i => [i.clave.toUpperCase(), i.id]));

      const TIPOS_VALIDOS = ['MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'SUBCONTRATO', 'INDIRECTO'];
      let vinculados = 0;
      let actualizados = 0;
      let omitidos = 0;
      const conceptosAfectados = new Set<string>();

      for (const comp of composiciones) {
        const claveConcepto = String(comp.concepto_clave ?? '').trim().toUpperCase();
        const conceptoId = claveAConceptoId.get(claveConcepto);
        if (!conceptoId) { omitidos++; continue; }
        if (!Array.isArray(comp.insumos)) { omitidos++; continue; }

        for (const ins of comp.insumos) {
          const claveInsumo = String(ins.clave_insumo ?? '').trim().toUpperCase();
          const insumoId = claveAInsumoId.get(claveInsumo);
          if (!insumoId) { omitidos++; continue; }
          if (!TIPOS_VALIDOS.includes(ins.tipo_insumo)) { omitidos++; continue; }

          const cantidad      = Math.max(0, parseFloat(String(ins.cantidad      ?? 0)) || 0);
          const rendimiento   = Math.max(0, parseFloat(String(ins.rendimiento   ?? 0)) || 0);
          const costoUnitario = Math.max(0, parseFloat(String(ins.costo_unitario ?? 0)) || 0);

          try {
            const existing = await db.conceptoInsumo.findUnique({
              where: { uq_concepto_insumo: { concepto_id: conceptoId, insumo_id: insumoId } },
            });

            if (existing) {
              await db.conceptoInsumo.update({
                where: { uq_concepto_insumo: { concepto_id: conceptoId, insumo_id: insumoId } },
                data: { tipo_insumo: ins.tipo_insumo as any, cantidad, rendimiento, costo_unitario: costoUnitario },
              });
              actualizados++;
            } else {
              await db.conceptoInsumo.create({
                data: {
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  concepto_id: conceptoId,
                  insumo_id: insumoId,
                  tipo_insumo: ins.tipo_insumo as any,
                  cantidad,
                  rendimiento,
                  costo_unitario: costoUnitario,
                },
              });
              vinculados++;
            }
            conceptosAfectados.add(conceptoId);
          } catch (_) {
            omitidos++;
          }
        }
      }

      const conceptos_afectados = [...conceptosAfectados];
      console.log(`[Gerencia Técnica] Composición APU (presupuesto ${presupuesto_id}): +${vinculados} vinculados, ~${actualizados} actualizados, ✗${omitidos} omitidos`);
      res.json(createApiResponse({ presupuesto_id, vinculados, actualizados, omitidos, conceptos_afectados }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[Gerencia Técnica] Error en POST /composicion-apu:', error.message);
      res.status(500).json(
        createApiError('INTERNAL_ERROR', 'Error al importar composición APU.', error.message)
      );
    }
  }
);

/**
 * POST /api/v1/gerencia-tecnica/presupuestos/:presupuesto_id/composicion-apu
 * @deprecated Usar POST /api/v1/gerencia-tecnica/composicion-apu (sin presupuesto_id en URL).
 * Este endpoint se mantiene por compatibilidad pero ignora el presupuesto_id
 * del URL — el backend siempre usa el presupuesto más reciente del proyecto JWT.
 */
app.post(
  '/api/v1/gerencia-tecnica/presupuestos/:presupuesto_id/composicion-apu',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { composiciones } = req.body;

      if (!Array.isArray(composiciones) || composiciones.length === 0) {
        return res.status(400).json(
          createApiError('VALIDATION_ERROR', 'Se requiere un array de composiciones no vacío.')
        );
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const presupuesto = await db.presupuestoBase.findFirst({
        where: { proyecto_id: proyectoId },
        orderBy: { created_at: 'desc' },
        include: { conceptos: { select: { id: true, clave: true } } },
      });
      if (!presupuesto) {
        return res.status(404).json(
          createApiError('NOT_FOUND', 'No hay presupuesto para el proyecto activo.')
        );
      }

      const claveAConceptoId = new Map(presupuesto.conceptos.map(c => [c.clave.trim().toUpperCase(), c.id]));
      const insumos = await db.insumo.findMany({ select: { id: true, clave: true } });
      const claveAInsumoId = new Map(insumos.map(i => [i.clave.toUpperCase(), i.id]));
      const TIPOS_VALIDOS = ['MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'SUBCONTRATO', 'INDIRECTO'];
      let vinculados = 0; let actualizados = 0; let omitidos = 0;
      const conceptosAfectados = new Set<string>();

      for (const comp of composiciones) {
        const claveConcepto = String(comp.concepto_clave ?? '').trim().toUpperCase();
        const conceptoId = claveAConceptoId.get(claveConcepto);
        if (!conceptoId) { omitidos++; continue; }
        if (!Array.isArray(comp.insumos)) { omitidos++; continue; }
        for (const ins of comp.insumos) {
          const claveInsumo = String(ins.clave_insumo ?? '').trim().toUpperCase();
          const insumoId = claveAInsumoId.get(claveInsumo);
          if (!insumoId || !TIPOS_VALIDOS.includes(ins.tipo_insumo)) { omitidos++; continue; }
          const cantidad = Math.max(0, parseFloat(String(ins.cantidad ?? 0)) || 0);
          const rendimiento = Math.max(0, parseFloat(String(ins.rendimiento ?? 0)) || 0);
          const costoUnitario = Math.max(0, parseFloat(String(ins.costo_unitario ?? 0)) || 0);
          try {
            const existing = await db.conceptoInsumo.findUnique({
              where: { uq_concepto_insumo: { concepto_id: conceptoId, insumo_id: insumoId } },
            });
            if (existing) {
              await db.conceptoInsumo.update({
                where: { uq_concepto_insumo: { concepto_id: conceptoId, insumo_id: insumoId } },
                data: { tipo_insumo: ins.tipo_insumo as any, cantidad, rendimiento, costo_unitario: costoUnitario },
              });
              actualizados++;
            } else {
              await db.conceptoInsumo.create({
                data: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: conceptoId, insumo_id: insumoId, tipo_insumo: ins.tipo_insumo as any, cantidad, rendimiento, costo_unitario: costoUnitario },
              });
              vinculados++;
            }
            conceptosAfectados.add(conceptoId);
          } catch (_) { omitidos++; }
        }
      }
      res.json(createApiResponse({ presupuesto_id: presupuesto.id, vinculados, actualizados, omitidos, conceptos_afectados: [...conceptosAfectados] }, tenantId, proyectoId));
    } catch (error: any) {
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al importar composición APU.', error.message));
    }
  }
);

/**
 * DELETE /api/v1/gerencia-tecnica/composicion-apu/:conceptoId
 * Elimina la composición APU (todos los ConceptoInsumo) de un concepto
 * importada por error, sin tocar el Concepto ni los Insumo del catálogo.
 * Ver openspec/changes/eliminacion-admin-archivos-importaciones-gt.
 */
app.delete(
  '/api/v1/gerencia-tecnica/composicion-apu/:conceptoId',
  requireRoles('admin', 'gerencia_tecnica', 'control_proyectos'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { conceptoId } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const existentes = await db.conceptoInsumo.count({
        where: { tenant_id: tenantId, concepto_id: conceptoId },
      });
      if (existentes === 0) {
        return res.status(404).json(
          createApiError('NOT_FOUND', 'El concepto no tiene composición APU cargada.')
        );
      }

      const { count } = await db.conceptoInsumo.deleteMany({
        where: { tenant_id: tenantId, concepto_id: conceptoId },
      });

      res.json(createApiResponse({ concepto_id: conceptoId, eliminados: count }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[Gerencia Técnica] Error en DELETE /composicion-apu/:conceptoId:', error.message);
      res.status(500).json(
        createApiError('INTERNAL_ERROR', 'Error al eliminar la composición APU.', error.message)
      );
    }
  }
);

/**
 * GET /api/v1/gerencia-tecnica/conceptos/:concepto_id/composicion
 *
 * Devuelve los insumos que componen un concepto (su APU almacenada).
 * Incluye detalles del insumo: clave, descripción, unidad, tipo, costo_base.
 */
app.get(
  '/api/v1/gerencia-tecnica/conceptos/:concepto_id/composicion',
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { concepto_id } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const composicion = await db.conceptoInsumo.findMany({
        where: { concepto_id },
        include: {
          insumo: {
            select: { clave: true, descripcion: true, unidad_medida: true, tipo_insumo: true, costo_base: true },
          },
        },
        orderBy: [{ tipo_insumo: 'asc' }, { insumo: { clave: 'asc' } }],
      });

      const data = composicion.map(ci => ({
        id: ci.id,
        insumo_id: ci.insumo_id,    // UUID del insumo — requerido para crear requisiciones
        tipo_insumo: ci.tipo_insumo,
        cantidad: Number(ci.cantidad),
        rendimiento: Number(ci.rendimiento),
        costo_unitario: Number(ci.costo_unitario),
        subtotal: Number(ci.cantidad) * Number(ci.costo_unitario),
        insumo: {
          clave: ci.insumo.clave,
          descripcion: ci.insumo.descripcion,
          unidad_medida: ci.insumo.unidad_medida,
          tipo_insumo: ci.insumo.tipo_insumo,
          costo_base: Number(ci.insumo.costo_base),
        },
      }));

      res.json(createApiResponse(data, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[Gerencia Técnica] Error en GET /conceptos/:id/composicion:', error.message);
      res.status(500).json(
        createApiError('INTERNAL_ERROR', 'Error al obtener composición del concepto.', error.message)
      );
    }
  }
);

/**
 * PATCH /api/v1/gerencia-tecnica/presupuestos/:id/aprobar
 *
 * Transiciona el presupuesto de BORRADOR → APROBADO. Operación irreversible.
 * Una vez APROBADO, la composición APU queda bloqueada.
 * Returns: 409 si ya está APROBADO (idempotente-seguro).
 */
app.patch(
  '/api/v1/gerencia-tecnica/presupuestos/:id/aprobar',
  requireRoles('gerencia_tecnica', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { id } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const presupuesto = await db.presupuestoBase.findUnique({
        where: { id },
        include: {
          conceptos: {
            include: { insumos: { select: { tipo_insumo: true, costo_unitario: true, cantidad: true } } },
          },
        },
      });
      if (!presupuesto) {
        return res.status(404).json(createApiError('NOT_FOUND', 'Presupuesto no encontrado.'));
      }
      if (presupuesto.estado === 'APROBADO') {
        return res.status(409).json(createApiError('ALREADY_APROBADO', 'El presupuesto ya está APROBADO.'));
      }

      const actualizado = await db.presupuestoBase.update({
        where: { id },
        data: {
          estado:           'APROBADO',
          aprobado_por:     userId,
          fecha_aprobacion: new Date(),
        },
      });

      // Crear SaldoPartida por cada concepto (idempotente via upsert)
      const conceptos = (presupuesto as any).conceptos ?? [];
      if (conceptos.length > 0) {
        const partidasParaEvento: Array<{
          concepto_id: string; concepto_clave: string; concepto_desc: string;
          monto_aprobado: number; categoria_predominante: string | null;
        }> = [];

        await Promise.all(
          conceptos.map((c: any) => {
            const monto = Number(c.precio_unitario) * Number(c.cantidad);
            const categoria = categoriaPredominante(c.insumos ?? []);
            partidasParaEvento.push({
              concepto_id: c.id,
              concepto_clave: c.clave,
              concepto_desc: c.descripcion,
              monto_aprobado: monto,
              categoria_predominante: categoria,
            });
            return db.saldoPartida.upsert({
              where: {
                uq_saldo_partida: {
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  concepto_id: c.id,
                },
              },
              update: { monto_aprobado: monto, monto_disponible: monto, categoria_predominante: categoria },
              create: {
                tenant_id:       tenantId,
                proyecto_id:     proyectoId,
                concepto_id:     c.id,
                concepto_clave:  c.clave,
                concepto_desc:   c.descripcion,
                monto_aprobado:  monto,
                monto_disponible: monto,
                categoria_predominante: categoria,
                estado_tope:     'LIBRE',
              },
            });
          })
        );
        console.log(`[GT] SaldoPartida: ${conceptos.length} partidas inicializadas para presupuesto ${id}`);

        // Notificar a Finanzas para que sincronice su espejo de presupuesto por partida
        // (ver openspec/changes/unificar-presupuesto-a-partidas-gt). Best-effort: no
        // bloquea la aprobación si el bus de eventos no está disponible.
        await publishEvent({
          event_type: 'gerencia_tecnica.saldo_partida_creado',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId || '' },
          payload: { partidas: partidasParaEvento },
        });
      }

      // Si el proyecto nació de Ventas, avanzar el vínculo a CON_PRESUPUESTO
      try {
        await (db as any).proyectoObraVinculado.updateMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'SIN_PRESUPUESTO' },
          data:  { estado: 'CON_PRESUPUESTO', updated_at: new Date() },
        });
      } catch { /* proyecto manual sin vínculo — ignorar */ }

      res.json(createApiResponse(actualizado, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[Gerencia Técnica] Error en PATCH /presupuestos/:id/aprobar:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al aprobar presupuesto.', error.message));
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FICHAS TÉCNICAS DE INSUMO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ROLES_FICHAS_UPLOAD  = ['procurement', 'gerencia_tecnica', 'admin', 'resident', 'residencia'] as const;
const ROLES_FICHAS_LECTURA = ['resident', 'residencia', 'control_obra', 'gerencia_tecnica', 'superintendent', 'procurement', 'admin'] as const;

// POST /api/v1/gerencia-tecnica/insumos/:id/fichas
app.post(
  '/api/v1/gerencia-tecnica/insumos/:id/fichas',
  requireRoles(...ROLES_FICHAS_UPLOAD),
  fichasUpload.single('archivo'),
  async (req: Request, res: Response) => {
    const tmpFile = req.file?.path;
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id: insumoId } = req.params;
      const { proveedor_ref, nombre_doc } = req.body as { proveedor_ref?: string; nombre_doc?: string };

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Se requiere un archivo.' });
      }
      if (!nombre_doc?.trim()) {
        fs.unlinkSync(tmpFile!);
        return res.status(400).json({ success: false, message: 'El campo nombre_doc es requerido.' });
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const insumo = await db.insumo.findFirst({
        where: { id: insumoId, tenant_id: tenantId },
        select: { id: true },
      });
      if (!insumo) {
        if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        return res.status(404).json({ success: false, message: 'Insumo no encontrado.' });
      }

      const fichaId = uuidv4();
      const ext     = path.extname(req.file.originalname).toLowerCase();
      const subDir  = path.join(FICHAS_UPLOAD_DIR, tenantId, insumoId);
      fs.mkdirSync(subDir, { recursive: true });
      const destino = path.join(subDir, `${fichaId}${ext}`);
      fs.renameSync(req.file.path, destino);
      const rutaRelativa = path.posix.join(tenantId, insumoId, `${fichaId}${ext}`);

      const ficha = await (db as any).fichaTecnicaInsumo.create({
        data: {
          id_ficha:      fichaId,
          tenant_id:     tenantId,
          insumo_id:     insumoId,
          proveedor_ref: proveedor_ref?.trim() || null,
          nombre_doc:    nombre_doc.trim(),
          ruta_archivo:  rutaRelativa,
          mime_type:     req.file.mimetype,
          tamano_bytes:  req.file.size,
          subido_por:    req.securityContext.userId,
        },
      });

      return res.status(201).json({ success: true, data: omitRuta(ficha) });
    } catch (err: any) {
      if (tmpFile && fs.existsSync(tmpFile)) { try { fs.unlinkSync(tmpFile); } catch (_) { /* ok */ } }
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /api/v1/gerencia-tecnica/insumos/:id/fichas
app.get(
  '/api/v1/gerencia-tecnica/insumos/:id/fichas',
  requireRoles(...ROLES_FICHAS_LECTURA),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id: insumoId } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const fichas = await (db as any).fichaTecnicaInsumo.findMany({
        where:   { tenant_id: tenantId, insumo_id: insumoId },
        orderBy: { created_at: 'desc' },
        select:  {
          id_ficha: true, nombre_doc: true, proveedor_ref: true,
          mime_type: true, tamano_bytes: true, subido_por: true, created_at: true,
        },
      });

      return res.json({ success: true, data: fichas });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid/descargar
app.get(
  '/api/v1/gerencia-tecnica/insumos/:id/fichas/:fid/descargar',
  requireRoles(...ROLES_FICHAS_LECTURA),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id: insumoId, fid } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const ficha = await (db as any).fichaTecnicaInsumo.findFirst({
        where: { id_ficha: fid, tenant_id: tenantId, insumo_id: insumoId },
      });

      if (!ficha) return res.status(404).json({ success: false, message: 'Ficha no encontrada.' });

      const absPath = path.join(FICHAS_UPLOAD_DIR, ficha.ruta_archivo);
      if (!fs.existsSync(absPath)) {
        return res.status(404).json({ success: false, message: 'Archivo no disponible en el servidor.' });
      }

      res.setHeader('Content-Type', ficha.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(ficha.nombre_doc)}"`);
      return res.sendFile(path.resolve(absPath));
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// DELETE /api/v1/gerencia-tecnica/insumos/:id/fichas/:fid
// Restringido a admin: eliminar una ficha técnica es una corrección de carga errónea,
// no una operación de subida normal (ver change eliminacion-admin-archivos-importaciones-gt).
app.delete(
  '/api/v1/gerencia-tecnica/insumos/:id/fichas/:fid',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id: insumoId, fid } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const ficha = await (db as any).fichaTecnicaInsumo.findFirst({
        where: { id_ficha: fid, tenant_id: tenantId, insumo_id: insumoId },
      });
      if (!ficha) return res.status(404).json({ success: false, message: 'Ficha no encontrada.' });

      const absPath = path.join(FICHAS_UPLOAD_DIR, ficha.ruta_archivo);
      try { fs.unlinkSync(absPath); } catch (_) { /* archivo ya no existe — degradación elegante */ }

      await (db as any).fichaTecnicaInsumo.delete({ where: { id_ficha: fid } });
      return res.json({ success: true, message: 'Ficha eliminada.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

function omitRuta(ficha: any) {
  const { ruta_archivo: _r, ...rest } = ficha;
  return rest;
}

// ─── Multer error handler ─────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: `El archivo supera el límite de ${FICHAS_MAX_MB} MB.` });
  }
  if (err?.message?.startsWith('Tipo de archivo no permitido')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORÍAS DE GASTO — Control de Proyectos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORIAS_PREDEFINIDAS = [
  'Materiales',
  'Equipo Mayor',
  'Herramienta y Equipo Menor',
  'Servicios y Subcontratos',
  'Agua',
  'Rentas',
  'EPP (Equipo de Protección Personal)',
  'Mano de Obra Subcontratada',
  'Indirectos y Gastos Generales',
  'Otros',
];

// Mapeo automático tipo_insumo → nombre de categoría predefinida
const MAPA_TIPO_CATEGORIA: Record<string, string> = {
  MATERIAL:     'Materiales',
  EQUIPO:       'Equipo Mayor',
  SUBCONTRATO:  'Servicios y Subcontratos',
  MANO_DE_OBRA: 'Mano de Obra Subcontratada',
  INDIRECTO:    'Indirectos y Gastos Generales',
};

async function getOrCreateProyectoConfig(db: any, tenantId: string, proyectoId: string) {
  let config = await db.proyectoCostosConfig.findUnique({
    where: { uq_proyecto_costos_config: { tenant_id: tenantId, proyecto_id: proyectoId } },
  });
  if (!config) {
    config = await db.proyectoCostosConfig.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'CONFIGURACION' },
    });
    // Seed 10 categorías predefinidas al primer acceso
    const existing = await db.categoriaGasto.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
    if (existing === 0) {
      await db.categoriaGasto.createMany({
        data: CATEGORIAS_PREDEFINIDAS.map(nombre => ({
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          nombre,
          es_predefinida: true,
          activa: true,
        })),
        skipDuplicates: true,
      });
    }
  }
  return config;
}

// GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/categorias-gasto
app.get(
  '/api/v1/gerencia-tecnica/proyectos/:proyecto_id/categorias-gasto',
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      await getOrCreateProyectoConfig(db, tenantId, proyectoId);

      const categorias = await db.categoriaGasto.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, activa: true },
        orderBy: { nombre: 'asc' },
      });

      // Contar insumos por categoría
      const counts = await db.insumo.groupBy({
        by: ['categoria_gasto_id'],
        where: { tenant_id: tenantId, activo: true, categoria_gasto_id: { not: null } },
        _count: { _all: true },
      });
      const countMap = new Map(counts.map((c: any) => [c.categoria_gasto_id, c._count._all]));

      const config = await db.proyectoCostosConfig.findUnique({
        where: { uq_proyecto_costos_config: { tenant_id: tenantId, proyecto_id: proyectoId } },
      });

      res.json({
        success: true,
        data: {
          estado_proyecto: config?.estado ?? 'CONFIGURACION',
          categorias: categorias.map((c: any) => ({
            ...c,
            insumos_count: countMap.get(c.id_categoria) ?? 0,
          })),
        },
      });
    } catch (error: any) {
      console.error('[GT] Error en GET /categorias-gasto:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/v1/gerencia-tecnica/proyectos/:proyecto_id/categorias-gasto
app.post(
  '/api/v1/gerencia-tecnica/proyectos/:proyecto_id/categorias-gasto',
  requireRoles('control_obra', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { nombre } = req.body;
      if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'nombre es requerido.' });

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const config = await getOrCreateProyectoConfig(db, tenantId, proyectoId);

      if (config.estado === 'ACTIVO') {
        return res.status(403).json({ success: false, message: 'PROYECTO_ACTIVO: categorías congeladas.' });
      }

      const categoria = await db.categoriaGasto.create({
        data: { tenant_id: tenantId, proyecto_id: proyectoId, nombre: nombre.trim(), es_predefinida: false },
      });
      res.status(201).json({ success: true, data: categoria });
    } catch (error: any) {
      console.error('[GT] Error en POST /categorias-gasto:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/v1/gerencia-tecnica/categorias-gasto/:id
app.put(
  '/api/v1/gerencia-tecnica/categorias-gasto/:id',
  requireRoles('control_obra', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id } = req.params;
      const { nombre } = req.body;
      if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'nombre es requerido.' });

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const cat = await db.categoriaGasto.findFirst({ where: { id_categoria: id, tenant_id: tenantId } });
      if (!cat) return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });

      const config = await getOrCreateProyectoConfig(db, tenantId, cat.proyecto_id);
      if (config.estado === 'ACTIVO') {
        return res.status(403).json({ success: false, message: 'PROYECTO_ACTIVO: categorías congeladas.' });
      }

      const actualizada = await db.categoriaGasto.update({
        where: { id_categoria: id },
        data: { nombre: nombre.trim() },
      });
      res.json({ success: true, data: actualizada });
    } catch (error: any) {
      console.error('[GT] Error en PUT /categorias-gasto/:id:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/v1/gerencia-tecnica/categorias-gasto/:id
app.delete(
  '/api/v1/gerencia-tecnica/categorias-gasto/:id',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id } = req.params;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const cat = await db.categoriaGasto.findFirst({ where: { id_categoria: id, tenant_id: tenantId } });
      if (!cat) return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });

      const config = await getOrCreateProyectoConfig(db, tenantId, cat.proyecto_id);
      if (config.estado === 'ACTIVO') {
        return res.status(403).json({ success: false, message: 'PROYECTO_ACTIVO: categorías congeladas.' });
      }

      const enUso = await db.insumo.count({ where: { tenant_id: tenantId, categoria_gasto_id: id } });
      if (enUso > 0) {
        return res.status(409).json({ success: false, message: `No se puede eliminar: ${enUso} insumo(s) usan esta categoría.` });
      }

      await db.categoriaGasto.update({ where: { id_categoria: id }, data: { activa: false } });
      res.json({ success: true, message: 'Categoría eliminada.' });
    } catch (error: any) {
      console.error('[GT] Error en DELETE /categorias-gasto/:id:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/v1/gerencia-tecnica/proyectos/:id/estado-costos
app.put(
  '/api/v1/gerencia-tecnica/proyectos/:id/estado-costos',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { estado } = req.body;
      const ESTADOS_VALIDOS = ['CONFIGURACION', 'ACTIVO', 'CERRADO'];
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ success: false, message: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const config = await getOrCreateProyectoConfig(db, tenantId, proyectoId);

      // Transiciones válidas: CONFIGURACION→ACTIVO, ACTIVO→CERRADO
      const transicionesValidas: Record<string, string[]> = {
        CONFIGURACION: ['ACTIVO'],
        ACTIVO: ['CERRADO'],
        CERRADO: [],
      };
      if (!transicionesValidas[config.estado]?.includes(estado)) {
        return res.status(409).json({
          success: false,
          message: `Transición inválida: ${config.estado} → ${estado}`,
        });
      }

      const actualizado = await db.proyectoCostosConfig.update({
        where: { uq_proyecto_costos_config: { tenant_id: tenantId, proyecto_id: proyectoId } },
        data: {
          estado,
          ...(estado === 'ACTIVO' && { activado_por: userId, fecha_activacion: new Date() }),
        },
      });
      res.json({ success: true, data: actualizado });
    } catch (error: any) {
      console.error('[GT] Error en PUT /proyectos/:id/estado-costos:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLASIFICACIÓN DE INSUMOS — Control de Proyectos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PUT /api/v1/gerencia-tecnica/insumos/clasificacion-bulk
app.put(
  '/api/v1/gerencia-tecnica/insumos/clasificacion-bulk',
  requireRoles('control_obra', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { items } = req.body; // Array<{ insumo_id, categoria_gasto_id }>

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere un array items no vacío.' });
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      let actualizados = 0;
      let omitidos = 0;

      for (const { insumo_id, categoria_gasto_id } of items) {
        if (!insumo_id) { omitidos++; continue; }
        try {
          await db.insumo.update({
            where: { id: insumo_id },
            data: { categoria_gasto_id: categoria_gasto_id || null },
          });
          actualizados++;
        } catch (_) {
          omitidos++;
        }
      }

      res.json({ success: true, data: { actualizados, omitidos } });
    } catch (error: any) {
      console.error('[GT] Error en PUT /insumos/clasificacion-bulk:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/v1/gerencia-tecnica/insumos/:id/categoria
app.put(
  '/api/v1/gerencia-tecnica/insumos/:id/categoria',
  requireRoles('control_obra', 'gerencia_tecnica', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { id } = req.params;
      const { categoria_gasto_id } = req.body;

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const insumo = await db.insumo.findFirst({ where: { id, activo: true } });
      if (!insumo) return res.status(404).json({ success: false, message: 'Insumo no encontrado.' });

      const actualizado = await db.insumo.update({
        where: { id },
        data: { categoria_gasto_id: categoria_gasto_id || null },
      });
      res.json({ success: true, data: actualizado });
    } catch (error: any) {
      console.error('[GT] Error en PUT /insumos/:id/categoria:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COSTOS WBS — Acumulados por partida y categoría
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COMPRAS_URL = (process.env.COMPRAS_URL || 'http://localhost:3002/api/v1/compras').replace(/\/$/, '');

// GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-wbs
app.get(
  '/api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-wbs',
  requireRoles('gerencia_tecnica', 'superintendent', 'admin', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      // 1. Obtener conceptos del presupuesto activo
      const presupuesto = await db.presupuestoBase.findFirst({
        where: { proyecto_id: proyectoId },
        orderBy: { created_at: 'desc' },
        include: {
          conceptos: {
            orderBy: { clave: 'asc' },
            select: { id: true, clave: true, descripcion: true, unidad_medida: true, cantidad: true, precio_unitario: true, importe: true },
          },
        },
      });

      if (!presupuesto) {
        return res.json({ success: true, data: { conceptos: [], presupuesto_total: 0 } });
      }

      // 2. Obtener acumulados de compras via HTTP (degradación elegante)
      let acumulados: Array<{ concepto_id: string; comprometido: number; pagado: number }> = [];
      try {
        const { default: axios } = await import('axios');
        const resp = await axios.get(`${COMPRAS_URL}/proyectos/${proyectoId}/acumulado-por-concepto`, {
          headers: { Authorization: req.headers.authorization || '' },
          timeout: 5000,
        });
        acumulados = resp.data?.data ?? [];
      } catch (_) {
        // compras offline o sin datos — degradación elegante
      }

      const acumuladoMap = new Map(acumulados.map(a => [a.concepto_id, a]));

      // 3. Calcular semáforo y armar respuesta
      const conceptos = presupuesto.conceptos.map((c: any) => {
        const presupuesto_c = Number(c.importe);
        const acum = acumuladoMap.get(c.id);
        const comprometido = acum?.comprometido ?? 0;
        const pagado = acum?.pagado ?? 0;
        const pct_economico = presupuesto_c > 0 ? (comprometido / presupuesto_c) * 100 : 0;

        let semaforo: string;
        if (pct_economico <= 110) semaforo = 'verde';
        else if (pct_economico <= 130) semaforo = 'ambar';
        else semaforo = 'rojo';

        return {
          id: c.id,
          clave: c.clave,
          descripcion: c.descripcion,
          unidad_medida: c.unidad_medida,
          cantidad: Number(c.cantidad),
          precio_unitario: Number(c.precio_unitario),
          presupuesto: presupuesto_c,
          comprometido,
          pagado,
          disponible: presupuesto_c - comprometido,
          pct_economico: Math.round(pct_economico * 10) / 10,
          semaforo,
        };
      });

      const totales = conceptos.reduce(
        (acc: any, c: any) => {
          acc.presupuesto_total += c.presupuesto;
          acc.comprometido_total += c.comprometido;
          acc.pagado_total += c.pagado;
          return acc;
        },
        { presupuesto_total: 0, comprometido_total: 0, pagado_total: 0 }
      );

      res.json({ success: true, data: { ...totales, conceptos } });
    } catch (error: any) {
      console.error('[GT] Error en GET /costos-wbs:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-categorias
app.get(
  '/api/v1/gerencia-tecnica/proyectos/:proyecto_id/costos-categorias',
  requireRoles('gerencia_tecnica', 'superintendent', 'admin', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      await getOrCreateProyectoConfig(db, tenantId, proyectoId);

      const categorias = await db.categoriaGasto.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, activa: true },
        orderBy: { nombre: 'asc' },
      });

      // Obtener acumulados por concepto desde compras
      let acumulados: Array<{ concepto_id: string; comprometido: number; pagado: number }> = [];
      try {
        const { default: axios } = await import('axios');
        const resp = await axios.get(`${COMPRAS_URL}/proyectos/${proyectoId}/acumulado-por-concepto`, {
          headers: { Authorization: req.headers.authorization || '' },
          timeout: 5000,
        });
        acumulados = resp.data?.data ?? [];
      } catch (_) { /* degradación elegante */ }

      // Obtener conceptos con insumos para hacer el cruce categoría→concepto
      const presupuesto = await db.presupuestoBase.findFirst({
        where: { proyecto_id: proyectoId },
        orderBy: { created_at: 'desc' },
        include: {
          conceptos: {
            select: { id: true, importe: true, insumos: { select: { insumo_id: true } } },
          },
        },
      });

      // Obtener categorías por insumo_id
      const insumosConCat = await db.insumo.findMany({
        where: { tenant_id: tenantId, activo: true, categoria_gasto_id: { not: null } },
        select: { id: true, categoria_gasto_id: true },
      });
      const insumoToCat = new Map(insumosConCat.map((i: any) => [i.id, i.categoria_gasto_id]));

      // Distribuir presupuesto de cada concepto entre sus insumos por categoría
      const catPresupuesto = new Map<string, number>();
      if (presupuesto) {
        for (const concepto of presupuesto.conceptos) {
          const importeConcepto = Number(concepto.importe);
          const insumoIds = concepto.insumos.map((ci: any) => ci.insumo_id);
          const catIds = [...new Set(insumoIds.map((id: string) => insumoToCat.get(id)).filter(Boolean))] as string[];
          if (catIds.length === 0) continue;
          const portion = importeConcepto / catIds.length;
          for (const catId of catIds) {
            catPresupuesto.set(catId, (catPresupuesto.get(catId) ?? 0) + portion);
          }
        }
      }

      // Distribuir acumulados (comprometido/pagado) de igual forma
      const catComprometido = new Map<string, number>();
      const catPagado = new Map<string, number>();
      const acumuladoMap = new Map(acumulados.map(a => [a.concepto_id, a]));

      if (presupuesto) {
        for (const concepto of presupuesto.conceptos) {
          const acum = acumuladoMap.get(concepto.id);
          if (!acum) continue;
          const insumoIds = concepto.insumos.map((ci: any) => ci.insumo_id);
          const catIds = [...new Set(insumoIds.map((id: string) => insumoToCat.get(id)).filter(Boolean))] as string[];
          if (catIds.length === 0) continue;
          for (const catId of catIds) {
            catComprometido.set(catId, (catComprometido.get(catId) ?? 0) + (acum.comprometido / catIds.length));
            catPagado.set(catId, (catPagado.get(catId) ?? 0) + (acum.pagado / catIds.length));
          }
        }
      }

      const resultado = categorias.map((c: any) => {
        const presupuesto_c = catPresupuesto.get(c.id_categoria) ?? 0;
        const comprometido = catComprometido.get(c.id_categoria) ?? 0;
        const pagado = catPagado.get(c.id_categoria) ?? 0;
        return {
          id_categoria: c.id_categoria,
          nombre: c.nombre,
          es_predefinida: c.es_predefinida,
          presupuesto: Math.round(presupuesto_c * 100) / 100,
          comprometido: Math.round(comprometido * 100) / 100,
          pagado: Math.round(pagado * 100) / 100,
          disponible: Math.round((presupuesto_c - comprometido) * 100) / 100,
          pct_comprometido: presupuesto_c > 0 ? Math.round((comprometido / presupuesto_c) * 1000) / 10 : 0,
        };
      });

      res.json({ success: true, data: resultado });
    } catch (error: any) {
      console.error('[GT] Error en GET /costos-categorias:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD — GT (consulta Compras vía HTTP interno)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get(
  '/api/v1/gerencia-tecnica/dashboard',
  requireRoles('superintendent', 'admin', 'technical', 'gerencia_tecnica'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const authHeader = req.headers.authorization ?? '';
      const TIMEOUT_MS = 3000;

      let pendientesRevision = 0;
      let enEvaluacionTecnica = 0;
      let aprobadosEsteMes = 0;
      let montoComprometido = 0;
      let alertas: any[] = [];
      let reciente: any[] = [];
      let parcial = false;

      try {
        const { default: axios } = await import('axios');
        const resp = await axios.get(`${COMPRAS_URL}/comparativas/pendientes-gt`, {
          headers: { authorization: authHeader },
          timeout: TIMEOUT_MS,
        });
        const comparativas: any[] = resp.data?.data ?? [];
        const now = new Date();
        const primeroDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);

        pendientesRevision   = comparativas.filter((c: any) => c.estado === 'EN_APROBACION_GT').length;
        enEvaluacionTecnica  = comparativas.filter((c: any) => c.estado === 'EVALUADO_TECNICAMENTE').length;
        aprobadosEsteMes     = comparativas.filter((c: any) =>
          c.estado === 'APROBADO_GT' && new Date(c.fecha_aprobacion_gt ?? c.updated_at ?? 0) >= primeroDiaMes
        ).length;
        montoComprometido    = comparativas
          .filter((c: any) => c.estado === 'APROBADO_GT')
          .reduce((sum: number, c: any) => sum + Number(c.monto_total ?? 0), 0);

        const alertaThresholdMs = 3 * 24 * 60 * 60 * 1000;
        alertas = comparativas
          .filter((c: any) => c.estado === 'EN_APROBACION_GT' && c.updated_at &&
            now.getTime() - new Date(c.updated_at).getTime() > alertaThresholdMs)
          .map((c: any) => ({
            comparativa_id: c.id_cuadro ?? c.id,
            folio:          c.codigo,
            proyecto:       c.proyecto_id,
            dias_en_espera: Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
            mensaje:        `Cuadro esperando aprobación GT por ${Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24))} días`,
          }));

        reciente = comparativas
          .filter((c: any) => c.estado === 'APROBADO_GT')
          .sort((a: any, b: any) => new Date(b.fecha_aprobacion_gt ?? 0).getTime() - new Date(a.fecha_aprobacion_gt ?? 0).getTime())
          .slice(0, 5)
          .map((c: any) => ({
            comparativa_id: c.id_cuadro ?? c.id,
            folio:          c.codigo,
            proyecto:       c.proyecto_id,
            estado:         c.estado,
            fecha:          c.fecha_aprobacion_gt ?? c.updated_at,
          }));
      } catch {
        parcial = true;
      }

      // KPIs de proyectos vinculados a Ventas (local, no B2B)
      const dbLocal = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const [sinPresupuesto, enEjecucion, montoActivoAgg] = await Promise.all([
        (dbLocal as any).proyectoObraVinculado.count({ where: { tenant_id: tenantId, estado: 'SIN_PRESUPUESTO' } }),
        (dbLocal as any).proyectoObraVinculado.count({ where: { tenant_id: tenantId, estado: 'EN_EJECUCION' } }),
        (dbLocal as any).proyectoObraVinculado.aggregate({
          where: { tenant_id: tenantId, estado: 'EN_EJECUCION' },
          _sum:  { monto_contrato: true },
        }),
      ]).catch(() => [0, 0, null]);

      res.json({
        success: true,
        data: {
          pendientes_revision:        pendientesRevision,
          en_evaluacion_tecnica:      enEvaluacionTecnica,
          aprobados_este_mes:         aprobadosEsteMes,
          monto_comprometido:         montoComprometido,
          proyectos_sin_presupuesto:  Number(sinPresupuesto ?? 0),
          proyectos_en_ejecucion:     Number(enEjecucion ?? 0),
          monto_contratado_activo:    Number((montoActivoAgg as any)?._sum?.monto_contrato ?? 0),
          alertas,
          reciente,
          parcial,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORTE DE CONTROL PRESUPUESTAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CP_COMPRAS_URL  = process.env.COMPRAS_SERVICE_URL  || 'http://compras:3002';
const FINANZAS_URL = process.env.FINANZAS_SERVICE_URL || 'http://finanzas:3004';
const REPORTES_URL = process.env.REPORTES_SERVICE_URL || 'http://reportes:3010';

type TipoInsumoCP = 'MATERIAL' | 'MANO_DE_OBRA' | 'EQUIPO' | 'SUBCONTRATO' | 'INDIRECTO';

// Categoría predominante de un concepto: el tipo de insumo con mayor costo acumulado
// entre sus ConceptoInsumo (cantidad × costo_unitario). Compartida por el reporte de
// control presupuestal y por la persistencia en SaldoPartida al aprobar el presupuesto
// (ver openspec/changes/unificar-presupuesto-a-partidas-gt).
function categoriaPredominante(insumos: Array<{ tipo_insumo: string; costo_unitario: any; cantidad: any }>): TipoInsumoCP | null {
  const acum: Record<string, number> = {};
  for (const ins of insumos) {
    const tipo = ins.tipo_insumo as TipoInsumoCP;
    acum[tipo] = (acum[tipo] || 0) + Number(ins.costo_unitario) * Number(ins.cantidad);
  }
  const entries = Object.entries(acum);
  if (entries.length === 0) return null;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0] as TipoInsumoCP;
}

interface PartidaCP {
  concepto_id:           string;
  clave:                 string;
  descripcion:           string;
  categoria_predominante: TipoInsumoCP | null;
  presupuestado:         number;
  comprometido:          number;
  pagado:                number;
  disponible:            number;
  pct_ejercido:          number;
}

async function buildControlPresupuestal(
  tenantId: string,
  proyectoId: string,
  userId: string,
  authHeader: string,
  categoria?: TipoInsumoCP,
): Promise<{
  proyectoId: string;
  presupuesto_id: string | null;
  total_presupuestado: number;
  total_comprometido: number;
  total_pagado: number;
  total_disponible: number;
  pct_ejercido: number;
  parcial: boolean;
  advertencias: string[];
  partidas: PartidaCP[];
  sin_partida_comprometido: number;
  sin_partida_pagado: number;
  // Presente solo cuando no hay presupuesto en estado aprobado pero SÍ existe
  // uno en BORRADOR/EN_REVISION — permite distinguir "no hay nada" de "hay
  // algo pendiente de aprobar". Ver
  // openspec/changes/control-presupuestal-estado-presupuesto-visible.
  presupuesto_pendiente?: { id: string; estado: string } | null;
}> {
  // 1. Obtener presupuesto activo y sus conceptos desde BD local
  // Filtro explícito de tenant_id/proyecto_id además de RLS (defensa en
  // profundidad — un rol de DB con bypass de RLS, ej. el superusuario usado
  // en desarrollo local, no debe poder devolver datos cruzados entre
  // proyectos). Mismo criterio ya aplicado en control-proyectos, ver
  // openspec/changes/fix-avance-mock-mis-proyectos.
  const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
  const presupuestoData = await db.presupuestoBase.findFirst({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: { in: ['APROBADO', 'LIBERADO', 'CONGELADO'] } },
    include: {
      conceptos: {
        where: { importe: { gt: 0 } },
        include: {
          insumos: { select: { tipo_insumo: true, costo_unitario: true, cantidad: true } },
        },
        orderBy: { clave: 'asc' },
      },
    },
  });

  if (!presupuestoData) {
    const pendiente = await db.presupuestoBase.findFirst({
      where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: { in: ['BORRADOR', 'EN_REVISION'] } },
      orderBy: { created_at: 'desc' },
      select: { id: true, estado: true },
    });
    return {
      proyectoId, presupuesto_id: null,
      total_presupuestado: 0, total_comprometido: 0, total_pagado: 0,
      total_disponible: 0, pct_ejercido: 0, parcial: false,
      advertencias: ['Sin presupuesto activo para este proyecto'],
      partidas: [], sin_partida_comprometido: 0, sin_partida_pagado: 0,
      presupuesto_pendiente: pendiente,
    };
  }

  const advertencias: string[] = [];
  let comprometidoMap = new Map<string, number>();
  let pagadoMap       = new Map<string, number>();
  let sinPartidaComprometido = 0;
  let sinPartidaPagado       = 0;

  // 2. Llamadas B2B en paralelo con timeout 5s
  const b2bHeaders = {
    Authorization:        authHeader,
    'Content-Type':       'application/json',
    'X-Internal-Service': 'gerencia-tecnica',
    'x-tenant-id':        tenantId,
    'x-proyecto-id':      proyectoId,
  };

  const fetchWithTimeout = (url: string, opts: RequestInit, ms = 5000) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
  };

  const [resCompras, resFinanzas] = await Promise.allSettled([
    fetchWithTimeout(
      `${CP_COMPRAS_URL}/api/v1/compras/reportes/ocs-por-concepto?proyectoId=${proyectoId}`,
      { headers: b2bHeaders }
    ),
    fetchWithTimeout(
      `${FINANZAS_URL}/api/v1/finanzas/reportes/pagado-por-concepto?proyectoId=${proyectoId}`,
      { headers: b2bHeaders }
    ),
  ]);

  if (resCompras.status === 'fulfilled' && resCompras.value.ok) {
    const json = await resCompras.value.json() as { success: boolean; data: any[] };
    if (json.success) {
      for (const row of json.data) {
        comprometidoMap.set(row.concepto_id, Number(row.monto_comprometido));
      }
    }
  } else {
    advertencias.push('Compras no disponible: montos comprometidos no incluidos');
  }

  if (resFinanzas.status === 'fulfilled' && resFinanzas.value.ok) {
    const json = await resFinanzas.value.json() as { success: boolean; data: any[] };
    if (json.success) {
      for (const row of json.data) {
        if (row.concepto_id === null) {
          sinPartidaPagado = Number(row.monto_pagado);
        } else {
          pagadoMap.set(row.concepto_id, Number(row.monto_pagado));
        }
      }
    }
  } else {
    advertencias.push('Finanzas no disponible: montos pagados no incluidos');
  }

  // 4. Armar partidas
  let partidas: PartidaCP[] = presupuestoData.conceptos.map((c) => {
    const presupuestado = Number(c.importe);
    const comprometido  = comprometidoMap.get(c.id) || 0;
    const pagado        = pagadoMap.get(c.id) || 0;
    const disponible    = presupuestado - comprometido;
    const pct_ejercido  = presupuestado > 0 ? Math.round((pagado / presupuestado) * 100) : 0;
    return {
      concepto_id:           c.id,
      clave:                 c.clave,
      descripcion:           c.descripcion,
      categoria_predominante: categoriaPredominante(c.insumos),
      presupuestado,
      comprometido,
      pagado,
      disponible,
      pct_ejercido,
    };
  });

  // Filtro por categoría si se pide
  if (categoria) {
    partidas = partidas.filter((p) => p.categoria_predominante === categoria);
  }

  const total_presupuestado = partidas.reduce((s, p) => s + p.presupuestado, 0);
  const total_comprometido  = partidas.reduce((s, p) => s + p.comprometido, 0) + sinPartidaComprometido;
  const total_pagado        = partidas.reduce((s, p) => s + p.pagado, 0) + sinPartidaPagado;
  const total_disponible    = total_presupuestado - total_comprometido;
  const pct_ejercido        = total_presupuestado > 0
    ? Math.round((total_pagado / total_presupuestado) * 100)
    : 0;

  return {
    proyectoId,
    presupuesto_id:     presupuestoData.id,
    total_presupuestado,
    total_comprometido,
    total_pagado,
    total_disponible,
    pct_ejercido,
    parcial:            advertencias.length > 0,
    advertencias,
    partidas,
    sin_partida_comprometido: sinPartidaComprometido,
    sin_partida_pagado:       sinPartidaPagado,
  };
}

// GET /api/v1/gerencia-tecnica/reportes/control-presupuestal
app.get('/api/v1/gerencia-tecnica/reportes/control-presupuestal', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const categoria = req.query.categoria as TipoInsumoCP | undefined;
    const authHeader = req.headers.authorization || '';

    const data = await buildControlPresupuestal(tenantId, proyectoId, userId, authHeader, categoria);

    if (data.advertencias.some((a) => a.includes('Sin presupuesto activo'))) {
      if (data.presupuesto_pendiente) {
        res.status(404).json(createApiError(
          'GT_PRESUPUESTO_PENDIENTE_APROBACION',
          'El presupuesto de este proyecto existe pero aún no ha sido aprobado.',
          { presupuesto_id: data.presupuesto_pendiente.id, estado: data.presupuesto_pendiente.estado },
        ));
        return;
      }
      res.status(404).json(createApiError('GT_NO_PRESUPUESTO', data.advertencias[0]));
      return;
    }

    res.json(createApiResponse(data, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[GT] Error en control-presupuestal:', error.message);
    res.status(500).json(createApiError('GT_INTERNAL_ERROR', 'Error al generar reporte de control presupuestal.'));
  }
});

// POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export
app.post('/api/v1/gerencia-tecnica/reportes/control-presupuestal/export', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId, userId } = req.securityContext;
    const { formato = 'PDF', categoria } = req.body;

    if (!['PDF', 'XLSX'].includes(formato)) {
      res.status(400).json(createApiError('GT_INVALID_FORMAT', 'Formato no soportado. Use PDF o XLSX.'));
      return;
    }

    const authHeader = req.headers.authorization || '';
    const datos = await buildControlPresupuestal(tenantId, proyectoId, userId, authHeader, categoria);

    const reportesRes = await fetch(`${REPORTES_URL}/api/v1/reportes/control-presupuestal/export`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   authHeader,
        'x-tenant-id':   tenantId,
        'x-proyecto-id': proyectoId,
      },
      body: JSON.stringify({ formato, datos }),
    });

    if (!reportesRes.ok) {
      const err = await reportesRes.text();
      res.status(502).json(createApiError('GT_EXPORT_ERROR', `Error al exportar: ${err}`));
      return;
    }

    const contentType = formato === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const ext = formato === 'PDF' ? 'pdf' : 'xlsx';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="control-presupuestal.${ext}"`);
    const buffer = Buffer.from(await reportesRes.arrayBuffer());
    res.send(buffer);
  } catch (error: any) {
    console.error('[GT] Error exportando control-presupuestal:', error.message);
    res.status(500).json(createApiError('GT_INTERNAL_ERROR', 'Error al exportar reporte.'));
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK (sin auth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTROL PRESUPUESTAL POR PARTIDA (SaldoPartida)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function calcularEstadoTope(monto_aprobado: number, monto_disponible: number): string {
  if (monto_disponible <= 0) return 'BLOQUEADO';
  const pct = monto_aprobado > 0 ? monto_disponible / monto_aprobado : 1;
  if (pct < 0.20) return 'LIMITADO';
  return 'LIBRE';
}

async function actualizarSaldoYEmitir(
  db: any,
  saldo: any,
  nuevoDisponible: number,
  tenantId: string,
  proyectoId: string,
  contextoEvento: any
): Promise<void> {
  const estadoAnterior = saldo.estado_tope;
  const nuevoEstado = calcularEstadoTope(Number(saldo.monto_aprobado), nuevoDisponible);

  await db.saldoPartida.update({
    where: { id: saldo.id },
    data: {
      monto_comprometido: saldo.monto_comprometido,
      monto_ejercido:     saldo.monto_ejercido,
      monto_en_proceso:   saldo.monto_en_proceso,
      monto_disponible:   nuevoDisponible,
      estado_tope:        nuevoEstado,
    },
  });

  if (nuevoEstado === 'BLOQUEADO' && estadoAnterior !== 'BLOQUEADO') {
    await publishEvent({
      event_type: 'gerencia_tecnica.partida_bloqueada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyectoId, user_id: contextoEvento.user_id || '' },
      payload: {
        concepto_id:      saldo.concepto_id,
        concepto_clave:   saldo.concepto_clave,
        monto_aprobado:   Number(saldo.monto_aprobado),
        monto_disponible: nuevoDisponible,
        trigger:          contextoEvento.trigger,
        referencia_id:    contextoEvento.referencia_id,
        referencia_codigo: contextoEvento.referencia_codigo || '',
      },
    });
  }
}

// GET /api/v1/gerencia-tecnica/partidas/resumen
app.get(
  '/api/v1/gerencia-tecnica/partidas/resumen',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica', 'control_proyectos', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const saldos = await db.saldoPartida.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { concepto_clave: 'asc' },
      });

      const data = saldos.map((s: any) => ({
        concepto_id:    s.concepto_id,
        concepto_clave: s.concepto_clave,
        concepto_desc:  s.concepto_desc,
        monto_aprobado:  Number(s.monto_aprobado),
        monto_disponible: Number(s.monto_disponible),
        monto_comprometido: Number(s.monto_comprometido),
        monto_ejercido:  Number(s.monto_ejercido),
        pct_ejecutado: Number(s.monto_aprobado) > 0
          ? Math.round(((Number(s.monto_ejercido) + Number(s.monto_comprometido)) / Number(s.monto_aprobado)) * 1000) / 10
          : 0,
        estado_tope:    s.estado_tope,
        bloqueo_automatico: s.bloqueo_automatico,
      }));

      res.json(createApiResponse(data, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error GET /partidas/resumen:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al obtener resumen de partidas.', error.message));
    }
  }
);

// GET /api/v1/gerencia-tecnica/partidas/:concepto_id/saldo
app.get(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/saldo',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica', 'control_proyectos', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { concepto_id } = req.params;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const saldo = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id } },
      });

      if (!saldo) {
        return res.status(404).json(createApiError('SALDO_NO_INICIALIZADO', 'No existe SaldoPartida para este concepto. Aprueba el presupuesto primero.'));
      }

      const aprobado    = Number(saldo.monto_aprobado);
      const disponible  = Number(saldo.monto_disponible);
      const comprometido = Number(saldo.monto_comprometido);
      const ejercido    = Number(saldo.monto_ejercido);
      const en_proceso  = Number(saldo.monto_en_proceso);

      res.json(createApiResponse({
        concepto_id:         saldo.concepto_id,
        concepto_clave:      saldo.concepto_clave,
        concepto_desc:       saldo.concepto_desc,
        monto_aprobado:      aprobado,
        monto_en_proceso:    en_proceso,
        monto_comprometido:  comprometido,
        monto_ejercido:      ejercido,
        monto_disponible:    disponible,
        pct_comprometido:    aprobado > 0 ? Math.round((comprometido / aprobado) * 1000) / 10 : 0,
        pct_ejercido:        aprobado > 0 ? Math.round((ejercido / aprobado) * 1000) / 10 : 0,
        pct_disponible:      aprobado > 0 ? Math.round((disponible / aprobado) * 1000) / 10 : 0,
        estado_tope:         saldo.estado_tope,
        bloqueo_automatico:  saldo.bloqueo_automatico,
      }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error GET /partidas/:id/saldo:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al obtener saldo de partida.', error.message));
    }
  }
);

// POST /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer
// Llamado por Compras o Personal para registrar un compromiso.
app.post(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica', 'procurement', 'control_proyectos'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { concepto_id } = req.params;
      const { monto, referencia_id, tipo, referencia_codigo } = req.body;

      if (!monto || !referencia_id || !tipo) {
        return res.status(400).json(createApiError('MISSING_FIELDS', 'monto, referencia_id y tipo son obligatorios.'));
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const saldo = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id } },
      });
      if (!saldo) {
        return res.status(404).json(createApiError('SALDO_NO_INICIALIZADO', 'No existe SaldoPartida para este concepto.'));
      }

      // Idempotencia: verificar si ya existe este movimiento
      const existing = await db.saldoMovimiento.findUnique({
        where: { uq_saldo_movimiento_idem: { saldo_partida_id: saldo.id, referencia_id, tipo } },
      });
      if (existing) {
        return res.json(createApiResponse({ idempotente: true, saldo_partida_id: saldo.id }, tenantId, proyectoId));
      }

      const nuevoComprometido = Number(saldo.monto_comprometido) + Number(monto);
      const nuevoDisponible   = Number(saldo.monto_aprobado) - nuevoComprometido - Number(saldo.monto_ejercido) - Number(saldo.monto_en_proceso);

      // Registrar movimiento para audit trail
      await db.saldoMovimiento.create({
        data: {
          tenant_id:        tenantId,
          saldo_partida_id: saldo.id,
          referencia_id,
          referencia_codigo: referencia_codigo || null,
          tipo,
          campo:            'monto_comprometido',
          delta:            Number(monto),
          saldo_resultante: nuevoDisponible,
        },
      });

      const saldoActualizado = { ...saldo, monto_comprometido: nuevoComprometido, monto_disponible: nuevoDisponible };
      await actualizarSaldoYEmitir(db, saldoActualizado, nuevoDisponible, tenantId, proyectoId, {
        user_id: userId, trigger: tipo, referencia_id, referencia_codigo,
      });

      // Notifica a Finanzas para que sincronice monto_comprometido en su espejo de
      // presupuesto por partida (ver openspec/changes/unificar-presupuesto-a-partidas-gt).
      // Best-effort: no bloquea el compromiso si el bus de eventos no está disponible.
      await publishEvent({
        event_type: 'gerencia_tecnica.partida_comprometida',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId || '' },
        payload: {
          concepto_id, monto: Number(monto), referencia_id, referencia_codigo: referencia_codigo || undefined, tipo,
          monto_comprometido: nuevoComprometido, monto_disponible: nuevoDisponible,
        },
      });

      res.json(createApiResponse({ concepto_id, monto_disponible: nuevoDisponible, estado_tope: calcularEstadoTope(Number(saldo.monto_aprobado), nuevoDisponible) }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error POST /partidas/:id/comprometer:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al comprometer saldo.', error.message));
    }
  }
);

// POST /api/v1/gerencia-tecnica/partidas/:concepto_id/ejercer
// Llamado por Finanzas cuando se registra un pago (mueve comprometido → ejercido).
app.post(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/ejercer',
  requireRoles('admin', 'finanzas', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { concepto_id } = req.params;
      const { monto, referencia_id, tipo } = req.body;

      if (!monto || !referencia_id || !tipo) {
        return res.status(400).json(createApiError('MISSING_FIELDS', 'monto, referencia_id y tipo son obligatorios.'));
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const saldo = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id } },
      });
      if (!saldo) return res.status(404).json(createApiError('SALDO_NO_INICIALIZADO', 'No existe SaldoPartida.'));

      const existing = await db.saldoMovimiento.findUnique({
        where: { uq_saldo_movimiento_idem: { saldo_partida_id: saldo.id, referencia_id, tipo: `EJERCER_${tipo}` } },
      });
      if (existing) return res.json(createApiResponse({ idempotente: true }, tenantId, proyectoId));

      const delta = Number(monto);
      const nuevoComprometido = Math.max(0, Number(saldo.monto_comprometido) - delta);
      const nuevoEjercido     = Number(saldo.monto_ejercido) + delta;
      const nuevoDisponible   = Number(saldo.monto_aprobado) - nuevoComprometido - nuevoEjercido - Number(saldo.monto_en_proceso);

      await db.saldoMovimiento.create({
        data: { tenant_id: tenantId, saldo_partida_id: saldo.id, referencia_id, tipo: `EJERCER_${tipo}`, campo: 'monto_ejercido', delta, saldo_resultante: nuevoDisponible },
      });

      const saldoActualizado = { ...saldo, monto_comprometido: nuevoComprometido, monto_ejercido: nuevoEjercido, monto_disponible: nuevoDisponible };
      await actualizarSaldoYEmitir(db, saldoActualizado, nuevoDisponible, tenantId, proyectoId, {
        user_id: userId, trigger: tipo, referencia_id,
      });

      res.json(createApiResponse({ concepto_id, monto_disponible: nuevoDisponible }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error POST /partidas/:id/ejercer:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al ejercer saldo.', error.message));
    }
  }
);

// DELETE /api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer/:referencia_id
// Reversa de un compromiso (OC cancelada).
app.delete(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/comprometer/:referencia_id',
  requireRoles('admin', 'procurement', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { concepto_id, referencia_id } = req.params;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const saldo = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id } },
      });
      if (!saldo) return res.status(404).json(createApiError('SALDO_NO_INICIALIZADO', 'No existe SaldoPartida.'));

      // Buscar el movimiento original para saber el delta
      const movimientos = await db.saldoMovimiento.findMany({
        where: { saldo_partida_id: saldo.id, referencia_id },
      });
      if (movimientos.length === 0) {
        return res.status(404).json(createApiError('MOVIMIENTO_NOT_FOUND', 'No existe compromiso para esta referencia.'));
      }

      const deltaTotal = movimientos.reduce((acc: number, m: any) => acc + Number(m.delta), 0);
      const nuevoComprometido = Math.max(0, Number(saldo.monto_comprometido) - deltaTotal);
      const nuevoDisponible   = Number(saldo.monto_aprobado) - nuevoComprometido - Number(saldo.monto_ejercido) - Number(saldo.monto_en_proceso);

      const estadoNuevo = calcularEstadoTope(Number(saldo.monto_aprobado), nuevoDisponible);
      await db.saldoPartida.update({
        where: { id: saldo.id },
        data: { monto_comprometido: nuevoComprometido, monto_disponible: nuevoDisponible, estado_tope: estadoNuevo },
      });

      res.json(createApiResponse({ concepto_id, monto_disponible: nuevoDisponible, delta_revertido: deltaTotal }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error DELETE /partidas/:id/comprometer/:ref:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al revertir compromiso.', error.message));
    }
  }
);

// GET /api/v1/gerencia-tecnica/partidas/:concepto_id/movimientos
// Historial de auditoría (SaldoMovimiento) de una partida — trazabilidad para GT y Control de Proyectos.
// Ver openspec/changes/trazabilidad-partida-gt-cp.
app.get(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/movimientos',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica', 'control_proyectos', 'control_obra'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const { concepto_id } = req.params;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const saldo = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id } },
      });
      if (!saldo) return res.status(404).json(createApiError('SALDO_NO_INICIALIZADO', 'No existe SaldoPartida para este concepto. Aprueba el presupuesto primero.'));

      const movimientos = await db.saldoMovimiento.findMany({
        where: { saldo_partida_id: saldo.id },
        orderBy: { created_at: 'desc' },
      });

      res.json(createApiResponse(movimientos, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error GET /partidas/:id/movimientos:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al obtener movimientos de partida.', error.message));
    }
  }
);

// PATCH /api/v1/gerencia-tecnica/partidas/:concepto_id/anular-bloqueo
app.patch(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/anular-bloqueo',
  requireRoles('admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { concepto_id } = req.params;
      const { justificacion } = req.body;

      if (!justificacion || justificacion.trim().length < 10) {
        return res.status(400).json(createApiError('JUSTIFICACION_REQUERIDA', 'Se requiere justificación mínima de 10 caracteres.'));
      }

      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
      const saldo = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id } },
      });
      if (!saldo) return res.status(404).json(createApiError('SALDO_NO_INICIALIZADO', 'No existe SaldoPartida.'));

      await db.saldoPartida.update({
        where: { id: saldo.id },
        data: { bloqueo_automatico: false },
      });

      // Audit log via movimiento tipo ANULACION_BLOQUEO
      await db.saldoMovimiento.create({
        data: {
          tenant_id:        tenantId,
          saldo_partida_id: saldo.id,
          referencia_id:    userId,
          referencia_codigo: justificacion.substring(0, 100),
          tipo:             'ANULACION_BLOQUEO',
          campo:            'bloqueo_automatico',
          delta:            0,
          saldo_resultante: Number(saldo.monto_disponible),
        },
      });

      console.log(`[GT] ANULACION_BLOQUEO en partida ${saldo.concepto_clave} por user ${userId}: "${justificacion}"`);
      res.json(createApiResponse({ concepto_id, bloqueo_automatico: false, estado_tope: saldo.estado_tope }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error PATCH /partidas/:id/anular-bloqueo:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al anular bloqueo.', error.message));
    }
  }
);

// POST /api/v1/gerencia-tecnica/saldo-partida/inicializar-proyecto (migración)
app.post(
  '/api/v1/gerencia-tecnica/saldo-partida/inicializar-proyecto',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const presupuesto = await db.presupuestoBase.findFirst({
        where: { proyecto_id: proyectoId, estado: 'APROBADO' },
        orderBy: { created_at: 'desc' },
        include: { conceptos: true },
      });

      if (!presupuesto) {
        return res.status(404).json(createApiError('NOT_FOUND', 'No hay presupuesto APROBADO para este proyecto.'));
      }

      const conceptos = (presupuesto as any).conceptos ?? [];
      let creados = 0;
      let existentes = 0;

      await Promise.all(
        conceptos.map(async (c: any) => {
          const monto = Number(c.precio_unitario) * Number(c.cantidad);
          const existe = await db.saldoPartida.findUnique({
            where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: c.id } },
          });
          if (existe) { existentes++; return; }

          await db.saldoPartida.create({
            data: {
              tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: c.id,
              concepto_clave: c.clave, concepto_desc: c.descripcion,
              monto_aprobado: monto, monto_disponible: monto, estado_tope: 'LIBRE',
            },
          });
          creados++;
        })
      );

      res.json(createApiResponse({ creados, existentes, total_conceptos: conceptos.length }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error POST /saldo-partida/inicializar-proyecto:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error en inicialización.', error.message));
    }
  }
);

// GET /api/v1/gerencia-tecnica/requisiciones-bloqueadas
app.get(
  '/api/v1/gerencia-tecnica/requisiciones-bloqueadas',
  requireRoles('admin', 'superintendent', 'gerencia_tecnica', 'control_proyectos'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

      const saldos = await db.saldoPartida.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, estado_tope: 'BLOQUEADO', bloqueo_automatico: true },
        select: { concepto_id: true, concepto_clave: true, concepto_desc: true, monto_disponible: true, monto_aprobado: true },
      });

      res.json(createApiResponse({
        partidas_bloqueadas: saldos.map((s: any) => ({
          concepto_id:    s.concepto_id,
          concepto_clave: s.concepto_clave,
          concepto_desc:  s.concepto_desc,
          monto_disponible: Number(s.monto_disponible),
          monto_aprobado:   Number(s.monto_aprobado),
        })),
        total: saldos.length,
      }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error GET /requisiciones-bloqueadas:', error.message);
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error.', error.message));
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRANSFERENCIAS ENTRE PARTIDAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /api/v1/gerencia-tecnica/transferencias-partida
app.post(
  '/api/v1/gerencia-tecnica/transferencias-partida',
  requireRoles('gerencia_tecnica', 'control_proyectos', 'admin'),
  async (req: Request, res: Response) => {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
    try {
      const { tipo = 'INTERNA', concepto_origen_id, concepto_destino_id, monto, justificacion } = req.body;

      if (!concepto_destino_id || !monto || !justificacion) {
        return res.status(422).json(createApiError('DATOS_INCOMPLETOS', 'Se requieren concepto_destino_id, monto y justificacion.'));
      }
      if (typeof justificacion !== 'string' || justificacion.trim().length < 50) {
        return res.status(422).json(createApiError('JUSTIFICACION_CORTA', 'La justificación debe tener al menos 50 caracteres.'));
      }
      if (Number(monto) <= 0) {
        return res.status(422).json(createApiError('MONTO_INVALIDO', 'El monto debe ser mayor a cero.'));
      }
      if (concepto_origen_id && concepto_origen_id === concepto_destino_id) {
        return res.status(422).json(createApiError('MISMO_ORIGEN_DESTINO', 'Origen y destino no pueden ser la misma partida.'));
      }

      const [saldoOrigen, saldoDestino] = await Promise.all([
        concepto_origen_id
          ? db.saldoPartida.findUnique({ where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: concepto_origen_id } } })
          : null,
        db.saldoPartida.findUnique({ where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: concepto_destino_id } } }),
      ]);

      if (concepto_origen_id && !saldoOrigen) {
        return res.status(404).json(createApiError('PARTIDA_ORIGEN_NO_ENCONTRADA', 'La partida origen no tiene saldo inicializado.'));
      }
      if (!saldoDestino) {
        return res.status(404).json(createApiError('PARTIDA_DESTINO_NO_ENCONTRADA', 'La partida destino no tiene saldo inicializado.'));
      }
      if (saldoOrigen) {
        const disponible = Number(saldoOrigen.monto_disponible);
        if (disponible < Number(monto)) {
          return res.status(422).json(createApiError(
            'SALDO_INSUFICIENTE',
            `La partida origen solo tiene $${disponible.toFixed(2)} disponibles para transferir.`
          ));
        }
      }

      const transferencia = await db.transferenciaPartida.create({
        data: {
          tenant_id:              tenantId,
          tipo,
          proyecto_origen_id:     proyectoId,
          concepto_origen_id:     concepto_origen_id || null,
          concepto_origen_clave:  saldoOrigen?.concepto_clave || 'N/A',
          concepto_origen_desc:   saldoOrigen?.concepto_desc  || 'N/A',
          proyecto_destino_id:    proyectoId,
          concepto_destino_id,
          concepto_destino_clave: saldoDestino.concepto_clave,
          concepto_destino_desc:  saldoDestino.concepto_desc,
          monto:                  Number(monto),
          justificacion:          justificacion.trim(),
          solicitado_por_id:      userId,
          solicitado_por_nombre:  userName || 'Usuario',
          estado: 'PENDIENTE',
        },
      });

      try {
        await publishEvent({
          event_type: 'gerencia_tecnica.transferencia_partida_solicitada',
          timestamp:  new Date().toISOString(),
          context:    { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
          payload: {
            transferencia_id:       transferencia.id,
            tipo,
            proyecto_id:            proyectoId,
            concepto_origen_clave:  transferencia.concepto_origen_clave,
            concepto_destino_clave: transferencia.concepto_destino_clave,
            monto:                  Number(monto),
            solicitado_por_nombre:  transferencia.solicitado_por_nombre,
          },
        });
      } catch { /* best-effort */ }

      return res.status(201).json(createApiResponse(transferencia, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error POST /transferencias-partida:', error.message);
      return res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al crear transferencia.', error.message));
    }
  }
);

// GET /api/v1/gerencia-tecnica/transferencias-partida
app.get(
  '/api/v1/gerencia-tecnica/transferencias-partida',
  async (req: Request, res: Response) => {
    const { tenantId, proyectoId } = req.securityContext;
    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
    try {
      const { estado } = req.query as { estado?: string };
      const where: any = { tenant_id: tenantId, proyecto_origen_id: proyectoId };
      if (estado) where.estado = estado;

      const transferencias = await db.transferenciaPartida.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });

      return res.json(createApiResponse({ transferencias, total: transferencias.length }, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error GET /transferencias-partida:', error.message);
      return res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al listar transferencias.', error.message));
    }
  }
);

// GET /api/v1/gerencia-tecnica/partidas/:concepto_id/transferencias
app.get(
  '/api/v1/gerencia-tecnica/partidas/:concepto_id/transferencias',
  async (req: Request, res: Response) => {
    const { tenantId, proyectoId } = req.securityContext;
    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
    const { concepto_id } = req.params;
    try {
      const [enviadas, recibidas] = await Promise.all([
        db.transferenciaPartida.findMany({
          where: { tenant_id: tenantId, concepto_origen_id: concepto_id },
          orderBy: { created_at: 'desc' },
        }),
        db.transferenciaPartida.findMany({
          where: { tenant_id: tenantId, concepto_destino_id: concepto_id },
          orderBy: { created_at: 'desc' },
        }),
      ]);

      const historial = [
        ...enviadas.map((t: any)  => ({ ...t, direccion: 'ENVIADA',  concepto_contraparte: `${t.concepto_destino_clave} — ${t.concepto_destino_desc}` })),
        ...recibidas.map((t: any) => ({ ...t, direccion: 'RECIBIDA', concepto_contraparte: `${t.concepto_origen_clave} — ${t.concepto_origen_desc}` })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return res.json(createApiResponse(historial, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error GET /partidas/:id/transferencias:', error.message);
      return res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al obtener historial.', error.message));
    }
  }
);

// PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/aprobar
app.patch(
  '/api/v1/gerencia-tecnica/transferencias-partida/:id/aprobar',
  requireRoles('admin', 'director'),
  async (req: Request, res: Response) => {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
    const { id } = req.params;
    try {
      const transferencia = await db.transferenciaPartida.findFirst({
        where: { id, tenant_id: tenantId },
      });
      if (!transferencia) {
        return res.status(404).json(createApiError('NOT_FOUND', 'Transferencia no encontrada.'));
      }
      if (transferencia.estado !== 'PENDIENTE') {
        return res.status(409).json(createApiError('YA_PROCESADA', 'La transferencia ya fue procesada.'));
      }

      if (transferencia.concepto_origen_id) {
        const saldoOrigen = await db.saldoPartida.findUnique({
          where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: String(transferencia.proyecto_origen_id), concepto_id: String(transferencia.concepto_origen_id) } },
        });
        if (!saldoOrigen || Number(saldoOrigen.monto_disponible) < Number(transferencia.monto)) {
          return res.status(422).json(createApiError('SALDO_INSUFICIENTE', 'La partida origen ya no tiene saldo suficiente para esta transferencia.'));
        }
      }

      const monto = Number(transferencia.monto);

      const [transActualizada] = await db.$transaction([
        db.transferenciaPartida.update({
          where: { id },
          data: {
            estado:              'APROBADA',
            aprobado_por_id:     userId,
            aprobado_por_nombre: userName || 'Director',
            fecha_aprobacion:    new Date(),
          },
        }),
        ...(transferencia.concepto_origen_id ? [
          db.saldoPartida.updateMany({
            where: { tenant_id: tenantId, proyecto_id: String(transferencia.proyecto_origen_id), concepto_id: String(transferencia.concepto_origen_id) },
            data: { monto_aprobado: { decrement: monto }, monto_disponible: { decrement: monto } },
          }),
        ] : []),
        db.saldoPartida.updateMany({
          where: { tenant_id: tenantId, proyecto_id: String(transferencia.proyecto_destino_id), concepto_id: String(transferencia.concepto_destino_id) },
          data: { monto_aprobado: { increment: monto }, monto_disponible: { increment: monto } },
        }),
      ]);

      // Recalcular estado_tope del destino
      const saldoDestino = await db.saldoPartida.findUnique({
        where: { uq_saldo_partida: { tenant_id: tenantId, proyecto_id: String(transferencia.proyecto_destino_id), concepto_id: String(transferencia.concepto_destino_id) } },
      });
      if (saldoDestino) {
        const nuevoEstado = calcularEstadoTope(Number(saldoDestino.monto_aprobado), Number(saldoDestino.monto_disponible));
        await db.saldoPartida.update({ where: { id: saldoDestino.id }, data: { estado_tope: nuevoEstado } });
      }

      try {
        await publishEvent({
          event_type: 'gerencia_tecnica.transferencia_partida_aprobada',
          timestamp:  new Date().toISOString(),
          context:    { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
          payload: {
            transferencia_id:       id,
            tipo:                   transferencia.tipo,
            proyecto_origen_id:     String(transferencia.proyecto_origen_id),
            concepto_origen_id:     transferencia.concepto_origen_id || null,
            concepto_origen_clave:  transferencia.concepto_origen_clave,
            proyecto_destino_id:    String(transferencia.proyecto_destino_id),
            concepto_destino_id:    String(transferencia.concepto_destino_id),
            concepto_destino_clave: transferencia.concepto_destino_clave,
            monto,
            aprobado_por_nombre:    userName || 'Director',
            justificacion:          transferencia.justificacion,
          },
        });
      } catch { /* best-effort */ }

      return res.json(createApiResponse(transActualizada, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error PATCH /transferencias-partida/:id/aprobar:', error.message);
      return res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al aprobar transferencia.', error.message));
    }
  }
);

// PATCH /api/v1/gerencia-tecnica/transferencias-partida/:id/rechazar
app.patch(
  '/api/v1/gerencia-tecnica/transferencias-partida/:id/rechazar',
  requireRoles('admin', 'director'),
  async (req: Request, res: Response) => {
    const { tenantId, proyectoId, userId, userName } = req.securityContext;
    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });
    const { id } = req.params;
    try {
      const { motivo_rechazo } = req.body;
      if (!motivo_rechazo || String(motivo_rechazo).trim().length === 0) {
        return res.status(422).json(createApiError('MOTIVO_REQUERIDO', 'El motivo de rechazo es obligatorio.'));
      }

      const transferencia = await db.transferenciaPartida.findFirst({ where: { id, tenant_id: tenantId } });
      if (!transferencia) {
        return res.status(404).json(createApiError('NOT_FOUND', 'Transferencia no encontrada.'));
      }
      if (transferencia.estado !== 'PENDIENTE') {
        return res.status(409).json(createApiError('YA_PROCESADA', 'La transferencia ya fue procesada.'));
      }

      const transActualizada = await db.transferenciaPartida.update({
        where: { id },
        data: {
          estado:              'RECHAZADA',
          motivo_rechazo:      String(motivo_rechazo).trim(),
          aprobado_por_id:     userId,
          aprobado_por_nombre: userName || 'Director',
          fecha_aprobacion:    new Date(),
        },
      });

      try {
        await publishEvent({
          event_type: 'gerencia_tecnica.transferencia_partida_rechazada',
          timestamp:  new Date().toISOString(),
          context:    { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
          payload: {
            transferencia_id:       id,
            concepto_destino_id:    String(transferencia.concepto_destino_id),
            concepto_destino_clave: transferencia.concepto_destino_clave,
            monto:                  Number(transferencia.monto),
            motivo_rechazo:         String(motivo_rechazo).trim(),
          },
        });
      } catch { /* best-effort */ }

      return res.json(createApiResponse(transActualizada, tenantId, proyectoId));
    } catch (error: any) {
      console.error('[GT] Error PATCH /transferencias-partida/:id/rechazar:', error.message);
      return res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al rechazar transferencia.', error.message));
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRAZABILIDAD TRIÁNGULO — Presupuestado ↔ Comprado ↔ Consumido
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Migrado a control-proyectos (openspec: fusionar-control-obra-a-control-proyectos)
const CO_URL = (process.env.CONTROL_PROYECTOS_URL || 'http://localhost:3013/api/v1/control-proyectos').replace(/\/$/, '');

function semaforoPorDesviacion(presupuestado: number, comprado: number, consumido: number): string {
  if (comprado === 0) return 'GRIS';
  if (consumido > comprado) return 'ROJO';
  const ratio = presupuestado > 0 ? comprado / presupuestado : 0;
  if (ratio >= 0.95 && ratio <= 1.05) return 'VERDE';
  if (ratio >= 0.80 && ratio <= 1.20) return 'AMARILLO';
  return 'ROJO';
}

// Handlers de eventos de Compras → CompraProyectada
export async function handleOcCreadaParaProyeccion(event: any): Promise<void> {
  const { oc_id, codigo, concepto_id, items } = event.payload as {
    oc_id: string; codigo: string; concepto_id?: string | null;
    items?: Array<{ insumo_id: string; cantidad: number; precio_unitario: number }>;
  };

  if (!concepto_id || !Array.isArray(items) || items.length === 0) return;

  const prisma = createTenantContext({
    tenant_id:   event.context.tenant_id,
    proyecto_id: event.context.proyecto_id,
    user_id:     event.context.user_id,
  });

  try {
    for (const item of items) {
      const monto = item.cantidad * item.precio_unitario;
      await (prisma as any).compraProyectada.upsert({
        where: { uq_compra_proyectada_oc_insumo: { oc_id, insumo_id: item.insumo_id } },
        update: { cantidad: item.cantidad, monto, estado: 'VIGENTE' },
        create: {
          tenant_id:   event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          concepto_id,
          insumo_id:   item.insumo_id,
          oc_id,
          oc_codigo:   codigo,
          cantidad:    item.cantidad,
          monto,
        },
      });
    }
    console.log(JSON.stringify({ action: 'gt.compra_proyectada.applied', oc_id, concepto_id, items: items.length }));
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'gt.compra_proyectada.error', oc_id, error: err.message }));
  }
}

export async function handleOcCanceladaParaProyeccion(event: any): Promise<void> {
  const { oc_id } = event.payload as { oc_id: string };

  const prisma = createTenantContext({
    tenant_id:   event.context.tenant_id,
    proyecto_id: event.context.proyecto_id,
    user_id:     event.context.user_id,
  });

  try {
    await (prisma as any).compraProyectada.updateMany({
      where: { oc_id, tenant_id: event.context.tenant_id },
      data:  { estado: 'CANCELADA' },
    });
    console.log(JSON.stringify({ action: 'gt.compra_proyectada.cancelada', oc_id }));
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'gt.compra_proyectada.cancelada.error', oc_id, error: err.message }));
  }
}

export async function handleCotizacionAceptadaEvent(event: any): Promise<void> {
  const { cotizacion_id, proyecto_id, cliente_nombre, monto_contrato, moneda, fecha_aceptacion } = event.payload ?? {};
  const tenantId = event.context?.tenant_id;

  if (!cotizacion_id || !tenantId) {
    console.warn(JSON.stringify({ action: 'gt.vinculo.cotizacion_aceptada.invalid_payload', payload: event.payload }));
    return;
  }

  const prisma = createTenantContext({
    tenant_id:   tenantId,
    proyecto_id: proyecto_id ?? event.context?.proyecto_id,
    user_id:     event.context?.user_id,
  });

  try {
    await (prisma as any).proyectoObraVinculado.upsert({
      where:  { tenant_id_cotizacion_id: { tenant_id: tenantId, cotizacion_id } },
      create: {
        tenant_id:      tenantId,
        proyecto_id:    proyecto_id ?? event.context?.proyecto_id,
        cotizacion_id,
        monto_contrato: monto_contrato ?? 0,
        moneda:         moneda ?? 'MXN',
        cliente_nombre: cliente_nombre ?? '',
        fecha_contrato: fecha_aceptacion ? new Date(fecha_aceptacion) : new Date(),
        estado:         'SIN_PRESUPUESTO',
      },
      update: {},
    });
    console.log(`[GT] Proyecto ${proyecto_id} vinculado a cotización ${cotizacion_id} — ${cliente_nombre} — $${monto_contrato}`);
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'gt.vinculo.cotizacion_aceptada.error', cotizacion_id, error: err.message }));
  }
}

export async function handleCentroCostosCreadoEvent(event: any): Promise<void> {
  const tenantId = event.context?.tenant_id;
  const proyectoId = event.context?.proyecto_id;

  if (!tenantId || !proyectoId) {
    console.warn(JSON.stringify({ action: 'gt.centro_costos_creado.invalid_payload', payload: event.payload }));
    return;
  }

  const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

  try {
    // Reemplaza el auto-create perezoso: en vez de esperar al primer
    // GET/POST de categorías-gasto, ProyectoCostosConfig (+ las 10
    // categorías predefinidas) se crea proactivamente al nacer el centro
    // de costos. getOrCreateProyectoConfig ya es idempotente (findUnique
    // antes de create), así que si el fallback perezoso ya la creó antes
    // de que llegara el evento, esta llamada es un no-op.
    await getOrCreateProyectoConfig(db, tenantId, proyectoId);
    console.log(JSON.stringify({ action: 'gt.centro_costos_creado.config_creado', tenant_id: tenantId, proyecto_id: proyectoId }));
  } catch (err: any) {
    console.error(JSON.stringify({ action: 'gt.centro_costos_creado.error', proyecto_id: proyectoId, error: err.message }));
  }
}

// GET /trazabilidad/resumen — datos ligeros por concepto (sin B2B)
app.get('/api/v1/gerencia-tecnica/trazabilidad/resumen',
  requireRoles('gerencia_tecnica', 'director', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;

      const prisma = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId });

      const presupuesto = await prisma.presupuestoBase.findFirst({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { created_at: 'desc' },
        include: { conceptos: { select: { id: true, clave: true, descripcion: true, importe: true } } },
      });

      let data: any[] = [];
      if (presupuesto) {
        const compradas = await (prisma as any).compraProyectada.findMany({
          where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'VIGENTE' },
        });

        const comprasPorConcepto = new Map<string, number>();
        for (const c of compradas) {
          comprasPorConcepto.set(c.concepto_id, (comprasPorConcepto.get(c.concepto_id) ?? 0) + Number(c.monto));
        }

        data = presupuesto.conceptos.map((concepto: any) => {
          const monto_presupuestado = Number(concepto.importe);
          const monto_comprado      = comprasPorConcepto.get(concepto.id) ?? 0;
          const semaforo            = semaforoPorDesviacion(monto_presupuestado, monto_comprado, 0);
          const pct_comprado        = monto_presupuestado > 0 ? Math.round((monto_comprado / monto_presupuestado) * 1000) / 10 : 0;
          return {
            concepto_id: concepto.id, clave: concepto.clave, descripcion: concepto.descripcion,
            monto_presupuestado, monto_comprado, monto_consumido: 0, semaforo, pct_comprado, pct_consumido: 0,
          };
        });
      }

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json(createApiError('INTERNAL_ERROR', error.message));
    }
  }
);

// GET /trazabilidad/triangulo — detalle completo por insumo con B2B a control-obra
app.get('/api/v1/gerencia-tecnica/trazabilidad/triangulo',
  requireRoles('gerencia_tecnica', 'director', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { concepto_id: filtroConceptoId } = req.query as Record<string, string | undefined>;
      const authHeader = req.headers.authorization ?? '';

      const { default: axios } = await import('axios');
      let parcial = false;

      const prismaT = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId });

      const presupuesto = await prismaT.presupuestoBase.findFirst({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { created_at: 'desc' },
        include: {
          conceptos: {
            where: filtroConceptoId ? { id: filtroConceptoId } : {},
            include: { insumos: { include: { insumo: { select: { id: true, clave: true, descripcion: true, unidad_medida: true, tipo_insumo: true } } } } },
          },
        },
      });

      const cpRows = await (prismaT as any).compraProyectada.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'VIGENTE' },
      });

      const comprasPorConcepto = new Map<string, Map<string, { cantidad: number; monto: number; ocs: string[] }>>();
      for (const row of cpRows) {
        if (!comprasPorConcepto.has(row.concepto_id)) comprasPorConcepto.set(row.concepto_id, new Map());
        const byInsumo = comprasPorConcepto.get(row.concepto_id)!;
        const prev = byInsumo.get(row.insumo_id) ?? { cantidad: 0, monto: 0, ocs: [] };
        byInsumo.set(row.insumo_id, {
          cantidad: prev.cantidad + Number(row.cantidad),
          monto:    prev.monto    + Number(row.monto),
          ocs:      [...prev.ocs, row.oc_codigo],
        });
      }

      if (!presupuesto) {
        return res.json({ success: true, data: { proyecto_id: proyectoId, parcial: false, conceptos: [], resumen: { total_presupuestado: 0, total_comprado: 0, total_consumido: 0, desviacion_compra_pct: 0, conceptos_en_alerta: 0 } } });
      }

      let totalPresupuestado = 0;
      let totalComprado = 0;
      let totalConsumido = 0;
      let conceptosEnAlerta = 0;

      const conceptos = await Promise.all(presupuesto.conceptos.map(async concepto => {
        const monto_presupuestado = Number(concepto.importe);
        totalPresupuestado += monto_presupuestado;

        // Obtener consumido de control-obra (B2B fail-soft)
        let consumidoPorInsumo = new Map<string, { cantidad: number; monto: number }>();
        try {
          const coResp = await axios.get(`${CO_URL}/conceptos/${concepto.id}/costo-real`, {
            headers: { authorization: authHeader },
            timeout: 2500,
          });
          const materiales: any[] = coResp.data?.data?.materiales ?? [];
          for (const m of materiales) {
            consumidoPorInsumo.set(m.insumo_id, {
              cantidad: Number(m.cantidad),
              monto:    Number(m.costo_total),
            });
          }
        } catch {
          parcial = true;
        }

        const compradoByConcepto = comprasPorConcepto.get(concepto.id) ?? new Map();
        let conceptoComprado = 0;
        let conceptoConsumido = 0;
        let tieneAlerta = false;

        const insumos = concepto.insumos.map(ci => {
          const presupuestadoInsumo = {
            cantidad: Number(ci.cantidad) * Number(concepto.importe) / (Number(concepto.precio_unitario) || 1),
            monto:    Number(ci.costo_unitario) * Number(ci.cantidad) * Number(concepto.cantidad || 1),
            fuente:   'APU',
          };
          const cp = compradoByConcepto.get(ci.insumo_id) ?? { cantidad: 0, monto: 0, ocs: [] };
          const consumido = consumidoPorInsumo.get(ci.insumo_id) ?? { cantidad: 0, monto: 0 };

          conceptoComprado  += cp.monto;
          conceptoConsumido += consumido.monto;

          const sem = semaforoPorDesviacion(presupuestadoInsumo.monto, cp.monto, consumido.monto);
          if (sem === 'ROJO' || sem === 'AMARILLO') tieneAlerta = true;

          return {
            insumo_id:   ci.insumo.id,
            clave:       ci.insumo.clave,
            descripcion: ci.insumo.descripcion,
            unidad:      ci.insumo.unidad_medida,
            tipo_insumo: ci.insumo.tipo_insumo,
            presupuestado: presupuestadoInsumo,
            comprado: { cantidad: cp.cantidad, monto: cp.monto, ocs: cp.ocs, parcial: false },
            consumido: { cantidad: consumido.cantidad, monto: consumido.monto, parcial },
            semaforo: sem,
            desviacion_compra_pct:   presupuestadoInsumo.monto > 0 ? Math.round(((cp.monto / presupuestadoInsumo.monto) - 1) * 1000) / 10 : 0,
            desviacion_consumo_pct:  presupuestadoInsumo.monto > 0 ? Math.round(((consumido.monto / presupuestadoInsumo.monto) - 1) * 1000) / 10 : 0,
          };
        });

        totalComprado  += conceptoComprado;
        totalConsumido += conceptoConsumido;
        if (tieneAlerta) conceptosEnAlerta++;

        return {
          concepto_id:              concepto.id,
          clave:                    concepto.clave,
          descripcion:              concepto.descripcion,
          unidad:                   concepto.unidad_medida,
          cantidad_presupuestada:   Number(concepto.cantidad),
          monto_presupuestado,
          insumos:                  insumos.sort((a, b) => (a.semaforo === 'ROJO' ? -1 : b.semaforo === 'ROJO' ? 1 : 0)),
        };
      }));

      res.json({
        success: true,
        data: {
          proyecto_id:    proyectoId,
          presupuesto_id: presupuesto.id,
          generado_en:    new Date().toISOString(),
          parcial,
          conceptos,
          resumen: {
            total_presupuestado:   totalPresupuestado,
            total_comprado:        totalComprado,
            total_consumido:       totalConsumido,
            desviacion_compra_pct: totalPresupuestado > 0 ? Math.round(((totalComprado / totalPresupuestado) - 1) * 1000) / 10 : 0,
            conceptos_en_alerta:   conceptosEnAlerta,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json(createApiError('INTERNAL_ERROR', error.message));
    }
  }
);

// GET /proyectos-vinculados — proyectos que nacieron de cotizaciones de Ventas
app.get('/api/v1/gerencia-tecnica/proyectos-vinculados',
  requireRoles('gerencia_tecnica', 'director', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const { estado } = req.query;
      const prisma = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId });

      const where: any = { tenant_id: tenantId };
      if (estado) where.estado = estado as string;

      const vinculados = await (prisma as any).proyectoObraVinculado.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });

      const data = vinculados.map((v: any) => ({
        proyecto_id:      v.proyecto_id,
        cotizacion_id:    v.cotizacion_id,
        cliente_nombre:   v.cliente_nombre,
        monto_contrato:   Number(v.monto_contrato),
        moneda:           v.moneda,
        estado:           v.estado,
        tiene_presupuesto: v.estado !== 'SIN_PRESUPUESTO',
        fecha_contrato:   v.fecha_contrato,
      }));

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json(createApiError('INTERNAL_ERROR', error.message));
    }
  }
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'gerencia-tecnica', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE DEL SERVIDOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PORT = process.env.PORT || 3001;
initSentry(process.env.SENTRY_DSN || '', 'gerencia-tecnica');
setupSentryExpressHandler(app);

async function bootstrap(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏗️  Módulo: GERENCIA TÉCNICA (Insumos & Presupuestos)');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Inicializar EventBus (RabbitMQ) — no bloquea si falla
  await initEventBus();
  await subscribeToEvent('compras.oc_creada',          handleOcCreadaParaProyeccion);
  await subscribeToEvent('compras.oc_cancelada',        handleOcCanceladaParaProyeccion);
  await subscribeToEvent('ventas.cotizacion_aceptada',  handleCotizacionAceptadaEvent);
  await subscribeToEvent('auth.centro_costos_creado',   handleCentroCostosCreadoEvent);

  // 2. Levantar servidor HTTP
  const server = app.listen(PORT, () => {
    console.log(`[Gerencia Técnica] ✅ Servidor en puerto ${PORT}`);
    console.log(`[Gerencia Técnica] 🔐 Autenticación: JWT REAL (Bearer Token)`);
    console.log(`[Gerencia Técnica] 🛡️  Aislamiento RLS: ACTIVO`);
    console.log(`[Gerencia Técnica] 📡 Rutas disponibles:`);
    console.log(`   GET    /api/v1/gerencia-tecnica/insumos`);
    console.log(`   POST   /api/v1/gerencia-tecnica/insumos`);
    console.log(`   PATCH  /api/v1/gerencia-tecnica/insumos/:id`);
    console.log(`   DELETE /api/v1/gerencia-tecnica/insumos/:id`);
    console.log(`   GET    /api/v1/gerencia-tecnica/presupuestos`);
    console.log(`   POST   /api/v1/gerencia-tecnica/presupuestos`);
    console.log(`   GET    /health (sin auth)`);
  });

  // 3. Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Gerencia Técnica] 🔌 Señal ${signal} recibida. Apagando limpiamente...`);
    server.close(async () => {
      await closeEventBus();
      await disconnectDb();
      console.log('[Gerencia Técnica] 👋 Módulo detenido correctamente.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('[Gerencia Técnica] ❌ Error fatal al iniciar:', err);
    process.exit(1);
  });
}

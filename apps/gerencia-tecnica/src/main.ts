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
import { initEventBus, closeEventBus } from './event-bus';
import {
  createApiResponse,
  createApiError,
} from './types';

// ─── Importar middleware JWT compartido ──────────────────────────────────────
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
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

const app = express();
app.use(express.json());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE JWT: Verificación real con firma criptográfica
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health'],
}));
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
    });

    res.json(createApiResponse(insumos, tenantId, proyectoId));
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
 * Returns: { id, nombre, conceptos: [{ id, clave, descripcion, unidad_medida }] }
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
          select: { id: true, clave: true, descripcion: true, unidad_medida: true },
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
app.post('/api/v1/gerencia-tecnica/insumos', requireRoles('admin', 'superintendent', 'technical'), async (req: Request, res: Response) => {
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
      if (
        !clave || typeof clave !== 'string' ||
        !descripcion || typeof descripcion !== 'string' ||
        !unidad_medida || typeof unidad_medida !== 'string' ||
        !TIPOS_VALIDOS.includes(tipo_insumo)
      ) {
        omitidos++;
        continue;
      }
      validos.push({
        clave: String(clave).trim().toUpperCase(),
        descripcion: String(descripcion).trim(),
        unidad_medida: String(unidad_medida).trim().toUpperCase(),
        tipo_insumo,
        costo_base: Math.max(0, parseFloat(String(costo_base ?? 0)) || 0),
      });
    }

    if (validos.length === 0) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', `Ningún insumo válido en el lote. Omitidos: ${omitidos}.`)
      );
    }

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

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
          clave: i.clave,
          descripcion: i.descripcion,
          unidad_medida: i.unidad_medida,
          tipo_insumo: i.tipo_insumo as any,
          costo_base: i.costo_base,
          activo: true,
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
          },
        });
        actualizados++;
      } catch (_) {
        omitidos++;
      }
    }

    console.log(`[Gerencia Técnica] Importación lote: +${creados} nuevos, ~${actualizados} actualizados, ✗${omitidos} omitidos`);
    res.json(createApiResponse({ creados, actualizados, omitidos }, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en POST /insumos/importar-lote:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al importar lote de insumos.', error.message)
    );
  }
});

/**
 * PATCH /api/v1/gerencia-tecnica/insumos/:id
 * Actualiza un insumo existente (precio, descripción, unidad).
 */
app.patch('/api/v1/gerencia-tecnica/insumos/:id', requireRoles('admin', 'superintendent', 'technical'), async (req: Request, res: Response) => {
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
 */
app.post('/api/v1/gerencia-tecnica/presupuestos', requireRoles('admin', 'superintendent', 'technical'), async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const { proyecto_id, version, conceptos } = req.body;

    if (!proyecto_id) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Campos requeridos: proyecto_id.')
      );
    }

    const db = createTenantContext({ tenant_id: tenantId, proyecto_id: proyectoId });

    // Calcular importe_total sumando los importes de cada concepto.
    let importeTotal = 0;
    const conceptosNormalizados = (conceptos || []).map((c: any) => {
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
      };
    });

    const presupuesto = await db.presupuestoBase.create({
      data: {
        tenant_id: tenantId,
        proyecto_id,
        version: parseInt(String(version), 10) || 1,
        importe_total: importeTotal,
        conceptos: conceptosNormalizados.length > 0
          ? { create: conceptosNormalizados }
          : undefined,
      },
      include: { conceptos: true },
    });

    res.status(201).json(createApiResponse(presupuesto, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en POST /presupuestos:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al crear presupuesto.', error.message)
    );
  }
});

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
          } catch (_) {
            omitidos++;
          }
        }
      }

      console.log(`[Gerencia Técnica] Composición APU (presupuesto ${presupuesto_id}): +${vinculados} vinculados, ~${actualizados} actualizados, ✗${omitidos} omitidos`);
      res.json(createApiResponse({ presupuesto_id, vinculados, actualizados, omitidos }, tenantId, proyectoId));
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
          } catch (_) { omitidos++; }
        }
      }
      res.json(createApiResponse({ presupuesto_id: presupuesto.id, vinculados, actualizados, omitidos }, tenantId, proyectoId));
    } catch (error: any) {
      res.status(500).json(createApiError('INTERNAL_ERROR', 'Error al importar composición APU.', error.message));
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

      const presupuesto = await db.presupuestoBase.findUnique({ where: { id } });
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

const ROLES_FICHAS_UPLOAD  = ['procurement', 'gerencia_tecnica', 'admin'] as const;
const ROLES_FICHAS_LECTURA = ['resident', 'control_obra', 'gerencia_tecnica', 'superintendent', 'procurement', 'admin'] as const;

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
app.delete(
  '/api/v1/gerencia-tecnica/insumos/:id/fichas/:fid',
  requireRoles(...ROLES_FICHAS_UPLOAD),
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
// HEALTH CHECK (sin auth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'gerencia-tecnica', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE DEL SERVIDOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PORT = process.env.PORT || 3001;

async function bootstrap(): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏗️  Módulo: GERENCIA TÉCNICA (Insumos & Presupuestos)');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Inicializar EventBus (RabbitMQ) — no bloquea si falla
  await initEventBus();

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

bootstrap().catch((err) => {
  console.error('[Gerencia Técnica] ❌ Error fatal al iniciar:', err);
  process.exit(1);
});

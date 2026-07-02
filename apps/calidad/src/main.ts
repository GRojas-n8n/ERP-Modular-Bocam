// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Módulo: Calidad — Control de Documentos ISO 9001:2015
// Puerto: 3009
// -----------------------------------------------------------------------------

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createCalidadContext, disconnectDb } from './db';
import { createAuthMiddleware, requireEnv, requireRoles } from '../../../packages/auth-middleware/src';
import { createObservabilityMiddleware, initSentry, logError, logInfo, setupSentryExpressHandler } from '../../../packages/observability/src';
import {
  TIPOS_DOCUMENTO,
  ESTADOS_DOCUMENTO,
  ACCIONES_VERSION,
  TRANSICIONES,
  MAX_FILE_SIZE,
  EXTENSIONES_PERMITIDAS,
} from './types';

const PORT     = process.env.PORT     || 3009;
const JWT_SECRET = requireEnv('JWT_SECRET');
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/calidad-uploads';
initSentry(process.env.SENTRY_DSN || '', 'calidad');

// Garantizar que el directorio de uploads exista
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer ───────────────────────────────────────────────────────────────────
const upload = multer({
  dest: path.join(UPLOAD_DIR, '_tmp'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
      return cb(new Error(`Tipo de archivo no permitido: ${ext}`));
    }
    cb(null, true);
  },
});

// ── Workflow NC ──────────────────────────────────────────────────────────────
function validarTransicionNC(
  estadoActual: string,
  estadoNuevo: string,
  acciones: { estado: string }[],
  rol: string,
): { ok: true } | { ok: false; codigo: string } {
  const transiciones: Record<string, string[]> = {
    ABIERTA:           ['EN_ANALISIS'],
    EN_ANALISIS:       ['ACCION_CORRECTIVA', 'CERRADA'],
    ACCION_CORRECTIVA: ['EN_VERIFICACION'],
    EN_VERIFICACION:   ['CERRADA', 'ACCION_CORRECTIVA'],
    CERRADA:           [],
  };

  const permitidos = transiciones[estadoActual] ?? [];
  if (!permitidos.includes(estadoNuevo)) {
    return { ok: false, codigo: 'TRANSICION_NO_PERMITIDA' };
  }

  if (estadoNuevo === 'EN_VERIFICACION') {
    const hayCompletada = acciones.some(a => a.estado === 'COMPLETADA' || a.estado === 'VERIFICADA');
    if (!hayCompletada) return { ok: false, codigo: 'NC_SIN_ACCIONES_COMPLETADAS' };
  }

  if (estadoNuevo === 'CERRADA' && estadoActual === 'EN_VERIFICACION') {
    const todasVerificadas = acciones.filter(a => a.estado !== 'CANCELADA').every(a => a.estado === 'VERIFICADA');
    if (!todasVerificadas) return { ok: false, codigo: 'NC_ACCIONES_PENDIENTES_VERIFICACION' };
  }

  return { ok: true };
}

// ── App ──────────────────────────────────────────────────────────────────────
export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('calidad'));
app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));

app.get('/api/v1/calidad/resumen-dashboard',
  requireRoles('superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const [docVigentes, docEnRevision, versionesPendientes] = await Promise.all([
          prisma.documento.count({ where: { estado_actual: 'VIGENTE' } }),
          prisma.documento.count({ where: { estado_actual: 'EN_REVISION' } }),
          prisma.versionDocumento.count({ where: { estado: 'EN_REVISION' } }),
        ]);
        return {
          documentos_vigentes:    docVigentes,
          documentos_en_revision: docEnRevision,
          versiones_pendientes:   versionesPendientes,
        };
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── No Conformidades ─────────────────────────────────────────────────────────

app.get('/api/v1/calidad/no-conformidades',
  requireRoles('calidad', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.noConformidad.findMany({
          where: { proyecto_id: proyectoId },
          include: { acciones: { orderBy: { created_at: 'asc' } } },
          orderBy: { created_at: 'desc' },
        })
      );
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.post('/api/v1/calidad/no-conformidades',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const { titulo, descripcion, fuente, responsable_id, fecha_limite } = req.body;
      if (!titulo || !fuente) return res.status(400).json({ success: false, message: 'titulo y fuente son requeridos.' });
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const count = await prisma.noConformidad.count({ where: { tenant_id: tenantId } });
        const year  = new Date().getFullYear();
        const codigo = `NC-${year}-${String(count + 1).padStart(3, '0')}`;
        return prisma.noConformidad.create({
          data: {
            tenant_id: tenantId, proyecto_id: proyectoId,
            codigo, titulo, descripcion: descripcion || null,
            fuente, detectado_por: userId,
            responsable_id: responsable_id || userId,
            fecha_limite: fecha_limite ? new Date(fecha_limite) : null,
          },
          include: { acciones: true },
        });
      });
      res.status(201).json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.get('/api/v1/calidad/no-conformidades/:id',
  requireRoles('calidad', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.noConformidad.findFirst({
          where: { id_nc: req.params.id, tenant_id: tenantId, proyecto_id: proyectoId },
          include: { acciones: { orderBy: { created_at: 'asc' } } },
        })
      );
      if (!data) return res.status(404).json({ success: false, message: 'NC no encontrada.' });
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.patch('/api/v1/calidad/no-conformidades/:id',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const { rol } = req.securityContext as any;
      const { estado, causa_raiz, responsable_id, fecha_limite, reabrir } = req.body;

      const result = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const nc = await prisma.noConformidad.findFirst({
          where: { id_nc: req.params.id, tenant_id: tenantId, proyecto_id: proyectoId },
          include: { acciones: true },
        });
        if (!nc) return { notFound: true };

        // Reapertura administrativa
        if (reabrir === true) {
          if (rol !== 'admin') return { forbidden: true, codigo: 'REABRIR_SOLO_ADMIN' };
          const updated = await prisma.noConformidad.update({
            where: { id_nc: req.params.id },
            data: { estado: 'ABIERTA', fecha_cierre: null },
            include: { acciones: true },
          });
          return { data: updated };
        }

        if (estado) {
          const validacion = validarTransicionNC(nc.estado, estado, nc.acciones, rol);
          if (!validacion.ok) return { transicionInvalida: true, codigo: validacion.codigo };
        }

        const updated = await prisma.noConformidad.update({
          where: { id_nc: req.params.id },
          data: {
            ...(estado         && { estado }),
            ...(causa_raiz     !== undefined && { causa_raiz }),
            ...(responsable_id && { responsable_id }),
            ...(fecha_limite   !== undefined && { fecha_limite: fecha_limite ? new Date(fecha_limite) : null }),
            ...(estado === 'CERRADA' && { fecha_cierre: new Date() }),
          },
          include: { acciones: true },
        });
        return { data: updated };
      });

      if ((result as any).notFound)          return res.status(404).json({ success: false, message: 'NC no encontrada.' });
      if ((result as any).forbidden)         return res.status(403).json({ success: false, message: 'Solo admin puede reabrir una NC.', codigo: (result as any).codigo });
      if ((result as any).transicionInvalida) return res.status(422).json({ success: false, message: 'Transición no permitida.', codigo: (result as any).codigo });
      res.json({ success: true, data: (result as any).data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.post('/api/v1/calidad/no-conformidades/:id/acciones',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { descripcion, responsable_id, fecha_compromiso } = req.body;
      if (!descripcion) return res.status(400).json({ success: false, message: 'descripcion es requerida.' });
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.accionCorrectiva.create({
          data: {
            tenant_id: tenantId, nc_id: req.params.id,
            descripcion, responsable_id: responsable_id || userId,
            fecha_compromiso: fecha_compromiso ? new Date(fecha_compromiso) : null,
          },
        })
      );
      res.status(201).json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.patch('/api/v1/calidad/no-conformidades/:id/acciones/:aid',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { estado, evidencia } = req.body;
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.accionCorrectiva.update({
          where: { id_accion: req.params.aid },
          data: {
            ...(estado    && { estado }),
            ...(evidencia !== undefined && { evidencia }),
            ...(estado === 'VERIFICADA' && {
              verificado_por:     userId,
              fecha_verificacion: new Date(),
            }),
          },
        })
      );
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

// ── Auditorías Internas ───────────────────────────────────────────────────────

app.get('/api/v1/calidad/auditorias',
  requireRoles('calidad', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.auditoriaInterna.findMany({
          where: { proyecto_id: proyectoId },
          include: { _count: { select: { hallazgos: true } } },
          orderBy: { created_at: 'desc' },
        })
      );
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.post('/api/v1/calidad/auditorias',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const { titulo, alcance, criterios, auditor_lider_id, fecha_inicio, fecha_fin } = req.body;
      if (!titulo) return res.status(400).json({ success: false, message: 'titulo es requerido.' });
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const count  = await prisma.auditoriaInterna.count({ where: { tenant_id: tenantId } });
        const year   = new Date().getFullYear();
        const codigo = `AUD-${year}-${String(count + 1).padStart(2, '0')}`;
        return prisma.auditoriaInterna.create({
          data: {
            tenant_id: tenantId, proyecto_id: proyectoId,
            codigo, titulo,
            alcance: alcance || null, criterios: criterios || null,
            auditor_lider_id: auditor_lider_id || userId,
            fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
            fecha_fin:    fecha_fin    ? new Date(fecha_fin)    : null,
          },
        });
      });
      res.status(201).json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.get('/api/v1/calidad/auditorias/:id',
  requireRoles('calidad', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.auditoriaInterna.findFirst({
          where: { id_auditoria: req.params.id, tenant_id: tenantId, proyecto_id: proyectoId },
          include: { hallazgos: { orderBy: { created_at: 'asc' } } },
        })
      );
      if (!data) return res.status(404).json({ success: false, message: 'Auditoría no encontrada.' });
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

app.post('/api/v1/calidad/auditorias/:id/hallazgos',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { descripcion, tipo, proceso_afectado, evidencia, accion_requerida } = req.body;
      if (!descripcion || !tipo) return res.status(400).json({ success: false, message: 'descripcion y tipo son requeridos.' });
      const data = await createCalidadContext({ tenantId, userId }, async (prisma) =>
        prisma.hallazgoAuditoria.create({
          data: {
            tenant_id: tenantId, auditoria_id: req.params.id,
            descripcion, tipo,
            proceso_afectado: proceso_afectado || null,
            evidencia: evidencia || null,
            accion_requerida: accion_requerida || null,
          },
        })
      );
      res.status(201).json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

// ── PATCH /auditorias/:id — workflow de estado ───────────────────────────────
app.patch('/api/v1/calidad/auditorias/:id',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { rol } = req.securityContext as any;
      const { estado, observaciones } = req.body;

      const result = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const aud = await prisma.auditoriaInterna.findFirst({
          where: { id_auditoria: req.params.id, tenant_id: tenantId },
        });
        if (!aud) return { notFound: true };

        if (estado) {
          const TRANSICIONES_AUD: Record<string, string[]> = {
            PROGRAMADA:  ['EN_CURSO', 'CANCELADA'],
            EN_CURSO:    ['COMPLETADA', 'CANCELADA'],
            COMPLETADA:  [],
            CANCELADA:   [],
          };
          const permitidos = TRANSICIONES_AUD[aud.estado] ?? [];
          if (!permitidos.includes(estado)) {
            return { transicionInvalida: true, estadoActual: aud.estado, permitidos };
          }
          if (estado === 'CANCELADA' && rol !== 'admin') {
            return { forbidden: true };
          }
        }

        const updated = await prisma.auditoriaInterna.update({
          where: { id_auditoria: req.params.id },
          data: {
            ...(estado       && { estado }),
            ...(observaciones !== undefined && { observaciones }),
          },
          include: { hallazgos: { orderBy: { created_at: 'asc' } } },
        });
        return { data: updated };
      });

      if ((result as any).notFound)          return res.status(404).json({ success: false, message: 'Auditoría no encontrada.' });
      if ((result as any).forbidden)         return res.status(403).json({ success: false, message: 'Solo admin puede cancelar una auditoría.' });
      if ((result as any).transicionInvalida) return res.status(422).json({
        success: false,
        message: `Transición inválida desde ${(result as any).estadoActual}. Permitidos: ${((result as any).permitidos as string[]).join(', ') || 'ninguno'}.`,
      });
      res.json({ success: true, data: (result as any).data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

// ── PATCH /auditorias/:id/hallazgos/:hid ────────────────────────────────────
app.patch('/api/v1/calidad/auditorias/:id/hallazgos/:hid',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { estado, evidencia } = req.body;

      const result = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const hallazgo = await prisma.hallazgoAuditoria.findFirst({
          where: { id_hallazgo: req.params.hid, auditoria_id: req.params.id, tenant_id: tenantId },
        });
        if (!hallazgo) return { notFound: true };

        const updated = await prisma.hallazgoAuditoria.update({
          where: { id_hallazgo: req.params.hid },
          data: {
            ...(estado    && { estado }),
            ...(evidencia !== undefined && { evidencia }),
          },
        });
        return { data: updated };
      });

      if ((result as any).notFound) return res.status(404).json({ success: false, message: 'Hallazgo no encontrado o no pertenece a esta auditoría.' });
      res.json({ success: true, data: (result as any).data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

// ── POST /auditorias/:id/hallazgos/:hid/crear-nc ─────────────────────────────
app.post('/api/v1/calidad/auditorias/:id/hallazgos/:hid/crear-nc',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId, proyectoId } = req.securityContext;
      const { responsable_id, fecha_limite } = req.body;

      const result = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const hallazgo = await prisma.hallazgoAuditoria.findFirst({
          where: { id_hallazgo: req.params.hid, auditoria_id: req.params.id, tenant_id: tenantId },
        });
        if (!hallazgo) return { notFound: true };
        if (hallazgo.nc_id) return { yaExiste: true, nc_id: hallazgo.nc_id };

        const count = await prisma.noConformidad.count({ where: { tenant_id: tenantId } });
        const year  = new Date().getFullYear();
        const codigo = `NC-${year}-${String(count + 1).padStart(3, '0')}`;

        const nc = await prisma.noConformidad.create({
          data: {
            tenant_id:     tenantId,
            proyecto_id:   proyectoId,
            codigo,
            titulo:        hallazgo.descripcion.slice(0, 255),
            descripcion:   [hallazgo.descripcion, hallazgo.proceso_afectado].filter(Boolean).join('\nProceso afectado: '),
            fuente:        'AUDITORIA',
            estado:        'ABIERTA',
            detectado_por: userId,
            responsable_id: responsable_id || userId,
            fecha_limite:  fecha_limite ? new Date(fecha_limite) : null,
          },
          include: { acciones: true },
        });

        const hallazgoActualizado = await prisma.hallazgoAuditoria.update({
          where: { id_hallazgo: req.params.hid },
          data:  { nc_id: nc.id_nc },
        });

        return { data: { nc, hallazgo: hallazgoActualizado } };
      });

      if ((result as any).notFound)  return res.status(404).json({ success: false, message: 'Hallazgo no encontrado.', codigo: 'HALLAZGO_NOT_FOUND' });
      if ((result as any).yaExiste)  return res.status(409).json({ success: false, message: 'El hallazgo ya tiene una NC asociada.', codigo: 'HALLAZGO_YA_TIENE_NC', nc_id: (result as any).nc_id });
      res.status(201).json({ success: true, data: (result as any).data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
);

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'calidad', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function archivoRutaFinal(tenantId: string, docId: string, versionId: string, ext: string): string {
  return path.join(tenantId, docId, `${versionId}${ext}`);
}

function archivoAbsoluto(ruta: string): string {
  return path.join(UPLOAD_DIR, ruta);
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

// ── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/v1/calidad/dashboard', requireRoles('calidad', 'admin', 'superintendent'), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId, proyectoId } = req.securityContext;

    const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
      const now = new Date();
      const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const en30Dias = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const [
        docsPorEstado, docsPorTipo, versionesPendientes, versionesSinArchivo,
        ncsAbiertas, ncsVencidas, auditoriasProgramadas,
        ncsTotal, ncsCerradasEnPlazo,
        accionesVencidas, hallazgosMayorSinNC, auditoriasEnCurso,
      ] = await Promise.all([
        prisma.documento.groupBy({ by: ['estado_actual'], where: { tenant_id: tenantId, proyecto_id: proyectoId }, _count: { _all: true } }),
        prisma.documento.groupBy({ by: ['tipo'],          where: { tenant_id: tenantId, proyecto_id: proyectoId }, _count: { _all: true } }),
        prisma.versionDocumento.count({ where: { tenant_id: tenantId, estado: 'EN_REVISION' } }),
        prisma.versionDocumento.count({ where: { tenant_id: tenantId, estado: 'BORRADOR', archivo_ruta: null } }),
        prisma.noConformidad.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: { not: 'CERRADA' } } }),
        prisma.noConformidad.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: { not: 'CERRADA' }, fecha_limite: { lt: now } } }),
        prisma.auditoriaInterna.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'PROGRAMADA', fecha_inicio: { gte: now, lte: en30Dias } } }),
        prisma.noConformidad.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, created_at: { gte: primerDiaMes } } }),
        prisma.noConformidad.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'CERRADA', fecha_cierre: { gte: primerDiaMes }, fecha_limite: { not: null } } }),
        prisma.accionCorrectiva.count({ where: { tenant_id: tenantId, estado: { notIn: ['COMPLETADA', 'VERIFICADA', 'CANCELADA'] }, fecha_compromiso: { lt: now } } }),
        prisma.hallazgoAuditoria.count({ where: { tenant_id: tenantId, tipo: 'MAYOR', nc_id: null, estado: { not: 'CERRADO' } } }),
        prisma.auditoriaInterna.count({ where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'EN_CURSO' } }),
      ]);

      const porEstado: Record<string, number> = { BORRADOR: 0, EN_REVISION: 0, VIGENTE: 0, OBSOLETO: 0 };
      docsPorEstado.forEach(r => { porEstado[r.estado_actual] = r._count._all; });
      const porTipo: Record<string, number> = {};
      TIPOS_DOCUMENTO.forEach(t => { porTipo[t] = 0; });
      docsPorTipo.forEach(r => { porTipo[r.tipo] = r._count._all; });

      const indiceCalidad = ncsTotal > 0 ? Math.round((ncsCerradasEnPlazo / ncsTotal) * 100) : 100;

      const alertas: { tipo: string; count: number; mensaje: string }[] = [];
      if (ncsVencidas > 0)          alertas.push({ tipo: 'NC_VENCIDA',             count: ncsVencidas,          mensaje: `${ncsVencidas} no conformidades vencidas sin cerrar` });
      if (hallazgosMayorSinNC > 0)  alertas.push({ tipo: 'HALLAZGO_MAYOR_SIN_NC',  count: hallazgosMayorSinNC,  mensaje: `${hallazgosMayorSinNC} hallazgos MAYOR sin NC asociada` });

      return {
        // KPIs de NCs e ISO 9001
        ncs_abiertas:             ncsAbiertas,
        ncs_vencidas:             ncsVencidas,
        acciones_vencidas:        accionesVencidas,
        hallazgos_mayor_sin_nc:   hallazgosMayorSinNC,
        auditorias_en_curso:      auditoriasEnCurso,
        auditorias_programadas:   auditoriasProgramadas,
        indice_calidad:           indiceCalidad,
        alertas,
        // Documentos (datos legacy — no eliminados para no romper)
        documentos_por_estado: porEstado,
        total_documentos: Object.values(porEstado).reduce((a: number, b: number) => a + b, 0),
        documentos_por_tipo: porTipo,
        versiones_pendientes_revision: versionesPendientes,
        versiones_en_borrador_sin_archivo: versionesSinArchivo,
      };
    });

    res.json({ success: true, data });
  } catch (error: any) {
    logError(req, 'calidad', 'calidad.dashboard.error', 'Error al obtener dashboard', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /documentos ───────────────────────────────────────────────────────────
app.get('/api/v1/calidad/documentos', requireRoles('calidad', 'admin', 'superintendent'), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId, proyectoId } = req.securityContext;
    const { tipo, estado, q } = req.query as Record<string, string | undefined>;

    const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
      return prisma.documento.findMany({
        where: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          ...(tipo   ? { tipo }                                          : {}),
          ...(estado ? { estado_actual: estado }                         : {}),
          ...(q      ? { OR: [{ codigo: { contains: q, mode: 'insensitive' } }, { titulo: { contains: q, mode: 'insensitive' } }] } : {}),
        },
        include: { _count: { select: { versiones: true } } },
        orderBy: { updated_at: 'desc' },
      });
    });

    res.json({ success: true, data });
  } catch (error: any) {
    logError(req, 'calidad', 'calidad.documentos.list.error', 'Error al listar documentos', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /documentos ──────────────────────────────────────────────────────────
app.post('/api/v1/calidad/documentos', requireRoles('calidad', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId, proyectoId } = req.securityContext;
    const { codigo, titulo, tipo, descripcion, responsable_id } = req.body;

    if (!codigo || !titulo || !tipo || !responsable_id) {
      return res.status(400).json({ success: false, message: 'Campos requeridos: codigo, titulo, tipo, responsable_id' });
    }
    if (!TIPOS_DOCUMENTO.includes(tipo)) {
      return res.status(400).json({ success: false, message: `Tipo inválido. Valores permitidos: ${TIPOS_DOCUMENTO.join(', ')}` });
    }

    const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
      return prisma.documento.create({
        data: {
          tenant_id:      tenantId,
          codigo:         codigo.trim().toUpperCase(),
          titulo,
          tipo,
          descripcion:    descripcion || null,
          responsable_id,
          proyecto_id:    proyectoId,
        },
      });
    });

    logInfo(req, 'calidad', 'calidad.documento.creado', `Documento ${data.codigo} creado`);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: `El código ya existe en este tenant.` });
    }
    logError(req, 'calidad', 'calidad.documentos.create.error', 'Error al crear documento', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /documentos/:id ───────────────────────────────────────────────────────
app.get('/api/v1/calidad/documentos/:id', requireRoles('calidad', 'admin', 'superintendent'), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId, proyectoId } = req.securityContext;
    const { id } = req.params;

    const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
      return prisma.documento.findFirst({
        where: { id_documento: id, tenant_id: tenantId, proyecto_id: proyectoId },
        include: {
          versiones: { orderBy: { created_at: 'desc' } },
        },
      });
    });

    if (!data) return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
    res.json({ success: true, data });
  } catch (error: any) {
    logError(req, 'calidad', 'calidad.documentos.get.error', 'Error al obtener documento', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── PATCH /documentos/:id ─────────────────────────────────────────────────────
app.patch('/api/v1/calidad/documentos/:id', requireRoles('calidad', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId, proyectoId } = req.securityContext;
    const { id } = req.params;
    const { titulo, descripcion, responsable_id } = req.body;

    const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
      const doc = await prisma.documento.findFirst({ where: { id_documento: id, tenant_id: tenantId, proyecto_id: proyectoId } });
      if (!doc) return null;
      return prisma.documento.update({
        where: { id_documento: id },
        data: {
          ...(titulo         !== undefined ? { titulo }         : {}),
          ...(descripcion    !== undefined ? { descripcion }    : {}),
          ...(responsable_id !== undefined ? { responsable_id } : {}),
        },
      });
    });

    if (!data) return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
    res.json({ success: true, data });
  } catch (error: any) {
    logError(req, 'calidad', 'calidad.documentos.update.error', 'Error al actualizar documento', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE /documentos/:id ────────────────────────────────────────────────────
app.delete('/api/v1/calidad/documentos/:id', requireRoles('calidad', 'admin'), async (req: Request, res: Response) => {
  try {
    const { tenantId, userId, proyectoId } = req.securityContext;
    const { id } = req.params;

    const resultado = await createCalidadContext({ tenantId, userId }, async (prisma) => {
      const doc = await prisma.documento.findFirst({
        where: { id_documento: id, tenant_id: tenantId, proyecto_id: proyectoId },
        include: { versiones: true },
      });
      if (!doc) return { notFound: true };

      const bloqueante = doc.versiones.find(v => v.estado === 'VIGENTE' || v.estado === 'EN_REVISION');
      if (bloqueante) return { blocked: true, estado: bloqueante.estado };

      // Eliminar archivos del disco
      for (const v of doc.versiones) {
        if (v.archivo_ruta) {
          const abs = archivoAbsoluto(v.archivo_ruta);
          try { fs.unlinkSync(abs); } catch (_) { /* ignorar si ya no existe */ }
        }
      }

      await prisma.documento.delete({ where: { id_documento: id } });
      return { deleted: true };
    });

    if ((resultado as any).notFound)  return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
    if ((resultado as any).blocked)   return res.status(409).json({ success: false, message: `No se puede eliminar: existe una versión en estado ${(resultado as any).estado}.` });
    res.json({ success: true, message: 'Documento eliminado.' });
  } catch (error: any) {
    logError(req, 'calidad', 'calidad.documentos.delete.error', 'Error al eliminar documento', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /documentos/:id/versiones (upload) ───────────────────────────────────
app.post('/api/v1/calidad/documentos/:id/versiones',
  requireRoles('calidad', 'admin'),
  upload.single('archivo'),
  async (req: Request, res: Response) => {
    const tmpFile = req.file?.path;
    try {
      const { tenantId, userId } = req.securityContext;
      const { id } = req.params;
      const { numero_version, cambios } = req.body;

      if (!numero_version || !cambios) {
        if (tmpFile) fs.unlinkSync(tmpFile);
        return res.status(400).json({ success: false, message: 'Campos requeridos: numero_version, cambios' });
      }

      const data = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const doc = await prisma.documento.findFirst({ where: { id_documento: id, tenant_id: tenantId } });
        if (!doc) return { notFound: true };

        const enRevision = await prisma.versionDocumento.findFirst({
          where: { documento_id: id, tenant_id: tenantId, estado: 'EN_REVISION' },
        });
        if (enRevision) return { enRevision: true };

        const existe = await prisma.versionDocumento.findFirst({
          where: { documento_id: id, numero_version },
        });
        if (existe) return { duplicado: true };

        // Crear registro primero para obtener el id_version
        const version = await prisma.versionDocumento.create({
          data: {
            tenant_id:     tenantId,
            documento_id:  id,
            numero_version,
            cambios,
            creado_por:    userId,
          },
        });

        // Mover archivo al destino final si viene adjunto
        let archivoRuta: string | null = null;
        if (req.file) {
          const ext = path.extname(req.file.originalname).toLowerCase();
          const ruta = archivoRutaFinal(tenantId, id, version.id_version, ext);
          const destino = archivoAbsoluto(ruta);
          ensureDir(path.dirname(destino));
          fs.renameSync(req.file.path, destino);
          archivoRuta = ruta;

          await prisma.versionDocumento.update({
            where: { id_version: version.id_version },
            data: {
              archivo_nombre: req.file.originalname,
              archivo_ruta:   ruta,
              archivo_mime:   req.file.mimetype,
              archivo_tamano: req.file.size,
            },
          });
        }

        // Actualizar version_actual del documento padre
        await prisma.documento.update({
          where: { id_documento: id },
          data:  { version_actual: numero_version },
        });

        return { version: { ...version, archivo_ruta: archivoRuta } };
      });

      if ((data as any).notFound)   return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
      if ((data as any).enRevision) return res.status(409).json({ success: false, message: 'Ya existe una versión en revisión para este documento.' });
      if ((data as any).duplicado)  return res.status(409).json({ success: false, message: `Ya existe la versión ${numero_version} para este documento.` });

      logInfo(req, 'calidad', 'calidad.version.creada', `Versión ${numero_version} creada para documento ${id}`);
      res.status(201).json({ success: true, data: (data as any).version });
    } catch (error: any) {
      if (tmpFile) { try { fs.unlinkSync(tmpFile); } catch (_) { /* ok */ } }
      logError(req, 'calidad', 'calidad.versiones.create.error', 'Error al crear versión', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── PATCH /documentos/:id/versiones/:vid/estado ───────────────────────────────
app.patch('/api/v1/calidad/documentos/:id/versiones/:vid/estado',
  requireRoles('calidad', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { id, vid } = req.params;
      const { accion } = req.body;

      if (!accion || !ACCIONES_VERSION.includes(accion)) {
        return res.status(400).json({ success: false, message: `Acción inválida. Valores: ${ACCIONES_VERSION.join(', ')}` });
      }

      const resultado = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        const version = await prisma.versionDocumento.findFirst({
          where: { id_version: vid, tenant_id: tenantId, documento_id: id },
        });
        if (!version) return { notFound: true };

        const siguienteEstado = TRANSICIONES[version.estado]?.[accion];
        if (!siguienteEstado) {
          return {
            transicionInvalida: true,
            estadoActual: version.estado,
            transicionesValidas: Object.keys(TRANSICIONES[version.estado] || {}),
          };
        }

        // Validación especial: no enviar a revisión sin archivo
        if (accion === 'enviar_revision' && !version.archivo_ruta) {
          return { sinArchivo: true };
        }

        // Aprobación atómica
        if (accion === 'aprobar') {
          // Marcar versiones VIGENTE anteriores como OBSOLETO
          await prisma.versionDocumento.updateMany({
            where: { documento_id: id, tenant_id: tenantId, estado: 'VIGENTE' },
            data:  { estado: 'OBSOLETO', fecha_obsoleto: new Date() },
          });
          const updated = await prisma.versionDocumento.update({
            where: { id_version: vid },
            data:  { estado: 'VIGENTE', aprobado_por: userId, fecha_emision: new Date() },
          });
          await prisma.documento.update({
            where: { id_documento: id },
            data:  { estado_actual: 'VIGENTE', version_actual: version.numero_version },
          });
          return { version: updated };
        }

        // Rechazo
        if (accion === 'rechazar') {
          const updated = await prisma.versionDocumento.update({
            where: { id_version: vid },
            data:  { estado: 'BORRADOR', revisado_por: null },
          });
          return { version: updated };
        }

        // Enviar a revisión
        if (accion === 'enviar_revision') {
          const updated = await prisma.versionDocumento.update({
            where: { id_version: vid },
            data:  { estado: 'EN_REVISION', revisado_por: userId },
          });
          await prisma.documento.update({
            where: { id_documento: id },
            data:  { estado_actual: 'EN_REVISION' },
          });
          return { version: updated };
        }

        // Obsolescencia manual
        if (accion === 'obsoleto') {
          const updated = await prisma.versionDocumento.update({
            where: { id_version: vid },
            data:  { estado: 'OBSOLETO', fecha_obsoleto: new Date() },
          });
          // Si era la versión actual vigente, actualizar estado del doc
          const doc = await prisma.documento.findFirst({ where: { id_documento: id } });
          if (doc?.version_actual === version.numero_version) {
            await prisma.documento.update({
              where: { id_documento: id },
              data:  { estado_actual: 'OBSOLETO' },
            });
          }
          return { version: updated };
        }

        return { notFound: true };
      });

      if ((resultado as any).notFound)          return res.status(404).json({ success: false, message: 'Versión no encontrada.' });
      if ((resultado as any).transicionInvalida) return res.status(400).json({
        success: false,
        message: `Transición inválida. Estado actual: ${(resultado as any).estadoActual}. Acciones válidas: ${(resultado as any).transicionesValidas.join(', ') || 'ninguna'}.`,
      });
      if ((resultado as any).sinArchivo)         return res.status(422).json({ success: false, message: 'La versión debe tener un archivo adjunto antes de enviarse a revisión.' });

      logInfo(req, 'calidad', 'calidad.version.estado', `Versión ${vid} → accion=${accion}`);
      res.json({ success: true, data: (resultado as any).version });
    } catch (error: any) {
      logError(req, 'calidad', 'calidad.versiones.estado.error', 'Error al cambiar estado', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── GET /documentos/:id/versiones/:vid/archivo ────────────────────────────────
app.get('/api/v1/calidad/documentos/:id/versiones/:vid/archivo',
  requireRoles('calidad', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, userId } = req.securityContext;
      const { id, vid } = req.params;

      const version = await createCalidadContext({ tenantId, userId }, async (prisma) => {
        return prisma.versionDocumento.findFirst({
          where: { id_version: vid, tenant_id: tenantId, documento_id: id },
        });
      });

      if (!version) return res.status(404).json({ success: false, message: 'Versión no encontrada.' });
      if (!version.archivo_ruta) return res.status(404).json({ success: false, message: 'Esta versión no tiene archivo adjunto.' });

      const rutaAbsoluta = archivoAbsoluto(version.archivo_ruta);
      if (!fs.existsSync(rutaAbsoluta)) {
        return res.status(500).json({ success: false, message: 'El archivo no está disponible en el servidor.' });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${version.archivo_nombre ?? 'documento'}"`);
      if (version.archivo_mime)   res.setHeader('Content-Type', version.archivo_mime);
      if (version.archivo_tamano) res.setHeader('Content-Length', version.archivo_tamano);

      res.sendFile(rutaAbsoluta);
    } catch (error: any) {
      logError(req, 'calidad', 'calidad.archivo.download.error', 'Error al descargar archivo', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Multer error handler ──────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'El archivo supera el límite de 50 MB.' });
  }
  if (err?.message?.startsWith('Tipo de archivo no permitido')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// ── Server ───────────────────────────────────────────────────────────────────
setupSentryExpressHandler(app);

export async function startServer() {
  return app.listen(PORT, () => {
    console.log(`[calidad] Módulo Calidad escuchando en puerto ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[calidad] Error fatal al iniciar:', err);
  disconnectDb().finally(() => process.exit(1));
});

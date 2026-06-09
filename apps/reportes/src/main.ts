// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Módulo: Reportes — Generación de documentos PDF y Excel
// Puerto: 3010
// -----------------------------------------------------------------------------

import express, { Request, Response } from 'express';
import { createAuthMiddleware, requireEnv, requireRoles } from '../../../packages/auth-middleware/src';
import { createObservabilityMiddleware, initSentry, logError, setupSentryExpressHandler } from '../../../packages/observability/src';
import { generateOcPdf } from './generators/oc-pdf';
import { generateComparativaPdf } from './generators/comparativa-pdf';
import { generatePrenominaPdf } from './generators/prenomina-pdf';
import { generatePrenominaExcel } from './generators/prenomina-excel';
import { generatePresupuestoExcel } from './generators/presupuesto-excel';

const PORT       = process.env.PORT       || 3010;
const JWT_SECRET = requireEnv('JWT_SECRET');
initSentry(process.env.SENTRY_DSN || '', 'reportes');

export const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(createObservabilityMiddleware('reportes'));
app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'reportes', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── POST /oc-pdf ──────────────────────────────────────────────────────────────
app.post('/api/v1/reportes/oc-pdf',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { oc } = req.body;
      if (!oc) return res.status(400).json({ success: false, message: 'Se requiere el objeto oc en el body.' });

      const doc = generateOcPdf(oc);
      const filename = `OC-${oc.numero ?? 'reporte'}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);
      doc.end();
    } catch (error: any) {
      logError(req, 'reportes', 'reportes.oc-pdf.error', 'Error generando OC PDF', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── POST /comparativa-pdf ─────────────────────────────────────────────────────
app.post('/api/v1/reportes/comparativa-pdf',
  requireRoles('procurement', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { comparativa } = req.body;
      if (!comparativa) return res.status(400).json({ success: false, message: 'Se requiere el objeto comparativa en el body.' });

      const doc = generateComparativaPdf(comparativa);
      const filename = `Comparativa-${(comparativa.titulo ?? 'reporte').replace(/\s+/g, '-')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);
      doc.end();
    } catch (error: any) {
      logError(req, 'reportes', 'reportes.comparativa-pdf.error', 'Error generando Comparativa PDF', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── POST /prenomina-pdf ───────────────────────────────────────────────────────
app.post('/api/v1/reportes/prenomina-pdf',
  requireRoles('personal_rh', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { prenomina } = req.body;
      if (!prenomina) return res.status(400).json({ success: false, message: 'Se requiere el objeto prenomina en el body.' });

      const doc = generatePrenominaPdf(prenomina);
      const filename = `Prenomina-${(prenomina.periodo ?? 'reporte').replace(/\s+/g, '-')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);
      doc.end();
    } catch (error: any) {
      logError(req, 'reportes', 'reportes.prenomina-pdf.error', 'Error generando Prenomina PDF', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── POST /prenomina-excel ─────────────────────────────────────────────────────
app.post('/api/v1/reportes/prenomina-excel',
  requireRoles('personal_rh', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { prenomina } = req.body;
      if (!prenomina) return res.status(400).json({ success: false, message: 'Se requiere el objeto prenomina en el body.' });

      const filename = `Prenomina-${(prenomina.periodo ?? 'reporte').replace(/\s+/g, '-')}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await generatePrenominaExcel(prenomina, res);
    } catch (error: any) {
      logError(req, 'reportes', 'reportes.prenomina-excel.error', 'Error generando Prenomina Excel', { error_message: error.message });
      if (!res.headersSent) res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── POST /presupuesto-excel ───────────────────────────────────────────────────
app.post('/api/v1/reportes/presupuesto-excel',
  requireRoles('gerencia_tecnica', 'admin', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { presupuesto } = req.body;
      if (!presupuesto) return res.status(400).json({ success: false, message: 'Se requiere el objeto presupuesto en el body.' });

      const version = presupuesto.version ?? 'v1';
      const filename = `Presupuesto-${String(version).replace(/\s+/g, '-')}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await generatePresupuestoExcel(presupuesto, res);
    } catch (error: any) {
      logError(req, 'reportes', 'reportes.presupuesto-excel.error', 'Error generando Presupuesto Excel', { error_message: error.message });
      if (!res.headersSent) res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ── Server ────────────────────────────────────────────────────────────────────
setupSentryExpressHandler(app);

export async function startServer() {
  return app.listen(PORT, () => {
    console.log(`[reportes] Módulo Reportes escuchando en puerto ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[reportes] Error fatal al iniciar:', err);
  process.exit(1);
});

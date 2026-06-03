// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Módulo: Asistente IA — extracción de cotizaciones, resumen ejecutivo y alertas
// Puerto: 3011
// -----------------------------------------------------------------------------

import 'dotenv/config';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createAuthMiddleware, requireEnv } from '../../../packages/auth-middleware/src';
import { createObservabilityMiddleware } from '../../../packages/observability/src';
import leerCotizacionRouter from './routes/leer-cotizacion';
import resumenEjecutivoRouter from './routes/resumen-ejecutivo';
import alertasPredictivas from './routes/alertas-predictivas';

const PORT       = process.env.PORT       || 3011;
const JWT_SECRET = requireEnv('JWT_SECRET');
requireEnv('ANTHROPIC_API_KEY');

export const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(createObservabilityMiddleware('asistente'));
app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));

// Rate limit: 10 requests por tenant por 15 minutos
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    const sc = (req as Request & { securityContext?: { tenantId?: string } }).securityContext;
    return sc?.tenantId ?? req.ip ?? 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Límite de solicitudes de IA alcanzado. Espera 15 minutos.' },
});

app.use('/api/v1/asistente/leer-cotizacion',    aiRateLimit);
app.use('/api/v1/asistente/resumen-ejecutivo',  aiRateLimit);
app.use('/api/v1/asistente/alertas-predictivas', aiRateLimit);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'asistente', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(leerCotizacionRouter);
app.use(resumenEjecutivoRouter);
app.use(alertasPredictivas);

// ── Server ────────────────────────────────────────────────────────────────────
export async function startServer() {
  return app.listen(PORT, () => {
    console.log(`[asistente] Módulo Asistente IA escuchando en puerto ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[asistente] Error fatal al iniciar:', err);
  process.exit(1);
});

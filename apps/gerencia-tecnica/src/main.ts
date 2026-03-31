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
import { createTenantContext, disconnectDb } from './db';
import { initEventBus, closeEventBus } from './event-bus';
import {
  createApiResponse,
  createApiError,
} from './types';

// ─── Importar middleware JWT compartido ──────────────────────────────────────
// En desarrollo local sin el paquete compilado, se puede usar el path relativo.
// En producción, se importaría desde '@bocam/auth-middleware'.
import { createAuthMiddleware, requireEnv, requireProjectAccess } from '../../../packages/auth-middleware/src';
import type { SecurityContext } from '../../../packages/auth-middleware/src';

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
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(createApiResponse(presupuestos, tenantId, proyectoId));
  } catch (error: any) {
    console.error('[Gerencia Técnica] Error en GET /presupuestos:', error.message);
    res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Error al obtener presupuestos.', error.message)
    );
  }
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
    console.log(`   GET /api/v1/gerencia-tecnica/insumos`);
    console.log(`   GET /api/v1/gerencia-tecnica/presupuestos`);
    console.log(`   GET /health (sin auth)`);
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

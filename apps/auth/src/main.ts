/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificacion: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Modulo: Auth (IAM - Identity & Access Management)
 * Puerto: 3003
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { createTenantContext, disconnectDb, runAsSystem } from './db';
import { createAuthMiddleware, requireEnv } from '../../../packages/auth-middleware/src';
import { initSentry, setupSentryExpressHandler } from '../../../packages/observability/src';
import { normalizeEmail, resolveActiveProjectId, resolveRefreshExpiry } from './login-policy';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// .trim() en secrets: docker-compose .env parser puede colar trailing \n en valores,
// rompiendo comparaciones strict-equal con headers entrantes. Ver ESTADO.md "Bloqueador 1".
const JWT_SECRET = requireEnv('JWT_SECRET').trim();
const MASTER_SECRET = (process.env.MASTER_SECRET || '').trim();
const JWT_ACCESS_EXPIRATION = (process.env.JWT_ACCESS_EXPIRATION || '15m').trim();
const JWT_REFRESH_EXPIRATION = (process.env.JWT_REFRESH_EXPIRATION || '7d').trim();
const BCRYPT_ROUNDS = 12;
const PORT = process.env.PORT || 3003;
initSentry(process.env.SENTRY_DSN || '', 'auth');

// ─── Redis + Rate Limiters ───────────────────────────────────────────────────

// Solo conectar Redis si REDIS_URL está explícitamente configurado.
// Sin REDIS_URL los limiters usan MemoryStore sin intentar ninguna conexión.
const REDIS_URL = process.env.REDIS_URL?.trim();
const redisClient = REDIS_URL
  ? createClient({
      url: REDIS_URL,
      socket: {
        // Máximo 3 reintentos con 500ms entre ellos — nunca bloquea el arranque
        reconnectStrategy: (retries) => (retries >= 3 ? false : 500),
      },
    })
  : null;

if (redisClient) {
  redisClient.on('error', (err) => console.error('[Auth] Redis rate-limit error:', err.message));
}

const rateLimitHandler = (_req: Request, res: Response) =>
  void res.status(429).json({
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.', retry_after_seconds: 900 },
  });

const RL_WINDOW = 15 * 60 * 1000;

// Cada llamada crea su propio closure con su propio store — evita ERR_ERL_STORE_REUSE.
// El store se instancia en la primera request, cuando Redis ya está conectado (o no).
function makeLimiter(max: number): express.RequestHandler {
  let limiter: express.RequestHandler | null = null;
  return (req, res, next) => {
    if (!limiter) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const store = redisClient?.isReady ? new RedisStore({ sendCommand: (...args: string[]) => redisClient!.sendCommand(args) }) as any : undefined;
      limiter = rateLimit({ windowMs: RL_WINDOW, max, standardHeaders: true, legacyHeaders: false, store, handler: rateLimitHandler });
    }
    limiter(req, res, next);
  };
}

const masterWriteLimiter  = makeLimiter(5);
const masterReadLimiter   = makeLimiter(30);
const masterModifyLimiter = makeLimiter(10);
const loginLimiter        = makeLimiter(10);
const refreshLimiter      = makeLimiter(20);

// ─── Audit Log Helper (best-effort — nunca bloquea el flujo) ────────────────

async function logMasterAction(opts: {
  accion: string;
  entity_id?: string | null;
  ip?: string;
  user_agent?: string;
  payload?: object;
  status_code: number;
  error_msg?: string;
}) {
  try {
    await runAsSystem(async (prisma) =>
      prisma.masterAuditLog.create({
        data: {
          accion:       opts.accion,
          entity_type:  'tenant',
          entity_id:    opts.entity_id ?? null,
          ip_address:   (opts.ip ?? '').slice(0, 50) || null,
          user_agent:   (opts.user_agent ?? '').slice(0, 500) || null,
          payload:      (opts.payload as object) ?? null,
          status_code:  opts.status_code,
          error_msg:    opts.error_msg ?? null,
        },
      })
    );
  } catch (_) { /* best-effort */ }
}

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludeByPrefix: true,
  excludePaths: [
    '/health',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/api/v1/master',
  ],
}));

type AuthUser = {
  id_usuario: string;
  tenant_id: string;
  email: string;
  nombre: string;
  rol_global: string[];
  limite_aprobacion_financiera: unknown;
  proyectos_acceso: { proyecto_id: string; rol_proyecto: string | null }[];
};

function generateTokenPair(user: AuthUser, activeProyectoId?: string) {
  const projectIds = user.proyectos_acceso.map((p) => p.proyecto_id);

  const accessPayload = {
    sub: user.id_usuario,
    tenant_id: user.tenant_id,
    proyecto_id: activeProyectoId || projectIds[0] || '',
    email: user.email,
    name: user.nombre,
    roles: user.rol_global,
    projects: projectIds,
    limite_aprobacion: Number(user.limite_aprobacion_financiera) || 0,
  };

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = uuidv4();
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  return { accessToken, refreshToken, refreshTokenHash };
}

app.post('/api/v1/auth/login', loginLimiter as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { email, password, tenant_id, proyecto_id } = req.body;
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
    const normalizedTenantId = typeof tenant_id === 'string' ? tenant_id.trim() : '';
    const requestedProjectId = typeof proyecto_id === 'string' ? proyecto_id.trim() : '';

    if (!normalizedEmail || !password || !normalizedTenantId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_FIELDS',
          message: 'Los campos email, password y tenant_id son obligatorios.',
        },
      });
      return;
    }

    const user = await createTenantContext(
      { tenantId: normalizedTenantId },
      async (prisma) => prisma.user.findUnique({
        where: {
          tenant_id_email: { tenant_id: normalizedTenantId, email: normalizedEmail },
        },
        include: {
          tenant: true,
          proyectos_acceso: {
            include: { proyecto: true },
          },
        },
      })
    );

    if (!user || !user.activo) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Credenciales invalidas. Verifica tu correo y contrasena.',
        },
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Credenciales invalidas. Verifica tu correo y contrasena.',
        },
      });
      return;
    }

    if (!user.tenant.activo) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_TENANT_INACTIVE',
          message: 'Tu organizacion se encuentra desactivada. Contacta al administrador.',
        },
      });
      return;
    }

    const activeProjectId = resolveActiveProjectId(user, requestedProjectId);
    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user, activeProjectId);

    const refreshExpiry = resolveRefreshExpiry(JWT_REFRESH_EXPIRATION);

    await createTenantContext(
      { tenantId: normalizedTenantId, userId: user.id_usuario },
      async (prisma) => {
        await prisma.refreshToken.create({
          data: {
            user_id: user.id_usuario,
            token_hash: refreshTokenHash,
            expires_at: refreshExpiry,
            user_agent: req.headers['user-agent'] || 'unknown',
            ip_address: req.ip || 'unknown',
          },
        });
      }
    );

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: JWT_ACCESS_EXPIRATION,
        user: {
          id: user.id_usuario,
          email: user.email,
          name: user.nombre,
          roles: user.rol_global,
          tenant: {
            id: user.tenant.id_tenant,
            name: user.tenant.nombre,
            logo_url: user.tenant.logo_url,
            primary_color: user.tenant.primary_color,
          },
          projects: user.proyectos_acceso.map((pa) => ({
            id: pa.proyecto_id,
            name: pa.proyecto.nombre_oficial,
            code: pa.proyecto.codigo_centro_costos,
            role: pa.rol_proyecto,
          })),
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        module: 'auth',
      },
    });
  } catch (error: any) {
    if (error.message === 'AUTH_PROJECT_FORBIDDEN') {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_PROJECT_FORBIDDEN',
          message: 'No tienes acceso al proyecto solicitado para iniciar sesion.',
        },
      });
      return;
    }

    console.error('[Auth] Error en login:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor.',
      },
    });
  }
});

app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, tenant_id, roles, proyecto_ids } = req.body;
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
    const normalizedTenantId = typeof tenant_id === 'string' ? tenant_id.trim() : '';

    if (!normalizedEmail || !password || !nombre || !normalizedTenantId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_FIELDS',
          message: 'Los campos email, password, nombre y tenant_id son obligatorios.',
        },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await createTenantContext(
      { tenantId: normalizedTenantId },
      async (prisma) => {
        const tenant = await prisma.tenant.findUnique({
          where: { id_tenant: normalizedTenantId },
        });

        if (!tenant || !tenant.activo) {
          throw new Error('AUTH_TENANT_NOT_FOUND');
        }

        const existingUser = await prisma.user.findUnique({
          where: { tenant_id_email: { tenant_id: normalizedTenantId, email: normalizedEmail } },
        });

        if (existingUser) {
          throw new Error('AUTH_EMAIL_EXISTS');
        }

        return prisma.user.create({
          data: {
            tenant_id: normalizedTenantId,
            email: normalizedEmail,
            password_hash: passwordHash,
            nombre,
            rol_global: roles || ['resident'],
            proyectos_acceso: Array.isArray(proyecto_ids) && proyecto_ids.length > 0
              ? {
                  create: proyecto_ids.map((pid: string) => ({ proyecto_id: pid })),
                }
              : undefined,
          },
          include: {
            proyectos_acceso: {
              include: { proyecto: true },
            },
          },
        });
      }
    );

    res.status(201).json({
      success: true,
      data: {
        id: user.id_usuario,
        email: user.email,
        name: user.nombre,
        roles: user.rol_global,
        projects: user.proyectos_acceso.map((pa) => ({
          id: pa.proyecto_id,
          name: pa.proyecto.nombre_oficial,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        module: 'auth',
      },
    });
  } catch (error: any) {
    if (error.message === 'AUTH_TENANT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          code: 'AUTH_TENANT_NOT_FOUND',
          message: 'El tenant especificado no existe o esta desactivado.',
        },
      });
      return;
    }

    if (error.message === 'AUTH_EMAIL_EXISTS') {
      res.status(409).json({
        success: false,
        error: {
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Ya existe un usuario con este correo en la organizacion.',
        },
      });
      return;
    }

    console.error('[Auth] Error en register:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor.',
      },
    });
  }
});

app.post('/api/v1/auth/refresh', refreshLimiter as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_REFRESH_TOKEN',
          message: 'El refresh_token es obligatorio.',
        },
      });
      return;
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(refresh_token)
      .digest('hex');

    const tokenLocator = await runAsSystem((prisma) => prisma.refreshToken.findFirst({
      where: {
        token_hash: tokenHash,
        revoked: false,
        expires_at: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id_usuario: true,
            tenant_id: true,
            activo: true,
          },
        },
      },
    }));

    if (!tokenLocator || !tokenLocator.user.activo) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REFRESH_INVALID',
          message: 'Refresh token invalido o expirado. Inicia sesion nuevamente.',
        },
      });
      return;
    }

    const tokenRotation = await createTenantContext(
      { tenantId: tokenLocator.user.tenant_id, userId: tokenLocator.user_id },
      async (prisma) => {
        const storedToken = await prisma.refreshToken.findFirst({
          where: {
            token_hash: tokenHash,
            revoked: false,
            expires_at: { gt: new Date() },
          },
          include: {
            user: {
              include: {
                tenant: true,
                proyectos_acceso: {
                  include: { proyecto: true },
                },
              },
            },
          },
        });

        if (!storedToken || !storedToken.user.activo) {
          return null;
        }

        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revoked: true },
        });

        const {
          accessToken,
          refreshToken: newRefreshToken,
          refreshTokenHash,
        } = generateTokenPair(storedToken.user);

        const refreshExpiry = resolveRefreshExpiry(JWT_REFRESH_EXPIRATION);

        await prisma.refreshToken.create({
          data: {
            user_id: storedToken.user_id,
            token_hash: refreshTokenHash,
            expires_at: refreshExpiry,
            user_agent: req.headers['user-agent'] || 'unknown',
            ip_address: req.ip || 'unknown',
          },
        });

        return {
          accessToken,
          refreshToken: newRefreshToken,
        };
      }
    );

    if (!tokenRotation) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REFRESH_INVALID',
          message: 'Refresh token invalido o expirado. Inicia sesion nuevamente.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        access_token: tokenRotation.accessToken,
        refresh_token: tokenRotation.refreshToken,
        token_type: 'Bearer',
        expires_in: JWT_ACCESS_EXPIRATION,
      },
      meta: {
        timestamp: new Date().toISOString(),
        module: 'auth',
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error en refresh:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor.',
      },
    });
  }
});

app.get('/api/v1/auth/me', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.securityContext;

    const user = await createTenantContext(
      { tenantId, userId },
      async (prisma) => prisma.user.findUnique({
        where: { id_usuario: userId },
        include: {
          tenant: true,
          proyectos_acceso: {
            include: { proyecto: true },
          },
        },
      })
    );

    if (!user || !user.activo) {
      res.status(404).json({
        success: false,
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'Usuario no encontrado o desactivado.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id_usuario,
        email: user.email,
        name: user.nombre,
        roles: user.rol_global,
        limite_aprobacion: Number(user.limite_aprobacion_financiera),
        tenant: {
          id: user.tenant.id_tenant,
          name: user.tenant.nombre,
          logo_url: user.tenant.logo_url,
          primary_color: user.tenant.primary_color,
          plan: user.tenant.plan,
        },
        projects: user.proyectos_acceso.map((pa) => ({
          id: pa.proyecto_id,
          name: pa.proyecto.nombre_oficial,
          code: pa.proyecto.codigo_centro_costos,
          status: pa.proyecto.estatus,
          role: pa.rol_proyecto,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        module: 'auth',
      },
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Tu sesion ha expirado.',
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token invalido.',
      },
    });
  }
});

app.post('/api/v1/auth/switch-project', async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.securityContext;
    const { proyecto_id } = req.body;

    if (!proyecto_id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_PROJECT',
          message: 'El campo proyecto_id es obligatorio.',
        },
      });
      return;
    }

    const user = await createTenantContext(
      { tenantId, userId },
      async (prisma) => prisma.user.findUnique({
        where: { id_usuario: userId },
        include: {
          proyectos_acceso: {
            include: { proyecto: true },
          },
        },
      })
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'Usuario no encontrado.',
        },
      });
      return;
    }

    const hasAccess = user.proyectos_acceso.some((pa) => pa.proyecto_id === proyecto_id);
    const isGlobalRole = user.rol_global.some((r) =>
      ['admin', 'superintendent', 'finance', 'procurement'].includes(r)
    );

    if (!hasAccess && !isGlobalRole) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_PROJECT_FORBIDDEN',
          message: 'No tienes acceso al proyecto solicitado.',
        },
      });
      return;
    }

    const { accessToken } = generateTokenPair(user, proyecto_id);

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        proyecto_id,
      },
      meta: {
        timestamp: new Date().toISOString(),
        module: 'auth',
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error en switch-project:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor.',
      },
    });
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'auth', timestamp: new Date().toISOString() });
});



// ─── Admin Middleware (requiere rol 'admin' en el tenant) ────────────────────
function requireAdminRole(req: Request, res: Response, next: () => void): void {
  const roles: string[] = req.securityContext?.roles ?? [];
  if (!roles.includes('admin')) {
    res.status(403).json({ success: false, error: { code: 'ADMIN_FORBIDDEN', message: 'Se requiere rol de administrador.' } });
    return;
  }
  next();
}

// ─── GET /api/v1/auth/admin/users ────────────────────────────────────────────
app.get('/api/v1/auth/admin/users', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const users = await createTenantContext({ tenantId }, async (prisma) =>
      prisma.user.findMany({
        where: { tenant_id: tenantId },
        include: { proyectos_acceso: { include: { proyecto: true } } },
        orderBy: { created_at: 'asc' },
      })
    );
    res.json({ success: true, data: users.map(u => ({
      id: u.id_usuario, email: u.email, nombre: u.nombre,
      roles: u.rol_global, activo: u.activo,
      limite_aprobacion: Number(u.limite_aprobacion_financiera),
      proyectos: u.proyectos_acceso.map(pa => ({ id: pa.proyecto_id, nombre: pa.proyecto.nombre_oficial, codigo: pa.proyecto.codigo_centro_costos })),
      created_at: u.created_at,
    })) });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── POST /api/v1/auth/admin/users ───────────────────────────────────────────
app.post('/api/v1/auth/admin/users', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const { email, password, nombre, roles: userRoles, proyecto_ids, limite_aprobacion } = req.body;
    if (!email || !password || !nombre) {
      res.status(400).json({ success: false, error: { code: 'ADMIN_MISSING_FIELDS', message: 'email, password y nombre son obligatorios.' } });
      return;
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await createTenantContext({ tenantId }, async (prisma) =>
      prisma.user.create({
        data: {
          tenant_id: tenantId, email, password_hash: passwordHash, nombre,
          rol_global: Array.isArray(userRoles) ? userRoles : ['resident'],
          limite_aprobacion_financiera: limite_aprobacion || 0,
          proyectos_acceso: Array.isArray(proyecto_ids) && proyecto_ids.length > 0
            ? { create: proyecto_ids.map((pid: string) => ({ proyecto_id: pid })) }
            : undefined,
        },
      })
    );
    res.status(201).json({ success: true, data: { id: user.id_usuario, email: user.email, nombre: user.nombre, roles: user.rol_global } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── PATCH /api/v1/auth/admin/users/:id ──────────────────────────────────────
app.patch('/api/v1/auth/admin/users/:id', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const { id } = req.params;
    const { nombre, roles: userRoles, activo, limite_aprobacion, password, proyecto_ids } = req.body;
    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (userRoles !== undefined) updateData.rol_global = userRoles;
    if (activo !== undefined) updateData.activo = activo;
    if (limite_aprobacion !== undefined) updateData.limite_aprobacion_financiera = limite_aprobacion;
    if (password) updateData.password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await createTenantContext({ tenantId }, async (prisma) => {
      const updated = await prisma.user.update({ where: { id_usuario: id }, data: updateData });

      // Sincronizar asignaciones de proyectos si se envió proyecto_ids
      if (Array.isArray(proyecto_ids)) {
        // Eliminar las asignaciones actuales y recrear con la lista nueva
        await prisma.userProjectAccess.deleteMany({ where: { user_id: id } });
        if (proyecto_ids.length > 0) {
          await prisma.userProjectAccess.createMany({
            data: proyecto_ids.map((pid: string) => ({ user_id: id, proyecto_id: pid })),
            skipDuplicates: true,
          });
        }
      }

      return updated;
    });
    res.json({ success: true, data: { id: user.id_usuario, email: user.email, nombre: user.nombre, roles: user.rol_global, activo: user.activo } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── GET /api/v1/auth/admin/proyectos ────────────────────────────────────────
app.get('/api/v1/auth/admin/proyectos', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const proyectos = await createTenantContext({ tenantId }, async (prisma) =>
      prisma.proyecto.findMany({ where: { tenant_id: tenantId }, orderBy: { created_at: 'asc' } })
    );
    res.json({ success: true, data: proyectos });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── POST /api/v1/auth/admin/proyectos ───────────────────────────────────────
app.post('/api/v1/auth/admin/proyectos', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const { codigo_centro_costos, nombre_oficial, tipo_contrato, moneda_base, estatus } = req.body;
    if (!codigo_centro_costos || !nombre_oficial) {
      res.status(400).json({ success: false, error: { code: 'ADMIN_MISSING_FIELDS', message: 'codigo_centro_costos y nombre_oficial son obligatorios.' } });
      return;
    }
    const proyecto = await createTenantContext({ tenantId }, async (prisma) => {
      // 1. Crear el proyecto
      const nuevo = await prisma.proyecto.create({
        data: {
          tenant_id: tenantId, codigo_centro_costos, nombre_oficial,
          tipo_contrato: tipo_contrato || 'PRECIOS_UNITARIOS',
          moneda_base: moneda_base || 'MXN',
          estatus: estatus || 'CONSTRUCCION',
        },
      });

      // 2. Auto-asignar todos los usuarios admin/superintendent del tenant
      //    para que el proyecto aparezca de inmediato en su selector de proyectos
      const admins = await prisma.user.findMany({
        where: { tenant_id: tenantId, activo: true },
        select: { id_usuario: true, rol_global: true },
      });
      const adminIds = admins
        .filter(u => (u.rol_global as string[]).some(r => ['admin', 'superintendent'].includes(r)))
        .map(u => u.id_usuario);

      if (adminIds.length > 0) {
        await prisma.userProjectAccess.createMany({
          data: adminIds.map(uid => ({ user_id: uid, proyecto_id: nuevo.id_proyecto })),
          skipDuplicates: true,
        });
      }

      return nuevo;
    });
    res.status(201).json({ success: true, data: proyecto });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── PATCH /api/v1/auth/admin/proyectos/:id ──────────────────────────────────
app.patch('/api/v1/auth/admin/proyectos/:id', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const { id } = req.params;
    const { nombre_oficial, tipo_contrato, moneda_base, estatus, activo } = req.body;
    const updateData: Record<string, unknown> = {};
    if (nombre_oficial !== undefined) updateData.nombre_oficial = nombre_oficial;
    if (tipo_contrato !== undefined) updateData.tipo_contrato = tipo_contrato;
    if (moneda_base !== undefined) updateData.moneda_base = moneda_base;
    if (estatus !== undefined) updateData.estatus = estatus;
    if (activo !== undefined) updateData.activo = activo;
    const proyecto = await createTenantContext({ tenantId }, async (prisma) =>
      prisma.proyecto.update({ where: { id_proyecto: id }, data: updateData })
    );
    res.json({ success: true, data: proyecto });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── Master Admin Middleware ──────────────────────────────────────────────────
function requireMasterSecret(req: Request, res: Response, next: () => void): void {
  const auth = req.headers.authorization || '';
  const secret = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!MASTER_SECRET || secret !== MASTER_SECRET) {
    void logMasterAction({ accion: 'UNAUTHORIZED_ATTEMPT', status_code: 401, ip: req.ip, user_agent: req.headers['user-agent'] });
    res.status(401).json({ success: false, error: { code: 'MASTER_UNAUTHORIZED', message: 'Clave maestra invalida.' } });
    return;
  }
  next();
}

// ─── GET /api/v1/master/tenants ───────────────────────────────────────────────
app.get('/api/v1/master/tenants',
  masterReadLimiter as express.RequestHandler,
  requireMasterSecret as express.RequestHandler,
  async (req: Request, res: Response) => {
    try {
      const tenants = await runAsSystem(async (prisma) =>
        prisma.tenant.findMany({ orderBy: { created_at: 'desc' } })
      );
      void logMasterAction({ accion: 'LIST_TENANTS', status_code: 200, ip: req.ip, user_agent: req.headers['user-agent'] });
      res.json({ success: true, data: tenants });
    } catch (err) {
      void logMasterAction({ accion: 'LIST_TENANTS', status_code: 500, ip: req.ip, error_msg: String(err) });
      res.status(500).json({ success: false, error: { code: 'MASTER_ERROR', message: String(err) } });
    }
  }
);

// ─── POST /api/v1/master/tenants ─────────────────────────────────────────────
app.post('/api/v1/master/tenants',
  masterWriteLimiter as express.RequestHandler,
  requireMasterSecret as express.RequestHandler,
  async (req: Request, res: Response) => {
    const { nombre, rfc, plan, primary_color, logo_url } = req.body;
    if (!nombre) {
      void logMasterAction({ accion: 'CREATE_TENANT', status_code: 400, ip: req.ip, error_msg: 'nombre requerido' });
      res.status(400).json({ success: false, error: { code: 'MASTER_MISSING_FIELDS', message: 'El campo nombre es obligatorio.' } });
      return;
    }
    try {
      const tenant = await runAsSystem(async (prisma) =>
        prisma.tenant.create({
          data: { nombre, rfc: rfc || null, plan: plan || 'BASICO', primary_color: primary_color || null, logo_url: logo_url || null },
        })
      );
      void logMasterAction({ accion: 'CREATE_TENANT', entity_id: tenant.id_tenant, status_code: 201, ip: req.ip, user_agent: req.headers['user-agent'], payload: { nombre, rfc, plan } });
      res.status(201).json({ success: true, data: tenant });
    } catch (err) {
      void logMasterAction({ accion: 'CREATE_TENANT', status_code: 500, ip: req.ip, error_msg: String(err) });
      res.status(500).json({ success: false, error: { code: 'MASTER_ERROR', message: String(err) } });
    }
  }
);

// ─── PATCH /api/v1/master/tenants/:id ────────────────────────────────────────
app.patch('/api/v1/master/tenants/:id',
  masterModifyLimiter as express.RequestHandler,
  requireMasterSecret as express.RequestHandler,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, rfc, plan, primary_color, logo_url, activo } = req.body;
    try {
      const tenant = await runAsSystem(async (prisma) =>
        prisma.tenant.update({
          where: { id_tenant: id },
          data: {
            ...(nombre !== undefined && { nombre }),
            ...(rfc !== undefined && { rfc }),
            ...(plan !== undefined && { plan }),
            ...(primary_color !== undefined && { primary_color }),
            ...(logo_url !== undefined && { logo_url }),
            ...(activo !== undefined && { activo }),
          },
        })
      );
      const changedFields = { nombre, rfc, plan, activo };
      void logMasterAction({ accion: 'UPDATE_TENANT', entity_id: id, status_code: 200, ip: req.ip, user_agent: req.headers['user-agent'], payload: changedFields });
      res.json({ success: true, data: tenant });
    } catch (err) {
      void logMasterAction({ accion: 'UPDATE_TENANT', entity_id: id, status_code: 500, ip: req.ip, error_msg: String(err) });
      res.status(500).json({ success: false, error: { code: 'MASTER_ERROR', message: String(err) } });
    }
  }
);

// ─── DELETE /api/v1/master/tenants/:id (soft-delete) ─────────────────────────
app.delete('/api/v1/master/tenants/:id',
  masterWriteLimiter as express.RequestHandler,
  requireMasterSecret as express.RequestHandler,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await runAsSystem(async (prisma) =>
        prisma.tenant.update({ where: { id_tenant: id }, data: { activo: false } })
      );
      void logMasterAction({ accion: 'DELETE_TENANT', entity_id: id, status_code: 200, ip: req.ip, user_agent: req.headers['user-agent'] });
      res.json({ success: true, data: { message: 'Tenant desactivado.' } });
    } catch (err) {
      void logMasterAction({ accion: 'DELETE_TENANT', entity_id: id, status_code: 500, ip: req.ip, error_msg: String(err) });
      res.status(500).json({ success: false, error: { code: 'MASTER_ERROR', message: String(err) } });
    }
  }
);

// ─── GET /api/v1/master/audit-log ────────────────────────────────────────────
app.get('/api/v1/master/audit-log',
  masterReadLimiter as express.RequestHandler,
  requireMasterSecret as express.RequestHandler,
  async (req: Request, res: Response) => {
    try {
      const { desde, hasta, accion, entity_id } = req.query as Record<string, string | undefined>;
      const desdeDate = desde ? new Date(desde) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hastaDate = hasta ? new Date(hasta) : new Date();

      const logs = await runAsSystem(async (prisma) =>
        prisma.masterAuditLog.findMany({
          where: {
            created_at: { gte: desdeDate, lte: hastaDate },
            ...(accion && { accion }),
            ...(entity_id && { entity_id }),
          },
          orderBy: { created_at: 'desc' },
          take: 200,
        })
      );
      void logMasterAction({ accion: 'GET_AUDIT_LOG', status_code: 200, ip: req.ip, user_agent: req.headers['user-agent'] });
      res.json({ success: true, data: logs });
    } catch (err) {
      void logMasterAction({ accion: 'GET_AUDIT_LOG', status_code: 500, ip: req.ip, error_msg: String(err) });
      res.status(500).json({ success: false, error: { code: 'MASTER_ERROR', message: String(err) } });
    }
  }
);

setupSentryExpressHandler(app);

async function startServer() {
  if (redisClient) {
    try {
      await redisClient.connect();
      console.log('[Auth] Redis rate-limit store conectado.');
    } catch (err) {
      console.warn('[Auth] Redis no disponible — rate-limiters en MemoryStore (fallback).');
    }
  } else {
    console.log('[Auth] REDIS_URL no configurado — rate-limiters en MemoryStore.');
  }
  return app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log('  Modulo: AUTH (Identity & Access Management)');
  console.log('  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('----------------------------------------------------');
  console.log(`[Auth] Servidor en puerto ${PORT}`);
  console.log('[Auth] Rutas disponibles:');
  console.log('   POST /api/v1/auth/login');
  console.log('   POST /api/v1/auth/register');
  console.log('   POST /api/v1/auth/refresh');
  console.log('   GET  /api/v1/auth/me');
  console.log('   POST /api/v1/auth/switch-project');
  console.log('   GET  /health');
  console.log('   GET  /api/v1/master/tenants');
  console.log('   POST /api/v1/master/tenants');
  console.log('   PATCH /api/v1/master/tenants/:id');
  console.log('   DELETE /api/v1/master/tenants/:id');
  console.log('   GET  /api/v1/master/audit-log');
  });
}

const server = startServer();

process.on('SIGINT', () => {
  void server.then(s => s?.close(async () => { await disconnectDb(); process.exit(0); }));
});

process.on('SIGTERM', () => {
  void server.then(s => s?.close(async () => { await disconnectDb(); process.exit(0); }));
});

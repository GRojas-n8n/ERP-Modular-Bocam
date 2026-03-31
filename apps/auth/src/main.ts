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
import { createTenantContext, disconnectDb, runAsSystem } from './db';
import { createAuthMiddleware, requireEnv } from '../../../packages/auth-middleware/src';

const app = express();
app.use(express.json());

const JWT_SECRET = requireEnv('JWT_SECRET');
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
const BCRYPT_ROUNDS = 12;
const PORT = process.env.PORT || 3003;

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: [
    '/health',
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
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

app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, tenant_id, proyecto_id } = req.body;

    if (!email || !password || !tenant_id) {
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
      { tenantId: tenant_id },
      async (prisma) => prisma.user.findUnique({
        where: {
          tenant_id_email: { tenant_id, email },
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

    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(
      user,
      proyecto_id
    );

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await createTenantContext(
      { tenantId: tenant_id, userId: user.id_usuario },
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

    if (!email || !password || !nombre || !tenant_id) {
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
      { tenantId: tenant_id },
      async (prisma) => {
        const tenant = await prisma.tenant.findUnique({
          where: { id_tenant: tenant_id },
        });

        if (!tenant || !tenant.activo) {
          throw new Error('AUTH_TENANT_NOT_FOUND');
        }

        const existingUser = await prisma.user.findUnique({
          where: { tenant_id_email: { tenant_id, email } },
        });

        if (existingUser) {
          throw new Error('AUTH_EMAIL_EXISTS');
        }

        return prisma.user.create({
          data: {
            tenant_id,
            email,
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

app.post('/api/v1/auth/refresh', async (req: Request, res: Response) => {
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

        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);

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

const server = app.listen(PORT, () => {
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
});

async function shutdown(signal: string) {
  console.log(`[Auth] Senal ${signal} recibida. Apagando limpiamente...`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

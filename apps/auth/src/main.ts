/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Auth (IAM — Identity & Access Management)
 * Puerto: 3003
 *
 * Responsabilidades:
 * 1. Autenticación de usuarios (login con email/password).
 * 2. Emisión de tokens JWT (access + refresh).
 * 3. Renovación de sesiones (refresh token rotation).
 * 4. Provisión de identidad (/me) para el App Shell.
 * 5. Registro de nuevos usuarios dentro de un tenant existente.
 *
 * SEGURIDAD:
 * - Passwords hasheados con bcrypt (cost factor 12).
 * - Refresh tokens almacenados como HASH, nunca en texto plano.
 * - Access tokens de corta duración (15 min por defecto).
 * - Refresh tokens de larga duración (7 días) con rotación obligatoria.
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// ─── Configuración JWT ──────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'bocam_dev_secret_CAMBIAR_EN_PRODUCCION_2026';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
const BCRYPT_ROUNDS = 12;
const PORT = process.env.PORT || 3003;

// ─── Utilidades ─────────────────────────────────────────────────────────────

/**
 * Genera un par de tokens (access + refresh) para un usuario autenticado.
 */
function generateTokenPair(user: {
  id_usuario: string;
  tenant_id: string;
  email: string;
  nombre: string;
  rol_global: string[];
  limite_aprobacion_financiera: any;
  proyectos_acceso: { proyecto_id: string; rol_proyecto: string | null }[];
}, activeProyectoId?: string) {
  const projectIds = user.proyectos_acceso.map(p => p.proyecto_id);

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
    expiresIn: JWT_ACCESS_EXPIRATION as any,
  });

  const refreshToken = uuidv4();
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  return { accessToken, refreshToken, refreshTokenHash };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: POST /api/v1/auth/login
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, tenant_id, proyecto_id } = req.body;

    // Validación de campos obligatorios
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

    // Buscar usuario dentro del tenant
    const user = await prisma.user.findUnique({
      where: {
        tenant_id_email: { tenant_id, email },
      },
      include: {
        tenant: true,
        proyectos_acceso: {
          include: { proyecto: true },
        },
      },
    });

    if (!user || !user.activo) {
      // Respuesta genérica para no revelar si el email existe
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
        },
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
        },
      });
      return;
    }

    // Verificar que el tenant esté activo
    if (!user.tenant.activo) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_TENANT_INACTIVE',
          message: 'Tu organización se encuentra desactivada. Contacta al administrador.',
        },
      });
      return;
    }

    // Generar tokens
    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(
      user,
      proyecto_id
    );

    // Almacenar refresh token (hash) en BD
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id_usuario,
        token_hash: refreshTokenHash,
        expires_at: refreshExpiry,
        user_agent: req.headers['user-agent'] || 'unknown',
        ip_address: req.ip || 'unknown',
      },
    });

    // Respuesta exitosa
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
          projects: user.proyectos_acceso.map(pa => ({
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: POST /api/v1/auth/register
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id_tenant: tenant_id },
    });

    if (!tenant || !tenant.activo) {
      res.status(404).json({
        success: false,
        error: {
          code: 'AUTH_TENANT_NOT_FOUND',
          message: 'El tenant especificado no existe o está desactivado.',
        },
      });
      return;
    }

    // Verificar que no exista el email en este tenant
    const existingUser = await prisma.user.findUnique({
      where: { tenant_id_email: { tenant_id, email } },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Ya existe un usuario con este correo en la organización.',
        },
      });
      return;
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Crear usuario con acceso a proyectos
    const user = await prisma.user.create({
      data: {
        tenant_id,
        email,
        password_hash: passwordHash,
        nombre,
        rol_global: roles || ['resident'],
        proyectos_acceso: proyecto_ids ? {
          create: (proyecto_ids as string[]).map(pid => ({ proyecto_id: pid })),
        } : undefined,
      },
      include: {
        proyectos_acceso: {
          include: { proyecto: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id_usuario,
        email: user.email,
        name: user.nombre,
        roles: user.rol_global,
        projects: user.proyectos_acceso.map(pa => ({
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: POST /api/v1/auth/refresh
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    // Hashear el token recibido para comparar con el almacenado
    const tokenHash = crypto
      .createHash('sha256')
      .update(refresh_token)
      .digest('hex');

    // Buscar en BD
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

    if (!storedToken) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REFRESH_INVALID',
          message: 'Refresh token inválido o expirado. Inicia sesión nuevamente.',
        },
      });
      return;
    }

    // Revocar el token usado (Rotación — cada refresh token es de un solo uso)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generar nuevos tokens
    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash } =
      generateTokenPair(storedToken.user);

    // Almacenar nuevo refresh token
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

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: GET /api/v1/auth/me (Requiere Bearer Token)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/v1/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Token de autenticación requerido.',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id_usuario: decoded.sub },
      include: {
        tenant: true,
        proyectos_acceso: {
          include: { proyecto: true },
        },
      },
    });

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
        projects: user.proyectos_acceso.map(pa => ({
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
          message: 'Tu sesión ha expirado.',
        },
      });
      return;
    }
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token inválido.',
      },
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINT: POST /api/v1/auth/switch-project
// Permite cambiar el proyecto activo sin re-login (emite nuevo access token)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/v1/auth/switch-project', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'AUTH_TOKEN_MISSING', message: 'Token requerido.' },
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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

    // Verificar que el usuario tiene acceso al proyecto solicitado
    const user = await prisma.user.findUnique({
      where: { id_usuario: decoded.sub },
      include: {
        proyectos_acceso: {
          include: { proyecto: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'AUTH_USER_NOT_FOUND', message: 'Usuario no encontrado.' },
      });
      return;
    }

    const hasAccess = user.proyectos_acceso.some(
      pa => pa.proyecto_id === proyecto_id
    );

    // Los admins y superintendentes tienen acceso a todos los proyectos del tenant
    const isGlobalRole = user.rol_global.some(
      r => ['admin', 'superintendent', 'finance'].includes(r)
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

    // Generar nuevo access token con el proyecto activo actualizado
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
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor.' },
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'auth', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARRANQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔐  Módulo: AUTH (Identity & Access Management)');
  console.log('  🏢  Propiedad: Constructora Bocam, S. A. de C.V.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[Auth] ✅ Servidor en puerto ${PORT}`);
  console.log(`[Auth] 📡 Rutas disponibles:`);
  console.log(`   POST /api/v1/auth/login`);
  console.log(`   POST /api/v1/auth/register`);
  console.log(`   POST /api/v1/auth/refresh`);
  console.log(`   GET  /api/v1/auth/me`);
  console.log(`   POST /api/v1/auth/switch-project`);
  console.log(`   GET  /health`);
});

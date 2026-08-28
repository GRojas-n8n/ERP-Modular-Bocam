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
import { createAuthMiddleware, requireEnv, requireRoles } from '../../../packages/auth-middleware/src';
import { getCorrelationId, initSentry, setupSentryExpressHandler } from '../../../packages/observability/src';
import { createEventBus } from '../../../packages/event-bus/src';
import { normalizeEmail, resolveActiveProjectId, resolveRefreshExpiry } from './login-policy';
import { resolveAutoAssignedUserIds } from './project-access-policy';
import { sesionExcedeLimite } from './sesion-policy';
import { secretsMatch } from './master-secret-policy';
import { validarPasswordNueva } from './password-policy';
import {
  ensamblarCodigoCentroCostos,
  siguienteConsecutivo,
  validarEmpresaGrupo,
  validarEstatus,
} from './centro-costos-policy';
import { parseOrRespond } from './validation/parse-or-respond';
import { loginSchema } from './validation/schemas/login.schema';
import { registerSchema } from './validation/schemas/register.schema';
import { refreshSchema } from './validation/schemas/refresh.schema';
import { logoutSchema, cambiarPasswordSchema } from './validation/schemas/sesion.schema';
import { switchProjectSchema } from './validation/schemas/switch-project.schema';
import { crearUsuarioSchema, actualizarUsuarioSchema } from './validation/schemas/admin-users.schema';
import { crearProyectoSchema, actualizarProyectoSchema } from './validation/schemas/admin-proyectos.schema';
import { crearTenantSchema, actualizarTenantSchema } from './validation/schemas/master-tenants.schema';

const TIPOS_ESPECIALES = ['OFICINA', 'TALLER', 'ALMACÉN'] as const;
const ROLES_ALTA_CENTRO_COSTOS = ['admin', 'gerencia_tecnica', 'control_proyectos'];

export const eventBus = createEventBus(process.env.AUTH_EVENT_BUS_NAME || 'auth');

interface CentroCostosCreadoPayload {
  proyecto_id: string;
  codigo_centro_costos: string;
  empresa_grupo: string | null;
  anio_centro_costos: number | null;
  cliente_id: string | null;
  es_especial: boolean;
  estatus: string;
  nombre_oficial: string;
  fecha_creacion: string;
}

async function publishCentroCostosCreado(
  context: { tenant_id: string; proyecto_id: string; user_id: string; correlation_id?: string },
  payload: CentroCostosCreadoPayload
) {
  await eventBus.publish({
    event_type: 'auth.centro_costos_creado',
    timestamp: new Date().toISOString(),
    context,
    payload,
  });
}

// Acepta 'YYYY-MM-DD' (formato del input <input type="date">) o un ISO
// datetime completo; Prisma exige datetime completo para columnas
// TIMESTAMP(3). undefined/null se preservan tal cual.
function normalizarFecha(valor: unknown): Date | undefined | null {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  return new Date(valor as string);
}

export const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// .trim() en secrets: docker-compose .env parser puede colar trailing \n en valores,
// rompiendo comparaciones strict-equal con headers entrantes. Ver ESTADO.md "Bloqueador 1".
const JWT_SECRET = requireEnv('JWT_SECRET').trim();
const MASTER_SECRET = (process.env.MASTER_SECRET || '').trim();
const JWT_ACCESS_EXPIRATION = (process.env.JWT_ACCESS_EXPIRATION || '15m').trim();
const JWT_REFRESH_EXPIRATION = (process.env.JWT_REFRESH_EXPIRATION || '7d').trim();
// Límite absoluto de duración de sesión (horas desde el login original),
// independiente de qué tan activo esté el usuario. Ver
// openspec/changes/sesion-jwt-inactividad.
const JWT_MAX_SESSION_HOURS = parseFloat((process.env.JWT_MAX_SESSION_HOURS || '16').trim());
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

// sendCommand es un closure que resuelve en request-time, cuando Redis ya está conectado
// (startServer() hace redisClient.connect() antes de app.listen()). El rateLimit() se
// crea en tiempo de módulo para cumplir con ERR_ERL_CREATED_IN_REQUEST_HANDLER de v7.5+.
function makeLimiter(max: number): express.RequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = redisClient ? new RedisStore({ sendCommand: (...args: string[]) => redisClient!.sendCommand(args) }) as any : undefined;
  return rateLimit({ windowMs: RL_WINDOW, max, standardHeaders: true, legacyHeaders: false, store, handler: rateLimitHandler });
}

const masterWriteLimiter  = makeLimiter(5);
const masterReadLimiter   = makeLimiter(30);
const masterModifyLimiter = makeLimiter(10);
const loginLimiter        = makeLimiter(10);
const refreshLimiter      = makeLimiter(20);
// Limita el sondeo de la contraseña actual: el endpoint la verifica con
// bcrypt.compare, asi que es un oraculo si se deja sin techo.
const changePasswordLimiter = makeLimiter(5);

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
    const parsed = parseOrRespond(loginSchema, req.body, res);
    if (!parsed) return;
    const { email, password, tenant_id, proyecto_id } = parsed;
    const normalizedEmail = normalizeEmail(email);
    const normalizedTenantId = tenant_id.trim();
    const requestedProjectId = proyecto_id ? proyecto_id.trim() : '';

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
            sesion_iniciada_en: new Date(),
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
    const parsed = parseOrRespond(registerSchema, req.body, res);
    if (!parsed) return;
    const { email, password, nombre, tenant_id, roles, proyecto_ids } = parsed;
    const normalizedEmail = normalizeEmail(email);
    const normalizedTenantId = tenant_id.trim();

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
            rol_global: roles || ['residencia'],
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
    const parsed = parseOrRespond(refreshSchema, req.body, res);
    if (!parsed) return;
    const { refresh_token } = parsed;

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

        // Revocar SIEMPRE el token usado, incluso si la sesión excede el
        // límite absoluto — evita que se pueda reintentar con el mismo
        // refresh token una vez detectado.
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revoked: true },
        });

        if (sesionExcedeLimite(storedToken.sesion_iniciada_en, new Date(), JWT_MAX_SESSION_HOURS)) {
          return null;
        }

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
            // Se propaga SIN resetear — es el mismo inicio de sesión lógico.
            sesion_iniciada_en: storedToken.sesion_iniciada_en,
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/v1/auth/logout — cierre de sesión del lado del servidor
//
// Antes el cierre de sesión era solo del cliente: borraba los tokens de
// localStorage y el refresh token seguía vivo en la base hasta expirar. Quien
// lo hubiera copiado antes podía seguir emitiendo access tokens.
//
// Sin `refresh_token` en el cuerpo (o con `todas: true`) se revoca la cadena
// completa del usuario — es también la vía para expulsar sesiones abiertas en
// un dispositivo que ya no se tiene a mano.
//
// Idempotente a propósito: cerrar una sesión ya cerrada responde 200. Un
// cliente que reintenta no debe quedarse atrapado en un error.
// Ver openspec/changes/cambio-password-y-logout.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/v1/auth/logout', async (req: Request, res: Response) => {
  try {
    const parsed = parseOrRespond(logoutSchema, req.body ?? {}, res);
    if (!parsed) return;
    const { refresh_token, todas } = parsed;
    const { tenantId, userId } = req.securityContext;

    const revocados = await createTenantContext(
      { tenantId, userId },
      async (prisma) => {
        // El user_id del JWT acota la revocación: un refresh token de otro
        // usuario no se puede revocar aunque se envíe su valor.
        const where = refresh_token && !todas
          ? {
              user_id: userId,
              revoked: false,
              token_hash: crypto.createHash('sha256').update(refresh_token).digest('hex'),
            }
          : { user_id: userId, revoked: false };

        const { count } = await prisma.refreshToken.updateMany({
          where,
          data: { revoked: true },
        });
        return count;
      }
    );

    console.log(`[Auth] Sesión cerrada: usuario=${userId} tokens_revocados=${revocados}`);

    res.json({
      success: true,
      data: {
        sesiones_cerradas: revocados,
        todas: Boolean(todas) || !refresh_token,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error al cerrar sesión:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_INTERNAL_ERROR', message: 'Error al cerrar la sesión.' },
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/v1/auth/change-password — cambio de contraseña autoservicio
//
// Sin esto, todos los usuarios del piloto compartían la contraseña de arranque
// sin forma de cambiarla salvo pidiéndoselo a un administrador.
//
// Al cambiarla se revocan TODAS las sesiones del usuario, incluida la que hace
// la petición: si la razón del cambio es que alguien más la conocía, dejar sus
// sesiones vivas vacía el gesto. El cliente vuelve a iniciar sesión.
// Ver openspec/changes/cambio-password-y-logout.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/v1/auth/change-password', changePasswordLimiter as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const parsed = parseOrRespond(cambiarPasswordSchema, req.body, res);
    if (!parsed) return;
    const { password_actual, password_nueva } = parsed;
    const { tenantId, userId } = req.securityContext;

    const user = await createTenantContext(
      { tenantId, userId },
      async (prisma) => prisma.user.findUnique({ where: { id_usuario: userId } })
    );

    if (!user || !user.activo) {
      res.status(404).json({
        success: false,
        error: { code: 'AUTH_USER_NOT_FOUND', message: 'Usuario no encontrado o desactivado.' },
      });
      return;
    }

    const actualEsCorrecta = await bcrypt.compare(password_actual, user.password_hash);
    if (!actualEsCorrecta) {
      console.warn(`[Auth] Cambio de contraseña rechazado — actual incorrecta: usuario=${userId}`);
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_PASSWORD_ACTUAL_INCORRECTA',
          message: 'La contraseña actual no es correcta.',
        },
      });
      return;
    }

    const validacion = validarPasswordNueva({ actual: password_actual, nueva: password_nueva });
    if (!validacion.valida) {
      res.status(400).json({
        success: false,
        error: { code: validacion.codigo, message: validacion.mensaje },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password_nueva, BCRYPT_ROUNDS);

    const sesionesCerradas = await createTenantContext(
      { tenantId, userId },
      async (prisma) => {
        await prisma.user.update({
          where: { id_usuario: userId },
          data: { password_hash: passwordHash },
        });
        const { count } = await prisma.refreshToken.updateMany({
          where: { user_id: userId, revoked: false },
          data: { revoked: true },
        });
        return count;
      }
    );

    console.log(`[Auth] Contraseña cambiada: usuario=${userId} sesiones_cerradas=${sesionesCerradas}`);

    res.json({
      success: true,
      data: {
        sesiones_cerradas: sesionesCerradas,
        mensaje: 'Contraseña actualizada. Vuelve a iniciar sesión.',
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error al cambiar contraseña:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_INTERNAL_ERROR', message: 'Error al cambiar la contraseña.' },
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
    const parsed = parseOrRespond(switchProjectSchema, req.body, res);
    if (!parsed) return;
    const { proyecto_id } = parsed;

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
      ['admin', 'superintendent', 'finanzas', 'procurement'].includes(r)
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
    const parsed = parseOrRespond(crearUsuarioSchema, req.body, res);
    if (!parsed) return;
    const { email, password, nombre, roles: userRoles, proyecto_ids, limite_aprobacion } = parsed;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await createTenantContext({ tenantId }, async (prisma) =>
      prisma.user.create({
        data: {
          tenant_id: tenantId, email, password_hash: passwordHash, nombre,
          rol_global: Array.isArray(userRoles) ? userRoles : ['residencia'],
          limite_aprobacion_financiera: limite_aprobacion || 0,
          proyectos_acceso: Array.isArray(proyecto_ids) && proyecto_ids.length > 0
            ? { create: proyecto_ids.map((pid: string) => ({ proyecto_id: pid })) }
            : undefined,
        },
      })
    );
    res.status(201).json({ success: true, data: { id: user.id_usuario, email: user.email, nombre: user.nombre, roles: user.rol_global } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: 'Error al crear el usuario.' } });
  }
});

// ─── PATCH /api/v1/auth/admin/users/:id ──────────────────────────────────────
app.patch('/api/v1/auth/admin/users/:id', requireAdminRole as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const { id } = req.params;
    const parsed = parseOrRespond(actualizarUsuarioSchema, req.body, res);
    if (!parsed) return;
    const { nombre, email, roles: userRoles, activo, limite_aprobacion, password, proyecto_ids } = parsed;
    const updateData: Record<string, unknown> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
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
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'ADMIN_EMAIL_DUPLICADO', message: 'Ese email ya está en uso por otro usuario.' } });
      return;
    }
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: 'Error al actualizar el usuario.' } });
  }
});

// ─── GET /api/v1/auth/usuarios ────────────────────────────────────────────────
app.get('/api/v1/auth/usuarios', requireRoles('personal_rh', 'admin') as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const rol = req.query.rol as string | undefined;
    if (!rol) {
      res.status(400).json({ success: false, error: { code: 'AUTH_MISSING_ROL', message: 'El query param rol es obligatorio.' } });
      return;
    }
    const users = await createTenantContext({ tenantId }, async (prisma) =>
      prisma.user.findMany({
        where: { tenant_id: tenantId, activo: true, rol_global: { has: rol } },
        orderBy: { nombre: 'asc' },
      })
    );
    res.json({ success: true, data: users.map(u => ({ id: u.id_usuario, nombre: u.nombre, email: u.email })) });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'AUTH_ERROR', message: String(err) } });
  }
});

// ─── GET /api/v1/auth/admin/proyectos ────────────────────────────────────────
app.get('/api/v1/auth/admin/proyectos', requireRoles(...ROLES_ALTA_CENTRO_COSTOS) as express.RequestHandler, async (req: Request, res: Response) => {
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
app.post('/api/v1/auth/admin/proyectos', requireRoles(...ROLES_ALTA_CENTRO_COSTOS) as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const parsed = parseOrRespond(crearProyectoSchema, req.body, res);
    if (!parsed) return;
    const {
      nombre_oficial, tipo_contrato, moneda_base, estatus,
      es_especial, tipo_especial, codigo_centro_costos: codigoEspecialInput,
      empresa_grupo, anio_centro_costos, cliente_id, codigo_cliente,
      monto_total_vendido, periodo_ejecucion, periodo_ejecucion_unidad,
      total_dias_naturales, total_dias_laborables,
    } = parsed;
    const fecha_inicio_real = normalizarFecha(parsed.fecha_inicio_real);
    const fecha_firma_contrato = normalizarFecha(parsed.fecha_firma_contrato);
    const fecha_programada_inicio = normalizarFecha(parsed.fecha_programada_inicio);
    const fecha_programada_fin = normalizarFecha(parsed.fecha_programada_fin);

    if (estatus !== undefined && !validarEstatus(estatus)) {
      res.status(400).json({ success: false, error: { code: 'ADMIN_ESTATUS_INVALIDO', message: 'estatus debe ser uno de: ABIERTO, EN EJECUCIÓN, EN COBRO, TERMINADO, CERRADO.' } });
      return;
    }

    if (fecha_programada_inicio && fecha_programada_fin && new Date(fecha_programada_fin) < new Date(fecha_programada_inicio)) {
      res.status(400).json({ success: false, error: { code: 'ADMIN_FECHAS_INVALIDAS', message: 'fecha_programada_fin no puede ser anterior a fecha_programada_inicio.' } });
      return;
    }

    let camposCentroCostos: Record<string, any>;

    if (es_especial) {
      // tipo_especial es string|undefined tras el schema Zod (campo opcional a nivel
      // de forma; solo es obligatorio de negocio cuando es_especial=true, chequeo que
      // se preserva aquí igual que antes de este change).
      if (!TIPOS_ESPECIALES.includes(tipo_especial as (typeof TIPOS_ESPECIALES)[number])) {
        res.status(400).json({ success: false, error: { code: 'ADMIN_TIPO_ESPECIAL_INVALIDO', message: `tipo_especial debe ser uno de: ${TIPOS_ESPECIALES.join(', ')}.` } });
        return;
      }
      if (!codigoEspecialInput) {
        res.status(400).json({ success: false, error: { code: 'ADMIN_MISSING_FIELDS', message: 'codigo_centro_costos es obligatorio para un Centro de Costos especial.' } });
        return;
      }
      camposCentroCostos = {
        es_especial: true,
        tipo_especial,
        codigo_centro_costos: codigoEspecialInput,
      };
    } else {
      // empresa_grupo es string|undefined tras el schema Zod (opcional a nivel de
      // forma; solo obligatorio de negocio cuando es_especial=false, chequeo que se
      // preserva aquí igual que antes de este change).
      if (!validarEmpresaGrupo(empresa_grupo as string)) {
        res.status(400).json({ success: false, error: { code: 'ADMIN_EMPRESA_INVALIDA', message: `empresa_grupo debe ser uno de: CIB, HCO, HSE, SEO.` } });
        return;
      }
      if (!anio_centro_costos || !cliente_id || !codigo_cliente) {
        res.status(400).json({ success: false, error: { code: 'ADMIN_MISSING_FIELDS', message: 'anio_centro_costos, cliente_id y codigo_cliente son obligatorios.' } });
        return;
      }
      camposCentroCostos = { es_especial: false, empresa_grupo, anio_centro_costos, cliente_id };
    }

    const proyecto = await createTenantContext({ tenantId }, async (prisma) => {
      let nuevo;
      if (es_especial) {
        nuevo = await prisma.proyecto.create({
          data: {
            tenant_id: tenantId, nombre_oficial,
            tipo_contrato: tipo_contrato || 'PRECIOS_UNITARIOS',
            moneda_base: moneda_base || 'MXN',
            estatus: estatus || 'ABIERTO',
            ...camposCentroCostos,
            fecha_inicio_real, fecha_firma_contrato, fecha_programada_inicio, fecha_programada_fin,
            monto_total_vendido, periodo_ejecucion, periodo_ejecucion_unidad,
            total_dias_naturales, total_dias_laborables,
          } as any,
        });
      } else {
        // Cálculo del consecutivo dentro de la misma transacción, con
        // reintento ante colisión de unicidad (creación concurrente).
        for (let intento = 0; intento < 3; intento++) {
          const countExistente = await prisma.proyecto.count({
            where: { tenant_id: tenantId, empresa_grupo, anio_centro_costos, cliente_id },
          });
          const consecutivo = siguienteConsecutivo(countExistente) + intento;
          // empresa_grupo/anio_centro_costos/codigo_cliente ya se validaron como
          // presentes arriba (guard clauses del bloque `else` de es_especial) antes
          // de llegar a este punto — los `!` reflejan esa garantía en runtime.
          const codigo = ensamblarCodigoCentroCostos({ empresa: empresa_grupo!, anio: anio_centro_costos!, codigoCliente: codigo_cliente!, consecutivo });
          try {
            nuevo = await prisma.proyecto.create({
              data: {
                tenant_id: tenantId, nombre_oficial,
                tipo_contrato: tipo_contrato || 'PRECIOS_UNITARIOS',
                moneda_base: moneda_base || 'MXN',
                estatus: estatus || 'ABIERTO',
                ...camposCentroCostos,
                consecutivo_centro_costos: consecutivo,
                codigo_centro_costos: codigo,
                fecha_inicio_real, fecha_firma_contrato, fecha_programada_inicio, fecha_programada_fin,
                monto_total_vendido, periodo_ejecucion, periodo_ejecucion_unidad,
                total_dias_naturales, total_dias_laborables,
              },
            });
            break;
          } catch (err: any) {
            if (err?.code === 'P2002' && intento < 2) continue; // colisión de unicidad — reintentar
            throw err;
          }
        }
      }

      // Auto-asignar los usuarios con rol elegible (ver project-access-policy.ts)
      // para que el proyecto aparezca de inmediato en su selector de proyectos
      const candidatos = await prisma.user.findMany({
        where: { tenant_id: tenantId },
        select: { id_usuario: true, rol_global: true, activo: true },
      });
      const autoAssignIds = resolveAutoAssignedUserIds(candidatos);

      if (autoAssignIds.length > 0) {
        await prisma.userProjectAccess.createMany({
          data: autoAssignIds.map(uid => ({ user_id: uid, proyecto_id: nuevo!.id_proyecto })),
          skipDuplicates: true,
        });
      }

      return nuevo!;
    });

    void publishCentroCostosCreado(
      {
        tenant_id: tenantId,
        proyecto_id: proyecto.id_proyecto,
        user_id: req.securityContext.userId,
        correlation_id: getCorrelationId(req),
      },
      {
        proyecto_id: proyecto.id_proyecto,
        codigo_centro_costos: proyecto.codigo_centro_costos,
        empresa_grupo: proyecto.empresa_grupo ?? null,
        anio_centro_costos: proyecto.anio_centro_costos ?? null,
        cliente_id: proyecto.cliente_id ?? null,
        es_especial: proyecto.es_especial,
        estatus: proyecto.estatus,
        nombre_oficial: proyecto.nombre_oficial,
        fecha_creacion: proyecto.created_at.toISOString(),
      }
    ).catch((err) => {
      console.error('[Auth] Error publicando auth.centro_costos_creado:', err);
    });

    res.status(201).json({ success: true, data: proyecto });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ADMIN_ERROR', message: String(err) } });
  }
});

// ─── PATCH /api/v1/auth/admin/proyectos/:id ──────────────────────────────────
app.patch('/api/v1/auth/admin/proyectos/:id', requireRoles(...ROLES_ALTA_CENTRO_COSTOS) as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.securityContext;
    const { id } = req.params;
    const parsed = parseOrRespond(actualizarProyectoSchema, req.body, res);
    if (!parsed) return;
    const {
      nombre_oficial, tipo_contrato, moneda_base, estatus, activo,
      monto_total_vendido, periodo_ejecucion, periodo_ejecucion_unidad,
      total_dias_naturales, total_dias_laborables,
    } = parsed;
    const fecha_inicio_real = normalizarFecha(parsed.fecha_inicio_real);
    const fecha_firma_contrato = normalizarFecha(parsed.fecha_firma_contrato);
    const fecha_programada_inicio = normalizarFecha(parsed.fecha_programada_inicio);
    const fecha_programada_fin = normalizarFecha(parsed.fecha_programada_fin);

    if (estatus !== undefined && !validarEstatus(estatus)) {
      res.status(400).json({ success: false, error: { code: 'ADMIN_ESTATUS_INVALIDO', message: 'estatus debe ser uno de: ABIERTO, EN EJECUCIÓN, EN COBRO, TERMINADO, CERRADO.' } });
      return;
    }
    if (fecha_programada_inicio && fecha_programada_fin && new Date(fecha_programada_fin) < new Date(fecha_programada_inicio)) {
      res.status(400).json({ success: false, error: { code: 'ADMIN_FECHAS_INVALIDAS', message: 'fecha_programada_fin no puede ser anterior a fecha_programada_inicio.' } });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (nombre_oficial !== undefined) updateData.nombre_oficial = nombre_oficial;
    if (tipo_contrato !== undefined) updateData.tipo_contrato = tipo_contrato;
    if (moneda_base !== undefined) updateData.moneda_base = moneda_base;
    if (estatus !== undefined) updateData.estatus = estatus;
    if (activo !== undefined) updateData.activo = activo;
    if (fecha_inicio_real !== undefined) updateData.fecha_inicio_real = fecha_inicio_real;
    if (fecha_firma_contrato !== undefined) updateData.fecha_firma_contrato = fecha_firma_contrato;
    if (fecha_programada_inicio !== undefined) updateData.fecha_programada_inicio = fecha_programada_inicio;
    if (fecha_programada_fin !== undefined) updateData.fecha_programada_fin = fecha_programada_fin;
    if (monto_total_vendido !== undefined) updateData.monto_total_vendido = monto_total_vendido;
    if (periodo_ejecucion !== undefined) updateData.periodo_ejecucion = periodo_ejecucion;
    if (periodo_ejecucion_unidad !== undefined) updateData.periodo_ejecucion_unidad = periodo_ejecucion_unidad;
    if (total_dias_naturales !== undefined) updateData.total_dias_naturales = total_dias_naturales;
    if (total_dias_laborables !== undefined) updateData.total_dias_laborables = total_dias_laborables;

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
  if (!MASTER_SECRET || !secretsMatch(secret, MASTER_SECRET)) {
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
    const parsed = parseOrRespond(crearTenantSchema, req.body, res);
    if (!parsed) {
      void logMasterAction({ accion: 'CREATE_TENANT', status_code: 400, ip: req.ip, error_msg: 'validacion fallida' });
      return;
    }
    const { nombre, rfc, plan, primary_color, logo_url } = parsed;
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
    const parsed = parseOrRespond(actualizarTenantSchema, req.body, res);
    if (!parsed) {
      void logMasterAction({ accion: 'UPDATE_TENANT', entity_id: id, status_code: 400, ip: req.ip, error_msg: 'validacion fallida' });
      return;
    }
    const { nombre, rfc, plan, primary_color, logo_url, activo } = parsed;
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
  await eventBus.connect();
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

if (require.main === module) {
  const server = startServer();

  process.on('SIGINT', () => {
    void server.then(s => s?.close(async () => { await eventBus.close(); await disconnectDb(); process.exit(0); }));
  });

  process.on('SIGTERM', () => {
    void server.then(s => s?.close(async () => { await eventBus.close(); await disconnectDb(); process.exit(0); }));
  });
}

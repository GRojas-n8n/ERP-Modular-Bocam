/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Paquete: @bocam/auth-middleware
 * Archivo: middleware.ts — Middleware Express de verificación JWT.
 *
 * ARQUITECTURA:
 * Este middleware es el REEMPLAZO DIRECTO de los middleware simulados que
 * extraían tenant_id de headers manuales (x-tenant-id, x-proyecto-id).
 *
 * Ahora el flujo es:
 * 1. Request llega con header `Authorization: Bearer <token>`.
 * 2. Este middleware verifica la firma criptográfica del token.
 * 3. Si es válido, extrae el SecurityContext del payload verificado.
 * 4. Inyecta el contexto en `req.securityContext` (tipado).
 * 5. Si no es válido, rechaza con 401 inmediatamente.
 *
 * ⚠️ SEGURIDAD:
 * - El tenant_id y proyecto_id JAMÁS se confían del payload HTTP.
 * - Solo se aceptan del JWT verificado con clave criptográfica.
 * - Rutas excluidas (health, login) se definen explícitamente.
 * ---------------------------------------------------------------------------
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SecurityContext, AuthMiddlewareOptions } from './types';

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(
      `[BOCAM::CONFIG] VIOLACION CRITICA: La variable de entorno ${name} es obligatoria.`
    );
  }

  return value;
}

// ─── Extender Request de Express globalmente ────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      /** Contexto de seguridad verificado, extraído del JWT. */
      securityContext: SecurityContext;
    }
  }
}

/**
 * Crea un middleware Express que verifica tokens JWT y extrae el contexto
 * de seguridad Multi-Tenant y Multi-Proyecto.
 *
 * @param options - Configuración del middleware (secret, rutas excluidas).
 * @returns Middleware de Express listo para usar con `app.use()`.
 *
 * @example
 * ```typescript
 * import { createAuthMiddleware } from '@bocam/auth-middleware';
 *
 * app.use(createAuthMiddleware({
 *   jwtSecret: process.env.JWT_SECRET!,
 *   excludePaths: ['/health', '/api/v1/auth/login', '/api/v1/auth/register'],
 * }));
 * ```
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions) {
  const { jwtSecret, excludePaths = [], excludeByPrefix = false } = options;

  if (!jwtSecret) {
    throw new Error(
      '[BOCAM::AUTH] VIOLACIÓN CRÍTICA: No se proporcionó JWT_SECRET. ' +
      'El sistema no puede operar sin una clave de firma. Revisa tu archivo .env.'
    );
  }

  const isPathExcluded = (requestPath: string): boolean => {
    return excludePaths.some((path) => {
      if (!excludeByPrefix) {
        return requestPath === path;
      }

      return requestPath === path || requestPath.startsWith(`${path}/`);
    });
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    // ─── Verificar si la ruta está excluida ─────────────────────────
    const isExcluded = isPathExcluded(req.path);

    if (isExcluded) {
      return next();
    }

    // ─── Extraer token del header Authorization ─────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Token de autenticación requerido. Envía el header Authorization: Bearer <token>.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          module: 'auth-middleware',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    try {
      // ─── Verificar firma criptográfica ──────────────────────────────
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // ─── Validar campos obligatorios del payload ────────────────────
      if (!decoded.sub || !decoded.tenant_id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_TOKEN_MALFORMED',
            message: 'El token no contiene los campos obligatorios (sub, tenant_id).',
          },
          meta: {
            timestamp: new Date().toISOString(),
            module: 'auth-middleware',
          },
        });
        return;
      }

      // ─── Construir SecurityContext verificado ───────────────────────
      req.securityContext = {
        userId: decoded.sub,
        tenantId: decoded.tenant_id,
        proyectoId: decoded.proyecto_id || '',
        email: decoded.email || '',
        name: decoded.name || '',
        userName: decoded.name || '',
        roles: decoded.roles || [],
        authorizedProjects: decoded.projects || [],
        limiteAprobacion: decoded.limite_aprobacion || 0,
      };

      next();
    } catch (error: any) {
      // ─── Manejo granular de errores JWT ──────────────────────────────
      let errorCode = 'AUTH_TOKEN_INVALID';
      let errorMessage = 'Token inválido o corrupto.';

      if (error.name === 'TokenExpiredError') {
        errorCode = 'AUTH_TOKEN_EXPIRED';
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.name === 'JsonWebTokenError') {
        errorCode = 'AUTH_TOKEN_INVALID';
        errorMessage = 'El token proporcionado no es válido.';
      } else if (error.name === 'NotBeforeError') {
        errorCode = 'AUTH_TOKEN_NOT_ACTIVE';
        errorMessage = 'El token aún no está activo.';
      }

      res.status(401).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        meta: {
          timestamp: new Date().toISOString(),
          module: 'auth-middleware',
        },
      });
      return;
    }
  };
}

/**
 * Middleware auxiliar para verificar que el usuario tenga al menos uno de los
 * roles requeridos. Se usa DESPUÉS del middleware JWT.
 *
 * @param allowedRoles - Lista de roles que pueden acceder al endpoint.
 *
 * @example
 * ```typescript
 * app.post('/api/v1/compras/ordenes',
 *   requireRoles(['superintendent', 'procurement']),
 *   async (req, res) => { ... }
 * );
 * ```
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.securityContext) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_CONTEXT_MISSING',
          message: 'Contexto de seguridad no encontrado. ¿Falta el middleware JWT?',
        },
      });
      return;
    }

    const userRoles = req.securityContext.roles;
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: `Acceso denegado. Se requiere uno de los roles: [${allowedRoles.join(', ')}].`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware auxiliar para verificar que el usuario tiene acceso
 * al proyecto_id especificado en su contexto.
 * Cumple con la directiva RBAC: "un residente solo puede ver y modificar
 * la información de la obra a la que fue asignado".
 */
export function requireProjectAccess() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.securityContext) {
      // Si no hay securityContext, la ruta fue excluida del JWT middleware previo
      // (p. ej. /health). En ese caso pasamos transparente — la validación de proyecto
      // no aplica para rutas publicas. El JWT middleware ya rechazo cualquier ruta
      // que requeria autenticacion antes de llegar aqui.
      return next();
    }

    const { proyectoId, authorizedProjects, roles } = req.securityContext;

    // Los roles de nivel Tenant (superintendent, finance, procurement) tienen acceso a todo
    const tenantLevelRoles = ['admin', 'superintendent', 'finance', 'procurement'];
    const hasTenantAccess = roles.some(role => tenantLevelRoles.includes(role));

    if (hasTenantAccess) {
      return next();
    }

    // Para roles de nivel Proyecto, verificar acceso explícito
    if (!proyectoId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_PROJECT_REQUIRED',
          message: 'Se requiere un proyecto activo para esta operación.',
        },
      });
      return;
    }

    if (!authorizedProjects.includes(proyectoId)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_PROJECT_FORBIDDEN',
          message: `No tienes acceso autorizado al proyecto ${proyectoId}.`,
        },
      });
      return;
    }

    next();
  };
}

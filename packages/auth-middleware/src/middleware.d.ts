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
import type { SecurityContext, AuthMiddlewareOptions } from './types';
export declare function requireEnv(name: string): string;
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
export declare function createAuthMiddleware(options: AuthMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => void;
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
export declare function requireRoles(...allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware auxiliar para verificar que el usuario tiene acceso
 * al proyecto_id especificado en su contexto.
 * Cumple con la directiva RBAC: "un residente solo puede ver y modificar
 * la información de la obra a la que fue asignado".
 */
export declare function requireProjectAccess(): (req: Request, res: Response, next: NextFunction) => void;

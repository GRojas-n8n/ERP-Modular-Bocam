/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Paquete: @bocam/auth-middleware
 * Archivo: types.ts — Contratos de seguridad compartidos entre microservicios.
 *
 * Estos tipos definen la forma canónica del token JWT y del contexto de
 * seguridad que cada microservicio recibirá tras la verificación del token.
 * ---------------------------------------------------------------------------
 */

/**
 * Payload contenido dentro del JWT firmado.
 * Este contrato es la ÚNICA fuente de verdad para la identidad del request.
 * PROHIBIDO extraer tenant_id o proyecto_id de headers, query params o body.
 */
export interface JwtPayload {
  /** UUID del usuario (Subject estándar JWT). */
  sub: string;
  /** UUID del tenant al que pertenece el usuario. OBLIGATORIO. */
  tenant_id: string;
  /** UUID del proyecto/centro de costos activo. */
  proyecto_id: string;
  /** Correo corporativo para auditoría. */
  email: string;
  /** Nombre completo para UI. */
  name: string;
  /** Roles asignados al usuario dentro de este tenant. */
  roles: string[];
  /** Lista de proyecto_ids a los que el usuario tiene acceso explícito. */
  projects: string[];
  /** Límite de autoridad financiera en MXN. */
  limite_aprobacion?: number;
  /** Timestamps estándar JWT (emitidos por jsonwebtoken automáticamente). */
  iat?: number;
  exp?: number;
}

/**
 * Contexto de seguridad inyectado en cada Request de Express.
 * Producto de la decodificación y verificación exitosa del JWT.
 */
export interface SecurityContext {
  /** UUID del usuario autenticado. */
  userId: string;
  /** UUID del tenant. Directamente del JWT verificado. */
  tenantId: string;
  /** UUID del proyecto activo. Directamente del JWT verificado. */
  proyectoId: string;
  /** Correo del usuario. */
  email: string;
  /** Nombre del usuario. */
  name: string;
  /** Alias legible para módulos heredados. */
  userName?: string;
  /** Roles del usuario en este tenant. */
  roles: string[];
  /** Proyectos a los que tiene acceso. */
  authorizedProjects: string[];
  /** Límite de autoridad financiera. */
  limiteAprobacion: number;
}

/**
 * Opciones de configuración para el middleware JWT.
 */
export interface AuthMiddlewareOptions {
  /** Secret para verificar la firma del JWT. OBLIGATORIO. */
  jwtSecret: string;
  /** Rutas que se excluyen de autenticación (ej: /health, /api/v1/auth/login). */
  excludePaths?: string[];
  /** Si es true, las rutas excluidas se comparan con startsWith en vez de igualdad exacta. */
  excludeByPrefix?: boolean;
}

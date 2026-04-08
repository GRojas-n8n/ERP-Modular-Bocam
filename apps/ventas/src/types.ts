/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Ventas
 * ---------------------------------------------------------------------------
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    module: string;
    tenant_id?: string;
    proyecto_id?: string;
  };
}

export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      module: 'ventas',
      tenant_id: tenantId,
      proyecto_id: proyectoId,
    },
  };
}

export function createApiError(code: string, message: string, details?: unknown): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      module: 'ventas',
    },
  };
}

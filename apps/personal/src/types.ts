/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Personal / RRHH
 * Archivo: types.ts
 * ---------------------------------------------------------------------------
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: { timestamp: string; module: string; tenant_id?: string; proyecto_id?: string };
}

export interface BocamEvent<T = unknown> {
  event_type: string;
  timestamp: string;
  context: { tenant_id: string; proyecto_id: string; user_id: string };
  payload: T;
}

export enum PersonalEvents {
  PERSONAL_ASIGNADO_FRENTE = 'personal.personal_asignado_frente',
  CUADRILLA_CREADA = 'personal.cuadrilla_creada',
  PRENOMINA_CALCULADA = 'personal.prenomina_calculada',
  PRENOMINA_AUTORIZADA = 'personal.prenomina_autorizada',
  EMPLEADO_DADO_DE_BAJA = 'personal.empleado_dado_de_baja',
}

export enum CategoriaEmpleado {
  OBRERO = 'OBRERO',
  TECNICO = 'TECNICO',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  SUPERVISOR = 'SUPERVISOR',
}

export enum EstadoPreNomina {
  BORRADOR = 'BORRADOR',
  CALCULADA = 'CALCULADA',
  AUTORIZADA = 'AUTORIZADA',
  PAGADA = 'PAGADA',
}

export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string): ApiResponse<T> {
  return {
    success: true, data,
    meta: { timestamp: new Date().toISOString(), module: 'personal', tenant_id: tenantId, proyecto_id: proyectoId },
  };
}

export function createApiError(code: string, message: string, details?: unknown): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString(), module: 'personal' },
  };
}

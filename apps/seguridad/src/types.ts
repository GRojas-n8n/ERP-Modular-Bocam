/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Seguridad / HSE
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

// ── Eventos del módulo ──
export enum SeguridadEvents {
  INCIDENTE_REPORTADO = 'seguridad.incidente_reportado',
  INCIDENTE_CERRADO = 'seguridad.incidente_cerrado',
  INSPECCION_COMPLETADA = 'seguridad.inspeccion_completada',
  PERMISO_TRABAJO_EMITIDO = 'seguridad.permiso_trabajo_emitido',
  PERMISO_TRABAJO_CERRADO = 'seguridad.permiso_trabajo_cerrado',
  CAPACITACION_COMPLETADA = 'seguridad.capacitacion_completada',
}

// ── Enums de dominio ──
export enum SeveridadIncidente {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum TipoIncidente {
  ACCIDENTE = 'ACCIDENTE',
  CASI_ACCIDENTE = 'CASI_ACCIDENTE',
  ACTO_INSEGURO = 'ACTO_INSEGURO',
  CONDICION_INSEGURA = 'CONDICION_INSEGURA',
  AMBIENTAL = 'AMBIENTAL',
}

export enum EstadoIncidente {
  ABIERTO = 'ABIERTO',
  EN_INVESTIGACION = 'EN_INVESTIGACION',
  ACCION_CORRECTIVA = 'ACCION_CORRECTIVA',
  CERRADO = 'CERRADO',
}

export enum ResultadoInspeccion {
  APROBADA = 'APROBADA',
  OBSERVACIONES = 'OBSERVACIONES',
  NO_APROBADA = 'NO_APROBADA',
}

export enum EstadoPermiso {
  VIGENTE = 'VIGENTE',
  EXPIRADO = 'EXPIRADO',
  CANCELADO = 'CANCELADO',
}

export enum TipoPermiso {
  ALTURAS = 'ALTURAS',
  ESPACIO_CONFINADO = 'ESPACIO_CONFINADO',
  TRABAJO_CALIENTE = 'TRABAJO_CALIENTE',
  EXCAVACION = 'EXCAVACION',
  IZAJE = 'IZAJE',
  ELECTRICO = 'ELECTRICO',
}

export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string): ApiResponse<T> {
  return {
    success: true, data,
    meta: { timestamp: new Date().toISOString(), module: 'seguridad', tenant_id: tenantId, proyecto_id: proyectoId },
  };
}

export function createApiError(code: string, message: string, details?: unknown): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString(), module: 'seguridad' },
  };
}

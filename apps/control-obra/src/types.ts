/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Control de Obra
 * Archivo: types.ts — Tipos, interfaces y contratos del módulo.
 * ---------------------------------------------------------------------------
 */

// ─── Respuesta API Estandarizada ────────────────────────────────────────────
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
    correlation_id?: string;
  };
}

// ─── Payload Estándar de Eventos (RabbitMQ / Redis PubSub) ──────────────────
export interface BocamEvent<T = unknown> {
  event_type: string;
  timestamp: string;
  context: {
    tenant_id: string;
    proyecto_id: string;
    user_id: string;
    correlation_id?: string;
  };
  payload: T;
}

// ─── Tipos de Eventos emitidos por Control de Obra ──────────────────────────
export enum ControlObraEvents {
  AVANCE_FISICO_REGISTRADO = 'control_obra.avance_fisico_registrado',
  AVANCE_FISICO_VALIDADO = 'control_obra.avance_fisico_validado',
  ESTIMACION_CREADA = 'control_obra.estimacion_creada',
  ESTIMACION_APROBADA = 'control_obra.estimacion_aprobada',
  BITACORA_FIRMADA = 'control_obra.bitacora_firmada',
}

// ─── Estados de Avance Físico ───────────────────────────────────────────────
export enum EstadoAvance {
  PENDIENTE = 'PENDIENTE',
  VALIDADO = 'VALIDADO',
  RECHAZADO = 'RECHAZADO',
}

// ─── Estados de Estimación ──────────────────────────────────────────────────
export enum EstadoEstimacion {
  BORRADOR = 'BORRADOR',
  EN_REVISION = 'EN_REVISION',
  PENDIENTE_CONFIRMACION_FINANZAS = 'PENDIENTE_CONFIRMACION_FINANZAS',
  APROBADA_TECNICA = 'APROBADA_TECNICA',
  APROBADA_FINANCIERA = 'APROBADA_FINANCIERA',
  ERROR_FINANZAS = 'ERROR_FINANZAS',
  RECHAZADA = 'RECHAZADA',
  FACTURADA = 'FACTURADA',
}

// ─── Factory de ApiResponse ─────────────────────────────────────────────────
export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string, correlationId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      module: 'control-obra',
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      correlation_id: correlationId,
    },
  };
}

export function createApiError(code: string, message: string, details?: unknown, correlationId?: string): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      module: 'control-obra',
      correlation_id: correlationId,
    },
  };
}

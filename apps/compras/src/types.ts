/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Gerencia Técnica
 * Archivo: types.ts — Tipos compartidos, interfaces y contratos del módulo.
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
  };
}

// ─── Contexto del Request (Inyectado por Middleware JWT) ─────────────────────
export interface RequestUserContext {
  tenant_id: string;
  proyecto_id?: string;
  user_id: string;
  roles: string[];
}

// ─── Payload Estándar de Eventos (RabbitMQ / Redis PubSub) ──────────────────
export interface BocamEvent<T = unknown> {
  event_type: string;
  timestamp: string;
  context: {
    tenant_id: string;
    proyecto_id: string;
    user_id: string;
  };
  payload: T;
}

// ─── Tipos de Eventos emitidos por Gerencia Técnica ─────────────────────────
export enum GerenciaTecnicaEvents {
  PRESUPUESTO_BASE_LIBERADO = 'gerencia_tecnica.presupuesto_base_liberado',
  INSUMO_ACTUALIZADO = 'gerencia_tecnica.insumo_actualizado',
  INSUMO_DESACTIVADO = 'gerencia_tecnica.insumo_desactivado',
}

// ─── Factory de ApiResponse ─────────────────────────────────────────────────
export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      module: 'gerencia-tecnica',
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
      module: 'gerencia-tecnica',
    },
  };
}

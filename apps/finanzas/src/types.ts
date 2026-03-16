/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Finanzas (Tesorería y Flujo de Caja)
 * Archivo: types.ts — Tipos compartidos, interfaces, eventos y contratos.
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

// ─── Tipos de Eventos EMITIDOS por Finanzas ─────────────────────────────────
export enum FinanzasEvents {
  /** Se congelaron fondos exitosamente al recibir una OC emitida. */
  FONDOS_COMPROMETIDOS = 'finanzas.fondos_comprometidos',
  /** El presupuesto es insuficiente para cubrir la OC emitida. */
  PRESUPUESTO_INSUFICIENTE = 'finanzas.presupuesto_insuficiente',
  /** Se registró un pago exitosamente. */
  PAGO_REGISTRADO = 'finanzas.pago_registrado',
  /** Se transfirió presupuesto entre capítulos. */
  TRANSFERENCIA_PRESUPUESTAL = 'finanzas.transferencia_presupuestal',
  /** Se liberaron fondos previamente comprometidos (ej. OC cancelada). */
  FONDOS_LIBERADOS = 'finanzas.fondos_liberados',
}

// ─── Tipos de Eventos CONSUMIDOS por Finanzas ───────────────────────────────
export enum FinanzasConsumedEvents {
  /** Compras emitió una Orden de Compra → Finanzas congela fondos. */
  ORDEN_COMPRA_EMITIDA = 'compras.orden_compra_emitida',
  /** Compras canceló una OC → Finanzas libera fondos congelados. */
  ORDEN_COMPRA_CANCELADA = 'compras.orden_compra_cancelada',
}

// ─── Payloads de Eventos ────────────────────────────────────────────────────
export interface FondosComprometidosPayload {
  presupuesto_id: string;
  movimiento_id: string;
  monto_comprometido: number;
  monto_disponible_restante: number;
  referencia_oc_id: string;
  referencia_oc_codigo: string;
}

export interface PresupuestoInsuficientePayload {
  presupuesto_id: string;
  monto_solicitado: number;
  monto_disponible: number;
  deficit: number;
  referencia_oc_id: string;
  referencia_oc_codigo: string;
}

// ─── Payload de Suficiencia (Respuesta a GET /suficiencia) ──────────────────
export interface SuficienciaPresupuestal {
  proyecto_id: string;
  resumen: {
    total_autorizado: number;
    total_ejercido: number;
    total_comprometido: number;
    total_disponible: number;
    moneda: string;
  };
  por_capitulo: {
    capitulo: string;
    monto_autorizado: number;
    monto_ejercido: number;
    monto_comprometido: number;
    monto_disponible: number;
  }[];
  tiene_suficiencia: boolean;
}

// ─── Tipos de Movimiento ────────────────────────────────────────────────────
export enum TipoMovimiento {
  /** Fondos congelados por OC emitida (pendiente de pago). */
  COMPROMISO = 'COMPROMISO',
  /** Obligación formal de pago (factura recibida). */
  DEVENGADO = 'DEVENGADO',
  /** Pago efectivamente realizado. */
  EJERCIDO = 'EJERCIDO',
  /** Liberación de fondos previamente comprometidos. */
  LIBERACION = 'LIBERACION',
  /** Transferencia entre capítulos de gasto. */
  TRANSFERENCIA = 'TRANSFERENCIA',
}

// ─── Factory de ApiResponse ─────────────────────────────────────────────────
export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      module: 'finanzas',
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
      module: 'finanzas',
    },
  };
}

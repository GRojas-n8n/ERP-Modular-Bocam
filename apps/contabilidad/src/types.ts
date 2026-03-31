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

export interface PagoRegistradoPayload {
  id_pago: string;
  presupuesto_id: string;
  monto_pagado: number;
  moneda?: string;
  fecha_pago_real: string;
  referencia_bancaria?: string;
  metodo_pago?: string;
  banco?: string;
  referencia_modulo?: string;
  referencia_entidad?: string;
  referencia_id?: string;
  concepto: string;
  beneficiario: string;
}

export interface OrdenCompraCreadaPayload {
  oc_id: string;
  codigo: string;
  total: number;
  proveedor_id: string;
  presupuesto_id: string;
}

export interface OrdenCompraCanceladaPayload {
  oc_id: string;
  codigo: string;
  total: number;
  presupuesto_id?: string;
}

export interface FondosLiberadosPayload {
  presupuesto_id: string;
  movimiento_id: string;
  monto_liberado: number;
  referencia_oc_id: string;
  referencia_oc_codigo: string;
  idempotente?: boolean;
}

export interface FondosComprometidosPayload {
  presupuesto_id: string;
  movimiento_id: string;
  monto_comprometido: number;
  monto_disponible_restante: number;
  referencia_oc_id: string;
  referencia_oc_codigo: string;
  idempotente?: boolean;
}

export interface TransferenciaPresupuestalPayload {
  transferencia_id: string;
  movimiento_origen_id: string;
  movimiento_destino_id: string;
  presupuesto_origen_id: string;
  presupuesto_destino_id: string;
  codigo_origen: string;
  codigo_destino: string;
  capitulo_origen: string;
  capitulo_destino: string;
  monto_transferido: number;
  concepto: string;
  idempotente?: boolean;
}

export interface AsientoContableGeneradoPayload {
  id_asiento: string;
  pago_id?: string;
  external_event_key: string;
  tipo_poliza: string;
  folio_poliza: string;
  monto_total: number;
  fecha_poliza: string;
  referencia_modulo?: string;
  referencia_entidad?: string;
  referencia_id?: string;
  beneficiario: string;
  estatus: string;
  cfdi_status?: string;
  bancario_status?: string;
  idempotente?: boolean;
}

export interface CfdiConciliadoPayload {
  id_asiento: string;
  pago_id?: string;
  id_conciliacion: string;
  uuid_fiscal: string;
  estatus_fiscal: string;
  cfdi_status: string;
}

export interface CfdiSatValidadoPayload {
  id_asiento: string;
  pago_id?: string;
  id_conciliacion: string;
  uuid_fiscal: string;
  estatus_sat: string;
  cfdi_status: string;
}

export interface ConciliacionBancariaPayload {
  id_asiento: string;
  pago_id?: string;
  id_conciliacion_bancaria: string;
  referencia_bancaria?: string;
  estatus_bancario: string;
  bancario_status: string;
}

export interface ConciliarCfdiRequest {
  uuid_fiscal: string;
  serie?: string;
  folio?: string;
  rfc_emisor: string;
  rfc_receptor: string;
  monto_total: number;
  moneda?: string;
  fecha_emision: string;
  fecha_timbrado?: string;
  fuente?: string;
  notas?: string;
}

export interface ValidarSatRequest {
  estatus_sat: 'VIGENTE' | 'CANCELADO';
  fecha_validacion_sat?: string;
  fecha_cancelacion_sat?: string;
  fuente?: string;
  mensaje_sat?: string;
  notas?: string;
}

export interface ValidarSatExternoRequest {
  force_refresh?: boolean;
}

export interface SolicitudValidacionSatPayload {
  dispatch_id: string;
  id_conciliacion: string;
  id_asiento: string;
  pago_id?: string;
  uuid_fiscal: string;
  serie?: string;
  folio?: string;
  rfc_emisor?: string;
  rfc_receptor?: string;
  monto_total: number;
  moneda?: string;
  fecha_emision?: string;
  callback_path: string;
  callback_method: 'POST';
  attempt?: number;
  max_attempts?: number;
}

export interface SatValidationCallbackRequest {
  tenant_id: string;
  proyecto_id: string;
  user_id: string;
  dispatch_id?: string;
  id_conciliacion: string;
  estatus_sat: 'VIGENTE' | 'CANCELADO';
  fecha_validacion_sat?: string;
  fecha_cancelacion_sat?: string;
  fuente?: string;
  mensaje_sat?: string;
  provider_reference?: string;
  notas?: string;
}

export interface SatFailureCallbackRequest {
  tenant_id: string;
  proyecto_id: string;
  user_id: string;
  dispatch_id: string;
  id_conciliacion: string;
  attempt: number;
  max_attempts: number;
  error_message: string;
  next_dispatch_id?: string;
  next_retry_at?: string;
  moved_to_dlq?: boolean;
  fuente?: string;
  notas?: string;
}

export interface SatClaimDispatchRequest {
  tenant_id: string;
  proyecto_id: string;
  user_id: string;
  id_conciliacion: string;
  dispatch_id: string;
  attempt: number;
}

export interface ConciliarBancoRequest {
  referencia_bancaria?: string;
  banco?: string;
  metodo_pago?: string;
  monto_banco: number;
  moneda?: string;
  fecha_movimiento_bancario: string;
  fuente?: string;
  notas?: string;
}

export interface ConciliarBancoLoteItemRequest extends ConciliarBancoRequest {
  id_asiento?: string;
  referencia_lote?: string;
}

export interface ConciliarBancoLoteRequest {
  lote_id?: string;
  items: ConciliarBancoLoteItemRequest[];
}

export interface ConciliacionBancariaArchivoRequest {
  file_name: string;
  file_base64: string;
  sheet_name?: string;
  lote_id?: string;
  allow_partial?: boolean;
}

export enum ContabilidadEvents {
  ASIENTO_CONTABLE_GENERADO = 'contabilidad.asiento_contable_generado',
  CFDI_CONCILIADO = 'contabilidad.cfdi_conciliado',
  CFDI_SAT_VALIDACION_SOLICITADA = 'contabilidad.cfdi_sat_validacion_solicitada',
  CFDI_SAT_VALIDADO = 'contabilidad.cfdi_sat_validado',
  CONCILIACION_BANCARIA_ACTUALIZADA = 'contabilidad.conciliacion_bancaria_actualizada',
}

export enum ContabilidadConsumedEvents {
  PAGO_REGISTRADO = 'finanzas.pago_registrado',
  ORDEN_COMPRA_CREADA = 'compras.oc_creada',
  ORDEN_COMPRA_CANCELADA = 'compras.oc_cancelada',
  FONDOS_COMPROMETIDOS = 'finanzas.fondos_comprometidos',
  FONDOS_LIBERADOS = 'finanzas.fondos_liberados',
  TRANSFERENCIA_PRESUPUESTAL = 'finanzas.transferencia_presupuestal',
}

export function createApiResponse<T>(data: T, tenantId?: string, proyectoId?: string, correlationId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      module: 'contabilidad',
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
      module: 'contabilidad',
      correlation_id: correlationId,
    },
  };
}

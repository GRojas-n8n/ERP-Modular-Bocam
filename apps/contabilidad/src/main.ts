import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import * as XLSX from 'xlsx';
import { createTenantContext } from './db';
import { buildTerminalHttpResponse, logTerminalState } from '../../../packages/tenant-idempotency/src';
import {
  applyIdempotentMutation,
  applyIdempotentMutationInTenantContext,
  createOrRecoverInTenantContext,
  findAsientoByFunctionalReferenceWithRetry,
  reconcileAsientoByFunctionalReference,
} from './idempotency';
import {
  AsientoContableGeneradoPayload,
  CfdiSatValidadoPayload,
  CfdiConciliadoPayload,
  ConciliacionBancariaArchivoRequest,
  ConciliarBancoRequest,
  ConciliarBancoLoteRequest,
  ConciliarCfdiRequest,
  ConciliacionBancariaPayload,
  ContabilidadConsumedEvents,
  ContabilidadEvents,
  FondosComprometidosPayload,
  FondosLiberadosPayload,
  OrdenCompraCanceladaPayload,
  OrdenCompraCreadaPayload,
  PagoRegistradoPayload,
  SatClaimDispatchRequest,
  SatFailureCallbackRequest,
  SatValidationCallbackRequest,
  SolicitudValidacionSatPayload,
  TransferenciaPresupuestalPayload,
  ValidarSatRequest,
  ValidarSatExternoRequest,
  createApiError,
  createApiResponse,
} from './types';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { BocamEvent, createEventBus } from '../../../packages/event-bus/src';
import {
  createObservabilityMiddleware,
  getCorrelationId,
  logInfo,
  logWarn,
} from '../../../packages/observability/src';

const eventBus = createEventBus(process.env.CONTABILIDAD_EVENT_BUS_NAME || 'contabilidad');
let subscriptionsRegistered = false;

async function publishContabilidadDomainEvent(
  eventType: ContabilidadEvents,
  context: { tenant_id: string; proyecto_id: string; user_id: string; correlation_id?: string },
  payload: AsientoContableGeneradoPayload | CfdiConciliadoPayload | CfdiSatValidadoPayload | ConciliacionBancariaPayload | SolicitudValidacionSatPayload
) {
  await eventBus.publish({
    event_type: eventType,
    timestamp: new Date().toISOString(),
    context,
    payload,
  });
}

function buildFolioPoliza(idPago: string, fechaPagoReal: string) {
  const date = new Date(fechaPagoReal);
  const year = Number.isNaN(date.getTime()) ? new Date().getUTCFullYear() : date.getUTCFullYear();
  return `POL-EGR-${year}-${idPago.slice(0, 8).toUpperCase()}`;
}

function buildFolioByPrefix(prefix: string, entityId: string, happenedAt?: string) {
  const date = happenedAt ? new Date(happenedAt) : new Date();
  const year = Number.isNaN(date.getTime()) ? new Date().getUTCFullYear() : date.getUTCFullYear();
  return `${prefix}-${year}-${entityId.slice(0, 8).toUpperCase()}`;
}

function buildFunctionalReference(entity: string, entityId: string) {
  return `${entity}:${entityId}`;
}

function appendNote(existing: string | null | undefined, next: string) {
  return existing ? `${existing} ${next}`.trim() : next;
}

function logFunctionalReconciliationTerminalState(params: {
  event: BocamEvent<unknown>;
  result: { asiento: { id_asiento: string } | null; state: 'not_found' | 'idempotent' | 'applied' };
  referenciaFuncional: string;
  movimientoId: string;
  notFoundAction: string;
  idempotentAction: string;
  appliedAction: string;
}) {
  logTerminalState({
    terminalState: params.result.state,
    actions: {
      notFound: params.notFoundAction,
      idempotent: params.idempotentAction,
      applied: params.appliedAction,
    },
    context: {
      eventType: params.event.event_type,
      correlationId: params.event.context?.correlation_id,
      tenantId: params.event.context?.tenant_id,
      proyectoId: params.event.context?.proyecto_id,
    },
    extras: {
      referencia_funcional: params.referenciaFuncional,
      movimiento_id: params.movimientoId,
      id_asiento: params.result.asiento?.id_asiento,
    },
  });
}

function mapSatStatusToCfdiStatus(estatusSat: 'VIGENTE' | 'CANCELADO') {
  return estatusSat === 'VIGENTE' ? 'SAT_VIGENTE' : 'SAT_CANCELADO';
}

function getSatCallbackSecret() {
  return process.env.SAT_CALLBACK_SHARED_SECRET || process.env.SAT_ADAPTER_API_KEY || '';
}

function getSatMaxAttempts() {
  const parsed = Number(process.env.SAT_WORKER_MAX_ATTEMPTS || '3');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

function buildSatDispatchId() {
  return `sat-${randomUUID()}`;
}

async function loadSatValidationRequestByConciliacionId(prisma: any, tenantId: string, conciliacionId: string): Promise<SolicitudValidacionSatPayload> {
  const conciliacion = await prisma.conciliacionFiscal.findFirst({
    where: {
      tenant_id: tenantId,
      id_conciliacion: conciliacionId,
    },
  });

  if (!conciliacion) {
    throw new Error('SAT_RECONCILIATION_NOT_FOUND');
  }

  if (!conciliacion.uuid_fiscal) {
    throw new Error('SAT_UUID_MISSING');
  }

  const asiento = await prisma.asientoContable.findFirst({
    where: {
      tenant_id: tenantId,
      id_asiento: conciliacion.asiento_id,
    },
  });

  if (!asiento) {
    throw new Error('ASIENTO_NOT_FOUND');
  }

  return {
    dispatch_id: conciliacion.sat_dispatch_id || buildSatDispatchId(),
    id_conciliacion: conciliacion.id_conciliacion,
    id_asiento: asiento.id_asiento,
    pago_id: conciliacion.pago_id || undefined,
    uuid_fiscal: conciliacion.uuid_fiscal,
    serie: conciliacion.serie || undefined,
    folio: conciliacion.folio || undefined,
    rfc_emisor: conciliacion.rfc_emisor || undefined,
    rfc_receptor: conciliacion.rfc_receptor || undefined,
    monto_total: Number(conciliacion.monto_cfdi || conciliacion.monto_pagado),
    moneda: conciliacion.moneda,
    fecha_emision: conciliacion.fecha_emision ? conciliacion.fecha_emision.toISOString() : undefined,
    callback_path: '/api/v1/contabilidad/integraciones/sat/callback',
    callback_method: 'POST',
    attempt: Math.max(Number(conciliacion.sat_retry_count || 0) + 1, 1),
    max_attempts: getSatMaxAttempts(),
  };
}

async function markSatValidationRequested(prisma: any, tenantId: string, conciliacionId: string) {
  const existing = await prisma.conciliacionFiscal.findFirst({
    where: {
      tenant_id: tenantId,
      id_conciliacion: conciliacionId,
    },
  });

  if (!existing) {
    throw new Error('SAT_RECONCILIATION_NOT_FOUND');
  }

  return await prisma.conciliacionFiscal.update({
    where: {
      id_conciliacion: conciliacionId,
    },
    data: {
      estatus_sat: 'VALIDACION_EN_PROCESO',
      ultima_verificacion_sat_at: new Date(),
      sat_requested_at: new Date(),
      sat_next_retry_at: null,
      sat_dlq_at: null,
      sat_retry_count: 0,
      sat_dispatch_id: buildSatDispatchId(),
      sat_last_completed_dispatch_id: null,
      sat_processing_started_at: null,
      sat_last_error: null,
      fuente: 'SAT_ASYNC_REQUEST',
      mensaje_sat: 'Validacion SAT solicitada a integracion externa.',
      notas: appendNote(existing.notas, 'Solicitud de validacion SAT enviada a integracion externa.'),
    },
  });
}

async function claimSatDispatch(
  prisma: any,
  tenantId: string,
  claim: {
    id_conciliacion: string;
    dispatch_id: string;
    attempt: number;
  }
) {
  const conciliacion = await prisma.conciliacionFiscal.findFirst({
    where: {
      tenant_id: tenantId,
      id_conciliacion: claim.id_conciliacion,
    },
  });

  if (!conciliacion) {
    throw new Error('SAT_RECONCILIATION_NOT_FOUND');
  }

  if (conciliacion.sat_last_completed_dispatch_id === claim.dispatch_id) {
    return { claimed: false, reason: 'ALREADY_COMPLETED', conciliacion };
  }

  if (conciliacion.sat_dispatch_id !== claim.dispatch_id) {
    return { claimed: false, reason: 'STALE_DISPATCH', conciliacion };
  }

  if (conciliacion.estatus_sat !== 'VALIDACION_EN_PROCESO') {
    return { claimed: false, reason: 'NOT_PENDING', conciliacion };
  }

  if (conciliacion.sat_processing_started_at) {
    return { claimed: false, reason: 'ALREADY_CLAIMED', conciliacion };
  }

  const updated = await prisma.conciliacionFiscal.update({
    where: {
      id_conciliacion: claim.id_conciliacion,
    },
    data: {
      sat_processing_started_at: new Date(),
      sat_retry_count: Math.max(Number(conciliacion.sat_retry_count || 0), Math.max(claim.attempt - 1, 0)),
    },
  });

  return { claimed: true, reason: 'CLAIMED', conciliacion: updated };
}

async function registerSatFailure(
  prisma: any,
  tenantId: string,
  failure: {
    id_conciliacion: string;
    dispatch_id: string;
    attempt: number;
    max_attempts: number;
    error_message: string;
    next_dispatch_id?: string;
    next_retry_at?: string;
    moved_to_dlq?: boolean;
    fuente?: string;
    notas?: string;
  }
) {
  const conciliacion = await prisma.conciliacionFiscal.findFirst({
    where: {
      tenant_id: tenantId,
      id_conciliacion: failure.id_conciliacion,
    },
  });

  if (!conciliacion) {
    throw new Error('SAT_RECONCILIATION_NOT_FOUND');
  }

  return await prisma.conciliacionFiscal.update({
    where: {
      id_conciliacion: conciliacion.id_conciliacion,
    },
    data: {
      estatus_sat: 'VALIDACION_EN_PROCESO',
      ultima_verificacion_sat_at: new Date(),
      sat_retry_count: failure.attempt,
      sat_dispatch_id: failure.moved_to_dlq ? null : (failure.next_dispatch_id || conciliacion.sat_dispatch_id),
      sat_last_completed_dispatch_id: failure.dispatch_id,
      sat_processing_started_at: null,
      sat_last_error: failure.error_message,
      sat_next_retry_at: failure.next_retry_at ? new Date(failure.next_retry_at) : null,
      sat_dlq_at: failure.moved_to_dlq ? new Date() : conciliacion.sat_dlq_at,
      fuente: failure.fuente || 'SAT_ASYNC_WORKER',
      mensaje_sat: failure.moved_to_dlq
        ? `Validacion SAT movida a DLQ tras ${failure.attempt}/${failure.max_attempts} intentos.`
        : `Validacion SAT reintentable ${failure.attempt}/${failure.max_attempts}.`,
      notas: failure.notas ? appendNote(conciliacion.notas, failure.notas) : conciliacion.notas,
    },
  });
}

async function applySatValidationResult(
  prisma: any,
  tenantId: string,
  conciliacionId: string,
  result: {
    estatus_sat: 'VIGENTE' | 'CANCELADO';
    fecha_validacion_sat?: string;
    fecha_cancelacion_sat?: string;
    dispatch_id?: string;
    fuente?: string;
    mensaje_sat?: string;
    notas?: string;
  }
) {
  return await applyIdempotentMutation({
    load: async () => {
      const conciliacion = await prisma.conciliacionFiscal.findFirst({
        where: {
          tenant_id: tenantId,
          id_conciliacion: conciliacionId,
        },
      });

      if (!conciliacion) {
        throw new Error('SAT_RECONCILIATION_NOT_FOUND');
      }

      if (!conciliacion.uuid_fiscal) {
        throw new Error('SAT_UUID_MISSING');
      }

      const asiento = await prisma.asientoContable.findFirst({
        where: {
          tenant_id: tenantId,
          id_asiento: conciliacion.asiento_id,
        },
      });

      if (!asiento) {
        throw new Error('ASIENTO_NOT_FOUND');
      }

      return {
        conciliacion,
        asiento,
        nextCfdiStatus: mapSatStatusToCfdiStatus(result.estatus_sat),
      };
    },
    idempotentResult: async (loaded) => {
      if (
        loaded.conciliacion.estatus_sat === result.estatus_sat &&
        loaded.asiento.cfdi_status === loaded.nextCfdiStatus
      ) {
        return {
          asiento: loaded.asiento,
          conciliacion: loaded.conciliacion,
          idempotente: true,
        };
      }

      return null;
    },
    apply: async (loaded) => {
      const conciliacionActualizada = await prisma.conciliacionFiscal.update({
        where: {
          id_conciliacion: loaded.conciliacion.id_conciliacion,
        },
        data: {
          estatus_sat: result.estatus_sat,
          fecha_validacion_sat: result.fecha_validacion_sat ? new Date(result.fecha_validacion_sat) : new Date(),
          fecha_cancelacion_sat: result.estatus_sat === 'CANCELADO'
            ? (result.fecha_cancelacion_sat ? new Date(result.fecha_cancelacion_sat) : new Date())
            : null,
          ultima_verificacion_sat_at: new Date(),
          sat_next_retry_at: null,
          sat_dlq_at: null,
          sat_processing_started_at: null,
          sat_last_completed_dispatch_id: result.dispatch_id || loaded.conciliacion.sat_last_completed_dispatch_id,
          sat_last_error: null,
          fuente: result.fuente || 'SAT_MOCK',
          mensaje_sat: result.mensaje_sat || null,
          notas: result.notas ? appendNote(loaded.conciliacion.notas, result.notas) : loaded.conciliacion.notas,
        },
      });

      await prisma.asientoContable.update({
        where: {
          id_asiento: loaded.asiento.id_asiento,
        },
        data: {
          cfdi_status: loaded.nextCfdiStatus,
          notas: appendNote(
            loaded.asiento.notas,
            result.estatus_sat === 'VIGENTE'
              ? `SAT valido CFDI ${loaded.conciliacion.uuid_fiscal} como VIGENTE.`
              : `SAT reporta CFDI ${loaded.conciliacion.uuid_fiscal} como CANCELADO.`
          ),
        },
      });

      const asientoActualizado = await syncPagoAccountingCloseStatus(prisma, tenantId, loaded.asiento.id_asiento);

      return {
        asiento: asientoActualizado,
        conciliacion: conciliacionActualizada,
        idempotente: false,
      };
    },
  });
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function pickRowValue(row: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const entry = Object.entries(row).find(([key]) => normalizeHeader(String(key)) === normalizedAlias);
    if (entry && entry[1] !== undefined && entry[1] !== null && String(entry[1]).trim() !== '') {
      return String(entry[1]).trim();
    }
  }

  return undefined;
}

function parseNumericCell(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/[$,\s]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBankStatementFile(fileName: string, fileBase64: string, sheetName?: string) {
  const sanitizedBase64 = fileBase64.includes(',')
    ? fileBase64.slice(fileBase64.indexOf(',') + 1)
    : fileBase64;
  const buffer = Buffer.from(sanitizedBase64, 'base64');
  const extension = fileName.toLowerCase().split('.').pop();

  if (!extension || !['csv', 'xlsx', 'xls'].includes(extension)) {
    throw new Error('BANK_FILE_UNSUPPORTED_FORMAT');
  }

  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    raw: false,
    cellDates: true,
  });

  const targetSheetName = sheetName || workbook.SheetNames[0];
  if (!targetSheetName || !workbook.Sheets[targetSheetName]) {
    throw new Error('BANK_FILE_SHEET_NOT_FOUND');
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[targetSheetName], {
    defval: '',
    raw: false,
  });

  return {
    sheetName: targetSheetName,
    rowCount: rows.length,
    rows,
  };
}

type InvalidBankFileItem = NormalizedBankFileItem & {
  errors: string[];
};

function validateBankStatementRows(rows: Record<string, unknown>[]) {
  const validItems: NormalizedBankFileItem[] = [];
  const invalidItems: InvalidBankFileItem[] = [];

  rows.forEach((row, index) => {
    const referenciaBancaria = pickRowValue(row, ['referencia_bancaria', 'referencia', 'ref_bancaria', 'folio_bancario']);
    const idAsiento = pickRowValue(row, ['id_asiento', 'asiento_id']);
    const montoBanco = parseNumericCell(pickRowValue(row, ['monto_banco', 'monto', 'importe', 'importe_movimiento']));
    const fechaMovimientoBancario = pickRowValue(row, ['fecha_movimiento_bancario', 'fecha_movimiento', 'fecha', 'fecha_operacion']);
    const banco = pickRowValue(row, ['banco']);
    const metodoPago = pickRowValue(row, ['metodo_pago', 'metodo']);
    const moneda = pickRowValue(row, ['moneda']);
    const referenciaLote = pickRowValue(row, ['referencia_lote', 'descripcion', 'concepto']);
    const notas = pickRowValue(row, ['notas', 'observaciones']);

    const errors: string[] = [];

    if (!idAsiento && !referenciaBancaria) {
      errors.push('Falta id_asiento o referencia_bancaria.');
    }

    if (typeof montoBanco !== 'number') {
      errors.push('Monto invalido o ausente.');
    }

    if (!fechaMovimientoBancario) {
      errors.push('Falta fecha_movimiento_bancario.');
    }

    const normalizedItem: NormalizedBankFileItem = {
      index,
      referencia_lote: referenciaLote,
      id_asiento: idAsiento,
      referencia_bancaria: referenciaBancaria,
      monto_banco: montoBanco,
      fecha_movimiento_bancario: fechaMovimientoBancario,
      banco,
      metodo_pago: metodoPago,
      moneda: moneda || 'MXN',
      notas,
    };

    if (errors.length > 0) {
      invalidItems.push({
        ...normalizedItem,
        errors,
      });
      return;
    }

    validItems.push(normalizedItem);
  });

  return {
    validItems,
    invalidItems,
  };
}

type BankReconciliationInput = {
  asientoId?: string;
  referenciaBancaria?: string;
  banco?: string;
  metodoPago?: string;
  montoBanco: number;
  moneda?: string;
  fechaMovimientoBancario: string;
  fuente?: string;
  notas?: string;
};

type NormalizedBankFileItem = {
  index: number;
  referencia_lote?: string;
  id_asiento?: string;
  referencia_bancaria?: string;
  monto_banco?: number;
  fecha_movimiento_bancario?: string;
  banco?: string;
  metodo_pago?: string;
  moneda?: string;
  notas?: string;
};

type BankReconciliationPrevalidationResult = {
  asiento: any;
  conciliacionExistente: any;
  bankReference: string;
  idempotente: boolean;
};

async function resolveBankReconciliationTarget(
  prisma: any,
  tenantId: string,
  input: { asientoId?: string; referenciaBancaria?: string }
) {
  let asiento;

  if (input.asientoId) {
    asiento = await prisma.asientoContable.findFirst({
      where: {
        tenant_id: tenantId,
        id_asiento: input.asientoId,
      },
    });
  } else if (input.referenciaBancaria) {
    const conciliacionBancaria = await prisma.conciliacionBancaria.findFirst({
      where: {
        tenant_id: tenantId,
        referencia_bancaria: input.referenciaBancaria,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (conciliacionBancaria) {
      asiento = await prisma.asientoContable.findFirst({
        where: {
          tenant_id: tenantId,
          id_asiento: conciliacionBancaria.asiento_id,
        },
      });
    }
  }

  if (!asiento) {
    throw new Error('ASIENTO_NOT_FOUND');
  }

  const conciliacionExistente = await prisma.conciliacionBancaria.findFirst({
    where: {
      tenant_id: tenantId,
      asiento_id: asiento.id_asiento,
    },
  });

  if (!conciliacionExistente) {
    throw new Error('BANK_RECONCILIATION_NOT_FOUND');
  }

  return {
    asiento,
    conciliacionExistente,
  };
}

async function prevalidateBankReconciliation(
  prisma: any,
  tenantId: string,
  input: BankReconciliationInput
): Promise<BankReconciliationPrevalidationResult> {
  const { asiento, conciliacionExistente } = await resolveBankReconciliationTarget(prisma, tenantId, {
    asientoId: input.asientoId,
    referenciaBancaria: input.referenciaBancaria,
  });

  if (asiento.bancario_status === 'NO_APLICA') {
    throw new Error('ASIENTO_BANK_NOT_APPLICABLE');
  }

  const montoAsiento = Number(asiento.monto_total);
  if (montoAsiento !== Number(input.montoBanco)) {
    throw new Error(`BANK_AMOUNT_MISMATCH:${montoAsiento}`);
  }

  const bankReference = input.referenciaBancaria || conciliacionExistente.referencia_bancaria;
  if (!bankReference) {
    throw new Error('BANK_REFERENCE_MISSING');
  }

  if (
    conciliacionExistente.referencia_bancaria &&
    input.referenciaBancaria &&
    conciliacionExistente.referencia_bancaria !== input.referenciaBancaria
  ) {
    throw new Error(`BANK_REFERENCE_MISMATCH:${conciliacionExistente.referencia_bancaria}`);
  }

  const idempotente = (
    conciliacionExistente.estatus_bancario === 'CONCILIADO' &&
    Number(conciliacionExistente.monto_banco || 0) === Number(input.montoBanco) &&
    conciliacionExistente.referencia_bancaria === bankReference
  );

  return {
    asiento,
    conciliacionExistente,
    bankReference,
    idempotente,
  };
}

async function reconcileBankMovement(
  prisma: any,
  tenantId: string,
  userId: string,
  input: BankReconciliationInput
) {
  return await applyIdempotentMutation({
    load: async () => await prevalidateBankReconciliation(prisma, tenantId, input),
    idempotentResult: async (loaded) => {
      if (!loaded.idempotente) {
        return null;
      }

      const asientoActual = await syncPagoAccountingCloseStatus(prisma, tenantId, loaded.asiento.id_asiento);
      return {
        asiento: asientoActual,
        conciliacion: loaded.conciliacionExistente,
        idempotente: true,
      };
    },
    apply: async (loaded) => {
      const conciliacion = await prisma.conciliacionBancaria.update({
        where: {
          id_conciliacion_bancaria: loaded.conciliacionExistente.id_conciliacion_bancaria,
        },
        data: {
          referencia_bancaria: loaded.bankReference,
          banco: input.banco || loaded.conciliacionExistente.banco,
          metodo_pago: input.metodoPago || loaded.conciliacionExistente.metodo_pago,
          monto_banco: input.montoBanco,
          moneda: input.moneda || loaded.conciliacionExistente.moneda || 'MXN',
          fecha_movimiento_bancario: new Date(input.fechaMovimientoBancario),
          estatus_bancario: 'CONCILIADO',
          fuente: input.fuente || 'ESTADO_CUENTA',
          fecha_conciliacion: new Date(),
          notas: input.notas ? appendNote(loaded.conciliacionExistente.notas, input.notas) : loaded.conciliacionExistente.notas,
        },
      });

      await prisma.asientoContable.update({
        where: {
          id_asiento: loaded.asiento.id_asiento,
        },
        data: {
          bancario_status: 'CONCILIADO',
          notas: appendNote(loaded.asiento.notas, `Conciliacion bancaria ${loaded.bankReference}.`),
        },
      });

      const asientoActualizado = await syncPagoAccountingCloseStatus(prisma, tenantId, loaded.asiento.id_asiento);

      return {
        asiento: asientoActualizado,
        conciliacion,
        idempotente: false,
      };
    },
  });
}

async function syncPagoAccountingCloseStatus(prisma: any, tenantId: string, asientoId: string) {
  const asiento = await prisma.asientoContable.findFirst({
    where: {
      tenant_id: tenantId,
      id_asiento: asientoId,
    },
  });

  if (!asiento || asiento.tipo_poliza !== 'EGRESO') {
    return asiento;
  }

  const conciliacionFiscal = await prisma.conciliacionFiscal.findFirst({
    where: {
      tenant_id: tenantId,
      asiento_id: asientoId,
    },
  });

  const conciliacionBancaria = await prisma.conciliacionBancaria.findFirst({
    where: {
      tenant_id: tenantId,
      asiento_id: asientoId,
    },
  });

  let estatus = 'REGISTRADO';
  let conciliadoAt: Date | null = null;

  if (conciliacionFiscal?.estatus_sat === 'CANCELADO') {
    estatus = 'OBSERVADO';
  } else if (
    conciliacionFiscal?.estatus_sat === 'VIGENTE' &&
    conciliacionBancaria?.estatus_bancario === 'CONCILIADO'
  ) {
    estatus = 'CERRADO';
    conciliadoAt = conciliacionBancaria.fecha_conciliacion || new Date();
  }

  return await prisma.asientoContable.update({
    where: {
      id_asiento: asientoId,
    },
    data: {
      estatus,
      conciliado_at: conciliadoAt,
    },
  });
}

async function persistAsientoFromEvent(
  event: BocamEvent,
  params: {
    externalEventKey: string;
    tipoPoliza: string;
    folioPoliza: string;
    concepto: string;
    montoTotal: number;
    fechaPoliza?: string;
    beneficiario: string;
    referenciaModulo?: string;
    referenciaEntidad?: string;
    referenciaId?: string;
    pagoId?: string;
    referenciaFuncional?: string;
    estatus?: string;
    cfdiStatus?: string;
    bancarioStatus?: string;
    notas?: string;
    createdAction: string;
    idempotentAction: string;
  }
) {
  const createResult = await createOrRecoverInTenantContext({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    findExisting: async (prisma) => {
      return await prisma.asientoContable.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          external_event_key: params.externalEventKey,
        },
      });
    },
    create: async (prisma) => {
      return await prisma.asientoContable.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          pago_id: params.pagoId,
          external_event_key: params.externalEventKey,
          referencia_funcional: params.referenciaFuncional,
          tipo_poliza: params.tipoPoliza,
          folio_poliza: params.folioPoliza,
          concepto: params.concepto,
          monto_total: params.montoTotal,
          fecha_poliza: params.fechaPoliza ? new Date(params.fechaPoliza) : new Date(),
          beneficiario: params.beneficiario,
          referencia_modulo: params.referenciaModulo,
          referencia_entidad: params.referenciaEntidad,
          referencia_id: params.referenciaId,
          estatus: params.estatus || 'REGISTRADO',
          cfdi_status: params.cfdiStatus || 'PENDIENTE',
          bancario_status: params.bancarioStatus || 'PENDIENTE',
          notas: params.notas,
        },
      });
    },
    recoverOnUniqueViolation: async (prisma) => {
      return await prisma.asientoContable.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          OR: [
            { external_event_key: params.externalEventKey },
            {
              proyecto_id: event.context.proyecto_id,
              folio_poliza: params.folioPoliza,
            },
          ],
        },
      });
    },
  });

  if (createResult.state !== 'created') {
    logTerminalState({
      terminalState: 'idempotent',
      actions: {
        notFound: params.idempotentAction,
        idempotent: createResult.state === 'race_recovered'
          ? `${params.idempotentAction}.race_recovered`
          : params.idempotentAction,
        applied: params.createdAction,
      },
      context: {
        eventType: event.event_type,
        correlationId: event.context.correlation_id,
        tenantId: event.context.tenant_id,
        proyectoId: event.context.proyecto_id,
      },
      extras: {
        external_event_key: params.externalEventKey,
        id_asiento: createResult.record.id_asiento,
      },
    });

    return {
      asiento: createResult.record,
      idempotent: true,
    };
  }

  logTerminalState({
    terminalState: 'applied',
    actions: {
      notFound: params.idempotentAction,
      idempotent: params.idempotentAction,
      applied: params.createdAction,
    },
    context: {
      eventType: event.event_type,
      correlationId: event.context.correlation_id,
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
    },
    extras: {
      external_event_key: params.externalEventKey,
      id_asiento: createResult.record.id_asiento,
    },
  });

  const result = {
    asiento: createResult.record,
    idempotent: false,
  };

  if (!result.idempotent) {
    await publishContabilidadDomainEvent(ContabilidadEvents.ASIENTO_CONTABLE_GENERADO, event.context, {
      id_asiento: result.asiento.id_asiento,
      pago_id: result.asiento.pago_id || undefined,
      external_event_key: result.asiento.external_event_key,
      tipo_poliza: result.asiento.tipo_poliza,
      folio_poliza: result.asiento.folio_poliza,
      monto_total: Number(result.asiento.monto_total),
      fecha_poliza: result.asiento.fecha_poliza.toISOString(),
      referencia_modulo: result.asiento.referencia_modulo || undefined,
      referencia_entidad: result.asiento.referencia_entidad || undefined,
      referencia_id: result.asiento.referencia_id || undefined,
      beneficiario: result.asiento.beneficiario,
      estatus: result.asiento.estatus,
      cfdi_status: result.asiento.cfdi_status,
      bancario_status: result.asiento.bancario_status,
    });
  }

  return result;
}

async function ensureFiscalReconciliationPlaceholder(
  event: BocamEvent<PagoRegistradoPayload>,
  asientoId: string,
  pagoId: string,
  montoPagado: number
) {
  const result = await createOrRecoverInTenantContext({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    findExisting: async (prisma) => {
      return await prisma.conciliacionFiscal.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          asiento_id: asientoId,
        },
      });
    },
    create: async (prisma) => {
      return await prisma.conciliacionFiscal.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          asiento_id: asientoId,
          pago_id: pagoId,
          monto_pagado: montoPagado,
          estatus_fiscal: 'PENDIENTE_CFDI',
          fuente: 'EVENTO_FINANZAS',
          notas: `Conciliacion fiscal abierta desde ${ContabilidadConsumedEvents.PAGO_REGISTRADO}.`,
        },
      });
    },
    recoverOnUniqueViolation: async (prisma) => {
      return await prisma.conciliacionFiscal.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          asiento_id: asientoId,
        },
      });
    },
  });

  const action = result.state === 'created'
    ? 'contabilidad.fiscal.placeholder.created'
    : result.state === 'race_recovered'
      ? 'contabilidad.fiscal.placeholder.idempotent.race_recovered'
      : 'contabilidad.fiscal.placeholder.idempotent';

  logTerminalState({
    terminalState: result.state === 'created' ? 'applied' : 'idempotent',
    actions: {
      notFound: action,
      idempotent: action,
      applied: action,
    },
    context: {
      eventType: event.event_type,
      correlationId: event.context.correlation_id,
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
    },
    extras: {
      id_asiento: asientoId,
      id_conciliacion: result.record.id_conciliacion,
    },
  });
}

async function ensureBankReconciliationPlaceholder(
  event: BocamEvent<PagoRegistradoPayload>,
  asientoId: string,
  payload: PagoRegistradoPayload
) {
  const result = await createOrRecoverInTenantContext({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    findExisting: async (prisma) => {
      return await prisma.conciliacionBancaria.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          asiento_id: asientoId,
        },
      });
    },
    create: async (prisma) => {
      return await prisma.conciliacionBancaria.create({
        data: {
          tenant_id: event.context.tenant_id,
          proyecto_id: event.context.proyecto_id,
          asiento_id: asientoId,
          pago_id: payload.id_pago,
          referencia_bancaria: payload.referencia_bancaria,
          banco: payload.banco,
          metodo_pago: payload.metodo_pago,
          monto_pagado: payload.monto_pagado,
          moneda: payload.moneda || 'MXN',
          fecha_pago_real: new Date(payload.fecha_pago_real),
          estatus_bancario: 'PENDIENTE_MOVIMIENTO',
          fuente: 'EVENTO_FINANZAS',
          notas: `Conciliacion bancaria abierta desde ${ContabilidadConsumedEvents.PAGO_REGISTRADO}.`,
        },
      });
    },
    recoverOnUniqueViolation: async (prisma) => {
      return await prisma.conciliacionBancaria.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          asiento_id: asientoId,
        },
      });
    },
  });

  const action = result.state === 'created'
    ? 'contabilidad.banco.placeholder.created'
    : result.state === 'race_recovered'
      ? 'contabilidad.banco.placeholder.idempotent.race_recovered'
      : 'contabilidad.banco.placeholder.idempotent';

  logTerminalState({
    terminalState: result.state === 'created' ? 'applied' : 'idempotent',
    actions: {
      notFound: action,
      idempotent: action,
      applied: action,
    },
    context: {
      eventType: event.event_type,
      correlationId: event.context.correlation_id,
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
    },
    extras: {
      id_asiento: asientoId,
      id_conciliacion_bancaria: result.record.id_conciliacion_bancaria,
    },
  });
}

export async function handlePagoRegistradoEvent(event: BocamEvent<PagoRegistradoPayload>): Promise<void> {
  const payload = event.payload || ({} as PagoRegistradoPayload);

  if (
    !payload.id_pago ||
    !payload.presupuesto_id ||
    typeof payload.monto_pagado !== 'number' ||
    !payload.fecha_pago_real ||
    !payload.concepto ||
    !payload.beneficiario
  ) {
    console.warn(JSON.stringify({
      action: 'contabilidad.event.finanzas.pago_registrado.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      tenant_id: event.context?.tenant_id,
      proyecto_id: event.context?.proyecto_id,
      payload,
    }));
    return;
  }

  const result = await persistAsientoFromEvent(event, {
    externalEventKey: `${ContabilidadConsumedEvents.PAGO_REGISTRADO}:${payload.id_pago}`,
    tipoPoliza: 'EGRESO',
    folioPoliza: buildFolioPoliza(payload.id_pago, payload.fecha_pago_real),
    concepto: payload.concepto,
    montoTotal: payload.monto_pagado,
    fechaPoliza: payload.fecha_pago_real,
    beneficiario: payload.beneficiario,
    referenciaModulo: payload.referencia_modulo,
    referenciaEntidad: payload.referencia_entidad,
    referenciaId: payload.referencia_id,
    pagoId: payload.id_pago,
    estatus: 'REGISTRADO',
    cfdiStatus: 'PENDIENTE',
    bancarioStatus: 'PENDIENTE',
    notas: `Asiento generado desde ${ContabilidadConsumedEvents.PAGO_REGISTRADO}. Presupuesto: ${payload.presupuesto_id}.`,
    createdAction: 'contabilidad.event.finanzas.pago_registrado.created',
    idempotentAction: 'contabilidad.event.finanzas.pago_registrado.idempotent',
  });

  await ensureFiscalReconciliationPlaceholder(
    event,
    result.asiento.id_asiento,
    payload.id_pago,
    payload.monto_pagado
  );
  await ensureBankReconciliationPlaceholder(
    event,
    result.asiento.id_asiento,
    payload
  );
}

export async function handleOrdenCompraCreadaEvent(event: BocamEvent<OrdenCompraCreadaPayload>): Promise<void> {
  const payload = event.payload || ({} as OrdenCompraCreadaPayload);

  if (
    !payload.oc_id ||
    !payload.codigo ||
    typeof payload.total !== 'number' ||
    !payload.proveedor_id ||
    !payload.presupuesto_id
  ) {
    console.warn(JSON.stringify({
      action: 'contabilidad.event.compras.oc_creada.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      tenant_id: event.context?.tenant_id,
      proyecto_id: event.context?.proyecto_id,
      payload,
    }));
    return;
  }

  await persistAsientoFromEvent(event, {
    externalEventKey: `${ContabilidadConsumedEvents.ORDEN_COMPRA_CREADA}:${payload.oc_id}`,
    tipoPoliza: 'PASIVO_PROYECTADO',
    folioPoliza: buildFolioByPrefix('POL-PAS', payload.oc_id),
    concepto: `Pasivo proyectado por ${payload.codigo}`,
    montoTotal: payload.total,
    beneficiario: payload.proveedor_id,
    referenciaModulo: 'compras',
    referenciaEntidad: 'OrdenCompra',
    referenciaId: payload.oc_id,
    referenciaFuncional: buildFunctionalReference('OC', payload.oc_id),
    estatus: 'PROYECTADO',
    cfdiStatus: 'NO_APLICA',
    bancarioStatus: 'NO_APLICA',
    notas: `Pasivo proyectado generado desde compras.oc_creada. Presupuesto: ${payload.presupuesto_id}.`,
    createdAction: 'contabilidad.event.compras.oc_creada.created',
    idempotentAction: 'contabilidad.event.compras.oc_creada.idempotent',
  });
}

export async function handleTransferenciaPresupuestalEvent(event: BocamEvent<TransferenciaPresupuestalPayload>): Promise<void> {
  const payload = event.payload || ({} as TransferenciaPresupuestalPayload);

  if (
    !payload.transferencia_id ||
    !payload.movimiento_origen_id ||
    !payload.movimiento_destino_id ||
    !payload.presupuesto_origen_id ||
    !payload.presupuesto_destino_id ||
    typeof payload.monto_transferido !== 'number' ||
    !payload.concepto
  ) {
    console.warn(JSON.stringify({
      action: 'contabilidad.event.finanzas.transferencia_presupuestal.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      tenant_id: event.context?.tenant_id,
      proyecto_id: event.context?.proyecto_id,
      payload,
    }));
    return;
  }

  await persistAsientoFromEvent(event, {
    externalEventKey: `${ContabilidadConsumedEvents.TRANSFERENCIA_PRESUPUESTAL}:${payload.transferencia_id}`,
    tipoPoliza: 'TRANSFERENCIA_INTERNA',
    folioPoliza: buildFolioByPrefix('POL-TRF', payload.transferencia_id),
    concepto: payload.concepto,
    montoTotal: payload.monto_transferido,
    beneficiario: 'TRANSFERENCIA INTERNA',
    referenciaModulo: 'finanzas',
    referenciaEntidad: 'TransferenciaPresupuestal',
    referenciaId: payload.transferencia_id,
    referenciaFuncional: buildFunctionalReference('TRF', payload.transferencia_id),
    estatus: 'REGISTRADO',
    cfdiStatus: 'NO_APLICA',
    bancarioStatus: 'NO_APLICA',
    notas: `Transferencia interna de ${payload.codigo_origen} (${payload.capitulo_origen}) hacia ${payload.codigo_destino} (${payload.capitulo_destino}).`,
    createdAction: 'contabilidad.event.finanzas.transferencia_presupuestal.created',
    idempotentAction: 'contabilidad.event.finanzas.transferencia_presupuestal.idempotent',
  });
}

export async function handleOrdenCompraCanceladaEvent(event: BocamEvent<OrdenCompraCanceladaPayload>): Promise<void> {
  const payload = event.payload || ({} as OrdenCompraCanceladaPayload);

  if (
    !payload.oc_id ||
    !payload.codigo ||
    typeof payload.total !== 'number'
  ) {
    console.warn(JSON.stringify({
      action: 'contabilidad.event.compras.oc_cancelada.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      tenant_id: event.context?.tenant_id,
      proyecto_id: event.context?.proyecto_id,
      payload,
    }));
    return;
  }

  await createTenantContext(
    {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    async (prisma) => {
      const pasivoOriginal = await prisma.asientoContable.findFirst({
        where: {
          tenant_id: event.context.tenant_id,
          external_event_key: `${ContabilidadConsumedEvents.ORDEN_COMPRA_CREADA}:${payload.oc_id}`,
        },
      });

      if (pasivoOriginal && pasivoOriginal.estatus !== 'REVERTIDO') {
        await prisma.asientoContable.update({
          where: {
            id_asiento: pasivoOriginal.id_asiento,
          },
          data: {
            estatus: 'REVERTIDO',
            notas: `${pasivoOriginal.notas || ''} Revertido por compras.oc_cancelada.`.trim(),
          },
        });
      }
    }
  );

  await persistAsientoFromEvent(event, {
    externalEventKey: `${ContabilidadConsumedEvents.ORDEN_COMPRA_CANCELADA}:${payload.oc_id}`,
    tipoPoliza: 'REVERSION_PASIVO_PROYECTADO',
    folioPoliza: buildFolioByPrefix('POL-REV', payload.oc_id),
    concepto: `Reversion de pasivo proyectado por cancelacion de ${payload.codigo}`,
    montoTotal: payload.total,
    beneficiario: 'REVERSA OC CANCELADA',
    referenciaModulo: 'compras',
    referenciaEntidad: 'OrdenCompra',
    referenciaId: payload.oc_id,
    referenciaFuncional: buildFunctionalReference('OC', payload.oc_id),
    estatus: 'REVERTIDO',
    cfdiStatus: 'NO_APLICA',
    bancarioStatus: 'NO_APLICA',
    notas: `Reversion contable generada desde compras.oc_cancelada. Presupuesto: ${payload.presupuesto_id || 'n/a'}.`,
    createdAction: 'contabilidad.event.compras.oc_cancelada.created',
    idempotentAction: 'contabilidad.event.compras.oc_cancelada.idempotent',
  });
}

export async function handleFondosLiberadosEvent(event: BocamEvent<FondosLiberadosPayload>): Promise<void> {
  const payload = event.payload || ({} as FondosLiberadosPayload);

  if (
    !payload.presupuesto_id ||
    !payload.movimiento_id ||
    typeof payload.monto_liberado !== 'number' ||
    !payload.referencia_oc_id ||
    !payload.referencia_oc_codigo
  ) {
    console.warn(JSON.stringify({
      action: 'contabilidad.event.finanzas.fondos_liberados.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      tenant_id: event.context?.tenant_id,
      proyecto_id: event.context?.proyecto_id,
      payload,
    }));
    return;
  }

  const referenciaFuncional = buildFunctionalReference('OC', payload.referencia_oc_id);
  const reconciliationKey = `${ContabilidadConsumedEvents.FONDOS_LIBERADOS}:${payload.movimiento_id}`;
  const reconciliationResult = await reconcileAsientoByFunctionalReference({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    referenciaFuncional,
    tipoPoliza: 'REVERSION_PASIVO_PROYECTADO',
    reconciliationKey,
    noteToAppend: `Conciliado con finanzas.fondos_liberados movimiento ${payload.movimiento_id} por ${payload.monto_liberado}.`,
  });

  logFunctionalReconciliationTerminalState({
    event,
    result: reconciliationResult,
    referenciaFuncional,
    movimientoId: payload.movimiento_id,
    notFoundAction: 'contabilidad.event.finanzas.fondos_liberados.reverse_entry_not_found',
    idempotentAction: 'contabilidad.event.finanzas.fondos_liberados.idempotent',
    appliedAction: 'contabilidad.event.finanzas.fondos_liberados.conciliated',
  });
}

export async function handleFondosComprometidosEvent(event: BocamEvent<FondosComprometidosPayload>): Promise<void> {
  const payload = event.payload || ({} as FondosComprometidosPayload);

  if (
    !payload.presupuesto_id ||
    !payload.movimiento_id ||
    typeof payload.monto_comprometido !== 'number' ||
    typeof payload.monto_disponible_restante !== 'number' ||
    !payload.referencia_oc_id ||
    !payload.referencia_oc_codigo
  ) {
    console.warn(JSON.stringify({
      action: 'contabilidad.event.finanzas.fondos_comprometidos.invalid_payload',
      event_type: event.event_type,
      correlation_id: event.context?.correlation_id,
      tenant_id: event.context?.tenant_id,
      proyecto_id: event.context?.proyecto_id,
      payload,
    }));
    return;
  }

  const referenciaFuncional = buildFunctionalReference('OC', payload.referencia_oc_id);
  const reconciliationKey = `${ContabilidadConsumedEvents.FONDOS_COMPROMETIDOS}:${payload.movimiento_id}`;
  const reconciliationResult = await reconcileAsientoByFunctionalReference({
    context: {
      tenantId: event.context.tenant_id,
      proyectoId: event.context.proyecto_id,
      userId: event.context.user_id,
    },
    referenciaFuncional,
    tipoPoliza: 'PASIVO_PROYECTADO',
    reconciliationKey,
    noteToAppend: `Conciliado con finanzas.fondos_comprometidos movimiento ${payload.movimiento_id} por ${payload.monto_comprometido}. Disponible restante: ${payload.monto_disponible_restante}.`,
  });

  logFunctionalReconciliationTerminalState({
    event,
    result: reconciliationResult,
    referenciaFuncional,
    movimientoId: payload.movimiento_id,
    notFoundAction: 'contabilidad.event.finanzas.fondos_comprometidos.projected_liability_not_found',
    idempotentAction: 'contabilidad.event.finanzas.fondos_comprometidos.idempotent',
    appliedAction: 'contabilidad.event.finanzas.fondos_comprometidos.conciliated',
  });
}

export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('contabilidad'));

const PORT = process.env.PORT || 3008;
const JWT_SECRET = requireEnv('JWT_SECRET');
const INTEGRATION_CALLBACK_PATHS = [
  '/api/v1/contabilidad/integraciones/sat/claim-dispatch',
  '/api/v1/contabilidad/integraciones/sat/callback',
  '/api/v1/contabilidad/integraciones/sat/failure-callback',
];

app.use(createAuthMiddleware({
  jwtSecret: JWT_SECRET,
  excludePaths: ['/health', ...INTEGRATION_CALLBACK_PATHS],
}));
app.use((req: Request, res: Response, next) => {
  if (INTEGRATION_CALLBACK_PATHS.includes(req.path)) {
    next();
    return;
  }

  return requireProjectAccess()(req, res, next);
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    module: 'contabilidad',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get(
  '/api/v1/contabilidad/asientos',
  requireRoles('admin', 'finance', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          return await prisma.asientoContable.findMany({
            orderBy: {
              created_at: 'desc',
            },
          });
        }
      );

      logInfo(req, 'contabilidad', 'contabilidad.asientos.listed', 'Asientos contables listados', {
        count: data.length,
      });
      res.json(createApiResponse(data, tenantId, proyectoId, correlationId));
    } catch (error: any) {
      logWarn(req, 'contabilidad', 'contabilidad.asientos.error', 'Error al listar asientos contables', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_INTERNAL_ERROR', 'Error al listar asientos contables.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/asientos/:id/conciliar-cfdi',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const asientoId = req.params.id;
      const {
        uuid_fiscal,
        serie,
        folio,
        rfc_emisor,
        rfc_receptor,
        monto_total,
        moneda,
        fecha_emision,
        fecha_timbrado,
        fuente,
        notas,
      } = req.body as ConciliarCfdiRequest;

      if (
        !asientoId ||
        !uuid_fiscal ||
        !rfc_emisor ||
        !rfc_receptor ||
        typeof monto_total !== 'number' ||
        !fecha_emision
      ) {
        res.status(400).json(createApiError(
          'CONT_CFDI_MISSING_FIELDS',
          'Los campos uuid_fiscal, rfc_emisor, rfc_receptor, monto_total y fecha_emision son obligatorios.',
          undefined,
          correlationId
        ));
        return;
      }

      const data = await applyIdempotentMutationInTenantContext({
        context: { tenantId, proyectoId, userId },
        load: async (prisma) => {
          const asiento = await prisma.asientoContable.findFirst({
            where: {
              tenant_id: tenantId,
              id_asiento: asientoId,
            },
          });

          if (!asiento) {
            throw new Error('ASIENTO_NOT_FOUND');
          }

          if (asiento.cfdi_status === 'NO_APLICA') {
            throw new Error('ASIENTO_CFDI_NOT_APPLICABLE');
          }

          const montoAsiento = Number(asiento.monto_total);
          if (montoAsiento !== Number(monto_total)) {
            throw new Error(`CFDI_AMOUNT_MISMATCH:${montoAsiento}`);
          }

          const conciliacionExistente = await prisma.conciliacionFiscal.findFirst({
            where: {
              tenant_id: tenantId,
              asiento_id: asientoId,
            },
          });

          if (!conciliacionExistente) {
            throw new Error('CFDI_RECONCILIATION_NOT_FOUND');
          }

          return {
            asiento,
            conciliacionExistente,
          };
        },
        idempotentResult: async ({ asiento, conciliacionExistente }) => {
          if (
            conciliacionExistente.uuid_fiscal === uuid_fiscal &&
            conciliacionExistente.estatus_fiscal === 'CONCILIADO' &&
            ['CONCILIADO', 'SAT_VIGENTE', 'SAT_CANCELADO'].includes(asiento.cfdi_status)
          ) {
            return {
              asiento,
              conciliacion: conciliacionExistente,
              idempotente: true,
            };
          }

          return null;
        },
        apply: async ({ asiento, conciliacionExistente }, prisma) => {
          const conciliacion = await prisma.conciliacionFiscal.update({
            where: {
              id_conciliacion: conciliacionExistente.id_conciliacion,
            },
            data: {
              uuid_fiscal,
              serie,
              folio,
              rfc_emisor,
              rfc_receptor,
              monto_cfdi: monto_total,
              moneda: moneda || 'MXN',
              fecha_emision: new Date(fecha_emision),
              fecha_timbrado: fecha_timbrado ? new Date(fecha_timbrado) : null,
              estatus_fiscal: 'CONCILIADO',
              fuente: fuente || 'MANUAL',
              fecha_conciliacion: new Date(),
              notas: notas ? appendNote(conciliacionExistente.notas, notas) : conciliacionExistente.notas,
            },
          });

          const asientoActualizado = await prisma.asientoContable.update({
            where: {
              id_asiento: asiento.id_asiento,
            },
            data: {
              cfdi_status: 'CONCILIADO',
              notas: appendNote(asiento.notas, `CFDI conciliado ${uuid_fiscal}.`),
            },
          });

          return {
            asiento: asientoActualizado,
            conciliacion,
            idempotente: false,
          };
        },
      });

      if (!data.idempotente) {
        await publishContabilidadDomainEvent(ContabilidadEvents.CFDI_CONCILIADO, {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          user_id: userId,
          correlation_id: correlationId,
        }, {
          id_asiento: data.asiento.id_asiento,
          pago_id: data.conciliacion.pago_id || undefined,
          id_conciliacion: data.conciliacion.id_conciliacion,
          uuid_fiscal: data.conciliacion.uuid_fiscal!,
          estatus_fiscal: data.conciliacion.estatus_fiscal,
          cfdi_status: data.asiento.cfdi_status,
        });
      }

      logInfo(req, 'contabilidad', 'contabilidad.cfdi.conciliado', 'CFDI conciliado con asiento contable', {
        id_asiento: data.asiento.id_asiento,
        pago_id: data.conciliacion.pago_id,
        id_conciliacion: data.conciliacion.id_conciliacion,
        uuid_fiscal: data.conciliacion.uuid_fiscal,
        idempotent: data.idempotente,
      });

      const response = buildTerminalHttpResponse({
        terminalState: data.idempotente ? 'idempotent' : 'applied',
        data,
        context: { tenantId, proyectoId, correlationId },
        buildBody: (result, context) => createApiResponse({
          id_asiento: result.asiento.id_asiento,
          pago_id: result.conciliacion.pago_id,
          id_conciliacion: result.conciliacion.id_conciliacion,
          uuid_fiscal: result.conciliacion.uuid_fiscal,
          estatus_fiscal: result.conciliacion.estatus_fiscal,
          cfdi_status: result.asiento.cfdi_status,
          idempotente: result.idempotente,
        }, context.tenantId, context.proyectoId, context.correlationId),
      });

      res.status(response.statusCode).json(response.body);
    } catch (error: any) {
      if (error.message === 'ASIENTO_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_ASIENTO_NOT_FOUND', 'Asiento contable no encontrado.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'ASIENTO_CFDI_NOT_APPLICABLE') {
        res.status(422).json(createApiError('CONT_CFDI_NOT_APPLICABLE', 'El asiento no admite conciliacion CFDI.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'CFDI_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_CFDI_NOT_FOUND', 'No existe conciliacion fiscal pendiente para este asiento.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message.startsWith('CFDI_AMOUNT_MISMATCH:')) {
        const asientoMonto = error.message.split(':')[1];
        res.status(422).json(createApiError('CONT_CFDI_AMOUNT_MISMATCH', `El monto del CFDI no coincide con el asiento (${asientoMonto}).`, undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.error', 'Error al conciliar CFDI', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_CFDI_INTERNAL_ERROR', 'Error al conciliar CFDI.', undefined, getCorrelationId(req)));
    }
  }
);

app.get(
  '/api/v1/contabilidad/conciliaciones-fiscales/monitoreo/sat-pendientes',
  requireRoles('admin', 'finance', 'superintendent'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const olderThanMinutes = Number(req.body?.older_than_minutes || req.query.older_than_minutes || '15');
      const thresholdMinutes = Number.isFinite(olderThanMinutes) && olderThanMinutes >= 0 ? olderThanMinutes : 15;
      const thresholdDate = new Date(Date.now() - thresholdMinutes * 60 * 1000);

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const conciliaciones = await prisma.conciliacionFiscal.findMany({
            where: {
              tenant_id: tenantId,
              estatus_sat: 'VALIDACION_EN_PROCESO',
              OR: [
                { sat_requested_at: { lte: thresholdDate } },
                { sat_dlq_at: { not: null } },
              ],
            },
            orderBy: [
              { sat_dlq_at: 'desc' },
              { sat_requested_at: 'asc' },
            ],
          });

          const items = await Promise.all(conciliaciones.map(async (conciliacion: any) => {
            const asiento = await prisma.asientoContable.findFirst({
              where: {
                tenant_id: tenantId,
                id_asiento: conciliacion.asiento_id,
              },
            });

            return {
              id_conciliacion: conciliacion.id_conciliacion,
              id_asiento: conciliacion.asiento_id,
              pago_id: conciliacion.pago_id,
              uuid_fiscal: conciliacion.uuid_fiscal,
              estatus_sat: conciliacion.estatus_sat,
              fuente: conciliacion.fuente,
              sat_requested_at: conciliacion.sat_requested_at,
              sat_next_retry_at: conciliacion.sat_next_retry_at,
              sat_dlq_at: conciliacion.sat_dlq_at,
              sat_retry_count: conciliacion.sat_retry_count,
              sat_last_error: conciliacion.sat_last_error,
              mensaje_sat: conciliacion.mensaje_sat,
              cfdi_status: asiento?.cfdi_status || null,
              estatus_asiento: asiento?.estatus || null,
              age_minutes: conciliacion.sat_requested_at
                ? Math.floor((Date.now() - new Date(conciliacion.sat_requested_at).getTime()) / 60000)
                : null,
            };
          }));

          return {
            threshold_minutes: thresholdMinutes,
            total: items.length,
            dlq_count: items.filter((item) => item.sat_dlq_at).length,
            retrying_count: items.filter((item) => !item.sat_dlq_at).length,
            items,
          };
        }
      );

      logInfo(req, 'contabilidad', 'contabilidad.cfdi.sat_monitor_listed', 'Monitor de validaciones SAT pendientes consultado', {
        threshold_minutes: data.threshold_minutes,
        total: data.total,
        dlq_count: data.dlq_count,
      });

      res.json(createApiResponse(data, tenantId, proyectoId, correlationId));
    } catch (error: any) {
      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_monitor_error', 'Error al consultar monitor SAT', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_MONITOR_INTERNAL_ERROR', 'Error al consultar monitor SAT.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/conciliaciones-fiscales/:id/reintentar-sat',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const conciliacionId = req.params.id;

      if (!conciliacionId) {
        res.status(400).json(createApiError('CONT_SAT_RETRY_INVALID_PAYLOAD', 'Se requiere id de conciliacion fiscal.', undefined, correlationId));
        return;
      }

      const requestPayload = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          await markSatValidationRequested(prisma, tenantId, conciliacionId);
          return await loadSatValidationRequestByConciliacionId(prisma, tenantId, conciliacionId);
        }
      );

      await publishContabilidadDomainEvent(ContabilidadEvents.CFDI_SAT_VALIDACION_SOLICITADA, {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: correlationId,
      }, {
        ...requestPayload,
        attempt: 1,
        max_attempts: getSatMaxAttempts(),
      });

      logInfo(req, 'contabilidad', 'contabilidad.cfdi.sat_retry_requested', 'Reintento manual SAT solicitado', {
        id_conciliacion: requestPayload.id_conciliacion,
        id_asiento: requestPayload.id_asiento,
        uuid_fiscal: requestPayload.uuid_fiscal,
      });

      res.status(202).json(createApiResponse({
        id_conciliacion: requestPayload.id_conciliacion,
        id_asiento: requestPayload.id_asiento,
        uuid_fiscal: requestPayload.uuid_fiscal,
        estatus_sat: 'VALIDACION_EN_PROCESO',
        queued: true,
        attempt: 1,
      }, tenantId, proyectoId, correlationId));
    } catch (error: any) {
      if (error.message === 'SAT_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_SAT_NOT_FOUND', 'Conciliacion fiscal no encontrada.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'SAT_UUID_MISSING') {
        res.status(422).json(createApiError('CONT_SAT_UUID_MISSING', 'La conciliacion fiscal todavia no tiene UUID CFDI.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'ASIENTO_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_ASIENTO_NOT_FOUND', 'Asiento contable no encontrado.', undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_retry_error', 'Error al solicitar reintento manual SAT', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_RETRY_INTERNAL_ERROR', 'Error al solicitar reintento manual SAT.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const conciliacionId = req.params.id;
      const {
        estatus_sat,
        fecha_validacion_sat,
        fecha_cancelacion_sat,
        fuente,
        mensaje_sat,
        notas,
      } = req.body as ValidarSatRequest;

      if (!conciliacionId || !estatus_sat || !['VIGENTE', 'CANCELADO'].includes(estatus_sat)) {
        res.status(400).json(createApiError(
          'CONT_SAT_INVALID_PAYLOAD',
          'Se requiere id de conciliacion y estatus_sat valido (VIGENTE o CANCELADO).',
          undefined,
          correlationId
        ));
        return;
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => applySatValidationResult(prisma, tenantId, conciliacionId, {
          estatus_sat,
          fecha_validacion_sat,
          fecha_cancelacion_sat,
          fuente: fuente || 'SAT_MOCK',
          mensaje_sat,
          notas,
        })
      );

      if (!data.idempotente) {
        await publishContabilidadDomainEvent(ContabilidadEvents.CFDI_SAT_VALIDADO, {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          user_id: userId,
          correlation_id: correlationId,
        }, {
          id_asiento: data.asiento.id_asiento,
          pago_id: data.conciliacion.pago_id || undefined,
          id_conciliacion: data.conciliacion.id_conciliacion,
          uuid_fiscal: data.conciliacion.uuid_fiscal!,
          estatus_sat: data.conciliacion.estatus_sat,
          cfdi_status: data.asiento.cfdi_status,
        });
      }

      logInfo(req, 'contabilidad', 'contabilidad.cfdi.sat_validado', 'CFDI validado contra SAT', {
        id_asiento: data.asiento.id_asiento,
        id_conciliacion: data.conciliacion.id_conciliacion,
        uuid_fiscal: data.conciliacion.uuid_fiscal,
        estatus_sat: data.conciliacion.estatus_sat,
        cfdi_status: data.asiento.cfdi_status,
        estatus_asiento: data.asiento.estatus,
        idempotent: data.idempotente,
      });

      const response = buildTerminalHttpResponse({
        terminalState: data.idempotente ? 'idempotent' : 'applied',
        data,
        context: { tenantId, proyectoId, correlationId },
        buildBody: (result, context) => createApiResponse({
          id_asiento: result.asiento.id_asiento,
          pago_id: result.conciliacion.pago_id,
          id_conciliacion: result.conciliacion.id_conciliacion,
          uuid_fiscal: result.conciliacion.uuid_fiscal,
          estatus_sat: result.conciliacion.estatus_sat,
          cfdi_status: result.asiento.cfdi_status,
          estatus_asiento: result.asiento.estatus,
          idempotente: result.idempotente,
        }, context.tenantId, context.proyectoId, context.correlationId),
      });

      res.status(response.statusCode).json(response.body);
    } catch (error: any) {
      if (error.message === 'SAT_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_SAT_NOT_FOUND', 'Conciliacion fiscal no encontrada.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'SAT_UUID_MISSING') {
        res.status(422).json(createApiError('CONT_SAT_UUID_MISSING', 'La conciliacion fiscal todavia no tiene UUID CFDI.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'ASIENTO_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_ASIENTO_NOT_FOUND', 'Asiento contable no encontrado.', undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_error', 'Error al validar estatus SAT', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_INTERNAL_ERROR', 'Error al validar estatus SAT.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/conciliaciones-fiscales/:id/validar-sat-externo',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const conciliacionId = req.params.id;
      const _body = req.body as ValidarSatExternoRequest;

      if (!conciliacionId) {
        res.status(400).json(createApiError(
          'CONT_SAT_EXTERNAL_INVALID_PAYLOAD',
          'Se requiere id de conciliacion fiscal.',
          undefined,
          correlationId
        ));
        return;
      }

      const callbackSecret = getSatCallbackSecret();
      if (!callbackSecret) {
        res.status(503).json(createApiError('CONT_SAT_CALLBACK_NOT_CONFIGURED', 'No hay secreto configurado para callback SAT.', undefined, correlationId));
        return;
      }

      const requestPayload = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma): Promise<SolicitudValidacionSatPayload> => {
          await markSatValidationRequested(prisma, tenantId, conciliacionId);
          return await loadSatValidationRequestByConciliacionId(prisma, tenantId, conciliacionId);
        }
      );

      await publishContabilidadDomainEvent(ContabilidadEvents.CFDI_SAT_VALIDACION_SOLICITADA, {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: userId,
        correlation_id: correlationId,
      }, requestPayload);

      logInfo(req, 'contabilidad', 'contabilidad.cfdi.sat_validacion_solicitada', 'Solicitud SAT enviada a integracion asyncrona', {
        id_asiento: requestPayload.id_asiento,
        id_conciliacion: requestPayload.id_conciliacion,
        uuid_fiscal: requestPayload.uuid_fiscal,
        callback_path: requestPayload.callback_path,
      });

      res.status(202).json(createApiResponse({
        id_asiento: requestPayload.id_asiento,
        pago_id: requestPayload.pago_id,
        id_conciliacion: requestPayload.id_conciliacion,
        uuid_fiscal: requestPayload.uuid_fiscal,
        estatus_sat: 'VALIDACION_EN_PROCESO',
        callback_path: requestPayload.callback_path,
        callback_method: requestPayload.callback_method,
        queued: true,
      }, tenantId, proyectoId, correlationId));
    } catch (error: any) {
      if (error.message === 'SAT_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_SAT_NOT_FOUND', 'Conciliacion fiscal no encontrada.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'SAT_UUID_MISSING') {
        res.status(422).json(createApiError('CONT_SAT_UUID_MISSING', 'La conciliacion fiscal todavia no tiene UUID CFDI.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'ASIENTO_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_ASIENTO_NOT_FOUND', 'Asiento contable no encontrado.', undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_solicitud_error', 'Error al solicitar validacion SAT asyncrona', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_EXTERNAL_INTERNAL_ERROR', 'Error al solicitar validacion SAT asyncrona.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/integraciones/sat/claim-dispatch',
  async (req: Request, res: Response) => {
    const correlationId = getCorrelationId(req);
    try {
      const callbackSecret = getSatCallbackSecret();
      if (!callbackSecret) {
        res.status(503).json(createApiError('CONT_SAT_CALLBACK_NOT_CONFIGURED', 'No hay secreto configurado para callback SAT.', undefined, correlationId));
        return;
      }

      const providedSecret = req.header('x-bocam-secret');
      if (!providedSecret || providedSecret !== callbackSecret) {
        res.status(401).json(createApiError('CONT_SAT_CALLBACK_UNAUTHORIZED', 'Callback SAT no autorizado.', undefined, correlationId));
        return;
      }

      const payload = req.body as SatClaimDispatchRequest;
      if (
        !payload?.tenant_id ||
        !payload?.proyecto_id ||
        !payload?.user_id ||
        !payload?.id_conciliacion ||
        !payload?.dispatch_id ||
        typeof payload?.attempt !== 'number'
      ) {
        res.status(400).json(createApiError(
          'CONT_SAT_CLAIM_INVALID_PAYLOAD',
          'El claim SAT requiere tenant_id, proyecto_id, user_id, id_conciliacion, dispatch_id y attempt.',
          undefined,
          correlationId
        ));
        return;
      }

      const data = await createTenantContext(
        {
          tenantId: payload.tenant_id,
          proyectoId: payload.proyecto_id,
          userId: payload.user_id,
        },
        async (prisma) => claimSatDispatch(prisma, payload.tenant_id, {
          id_conciliacion: payload.id_conciliacion,
          dispatch_id: payload.dispatch_id,
          attempt: payload.attempt,
        })
      );

      res.json(createApiResponse({
        claimed: data.claimed,
        reason: data.reason,
        id_conciliacion: data.conciliacion.id_conciliacion,
        sat_dispatch_id: data.conciliacion.sat_dispatch_id,
        sat_processing_started_at: data.conciliacion.sat_processing_started_at,
      }, payload.tenant_id, payload.proyecto_id, correlationId));
    } catch (error: any) {
      if (error.message === 'SAT_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_SAT_NOT_FOUND', 'Conciliacion fiscal no encontrada.', undefined, correlationId));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_claim_error', 'Error al reclamar dispatch SAT', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_CLAIM_INTERNAL_ERROR', 'Error al reclamar dispatch SAT.', undefined, correlationId));
    }
  }
);

app.post(
  '/api/v1/contabilidad/integraciones/sat/callback',
  async (req: Request, res: Response) => {
    const correlationId = getCorrelationId(req);
    try {
      const callbackSecret = getSatCallbackSecret();
      if (!callbackSecret) {
        res.status(503).json(createApiError('CONT_SAT_CALLBACK_NOT_CONFIGURED', 'No hay secreto configurado para callback SAT.', undefined, correlationId));
        return;
      }

      const providedSecret = req.header('x-bocam-secret');
      if (!providedSecret || providedSecret !== callbackSecret) {
        res.status(401).json(createApiError('CONT_SAT_CALLBACK_UNAUTHORIZED', 'Callback SAT no autorizado.', undefined, correlationId));
        return;
      }

      const payload = req.body as SatValidationCallbackRequest;
      if (
        !payload?.tenant_id ||
        !payload?.proyecto_id ||
        !payload?.user_id ||
        !payload?.id_conciliacion ||
        !payload?.estatus_sat ||
        !['VIGENTE', 'CANCELADO'].includes(payload.estatus_sat)
      ) {
        res.status(400).json(createApiError(
          'CONT_SAT_CALLBACK_INVALID_PAYLOAD',
          'El callback SAT requiere tenant_id, proyecto_id, user_id, id_conciliacion y estatus_sat valido.',
          undefined,
          correlationId
        ));
        return;
      }

      const data = await createTenantContext(
        {
          tenantId: payload.tenant_id,
          proyectoId: payload.proyecto_id,
          userId: payload.user_id,
        },
        async (prisma) => applySatValidationResult(prisma, payload.tenant_id, payload.id_conciliacion, {
          estatus_sat: payload.estatus_sat,
          fecha_validacion_sat: payload.fecha_validacion_sat,
          fecha_cancelacion_sat: payload.fecha_cancelacion_sat,
          dispatch_id: payload.dispatch_id,
          fuente: payload.fuente || 'SAT_CALLBACK',
          mensaje_sat: payload.mensaje_sat,
          notas: payload.provider_reference
            ? appendNote(payload.notas, `Referencia proveedor SAT ${payload.provider_reference}.`)
            : payload.notas,
        })
      );

      if (!data.idempotente) {
        await publishContabilidadDomainEvent(ContabilidadEvents.CFDI_SAT_VALIDADO, {
          tenant_id: payload.tenant_id,
          proyecto_id: payload.proyecto_id,
          user_id: payload.user_id,
          correlation_id: correlationId,
        }, {
          id_asiento: data.asiento.id_asiento,
          pago_id: data.conciliacion.pago_id || undefined,
          id_conciliacion: data.conciliacion.id_conciliacion,
          uuid_fiscal: data.conciliacion.uuid_fiscal!,
          estatus_sat: data.conciliacion.estatus_sat,
          cfdi_status: data.asiento.cfdi_status,
        });
      }

      logInfo(req, 'contabilidad', 'contabilidad.cfdi.sat_callback_aplicado', 'Resultado SAT aplicado desde callback externo', {
        tenant_id: payload.tenant_id,
        proyecto_id: payload.proyecto_id,
        user_id: payload.user_id,
        id_asiento: data.asiento.id_asiento,
        id_conciliacion: data.conciliacion.id_conciliacion,
        uuid_fiscal: data.conciliacion.uuid_fiscal,
        estatus_sat: data.conciliacion.estatus_sat,
        cfdi_status: data.asiento.cfdi_status,
        estatus_asiento: data.asiento.estatus,
        fuente: data.conciliacion.fuente,
        idempotent: data.idempotente,
      });

      res.json(createApiResponse({
        id_asiento: data.asiento.id_asiento,
        pago_id: data.conciliacion.pago_id,
        id_conciliacion: data.conciliacion.id_conciliacion,
        uuid_fiscal: data.conciliacion.uuid_fiscal,
        estatus_sat: data.conciliacion.estatus_sat,
        cfdi_status: data.asiento.cfdi_status,
        estatus_asiento: data.asiento.estatus,
        fuente: data.conciliacion.fuente,
        idempotente: data.idempotente,
      }, payload.tenant_id, payload.proyecto_id, correlationId));
    } catch (error: any) {
      if (error.message === 'SAT_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_SAT_NOT_FOUND', 'Conciliacion fiscal no encontrada.', undefined, correlationId));
        return;
      }

      if (error.message === 'SAT_UUID_MISSING') {
        res.status(422).json(createApiError('CONT_SAT_UUID_MISSING', 'La conciliacion fiscal todavia no tiene UUID CFDI.', undefined, correlationId));
        return;
      }

      if (error.message === 'ASIENTO_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_ASIENTO_NOT_FOUND', 'Asiento contable no encontrado.', undefined, correlationId));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_callback_error', 'Error al aplicar callback SAT externo', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_CALLBACK_INTERNAL_ERROR', 'Error al aplicar callback SAT externo.', undefined, correlationId));
    }
  }
);

app.post(
  '/api/v1/contabilidad/integraciones/sat/failure-callback',
  async (req: Request, res: Response) => {
    const correlationId = getCorrelationId(req);
    try {
      const callbackSecret = getSatCallbackSecret();
      if (!callbackSecret) {
        res.status(503).json(createApiError('CONT_SAT_CALLBACK_NOT_CONFIGURED', 'No hay secreto configurado para callback SAT.', undefined, correlationId));
        return;
      }

      const providedSecret = req.header('x-bocam-secret');
      if (!providedSecret || providedSecret !== callbackSecret) {
        res.status(401).json(createApiError('CONT_SAT_CALLBACK_UNAUTHORIZED', 'Callback SAT no autorizado.', undefined, correlationId));
        return;
      }

      const payload = req.body as SatFailureCallbackRequest;
      if (
        !payload?.tenant_id ||
        !payload?.proyecto_id ||
        !payload?.user_id ||
        !payload?.id_conciliacion ||
        typeof payload?.attempt !== 'number' ||
        typeof payload?.max_attempts !== 'number' ||
        !payload?.error_message
      ) {
        res.status(400).json(createApiError(
          'CONT_SAT_FAILURE_CALLBACK_INVALID_PAYLOAD',
          'El callback de fallo SAT requiere tenant_id, proyecto_id, user_id, id_conciliacion, attempt, max_attempts y error_message.',
          undefined,
          correlationId
        ));
        return;
      }

      const conciliacion = await createTenantContext(
        {
          tenantId: payload.tenant_id,
          proyectoId: payload.proyecto_id,
          userId: payload.user_id,
        },
        async (prisma) => registerSatFailure(prisma, payload.tenant_id, {
          id_conciliacion: payload.id_conciliacion,
          dispatch_id: payload.dispatch_id,
          attempt: payload.attempt,
          max_attempts: payload.max_attempts,
          error_message: payload.error_message,
          next_dispatch_id: payload.next_dispatch_id,
          next_retry_at: payload.next_retry_at,
          moved_to_dlq: payload.moved_to_dlq,
          fuente: payload.fuente || 'SAT_ASYNC_WORKER',
          notas: payload.notas,
        })
      );

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_failure_callback_aplicado', 'Fallo SAT registrado desde worker externo', {
        tenant_id: payload.tenant_id,
        proyecto_id: payload.proyecto_id,
        user_id: payload.user_id,
        id_conciliacion: conciliacion.id_conciliacion,
        attempt: payload.attempt,
        max_attempts: payload.max_attempts,
        moved_to_dlq: payload.moved_to_dlq === true,
      });

      res.json(createApiResponse({
        id_conciliacion: conciliacion.id_conciliacion,
        estatus_sat: conciliacion.estatus_sat,
        sat_retry_count: conciliacion.sat_retry_count,
        sat_next_retry_at: conciliacion.sat_next_retry_at,
        sat_dlq_at: conciliacion.sat_dlq_at,
        sat_last_error: conciliacion.sat_last_error,
      }, payload.tenant_id, payload.proyecto_id, correlationId));
    } catch (error: any) {
      if (error.message === 'SAT_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_SAT_NOT_FOUND', 'Conciliacion fiscal no encontrada.', undefined, correlationId));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.cfdi.sat_failure_callback_error', 'Error al aplicar callback de fallo SAT externo', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_SAT_FAILURE_CALLBACK_INTERNAL_ERROR', 'Error al aplicar callback de fallo SAT externo.', undefined, correlationId));
    }
  }
);

app.post(
  '/api/v1/contabilidad/asientos/:id/conciliar-banco',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const asientoId = req.params.id;
      const {
        referencia_bancaria,
        banco,
        metodo_pago,
        monto_banco,
        moneda,
        fecha_movimiento_bancario,
        fuente,
        notas,
      } = req.body as ConciliarBancoRequest;

      if (!asientoId || typeof monto_banco !== 'number' || !fecha_movimiento_bancario) {
        res.status(400).json(createApiError(
          'CONT_BANCO_MISSING_FIELDS',
          'Los campos monto_banco y fecha_movimiento_bancario son obligatorios.',
          undefined,
          correlationId
        ));
        return;
      }

      const data = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => reconcileBankMovement(prisma, tenantId, userId, {
          asientoId,
          referenciaBancaria: referencia_bancaria,
          banco,
          metodoPago: metodo_pago,
          montoBanco: monto_banco,
          moneda,
          fechaMovimientoBancario: fecha_movimiento_bancario,
          fuente,
          notas,
        })
      );

      if (!data.idempotente) {
        await publishContabilidadDomainEvent(ContabilidadEvents.CONCILIACION_BANCARIA_ACTUALIZADA, {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          user_id: userId,
          correlation_id: correlationId,
        }, {
          id_asiento: data.asiento.id_asiento,
          pago_id: data.conciliacion.pago_id || undefined,
          id_conciliacion_bancaria: data.conciliacion.id_conciliacion_bancaria,
          referencia_bancaria: data.conciliacion.referencia_bancaria || undefined,
          estatus_bancario: data.conciliacion.estatus_bancario,
          bancario_status: data.asiento.bancario_status,
        });
      }

      logInfo(req, 'contabilidad', 'contabilidad.banco.conciliado', 'Pago conciliado contra movimiento bancario', {
        id_asiento: data.asiento.id_asiento,
        pago_id: data.conciliacion.pago_id,
        id_conciliacion_bancaria: data.conciliacion.id_conciliacion_bancaria,
        referencia_bancaria: data.conciliacion.referencia_bancaria,
        estatus_bancario: data.conciliacion.estatus_bancario,
        estatus_asiento: data.asiento.estatus,
        idempotent: data.idempotente,
      });

      const response = buildTerminalHttpResponse({
        terminalState: data.idempotente ? 'idempotent' : 'applied',
        data,
        context: { tenantId, proyectoId, correlationId },
        buildBody: (result, context) => createApiResponse({
          id_asiento: result.asiento.id_asiento,
          pago_id: result.conciliacion.pago_id,
          id_conciliacion_bancaria: result.conciliacion.id_conciliacion_bancaria,
          referencia_bancaria: result.conciliacion.referencia_bancaria,
          estatus_bancario: result.conciliacion.estatus_bancario,
          bancario_status: result.asiento.bancario_status,
          estatus_asiento: result.asiento.estatus,
          idempotente: result.idempotente,
        }, context.tenantId, context.proyectoId, context.correlationId),
      });

      res.status(response.statusCode).json(response.body);
    } catch (error: any) {
      if (error.message === 'ASIENTO_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_ASIENTO_NOT_FOUND', 'Asiento contable no encontrado.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'ASIENTO_BANK_NOT_APPLICABLE') {
        res.status(422).json(createApiError('CONT_BANCO_NOT_APPLICABLE', 'El asiento no admite conciliacion bancaria.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'BANK_RECONCILIATION_NOT_FOUND') {
        res.status(404).json(createApiError('CONT_BANCO_NOT_FOUND', 'No existe conciliacion bancaria pendiente para este asiento.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'BANK_REFERENCE_MISSING') {
        res.status(422).json(createApiError('CONT_BANCO_REFERENCE_MISSING', 'No existe referencia bancaria disponible para conciliar este asiento.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message.startsWith('BANK_REFERENCE_MISMATCH:')) {
        const currentReference = error.message.split(':')[1];
        res.status(422).json(createApiError('CONT_BANCO_REFERENCE_MISMATCH', `La referencia bancaria no coincide con la registrada (${currentReference}).`, undefined, getCorrelationId(req)));
        return;
      }

      if (error.message.startsWith('BANK_AMOUNT_MISMATCH:')) {
        const asientoMonto = error.message.split(':')[1];
        res.status(422).json(createApiError('CONT_BANCO_AMOUNT_MISMATCH', `El monto bancario no coincide con el asiento (${asientoMonto}).`, undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.banco.error', 'Error al conciliar movimiento bancario', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_BANCO_INTERNAL_ERROR', 'Error al conciliar movimiento bancario.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/conciliaciones-bancarias/archivo/validar',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const {
        file_name,
        file_base64,
        sheet_name,
        lote_id,
      } = req.body as ConciliacionBancariaArchivoRequest;

      if (!file_name || !file_base64) {
        res.status(400).json(createApiError(
          'CONT_BANCO_ARCHIVO_MISSING_FIELDS',
          'Los campos file_name y file_base64 son obligatorios.',
          undefined,
          correlationId
        ));
        return;
      }

      const parsed = parseBankStatementFile(file_name, file_base64, sheet_name);
      const validation = validateBankStatementRows(parsed.rows);

      logInfo(req, 'contabilidad', 'contabilidad.banco.archivo.validado', 'Archivo bancario validado antes de conciliacion', {
        lote_id: lote_id || null,
        file_name,
        sheet_name: parsed.sheetName,
        total_rows: parsed.rowCount,
        valid_count: validation.validItems.length,
        invalid_count: validation.invalidItems.length,
      });

      res.json(createApiResponse({
        lote_id: lote_id || null,
        file_name,
        sheet_name: parsed.sheetName,
        total_rows: parsed.rowCount,
        valid_count: validation.validItems.length,
        invalid_count: validation.invalidItems.length,
        valid_items: validation.validItems,
        invalid_items: validation.invalidItems,
      }, tenantId, proyectoId, correlationId));
    } catch (error: any) {
      if (error.message === 'BANK_FILE_UNSUPPORTED_FORMAT') {
        res.status(422).json(createApiError('CONT_BANCO_ARCHIVO_FORMAT_UNSUPPORTED', 'El archivo debe ser CSV o XLSX.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'BANK_FILE_SHEET_NOT_FOUND') {
        res.status(422).json(createApiError('CONT_BANCO_ARCHIVO_SHEET_NOT_FOUND', 'La hoja indicada no existe en el archivo.', undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.banco.archivo.validado_error', 'Error al validar archivo bancario', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_BANCO_ARCHIVO_INTERNAL_ERROR', 'Error al validar archivo bancario.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/conciliaciones-bancarias/archivo/ejecutar',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const {
        file_name,
        file_base64,
        sheet_name,
        lote_id,
        allow_partial,
      } = req.body as ConciliacionBancariaArchivoRequest;

      if (!file_name || !file_base64) {
        res.status(400).json(createApiError(
          'CONT_BANCO_ARCHIVO_MISSING_FIELDS',
          'Los campos file_name y file_base64 son obligatorios.',
          undefined,
          correlationId
        ));
        return;
      }

      const parsed = parseBankStatementFile(file_name, file_base64, sheet_name);
      const validation = validateBankStatementRows(parsed.rows);

      if (validation.invalidItems.length > 0 && !allow_partial) {
        res.status(422).json(createApiError(
          'CONT_BANCO_ARCHIVO_INVALID_ROWS',
          'El archivo contiene filas invalidas. Corrigelas o usa allow_partial=true para ejecutar solo las validas.',
          {
            invalid_count: validation.invalidItems.length,
            invalid_items: validation.invalidItems,
          },
          correlationId
        ));
        return;
      }

      const executionItems: Array<NormalizedBankFileItem & { fuente: string }> = validation.validItems.map((item) => ({
        ...item,
        fuente: 'ESTADO_CUENTA_ARCHIVO',
      }));

      const results = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          if (!allow_partial) {
            const dryRunErrors: Array<Record<string, unknown>> = [];

            for (const item of executionItems) {
              try {
                await prevalidateBankReconciliation(prisma, tenantId, {
                  asientoId: item.id_asiento,
                  referenciaBancaria: item.referencia_bancaria,
                  banco: item.banco,
                  metodoPago: item.metodo_pago,
                  montoBanco: item.monto_banco!,
                  moneda: item.moneda,
                  fechaMovimientoBancario: item.fecha_movimiento_bancario!,
                  fuente: item.fuente,
                  notas: item.notas,
                });
              } catch (error: any) {
                dryRunErrors.push({
                  ...item,
                  success: false,
                  code: error.message || 'CONT_BANCO_ARCHIVO_ITEM_ERROR',
                  message: error.message || 'Error al prevalidar conciliacion bancaria desde archivo.',
                });
              }
            }

            if (dryRunErrors.length > 0) {
              throw Object.assign(new Error('BANK_FILE_EXECUTION_PREVALIDATION_FAILED'), {
                details: dryRunErrors,
              });
            }
          }

          const output: Array<Record<string, unknown>> = [];

          for (const item of executionItems) {
            const itemLabel = String(item.referencia_lote || item.referencia_bancaria || item.id_asiento || 'item');

            try {
              const result = await reconcileBankMovement(prisma, tenantId, userId, {
                asientoId: item.id_asiento as string | undefined,
                referenciaBancaria: item.referencia_bancaria as string | undefined,
                banco: item.banco as string | undefined,
                metodoPago: item.metodo_pago as string | undefined,
                montoBanco: item.monto_banco as number,
                moneda: item.moneda as string | undefined,
                fechaMovimientoBancario: item.fecha_movimiento_bancario as string,
                fuente: item.fuente as string | undefined,
                notas: item.notas as string | undefined,
              });

              if (!result.idempotente) {
                await publishContabilidadDomainEvent(ContabilidadEvents.CONCILIACION_BANCARIA_ACTUALIZADA, {
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  user_id: userId,
                  correlation_id: correlationId,
                }, {
                  id_asiento: result.asiento.id_asiento,
                  pago_id: result.conciliacion.pago_id || undefined,
                  id_conciliacion_bancaria: result.conciliacion.id_conciliacion_bancaria,
                  referencia_bancaria: result.conciliacion.referencia_bancaria || undefined,
                  estatus_bancario: result.conciliacion.estatus_bancario,
                  bancario_status: result.asiento.bancario_status,
                });
              }

              output.push({
                ...item,
                id_asiento: result.asiento.id_asiento,
                pago_id: result.conciliacion.pago_id,
                id_conciliacion_bancaria: result.conciliacion.id_conciliacion_bancaria,
                estatus_bancario: result.conciliacion.estatus_bancario,
                bancario_status: result.asiento.bancario_status,
                estatus_asiento: result.asiento.estatus,
                success: true,
                idempotente: result.idempotente,
              });

              logInfo(req, 'contabilidad', 'contabilidad.banco.archivo.ejecutado_item', 'Fila de archivo conciliada exitosamente', {
                lote_id: lote_id || null,
                item_label: itemLabel,
                id_asiento: result.asiento.id_asiento,
                idempotent: result.idempotente,
              });
            } catch (error: any) {
              output.push({
                ...item,
                success: false,
                code: error.message || 'CONT_BANCO_ARCHIVO_ITEM_ERROR',
                message: error.message || 'Error al ejecutar conciliacion bancaria desde archivo.',
              });

              logWarn(req, 'contabilidad', 'contabilidad.banco.archivo.ejecutado_item_error', 'Error al ejecutar fila de archivo bancario', {
                lote_id: lote_id || null,
                item_label: itemLabel,
                reason: error.message,
              });
            }
          }

          return output;
        }
      );

      const successCount = results.filter((item) => item.success === true).length;
      const failureCount = results.length - successCount;

      logInfo(req, 'contabilidad', 'contabilidad.banco.archivo.ejecutado', 'Archivo bancario procesado para conciliacion', {
        lote_id: lote_id || null,
        file_name,
        sheet_name: parsed.sheetName,
        total_rows: parsed.rowCount,
        executed_rows: executionItems.length,
        invalid_rows: validation.invalidItems.length,
        success_count: successCount,
        failure_count: failureCount,
      });

      res.json(createApiResponse({
        lote_id: lote_id || null,
        file_name,
        sheet_name: parsed.sheetName,
        total_rows: parsed.rowCount,
        executed_rows: executionItems.length,
        invalid_rows: validation.invalidItems,
        success_count: successCount,
        failure_count: failureCount,
        results,
      }, tenantId, proyectoId, correlationId));
    } catch (error: any) {
      if (error.message === 'BANK_FILE_EXECUTION_PREVALIDATION_FAILED') {
        res.status(422).json(createApiError(
          'CONT_BANCO_ARCHIVO_EXECUTION_INVALID_ROWS',
          'El archivo contiene filas que no pueden conciliarse contra Contabilidad. Corrigelas o usa allow_partial=true.',
          {
            invalid_count: Array.isArray(error.details) ? error.details.length : 0,
            invalid_items: error.details || [],
          },
          getCorrelationId(req)
        ));
        return;
      }

      if (error.message === 'BANK_FILE_UNSUPPORTED_FORMAT') {
        res.status(422).json(createApiError('CONT_BANCO_ARCHIVO_FORMAT_UNSUPPORTED', 'El archivo debe ser CSV o XLSX.', undefined, getCorrelationId(req)));
        return;
      }

      if (error.message === 'BANK_FILE_SHEET_NOT_FOUND') {
        res.status(422).json(createApiError('CONT_BANCO_ARCHIVO_SHEET_NOT_FOUND', 'La hoja indicada no existe en el archivo.', undefined, getCorrelationId(req)));
        return;
      }

      logWarn(req, 'contabilidad', 'contabilidad.banco.archivo.ejecutado_error', 'Error al ejecutar conciliacion bancaria desde archivo', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_BANCO_ARCHIVO_INTERNAL_ERROR', 'Error al ejecutar conciliacion bancaria desde archivo.', undefined, getCorrelationId(req)));
    }
  }
);

app.post(
  '/api/v1/contabilidad/conciliaciones-bancarias/lote',
  requireRoles('admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId, userId } = req.securityContext;
      const correlationId = getCorrelationId(req);
      const { lote_id, items } = req.body as ConciliarBancoLoteRequest;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json(createApiError(
          'CONT_BANCO_LOTE_INVALID_PAYLOAD',
          'Se requiere un arreglo items no vacio para conciliacion bancaria masiva.',
          undefined,
          correlationId
        ));
        return;
      }

      const results = await createTenantContext(
        { tenantId, proyectoId, userId },
        async (prisma) => {
          const output: Array<Record<string, unknown>> = [];

          for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            const itemLabel = item.referencia_lote || item.referencia_bancaria || item.id_asiento || `item-${index + 1}`;

            if ((!item.id_asiento && !item.referencia_bancaria) || typeof item.monto_banco !== 'number' || !item.fecha_movimiento_bancario) {
              output.push({
                index,
                referencia_lote: item.referencia_lote,
                id_asiento: item.id_asiento,
                referencia_bancaria: item.referencia_bancaria,
                success: false,
                code: 'CONT_BANCO_LOTE_ITEM_INVALID',
                message: 'Cada item requiere id_asiento o referencia_bancaria, monto_banco y fecha_movimiento_bancario.',
              });
              continue;
            }

            try {
              const result = await reconcileBankMovement(prisma, tenantId, userId, {
                asientoId: item.id_asiento,
                referenciaBancaria: item.referencia_bancaria,
                banco: item.banco,
                metodoPago: item.metodo_pago,
                montoBanco: item.monto_banco,
                moneda: item.moneda,
                fechaMovimientoBancario: item.fecha_movimiento_bancario,
                fuente: item.fuente || 'ESTADO_CUENTA_LOTE',
                notas: item.notas,
              });

              if (!result.idempotente) {
                await publishContabilidadDomainEvent(ContabilidadEvents.CONCILIACION_BANCARIA_ACTUALIZADA, {
                  tenant_id: tenantId,
                  proyecto_id: proyectoId,
                  user_id: userId,
                  correlation_id: correlationId,
                }, {
                  id_asiento: result.asiento.id_asiento,
                  pago_id: result.conciliacion.pago_id || undefined,
                  id_conciliacion_bancaria: result.conciliacion.id_conciliacion_bancaria,
                  referencia_bancaria: result.conciliacion.referencia_bancaria || undefined,
                  estatus_bancario: result.conciliacion.estatus_bancario,
                  bancario_status: result.asiento.bancario_status,
                });
              }

              output.push({
                index,
                referencia_lote: item.referencia_lote,
                id_asiento: result.asiento.id_asiento,
                pago_id: result.conciliacion.pago_id,
                id_conciliacion_bancaria: result.conciliacion.id_conciliacion_bancaria,
                referencia_bancaria: result.conciliacion.referencia_bancaria,
                estatus_bancario: result.conciliacion.estatus_bancario,
                bancario_status: result.asiento.bancario_status,
                estatus_asiento: result.asiento.estatus,
                success: true,
                idempotente: result.idempotente,
              });

              logInfo(req, 'contabilidad', 'contabilidad.banco.conciliado_lote.item', 'Item conciliado dentro de lote bancario', {
                lote_id: lote_id || null,
                item_label: itemLabel,
                id_asiento: result.asiento.id_asiento,
                referencia_bancaria: result.conciliacion.referencia_bancaria,
                idempotent: result.idempotente,
              });
            } catch (error: any) {
              output.push({
                index,
                referencia_lote: item.referencia_lote,
                id_asiento: item.id_asiento,
                referencia_bancaria: item.referencia_bancaria,
                success: false,
                code: error.message || 'CONT_BANCO_LOTE_ITEM_ERROR',
                message: error.message || 'Error al conciliar item bancario.',
              });

              logWarn(req, 'contabilidad', 'contabilidad.banco.conciliado_lote.item_error', 'Error en item de conciliacion bancaria masiva', {
                lote_id: lote_id || null,
                item_label: itemLabel,
                reason: error.message,
              });
            }
          }

          return output;
        }
      );

      const successCount = results.filter((item) => item.success === true).length;
      const failureCount = results.length - successCount;
      const allSuccessfulItemsIdempotent =
        successCount > 0 &&
        failureCount === 0 &&
        results.every((item) => item.success === true && item.idempotente === true);

      logInfo(req, 'contabilidad', 'contabilidad.banco.conciliado_lote.completed', 'Lote de conciliacion bancaria procesado', {
        lote_id: lote_id || null,
        total_items: results.length,
        success_count: successCount,
        failure_count: failureCount,
      });

      const response = buildTerminalHttpResponse({
        terminalState: allSuccessfulItemsIdempotent ? 'idempotent' : 'applied',
        data: {
          lote_id: lote_id || null,
          total_items: results.length,
          success_count: successCount,
          failure_count: failureCount,
          results,
        },
        context: { tenantId, proyectoId, correlationId },
        buildBody: (result, context) => createApiResponse(result, context.tenantId, context.proyectoId, context.correlationId),
      });

      res.status(response.statusCode).json(response.body);
    } catch (error: any) {
      logWarn(req, 'contabilidad', 'contabilidad.banco.conciliado_lote.error', 'Error al procesar lote de conciliacion bancaria', {
        reason: error.message,
      });
      res.status(500).json(createApiError('CONT_BANCO_LOTE_INTERNAL_ERROR', 'Error al procesar conciliacion bancaria masiva.', undefined, getCorrelationId(req)));
    }
  }
);

export async function startServer() {
  await eventBus.connect();
  await ensureEventSubscriptions();

  app.listen(PORT, () => {
    console.log(`[Contabilidad] Modulo iniciado en puerto ${PORT}`);
    console.log('[Contabilidad] Suscrito a: finanzas.pago_registrado, compras.oc_creada, compras.oc_cancelada, finanzas.fondos_comprometidos, finanzas.fondos_liberados, finanzas.transferencia_presupuestal');
  });
}

export async function initEventBus() {
  await eventBus.connect();
  await ensureEventSubscriptions();
}

export async function shutdownEventBus() {
  await eventBus.close();
  subscriptionsRegistered = false;
}

if (require.main === module) {
  void startServer();
}

async function ensureEventSubscriptions() {
  if (subscriptionsRegistered) {
    return;
  }

  await eventBus.subscribe(ContabilidadConsumedEvents.PAGO_REGISTRADO, async (event: BocamEvent<PagoRegistradoPayload>) => {
    const { id_pago, monto_pagado, beneficiario } = event.payload as PagoRegistradoPayload;
    console.log(`[Contabilidad] EVENTO recibido: finanzas.pago_registrado`);
    console.log(`Pago: ${id_pago} | Monto: $${Number(monto_pagado).toLocaleString()} | Beneficiario: ${beneficiario}`);
    await handlePagoRegistradoEvent(event);
  });

  await eventBus.subscribe(ContabilidadConsumedEvents.ORDEN_COMPRA_CREADA, async (event: BocamEvent<OrdenCompraCreadaPayload>) => {
    const { codigo, total, proveedor_id } = event.payload as OrdenCompraCreadaPayload;
    console.log(`[Contabilidad] EVENTO recibido: compras.oc_creada`);
    console.log(`OC: ${codigo} | Total: $${Number(total).toLocaleString()} | Proveedor: ${proveedor_id}`);
    await handleOrdenCompraCreadaEvent(event);
  });

  await eventBus.subscribe(ContabilidadConsumedEvents.ORDEN_COMPRA_CANCELADA, async (event: BocamEvent<OrdenCompraCanceladaPayload>) => {
    const { codigo, total } = event.payload as OrdenCompraCanceladaPayload;
    console.log(`[Contabilidad] EVENTO recibido: compras.oc_cancelada`);
    console.log(`OC cancelada: ${codigo} | Total: $${Number(total).toLocaleString()}`);
    await handleOrdenCompraCanceladaEvent(event);
  });

  await eventBus.subscribe(ContabilidadConsumedEvents.FONDOS_COMPROMETIDOS, async (event: BocamEvent<FondosComprometidosPayload>) => {
    const { referencia_oc_codigo, monto_comprometido, movimiento_id } = event.payload as FondosComprometidosPayload;
    console.log(`[Contabilidad] EVENTO recibido: finanzas.fondos_comprometidos`);
    console.log(`OC comprometida: ${referencia_oc_codigo} | Comprometido: $${Number(monto_comprometido).toLocaleString()} | Movimiento: ${movimiento_id}`);
    await handleFondosComprometidosEvent(event);
  });

  await eventBus.subscribe(ContabilidadConsumedEvents.FONDOS_LIBERADOS, async (event: BocamEvent<FondosLiberadosPayload>) => {
    const { referencia_oc_codigo, monto_liberado, movimiento_id } = event.payload as FondosLiberadosPayload;
    console.log(`[Contabilidad] EVENTO recibido: finanzas.fondos_liberados`);
    console.log(`OC conciliada: ${referencia_oc_codigo} | Liberado: $${Number(monto_liberado).toLocaleString()} | Movimiento: ${movimiento_id}`);
    await handleFondosLiberadosEvent(event);
  });

  await eventBus.subscribe(ContabilidadConsumedEvents.TRANSFERENCIA_PRESUPUESTAL, async (event: BocamEvent<TransferenciaPresupuestalPayload>) => {
    const { transferencia_id, monto_transferido, codigo_origen, codigo_destino } = event.payload as TransferenciaPresupuestalPayload;
    console.log(`[Contabilidad] EVENTO recibido: finanzas.transferencia_presupuestal`);
    console.log(`Transferencia: ${transferencia_id} | $${Number(monto_transferido).toLocaleString()} | ${codigo_origen} -> ${codigo_destino}`);
    await handleTransferenciaPresupuestalEvent(event);
  });

  subscriptionsRegistered = true;
}

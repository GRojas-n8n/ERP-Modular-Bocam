import { randomUUID } from 'node:crypto';
import { EventBus, type BocamEvent } from '../../../packages/event-bus/src';
import type {
  SatClaimDispatchRequest,
  SatFailureCallbackRequest,
  SatValidationCallbackRequest,
  SolicitudValidacionSatPayload,
} from './types';

const EVENT_EXCHANGE = process.env.RABBITMQ_EXCHANGE_NAME || 'bocam.events';
const MAIN_EVENT = 'contabilidad.cfdi_sat_validacion_solicitada';

const WORKER_NAME = process.env.CONTABILIDAD_SAT_WORKER_NAME || 'contabilidad-sat-worker';
const MAIN_QUEUE = process.env.CONTABILIDAD_SAT_WORKER_QUEUE || `${WORKER_NAME}.main`;
const RETRY_QUEUE = process.env.CONTABILIDAD_SAT_WORKER_RETRY_QUEUE || `${WORKER_NAME}.retry`;
const DLQ_QUEUE = process.env.CONTABILIDAD_SAT_WORKER_DLQ_QUEUE || `${WORKER_NAME}.dlq`;
const RETRY_ROUTING_KEY = `${WORKER_NAME}.retry`;
const DLQ_ROUTING_KEY = `${WORKER_NAME}.dlq`;

const eventBus = new EventBus({
  sourceModule: WORKER_NAME,
  exchangeName: EVENT_EXCHANGE,
});

let subscribed = false;

function getWorkerRetryDelayMs() {
  const parsed = Number(process.env.SAT_WORKER_RETRY_DELAY_MS || '1500');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1500;
}

function getWorkerMaxAttempts() {
  const parsed = Number(process.env.SAT_WORKER_MAX_ATTEMPTS || '3');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

function buildSatDispatchId() {
  return `sat-${randomUUID()}`;
}

function getSatCallbackSecret() {
  return process.env.SAT_CALLBACK_SHARED_SECRET || process.env.SAT_ADAPTER_API_KEY || '';
}

function getContabilidadBaseUrl() {
  const baseUrl = process.env.CONTABILIDAD_BASE_URL;
  if (!baseUrl) {
    throw new Error('SAT_WORKER_CONTABILIDAD_BASE_URL_NOT_CONFIGURED');
  }

  return baseUrl.replace(/\/+$/, '');
}

function getSatAdapterBaseUrl() {
  const baseUrl = process.env.SAT_ADAPTER_BASE_URL;
  if (!baseUrl) {
    throw new Error('SAT_ADAPTER_NOT_CONFIGURED');
  }

  return baseUrl.replace(/\/+$/, '');
}

function isRetryableSatError(error: any) {
  const message = String(error?.message || '');
  if (
    message.includes('SAT_ADAPTER_TIMEOUT') ||
    message.includes('SAT_ADAPTER_REQUEST_FAILED') ||
    message.includes('SAT_PROVIDER_') ||
    message.includes('SAT_WORKER_CONTABILIDAD_CALLBACK_FAILED') ||
    message.includes('SAT_WORKER_CONTABILIDAD_FAILURE_CALLBACK_FAILED') ||
    message.includes('SAT_ADAPTER_HTTP_429')
  ) {
    return true;
  }

  const match = message.match(/SAT_ADAPTER_HTTP_(\d+)/);
  if (!match) {
    return false;
  }

  const status = Number(match[1]);
  return status >= 500 || status === 429;
}

function log(level: 'info' | 'warn' | 'error', action: string, message: string, details: Record<string, unknown>) {
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  logger(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    module: 'contabilidad-sat-worker',
    action,
    message,
    ...details,
  }));
}

async function validateCfdiWithProvider(event: BocamEvent<SolicitudValidacionSatPayload>) {
  const timeoutMs = Number(process.env.SAT_ADAPTER_TIMEOUT_MS || '6000');
  const providerName = process.env.SAT_ADAPTER_PROVIDER || 'SAT_ADAPTER_HTTP';
  const apiKey = process.env.SAT_ADAPTER_API_KEY;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 6000);

  try {
    const response = await fetch(`${getSatAdapterBaseUrl()}/validate-cfdi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': event.context.correlation_id || '',
        ...(apiKey ? { 'X-Bocam-Secret': apiKey } : {}),
      },
      signal: controller.signal,
      body: JSON.stringify({
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        user_id: event.context.user_id,
        id_conciliacion: event.payload.id_conciliacion,
        id_asiento: event.payload.id_asiento,
        pago_id: event.payload.pago_id,
        uuid_fiscal: event.payload.uuid_fiscal,
        serie: event.payload.serie,
        folio: event.payload.folio,
        rfc_emisor: event.payload.rfc_emisor,
        rfc_receptor: event.payload.rfc_receptor,
        monto_total: event.payload.monto_total,
        moneda: event.payload.moneda || 'MXN',
        fecha_emision: event.payload.fecha_emision,
      }),
    });

    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.error?.code || `SAT_ADAPTER_HTTP_${response.status}`);
    }

    const data = payload?.data;
    if (!data?.estatus_sat || !['VIGENTE', 'CANCELADO'].includes(data.estatus_sat)) {
      throw new Error('SAT_ADAPTER_INVALID_RESPONSE');
    }

    return {
      estatus_sat: data.estatus_sat as 'VIGENTE' | 'CANCELADO',
      fecha_validacion_sat: data.fecha_validacion_sat,
      fecha_cancelacion_sat: data.fecha_cancelacion_sat,
      mensaje_sat: data.mensaje_sat,
      provider_reference: data.provider_reference,
      fuente: data.fuente || providerName,
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('SAT_ADAPTER_TIMEOUT');
    }

    if (error?.message) {
      throw error;
    }

    throw new Error('SAT_ADAPTER_REQUEST_FAILED');
  } finally {
    clearTimeout(timeout);
  }
}

async function claimDispatch(event: BocamEvent<SolicitudValidacionSatPayload>) {
  const payload: SatClaimDispatchRequest = {
    tenant_id: event.context.tenant_id,
    proyecto_id: event.context.proyecto_id,
    user_id: event.context.user_id,
    id_conciliacion: event.payload.id_conciliacion,
    dispatch_id: event.payload.dispatch_id,
    attempt: event.payload.attempt || 1,
  };

  const response = await fetch(`${getContabilidadBaseUrl()}/api/v1/contabilidad/integraciones/sat/claim-dispatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bocam-Secret': getSatCallbackSecret(),
      'X-Correlation-Id': event.context.correlation_id || '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`SAT_WORKER_CONTABILIDAD_CLAIM_FAILED:${response.status}`);
  }

  const body = await response.json() as {
    success: boolean;
    data: {
      claimed: boolean;
      reason: string;
    };
  };

  return body.data;
}

async function postSuccessCallback(event: BocamEvent<SolicitudValidacionSatPayload>, result: Awaited<ReturnType<typeof validateCfdiWithProvider>>) {
  const payload: SatValidationCallbackRequest = {
    tenant_id: event.context.tenant_id,
    proyecto_id: event.context.proyecto_id,
    user_id: event.context.user_id,
    dispatch_id: event.payload.dispatch_id,
    id_conciliacion: event.payload.id_conciliacion,
    estatus_sat: result.estatus_sat,
    fecha_validacion_sat: result.fecha_validacion_sat,
    fecha_cancelacion_sat: result.fecha_cancelacion_sat,
    fuente: result.fuente || 'SAT_WORKER',
    mensaje_sat: result.mensaje_sat,
    provider_reference: result.provider_reference,
    notas: `Worker SAT completo intento ${event.payload.attempt || 1}.`,
  };

  const response = await fetch(`${getContabilidadBaseUrl()}${event.payload.callback_path}`, {
    method: event.payload.callback_method,
    headers: {
      'Content-Type': 'application/json',
      'X-Bocam-Secret': getSatCallbackSecret(),
      'X-Correlation-Id': event.context.correlation_id || '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`SAT_WORKER_CONTABILIDAD_CALLBACK_FAILED:${response.status}`);
  }
}

async function postFailureCallback(event: BocamEvent<SolicitudValidacionSatPayload>, errorMessage: string, movedToDlq: boolean, nextRetryAt?: string) {
  const nextDispatchId = !movedToDlq ? buildSatDispatchId() : undefined;
  const payload: SatFailureCallbackRequest = {
    tenant_id: event.context.tenant_id,
    proyecto_id: event.context.proyecto_id,
    user_id: event.context.user_id,
    dispatch_id: event.payload.dispatch_id,
    id_conciliacion: event.payload.id_conciliacion,
    attempt: event.payload.attempt || 1,
    max_attempts: event.payload.max_attempts || getWorkerMaxAttempts(),
    error_message: errorMessage,
    next_dispatch_id: nextDispatchId,
    next_retry_at: nextRetryAt,
    moved_to_dlq: movedToDlq,
    fuente: 'SAT_ASYNC_WORKER',
    notas: movedToDlq
      ? `Worker SAT envio validacion a DLQ tras agotar intentos.`
      : `Worker SAT programo reintento automatico.`,
  };

  const response = await fetch(`${getContabilidadBaseUrl()}/api/v1/contabilidad/integraciones/sat/failure-callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bocam-Secret': getSatCallbackSecret(),
      'X-Correlation-Id': event.context.correlation_id || '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`SAT_WORKER_CONTABILIDAD_FAILURE_CALLBACK_FAILED:${response.status}`);
  }

  return nextDispatchId;
}

async function handleSatValidationRequested(event: BocamEvent<SolicitudValidacionSatPayload>) {
  const attempt = event.payload.attempt || 1;
  const maxAttempts = event.payload.max_attempts || getWorkerMaxAttempts();

  try {
    const claim = await claimDispatch(event);
    if (!claim.claimed) {
      log('info', 'sat.worker.duplicate_skipped', 'Dispatch SAT omitido por deduplicacion', {
        correlation_id: event.context.correlation_id,
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        id_conciliacion: event.payload.id_conciliacion,
        dispatch_id: event.payload.dispatch_id,
        attempt,
        reason: claim.reason,
      });
      return;
    }

    const result = await validateCfdiWithProvider(event);
    await postSuccessCallback(event, result);

    log('info', 'sat.worker.processed', 'Validacion SAT completada por worker', {
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      id_conciliacion: event.payload.id_conciliacion,
      uuid_fiscal: event.payload.uuid_fiscal,
      attempt,
      estatus_sat: result.estatus_sat,
    });
  } catch (error: any) {
    const reason = String(error?.message || 'SAT_WORKER_UNKNOWN_ERROR');
    const retryable = isRetryableSatError(error);

    if (retryable && attempt < maxAttempts) {
      const nextRetryAt = new Date(Date.now() + getWorkerRetryDelayMs()).toISOString();
      const nextDispatchId = await postFailureCallback(event, reason, false, nextRetryAt);

      await eventBus.publish({
        ...event,
        timestamp: new Date().toISOString(),
        payload: {
          ...event.payload,
          dispatch_id: nextDispatchId || buildSatDispatchId(),
          attempt: attempt + 1,
          max_attempts: maxAttempts,
        },
      }, {
        routingKey: RETRY_ROUTING_KEY,
      });

      log('warn', 'sat.worker.retry_scheduled', 'Validacion SAT reprogramada para retry', {
        correlation_id: event.context.correlation_id,
        tenant_id: event.context.tenant_id,
        proyecto_id: event.context.proyecto_id,
        id_conciliacion: event.payload.id_conciliacion,
        attempt,
        max_attempts: maxAttempts,
        next_retry_at: nextRetryAt,
        reason,
      });
      return;
    }

    await postFailureCallback(event, reason, true);

    log('error', 'sat.worker.sent_to_dlq', 'Validacion SAT enviada a DLQ', {
      correlation_id: event.context.correlation_id,
      tenant_id: event.context.tenant_id,
      proyecto_id: event.context.proyecto_id,
      id_conciliacion: event.payload.id_conciliacion,
      attempt,
      max_attempts: maxAttempts,
      reason,
    });

    throw error;
  }
}

export async function initSatWorker() {
  await eventBus.connect();

  await eventBus.ensureQueue(RETRY_ROUTING_KEY, RETRY_QUEUE, {
    queueArguments: {
      'x-message-ttl': getWorkerRetryDelayMs(),
      'x-dead-letter-exchange': EVENT_EXCHANGE,
      'x-dead-letter-routing-key': MAIN_EVENT,
    },
  });

  await eventBus.ensureQueue(DLQ_ROUTING_KEY, DLQ_QUEUE);

  if (subscribed) {
    return;
  }

  await eventBus.subscribe(MAIN_EVENT, handleSatValidationRequested, {
    queueName: MAIN_QUEUE,
    queueArguments: {
      'x-dead-letter-exchange': EVENT_EXCHANGE,
      'x-dead-letter-routing-key': DLQ_ROUTING_KEY,
    },
  });

  subscribed = true;
}

export async function shutdownSatWorker() {
  await eventBus.close();
  subscribed = false;
}

export async function startSatWorker() {
  await initSatWorker();
  console.log(`[Contabilidad SAT Worker] Worker iniciado. Cola principal: ${MAIN_QUEUE}`);
}

if (require.main === module) {
  void startSatWorker();
}

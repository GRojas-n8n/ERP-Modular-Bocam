import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

type LogLevel = 'info' | 'warn' | 'error';

interface ObservabilityContext {
  correlationId: string;
  requestStartedAt: number;
  moduleName: string;
}

interface StructuredLogPayload {
  action?: string;
  message: string;
  idempotent?: boolean;
  status_code?: number;
  duration_ms?: number;
  downstream_module?: string;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      observabilityContext: ObservabilityContext;
      securityContext: {
        userId: string;
        tenantId: string;
        proyectoId: string;
        email: string;
        name: string;
        userName?: string;
        roles: string[];
        authorizedProjects: string[];
        limiteAprobacion: number;
      };
    }
  }
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, current]) => current !== undefined)
  ) as T;
}

function extractBaseContext(req: Request, moduleName?: string) {
  const securityContext = req.securityContext;
  const observabilityContext = req.observabilityContext;

  return compact({
    module: moduleName || observabilityContext?.moduleName,
    correlation_id: observabilityContext?.correlationId,
    tenant_id: securityContext?.tenantId,
    proyecto_id: securityContext?.proyectoId,
    user_id: securityContext?.userId,
    method: req.method,
    path: req.path,
  });
}

function writeStructuredLog(level: LogLevel, req: Request, moduleName: string, payload: StructuredLogPayload) {
  const entry = compact({
    timestamp: new Date().toISOString(),
    level,
    ...extractBaseContext(req, moduleName),
    ...payload,
  });

  const serialized = JSON.stringify(entry);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

export function createObservabilityMiddleware(moduleName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const headerValue = req.header('x-correlation-id') || req.header('x-request-id');
    const correlationId = headerValue && headerValue.trim() ? headerValue.trim() : randomUUID();
    const requestStartedAt = Date.now();

    req.observabilityContext = {
      correlationId,
      requestStartedAt,
      moduleName,
    };

    res.setHeader('x-correlation-id', correlationId);

    res.on('finish', () => {
      if (req.path === '/health') {
        return;
      }

      logInfo(req, moduleName, 'http.request.completed', 'HTTP request completed', {
        status_code: res.statusCode,
        duration_ms: Date.now() - requestStartedAt,
      });
    });

    next();
  };
}

export function getCorrelationId(req: Request): string {
  return req.observabilityContext?.correlationId || randomUUID();
}

export function buildForwardHeaders(req: Request, headers: Record<string, string> = {}): Record<string, string> {
  const nextHeaders = { ...headers };
  const authorization = req.headers.authorization;

  if (authorization && !nextHeaders.Authorization) {
    nextHeaders.Authorization = authorization;
  }

  nextHeaders['x-correlation-id'] = getCorrelationId(req);

  return nextHeaders;
}

export function buildEventContext(req: Request) {
  return {
    tenant_id: req.securityContext?.tenantId,
    proyecto_id: req.securityContext?.proyectoId,
    user_id: req.securityContext?.userId,
    correlation_id: getCorrelationId(req),
  };
}

export function logInfo(req: Request, moduleName: string, action: string, message: string, payload: Omit<StructuredLogPayload, 'action' | 'message'> = {}) {
  writeStructuredLog('info', req, moduleName, { action, message, ...payload });
}

export function logWarn(req: Request, moduleName: string, action: string, message: string, payload: Omit<StructuredLogPayload, 'action' | 'message'> = {}) {
  writeStructuredLog('warn', req, moduleName, { action, message, ...payload });
}

export function logError(req: Request, moduleName: string, action: string, message: string, payload: Omit<StructuredLogPayload, 'action' | 'message'> = {}) {
  writeStructuredLog('error', req, moduleName, { action, message, ...payload });
}

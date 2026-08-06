import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { createRateLimiter, type MinimalRedisClient, type RateLimiterDeps } from './rate-limiter';

function createRequestMock(ip = '127.0.0.1'): Request {
  return {
    ip,
    ips: [],
    headers: {},
    path: '/api/v1/test',
    method: 'GET',
    // express-rate-limit valida req.app.get('trust proxy') antes de calcular
    // la key por IP — el mock necesita este stub aunque no usemos un app real.
    app: { get: () => false },
  } as unknown as Request;
}

function createResponseMock() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    getHeader(name: string) {
      return this.headers[name];
    },
    end() {
      return this;
    },
  };

  return response as unknown as Response;
}

function runMiddleware(middleware: ReturnType<typeof createRateLimiter>, req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const next = (err?: unknown) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve();
    };
    try {
      const result = middleware(req, res, next) as unknown;
      // Si el middleware respondió síncronamente (429) sin llamar next(), no
      // hay nada más que esperar.
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        (result as Promise<unknown>).then(() => resolve()).catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}

test('sin REDIS_URL: usa MemoryStore, no intenta conexión a Redis, y permite peticiones dentro del límite', async () => {
  let createClientCalled = false;
  const deps: RateLimiterDeps = {
    createClient: () => {
      createClientCalled = true;
      throw new Error('No debería llamarse createClient sin REDIS_URL configurado');
    },
  };

  const middleware = createRateLimiter({ max: 2, redisUrl: undefined }, deps);

  const req = createRequestMock('10.0.0.1');
  const res = createResponseMock();
  await runMiddleware(middleware, req, res);

  assert.equal(createClientCalled, false, 'no debe crearse ningún cliente Redis sin REDIS_URL');
  assert.equal(res.statusCode, 200, 'la primera petición dentro del límite no debe ser rechazada');
});

test('con REDIS_URL configurado: usa RedisStore (createClient invocado con la url y reconnectStrategy limitado)', async () => {
  const sentCommands: string[][] = [];
  let connectCalled = false;
  let reconnectStrategyUsed: ((retries: number) => number | false) | undefined;
  let urlUsed: string | undefined;

  const fakeClient: MinimalRedisClient = {
    on: () => fakeClient,
    connect: async () => {
      connectCalled = true;
      return fakeClient;
    },
    sendCommand: async (args: string[]) => {
      sentCommands.push(args);
      // rate-limit-redis primero registra sus scripts Lua con SCRIPT LOAD
      // (espera un sha como string de vuelta) y luego los ejecuta con
      // EVALSHA (espera [totalHits, ttlMs] de vuelta).
      if (args[0] === 'SCRIPT' && args[1] === 'LOAD') {
        return 'fake-sha-' + args[2].length;
      }
      if (args[0] === 'EVALSHA') {
        return [1, 60000];
      }
      return 'OK';
    },
  };

  const deps: RateLimiterDeps = {
    createClient: (config) => {
      urlUsed = config.url;
      reconnectStrategyUsed = config.socket.reconnectStrategy;
      return fakeClient;
    },
  };

  const middleware = createRateLimiter(
    { max: 5, redisUrl: 'redis://fake-host:6379', serviceName: 'test-service' },
    deps
  );

  assert.equal(urlUsed, 'redis://fake-host:6379');
  assert.equal(connectCalled, true, 'debe intentar conectar en segundo plano al crear el limiter');
  assert.ok(reconnectStrategyUsed, 'debe configurar un reconnectStrategy');
  assert.equal(reconnectStrategyUsed!(0), 500);
  assert.equal(reconnectStrategyUsed!(1), 500);
  assert.equal(reconnectStrategyUsed!(2), 500);
  assert.equal(reconnectStrategyUsed!(3), false, 'debe dejar de reintentar tras 3 intentos');

  const req = createRequestMock('10.0.0.2');
  const res = createResponseMock();
  await runMiddleware(middleware, req, res);

  assert.ok(sentCommands.length > 0, 'debe usar el cliente Redis (RedisStore) para contar peticiones, no MemoryStore');
});

test('con REDIS_URL configurado: llama unref() en el cliente Redis (no debe mantener vivo el proceso)', () => {
  let unrefCalled = false;
  const fakeClient: MinimalRedisClient = {
    on: () => fakeClient,
    connect: async () => fakeClient,
    sendCommand: async () => 'OK',
    unref: () => {
      unrefCalled = true;
    },
  };

  const deps: RateLimiterDeps = { createClient: () => fakeClient };
  createRateLimiter({ max: 5, redisUrl: 'redis://fake-host:6379' }, deps);

  assert.equal(unrefCalled, true, 'la conexión de rate-limiting no debe impedir que el proceso salga por sí mismo');
});

test('respuesta 429 tiene la forma estándar del proyecto con RATE_LIMIT_EXCEEDED', async () => {
  const middleware = createRateLimiter({ max: 1, windowMs: 60_000, redisUrl: undefined });

  const req1 = createRequestMock('10.0.0.3');
  const res1 = createResponseMock();
  await runMiddleware(middleware, req1, res1);
  assert.equal(res1.statusCode, 200);

  // Segunda petición de la misma IP excede el máximo de 1.
  const req2 = createRequestMock('10.0.0.3');
  const res2 = createResponseMock();
  await runMiddleware(middleware, req2, res2);

  assert.equal((res2 as unknown as { statusCode: number }).statusCode, 429);
  const body = (res2 as unknown as { body: unknown }).body as {
    success: boolean;
    error: { code: string; message: string; retry_after_seconds: number };
  };
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'RATE_LIMIT_EXCEEDED');
  assert.equal(typeof body.error.message, 'string');
  assert.equal(body.error.retry_after_seconds, 60);
});

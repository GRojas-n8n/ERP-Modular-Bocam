import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { createAuthMiddleware, requireProjectAccess } from './middleware';

function createResponseMock() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response as unknown as Response;
}

test('excludeByPrefix only matches exact path or nested path', () => {
  const middleware = createAuthMiddleware({
    jwtSecret: 'test-secret',
    excludeByPrefix: true,
    excludePaths: ['/api/v1/auth/login'],
  });

  const req = { path: '/api/v1/auth/login-legacy', headers: {} } as Request;
  const res = createResponseMock();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal((res as any).statusCode, 401);
});

test('requireProjectAccess rejects request without active project for project-level roles', () => {
  const middleware = requireProjectAccess();
  const req = {
    securityContext: {
      userId: 'u1',
      tenantId: 't1',
      proyectoId: '',
      email: 'u@bocam.com',
      name: 'User',
      userName: 'User',
      roles: ['resident'],
      authorizedProjects: ['proj-001'],
      limiteAprobacion: 0,
    },
  } as unknown as Request;
  const res = createResponseMock();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal((res as any).statusCode, 403);
});

test('valid jwt still builds security context', () => {
  const token = jwt.sign(
    {
      sub: 'user-1',
      tenant_id: 'tenant-1',
      proyecto_id: 'proj-001',
      roles: ['admin'],
      projects: ['proj-001'],
      limite_aprobacion: 1000,
    },
    'test-secret'
  );
  const middleware = createAuthMiddleware({ jwtSecret: 'test-secret' });
  const req = {
    path: '/api/v1/secure',
    headers: { authorization: `Bearer ${token}` },
  } as unknown as Request;
  const res = createResponseMock();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.securityContext.tenantId, 'tenant-1');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import * as middlewareModule from './middleware';

function createResponseMock() {
  const response = {
    statusCode: 200,
    body: undefined as any,
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

function request(proyectoId: string, roles: string[] = ['admin']) {
  return {
    securityContext: {
      userId: 'user-1',
      tenantId: 'tenant-1',
      proyectoId,
      email: 'test@bocam.local',
      name: 'Test',
      userName: 'Test',
      roles,
      authorizedProjects: proyectoId ? [proyectoId] : [],
      limiteAprobacion: 0,
    },
  } as unknown as Request;
}

test('requireActiveProject existe como guard separado para rutas project-scoped', () => {
  const requireActiveProject = (middlewareModule as any).requireActiveProject;
  assert.equal(typeof requireActiveProject, 'function', 'falta implementar/exportar requireActiveProject()');
});
test('requireActiveProject rechaza proyecto vacío incluso para admin', () => {
  const requireActiveProject = (middlewareModule as any).requireActiveProject;
  assert.equal(typeof requireActiveProject, 'function', 'falta implementar/exportar requireActiveProject()');

  const middleware = requireActiveProject();
  const req = request('', ['admin']);
  const res = createResponseMock();
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal((res as any).statusCode, 403);
  assert.equal((res as any).body.error.code, 'AUTH_PROJECT_REQUIRED');
});

test('requireActiveProject permite continuar con proyecto no vacío', () => {
  const requireActiveProject = (middlewareModule as any).requireActiveProject;
  assert.equal(typeof requireActiveProject, 'function', 'falta implementar/exportar requireActiveProject()');

  const middleware = requireActiveProject();
  const req = request('project-1', ['admin']);
  const res = createResponseMock();
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal((res as any).statusCode, 200);
});

test('requireProjectAccess conserva el modo tenant-level cuando el guard estricto no está montado', () => {
  const middleware = middlewareModule.requireProjectAccess();
  const req = request('', ['finanzas']);
  const res = createResponseMock();
  let nextCalled = false;

  middleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true, 'el nuevo guard no debe eliminar modos globales documentados');
});

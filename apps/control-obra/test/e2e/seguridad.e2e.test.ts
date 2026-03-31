import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let controlObraServer: Server | undefined;
let controlObraBaseUrl = '';

async function setup() {
  const controlObraModule = await import('../../src/main');
  const controlObraStarted = await startHttpApp(controlObraModule.app);
  controlObraServer = controlObraStarted.server;
  controlObraBaseUrl = controlObraStarted.baseUrl;
}

async function testRoleForbidden() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-control',
    proyectoId: 'proyecto-seguridad-control',
    roles: ['resident'],
    projects: ['proyecto-seguridad-control'],
  });

  const response = await fetch(
    `${controlObraBaseUrl}/api/v1/control-obra/estimaciones/fake-id/aprobar`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ presupuesto_id: 'presupuesto-fake' }),
    }
  );

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'CO_FORBIDDEN');
  console.log('ok - control-obra bloquea aprobacion por rol no autorizado');
}

async function testProjectForbidden() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-control',
    proyectoId: 'proyecto-no-autorizado',
    roles: ['resident'],
    projects: ['otro-proyecto'],
  });

  const response = await fetch(`${controlObraBaseUrl}/api/v1/control-obra/bitacoras`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'AUTH_PROJECT_FORBIDDEN');
  console.log('ok - control-obra bloquea acceso a proyecto no autorizado');
}

async function main() {
  await setup();

  try {
    await testRoleForbidden();
    await testProjectForbidden();
  } finally {
    await stopHttpApp(controlObraServer);
  }
}

void main().catch((error) => {
  console.error('not ok - control-obra seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});

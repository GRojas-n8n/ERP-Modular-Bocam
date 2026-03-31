import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function testRoleForbidden() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-compras',
    proyectoId: 'proyecto-seguridad-compras',
    roles: ['resident'],
    projects: ['proyecto-seguridad-compras'],
  });

  const response = await fetch(
    `${comprasBaseUrl}/api/v1/compras/comparativas/fake-id/convertir-oc`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ presupuesto_id: 'presupuesto-fake' }),
    }
  );

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'AUTH_FORBIDDEN');
  console.log('ok - compras bloquea convertir OC por rol no autorizado');
}

async function testProjectForbidden() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-compras',
    proyectoId: 'proyecto-no-autorizado',
    roles: ['resident'],
    projects: ['otro-proyecto'],
  });

  const response = await fetch(`${comprasBaseUrl}/api/v1/compras/proveedores`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'AUTH_PROJECT_FORBIDDEN');
  console.log('ok - compras bloquea acceso a proyecto no autorizado');
}

async function main() {
  await setup();

  try {
    await testRoleForbidden();
    await testProjectForbidden();
  } finally {
    await stopHttpApp(comprasServer);
  }
}

void main().catch((error) => {
  console.error('not ok - compras seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});

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
    roles: ['residencia'],
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
    roles: ['residencia'],
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

// openspec: compras-admin-flujo-comparativa. admin firma (POST /firmar) y aprueba en GT (PATCH /revisar-gt),
// así que también debe poder enviar el cuadro a GT y ver las dos bandejas. Antes respondían 403 AUTH_FORBIDDEN.
async function testAdminFlujoComparativa() {
  const token = signTenantToken({
    userId: 'user-admin',
    tenantId: 'tenant-seguridad-compras',
    proyectoId: 'proyecto-seguridad-compras',
    roles: ['admin'],
    projects: ['proyecto-seguridad-compras'],
  });
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const rutas: Array<[string, string]> = [
    ['PATCH', '/api/v1/compras/comparativas/00000000-0000-4000-8000-000000000000/enviar-gt'],
    ['GET', '/api/v1/compras/comparativas/pendientes-evaluacion'],
    ['GET', '/api/v1/compras/comparativas/pendientes-gt'],
  ];
  for (const [method, path] of rutas) {
    const response = await fetch(`${comprasBaseUrl}${path}`, { method, headers, body: method === 'GET' ? undefined : '{}' });
    assert.notEqual(response.status, 403, `${method} ${path} no debe rechazar a admin por rol`);
  }
  console.log('ok - compras permite a admin enviar el cuadro a GT y ver las bandejas');
}

async function main() {
  await setup();

  try {
    await testRoleForbidden();
    await testProjectForbidden();
    await testAdminFlujoComparativa();
  } finally {
    await stopHttpApp(comprasServer);
  }
}

void main().catch((error) => {
  console.error('not ok - compras seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});

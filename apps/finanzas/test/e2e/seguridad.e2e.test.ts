import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let finanzasServer: Server | undefined;
let finanzasBaseUrl = '';

async function setup() {
  const finanzasModule = await import('../../src/main');
  const finanzasStarted = await startHttpApp(finanzasModule.app);
  finanzasServer = finanzasStarted.server;
  finanzasBaseUrl = finanzasStarted.baseUrl;
}

async function testRoleForbiddenPresupuesto() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-finanzas',
    proyectoId: 'proyecto-seguridad-finanzas',
    roles: ['resident'],
    projects: ['proyecto-seguridad-finanzas'],
    limiteAprobacion: 100000,
  });

  const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/presupuestos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      codigo: 'PRES-SEC-001',
      descripcion: 'Presupuesto no autorizado',
      monto_autorizado: 5000,
    }),
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_FORBIDDEN');
  console.log('ok - finanzas bloquea crear presupuesto por rol no autorizado');
}

async function testLimitExceededPresupuesto() {
  const token = signTenantToken({
    userId: 'user-finance',
    tenantId: 'tenant-seguridad-finanzas',
    proyectoId: 'proyecto-seguridad-finanzas',
    roles: ['finance'],
    projects: ['proyecto-seguridad-finanzas'],
    limiteAprobacion: 1000,
  });

  const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/presupuestos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      codigo: 'PRES-SEC-002',
      descripcion: 'Presupuesto excedido',
      monto_autorizado: 2500,
    }),
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_LIMIT_EXCEEDED');
  console.log('ok - finanzas bloquea crear presupuesto por limite excedido');
}

async function main() {
  await setup();

  try {
    await testRoleForbiddenPresupuesto();
    await testLimitExceededPresupuesto();
  } finally {
    await stopHttpApp(finanzasServer);
  }
}

void main().catch((error) => {
  console.error('not ok - finanzas seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});

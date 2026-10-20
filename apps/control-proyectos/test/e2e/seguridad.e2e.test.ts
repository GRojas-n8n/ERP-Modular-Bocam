import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  server = started.server;
  baseUrl = started.baseUrl;
}

async function testRoleForbidden() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-control',
    proyectoId: 'proyecto-seguridad-control',
    roles: ['residencia'],
    projects: ['proyecto-seguridad-control'],
  });

  const response = await fetch(
    `${baseUrl}/api/v1/control-proyectos/estimaciones/fake-id/aprobar`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ presupuesto_id: 'presupuesto-fake' }),
    }
  );

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'CO_FORBIDDEN');
  console.log('ok - control-proyectos bloquea aprobacion por rol no autorizado');
}

async function testProjectForbidden() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-control',
    proyectoId: 'proyecto-no-autorizado',
    roles: ['residencia'],
    projects: ['otro-proyecto'],
  });

  const response = await fetch(`${baseUrl}/api/v1/control-proyectos/bitacoras`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'AUTH_PROJECT_FORBIDDEN');
  console.log('ok - control-proyectos bloquea acceso a proyecto no autorizado');
}

async function testAliasTemporalRetirado() {
  // El alias temporal /api/v1/control-obra/* (tarea 2.9) se retiró en la
  // tarea 6.8 tras confirmar los 6 consumidores externos — ya no debe
  // responder nada bajo ese prefijo.
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-control',
    proyectoId: 'proyecto-seguridad-control',
    roles: ['residencia'],
    projects: ['proyecto-seguridad-control'],
  });

  const response = await fetch(`${baseUrl}/api/v1/control-obra/bitacoras`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.status, 404);
  console.log('ok - el alias temporal /api/v1/control-obra/* ya no responde (retirado en 6.8)');
}

async function main() {
  await setup();

  try {
    await testRoleForbidden();
    await testProjectForbidden();
    await testAliasTemporalRetirado();
  } finally {
    await stopHttpApp(server);
  }
}

void main().catch((error) => {
  console.error('not ok - control-proyectos seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});

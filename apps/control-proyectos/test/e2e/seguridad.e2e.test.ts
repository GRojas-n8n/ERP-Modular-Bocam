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
    roles: ['resident'],
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
    roles: ['resident'],
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

async function testAliasTemporalRespondeIgual() {
  // Alias temporal (tarea 2.9): /api/v1/control-obra/* debe responder igual
  // que /api/v1/control-proyectos/* mientras dure el rollout.
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-control',
    proyectoId: 'proyecto-seguridad-control',
    roles: ['resident'],
    projects: ['proyecto-seguridad-control'],
  });

  const [viaNuevo, viaAlias] = await Promise.all([
    fetch(`${baseUrl}/api/v1/control-proyectos/bitacoras`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${baseUrl}/api/v1/control-obra/bitacoras`, { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  assert.equal(viaNuevo.status, viaAlias.status);
  const [dataNuevo, dataAlias] = await Promise.all([viaNuevo.json(), viaAlias.json()]);
  // meta.timestamp difiere entre las dos requests (mismo handler, invocado
  // dos veces) — se compara todo lo demás.
  delete dataNuevo.meta?.timestamp;
  delete dataAlias.meta?.timestamp;
  assert.deepEqual(dataNuevo, dataAlias);
  console.log('ok - alias temporal /api/v1/control-obra/* responde igual que /api/v1/control-proyectos/*');
}

async function main() {
  await setup();

  try {
    await testRoleForbidden();
    await testProjectForbidden();
    await testAliasTemporalRespondeIgual();
  } finally {
    await stopHttpApp(server);
  }
}

void main().catch((error) => {
  console.error('not ok - control-proyectos seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});

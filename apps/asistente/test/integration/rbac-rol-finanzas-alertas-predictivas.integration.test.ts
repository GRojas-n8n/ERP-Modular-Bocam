/**
 * ---------------------------------------------------------------------------
 * Test de Integración: rol 'finanzas' en GET /api/v1/asistente/alertas-predictivas
 * Spec:  openspec/changes/fix-rol-finance-vs-finanzas-restante/
 *
 * requireRoles('superintendent', 'admin', 'finance') comparaba contra
 * 'finance' (inglés), un rol que no existe en el sistema — el rol real de
 * Finanzas es 'finanzas' (español). Este test reproduce el 403 antes del
 * fix y confirma acceso permitido después.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-alertas-predictivas';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-test-fake-key-alertas-it';
process.env.FINANZAS_URL = 'http://127.0.0.1:9601/api/v1/finanzas';
process.env.CONTROL_PROYECTOS_URL = 'http://127.0.0.1:9602/api/v1/control-proyectos';

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

let asistenteServer: Server | undefined;
let finanzasServer: Server | undefined;
let controlProyectosServer: Server | undefined;
let asistenteBaseUrl = '';

async function setup() {
  const finanzasStub = express();
  finanzasStub.get('/api/v1/finanzas/capitulos-gasto', (_req, res) => {
    res.json({ success: true, data: [] });
  });
  finanzasServer = (await startHttpApp(finanzasStub)).server;

  const controlProyectosStub = express();
  controlProyectosStub.get('/api/v1/control-proyectos/resumen-dashboard', (_req, res) => {
    res.json({ success: true, data: { avance_pct: 0 } });
  });
  controlProyectosServer = (await startHttpApp(controlProyectosStub)).server;

  const { app } = await import('../../src/main');
  const started = await startHttpApp(app);
  asistenteServer = started.server;
  asistenteBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(asistenteServer);
  await stopHttpApp(finanzasServer);
  await stopHttpApp(controlProyectosServer);
}

async function testRolFinanzasAccedeAAlertasPredictivas() {
  const token = signTenantToken({
    userId: randomUUID(),
    tenantId: randomUUID(),
    proyectoId: randomUUID(),
    roles: ['finanzas'],
  });

  const r = await fetch(`${asistenteBaseUrl}/api/v1/asistente/alertas-predictivas`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.notEqual(
    r.status, 403,
    `Un usuario con rol 'finanzas' recibió 403 en GET /api/v1/asistente/alertas-predictivas. ` +
    `requireRoles() sigue comparando contra 'finance' (inglés) en vez de 'finanzas' (español).`
  );

  console.log('ok - GET /alertas-predictivas no rechaza al rol finanzas por motivo de RBAC');
}

async function main() {
  await setup();
  try {
    await testRolFinanzasAccedeAAlertasPredictivas();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rbac-rol-finanzas-alertas-predictivas integration tests');
  console.error(error);
  process.exitCode = 1;
});

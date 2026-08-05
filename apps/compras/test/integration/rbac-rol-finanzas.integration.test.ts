/**
 * ---------------------------------------------------------------------------
 * Test de Integración: rol 'finanzas' en los 5 endpoints de consulta de
 * OC/proveedores de compras
 * Spec:  openspec/changes/fix-rol-finance-vs-finanzas-restante/
 *
 * Los 5 endpoints comparaban contra 'finance' (inglés), un rol que no
 * existe en el sistema — el rol real de Finanzas es 'finanzas' (español).
 * Este test reproduce el 403 antes del fix y confirma acceso permitido
 * (no rechazado por RBAC) después. Usa UUIDs aleatorios para los recursos
 * (sin seed) porque el objetivo es solo el gate de rol, que corre antes de
 * cualquier acceso a datos — un 404 por recurso inexistente es aceptable,
 * un 403 no.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999'; // EventBus falla silenciosamente

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => {
    res.json({ success: true, data: { tiene_suficiencia: true } });
  });
  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
}

async function get(pathUrl: string, token: string) {
  return fetch(`${comprasBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

const ENDPOINTS = [
  () => `/api/v1/compras/ordenes-compra/${randomUUID()}`,
  () => `/api/v1/compras/ordenes-compra/${randomUUID()}/recepciones`,
  () => `/api/v1/compras/proveedores/${randomUUID()}/documentos`,
  () => `/api/v1/compras/proveedores/${randomUUID()}/documentos/${randomUUID()}/descargar`,
  () => `/api/v1/compras/proveedores/${randomUUID()}/calificaciones`,
];

async function testRolFinanzasAccedeALosCincoEndpoints() {
  const token = signTenantToken({
    userId: randomUUID(),
    tenantId: randomUUID(),
    proyectoId: randomUUID(),
    roles: ['finanzas'],
  });

  for (const buildPath of ENDPOINTS) {
    const path = buildPath();
    const r = await get(path, token);
    assert.notEqual(
      r.status, 403,
      `Un usuario con rol 'finanzas' recibió 403 en GET ${path}. ` +
      `requireRoles() sigue comparando contra 'finance' (inglés) en vez de 'finanzas' (español).`
    );
  }

  console.log('ok - los 5 endpoints de compras no rechazan al rol finanzas por motivo de RBAC');
}

async function main() {
  await setup();
  try {
    await testRolFinanzasAccedeALosCincoEndpoints();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rbac-rol-finanzas integration tests (compras)');
  console.error(error);
  process.exitCode = 1;
});

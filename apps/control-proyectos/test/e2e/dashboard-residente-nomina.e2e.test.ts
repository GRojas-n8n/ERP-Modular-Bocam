/**
 * ---------------------------------------------------------------------------
 * Tests E2E: GET /api/v1/control-proyectos/dashboard/residente — conteos de
 * nómina (prenominas_pendientes / complementos_pendientes)
 * Spec:  openspec/changes/residencia-consolidar-dashboard/
 * Tareas: 4.1, 4.2, 4.3 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/control-proyectos)
 * No requiere Compras/Personal reales: se stubean con servidores Express
 * efímeros, igual que test/e2e/reconciliacion.e2e.test.ts hace con Finanzas.
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const prisma = new PrismaClient();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let cpServer: Server | undefined;
let comprasServer: Server | undefined;
let personalServer: Server | undefined;
let baseUrl = '';

let comprasBehavior: 'ok' | 'fail' = 'ok';
let personalBehavior: 'ok' | 'fail' = 'ok';

const PRENOMINAS_FIXTURE = [
  { id_prenomina: 'pn-1', estado: 'CALCULADA', revisado_por_residencia: false },
  { id_prenomina: 'pn-2', estado: 'CALCULADA', revisado_por_residencia: true },
  { id_prenomina: 'pn-3', estado: 'AUTORIZADA', revisado_por_residencia: false },
];
const COMPLEMENTOS_FIXTURE = [
  { id_complemento: 'c-1', revisado_por_residencia: false },
  { id_complemento: 'c-2', revisado_por_residencia: false },
  { id_complemento: 'c-3', revisado_por_residencia: true },
];

async function cleanupTenantData(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
    await tx.estimacion.deleteMany({ where: { tenant_id: tenantId } });
  });
}

async function seedEstimacionPendiente(tenantId: string, proyectoId: string, userId: string) {
  await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
    tx.estimacion.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        numero_estimacion: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000),
        codigo: `EST-E2E-NOM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        periodo_inicio: new Date('2026-03-01'),
        periodo_fin: new Date('2026-03-15'),
        subtotal: '10000.00',
        iva: '1600.00',
        total_neto: '11600.00',
        estado: 'BORRADOR',
        elaborado_por_id: userId,
        elaborado_por_nombre: 'Residente E2E',
      },
    })
  );
}

async function setup() {
  const comprasStub = express();
  comprasStub.get('/api/v1/compras/requisiciones', (_req, res) => {
    if (comprasBehavior === 'fail') { res.status(500).json({ success: false }); return; }
    res.json({ success: true, data: [] });
  });
  comprasStub.get('/api/v1/compras/ordenes-compra', (_req, res) => {
    if (comprasBehavior === 'fail') { res.status(500).json({ success: false }); return; }
    res.json({ success: true, data: [] });
  });
  const comprasStarted = await startHttpApp(comprasStub);
  comprasServer = comprasStarted.server;
  process.env.COMPRAS_URL = `${comprasStarted.baseUrl}/api/v1/compras`;

  const personalStub = express();
  personalStub.get('/api/v1/personal/prenominas', (_req, res) => {
    if (personalBehavior === 'fail') { res.status(500).json({ success: false }); return; }
    res.json({ success: true, data: PRENOMINAS_FIXTURE });
  });
  personalStub.get('/api/v1/personal/complementos', (_req, res) => {
    if (personalBehavior === 'fail') { res.status(500).json({ success: false }); return; }
    res.json({ success: true, data: COMPLEMENTOS_FIXTURE });
  });
  const personalStarted = await startHttpApp(personalStub);
  personalServer = personalStarted.server;
  process.env.PERSONAL_URL = `${personalStarted.baseUrl}/api/v1/personal`;

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  cpServer = started.server;
  baseUrl = started.baseUrl;
}

// ── 4.1: Compras y personal responden correctamente ──────────────────────

async function testTodoResponde() {
  comprasBehavior = 'ok';
  personalBehavior = 'ok';
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  await seedEstimacionPendiente(tenantId, proyectoId, userId);

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard/residente`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.success, true);
    assert.equal(body.data.prenominas_pendientes, 1, 'solo pn-1 esta CALCULADA y sin revisar');
    assert.equal(body.data.complementos_pendientes, 2, 'c-1 y c-2 sin revisar');
    assert.equal(body.data.parcial, false);
    console.log('ok - 4.1 dashboard/residente incluye prenominas_pendientes/complementos_pendientes cuando todo responde');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

// ── 4.2: personal no responde ─────────────────────────────────────────────

async function testPersonalFalla() {
  comprasBehavior = 'ok';
  personalBehavior = 'fail';
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  await seedEstimacionPendiente(tenantId, proyectoId, userId);

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard/residente`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.data.prenominas_pendientes, null);
    assert.equal(body.data.complementos_pendientes, null);
    assert.equal(body.data.parcial, true);
    // No se afirma un valor exacto (la tabla de estimaciones es compartida
    // entre suites y el rol de Postgres local hace bypass de RLS — ver nota
    // de apps/auth sobre BYPASSRLS); solo que el resto de la respuesta no
    // se vio afectado por la falla de personal (sigue siendo un numero).
    assert.equal(typeof body.data.estimaciones_pendientes, 'number', 'el resto de la respuesta no se ve afectado');
    console.log('ok - 4.2 personal caido: prenominas_pendientes/complementos_pendientes en null, parcial: true, resto intacto');
  } finally {
    personalBehavior = 'ok';
    await cleanupTenantData(tenantId, proyectoId);
  }
}

// ── 4.3: Compras falla pero personal responde ─────────────────────────────

async function testComprasFallaPersonalOk() {
  comprasBehavior = 'fail';
  personalBehavior = 'ok';
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  await seedEstimacionPendiente(tenantId, proyectoId, userId);

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard/residente`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.data.parcial, true, 'basta que falle una sola llamada B2B para marcar parcial');
    assert.equal(body.data.prenominas_pendientes, 1, 'personal si respondio, sus datos son reales');
    assert.equal(body.data.complementos_pendientes, 2);
    assert.equal(body.data.mis_requisiciones, 0, 'compras fallo, queda en 0/vacio');
    console.log('ok - 4.3 Compras cae, personal responde: parcial true, datos de nomina reales');
  } finally {
    comprasBehavior = 'ok';
    await cleanupTenantData(tenantId, proyectoId);
  }
}

async function main() {
  await setup();
  try {
    await testTodoResponde();
    await testPersonalFalla();
    await testComprasFallaPersonalOk();
  } finally {
    await stopHttpApp(cpServer);
    await stopHttpApp(comprasServer);
    await stopHttpApp(personalServer);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - control-proyectos dashboard-residente-nomina E2E');
  console.error(error);
  process.exitCode = 1;
});

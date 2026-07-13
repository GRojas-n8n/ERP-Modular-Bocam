/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: POST /comparativas no debe fallar por longitud de
 * marca_modelo_ref cuando especificacion_marca_modelo de la requisición usa
 * el rango completo permitido (hasta 200 caracteres).
 * Spec:  openspec/changes/fix-crear-cuadro-comparativo-500/specs/
 * Tareas: 1.1, 2.4 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

async function postComparativa(requisicionId: string, token: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requisicion_id: requisicionId }),
  });
}

// ── Test 1.1/2.4: marca/modelo de 109 caracteres (caso real de producción) ──

async function testMarcaModeloLarga() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const insumoId = randomUUID();
  const marcaModeloLarga = 'Modelos recientes de alta eficiencia (18 SEER o superior) que cumplan con la especificación de gas ecológico.';
  assert.equal(marcaModeloLarga.length, 109, 'la marca/modelo de prueba debe tener 109 caracteres, igual que el caso real');

  const requisicion = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-500-${Date.now()}`,
      solicitante_id: userId,
      estado: 'APROBADA',
      tipo: 'IMPREVISTO',
    },
  });
  await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicion.id_requisicion,
      insumo_id: insumoId,
      cantidad: 1,
      especificacion_marca_modelo: marcaModeloLarga,
    },
  });

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });
    const r = await postComparativa(requisicion.id_requisicion, token);
    assert.equal(r.status, 201, `POST /comparativas debe retornar 201, no ${r.status}`);

    const linea = await prisma.comparativaLinea.findFirst({ where: { tenant_id: tenantId, insumo_id: insumoId } });
    assert.ok(linea, 'Debe existir la línea del cuadro');
    assert.equal(linea!.marca_modelo_ref, marcaModeloLarga, 'La marca/modelo debe guardarse completa, sin truncar');

    console.log('ok - 1.1/2.4 POST /comparativas no falla con marca/modelo de 109 caracteres, se guarda completa');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testMarcaModeloLarga();
    console.log('\nTodos los tests pasaron.');
  } finally {
    await teardown();
  }
}

main().catch((err) => {
  console.error('FALLO:', err);
  process.exitCode = 1;
});

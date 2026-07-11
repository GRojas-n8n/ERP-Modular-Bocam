/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: advertencia de stock antes de cotizar externo
 * Spec:  openspec/changes/validar-stock-antes-cotizar-externo/
 * Tareas: 2.4, 2.5 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env, schema compras)
 * No requiere: RabbitMQ real ni Almacén real — se stubea con Express.
 *
 * Nota: ALMACEN_URL (como GT_URL/FINANZAS_URL en apps/compras/src/main.ts)
 * se lee UNA sola vez como const al importar el módulo — no se puede
 * cambiar entre tests dentro del mismo proceso. Por eso hay un solo stub de
 * Almacén para todo el archivo, y el escenario de "fallo" (2.5) se simula
 * haciendo que el stub responda 500 para esa requisición específica, en vez
 * de apuntar ALMACEN_URL a un host distinto.
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
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
let almacenServer: Server | undefined;
let comprasBaseUrl = '';
let capturedInsumoIds: string[] | null = null;
let stockPorInsumoStub: Map<string, number> = new Map();
let insumoIdQueForzarFallo: string | null = null;

async function setup() {
  const almacenStub = express();
  almacenStub.get('/api/v1/almacen/stock', (req, res) => {
    const raw = (req.query.insumo_ids as string | undefined) || '';
    const ids = raw.split(',').map(s => s.trim()).filter(Boolean);
    capturedInsumoIds = ids;
    if (insumoIdQueForzarFallo && ids.includes(insumoIdQueForzarFallo)) {
      return void res.status(500).json({ success: false, message: 'Fallo simulado de Almacén' });
    }
    res.json({
      success: true,
      data: ids.filter(id => stockPorInsumoStub.has(id)).map(id => ({ insumo_id: id, stock_actual: stockPorInsumoStub.get(id) })),
    });
  });
  const almacenStarted = await startHttpApp(almacenStub);
  almacenServer = almacenStarted.server;
  process.env.ALMACEN_URL = `${almacenStarted.baseUrl}/api/v1/almacen`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  if (almacenServer) await new Promise<void>((resolve) => almacenServer!.close(() => resolve()));
  await prisma.$disconnect();
}

async function seedRequisicion(tenantId: string, proyectoId: string, items: Array<{ insumo_id?: string; es_imprevisto?: boolean; cantidad: number }>) {
  const reqId = randomUUID();
  await prisma.requisicion.create({
    data: {
      id_requisicion: reqId,
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-STOCK-TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      solicitante_id: randomUUID(),
      items: {
        create: items.map(it => ({
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          insumo_id: it.insumo_id ?? null,
          cantidad: it.cantidad,
          es_imprevisto: it.es_imprevisto ?? false,
          descripcion_libre: it.es_imprevisto ? 'Item imprevisto de prueba' : undefined,
          unidad_libre: it.es_imprevisto ? 'PZA' : undefined,
        })),
      },
    },
  });
  return reqId;
}

async function cleanupTenant(tenantId: string) {
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

async function testExcluyeImprevistosYArmaBatch() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoA = randomUUID();
  const insumoB = randomUUID();
  capturedInsumoIds = null;
  stockPorInsumoStub = new Map([[insumoA, 5]]); // insumoB no tiene fila en almacén
  insumoIdQueForzarFallo = null;

  try {
    const reqId = await seedRequisicion(tenantId, proyectoId, [
      { insumo_id: insumoA, cantidad: 50 },
      { insumo_id: insumoB, cantidad: 10 },
      { es_imprevisto: true, cantidad: 3 },
    ]);

    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });
    const res = await fetch(`${comprasBaseUrl}/api/v1/compras/requisiciones/${reqId}/stock-almacen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as any;

    assert.ok(capturedInsumoIds, 'Almacén debió recibir la consulta batch');
    assert.equal(capturedInsumoIds!.length, 2, 'solo los 2 insumos catalogados deben consultarse, no el imprevisto');
    assert.ok(capturedInsumoIds!.includes(insumoA) && capturedInsumoIds!.includes(insumoB));

    assert.equal(body.data.length, 1, 'solo el insumo con stock_actual > 0 debe aparecer en la advertencia');
    assert.equal(body.data[0].insumo_id, insumoA);
    assert.equal(body.data[0].stock_disponible, 5);
    assert.equal(body.data[0].cantidad_solicitada, 50);

    console.log('ok 2.4 - consulta batch excluye imprevistos y solo advierte insumos con stock_actual > 0');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testSoloImprevistosNoLlamaAlmacen() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  capturedInsumoIds = null;
  stockPorInsumoStub = new Map();
  insumoIdQueForzarFallo = null;

  try {
    const reqId = await seedRequisicion(tenantId, proyectoId, [
      { es_imprevisto: true, cantidad: 3 },
      { es_imprevisto: true, cantidad: 7 },
    ]);

    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });
    const res = await fetch(`${comprasBaseUrl}/api/v1/compras/requisiciones/${reqId}/stock-almacen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as any;

    assert.equal(capturedInsumoIds, null, 'Almacén no debe recibir ninguna llamada si todos los ítems son imprevistos');
    assert.deepEqual(body.data, []);

    console.log('ok 2.4b - requisición solo con imprevistos no llama a Almacén');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testFalloDeAlmacenNoBloquea() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoA = randomUUID();
  capturedInsumoIds = null;
  stockPorInsumoStub = new Map();
  insumoIdQueForzarFallo = insumoA; // el stub responderá 500 para esta requisición

  try {
    const reqId = await seedRequisicion(tenantId, proyectoId, [{ insumo_id: insumoA, cantidad: 20 }]);

    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });
    const res = await fetch(`${comprasBaseUrl}/api/v1/compras/requisiciones/${reqId}/stock-almacen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200, 'un fallo de Almacén no debe bloquear ni degradar el endpoint');
    const body = await res.json() as any;
    assert.deepEqual(body.data, [], 'sin advertencia de stock cuando Almacén falla, pero sin error');

    console.log('ok 2.5 - fallo de Almacén (500) no bloquea el endpoint, responde 200 sin advertencia');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testExcluyeImprevistosYArmaBatch();
    await testSoloImprevistosNoLlamaAlmacen();
    await testFalloDeAlmacenNoBloquea();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - stock-almacen-antes-cotizar integration tests');
  console.error(error);
  process.exitCode = 1;
});

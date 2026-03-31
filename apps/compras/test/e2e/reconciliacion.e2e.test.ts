import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const prisma = new PrismaClient();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';
let financeCalls: Array<{ method: string; path: string; body?: any; query?: Record<string, any> }> = [];

async function cleanupTenantData(tenantId: string) {
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedOrdenCompra(estado: 'ERROR_FINANZAS' | 'CANCELACION_PENDIENTE') {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`,
      razon_social: 'Proveedor E2E Compras',
      email_contacto: 'proveedor-e2e@bocam.local',
      telefono: '5555555555',
      estatus: 'ACTIVO',
    },
  });

  const oc = await prisma.ordenCompra.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      proveedor_id: proveedor.id_proveedor,
      codigo: `OC-E2E-${Date.now()}`,
      estado,
      subtotal: '1000.00',
      iva: '160.00',
      total: '1160.00',
      presupuesto_id: presupuestoId,
      items: {
        create: [
          {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            insumo_id: randomUUID(),
            cantidad: '1.0000',
            precio_unitario: '1000.0000',
            importe: '1000.00',
          },
        ],
      },
    },
  });

  return {
    tenantId,
    proyectoId,
    userId,
    presupuestoId,
    ocId: oc.id_orden,
  };
}

async function seedComparativa() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`,
      razon_social: 'Proveedor E2E Comparativa',
      email_contacto: 'comparativa-e2e@bocam.local',
      telefono: '5555550000',
      estatus: 'ACTIVO',
    },
  });

  const comparativa = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-E2E-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      estado: 'ABIERTO',
      detalles: {
        create: [
          {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            proveedor_id: proveedor.id_proveedor,
            insumo_id: randomUUID(),
            precio_ofertado: '2500.0000',
            tiempo_entrega: '5 dias',
            es_ganador: true,
          },
        ],
      },
    },
    include: {
      detalles: true,
    },
  });

  return {
    tenantId,
    proyectoId,
    userId,
    presupuestoId,
    proveedorId: proveedor.id_proveedor,
    comparativaId: comparativa.id_cuadro,
  };
}

async function convertirComparativa(seed: Awaited<ReturnType<typeof seedComparativa>>) {
  const token = signTenantToken({
    userId: seed.userId,
    tenantId: seed.tenantId,
    proyectoId: seed.proyectoId,
    roles: ['admin'],
  });

  const response = await fetch(
    `${comprasBaseUrl}/api/v1/compras/comparativas/${seed.comparativaId}/convertir-oc`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ presupuesto_id: seed.presupuestoId }),
    }
  );

  return {
    token,
    response,
  };
}

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (req, res) => {
    financeCalls.push({ method: 'GET', path: req.path, query: req.query as Record<string, any> });
    res.json({ success: true, data: { tiene_suficiencia: true } });
  });
  finanzasStub.post('/api/v1/finanzas/comprometer-fondos', (req, res) => {
    financeCalls.push({ method: 'POST', path: req.path, body: req.body });
    res.json({ success: true, data: { status: 'COMPROMETIDO' } });
  });
  finanzasStub.post('/api/v1/finanzas/liberar-fondos', (req, res) => {
    financeCalls.push({ method: 'POST', path: req.path, body: req.body });
    res.json({ success: true, data: { status: 'LIBERADO' } });
  });

  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function testErrorFinanzasReconciliation() {
  financeCalls = [];
  const seeded = await seedOrdenCompra('ERROR_FINANZAS');

  try {
    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['admin'],
    });

    const response = await fetch(
      `${comprasBaseUrl}/api/v1/compras/ordenes-compra/${seeded.ocId}/reconciliar-finanzas`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.data.estado, 'EMITIDA');
    assert.equal(financeCalls.length, 1);
    assert.equal(financeCalls[0]?.method, 'POST');
    assert.equal(financeCalls[0]?.path, '/api/v1/finanzas/comprometer-fondos');
    assert.equal(financeCalls[0]?.body.presupuesto_id, seeded.presupuestoId);
    assert.equal(financeCalls[0]?.body.oc_id, seeded.ocId);

    const persisted = await prisma.ordenCompra.findUnique({ where: { id_orden: seeded.ocId } });
    assert.equal(persisted?.estado, 'EMITIDA');
    console.log('ok - compras reconciliacion ERROR_FINANZAS -> EMITIDA');

    const secondResponse = await fetch(
      `${comprasBaseUrl}/api/v1/compras/ordenes-compra/${seeded.ocId}/reconciliar-finanzas`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    assert.equal(secondResponse.status, 200);
    const secondPayload = await secondResponse.json();
    assert.equal(secondPayload.success, true);
    assert.equal(secondPayload.data.estado, 'EMITIDA');
    assert.equal(secondPayload.data.idempotente, true);
    assert.equal(financeCalls.length, 1);
    console.log('ok - compras reconciliacion EMITIDA -> idempotent');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function testCancelacionPendienteReconciliation() {
  financeCalls = [];
  const seeded = await seedOrdenCompra('CANCELACION_PENDIENTE');

  try {
    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['admin'],
    });

    const response = await fetch(
      `${comprasBaseUrl}/api/v1/compras/ordenes-compra/${seeded.ocId}/reconciliar-finanzas`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.data.estado, 'CANCELADA');
    assert.equal(financeCalls.length, 1);
    assert.equal(financeCalls[0]?.method, 'POST');
    assert.equal(financeCalls[0]?.path, '/api/v1/finanzas/liberar-fondos');
    assert.equal(financeCalls[0]?.body.presupuesto_id, seeded.presupuestoId);
    assert.equal(financeCalls[0]?.body.oc_id, seeded.ocId);

    const persisted = await prisma.ordenCompra.findUnique({ where: { id_orden: seeded.ocId } });
    assert.equal(persisted?.estado, 'CANCELADA');
    console.log('ok - compras reconciliacion CANCELACION_PENDIENTE -> CANCELADA');

    const secondResponse = await fetch(
      `${comprasBaseUrl}/api/v1/compras/ordenes-compra/${seeded.ocId}/reconciliar-finanzas`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    assert.equal(secondResponse.status, 200);
    const secondPayload = await secondResponse.json();
    assert.equal(secondPayload.success, true);
    assert.equal(secondPayload.data.estado, 'CANCELADA');
    assert.equal(secondPayload.data.idempotente, true);
    assert.equal(financeCalls.length, 1);
    console.log('ok - compras reconciliacion CANCELADA -> idempotent');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function testComparativaToOcFlow() {
  financeCalls = [];
  const seeded = await seedComparativa();

  try {
    const { response } = await convertirComparativa(seeded);

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.data.estado, 'EMITIDA');
    assert.equal(payload.data.proveedor_id, seeded.proveedorId);
    assert.equal(financeCalls.length, 2);
    assert.equal(financeCalls[0]?.method, 'GET');
    assert.equal(financeCalls[0]?.path, '/api/v1/finanzas/suficiencia');
    assert.equal(financeCalls[1]?.method, 'POST');
    assert.equal(financeCalls[1]?.path, '/api/v1/finanzas/comprometer-fondos');
    assert.equal(financeCalls[1]?.body.presupuesto_id, seeded.presupuestoId);

    const persistedOc = await prisma.ordenCompra.findUnique({
      where: { id_orden: payload.data.id_orden },
      include: { items: true },
    });
    const persistedComparativa = await prisma.cuadroComparativo.findUnique({
      where: { id_cuadro: seeded.comparativaId },
    });

    assert.equal(persistedOc?.estado, 'EMITIDA');
    assert.equal(persistedOc?.items.length, 1);
    assert.equal(persistedComparativa?.estado, 'CERRADO');
    console.log('ok - compras flujo comparativa -> OC emitida');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function testOcCancelFlow() {
  financeCalls = [];
  const seeded = await seedComparativa();

  try {
    const { token, response } = await convertirComparativa(seeded);
    assert.equal(response.status, 200);
    const conversionPayload = await response.json();
    const ocId = conversionPayload.data.id_orden;

    financeCalls = [];

    const cancelResponse = await fetch(
      `${comprasBaseUrl}/api/v1/compras/ordenes-compra/${ocId}/cancelar`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    assert.equal(cancelResponse.status, 200);
    const cancelPayload = await cancelResponse.json();
    assert.equal(cancelPayload.success, true);
    assert.equal(cancelPayload.data.estado, 'CANCELADA');
    assert.equal(financeCalls.length, 1);
    assert.equal(financeCalls[0]?.method, 'POST');
    assert.equal(financeCalls[0]?.path, '/api/v1/finanzas/liberar-fondos');
    assert.equal(financeCalls[0]?.body.oc_id, ocId);
    assert.equal(financeCalls[0]?.body.presupuesto_id, seeded.presupuestoId);

    const persisted = await prisma.ordenCompra.findUnique({ where: { id_orden: ocId } });
    assert.equal(persisted?.estado, 'CANCELADA');
    console.log('ok - compras flujo OC emitida -> cancelada');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testComparativaToOcFlow();
    await testOcCancelFlow();
    await testErrorFinanzasReconciliation();
    await testCancelacionPendienteReconciliation();
  } finally {
    await stopHttpApp(comprasServer);
    await stopHttpApp(finanzasServer);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - compras reconciliacion E2E');
  console.error(error);
  process.exitCode = 1;
});

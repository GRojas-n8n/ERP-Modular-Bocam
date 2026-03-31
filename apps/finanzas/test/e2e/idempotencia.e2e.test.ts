import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const prisma = new PrismaClient();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let finanzasServer: Server | undefined;
let finanzasBaseUrl = '';

async function setup() {
  const finanzasModule = await import('../../src/main');
  const finanzasStarted = await startHttpApp(finanzasModule.app);
  finanzasServer = finanzasStarted.server;
  finanzasBaseUrl = finanzasStarted.baseUrl;
}

async function cleanupTenantData(tenantId: string) {
  await prisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedBudget(overrides?: {
  tenantId?: string;
  proyectoId?: string;
  authorized?: number;
  available?: number;
  committed?: number;
}) {
  const tenantId = overrides?.tenantId || randomUUID();
  const proyectoId = overrides?.proyectoId || randomUUID();

  const presupuesto = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-E2E-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      descripcion: 'Presupuesto E2E Idempotencia',
      monto_autorizado: overrides?.authorized ?? 10000,
      monto_disponible: overrides?.available ?? 10000,
      monto_comprometido: overrides?.committed ?? 0,
      monto_ejercido: 0,
      capitulo: 'MATERIALES',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  return {
    tenantId,
    proyectoId,
    presupuestoId: presupuesto.id_presupuesto,
  };
}

function buildFinanceToken(tenantId: string, proyectoId: string) {
  return signTenantToken({
    userId: randomUUID(),
    tenantId,
    proyectoId,
    roles: ['finance'],
    projects: [proyectoId],
    limiteAprobacion: 999999999,
  });
}

async function testComprometerFondosIdempotente() {
  const seeded = await seedBudget();
  const token = buildFinanceToken(seeded.tenantId, seeded.proyectoId);
  const ocId = randomUUID();
  const ocCodigo = `OC-IDEMP-${Date.now()}`;

  try {
    const payload = {
      presupuesto_id: seeded.presupuestoId,
      monto: 1500,
      oc_id: ocId,
      oc_codigo: ocCodigo,
      concepto: `Compromiso ${ocCodigo}`,
    };

    const first = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/comprometer-fondos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const second = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/comprometer-fondos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    assert.equal(first.status, 201);
    assert.equal(second.status, 201);

    const firstPayload = await first.json();
    const secondPayload = await second.json();
    assert.equal(firstPayload.success, true);
    assert.equal(secondPayload.success, true);
    assert.equal(secondPayload.data.idempotente, true);

    const movimientos = await prisma.movimientoPresupuestal.findMany({
      where: {
        tenant_id: seeded.tenantId,
        referencia_id: ocId,
        tipo: 'COMPROMISO',
      },
    });
    const presupuesto = await prisma.presupuestoAsignado.findUnique({
      where: { id_presupuesto: seeded.presupuestoId },
    });

    assert.equal(movimientos.length, 1);
    assert.equal(Number(presupuesto?.monto_comprometido), 1500);
    assert.equal(Number(presupuesto?.monto_disponible), 8500);
    console.log('ok - finanzas comprometer-fondos es idempotente');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function testLiberarFondosIdempotente() {
  const seeded = await seedBudget({
    authorized: 10000,
    available: 7000,
    committed: 3000,
  });
  const token = buildFinanceToken(seeded.tenantId, seeded.proyectoId);
  const ocId = randomUUID();
  const ocCodigo = `OC-LIB-${Date.now()}`;

  await prisma.movimientoPresupuestal.create({
    data: {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      presupuesto_id: seeded.presupuestoId,
      tipo: 'COMPROMISO',
      concepto: `Compromiso previo ${ocCodigo}`,
      monto: 3000,
      referencia_modulo: 'compras',
      referencia_entidad: 'OrdenCompra',
      referencia_id: ocId,
      referencia_codigo: ocCodigo,
      usuario_id: randomUUID(),
      notas: 'Semilla para idempotencia de liberacion',
    },
  });

  try {
    const payload = {
      presupuesto_id: seeded.presupuestoId,
      monto: 3000,
      oc_id: ocId,
      oc_codigo: ocCodigo,
      concepto: `Liberacion ${ocCodigo}`,
    };

    const first = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/liberar-fondos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const second = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/liberar-fondos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    assert.equal(first.status, 201);
    assert.equal(second.status, 201);

    const secondPayload = await second.json();
    assert.equal(secondPayload.success, true);
    assert.equal(secondPayload.data.idempotente, true);

    const movimientos = await prisma.movimientoPresupuestal.findMany({
      where: {
        tenant_id: seeded.tenantId,
        referencia_id: ocId,
        tipo: 'LIBERACION',
      },
    });
    const presupuesto = await prisma.presupuestoAsignado.findUnique({
      where: { id_presupuesto: seeded.presupuestoId },
    });

    assert.equal(movimientos.length, 1);
    assert.equal(Number(presupuesto?.monto_comprometido), 0);
    assert.equal(Number(presupuesto?.monto_disponible), 10000);
    console.log('ok - finanzas liberar-fondos es idempotente');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function testPagosIdempotente() {
  const seeded = await seedBudget();
  const token = buildFinanceToken(seeded.tenantId, seeded.proyectoId);
  const referenciaId = randomUUID();

  try {
    const payload = {
      presupuesto_id: seeded.presupuestoId,
      concepto: 'Pago idempotente E2E',
      beneficiario: 'Proveedor E2E',
      monto_programado: 2200,
      fecha_programada: '2026-03-25T00:00:00.000Z',
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: referenciaId,
    };

    const first = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/pagos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const second = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/pagos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    assert.equal(first.status, 201);
    assert.equal(second.status, 201);

    const firstPayload = await first.json();
    const secondPayload = await second.json();
    assert.equal(firstPayload.success, true);
    assert.equal(secondPayload.success, true);
    assert.equal(firstPayload.data.id_pago, secondPayload.data.id_pago);

    const pagos = await prisma.programaPagos.findMany({
      where: {
        tenant_id: seeded.tenantId,
        referencia_modulo: 'control-obra',
        referencia_entidad: 'Estimacion',
        referencia_id: referenciaId,
      },
    });

    assert.equal(pagos.length, 1);
    console.log('ok - finanzas pagos es idempotente');
  } finally {
    await cleanupTenantData(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testComprometerFondosIdempotente();
    await testLiberarFondosIdempotente();
    await testPagosIdempotente();
  } finally {
    await stopHttpApp(finanzasServer);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - finanzas idempotencia E2E');
  console.error(error);
  process.exitCode = 1;
});

/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: estado_respuesta_proveedor en GET /comparativas/:id
 * Spec:  openspec/changes/estado-respuesta-proveedor-comparativo/
 * Tareas: 1.1-1.3 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999'; // EventBus falla silenciosamente

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({
  datasources: { db: { url: comprasDbUrl } },
});

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
  await prisma.solicitudCotizacionProveedor.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.solicitudCotizacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadro() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const requisicionId = randomUUID();

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicionId,
      codigo: `CC-ERP-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
    },
  });

  return { tenantId, proyectoId, userId, requisicionId, cuadroId: cuadro.id_cuadro };
}

async function crearProveedor(tenantId: string, nombre: string) {
  return prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-ERP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 999)}`,
      razon_social: nombre,
      estatus: 'ACTIVO',
    },
  });
}

async function getComparativa(cuadroId: string, token: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Test 1.1: mapa estado_respuesta_proveedor con los 3 estados correctos ──

async function testMapaConTresEstados() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const provRespondio = await crearProveedor(seeded.tenantId, 'Proveedor Respondio');
    const provDeclino = await crearProveedor(seeded.tenantId, 'Proveedor Declino');
    const provPendiente = await crearProveedor(seeded.tenantId, 'Proveedor Pendiente');

    const solicitud = await prisma.solicitudCotizacion.create({
      data: {
        tenant_id: seeded.tenantId,
        proyecto_id: seeded.proyectoId,
        requisicion_id: seeded.requisicionId,
        fecha_limite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        creado_por: seeded.userId,
      },
    });

    await prisma.solicitudCotizacionProveedor.createMany({
      data: [
        { tenant_id: seeded.tenantId, solicitud_id: solicitud.id_solicitud, proveedor_id: provRespondio.id_proveedor, estado: 'RESPONDIO', fecha_respuesta: new Date() },
        { tenant_id: seeded.tenantId, solicitud_id: solicitud.id_solicitud, proveedor_id: provDeclino.id_proveedor, estado: 'DECLINO', fecha_respuesta: new Date() },
        { tenant_id: seeded.tenantId, solicitud_id: solicitud.id_solicitud, proveedor_id: provPendiente.id_proveedor, estado: 'PENDIENTE' },
      ],
    });

    const r = await getComparativa(seeded.cuadroId, token);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    const mapa = body.data.estado_respuesta_proveedor;
    assert.ok(mapa, 'estado_respuesta_proveedor debe existir en la respuesta');
    assert.equal(mapa[provRespondio.id_proveedor].estado, 'RESPONDIO');
    assert.equal(mapa[provDeclino.id_proveedor].estado, 'DECLINO');
    assert.equal(mapa[provPendiente.id_proveedor].estado, 'PENDIENTE');
    assert.ok(mapa[provPendiente.id_proveedor].fecha_respuesta === null || mapa[provPendiente.id_proveedor].fecha_respuesta === undefined);

    console.log('ok - 1.1 estado_respuesta_proveedor incluye los 3 estados correctos');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.2: proveedor sin SolicitudCotizacionProveedor no aparece en el mapa ──

async function testProveedorManualNoAparece() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const provManual = await crearProveedor(seeded.tenantId, 'Proveedor Manual Catalogo');

    // Sin ninguna SolicitudCotizacion — el proveedor solo existe en el catálogo.
    const r = await getComparativa(seeded.cuadroId, token);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    const mapa = body.data.estado_respuesta_proveedor;
    assert.ok(mapa, 'estado_respuesta_proveedor debe existir en la respuesta');
    assert.equal(Object.prototype.hasOwnProperty.call(mapa, provManual.id_proveedor), false, 'proveedor sin invitación no debe tener entrada en el mapa');

    console.log('ok - 1.2 proveedor agregado manualmente no aparece en estado_respuesta_proveedor');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.3: requisición sin ninguna SolicitudCotizacion → mapa vacío, sin 500 ──

async function testSinSolicitudCotizacionMapaVacio() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r = await getComparativa(seeded.cuadroId, token);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.deepEqual(body.data.estado_respuesta_proveedor, {});

    console.log('ok - 1.3 cuadro 100% manual (sin SolicitudCotizacion) responde con mapa vacío, sin error 500');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testMapaConTresEstados();          // 1.1
    await testProveedorManualNoAparece();     // 1.2
    await testSinSolicitudCotizacionMapaVacio(); // 1.3
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - estado-respuesta-proveedor-comparativo integration tests');
  console.error(error);
  process.exitCode = 1;
});

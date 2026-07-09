/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: retiro del upload de PDF en el panel de Solicitud de
 * Cotización — el PDF ahora se sube exclusivamente desde el cuadro comparativo.
 * Spec:  openspec/changes/unificar-pdf-cotizacion-comparativa/specs/
 * Tareas: 4.1-4.2 del tasks.md
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
  await prisma.solicitudCotizacionProveedor.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.solicitudCotizacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedSolicitud() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const reqId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-SCP-${Date.now().toString().slice(-8)}`,
      razon_social: 'Proveedor SCP Test',
      estatus: 'ACTIVO',
    },
  });

  const solicitud = await prisma.solicitudCotizacion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: reqId,
      fecha_limite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      creado_por: userId,
      proveedores: {
        create: [{ tenant_id: tenantId, proveedor_id: proveedor.id_proveedor, estado: 'PENDIENTE' }],
      },
    },
    include: { proveedores: true },
  });

  return { tenantId, proyectoId, userId, reqId, scpId: solicitud.proveedores[0].id_scp };
}

// ── Test 4.1: PATCH de estado/notas sin archivo sigue funcionando ────────────

async function testEstadoSinArchivoSigueFuncionando() {
  const seeded = await seedSolicitud();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r = await fetch(
      `${comprasBaseUrl}/api/v1/compras/requisiciones/${seeded.reqId}/solicitud-cotizacion/proveedores/${seeded.scpId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'RESPONDIO', notas_proveedor: 'Confirmó por teléfono, sin PDF.' }),
      }
    );

    assert.equal(r.status, 200, 'PUT debe seguir aceptando estado/notas_proveedor sin archivo');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'RESPONDIO');
    assert.equal(body.data.notas_proveedor, 'Confirmó por teléfono, sin PDF.');
    assert.ok(body.data.fecha_respuesta, 'fecha_respuesta debe quedar seteada');

    console.log('ok - 4.1 marcar estado/notas_proveedor sin archivo sigue funcionando');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 4.2: el endpoint ya no acepta multipart — no hay middleware de carga ──
// de archivo en la ruta. Un campo "archivo" en el body JSON tampoco escribe nada
// (el update de Prisma solo toma estado/notas_proveedor).

async function testArchivoNoSeProcesaNiPorJsonNiPorMultipart() {
  const seeded = await seedSolicitud();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r = await fetch(
      `${comprasBaseUrl}/api/v1/compras/requisiciones/${seeded.reqId}/solicitud-cotizacion/proveedores/${seeded.scpId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'RESPONDIO', archivo: 'esto-no-deberia-persistirse.pdf' }),
      }
    );

    assert.equal(r.status, 200, 'El endpoint debe seguir aceptando la actualización de estado por JSON');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'RESPONDIO');

    const scp = await prisma.solicitudCotizacionProveedor.findUnique({ where: { id_scp: seeded.scpId } });
    assert.equal(scp?.pdf_ruta, null, 'pdf_ruta NO debe escribirse — el endpoint ya no procesa archivos');
    assert.equal(scp?.pdf_nombre, null);

    console.log('ok - 4.2 un campo "archivo" en el body no se persiste — el endpoint ya no tiene middleware de carga');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testEstadoSinArchivoSigueFuncionando();          // 4.1
    await testArchivoNoSeProcesaNiPorJsonNiPorMultipart(); // 4.2
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - solicitud-cotizacion-proveedor-sin-upload integration tests');
  console.error(error);
  process.exitCode = 1;
});

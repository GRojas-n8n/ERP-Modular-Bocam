/**
 * Test de Integración: GET /presupuesto/activo expone precio_unitario y
 * cantidad por concepto
 * Spec:  openspec/changes/fix-estimaciones-residente-desconectado/
 * Tarea: 2.1 del tasks.md
 *
 * control-proyectos necesita resolver precio_unitario/cantidad_presupuestada
 * del catálogo real de gerencia-tecnica al registrar un avance físico (en
 * vez de aceptarlos del cliente). Este endpoint es el que va a consultar
 * por B2B, y hoy su `select` de conceptos no incluye esos campos aunque el
 * modelo Concepto ya los tiene.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedPresupuestoConConcepto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  const presupuesto = await prisma.presupuestoBase.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      version: 1,
      conceptos: {
        create: {
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          clave: 'CIM-001',
          descripcion: 'Cimentación de prueba',
          unidad_medida: 'M3',
          cantidad: 120.5,
          precio_unitario: 3450.75,
          importe: 415795.375,
        },
      },
    },
    include: { conceptos: true },
  });

  return { tenantId, proyectoId, conceptoId: presupuesto.conceptos[0].id };
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

// ── Test 2.1: el select de presupuesto/activo expone precio_unitario y cantidad por concepto ──

async function testPresupuestoActivoExponePrecioYCantidad() {
  const seeded = await seedPresupuestoConConcepto();
  try {
    const t = token(seeded.tenantId, seeded.proyectoId, ['admin']);

    const r = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuesto/activo`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    assert.equal(r.status, 200, 'GET /presupuesto/activo debe responder 200');

    const body = await r.json() as any;
    const concepto = body.data.conceptos.find((c: any) => c.id === seeded.conceptoId);
    assert.ok(concepto, 'el concepto sembrado debe estar en la respuesta');

    assert.equal(
      concepto.precio_unitario, '3450.75',
      'precio_unitario del concepto debe venir en la respuesta (hoy falta en el select)'
    );
    assert.equal(
      concepto.cantidad, '120.5',
      'cantidad presupuestada del concepto debe venir en la respuesta (hoy falta en el select)'
    );

    console.log('ok - 2.1 GET /presupuesto/activo expone precio_unitario y cantidad por concepto');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testPresupuestoActivoExponePrecioYCantidad(); // 2.1
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - presupuesto-activo-precio-cantidad integration tests');
  console.error(error);
  process.exitCode = 1;
});

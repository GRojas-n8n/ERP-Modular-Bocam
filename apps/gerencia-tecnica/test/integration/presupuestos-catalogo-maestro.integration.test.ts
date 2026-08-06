/**
 * Test de Integración: catálogo maestro de conceptos (ConceptoCatalogo)
 * Spec: openspec/changes/wbs-jerarquico-conceptos/specs/catalogo-maestro-conceptos/spec.md
 * Tareas: 4.1-4.5 del tasks.md
 *
 * Hoy POST /presupuestos no consulta ni actualiza ningún catálogo maestro de
 * conceptos: dos residentes en dos obras distintas del mismo tenant pueden
 * usar la misma clave para conceptos con descripciones distintas sin que el
 * sistema avise. Este test confirma primero el gap (rojo) y luego valida el
 * fix (verde).
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
  await (prisma as any).conceptoCatalogo.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[] = ['admin']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function postPresupuesto(baseHeaders: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuestos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...baseHeaders },
    body: JSON.stringify(body),
  });
}

// ── Test 4.1/4.4: clave ya usada en otra obra del tenant, con descripción distinta → advertencia ──

async function testClaveDivergenteGeneraAdvertencia() {
  const tenantId = randomUUID();
  const proyectoObraA = randomUUID();
  const proyectoObraB = randomUUID();
  try {
    // Obra A: crea CIM-001 con una descripción/unidad determinada.
    const tA = token(tenantId, proyectoObraA);
    const rA = await postPresupuesto({ Authorization: `Bearer ${tA}` }, {
      proyecto_id: proyectoObraA,
      version: 1,
      conceptos: [
        { clave: 'CIM-001', descripcion: 'Excavación en cepa', unidad_medida: 'M3', cantidad: 10, precio_unitario: 100 },
      ],
    });
    assert.equal(rA.status, 201, 'la obra A debe crear su presupuesto correctamente');

    const enCatalogo = await (prisma as any).conceptoCatalogo.findFirst({ where: { tenant_id: tenantId, clave: 'CIM-001' } });
    assert.ok(enCatalogo, 'la clave nueva CIM-001 debe agregarse al catálogo maestro (4.2)');
    assert.equal(enCatalogo.descripcion, 'Excavación en cepa');
    assert.equal(enCatalogo.unidad_medida, 'M3');

    // Obra B: misma clave, descripción distinta → debe generar advertencia, pero SÍ crear el concepto (no bloquea).
    const tB = token(tenantId, proyectoObraB);
    const rB = await postPresupuesto({ Authorization: `Bearer ${tB}` }, {
      proyecto_id: proyectoObraB,
      version: 1,
      conceptos: [
        { clave: 'CIM-001', descripcion: 'Excavación a mano', unidad_medida: 'M3', cantidad: 20, precio_unitario: 150 },
      ],
    });
    assert.equal(rB.status, 201, 'el concepto debe crearse igual aunque la clave diverja del catálogo (no bloquea, 4.4)');
    const bodyB = await rB.json() as any;
    assert.ok(Array.isArray(bodyB.data.advertencias), 'debe venir un arreglo advertencias en la respuesta');
    assert.ok(
      bodyB.data.advertencias.some((a: string) => a.includes('CIM-001')),
      'la advertencia debe mencionar la clave divergente CIM-001'
    );

    const conceptoObraB = bodyB.data.conceptos.find((c: any) => c.clave === 'CIM-001');
    assert.ok(conceptoObraB, 'el concepto debe haberse creado en la obra B');
    // 4.5: precio_unitario/cantidad SIEMPRE del archivo importado, nunca del catálogo.
    assert.equal(Number(conceptoObraB.precio_unitario), 150, 'precio_unitario debe ser el del archivo importado, no el del catálogo');
    assert.equal(Number(conceptoObraB.cantidad), 20, 'cantidad debe ser la del archivo importado, no el del catálogo');

    // El catálogo maestro NO debe haberse sobrescrito con los datos de la obra B.
    const catalogoTrasB = await (prisma as any).conceptoCatalogo.findFirst({ where: { tenant_id: tenantId, clave: 'CIM-001' } });
    assert.equal(catalogoTrasB.descripcion, 'Excavación en cepa', 'el catálogo conserva la descripción original, no se sobrescribe');

    console.log('ok - 4.1/4.2/4.4/4.5 clave nueva se agrega al catálogo; clave divergente advierte sin bloquear; precio/cantidad del archivo');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 4.3: clave conocida con datos consistentes → sin advertencia ──

async function testClaveConsistenteSinAdvertencia() {
  const tenantId = randomUUID();
  const proyectoObraA = randomUUID();
  const proyectoObraB = randomUUID();
  try {
    const tA = token(tenantId, proyectoObraA);
    await postPresupuesto({ Authorization: `Bearer ${tA}` }, {
      proyecto_id: proyectoObraA,
      version: 1,
      conceptos: [
        { clave: 'ACO-010', descripcion: 'Acero de refuerzo fy=4200', unidad_medida: 'KG', cantidad: 500, precio_unitario: 25 },
      ],
    });

    const tB = token(tenantId, proyectoObraB);
    const rB = await postPresupuesto({ Authorization: `Bearer ${tB}` }, {
      proyecto_id: proyectoObraB,
      version: 1,
      conceptos: [
        { clave: 'ACO-010', descripcion: 'Acero de refuerzo fy=4200', unidad_medida: 'KG', cantidad: 300, precio_unitario: 27 },
      ],
    });
    assert.equal(rB.status, 201);
    const bodyB = await rB.json() as any;
    assert.ok(
      !bodyB.data.advertencias || !bodyB.data.advertencias.some((a: string) => a.includes('ACO-010')),
      'no debe haber advertencia cuando la descripción/unidad coinciden con el catálogo'
    );

    console.log('ok - 4.3 clave conocida con datos consistentes no genera advertencia');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testClaveDivergenteGeneraAdvertencia();   // 4.1, 4.2, 4.4, 4.5
    await testClaveConsistenteSinAdvertencia();      // 4.3
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - presupuestos-catalogo-maestro integration tests');
  console.error(error);
  process.exitCode = 1;
});

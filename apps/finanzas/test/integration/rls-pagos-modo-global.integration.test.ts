/**
 * Tests de Integración: GET /pagos en modo global (openspec:
 * aislamiento-proyecto-por-modulo, tareas 6.1/6.2)
 *
 * Confirma que la RLS Patrón Global con Trazabilidad de `programa_pagos`
 * hace exactamente lo que se pidió: con un proyecto activo en la sesión el
 * comportamiento no cambia (sigue estricto); sin proyecto activo (rol
 * tenant-level, p. ej. `finanzas`), la consulta consolida pagos de todos los
 * proyectos del tenant, cada fila con su `proyecto_id` de origen intacto —
 * y un tenant distinto sigue completamente excluido en ambos modos.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 *           apps/finanzas/prisma/rls-policies.sql ya aplicado.
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl = process.env.FINANZAS_DATABASE_URL
  || process.env.DATABASE_URL
  || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

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
  await prisma.programaPagos.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearPresupuestoYPago(tenantId: string, proyectoId: string, concepto: string) {
  const presupuesto = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-GLOBAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      descripcion: `Presupuesto de prueba modo global — ${concepto}`,
      monto_autorizado: 50000,
      monto_disponible: 50000,
      capitulo: 'MATERIALES',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  return prisma.programaPagos.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      presupuesto_id: presupuesto.id_presupuesto,
      concepto,
      beneficiario: 'Proveedor de prueba',
      monto_programado: 10000,
      fecha_programada: new Date('2026-09-01'),
      estado: 'PROGRAMADO',
    },
  });
}

async function get(path: string, token: string) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json as any };
}

async function testConProyectoActivoSigueEstricto() {
  const tenantA = randomUUID();
  const proyectoA = randomUUID();
  const proyectoOtroDeA = randomUUID();

  await crearPresupuestoYPago(tenantA, proyectoA, 'Pago proyecto A');
  await crearPresupuestoYPago(tenantA, proyectoOtroDeA, 'Pago proyecto otro de A');

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: tenantA, proyectoId: proyectoA, roles: ['finanzas'] });
    const r = await get('/api/v1/finanzas/pagos', token);

    assert.equal(r.status, 200);
    const conceptos = (r.body.data as any[]).map(p => p.concepto);
    assert.ok(conceptos.includes('Pago proyecto A'), 'debe incluir el pago del proyecto activo');
    assert.ok(
      !conceptos.includes('Pago proyecto otro de A'),
      'con proyecto activo NO debe mezclar pagos de otro proyecto del mismo tenant (regresión — sin cambio de comportamiento)'
    );

    console.log('ok - GET /pagos con proyecto activo sigue estricto (regresión, tarea 6.1)');
  } finally {
    await cleanupTenant(tenantA);
  }
}

async function testSinProyectoActivoConsolidaTodoElTenant() {
  const tenantA = randomUUID();
  const proyectoA = randomUUID();
  const proyectoOtroDeA = randomUUID();
  const tenantB = randomUUID();
  const proyectoB = randomUUID();

  await crearPresupuestoYPago(tenantA, proyectoA, 'Pago global A1');
  await crearPresupuestoYPago(tenantA, proyectoOtroDeA, 'Pago global A2');
  await crearPresupuestoYPago(tenantB, proyectoB, 'Pago de otro tenant');

  try {
    // rol finanzas, sin proyectoId — modo global (mismo mecanismo que ya usa
    // requireProjectAccess() para tratar a 'finanzas' como rol tenant-level)
    const token = signTenantToken({ userId: randomUUID(), tenantId: tenantA, proyectoId: '', roles: ['finanzas'] });
    const r = await get('/api/v1/finanzas/pagos', token);

    assert.equal(r.status, 200, 'sin proyecto activo, un rol finanzas debe recibir 200 (no 500 por error de cast — ver fix de current_proyecto_id())');
    const filas = r.body.data as any[];
    const conceptos = filas.map(p => p.concepto);

    assert.ok(conceptos.includes('Pago global A1'), 'modo global debe incluir pagos del proyecto A');
    assert.ok(conceptos.includes('Pago global A2'), 'modo global debe incluir pagos del otro proyecto de A (comportamiento nuevo)');
    assert.ok(
      !conceptos.includes('Pago de otro tenant'),
      'modo global NUNCA debe cruzar tenants — el aislamiento por tenant_id se mantiene siempre'
    );

    const pagoA1 = filas.find(p => p.concepto === 'Pago global A1');
    const pagoA2 = filas.find(p => p.concepto === 'Pago global A2');
    assert.equal(pagoA1.proyecto_id, proyectoA, 'cada fila conserva su proyecto_id de origen (trazabilidad)');
    assert.equal(pagoA2.proyecto_id, proyectoOtroDeA, 'cada fila conserva su proyecto_id de origen (trazabilidad)');

    console.log('ok - GET /pagos sin proyecto activo consolida todos los proyectos del tenant, trazable por fila (tarea 6.2)');
  } finally {
    await cleanupTenant(tenantA);
    await cleanupTenant(tenantB);
  }
}

async function main() {
  await setup();
  try {
    await testConProyectoActivoSigueEstricto();
    await testSinProyectoActivoConsolidaTodoElTenant();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-pagos-modo-global integration tests');
  console.error(error);
  process.exitCode = 1;
});

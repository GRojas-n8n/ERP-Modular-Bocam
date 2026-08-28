/**
 * Test de Integración: GET /api/v1/control-proyectos/avance-resumen-multi
 *
 * Ver openspec/changes/fix-avance-mock-mis-proyectos/. El Dashboard estándar
 * ("Mis Proyectos") mostraba un avance sintético (35 + index*20) por tarjeta
 * de proyecto — este endpoint nuevo expone el avance físico real (mismo
 * cálculo que /resumen-dashboard, pero para varios proyectos a la vez y sin
 * restringir a roles superintendent/admin) para que el frontend lo consuma.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env).
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const prisma = new PrismaClient();

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

function avanceBase(tenantId: string, proyectoId: string, userId: string, porcentaje: number, estado: string) {
  return {
    tenant_id: tenantId,
    proyecto_id: proyectoId,
    concepto_presupuesto: 'CIM-001',
    descripcion_concepto: 'Concepto de prueba',
    cantidad_presupuestada: '100.0000',
    cantidad_periodo: '46.0000',
    cantidad_acumulada: '46.0000',
    unidad: 'M3',
    precio_unitario: '10.0000',
    importe_periodo: '460.00',
    importe_acumulado: '460.00',
    porcentaje_avance: porcentaje.toFixed(2),
    periodo_inicio: new Date('2026-01-01'),
    periodo_fin: new Date('2026-01-15'),
    registrado_por_id: userId,
    registrado_por_nombre: 'Residente de prueba',
    estado,
  };
}

async function cleanupProyecto(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'test-seed' }, (tx) =>
    tx.avanceFisico.deleteMany({ where: { tenant_id: tenantId, proyecto_id: proyectoId } })
  );
}

async function get(pathUrl: string, token: string) {
  return fetch(`${baseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function testAvanceMultiProyectoYFiltradoDeAcceso() {
  const tenantId    = randomUUID();
  const userId      = randomUUID();
  const proyectoA   = randomUUID(); // con avance validado
  const proyectoB   = randomUUID(); // sin avances
  const proyectoAjeno = randomUUID(); // el usuario NO tiene acceso — no debe filtrarse su avance

  await createTenantContext({ tenantId, proyectoId: proyectoA, userId: 'test-seed' }, (tx) =>
    tx.avanceFisico.create({ data: avanceBase(tenantId, proyectoA, userId, 46, 'VALIDADO') })
  );
  // Avance PENDIENTE en A no debe contar en el promedio (mismo criterio que /resumen-dashboard)
  await createTenantContext({ tenantId, proyectoId: proyectoA, userId: 'test-seed' }, (tx) =>
    tx.avanceFisico.create({ data: avanceBase(tenantId, proyectoA, userId, 90, 'PENDIENTE') })
  );
  await createTenantContext({ tenantId, proyectoId: proyectoAjeno, userId: 'test-seed' }, (tx) =>
    tx.avanceFisico.create({ data: avanceBase(tenantId, proyectoAjeno, userId, 99, 'VALIDADO') })
  );

  try {
    const token = signTenantToken({
      userId,
      tenantId,
      proyectoId: proyectoA,
      roles: ['residencia'], // rol distinto de superintendent/admin — a propósito
      projects: [proyectoA, proyectoB],
    });

    const r = await get(
      `/api/v1/control-proyectos/avance-resumen-multi?proyecto_ids=${proyectoA},${proyectoB},${proyectoAjeno}`,
      token
    );
    assert.equal(r.status, 200, 'un rol distinto de superintendent/admin debe poder usar este endpoint (a diferencia de /resumen-dashboard)');
    const body = await r.json();
    const porProyecto = new Map<string, any>(body.data.map((d: any) => [d.proyecto_id, d]));

    assert.equal(porProyecto.size, 2, 'el proyecto ajeno (fuera de authorizedProjects) no debe aparecer en la respuesta');
    assert.ok(!porProyecto.has(proyectoAjeno), 'no debe filtrarse el avance del proyecto ajeno');

    const dataA = porProyecto.get(proyectoA);
    assert.equal(dataA.tiene_avances, true);
    assert.equal(dataA.avance_pct, 46, 'debe promediar solo VALIDADO, ignorando el PENDIENTE de 90%');

    const dataB = porProyecto.get(proyectoB);
    assert.equal(dataB.tiene_avances, false, 'proyecto sin avances debe indicar tiene_avances: false, no solo avance_pct: 0');
    assert.equal(dataB.avance_pct, 0);

    console.log('ok - control-proyectos: avance-resumen-multi calcula avance real por proyecto y excluye proyectos sin acceso');
  } finally {
    await cleanupProyecto(tenantId, proyectoA);
    await cleanupProyecto(tenantId, proyectoAjeno);
  }
}

async function main() {
  await setup();
  try {
    await testAvanceMultiProyectoYFiltradoDeAcceso();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - avance-resumen-multi integration tests (control-proyectos)');
  console.error(error);
  process.exitCode = 1;
});

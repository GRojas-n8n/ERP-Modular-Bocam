/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: IDOR cross-tenant en Cuadro Comparativo / Detalles
 * Spec:  openspec/changes/fix-rls-compras-tablas-sin-cobertura/
 * Tarea: 1.3-1.4 del tasks.md
 *
 * `GET /api/v1/compras/comparativas/:id` resuelve `cuadroComparativo` por PK
 * (`findUnique({ where: { id_cuadro: id } })`) sin filtrar por `tenant_id` ni
 * verificar el resultado después — depende 100% de RLS para el aislamiento.
 * Con RLS deshabilitado en `cuadros_comparativos`/`comparativas_detalles`
 * (estado real de producción confirmado el 2026-07-26), cualquier tenant que
 * conozca el `id_cuadro` de otro puede leerlo completo, incluyendo sus
 * `detalles` (precios, proveedor). Este test reproduce esa fuga contra el
 * endpoint HTTP real, no contra la política de Postgres en aislamiento.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999'; // EventBus falla silenciosamente

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => {
    res.json({ success: true, data: { tiene_suficiencia: true } });
  });
  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadroDeOtroTenant() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-IDOR-${Date.now().toString().slice(-8)}`,
      razon_social: 'Proveedor Secreto Tenant A',
      estatus: 'ACTIVO',
    },
  });

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-IDOR-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
      detalles: {
        create: [{
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          proveedor_id: proveedor.id_proveedor,
          insumo_id: randomUUID(),
          precio_ofertado: '123456.7890',
          es_ganador: true,
        }],
      },
    },
    include: { detalles: true },
  });

  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, codigo: cuadro.codigo, precioSecreto: '123456.7890' };
}

async function get(pathUrl: string, token: string) {
  return fetch(`${comprasBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function testIdorCuadroComparativoCrossTenant() {
  const cuadroDeA = await seedCuadroDeOtroTenant();
  const tenantBId = randomUUID();
  const proyectoBId = randomUUID();
  const userBId = randomUUID();

  try {
    const tokenTenantB = signTenantToken({ userId: userBId, tenantId: tenantBId, proyectoId: proyectoBId, roles: ['procurement'] });

    const r = await get(`/api/v1/compras/comparativas/${cuadroDeA.cuadroId}`, tokenTenantB);
    const body = (await r.json()) as any;

    assert.notEqual(
      r.status, 200,
      `Un usuario del tenant B pudo leer un cuadro comparativo del tenant A (status ${r.status}). ` +
      `Esto es el IDOR: cuadroComparativo.findUnique() no filtra por tenant_id y RLS está deshabilitado ` +
      `en cuadros_comparativos/comparativas_detalles en producción.`
    );
    assert.equal(r.status, 404, 'debe responder 404 (no encontrado), no exponer el recurso de otro tenant');

    if (r.status === 200) {
      assert.notEqual(body?.data?.codigo, cuadroDeA.codigo, 'el código del cuadro de otro tenant no debe filtrarse');
    }

    console.log('ok - GET /comparativas/:id no expone cuadros de otro tenant (404 esperado)');
  } finally {
    await cleanupTenant(cuadroDeA.tenantId);
    await cleanupTenant(tenantBId);
  }
}

async function main() {
  await setup();
  try {
    await testIdorCuadroComparativoCrossTenant();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-idor-cuadro-comparativo integration tests');
  console.error(error);
  process.exitCode = 1;
});

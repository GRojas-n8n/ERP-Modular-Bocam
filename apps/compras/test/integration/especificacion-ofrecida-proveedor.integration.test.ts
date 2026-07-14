/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: especificacion_ofrecida por (renglón, proveedor) en
 * ComparativaDetalle (columna existente valor_ofrecido_spec)
 * Spec:  openspec/changes/especificacion-tecnica-ofrecida-proveedor/
 * Tarea: 1.1 del tasks.md — fija el comportamiento esperado (falla contra el
 * código actual: el campo nunca se persiste desde este endpoint).
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
  'postgresql://postgres:bocam_dev_password@127.0.0.1:5432/bocam_erp?schema=compras';

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
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadro() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-EO-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
    },
  });

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro };
}

async function putCotizaciones(
  cuadroId: string,
  token: string,
  proveedores: Array<{ nombre: string; precios: Array<{ insumo_id: string; precio: number; especificacion_ofrecida?: string }> }>,
) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}/cotizaciones`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ proveedores }),
  });
}

// ── Test: especificacion_ofrecida se persiste SEPARADA por proveedor en el mismo renglón ──

async function testEspecificacionOfrecidaSeparadaPorProveedor() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const insumoId = randomUUID();

    const r = await putCotizaciones(seeded.cuadroId, token, [
      { nombre: 'Proveedor A Specs', precios: [{ insumo_id: insumoId, precio: 1000, especificacion_ofrecida: 'Motor 5HP, marca Baldor, IP55' }] },
      { nombre: 'Proveedor B Specs', precios: [{ insumo_id: insumoId, precio: 1200, especificacion_ofrecida: 'Motor 5HP, marca WEG, IP54' }] },
    ]);
    assert.equal(r.status, 200, 'PUT cotizaciones debe retornar 200');

    const detalles = await prisma.comparativaDetalle.findMany({
      where: { cuadro_id: seeded.cuadroId, insumo_id: insumoId },
      include: { proveedor: true },
    });
    assert.equal(detalles.length, 2, 'Debe haber un ComparativaDetalle por proveedor');

    const porNombre = new Map(detalles.map(d => [d.proveedor.razon_social, d.valor_ofrecido_spec]));
    assert.equal(porNombre.get('Proveedor A Specs'), 'Motor 5HP, marca Baldor, IP55');
    assert.equal(porNombre.get('Proveedor B Specs'), 'Motor 5HP, marca WEG, IP54');
    assert.notEqual(
      porNombre.get('Proveedor A Specs'),
      porNombre.get('Proveedor B Specs'),
      'los valores deben quedar separados por proveedor, no colapsados a uno solo',
    );

    console.log('ok - especificacion_ofrecida se persiste separada por (renglón, proveedor)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test: sin especificacion_ofrecida, el precio se persiste igual con valor_ofrecido_spec null ──

async function testSinEspecificacionOfrecidaNoBloquea() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const insumoId = randomUUID();

    const r = await putCotizaciones(seeded.cuadroId, token, [
      { nombre: 'Proveedor Sin Specs', precios: [{ insumo_id: insumoId, precio: 900 }] },
    ]);
    assert.equal(r.status, 200);

    const detalle = await prisma.comparativaDetalle.findFirst({
      where: { cuadro_id: seeded.cuadroId, insumo_id: insumoId },
    });
    assert.ok(detalle, 'Debe existir el detalle persistido');
    assert.equal(Number(detalle!.precio_ofertado), 900);
    assert.equal(detalle!.valor_ofrecido_spec, null, 'valor_ofrecido_spec debe quedar null sin bloquear el guardado');

    console.log('ok - guardar sin especificacion_ofrecida persiste el precio igual, con spec null');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testEspecificacionOfrecidaSeparadaPorProveedor();
    await testSinEspecificacionOfrecidaNoBloquea();
  } finally {
    await teardown();
  }
}

void main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('not ok - especificacion-ofrecida-proveedor integration tests');
    console.error(error);
    process.exit(1);
  });

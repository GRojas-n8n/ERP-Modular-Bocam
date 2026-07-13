/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: ítems de requisición de texto libre (imprevisto, sin
 * insumo_id de catálogo) obtienen línea y pueden tener precio en el Cuadro
 * Comparativo.
 * Spec:  openspec/changes/cotizar-items-texto-libre-comparativa/specs/
 * Tareas: 2.1, 3.3, 4.3, 4.4, 5.2 del tasks.md
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
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedRequisicionConItemLibre(conItemCatalogo = false) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const insumoIdCatalogo = randomUUID();

  const requisicion = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `REQ-LIBRE-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      solicitante_id: userId,
      estado: 'APROBADA',
      tipo: 'IMPREVISTO',
    },
  });

  const itemLibre = await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicion.id_requisicion,
      insumo_id: null,
      cantidad: 1,
      descripcion_libre: 'Mini Split de 1 Tonelada (12,000 BTU) a 220V',
      es_imprevisto: true,
    },
  });

  let itemCatalogo: { id_item: string } | null = null;
  if (conItemCatalogo) {
    itemCatalogo = await prisma.requisicionItem.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        requisicion_id: requisicion.id_requisicion,
        insumo_id: insumoIdCatalogo,
        cantidad: 5,
      },
    });
  }

  return { tenantId, proyectoId, userId, requisicionId: requisicion.id_requisicion, itemLibreId: itemLibre.id_item, itemCatalogoId: itemCatalogo?.id_item ?? null, insumoIdCatalogo };
}

async function postComparativa(requisicionId: string, token: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requisicion_id: requisicionId }),
  });
}

async function putCotizaciones(cuadroId: string, token: string, proveedorNombre: string, precios: Array<{ insumo_id?: string; detalle_req_id?: string; precio: number }>) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}/cotizaciones`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ proveedores: [{ nombre: proveedorNombre, precios }] }),
  });
}

// ── Test 2.1/3.3: el cuadro se crea con línea para el ítem sin insumo_id ──

async function testCreaLineaParaItemSinInsumo() {
  const seeded = await seedRequisicionConItemLibre(/* conItemCatalogo */ true);
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const r = await postComparativa(seeded.requisicionId, token);
    assert.equal(r.status, 201);

    const lineaLibre = await prisma.comparativaLinea.findFirst({
      where: { tenant_id: seeded.tenantId, detalle_req_id: seeded.itemLibreId },
    });
    assert.ok(lineaLibre, 'Debe existir una línea para el ítem sin insumo_id, identificada por detalle_req_id');
    assert.equal(lineaLibre!.insumo_id, null);

    const lineaCatalogo = await prisma.comparativaLinea.findFirst({
      where: { tenant_id: seeded.tenantId, insumo_id: seeded.insumoIdCatalogo },
    });
    assert.ok(lineaCatalogo, 'La línea con insumo de catálogo debe seguir creándose, sin regresión');

    console.log('ok - 2.1/3.3 el cuadro se crea con línea para el ítem sin insumo_id, sin afectar la línea con catálogo');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 4.3/4.4: guardar precio de una línea sin insumo_id (mezclado con una con insumo_id) ──

async function testGuardaPrecioLineaSinInsumo() {
  const seeded = await seedRequisicionConItemLibre(/* conItemCatalogo */ true);
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const rCrear = await postComparativa(seeded.requisicionId, token);
    assert.equal(rCrear.status, 201);
    const cuadro = await prisma.cuadroComparativo.findFirstOrThrow({ where: { tenant_id: seeded.tenantId } });

    const rCot = await putCotizaciones(cuadro.id_cuadro, token, 'Proveedor Texto Libre', [
      { detalle_req_id: seeded.itemLibreId, precio: 8500 },
      { insumo_id: seeded.insumoIdCatalogo, precio: 100 },
    ]);
    assert.equal(rCot.status, 200, 'PUT cotizaciones debe retornar 200');

    const detalleLibre = await prisma.comparativaDetalle.findFirst({
      where: { tenant_id: seeded.tenantId, detalle_req_id: seeded.itemLibreId },
    });
    assert.ok(detalleLibre, 'Debe existir un ComparativaDetalle para la línea sin insumo_id');
    assert.equal(Number(detalleLibre!.precio_ofertado), 8500);
    assert.equal(detalleLibre!.insumo_id, null);

    const detalleCatalogo = await prisma.comparativaDetalle.findFirst({
      where: { tenant_id: seeded.tenantId, insumo_id: seeded.insumoIdCatalogo },
    });
    assert.ok(detalleCatalogo, 'El detalle con insumo de catálogo debe seguir persistiendo, sin regresión');
    assert.equal(Number(detalleCatalogo!.precio_ofertado), 100);

    console.log('ok - 4.3/4.4 guardar precio de una línea sin insumo_id (mezclado con una con insumo_id) persiste ambos correctamente');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 5.2: editar marca/especificaciones de una línea sin insumo_id ──

async function testEditaMarcaEspecificacionesLineaSinInsumo() {
  const seeded = await seedRequisicionConItemLibre();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const rCrear = await postComparativa(seeded.requisicionId, token);
    assert.equal(rCrear.status, 201);
    const cuadro = await prisma.cuadroComparativo.findFirstOrThrow({ where: { tenant_id: seeded.tenantId } });

    const r = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadro.id_cuadro}/lineas/${seeded.itemLibreId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ marca_modelo_ref: 'Mirage o equivalente', especificaciones_requeridas: 'Instalación incluida' }),
    });
    assert.equal(r.status, 200, 'PUT lineas/:id debe aceptar un detalle_req_id como identificador');

    const linea = await prisma.comparativaLinea.findFirst({ where: { tenant_id: seeded.tenantId, detalle_req_id: seeded.itemLibreId } });
    assert.ok(linea);
    assert.equal(linea!.marca_modelo_ref, 'Mirage o equivalente');
    assert.equal(linea!.especificaciones_requeridas, 'Instalación incluida');

    console.log('ok - 5.2 editar marca/especificaciones de una línea sin insumo_id (identificada por detalle_req_id) persiste correctamente');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testCreaLineaParaItemSinInsumo();
    await testGuardaPrecioLineaSinInsumo();
    await testEditaMarcaEspecificacionesLineaSinInsumo();
    console.log('\nTodos los tests pasaron.');
  } finally {
    await teardown();
  }
}

main().catch((err) => {
  console.error('FALLO:', err);
  process.exitCode = 1;
});

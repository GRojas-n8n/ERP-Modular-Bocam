/**
 * Tests de Integración: convertir-oc conserva el snapshot del insumo en la OC
 * Change: fix-ingresos-almacen-por-recepcion-oc (sección 4)
 *
 * El evento de recepción se arma con datos PERSISTIDOS en Compras. Este test verifica que, al crear la OC, cada
 * renglón de catálogo guarda clave, descripción, unidad y categoría del insumo; y que si Gerencia Técnica no
 * responde en ese momento la OC se crea igual (el snapshot se completará en la primera recepción).
 *
 * Runner: npm run test:integration:oc-snapshot-insumo -w @bocam/compras
 * Requiere: PostgreSQL (DATABASE_URL → schema compras). No requiere RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@127.0.0.1:5432/bocam_erp?schema=compras';
process.env.DATABASE_URL = comprasDbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

const INSUMO = randomUUID();
let comprasServer: Server | undefined;
let stubs: Server[] = [];
let baseUrl = '';
let gtDisponible = true;

async function setup() {
  const finanzas = express();
  finanzas.use(express.json());
  finanzas.get('/api/v1/finanzas/suficiencia', (_req, res) => res.json({ success: true, data: { tiene_suficiencia: true } }));
  finanzas.post('/api/v1/finanzas/comprometer-fondos', (_req, res) => res.json({ success: true, data: { status: 'COMPROMETIDO' } }));
  const f = await startHttpApp(finanzas);
  process.env.FINANZAS_URL = `${f.baseUrl}/api/v1/finanzas`;

  const gt = express();
  gt.use(express.json());
  gt.get('/api/v1/gerencia-tecnica/partidas/:id/saldo', (_req, res) => res.json({ success: true, data: { monto_disponible: 999999, estado_tope: 'NORMAL', bloqueo_automatico: false } }));
  gt.post('/api/v1/gerencia-tecnica/partidas/:id/comprometer', (_req, res) => res.json({ success: true }));
  gt.get('/api/v1/gerencia-tecnica/insumos', (_req, res) => {
    if (!gtDisponible) return void res.status(503).json({ success: false });
    res.json({ success: true, data: [{ id: INSUMO, clave: 'MAT-OC-1', descripcion: 'Cemento gris', unidad_medida: 'SAC', tipo_insumo: 'MATERIAL' }] });
  });
  const g = await startHttpApp(gt);
  process.env.GT_URL = `${g.baseUrl}/api/v1/gerencia-tecnica`;
  stubs = [f.server, g.server];

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  comprasServer = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  for (const s of stubs) await stopHttpApp(s);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

/** Cuadro APROBADO_GT con un renglón de CATÁLOGO ganador. */
async function seedCuadroCatalogo() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const userId = randomUUID();
  const req = await prisma.requisicion.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, codigo: `REQ-SNAP-${Date.now().toString().slice(-6)}`, solicitante_id: userId, estado: 'COMPRADA', tipo: 'NORMAL' },
  });
  const item = await prisma.requisicionItem.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion, insumo_id: INSUMO, cantidad: '12.0000' },
  });
  const prov = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFCSNAP${Date.now().toString().slice(-6)}`, razon_social: 'Proveedor snapshot', estatus: 'ACTIVO' },
  });
  const cuadro = await prisma.cuadroComparativo.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion, codigo: `CC-SNAP-${Date.now()}`, estado: 'APROBADO_GT', primera_opcion_proveedor_id: prov.id_proveedor },
  });
  await prisma.comparativaLinea.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro, insumo_id: INSUMO, detalle_req_id: item.id_item },
  });
  await prisma.comparativaDetalle.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro, proveedor_id: prov.id_proveedor, insumo_id: INSUMO,
      precio_ofertado: '50.0000', evaluacion_tecnica: 'C', aprobacion_gt: 'C', es_ganador: true,
    } as any,
  });
  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro };
}

async function convertir(s: { tenantId: string; proyectoId: string; cuadroId: string }) {
  const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['procurement'], projects: [s.proyectoId] });
  return fetch(`${baseUrl}/api/v1/compras/comparativas/${s.cuadroId}/convertir-oc`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ presupuesto_id: randomUUID() }),
  });
}

async function testConvertirOcPersisteElSnapshotDelInsumo() {
  const s = await seedCuadroCatalogo();
  try {
    const r = await convertir(s);
    assert.equal(r.status, 201, JSON.stringify(await r.json()));
    const item: any = await prisma.ordenCompraItem.findFirst({ where: { tenant_id: s.tenantId } });
    assert.equal(item.insumo_id, INSUMO);
    assert.deepEqual([item.clave_snapshot, item.descripcion_snapshot, item.unidad_snapshot, item.categoria_snapshot],
      ['MAT-OC-1', 'Cemento gris', 'SAC', 'MATERIAL'], 'el renglón de la OC conserva el snapshot del insumo');
    console.log('[OK] testConvertirOcPersisteElSnapshotDelInsumo');
  } finally { await cleanupTenant(s.tenantId); }
}

async function testConGerenciaTecnicaCaidaLaOcSeCreaSinSnapshotYSeCompletaDespues() {
  const s = await seedCuadroCatalogo();
  gtDisponible = false;
  const originalWarn = console.warn;
  console.warn = () => undefined;
  try {
    const r = await convertir(s);
    assert.equal(r.status, 201, 'la creación de la OC no depende de que el catálogo responda');
    const item: any = await prisma.ordenCompraItem.findFirst({ where: { tenant_id: s.tenantId } });
    assert.equal(item.clave_snapshot, null, 'sin snapshot todavía: se resolverá en la primera recepción o se rechazará antes del commit');
    console.log('[OK] testConGerenciaTecnicaCaidaLaOcSeCreaSinSnapshotYSeCompletaDespues');
  } finally { console.warn = originalWarn; gtDisponible = true; await cleanupTenant(s.tenantId); }
}

async function main() {
  try {
    await setup();
    for (const [nombre, prueba] of [
      ['convertir-oc persiste el snapshot', testConvertirOcPersisteElSnapshotDelInsumo],
      ['GT caida: la OC se crea sin snapshot', testConGerenciaTecnicaCaidaLaOcSeCreaSinSnapshotYSeCompletaDespues],
    ] as Array<[string, () => Promise<void>]>) {
      try { await prueba(); } catch (error: any) {
        console.error(`[FAIL] ${nombre}: ${error?.message ?? error}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await teardown();
  }
}

void main().then(() => process.exit(process.exitCode ?? 0));

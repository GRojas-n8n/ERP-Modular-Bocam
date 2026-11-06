/**
 * Integración (PostgreSQL real): compras.oc_creada incluye proveedor_nombre.
 * Change: oc-creada-con-nombre-proveedor. Lo consume Finanzas para su proyección ocs_por_pagar
 * (change corregir-egreso-oc-multiproveedor), que no puede leer la base de Compras.
 *
 * Runner: npm run test:integration:oc-creada-proveedor-nombre -w @bocam/compras
 * Requiere: PostgreSQL con schema compras. Finanzas y GT se simulan; RabbitMQ no se usa.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@127.0.0.1:5432/bocam_erp?schema=compras';
process.env.DATABASE_URL = comprasDbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

const publicados: Array<{ type: string; payload: any }> = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, payload: event.payload });
  return true;
} as any;

let comprasServer: Server | undefined;
let stubs: Server[] = [];
let baseUrl = '';

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
  gt.get('/api/v1/gerencia-tecnica/insumos', (_req, res) => res.json({ success: true, data: [] }));
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

/** Cuadro aprobado con dos proveedores ganadores (una OC por proveedor). */
async function seedCuadroDosProveedores() {
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const userId = randomUUID();
  const sufijo = Date.now().toString().slice(-6);
  const req = await prisma.requisicion.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, codigo: `REQ-PN-${sufijo}`, solicitante_id: userId, estado: 'COMPRADA', tipo: 'NORMAL' },
  });
  const insumos = [randomUUID(), randomUUID()];
  const nombres = ['Aceros del Centro SA de CV', 'Concretos Premezclados del Golfo'];
  const provs = [];
  for (let i = 0; i < 2; i++) {
    provs.push(await prisma.proveedor.create({
      data: { tenant_id: tenantId, rfc_tax_id: `RFCPN${i}${sufijo}`, razon_social: nombres[i], estatus: 'ACTIVO' },
    }));
  }
  const cuadro = await prisma.cuadroComparativo.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion, codigo: `CC-PN-${Date.now()}`, estado: 'APROBADO_GT', primera_opcion_proveedor_id: provs[0].id_proveedor },
  });
  for (let i = 0; i < 2; i++) {
    const item = await prisma.requisicionItem.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion, insumo_id: insumos[i], cantidad: '10.0000' },
    });
    await prisma.comparativaLinea.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro, insumo_id: insumos[i], detalle_req_id: item.id_item },
    });
    await prisma.comparativaDetalle.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro, proveedor_id: provs[i].id_proveedor, insumo_id: insumos[i],
        precio_ofertado: '100.0000', evaluacion_tecnica: 'C', aprobacion_gt: 'C', es_ganador: true,
      } as any,
    });
  }
  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, provs: provs.map((p) => ({ id: p.id_proveedor, nombre: p.razon_social })) };
}

async function testOcCreadaIncluyeNombreDelProveedor() {
  const s = await seedCuadroDosProveedores();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['procurement'], projects: [s.proyectoId] });
    const r = await fetch(`${baseUrl}/api/v1/compras/comparativas/${s.cuadroId}/convertir-oc`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ presupuesto_id: randomUUID() }),
    });
    assert.equal(r.status, 201, JSON.stringify(await r.json()));
    const eventos = publicados.filter((e) => e.type === 'compras.oc_creada' && e.payload.proyecto_id === s.proyectoId);
    assert.equal(eventos.length, 2, 'una OC emitida por proveedor');
    for (const p of s.provs) {
      const ev = eventos.find((e) => e.payload.proveedor_id === p.id);
      assert.ok(ev, `evento de la OC del proveedor ${p.nombre}`);
      assert.equal(ev!.payload.proveedor_nombre, p.nombre, 'proveedor_nombre es la razón social del proveedor de la OC');
      assert.ok(ev!.payload.oc_id && ev!.payload.codigo && ev!.payload.total > 0, 'los campos existentes del contrato se conservan');
    }
    console.log('[OK] testOcCreadaIncluyeNombreDelProveedor');
  } finally { await cleanupTenant(s.tenantId); }
}

async function main() {
  try {
    await setup();
    try { await testOcCreadaIncluyeNombreDelProveedor(); } catch (error: any) {
      console.error(`[FAIL] oc_creada incluye proveedor_nombre: ${error?.message ?? error}`);
      process.exitCode = 1;
    }
  } finally {
    await teardown();
  }
}

void main().then(() => process.exit(process.exitCode ?? 0));

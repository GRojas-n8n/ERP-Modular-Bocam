/**
 * Test de contrato entre servicios: Compras publica, Almacén consume
 * Change: fix-ingresos-almacen-por-recepcion-oc
 *
 * Una recepción real en Compras genera un evento; el consumidor de Almacén lo procesa. Se verifica que:
 *  - el evento que sale del outbox de Compras lo acepta Almacén y aplica el INGRESO (inventario inexistente);
 *  - con Gerencia Técnica caída después de recibir, el evento sigue completo y se procesa;
 *  - el reproceso (reentrega y reemisión) no duplica stock.
 *
 * Runner: npm run test:integration:recepcion-oc-compras-almacen -w @bocam/compras
 * Requiere: PostgreSQL con los esquemas compras y almacen (DATABASE_URL y ALMACEN_DATABASE_URL). Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient as ComprasPrisma } from '../../src/generated/prisma';
import { PrismaClient as AlmacenPrisma } from '../../../almacen/src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
const almacenUrl = process.env.ALMACEN_DATABASE_URL || comprasUrl.replace('schema=compras', 'schema=almacen');
process.env.DATABASE_URL = comprasUrl;
process.env.ALMACEN_DATABASE_URL = almacenUrl;
const compras = new ComprasPrisma({ datasources: { db: { url: comprasUrl } } });
const almacen = new AlmacenPrisma({ datasources: { db: { url: almacenUrl } } });

const INSUMO = randomUUID();
let gtDisponible = true;
let stubs: Server[] = [];
let comprasServer: Server | undefined;
let baseUrl = '';
let despacharOutbox: any;
let handleRecepcionOcRegistrada: any;

async function setup() {
  const gt = express();
  gt.get('/api/v1/gerencia-tecnica/insumos', (_req, res) => {
    if (!gtDisponible) return void res.status(503).json({ success: false });
    res.json({ success: true, data: [{ id: INSUMO, clave: 'X-CLAVE', descripcion: 'Insumo X', unidad_medida: 'M3', tipo_insumo: 'MATERIAL' }] });
  });
  const g = await startHttpApp(gt);
  process.env.GT_URL = `${g.baseUrl}/api/v1/gerencia-tecnica`;
  stubs = [g.server];
  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  comprasServer = started.server;
  baseUrl = started.baseUrl;
  despacharOutbox = (await import('../../src/outbox')).despacharOutbox;
  handleRecepcionOcRegistrada = (await import('../../../almacen/src/main') as any).handleRecepcionOcRegistrada;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  for (const s of stubs) await stopHttpApp(s);
  await compras.$disconnect();
  await almacen.$disconnect();
}

async function cleanup(tenantId: string) {
  await (compras as any).outboxEvento.deleteMany({ where: { tenant_id: tenantId } });
  await compras.recepcionOCItem.deleteMany({ where: { tenant_id: tenantId } });
  await compras.recepcionOC.deleteMany({ where: { tenant_id: tenantId } });
  await compras.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await compras.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await compras.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  await almacen.movimientoAlmacen.deleteMany({ where: { tenant_id: tenantId } });
  await almacen.eventoProcesado.deleteMany({ where: { tenant_id: tenantId } });
  await almacen.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
}

const stockDe = async (tenantId: string) => Number((await almacen.itemInventario.findFirst({ where: { tenant_id: tenantId, insumo_id: INSUMO } }))?.stock_actual ?? -1);

async function main() {
  const tenantId = randomUUID(); const proyectoId = randomUUID();
  let failed = false;
  try {
    await setup();
    const proveedor = await compras.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFCX${Date.now().toString().slice(-8)}`, razon_social: 'Prov', estatus: 'ACTIVO' } });
    const oc = await compras.ordenCompra.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedor.id_proveedor, codigo: `OC-X-${randomUUID().slice(0, 6)}`,
        estado: 'EMITIDA', subtotal: 100, iva: 16, total: 116,
        items: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: INSUMO, cantidad: 20, precio_unitario: 5, importe: 100 }] },
      } as any,
      include: { items: true },
    });

    // Recepción con el catálogo disponible (resuelve y persiste el snapshot en la OC).
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'], projects: [proyectoId] });
    const r = await fetch(`${baseUrl}/api/v1/compras/ordenes-compra/${oc.id_orden}/recepciones`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ orden_item_id: (oc.items[0] as any).id_item, cantidad_recibida: 20 }] }),
    });
    assert.equal(r.status, 201);

    // Reinicio + Gerencia Técnica caída: el evento se despacha desde datos persistidos.
    gtDisponible = false;
    const capturados: any[] = [];
    await despacharOutbox({ publisher: { publishConfirmed: async (e: any) => { capturados.push(e); } }, maxAttempts: 5 });
    assert.equal(capturados.length, 1);
    const evento = capturados[0];

    assert.equal(await stockDe(tenantId), -1, 'inventario inexistente antes de procesar');
    await handleRecepcionOcRegistrada(evento);
    assert.equal(await stockDe(tenantId), 20, 'Almacén crea el inventario desde el snapshot y aplica el INGRESO');
    const item = await almacen.itemInventario.findFirst({ where: { tenant_id: tenantId, insumo_id: INSUMO } });
    assert.deepEqual([item!.clave, item!.descripcion, item!.unidad, item!.categoria], ['X-CLAVE', 'Insumo X', 'M3', 'MATERIAL']);
    console.log('[OK] el evento de Compras es aceptado por Almacén con inventario inexistente y GT caída');

    await handleRecepcionOcRegistrada(evento); // reentrega del mismo mensaje
    assert.equal(await stockDe(tenantId), 20, 'la reentrega no duplica');

    // Reemisión desde Compras: mismo event_id, republicado y reprocesado sin duplicar.
    const [fila] = await (compras as any).outboxEvento.findMany({ where: { tenant_id: tenantId } });
    const reemitir = await fetch(`${baseUrl}/api/v1/compras/ordenes-compra/${oc.id_orden}/recepciones/${fila.recepcion_id}/reemitir-evento`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(reemitir.status, 200);
    await despacharOutbox({ publisher: { publishConfirmed: async (e: any) => { capturados.push(e); } }, maxAttempts: 5 });
    assert.equal(capturados.length, 2);
    assert.equal(capturados[1].event_id, capturados[0].event_id, 'la reemisión conserva el event_id');
    await handleRecepcionOcRegistrada(capturados[1]);
    assert.equal(await stockDe(tenantId), 20, 'el reproceso tras la reemisión no duplica stock');
    assert.equal(await almacen.movimientoAlmacen.count({ where: { tenant_id: tenantId } }), 1);
    console.log('[OK] reentrega y reemisión no duplican el stock en Almacén');
  } catch (error: any) {
    failed = true;
    console.error('not ok - recepcion-oc compras->almacen');
    console.error(error);
  } finally {
    await cleanup(tenantId).catch(() => undefined);
    await teardown();
    process.exit(failed ? 1 : 0);
  }
}

void main();

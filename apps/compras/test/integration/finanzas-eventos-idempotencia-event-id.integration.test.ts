/**
 * Integración (PostgreSQL real): idempotencia de Compras ante el MISMO evento de Finanzas repetido.
 * Change: hacer-confiables-publicadores-eventbus-criticos (auditoría de consumidores de P1).
 *
 * Un outbox entrega "al menos una vez": el mismo `event_id` con el mismo payload puede llegar más de una vez.
 * Compras no usa `event_id`: su idempotencia es el ESTADO de la OC (transición condicionada, #186).
 *
 * Runner: npm run test:integration:finanzas-eventos-idempotencia-event-id -w @bocam/compras
 * Requiere: PostgreSQL (schema compras en DATABASE_URL). No requiere RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { OC_STATUS } from '../../src/oc-estados';

const dbUrl =
  process.env.COMPRAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// Captura de eventos que Compras publica como efecto (oc_error_finanzas).
const published: Array<{ type: string; ocId?: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  published.push({ type: event.event_type, ocId: event.payload?.oc_id });
  return true;
} as any;

const logs: string[] = [];
const consoleLog = console.log.bind(console);
console.log = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); consoleLog(...args); };
const consoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); consoleWarn(...args); };
const contar = (accion: string, ocId: string) => logs.filter((l) => l.includes(`"action":"${accion}"`) && l.includes(ocId)).length;

const proveedores = new Map<string, string>();
async function limpiar() {
  for (const tenantId of proveedores.keys()) {
    await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}
async function crearOc(tenantId: string, proyectoId: string, estado: string) {
  if (!proveedores.has(tenantId)) {
    const pr = await prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFC${randomUUID().slice(0, 9)}`, razon_social: 'Proveedor idempotencia', estatus: 'ACTIVO' } });
    proveedores.set(tenantId, pr.id_proveedor);
  }
  return prisma.ordenCompra.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedores.get(tenantId)!, codigo: `OC-ID-${randomUUID().slice(0, 8)}`, estado, subtotal: 1000, iva: 160, total: 1160, presupuesto_id: randomUUID() },
  });
}
const estadoDe = async (id: string) => (await prisma.ordenCompra.findUniqueOrThrow({ where: { id_orden: id } })).estado;
const alertas = (tenantId: string, ocId: string) => prisma.alertaOcError.findMany({ where: { tenant_id: tenantId, oc_id: ocId } });

function evento(tipo: string, tenantId: string, proyectoId: string, oc: { id_orden: string; codigo: string }, eventId: string = randomUUID()) {
  return {
    event_id: eventId,
    event_type: tipo,
    timestamp: new Date().toISOString(),
    context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
    payload: { referencia_oc_id: oc.id_orden, referencia_oc_codigo: oc.codigo, presupuesto_id: randomUUID(), movimiento_id: randomUUID(), monto_comprometido: 1160, monto_disponible_restante: 100, monto_liberado: 1160 },
  };
}

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n').slice(0, 6).join(' | ')}`); }
}
const settle = (ps: Array<Promise<unknown>>) => Promise.allSettled(ps);

async function main() {
  const compras = await import('../../src/main');
  const comprometidos = compras.handleFondosComprometidosEvent as (e: any) => Promise<void>;
  const insuficiente = compras.handlePresupuestoInsuficienteEvent as (e: any) => Promise<void>;
  const liberados = compras.handleFondosLiberadosEvent as (e: any) => Promise<void>;
  const t = () => ({ tenantId: randomUUID(), proyectoId: randomUUID() });

  try {
    await test('fondos_comprometidos: mismo evento dos veces → EMITIDA, un efecto aplicado y el segundo idempotente', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      const e = evento('finanzas.fondos_comprometidos', tenantId, proyectoId, oc);
      await comprometidos(e); await comprometidos(e);
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.EMITIDA);
      assert.equal(contar('compras.event.finanzas.fondos_comprometidos.applied', oc.id_orden), 1);
      assert.equal(contar('compras.event.finanzas.fondos_comprometidos.idempotent', oc.id_orden), 1);
    });

    await test('fondos_comprometidos: seis entregas concurrentes → EMITIDA, una sola aplicada, ningún error', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      const e = evento('finanzas.fondos_comprometidos', tenantId, proyectoId, oc);
      const r = await settle(Array.from({ length: 6 }, () => comprometidos(e)));
      assert.ok(r.every((x) => x.status === 'fulfilled'));
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.EMITIDA);
      assert.equal(contar('compras.event.finanzas.fondos_comprometidos.applied', oc.id_orden), 1, 'aplicada una sola vez');
    });

    await test('fondos_comprometidos: otro event_id con el mismo contenido da el mismo resultado (la clave es el estado, no el event_id)', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      await comprometidos(evento('finanzas.fondos_comprometidos', tenantId, proyectoId, oc));
      await comprometidos(evento('finanzas.fondos_comprometidos', tenantId, proyectoId, oc));
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.EMITIDA);
      assert.equal(contar('compras.event.finanzas.fondos_comprometidos.applied', oc.id_orden), 1);
    });

    await test('presupuesto_insuficiente: mismo evento dos veces → ERROR_FINANZAS con una sola alerta, un solo efecto', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      const e = evento('finanzas.presupuesto_insuficiente', tenantId, proyectoId, oc);
      await insuficiente(e); await insuficiente(e);
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.ERROR_FINANZAS);
      assert.equal((await alertas(tenantId, oc.id_orden)).length, 1);
      assert.equal(contar('compras.event.finanzas.presupuesto_insuficiente.applied', oc.id_orden), 1);
      assert.equal(contar('compras.event.finanzas.presupuesto_insuficiente.idempotent', oc.id_orden), 1);
    });

    await test('presupuesto_insuficiente: seis entregas concurrentes → una sola alerta y un solo efecto aplicado', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      const e = evento('finanzas.presupuesto_insuficiente', tenantId, proyectoId, oc);
      const r = await settle(Array.from({ length: 6 }, () => insuficiente(e)));
      assert.ok(r.every((x) => x.status === 'fulfilled'));
      assert.equal((await alertas(tenantId, oc.id_orden)).length, 1);
      assert.equal(contar('compras.event.finanzas.presupuesto_insuficiente.applied', oc.id_orden), 1);
    });

    await test('fondos_liberados: mismo evento dos veces sobre CANCELACION_PENDIENTE → CANCELADA, un efecto y el segundo idempotente', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.CANCELACION_PENDIENTE);
      const e = evento('finanzas.fondos_liberados', tenantId, proyectoId, oc);
      await liberados(e); await liberados(e);
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.CANCELADA);
      assert.equal(contar('compras.event.finanzas.fondos_liberados.applied', oc.id_orden), 1);
      assert.equal(contar('compras.event.finanzas.fondos_liberados.idempotent', oc.id_orden), 1);
    });

    await test('fondos_liberados: seis entregas concurrentes → CANCELADA, una sola aplicada', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.CANCELACION_PENDIENTE);
      const e = evento('finanzas.fondos_liberados', tenantId, proyectoId, oc);
      const r = await settle(Array.from({ length: 6 }, () => liberados(e)));
      assert.ok(r.every((x) => x.status === 'fulfilled'));
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.CANCELADA);
      assert.equal(contar('compras.event.finanzas.fondos_liberados.applied', oc.id_orden), 1);
    });

    await test('fuera de orden: liberados antes de comprometidos sobre una OC pendiente → la liberación es no-op y el compromiso posterior sí la emite', async () => {
      const { tenantId, proyectoId } = t();
      const oc = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      await liberados(evento('finanzas.fondos_liberados', tenantId, proyectoId, oc));
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.PENDIENTE_FINANZAS, 'no se cancela lo que no está en CANCELACION_PENDIENTE');
      await comprometidos(evento('finanzas.fondos_comprometidos', tenantId, proyectoId, oc));
      assert.equal(await estadoDe(oc.id_orden), OC_STATUS.EMITIDA);
    });

    await test('fuera de orden: comprometidos tras liberados sobre una OC ya CANCELADA → no la resucita; insuficiente tardío sobre EMITIDA → no la degrada', async () => {
      const { tenantId, proyectoId } = t();
      const cancelada = await crearOc(tenantId, proyectoId, OC_STATUS.CANCELACION_PENDIENTE);
      await liberados(evento('finanzas.fondos_liberados', tenantId, proyectoId, cancelada));
      await comprometidos(evento('finanzas.fondos_comprometidos', tenantId, proyectoId, cancelada));
      assert.equal(await estadoDe(cancelada.id_orden), OC_STATUS.CANCELADA);
      const emitida = await crearOc(tenantId, proyectoId, OC_STATUS.PENDIENTE_FINANZAS);
      await comprometidos(evento('finanzas.fondos_comprometidos', tenantId, proyectoId, emitida));
      await insuficiente(evento('finanzas.presupuesto_insuficiente', tenantId, proyectoId, emitida));
      assert.equal(await estadoDe(emitida.id_orden), OC_STATUS.EMITIDA);
      assert.equal((await alertas(tenantId, emitida.id_orden)).length, 0, 'sin alerta');
      assert.equal(published.filter((x) => x.type === 'compras.oc_error_finanzas' && x.ocId === emitida.id_orden).length, 0, 'sin publicación');
    });

    await test('OC inexistente (evento anterior a la OC): not_found terminal, sin excepción y sin crear nada; al reentregar con la OC presente, se aplica', async () => {
      const { tenantId, proyectoId } = t();
      const ocId = randomUUID();
      const fantasma = { id_orden: ocId, codigo: 'OC-FANTASMA' };
      const e = evento('finanzas.fondos_comprometidos', tenantId, proyectoId, fantasma);
      await comprometidos(e);
      assert.equal(contar('compras.event.finanzas.fondos_comprometidos.oc_not_found', ocId), 1);
      assert.equal(await prisma.ordenCompra.count({ where: { id_orden: ocId } }), 0);
      await prisma.ordenCompra.create({
        data: { id_orden: ocId, tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: (await crearOc(tenantId, proyectoId, OC_STATUS.EMITIDA)).proveedor_id, codigo: 'OC-FANTASMA', estado: OC_STATUS.PENDIENTE_FINANZAS, subtotal: 1000, iva: 160, total: 1160 },
      });
      await comprometidos(e);
      assert.equal(await estadoDe(ocId), OC_STATUS.EMITIDA);
    });
  } finally {
    await limpiar();
    await prisma.$disconnect();
  }

  const fallidas = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fallidas.length}/${results.length} pruebas en verde`);
  process.exit(fallidas.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });

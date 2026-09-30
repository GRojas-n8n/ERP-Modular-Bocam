/**
 * Integración (PostgreSQL y RabbitMQ reales): idempotencia de Contabilidad ante el MISMO evento repetido.
 * Change: hacer-confiables-publicadores-eventbus-criticos (auditoría de consumidores de P1).
 *
 * Un outbox entrega "al menos una vez": el mismo `event_id` con el mismo payload puede llegar más de una vez.
 * Contabilidad consume finanzas.fondos_comprometidos y finanzas.fondos_liberados conciliando un asiento existente
 * (PASIVO_PROYECTADO / REVERSION_PASIVO_PROYECTADO) por referencia funcional. No usa `event_id`: su clave de
 * idempotencia es `evento_conciliacion_key = <routing key>:<movimiento_id>` (única por tenant).
 *
 * Runner: npm run test:integration:finanzas-fondos-idempotencia-event-id -w @bocam/contabilidad
 * Requiere: PostgreSQL (schema contabilidad en DATABASE_URL) y RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';
const finanzasDbUrl = dbUrl.includes('schema=contabilidad') ? dbUrl.replace('schema=contabilidad', 'schema=finanzas') : dbUrl;
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
process.env.RABBITMQ_URL = rabbitUrl;
process.env.CONTABILIDAD_DATABASE_URL = dbUrl;
process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-idem-${randomUUID()}`;

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const logs: string[] = [];
const consoleLog = console.log.bind(console);
console.log = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); consoleLog(...args); };
const consoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); consoleWarn(...args); };
const contar = (accion: string, ocId: string) => logs.filter((l) => l.includes(`"action":"${accion}"`) && l.includes(ocId)).length;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function waitFor(assertion: () => Promise<void>, timeoutMs = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) { try { await assertion(); return; } catch { await delay(250); } }
  await assertion();
}

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n')[0]}`); }
}

const tenantsCreados = new Set<string>();

async function crearAsiento(tenantId: string, proyectoId: string, ocId: string, tipo: 'PASIVO_PROYECTADO' | 'REVERSION_PASIVO_PROYECTADO') {
  tenantsCreados.add(tenantId);
  return prisma.asientoContable.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, referencia_funcional: `OC:${ocId}`, tipo_poliza: tipo,
      folio_poliza: `IDEM-${randomUUID().slice(0, 12)}`, concepto: `Asiento ${tipo}`, monto_total: 1160, beneficiario: 'Proveedor',
      external_event_key: `test:${tipo}:${ocId}`, notas: 'Base.',
    },
  });
}
const asientoDe = (tenantId: string, ocId: string, tipo: string) =>
  prisma.asientoContable.findFirst({ where: { tenant_id: tenantId, referencia_funcional: `OC:${ocId}`, tipo_poliza: tipo } });
const cuantos = (tenantId: string, ocId: string) =>
  prisma.asientoContable.count({ where: { tenant_id: tenantId, referencia_funcional: `OC:${ocId}` } });

function evento(tipo: 'comprometidos' | 'liberados', p: { tenantId: string; proyectoId: string; ocId: string; movimientoId: string; eventId?: string }) {
  const comun = {
    event_id: p.eventId ?? randomUUID(),
    timestamp: new Date().toISOString(),
    context: { tenant_id: p.tenantId, proyecto_id: p.proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
  };
  return tipo === 'comprometidos'
    ? { ...comun, event_type: 'finanzas.fondos_comprometidos', payload: { presupuesto_id: randomUUID(), movimiento_id: p.movimientoId, monto_comprometido: 1160, monto_disponible_restante: 100, referencia_oc_id: p.ocId, referencia_oc_codigo: 'OC-IDEM', idempotente: false } }
    : { ...comun, event_type: 'finanzas.fondos_liberados', payload: { presupuesto_id: randomUUID(), movimiento_id: p.movimientoId, monto_liberado: 1160, referencia_oc_id: p.ocId, referencia_oc_codigo: 'OC-IDEM', idempotente: false } };
}

async function main() {
  const contabilidad = await import('../../src/main');
  const { handleFondosComprometidosEvent, handleFondosLiberadosEvent } = contabilidad as any;
  const nuevo = () => ({ tenantId: randomUUID(), proyectoId: randomUUID(), ocId: randomUUID(), movimientoId: randomUUID() });

  try {
    await test('comprometidos: el mismo evento dos veces (mismo event_id) → un efecto; la segunda es idempotente y no cambia el asiento', async () => {
      const p = nuevo(); await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'PASIVO_PROYECTADO');
      const e = evento('comprometidos', p);
      await handleFondosComprometidosEvent(e);
      const a1 = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      await handleFondosComprometidosEvent(e);
      const a2 = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      assert.equal(a1!.evento_conciliacion_key, `finanzas.fondos_comprometidos:${p.movimientoId}`);
      assert.equal(a2!.notas, a1!.notas, 'la nota de conciliación no debe duplicarse');
      assert.equal(a2!.conciliado_at!.getTime(), a1!.conciliado_at!.getTime(), 'conciliado_at no debe moverse');
      assert.equal(contar('contabilidad.event.finanzas.fondos_comprometidos.conciliated', p.ocId), 1);
      assert.equal(contar('contabilidad.event.finanzas.fondos_comprometidos.idempotent', p.ocId), 1);
      assert.equal(await cuantos(p.tenantId, p.ocId), 1, 'no se crean asientos nuevos');
    });

    await test('liberados: el mismo evento dos veces → un efecto; la segunda es idempotente', async () => {
      const p = nuevo(); await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      const e = evento('liberados', p);
      await handleFondosLiberadosEvent(e);
      const a1 = await asientoDe(p.tenantId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      await handleFondosLiberadosEvent(e);
      const a2 = await asientoDe(p.tenantId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      assert.equal(a2!.notas, a1!.notas);
      assert.equal(a2!.conciliado_at!.getTime(), a1!.conciliado_at!.getTime());
      assert.equal(contar('contabilidad.event.finanzas.fondos_liberados.conciliated', p.ocId), 1);
      assert.equal(contar('contabilidad.event.finanzas.fondos_liberados.idempotent', p.ocId), 1);
    });

    await test('la clave de idempotencia es el movimiento, no el event_id: otro event_id con el mismo movimiento también es idempotente', async () => {
      const p = nuevo(); await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'PASIVO_PROYECTADO');
      await handleFondosComprometidosEvent(evento('comprometidos', p));
      const a1 = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      await handleFondosComprometidosEvent(evento('comprometidos', p));
      const a2 = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      assert.equal(a2!.notas, a1!.notas);
      assert.equal(contar('contabilidad.event.finanzas.fondos_comprometidos.idempotent', p.ocId), 1);
    });

    await test('comprometidos: seis entregas concurrentes del mismo evento → una sola nota y una sola clave (sin asientos nuevos ni error)', async () => {
      const p = nuevo(); await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'PASIVO_PROYECTADO');
      const e = evento('comprometidos', p);
      const r = await Promise.allSettled(Array.from({ length: 6 }, () => handleFondosComprometidosEvent(e)));
      assert.ok(r.every((x) => x.status === 'fulfilled'), `ninguna entrega debe fallar: ${JSON.stringify(r.filter((x) => x.status === 'rejected'))}`);
      const a = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      const notas = a!.notas || '';
      const ocurrencias = notas.split('Conciliado con finanzas.fondos_comprometidos').length - 1;
      assert.equal(ocurrencias, 1, `la nota de conciliación aparece ${ocurrencias} veces`);
      assert.equal(await cuantos(p.tenantId, p.ocId), 1);
    });

    await test('liberados: seis entregas concurrentes del mismo evento → una sola nota', async () => {
      const p = nuevo(); await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      const e = evento('liberados', p);
      const r = await Promise.allSettled(Array.from({ length: 6 }, () => handleFondosLiberadosEvent(e)));
      assert.ok(r.every((x) => x.status === 'fulfilled'));
      const a = await asientoDe(p.tenantId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      assert.equal((a!.notas || '').split('Conciliado con finanzas.fondos_liberados').length - 1, 1);
    });

    await test('fuera de orden: liberados antes de comprometidos → cada evento concilia SU asiento, sin tocar el otro', async () => {
      const p = nuevo();
      await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'PASIVO_PROYECTADO');
      await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      await handleFondosLiberadosEvent(evento('liberados', p));
      const pasivoTrasLiberar = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      assert.equal(pasivoTrasLiberar!.evento_conciliacion_key, null, 'la liberación no concilia el pasivo');
      await handleFondosComprometidosEvent(evento('comprometidos', p));
      const reversion = await asientoDe(p.tenantId, p.ocId, 'REVERSION_PASIVO_PROYECTADO');
      const pasivo = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      assert.equal(reversion!.evento_conciliacion_key, `finanzas.fondos_liberados:${p.movimientoId}`);
      assert.equal(pasivo!.evento_conciliacion_key, `finanzas.fondos_comprometidos:${p.movimientoId}`);
    });

    await test('sin asiento que conciliar (oc_creada/oc_cancelada aún no procesadas): not_found terminal, sin crear asientos y sin excepción; al reentregar cuando el asiento existe, se aplica', async () => {
      const p = nuevo();
      const e = evento('comprometidos', p);
      await handleFondosComprometidosEvent(e);
      assert.equal(contar('contabilidad.event.finanzas.fondos_comprometidos.projected_liability_not_found', p.ocId), 1, 'log not_found');
      assert.equal(await cuantos(p.tenantId, p.ocId), 0, 'el consumidor no crea asientos');
      await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'PASIVO_PROYECTADO');
      await handleFondosComprometidosEvent(e);
      const a = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
      assert.equal(a!.evento_conciliacion_key, `finanzas.fondos_comprometidos:${p.movimientoId}`, 'clave tras reentrega');
    });

    await test('RabbitMQ real: el mismo event_id publicado dos veces → un solo efecto en Contabilidad', async () => {
      await contabilidad.initEventBus();
      const publisher = createEventBus(`finanzas-pub-${randomUUID()}`);
      await publisher.connect();
      try {
        const p = nuevo(); await crearAsiento(p.tenantId, p.proyectoId, p.ocId, 'PASIVO_PROYECTADO');
        const e = evento('comprometidos', p);
        await publisher.publish(e as any);
        await publisher.publish(e as any);
        await waitFor(async () => {
          const a = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
          assert.ok(a!.conciliado_at);
          assert.equal(contar('contabilidad.event.finanzas.fondos_comprometidos.idempotent', p.ocId) + contar('contabilidad.event.finanzas.fondos_comprometidos.conciliated', p.ocId), 2);
        });
        // Dos entregas simultáneas pueden aplicarse ambas (no hay bloqueo de fila); el efecto de negocio sigue siendo uno:
        // la nota y la clave no se duplican. Lo único que varía es conciliado_at.
        const a = await asientoDe(p.tenantId, p.ocId, 'PASIVO_PROYECTADO');
        assert.equal((a!.notas || '').split('Conciliado con finanzas.fondos_comprometidos').length - 1, 1, 'nota x1');
      } finally {
        await publisher.close();
      }
    });
  } finally {
    for (const t of tenantsCreados) await prisma.asientoContable.deleteMany({ where: { tenant_id: t } });
    await prisma.$disconnect();
  }

  const fallidas = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fallidas.length}/${results.length} pruebas en verde`);
  process.exit(fallidas.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });

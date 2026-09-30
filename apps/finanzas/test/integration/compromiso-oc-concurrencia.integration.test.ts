/**
 * Integración (PostgreSQL real, sin mocks de concurrencia): compromiso y liberación presupuestal de una OC.
 * Change: blindar-compromiso-oc-concurrencia-y-orden-eventos (primer PR: Finanzas).
 *
 * Invariantes que se verifican:
 *   - como máximo un COMPROMISO y una LIBERACION por OC, aunque concurran HTTP, partida_comprometida y oc_creada;
 *   - una liberación solo usa el compromiso exacto de la misma OC;
 *   - cancelación antes de creación deja un tombstone y la creación tardía no compromete fondos;
 *   - un evento idempotente no republica fondos_comprometidos con saldo ficticio;
 *   - la migración aborta si existen duplicados y no modifica datos; su rollback es limpio.
 *
 * Runner: npm run test:integration:compromiso-oc-concurrencia -w @bocam/finanzas
 * Requiere: PostgreSQL (schema finanzas en DATABASE_URL). No requiere RabbitMQ.
 * COMPROMISO_TEST_SKIP_MIGRATION=1 omite la aplicación de la migración (sirve para demostrar el estado previo).
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { readMigrationSql, splitSqlStatements } from '../support/sql';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;

const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// ── captura de eventos publicados (no sustituye la concurrencia: solo observa la salida) ──
type Published = { type: string; payload: any; tenantId: string };
const published: Published[] = [];
EventBus.prototype.publish = async function (event: any) {
  published.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;

const publishedFor = (tenantId: string, ocId: string, type: string) =>
  published.filter((e) => e.tenantId === tenantId && e.type === type && (e.payload.referencia_oc_id === ocId || e.payload.oc_id === ocId));

// ── utilidades ──
async function applyMigration() {
  if (process.env.COMPROMISO_TEST_SKIP_MIGRATION === '1') return;
  for (const stmt of splitSqlStatements(readMigrationSql('migration.sql'))) {
    await admin.$executeRawUnsafe(stmt);
  }
}

async function seedPresupuesto(tenantId: string, proyectoId: string, disponible: number, conceptoId?: string) {
  const p = await admin.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, codigo: `PRES-CC-${randomUUID().slice(0, 8)}`,
      descripcion: 'Presupuesto prueba compromiso OC',
      monto_autorizado: disponible, monto_disponible: disponible, monto_comprometido: 0, monto_ejercido: 0,
      capitulo: 'MATERIALES', moneda: 'MXN', estatus: 'ACTIVO',
      ...(conceptoId ? { concepto_id: conceptoId, concepto_clave: 'CC-1' } : {}),
    } as any,
  });
  return p.id_presupuesto;
}

const readPresupuesto = async (id: string) => {
  const p = await admin.presupuestoAsignado.findUniqueOrThrow({ where: { id_presupuesto: id } });
  return { comprometido: Number(p.monto_comprometido), disponible: Number(p.monto_disponible) };
};

const countMov = (tenantId: string, ocId: string, tipo: 'COMPROMISO' | 'LIBERACION') =>
  admin.movimientoPresupuestal.count({
    where: { tenant_id: tenantId, referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id: ocId, tipo },
  });

const countTombstones = async (tenantId: string, ocId: string) => {
  const r = await admin.$queryRawUnsafe<Array<{ n: bigint }>>(
    `SELECT count(*)::bigint AS n FROM "oc_cancelaciones_tombstone" WHERE "tenant_id" = $1::uuid AND "oc_id" = $2::uuid`, tenantId, ocId,
  );
  return Number(r[0].n);
};

const ctx = (tenantId: string, proyectoId: string) => ({
  tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}`,
});

let finanzas: typeof import('../../src/main');
let server: Server | undefined;
let baseUrl = '';

const evCreada = (t: string, p: string, ocId: string, presupuestoId: string, total: number) => ({
  event_type: 'compras.oc_creada', timestamp: new Date().toISOString(), context: ctx(t, p),
  payload: { oc_id: ocId, codigo: `OC-${ocId.slice(0, 6)}`, total, proveedor_id: randomUUID(), presupuesto_id: presupuestoId },
});
const evCancelada = (t: string, p: string, ocId: string, presupuestoId: string, total: number) => ({
  event_type: 'compras.oc_cancelada', timestamp: new Date().toISOString(), context: ctx(t, p),
  payload: { oc_id: ocId, codigo: `OC-${ocId.slice(0, 6)}`, total, presupuesto_id: presupuestoId, requisicion_id: null },
});
const evPartida = (t: string, p: string, ocId: string, conceptoId: string, monto: number) => ({
  event_type: 'gerencia_tecnica.partida_comprometida', timestamp: new Date().toISOString(), context: ctx(t, p),
  payload: { concepto_id: conceptoId, monto, referencia_id: ocId, referencia_codigo: `OC-${ocId.slice(0, 6)}`, tipo: 'OC' },
});

const token = (t: string, p: string) => signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['finanzas'], projects: [p] });
const http = (t: string, p: string, path: string, body: any) =>
  fetch(`${baseUrl}/api/v1/finanzas/${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token(t, p)}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

const ROUNDS = 12;
const results: Array<{ name: string; ok: boolean; error?: string }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false, error: e.message }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n')[0]}`); }
}
const settle = (ps: Array<Promise<unknown>>) => Promise.allSettled(ps);

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  await applyMigration();
  finanzas = await import('../../src/main');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. dos o más creaciones concurrentes de compromiso (oc_creada) → un solo COMPROMISO', async () => {
    for (let r = 0; r < ROUNDS; r++) {
      const t = randomUUID(), p = randomUUID(), oc = randomUUID();
      const pres = await seedPresupuesto(t, p, 10000);
      await settle(Array.from({ length: 6 }, () => finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any)));
      assert.equal(await countMov(t, oc, 'COMPROMISO'), 1, `ronda ${r}: COMPROMISO duplicado`);
      assert.deepEqual(await readPresupuesto(pres), { comprometido: 1000, disponible: 9000 }, `ronda ${r}: presupuesto descuadrado`);
    }
  });

  await test('2. partida_comprometida y oc_creada concurrentes → un solo COMPROMISO', async () => {
    for (let r = 0; r < ROUNDS; r++) {
      const t = randomUUID(), p = randomUUID(), oc = randomUUID(), concepto = randomUUID();
      const pres = await seedPresupuesto(t, p, 10000, concepto);
      const calls: Array<Promise<unknown>> = [];
      for (let i = 0; i < 3; i++) {
        calls.push(finanzas.handlePartidaComprometidaEvent(evPartida(t, p, oc, concepto, 1000) as any));
        calls.push(finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any));
      }
      await settle(calls);
      assert.equal(await countMov(t, oc, 'COMPROMISO'), 1, `ronda ${r}: COMPROMISO duplicado`);
      assert.deepEqual(await readPresupuesto(pres), { comprometido: 1000, disponible: 9000 }, `ronda ${r}: presupuesto descuadrado`);
    }
  });

  await test('3. HTTP comprometer-fondos y oc_creada concurrentes → un solo COMPROMISO', async () => {
    for (let r = 0; r < 8; r++) {
      const t = randomUUID(), p = randomUUID(), oc = randomUUID();
      const pres = await seedPresupuesto(t, p, 10000);
      const calls: Array<Promise<unknown>> = [];
      for (let i = 0; i < 3; i++) {
        calls.push(http(t, p, 'comprometer-fondos', { presupuesto_id: pres, monto: 1000, oc_id: oc, oc_codigo: `OC-${oc.slice(0, 6)}` }));
        calls.push(finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any));
      }
      await settle(calls);
      assert.equal(await countMov(t, oc, 'COMPROMISO'), 1, `ronda ${r}: COMPROMISO duplicado`);
      assert.deepEqual(await readPresupuesto(pres), { comprometido: 1000, disponible: 9000 }, `ronda ${r}: presupuesto descuadrado`);
    }
  });

  await test('4. evento duplicado (secuencial) → un COMPROMISO y no republica fondos_comprometidos con saldo ficticio', async () => {
    const t = randomUUID(), p = randomUUID(), oc = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000);
    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any);
    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any);
    assert.equal(await countMov(t, oc, 'COMPROMISO'), 1);
    const eventos = publishedFor(t, oc, 'finanzas.fondos_comprometidos');
    assert.equal(eventos.length, 1, 'solo el primer procesamiento publica fondos_comprometidos');
    assert.equal(eventos[0].payload.monto_disponible_restante, 9000, 'el saldo publicado es el real');
    assert.notEqual(eventos[0].payload.idempotente, true);
  });

  await test('5. cancelación antes de creación → tombstone, sin liberar; la creación posterior no compromete', async () => {
    const t = randomUUID(), p = randomUUID(), oc = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000);
    await finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, p, oc, pres, 1000) as any);
    assert.equal(await countTombstones(t, oc), 1, 'debe existir el tombstone');
    assert.equal(await countMov(t, oc, 'LIBERACION'), 0, 'no libera fondos inexistentes');
    assert.equal(publishedFor(t, oc, 'finanzas.fondos_liberados').length, 0, 'no publica liberación falsa');
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 0, disponible: 10000 });

    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any);
    assert.equal(await countMov(t, oc, 'COMPROMISO'), 0, 'la creación tardía no compromete');
    assert.equal(publishedFor(t, oc, 'finanzas.fondos_comprometidos').length, 0);
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 0, disponible: 10000 });
  });

  await test('6. creación después del tombstone (partida_comprometida y HTTP) → sin compromiso', async () => {
    const t = randomUUID(), p = randomUUID(), oc = randomUUID(), concepto = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000, concepto);
    await finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, p, oc, pres, 1000) as any);
    await finanzas.handlePartidaComprometidaEvent(evPartida(t, p, oc, concepto, 1000) as any);
    const res = await http(t, p, 'comprometer-fondos', { presupuesto_id: pres, monto: 1000, oc_id: oc, oc_codigo: 'OC-X' });
    assert.equal(res.status, 409, 'el compromiso HTTP de una OC cancelada se rechaza');
    assert.equal(await countMov(t, oc, 'COMPROMISO'), 0);
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 0, disponible: 10000 });
  });

  await test('7. dos o más cancelaciones concurrentes (evento + HTTP) → una sola LIBERACION', async () => {
    for (let r = 0; r < ROUNDS; r++) {
      const t = randomUUID(), p = randomUUID(), oc = randomUUID();
      const pres = await seedPresupuesto(t, p, 10000);
      await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any);
      const calls: Array<Promise<unknown>> = [];
      for (let i = 0; i < 3; i++) {
        calls.push(finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, p, oc, pres, 1000) as any));
        calls.push(http(t, p, 'liberar-fondos', { presupuesto_id: pres, monto: 1000, oc_id: oc, oc_codigo: `OC-${oc.slice(0, 6)}` }));
      }
      await settle(calls);
      assert.equal(await countMov(t, oc, 'LIBERACION'), 1, `ronda ${r}: LIBERACION duplicada`);
      assert.deepEqual(await readPresupuesto(pres), { comprometido: 0, disponible: 10000 }, `ronda ${r}: liberó más de una vez`);
    }
  });

  await test('8. liberación sin compromiso de esa OC no consume el compromiso de otra OC del presupuesto', async () => {
    const t = randomUUID(), p = randomUUID(), ocA = randomUUID(), ocB = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000);
    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, ocB, pres, 3000) as any);
    await finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, p, ocA, pres, 3000) as any);
    assert.equal(await countMov(t, ocA, 'LIBERACION'), 0);
    assert.equal(await countTombstones(t, ocA), 1);
    assert.equal(await countMov(t, ocB, 'COMPROMISO'), 1);
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 3000, disponible: 7000 }, 'el compromiso de la OC B sigue intacto');
    const res = await http(t, p, 'liberar-fondos', { presupuesto_id: pres, monto: 3000, oc_id: ocA, oc_codigo: 'OC-A' });
    assert.ok(res.status < 300, `liberar-fondos de una OC sin compromiso no debe fallar (status ${res.status})`);
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 3000, disponible: 7000 }, 'HTTP tampoco consume el compromiso de otra OC');
  });

  await test('9. la liberación usa exclusivamente el compromiso de la misma OC (monto exacto)', async () => {
    const t = randomUUID(), p = randomUUID(), ocA = randomUUID(), ocB = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000);
    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, ocA, pres, 1000) as any);
    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, ocB, pres, 3000) as any);
    await finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, p, ocA, pres, 3000) as any); // payload con monto equivocado
    const lib = await admin.movimientoPresupuestal.findFirstOrThrow({ where: { tenant_id: t, referencia_id: ocA, tipo: 'LIBERACION' } });
    assert.equal(Number(lib.monto), 1000, 'libera lo comprometido por la OC A, no lo que dice el payload');
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 3000, disponible: 7000 });
  });

  await test('10a. presupuesto insuficiente → sin compromiso y publica presupuesto_insuficiente', async () => {
    const t = randomUUID(), p = randomUUID(), oc = randomUUID();
    const pres = await seedPresupuesto(t, p, 500);
    await finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any);
    assert.equal(await countMov(t, oc, 'COMPROMISO'), 0);
    assert.equal(publishedFor(t, oc, 'finanzas.presupuesto_insuficiente').length, 1);
    assert.deepEqual(await readPresupuesto(pres), { comprometido: 0, disponible: 500 });
    const res = await http(t, p, 'comprometer-fondos', { presupuesto_id: pres, monto: 1000, oc_id: oc, oc_codigo: 'OC-Y' });
    assert.equal(res.status, 422);
  });

  await test('10b. presupuesto insuficiente con OC distintas concurrentes → no se sobrecomprometen los fondos', async () => {
    for (let r = 0; r < 6; r++) {
      const t = randomUUID(), p = randomUUID();
      const pres = await seedPresupuesto(t, p, 1000);
      const ocs = Array.from({ length: 5 }, () => randomUUID());
      await settle(ocs.map((oc) => finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 400) as any)));
      const est = await readPresupuesto(pres);
      assert.equal(est.comprometido, 800, `ronda ${r}: debe caber exactamente dos OC de 400 (comprometido=${est.comprometido})`);
      assert.equal(est.disponible, 200);
    }
  });

  await test('10c. creación y cancelación concurrentes de la misma OC → estado final consistente (sin compromiso huérfano)', async () => {
    for (let r = 0; r < 15; r++) {
      const t = randomUUID(), p = randomUUID(), oc = randomUUID();
      const pres = await seedPresupuesto(t, p, 10000);
      const calls: Array<Promise<unknown>> = [];
      for (let i = 0; i < 3; i++) {
        calls.push(finanzas.handleOrdenCompraCreadaEvent(evCreada(t, p, oc, pres, 1000) as any));
        calls.push(finanzas.handleOrdenCompraCanceladaEvent(evCancelada(t, p, oc, pres, 1000) as any));
      }
      await settle(calls);
      const c = await countMov(t, oc, 'COMPROMISO');
      const l = await countMov(t, oc, 'LIBERACION');
      assert.ok(c <= 1 && l <= 1, `ronda ${r}: duplicados (C=${c}, L=${l})`);
      assert.equal(c, l, `ronda ${r}: compromiso sin liberar o liberación sin compromiso (C=${c}, L=${l})`);
      assert.deepEqual(await readPresupuesto(pres), { comprometido: 0, disponible: 10000 }, `ronda ${r}: la OC cancelada dejó fondos comprometidos`);
    }
  });

  await test('10d. el índice único rechaza un segundo COMPROMISO/LIBERACION aun sin pasar por el lock (y respeta su alcance)', async () => {
    const t = randomUUID(), p = randomUUID(), oc = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000);
    const mov = (tipo: string, entidad = 'OrdenCompra', modulo = 'compras', tenant = t) => admin.movimientoPresupuestal.create({
      data: { tenant_id: tenant, proyecto_id: p, presupuesto_id: pres, tipo, concepto: 'idx', monto: 10, referencia_modulo: modulo,
        referencia_entidad: entidad, referencia_id: oc, usuario_id: randomUUID() },
    });
    await mov('COMPROMISO');
    await assert.rejects(() => mov('COMPROMISO'), /Unique constraint|duplicate key/i, 'segundo COMPROMISO');
    await mov('LIBERACION');
    await assert.rejects(() => mov('LIBERACION'), /Unique constraint|duplicate key/i, 'segunda LIBERACION');
    await mov('EJERCIDO'); await mov('EJERCIDO'); // otros tipos no están sujetos a la regla
    await mov('COMPROMISO', 'PreNomina', 'personal'); await mov('COMPROMISO', 'PreNomina', 'personal'); // otras entidades tampoco
    // (otro tenant con la misma OC: cubierto en la suite de RLS)
  });

  await test('11. la migración aborta si hay duplicados (sin borrar filas) y su rollback es limpio', async () => {
    if (process.env.COMPROMISO_TEST_SKIP_MIGRATION === '1') throw new Error('omitida: requiere la migración');
    const t = randomUUID(), p = randomUUID(), oc = randomUUID();
    const pres = await seedPresupuesto(t, p, 10000);
    await admin.$executeRawUnsafe(`DROP INDEX IF EXISTS "uq_movimiento_oc_compromiso_liberacion"`);
    for (let i = 0; i < 2; i++) {
      await admin.movimientoPresupuestal.create({
        data: { tenant_id: t, proyecto_id: p, presupuesto_id: pres, tipo: 'COMPROMISO', concepto: 'dup', monto: 10, referencia_modulo: 'compras',
          referencia_entidad: 'OrdenCompra', referencia_id: oc, usuario_id: randomUUID() },
      });
    }
    const stmts = splitSqlStatements(readMigrationSql('migration.sql'));
    let abortada = false;
    for (const s of stmts) {
      try { await admin.$executeRawUnsafe(s); } catch (e: any) {
        if (String(e.message).includes('MIGRACION_ABORTADA')) { abortada = true; break; }
        throw e;
      }
    }
    assert.ok(abortada, 'la comprobación previa debe abortar con MIGRACION_ABORTADA');
    assert.equal(await countMov(t, oc, 'COMPROMISO'), 2, 'no se borró ni corrigió ninguna fila');
    const idx = await admin.$queryRawUnsafe<any[]>(`SELECT 1 FROM pg_indexes WHERE indexname = 'uq_movimiento_oc_compromiso_liberacion' AND schemaname = current_schema()`);
    assert.equal(idx.length, 0, 'el índice no se creó');

    await admin.movimientoPresupuestal.deleteMany({ where: { tenant_id: t } });
    await applyMigration();
    const idx2 = await admin.$queryRawUnsafe<any[]>(`SELECT 1 FROM pg_indexes WHERE indexname = 'uq_movimiento_oc_compromiso_liberacion' AND schemaname = current_schema()`);
    assert.equal(idx2.length, 1, 'sin duplicados la migración crea el índice');

    for (const s of splitSqlStatements(readMigrationSql('rollback.sql'))) await admin.$executeRawUnsafe(s);
    const idx3 = await admin.$queryRawUnsafe<any[]>(`SELECT 1 FROM pg_indexes WHERE indexname = 'uq_movimiento_oc_compromiso_liberacion' AND schemaname = current_schema()`);
    const tab = await admin.$queryRawUnsafe<any[]>(`SELECT 1 FROM information_schema.tables WHERE table_name = 'oc_cancelaciones_tombstone' AND table_schema = current_schema()`);
    assert.equal(idx3.length + tab.length, 0, 'el rollback elimina índice y tabla');
    await applyMigration(); // deja el esquema listo para el resto de las suites
    await admin.movimientoPresupuestal.deleteMany({ where: { tenant_id: t } });
  });

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - compromiso-oc-concurrencia', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});

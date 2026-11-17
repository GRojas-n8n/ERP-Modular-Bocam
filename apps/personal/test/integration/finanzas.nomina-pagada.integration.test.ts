/**
 * Integración (PostgreSQL real): finanzas.nomina_pagada → prenómina PAGADA y personal.nomina_pagada.
 * Change: personal-nomina-pagada-por-finanzas (complemento de nomina-pagada-por-finanzas en Finanzas).
 *
 * Invariantes:
 *   - una prenómina AUTORIZADA pasa a PAGADA y se publica personal.nomina_pagada con cuenta y referencia;
 *   - reentrega: sigue PAGADA y se vuelve a publicar (consumidores idempotentes);
 *   - otro proyecto o una prenómina no AUTORIZADA: sin cambios ni publicación;
 *   - PATCH /prenominas/:id/pagar responde 409 PER_PAGO_EN_FINANZAS.
 *
 * Runner: npm run test:integration:finanzas-nomina-pagada -w @bocam/personal
 * Requiere: PostgreSQL con schema personal. Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl = process.env.PERSONAL_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const publicados: Array<{ type: string; payload: any; tenantId: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  publicados.push({ type: event.event_type, payload: event.payload, tenantId: event.context?.tenant_id });
  return true;
} as any;

let server: Server | undefined;
let baseUrl = '';

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function prenomina(estado: string) {
  const t = randomUUID(), p = randomUUID(), u = randomUUID();
  const pn = await prisma.preNomina.create({
    data: {
      tenant_id: t, proyecto_id: p, codigo: `NOM-FIN-${randomUUID().slice(0, 6)}`, periodo_tipo: 'SEMANAL',
      periodo_inicio: new Date('2026-11-02'), periodo_fin: new Date('2026-11-08'), total_percepciones: 20000,
      total_deducciones: 2000, total_neto: 18000, total_empleados: 9, estado: estado as any, elaborado_por: u,
    },
  });
  return { t, p, u, id: pn.id_prenomina };
}

const evento = (s: { t: string; p: string; u: string; id: string }, referencia = 'SPEI-NOM-9') => ({
  event_type: 'finanzas.nomina_pagada',
  timestamp: new Date().toISOString(),
  context: { tenant_id: s.t, proyecto_id: s.p, user_id: s.u, correlation_id: randomUUID() },
  payload: { prenomina_id: s.id, proyecto_id: s.p, codigo: 'X', total_neto: 18000, cuenta_id: randomUUID(), referencia, fecha_pago: '2026-11-09T00:00:00.000Z' },
});

const estado = async (id: string) => (await prisma.preNomina.findUniqueOrThrow({ where: { id_prenomina: id } })).estado;
const pagadas = (t: string) => publicados.filter((x) => x.tenantId === t && x.type === 'personal.nomina_pagada');

async function main() {
  const personal = await import('../../src/main');
  ({ server, baseUrl } = await startHttpApp(personal.app));

  await test('1. AUTORIZADA → PAGADA y personal.nomina_pagada con cuenta y referencia; reentrega republica', async () => {
    const s = await prenomina('AUTORIZADA');
    await personal.handleNominaPagadaFinanzasEvent(evento(s));
    assert.equal(await estado(s.id), 'PAGADA');
    let ev = pagadas(s.t);
    assert.equal(ev.length, 1);
    assert.equal(ev[0].payload.referencia, 'SPEI-NOM-9'); assert.ok(ev[0].payload.cuenta_id); assert.equal(ev[0].payload.total_neto, 18000);
    await personal.handleNominaPagadaFinanzasEvent(evento(s));
    assert.equal(await estado(s.id), 'PAGADA');
    ev = pagadas(s.t);
    assert.equal(ev.length, 2, 'la reentrega vuelve a publicar para recuperar una publicación fallida');
  });

  await test('2. otro proyecto o prenómina no AUTORIZADA: sin cambios ni publicación', async () => {
    const s = await prenomina('AUTORIZADA');
    await personal.handleNominaPagadaFinanzasEvent(evento({ ...s, p: randomUUID() }));
    assert.equal(await estado(s.id), 'AUTORIZADA');
    const c = await prenomina('CALCULADA');
    await personal.handleNominaPagadaFinanzasEvent(evento(c));
    assert.equal(await estado(c.id), 'CALCULADA');
    assert.equal(pagadas(s.t).length + pagadas(c.t).length, 0);
  });

  await test('3. PATCH /pagar: 409 PER_PAGO_EN_FINANZAS y la prenómina no cambia', async () => {
    const s = await prenomina('AUTORIZADA');
    const token = signTenantToken({ userId: s.u, tenantId: s.t, proyectoId: s.p, roles: ['personal_rh'] } as any);
    const r = await fetch(`${baseUrl}/api/v1/personal/prenominas/${s.id}/pagar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    assert.equal(r.status, 409);
    assert.equal(((await r.json()) as any).error.code, 'PER_PAGO_EN_FINANZAS');
    assert.equal(await estado(s.id), 'AUTORIZADA');
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await prisma.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - finanzas.nomina-pagada -> personal', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});

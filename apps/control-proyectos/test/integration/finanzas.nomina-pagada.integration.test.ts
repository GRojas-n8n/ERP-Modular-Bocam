/**
 * Integración (PostgreSQL real): finanzas.nomina_pagada → costo real de mano de obra del proyecto (EVM).
 * Change: evm-mano-obra-desde-finanzas.
 *
 * Runner: npm run test:integration:finanzas-nomina -w @bocam/control-proyectos
 * Requiere: PostgreSQL con schema control_proyectos. Sin RabbitMQ.
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { handleNominaPagadaFinanzasEvent } from '../../src/main';
import { createTenantContext } from '../../src/db';

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

const evento = (t: string, p: string, prenominaId: string, total: number) => ({
  event_type: 'finanzas.nomina_pagada',
  timestamp: new Date().toISOString(),
  context: { tenant_id: t, proyecto_id: p, user_id: randomUUID(), correlation_id: randomUUID() },
  payload: { prenomina_id: prenominaId, proyecto_id: p, codigo: 'NOM-1', total_neto: total, cuenta_id: randomUUID(), referencia: 'SPEI-1', fecha_pago: '2026-11-09T00:00:00.000Z' },
});

const acumulado = (t: string, p: string) => createTenantContext({ tenantId: t, proyectoId: p, userId: 'system' }, async (tx) => {
  const r = await tx.manoObraProyecto.findFirst({ where: { tenant_id: t, proyecto_id: p } });
  return r ? Number(r.monto_acumulado) : 0;
});

async function main() {
  await test('1. dos nóminas pagadas suman al costo real; la reentrega no duplica', async () => {
    const t = randomUUID(), p = randomUUID(), a = randomUUID();
    await handleNominaPagadaFinanzasEvent(evento(t, p, a, 15_000));
    await handleNominaPagadaFinanzasEvent(evento(t, p, a, 15_000));
    await handleNominaPagadaFinanzasEvent(evento(t, p, randomUUID(), 2_500.5));
    assert.equal(await acumulado(t, p), 17_500.5);
  });

  await test('2. payload inválido: sin efectos', async () => {
    const t = randomUUID(), p = randomUUID();
    await handleNominaPagadaFinanzasEvent(evento(t, p, randomUUID(), 0));
    await handleNominaPagadaFinanzasEvent({ ...evento(t, p, randomUUID(), 10), payload: { total_neto: 10 } });
    assert.equal(await acumulado(t, p), 0);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  process.exit(fallidas ? 1 : 0);
}

main().catch((e) => {
  console.error('not ok - finanzas.nomina_pagada -> control-proyectos', e);
  process.exit(1);
});

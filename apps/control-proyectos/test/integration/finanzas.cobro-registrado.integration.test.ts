/**
 * Integración (PostgreSQL real): finanzas.cobro_registrado → estado de la estimación.
 * Change: estimacion-cobrada-por-finanzas (complemento de cuentas-por-cobrar-estimaciones en Finanzas).
 *
 * Invariantes:
 *   - cobro parcial: agrega nota, la estimación conserva su estado;
 *   - cobro que liquida (estado COBRADA): la estimación pasa a FACTURADA;
 *   - reentrega del mismo cobro: no duplica la nota ni cambia nada;
 *   - origen distinto de ESTIMACION o estimación inexistente: sin efectos ni error.
 *
 * Runner: npm run test:integration:finanzas-cobro -w @bocam/control-proyectos
 * Requiere: PostgreSQL con schema control_proyectos. Sin RabbitMQ.
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { handleCobroRegistradoEvent } from '../../src/main';
import { createTenantContext } from '../../src/db';

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function seedEstimacion() {
  const tenantId = randomUUID(), proyectoId = randomUUID(), userId = randomUUID();
  const est = await createTenantContext({ tenantId, proyectoId, userId }, (tx) => tx.estimacion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      numero_estimacion: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000),
      codigo: `EST-COB-${randomUUID().slice(0, 8)}`,
      periodo_inicio: new Date('2026-03-01'),
      periodo_fin: new Date('2026-03-15'),
      subtotal: '10000.00',
      retencion_fondo_garantia: '0.00',
      amortizacion_anticipo: '0.00',
      iva: '1600.00',
      total_neto: '11600.00',
      estado: 'APROBADA_FINANCIERA',
      elaborado_por_id: userId,
      elaborado_por_nombre: 'Residente Integracion',
      notas: 'Pendiente de cobro.',
    },
  }));
  return { tenantId, proyectoId, userId, estimacionId: est.id_estimacion };
}

const evento = (s: { tenantId: string; proyectoId: string; userId: string }, payload: Record<string, unknown>) => ({
  event_type: 'finanzas.cobro_registrado',
  timestamp: new Date().toISOString(),
  context: { tenant_id: s.tenantId, proyecto_id: s.proyectoId, user_id: s.userId, correlation_id: randomUUID() },
  payload,
});

const cobro = (estimacionId: string, estado: string, monto: number, id = randomUUID()) => ({
  id_cobro: id, cxc_id: randomUUID(), origen: 'ESTIMACION', origen_id: estimacionId, folio: `SPEI-${id.slice(0, 6)}`,
  monto, fecha_cobro: '2026-11-20T00:00:00.000Z', estado,
});

const leer = (s: { tenantId: string; proyectoId: string; userId: string; estimacionId: string }) =>
  createTenantContext(s, (tx) => tx.estimacion.findUniqueOrThrow({ where: { id_estimacion: s.estimacionId } }));

async function main() {
  await test('1. cobro parcial: nota sin cambio de estado; el que liquida pasa a FACTURADA', async () => {
    const s = await seedEstimacion();
    const c1 = cobro(s.estimacionId, 'COBRO_PARCIAL', 5000);
    await handleCobroRegistradoEvent(evento(s, c1));
    let e = await leer(s);
    assert.equal(e.estado, 'APROBADA_FINANCIERA');
    assert.ok(e.notas?.includes(`Cobro: ${c1.id_cobro}.`));
    const c2 = cobro(s.estimacionId, 'COBRADA', 6600);
    await handleCobroRegistradoEvent(evento(s, c2));
    e = await leer(s);
    assert.equal(e.estado, 'FACTURADA');
    assert.ok(e.notas?.includes(`Cobro: ${c2.id_cobro}.`));
  });

  await test('2. reentrega del mismo cobro: no duplica la nota', async () => {
    const s = await seedEstimacion();
    const c = cobro(s.estimacionId, 'COBRADA', 11600);
    await handleCobroRegistradoEvent(evento(s, c));
    await handleCobroRegistradoEvent(evento(s, c));
    const e = await leer(s);
    assert.equal(e.estado, 'FACTURADA');
    assert.equal(e.notas?.split(`Cobro: ${c.id_cobro}.`).length, 2);
  });

  await test('3. origen distinto, estimación inexistente y payload inválido: sin efectos ni error', async () => {
    const s = await seedEstimacion();
    await handleCobroRegistradoEvent(evento(s, { ...cobro(s.estimacionId, 'COBRADA', 1), origen: 'OTRO' }));
    await handleCobroRegistradoEvent(evento(s, cobro(randomUUID(), 'COBRADA', 1)));
    await handleCobroRegistradoEvent(evento(s, { origen: 'ESTIMACION' }));
    const e = await leer(s);
    assert.equal(e.estado, 'APROBADA_FINANCIERA');
    assert.equal(e.notas, 'Pendiente de cobro.');
  });

  await test('4. otro proyecto no puede facturar la estimación (RLS)', async () => {
    const s = await seedEstimacion();
    await handleCobroRegistradoEvent(evento({ ...s, proyectoId: randomUUID() }, cobro(s.estimacionId, 'COBRADA', 11600)));
    assert.equal((await leer(s)).estado, 'APROBADA_FINANCIERA');
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  process.exit(fallidas ? 1 : 0);
}

main().catch((e) => {
  console.error('not ok - finanzas.cobro_registrado -> control-proyectos', e);
  process.exit(1);
});

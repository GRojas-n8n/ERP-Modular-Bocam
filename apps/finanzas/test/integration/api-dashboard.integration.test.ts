/**
 * Integración (PostgreSQL real): API y dashboard de Finanzas.
 * Change: optimizar-api-y-dashboard-finanzas (hallazgos F14, F15 y F16).
 *
 * Invariantes:
 *   - errores con el formato único { success: false, error: { code, message } } en cuentas, anticipo y pagos de OC;
 *   - listados paginados por llave: sin repetidos ni huecos entre páginas; cursor y limit inválidos 400;
 *   - el filtro por proveedor de /pagos-oc se resuelve en SQL;
 *   - el dashboard expone kpis, alertas y actividad_reciente con bancos, OCs por pagar y cuentas por cobrar reales.
 *
 * Runner: npm run test:integration:api-dashboard -w @bocam/finanzas
 * Requiere: PostgreSQL con schema finanzas. Sin RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.FINANZAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
process.env.DATABASE_URL = dbUrl;
const admin = new PrismaClient({ datasources: { db: { url: dbUrl } } });

EventBus.prototype.publish = async function () { return true; } as any;

let server: Server | undefined;
let baseUrl = '';

const llamar = async (metodo: 'GET' | 'POST' | 'PATCH' | 'DELETE', t: string, p: string, ruta: string, body?: any, limite = 999_999_999) => {
  const token = signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['finanzas'], projects: [p], limiteAprobacion: limite } as any);
  const r = await fetch(`${baseUrl}/api/v1/finanzas/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: r.status, body: (await r.json()) as any };
};

const errorUnico = (r: { status: number; body: any }, status: number, code: string) => {
  assert.equal(r.status, status, JSON.stringify(r.body));
  assert.equal(r.body.success, false);
  assert.equal(r.body.error?.code, code, JSON.stringify(r.body));
  assert.equal(typeof r.body.error.message, 'string');
  assert.equal(r.body.message, undefined, 'sin el formato anterior { success, message }');
};

async function presupuesto(t: string, p: string, autorizado: number, ejercido = 0) {
  return admin.presupuestoAsignado.create({
    data: {
      tenant_id: t, proyecto_id: p, codigo: `PRES-${randomUUID().slice(0, 8)}`, descripcion: 'Subcontratos',
      monto_autorizado: autorizado, monto_disponible: autorizado - ejercido, monto_comprometido: 0, monto_ejercido: ejercido,
      capitulo: 'SUBCONTRATOS', moneda: 'MXN', estatus: 'ACTIVO',
    } as any,
  });
}

const resultados: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); resultados.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { resultados.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e?.message ?? e).split('\n')[0]}`); }
}

async function main() {
  const finanzas = await import('../../src/main');
  ({ server, baseUrl } = await startHttpApp(finanzas.app));

  await test('1. cuentas bancarias y anticipo: formato único de errores', async () => {
    const t = randomUUID(), p = randomUUID();
    errorUnico(await llamar('POST', t, p, 'cuentas-bancarias', { banco: 'BBVA' }), 400, 'FIN_MISSING_FIELDS');
    errorUnico(await llamar('PATCH', t, p, 'cuentas-bancarias/no-es-uuid', { alias: 'x' }), 400, 'FIN_INVALID_REFERENCE');
    errorUnico(await llamar('PATCH', t, p, `cuentas-bancarias/${randomUUID()}`, { alias: 'x' }), 404, 'FIN_CUENTA_NO_ENCONTRADA');
    errorUnico(await llamar('DELETE', t, p, `cuentas-bancarias/${randomUUID()}`), 404, 'FIN_CUENTA_NO_ENCONTRADA');
    errorUnico(await llamar('POST', t, p, `proyectos/${p}/anticipo`, {}), 400, 'FIN_MISSING_FIELDS');
    errorUnico(await llamar('POST', t, p, `proyectos/${p}/anticipo`, { anticipo_total: -5 }), 400, 'FIN_MONTO_INVALIDO');
    errorUnico(await llamar('POST', t, p, `proyectos/${p}/anticipo`, { anticipo_total: 5000 }, 1000), 403, 'FIN_LIMIT_EXCEEDED');
    errorUnico(await llamar('GET', t, p, 'pagos-oc/no-es-uuid'), 400, 'FIN_INVALID_REFERENCE');
    errorUnico(await llamar('GET', t, p, `pagos-oc/${randomUUID()}`), 404, 'FIN_PAGO_NO_ENCONTRADO');

    const cuenta = await llamar('POST', t, p, 'cuentas-bancarias', { banco: 'BBVA', numero_cuenta: '0123456789', alias: 'Operación' });
    assert.equal(cuenta.status, 201, JSON.stringify(cuenta.body)); assert.equal(cuenta.body.success, true);
    const lista = await llamar('GET', t, p, 'cuentas-bancarias');
    assert.equal(lista.status, 200); assert.equal(lista.body.data.length, 1);

    assert.equal((await llamar('POST', t, p, `proyectos/${p}/anticipo`, { anticipo_total: 5000 })).status, 200);
    await admin.proyectoFinanzas.update({ where: { tenant_id_proyecto_id: { tenant_id: t, proyecto_id: p } }, data: { anticipo_usado: 3000 } });
    errorUnico(await llamar('POST', t, p, `proyectos/${p}/anticipo`, { anticipo_total: 2000 }), 422, 'FIN_ANTICIPO_MENOR_A_USADO');
    const ant = await llamar('GET', t, p, `proyectos/${p}/anticipo`);
    assert.equal(ant.status, 200); assert.equal(ant.body.data.disponible, 2000);
  });

  await test('2. /pagos paginado: 5 pagos en páginas de 2, sin repetidos; limit y cursor inválidos 400', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await presupuesto(t, p, 10_000);
    for (let i = 0; i < 5; i++) {
      await admin.programaPagos.create({
        data: {
          tenant_id: t, proyecto_id: p, presupuesto_id: pres.id_presupuesto, concepto: `Pago ${i}`, beneficiario: 'Proveedor',
          monto_programado: 100 + i, fecha_programada: new Date(Date.UTC(2026, 10, 20 + (i % 2))), estado: 'PENDIENTE',
        },
      });
    }
    const vistos: string[] = [];
    let cursor: string | null = null, paginas = 0;
    do {
      const r = await llamar('GET', t, p, `pagos?limit=2${cursor ? `&cursor=${cursor}` : ''}`);
      assert.equal(r.status, 200, JSON.stringify(r.body));
      assert.ok(Array.isArray(r.body.data));
      vistos.push(...r.body.data.map((x: any) => x.id_pago));
      cursor = r.body.meta.paginacion.next_cursor;
      paginas++;
    } while (cursor && paginas < 10);
    assert.equal(paginas, 3);
    assert.equal(vistos.length, 5); assert.equal(new Set(vistos).size, 5);
    const todo = await llamar('GET', t, p, 'pagos');
    assert.deepEqual(todo.body.data.map((x: any) => x.id_pago), vistos, 'mismo orden que sin paginar');
    assert.equal(todo.body.meta.paginacion.next_cursor, null);
    errorUnico(await llamar('GET', t, p, 'pagos?limit=0'), 400, 'FIN_LIMIT_INVALIDO');
    errorUnico(await llamar('GET', t, p, 'pagos?cursor=basura'), 400, 'FIN_CURSOR_INVALIDO');
    const otro = await llamar('GET', t, randomUUID(), 'pagos');
    assert.equal(otro.body.data.length, 0, 'otro proyecto no ve los pagos');
  });

  await test('3. /movimientos paginado en orden descendente', async () => {
    const t = randomUUID(), p = randomUUID();
    const pres = await presupuesto(t, p, 10_000);
    for (let i = 0; i < 3; i++) {
      await admin.movimientoPresupuestal.create({
        data: {
          tenant_id: t, proyecto_id: p, presupuesto_id: pres.id_presupuesto, tipo: 'COMPROMISO', concepto: `M${i}`, monto: 10,
          usuario_id: randomUUID(), fecha_registro: new Date(Date.UTC(2026, 10, 1 + i)),
        } as any,
      });
    }
    const r1 = await llamar('GET', t, p, `movimientos?presupuesto_id=${pres.id_presupuesto}&limit=2`);
    assert.equal(r1.status, 200, JSON.stringify(r1.body));
    assert.deepEqual(r1.body.data.map((m: any) => m.concepto), ['M2', 'M1']);
    const r2 = await llamar('GET', t, p, `movimientos?presupuesto_id=${pres.id_presupuesto}&limit=2&cursor=${r1.body.meta.paginacion.next_cursor}`);
    assert.deepEqual(r2.body.data.map((m: any) => m.concepto), ['M0']);
    assert.equal(r2.body.meta.paginacion.next_cursor, null);
  });

  await test('4. /pagos-oc filtra por proveedor en SQL (antes en memoria)', async () => {
    const t = randomUUID(), p = randomUUID(), provA = randomUUID(), provB = randomUUID();
    for (const [ref, prov] of [['SPEI-1', provA], ['SPEI-2', provB], ['SPEI-3', provA]] as const) {
      await admin.pagoOC.create({
        data: {
          tenant_id: t, proyecto_id: p, fuente: 'CUENTA_BANCARIA', tipo_pago: 'SPEI', referencia: ref, concepto: 'Egreso',
          fecha_pago: new Date(), monto_total: 100, usuario_id: randomUUID(),
          detalles: { create: [{ oc_id: randomUUID(), oc_codigo: `OC-${ref}`, proveedor_id: prov, proveedor_nombre: 'Prov', monto_aplicado: 100, saldo_oc_antes: 100, saldo_oc_despues: 0 }] },
        },
      });
    }
    const a = await llamar('GET', t, p, `pagos-oc?proveedorId=${provA}`);
    assert.equal(a.status, 200, JSON.stringify(a.body));
    assert.deepEqual(a.body.data.map((x: any) => x.referencia).sort(), ['SPEI-1', 'SPEI-3']);
    const pag = await llamar('GET', t, p, 'pagos-oc?limit=2');
    assert.equal(pag.body.data.length, 2); assert.ok(pag.body.meta.paginacion.next_cursor);
    errorUnico(await llamar('GET', t, p, 'pagos-oc?proveedorId=x'), 400, 'FIN_INVALID_REFERENCE');
  });

  await test('5. dashboard: kpis, bancos, OCs por pagar, cuentas por cobrar y alertas reales', async () => {
    const t = randomUUID(), p = randomUUID();
    await presupuesto(t, p, 1000, 950);
    await admin.cuentaBancaria.create({ data: { tenant_id: t, proyecto_id: null, banco: 'BBVA', numero_cuenta: 'A1', alias: 'Op', saldo: 500 } });
    await admin.cuentaBancaria.create({ data: { tenant_id: t, proyecto_id: null, banco: 'Banorte', numero_cuenta: 'B1', alias: 'Nom', saldo: 300 } });
    await admin.ocPorPagar.create({ data: { tenant_id: t, oc_id: randomUUID(), proyecto_id: p, oc_codigo: 'OC-1', proveedor_id: randomUUID(), total: 1000, pagado: 100, estado: 'PAGO_PARCIAL' } });
    await admin.ocPorPagar.create({ data: { tenant_id: t, oc_id: randomUUID(), proyecto_id: randomUUID(), oc_codigo: 'OC-OTRO', proveedor_id: randomUUID(), total: 5000 } });
    await admin.cuentaPorCobrar.create({
      data: { tenant_id: t, proyecto_id: p, origen: 'ESTIMACION', origen_id: randomUUID(), codigo: 'EST-1', concepto: 'Est', monto: 2000, cobrado: 500, estado: 'COBRO_PARCIAL', fecha_vencimiento: new Date(Date.now() - 86_400_000) },
    });
    const r = await llamar('GET', t, p, 'dashboard');
    assert.equal(r.status, 200, JSON.stringify(r.body));
    const d = r.body.data;
    assert.equal(d.kpis.saldo_bancos, 800);
    assert.deepEqual(d.ocs_por_pagar, { cantidad: 1, saldo: 900 }, 'solo las OCs del proyecto');
    assert.deepEqual(d.cuentas_por_cobrar, { cantidad: 1, saldo: 1500, vencidas: 1 });
    assert.equal(d.cuentas_bancarias.length, 2);
    assert.equal(d.resumen_presupuestal.porcentaje_ejercido, 95);
    assert.ok(Array.isArray(d.actividad_reciente));
    const tipos = d.alertas.map((a: any) => a.tipo).sort();
    assert.deepEqual(tipos, ['COBROS_VENCIDOS', 'LIQUIDEZ_INSUFICIENTE', 'PRESUPUESTO_BAJO']);
  });

  const fallidas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - fallidas}/${resultados.length} pruebas en verde`);
  await stopHttpApp(server);
  await admin.$disconnect();
  process.exit(fallidas ? 1 : 0);
}

main().catch(async (e) => {
  console.error('not ok - api-dashboard', e);
  await stopHttpApp(server).catch(() => undefined);
  process.exit(1);
});

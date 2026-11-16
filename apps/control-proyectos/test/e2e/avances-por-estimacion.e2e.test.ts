/**
 * Tests E2E: openspec avances-residencia-por-estimacion.
 *
 * Cubre tasks.md grupos 1-2:
 *  - POST /avances/lote: registro por estimación de referencia, atómico.
 *  - GET /avances/resumen-por-concepto: una fila por concepto + desglose.
 *  - GET /estimaciones/totales: contratado / estimado / cobrado / restante.
 *
 * Stub de gerencia-tecnica y tokens siguen
 * test/e2e/alertas-volumen-ejecutado-contratado.e2e.test.ts.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const prisma = new PrismaClient();

let cpServer: Server | undefined;
let gtServer: Server | undefined;
let baseUrl = '';

type GtConcepto = { id: string; clave: string; descripcion: string; unidad_medida: string; precio_unitario: number; cantidad: number };
type GtBehavior = { conceptos: GtConcepto[] } | 'down';
const gtBehaviorByTenant = new Map<string, GtBehavior>();

async function cleanupTenantData(tenantId: string) {
  await prisma.avanceFisico.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.estimacion.deleteMany({ where: { tenant_id: tenantId } });
}

async function setup() {
  const gtStub = express();
  gtStub.use(express.json());
  gtStub.get('/api/v1/gerencia-tecnica/presupuesto/activo', (req, res) => {
    const auth = req.headers.authorization;
    const t = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!t) { res.status(401).json({ success: false }); return; }
    const decoded = jwt.verify(t, process.env.JWT_SECRET as string) as any;
    const behavior = gtBehaviorByTenant.get(decoded.tenant_id);
    if (!behavior || behavior === 'down') {
      res.status(500).json({ success: false, error: { message: 'GT stub: catálogo no disponible' } });
      return;
    }
    res.json({ success: true, data: { id: 'presupuesto-stub', version: 1, conceptos: behavior.conceptos } });
  });

  const gtStarted = await startHttpApp(gtStub);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  cpServer = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(cpServer);
  await stopHttpApp(gtServer);
  await prisma.$disconnect();
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

function concepto(clave: string, cantidad: number, pu: number): GtConcepto {
  return { id: randomUUID(), clave, descripcion: `Partida ${clave}`, unidad_medida: 'm3', precio_unitario: pu, cantidad };
}

async function seedEstimacion(opts: { tenantId: string; proyectoId: string; numero: number; estado: string; subtotal: number; inicio?: string; fin?: string }) {
  return createTenantContext({ tenantId: opts.tenantId, proyectoId: opts.proyectoId, userId: 'system' }, async (tx) =>
    tx.estimacion.create({
      data: {
        tenant_id: opts.tenantId,
        proyecto_id: opts.proyectoId,
        numero_estimacion: opts.numero,
        codigo: `EST-${randomUUID().slice(0, 8)}`,
        periodo_inicio: new Date(opts.inicio || '2026-03-01'),
        periodo_fin: new Date(opts.fin || '2026-03-31'),
        subtotal: opts.subtotal,
        iva: 0,
        total_neto: opts.subtotal,
        estado: opts.estado,
        elaborado_por_id: randomUUID(),
        elaborado_por_nombre: 'Residente E2E',
      },
    })
  );
}

async function post(t: string, path: string, body: Record<string, unknown>) {
  return fetch(`${baseUrl}/api/v1/control-proyectos${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function get(t: string, path: string) {
  return fetch(`${baseUrl}/api/v1/control-proyectos${path}`, { headers: { Authorization: `Bearer ${t}` } });
}

// ─── POST /avances/lote ─────────────────────────────────────────────────────

async function test_lote_valido() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const c1 = concepto('LOT-001', 100, 10);
  const c2 = concepto('LOT-002', 50, 20);
  const c3 = concepto('LOT-003', 10, 100);
  gtBehaviorByTenant.set(tenantId, { conceptos: [c1, c2, c3] });
  try {
    const est = await seedEstimacion({ tenantId, proyectoId, numero: 1, estado: 'BORRADOR', subtotal: 0, inicio: '2026-03-01', fin: '2026-03-31' });
    const t = token(tenantId, proyectoId, ['residencia']);
    const r = await post(t, '/avances/lote', {
      estimacion_referencia_id: est.id_estimacion,
      items: [
        { concepto_id: c1.id, cantidad_periodo: 30 },
        { concepto_id: c2.id, cantidad_periodo: 5 },
        { concepto_id: c3.id, cantidad_periodo: 1 },
      ],
    });
    assert.equal(r.status, 201);
    const body: any = await r.json();
    assert.equal(body.data.length, 3);
    for (const a of body.data) {
      assert.equal(a.estado, 'PENDIENTE');
      assert.equal(a.estimacion_referencia_id, est.id_estimacion);
      assert.equal(a.estimacion_id, null, 'la referencia no incluye el avance en la estimación');
      assert.equal(new Date(a.periodo_inicio).toISOString().slice(0, 10), '2026-03-01');
      assert.equal(new Date(a.periodo_fin).toISOString().slice(0, 10), '2026-03-31');
    }
    const a1 = body.data.find((a: any) => a.concepto_presupuesto === 'LOT-001');
    assert.equal(Number(a1.importe_periodo), 300, 'importe = cantidad × PU del catálogo');
    console.log('ok - lote válido crea 3 avances PENDIENTE con referencia y periodo de la estimación');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

async function test_lote_concepto_invalido_es_atomico() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const c1 = concepto('ATO-001', 100, 10);
  gtBehaviorByTenant.set(tenantId, { conceptos: [c1] });
  try {
    const est = await seedEstimacion({ tenantId, proyectoId, numero: 1, estado: 'BORRADOR', subtotal: 0 });
    const t = token(tenantId, proyectoId, ['residencia']);
    const r = await post(t, '/avances/lote', {
      estimacion_referencia_id: est.id_estimacion,
      items: [
        { concepto_id: c1.id, cantidad_periodo: 10 },
        { concepto_id: randomUUID(), cantidad_periodo: 3 },
      ],
    });
    assert.equal(r.status, 400);
    const total = await prisma.avanceFisico.count({ where: { tenant_id: tenantId } });
    assert.equal(total, 0, 'ningún avance del lote debe persistir si uno es inválido');
    console.log('ok - lote con concepto inexistente responde 400 y no persiste nada');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

async function test_lote_estimacion_inexistente_y_validaciones() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const c1 = concepto('VAL-001', 100, 10);
  gtBehaviorByTenant.set(tenantId, { conceptos: [c1] });
  try {
    const est = await seedEstimacion({ tenantId, proyectoId, numero: 1, estado: 'BORRADOR', subtotal: 0 });
    const t = token(tenantId, proyectoId, ['residencia']);

    const rNoEst = await post(t, '/avances/lote', {
      estimacion_referencia_id: randomUUID(),
      items: [{ concepto_id: c1.id, cantidad_periodo: 1 }],
    });
    assert.equal(rNoEst.status, 404, 'estimación inexistente → 404');

    const rVacio = await post(t, '/avances/lote', { estimacion_referencia_id: est.id_estimacion, items: [] });
    assert.equal(rVacio.status, 400, 'items vacío → 400');

    const rDup = await post(t, '/avances/lote', {
      estimacion_referencia_id: est.id_estimacion,
      items: [{ concepto_id: c1.id, cantidad_periodo: 1 }, { concepto_id: c1.id, cantidad_periodo: 2 }],
    });
    assert.equal(rDup.status, 400, 'concepto repetido en el lote → 400');

    const rNeg = await post(t, '/avances/lote', {
      estimacion_referencia_id: est.id_estimacion,
      items: [{ concepto_id: c1.id, cantidad_periodo: -5 }],
    });
    assert.equal(rNeg.status, 400, 'cantidad no positiva → 400');

    const rRol = await post(token(tenantId, proyectoId, ['compras']), '/avances/lote', {
      estimacion_referencia_id: est.id_estimacion,
      items: [{ concepto_id: c1.id, cantidad_periodo: 1 }],
    });
    assert.equal(rRol.status, 403, 'rol sin permiso → 403');

    assert.equal(await prisma.avanceFisico.count({ where: { tenant_id: tenantId } }), 0);
    console.log('ok - lote valida estimación (404), items vacío/duplicado/negativo (400) y RBAC (403)');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ─── GET /avances/resumen-por-concepto ──────────────────────────────────────

async function test_resumen_por_concepto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const c1 = concepto('RES-001', 100, 10);
  gtBehaviorByTenant.set(tenantId, { conceptos: [c1] });
  try {
    const t = token(tenantId, proyectoId, ['residencia']);
    const estIds: string[] = [];
    for (let n = 1; n <= 3; n++) {
      const est = await seedEstimacion({ tenantId, proyectoId, numero: n, estado: 'BORRADOR', subtotal: 0, inicio: `2026-0${n}-01`, fin: `2026-0${n}-28` });
      estIds.push(est.id_estimacion);
      const r = await post(t, '/avances/lote', {
        estimacion_referencia_id: est.id_estimacion,
        items: [{ concepto_id: c1.id, cantidad_periodo: 10 * n }],
      });
      assert.equal(r.status, 201);
    }

    const r = await get(t, '/avances/resumen-por-concepto');
    assert.equal(r.status, 200);
    const body: any = await r.json();
    assert.equal(body.data.length, 1, 'una sola fila por concepto');
    const fila = body.data[0];
    assert.equal(fila.concepto_presupuesto, 'RES-001');
    assert.equal(Number(fila.cantidad_acumulada), 60);
    assert.equal(Number(fila.cantidad_presupuestada), 100);
    assert.equal(Number(fila.porcentaje_avance), 60);
    assert.equal(fila.desglose.length, 3);
    assert.deepEqual(new Set(fila.desglose.map((d: any) => d.estimacion_referencia_id)), new Set(estIds));
    console.log('ok - resumen agrupa el concepto en una fila con acumulado y 3 entradas de desglose');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ─── GET /estimaciones/totales ──────────────────────────────────────────────

async function test_totales_completos() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  gtBehaviorByTenant.set(tenantId, { conceptos: [concepto('TOT-001', 100, 10), concepto('TOT-002', 10, 50)] });
  try {
    await seedEstimacion({ tenantId, proyectoId, numero: 1, estado: 'FACTURADA', subtotal: 300 });
    await seedEstimacion({ tenantId, proyectoId, numero: 2, estado: 'APROBADA_TECNICA', subtotal: 200 });
    await seedEstimacion({ tenantId, proyectoId, numero: 3, estado: 'RECHAZADA', subtotal: 999 });
    const r = await get(token(tenantId, proyectoId, ['residencia']), '/estimaciones/totales');
    assert.equal(r.status, 200);
    const d: any = (await r.json() as any).data;
    assert.equal(Number(d.contratado), 1500);
    assert.equal(Number(d.estimado), 500, 'estimado excluye RECHAZADA');
    assert.equal(Number(d.cobrado), 300, 'cobrado = solo FACTURADA');
    assert.equal(Number(d.restante), 1200, 'restante = contratado − cobrado');
    assert.equal(d.parcial, false);
    console.log('ok - totales: contratado 1500, estimado 500, cobrado 300, restante 1200');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

async function test_totales_parcial_si_gt_falla() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  gtBehaviorByTenant.set(tenantId, 'down');
  try {
    await seedEstimacion({ tenantId, proyectoId, numero: 1, estado: 'FACTURADA', subtotal: 300 });
    const r = await get(token(tenantId, proyectoId, ['residencia']), '/estimaciones/totales');
    assert.equal(r.status, 200);
    const d: any = (await r.json() as any).data;
    assert.equal(d.parcial, true);
    assert.equal(d.contratado, null);
    assert.equal(d.restante, null);
    assert.equal(Number(d.estimado), 300);
    assert.equal(Number(d.cobrado), 300);
    console.log('ok - totales devuelve parcial:true con contratado/restante nulos si GT falla');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await test_lote_valido();
    await test_lote_concepto_invalido_es_atomico();
    await test_lote_estimacion_inexistente_y_validaciones();
    await test_resumen_por_concepto();
    await test_totales_completos();
    await test_totales_parcial_si_gt_falla();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - avances-por-estimacion E2E');
  console.error(error);
  process.exitCode = 1;
});

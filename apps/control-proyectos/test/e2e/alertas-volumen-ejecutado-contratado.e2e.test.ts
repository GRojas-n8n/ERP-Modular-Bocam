/**
 * Tests E2E: openspec alertas-volumen-ejecutado-contratado.
 *
 * Cubre tasks.md grupos 1-2:
 *  - Grupo 1: calcularAlertas genera/resuelve AlertaProyecto tipo
 *    VOLUMEN_EXCEDIDO comparando el AvanceFisico más reciente (no
 *    RECHAZADO) de cada concepto_id contra su propia cantidad_presupuestada
 *    (congelada al crear el avance).
 *  - Grupo 2: POST /avances agrega advertencia_volumen_excedido a la
 *    respuesta cuando el avance recién creado deja
 *    cantidad_acumulada > cantidad_presupuestada, sin bloquear el registro.
 *
 * El stub de gerencia-tecnica y el patrón de tokens siguen
 * test/e2e/avances-estimaciones-rbac-catalogo.e2e.test.ts.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EstadoAvance } from '../../src/types';
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
  await prisma.programacionObra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.alertaProyecto.deleteMany({ where: { tenant_id: tenantId } });
}

async function setup() {
  const gtStub = express();
  gtStub.use(express.json());
  gtStub.get('/api/v1/gerencia-tecnica/presupuesto/activo', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) { res.status(401).json({ success: false }); return; }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
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

function seedCatalogo(tenantId: string, conceptos: GtConcepto[]) {
  gtBehaviorByTenant.set(tenantId, { conceptos });
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function postAvance(t: string, body: Record<string, unknown>) {
  return fetch(`${baseUrl}/api/v1/control-proyectos/avances`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function seedProgramacion(opts: { tenantId: string; proyectoId: string; conceptoId: string; conceptoClave: string }) {
  return createTenantContext({ tenantId: opts.tenantId, proyectoId: opts.proyectoId, userId: 'system' }, async (tx) =>
    tx.programacionObra.create({
      data: {
        tenant_id: opts.tenantId,
        proyecto_id: opts.proyectoId,
        concepto_id: opts.conceptoId,
        concepto_clave: opts.conceptoClave,
        descripcion: 'Partida de prueba',
        fecha_inicio_plan: new Date('2026-01-01'),
        fecha_fin_plan: new Date('2026-12-31'),
        curva_programada: [],
        bac: 100000,
        estado: 'PENDIENTE',
      },
    })
  );
}

async function seedAvance(opts: {
  tenantId: string; proyectoId: string; conceptoId: string; conceptoClave: string;
  cantidadPresupuestada: number; cantidadAcumulada: number; unidad?: string;
  estado?: string; createdAt?: Date;
}) {
  return createTenantContext({ tenantId: opts.tenantId, proyectoId: opts.proyectoId, userId: 'system' }, async (tx) =>
    tx.avanceFisico.create({
      data: {
        tenant_id: opts.tenantId,
        proyecto_id: opts.proyectoId,
        concepto_id: opts.conceptoId,
        concepto_presupuesto: opts.conceptoClave,
        descripcion_concepto: 'Partida de prueba',
        cantidad_presupuestada: opts.cantidadPresupuestada,
        cantidad_anterior: 0,
        cantidad_periodo: opts.cantidadAcumulada,
        cantidad_acumulada: opts.cantidadAcumulada,
        unidad: opts.unidad || 'm3',
        precio_unitario: 100,
        importe_periodo: opts.cantidadAcumulada * 100,
        importe_acumulado: opts.cantidadAcumulada * 100,
        porcentaje_avance: Math.min((opts.cantidadAcumulada / opts.cantidadPresupuestada) * 100, 100),
        periodo_inicio: new Date('2026-01-01'),
        periodo_fin: new Date('2026-01-31'),
        registrado_por_id: randomUUID(),
        registrado_por_nombre: 'Residente E2E',
        estado: opts.estado || EstadoAvance.PENDIENTE,
        ...(opts.createdAt ? { created_at: opts.createdAt } : {}),
      },
    })
  );
}

// ─── Grupo 1: calcularAlertas → VOLUMEN_EXCEDIDO ───────────────────────────

async function test_1_1_1_4_alerta_se_crea_cuando_hay_excedente() {
  const { calcularAlertas } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({ tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-001' });
    await seedAvance({ tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-001', cantidadPresupuestada: 100, cantidadAcumulada: 120 });

    // Rojo confirmado: antes de este change, calcularAlertas no evaluaba
    // volumen y esta alerta nunca existía.
    const antes = await prisma.alertaProyecto.findFirst({ where: { tenant_id: tenantId, tipo: 'VOLUMEN_EXCEDIDO' } });
    assert.equal(antes, null, 'antes de correr calcularAlertas no debe existir la alerta');

    await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
      await calcularAlertas(tx, tenantId, proyectoId);
    });

    const alerta = await prisma.alertaProyecto.findFirst({ where: { tenant_id: tenantId, tipo: 'VOLUMEN_EXCEDIDO', concepto_id: conceptoId } });
    assert.ok(alerta, 'calcularAlertas debe crear una AlertaProyecto tipo VOLUMEN_EXCEDIDO cuando cantidad_acumulada > cantidad_presupuestada');
    assert.equal(alerta!.severidad, 'WARN', 'VOLUMEN_EXCEDIDO debe ser severidad WARN, no CRITICA (design.md Decisión 4)');
    assert.equal(alerta!.estado, 'ACTIVA');
    const datos = alerta!.datos as any;
    assert.equal(Number(datos.cantidad_acumulada), 120);
    assert.equal(Number(datos.cantidad_presupuestada), 100);
    assert.equal(Number(datos.cantidad_excedente), 20);
    assert.equal(Number(datos.pct_excedido), 20);

    console.log('ok - 1.1/1.4: calcularAlertas crea VOLUMEN_EXCEDIDO (WARN) cuando el último avance excede lo presupuestado');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_1_5_alerta_se_resuelve_al_ampliar_presupuestado() {
  const { calcularAlertas } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({ tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-002' });
    await seedAvance({
      tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-002',
      cantidadPresupuestada: 100, cantidadAcumulada: 120,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });

    await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
      await calcularAlertas(tx, tenantId, proyectoId);
    });
    const activa = await prisma.alertaProyecto.findFirst({ where: { tenant_id: tenantId, tipo: 'VOLUMEN_EXCEDIDO', concepto_id: conceptoId } });
    assert.ok(activa && activa.estado === 'ACTIVA', 'debe existir la alerta activa antes de ampliar el presupuesto');

    // Se registra un avance posterior con cantidad_presupuestada ampliada
    // (ej. tras una transferencia de partida en gerencia-tecnica) que ya no
    // deja excedente — es el avance MÁS RECIENTE el que decide (design.md
    // Decisión 2), no se recalcula el avance viejo (precio/cantidad
    // congelados, mismo patrón que testPrecioQuedaCongeladoTrasCambioDeCatalogo).
    await seedAvance({
      tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-002',
      cantidadPresupuestada: 200, cantidadAcumulada: 120,
      createdAt: new Date('2026-02-01T00:00:00Z'),
    });

    await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
      await calcularAlertas(tx, tenantId, proyectoId);
    });

    const resuelta = await prisma.alertaProyecto.findFirst({ where: { tenant_id: tenantId, tipo: 'VOLUMEN_EXCEDIDO', concepto_id: conceptoId } });
    assert.ok(resuelta, 'la alerta debe seguir existiendo (histórico)');
    assert.equal(resuelta!.estado, 'RESUELTA', 'la alerta debe resolverse automáticamente cuando el avance más reciente ya no excede');
    assert.ok(resuelta!.resuelta_en, 'resuelta_en debe quedar seteado');

    console.log('ok - 1.5: VOLUMEN_EXCEDIDO se resuelve automáticamente cuando el avance más reciente ya no excede');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_1_6_sin_avances_no_genera_ni_resuelve() {
  const { calcularAlertas } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({ tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-003' });
    // Sin ningún AvanceFisico para este concepto.

    await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
      await calcularAlertas(tx, tenantId, proyectoId);
    });

    const alerta = await prisma.alertaProyecto.findFirst({ where: { tenant_id: tenantId, tipo: 'VOLUMEN_EXCEDIDO', concepto_id: conceptoId } });
    assert.equal(alerta, null, 'sin AvanceFisico no debe crearse ninguna alerta VOLUMEN_EXCEDIDO');

    console.log('ok - 1.6: partidas sin AvanceFisico no generan ni resuelven VOLUMEN_EXCEDIDO');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_1_avances_rechazados_no_cuentan_como_el_mas_reciente() {
  const { calcularAlertas } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({ tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-004' });
    await seedAvance({
      tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-004',
      cantidadPresupuestada: 100, cantidadAcumulada: 80,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
    // El avance más reciente en el tiempo está RECHAZADO y por sí solo
    // excedería — no debe contar, porque un RECHAZADO no representa el
    // estado acumulado real (mismo criterio que la derivación de
    // cantidad_anterior en POST /avances).
    await seedAvance({
      tenantId, proyectoId, conceptoId, conceptoClave: 'VOL-004',
      cantidadPresupuestada: 100, cantidadAcumulada: 150,
      estado: EstadoAvance.RECHAZADO,
      createdAt: new Date('2026-02-01T00:00:00Z'),
    });

    await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
      await calcularAlertas(tx, tenantId, proyectoId);
    });

    const alerta = await prisma.alertaProyecto.findFirst({ where: { tenant_id: tenantId, tipo: 'VOLUMEN_EXCEDIDO', concepto_id: conceptoId } });
    assert.equal(alerta, null, 'un avance RECHAZADO no debe considerarse el "más reciente" para evaluar el excedente');

    console.log('ok - 1.x: un AvanceFisico RECHAZADO no se toma como el más reciente al evaluar VOLUMEN_EXCEDIDO');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

// ─── Grupo 2: POST /avances → advertencia_volumen_excedido ────────────────

async function test_2_1_2_3_advertencia_cuando_excede() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();
  seedCatalogo(tenantId, [{ id: conceptoId, clave: 'VOL-P01', descripcion: 'Partida de prueba', unidad_medida: 'M3', precio_unitario: 100, cantidad: 100 }]);

  try {
    // Rojo confirmado antes del fix: 201 sin ningún campo de advertencia
    // aunque cantidad_acumulada (150) > cantidad_presupuestada (100).
    const r = await postAvance(token(tenantId, proyectoId, ['residencia']), {
      concepto_id: conceptoId, cantidad_periodo: 150, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
    });
    assert.equal(r.status, 201, `el avance debe crearse igual aunque exceda (fue ${r.status})`);
    const body = await r.json() as any;

    assert.ok(body.data.advertencia_volumen_excedido, 'la respuesta debe incluir advertencia_volumen_excedido cuando cantidad_acumulada > cantidad_presupuestada');
    assert.equal(body.data.advertencia_volumen_excedido.excedido, true);
    assert.equal(Number(body.data.advertencia_volumen_excedido.cantidad_excedente), 50, 'cantidad_excedente = 150 - 100');
    assert.equal(Number(body.data.advertencia_volumen_excedido.pct_excedido), 50, 'pct_excedido = 50/100*100');

    console.log('ok - 2.1/2.3: POST /avances incluye advertencia_volumen_excedido cuando el avance recién creado excede lo contratado');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

async function test_2_4_sin_advertencia_cuando_no_excede() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();
  seedCatalogo(tenantId, [{ id: conceptoId, clave: 'VOL-P02', descripcion: 'Partida de prueba', unidad_medida: 'M3', precio_unitario: 100, cantidad: 100 }]);

  try {
    const r = await postAvance(token(tenantId, proyectoId, ['residencia']), {
      concepto_id: conceptoId, cantidad_periodo: 60, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
    });
    assert.equal(r.status, 201);
    const body = await r.json() as any;

    assert.equal(body.data.advertencia_volumen_excedido, undefined, 'la respuesta NO debe incluir advertencia_volumen_excedido cuando no hay excedente');

    console.log('ok - 2.4: POST /avances no incluye advertencia_volumen_excedido cuando cantidad_acumulada <= cantidad_presupuestada');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

async function test_2_5_no_hay_bloqueo_con_o_sin_excedente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoIdA = randomUUID();
  const conceptoIdB = randomUUID();
  seedCatalogo(tenantId, [
    { id: conceptoIdA, clave: 'VOL-P03A', descripcion: 'Sin excedente', unidad_medida: 'M3', precio_unitario: 100, cantidad: 100 },
    { id: conceptoIdB, clave: 'VOL-P03B', descripcion: 'Con excedente', unidad_medida: 'M3', precio_unitario: 100, cantidad: 100 },
  ]);

  try {
    const rSinExcedente = await postAvance(token(tenantId, proyectoId, ['residencia']), {
      concepto_id: conceptoIdA, cantidad_periodo: 40, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
    });
    const rConExcedente = await postAvance(token(tenantId, proyectoId, ['residencia']), {
      concepto_id: conceptoIdB, cantidad_periodo: 999, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
    });

    assert.equal(rSinExcedente.status, 201, 'sin excedente debe crearse (201)');
    assert.equal(rConExcedente.status, 201, 'con excedente también debe crearse (201) — CP no bloquea, solo informa (design.md Decisión 1)');

    const total = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) =>
      tx.avanceFisico.count({ where: { tenant_id: tenantId } })
    );
    assert.equal(total, 2, 'ambos avances deben quedar persistidos, sin rechazo por exceder el volumen contratado');

    console.log('ok - 2.5: POST /avances no bloquea la creación ni con ni sin excedente de volumen');
  } finally {
    await cleanupTenantData(tenantId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await test_1_1_1_4_alerta_se_crea_cuando_hay_excedente();
    await test_1_5_alerta_se_resuelve_al_ampliar_presupuestado();
    await test_1_6_sin_avances_no_genera_ni_resuelve();
    await test_1_avances_rechazados_no_cuentan_como_el_mas_reciente();
    await test_2_1_2_3_advertencia_cuando_excede();
    await test_2_4_sin_advertencia_cuando_no_excede();
    await test_2_5_no_hay_bloqueo_con_o_sin_excedente();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - alertas-volumen-ejecutado-contratado E2E');
  console.error(error);
  process.exitCode = 1;
});

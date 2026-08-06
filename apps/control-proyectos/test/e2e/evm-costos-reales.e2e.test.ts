/**
 * Tests E2E/integración: openspec fix-evm-costos-reales.
 *
 * Cubre tasks.md grupos 2-4:
 *  - AC compuesto (ac_comprometido + ac_ejercido) alimentado por
 *    compras.oc_creada / compras.oc_cancelada / finanzas.pago_registrado
 *    (referencia_entidad = 'OrdenCompra'), en vez de `acAcumulado ?? ev`.
 *  - PV interpolado de curva_programada (interpolarPctProgramado), en vez
 *    de reutilizar el % de avance físico.
 *  - Snapshot diario de ProyeccionCierre (calcularYGuardarProyeccionCierre),
 *    incluyendo mano de obra acumulada vía finanzas.pago_registrado
 *    (referencia_entidad = 'PreNomina').
 *
 * No requiere RabbitMQ: los subscribers se invocan directamente con un
 * BocamEvent construido a mano (mismo patrón que
 * test/e2e/bitacoras-avances-evm.e2e.test.ts:
 * testSalidaObraEventUsaColumnasReales). PATCH /avances/:id/validar no
 * llama a gerencia-tecnica (a diferencia de POST /avances), así que no
 * hace falta un stub de GT_URL: se siembra el AvanceFisico ya PENDIENTE
 * directo en BD.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EstadoAvance } from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const prisma = new PrismaClient();

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  server = started.server;
  baseUrl = started.baseUrl;
}

async function cleanupTenantData(tenantId: string) {
  await prisma.avanceFisico.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.programacionObra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.alertaProyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompraSeguimiento.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.manoObraProyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.pagoEvmProcesado.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proyeccionCierre.deleteMany({ where: { tenant_id: tenantId } });
}

function bocamEvent<T>(tenantId: string, proyectoId: string, userId: string, payload: T) {
  return {
    event_type: 'test',
    timestamp: new Date().toISOString(),
    context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId, correlation_id: randomUUID() },
    payload,
  };
}

async function seedProgramacion(opts: {
  tenantId: string; proyectoId: string; conceptoId: string; conceptoClave: string;
  bac: number; curvaProgramada: Array<{ semana: string; pct_acumulado: number }>;
}) {
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
        curva_programada: opts.curvaProgramada,
        bac: opts.bac,
        estado: 'PENDIENTE',
      },
    })
  );
}

async function seedAvancePendiente(opts: {
  tenantId: string; proyectoId: string; conceptoId: string; conceptoClave: string;
  porcentajeAvance: number; importeAcumulado: number; userId: string;
}) {
  return createTenantContext({ tenantId: opts.tenantId, proyectoId: opts.proyectoId, userId: opts.userId }, async (tx) =>
    tx.avanceFisico.create({
      data: {
        tenant_id: opts.tenantId,
        proyecto_id: opts.proyectoId,
        concepto_id: opts.conceptoId,
        concepto_presupuesto: opts.conceptoClave,
        descripcion_concepto: 'Partida de prueba',
        cantidad_presupuestada: 100,
        cantidad_anterior: 0,
        cantidad_periodo: opts.porcentajeAvance,
        cantidad_acumulada: opts.porcentajeAvance,
        unidad: 'm3',
        precio_unitario: opts.importeAcumulado / opts.porcentajeAvance,
        importe_periodo: opts.importeAcumulado,
        importe_acumulado: opts.importeAcumulado,
        porcentaje_avance: opts.porcentajeAvance,
        periodo_inicio: new Date('2026-01-01'),
        periodo_fin: new Date('2026-01-31'),
        registrado_por_id: opts.userId,
        registrado_por_nombre: 'Residente E2E',
        estado: EstadoAvance.PENDIENTE,
      },
    })
  );
}

async function validarAvance(avanceId: string, tenantId: string, proyectoId: string) {
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['superintendent'] });
  const res = await fetch(`${baseUrl}/api/v1/control-proyectos/avances/${avanceId}/validar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 200, `PATCH /avances/:id/validar debe responder 200, respondió ${res.status}`);
  return res.json();
}

// ─── Grupo 2: AC compuesto ─────────────────────────────────────────────────

async function test_2_1_ac_ya_no_es_igual_a_ev() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();

  try {
    // bac=100000, curva ya vencida (100% antes de "hoy") → pv=bac=100000.
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'BUG-AC-001',
      bac: 100000,
      curvaProgramada: [{ semana: '2020-W01', pct_acumulado: 100 }],
    });

    // AC real compuesto ($80,000) deliberadamente distinto de EV ($50,000
    // que resultará de este avance) — el bug histórico hacía `ac = ev`
    // siempre, lo que da cpi=1 sin importar el costo real.
    await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
      const prog = await tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } });
      await tx.programacionObra.update({
        where: { id: prog.id },
        data: { ac_comprometido: 50000, ac_ejercido: 30000 },
      });
    });

    const avance = await seedAvancePendiente({
      tenantId, proyectoId, conceptoId, conceptoClave: 'BUG-AC-001',
      porcentajeAvance: 50, importeAcumulado: 50000, userId,
    });

    await validarAvance(avance.id_avance, tenantId, proyectoId);

    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );

    // ac = ac_comprometido(50000) + ac_ejercido(30000) = 80000, NO ev (50000).
    // cpi = ev/ac = 50000/80000 = 0.625, muy distinto del ≈1 del bug.
    assert.ok(prog.cpi !== null, 'CPI debe calcularse');
    assert.equal(Number(prog.cpi), 0.625, `CPI esperado 0.625 (ev=50000/ac=80000), fue ${prog.cpi} — si es 1.0 el bug de AC=EV sigue presente`);

    console.log('ok - 2.1: AC compuesto (ac_comprometido+ac_ejercido) maneja el CPI, ya no `acAcumulado ?? ev`');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_2_2_oc_creada_incrementa_ac_comprometido() {
  const { handleOcCreadaEvent } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();
  const ocId = randomUUID();

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'OC-CREADA-001',
      bac: 200000, curvaProgramada: [],
    });

    await handleOcCreadaEvent(bocamEvent(tenantId, proyectoId, userId, {
      oc_id: ocId, codigo: 'OC-TEST-001', total: 45000, concepto_id: conceptoId,
    }));

    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(Number(prog.ac_comprometido), 45000, 'ac_comprometido debe incrementarse en el monto de la OC');

    const seguimiento = await prisma.ordenCompraSeguimiento.findUnique({ where: { oc_id: ocId } });
    assert.ok(seguimiento, 'Debe crearse el registro de seguimiento oc_id -> concepto_id');
    assert.equal(seguimiento!.concepto_id, conceptoId);
    assert.equal(Number(seguimiento!.monto_comprometido), 45000);

    // Idempotencia: reprocesar el mismo oc_id no debe duplicar el incremento.
    await handleOcCreadaEvent(bocamEvent(tenantId, proyectoId, userId, {
      oc_id: ocId, codigo: 'OC-TEST-001', total: 45000, concepto_id: conceptoId,
    }));
    const progTrasReplay = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(Number(progTrasReplay.ac_comprometido), 45000, 'Reprocesar oc_creada debe ser idempotente');

    console.log('ok - 2.2: compras.oc_creada incrementa ac_comprometido y registra OrdenCompraSeguimiento');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_2_3_oc_cancelada_revierte_ac_comprometido() {
  const { handleOcCreadaEvent, handleOcCanceladaEvent } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();
  const ocId = randomUUID();

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'OC-CANCEL-001',
      bac: 200000, curvaProgramada: [],
    });

    await handleOcCreadaEvent(bocamEvent(tenantId, proyectoId, userId, {
      oc_id: ocId, codigo: 'OC-TEST-002', total: 60000, concepto_id: conceptoId,
    }));

    // El payload real de compras.oc_cancelada NO trae concepto_id.
    await handleOcCanceladaEvent(bocamEvent(tenantId, proyectoId, userId, {
      oc_id: ocId, codigo: 'OC-TEST-002', total: 60000, presupuesto_id: randomUUID(),
    }));

    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(Number(prog.ac_comprometido), 0, 'ac_comprometido debe revertirse a 0 tras la cancelación');

    const seguimiento = await prisma.ordenCompraSeguimiento.findUnique({ where: { oc_id: ocId } });
    assert.equal(Number(seguimiento!.monto_comprometido), 0);

    console.log('ok - 2.3: compras.oc_cancelada resuelve concepto_id vía OrdenCompraSeguimiento y revierte ac_comprometido');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_2_4_pago_orden_compra_mueve_comprometido_a_ejercido() {
  const { handleOcCreadaEvent, handlePagoRegistradoEvent } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();
  const ocId = randomUUID();
  const idPago = randomUUID();

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'OC-PAGO-001',
      bac: 200000, curvaProgramada: [],
    });

    await handleOcCreadaEvent(bocamEvent(tenantId, proyectoId, userId, {
      oc_id: ocId, codigo: 'OC-TEST-003', total: 70000, concepto_id: conceptoId,
    }));

    await handlePagoRegistradoEvent(bocamEvent(tenantId, proyectoId, userId, {
      id_pago: idPago,
      referencia_modulo: 'compras',
      referencia_entidad: 'OrdenCompra',
      referencia_id: ocId,
      monto_pagado: 70000,
      fecha_pago_real: new Date().toISOString(),
    }));

    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(Number(prog.ac_comprometido), 0, 'ac_comprometido debe quedar en 0 tras pagar el total de la OC');
    assert.equal(Number(prog.ac_ejercido), 70000, 'ac_ejercido debe recibir el monto pagado');

    const seguimiento = await prisma.ordenCompraSeguimiento.findUnique({ where: { oc_id: ocId } });
    assert.equal(Number(seguimiento!.monto_comprometido), 0);
    assert.equal(Number(seguimiento!.monto_ejercido), 70000);

    // Idempotencia por id_pago: reprocesar el mismo pago no debe duplicar el movimiento.
    await handlePagoRegistradoEvent(bocamEvent(tenantId, proyectoId, userId, {
      id_pago: idPago,
      referencia_modulo: 'compras',
      referencia_entidad: 'OrdenCompra',
      referencia_id: ocId,
      monto_pagado: 70000,
      fecha_pago_real: new Date().toISOString(),
    }));
    const progTrasReplay = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(Number(progTrasReplay.ac_ejercido), 70000, 'Reprocesar el mismo id_pago debe ser idempotente');

    console.log('ok - 2.4: finanzas.pago_registrado (OrdenCompra) mueve ac_comprometido -> ac_ejercido, idempotente por id_pago');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_2_5_pago_estimacion_no_toca_ac_de_partidas() {
  const { handlePagoRegistradoEvent } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'EST-REGRESION-001',
      bac: 100000, curvaProgramada: [],
    });
    await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
      const prog = await tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } });
      await tx.programacionObra.update({ where: { id: prog.id }, data: { ac_comprometido: 12345, ac_ejercido: 6789 } });
    });

    const estimacion = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.estimacion.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          numero_estimacion: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000),
          codigo: `EST-REG-${Date.now()}`,
          periodo_inicio: new Date('2026-01-01'), periodo_fin: new Date('2026-01-15'),
          subtotal: '10000.00', retencion_fondo_garantia: '0.00', amortizacion_anticipo: '0.00',
          iva: '1600.00', total_neto: '11600.00', estado: 'APROBADA_FINANCIERA',
          elaborado_por_id: userId, elaborado_por_nombre: 'Residente E2E', notas: 'Pendiente de pago.',
        },
      })
    );

    await handlePagoRegistradoEvent(bocamEvent(tenantId, proyectoId, userId, {
      id_pago: randomUUID(),
      referencia_modulo: 'control-obra',
      referencia_entidad: 'Estimacion',
      referencia_id: estimacion.id_estimacion,
      monto_pagado: 11600,
      fecha_pago_real: new Date().toISOString(),
    }));

    // Comportamiento preexistente sin cambios: la estimación se factura.
    const estimacionActualizada = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.estimacion.findUniqueOrThrow({ where: { id_estimacion: estimacion.id_estimacion } })
    );
    assert.equal(estimacionActualizada.estado, 'FACTURADA');

    // Regresión del fix: el AC de la partida NO debe tocarse por un pago de Estimacion.
    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(Number(prog.ac_comprometido), 12345, 'ac_comprometido no debe cambiar por un pago de Estimacion');
    assert.equal(Number(prog.ac_ejercido), 6789, 'ac_ejercido no debe cambiar por un pago de Estimacion');

    console.log('ok - 2.5: finanzas.pago_registrado (Estimacion) sigue funcionando igual, sin tocar AC de partidas (regresión)');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

// ─── Grupo 3: PV interpolado ────────────────────────────────────────────────

async function test_3_2_interpolarPctProgramado_puro() {
  const { interpolarPctProgramado } = await import('../../src/main');

  const curva = [
    { semana: '2026-W20', pct_acumulado: 40 },
    { semana: '2026-W24', pct_acumulado: 70 },
  ];

  assert.equal(interpolarPctProgramado(curva, '2026-W22'), 40, 'Debe usar el último punto <= semana de corte');
  assert.equal(interpolarPctProgramado(curva, '2026-W24'), 70, 'Exacto en un punto debe usar ese punto');
  assert.equal(interpolarPctProgramado(curva, '2026-W30'), 70, 'Después del último punto usa el último valor');
  assert.equal(interpolarPctProgramado(curva, '2026-W01'), 0, 'Antes del primer punto debe ser 0, no null');
  assert.equal(interpolarPctProgramado([], '2026-W22'), null, 'Curva vacía debe ser null (sin programación)');
  assert.equal(interpolarPctProgramado(undefined, '2026-W22'), null, 'Curva ausente debe ser null');

  console.log('ok - 3.2: interpolarPctProgramado (función pura) resuelve los casos del spec');
}

async function test_3_3_pv_usa_curva_no_avance_fisico() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();

  try {
    // Curva: 40% en W20, 70% en W24 — semana de corte fijada muy en el
    // futuro respecto a la curva para que el interpolado caiga en el
    // último punto (70%), deliberadamente distinto del 90% de avance
    // físico real que se va a validar.
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'PV-CURVA-001',
      bac: 100000,
      curvaProgramada: [
        { semana: '2020-W20', pct_acumulado: 40 },
        { semana: '2020-W24', pct_acumulado: 70 },
      ],
    });

    const avance = await seedAvancePendiente({
      tenantId, proyectoId, conceptoId, conceptoClave: 'PV-CURVA-001',
      porcentajeAvance: 90, importeAcumulado: 90000, userId,
    });
    await validarAvance(avance.id_avance, tenantId, proyectoId);

    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    // pv = bac * 70% = 70000 (interpolado de la curva) → spi = ev/pv = 90000/70000
    assert.ok(prog.spi !== null);
    const spiEsperado = 90000 / 70000;
    assert.ok(Math.abs(Number(prog.spi) - spiEsperado) < 0.001, `SPI esperado ~${spiEsperado.toFixed(4)} (pv interpolado=70000), fue ${prog.spi}`);

    console.log('ok - 3.3: PV se interpola de curva_programada, no reutiliza pct_avance_real');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_3_4_sin_curva_programada_pv_y_spi_null() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'SIN-CURVA-001',
      bac: 50000, curvaProgramada: [],
    });

    const avance = await seedAvancePendiente({
      tenantId, proyectoId, conceptoId, conceptoClave: 'SIN-CURVA-001',
      porcentajeAvance: 30, importeAcumulado: 15000, userId,
    });
    await validarAvance(avance.id_avance, tenantId, proyectoId);

    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } })
    );
    assert.equal(prog.spi, null, 'Sin curva_programada, spi debe ser null (no calculado desde avance físico)');

    console.log('ok - 3.4: partida sin curva_programada no calcula SPI a partir del avance físico');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

// ─── Grupo 4: Snapshot de ProyeccionCierre ──────────────────────────────────

async function test_4_1_job_persiste_snapshot() {
  const { calcularYGuardarProyeccionCierre } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'SNAPSHOT-001',
      bac: 100000, curvaProgramada: [{ semana: '2020-W01', pct_acumulado: 100 }],
    });

    const antes = await prisma.proyeccionCierre.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
    assert.equal(antes, null, 'Antes del job, ProyeccionCierre debe estar vacía para este proyecto (reproduce el bug: nunca se escribe)');

    await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
      await calcularYGuardarProyeccionCierre(tx, tenantId, proyectoId);
    });

    const despues = await prisma.proyeccionCierre.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
    assert.ok(despues, 'Debe existir un snapshot de ProyeccionCierre tras correr el job');
    assert.equal(Number(despues!.bac), 100000);

    console.log('ok - 4.1: el job nocturno persiste un snapshot nuevo de ProyeccionCierre (antes nunca se escribía)');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_4_2_pago_prenomina_acumula_a_nivel_proyecto() {
  const { handlePagoRegistradoEvent } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  try {
    await handlePagoRegistradoEvent(bocamEvent(tenantId, proyectoId, userId, {
      id_pago: randomUUID(),
      referencia_modulo: 'personal',
      referencia_entidad: 'PreNomina',
      referencia_id: randomUUID(),
      monto_pagado: 25000,
      fecha_pago_real: new Date().toISOString(),
    }));
    await handlePagoRegistradoEvent(bocamEvent(tenantId, proyectoId, userId, {
      id_pago: randomUUID(),
      referencia_modulo: 'personal',
      referencia_entidad: 'PreNomina',
      referencia_id: randomUUID(),
      monto_pagado: 15000,
      fecha_pago_real: new Date().toISOString(),
    }));

    const acumulado = await prisma.manoObraProyecto.findUnique({
      where: { tenant_id_proyecto_id: { tenant_id: tenantId, proyecto_id: proyectoId } },
    });
    assert.ok(acumulado, 'Debe existir un acumulador de mano de obra para el proyecto');
    assert.equal(Number(acumulado!.monto_acumulado), 40000, 'Dos pagos de PreNomina deben sumarse (25000+15000)');

    console.log('ok - 4.2: finanzas.pago_registrado (PreNomina) acumula a nivel proyecto, no por partida');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_4_3_snapshot_incluye_mano_de_obra_en_ac_global() {
  const { handlePagoRegistradoEvent, calcularYGuardarProyeccionCierre } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();

  try {
    // BAC=100000, ev=50000 (50% avance), sin AC de OC (0), curva vencida en 100%.
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'SNAPSHOT-MO-001',
      bac: 100000, curvaProgramada: [{ semana: '2020-W01', pct_acumulado: 100 }],
    });
    await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
      const prog = await tx.programacionObra.findFirstOrThrow({ where: { tenant_id: tenantId, concepto_id: conceptoId } });
      await tx.programacionObra.update({ where: { id: prog.id }, data: { pct_avance_real: 50 } });
    });

    await handlePagoRegistradoEvent(bocamEvent(tenantId, proyectoId, userId, {
      id_pago: randomUUID(),
      referencia_modulo: 'personal',
      referencia_entidad: 'PreNomina',
      referencia_id: randomUUID(),
      monto_pagado: 20000,
      fecha_pago_real: new Date().toISOString(),
    }));

    await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
      await calcularYGuardarProyeccionCierre(tx, tenantId, proyectoId);
    });

    const snapshot = await prisma.proyeccionCierre.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId } });
    assert.ok(snapshot, 'Snapshot debe existir');
    // AC global = ac de partidas (0) + mano de obra (20000) = 20000
    assert.equal(Number(snapshot!.ac), 20000, `AC global esperado 20000 (0 de partidas + 20000 de mano de obra), fue ${snapshot!.ac}`);
    assert.equal(Number(snapshot!.ev), 50000, 'EV global = 50% de bac=100000');
    // cpi = ev/ac = 50000/20000 = 2.5
    assert.equal(Number(snapshot!.cpi), 2.5);

    console.log('ok - 4.3: el snapshot suma mano de obra (PreNomina) al AC global del proyecto, no distribuida por partida');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

async function test_4_5_dashboard_y_evm_ya_no_devuelven_global_null() {
  const { calcularYGuardarProyeccionCierre } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    await seedProgramacion({
      tenantId, proyectoId, conceptoId, conceptoClave: 'DASHBOARD-001',
      bac: 100000, curvaProgramada: [{ semana: '2020-W01', pct_acumulado: 100 }],
    });

    const dashboardAntes = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    const dashboardAntesBody = await dashboardAntes.json();
    assert.equal(dashboardAntesBody.data.resumen_evm.cpi, null, 'Antes del snapshot, resumen_evm.cpi debe ser null (reproduce el bug de dashboard vacío)');

    await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
      await calcularYGuardarProyeccionCierre(tx, tenantId, proyectoId);
    });

    const dashboardRes = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(dashboardRes.status, 200);
    const dashboardBody = await dashboardRes.json();
    assert.equal(typeof dashboardBody.data.resumen_evm.cpi, 'number', 'resumen_evm.cpi debe ser numérico tras el snapshot');
    assert.equal(typeof dashboardBody.data.resumen_evm.spi, 'number', 'resumen_evm.spi debe ser numérico tras el snapshot');
    assert.equal(typeof dashboardBody.data.resumen_evm.vac, 'number', 'resumen_evm.vac debe ser numérico tras el snapshot');

    const evmRes = await fetch(`${baseUrl}/api/v1/control-proyectos/evm`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(evmRes.status, 200);
    const evmBody = await evmRes.json();
    assert.ok(evmBody.data.global, 'GET /evm debe devolver el bloque global, no null');
    assert.equal(typeof evmBody.data.global.cpi, 'number');

    console.log('ok - 4.5: GET /dashboard y GET /evm dejan de devolver resumen_evm/global en null tras el snapshot');
  } finally {
    await cleanupTenantData(tenantId);
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await test_2_1_ac_ya_no_es_igual_a_ev();
    await test_2_2_oc_creada_incrementa_ac_comprometido();
    await test_2_3_oc_cancelada_revierte_ac_comprometido();
    await test_2_4_pago_orden_compra_mueve_comprometido_a_ejercido();
    await test_2_5_pago_estimacion_no_toca_ac_de_partidas();
    await test_3_2_interpolarPctProgramado_puro();
    await test_3_3_pv_usa_curva_no_avance_fisico();
    await test_3_4_sin_curva_programada_pv_y_spi_null();
    await test_4_1_job_persiste_snapshot();
    await test_4_2_pago_prenomina_acumula_a_nivel_proyecto();
    await test_4_3_snapshot_incluye_mano_de_obra_en_ac_global();
    await test_4_5_dashboard_y_evm_ya_no_devuelven_global_null();
  } finally {
    await stopHttpApp(server);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - control-proyectos fix-evm-costos-reales E2E');
  console.error(error);
  process.exitCode = 1;
});

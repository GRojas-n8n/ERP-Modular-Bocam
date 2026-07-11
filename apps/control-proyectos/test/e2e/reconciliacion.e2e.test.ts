import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { EstadoEstimacion } from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const prisma = new PrismaClient();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let cpServer: Server | undefined;
let finanzasServer: Server | undefined;
let baseUrl = '';
let financeCalls: Array<{ path: string; body: any }> = [];

async function cleanupTenantData(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
    await tx.avanceFisico.deleteMany({ where: { tenant_id: tenantId } });
    await tx.estimacion.deleteMany({ where: { tenant_id: tenantId } });
    await tx.bitacoraObra.deleteMany({ where: { tenant_id: tenantId } });
  });
}

async function seedEstimacion(
  estado: EstadoEstimacion,
  overrides?: { tenantId?: string; proyectoId?: string; userId?: string }
) {
  const tenantId = overrides?.tenantId || randomUUID();
  const proyectoId = overrides?.proyectoId || randomUUID();
  const userId = overrides?.userId || randomUUID();

  const estimacionId = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
    const estimacion = await tx.estimacion.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        numero_estimacion: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000),
        codigo: `EST-E2E-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        periodo_inicio: new Date('2026-03-01'),
        periodo_fin: new Date('2026-03-15'),
        subtotal: '10000.00',
        retencion_fondo_garantia: '0.00',
        amortizacion_anticipo: '0.00',
        iva: '1600.00',
        total_neto: '11600.00',
        estado,
        elaborado_por_id: userId,
        elaborado_por_nombre: 'Residente E2E',
      },
    });

    await tx.avanceFisico.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        concepto_presupuesto: `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        descripcion_concepto: 'Concepto E2E',
        cantidad_presupuestada: '10.0000',
        cantidad_anterior: '0.0000',
        cantidad_periodo: '5.0000',
        cantidad_acumulada: '5.0000',
        unidad: 'm2',
        precio_unitario: '2000.0000',
        importe_periodo: '10000.00',
        importe_acumulado: '10000.00',
        porcentaje_avance: '50.00',
        periodo_inicio: new Date('2026-03-01'),
        periodo_fin: new Date('2026-03-15'),
        registrado_por_id: userId,
        registrado_por_nombre: 'Residente E2E',
        estado: 'VALIDADO',
        estimacion_id: estimacion.id_estimacion,
      },
    });

    return estimacion.id_estimacion;
  });

  return { tenantId, proyectoId, userId, estimacionId };
}

async function seedValidatedAvances(overrides?: { tenantId?: string; proyectoId?: string; userId?: string }) {
  const tenantId = overrides?.tenantId || randomUUID();
  const proyectoId = overrides?.proyectoId || randomUUID();
  const userId = overrides?.userId || randomUUID();

  const avanceIds = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
    const avances = await Promise.all(
      [1, 2].map((index) =>
        tx.avanceFisico.create({
          data: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            concepto_presupuesto: `CON-VAL-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            descripcion_concepto: `Concepto validado ${index}`,
            cantidad_presupuestada: '10.0000',
            cantidad_anterior: '0.0000',
            cantidad_periodo: '5.0000',
            cantidad_acumulada: '5.0000',
            unidad: 'm2',
            precio_unitario: '1500.0000',
            importe_periodo: '7500.00',
            importe_acumulado: '7500.00',
            porcentaje_avance: '50.00',
            periodo_inicio: new Date('2026-03-01'),
            periodo_fin: new Date('2026-03-15'),
            registrado_por_id: userId,
            registrado_por_nombre: 'Residente E2E',
            validado_por_id: userId,
            validado_por_nombre: 'Superintendente E2E',
            estado: 'VALIDADO',
          },
        })
      )
    );
    return avances.map((a) => a.id_avance);
  });

  return { tenantId, proyectoId, userId, avanceIds };
}

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.post('/api/v1/finanzas/pagos', (req, res) => {
    financeCalls.push({ path: req.path, body: req.body });
    res.json({ success: true, data: { status: 'PROGRAMADO' } });
  });

  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  cpServer = started.server;
  baseUrl = started.baseUrl;
}

async function testPendientesList() {
  financeCalls = [];
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const pending = await seedEstimacion(EstadoEstimacion.PENDIENTE_CONFIRMACION_FINANZAS, { tenantId, proyectoId, userId });
  const failed = await seedEstimacion(EstadoEstimacion.ERROR_FINANZAS, { tenantId, proyectoId, userId });
  const approved = await seedEstimacion(EstadoEstimacion.APROBADA_FINANCIERA, { tenantId, proyectoId, userId });

  try {
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

    const response = await fetch(
      `${baseUrl}/api/v1/control-proyectos/estimaciones/reconciliacion/pendientes`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    const ids = new Set(payload.data.map((item: any) => item.id_estimacion));
    const estados = payload.data.map((item: any) => item.estado);

    assert.equal(ids.has(pending.estimacionId), true);
    assert.equal(ids.has(failed.estimacionId), true);
    assert.equal(ids.has(approved.estimacionId), false);
    assert.equal(
      estados.every((estado: string) =>
        [EstadoEstimacion.ERROR_FINANZAS, EstadoEstimacion.PENDIENTE_CONFIRMACION_FINANZAS].includes(estado as EstadoEstimacion)
      ),
      true
    );
    console.log('ok - control-proyectos listado de pendientes de reconciliacion');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

async function testErrorFinanzasReconciliation() {
  financeCalls = [];
  const seeded = await seedEstimacion(EstadoEstimacion.ERROR_FINANZAS);
  const presupuestoId = randomUUID();

  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['admin'] });

    const response = await fetch(
      `${baseUrl}/api/v1/control-proyectos/estimaciones/${seeded.estimacionId}/reconciliar-finanzas`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuestoId }),
      }
    );

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.success, true);
    assert.equal(payload.data.estado, EstadoEstimacion.APROBADA_FINANCIERA);
    assert.equal(financeCalls.length, 1);
    assert.equal(financeCalls[0]?.path, '/api/v1/finanzas/pagos');
    assert.equal(financeCalls[0]?.body.presupuesto_id, presupuestoId);
    assert.equal(financeCalls[0]?.body.referencia_modulo, 'control-obra');
    assert.equal(financeCalls[0]?.body.referencia_entidad, 'Estimacion');
    assert.equal(financeCalls[0]?.body.referencia_id, seeded.estimacionId);

    const persisted = await createTenantContext({ tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, userId: seeded.userId }, async (tx) =>
      tx.estimacion.findUnique({ where: { id_estimacion: seeded.estimacionId } })
    );
    assert.equal(persisted?.estado, EstadoEstimacion.APROBADA_FINANCIERA);
    console.log('ok - control-proyectos reconciliacion ERROR_FINANZAS -> APROBADA_FINANCIERA');

    const secondResponse = await fetch(
      `${baseUrl}/api/v1/control-proyectos/estimaciones/${seeded.estimacionId}/reconciliar-finanzas`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuestoId }),
      }
    );

    assert.equal(secondResponse.status, 200);
    const secondPayload = await secondResponse.json();
    assert.equal(secondPayload.success, true);
    assert.equal(secondPayload.data.estado, EstadoEstimacion.APROBADA_FINANCIERA);
    assert.equal(secondPayload.data.idempotente, true);
    assert.equal(financeCalls.length, 1);
    console.log('ok - control-proyectos reconciliacion APROBADA_FINANCIERA -> idempotent');
  } finally {
    await cleanupTenantData(seeded.tenantId, seeded.proyectoId);
  }
}

async function testEstimacionApprovalFlow() {
  financeCalls = [];
  const seeded = await seedValidatedAvances();
  const presupuestoId = randomUUID();

  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['admin'] });

    const createResponse = await fetch(
      `${baseUrl}/api/v1/control-proyectos/estimaciones`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ avance_ids: seeded.avanceIds, periodo_inicio: '2026-03-01', periodo_fin: '2026-03-15', notas: 'Estimacion E2E' }),
      }
    );

    assert.equal(createResponse.status, 201);
    const createPayload = await createResponse.json();
    assert.equal(createPayload.success, true);
    assert.equal(createPayload.data.estado, EstadoEstimacion.BORRADOR);

    const estimacionId = createPayload.data.id_estimacion;
    financeCalls = [];

    const approveResponse = await fetch(
      `${baseUrl}/api/v1/control-proyectos/estimaciones/${estimacionId}/aprobar`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: presupuestoId }),
      }
    );

    assert.equal(approveResponse.status, 200);
    const approvePayload = await approveResponse.json();
    assert.equal(approvePayload.success, true);
    assert.equal(approvePayload.data.estado, EstadoEstimacion.APROBADA_FINANCIERA);
    assert.equal(financeCalls.length, 1);
    assert.equal(financeCalls[0]?.path, '/api/v1/finanzas/pagos');
    assert.equal(financeCalls[0]?.body.presupuesto_id, presupuestoId);
    assert.equal(financeCalls[0]?.body.referencia_id, estimacionId);
    assert.equal(financeCalls[0]?.body.referencia_modulo, 'control-obra');

    const persisted = await createTenantContext({ tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, userId: seeded.userId }, async (tx) =>
      tx.estimacion.findUnique({ where: { id_estimacion: estimacionId }, include: { avances: true } })
    );

    assert.equal(persisted?.estado, EstadoEstimacion.APROBADA_FINANCIERA);
    assert.equal(persisted?.avances.length, seeded.avanceIds.length);
    console.log('ok - control-proyectos flujo estimacion -> aprobacion financiera');
  } finally {
    await cleanupTenantData(seeded.tenantId, seeded.proyectoId);
  }
}

async function main() {
  await setup();

  try {
    await testEstimacionApprovalFlow();
    await testPendientesList();
    await testErrorFinanzasReconciliation();
  } finally {
    await stopHttpApp(cpServer);
    await stopHttpApp(finanzasServer);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - control-proyectos reconciliacion E2E');
  console.error(error);
  process.exitCode = 1;
});

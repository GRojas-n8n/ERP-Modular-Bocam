/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Evaluación técnica por característica individual
 * Spec:  openspec/changes/evaluacion-tecnica-por-especificacion/specs/
 * Tareas: 3.1–3.3, 4.1–4.2 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env), migración
 *           20260711090000_add_evaluacion_especificacion aplicada
 * No requiere: RabbitMQ ni servicios externos.
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.evaluacionEspecificacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.especificacionDetalleReq.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

/** Crea un cuadro EN_EVALUACION_TECNICA con 1 renglón (insumo), N especificaciones y 1+ proveedores. */
async function seedCuadroConEspecificaciones(numEspecs: number, numProveedores = 1) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();
  const detalleReqId = randomUUID();

  const proveedores = await Promise.all(
    Array.from({ length: numProveedores }).map((_, i) =>
      prisma.proveedor.create({
        data: { tenant_id: tenantId, rfc_tax_id: `RFC${Date.now()}${i}`, razon_social: `Proveedor ${i + 1}`, estatus: 'ACTIVO' },
      })
    )
  );

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-EVALSPEC-${Date.now()}`,
      estado: 'EN_EVALUACION_TECNICA',
      lineas: {
        create: [{ tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: insumoId, detalle_req_id: detalleReqId }],
      },
      detalles: {
        create: proveedores.map(p => ({
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          proveedor_id: p.id_proveedor,
          insumo_id: insumoId,
          precio_ofertado: '100.0000',
        })),
      },
    },
  });

  const especs = await Promise.all(
    Array.from({ length: numEspecs }).map((_, i) =>
      prisma.especificacionDetalleReq.create({
        data: { tenant_id: tenantId, proyecto_id: proyectoId, detalle_id: detalleReqId, descripcion: `Característica ${i + 1}`, orden: i },
      })
    )
  );

  const detalles = await prisma.comparativaDetalle.findMany({ where: { cuadro_id: cuadro.id_cuadro } });

  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, insumoId, especs, proveedores, detalles };
}

// ── 3.1: guarda veredictos y recalcula el renglón en la misma transacción ──

async function testGuardaYRecalculaRenglon() {
  const s = await seedCuadroConEspecificaciones(2, 1);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });
    const provId = s.proveedores[0].id_proveedor;

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/evaluar-especificaciones`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluaciones: [
          { especificacion_id: s.especs[0].id_especificacion, proveedor_id: provId, evaluacion_tecnica: 'C' },
          { especificacion_id: s.especs[1].id_especificacion, proveedor_id: provId, evaluacion_tecnica: 'C' },
        ],
      }),
    });

    assert.equal(response.status, 200);

    const evals = await prisma.evaluacionEspecificacion.findMany({ where: { cuadro_id: s.cuadroId, proveedor_id: provId } });
    assert.equal(evals.length, 2);
    assert.ok(evals.every(e => e.evaluacion_tecnica === 'C'));

    const detalle = await prisma.comparativaDetalle.findFirst({ where: { cuadro_id: s.cuadroId, insumo_id: s.insumoId, proveedor_id: provId } });
    assert.equal(detalle?.evaluacion_tecnica, 'C', 'el veredicto de renglón debe recalcularse a C');

    console.log('ok - 3.1: guarda veredictos por característica y recalcula el renglón');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 3.2: "?" sin pregunta_residente -> 400, no persiste ─────────────────────

async function testPreguntaObligatoria() {
  const s = await seedCuadroConEspecificaciones(1, 1);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });
    const provId = s.proveedores[0].id_proveedor;

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/evaluar-especificaciones`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluaciones: [{ especificacion_id: s.especs[0].id_especificacion, proveedor_id: provId, evaluacion_tecnica: '?' }] }),
    });

    assert.equal(response.status, 400);
    const count = await prisma.evaluacionEspecificacion.count({ where: { cuadro_id: s.cuadroId } });
    assert.equal(count, 0, 'no debe persistir nada');

    console.log('ok - 3.2: "?" sin pregunta_residente -> 400, no persiste');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 3.3: dos características evaluadas distinto, sin interferencia ─────────

async function testCaracteristicasIndependientes() {
  const s = await seedCuadroConEspecificaciones(2, 1);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });
    const provId = s.proveedores[0].id_proveedor;

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/evaluar-especificaciones`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluaciones: [
          { especificacion_id: s.especs[0].id_especificacion, proveedor_id: provId, evaluacion_tecnica: '?', pregunta_residente: '¿Cumple la norma X?' },
          { especificacion_id: s.especs[1].id_especificacion, proveedor_id: provId, evaluacion_tecnica: 'C' },
        ],
      }),
    });

    assert.equal(response.status, 200);

    const evalA = await prisma.evaluacionEspecificacion.findFirst({ where: { cuadro_id: s.cuadroId, especificacion_id: s.especs[0].id_especificacion } });
    const evalB = await prisma.evaluacionEspecificacion.findFirst({ where: { cuadro_id: s.cuadroId, especificacion_id: s.especs[1].id_especificacion } });

    assert.equal(evalA?.evaluacion_tecnica, '?');
    assert.equal(evalA?.pregunta_residente, '¿Cumple la norma X?');
    assert.equal(evalB?.evaluacion_tecnica, 'C');
    assert.equal(evalB?.pregunta_residente, null, 'la característica B no debe heredar pregunta de la A');

    const detalle = await prisma.comparativaDetalle.findFirst({ where: { cuadro_id: s.cuadroId, insumo_id: s.insumoId, proveedor_id: provId } });
    assert.equal(detalle?.evaluacion_tecnica, '?', 'el renglón debe reflejar el peor caso (?)');

    console.log('ok - 3.3: dos características del mismo renglón evaluadas distinto, sin interferencia');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 4.1: legacy "evaluar" sobre renglón CON especificaciones -> 400 ────────

async function testLegacyRechazaConEspecificaciones() {
  const s = await seedCuadroConEspecificaciones(1, 1);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/evaluar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluaciones: [{ detalle_id: s.detalles[0].id_detalle, evaluacion_tecnica: 'C' }] }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as any;
    assert.match(body.message, /EVALUACION_POR_ESPECIFICACION_REQUERIDA/);

    const detalle = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: s.detalles[0].id_detalle } });
    assert.equal(detalle?.evaluacion_tecnica, 'PENDIENTE', 'no debe haberse modificado');

    console.log('ok - 4.1: PATCH .../evaluar rechaza renglón con especificaciones capturadas');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 4.2: legacy "evaluar" sobre renglón SIN especificaciones -> sin regresión ──

async function testLegacySigueFuncionandoSinEspecificaciones() {
  const s = await seedCuadroConEspecificaciones(0, 1); // 0 especificaciones
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/evaluar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluaciones: [{ detalle_id: s.detalles[0].id_detalle, evaluacion_tecnica: 'C' }] }),
    });

    assert.equal(response.status, 200);
    const detalle = await prisma.comparativaDetalle.findUnique({ where: { id_detalle: s.detalles[0].id_detalle } });
    assert.equal(detalle?.evaluacion_tecnica, 'C');

    console.log('ok - 4.2: PATCH .../evaluar sigue funcionando para renglones sin especificaciones (fallback legacy)');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testGuardaYRecalculaRenglon();               // 3.1
    await testPreguntaObligatoria();                    // 3.2
    await testCaracteristicasIndependientes();           // 3.3
    await testLegacyRechazaConEspecificaciones();        // 4.1
    await testLegacySigueFuncionandoSinEspecificaciones(); // 4.2
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - evaluar-especificaciones integration tests');
  console.error(error);
  process.exitCode = 1;
});

/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: convertir-oc resuelve presupuesto_id automáticamente
 * por partida (concepto_id) cuando existe, sin selector manual — y deja de
 * llamar directo a Finanzas /comprometer-fondos en ese camino (GT es la única
 * fuente de verdad, Finanzas sincroniza por evento).
 *
 * Spec: openspec/changes/unificar-presupuesto-a-partidas-gt (sección 3).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@127.0.0.1:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let gtServer: Server | undefined;
let comprasBaseUrl = '';

// Contadores para verificar qué se llamó y qué no.
let comprometerFondosLlamadas = 0;
let gtComprometerLlamadas = 0;
let finanzasPorConceptoRespuesta: { status: number; id_presupuesto?: string } = { status: 200, id_presupuesto: undefined };

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => res.json({ success: true, data: { tiene_suficiencia: true } }));
  finanzasStub.get('/api/v1/finanzas/presupuestos/por-concepto/:conceptoId', (_req, res) => {
    if (finanzasPorConceptoRespuesta.status === 404) {
      return res.status(404).json({ success: false, error: { code: 'FIN_NOT_FOUND' } });
    }
    res.json({ success: true, data: { id_presupuesto: finanzasPorConceptoRespuesta.id_presupuesto } });
  });
  finanzasStub.post('/api/v1/finanzas/comprometer-fondos', (_req, res) => {
    comprometerFondosLlamadas++;
    res.json({ success: true, data: { status: 'COMPROMETIDO' } });
  });
  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const gtStub = express();
  gtStub.use(express.json());
  gtStub.get('/api/v1/gerencia-tecnica/partidas/:id/saldo', (_req, res) => res.json({ success: true, data: { monto_disponible: 999999, estado_tope: 'LIBRE', bloqueo_automatico: false } }));
  gtStub.post('/api/v1/gerencia-tecnica/partidas/:id/comprometer', (_req, res) => {
    gtComprometerLlamadas++;
    res.json({ success: true });
  });
  const gtStarted = await startHttpApp(gtStub);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await stopHttpApp(gtServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

function post(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function seedCuadroAprobado(conceptoId: string | null) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const req = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId,
      codigo: `REQ-PART-${Date.now().toString().slice(-6)}`,
      solicitante_id: userId, estado: 'COMPRADA', tipo: 'NORMAL',
      concepto_id: conceptoId,
    },
  });
  const item = await prisma.requisicionItem.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion,
      cantidad: '2.0000', es_imprevisto: true,
      descripcion_libre: 'Material de prueba partida', unidad_libre: 'PZA',
    },
  });
  const prov = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFCPAR${Date.now().toString().slice(-6)}`, razon_social: 'Proveedor Partida Test', estatus: 'ACTIVO' },
  });
  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion,
      codigo: `CC-PART-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'APROBADO_GT',
    },
  });
  await prisma.comparativaDetalle.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro,
      proveedor_id: prov.id_proveedor, detalle_req_id: item.id_item,
      precio_ofertado: '1000.0000', evaluacion_tecnica: 'C', aprobacion_gt: 'C', es_ganador: true,
    },
  });

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro, provId: prov.id_proveedor };
}

async function main() {
  await setup();
  let passed = 0;
  let failed = 0;
  const test = async (name: string, fn: () => Promise<void>) => {
    try { await fn(); console.log(`ok - ${name}`); passed++; }
    catch (err: any) { console.error(`not ok - ${name}`); console.error(err.message || err); failed++; }
  };

  try {
    await test('con concepto_id y presupuesto sincronizado: resuelve automático, sin llamar comprometer-fondos', async () => {
      const conceptoId = randomUUID();
      const presupuestoIdSincronizado = randomUUID();
      finanzasPorConceptoRespuesta = { status: 200, id_presupuesto: presupuestoIdSincronizado };
      comprometerFondosLlamadas = 0;
      gtComprometerLlamadas = 0;

      const seeded = await seedCuadroAprobado(conceptoId);
      try {
        const token = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
        const res = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`, token, {});
        const body = await res.json() as any;
        assert.equal(res.status, 201, `debe retornar 201: ${JSON.stringify(body)}`);

        const orden = await prisma.ordenCompra.findFirst({ where: { tenant_id: seeded.tenantId } });
        assert.ok(orden, 'debe crear la OC');
        assert.equal(orden!.presupuesto_id, presupuestoIdSincronizado, 'presupuesto_id debe ser el resuelto automáticamente por partida');
        assert.equal(orden!.estado, 'EMITIDA');

        assert.equal(comprometerFondosLlamadas, 0, 'NO debe llamar directo a comprometer-fondos cuando hay concepto_id');
        assert.equal(gtComprometerLlamadas, 1, 'SÍ debe comprometer en GT — es la fuente de verdad');
      } finally {
        await cleanupTenant(seeded.tenantId);
      }
    });

    await test('con concepto_id pero SIN presupuesto sincronizado en Finanzas: 422, sin generar OC', async () => {
      const conceptoId = randomUUID();
      finanzasPorConceptoRespuesta = { status: 404 };

      const seeded = await seedCuadroAprobado(conceptoId);
      try {
        const token = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
        const res = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`, token, {});
        assert.equal(res.status, 422);
        const body = await res.json() as any;
        assert.equal(body.error, 'SIN_PRESUPUESTO_SINCRONIZADO');

        const orden = await prisma.ordenCompra.findFirst({ where: { tenant_id: seeded.tenantId } });
        assert.equal(orden, null, 'no debe crearse ninguna OC');
      } finally {
        await cleanupTenant(seeded.tenantId);
      }
    });

    await test('sin concepto_id y sin presupuesto_id en el body: 400 (fallback sin cambios)', async () => {
      const seeded = await seedCuadroAprobado(null);
      try {
        const token = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
        const res = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`, token, {});
        assert.equal(res.status, 400);
      } finally {
        await cleanupTenant(seeded.tenantId);
      }
    });

    await test('sin concepto_id, con presupuesto_id en el body: sigue usando el commit directo a Finanzas (fallback)', async () => {
      const presupuestoIdManual = randomUUID();
      comprometerFondosLlamadas = 0;

      const seeded = await seedCuadroAprobado(null);
      try {
        const token = signTenantToken({ userId: randomUUID(), tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
        const res = await post(`/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`, token, { presupuesto_id: presupuestoIdManual });
        const body = await res.json() as any;
        assert.equal(res.status, 201, `debe retornar 201: ${JSON.stringify(body)}`);

        const orden = await prisma.ordenCompra.findFirst({ where: { tenant_id: seeded.tenantId } });
        assert.equal(orden!.presupuesto_id, presupuestoIdManual);
        assert.equal(comprometerFondosLlamadas, 1, 'SÍ debe llamar comprometer-fondos en el camino de fallback (sin concepto_id)');
      } finally {
        await cleanupTenant(seeded.tenantId);
      }
    });

    console.log(`\n${passed + failed} tests | ${passed} passed | ${failed} failed`);
  } finally {
    await teardown();
  }

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('not ok - convertir-oc-resolucion-presupuesto-partida');
  console.error(err);
  process.exitCode = 1;
});

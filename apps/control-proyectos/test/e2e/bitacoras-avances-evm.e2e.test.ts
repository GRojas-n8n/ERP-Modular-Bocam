import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

// Cubre los endpoints de bitácoras/avances/dashboards/costo-real migrados
// de control-obra que no estaban cubiertos por los tests heredados
// (adaptados aparte en reconciliacion.e2e.test.ts / finanzas.pago-registrado),
// y el recálculo EVM directo (Decisión 4 de design.md — reemplaza el
// subscribe interno a control_obra.avance_fisico_validado).
//
// POST /avances ahora resuelve concepto_id/precio/cantidad contra el
// catálogo de gerencia-tecnica (ver change fix-estimaciones-residente-
// desconectado) — un stub local sustituye a GT_URL para esta prueba.

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

const prisma = new PrismaClient();

let server: Server | undefined;
let gtServer: Server | undefined;
let baseUrl = '';
const gtCatalogoPorTenant = new Map<string, Array<{ id: string; clave: string; descripcion: string; unidad_medida: string; precio_unitario: number; cantidad: number }>>();

async function setup() {
  const gtStub = express();
  gtStub.get('/api/v1/gerencia-tecnica/presupuesto/activo', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const decoded = token ? (jwt.verify(token, process.env.JWT_SECRET as string) as any) : undefined;
    const conceptos = decoded ? gtCatalogoPorTenant.get(decoded.tenant_id) : undefined;
    if (!conceptos) { res.status(500).json({ success: false }); return; }
    res.json({ success: true, data: { id: 'presupuesto-stub', version: 1, conceptos } });
  });
  const gtStarted = await startHttpApp(gtStub);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  server = started.server;
  baseUrl = started.baseUrl;
}

async function cleanupTenantData(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
    await tx.bitacoraObra.deleteMany({ where: { tenant_id: tenantId } });
    await tx.avanceFisico.deleteMany({ where: { tenant_id: tenantId } });
    await tx.programacionObra.deleteMany({ where: { tenant_id: tenantId } });
    await tx.alertaProyecto.deleteMany({ where: { tenant_id: tenantId } });
    await tx.materialConsumidoObra.deleteMany({ where: { tenant_id: tenantId } });
  });
}

async function testBitacorasCrud() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });

  try {
    const createResponse = await fetch(`${baseUrl}/api/v1/control-proyectos/bitacoras`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frente_trabajo: 'Frente 1 - Cimentación',
        actividades_realizadas: 'Colado de zapatas',
        personal_en_sitio: 12,
      }),
    });
    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    assert.equal(created.data.numero_entrada, 1);
    assert.equal(created.data.estado, 'BORRADOR');

    const listResponse = await fetch(`${baseUrl}/api/v1/control-proyectos/bitacoras`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(listResponse.status, 200);
    const list = await listResponse.json();
    assert.equal(list.data.length, 1);

    const firmarResponse = await fetch(`${baseUrl}/api/v1/control-proyectos/bitacoras/${created.data.id_bitacora}/firmar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(firmarResponse.status, 200);
    const firmada = await firmarResponse.json();
    assert.equal(firmada.data.estado, 'FIRMADA');

    console.log('ok - bitácoras: crear, listar, firmar');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

async function testAvanceValidarRecalculaEVM() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  // ProgramacionObra hace match por concepto_clave (string) contra
  // AvanceFisico.concepto_presupuesto — reutilizamos el mismo string como
  // clave, igual que antes; conceptoId (GT) es ahora el UUID real del
  // catálogo, distinto del concepto_id/concepto_clave de ProgramacionObra.
  const conceptoClave = `CIM-${randomUUID()}`;
  const conceptoId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia', 'superintendent'] });

  gtCatalogoPorTenant.set(tenantId, [
    { id: conceptoId, clave: conceptoClave, descripcion: 'Cimentación', unidad_medida: 'm3', precio_unitario: 2000, cantidad: 100 },
  ]);

  // Programación previa (necesaria para que recalcularEVMPorAvanceValidado tenga qué actualizar)
  await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
    await tx.programacionObra.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        concepto_id: conceptoId,
        concepto_clave: conceptoClave,
        descripcion: 'Cimentación',
        fecha_inicio_plan: new Date('2026-03-01'),
        fecha_fin_plan: new Date('2026-04-01'),
        curva_programada: [{ semana: '2026-W10', pct_acumulado: 100 }],
        bac: 100000,
        estado: 'PENDIENTE',
      },
    });
  });

  try {
    const createResponse = await fetch(`${baseUrl}/api/v1/control-proyectos/avances`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concepto_id: conceptoId,
        cantidad_periodo: 50,
        periodo_inicio: '2026-03-01',
        periodo_fin: '2026-03-15',
      }),
    });
    assert.equal(createResponse.status, 201);
    const avance = await createResponse.json();
    assert.equal(avance.data.estado, 'PENDIENTE');

    const validarResponse = await fetch(`${baseUrl}/api/v1/control-proyectos/avances/${avance.data.id_avance}/validar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(validarResponse.status, 200);
    const validado = await validarResponse.json();
    assert.equal(validado.data.estado, 'VALIDADO');

    // El recálculo EVM ahora es una llamada directa dentro de la misma
    // transacción (no un evento asíncrono) — debe reflejarse de inmediato.
    const prog = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.programacionObra.findFirst({ where: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: conceptoId } })
    );
    assert.ok(prog, 'ProgramacionObra debe existir');
    assert.ok(prog!.cpi !== null, 'CPI debe haberse calculado tras validar el avance');
    assert.ok(['EN_CURSO', 'COMPLETADA'].includes(prog!.estado), `estado esperado EN_CURSO/COMPLETADA, fue ${prog!.estado}`);

    console.log('ok - avance validado recalcula EVM (ProgramacionObra) de forma directa, sin pasar por RabbitMQ');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
    gtCatalogoPorTenant.delete(tenantId);
  }
}

async function testDashboardsMigrados() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const adminToken = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });
  const residenteToken = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });

  try {
    const dashboardObra = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard-obra`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.equal(dashboardObra.status, 200);
    const dashboardObraPayload = await dashboardObra.json();
    assert.equal(dashboardObraPayload.success, true);
    assert.ok('resumen' in dashboardObraPayload.data);

    const resumenDashboard = await fetch(`${baseUrl}/api/v1/control-proyectos/resumen-dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.equal(resumenDashboard.status, 200);

    const dashboardResidente = await fetch(`${baseUrl}/api/v1/control-proyectos/dashboard/residente`, { headers: { Authorization: `Bearer ${residenteToken}` } });
    assert.equal(dashboardResidente.status, 200);
    const residentePayload = await dashboardResidente.json();
    assert.ok('estimaciones_pendientes' in residentePayload.data);

    console.log('ok - dashboard-obra, resumen-dashboard, dashboard/residente responden bajo el nuevo prefijo');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

async function testCostoRealUsaColumnasReales() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const conceptoId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  // Verifica el fix del hallazgo 1.1: MaterialConsumidoObra ahora usa las
  // columnas REALES (movimiento_almacen_id, insumo_clave, insumo_nombre),
  // no las del modelo previo desincronizado.
  await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
    await tx.materialConsumidoObra.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        concepto_id: conceptoId,
        movimiento_almacen_id: randomUUID(),
        insumo_id: randomUUID(),
        insumo_clave: 'CEM-001',
        insumo_nombre: 'Cemento Portland',
        unidad: 'ton',
        cantidad: 10,
        costo_unitario: 250,
        costo_total: 2500,
        fecha: new Date('2026-03-10'),
      },
    });
  });

  try {
    const response = await fetch(`${baseUrl}/api/v1/control-proyectos/conceptos/${conceptoId}/costo-real`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.data.total_consumido_qty, 10);
    assert.equal(payload.data.total_consumido_monto, 2500);
    assert.equal(payload.data.materiales[0].insumo_clave, 'CEM-001');
    assert.equal(payload.data.materiales[0].insumo_nombre, 'Cemento Portland');

    console.log('ok - costo-real lee correctamente las columnas reales de materiales_consumidos_obra');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

async function testSalidaObraEventUsaColumnasReales() {
  const { handleSalidaObraEvent } = await import('../../src/main');
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const movimientoId = randomUUID();
  const insumoId = randomUUID();
  const conceptoId = randomUUID();

  try {
    await handleSalidaObraEvent({
      event_type: 'almacen.salida_obra',
      timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        movimiento_id: movimientoId,
        item_id: randomUUID(),
        insumo_id: insumoId,
        clave: 'VAR-3-8',
        descripcion: 'Varilla 3/8',
        unidad: 'pza',
        cantidad: 100,
        concepto_id: conceptoId,
        concepto_clave: 'ACE-001',
        frente_trabajo: 'Frente 1',
        responsable: userId,
        fecha: new Date().toISOString(),
      },
    });

    const created = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.materialConsumidoObra.findUnique({ where: { movimiento_almacen_id: movimientoId } })
    );
    assert.ok(created, 'El registro debe haberse creado sin error de columna inexistente');
    assert.equal(created!.insumo_clave, 'VAR-3-8');
    assert.equal(created!.insumo_nombre, 'Varilla 3/8');
    assert.equal(Number(created!.cantidad), 100);

    // Idempotencia por movimiento_almacen_id
    await handleSalidaObraEvent({
      event_type: 'almacen.salida_obra',
      timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        movimiento_id: movimientoId,
        item_id: randomUUID(),
        insumo_id: insumoId,
        clave: 'VAR-3-8',
        descripcion: 'Varilla 3/8',
        unidad: 'pza',
        cantidad: 999,
        concepto_id: conceptoId,
        concepto_clave: 'ACE-001',
        frente_trabajo: 'Frente 1',
        responsable: userId,
        fecha: new Date().toISOString(),
      },
    });
    const count = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) =>
      tx.materialConsumidoObra.count({ where: { movimiento_almacen_id: movimientoId } })
    );
    assert.equal(count, 1, 'debe ser idempotente por movimiento_almacen_id');

    console.log('ok - handleSalidaObraEvent escribe contra las columnas reales (bug de 1.1 corregido)');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

async function main() {
  await setup();

  try {
    await testBitacorasCrud();
    await testAvanceValidarRecalculaEVM();
    await testDashboardsMigrados();
    await testCostoRealUsaColumnasReales();
    await testSalidaObraEventUsaColumnasReales();
  } finally {
    await stopHttpApp(server);
    await stopHttpApp(gtServer);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - control-proyectos bitacoras/avances/EVM E2E');
  console.error(error);
  process.exitCode = 1;
});

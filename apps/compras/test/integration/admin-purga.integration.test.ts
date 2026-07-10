/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: POST /api/v1/compras/admin/purga
 * Spec:  openspec/changes/panel-purga-datos-prueba-compras/specs/
 * Tareas: 3.1–3.12 (+3.5b) del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (el EventBus falla silenciosamente en estos tests)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
// NOTA: main.ts NO se importa estáticamente para evitar que FINANZAS_URL
// quede congelado antes de que setup() lo sobreescriba con el stub.

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

let liberarFondosFalla = false;
const liberarFondosCalls: any[] = [];

async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());
  finanzasStub.post('/api/v1/finanzas/liberar-fondos', (req, res) => {
    liberarFondosCalls.push(req.body);
    if (liberarFondosFalla) {
      return void res.status(500).json({ success: false, error: { message: 'Finanzas simulado caído' } });
    }
    res.json({ success: true, data: {} });
  });

  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.anotacionEspecificacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.evaluacionEspecificacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaLinea.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.aclaracionComparativa.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaProveedorArchivo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.auditoriaDesbloqueoComparativa.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.especificacionDetalleReq.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.solicitudCotizacionProveedor.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.solicitudCotizacion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.calificacionProveedor.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.documentoProveedor.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

function ctx() {
  return { tenantId: randomUUID(), proyectoId: randomUUID() };
}

async function seedProveedor(tenantId: string) {
  return prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFC${Date.now()}${Math.floor(Math.random() * 999)}`, razon_social: 'Proveedor Purga', estatus: 'ACTIVO' },
  });
}

async function seedRequisicion(tenantId: string, proyectoId: string) {
  return prisma.requisicion.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, codigo: `REQ-PURGA-${Date.now()}-${Math.floor(Math.random() * 999)}`, solicitante_id: randomUUID(), estado: 'APROBADA' },
  });
}

async function seedOC(tenantId: string, proyectoId: string, proveedorId: string, opts: { requisicionId?: string; presupuestoId?: string } = {}) {
  return prisma.ordenCompra.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedorId,
      codigo: `OC-PURGA-${Date.now()}-${Math.floor(Math.random() * 999)}`, subtotal: '100.00', iva: '16.00', total: '116.00',
      requisicion_id: opts.requisicionId, presupuesto_id: opts.presupuestoId,
    },
  });
}

function tokenAdmin(tenantId: string, proyectoId: string) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['admin'] });
}

async function purgar(tenantId: string, proyectoId: string, body: Record<string, string[]>) {
  const token = tokenAdmin(tenantId, proyectoId);
  const response = await fetch(`${comprasBaseUrl}/api/v1/compras/admin/purga`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  return { status: response.status, json };
}

// ── 3.1: sin rol admin -> 403, nada borrado ─────────────────────────────────

async function testPurgaSinRolAdmin() {
  const { tenantId, proyectoId } = ctx();
  const req = await seedRequisicion(tenantId, proyectoId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });
    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/admin/purga`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requisiciones: [req.id_requisicion], ordenes_compra: [], proveedores: [] }),
    });
    assert.equal(response.status, 403);
    const still = await prisma.requisicion.findUnique({ where: { id_requisicion: req.id_requisicion } });
    assert.ok(still, 'la requisición no debe borrarse sin rol admin');
    console.log('ok - 3.1: purga sin rol admin responde 403 y no borra nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.2: lote vacío -> 400 ──────────────────────────────────────────────────

async function testPurgaLoteVacio() {
  const { tenantId, proyectoId } = ctx();
  const { status, json } = await purgar(tenantId, proyectoId, { requisiciones: [], ordenes_compra: [], proveedores: [] });
  assert.equal(status, 400);
  assert.equal(json.success, false);
  console.log('ok - 3.2: lote vacío responde 400');
}

// ── 3.3 / 3.4: Requisición con OC no incluida bloquea; incluida no bloquea ──

async function testPurgaRequisicionConOcNoIncluidaBloquea() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const req = await seedRequisicion(tenantId, proyectoId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor, { requisicionId: req.id_requisicion });
  try {
    const { status, json } = await purgar(tenantId, proyectoId, { requisiciones: [req.id_requisicion], ordenes_compra: [], proveedores: [] });
    assert.equal(status, 409);
    assert.equal(json.data.entidad, 'requisicion');

    const stillReq = await prisma.requisicion.findUnique({ where: { id_requisicion: req.id_requisicion } });
    const stillOc = await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } });
    assert.ok(stillReq, 'la requisición no debe borrarse');
    assert.ok(stillOc, 'la OC no debe borrarse');
    console.log('ok - 3.3: requisición con OC no incluida en el lote → 409, nada borrado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testPurgaRequisicionConOcIncluidaNoBloquea() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const req = await seedRequisicion(tenantId, proyectoId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor, { requisicionId: req.id_requisicion });
  try {
    const { status } = await purgar(tenantId, proyectoId, { requisiciones: [req.id_requisicion], ordenes_compra: [oc.id_orden], proveedores: [] });
    assert.equal(status, 200);

    const stillReq = await prisma.requisicion.findUnique({ where: { id_requisicion: req.id_requisicion } });
    const stillOc = await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } });
    assert.equal(stillReq, null);
    assert.equal(stillOc, null);
    console.log('ok - 3.4: requisición + su OC en el mismo lote → ambas desaparecen');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.5 / 3.5b: cuadro + solicitud + anotaciones se purgan automáticamente ──

async function testPurgaRequisicionArrastraCuadroYSolicitud() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const req = await seedRequisicion(tenantId, proyectoId);
  const item = await prisma.requisicionItem.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion, insumo_id: randomUUID(), cantidad: '10' },
  });
  const especificacion = await prisma.especificacionDetalleReq.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, detalle_id: item.id_item, descripcion: 'Espesor 5mm' },
  });
  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion,
      codigo: `CC-PURGA-${Date.now()}`, estado: 'BORRADOR',
      detalles: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: prov.id_proveedor, insumo_id: item.insumo_id!, precio_ofertado: '50.00' }] },
    },
  });
  await prisma.evaluacionEspecificacion.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, cuadro_id: cuadro.id_cuadro, especificacion_id: especificacion.id_especificacion, proveedor_id: prov.id_proveedor, creado_por: randomUUID() },
  });
  const solicitud = await prisma.solicitudCotizacion.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion, fecha_limite: new Date(), creado_por: randomUUID(),
      proveedores: { create: [{ tenant_id: tenantId, proveedor_id: prov.id_proveedor }] } },
  });
  // 3.5b: anotaciones huérfanas por cuadro_id y por especificacion_id
  const anotacionPorCuadro = await prisma.anotacionEspecificacion.create({
    data: { tenant_id: tenantId, cuadro_id: cuadro.id_cuadro, especificacion_id: especificacion.id_especificacion, proveedor_id: prov.id_proveedor, tipo: 'pregunta', texto: 'Duda X', creado_por: randomUUID() },
  });

  try {
    const { status } = await purgar(tenantId, proyectoId, { requisiciones: [req.id_requisicion], ordenes_compra: [], proveedores: [] });
    assert.equal(status, 200);

    assert.equal(await prisma.requisicion.findUnique({ where: { id_requisicion: req.id_requisicion } }), null);
    assert.equal(await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: cuadro.id_cuadro } }), null);
    assert.equal(await prisma.solicitudCotizacion.findUnique({ where: { id_solicitud: solicitud.id_solicitud } }), null);
    assert.equal(await prisma.especificacionDetalleReq.findUnique({ where: { id_especificacion: especificacion.id_especificacion } }), null);
    assert.equal(await prisma.anotacionEspecificacion.findUnique({ where: { id_anotacion: anotacionPorCuadro.id_anotacion } }), null);
    console.log('ok - 3.5/3.5b: requisición arrastra cuadro, solicitud, especificaciones y anotaciones sin dejar huérfanos');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.6 / 3.7: liberación de fondos best-effort ─────────────────────────────

async function testPurgaOcConPresupuestoLiberaFondos() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor, { presupuestoId: randomUUID() });
  liberarFondosFalla = false;
  liberarFondosCalls.length = 0;
  try {
    const { status, json } = await purgar(tenantId, proyectoId, { requisiciones: [], ordenes_compra: [oc.id_orden], proveedores: [] });
    assert.equal(status, 200);
    assert.equal(liberarFondosCalls.length, 1);
    assert.equal(liberarFondosCalls[0].oc_id, oc.id_orden);
    assert.equal(await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } }), null);
    assert.deepEqual(json.data.advertencias, []);
    console.log('ok - 3.6: OC con presupuesto libera fondos en Finanzas y se borra');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testPurgaOcConFinanzasCaidaSeBorraIgual() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor, { presupuestoId: randomUUID() });
  liberarFondosFalla = true;
  try {
    const { status, json } = await purgar(tenantId, proyectoId, { requisiciones: [], ordenes_compra: [oc.id_orden], proveedores: [] });
    assert.equal(status, 200);
    assert.equal(await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } }), null);
    assert.equal(json.data.advertencias.length, 1);
    console.log('ok - 3.7: falla la liberación de fondos → la OC se borra igual con advertencia');
  } finally {
    liberarFondosFalla = false;
    await cleanupTenant(tenantId);
  }
}

// ── 3.8: AlertaOcError se limpia con la OC ──────────────────────────────────

async function testPurgaOcLimpiaAlertas() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor);
  const alerta = await prisma.alertaOcError.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, oc_id: oc.id_orden, oc_codigo: oc.codigo, error_message: 'Error simulado' },
  });
  try {
    const { status } = await purgar(tenantId, proyectoId, { requisiciones: [], ordenes_compra: [oc.id_orden], proveedores: [] });
    assert.equal(status, 200);
    assert.equal(await prisma.alertaOcError.findUnique({ where: { id: alerta.id } }), null);
    console.log('ok - 3.8: AlertaOcError se borra junto con la OC');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.9 / 3.10: bloqueo y borrado de Proveedor ──────────────────────────────

async function testPurgaProveedorConOcNoIncluidaBloquea() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor);
  try {
    const { status, json } = await purgar(tenantId, proyectoId, { requisiciones: [], ordenes_compra: [], proveedores: [prov.id_proveedor] });
    assert.equal(status, 409);
    assert.equal(json.data.entidad, 'proveedor');
    assert.ok(await prisma.proveedor.findUnique({ where: { id_proveedor: prov.id_proveedor } }));
    assert.ok(await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } }));
    console.log('ok - 3.9: proveedor con OC vigente no incluida → 409, nada borrado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testPurgaProveedorConOcIncluidaSeBorra() {
  const { tenantId, proyectoId } = ctx();
  const prov = await seedProveedor(tenantId);
  const oc = await seedOC(tenantId, proyectoId, prov.id_proveedor);
  await prisma.calificacionProveedor.create({
    data: { tenant_id: tenantId, proveedor_id: prov.id_proveedor, proyecto_id: proyectoId, proyecto_nombre: 'Proyecto X', puntuacion: '4.5', calificado_por: randomUUID(), calificado_por_nombre: 'Admin' },
  });
  try {
    const { status } = await purgar(tenantId, proyectoId, { requisiciones: [], ordenes_compra: [oc.id_orden], proveedores: [prov.id_proveedor] });
    assert.equal(status, 200);
    assert.equal(await prisma.proveedor.findUnique({ where: { id_proveedor: prov.id_proveedor } }), null);
    console.log('ok - 3.10: proveedor cuya OC fue incluida en el mismo lote → se borra junto con sus calificaciones');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.11: bloqueo a mitad de un lote mixto revierte todo ───────────────────

async function testPurgaLoteMixtoRevierteTodo() {
  const { tenantId, proyectoId } = ctx();
  const reqValida = await seedRequisicion(tenantId, proyectoId);
  const provBloqueado = await seedProveedor(tenantId);
  await seedOC(tenantId, proyectoId, provBloqueado.id_proveedor); // no incluida → bloquea al proveedor
  try {
    const { status } = await purgar(tenantId, proyectoId, {
      requisiciones: [reqValida.id_requisicion], ordenes_compra: [], proveedores: [provBloqueado.id_proveedor],
    });
    assert.equal(status, 409);
    assert.ok(await prisma.requisicion.findUnique({ where: { id_requisicion: reqValida.id_requisicion } }), 'la requisición válida NO debe quedar borrada — el lote completo revierte');
    console.log('ok - 3.11: un bloqueo a mitad del lote revierte el lote completo');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testPurgaSinRolAdmin();                          // 3.1
    await testPurgaLoteVacio();                             // 3.2
    await testPurgaRequisicionConOcNoIncluidaBloquea();      // 3.3
    await testPurgaRequisicionConOcIncluidaNoBloquea();      // 3.4
    await testPurgaRequisicionArrastraCuadroYSolicitud();    // 3.5 / 3.5b
    await testPurgaOcConPresupuestoLiberaFondos();           // 3.6
    await testPurgaOcConFinanzasCaidaSeBorraIgual();         // 3.7
    await testPurgaOcLimpiaAlertas();                        // 3.8
    await testPurgaProveedorConOcNoIncluidaBloquea();        // 3.9
    await testPurgaProveedorConOcIncluidaSeBorra();          // 3.10
    await testPurgaLoteMixtoRevierteTodo();                  // 3.11
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - admin-purga integration tests');
  console.error(error);
  process.exitCode = 1;
});

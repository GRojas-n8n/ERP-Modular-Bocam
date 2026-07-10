/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Envío de Órdenes de Compra por correo a proveedores
 * Spec:  openspec/changes/envio-oc-correo-proveedores/specs/envio-oc-proveedor/spec.md
 * Tarea: 3.1–3.5 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env), con las migraciones
 *           del schema `compras` aplicadas (incluye 20260710150000_add_oc_envio_correo)
 * No requiere: RabbitMQ ni SMTP real — se stubean gerencia-tecnica (insumos),
 *              reportes (oc-pdf) y el transporte de nodemailer (jsonTransport).
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

// SMTP "configurado" con valores dummy — la llamada real a nodemailer se
// intercepta más abajo para que use jsonTransport en vez de SMTP real.
process.env.SMTP_HOST = 'smtp.test.local';
process.env.SMTP_USER = 'no-reply@test.local';
process.env.SMTP_PASS = 'dummy';
process.env.SMTP_FROM = 'no-reply@test.local';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let gtServer: Server | undefined;
let reportesServer: Server | undefined;
let comprasBaseUrl = '';

let sentEmails: any[] = [];
let ocPdfFallaCodigos = new Set<string>();

async function setup() {
  // Stub de gerencia-tecnica: catálogo de insumos usado para resolver
  // descripción/unidad al armar el PDF de cada OC.
  const gtStub = express();
  gtStub.get('/api/v1/gerencia-tecnica/insumos', (_req, res) => {
    res.json({
      success: true,
      data: [{ id: INSUMO_ID, clave: 'MAT-001', descripcion: 'Varilla 3/8', unidad_medida: 'PZA' }],
    });
  });
  const gtStarted = await startHttpApp(gtStub);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  // Stub de reportes: genera un PDF fake, o falla (500) para códigos de OC
  // marcados en ocPdfFallaCodigos (test 3.4).
  const reportesStub = express();
  reportesStub.use(express.json());
  reportesStub.post('/api/v1/reportes/oc-pdf', (req, res) => {
    const numero = req.body?.oc?.numero;
    if (ocPdfFallaCodigos.has(numero)) {
      return void res.status(500).json({ success: false, message: 'Fallo simulado de reportes' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(`%PDF-fake-${numero}`));
  });
  const reportesStarted = await startHttpApp(reportesStub);
  reportesServer = reportesStarted.server;
  process.env.REPORTES_SERVICE_URL = reportesStarted.baseUrl;

  // Interceptar nodemailer.createTransport para usar jsonTransport (sin red)
  // y registrar cada envío en sentEmails para las aserciones de los tests.
  const originalCreateTransport = nodemailer.createTransport.bind(nodemailer);
  (nodemailer as any).createTransport = (..._args: any[]) => {
    const real = originalCreateTransport({ jsonTransport: true } as any);
    const originalSendMail = real.sendMail.bind(real);
    real.sendMail = (async (opts: any) => {
      sentEmails.push(opts);
      return originalSendMail(opts);
    }) as any;
    return real;
  };

  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(gtServer);
  await stopHttpApp(reportesServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

const INSUMO_ID = randomUUID();

async function seedProveedor(tenantId: string, opts: { conEmail?: boolean } = {}) {
  return prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 9)}`,
      razon_social: `Proveedor Test ${Math.floor(Math.random() * 99999)}`,
      estatus: 'ACTIVO',
      email_contacto: opts.conEmail === false ? null : 'compras@proveedor-test.example',
    },
  });
}

async function seedOrdenCompra(tenantId: string, proyectoId: string, proveedorId: string, codigo: string) {
  return prisma.ordenCompra.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      proveedor_id: proveedorId,
      codigo,
      estado: 'EMITIDA',
      subtotal: '1000.00',
      iva: '160.00',
      total: '1160.00',
      items: {
        create: [{ tenant_id: tenantId, proyecto_id: proyectoId, insumo_id: INSUMO_ID, cantidad: '10.0000', precio_unitario: '100.0000', importe: '1000.00' }],
      },
    },
  });
}

// ── 3.1: un solo proveedor → 1 correo, enviada_proveedor_at actualizado ────

async function testUnSoloProveedor() {
  sentEmails = [];
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const proveedor = await seedProveedor(tenantId);
  const oc = await seedOrdenCompra(tenantId, proyectoId, proveedor.id_proveedor, `OC-3.1-${Date.now()}`);

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/ordenes-compra/enviar-correo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_orden: [oc.id_orden] }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    assert.equal(body.data.enviadas.length, 1);
    assert.equal(body.data.fallidas.length, 0);
    assert.equal(sentEmails.length, 1, 'debe enviarse exactamente 1 correo');
    assert.equal(sentEmails[0].to, proveedor.email_contacto);

    const ocActualizada = await prisma.ordenCompra.findUnique({ where: { id_orden: oc.id_orden } });
    assert.ok(ocActualizada?.enviada_proveedor_at, 'enviada_proveedor_at debe quedar seteado');
    assert.equal(ocActualizada?.enviada_proveedor_email, proveedor.email_contacto);

    console.log('ok - 3.1: una OC de un proveedor se envía por correo y queda marcada como enviada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.2: dos proveedores → 2 correos separados ──────────────────────────────

async function testDosProveedores() {
  sentEmails = [];
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const provA = await seedProveedor(tenantId);
  const provB = await seedProveedor(tenantId);
  const ocA = await seedOrdenCompra(tenantId, proyectoId, provA.id_proveedor, `OC-3.2-A-${Date.now()}`);
  const ocB = await seedOrdenCompra(tenantId, proyectoId, provB.id_proveedor, `OC-3.2-B-${Date.now()}`);

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/ordenes-compra/enviar-correo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_orden: [ocA.id_orden, ocB.id_orden] }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    assert.equal(body.data.enviadas.length, 2);
    assert.equal(sentEmails.length, 2, 'debe haber 2 correos, uno por proveedor');
    const destinatarios = sentEmails.map((m) => m.to).sort();
    assert.deepEqual(destinatarios, [provA.email_contacto, provB.email_contacto].sort());
    // Cada correo trae exactamente el PDF de su propia OC, no el de la otra
    sentEmails.forEach((m) => assert.equal(m.attachments.filter((a: any) => a.filename?.endsWith('.pdf')).length, 1));

    console.log('ok - 3.2: OCs de 2 proveedores distintos generan 2 correos separados');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.3: proveedor sin email_contacto → fallida, el resto del lote se envía ──

async function testProveedorSinCorreo() {
  sentEmails = [];
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const provConCorreo = await seedProveedor(tenantId, { conEmail: true });
  const provSinCorreo = await seedProveedor(tenantId, { conEmail: false });
  const ocOk = await seedOrdenCompra(tenantId, proyectoId, provConCorreo.id_proveedor, `OC-3.3-OK-${Date.now()}`);
  const ocSinCorreo = await seedOrdenCompra(tenantId, proyectoId, provSinCorreo.id_proveedor, `OC-3.3-NC-${Date.now()}`);

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/ordenes-compra/enviar-correo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_orden: [ocOk.id_orden, ocSinCorreo.id_orden] }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    assert.equal(body.data.enviadas.length, 1);
    assert.equal(body.data.enviadas[0].id_orden, ocOk.id_orden);
    assert.equal(body.data.fallidas.length, 1);
    assert.equal(body.data.fallidas[0].id_orden, ocSinCorreo.id_orden);
    assert.match(body.data.fallidas[0].motivo, /correo/i);

    console.log('ok - 3.3: proveedor sin correo se reporta como fallido sin bloquear el resto del lote');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 3.4: falla la generación del PDF de una OC → esa OC fallida, las demás OK ──

async function testFallaGeneracionPdf() {
  sentEmails = [];
  ocPdfFallaCodigos = new Set();
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const proveedor = await seedProveedor(tenantId);
  const codigoQueFalla = `OC-3.4-FALLA-${Date.now()}`;
  const codigoQueOk = `OC-3.4-OK-${Date.now()}`;
  const ocFalla = await seedOrdenCompra(tenantId, proyectoId, proveedor.id_proveedor, codigoQueFalla);
  const ocOk = await seedOrdenCompra(tenantId, proyectoId, proveedor.id_proveedor, codigoQueOk);
  ocPdfFallaCodigos.add(codigoQueFalla);

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['procurement'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/ordenes-compra/enviar-correo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_orden: [ocFalla.id_orden, ocOk.id_orden] }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    assert.equal(body.data.fallidas.length, 1);
    assert.equal(body.data.fallidas[0].id_orden, ocFalla.id_orden);
    assert.equal(body.data.enviadas.length, 1);
    assert.equal(body.data.enviadas[0].id_orden, ocOk.id_orden);
    // El correo SÍ se envía al proveedor, solo con el PDF que sí se generó
    assert.equal(sentEmails.length, 1);
    assert.equal(sentEmails[0].attachments.some((a: any) => a.filename === `${codigoQueOk}.pdf`), true);
    assert.equal(sentEmails[0].attachments.some((a: any) => a.filename === `${codigoQueFalla}.pdf`), false);

    console.log('ok - 3.4: falla de generación de PDF de una OC no bloquea el envío de las demás del mismo proveedor');
  } finally {
    ocPdfFallaCodigos = new Set();
    await cleanupTenant(tenantId);
  }
}

// ── 3.5: OC de otro proyecto no se incluye en el envío (aislamiento) ───────

async function testAislamientoPorProyecto() {
  sentEmails = [];
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const proveedor = await seedProveedor(tenantId);
  const ocProyectoA = await seedOrdenCompra(tenantId, proyectoA, proveedor.id_proveedor, `OC-3.5-A-${Date.now()}`);
  const ocProyectoB = await seedOrdenCompra(tenantId, proyectoB, proveedor.id_proveedor, `OC-3.5-B-${Date.now()}`);

  try {
    // Token con proyecto_id = proyectoA — la OC de proyectoB no debe ser
    // accesible ni enviada desde esta sesión.
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: proyectoA, roles: ['procurement'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/ordenes-compra/enviar-correo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_orden: [ocProyectoA.id_orden, ocProyectoB.id_orden] }),
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    const idsEnviados = body.data.enviadas.map((e: any) => e.id_orden);
    const idsFallidos = body.data.fallidas.map((e: any) => e.id_orden);

    assert.ok(idsEnviados.includes(ocProyectoA.id_orden), 'la OC del proyecto activo sí debe procesarse');
    assert.ok(!idsEnviados.includes(ocProyectoB.id_orden) && !idsFallidos.includes(ocProyectoB.id_orden), 'la OC de otro proyecto no debe aparecer ni como enviada ni como fallida — queda invisible por RLS');

    console.log('ok - 3.5: una OC de otro proyecto queda excluida del envío sin error 500');
  } finally {
    await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();

  try {
    await testUnSoloProveedor();          // 3.1
    await testDosProveedores();           // 3.2
    await testProveedorSinCorreo();       // 3.3
    await testFallaGeneracionPdf();       // 3.4
    await testAislamientoPorProyecto();   // 3.5
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - orden-compra-enviar-correo integration tests');
  console.error(error);
  process.exitCode = 1;
});

/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Persistencia del PDF de cotización en el cuadro comparativo
 * Spec:  openspec/changes/unificar-pdf-cotizacion-comparativa/specs/
 * Tareas: 3.1-3.4 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 *           Migración add_comparativa_proveedor_archivo aplicada
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

// ── Configuración ────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999'; // EventBus falla silenciosamente
process.env.COTIZACIONES_UPLOAD_DIR = path.join(os.tmpdir(), `cotizaciones-test-${Date.now()}`);

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({
  datasources: { db: { url: comprasDbUrl } },
});

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

// ── Helpers de Setup / Teardown ──────────────────────────────────────────────

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
  try { fs.rmSync(process.env.COTIZACIONES_UPLOAD_DIR!, { recursive: true, force: true }); } catch (_) {}
}

async function cleanupTenant(tenantId: string) {
  await prisma.comparativaProveedorArchivo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadro() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-PDF-${Date.now().toString().slice(-8)}`,
      razon_social: 'Proveedor PDF Test',
      estatus: 'ACTIVO',
    },
  });

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-PDF-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
    },
  });

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro, proveedorId: proveedor.id_proveedor };
}

function buildPdfFormData(filename = 'cotizacion.pdf'): FormData {
  const form = new FormData();
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
  form.append('archivo', new Blob([bytes], { type: 'application/pdf' }), filename);
  return form;
}

async function putPdf(cuadroId: string, provId: string, token: string, filename?: string) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}/proveedores/${provId}/cotizacion-pdf`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: buildPdfFormData(filename),
  });
}

async function putCotizaciones(cuadroId: string, token: string, proveedorNombre: string, insumoId: string, precio: number) {
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}/cotizaciones`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proveedores: [{ nombre: proveedorNombre, precios: [{ insumo_id: insumoId, precio }] }],
    }),
  });
}

// ── Test 3.1: subir y aplicar un PDF lo persiste en ComparativaProveedorArchivo ──

async function testSubirPdfLoPersiste() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r = await putPdf(seeded.cuadroId, seeded.proveedorId, token, 'cotizacion-proveedor-a.pdf');
    assert.equal(r.status, 200, 'PUT cotizacion-pdf debe retornar 200');
    const body = (await r.json()) as any;
    assert.equal(body.success, true);

    const archivo = await prisma.comparativaProveedorArchivo.findUnique({
      where: { cuadro_id_proveedor_id: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId } },
    });
    assert.ok(archivo, 'Debe existir una fila en ComparativaProveedorArchivo');
    assert.equal(archivo!.pdf_nombre, 'cotizacion-proveedor-a.pdf');
    assert.ok(archivo!.pdf_ruta && fs.existsSync(archivo!.pdf_ruta), 'El archivo debe existir en disco');
    assert.equal(archivo!.pdf_mime, 'application/pdf');

    console.log('ok - 3.1 subir PDF y aplicar cotización persiste pdf_nombre/pdf_ruta/pdf_mime');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 3.2: extraer sin aplicar NO persiste nada (documental — el endpoint de   ──
// extracción vive en apps/asistente y nunca llama a este endpoint; aquí verificamos
// que simplemente NO llamar al endpoint de aplicar no deja rastro en BD/disco) ────

async function testNoAplicarNoPersisteNada() {
  const seeded = await seedCuadro();
  try {
    const archivo = await prisma.comparativaProveedorArchivo.findUnique({
      where: { cuadro_id_proveedor_id: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId } },
    });
    assert.equal(archivo, null, 'Sin llamar al endpoint de aplicar, no debe existir ningún archivo persistido');

    console.log('ok - 3.2 no aplicar la cotización no persiste ningún archivo');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 3.3: reemplazar un PDF ya aplicado hace upsert (no duplica, borra el anterior) ──

async function testReemplazarPdfHaceUpsert() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const r1 = await putPdf(seeded.cuadroId, seeded.proveedorId, token, 'primera-version.pdf');
    assert.equal(r1.status, 200);
    const archivo1 = await prisma.comparativaProveedorArchivo.findUnique({
      where: { cuadro_id_proveedor_id: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId } },
    });
    const rutaAnterior = archivo1!.pdf_ruta;
    assert.ok(fs.existsSync(rutaAnterior));

    // Extensión distinta a propósito: la ruta en disco depende de la extensión
    // (`${provId}${ext}`), así que esto ejercita la limpieza del archivo anterior —
    // con la misma extensión, la segunda escritura simplemente sobrescribe la misma ruta.
    const r2 = await putPdf(seeded.cuadroId, seeded.proveedorId, token, 'segunda-version.jpg');
    assert.equal(r2.status, 200);

    const todos = await prisma.comparativaProveedorArchivo.findMany({
      where: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId },
    });
    assert.equal(todos.length, 1, 'No debe duplicar la fila — debe seguir habiendo exactamente 1');
    assert.equal(todos[0].pdf_nombre, 'segunda-version.jpg');
    assert.equal(fs.existsSync(rutaAnterior), false, 'El archivo anterior (.pdf) debe eliminarse de disco al reemplazar por uno con otra extensión (.jpg)');
    assert.ok(fs.existsSync(todos[0].pdf_ruta), 'El nuevo archivo (.jpg) debe existir en disco');

    console.log('ok - 3.3 reemplazar un PDF ya aplicado hace upsert (sin duplicar, borra el anterior)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 3.4: guardar cotizaciones (reemplazo completo de ComparativaDetalle) NO ──
// borra el archivo ya persistido — la razón de ser de la tabla separada ──────────

async function testGuardarCotizacionesNoBorraElArchivo() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });

    const rPdf = await putPdf(seeded.cuadroId, seeded.proveedorId, token, 'respaldo.pdf');
    assert.equal(rPdf.status, 200);

    const insumoId = randomUUID();
    const rCot = await putCotizaciones(seeded.cuadroId, token, 'Proveedor PDF Test', insumoId, 1234.5);
    assert.equal(rCot.status, 200, 'PUT cotizaciones debe retornar 200');

    // El PUT .../cotizaciones hace deleteMany + recreate de ComparativaDetalle —
    // verificar que ComparativaProveedorArchivo sobrevive intacto.
    const archivo = await prisma.comparativaProveedorArchivo.findUnique({
      where: { cuadro_id_proveedor_id: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId } },
    });
    assert.ok(archivo, 'El archivo debe seguir existiendo tras guardar cotizaciones');
    assert.equal(archivo!.pdf_nombre, 'respaldo.pdf');
    assert.ok(fs.existsSync(archivo!.pdf_ruta));

    console.log('ok - 3.4 guardar cotizaciones (reemplazo completo de ComparativaDetalle) no borra el PDF ya aplicado');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();

  try {
    await testSubirPdfLoPersiste();               // 3.1
    await testNoAplicarNoPersisteNada();           // 3.2
    await testReemplazarPdfHaceUpsert();           // 3.3
    await testGuardarCotizacionesNoBorraElArchivo(); // 3.4
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - comparativa-pdf-cotizacion integration tests');
  console.error(error);
  process.exitCode = 1;
});

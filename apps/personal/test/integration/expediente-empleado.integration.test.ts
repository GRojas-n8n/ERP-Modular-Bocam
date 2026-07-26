/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: expediente digital del empleado (documentos)
 * Spec:  openspec/changes/expediente-asignacion-periodicidad-personal/specs/expediente-empleado/
 * Tarea: 5.1, 5.4, 5.5, 7.1, 7.3 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const personalDbUrl =
  process.env.PERSONAL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';

const prisma = new PrismaClient({ datasources: { db: { url: personalDbUrl } } });

let personalServer: Server | undefined;
let personalBaseUrl = '';

async function setup() {
  const personalModule = await import('../../src/main');
  const started = await startHttpApp(personalModule.app);
  personalServer = started.server;
  personalBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(personalServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.documentoEmpleado.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Expediente',
      rfc: `TEX${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

function pdfFormData(tipo_documento: string, fecha_vigencia?: string, filename = 'ine.pdf', contentType = 'application/pdf') {
  const fd = new FormData();
  fd.append('tipo_documento', tipo_documento);
  if (fecha_vigencia) fd.append('fecha_vigencia', fecha_vigencia);
  fd.append('archivo', new Blob(['%PDF-1.4 contenido de prueba'], { type: contentType }), filename);
  return fd;
}

async function upload(pathUrl: string, token: string, fd: FormData) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd as any,
  });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function del(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

// ── Test: subir INE exitosamente ────────────────────────────────────────────

async function testSubirDocumentoExitoso() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('INE'));
    assert.equal(r.status, 201, 'personal_rh debe poder subir un documento válido');
    const body = (await r.json()) as any;
    assert.equal(body.data.tipo_documento, 'INE');
    assert.ok(body.data.ruta_archivo, 'debe guardar la ruta del archivo');

    console.log('ok - RH sube documento INE al expediente del empleado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testTipoDocumentoInvalido() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('PASAPORTE'));
    assert.equal(r.status, 400, 'tipo_documento inválido debe rechazarse con 400');
    console.log('ok - tipo_documento inválido (PASAPORTE) rechazado con 400');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testExtensionNoPermitida() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('INE', undefined, 'virus.exe', 'application/octet-stream'));
    assert.equal(r.status, 400, 'extensión .exe debe rechazarse con 400');
    console.log('ok - extensión de archivo no permitida (.exe) rechazada con 400');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testRolSinPermisoNoSube() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenResidente = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenResidente, pdfFormData('INE'));
    assert.equal(r.status, 403, 'rol sin personal_rh/admin debe recibir 403 al subir documento');
    console.log('ok - rol sin permiso (residente) recibe 403 al subir documento');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: listar, descargar y eliminar ──────────────────────────────────────

async function testListarDescargarEliminar() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const rUpload = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('CURSO_CAPACITACION', '2027-01-15'));
    const uploaded = (await rUpload.json()) as any;
    const documentoId = uploaded.data.id_documento;

    const rList = await get(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh);
    assert.equal(rList.status, 200);
    const list = (await rList.json()) as any;
    assert.equal(list.data.length, 1, 'debe listar el documento recién subido');
    assert.equal(list.data[0].fecha_vigencia?.slice(0, 10), '2027-01-15', 'debe guardar la fecha_vigencia');

    const rDownload = await get(`/api/v1/personal/empleados/${emp.id_empleado}/documentos/${documentoId}/archivo`, tokenRh);
    assert.equal(rDownload.status, 200, 'debe poder descargar el archivo subido');

    const rDelete = await del(`/api/v1/personal/empleados/${emp.id_empleado}/documentos/${documentoId}`, tokenRh);
    assert.equal(rDelete.status, 204, 'debe poder eliminar el documento');

    const rListDespues = await get(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh);
    const listDespues = (await rListDespues.json()) as any;
    assert.equal(listDespues.data.length, 0, 'el documento eliminado no debe seguir apareciendo');

    console.log('ok - expediente: listar, descargar y eliminar documento');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: panel de documentos por vencer ────────────────────────────────────

async function testDocumentosPorVencer() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const en10Dias = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const hace5Dias = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const en90Dias = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('CURSO_CAPACITACION', en10Dias, 'porvencer.pdf'));
    await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('CURSO_CAPACITACION', hace5Dias, 'vencido.pdf'));
    await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('CURSO_CAPACITACION', en90Dias, 'lejano.pdf'));
    await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, tokenRh, pdfFormData('INE')); // sin vigencia

    const r = await get('/api/v1/personal/documentos/por-vencer?dias=30', tokenRh);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    const nombres = body.data.map((d: any) => d.estado);
    assert.equal(body.data.length, 2, 'solo debe incluir vencido + por vencer dentro de 30 días, no el lejano ni el sin vigencia');
    assert.ok(nombres.includes('VENCIDO'));
    assert.ok(nombres.includes('POR_VENCER'));

    const rDashboard = await get('/api/v1/personal/dashboard', tokenRh);
    const dashboard = (await rDashboard.json()) as any;
    const alerta = dashboard.data.alertas.find((a: any) => a.tipo === 'DOCUMENTO_POR_VENCER');
    assert.ok(alerta, 'el dashboard debe incluir la alerta agregada DOCUMENTO_POR_VENCER');
    assert.equal(alerta.severidad, 'critica', 'con al menos un vencido, la severidad debe ser critica');

    console.log('ok - panel documentos/por-vencer y alerta agregada en dashboard');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testSubirDocumentoExitoso();
    await testTipoDocumentoInvalido();
    await testExtensionNoPermitida();
    await testRolSinPermisoNoSube();
    await testListarDescargarEliminar();
    await testDocumentosPorVencer();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - expediente-empleado integration tests');
  console.error(error);
  process.exitCode = 1;
});

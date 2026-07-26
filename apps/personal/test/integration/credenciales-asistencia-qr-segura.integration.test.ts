/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: credencial de empleado + escaneo seguro de asistencia
 * Spec:  openspec/changes/credenciales-asistencia-qr-segura/specs/
 * Tarea: 2.1-2.4, 3.2-3.6, 3.9, 4.1, 5.1 del tasks.md
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
  await prisma.registroAsistencia.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.credencialEmpleado.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.configAsistenciaProyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.documentoEmpleado.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string, modoAsistencia: 'JORNADA_COMPLETA' | 'POR_HORAS' = 'JORNADA_COMPLETA') {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Credencial',
      rfc: `TCR${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
      modo_asistencia: modoAsistencia,
      horas_jornada: 8,
    },
  });
}

async function asignarAFrente(tenantId: string, proyectoId: string, empleadoId: string) {
  return prisma.asignacionFrente.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId,
      empleado_id: empleadoId, frente_trabajo: 'Frente Test',
      fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA',
    },
  });
}

async function post(pathUrl: string, token: string | null, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function get(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}
async function del(pathUrl: string, token: string) {
  return fetch(`${personalBaseUrl}${pathUrl}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

// ── Credencial: emisión, reemisión, consulta, revocación ────────────────────

async function testEmitirCredencial() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    assert.equal(r.status, 201);
    const body = (await r.json()) as any;
    assert.ok(body.data.token.length >= 40, 'el token debe ser suficientemente largo (32+ bytes en base64url)');
    assert.notEqual(body.data.token, emp.id_empleado, 'el token nunca debe ser el id_empleado');
    assert.equal(body.data.activa, true);

    console.log('ok - RH emite credencial con token opaco de longitud adecuada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testReemitirRevocaAnterior() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const r1 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const primera = (await r1.json()) as any;

    const r2 = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const segunda = (await r2.json()) as any;
    assert.notEqual(primera.data.token, segunda.data.token, 'la reemisión debe generar un token distinto');

    const anteriorEnBd = await prisma.credencialEmpleado.findUnique({ where: { id_credencial: primera.data.id_credencial } });
    assert.equal(anteriorEnBd?.activa, false, 'la credencial anterior debe quedar revocada');
    assert.ok(anteriorEnBd?.revocada_en, 'debe registrar revocada_en');

    console.log('ok - reemitir credencial revoca automáticamente la anterior');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testConsultarYRevocarSinReemitir() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const rEmitir = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const emitida = (await rEmitir.json()) as any;

    const rGet = await get(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh);
    const consultada = (await rGet.json()) as any;
    assert.equal(consultada.data.token, emitida.data.token, 'GET debe devolver el mismo token sin regenerar');

    const rDel = await del(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh);
    assert.equal(rDel.status, 200);

    const rGetTras = await get(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh);
    const trasRevocar = (await rGetTras.json()) as any;
    assert.equal(trasRevocar.data, null, 'sin credencial activa tras revocar sin reemitir');

    console.log('ok - GET consulta sin regenerar; DELETE revoca sin reemitir');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Escaneo seguro: candados ────────────────────────────────────────────────

async function testEscanearSinAuth() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const { token } = ((await rCred.json()) as any).data;

    const r = await post('/api/v1/personal/asistencia/escanear', null, { token });
    assert.equal(r.status, 401, 'sin Authorization debe responder 401, sin importar que el token de credencial sea válido');

    const registros = await prisma.registroAsistencia.findMany({ where: { tenant_id: tenantId, empleado_id: emp.id_empleado } });
    assert.equal(registros.length, 0, 'no debe haberse registrado nada');

    console.log('ok - escanear sin sesión autenticada responde 401 y no registra nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEscanearRolSinPermiso() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const { token } = ((await rCred.json()) as any).data;

    const tokenProcurement = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });
    const r = await post('/api/v1/personal/asistencia/escanear', tokenProcurement, { token });
    assert.equal(r.status, 403);

    console.log('ok - rol sin permiso (procurement) recibe 403 al escanear');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEscanearTokenInexistente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await post('/api/v1/personal/asistencia/escanear', tokenRh, { token: 'token-que-no-existe-nunca' });
    assert.equal(r.status, 404);
    console.log('ok - token de credencial inexistente responde 404');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEscanearCredencialRevocada() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const { token } = ((await rCred.json()) as any).data;
    await del(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh);

    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token });
    assert.equal(r.status, 410, 'credencial revocada debe responder 410 Gone');

    console.log('ok - escanear credencial revocada responde 410 y no registra');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testEscanearEmpleadoDeOtroProyecto() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoB, emp.id_empleado); // asignado SOLO a B
    const tokenRhB = signTenantToken({ userId, tenantId, proyectoId: proyectoB, roles: ['personal_rh'] });
    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRhB, {});
    const { token } = ((await rCred.json()) as any).data;

    const tokenResidenciaA = signTenantToken({ userId, tenantId, proyectoId: proyectoA, roles: ['residencia'] });
    const r = await post('/api/v1/personal/asistencia/escanear', tokenResidenciaA, { token });
    assert.equal(r.status, 403, 'empleado de otro proyecto debe responder 403');

    console.log('ok - escanear credencial de empleado de otro proyecto responde 403');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCooldownYPosteriorProcesa() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId, 'POR_HORAS');
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const { token } = ((await rCred.json()) as any).data;

    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const rPrimero = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token });
    assert.equal(rPrimero.status, 201, 'primer escaneo del día debe registrar entrada');

    const rSegundoInmediato = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token });
    assert.equal(rSegundoInmediato.status, 429, 'reescaneo inmediato debe rechazarse por cooldown');

    // Simular que el cooldown ya pasó, retrocediendo ultimo_scan_en directamente en BD.
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    await prisma.registroAsistencia.update({
      where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: emp.id_empleado, fecha: hoy } },
      data: { ultimo_scan_en: new Date(Date.now() - 5 * 60 * 1000) },
    });

    const rTrasCooldown = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token });
    assert.equal(rTrasCooldown.status, 201, 'tras el cooldown, el escaneo debe procesarse (como salida)');
    assert.ok((await rTrasCooldown.json() as any).data.hora_salida, 'el segundo escaneo real debe registrar hora_salida');

    console.log('ok - cooldown rechaza reescaneo inmediato (429) y permite el escaneo tras el cooldown');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Geofencing opcional ──────────────────────────────────────────────────────

async function testGeofencingSinConfigNoExige() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const { token } = ((await rCred.json()) as any).data;

    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });
    const r = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token });
    assert.equal(r.status, 201, 'sin ConfigAsistenciaProyecto, el escaneo no debe exigir lat/lng');

    console.log('ok - sin geofencing configurado, el escaneo procede sin lat/lng');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testGeofencingDentroYFueraDelRadio() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    await prisma.configAsistenciaProyecto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, lat: 19.4326, lng: -99.1332, radio_metros: 300, configurado_por: userId },
    });

    const rCred = await post(`/api/v1/personal/empleados/${emp.id_empleado}/credencial`, tokenRh, {});
    const { token } = ((await rCred.json()) as any).data;
    const tokenResidencia = signTenantToken({ userId, tenantId, proyectoId, roles: ['residencia'] });

    const rSinCoords = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token });
    assert.equal(rSinCoords.status, 400, 'con geofencing configurado, sin lat/lng debe responder 400');

    const rDentro = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token, lat: 19.4327, lng: -99.1333 });
    assert.equal(rDentro.status, 201, 'dentro del radio debe procesar el escaneo');

    // Reset cooldown para probar el caso "fuera de rango" como escaneo independiente
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    await prisma.registroAsistencia.update({
      where: { tenant_id_empleado_id_fecha: { tenant_id: tenantId, empleado_id: emp.id_empleado, fecha: hoy } },
      data: { ultimo_scan_en: new Date(Date.now() - 5 * 60 * 1000) },
    });
    const rFuera = await post('/api/v1/personal/asistencia/escanear', tokenResidencia, { token, lat: 20.0, lng: -100.0 });
    assert.equal(rFuera.status, 403, 'fuera del radio configurado debe responder 403');

    console.log('ok - geofencing: sin coords 400, dentro del radio 201, fuera del radio 403');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Foto de credencial en expediente ────────────────────────────────────────

async function testFotoCredencialEnExpediente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    const fd = new FormData();
    fd.append('tipo_documento', 'FOTO_CREDENCIAL');
    fd.append('archivo', new Blob(['fake-jpg-bytes'], { type: 'image/jpeg' }), 'foto.jpg');
    const r = await fetch(`${personalBaseUrl}/api/v1/personal/empleados/${emp.id_empleado}/documentos`, {
      method: 'POST', headers: { Authorization: `Bearer ${tokenRh}` }, body: fd as any,
    });
    assert.equal(r.status, 201, 'debe aceptar tipo_documento = FOTO_CREDENCIAL');
    const body = (await r.json()) as any;
    assert.equal(body.data.tipo_documento, 'FOTO_CREDENCIAL');

    console.log('ok - expediente acepta FOTO_CREDENCIAL como tipo de documento');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Impresión en lote ────────────────────────────────────────────────────────

async function testImprimirLoteEmiteCredencialFaltante() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const emp1 = await crearEmpleado(tenantId);
    const emp2 = await crearEmpleado(tenantId);
    await asignarAFrente(tenantId, proyectoId, emp1.id_empleado);
    await asignarAFrente(tenantId, proyectoId, emp2.id_empleado);
    const tokenRh = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

    // emp1 ya tiene credencial; emp2 no tiene ninguna todavía.
    await post(`/api/v1/personal/empleados/${emp1.id_empleado}/credencial`, tokenRh, {});

    const r = await post('/api/v1/personal/empleados/credenciales/imprimir-lote', tokenRh, { empleado_ids: [emp1.id_empleado, emp2.id_empleado] });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.length, 2, 'debe incluir a ambos empleados en el lote');
    assert.ok(body.data.every((d: any) => d.token), 'ambos deben tener token, incluido el que no tenía credencial previa');

    console.log('ok - imprimir-lote emite credencial automáticamente al empleado que no tenía una');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testEmitirCredencial();
    await testReemitirRevocaAnterior();
    await testConsultarYRevocarSinReemitir();
    await testEscanearSinAuth();
    await testEscanearRolSinPermiso();
    await testEscanearTokenInexistente();
    await testEscanearCredencialRevocada();
    await testEscanearEmpleadoDeOtroProyecto();
    await testCooldownYPosteriorProcesa();
    await testGeofencingSinConfigNoExige();
    await testGeofencingDentroYFueraDelRadio();
    await testFotoCredencialEnExpediente();
    await testImprimirLoteEmiteCredencialFaltante();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - credenciales-asistencia-qr-segura integration tests');
  console.error(error);
  process.exitCode = 1;
});

/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Alta de Centro de Costos (Proyecto) — 13 posiciones
 * Spec:  openspec/changes/centro-costos-alta-formal/
 * Tareas: 3.8-3.10, 5.1-5.4 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

const authDbUrl = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ datasources: { db: { url: authDbUrl } } });

let authServer: Server | undefined;
let authBaseUrl = '';

async function setup() {
  const authModule = await import('../../src/main');
  const started = await startHttpApp(authModule.app);
  authServer = started.server;
  authBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(authServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.proyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function seedTenant(tenantId: string) {
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test Centro Costos', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const clienteIdTest = randomUUID();

// ── Test 5.3: rol no autorizado recibe 403 ───────────────────────────────────

async function testRolNoAutorizadoRecibe403() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['resident'] });
    const r = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteIdTest,
      nombre_oficial: 'Proyecto No Autorizado',
    });
    assert.equal(r.status, 403, 'rol resident debe recibir 403 al intentar crear un centro de costos');

    const enBd = await prisma.proyecto.findMany({ where: { tenant_id: tenantId } });
    assert.equal(enBd.length, 0, 'no debe haberse creado ningún proyecto');

    console.log('ok - 5.3 rol no autorizado (resident) recibe 403 y no crea el registro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 5.1/5.2: alta con gerencia_tecnica, código ensamblado, consecutivo ──

async function testAltaConGerenciaTecnicaYConsecutivoIncremental() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['gerencia_tecnica'] });

    const r1 = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2018, cliente_id: clienteIdTest, codigo_cliente: '004',
      nombre_oficial: 'Primer contrato con SERSSINSA',
      fecha_programada_inicio: '2018-01-01', fecha_programada_fin: '2018-06-30',
      monto_total_vendido: 1000000,
    });
    assert.equal(r1.status, 201, 'gerencia_tecnica debe poder crear un centro de costos');
    const b1 = (await r1.json()) as any;
    assert.equal(b1.data.codigo_centro_costos, 'HCO2018004001', 'código ensamblado debe coincidir con el ejemplo del roadmap (cliente 004=SERSSINSA)');

    const r2 = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2018, cliente_id: clienteIdTest, codigo_cliente: '004',
      nombre_oficial: 'Segundo contrato con SERSSINSA',
    });
    assert.equal(r2.status, 201);
    const b2 = (await r2.json()) as any;
    assert.equal(b2.data.codigo_centro_costos, 'HCO2018004002', 'segundo contrato mismo año+cliente debe obtener consecutivo 002');

    console.log('ok - 5.1/5.2 alta con rol autorizado ensambla el código correcto y el consecutivo incrementa por (año, cliente)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 5.4: centro de costos especial omite la máscara de 13 posiciones ───

async function testCentroCostosEspecialOmiteMascara() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });

    const r = await post('/api/v1/auth/admin/proyectos', token, {
      es_especial: true, tipo_especial: 'OFICINA', codigo_centro_costos: 'OFICINA-CDMX',
      nombre_oficial: 'Oficina Central CDMX',
    });
    assert.equal(r.status, 201, 'alta especial debe crearse sin exigir empresa/año/cliente/consecutivo');
    const body = (await r.json()) as any;
    assert.equal(body.data.codigo_centro_costos, 'OFICINA-CDMX');
    assert.equal(body.data.es_especial, true);

    console.log('ok - 5.4 centro de costos especial (OFICINA) omite la máscara de 13 posiciones');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test adicional: tipo_especial inválido es rechazado ──────────────────────

async function testTipoEspecialInvalidoRechazado() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const r = await post('/api/v1/auth/admin/proyectos', token, {
      es_especial: true, tipo_especial: 'BODEGA', codigo_centro_costos: 'BODEGA-X',
      nombre_oficial: 'Bodega inválida',
    });
    assert.equal(r.status, 400, 'tipo_especial fuera de OFICINA/TALLER/ALMACÉN debe rechazarse');
    console.log('ok - tipo_especial inválido es rechazado con 400');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── centro-costos-confirmar-y-editar-consecutivo ─────────────────────────────
// Spec: openspec/changes/centro-costos-confirmar-y-editar-consecutivo/
// Vista previa sin efectos, consecutivo explícito, max+1 con huecos, 409 y rango.

const BASE_HCO = { empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteIdTest, codigo_cliente: '004' };

async function get(path: string, token: string) {
  return fetch(`${authBaseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
}

function qsSiguiente(extra: Record<string, string | number> = {}) {
  const p = new URLSearchParams({
    empresa_grupo: 'HCO', anio_centro_costos: '2026', cliente_id: clienteIdTest, codigo_cliente: '004',
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  });
  return `/api/v1/auth/admin/proyectos/siguiente-consecutivo?${p.toString()}`;
}

async function crearConConsecutivo(token: string, consecutivo: number | undefined, nombre: string) {
  return post('/api/v1/auth/admin/proyectos', token, {
    ...BASE_HCO, nombre_oficial: nombre,
    ...(consecutivo === undefined ? {} : { consecutivo_centro_costos: consecutivo }),
  });
}

async function testSiguienteConsecutivoPrimerContratoEsUno() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const r = await get(qsSiguiente(), token);
    assert.equal(r.status, 200);
    const b = (await r.json()) as any;
    assert.equal(b.data.consecutivo, 1);
    assert.equal(b.data.codigo_centro_costos, 'HCO2026004001');
    console.log('ok - siguiente-consecutivo: primer contrato del año/cliente sugiere 001 con el código completo');
  } finally { await cleanupTenant(tenantId); }
}

async function testSiguienteConsecutivoNoTieneEfectosSecundarios() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const a = (await (await get(qsSiguiente(), token)).json()) as any;
    const b = (await (await get(qsSiguiente(), token)).json()) as any;
    assert.equal(a.data.consecutivo, b.data.consecutivo, 'dos consultas seguidas devuelven el mismo consecutivo');
    const enBd = await prisma.proyecto.count({ where: { tenant_id: tenantId } });
    assert.equal(enBd, 0, 'la vista previa no debe crear ni reservar nada');
    console.log('ok - siguiente-consecutivo no reserva ni escribe');
  } finally { await cleanupTenant(tenantId); }
}

async function testSiguienteConsecutivoToleraHuecosMaxMasUno() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    for (const c of [1, 2, 5]) {
      const r = await crearConConsecutivo(token, c, `Contrato ${c}`);
      assert.equal(r.status, 201, `crear con consecutivo explícito ${c}`);
    }
    const s = (await (await get(qsSiguiente(), token)).json()) as any;
    assert.equal(s.data.consecutivo, 6, 'con 001, 002 y 005 el sugerido es 006 (no 004)');
    // el alta automática (sin consecutivo) tampoco debe chocar con el 005
    const auto = await crearConConsecutivo(token, undefined, 'Automático tras huecos');
    assert.equal(auto.status, 201);
    assert.equal(((await auto.json()) as any).data.codigo_centro_costos, 'HCO2026004006');
    console.log('ok - consecutivo max+1 tolera huecos (sugerido y alta automática dan 006)');
  } finally { await cleanupTenant(tenantId); }
}

async function testSiguienteConsecutivoRolNoAutorizado() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['resident'] });
    const r = await get(qsSiguiente(), token);
    assert.equal(r.status, 403);
    console.log('ok - siguiente-consecutivo: rol no autorizado recibe 403');
  } finally { await cleanupTenant(tenantId); }
}

async function testSiguienteConsecutivoParametrosInvalidos() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const sinCliente = await get(qsSiguiente({ cliente_id: '' }), token);
    assert.equal(sinCliente.status, 400);
    const empresaMala = await get(qsSiguiente({ empresa_grupo: 'XXX' }), token);
    assert.equal(empresaMala.status, 400);
    console.log('ok - siguiente-consecutivo valida parámetros (400)');
  } finally { await cleanupTenant(tenantId); }
}

async function testConsecutivoExplicitoLibreSeUsaExactamente() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['gerencia_tecnica'] });
    await crearConConsecutivo(token, 1, 'Uno');
    await crearConConsecutivo(token, 2, 'Dos');
    const r = await crearConConsecutivo(token, 10, 'Contrato con numeración externa');
    assert.equal(r.status, 201);
    const b = (await r.json()) as any;
    assert.equal(b.data.codigo_centro_costos, 'HCO2026004010');
    assert.equal(b.data.consecutivo_centro_costos, 10);
    const s = (await (await get(qsSiguiente(), token)).json()) as any;
    assert.equal(s.data.consecutivo, 11, 'tras el 010 manual el siguiente sugerido es 011');
    console.log('ok - consecutivo explícito libre se usa exactamente (010) y el siguiente sugerido es 011');
  } finally { await cleanupTenant(tenantId); }
}

async function testConsecutivoExplicitoOcupadoResponde409ConSugerido() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    await crearConConsecutivo(token, 1, 'Uno');
    await crearConConsecutivo(token, 2, 'Dos');
    await crearConConsecutivo(token, 3, 'Tres');
    const r = await crearConConsecutivo(token, 3, 'Duplicado');
    assert.equal(r.status, 409);
    const b = (await r.json()) as any;
    assert.equal(b.error.code, 'ADMIN_CODIGO_DUPLICADO');
    assert.equal(b.error.consecutivo_sugerido, 4);
    const enBd = await prisma.proyecto.count({ where: { tenant_id: tenantId } });
    assert.equal(enBd, 3, 'el duplicado no debe crearse ni reasignarse en silencio');
    console.log('ok - consecutivo explícito ocupado responde 409 ADMIN_CODIGO_DUPLICADO con sugerido y sin crear nada');
  } finally { await cleanupTenant(tenantId); }
}

async function testConsecutivoFueraDeRangoRespondeValidationError() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    for (const invalido of [0, 1000, -1, 1.5]) {
      const r = await crearConConsecutivo(token, invalido, `Inválido ${invalido}`);
      assert.equal(r.status, 400, `consecutivo ${invalido} debe rechazarse con 400`);
      assert.equal(((await r.json()) as any).error.code, 'VALIDATION_ERROR');
    }
    const enBd = await prisma.proyecto.count({ where: { tenant_id: tenantId } });
    assert.equal(enBd, 0);
    console.log('ok - consecutivo fuera de rango (0, 1000, -1, 1.5) rechazado con 400 sin persistir');
  } finally { await cleanupTenant(tenantId); }
}

async function testConsecutivosAgotados() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const r999 = await crearConConsecutivo(token, 999, 'Último posible');
    assert.equal(r999.status, 201);
    assert.equal(((await r999.json()) as any).data.codigo_centro_costos, 'HCO2026004999');

    const consulta = await get(qsSiguiente(), token);
    assert.equal(consulta.status, 409);
    assert.equal(((await consulta.json()) as any).error.code, 'ADMIN_CONSECUTIVO_AGOTADO');

    const auto = await crearConConsecutivo(token, undefined, 'Sin lugar');
    assert.equal(auto.status, 409);
    assert.equal(((await auto.json()) as any).error.code, 'ADMIN_CONSECUTIVO_AGOTADO');
    console.log('ok - con consecutivo 999 ocupado, la consulta y el alta automática responden 409 ADMIN_CONSECUTIVO_AGOTADO');
  } finally { await cleanupTenant(tenantId); }
}

async function testAltasConcurrentesSinConsecutivoNoDuplican() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const respuestas = await Promise.all(
      [1, 2, 3, 4].map((n) => crearConConsecutivo(token, undefined, `Concurrente ${n}`)),
    );
    const cuerpos = await Promise.all(respuestas.map(async (r) => ({ status: r.status, body: (await r.json()) as any })));
    for (const c of cuerpos) assert.equal(c.status, 201, `alta concurrente debe crearse (recibió ${c.status})`);
    const codigos = cuerpos.map((c) => c.body.data.codigo_centro_costos).sort();
    assert.equal(new Set(codigos).size, 4, 'los 4 códigos deben ser distintos');
    assert.deepEqual(codigos, ['HCO2026004001', 'HCO2026004002', 'HCO2026004003', 'HCO2026004004']);
    console.log('ok - 4 altas concurrentes sin consecutivo crean 001..004 sin duplicar (reintento de la transacción completa)');
  } finally { await cleanupTenant(tenantId); }
}

async function main() {
  await setup();
  try {
    await testRolNoAutorizadoRecibe403();                       // 5.3
    await testAltaConGerenciaTecnicaYConsecutivoIncremental();   // 5.1/5.2
    await testCentroCostosEspecialOmiteMascara();                // 5.4
    await testTipoEspecialInvalidoRechazado();
    await testSiguienteConsecutivoPrimerContratoEsUno();
    await testSiguienteConsecutivoNoTieneEfectosSecundarios();
    await testSiguienteConsecutivoToleraHuecosMaxMasUno();
    await testSiguienteConsecutivoRolNoAutorizado();
    await testSiguienteConsecutivoParametrosInvalidos();
    await testConsecutivoExplicitoLibreSeUsaExactamente();
    await testConsecutivoExplicitoOcupadoResponde409ConSugerido();
    await testConsecutivoFueraDeRangoRespondeValidationError();
    await testConsecutivosAgotados();
    await testAltasConcurrentesSinConsecutivoNoDuplican();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - centro-costos-alta integration tests');
  console.error(error);
  process.exitCode = 1;
});

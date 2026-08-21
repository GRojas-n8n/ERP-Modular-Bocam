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
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['residencia'] });
    const r = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteIdTest,
      nombre_oficial: 'Proyecto No Autorizado',
    });
    assert.equal(r.status, 403, 'rol residencia debe recibir 403 al intentar crear un centro de costos');

    const enBd = await prisma.proyecto.findMany({ where: { tenant_id: tenantId } });
    assert.equal(enBd.length, 0, 'no debe haberse creado ningún proyecto');

    console.log('ok - 5.3 rol no autorizado (residencia) recibe 403 y no crea el registro');
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

async function main() {
  await setup();
  try {
    await testRolNoAutorizadoRecibe403();                       // 5.3
    await testAltaConGerenciaTecnicaYConsecutivoIncremental();   // 5.1/5.2
    await testCentroCostosEspecialOmiteMascara();                // 5.4
    await testTipoEspecialInvalidoRechazado();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - centro-costos-alta integration tests');
  console.error(error);
  process.exitCode = 1;
});

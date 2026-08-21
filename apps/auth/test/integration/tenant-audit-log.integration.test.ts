/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: bitácora de auditoría de tenant (auditoria-acciones-tenant)
 * Spec:  openspec/changes/auditoria-acciones-tenant/
 * Tareas: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * No requiere RabbitMQ real: se llama `persistTenantAuditEvent` directamente
 * (el mismo handler que EventBus.subscribe invoca por cada mensaje) para no
 * depender de la latencia/timing de un consumo real de cola.
 *
 * Nota sobre RLS: el rol de Postgres usado en local (`postgres`, superusuario
 * de docker-compose.yml) tiene BYPASSRLS, así que estos tests no pueden
 * probar la política a nivel de motor — eso se verifica por separado contra
 * el rol de runtime real (`bocam_app`, sin BYPASSRLS) en staging/producción
 * (tarea 6.3). Lo que sí prueban aquí es el aislamiento a nivel de
 * aplicación: `createTenantContext` + el filtro explícito `tenant_id` del
 * endpoint, que es una segunda capa independiente de la política RLS.
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
let authModule: typeof import('../../src/main');

async function setup() {
  authModule = await import('../../src/main');
  const started = await startHttpApp(authModule.app);
  authServer = started.server;
  authBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(authServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.tenantAuditLog.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function seedTenant(tenantId: string, nombre: string) {
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre, rfc: `RFC${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 1000)}` },
  });
}

function fakeEvent(overrides: {
  event_type: string;
  tenant_id: string;
  proyecto_id?: string;
  user_id?: string;
  payload?: unknown;
}) {
  return {
    event_type: overrides.event_type,
    context: {
      tenant_id: overrides.tenant_id,
      proyecto_id: overrides.proyecto_id ?? randomUUID(),
      user_id: overrides.user_id ?? randomUUID(),
      correlation_id: randomUUID(),
    },
    payload: overrides.payload ?? {},
  };
}

async function get(path: string, token: string) {
  return fetch(`${authBaseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
}

// ── 4.1: evento en la allowlist con tenant_id T1 produce una fila con tenant_id = T1 ──

async function testEventoAllowlistedPersisteFila() {
  const tenantId = randomUUID();
  const userId = randomUUID();
  const ocId = randomUUID();
  await seedTenant(tenantId, 'Tenant Test Audit 4.1');
  try {
    await authModule.persistTenantAuditEvent(fakeEvent({
      event_type: 'compras.oc_creada',
      tenant_id: tenantId,
      user_id: userId,
      payload: { oc_id: ocId, codigo: 'OC-001', total: 1000 },
    }));

    const rows = await prisma.tenantAuditLog.findMany({ where: { tenant_id: tenantId } });
    assert.equal(rows.length, 1, 'debe persistirse exactamente una fila');
    assert.equal(rows[0].tenant_id, tenantId);
    assert.equal(rows[0].actor_user_id, userId);
    assert.equal(rows[0].event_type, 'compras.oc_creada');
    assert.equal(rows[0].entity_id, ocId);

    console.log('ok - 4.1 evento en la allowlist persiste fila en TenantAuditLog con tenant_id correcto');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 4.2: evento fuera de la allowlist no produce ninguna fila ──

async function testEventoFueraDeAllowlistNoPersiste() {
  const tenantId = randomUUID();
  await seedTenant(tenantId, 'Tenant Test Audit 4.2');
  try {
    await authModule.persistTenantAuditEvent(fakeEvent({
      event_type: 'compras.requisicion_aprobada',
      tenant_id: tenantId,
      payload: { requisicion_id: 'req-1' },
    }));

    const rows = await prisma.tenantAuditLog.findMany({ where: { tenant_id: tenantId } });
    assert.equal(rows.length, 0, 'un evento fuera de la allowlist no debe persistirse');

    console.log('ok - 4.2 evento fuera de la allowlist no persiste ninguna fila');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 4.3: admin de tenant T1 nunca recibe filas de tenant T2 ──

async function testAislamientoPorTenantEnElEndpoint() {
  const tenantId1 = randomUUID();
  const tenantId2 = randomUUID();
  const adminUserId = randomUUID();
  const ocIdT1 = randomUUID();
  const ocIdT2 = randomUUID();
  await seedTenant(tenantId1, 'Tenant Test Audit 4.3 - T1');
  await seedTenant(tenantId2, 'Tenant Test Audit 4.3 - T2');
  try {
    await authModule.persistTenantAuditEvent(fakeEvent({
      event_type: 'compras.oc_creada',
      tenant_id: tenantId1,
      payload: { oc_id: ocIdT1, codigo: 'OC-T1' },
    }));
    await authModule.persistTenantAuditEvent(fakeEvent({
      event_type: 'compras.oc_creada',
      tenant_id: tenantId2,
      payload: { oc_id: ocIdT2, codigo: 'OC-T2' },
    }));

    const token = signTenantToken({ userId: adminUserId, tenantId: tenantId1, proyectoId: randomUUID(), roles: ['admin'] });
    const r = await get('/api/v1/auth/audit-log', token);
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;

    const entityIds = body.data.map((row: any) => row.entity_id);
    assert.ok(entityIds.includes(ocIdT1), 'debe incluir la fila del propio tenant');
    assert.ok(!entityIds.includes(ocIdT2), 'NO debe incluir filas de otro tenant');
    assert.ok(body.data.every((row: any) => row.tenant_id === tenantId1), 'todas las filas devueltas deben pertenecer al tenant de la sesión');

    console.log('ok - 4.3 admin de tenant T1 nunca recibe filas de tenant T2 en GET /api/v1/auth/audit-log');
  } finally {
    await cleanupTenant(tenantId1);
    await cleanupTenant(tenantId2);
  }
}

// ── 4.4: usuario sin rol admin recibe 403 ──

async function testUsuarioSinRolAdminRecibe403() {
  const tenantId = randomUUID();
  await seedTenant(tenantId, 'Tenant Test Audit 4.4');
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['residencia'] });
    const r = await get('/api/v1/auth/audit-log', token);
    assert.equal(r.status, 403, 'un usuario sin rol admin debe recibir 403');
    const body = (await r.json()) as any;
    assert.equal(body.success, false);

    console.log('ok - 4.4 usuario sin rol admin recibe 403 en GET /api/v1/auth/audit-log');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 4.5: GET /api/v1/master/audit-log sigue funcionando igual (no regresión) ──

async function testMasterAuditLogSinRegresion() {
  // Sin MASTER_SECRET configurado en el entorno de test, el endpoint debe
  // seguir respondiendo 401 (mismo comportamiento que antes de este cambio,
  // que solo agrega TenantAuditLog y no toca requireMasterSecret).
  const r = await fetch(`${authBaseUrl}/api/v1/master/audit-log`);
  assert.equal(r.status, 401, 'GET /api/v1/master/audit-log sin clave maestra debe seguir respondiendo 401');
  const body = (await r.json()) as any;
  assert.equal(body.error.code, 'MASTER_UNAUTHORIZED');

  console.log('ok - 4.5 GET /api/v1/master/audit-log no tiene regresión de comportamiento');
}

// ── 4.6: un fallo de persistencia no queda silenciado dentro del handler ──
// (así EventBus.subscribe puede hacer nack — ver packages/event-bus/src/index.ts)

async function testFalloDePersistenciaPropagaExcepcion() {
  // tenant_id que no existe: la escritura de TenantAuditLog no tiene FK a
  // Tenant, así que se fuerza el fallo con un tenant_id que no es un UUID
  // válido — createTenantContext exige tenantId truthy, pero Postgres
  // rechazará el INSERT por tipo invalido en la columna uuid.
  await assert.rejects(
    () => authModule.persistTenantAuditEvent(fakeEvent({
      event_type: 'compras.oc_creada',
      tenant_id: 'no-es-un-uuid-valido',
      payload: { oc_id: randomUUID() },
    })),
    'un fallo de persistencia debe rechazar la promesa, no silenciarla, para que EventBus la nackee'
  );

  console.log('ok - 4.6 un fallo de persistencia propaga la excepción (no se silencia en el handler)');
}

async function main() {
  await setup();
  try {
    await testEventoAllowlistedPersisteFila();
    await testEventoFueraDeAllowlistNoPersiste();
    await testAislamientoPorTenantEnElEndpoint();
    await testUsuarioSinRolAdminRecibe403();
    await testMasterAuditLogSinRegresion();
    await testFalloDePersistenciaPropagaExcepcion();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - tenant-audit-log integration tests');
  console.error(error);
  process.exitCode = 1;
});

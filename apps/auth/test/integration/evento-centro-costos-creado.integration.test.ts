/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: publicación de auth.centro_costos_creado
 * Spec:  openspec/changes/evento-centro-costos-creado/
 * Tareas: 1.4, 1.5 del tasks.md (Grupo 1 — publisher en apps/auth)
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * No requiere RabbitMQ real — el EventBus.publish real se reemplaza por un
 * spy en memoria para verificar el payload sin depender de infraestructura.
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

type CapturedEvent = { event_type: string; context: any; payload: any };
let capturedEvents: CapturedEvent[] = [];
let originalPublish: typeof authModule.eventBus.publish;

async function setup() {
  authModule = await import('../../src/main');
  originalPublish = authModule.eventBus.publish.bind(authModule.eventBus);
  const started = await startHttpApp(authModule.app);
  authServer = started.server;
  authBaseUrl = started.baseUrl;
}

async function teardown() {
  authModule.eventBus.publish = originalPublish;
  await stopHttpApp(authServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.proyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

async function seedTenant(tenantId: string) {
  await prisma.tenant.create({
    data: { id_tenant: tenantId, nombre: 'Tenant Test Evento Centro Costos', rfc: `RFC${Date.now().toString().slice(-9)}` },
  });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Test 1.5: crear un proyecto publica auth.centro_costos_creado con el payload correcto ──

async function testCreacionPublicaEventoConPayloadCorrecto() {
  const tenantId = randomUUID();
  const userId = randomUUID();
  const clienteId = randomUUID();
  capturedEvents = [];
  authModule.eventBus.publish = (async (event: any) => {
    capturedEvents.push(event);
    return true;
  }) as typeof authModule.eventBus.publish;

  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId, tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const r = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteId, codigo_cliente: '007',
      nombre_oficial: 'Proyecto Prueba Evento Centro Costos',
    });
    assert.equal(r.status, 201, 'la creación del proyecto debe seguir respondiendo 201');
    const body = (await r.json()) as any;

    assert.equal(capturedEvents.length, 1, 'debe publicarse exactamente un evento auth.centro_costos_creado');
    const evento = capturedEvents[0];
    assert.equal(evento.event_type, 'auth.centro_costos_creado');
    assert.equal(evento.context.tenant_id, tenantId);
    assert.equal(evento.context.proyecto_id, body.data.id_proyecto);
    assert.equal(evento.context.user_id, userId);
    assert.equal(evento.payload.proyecto_id, body.data.id_proyecto);
    assert.equal(evento.payload.codigo_centro_costos, body.data.codigo_centro_costos);
    assert.equal(evento.payload.empresa_grupo, 'HCO');
    assert.equal(evento.payload.anio_centro_costos, 2026);
    assert.equal(evento.payload.cliente_id, clienteId);
    assert.equal(evento.payload.es_especial, false);
    assert.equal(evento.payload.estatus, body.data.estatus);
    assert.equal(evento.payload.nombre_oficial, 'Proyecto Prueba Evento Centro Costos');
    assert.equal(typeof evento.payload.fecha_creacion, 'string');

    console.log('ok - 1.5 crear un proyecto publica auth.centro_costos_creado con event_type/payload correctos');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.4: un fallo de publish no bloquea ni revierte la respuesta HTTP ──

async function testFalloDePublishNoBloqueaRespuesta() {
  const tenantId = randomUUID();
  const clienteId = randomUUID();
  authModule.eventBus.publish = (async () => {
    throw new Error('RabbitMQ caído (simulado)');
  }) as typeof authModule.eventBus.publish;

  await seedTenant(tenantId);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
    const r = await post('/api/v1/auth/admin/proyectos', token, {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteId, codigo_cliente: '008',
      nombre_oficial: 'Proyecto Prueba Fallo de Publish',
    });
    assert.equal(r.status, 201, 'un fallo al publicar el evento no debe bloquear ni revertir la creación del proyecto');
    const body = (await r.json()) as any;

    const enBd = await prisma.proyecto.findUnique({ where: { id_proyecto: body.data.id_proyecto } });
    assert.ok(enBd, 'el proyecto debe seguir persistido en base de datos pese al fallo de publish');

    console.log('ok - 1.4 un fallo de EventBus.publish no bloquea ni revierte la respuesta HTTP');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCreacionPublicaEventoConPayloadCorrecto();
    await testFalloDePublishNoBloqueaRespuesta();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - evento-centro-costos-creado integration tests');
  console.error(error);
  process.exitCode = 1;
});

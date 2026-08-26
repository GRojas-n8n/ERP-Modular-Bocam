/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Archivar/Activar Proveedores (Compras)
 * Spec:  openspec/changes/archivar-proveedores/specs/archivo-proveedores/
 * Tarea: 2.1-2.7 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const started = await startHttpApp(comprasModule.app);
  comprasServer = started.server;
  comprasBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.ordenCompraItem.deleteMany({ where: { orden: { tenant_id: tenantId } } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.calificacionProveedor.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearProveedor(tenantId: string, overrides: Partial<{ razon_social: string; estatus: string }> = {}) {
  const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
  return prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `AP${sufijo}`,
      razon_social: overrides.razon_social ?? `Proveedor ${sufijo}`,
      estatus: overrides.estatus ?? 'ACTIVO',
    },
  });
}

async function post(path: string, token: string) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function get(path: string, token: string) {
  return fetch(`${comprasBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Test 2.1: archivar un proveedor activo ──────────────────────────────────

async function testArchivarProveedorActivo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const proveedor = await crearProveedor(tenantId);

    const r = await post(`/api/v1/compras/proveedores/${proveedor.id_proveedor}/archivar`, token);
    assert.equal(r.status, 200, 'archivar un proveedor activo debe responder 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.estatus, 'ARCHIVADO', 'la respuesta debe reflejar el nuevo estatus');

    const enBd = await prisma.proveedor.findUnique({ where: { id_proveedor: proveedor.id_proveedor } });
    assert.equal(enBd?.estatus, 'ARCHIVADO', 'el proveedor en BD debe quedar ARCHIVADO');

    console.log('ok - archivar un proveedor ACTIVO responde 200 y queda ARCHIVADO en BD');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2.2: activar un proveedor archivado ────────────────────────────────

async function testActivarProveedorArchivado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const proveedor = await crearProveedor(tenantId, { estatus: 'ARCHIVADO' });

    const r = await post(`/api/v1/compras/proveedores/${proveedor.id_proveedor}/activar`, token);
    assert.equal(r.status, 200, 'activar un proveedor archivado debe responder 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.estatus, 'ACTIVO', 'la respuesta debe reflejar el nuevo estatus');

    const enBd = await prisma.proveedor.findUnique({ where: { id_proveedor: proveedor.id_proveedor } });
    assert.equal(enBd?.estatus, 'ACTIVO', 'el proveedor en BD debe quedar ACTIVO');

    console.log('ok - activar un proveedor ARCHIVADO responde 200 y queda ACTIVO en BD');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2.3: rol sin permiso no puede archivar ─────────────────────────────

async function testRolSinPermisoNoArchiva() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['superintendent'] });

  try {
    const proveedor = await crearProveedor(tenantId);

    const r = await post(`/api/v1/compras/proveedores/${proveedor.id_proveedor}/archivar`, token);
    assert.equal(r.status, 403, 'rol sin procurement/admin debe recibir 403');

    const enBd = await prisma.proveedor.findUnique({ where: { id_proveedor: proveedor.id_proveedor } });
    assert.equal(enBd?.estatus, 'ACTIVO', 'el estatus no debe haber cambiado');

    console.log('ok - rol sin procurement/admin (superintendent) recibe 403 y no archiva');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2.4: proveedor inexistente ─────────────────────────────────────────

async function testProveedorInexistente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const r = await post(`/api/v1/compras/proveedores/${randomUUID()}/archivar`, token);
    assert.equal(r.status, 404, 'proveedor inexistente debe responder 404');

    console.log('ok - archivar un id inexistente responde 404');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2.5: archivar no borra ni altera histórico ─────────────────────────

async function testArchivarNoAlteraHistorico() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const proveedor = await crearProveedor(tenantId);

    const orden = await prisma.ordenCompra.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        proveedor_id: proveedor.id_proveedor,
        codigo: `OC-TEST-${Date.now()}`,
        tipo_cambio: 1,
        subtotal: 100,
        iva: 16,
        total: 116,
      },
    });
    const calificacion = await prisma.calificacionProveedor.create({
      data: {
        tenant_id: tenantId,
        proveedor_id: proveedor.id_proveedor,
        proyecto_id: proyectoId,
        proyecto_nombre: 'Proyecto de prueba',
        puntuacion: 4.5,
        calificado_por: userId,
        calificado_por_nombre: 'Tester',
      },
    });

    const r = await post(`/api/v1/compras/proveedores/${proveedor.id_proveedor}/archivar`, token);
    assert.equal(r.status, 200);

    const ordenEnBd = await prisma.ordenCompra.findUnique({ where: { id_orden: orden.id_orden } });
    assert.ok(ordenEnBd, 'la orden de compra debe seguir existiendo tras archivar al proveedor');
    assert.equal(ordenEnBd?.proveedor_id, proveedor.id_proveedor);

    const calificacionEnBd = await prisma.calificacionProveedor.findUnique({ where: { id_calificacion: calificacion.id_calificacion } });
    assert.ok(calificacionEnBd, 'la calificación debe seguir existiendo tras archivar al proveedor');

    console.log('ok - archivar un proveedor no altera sus órdenes ni calificaciones existentes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2.6/2.7: GET /proveedores filtra archivados por default ───────────

async function testListadoFiltraArchivadosPorDefault() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const activo = await crearProveedor(tenantId, { razon_social: 'Proveedor Activo Visible' });
    const archivado = await crearProveedor(tenantId, { razon_social: 'Proveedor Archivado Oculto', estatus: 'ARCHIVADO' });

    const rSinParam = await get('/api/v1/compras/proveedores', token);
    assert.equal(rSinParam.status, 200);
    const bodySinParam = (await rSinParam.json()) as any;
    const idsSinParam = bodySinParam.data.map((p: any) => p.id_proveedor);
    assert.ok(idsSinParam.includes(activo.id_proveedor), 'el proveedor activo debe aparecer sin parámetros');
    assert.ok(!idsSinParam.includes(archivado.id_proveedor), 'el proveedor archivado NO debe aparecer sin parámetros');

    const rConParam = await get('/api/v1/compras/proveedores?incluir_archivados=true', token);
    assert.equal(rConParam.status, 200);
    const bodyConParam = (await rConParam.json()) as any;
    const idsConParam = bodyConParam.data.map((p: any) => p.id_proveedor);
    assert.ok(idsConParam.includes(activo.id_proveedor), 'el proveedor activo debe aparecer con incluir_archivados=true');
    assert.ok(idsConParam.includes(archivado.id_proveedor), 'el proveedor archivado debe aparecer con incluir_archivados=true');

    console.log('ok - GET /proveedores excluye ARCHIVADO por default e incluye con incluir_archivados=true');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testArchivarProveedorActivo();
    await testActivarProveedorArchivado();
    await testRolSinPermisoNoArchiva();
    await testProveedorInexistente();
    await testArchivarNoAlteraHistorico();
    await testListadoFiltraArchivadosPorDefault();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - archivar-proveedores integration tests');
  console.error(error);
  process.exitCode = 1;
});

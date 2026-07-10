/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Validación de 1ª/2ª opción de proveedor recomendado
 * Spec:  openspec/changes/seleccion-proveedor-recomendado-firma/specs/
 * Tareas: 1.1–1.7 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadroConDosProveedores() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();

  const [provA, provB] = await Promise.all([
    prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFCA${Date.now()}`, razon_social: 'Proveedor A', estatus: 'ACTIVO' } }),
    prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFCB${Date.now()}`, razon_social: 'Proveedor B', estatus: 'ACTIVO' } }),
  ]);

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: randomUUID(),
      codigo: `CC-SEL-${Date.now()}`, estado: 'EN_EVALUACION_TECNICA',
      detalles: {
        create: [
          { tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: provA.id_proveedor, insumo_id: insumoId, precio_ofertado: '100.0000', evaluacion_tecnica: 'C' },
          { tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: provB.id_proveedor, insumo_id: insumoId, precio_ofertado: '90.0000', evaluacion_tecnica: 'C' },
        ],
      },
    },
  });

  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, provA: provA.id_proveedor, provB: provB.id_proveedor };
}

// ── 1.1: segunda opción ajena al cuadro -> 400, no persiste ────────────────

async function testSegundaOpcionAjena() {
  const s = await seedCuadroConDosProveedores();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['resident'] });
    const provAjeno = randomUUID();

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/seleccion`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ primera_opcion_proveedor_id: s.provA, segunda_opcion_proveedor_id: provAjeno }),
    });

    assert.equal(response.status, 400);
    const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: s.cuadroId } });
    assert.equal(cuadro?.primera_opcion_proveedor_id, null, 'no debe persistir nada de la selección');

    console.log('ok - 1.1: segunda_opcion_proveedor_id ajeno al cuadro -> 400, no persiste');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 1.2: segunda opción igual a la primera -> 400 ───────────────────────────

async function testSegundaOpcionIgualPrimera() {
  const s = await seedCuadroConDosProveedores();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['resident'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/seleccion`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ primera_opcion_proveedor_id: s.provA, segunda_opcion_proveedor_id: s.provA }),
    });

    assert.equal(response.status, 400);
    console.log('ok - 1.2: segunda_opcion_proveedor_id igual a la primera -> 400');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 1.3: sin segunda opción sigue guardando null (no regresión) ────────────

async function testSinSegundaOpcionNoRegresion() {
  const s = await seedCuadroConDosProveedores();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['resident'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/seleccion`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ primera_opcion_proveedor_id: s.provA }),
    });

    assert.equal(response.status, 200);
    const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: s.cuadroId } });
    assert.equal(cuadro?.primera_opcion_proveedor_id, s.provA);
    assert.equal(cuadro?.segunda_opcion_proveedor_id, null);

    console.log('ok - 1.3: sin segunda_opcion_proveedor_id sigue guardando null, sin exigirla');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 1.5/1.6: firmar con segunda opción NC/? -> 400 ──────────────────────────

async function seedCuadroFirmableConSegundaOpcionMala(veredictoSegunda: 'NC' | '?') {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();

  const [provA, provB] = await Promise.all([
    prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFCA${Date.now()}`, razon_social: 'Proveedor A', estatus: 'ACTIVO' } }),
    prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFCB${Date.now()}`, razon_social: 'Proveedor B', estatus: 'ACTIVO' } }),
  ]);

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: randomUUID(),
      codigo: `CC-SEL2-${Date.now()}`, estado: 'EN_EVALUACION_TECNICA',
      primera_opcion_proveedor_id: provA.id_proveedor,
      segunda_opcion_proveedor_id: provB.id_proveedor,
      detalles: {
        create: [
          { tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: provA.id_proveedor, insumo_id: insumoId, precio_ofertado: '100.0000', evaluacion_tecnica: 'C' },
          { tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: provB.id_proveedor, insumo_id: insumoId, precio_ofertado: '90.0000', evaluacion_tecnica: veredictoSegunda },
        ],
      },
    },
  });

  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, provA: provA.id_proveedor };
}

async function testFirmaConSegundaOpcionNC() {
  const s = await seedCuadroFirmableConSegundaOpcionMala('NC');
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['resident'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/firmar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ veredicto_residente: 'Todo en orden.', proveedores_sugeridos: [s.provA] }),
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as any;
    assert.match(body.message, /SEGUNDA_OPCION_INVALIDA_NC/);

    console.log('ok - 1.5: firmar con segunda opción con renglón NC -> 400 SEGUNDA_OPCION_INVALIDA_NC');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

async function testFirmaConSegundaOpcionDuda() {
  const s = await seedCuadroFirmableConSegundaOpcionMala('?');
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['resident'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/firmar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ veredicto_residente: 'Todo en orden.', proveedores_sugeridos: [s.provA] }),
    });

    assert.equal(response.status, 400);
    console.log('ok - 1.6: firmar con segunda opción con renglón "?" -> 400');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 1.7: firmar sin segunda opción no se ve afectado (no regresión) ────────

async function testFirmaSinSegundaOpcionNoRegresion() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();
  const provA = await prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: `RFCX${Date.now()}`, razon_social: 'Proveedor Solo', estatus: 'ACTIVO' } });
  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: randomUUID(),
      codigo: `CC-SEL3-${Date.now()}`, estado: 'EN_EVALUACION_TECNICA',
      primera_opcion_proveedor_id: provA.id_proveedor,
      detalles: { create: [{ tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: provA.id_proveedor, insumo_id: insumoId, precio_ofertado: '100.0000', evaluacion_tecnica: 'C' }] },
    },
  });
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles: ['resident'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadro.id_cuadro}/firmar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ veredicto_residente: 'Todo en orden.', proveedores_sugeridos: [provA.id_proveedor] }),
    });

    assert.equal(response.status, 200, 'la firma debe completarse igual sin segunda opción guardada');
    console.log('ok - 1.7: firmar sin segunda opción no tiene regresión');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testSegundaOpcionAjena();             // 1.1
    await testSegundaOpcionIgualPrimera();       // 1.2
    await testSinSegundaOpcionNoRegresion();     // 1.3
    await testFirmaConSegundaOpcionNC();         // 1.5
    await testFirmaConSegundaOpcionDuda();       // 1.6
    await testFirmaSinSegundaOpcionNoRegresion(); // 1.7
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - seleccion-proveedor-recomendado integration tests');
  console.error(error);
  process.exitCode = 1;
});

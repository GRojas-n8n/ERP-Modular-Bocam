/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Cierre de Requisición al firmar (folio + revisión)
 * Spec:  openspec/changes/evaluacion-tecnica-por-especificacion/specs/
 * Tareas: 6.1–6.2 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env), migración
 *           20260711090000_add_evaluacion_especificacion aplicada
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
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

/** Cuadro listo para firmar: sin PENDIENTE/?, primera opción sin NC/?, todo lo requerido presente. */
async function seedCuadroFirmable(conRequisicion: boolean) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const insumoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFC${Date.now()}`, razon_social: 'Proveedor Firma', estatus: 'ACTIVO' },
  });

  let requisicionId: string | null = null;
  if (conRequisicion) {
    const req = await prisma.requisicion.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, codigo: `REQ-FIRMA-${Date.now()}`, solicitante_id: randomUUID(), estado: 'APROBADA' },
    });
    requisicionId = req.id_requisicion;
  }

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: requisicionId ?? randomUUID(),
      codigo: `CC-FIRMA-${Date.now()}`,
      estado: 'EN_EVALUACION_TECNICA',
      revision: 'C',
      primera_opcion_proveedor_id: proveedor.id_proveedor,
      detalles: {
        create: [{ tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedor.id_proveedor, insumo_id: insumoId, precio_ofertado: '100.0000', evaluacion_tecnica: 'C' }],
      },
    },
  });

  return { tenantId, proyectoId, cuadroId: cuadro.id_cuadro, requisicionId, proveedorId: proveedor.id_proveedor };
}

// ── 6.1: firmar con requisición asociada -> campos correctos ───────────────

async function testFirmaRegistraRevisionEnRequisicion() {
  const s = await seedCuadroFirmable(true);
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/firmar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ veredicto_residente: 'Todo en orden.', proveedores_sugeridos: [s.proveedorId] }),
    });

    assert.equal(response.status, 200);

    const req = await prisma.requisicion.findUnique({ where: { id_requisicion: s.requisicionId! } });
    assert.equal(req?.cuadro_comparativo_cierre_id, s.cuadroId);
    assert.equal(req?.revision_cierre, 'C');
    assert.equal(req?.codigo.startsWith('REQ-FIRMA-'), true, 'el folio no debe alterarse');

    console.log('ok - 6.1: firmar registra cuadro_comparativo_cierre_id y revision_cierre en la Requisición');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 6.2: requisicion_id huérfano (sin fila real) -> no falla ───────────────
// CuadroComparativo.requisicion_id es obligatorio en el schema (no hay
// escenario real de "sin requisición"), pero tampoco tiene FK declarada —
// puede apuntar a un id que no exista en `requisiciones`. La firma no debe
// romperse por eso.

async function testFirmaConRequisicionHuerfanaNoFalla() {
  const s = await seedCuadroFirmable(false); // requisicion_id = randomUUID() sin fila real
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['residencia'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${s.cuadroId}/firmar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ veredicto_residente: 'Todo en orden.', proveedores_sugeridos: [s.proveedorId] }),
    });

    assert.equal(response.status, 200, 'la firma debe completarse igual aunque requisicion_id no exista en la tabla requisiciones');

    console.log('ok - 6.2: firmar con requisicion_id huérfano no falla');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testFirmaRegistraRevisionEnRequisicion();       // 6.1
    await testFirmaConRequisicionHuerfanaNoFalla();       // 6.2
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - firma-cierre-requisicion integration tests');
  console.error(error);
  process.exitCode = 1;
});

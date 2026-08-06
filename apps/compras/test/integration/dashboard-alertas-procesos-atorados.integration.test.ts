/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Alertas de procesos atorados en GET /dashboard
 * Spec:  openspec/changes/fix-alertas-compras-procesos-atorados/specs/endpoint-dashboard-compras/spec.md
 * Tarea: 2.1-2.3, 3.1-3.3, 4.1-4.4 del tasks.md
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
// GT no disponible en este entorno de test — el dashboard debe degradarse (gt_dashboard: null)
process.env.GT_URL = process.env.GT_URL || 'http://invalid-host-gt:9999/api/v1/gerencia-tecnica';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

const DIA_MS = 24 * 60 * 60 * 1000;
const UMBRAL_DIAS = 5;

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
  await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

function tokenPara(tenantId: string, proyectoId: string, roles: string[] = ['procurement']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function getDashboard(tenantId: string, proyectoId: string) {
  const response = await fetch(`${comprasBaseUrl}/api/v1/compras/dashboard`, {
    headers: { Authorization: `Bearer ${tokenPara(tenantId, proyectoId)}` },
  });
  assert.equal(response.status, 200);
  const body = (await response.json()) as any;
  assert.equal(body.success, true);
  return body.data as { alertas: any[] };
}

// ── 2.1 / 2.2 / 2.3 — alerta oc_error_finanzas ──────────────────────────────

async function testAlertaOcErrorApareceEnDashboard() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const ocId = randomUUID();
  const creadaHace9Dias = new Date(Date.now() - 9 * DIA_MS);

  try {
    await prisma.alertaOcError.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, oc_id: ocId,
        oc_codigo: 'OC-TEST-ERR-1', error_message: 'Presupuesto insuficiente — simulado',
        resuelta: false, created_at: creadaHace9Dias,
      },
    });

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'oc_error_finanzas' && a.oc_id === ocId);

    assert.ok(alerta, 'Debe aparecer la alerta de OC en ERROR_FINANZAS no resuelta');
    assert.equal(alerta.oc_codigo, 'OC-TEST-ERR-1');
    assert.equal(alerta.error_message, 'Presupuesto insuficiente — simulado');
    assert.ok(alerta.dias_vencida >= 9, `dias_vencida debe ser >= 9, fue ${alerta.dias_vencida}`);

    console.log('ok - dashboard: OC en ERROR_FINANZAS no resuelta aparece en alertas[]');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testAlertaOcErrorResueltaNoAparece() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const ocId = randomUUID();

  try {
    await prisma.alertaOcError.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, oc_id: ocId,
        oc_codigo: 'OC-TEST-ERR-RESUELTA', error_message: 'Ya resuelta', resuelta: true,
      },
    });

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'oc_error_finanzas' && a.oc_id === ocId);
    assert.equal(alerta, undefined, 'Una alerta resuelta NO debe aparecer en alertas[]');

    console.log('ok - dashboard: OC en ERROR_FINANZAS ya resuelta NO aparece en alertas[]');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testAlertaOcErrorAislamientoTenant() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const otroTenantId = randomUUID();
  const ocIdOtro = randomUUID();

  try {
    await prisma.alertaOcError.create({
      data: {
        tenant_id: otroTenantId, proyecto_id: randomUUID(), oc_id: ocIdOtro,
        oc_codigo: 'OC-OTRO-TENANT', error_message: 'No debe verse', resuelta: false,
      },
    });

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'oc_error_finanzas' && a.oc_id === ocIdOtro);
    assert.equal(alerta, undefined, 'No debe ver alertas de otro tenant');

    console.log('ok - dashboard: alertas de OC en error respetan aislamiento por tenant');
  } finally {
    await cleanupTenant(otroTenantId);
  }
}

// ── 3.1 / 3.2 / 3.3 — alerta requisicion_sin_cuadro ─────────────────────────

async function seedRequisicion(tenantId: string, proyectoId: string, diasAntiguedad: number) {
  return prisma.requisicion.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId,
      codigo: `REQ-TEST-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      solicitante_id: randomUUID(), estado: 'APROBADA',
      fecha_solicitud: new Date(Date.now() - diasAntiguedad * DIA_MS),
    },
  });
}

async function testRequisicionSinCuadroAntiguaAparece() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  try {
    const req = await seedRequisicion(tenantId, proyectoId, UMBRAL_DIAS + 4); // 9 días

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'requisicion_sin_cuadro' && a.req_id === req.id_requisicion);

    assert.ok(alerta, 'Requisición APROBADA sin cuadro y con antigüedad excedida debe alertar');
    assert.equal(alerta.folio, req.codigo);
    assert.ok(alerta.dias_vencida >= UMBRAL_DIAS + 4);

    console.log('ok - dashboard: requisición APROBADA sin Cuadro Comparativo y atorada aparece en alertas[]');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testRequisicionSinCuadroRecienteNoAparece() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  try {
    const req = await seedRequisicion(tenantId, proyectoId, 1); // 1 día — bajo el umbral

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'requisicion_sin_cuadro' && a.req_id === req.id_requisicion);
    assert.equal(alerta, undefined, 'Requisición reciente no debe alertar aunque no tenga cuadro todavía');

    console.log('ok - dashboard: requisición APROBADA reciente sin cuadro NO genera alerta prematura');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testRequisicionConCuadroNoAparece() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  try {
    const req = await seedRequisicion(tenantId, proyectoId, UMBRAL_DIAS + 4);
    await prisma.cuadroComparativo.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: req.id_requisicion,
        codigo: `CC-TEST-${Date.now()}`, estado: 'BORRADOR',
      },
    });

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'requisicion_sin_cuadro' && a.req_id === req.id_requisicion);
    assert.equal(alerta, undefined, 'Requisición con Cuadro Comparativo asociado no debe alertar como sin cuadro');

    console.log('ok - dashboard: requisición con Cuadro Comparativo asociado NO aparece como requisicion_sin_cuadro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 4.1 / 4.2 / 4.3 / 4.4 — alerta cuadro_atorado ───────────────────────────

async function seedCuadro(tenantId: string, proyectoId: string, estado: string, diasAntiguedad: number) {
  return prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, requisicion_id: randomUUID(),
      codigo: `CC-TEST-${Date.now()}-${Math.floor(Math.random() * 9999)}`, estado,
      fecha_creacion: new Date(Date.now() - diasAntiguedad * DIA_MS),
    },
  });
}

async function testCuadroAtoradoEstadosNoTerminales() {
  // NOTA: 'LOCKED' se excluye deliberadamente de este loop. Un trigger de BD
  // (fn_prevent_locked_comparativa_modification, prisma/migrations/manual/migration.sql)
  // hace inmutable cualquier fila con estado='LOCKED' — ni UPDATE ni DELETE son
  // posibles después de crearla, así que sembrarla aquí dejaría basura permanente
  // e imposible de limpiar en la BD de test. La lógica de `CUADRO_ESTADOS_TERMINALES`
  // trata 'LOCKED' igual que 'FIRMADO_BLOQUEADO' (mismo `notIn`), ya cubierto abajo.
  const estadosNoTerminales = [
    'BORRADOR', 'CON_SOLICITUD', 'EN_COTIZACION', 'EN_EVALUACION_TECNICA',
    'EVALUADO_TECNICAMENTE', 'EN_APROBACION_GT', 'REVISION_SOLICITADA',
    'FIRMADO_BLOQUEADO',
  ];

  for (const estado of estadosNoTerminales) {
    const tenantId = randomUUID();
    const proyectoId = randomUUID();
    try {
      const cuadro = await seedCuadro(tenantId, proyectoId, estado, UMBRAL_DIAS + 4);

      const data = await getDashboard(tenantId, proyectoId);
      const alerta = data.alertas.find((a) => a.tipo === 'cuadro_atorado' && a.cuadro_id === cuadro.id_cuadro);

      assert.ok(alerta, `Cuadro en estado ${estado} con antigüedad excedida debe alertar`);
      assert.equal(alerta.estado, estado);
    } finally {
      await cleanupTenant(tenantId);
    }
  }

  console.log('ok - dashboard: cuadro_atorado aparece para todos los estados no terminales (incl. FIRMADO_BLOQUEADO)');
}

async function testCuadroTerminalNoAparece() {
  const estadosTerminales = ['APROBADO_GT', 'RECHAZADO_GT', 'CERRADO', 'SUPERSEDIDO'];

  for (const estado of estadosTerminales) {
    const tenantId = randomUUID();
    const proyectoId = randomUUID();
    try {
      const cuadro = await seedCuadro(tenantId, proyectoId, estado, UMBRAL_DIAS + 10);

      const data = await getDashboard(tenantId, proyectoId);
      const alerta = data.alertas.find((a) => a.tipo === 'cuadro_atorado' && a.cuadro_id === cuadro.id_cuadro);

      assert.equal(alerta, undefined, `Cuadro en estado terminal ${estado} NO debe alertar sin importar antigüedad`);
    } finally {
      await cleanupTenant(tenantId);
    }
  }

  console.log('ok - dashboard: estados terminales (APROBADO_GT/RECHAZADO_GT/CERRADO/SUPERSEDIDO) NUNCA generan cuadro_atorado');
}

async function testCuadroRecienteNoAparece() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  try {
    const cuadro = await seedCuadro(tenantId, proyectoId, 'BORRADOR', 1);

    const data = await getDashboard(tenantId, proyectoId);
    const alerta = data.alertas.find((a) => a.tipo === 'cuadro_atorado' && a.cuadro_id === cuadro.id_cuadro);
    assert.equal(alerta, undefined, 'Cuadro reciente no terminal no debe alertar todavía');

    console.log('ok - dashboard: cuadro no terminal reciente NO genera alerta prematura');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();

  try {
    await testAlertaOcErrorApareceEnDashboard();       // 2.1
    await testAlertaOcErrorResueltaNoAparece();         // 2.2
    await testAlertaOcErrorAislamientoTenant();         // 2.3
    await testRequisicionSinCuadroAntiguaAparece();     // 3.1
    await testRequisicionSinCuadroRecienteNoAparece();  // 3.2
    await testRequisicionConCuadroNoAparece();          // 3.3
    await testCuadroAtoradoEstadosNoTerminales();       // 4.1, 4.2
    await testCuadroTerminalNoAparece();                // 4.3
    await testCuadroRecienteNoAparece();                // 4.4
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - dashboard alertas procesos atorados integration tests');
  console.error(error);
  process.exitCode = 1;
});

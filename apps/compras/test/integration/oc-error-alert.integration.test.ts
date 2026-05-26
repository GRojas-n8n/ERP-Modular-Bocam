/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Alerta de OC en ERROR_FINANZAS
 * Spec:  openspec/changes/oc-error-finanzas-alert/specs/oc-error-alert/spec.md
 * Tarea: 5.1–5.6 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (el EventBus falla silenciosamente en estos tests)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
// NOTA: main.ts NO se importa estáticamente aquí para evitar que FINANZAS_URL
// quede "congelado" al valor por defecto antes de que setup() lo sobreescriba.
// Se importa dinámicamente dentro de setup(), una vez que los env vars están listos.

// ── Configuración ────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

// Apuntar a un RabbitMQ inexistente: el EventBus fallará silenciosamente
// y los tests pueden verificar la persistencia en BD de forma aislada.
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

// Referencia a handlePresupuestoInsuficienteEvent, asignada en setup()
// después de que el módulo main.ts es importado con el FINANZAS_URL correcto.
let handlePresupuestoInsuficienteEvent: (event: any) => Promise<void>;

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({
  datasources: { db: { url: comprasDbUrl } },
});

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

// Registro de llamadas al stub de Finanzas para verificar el flujo
let finanzasCalls: Array<{ method: string; path: string; body?: unknown }> = [];

// ── Helpers de Setup / Teardown ──────────────────────────────────────────────

/**
 * Levanta un stub de Finanzas donde comprometer-fondos SIEMPRE falla (500),
 * y arranca la app de Compras apuntando a ese stub.
 */
async function setup() {
  const finanzasStub = express();
  finanzasStub.use(express.json());

  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => {
    finanzasCalls.push({ method: 'GET', path: '/api/v1/finanzas/suficiencia' });
    res.json({ success: true, data: { tiene_suficiencia: true } });
  });

  // Simula el escenario de fallo: Finanzas recibe la llamada pero retorna 500
  finanzasStub.post('/api/v1/finanzas/comprometer-fondos', (_req, res) => {
    finanzasCalls.push({ method: 'POST', path: '/api/v1/finanzas/comprometer-fondos' });
    res.status(500).json({
      success: false,
      error: { message: 'Finanzas simulado fuera de servicio — test de alerta' },
    });
  });

  finanzasStub.post('/api/v1/finanzas/liberar-fondos', (_req, res) => {
    res.json({ success: true, data: {} });
  });

  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;

  // CRÍTICO: asignar FINANZAS_URL ANTES de importar main.ts.
  // main.ts captura `process.env.FINANZAS_URL` en una constante a nivel de módulo,
  // por lo que debe estar correctamente seteado ANTES del primer require().
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  // Importar la app de Compras DESPUÉS de configurar env vars
  // para que el módulo las tome al inicializarse.
  const comprasModule = await import('../../src/main');

  // Capturar la referencia al handler de eventos para usarla en testIdempotenciaAlerta
  handlePresupuestoInsuficienteEvent = comprasModule.handlePresupuestoInsuficienteEvent;

  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await stopHttpApp(finanzasServer);
  await prisma.$disconnect();
}

/**
 * Limpia todos los registros del tenant de prueba para dejar la BD en estado inicial.
 * El orden importa por las FK: alertas → items → OC → comparativas → proveedor
 */
async function cleanupTenant(tenantId: string) {
  await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

/**
 * Crea en BD una comparativa válida con un proveedor ganador,
 * lista para ser convertida a OC.
 */
async function seedComparativaConGanador(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride ?? randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 9)}`,
      razon_social: 'Proveedor Test Alerta',
      estatus: 'ACTIVO',
    },
  });

  const comparativa = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-ALT-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'ABIERTO',
      detalles: {
        create: [{
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          proveedor_id: proveedor.id_proveedor,
          insumo_id: randomUUID(),
          precio_ofertado: '1000.0000',
          es_ganador: true,
        }],
      },
    },
    include: { detalles: true },
  });

  return { tenantId, proyectoId, userId, presupuestoId, comparativaId: comparativa.id_cuadro };
}

// ── Test 5.2: Alerta generada en fallo síncrono ─────────────────────────────
// Spec: "WHEN comprometer-fondos devuelve error THEN se crea registro en alertaOcError"

async function testAlertaGeneradaEnFalloSincrono() {
  finanzasCalls = [];
  const seeded = await seedComparativaConGanador();

  try {
    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['admin'],
    });

    const response = await fetch(
      `${comprasBaseUrl}/api/v1/compras/comparativas/${seeded.comparativaId}/convertir-oc`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: seeded.presupuestoId }),
      }
    );

    // La OC debe quedar en estado inconsistente y la respuesta debe ser 502
    assert.equal(response.status, 502, 'Debe retornar 502 cuando Finanzas falla');
    const body = (await response.json()) as any;
    assert.equal(body.success, false);
    assert.equal(body.data.estado, 'ERROR_FINANZAS');

    const ocId = body.data.oc_id;
    assert.ok(ocId, 'La respuesta debe incluir oc_id para rastrear la alerta');

    // ─── Verificación principal del spec ──────────────────────────────────
    const alerta = await prisma.alertaOcError.findFirst({
      where: { oc_id: ocId, tenant_id: seeded.tenantId },
    });

    assert.ok(alerta, 'Debe existir un registro en alertaOcError para la OC en error');
    assert.equal(alerta.resuelta, false, 'La alerta debe estar marcada como no resuelta');
    assert.equal(alerta.proyecto_id, seeded.proyectoId, 'La alerta debe pertenecer al proyecto correcto');
    assert.equal(alerta.presupuesto_id, seeded.presupuestoId, 'La alerta debe registrar el presupuesto_id');
    assert.ok(alerta.error_message.length > 0, 'error_message no debe estar vacío');

    console.log('ok - alerta generada en BD cuando Finanzas falla al comprometer fondos (path síncrono)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 5.3: Alerta vinculada al oc_id correcto (proxy del evento) ──────────
// Spec: "THEN sistema publica compras.oc_error_finanzas con oc_id correcto"
//
// Nota: el EventBus es best-effort sobre RabbitMQ. En este entorno de test, el bus
// falla silenciosamente (RABBITMQ_URL inválido) pero el dato persiste en BD.
// La BD actúa como contrato verificable del evento: si la alerta está registrada
// con el oc_id correcto, el payload del evento también lo estaría.

async function testAlertaReferenciaOcIdCorrecto() {
  finanzasCalls = [];
  const seeded = await seedComparativaConGanador();

  try {
    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['procurement'],
    });

    const response = await fetch(
      `${comprasBaseUrl}/api/v1/compras/comparativas/${seeded.comparativaId}/convertir-oc`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ presupuesto_id: seeded.presupuestoId }),
      }
    );

    assert.equal(response.status, 502);
    const body = (await response.json()) as any;
    const ocId = body.data.oc_id as string;

    const alerta = await prisma.alertaOcError.findFirst({
      where: { oc_id: ocId, tenant_id: seeded.tenantId },
    });

    assert.ok(alerta, 'Alerta debe existir');
    assert.equal(alerta.oc_id, ocId, 'La alerta debe referenciar exactamente el oc_id de la OC creada');
    assert.equal(alerta.oc_codigo, body.data.codigo, 'oc_codigo en la alerta debe coincidir con el de la OC');

    console.log('ok - alerta registrada con oc_id y oc_codigo correctos (proxy de compras.oc_error_finanzas)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 5.4: Idempotencia de la alerta ─────────────────────────────────────
// Spec: "WHEN handler ejecutado dos veces con mismo oc_id THEN solo 1 registro en alertaOcError"

async function testIdempotenciaAlerta() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const ocId = randomUUID();

  try {
    // Crear proveedor y OC directamente en BD (sin pasar por HTTP)
    const proveedor = await prisma.proveedor.create({
      data: {
        tenant_id: tenantId,
        rfc_tax_id: `RFC-IDEM-${Date.now().toString().slice(-6)}`,
        razon_social: 'Proveedor Idempotencia Test',
        estatus: 'ACTIVO',
      },
    });

    await prisma.ordenCompra.create({
      data: {
        id_orden: ocId,
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        proveedor_id: proveedor.id_proveedor,
        codigo: 'OC-IDEM-001',
        estado: 'PENDIENTE_CONFIRMACION_FINANZAS',
        subtotal: '1000.00',
        iva: '160.00',
        total: '1160.00',
        presupuesto_id: randomUUID(),
      },
    });

    const makeEvent = (correlationId: string) => ({
      event_type: 'finanzas.presupuesto_insuficiente',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: randomUUID(),
        correlation_id: correlationId,
      },
      payload: {
        referencia_oc_id: ocId,
        referencia_oc_codigo: 'OC-IDEM-001',
        presupuesto_id: randomUUID(),
      },
    });

    // Primera ejecución: aplica la mutación y crea la alerta
    await handlePresupuestoInsuficienteEvent(makeEvent('corr-idempotencia-1') as any);

    // Verificación intermedia
    const alertasIntermedias = await prisma.alertaOcError.findMany({
      where: { oc_id: ocId, tenant_id: tenantId },
    });
    assert.equal(alertasIntermedias.length, 1, 'Debe existir exactamente 1 alerta tras la primera ejecución');

    // Restablecer estado de la OC a PENDIENTE para forzar un segundo apply
    // (simula un mensaje duplicado en la cola antes de que el estado cambie)
    await prisma.ordenCompra.update({
      where: { id_orden: ocId },
      data: { estado: 'PENDIENTE_CONFIRMACION_FINANZAS' },
    });

    // Segunda ejecución con el mismo oc_id: el upsert no debe crear un duplicado
    await handlePresupuestoInsuficienteEvent(makeEvent('corr-idempotencia-2') as any);

    // ─── Verificación principal del spec ──────────────────────────────────
    const alertasFinales = await prisma.alertaOcError.findMany({
      where: { oc_id: ocId, tenant_id: tenantId },
    });

    assert.equal(
      alertasFinales.length,
      1,
      'Deben existir exactamente 1 alerta después de dos ejecuciones con el mismo oc_id'
    );

    console.log('ok - idempotencia: dos ejecuciones con el mismo oc_id generan exactamente una alerta');
  } finally {
    await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}

// ── Test 5.5a: Aislamiento multi-tenant / multi-proyecto ────────────────────
// Spec: "WHEN JWT de proyecto_A THEN endpoint NO devuelve alertas de proyecto_B"

async function testAislamientoMultiProyecto() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const ocIdA = randomUUID();
  const ocIdB = randomUUID();

  try {
    // Insertar alertas directamente para dos proyectos distintos del mismo tenant
    await prisma.alertaOcError.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoA,
        oc_id: ocIdA,
        oc_codigo: 'OC-PROJ-A-001',
        error_message: 'Error simulado proyecto A',
        resuelta: false,
      },
    });

    await prisma.alertaOcError.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoB,
        oc_id: ocIdB,
        oc_codigo: 'OC-PROJ-B-001',
        error_message: 'Error simulado proyecto B',
        resuelta: false,
      },
    });

    // Token con proyecto_A en el claim proyecto_id
    const tokenA = signTenantToken({
      userId: randomUUID(),
      tenantId,
      proyectoId: proyectoA,
      roles: ['procurement'],
    });

    const response = await fetch(
      `${comprasBaseUrl}/api/v1/compras/alertas/oc-error`,
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );

    assert.equal(response.status, 200);
    const body = (await response.json()) as any;
    assert.equal(body.success, true);

    const ocIdsRetornados = (body.data as any[]).map((a) => a.oc_id) as string[];

    // ─── Verificaciones del spec ───────────────────────────────────────────
    assert.ok(
      ocIdsRetornados.includes(ocIdA),
      'El endpoint DEBE retornar la alerta del proyecto_A'
    );
    assert.ok(
      !ocIdsRetornados.includes(ocIdB),
      'El endpoint NO DEBE retornar alertas del proyecto_B (aislamiento RLS)'
    );

    console.log('ok - GET /alertas/oc-error respeta el aislamiento por proyecto_id (RLS multi-tenant)');
  } finally {
    await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
  }
}

// ── Test 5.5b: Acceso denegado para rol sin permisos ────────────────────────
// Spec: "WHEN usuario con rol resident THEN endpoint devuelve 403"

async function testAccesoDenegadoParaResident() {
  const token = signTenantToken({
    userId: randomUUID(),
    tenantId: randomUUID(),
    proyectoId: randomUUID(),
    roles: ['resident'],
  });

  const response = await fetch(
    `${comprasBaseUrl}/api/v1/compras/alertas/oc-error`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  assert.equal(
    response.status,
    403,
    'El rol resident debe recibir 403 Forbidden en GET /alertas/oc-error'
  );

  console.log('ok - rol resident recibe 403 en GET /alertas/oc-error');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();

  try {
    await testAlertaGeneradaEnFalloSincrono();      // 5.2
    await testAlertaReferenciaOcIdCorrecto();        // 5.3
    await testIdempotenciaAlerta();                  // 5.4
    await testAislamientoMultiProyecto();            // 5.5a
    await testAccesoDenegadoParaResident();          // 5.5b
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - oc-error-alert integration tests');
  console.error(error);
  process.exitCode = 1;
});

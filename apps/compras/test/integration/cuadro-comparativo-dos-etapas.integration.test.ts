/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: Cuadro Comparativo — Flujo de Aprobación en Dos Etapas
 * Spec:  openspec/changes/cuadro-comparativo-aprobacion-dos-etapas/specs/
 * Tareas: 11.1–11.5 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 *           Migración cuadro_comparativo_aprobacion_dos_etapas aplicada
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

// ── Configuración ────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999'; // EventBus falla silenciosamente

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({
  datasources: { db: { url: comprasDbUrl } },
});

let comprasServer: Server | undefined;
let finanzasServer: Server | undefined;
let comprasBaseUrl = '';

// ── Helpers de Setup / Teardown ──────────────────────────────────────────────

async function setup() {
  // Finanzas stub: comprometer-fondos exitoso para el happy path
  const finanzasStub = express();
  finanzasStub.use(express.json());

  finanzasStub.get('/api/v1/finanzas/suficiencia', (_req, res) => {
    res.json({ success: true, data: { tiene_suficiencia: true } });
  });

  finanzasStub.post('/api/v1/finanzas/comprometer-fondos', (_req, res) => {
    res.json({ success: true, data: { compromiso_id: `COMP-${Date.now()}` } });
  });

  finanzasStub.post('/api/v1/finanzas/liberar-fondos', (_req, res) => {
    res.json({ success: true, data: {} });
  });

  const finanzasStarted = await startHttpApp(finanzasStub);
  finanzasServer = finanzasStarted.server;

  // CRÍTICO: asignar FINANZAS_URL ANTES de importar main.ts
  process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;

  const comprasModule = await import('../../src/main');
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
 * Limpia BD del tenant de prueba.
 * Orden importa por FK: alertas → items OC → OC → detalles → cuadro → proveedor
 */
async function cleanupTenant(tenantId: string) {
  await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

/**
 * Crea en BD un CuadroComparativo en BORRADOR con un proveedor y un renglón ganador.
 * Retorna los IDs para usar en los tests.
 */
async function seedCuadroBorrador(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride ?? randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-DOSETA-${Date.now().toString().slice(-8)}`,
      razon_social: 'Proveedor Dos Etapas Test',
      estatus: 'ACTIVO',
    },
  });

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-DE-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
      detalles: {
        create: [{
          tenant_id: tenantId,
          proyecto_id: proyectoId,
          proveedor_id: proveedor.id_proveedor,
          insumo_id: randomUUID(),
          precio_ofertado: '5000.0000',
          es_ganador: true,
        }],
      },
    },
    include: { detalles: true },
  });

  const detalleId = cuadro.detalles[0].id_detalle;

  return { tenantId, proyectoId, userId, presupuestoId, cuadroId: cuadro.id_cuadro, detalleId, proveedorId: proveedor.id_proveedor };
}

/**
 * Crea en BD un CuadroComparativo con DOS renglones directamente en estado EN_APROBACION_GT.
 * - renglón 1: evaluacion_tecnica=APROBADO, es_ganador=true
 * - renglón 2: evaluacion_tecnica=RECHAZADO, es_ganador=false
 */
async function seedCuadroEnAprobacionGT(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride ?? randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-GT-${Date.now().toString().slice(-8)}`,
      razon_social: 'Proveedor GT Test',
      estatus: 'ACTIVO',
    },
  });

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-GT-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'EN_APROBACION_GT',
      evaluacion_residente_id: userId,
      fecha_evaluacion_tecnica: new Date(),
    },
  });

  // Renglón 1: aprobado por Residente (es_ganador=true)
  const detalle1 = await prisma.comparativaDetalle.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      cuadro_id: cuadro.id_cuadro,
      proveedor_id: proveedor.id_proveedor,
      insumo_id: randomUUID(),
      precio_ofertado: '3000.0000',
      es_ganador: true,
      evaluacion_tecnica: 'APROBADO',
      comentario_tecnico: 'Cumple especificación técnica.',
    },
  });

  // Renglón 2: rechazado por Residente (es_ganador=false)
  const detalle2 = await prisma.comparativaDetalle.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      cuadro_id: cuadro.id_cuadro,
      proveedor_id: proveedor.id_proveedor,
      insumo_id: randomUUID(),
      precio_ofertado: '2500.0000',
      es_ganador: false,
      evaluacion_tecnica: 'RECHAZADO',
      comentario_tecnico: 'No cumple norma de calidad solicitada.',
    },
  });

  return {
    tenantId, proyectoId, userId, presupuestoId,
    cuadroId: cuadro.id_cuadro,
    detalleAprobadoId: detalle1.id_detalle,
    detalleRechazadoId: detalle2.id_detalle,
  };
}

// ── Helper de request ────────────────────────────────────────────────────────

async function patch(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function put(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Test 11.1: Happy path completo ──────────────────────────────────────────
// BORRADOR → EN_EVALUACION_TECNICA → evaluar(C) → seleccion → firmar(FIRMADO_BLOQUEADO) → EN_APROBACION_GT → APROBADO_GT → CERRADO

async function testHappyPathCompleto() {
  const seeded = await seedCuadroBorrador();

  try {
    const tokenProcurement = signTenantToken({
      userId: seeded.userId, tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId, roles: ['procurement'],
    });
    const tokenResidente = signTenantToken({
      userId: randomUUID(), tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId, roles: ['residencia'],
    });
    const tokenGT = signTenantToken({
      userId: randomUUID(), tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'],
    });

    // Paso 1: Procurement envía a evaluación → EN_EVALUACION_TECNICA
    const r1 = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/enviar-evaluacion`,
      tokenProcurement, {}
    );
    assert.equal(r1.status, 200, 'enviar-evaluacion debe retornar 200');
    const b1 = (await r1.json()) as any;
    assert.equal(b1.data.estado, 'EN_EVALUACION_TECNICA', 'Estado debe ser EN_EVALUACION_TECNICA');
    assert.equal(b1.data.detalles[0].evaluacion_tecnica, 'PENDIENTE', 'Detalle debe tener evaluacion_tecnica=PENDIENTE');

    // Paso 2: Residente registra evaluación técnica ('C' = Cumple)
    const r2 = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar`,
      tokenResidente,
      { evaluaciones: [{ detalle_id: seeded.detalleId, evaluacion_tecnica: 'C', comentario_tecnico: 'Cumple especificación' }] }
    );
    assert.equal(r2.status, 200, 'evaluar debe retornar 200');
    const b2 = (await r2.json()) as any;
    assert.equal(b2.data.detalles[0].evaluacion_tecnica, 'C', 'Detalle debe tener evaluacion_tecnica=C (Cumple)');

    // Paso 3: Residente selecciona primera opción de proveedor
    const r3 = await put(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/seleccion`,
      tokenResidente,
      { primera_opcion_proveedor_id: seeded.proveedorId }
    );
    assert.equal(r3.status, 200, 'seleccion debe retornar 200');

    // Paso 4: Residente firma el cuadro → FIRMADO_BLOQUEADO
    const r4 = await post(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/firmar`,
      tokenResidente,
      {
        veredicto_residente: 'Proveedor cumple todas las especificaciones técnicas y presenta mejor precio.',
        proveedores_sugeridos: [seeded.proveedorId],
      }
    );
    assert.equal(r4.status, 200, 'firmar debe retornar 200');
    const b4 = (await r4.json()) as any;
    assert.equal(b4.data.estado, 'FIRMADO_BLOQUEADO', 'Estado debe ser FIRMADO_BLOQUEADO');
    assert.equal(b4.data.evaluacion_residente_id !== null, true, 'evaluacion_residente_id debe estar seteado');

    // Paso 5: Residente envía al Gerente Técnico → EN_APROBACION_GT
    const r5 = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/enviar-gt`,
      tokenResidente, {}
    );
    assert.equal(r5.status, 200, 'enviar-gt debe retornar 200');
    const b5 = (await r5.json()) as any;
    assert.equal(b5.data.estado, 'EN_APROBACION_GT', 'Estado debe ser EN_APROBACION_GT');

    // Paso 6a: GT guarda su evaluación económica (C) — no finaliza el cuadro
    const r6a = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`,
      tokenGT,
      { evaluaciones: [{ detalle_id: seeded.detalleId, aprobacion_gt: 'C', comentario_gt: 'Precio justo. Autorizado.' }] }
    );
    assert.equal(r6a.status, 200, 'evaluar-gt debe retornar 200');
    const b6a = (await r6a.json()) as any;
    assert.equal(b6a.data.estado, 'EN_APROBACION_GT', 'Guardar evaluación GT no debe finalizar el cuadro');
    assert.equal(b6a.data.detalles[0].aprobacion_gt, 'C', 'Detalle debe tener aprobacion_gt=C');

    // Paso 6b: GT finaliza la aprobación → APROBADO_GT
    const r6 = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/revisar-gt`,
      tokenGT,
      { comentario_gt_general: 'Cuadro aprobado. Proceder con OC.' }
    );
    assert.equal(r6.status, 200, 'revisar-gt debe retornar 200');
    const b6 = (await r6.json()) as any;
    assert.equal(b6.data.estado, 'APROBADO_GT', 'Estado debe ser APROBADO_GT');
    assert.equal(b6.data.gerente_tecnico_id !== null, true, 'gerente_tecnico_id debe estar seteado');
    assert.equal(b6.data.detalles[0].aprobacion_gt, 'C', 'Detalle debe conservar aprobacion_gt=C tras finalizar');

    // Paso 7: Procurement genera OC → CERRADO (Finanzas acepta)
    const r7 = await post(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`,
      tokenProcurement,
      { presupuesto_id: seeded.presupuestoId }
    );
    assert.equal(r7.status, 201, 'convertir-oc debe retornar 201');
    const b7 = (await r7.json()) as any;
    assert.equal(b7.success, true, 'convertir-oc debe tener success=true');
    assert.ok(
      b7.data.ordenes_compra && Array.isArray(b7.data.ordenes_compra) && b7.data.ordenes_compra.length > 0,
      'convertir-oc debe retornar array ordenes_compra con al menos 1 OC'
    );

    // Verificar en BD que el cuadro quedó CERRADO
    const cuadroFinal = await prisma.cuadroComparativo.findUnique({
      where: { id_cuadro: seeded.cuadroId },
    });
    assert.equal(cuadroFinal?.estado, 'CERRADO', 'Cuadro debe quedar en estado CERRADO tras OC EMITIDA');

    console.log('ok - 11.1 happy path: BORRADOR → EN_EVALUACION_TECNICA → evaluar(C) → firmar(FIRMADO_BLOQUEADO) → EN_APROBACION_GT → APROBADO_GT → CERRADO');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 11.2: GT no puede aprobar renglón rechazado por Residente ──────────

async function testGTNoPuedeAprobarRenglonRechazadoPorResidente() {
  const seeded = await seedCuadroEnAprobacionGT();

  try {
    const tokenGT = signTenantToken({
      userId: randomUUID(), tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'],
    });

    // Intentar aprobar el renglón que fue rechazado por el Residente → debe fallar con 400
    const r = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`,
      tokenGT,
      {
        evaluaciones: [{
          detalle_id: seeded.detalleRechazadoId,
          aprobacion_gt: 'C',  // ❌ intento de aprobar un rechazado técnicamente
          comentario_gt: 'El GT quiere aprobarlo igual',
        }],
      }
    );

    assert.equal(r.status, 400, 'evaluar-gt debe retornar 400 al intentar aprobar un renglón rechazado por Residente');
    const body = (await r.json()) as any;
    assert.equal(body.success, false, 'La respuesta debe indicar fallo');
    assert.ok(
      body.message.includes('rechazado') || body.message.includes('evaluación técnica'),
      `El mensaje de error debe mencionar el rechazo técnico. Mensaje recibido: "${body.message}"`
    );

    // Verificar que el cuadro NO cambió de estado en BD
    const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: seeded.cuadroId } });
    assert.equal(cuadro?.estado, 'EN_APROBACION_GT', 'El cuadro debe permanecer en EN_APROBACION_GT tras el intento fallido');

    console.log('ok - 11.2 GT no puede aprobar renglón rechazado por Residente → 400 (rechazo técnico vinculante)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 11.3: Todos los renglones rechazados por GT → RECHAZADO_GT ──────────

async function testTodosRengloneRechazadosGTResultaEnRechazadoGT() {
  const seeded = await seedCuadroEnAprobacionGT();

  try {
    const tokenGT = signTenantToken({
      userId: randomUUID(), tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId, roles: ['gerencia_tecnica'],
    });

    // GT marca NC en el único renglón aprobado técnicamente — el rechazado técnicamente
    // queda fuera del alcance de GT (no bloquea el gate de finalización)
    const rEval = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/evaluar-gt`,
      tokenGT,
      { evaluaciones: [{ detalle_id: seeded.detalleAprobadoId, aprobacion_gt: 'NC', comentario_gt: 'Precio fuera de presupuesto.' }] }
    );
    assert.equal(rEval.status, 200, 'evaluar-gt debe retornar 200');

    const r = await patch(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/revisar-gt`,
      tokenGT,
      { comentario_gt_general: 'Requiere nueva cotización.' }
    );

    assert.equal(r.status, 200, 'revisar-gt debe retornar 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.estado, 'RECHAZADO_GT', 'Cuadro debe pasar a RECHAZADO_GT cuando todos los renglones son rechazados por GT');
    assert.equal(body.data.comentario_gt_general, 'Requiere nueva cotización.', 'comentario_gt_general debe guardarse');

    // Verificar en BD
    const cuadro = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: seeded.cuadroId } });
    assert.equal(cuadro?.estado, 'RECHAZADO_GT', 'BD debe reflejar estado RECHAZADO_GT');
    assert.ok(cuadro?.gerente_tecnico_id, 'gerente_tecnico_id debe estar seteado');
    assert.ok(cuadro?.fecha_aprobacion_gt, 'fecha_aprobacion_gt debe estar seteada');

    console.log('ok - 11.3 todos los renglones rechazados por GT → estado RECHAZADO_GT');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 11.4: convertir-oc con estado no-APROBADO_GT → 400 ─────────────────

async function testConvertirOcRequiereAprobadoGT() {
  const seeded = await seedCuadroEnAprobacionGT();

  try {
    const tokenProcurement = signTenantToken({
      userId: seeded.userId, tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId, roles: ['procurement'],
    });

    // Intentar convertir-oc con estado EN_APROBACION_GT → debe retornar 400
    const r = await post(
      `/api/v1/compras/comparativas/${seeded.cuadroId}/convertir-oc`,
      tokenProcurement,
      { presupuesto_id: seeded.presupuestoId }
    );

    assert.equal(r.status, 400, 'convertir-oc debe retornar 400 cuando el estado no es APROBADO_GT');
    const body = (await r.json()) as any;
    assert.equal(body.success, false, 'La respuesta debe indicar fallo');
    assert.ok(
      body.message.includes('APROBADO_GT') || body.message.includes('aprobado'),
      `El mensaje debe indicar que se requiere estado APROBADO_GT. Mensaje: "${body.message}"`
    );

    // Verificar que NO se creó ninguna OC
    const ocs = await prisma.ordenCompra.findMany({
      where: { tenant_id: seeded.tenantId },
    });
    assert.equal(ocs.length, 0, 'No debe crearse ninguna OC con estado incorrecto');

    console.log('ok - 11.4 convertir-oc con estado EN_APROBACION_GT → 400 (requiere APROBADO_GT)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 11.5: OC generada solo con renglones aprobacion_gt=APROBADO ─────────
// Seed: cuadro APROBADO_GT con 2 renglones (1 APROBADO, 1 RECHAZADO por GT)
// Expectativa: la OC solo incluye el renglón aprobado

async function testOcSoloConRenglonesAprobadosGT() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const presupuestoId = randomUUID();

  try {
    const proveedor = await prisma.proveedor.create({
      data: {
        tenant_id: tenantId,
        rfc_tax_id: `RFC-OC5-${Date.now().toString().slice(-8)}`,
        razon_social: 'Proveedor OC Parcial Test',
        estatus: 'ACTIVO',
      },
    });

    const cuadro = await prisma.cuadroComparativo.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        requisicion_id: randomUUID(),
        codigo: `CC-OC5-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        estado: 'APROBADO_GT',
        evaluacion_residente_id: userId,
        fecha_evaluacion_tecnica: new Date(),
        gerente_tecnico_id: userId,
        fecha_aprobacion_gt: new Date(),
      },
    });

    // Renglón APROBADO por GT y ganador
    const detalleAprobado = await prisma.comparativaDetalle.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        cuadro_id: cuadro.id_cuadro,
        proveedor_id: proveedor.id_proveedor,
        insumo_id: randomUUID(),
        precio_ofertado: '8000.0000',
        es_ganador: true,
        evaluacion_tecnica: 'APROBADO',
        aprobacion_gt: 'APROBADO',
      },
    });

    // Renglón RECHAZADO por GT — NO debe aparecer en la OC
    await prisma.comparativaDetalle.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        cuadro_id: cuadro.id_cuadro,
        proveedor_id: proveedor.id_proveedor,
        insumo_id: randomUUID(),
        precio_ofertado: '3000.0000',
        es_ganador: false,     // no es ganador
        evaluacion_tecnica: 'APROBADO',
        aprobacion_gt: 'RECHAZADO',  // rechazado por GT → no debe ir a OC
        comentario_gt: 'Precio elevado. Rechazado.',
      },
    });

    const tokenProcurement = signTenantToken({
      userId, tenantId, proyectoId, roles: ['procurement'],
    });

    const r = await post(
      `/api/v1/compras/comparativas/${cuadro.id_cuadro}/convertir-oc`,
      tokenProcurement,
      { presupuesto_id: presupuestoId }
    );

    assert.equal(r.status, 201, 'convertir-oc debe retornar 201');
    const body = (await r.json()) as any;
    assert.equal(body.success, true);

    // Verificar OC en BD — solo debe tener el renglón aprobado por GT
    const ocItems = await prisma.ordenCompraItem.findMany({
      where: { tenant_id: tenantId },
    });

    assert.equal(ocItems.length, 1, 'La OC debe contener exactamente 1 ítem (solo el aprobado por GT)');
    assert.equal(
      ocItems[0].insumo_id === detalleAprobado.insumo_id,
      true,
      'El ítem de OC debe corresponder al renglón con aprobacion_gt=APROBADO'
    );

    // El precio del ítem debe corresponder al aprobado ($8000)
    const precioOc = Number(ocItems[0].precio_unitario);
    assert.equal(precioOc, 8000, 'El precio del ítem de OC debe ser $8,000 (el renglón aprobado)');

    console.log('ok - 11.5 OC generada solo con renglones aprobacion_gt=APROBADO (renglón RECHAZADO_GT excluido)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();

  try {
    await testHappyPathCompleto();                              // 11.1
    await testGTNoPuedeAprobarRenglonRechazadoPorResidente();  // 11.2
    await testTodosRengloneRechazadosGTResultaEnRechazadoGT(); // 11.3
    await testConvertirOcRequiereAprobadoGT();                 // 11.4
    await testOcSoloConRenglonesAprobadosGT();                 // 11.5
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - cuadro-comparativo-dos-etapas integration tests');
  console.error(error);
  process.exitCode = 1;
});

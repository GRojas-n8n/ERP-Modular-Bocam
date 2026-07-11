/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: consumo de auth.centro_costos_creado en gerencia-tecnica
 * Spec:  openspec/changes/evento-centro-costos-creado/
 * Tareas: 2.3, 2.4 del tasks.md (Grupo 2 — reemplaza el getOrCreate perezoso)
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as GtPrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const gtDbUrl = process.env.GERENCIA_TECNICA_DATABASE_URL
  || process.env.DATABASE_URL
  || 'postgresql://bocam_admin:S77S.52p-016t4t5n7nt@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const gtPrisma = new GtPrismaClient({ datasources: { db: { url: gtDbUrl } } });

async function cleanupTenantData(tenantId: string) {
  await gtPrisma.categoriaGasto.deleteMany({ where: { tenant_id: tenantId } });
  await gtPrisma.proyectoCostosConfig.deleteMany({ where: { tenant_id: tenantId } });
}

async function main() {
  process.env.GERENCIA_TECNICA_DATABASE_URL = gtDbUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const gtModule = await import('../../src/main');
  let gtServer: import('node:http').Server | undefined;

  try {
    const started = await startHttpApp(gtModule.app);
    gtServer = started.server;
    const baseUrl = started.baseUrl;

    const testEvent = {
      event_type: 'auth.centro_costos_creado',
      timestamp: new Date().toISOString(),
      context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        proyecto_id: proyectoId,
        codigo_centro_costos: 'HCO2026007001',
        empresa_grupo: 'HCO',
        anio_centro_costos: 2026,
        cliente_id: randomUUID(),
        es_especial: false,
        estatus: 'ABIERTO',
        nombre_oficial: 'Proyecto Prueba Evento GT',
        fecha_creacion: new Date().toISOString(),
      },
    };

    // ── Test 2.3: evento nuevo crea ProyectoCostosConfig + 10 categorías ──
    await gtModule.handleCentroCostosCreadoEvent(testEvent);

    const config = await gtPrisma.proyectoCostosConfig.findUnique({
      where: { uq_proyecto_costos_config: { tenant_id: tenantId, proyecto_id: proyectoId } },
    });
    assert.ok(config, 'debe crearse ProyectoCostosConfig al recibir el evento');
    assert.equal(config!.estado, 'CONFIGURACION');

    const categorias = await gtPrisma.categoriaGasto.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });
    assert.equal(categorias.length, 10, 'deben sembrarse las 10 categorías predefinidas');
    assert.ok(categorias.every((c) => c.es_predefinida), 'las 10 categorías deben quedar marcadas como predefinidas');
    console.log('ok 2.3 - auth.centro_costos_creado crea ProyectoCostosConfig + siembra 10 categorías predefinidas');

    // ── Test 2.4: reentrega del mismo evento no duplica fila ni categorías ──
    await gtModule.handleCentroCostosCreadoEvent(testEvent);
    await gtModule.handleCentroCostosCreadoEvent(testEvent);

    const configCount = await gtPrisma.proyectoCostosConfig.count({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });
    assert.equal(configCount, 1, 'idempotencia: sigue habiendo 1 sola fila de ProyectoCostosConfig tras 3 llamadas');

    const categoriasCount = await gtPrisma.categoriaGasto.count({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });
    assert.equal(categoriasCount, 10, 'idempotencia: siguen siendo 10 categorías, no 20 ni 30');
    console.log('ok 2.4 - reentrega del evento no duplica ProyectoCostosConfig ni las categorías (upsert/findUnique idempotente)');

    // ── Test adicional: si el fallback perezoso ya creó la fila antes del evento, el evento no duplica ──
    const proyectoIdFallback = randomUUID();
    const token = signTenantToken({
      userId,
      tenantId,
      proyectoId: proyectoIdFallback,
      roles: ['gerencia_tecnica', 'admin'],
      projects: [proyectoIdFallback],
    });

    // Dispara el fallback perezoso real (GET /categorias-gasto → getOrCreateProyectoConfig)
    const fallbackResp = await fetch(
      `${baseUrl}/api/v1/gerencia-tecnica/proyectos/${proyectoIdFallback}/categorias-gasto`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(fallbackResp.status, 200, 'el fallback perezoso vía GET debe seguir funcionando');

    const configPrevio = await gtPrisma.proyectoCostosConfig.findUnique({
      where: { uq_proyecto_costos_config: { tenant_id: tenantId, proyecto_id: proyectoIdFallback } },
    });
    assert.ok(configPrevio, 'el fallback perezoso debe haber creado ProyectoCostosConfig antes del evento');

    // Ahora llega el evento para el MISMO proyecto que el fallback ya tocó
    await gtModule.handleCentroCostosCreadoEvent({
      ...testEvent,
      context: { tenant_id: tenantId, proyecto_id: proyectoIdFallback, user_id: userId },
      payload: { ...testEvent.payload, proyecto_id: proyectoIdFallback },
    });

    const configCountFallback = await gtPrisma.proyectoCostosConfig.count({
      where: { tenant_id: tenantId, proyecto_id: proyectoIdFallback },
    });
    assert.equal(configCountFallback, 1, 'el evento no debe duplicar la fila creada por el fallback perezoso');

    const categoriasCountFallback = await gtPrisma.categoriaGasto.count({
      where: { tenant_id: tenantId, proyecto_id: proyectoIdFallback },
    });
    assert.equal(categoriasCountFallback, 10, 'el evento no debe duplicar las categorías ya sembradas por el fallback perezoso');
    console.log('ok 2.4b - evento no duplica la fila/categorías cuando el fallback perezoso ya tocó el proyecto primero');

    console.log('ok - integración evento-centro-costos-creado (gerencia-tecnica): creación proactiva + idempotencia verificadas');
  } finally {
    await stopHttpApp(gtServer);
    await cleanupTenantData(tenantId);
    await gtPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integración evento-centro-costos-creado (gerencia-tecnica)');
  console.error(error);
  process.exitCode = 1;
});

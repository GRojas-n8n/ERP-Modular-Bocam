import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as GtPrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const gtDbUrl = process.env.GERENCIA_TECNICA_DATABASE_URL
  || process.env.DATABASE_URL
  || 'postgresql://bocam_admin:S77S.52p-016t4t5n7nt@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const gtPrisma = new GtPrismaClient({ datasources: { db: { url: gtDbUrl } } });

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function cleanupTenantData(tenantId: string) {
  await gtPrisma.$executeRawUnsafe(
    `DELETE FROM gerencia_tecnica.proyectos_obra_vinculados WHERE tenant_id = $1::uuid`,
    tenantId
  );
}

async function main() {
  process.env.GERENCIA_TECNICA_DATABASE_URL = gtDbUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const userId     = randomUUID();

  const gtModule = await import('../../src/main');
  let gtServer: import('node:http').Server | undefined;

  try {
    const started = await startHttpApp(gtModule.app);
    gtServer  = started.server;
    const baseUrl = started.baseUrl;
    await delay(300);

    const token = signTenantToken({
      userId,
      tenantId,
      proyectoId,
      roles: ['gerencia_tecnica', 'admin'],
      projects: [proyectoId],
    });

    const cotizacionId   = randomUUID();
    const testEvent = {
      event_type: 'ventas.cotizacion_aceptada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        cotizacion_id:    cotizacionId,
        proyecto_id:      proyectoId,
        cliente_nombre:   'Inmobiliaria Test SA de CV',
        monto_contrato:   12500000,
        moneda:           'MXN',
        fecha_aceptacion: '2026-07-01',
      },
    };

    // ── Test 1: handleCotizacionAceptadaEvent crea ProyectoObraVinculado ──
    await gtModule.handleCotizacionAceptadaEvent(testEvent);

    const vinculo = await gtPrisma.$queryRawUnsafe<any[]>(
      `SELECT cotizacion_id::text, estado, cliente_nombre, monto_contrato::numeric AS monto FROM gerencia_tecnica.proyectos_obra_vinculados WHERE tenant_id = $1::uuid AND cotizacion_id = $2::uuid`,
      tenantId,
      cotizacionId,
    );
    assert.equal(vinculo.length, 1, 'Debe existir exactamente 1 vínculo');
    assert.equal(vinculo[0].estado, 'SIN_PRESUPUESTO');
    assert.equal(vinculo[0].cliente_nombre, 'Inmobiliaria Test SA de CV');
    assert.equal(Number(vinculo[0].monto), 12500000);
    console.log('ok 1 - ventas.cotizacion_aceptada → ProyectoObraVinculado SIN_PRESUPUESTO creado');

    // ── Test 2: Idempotencia — mismo evento no duplica el vínculo ──
    await gtModule.handleCotizacionAceptadaEvent(testEvent);
    await gtModule.handleCotizacionAceptadaEvent(testEvent);

    const countVinculos = await gtPrisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) AS c FROM gerencia_tecnica.proyectos_obra_vinculados WHERE tenant_id = $1::uuid AND cotizacion_id = $2::uuid`,
      tenantId,
      cotizacionId,
    );
    assert.equal(Number(countVinculos[0].c), 1, 'Idempotencia: sigue siendo 1 vínculo después de 3 llamadas');
    console.log('ok 2 - evento duplicado ignorado (upsert idempotente)');

    // ── Test 3: GET /proyectos-vinculados incluye el vínculo recién creado ──
    const listResp = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/proyectos-vinculados`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(listResp.status, 200, `GET /proyectos-vinculados: esperado 200, obtenido ${listResp.status}`);
    const listData = (await listResp.json()) as any;
    const items: any[] = listData.data ?? listData;
    const found = items.find((i: any) => i.cotizacion_id === cotizacionId);
    assert.ok(found, 'El vínculo debe aparecer en GET /proyectos-vinculados');
    assert.equal(found.estado, 'SIN_PRESUPUESTO');
    assert.equal(found.cliente_nombre, 'Inmobiliaria Test SA de CV');
    console.log('ok 3 - GET /proyectos-vinculados retorna vínculo con estado SIN_PRESUPUESTO');

    // ── Test 4: GET /proyectos-vinculados?estado=SIN_PRESUPUESTO filtra correctamente ──
    const filtradoResp = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/proyectos-vinculados?estado=SIN_PRESUPUESTO`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(filtradoResp.status, 200);
    const filtradoData = (await filtradoResp.json()) as any;
    const filtradoItems: any[] = filtradoData.data ?? filtradoData;
    const foundFiltrado = filtradoItems.find((i: any) => i.cotizacion_id === cotizacionId);
    assert.ok(foundFiltrado, 'Debe aparecer con filtro ?estado=SIN_PRESUPUESTO');
    console.log('ok 4 - filtro ?estado=SIN_PRESUPUESTO funciona correctamente');

    console.log('ok - integración ventas-a-obra: vínculo creado, idempotente, visible en GET /proyectos-vinculados');

  } finally {
    await stopHttpApp(gtServer);
    await cleanupTenantData(tenantId);
    await gtPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integración ventas-a-obra');
  console.error(error);
  process.exitCode = 1;
});

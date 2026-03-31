import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as FinanzasPrismaClient } from '../../../finanzas/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import type { AsientoContableGeneradoPayload } from '../../src/types';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const finanzasDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas';
const contabilidadDbUrl = finanzasDbUrl.includes('schema=finanzas')
  ? finanzasDbUrl.replace('schema=finanzas', 'schema=contabilidad')
  : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

const finanzasPrisma = new FinanzasPrismaClient({
  datasources: {
    db: {
      url: finanzasDbUrl,
    },
  },
});

const contabilidadPrisma = new ContabilidadPrismaClient({
  datasources: {
    db: {
      url: contabilidadDbUrl,
    },
  },
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(assertion: () => Promise<void>, timeoutMs = 12000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await assertion();
      return;
    } catch {
      await delay(250);
    }
  }

  await assertion();
}

async function cleanupTenantData(tenantId: string) {
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
  await finanzasPrisma.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedScenario() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const origen = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-ORI-${Date.now()}`,
      descripcion: 'Presupuesto origen para transferencia',
      monto_autorizado: 30000,
      monto_disponible: 25000,
      monto_comprometido: 0,
      monto_ejercido: 0,
      capitulo: 'MATERIALES',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  const destino = await finanzasPrisma.presupuestoAsignado.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      codigo: `PRES-DES-${Date.now()}`,
      descripcion: 'Presupuesto destino para transferencia',
      monto_autorizado: 10000,
      monto_disponible: 4000,
      monto_comprometido: 0,
      monto_ejercido: 0,
      capitulo: 'SUBCONTRATOS',
      moneda: 'MXN',
      estatus: 'ACTIVO',
    },
  });

  return {
    tenantId,
    proyectoId,
    userId,
    origenId: origen.id_presupuesto,
    destinoId: destino.id_presupuesto,
  };
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.FINANZAS_DATABASE_URL = finanzasDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const finanzasModule = await import('../../../finanzas/src/main');
  const contabilidadModule = await import('../../src/main');
  const seeded = await seedScenario();
  const transferenciaId = randomUUID();
  const probe = createEventBus(`contabilidad-probe-${randomUUID()}`);
  const receivedGeneratedEvents: BocamEvent<AsientoContableGeneradoPayload>[] = [];

  let finanzasServer: import('node:http').Server | undefined;
  let finanzasBaseUrl = '';

  try {
    await finanzasModule.initEventBus();
    await contabilidadModule.initEventBus();
    await probe.connect();
    await probe.subscribe('contabilidad.asiento_contable_generado', async (event: BocamEvent<AsientoContableGeneradoPayload>) => {
      receivedGeneratedEvents.push(event);
    });

    const started = await startHttpApp(finanzasModule.app);
    finanzasServer = started.server;
    finanzasBaseUrl = started.baseUrl;
    await delay(500);

    const token = signTenantToken({
      userId: seeded.userId,
      tenantId: seeded.tenantId,
      proyectoId: seeded.proyectoId,
      roles: ['finance'],
      projects: [seeded.proyectoId],
      limiteAprobacion: 999999999,
    });

    const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/transferencias-presupuestales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transferencia_id: transferenciaId,
        presupuesto_origen_id: seeded.origenId,
        presupuesto_destino_id: seeded.destinoId,
        monto: 3500,
        concepto: 'Transferencia interna entre capitulos',
      }),
    });

    assert.equal(response.status, 201);
    const body = await response.json() as any;
    assert.equal(body.success, true);

    await waitFor(async () => {
      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: seeded.tenantId,
          external_event_key: `finanzas.transferencia_presupuestal:${transferenciaId}`,
        },
      });

      assert.equal(asiento.tipo_poliza, 'TRANSFERENCIA_INTERNA');
      assert.equal(asiento.estatus, 'REGISTRADO');
      assert.ok(asiento.folio_poliza.startsWith('POL-TRF-'));
    });

    assert.equal(receivedGeneratedEvents.length, 1);
    assert.equal(receivedGeneratedEvents[0]?.payload.referencia_id, transferenciaId);

    const response2 = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/transferencias-presupuestales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transferencia_id: transferenciaId,
        presupuesto_origen_id: seeded.origenId,
        presupuesto_destino_id: seeded.destinoId,
        monto: 3500,
        concepto: 'Transferencia interna entre capitulos',
      }),
    });

    assert.equal(response2.status, 201);
    const body2 = await response2.json() as any;
    assert.equal(body2.data.idempotente, true);
    await delay(800);

    const totalAsientos = await contabilidadPrisma.asientoContable.count({
      where: {
        tenant_id: seeded.tenantId,
        external_event_key: `finanzas.transferencia_presupuestal:${transferenciaId}`,
      },
    });

    assert.equal(totalAsientos, 1);
    assert.equal(receivedGeneratedEvents.length, 1);
    console.log('ok - integracion real finanzas.transferencia_presupuestal -> contabilidad genera poliza interna');
  } finally {
    await stopHttpApp(finanzasServer);
    await probe.close();
    await contabilidadModule.shutdownEventBus();
    await finanzasModule.shutdownEventBus();
    await cleanupTenantData(seeded.tenantId);
    await contabilidadPrisma.$disconnect();
    await finanzasPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integracion finanzas.transferencia_presupuestal -> contabilidad');
  console.error(error);
  process.exitCode = 1;
});

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import {
  handleAvanceFisicoValidadoEvent,
  handleEstimacionAprobadaEvent,
  handleOrdenCompraCanceladaEvent,
  handleOrdenCompraCreadaEvent,
} from '../../src/main';

const prisma = new PrismaClient();

const originalError = console.error;
const capturedErrors: string[] = [];

console.error = (...args: unknown[]) => {
  const line = args.map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join(' ');
  capturedErrors.push(line);
  originalError(...args);
};

async function assertNoSideEffects(tenantId: string) {
  const movimientos = await prisma.movimientoPresupuestal.count({
    where: { tenant_id: tenantId },
  });
  const pagos = await prisma.programaPagos.count({
    where: { tenant_id: tenantId },
  });

  assert.equal(movimientos, 0);
  assert.equal(pagos, 0);
}

async function main() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  try {
    await handleOrdenCompraCreadaEvent({
      event_type: 'compras.oc_creada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: randomUUID(),
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        oc_id: randomUUID(),
        codigo: 'OC-INVALIDA-001',
        total: 1500,
      },
    });

    await handleOrdenCompraCanceladaEvent({
      event_type: 'compras.oc_cancelada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: randomUUID(),
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        oc_id: randomUUID(),
        codigo: 'OC-INVALIDA-002',
        presupuesto_id: randomUUID(),
      },
    });

    await handleEstimacionAprobadaEvent({
      event_type: 'control_obra.estimacion_aprobada',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: randomUUID(),
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        estimacion_id: randomUUID(),
        codigo: 'EST-INVALIDA-001',
        total_neto: 4200,
      },
    });

    await handleAvanceFisicoValidadoEvent({
      event_type: 'control_obra.avance_fisico_validado',
      timestamp: new Date().toISOString(),
      context: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        user_id: randomUUID(),
        correlation_id: `corr-${randomUUID()}`,
      },
      payload: {
        avance_id: randomUUID(),
        concepto: 'CIM-INVALIDO',
        importe: 1800,
      },
    });

    await assertNoSideEffects(tenantId);

    assert.ok(
      capturedErrors.some((line) => line.includes('"action":"finanzas.event.orden_compra_creada.invalid_payload"'))
    );
    assert.ok(
      capturedErrors.some((line) => line.includes('"action":"finanzas.event.orden_compra_cancelada.invalid_payload"'))
    );
    assert.ok(
      capturedErrors.some((line) => line.includes('"action":"finanzas.event.estimacion_aprobada.invalid_payload"'))
    );
    assert.ok(
      capturedErrors.some((line) => line.includes('"action":"finanzas.event.avance_fisico_validado.invalid_payload"'))
    );

    console.log('ok - contratos invalidos de eventos no generan efectos financieros');
  } finally {
    console.error = originalError;
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - contratos invalidos de eventos en finanzas');
  console.error(error);
  console.error = originalError;
  process.exitCode = 1;
});

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { handleCentroCostosCreadoEvent } from '../../src/main';

const originalLog = console.log;
const capturedLogs: string[] = [];
console.log = (...args: unknown[]) => {
  capturedLogs.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
};

async function main() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const correlationId = `corr-${randomUUID()}`;

  const event = {
    event_type: 'auth.centro_costos_creado',
    timestamp: new Date().toISOString(),
    context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID(), correlation_id: correlationId },
    payload: {
      proyecto_id: proyectoId,
      codigo_centro_costos: 'HCO2026014001',
      empresa_grupo: 'HCO',
      anio_centro_costos: 2026,
      cliente_id: randomUUID(),
      es_especial: false,
      estatus: 'ABIERTO',
      nombre_oficial: 'Proyecto Prueba Evento Almacén',
      fecha_creacion: new Date().toISOString(),
    },
  } as any;

  await assert.doesNotReject(() => handleCentroCostosCreadoEvent(event), 'el handler no debe lanzar (el mensaje debe poder confirmarse/ack sin error)');

  const linea = capturedLogs.find((l) => l.includes('"action":"almacen.event.centro_costos_creado.registrado"'));
  assert.ok(linea, 'debe quedar un registro de auditoría/log estructurado');
  assert.ok(linea!.includes(`"tenant_id":"${tenantId}"`));
  assert.ok(linea!.includes(`"proyecto_id":"${proyectoId}"`));
  assert.ok(linea!.includes('"codigo_centro_costos":"HCO2026014001"'));

  console.log = originalLog;
  console.log('ok - almacen registra auth.centro_costos_creado sin lanzar excepción');
}

void main().catch((error) => {
  console.log = originalLog;
  console.error('not ok - integración evento-centro-costos-creado (almacen)');
  console.error(error);
  process.exitCode = 1;
});

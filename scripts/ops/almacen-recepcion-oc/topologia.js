/**
 * Topología de colas de Almacén para `compras.recepcion_oc_registrada.v1` (change fix-ingresos-almacen-por-recepcion-oc).
 *
 *   verificar     Solo lectura. Comprueba que `.v3` (y su `.retry`/`.dlq`) están operativas.
 *   desvincular   Quita ÚNICAMENTE el binding de la cola `.v2` al exchange. No borra colas ni mensajes.
 *
 * Por defecto NO modifica nada: `desvincular` es simulación salvo que se pase `--ejecutar`, y se niega a actuar
 * si `.v3` no está operativa o si `.v2` tiene mensajes.
 *
 * Uso en producción (RABBITMQ_URL y amqplib ya existen en el contenedor de Almacén; el script viaja por stdin):
 *   docker exec -i bocam-vps-almacen node - verificar < scripts/ops/almacen-recepcion-oc/topologia.js
 *   docker exec -i bocam-vps-almacen node - desvincular < scripts/ops/almacen-recepcion-oc/topologia.js
 *   docker exec -i bocam-vps-almacen node - desvincular --ejecutar < scripts/ops/almacen-recepcion-oc/topologia.js
 * Los bindings no se pueden listar por AMQP; se comprueban con `rabbitmqctl list_bindings` (ver
 * docs/operacion/almacen-cola-recepcion-oc-v3.md).
 */
'use strict';

const EXCHANGE = 'bocam.events';
const EVENTO = 'compras.recepcion_oc_registrada.v1';
const COLA_V3 = 'almacen.compras_recepcion_oc_registrada_v1.v3';
const COLA_V2 = 'almacen.compras_recepcion_oc_registrada_v1.v2';

/** Argumentos que DEBE tener `.v3`. Declarar una cola con argumentos distintos falla (PRECONDITION_FAILED). */
function argumentosEsperadosV3(cola) {
  return { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': `${cola}.dlq` };
}

/** Estado de una cola sin crearla. `null` si no existe. Usa un canal propio: un error cierra el canal. */
async function estadoCola(connection, cola) {
  const channel = await connection.createChannel();
  channel.on('error', () => undefined);
  try {
    const ok = await channel.checkQueue(cola);
    return { existe: true, mensajes: ok.messageCount, consumidores: ok.consumerCount };
  } catch {
    return null;
  } finally {
    await channel.close().catch(() => undefined);
  }
}

/** true si la cola existe con exactamente esos argumentos (sin `x-message-ttl`, con dead-letter). */
async function tieneArgumentos(connection, cola, argumentos) {
  const channel = await connection.createChannel();
  channel.on('error', () => undefined);
  try {
    await channel.assertQueue(cola, { durable: true, arguments: argumentos });
    return true;
  } catch {
    return false;
  } finally {
    await channel.close().catch(() => undefined);
  }
}

/** Comprobaciones de solo lectura. Devuelve { operativa, problemas, detalle }. */
async function verificar(connection, opciones = {}) {
  const cola = opciones.colaV3 || COLA_V3;
  const colaV2 = opciones.colaV2 || COLA_V2;
  const problemas = [];
  const detalle = {};

  const v3 = await estadoCola(connection, cola);
  const retry = await estadoCola(connection, `${cola}.retry`);
  const dlq = await estadoCola(connection, `${cola}.dlq`);
  const v2 = await estadoCola(connection, colaV2);
  detalle.v3 = v3; detalle.retry = retry; detalle.dlq = dlq; detalle.v2 = v2;

  if (!v3) problemas.push(`la cola ${cola} no existe`);
  else if (v3.consumidores < 1) problemas.push(`la cola ${cola} no tiene consumidor activo`);
  if (!retry) problemas.push(`la cola ${cola}.retry no existe`);
  if (!dlq) problemas.push(`la cola ${cola}.dlq no existe`);
  if (v3 && !(await tieneArgumentos(connection, cola, argumentosEsperadosV3(cola)))) {
    problemas.push(`la cola ${cola} no tiene los argumentos esperados (sin x-message-ttl y con dead-letter a su DLQ)`);
  }
  return { operativa: problemas.length === 0, problemas, detalle };
}

/**
 * Quita el binding `.v2` → exchange. Nunca borra colas ni mensajes. Sin `ejecutar` solo informa.
 * Se niega si `.v3` no está operativa o si `.v2` tiene mensajes.
 */
async function desvincularV2(connection, opciones = {}) {
  const colaV2 = opciones.colaV2 || COLA_V2;
  const estado = await verificar(connection, opciones);
  const problemas = [...estado.problemas];
  if (!estado.detalle.v2) problemas.push(`la cola ${colaV2} no existe; no hay nada que desvincular`);
  else if (estado.detalle.v2.mensajes > 0) problemas.push(`la cola ${colaV2} tiene ${estado.detalle.v2.mensajes} mensaje(s); no se desvincula`);
  if (problemas.length > 0) return { ejecutado: false, motivo: 'PRECONDICION_NO_CUMPLIDA', problemas, detalle: estado.detalle };
  if (!opciones.ejecutar) return { ejecutado: false, motivo: 'SIMULACION', problemas: [], detalle: estado.detalle };

  const channel = await connection.createChannel();
  try {
    await channel.unbindQueue(colaV2, EXCHANGE, EVENTO);
  } finally {
    await channel.close().catch(() => undefined);
  }
  return { ejecutado: true, motivo: 'DESVINCULADA', problemas: [], detalle: estado.detalle };
}

async function cli() {
  const amqplib = require('amqplib');
  const [, , comando, ...flags] = process.argv;
  const connection = await amqplib.connect(process.env.RABBITMQ_URL);
  try {
    if (comando === 'verificar') {
      const r = await verificar(connection);
      console.log(JSON.stringify(r, null, 2));
      process.exitCode = r.operativa ? 0 : 1;
    } else if (comando === 'desvincular') {
      const r = await desvincularV2(connection, { ejecutar: flags.includes('--ejecutar') });
      console.log(JSON.stringify(r, null, 2));
      process.exitCode = r.ejecutado || r.motivo === 'SIMULACION' ? 0 : 1;
    } else {
      console.error('Uso: topologia.js <verificar|desvincular [--ejecutar]>');
      process.exitCode = 2;
    }
  } finally {
    await connection.close().catch(() => undefined);
  }
}

module.exports = { verificar, desvincularV2, estadoCola, tieneArgumentos, argumentosEsperadosV3, EXCHANGE, EVENTO, COLA_V3, COLA_V2 };

// `require.main` es undefined cuando el script llega por stdin (`node -`).
if (require.main === module || require.main === undefined) {
  cli().catch((error) => { console.error(error.message); process.exit(1); });
}

/**
 * Test de Integración (arranque real, RabbitMQ real): activación del despachador del outbox de Compras
 * Change: fix-ingresos-almacen-por-recepcion-oc
 *
 * El despachador está APAGADO por defecto: solo COMPRAS_OUTBOX_DISPATCHER=on (valor exacto) lo enciende. Con el valor
 * ausente, vacío, `off` o inválido el servicio arranca, registra `dispatcher disabled`, sigue guardando eventos en el
 * outbox pero NO publica ni marca ninguno como publicado, y `/ready` informa el estado intencional sin tratarlo como fallo.
 *
 * Cada caso arranca `startServer()` en un proceso hijo con su propio entorno, contra un broker real con una cola enlazada
 * al exchange para observar si algo se publica.
 *
 * Runner: npm run test:integration:outbox-dispatcher-arranque -w @bocam/compras
 * Requiere: PostgreSQL (DATABASE_URL → schema compras) y RabbitMQ (RABBITMQ_URL).
 */

import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const HIJO = process.argv.includes('--hijo');
const MARCA = '@@RESULTADO@@';
const EVENTO = 'compras.recepcion_oc_registrada.v1';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Proceso hijo: arranca el servicio real y reporta lo observado ─────────────────────────────────────────────
async function hijo() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
  process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
  process.env.PORT = String(45000 + Math.floor(Math.random() * 2000));
  process.env.COMPRAS_OUTBOX_INTERVALO_MS = '150';
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
  process.env.DATABASE_URL = dbUrl;

  const logs: string[] = [];
  const paso = (texto: string) => { process.stderr.write(`[hijo ${new Date().toISOString()}] ${texto}
`); };
  const original = { log: console.log, warn: console.warn, error: console.error };
  // Si algo se cuelga, el hijo lo reporta con lo último que registró en vez de quedar mudo hasta el tiempo límite del padre.
  const terminarConError = (motivo: string) => {
    process.stdout.write(`
${MARCA}${JSON.stringify({ errorDelHijo: `${motivo}; últimos registros: ${JSON.stringify(logs.slice(-12))}` })}
`);
    process.exit(0);
  };
  process.on('uncaughtException', (error) => terminarConError(`excepción no controlada: ${String(error?.stack ?? error)}`));
  process.on('unhandledRejection', (razon: any) => terminarConError(`promesa rechazada sin manejar: ${String(razon?.stack ?? razon)}`));
  const vigilante = setTimeout(() => {
    process.stdout.write(`
${MARCA}${JSON.stringify({ errorDelHijo: `sin terminar tras 60 s; últimos registros: ${JSON.stringify(logs.slice(-12))}` })}
`);
    process.exit(0);
  }, 60_000);
  for (const nivel of ['log', 'warn', 'error'] as const) {
    console[nivel] = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); };
  }

  const amqplib = await import('amqplib');
  const { PrismaClient } = await import('../../src/generated/prisma');
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const tenantId = randomUUID(); const proyectoId = randomUUID(); const eventId = randomUUID(); const recepcionId = randomUUID();
  const cola = `arranque-e2e-${randomUUID()}`;
  const conexion = await amqplib.connect(process.env.RABBITMQ_URL as string);
  const canal = await conexion.createChannel();
  let resultado: Record<string, unknown> = {};
  try {
    await canal.assertExchange('bocam.events', 'topic', { durable: true });
    await canal.assertQueue(cola, { durable: false, autoDelete: true });
    await canal.bindQueue(cola, 'bocam.events', EVENTO);

    paso('importando main');
    const mod = await import('../../src/main');
    paso('arrancando startServer');
    const server = await (mod as any).startServer();
    paso('startServer devolvió el servidor');
    const base = `http://127.0.0.1:${process.env.PORT}`;
    let ready: { status: number; body: any } | undefined;
    for (let i = 0; i < 100; i++) { // el bus se conecta después de abrir el puerto
      try {
        const r = await fetch(`${base}/ready`);
        ready = { status: r.status, body: await r.json() };
        if (ready.body?.checks?.event_bus === 'ok') break;
      } catch { /* aún no escucha */ }
      await delay(100);
    }

    paso(`/ready inicial: ${ready?.status} ${JSON.stringify(ready?.body?.checks)}`);
    // La recepción guarda su evento en el outbox (lo que hace registrarEventoRecepcion dentro de la transacción).
    await (prisma as any).outboxEvento.create({
      data: {
        id_evento: eventId, tenant_id: tenantId, proyecto_id: proyectoId, orden_id: randomUUID(), recepcion_id: recepcionId,
        event_type: EVENTO, event_version: 1,
        payload: {
          event_id: eventId, event_version: 1, occurred_at: new Date().toISOString(), tenant_id: tenantId, proyecto_id: proyectoId, recepcion_id: recepcionId,
          items: [{ recepcion_item_id: randomUUID(), orden_item_id: randomUUID(), insumo_id: randomUUID(), cantidad_recibida: 3, clave: 'K', descripcion: 'D', unidad: 'PZA', categoria: 'MATERIAL' }],
        },
      },
    });
    paso('evento sembrado; esperando tandas');
    await delay(1800); // más de diez tandas de 150 ms si el despachador estuviera encendido

    const fila = await (prisma as any).outboxEvento.findUnique({ where: { id_evento: eventId } });
    paso(`fila leída: ${fila?.estado}`);
    const r = await fetch(`${base}/ready`);
    resultado = {
      valorVisto: process.env.COMPRAS_OUTBOX_DISPATCHER === undefined ? '(ausente)' : process.env.COMPRAS_OUTBOX_DISPATCHER,
      readyInicial: ready,
      readyFinal: { status: r.status, body: await r.json() },
      fila: { estado: fila?.estado, intentos: fila?.intentos, publicado_en: fila?.publicado_en },
      mensajesEnLaCola: (await canal.checkQueue(cola)).messageCount,
      logDisabled: logs.some((l) => l.includes('dispatcher disabled')),
      logEnabled: logs.some((l) => l.includes('dispatcher enabled')),
    };
    server.close();
    paso('servidor cerrado');
  } catch (error: any) {
    resultado = { errorDelHijo: String(error?.stack ?? error) };
  } finally {
    clearTimeout(vigilante);
    paso('limpiando');
    await (prisma as any).outboxEvento.deleteMany({ where: { tenant_id: tenantId } }).catch(() => undefined);
    await canal.deleteQueue(cola).catch(() => undefined);
    await conexion.close().catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
    paso('limpio');
    Object.assign(console, original);
    process.stdout.write(`\n${MARCA}${JSON.stringify(resultado)}\n`);
    process.exit(0);
  }
}

// ── Proceso padre: un hijo por valor de la variable ───────────────────────────────────────────────────────────
function ejecutarCaso(valor: string | undefined, intento = 1): any {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.COMPRAS_OUTBOX_DISPATCHER;
  if (valor !== undefined) env.COMPRAS_OUTBOX_DISPATCHER = valor;
  const r = spawnSync(process.execPath, ['-r', 'ts-node/register/transpile-only', __filename, '--hijo'], { env, encoding: 'utf8', timeout: 90_000 });
  const linea = String(r.stdout).split('\n').reverse().find((l) => l.startsWith(MARCA));
  // Un proceso que muere sin dejar marcador ni salida (señal, falta de recursos del runner) no dice nada del producto:
  // se reintenta UNA vez y el reintento queda a la vista. Cualquier fallo con marcador, o un segundo silencio, sí falla.
  if (!linea && intento === 1 && !String(r.stderr).trim() && !String(r.stdout).trim()) {
    console.warn(`[aviso] el proceso hijo (valor ${JSON.stringify(valor)}) terminó sin reportar nada (estado ${r.status}, señal ${r.signal}, error ${r.error?.message}); se reintenta una vez`);
    return ejecutarCaso(valor, 2);
  }
  if (!linea) throw new Error(`el proceso hijo no reportó resultado (valor ${JSON.stringify(valor)}; estado ${r.status}, señal ${r.signal}, error ${r.error?.message}): stderr=${String(r.stderr).slice(-1200)} stdout=${String(r.stdout).slice(-400)}`);
  const resultado = JSON.parse(linea.slice(MARCA.length));
  if (resultado.errorDelHijo) throw new Error(`fallo en el hijo (valor ${JSON.stringify(valor)}): ${resultado.errorDelHijo}`.slice(0, 900));
  return resultado;
}

async function padre() {
  const assert = (await import('node:assert/strict')).default;
  let failed = false;
  try {
    const solo = process.argv.find((x) => x.startsWith('--solo='))?.slice(7); // depuración: --solo=on
    for (const valor of solo ? [] : [undefined, '', 'true', 'ON', 'off', '1']) {
      const r = ejecutarCaso(valor);
      const etiqueta = JSON.stringify(valor);
      assert.equal(r.fila.estado, 'PENDIENTE', `${etiqueta}: el evento sigue pendiente`);
      assert.equal(r.fila.intentos, 0, `${etiqueta}: sin intentos de publicación`);
      assert.equal(r.fila.publicado_en, null, `${etiqueta}: no se marcó publicado`);
      assert.equal(r.mensajesEnLaCola, 0, `${etiqueta}: no llegó ningún mensaje al broker`);
      assert.equal(r.logDisabled, true, `${etiqueta}: el arranque registra "dispatcher disabled"`);
      assert.equal(r.logEnabled, false);
      assert.equal(r.readyFinal.status, 200, `${etiqueta}: apagado intencional no es un fallo (200)`);
      assert.equal(r.readyFinal.body.checks.outbox_dispatcher, 'disabled', `${etiqueta}: /ready informa disabled`);
      assert.equal(r.readyFinal.body.checks.event_bus, 'ok');
      assert.equal(r.readyFinal.body.checks.database, 'ok');
      console.log(`[OK] COMPRAS_OUTBOX_DISPATCHER=${etiqueta}: arranca apagado, guarda pero no publica ni marca`);
    }

    const on = ejecutarCaso('on');
    assert.equal(on.fila.estado, 'PUBLICADO', '"on": publica y marca tras la confirmación del broker');
    assert.equal(on.mensajesEnLaCola, 1, '"on": el mensaje llegó a la cola enlazada');
    assert.equal(on.logEnabled, true);
    assert.equal(on.logDisabled, false);
    assert.equal(on.readyFinal.status, 200);
    assert.equal(on.readyFinal.body.checks.outbox_dispatcher, 'ok');
    console.log('[OK] COMPRAS_OUTBOX_DISPATCHER=on: solo con el valor explícito publica y marca');
  } catch (error: any) {
    failed = true;
    console.error('not ok - compras outbox dispatcher arranque e2e');
    console.error(error);
  }
  process.exit(failed ? 1 : 0);
}

void (HIJO ? hijo() : padre());

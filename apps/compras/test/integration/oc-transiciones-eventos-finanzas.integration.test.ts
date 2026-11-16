/**
 * Integración (PostgreSQL real): transiciones de estado de la OC provocadas por eventos de Finanzas.
 * Change: blindar-compromiso-oc-concurrencia-y-orden-eventos (segundo PR: Compras).
 *
 * Invariantes:
 *   - finanzas.fondos_comprometidos solo mueve PENDIENTE_CONFIRMACION_FINANZAS (o ERROR_FINANZAS) a EMITIDA;
 *     nunca cambia CANCELADA, CANCELACION_PENDIENTE, PARCIALMENTE_RECIBIDA, RECIBIDA ni estados heredados.
 *   - finanzas.presupuesto_insuficiente solo mueve PENDIENTE_CONFIRMACION_FINANZAS a ERROR_FINANZAS;
 *     nunca degrada una OC EMITIDA, en recepción, recibida o cancelada.
 *   - finanzas.fondos_liberados solo mueve CANCELACION_PENDIENTE a CANCELADA (el flujo real de cancelación fija
 *     CANCELACION_PENDIENTE antes de pedir la liberación); nunca cancela una OC emitida, en error, en recepción o recibida.
 *   - ERROR_FINANZAS → EMITIDA solo con un compromiso confirmado (movimiento) de la MISMA OC, tenant y proyecto.
 *   - Dos eventos concurrentes no dejan estados divergentes (estado de la OC vs. alerta de error).
 *   - Un evento duplicado es idempotente y no repite efectos.
 *
 * Runner: npm run test:integration:oc-transiciones-eventos-finanzas -w @bocam/compras
 * Requiere: PostgreSQL (schema compras en DATABASE_URL). No requiere RabbitMQ.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { PrismaClient } from '../../src/generated/prisma';
import { EventBus } from '../../../../packages/event-bus/src';
import {
  ESTADOS_OC,
  ESTADOS_OC_HEREDADOS,
  OC_STATUS,
  TRANSICIONES_EVENTO_FINANZAS,
} from '../../src/oc-estados';

const dbUrl =
  process.env.COMPRAS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// Captura de eventos publicados (observa la salida; no sustituye la concurrencia).
const published: Array<{ type: string; ocId?: string }> = [];
EventBus.prototype.publish = async function (event: any) {
  published.push({ type: event.event_type, ocId: event.payload?.oc_id });
  return true;
} as any;
const publicadosError = (ocId: string) => published.filter((e) => e.type === 'compras.oc_error_finanzas' && e.ocId === ocId).length;

let handleFondosComprometidosEvent: (e: any) => Promise<void>;
let handlePresupuestoInsuficienteEvent: (e: any) => Promise<void>;
let handleFondosLiberadosEvent: (e: any) => Promise<void>;
let comprasServer: Server | undefined;
let baseUrl = '';

// Registro de logs estructurados (para contar efectos aplicados vs. idempotentes).
const logs: string[] = [];
const consoleLog = console.log.bind(console);
console.log = (...args: unknown[]) => { logs.push(args.map(String).join(' ')); consoleLog(...args); };
const contarLogs = (accion: string, ocId: string) => logs.filter((l) => l.includes(`"action":"${accion}"`) && l.includes(ocId)).length;

const proveedores = new Map<string, string>();

/**
 * Limpieza de todo lo que crea esta suite. Es obligatoria: el esquema `compras` es compartido con otras pruebas del CI
 * y, en particular, las recepciones dejan filas PENDIENTES en el outbox que la prueba siguiente
 * (recepcion-oc-compras-almacen) despacharía completas.
 */
async function limpiar() {
  for (const tenantId of proveedores.keys()) {
    await (prisma as any).outboxEvento?.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.recepcionOCItem.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.recepcionOC.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.alertaOcError.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompraItem.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function proveedorDe(tenantId: string) {
  if (proveedores.has(tenantId)) return proveedores.get(tenantId)!;
  const p = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFC${randomUUID().slice(0, 9)}`, razon_social: 'Proveedor transiciones', estatus: 'ACTIVO' },
  });
  proveedores.set(tenantId, p.id_proveedor);
  return p.id_proveedor;
}

async function crearOc(tenantId: string, proyectoId: string, estado: string) {
  const oc = await prisma.ordenCompra.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: await proveedorDe(tenantId), codigo: `OC-TR-${randomUUID().slice(0, 8)}`,
      estado, subtotal: 1000, iva: 160, total: 1160, presupuesto_id: randomUUID(),
    },
  });
  return oc;
}

const ev = (tipo: string, tenantId: string, proyectoId: string, oc: { id_orden: string; codigo: string }) => ({
  event_type: tipo,
  timestamp: new Date().toISOString(),
  context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID(), correlation_id: `corr-${randomUUID()}` },
  payload: { referencia_oc_id: oc.id_orden, referencia_oc_codigo: oc.codigo, presupuesto_id: randomUUID(), movimiento_id: randomUUID(), monto_comprometido: 1160, monto_disponible_restante: 100, monto_liberado: 1160 },
});
const comprometidos = (t: string, p: string, oc: any) => handleFondosComprometidosEvent(ev('finanzas.fondos_comprometidos', t, p, oc) as any);
const insuficiente = (t: string, p: string, oc: any) => handlePresupuestoInsuficienteEvent(ev('finanzas.presupuesto_insuficiente', t, p, oc) as any);
const liberados = (t: string, p: string, oc: any) => handleFondosLiberadosEvent(ev('finanzas.fondos_liberados', t, p, oc) as any);
const filaCompleta = async (id: string) => JSON.stringify(await prisma.ordenCompra.findUniqueOrThrow({ where: { id_orden: id } }));
const token = (t: string, p: string) => signTenantToken({ userId: randomUUID(), tenantId: t, proyectoId: p, roles: ['procurement'], projects: [p] });

const estadoDe = async (id: string) => (await prisma.ordenCompra.findUniqueOrThrow({ where: { id_orden: id } })).estado;
const alertaDe = (tenantId: string, ocId: string) => prisma.alertaOcError.findUnique({ where: { tenant_id_oc_id: { tenant_id: tenantId, oc_id: ocId } } });
const todosLosEstados: string[] = [...ESTADOS_OC, ...ESTADOS_OC_HEREDADOS];

const results: Array<{ name: string; ok: boolean }> = [];
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); results.push({ name, ok: true }); console.log(`[OK]   ${name}`); }
  catch (e: any) { results.push({ name, ok: false }); console.log(`[FAIL] ${name}\n       ${String(e.message).split('\n')[0]}`); }
}
const settle = (ps: Array<Promise<unknown>>) => Promise.allSettled(ps);

async function main() {
  const compras = await import('../../src/main');
  handleFondosComprometidosEvent = compras.handleFondosComprometidosEvent;
  handlePresupuestoInsuficienteEvent = compras.handlePresupuestoInsuficienteEvent;
  handleFondosLiberadosEvent = compras.handleFondosLiberadosEvent;
  ({ server: comprasServer, baseUrl } = await startHttpApp(compras.app));

  await test('nombre canónico: el estado pendiente almacenado es PENDIENTE_CONFIRMACION_FINANZAS y el literal PENDIENTE_FINANZAS no existe como valor', () => {
    assert.equal(OC_STATUS.PENDIENTE_FINANZAS, 'PENDIENTE_CONFIRMACION_FINANZAS');
    assert.deepEqual([...ESTADOS_OC].sort(), [
      'CANCELACION_PENDIENTE', 'CANCELADA', 'EMITIDA', 'ERROR_FINANZAS', 'PARCIALMENTE_RECIBIDA', 'PENDIENTE_CONFIRMACION_FINANZAS', 'RECIBIDA',
    ]);
    const fuente = readFileSync(join(__dirname, '..', '..', 'src', 'main.ts'), 'utf8');
    assert.ok(!/['"`]PENDIENTE_FINANZAS['"`]/.test(fuente), "no debe haber el literal 'PENDIENTE_FINANZAS' como valor");
  });

  await test('matriz fondos_comprometidos: cada estado transiciona solo si está en la lista blanca', async () => {
    const t = randomUUID(), p = randomUUID();
    const permitidos = TRANSICIONES_EVENTO_FINANZAS.fondos_comprometidos.desde as readonly string[];
    const fallos: string[] = [];
    for (const estado of todosLosEstados) {
      const oc = await crearOc(t, p, estado);
      await comprometidos(t, p, oc);
      const esperado = permitidos.includes(estado) ? 'EMITIDA' : estado;
      const real = await estadoDe(oc.id_orden);
      if (real !== esperado) fallos.push(`${estado}: esperado ${esperado}, quedó ${real}`);
    }
    assert.deepEqual(fallos, [], fallos.join(' | '));
  });

  await test('matriz presupuesto_insuficiente: solo desde PENDIENTE_CONFIRMACION_FINANZAS; no crea alerta ni publica en el resto', async () => {
    const t = randomUUID(), p = randomUUID();
    const permitidos = TRANSICIONES_EVENTO_FINANZAS.presupuesto_insuficiente.desde as readonly string[];
    const fallos: string[] = [];
    for (const estado of todosLosEstados) {
      const oc = await crearOc(t, p, estado);
      const antes = publicadosError(oc.id_orden);
      await insuficiente(t, p, oc);
      const aplica = permitidos.includes(estado);
      const real = await estadoDe(oc.id_orden);
      const esperado = aplica ? 'ERROR_FINANZAS' : estado;
      if (real !== esperado) fallos.push(`${estado}: esperado ${esperado}, quedó ${real}`);
      const alerta = await alertaDe(t, oc.id_orden);
      if (aplica && !alerta && estado !== 'ERROR_FINANZAS') fallos.push(`${estado}: faltó la alerta`);
      if (!aplica && estado !== 'ERROR_FINANZAS' && alerta) fallos.push(`${estado}: no debía crear alerta`);
      const pub = publicadosError(oc.id_orden) - antes;
      if (!aplica && pub !== 0) fallos.push(`${estado}: no debía publicar oc_error_finanzas`);
      if (aplica && pub !== 1) fallos.push(`${estado}: debía publicar oc_error_finanzas una vez`);
    }
    assert.deepEqual(fallos, [], fallos.join(' | '));
  });

  await test('fondos_comprometidos tardío no cambia CANCELADA, CANCELACION_PENDIENTE, PARCIALMENTE_RECIBIDA ni RECIBIDA', async () => {
    const t = randomUUID(), p = randomUUID();
    for (const estado of ['CANCELADA', 'CANCELACION_PENDIENTE', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA']) {
      const oc = await crearOc(t, p, estado);
      await comprometidos(t, p, oc);
      assert.equal(await estadoDe(oc.id_orden), estado, `${estado} fue modificado`);
    }
  });

  await test('presupuesto_insuficiente tardío no degrada una OC EMITIDA, en recepción, recibida ni cancelada', async () => {
    const t = randomUUID(), p = randomUUID();
    for (const estado of ['EMITIDA', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA', 'CANCELADA', 'CANCELACION_PENDIENTE']) {
      const oc = await crearOc(t, p, estado);
      await insuficiente(t, p, oc);
      assert.equal(await estadoDe(oc.id_orden), estado, `${estado} fue degradada`);
      assert.equal(await alertaDe(t, oc.id_orden), null, `${estado}: no debe crear alerta`);
    }
  });

  await test('transición válida desde el estado pendiente canónico sigue funcionando (ambos eventos)', async () => {
    const t = randomUUID(), p = randomUUID();
    const a = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
    await comprometidos(t, p, a);
    assert.equal(await estadoDe(a.id_orden), 'EMITIDA');
    const b = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
    await insuficiente(t, p, b);
    assert.equal(await estadoDe(b.id_orden), 'ERROR_FINANZAS');
    assert.ok(await alertaDe(t, b.id_orden), 'debe crear la alerta');
  });

  await test('evento duplicado: idempotente (mismo estado, una alerta, una publicación)', async () => {
    const t = randomUUID(), p = randomUUID();
    const a = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
    await comprometidos(t, p, a); await comprometidos(t, p, a);
    assert.equal(await estadoDe(a.id_orden), 'EMITIDA');
    const b = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
    await insuficiente(t, p, b); await insuficiente(t, p, b);
    assert.equal(await estadoDe(b.id_orden), 'ERROR_FINANZAS');
    assert.equal(await prisma.alertaOcError.count({ where: { tenant_id: t, oc_id: b.id_orden } }), 1);
    assert.equal(publicadosError(b.id_orden), 1, 'el duplicado no republica oc_error_finanzas');
  });

  await test('insuficiente y luego comprometidos (ERROR_FINANZAS → EMITIDA): resuelve la alerta, sin estados divergentes', async () => {
    const t = randomUUID(), p = randomUUID();
    const oc = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
    await insuficiente(t, p, oc);
    await comprometidos(t, p, oc);
    assert.equal(await estadoDe(oc.id_orden), 'EMITIDA');
    assert.equal((await alertaDe(t, oc.id_orden))?.resuelta, true, 'la alerta debe quedar resuelta');
  });

  await test('eventos concurrentes (comprometidos + insuficiente) sobre la misma OC → estado y alerta consistentes', async () => {
    for (let r = 0; r < 25; r++) {
      const t = randomUUID(), p = randomUUID();
      const oc = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
      const calls: Array<Promise<unknown>> = [];
      for (let i = 0; i < 3; i++) { calls.push(comprometidos(t, p, oc)); calls.push(insuficiente(t, p, oc)); }
      await settle(calls);
      const estado = await estadoDe(oc.id_orden);
      const alerta = await alertaDe(t, oc.id_orden);
      assert.ok(['EMITIDA', 'ERROR_FINANZAS'].includes(estado), `ronda ${r}: estado inesperado ${estado}`);
      if (estado === 'ERROR_FINANZAS') assert.ok(alerta && alerta.resuelta === false, `ronda ${r}: ERROR_FINANZAS sin alerta activa`);
      if (estado === 'EMITIDA') assert.ok(!alerta || alerta.resuelta === true, `ronda ${r}: EMITIDA con alerta de error activa (estados divergentes)`);
    }
  });

  await test('eventos concurrentes sobre OC terminales o en recepción → el estado no cambia', async () => {
    for (const estado of ['CANCELADA', 'RECIBIDA', 'PARCIALMENTE_RECIBIDA', 'EMITIDA']) {
      for (let r = 0; r < 6; r++) {
        const t = randomUUID(), p = randomUUID();
        const oc = await crearOc(t, p, estado);
        const calls: Array<Promise<unknown>> = [];
        for (let i = 0; i < 3; i++) { calls.push(comprometidos(t, p, oc)); calls.push(insuficiente(t, p, oc)); }
        await settle(calls);
        assert.equal(await estadoDe(oc.id_orden), estado, `${estado}, ronda ${r}: el estado cambió`);
        assert.equal(await alertaDe(t, oc.id_orden), null);
      }
    }
  });

  await test('cancelación concurrente vs evento tardío → la OC queda CANCELADA (sin resurrección ni degradación por lectura desfasada)', async () => {
    const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let r = 0; r < 30; r++) {
      const t = randomUUID(), p = randomUUID();
      const oc = await crearOc(t, p, 'PENDIENTE_CONFIRMACION_FINANZAS');
      const handler = r % 2 === 0 ? comprometidos(t, p, oc) : insuficiente(t, p, oc);
      await dormir(r % 9); // desplaza la cancelación dentro de la ventana lectura→escritura del handler
      const cancelacion = prisma.ordenCompra.updateMany({ where: { id_orden: oc.id_orden }, data: { estado: 'CANCELADA' } });
      await settle([handler, cancelacion]);
      assert.equal(await estadoDe(oc.id_orden), 'CANCELADA', `ronda ${r}: la cancelación fue pisada por un evento tardío`);
    }
  });

  // ── ERROR_FINANZAS → EMITIDA: solo con compromiso confirmado de la MISMA OC, tenant y proyecto ──
  await test('ERROR_FINANZAS → EMITIDA exige compromiso confirmado de la misma OC, tenant y proyecto', async () => {
    const t = randomUUID(), p = randomUUID();
    const oc = await crearOc(t, p, 'ERROR_FINANZAS');
    await prisma.alertaOcError.create({ data: { tenant_id: t, proyecto_id: p, oc_id: oc.id_orden, oc_codigo: oc.codigo, error_message: 'x' } });

    const ajeno = ev('finanzas.fondos_comprometidos', t, p, oc) as any;
    // otro proyecto
    await handleFondosComprometidosEvent({ ...ajeno, context: { ...ajeno.context, proyecto_id: randomUUID() } });
    assert.equal(await estadoDe(oc.id_orden), 'ERROR_FINANZAS', 'otro proyecto no debe mover la OC');
    // otro tenant
    await handleFondosComprometidosEvent({ ...ajeno, context: { ...ajeno.context, tenant_id: randomUUID() } });
    assert.equal(await estadoDe(oc.id_orden), 'ERROR_FINANZAS', 'otro tenant no debe mover la OC');
    // otra OC (no afecta a esta)
    const otra = await crearOc(t, p, 'ERROR_FINANZAS');
    await handleFondosComprometidosEvent({ ...ajeno, payload: { ...ajeno.payload, referencia_oc_id: otra.id_orden } });
    assert.equal(await estadoDe(oc.id_orden), 'ERROR_FINANZAS', 'el evento de otra OC no debe mover ésta');
    assert.equal(await estadoDe(otra.id_orden), 'EMITIDA');
    // sin compromiso confirmado: sin movimiento_id / monto no positivo
    await handleFondosComprometidosEvent({ ...ajeno, payload: { ...ajeno.payload, movimiento_id: undefined } });
    assert.equal(await estadoDe(oc.id_orden), 'ERROR_FINANZAS', 'sin movimiento_id no es un compromiso confirmado');
    await handleFondosComprometidosEvent({ ...ajeno, payload: { ...ajeno.payload, monto_comprometido: 0 } });
    assert.equal(await estadoDe(oc.id_orden), 'ERROR_FINANZAS', 'monto 0 no es un compromiso confirmado');
    assert.equal((await alertaDe(t, oc.id_orden))?.resuelta, false, 'la alerta sigue activa');
    // el evento legítimo sí la recupera
    await handleFondosComprometidosEvent(ajeno);
    assert.equal(await estadoDe(oc.id_orden), 'EMITIDA');
    assert.equal((await alertaDe(t, oc.id_orden))?.resuelta, true);
  });

  // ── finanzas.fondos_liberados ──
  await test('matriz fondos_liberados: solo CANCELACION_PENDIENTE → CANCELADA; el resto es no-op sin efectos', async () => {
    const t = randomUUID(), p = randomUUID();
    const fallos: string[] = [];
    for (const estado of todosLosEstados) {
      const oc = await crearOc(t, p, estado);
      const antes = await filaCompleta(oc.id_orden);
      await liberados(t, p, oc);
      const esperado = estado === 'CANCELACION_PENDIENTE' ? 'CANCELADA' : estado;
      const real = await estadoDe(oc.id_orden);
      if (real !== esperado) fallos.push(`${estado}: esperado ${esperado}, quedó ${real}`);
      if (estado !== 'CANCELACION_PENDIENTE' && (await filaCompleta(oc.id_orden)) !== antes) fallos.push(`${estado}: la fila cambió`);
    }
    assert.deepEqual(fallos, [], fallos.join(' | '));
  });

  await test('fondos_liberados: transición válida desde CANCELACION_PENDIENTE y evento repetido sobre CANCELADA idempotente', async () => {
    const t = randomUUID(), p = randomUUID();
    const oc = await crearOc(t, p, 'CANCELACION_PENDIENTE');
    await liberados(t, p, oc);
    assert.equal(await estadoDe(oc.id_orden), 'CANCELADA');
    assert.equal(contarLogs('compras.event.finanzas.fondos_liberados.applied', oc.id_orden), 1);
    const despues = await filaCompleta(oc.id_orden);
    await liberados(t, p, oc); await liberados(t, p, oc);
    assert.equal(await filaCompleta(oc.id_orden), despues, 'los repetidos no cambian nada');
    assert.equal(contarLogs('compras.event.finanzas.fondos_liberados.applied', oc.id_orden), 1, 'solo un applied');
    assert.equal(contarLogs('compras.event.finanzas.fondos_liberados.idempotent', oc.id_orden), 2, 'los repetidos son idempotentes');
  });

  await test('fondos_liberados tardío no cancela una OC EMITIDA, en ERROR_FINANZAS, PARCIALMENTE_RECIBIDA ni RECIBIDA', async () => {
    const t = randomUUID(), p = randomUUID();
    for (const estado of ['EMITIDA', 'ERROR_FINANZAS', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA']) {
      const oc = await crearOc(t, p, estado);
      await liberados(t, p, oc);
      assert.equal(await estadoDe(oc.id_orden), estado, `${estado} fue cancelada por un fondos_liberados tardío`);
      assert.equal(contarLogs('compras.event.finanzas.fondos_liberados.applied', oc.id_orden), 0);
    }
  });

  await test('fondos_liberados no cancela una OC de otro tenant ni de otro proyecto', async () => {
    const t = randomUUID(), p = randomUUID();
    const oc = await crearOc(t, p, 'CANCELACION_PENDIENTE');
    const e = ev('finanzas.fondos_liberados', t, p, oc) as any;
    await handleFondosLiberadosEvent({ ...e, context: { ...e.context, proyecto_id: randomUUID() } });
    await handleFondosLiberadosEvent({ ...e, context: { ...e.context, tenant_id: randomUUID() } });
    assert.equal(await estadoDe(oc.id_orden), 'CANCELACION_PENDIENTE');
    await handleFondosLiberadosEvent(e);
    assert.equal(await estadoDe(oc.id_orden), 'CANCELADA');
  });

  await test('dos fondos_liberados concurrentes → un solo efecto aplicado y el resto idempotente', async () => {
    for (let r = 0; r < 15; r++) {
      const t = randomUUID(), p = randomUUID();
      const oc = await crearOc(t, p, 'CANCELACION_PENDIENTE');
      const res = await settle([liberados(t, p, oc), liberados(t, p, oc), liberados(t, p, oc)]);
      assert.ok(res.every((x) => x.status === 'fulfilled'), `ronda ${r}: un handler falló`);
      assert.equal(await estadoDe(oc.id_orden), 'CANCELADA');
      assert.equal(contarLogs('compras.event.finanzas.fondos_liberados.applied', oc.id_orden), 1, `ronda ${r}: más de un applied`);
      assert.equal(contarLogs('compras.event.finanzas.fondos_liberados.idempotent', oc.id_orden), 2, `ronda ${r}: los otros dos deben ser idempotentes`);
    }
  });

  await test('recepción concurrente con un fondos_liberados tardío → la OC queda recibida, nunca CANCELADA', async () => {
    const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let r = 0; r < 20; r++) {
      const t = randomUUID(), p = randomUUID();
      const oc = await prisma.ordenCompra.create({
        data: {
          tenant_id: t, proyecto_id: p, proveedor_id: await proveedorDe(t), codigo: `OC-TR-${randomUUID().slice(0, 8)}`, estado: 'EMITIDA',
          subtotal: 100, iva: 16, total: 116, presupuesto_id: randomUUID(),
          items: { create: [{ tenant_id: t, proyecto_id: p, descripcion_libre: 'Material libre', unidad_libre: 'PZA', cantidad: 10, precio_unitario: 10, importe: 100 }] },
        } as any,
        include: { items: true },
      });
      const recepcion = fetch(`${baseUrl}/api/v1/compras/ordenes-compra/${oc.id_orden}/recepciones`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token(t, p)}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ orden_item_id: oc.items[0].id_item, cantidad_recibida: 10 }] }),
      });
      await dormir(r % 8);
      const liberacion = liberados(t, p, oc);
      const [resp] = await Promise.all([recepcion, liberacion]);
      assert.equal(resp.status, 201, `ronda ${r}: la recepción falló (${resp.status}) — ${JSON.stringify(await resp.json().catch(() => ({})))}`);
      assert.equal(await estadoDe(oc.id_orden), 'RECIBIDA', `ronda ${r}: la OC no quedó RECIBIDA`);
    }
  });

  await limpiar();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas en verde`);
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (e) => { console.error('not ok - oc-transiciones-eventos-finanzas', e); await limpiar().catch(() => undefined); process.exit(1); });

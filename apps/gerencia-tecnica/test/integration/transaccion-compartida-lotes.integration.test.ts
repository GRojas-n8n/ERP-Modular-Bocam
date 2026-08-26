/**
 * Test de Integración: transacción compartida por lote (en vez de una
 * transacción por fila) en los endpoints de importación/actualización masiva.
 * Spec: openspec/changes/reducir-transacciones-por-operacion-lotes-gt/specs/transaccion-compartida-lotes-gt/spec.md
 * Tareas: 1.1-1.3 del tasks.md
 *
 * Hoy `createTenantContext(ctx)` (apps/gerencia-tecnica/src/db.ts) abre una
 * transacción de Postgres por cada operación de Prisma. Un loop de N filas
 * abre N transacciones. Este test cuenta las transacciones reales (BEGIN)
 * que aparecen en el log de queries de Prisma durante un request de lote, y
 * confirma que el aislamiento de fallos por fila (una fila mala no debe
 * arrastrar a las demás) se mantiene tras mover el loop a una sola
 * transacción con savepoints.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo, NODE_ENV=development (ya lo fija
 * apps/gerencia-tecnica/.env — habilita el log ['query','warn','error'] de
 * Prisma que este test necesita capturar de stdout).
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';
process.env.NODE_ENV     = process.env.NODE_ENV     || 'development';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.conceptoInsumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.categoriaGasto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[] = ['admin']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

/** Captura lo escrito a stdout durante `fn()` y cuenta cuántas transacciones reales de Postgres se abrieron (líneas de log "BEGIN" de Prisma). */
async function contarTransaccionesDurante(fn: () => Promise<void>): Promise<number> {
  const original = process.stdout.write.bind(process.stdout);
  let buffer = '';
  (process.stdout as any).write = (chunk: any, ...rest: any[]) => {
    buffer += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    return original(chunk, ...rest);
  };
  try {
    await fn();
  } finally {
    process.stdout.write = original;
  }
  const matches = buffer.match(/prisma:query BEGIN\b/g);
  return matches ? matches.length : 0;
}

async function postImportarLote(headers: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/importar-lote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function postComposicionApu(headers: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/composicion-apu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function putClasificacionBulk(headers: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/clasificacion-bulk`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

// ── Test 1.1: actualizar 10 insumos existentes abre 1 transacción, no 10 ──

async function testImportarLoteActualizacionAbreUnaSolaTransaccion() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const N = 10;
    const claves = Array.from({ length: N }, (_, i) => `EXIST${String(i).padStart(3, '0')}`);
    await prisma.insumo.createMany({
      data: claves.map(clave => ({
        tenant_id: tenantId, clave, descripcion: 'Original', unidad_medida: 'PZA',
        tipo_insumo: 'MATERIAL' as const, costo_base: 10, activo: true,
      })),
    });

    const t = token(tenantId, proyectoId);
    let status = 0;
    const beginCount = await contarTransaccionesDurante(async () => {
      const r = await postImportarLote({ Authorization: `Bearer ${t}` }, {
        insumos: claves.map(clave => ({
          clave, descripcion: 'Actualizado', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20,
        })),
      });
      status = r.status;
    });

    assert.equal(status, 200, 'el lote de actualización debe responder 200');
    assert.ok(
      beginCount < N,
      `se esperaban menos de ${N} transacciones para actualizar ${N} filas (una transacción compartida), pero se contaron ${beginCount}`
    );

    const actualizados = await prisma.insumo.count({ where: { tenant_id: tenantId, descripcion: 'Actualizado' } });
    assert.equal(actualizados, N, `las ${N} filas deben quedar actualizadas`);

    console.log(`ok - 1.1 actualizar ${N} insumos existentes abre ${beginCount} transacción(es) de Postgres, no ${N}`);
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.2: una fila con violación de FK no arrastra a las filas posteriores (clasificacion-bulk) ──

async function testClasificacionBulkAislaFilaConFkInvalida() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const categoria = await prisma.categoriaGasto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, nombre: 'Materiales' },
    });

    const [i1, i2, i3] = await Promise.all(['A', 'B', 'C'].map(suf =>
      prisma.insumo.create({
        data: {
          tenant_id: tenantId, clave: `CLASIF-${suf}`, descripcion: 'Insumo', unidad_medida: 'PZA',
          tipo_insumo: 'MATERIAL' as const, costo_base: 10, activo: true,
        },
      })
    ));

    const t = token(tenantId, proyectoId, ['admin']);
    const inexistente = randomUUID();

    const r = await putClasificacionBulk({ Authorization: `Bearer ${t}` }, {
      items: [
        { insumo_id: i1.id, categoria_gasto_id: categoria.id_categoria },
        { insumo_id: i2.id, categoria_gasto_id: inexistente }, // fuerza violación de FK a mitad del lote
        { insumo_id: i3.id, categoria_gasto_id: categoria.id_categoria },
      ],
    });

    assert.equal(r.status, 200, 'el endpoint debe responder 200 aunque una fila falle');
    const body = await r.json() as any;
    assert.equal(body.data.actualizados, 2, 'las 2 filas válidas deben contarse como actualizadas');
    assert.equal(body.data.omitidos, 1, 'la fila con FK inexistente debe contarse como omitida');

    const i1Actualizado = await prisma.insumo.findUnique({ where: { id: i1.id } });
    const i3Actualizado = await prisma.insumo.findUnique({ where: { id: i3.id } });
    const i2SinCambios  = await prisma.insumo.findUnique({ where: { id: i2.id } });

    assert.equal(i1Actualizado?.categoria_gasto_id, categoria.id_categoria, 'la fila 1 (antes de la fila mala) debe quedar actualizada');
    assert.equal(i3Actualizado?.categoria_gasto_id, categoria.id_categoria, 'la fila 3 (después de la fila mala) debe quedar actualizada — no debe arrastrarse por el fallo de la fila 2');
    assert.equal(i2SinCambios?.categoria_gasto_id, null, 'la fila con FK inválida no debe quedar modificada');

    console.log('ok - 1.2 una fila con FK inválida a mitad del lote se omite sin afectar las filas posteriores (savepoint)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 1.3: composicion-apu con varios conceptos×insumos abre 1 transacción, no N ──

async function testComposicionApuAbreUnaSolaTransaccion() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const presupuesto = await prisma.presupuestoBase.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, version: 1, estado: 'BORRADOR',
        conceptos: {
          create: [
            { tenant_id: tenantId, proyecto_id: proyectoId, clave: 'CONC-1', descripcion: 'Concepto 1', unidad_medida: 'M2', cantidad: 1, precio_unitario: 1, importe: 1 },
            { tenant_id: tenantId, proyecto_id: proyectoId, clave: 'CONC-2', descripcion: 'Concepto 2', unidad_medida: 'M2', cantidad: 1, precio_unitario: 1, importe: 1 },
          ],
        },
      },
    });

    const insumoClaves = ['INS-1', 'INS-2', 'INS-3'];
    await prisma.insumo.createMany({
      data: insumoClaves.map(clave => ({
        tenant_id: tenantId, clave, descripcion: 'Insumo', unidad_medida: 'PZA',
        tipo_insumo: 'MATERIAL' as const, costo_base: 5, activo: true,
      })),
    });

    const t = token(tenantId, proyectoId);
    let beginCount = 0;
    let status = 0;
    beginCount = await contarTransaccionesDurante(async () => {
      const r = await postComposicionApu({ Authorization: `Bearer ${t}` }, {
        composiciones: [
          { concepto_clave: 'CONC-1', insumos: insumoClaves.map(clave_insumo => ({ clave_insumo, tipo_insumo: 'MATERIAL', cantidad: 1, rendimiento: 1, costo_unitario: 5 })) },
          { concepto_clave: 'CONC-2', insumos: insumoClaves.map(clave_insumo => ({ clave_insumo, tipo_insumo: 'MATERIAL', cantidad: 2, rendimiento: 1, costo_unitario: 5 })) },
        ],
      });
      status = r.status;
    });

    assert.equal(status, 200, 'la composición debe importarse correctamente');
    // 2 conceptos × 3 insumos = 6 filas de composición; cada una hoy hace findUnique + create,
    // hasta 12 transacciones. Tras el fix, 1 sola transacción para todo el lote.
    assert.ok(
      beginCount < 6,
      `se esperaban menos de 6 transacciones para 6 filas de composición (una transacción compartida), pero se contaron ${beginCount}`
    );

    const totalComposiciones = await prisma.conceptoInsumo.count({ where: { tenant_id: tenantId } });
    assert.equal(totalComposiciones, 6, 'deben crearse las 6 filas de composición (2 conceptos × 3 insumos)');

    console.log(`ok - 1.3 composición APU de 6 filas abre ${beginCount} transacción(es) de Postgres, no hasta 12`);
    void presupuesto;
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testImportarLoteActualizacionAbreUnaSolaTransaccion(); // 1.1
    await testClasificacionBulkAislaFilaConFkInvalida();          // 1.2
    await testComposicionApuAbreUnaSolaTransaccion();             // 1.3
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - transaccion-compartida-lotes integration tests');
  console.error(error);
  process.exitCode = 1;
});

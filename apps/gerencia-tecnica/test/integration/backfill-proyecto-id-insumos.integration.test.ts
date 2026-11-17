/**
 * Test de Integración: script de backfill de Insumo.proyecto_id.
 * Spec: openspec/changes/aislamiento-insumos-por-proyecto-gt
 * Tarea: 8.7 del tasks.md
 *
 * Confirma contra Postgres real, con datos de prueba, los tres casos de
 * Decision 3 (design.md): único (asigna), ambiguo (archiva), huérfano (archiva).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';
import { runBackfill } from '../../scripts/backfill-proyecto-id-insumos';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

async function cleanupTenant(tenantId: string) {
  await prisma.conceptoInsumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.concepto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
}

async function testBackfillCubreLosTresCasos() {
  const tenantId = randomUUID();
  const proyectoUnico = randomUUID();
  const proyectoAmbiguoX = randomUUID();
  const proyectoAmbiguoY = randomUUID();
  let ajenasAntes: Array<{ id: string; activo: boolean }> = [];

  try {
    // Caso "único": referenciado por ConceptoInsumo de un solo proyecto → se asigna.
    const insumoUnico = await prisma.insumo.create({
      data: { tenant_id: tenantId, clave: 'BF-UNICO', descripcion: 'Backfill único', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10 },
    });
    // Caso "ambiguo": referenciado por ConceptoInsumo de más de un proyecto → se archiva.
    const insumoAmbiguo = await prisma.insumo.create({
      data: { tenant_id: tenantId, clave: 'BF-AMBIGUO', descripcion: 'Backfill ambiguo', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 20 },
    });
    // Caso "huérfano": sin ninguna referencia en ConceptoInsumo → se archiva.
    const insumoHuerfano = await prisma.insumo.create({
      data: { tenant_id: tenantId, clave: 'BF-HUERFANO', descripcion: 'Backfill huérfano', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 30 },
    });

    const presupuestoUnico = await prisma.presupuestoBase.create({ data: { tenant_id: tenantId, proyecto_id: proyectoUnico } });
    const conceptoUnico = await prisma.concepto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoUnico, presupuesto_id: presupuestoUnico.id, clave: 'BF-CONC-U', descripcion: 'Concepto único', unidad_medida: 'M3', cantidad: 1, precio_unitario: 1, importe: 1 },
    });
    await prisma.conceptoInsumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoUnico, concepto_id: conceptoUnico.id, insumo_id: insumoUnico.id, tipo_insumo: 'MATERIAL', cantidad: 1 },
    });

    const presupuestoX = await prisma.presupuestoBase.create({ data: { tenant_id: tenantId, proyecto_id: proyectoAmbiguoX } });
    const conceptoX = await prisma.concepto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoAmbiguoX, presupuesto_id: presupuestoX.id, clave: 'BF-CONC-X', descripcion: 'Concepto X', unidad_medida: 'M3', cantidad: 1, precio_unitario: 1, importe: 1 },
    });
    await prisma.conceptoInsumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoAmbiguoX, concepto_id: conceptoX.id, insumo_id: insumoAmbiguo.id, tipo_insumo: 'MATERIAL', cantidad: 1 },
    });
    const presupuestoY = await prisma.presupuestoBase.create({ data: { tenant_id: tenantId, proyecto_id: proyectoAmbiguoY } });
    const conceptoY = await prisma.concepto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoAmbiguoY, presupuesto_id: presupuestoY.id, clave: 'BF-CONC-Y', descripcion: 'Concepto Y', unidad_medida: 'M3', cantidad: 1, precio_unitario: 1, importe: 1 },
    });
    await prisma.conceptoInsumo.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoAmbiguoY, concepto_id: conceptoY.id, insumo_id: insumoAmbiguo.id, tipo_insumo: 'MATERIAL', cantidad: 1 },
    });

    // huérfano: sin ConceptoInsumo, ninguna acción adicional necesaria.

    // El script de backfill opera sobre TODA la tabla (así corre en producción,
    // sin acotar por tenant) — snapshot de cualquier fila ajena a este tenant
    // con proyecto_id NULL para restaurarla después, y no dejar efectos
    // colaterales sobre fixtures de otros tests que compartan esta base local.
    ajenasAntes = await prisma.insumo.findMany({
      where: { proyecto_id: null, tenant_id: { not: tenantId } },
      select: { id: true, activo: true },
    });

    const resultado = await runBackfill(prisma as any);
    assert.ok(resultado.procesados >= 3, 'debe procesar al menos los 3 insumos de prueba (puede haber más de otras corridas concurrentes)');
    assert.ok(resultado.asignados >= 1);
    assert.ok(resultado.archivadosAmbiguos >= 1);
    assert.ok(resultado.archivadosHuerfanos >= 1);

    const uniRow = await prisma.insumo.findUnique({ where: { id: insumoUnico.id } });
    assert.equal(uniRow?.proyecto_id, proyectoUnico, 'caso único: proyecto_id asignado correctamente');
    assert.equal(uniRow?.activo, true, 'caso único: activo no debe cambiar');

    const ambRow = await prisma.insumo.findUnique({ where: { id: insumoAmbiguo.id } });
    assert.equal(ambRow?.proyecto_id, null, 'caso ambiguo: proyecto_id sigue NULL');
    assert.equal(ambRow?.activo, false, 'caso ambiguo: se archiva (activo = false)');

    const huerRow = await prisma.insumo.findUnique({ where: { id: insumoHuerfano.id } });
    assert.equal(huerRow?.proyecto_id, null, 'caso huérfano: proyecto_id sigue NULL');
    assert.equal(huerRow?.activo, false, 'caso huérfano: se archiva (activo = false)');

    console.log('ok - 8.7 runBackfill resuelve único (asigna), ambiguo (archiva) y huérfano (archiva) contra Postgres real');
  } finally {
    for (const fila of ajenasAntes) {
      await prisma.insumo.update({ where: { id: fila.id }, data: { activo: fila.activo } });
    }
    await cleanupTenant(tenantId);
  }
}

async function main() {
  try {
    await testBackfillCubreLosTresCasos();
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - backfill-proyecto-id-insumos integration tests');
  console.error(error);
  process.exitCode = 1;
});

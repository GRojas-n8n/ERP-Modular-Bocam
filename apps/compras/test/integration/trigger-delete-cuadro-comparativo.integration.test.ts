/**
 * ---------------------------------------------------------------------------
 * Test de Integración: trigger trg_comparativa_locked cancela en silencio
 * TODO DELETE sobre cuadros_comparativos, no solo los LOCKED
 * Spec:  openspec/changes/fix-trigger-delete-cuadro-comparativo/
 *
 * fn_prevent_locked_comparativa_modification() está registrada
 * BEFORE UPDATE OR DELETE y siempre termina en `RETURN NEW;`. En un trigger
 * BEFORE DELETE, NEW no existe (es NULL), y un trigger BEFORE que devuelve
 * NULL cancela la operación en esa fila sin lanzar ningún error. Efecto:
 * cualquier DELETE sobre cuadros_comparativos se cancela en silencio, esté
 * o no LOCKED. Este test opera directo contra Postgres (no vía HTTP) porque
 * el bug vive en el trigger de base de datos, no en un endpoint.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

async function crearCuadro(estado: string) {
  const tenantId = randomUUID();
  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: randomUUID(),
      requisicion_id: randomUUID(),
      codigo: `CC-TRIGGER-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado,
    },
  });
  return cuadro.id_cuadro;
}

async function borrarCuadroLockedParaLimpieza(id: string) {
  // El trigger es inmutable por diseño: ni UPDATE ni DELETE pueden operar
  // sobre una fila LOCKED. Para limpiar los fixtures de este test se usa
  // el mismo procedimiento documentado en migration.sql (disable/enable).
  await prisma.$executeRawUnsafe('ALTER TABLE cuadros_comparativos DISABLE TRIGGER trg_comparativa_locked');
  try {
    await prisma.cuadroComparativo.deleteMany({ where: { id_cuadro: id } });
  } finally {
    await prisma.$executeRawUnsafe('ALTER TABLE cuadros_comparativos ENABLE TRIGGER trg_comparativa_locked');
  }
}

async function testDeleteSobreCuadroNoLockedBorraLaFila() {
  const id = await crearCuadro('BORRADOR');
  try {
    await prisma.$executeRawUnsafe('DELETE FROM cuadros_comparativos WHERE id_cuadro = $1::uuid', id);

    const encontrado = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: id } });
    assert.equal(
      encontrado, null,
      `DELETE sobre un cuadro comparativo en estado BORRADOR (no LOCKED) no eliminó la fila (id_cuadro=${id}). ` +
      `El trigger trg_comparativa_locked está cancelando el DELETE en silencio porque su función ` +
      `hace RETURN NEW en vez de RETURN OLD en contexto DELETE.`
    );

    console.log('ok - DELETE sobre cuadro comparativo no LOCKED elimina la fila');
  } finally {
    await prisma.cuadroComparativo.deleteMany({ where: { id_cuadro: id } });
  }
}

async function testDeleteSobreCuadroLockedSigueRechazandose() {
  const id = await crearCuadro('LOCKED');
  try {
    await assert.rejects(
      () => prisma.$executeRawUnsafe('DELETE FROM cuadros_comparativos WHERE id_cuadro = $1::uuid', id),
      (error: any) => {
        assert.match(String(error?.message ?? error), /cannot_modify_locked_comparativa/);
        return true;
      },
      'DELETE sobre un cuadro LOCKED debe seguir rechazándose con cannot_modify_locked_comparativa'
    );

    const encontrado = await prisma.cuadroComparativo.findUnique({ where: { id_cuadro: id } });
    assert.ok(encontrado, 'la fila LOCKED debe seguir existiendo tras el intento de DELETE rechazado');

    console.log('ok - DELETE sobre cuadro comparativo LOCKED sigue rechazándose');
  } finally {
    await borrarCuadroLockedParaLimpieza(id);
  }
}

async function testUpdateSobreCuadroLockedSigueRechazandose() {
  const id = await crearCuadro('LOCKED');
  try {
    await assert.rejects(
      () => prisma.$executeRawUnsafe(
        "UPDATE cuadros_comparativos SET notas = 'x' WHERE id_cuadro = $1::uuid", id
      ),
      (error: any) => {
        assert.match(String(error?.message ?? error), /cannot_modify_locked_comparativa/);
        return true;
      },
      'UPDATE sobre un cuadro LOCKED debe seguir rechazándose con cannot_modify_locked_comparativa'
    );

    console.log('ok - UPDATE sobre cuadro comparativo LOCKED sigue rechazándose');
  } finally {
    await borrarCuadroLockedParaLimpieza(id);
  }
}

async function main() {
  try {
    await testDeleteSobreCuadroNoLockedBorraLaFila();
    await testDeleteSobreCuadroLockedSigueRechazandose();
    await testUpdateSobreCuadroLockedSigueRechazandose();
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - trigger-delete-cuadro-comparativo integration tests');
  console.error(error);
  process.exitCode = 1;
});

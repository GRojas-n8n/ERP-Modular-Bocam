/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Gerencia Técnica — Migración de datos: aislamiento-insumos-por-proyecto-gt
 *
 * Backfill de Insumo.proyecto_id (Decision 3, design.md):
 * para cada Insumo con proyecto_id NULL, resuelve su(s) proyecto_id vía
 * ConceptoInsumo.insumo_id.
 *   - Un único proyecto_id referenciado (no ambiguo): se asigna ese proyecto_id.
 *   - Más de un proyecto_id (ambiguo) o ninguna referencia (huérfano): no se
 *     asigna — se archiva (activo = false), proyecto_id se queda NULL.
 * Corrida única, vía adminPrisma (bypass RLS, ver db.ts).
 *
 * Uso: ts-node apps/gerencia-tecnica/scripts/backfill-proyecto-id-insumos.ts
 * ---------------------------------------------------------------------------
 */

import { adminPrisma, type BocamPrismaClient } from '../src/db';

export interface BackfillResultado {
  procesados: number;
  asignados: number;
  archivadosAmbiguos: number;
  archivadosHuerfanos: number;
}

export async function runBackfill(prisma: Pick<BocamPrismaClient, 'insumo' | 'conceptoInsumo'> | typeof adminPrisma): Promise<BackfillResultado> {
  const insumosLegacy = await prisma.insumo.findMany({
    where: { proyecto_id: null },
    select: { id: true },
  });

  let asignados = 0;
  let archivadosAmbiguos = 0;
  let archivadosHuerfanos = 0;

  for (const { id } of insumosLegacy) {
    const referencias = await prisma.conceptoInsumo.findMany({
      where: { insumo_id: id },
      select: { proyecto_id: true },
      distinct: ['proyecto_id'],
    });

    if (referencias.length === 1) {
      await prisma.insumo.update({
        where: { id },
        data: { proyecto_id: referencias[0].proyecto_id },
      });
      asignados++;
    } else if (referencias.length > 1) {
      await prisma.insumo.update({
        where: { id },
        data: { activo: false },
      });
      archivadosAmbiguos++;
    } else {
      await prisma.insumo.update({
        where: { id },
        data: { activo: false },
      });
      archivadosHuerfanos++;
    }
  }

  return {
    procesados: insumosLegacy.length,
    asignados,
    archivadosAmbiguos,
    archivadosHuerfanos,
  };
}

async function main() {
  console.log('[Backfill] Asignación de proyecto_id a Insumo legacy...');

  const resultado = await runBackfill(adminPrisma);

  console.log(`[Backfill] Insumos legacy procesados: ${resultado.procesados}`);
  console.log(`[Backfill] Asignados a un proyecto (no ambiguos): ${resultado.asignados}`);
  console.log(`[Backfill] Archivados (ambiguos, más de un proyecto): ${resultado.archivadosAmbiguos}`);
  console.log(`[Backfill] Archivados (huérfanos, sin referencia en ConceptoInsumo): ${resultado.archivadosHuerfanos}`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('[Backfill] Error:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await adminPrisma.$disconnect();
    });
}

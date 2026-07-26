/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Personal — Migración de datos: expediente-asignacion-periodicidad-personal
 *
 * Backfill de ConfigNominaProyecto a partir del histórico de PreNomina:
 * para cada proyecto (tenant_id + proyecto_id) con al menos una PreNomina,
 * toma la más reciente y crea la config con esa periodicidad. Proyectos sin
 * histórico quedan sin registro explícito (resuelven a SEMANAL por default
 * en el endpoint, ver periodicidad-pago-proyecto/spec.md).
 *
 * Uso: ts-node apps/personal/scripts/migrar-config-nomina-proyecto.ts
 * ---------------------------------------------------------------------------
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const SYSTEM_MIGRATION_USER_ID = process.env.MIGRATION_USER_ID || '00000000-0000-0000-0000-000000000000';

async function main() {
  console.log('[Migración] Backfill de ConfigNominaProyecto desde histórico de PreNomina...');

  const proyectos = await prisma.preNomina.findMany({
    distinct: ['tenant_id', 'proyecto_id'],
    select: { tenant_id: true, proyecto_id: true },
  });

  let migrados = 0;
  let yaExistian = 0;
  let sinHistorico = 0;

  for (const { tenant_id, proyecto_id } of proyectos) {
    const existente = await prisma.configNominaProyecto.findFirst({
      where: { tenant_id, proyecto_id },
    });
    if (existente) { yaExistian++; continue; }

    const masReciente = await prisma.preNomina.findFirst({
      where: { tenant_id, proyecto_id },
      orderBy: { periodo_inicio: 'desc' },
      select: { periodo_tipo: true },
    });

    if (!masReciente) { sinHistorico++; continue; }

    await prisma.configNominaProyecto.create({
      data: {
        tenant_id,
        proyecto_id,
        periodicidad_pago: masReciente.periodo_tipo,
        configurado_por: SYSTEM_MIGRATION_USER_ID,
      },
    });
    migrados++;
  }

  console.log(`[Migración] Proyectos migrados por histórico: ${migrados}`);
  console.log(`[Migración] Proyectos que ya tenían config: ${yaExistian}`);
  console.log(`[Migración] Proyectos sin histórico (sin registro, resuelven a SEMANAL): ${sinHistorico}`);
}

main()
  .catch((error) => {
    console.error('[Migración] Error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

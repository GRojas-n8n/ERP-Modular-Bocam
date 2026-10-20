/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Auth — Migración de datos: rbac-migracion-alias-resident-technical-compras
 *
 * Convierte los alias históricos de rol en `User.rol_global` a su rol
 * canónico: 'resident' -> 'residencia', 'compras' -> 'procurement',
 * 'technical' -> 'gerencia_tecnica'. Preserva el resto del arreglo intacto y
 * no duplica si el canónico ya estuviera presente. Idempotente: una segunda
 * corrida no encuentra filas que migrar.
 *
 * Uso: ts-node apps/auth/scripts/migrar-roles-alias.ts
 * ---------------------------------------------------------------------------
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const ALIAS_A_CANONICO: Record<string, string> = {
  resident: 'residencia',
  compras: 'procurement',
  technical: 'gerencia_tecnica',
};

const ALIASES = Object.keys(ALIAS_A_CANONICO);

async function main() {
  console.log('[Migración] Convirtiendo alias de rol a su rol canónico en rol_global...');

  const usuarios = await prisma.user.findMany({
    where: { OR: ALIASES.map((alias) => ({ rol_global: { has: alias } })) },
    select: { id_usuario: true, rol_global: true },
  });

  const migradosPorAlias: Record<string, number> = { resident: 0, compras: 0, technical: 0 };
  let usuariosMigrados = 0;

  for (const usuario of usuarios) {
    const nuevos = Array.from(
      new Set(usuario.rol_global.map((rol) => ALIAS_A_CANONICO[rol] ?? rol))
    );

    for (const alias of ALIASES) {
      if (usuario.rol_global.includes(alias)) migradosPorAlias[alias]++;
    }

    await prisma.user.update({
      where: { id_usuario: usuario.id_usuario },
      data: { rol_global: nuevos },
    });
    usuariosMigrados++;
  }

  console.log(`[Migración] Usuarios migrados: ${usuariosMigrados}`);
  for (const alias of ALIASES) {
    console.log(`[Migración]   ${alias} -> ${ALIAS_A_CANONICO[alias]}: ${migradosPorAlias[alias]}`);
  }
}

main()
  .catch((error) => {
    console.error('[Migración] Error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

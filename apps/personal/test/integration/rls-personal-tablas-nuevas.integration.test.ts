/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: RLS en las 5 tablas nuevas de personal
 * Spec:  openspec/changes/fix-rls-personal-tablas-nuevas/
 * Tarea: 1.1-1.2 del tasks.md
 *
 * A diferencia de los demás tests de integración de este directorio, estos NO
 * pasan por los endpoints HTTP — el código de aplicación ya filtra
 * tenant_id/proyecto_id correctamente (verificado por lectura), así que un
 * test vía HTTP no distinguiría "RLS ausente pero filtro de app correcto" de
 * "RLS presente". Aquí se abre una transacción Prisma, se fija
 * app.current_tenant_id/app.current_proyecto_id vía set_config directo, y se
 * consulta SIN el filtro que la app normalmente aplicaría — para probar la
 * política de Postgres en sí misma, no el código.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 * apps/personal/prisma/rls-policies.sql ya aplicado.
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '../../src/generated/prisma';

const personalDbUrl =
  process.env.PERSONAL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';

const prisma = new PrismaClient({ datasources: { db: { url: personalDbUrl } } });

async function comoContexto<T>(
  tenantId: string,
  proyectoId: string | null,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    if (proyectoId) {
      await tx.$executeRaw`SELECT set_config('app.current_proyecto_id', ${proyectoId}, true)`;
    }
    return callback(tx as unknown as PrismaClient);
  });
}

async function crearEmpleado(tx: PrismaClient, tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return tx.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `RLS-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'RLS',
      rfc: `RLS${sufijo}`,
      puesto: 'Test',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

// ── config_asistencia_proyecto: tenant_id AND proyecto_id ──────────────────

async function testConfigAsistenciaProyectoAisladoPorProyecto() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const userId = randomUUID();

  await comoContexto(tenantId, proyectoA, (tx) =>
    tx.configAsistenciaProyecto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoA, lat: 19.4, lng: -99.1, radio_metros: 300, configurado_por: userId },
    })
  );
  await comoContexto(tenantId, proyectoB, (tx) =>
    tx.configAsistenciaProyecto.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoB, lat: 20.0, lng: -100.0, radio_metros: 300, configurado_por: userId },
    })
  );

  try {
    // Consulta deliberadamente SIN where proyecto_id — solo confinada a estos
    // IDs sintéticos para no barrer la tabla completa de producción/dev.
    const visibles = await comoContexto(tenantId, proyectoA, (tx) =>
      tx.configAsistenciaProyecto.findMany({ where: { proyecto_id: { in: [proyectoA, proyectoB] } } })
    );
    assert.equal(visibles.length, 1, 'RLS debe ocultar la config del proyecto B aunque la query no filtre por proyecto_id');
    assert.equal(visibles[0].proyecto_id, proyectoA);

    // WITH CHECK: un UPDATE desde el contexto de A no debe poder tocar la fila de B
    const filasAfectadas = await comoContexto(tenantId, proyectoA, (tx) =>
      tx.configAsistenciaProyecto.updateMany({
        where: { proyecto_id: proyectoB },
        data: { radio_metros: 999 },
      })
    );
    assert.equal(filasAfectadas.count, 0, 'RLS debe bloquear el UPDATE sobre la fila de otro proyecto');

    console.log('ok - config_asistencia_proyecto aislado por proyecto_id vía RLS (no solo por el filtro de la app)');
  } finally {
    await prisma.configAsistenciaProyecto.deleteMany({ where: { tenant_id: tenantId } });
  }
}

// ── credenciales_empleado: solo tenant_id ───────────────────────────────────

async function testCredencialEmpleadoAisladaPorTenant() {
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const userId = randomUUID();

  const [empA, empB] = await Promise.all([
    comoContexto(tenantA, null, (tx) => crearEmpleado(tx, tenantA)),
    comoContexto(tenantB, null, (tx) => crearEmpleado(tx, tenantB)),
  ]);

  const credA = await comoContexto(tenantA, null, (tx) =>
    tx.credencialEmpleado.create({
      data: { tenant_id: tenantA, empleado_id: empA.id_empleado, token: `RLS-TOKEN-A-${randomUUID()}`, emitida_por: userId },
    })
  );
  const credB = await comoContexto(tenantB, null, (tx) =>
    tx.credencialEmpleado.create({
      data: { tenant_id: tenantB, empleado_id: empB.id_empleado, token: `RLS-TOKEN-B-${randomUUID()}`, emitida_por: userId },
    })
  );

  try {
    const visibles = await comoContexto(tenantA, null, (tx) =>
      tx.credencialEmpleado.findMany({ where: { id_credencial: { in: [credA.id_credencial, credB.id_credencial] } } })
    );
    assert.equal(visibles.length, 1, 'RLS debe ocultar la credencial del tenant B aunque la query no filtre por tenant_id');
    assert.equal(visibles[0].tenant_id, tenantA);

    const filasAfectadas = await comoContexto(tenantA, null, (tx) =>
      tx.credencialEmpleado.updateMany({
        where: { id_credencial: credB.id_credencial },
        data: { activa: false },
      })
    );
    assert.equal(filasAfectadas.count, 0, 'RLS debe bloquear el UPDATE sobre la credencial de otro tenant');

    console.log('ok - credenciales_empleado aislada por tenant_id vía RLS (no solo por el filtro de la app)');
  } finally {
    await prisma.credencialEmpleado.deleteMany({ where: { tenant_id: { in: [tenantA, tenantB] } } });
    await prisma.empleado.deleteMany({ where: { tenant_id: { in: [tenantA, tenantB] } } });
  }
}

async function main() {
  try {
    await testConfigAsistenciaProyectoAisladoPorProyecto();
    await testCredencialEmpleadoAisladaPorTenant();
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-personal-tablas-nuevas integration tests');
  console.error(error);
  process.exitCode = 1;
});

/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: elegibilidad de nómina no debe ignorar fecha_fin
 * Spec:  specs/features/02-asignacion-empleados-residente-prestamos.md (2.2)
 *
 * Bug: obtenerEmpleadoIdsDelProyecto() filtra AsignacionFrente solo por
 * estado === 'ACTIVA', sin comparar fecha_fin contra el periodo calculado.
 * Como nada en el código actual cambia `estado` tras crear la asignación
 * (solo GET/POST existen sobre /api/v1/personal/asignaciones), cualquier
 * AsignacionFrente con fecha_fin ya vencida sigue "elegible" para siempre.
 * Si ese empleado no tiene RegistroAsistencia en el proyecto durante el
 * periodo (porque de verdad ya no trabaja ahí), calcular() cae en el
 * fallback ESTIMADO (main.ts:743-745) y le paga el periodo completo pese a
 * que su asignación terminó antes de que el periodo empezara.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const personalDbUrl =
  process.env.PERSONAL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';

const prisma = new PrismaClient({ datasources: { db: { url: personalDbUrl } } });

let personalServer: Server | undefined;
let personalBaseUrl = '';

async function setup() {
  const personalModule = await import('../../src/main');
  const started = await startHttpApp(personalModule.app);
  personalServer = started.server;
  personalBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(personalServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.preNominaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.preNomina.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.registroAsistencia.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string, apellido: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: apellido,
      rfc: `T${sufijo}`.slice(0, 13),
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

// ── Test: AsignacionFrente con fecha_fin vencida no debe seguir elegible ────

async function testAsignacionVencidaNoGeneraEstimado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    // Empleado A: sigue activo en el proyecto durante el periodo — debe
    // aparecer en la nómina (caso de control, para que calcular() no falle
    // con "No hay empleados elegibles" cuando B quede excluido).
    const empActivo = await crearEmpleado(tenantId, 'Activo');
    await prisma.asignacionFrente.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId,
        empleado_id: empActivo.id_empleado, frente_trabajo: 'Frente Activo',
        fecha_inicio: new Date('2026-01-01'), horas_diarias: 8, estado: 'ACTIVA',
      },
    });

    // Empleado B: su asignación en este proyecto TERMINÓ antes de que el
    // periodo de nómina empezara (fecha_fin vencida), y no tiene ningún
    // RegistroAsistencia aquí durante el periodo — de verdad ya no trabaja
    // en este proyecto.
    const empVencido = await crearEmpleado(tenantId, 'Vencido');
    await prisma.asignacionFrente.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId,
        empleado_id: empVencido.id_empleado, frente_trabajo: 'Frente Terminado',
        fecha_inicio: new Date('2026-01-01'),
        fecha_fin: new Date('2026-06-30'), // termina ANTES del periodo calculado
        horas_diarias: 8, estado: 'ACTIVA', // estado nunca se actualiza en el código actual
      },
    });

    const tokenAdmin = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });
    const r = await fetch(`${personalBaseUrl}/api/v1/personal/prenominas/calcular`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        periodo_inicio: '2026-07-13',
        periodo_fin: '2026-07-19',
        periodo_tipo: 'SEMANAL',
      }),
    });
    assert.equal(r.status, 201, 'debe poder calcular la pre-nómina');
    const body = (await r.json()) as any;
    const idPrenomina = body.data.id_prenomina as string;

    assert.equal(body.data.total_empleados, 1, 'solo el empleado con asignación vigente debe entrar a la nómina — la asignación vencida no debe generar un detalle ESTIMADO');

    const detalleVencido = await prisma.preNominaDetalle.findFirst({
      where: { prenomina_id: idPrenomina, empleado_id: empVencido.id_empleado },
    });
    assert.equal(detalleVencido, null, 'el empleado con AsignacionFrente vencida (fecha_fin antes del periodo) no debe tener detalle de nómina en este proyecto');

    const detalleActivo = await prisma.preNominaDetalle.findFirst({
      where: { prenomina_id: idPrenomina, empleado_id: empActivo.id_empleado },
    });
    assert.ok(detalleActivo, 'el empleado con asignación vigente sí debe tener detalle');

    console.log('ok - AsignacionFrente con fecha_fin vencida ya no genera ESTIMADO en el proyecto de origen');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAsignacionVencidaNoGeneraEstimado();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - prenomina-elegibilidad-asignacion-vencida integration tests');
  console.error(error);
  process.exitCode = 1;
});

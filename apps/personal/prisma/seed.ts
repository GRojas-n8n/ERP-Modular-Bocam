import { PrismaClient } from '../src/generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Personal — Seed de datos de desarrollo
 * ---------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const PROYECTO_ID = '660e8400-e29b-41d4-a716-446655440001';
const USER_ADMIN = '770e8400-e29b-41d4-a716-446655440001';

async function main() {
  console.log('🌱 Seeding Personal / RRHH...');

  await prisma.preNominaDetalle.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.preNomina.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.asignacionFrente.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.empleado.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.cuadrilla.deleteMany({ where: { tenant_id: TENANT_ID } });

  // ── Cuadrillas ──
  const cuaAlfa = await prisma.cuadrilla.create({
    data: {
      tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
      nombre: 'Cuadrilla Alfa — Cimentación', codigo: 'CUA-01',
      especialidad: 'Cimentación', capataz_nombre: 'Juan Pérez López', estado: 'ACTIVA',
    },
  });

  const cuaBeta = await prisma.cuadrilla.create({
    data: {
      tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
      nombre: 'Cuadrilla Beta — Estructura', codigo: 'CUA-02',
      especialidad: 'Estructura Metálica', capataz_nombre: 'Miguel Ángel Torres', estado: 'ACTIVA',
    },
  });

  const cuaGamma = await prisma.cuadrilla.create({
    data: {
      tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
      nombre: 'Cuadrilla Gamma — Acabados', codigo: 'CUA-03',
      especialidad: 'Acabados y Pintura', capataz_nombre: 'Rosa María Díaz', estado: 'ACTIVA',
    },
  });

  console.log('  ✅ 3 cuadrillas creadas');

  // ── Empleados ──
  const empleadosData = [
    { num: 'EMP-001', nombre: 'Juan', ap: 'Pérez', am: 'López', rfc: 'PELJ880415XX1', puesto: 'Capataz', cat: 'SUPERVISOR', salario: 850, cuadrilla: cuaAlfa.id_cuadrilla, certs: '["DC3-Alturas","STyPS-01"]' },
    { num: 'EMP-002', nombre: 'Carlos', ap: 'Martínez', am: 'Ruiz', rfc: 'MARC900520XX2', puesto: 'Fierrero', cat: 'OBRERO', salario: 580, cuadrilla: cuaAlfa.id_cuadrilla, certs: '["DC3-Alturas"]' },
    { num: 'EMP-003', nombre: 'Pedro', ap: 'González', am: 'Soto', rfc: 'GOSP850312XX3', puesto: 'Albañil', cat: 'OBRERO', salario: 520, cuadrilla: cuaAlfa.id_cuadrilla, certs: null },
    { num: 'EMP-004', nombre: 'Miguel Ángel', ap: 'Torres', am: 'Vega', rfc: 'TOVM780621XX4', puesto: 'Capataz', cat: 'SUPERVISOR', salario: 900, cuadrilla: cuaBeta.id_cuadrilla, certs: '["STyPS-01","Soldadura AWS"]' },
    { num: 'EMP-005', nombre: 'Roberto', ap: 'Sánchez', am: 'Luna', rfc: 'SALR910830XX5', puesto: 'Soldador', cat: 'TECNICO', salario: 720, cuadrilla: cuaBeta.id_cuadrilla, certs: '["Soldadura AWS","DC3-Alturas"]' },
    { num: 'EMP-006', nombre: 'José Luis', ap: 'Hernández', am: 'Mora', rfc: 'HEMJ870114XX6', puesto: 'Operador Grúa', cat: 'TECNICO', salario: 780, cuadrilla: cuaBeta.id_cuadrilla, certs: '["Maquinaria Pesada","DC3-Alturas"]' },
    { num: 'EMP-007', nombre: 'Rosa María', ap: 'Díaz', am: 'Flores', rfc: 'DIFR920225XX7', puesto: 'Capataz', cat: 'SUPERVISOR', salario: 800, cuadrilla: cuaGamma.id_cuadrilla, certs: '["DC3-Alturas"]' },
    { num: 'EMP-008', nombre: 'Fernando', ap: 'López', am: 'Castillo', rfc: 'LOCF880916XX8', puesto: 'Pintor', cat: 'OBRERO', salario: 480, cuadrilla: cuaGamma.id_cuadrilla, certs: null },
    { num: 'EMP-009', nombre: 'Ana Sofía', ap: 'Rivera', am: 'Mendoza', rfc: 'RIMA950710XX9', puesto: 'Administrativa RRHH', cat: 'ADMINISTRATIVO', salario: 650, cuadrilla: null, certs: null },
    { num: 'EMP-010', nombre: 'David', ap: 'Morales', am: null, rfc: 'MOMD880103X10', puesto: 'Ayudante general', cat: 'OBRERO', salario: 400, cuadrilla: cuaAlfa.id_cuadrilla, certs: null },
  ];

  for (const e of empleadosData) {
    await prisma.empleado.create({
      data: {
        tenant_id: TENANT_ID,
        numero_empleado: e.num, nombre: e.nombre,
        apellido_paterno: e.ap, apellido_materno: e.am,
        rfc: e.rfc, puesto: e.puesto, categoria: e.cat,
        tipo_contrato: 'PLANTA',
        fecha_ingreso: new Date('2026-01-15'),
        salario_diario: e.salario,
        certificaciones: e.certs,
        estado: 'ACTIVO',
        cuadrilla_id: e.cuadrilla,
      },
    });
  }

  console.log('  ✅ 10 empleados creados');

  // ── Asignaciones a Frentes ──
  const empleados = await prisma.empleado.findMany({ where: { tenant_id: TENANT_ID, cuadrilla_id: { not: null } } });

  for (const emp of empleados.slice(0, 6)) {
    await prisma.asignacionFrente.create({
      data: {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        empleado_id: emp.id_empleado,
        cuadrilla_id: emp.cuadrilla_id,
        frente_trabajo: emp.cuadrilla_id === cuaAlfa.id_cuadrilla ? 'Frente 1 — Cimentación'
          : emp.cuadrilla_id === cuaBeta.id_cuadrilla ? 'Frente 2 — Estructura'
          : 'Frente 3 — Acabados',
        turno: 'DIURNO',
        fecha_inicio: new Date('2026-03-01'),
        horas_diarias: 8,
        estado: 'ACTIVA',
      },
    });
  }

  console.log('  ✅ 6 asignaciones a frentes creadas');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  👷  Seed de Personal / RRHH completado');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

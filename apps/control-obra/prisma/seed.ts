import { PrismaClient } from '../src/generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Control de Obra — Seed de datos de desarrollo
 *
 * Usa los mismos UUIDs de tenant y proyecto que Auth y los demás módulos
 * para mantener consistencia en el ecosistema.
 * ---------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

// ─── UUIDs compartidos del ecosistema ────────────────────────────────────────
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const PROYECTO_ID = '660e8400-e29b-41d4-a716-446655440001';
const USER_RESIDENTE = '770e8400-e29b-41d4-a716-446655440002';
const USER_SUPER = '770e8400-e29b-41d4-a716-446655440001';

async function main() {
  console.log('🌱 Seeding Control de Obra...');

  // ── Limpiar datos existentes ──
  await prisma.avanceFisico.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.estimacion.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.bitacoraObra.deleteMany({ where: { tenant_id: TENANT_ID } });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BITÁCORAS DE OBRA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const bitacoras = await prisma.bitacoraObra.createMany({
    data: [
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        numero_entrada: 1, fecha: new Date('2026-03-10'),
        frente_trabajo: 'Frente 1 — Cimentación', turno: 'DIURNO',
        clima: 'Soleado', temperatura_c: 28.5,
        actividades_realizadas: 'Excavación de zapatas Z-1 a Z-8. Colado de plantilla de concreto pobre f\'c=100.',
        personal_en_sitio: 24, incidencias: null,
        material_recibido: '42 m³ concreto premezclado, 3.2 ton acero #4',
        observaciones: 'Se completó al 100% la excavación programada.',
        residente_id: USER_RESIDENTE, residente_nombre: 'Ing. Carlos Martínez',
        estado: 'FIRMADA',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        numero_entrada: 2, fecha: new Date('2026-03-11'),
        frente_trabajo: 'Frente 1 — Cimentación', turno: 'DIURNO',
        clima: 'Nublado', temperatura_c: 24.0,
        actividades_realizadas: 'Armado de acero en zapatas Z-1 a Z-4. Habilitado de cimbra para dados.',
        personal_en_sitio: 28,
        incidencias: 'Retraso de 2 horas por lluvia ligera a mediodía.',
        material_recibido: null,
        observaciones: 'Se recuperó el tiempo perdido con turno extendido.',
        residente_id: USER_RESIDENTE, residente_nombre: 'Ing. Carlos Martínez',
        estado: 'FIRMADA',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        numero_entrada: 3, fecha: new Date('2026-03-12'),
        frente_trabajo: 'Frente 2 — Estructura', turno: 'DIURNO',
        clima: 'Soleado', temperatura_c: 30.2,
        actividades_realizadas: 'Inicio de colado de columnas planta baja. Cimbrado de trabes T-1 y T-2.',
        personal_en_sitio: 32, incidencias: null,
        material_recibido: '18 m³ concreto f\'c=250, 1.8 ton acero #3',
        observaciones: 'Avance conforme a programa. Sin desvíos.',
        residente_id: USER_RESIDENTE, residente_nombre: 'Ing. Carlos Martínez',
        estado: 'BORRADOR',
      },
    ],
  });
  console.log(`  ✅ ${bitacoras.count} bitácoras creadas`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AVANCES FÍSICOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const avances = await prisma.avanceFisico.createMany({
    data: [
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Excavación a cielo abierto',
        cantidad_presupuestada: 580, cantidad_anterior: 0, cantidad_periodo: 320,
        cantidad_acumulada: 320, unidad: 'm³', precio_unitario: 185.50,
        importe_periodo: 320 * 185.50, importe_acumulado: 320 * 185.50,
        porcentaje_avance: (320 / 580) * 100,
        periodo_inicio: new Date('2026-03-01'), periodo_fin: new Date('2026-03-15'),
        registrado_por_id: USER_RESIDENTE, registrado_por_nombre: 'Ing. Carlos Martínez',
        validado_por_id: USER_SUPER, validado_por_nombre: 'Ing. Roberto Sánchez',
        estado: 'VALIDADO',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        concepto_presupuesto: 'CIM-002', descripcion_concepto: 'Concreto en zapatas f\'c=250',
        cantidad_presupuestada: 420, cantidad_anterior: 0, cantidad_periodo: 180,
        cantidad_acumulada: 180, unidad: 'm³', precio_unitario: 2850.00,
        importe_periodo: 180 * 2850, importe_acumulado: 180 * 2850,
        porcentaje_avance: (180 / 420) * 100,
        periodo_inicio: new Date('2026-03-01'), periodo_fin: new Date('2026-03-15'),
        registrado_por_id: USER_RESIDENTE, registrado_por_nombre: 'Ing. Carlos Martínez',
        validado_por_id: USER_SUPER, validado_por_nombre: 'Ing. Roberto Sánchez',
        estado: 'VALIDADO',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        concepto_presupuesto: 'CIM-003', descripcion_concepto: 'Acero de refuerzo en cimentación',
        cantidad_presupuestada: 45000, cantidad_anterior: 0, cantidad_periodo: 18500,
        cantidad_acumulada: 18500, unidad: 'kg', precio_unitario: 32.80,
        importe_periodo: 18500 * 32.80, importe_acumulado: 18500 * 32.80,
        porcentaje_avance: (18500 / 45000) * 100,
        periodo_inicio: new Date('2026-03-01'), periodo_fin: new Date('2026-03-15'),
        registrado_por_id: USER_RESIDENTE, registrado_por_nombre: 'Ing. Carlos Martínez',
        estado: 'PENDIENTE',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        concepto_presupuesto: 'EST-001', descripcion_concepto: 'Columnas de concreto planta baja',
        cantidad_presupuestada: 85, cantidad_anterior: 0, cantidad_periodo: 12,
        cantidad_acumulada: 12, unidad: 'm³', precio_unitario: 4200.00,
        importe_periodo: 12 * 4200, importe_acumulado: 12 * 4200,
        porcentaje_avance: (12 / 85) * 100,
        periodo_inicio: new Date('2026-03-10'), periodo_fin: new Date('2026-03-15'),
        registrado_por_id: USER_RESIDENTE, registrado_por_nombre: 'Ing. Carlos Martínez',
        estado: 'PENDIENTE',
      },
    ],
  });
  console.log(`  ✅ ${avances.count} avances físicos creados`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏗️  Seed de Control de Obra completado exitosamente');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

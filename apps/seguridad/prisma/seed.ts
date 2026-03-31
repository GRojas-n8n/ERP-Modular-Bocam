import { PrismaClient } from '../src/generated/prisma';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Seguridad / HSE — Seed de datos de desarrollo
 * ---------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const PROYECTO_ID = '660e8400-e29b-41d4-a716-446655440001';
const USER_ADMIN = '770e8400-e29b-41d4-a716-446655440001';
const USER_INSPECTOR = '770e8400-e29b-41d4-a716-446655440002';

async function main() {
  console.log('🌱 Seeding Seguridad / HSE...');

  // Limpiar datos existentes (orden inverso por FK)
  await prisma.registroCapacitacion.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.capacitacion.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.permisoTrabajo.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.inspeccionSeguridad.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.incidente.deleteMany({ where: { tenant_id: TENANT_ID } });

  // ── Incidentes ──────────────────────────────────────────────────────────
  await prisma.incidente.createMany({
    data: [
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INC-2026-001', tipo: 'ACCIDENTE', severidad: 'ALTA',
        fecha_incidente: new Date('2026-03-10T09:30:00Z'), hora_incidente: '09:30',
        ubicacion: 'Frente 2 — Estructura Metálica',
        descripcion: 'Caída de material desde tercer nivel. Varilla de acero desprendió de grúa torre y cayó a zona de trabajo.',
        empleado_afectado_nombre: 'Carlos Martínez Ruiz',
        testigos: '["Roberto Sánchez Luna", "José Luis Hernández Mora"]',
        causa_raiz: 'Eslingas en mal estado. Falta de inspección previa del equipo de izaje.',
        accion_correctiva: 'Reemplazo inmediato de todas las eslingas. Zona acordonada.',
        accion_preventiva: 'Programa de inspección diaria de equipos de izaje. Capacitación DC3 de rig.',
        dias_incapacidad: 0, requirio_atencion_medica: false, reportado_stps: false,
        estado: 'ACCION_CORRECTIVA', reportado_por: USER_ADMIN,
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INC-2026-002', tipo: 'CASI_ACCIDENTE', severidad: 'MEDIA',
        fecha_incidente: new Date('2026-03-12T14:15:00Z'), hora_incidente: '14:15',
        ubicacion: 'Frente 1 — Cimentación',
        descripcion: 'Trabajador resbaló en excavación húmeda sin acceso seguro. Sin lesiones gracias a arnés de seguridad.',
        empleado_afectado_nombre: 'Pedro González Soto',
        causa_raiz: 'Lluvia nocturna dejó talud resbaladizo. Falta de escalera de acceso.',
        accion_correctiva: 'Instalación de escalera marina en excavación.',
        dias_incapacidad: 0, requirio_atencion_medica: false,
        estado: 'CERRADO', reportado_por: USER_INSPECTOR, cerrado_por: USER_ADMIN,
        fecha_cierre: new Date('2026-03-13'),
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INC-2026-003', tipo: 'CONDICION_INSEGURA', severidad: 'BAJA',
        fecha_incidente: new Date('2026-03-15T08:00:00Z'), hora_incidente: '08:00',
        ubicacion: 'Almacén de materiales',
        descripcion: 'Extintores con sello roto y sin recarga vigente detectados en ronda matutina.',
        accion_correctiva: 'Envío a recarga de 4 extintores. Sustitución temporal con unidades de reserva.',
        dias_incapacidad: 0, requirio_atencion_medica: false,
        estado: 'ABIERTO', reportado_por: USER_INSPECTOR,
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INC-2026-004', tipo: 'ACCIDENTE', severidad: 'CRITICA',
        fecha_incidente: new Date('2026-03-08T11:45:00Z'), hora_incidente: '11:45',
        ubicacion: 'Frente 3 — Acabados Piso 5',
        descripcion: 'Trabajador sufrió descarga eléctrica al manipular tablero provisional sin equipo dieléctrico.',
        empleado_afectado_nombre: 'Fernando López Castillo',
        causa_raiz: 'Tablero provisional sin señalización. Trabajador sin guantes dieléctricos.',
        accion_correctiva: 'Hospitalización inmediata. Tablero aislado y señalizado.',
        accion_preventiva: 'Capacitación eléctrica obligatoria. Entrega de EPP dieléctrico a cuadrilla de acabados.',
        dias_incapacidad: 5, requirio_atencion_medica: true, reportado_stps: true,
        estado: 'CERRADO', reportado_por: USER_ADMIN, cerrado_por: USER_ADMIN,
        fecha_cierre: new Date('2026-03-16'),
      },
    ],
  });
  console.log('  ✅ 4 incidentes creados');

  // ── Inspecciones ────────────────────────────────────────────────────────
  await prisma.inspeccionSeguridad.createMany({
    data: [
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INS-2026-001', tipo_inspeccion: 'EPP (Equipo de Protección Personal)',
        fecha_inspeccion: new Date('2026-03-14'),
        area_inspeccionada: 'Frente 1 — Cimentación',
        items_revisados: 20, items_conformes: 18, items_no_conformes: 2,
        porcentaje_cumplimiento: 90.00, resultado: 'OBSERVACIONES',
        observaciones: '2 trabajadores sin lentes de seguridad. Se proporcionaron en sitio.',
        inspector_id: USER_INSPECTOR, inspector_nombre: 'Ing. Samuel Moreno',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INS-2026-002', tipo_inspeccion: 'Andamios y Plataformas',
        fecha_inspeccion: new Date('2026-03-15'),
        area_inspeccionada: 'Frente 2 — Estructura Metálica',
        items_revisados: 15, items_conformes: 15, items_no_conformes: 0,
        porcentaje_cumplimiento: 100.00, resultado: 'APROBADA',
        observaciones: 'Todos los andamios con tarjeta verde vigente. Barandales completos.',
        inspector_id: USER_INSPECTOR, inspector_nombre: 'Ing. Samuel Moreno',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'INS-2026-003', tipo_inspeccion: 'Excavaciones y Taludes',
        fecha_inspeccion: new Date('2026-03-16'),
        area_inspeccionada: 'Frente 1 — Cimentación (Excavación profunda)',
        items_revisados: 12, items_conformes: 9, items_no_conformes: 3,
        porcentaje_cumplimiento: 75.00, resultado: 'NO_APROBADA',
        observaciones: 'Falta entibado en muro poniente. Escalera de acceso con peldaño roto. Sin línea de vida.',
        hallazgos: '["Entibado faltante muro poniente","Escalera dañada","Sin línea de vida perimetral"]',
        inspector_id: USER_INSPECTOR, inspector_nombre: 'Ing. Samuel Moreno',
      },
    ],
  });
  console.log('  ✅ 3 inspecciones creadas');

  // ── Permisos de Trabajo ─────────────────────────────────────────────────
  await prisma.permisoTrabajo.createMany({
    data: [
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'PT-ALT-001', tipo_permiso: 'ALTURAS',
        area_trabajo: 'Frente 2 — Estructura Metálica, Nivel 3',
        descripcion_trabajo: 'Montaje de trabes metálicas en nivel 3. Altura de trabajo: 12 metros.',
        fecha_inicio: new Date('2026-03-17T07:00:00Z'),
        fecha_fin: new Date('2026-03-17T17:00:00Z'),
        estado: 'VIGENTE',
        epp_requerido: '["Arnés de cuerpo completo","Línea de vida doble","Casco con barbiquejo","Botas antiderrapantes"]',
        medidas_control: 'Línea de vida horizontal instalada. Red de protección en nivel inferior. Clima revisado: sin lluvia prevista.',
        checklist_previo: true,
        solicitado_por: USER_ADMIN, solicitante_nombre: 'Ing. Miguel Ángel Torres',
        autorizado_por: USER_INSPECTOR, autorizador_nombre: 'Ing. Samuel Moreno',
        trabajadores: '[{"nombre":"Roberto Sánchez Luna","puesto":"Soldador"},{"nombre":"José Luis Hernández Mora","puesto":"Operador Grúa"}]',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'PT-EXC-001', tipo_permiso: 'EXCAVACION',
        area_trabajo: 'Frente 1 — Cimentación, Zona Norte',
        descripcion_trabajo: 'Excavación profunda para zapata Z-14. Profundidad estimada: 4.5 metros.',
        fecha_inicio: new Date('2026-03-16T07:00:00Z'),
        fecha_fin: new Date('2026-03-16T15:00:00Z'),
        estado: 'EXPIRADO',
        epp_requerido: '["Casco","Chaleco reflejante","Botas con casquillo"]',
        medidas_control: 'Entibado completo. Detector de gases. Escalera de acceso cada 7.5m.',
        checklist_previo: true,
        solicitado_por: USER_ADMIN, solicitante_nombre: 'Ing. Juan Pérez López',
        autorizado_por: USER_INSPECTOR, autorizador_nombre: 'Ing. Samuel Moreno',
      },
      {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        codigo: 'PT-CAL-001', tipo_permiso: 'TRABAJO_CALIENTE',
        area_trabajo: 'Frente 2 — Estructura, Uniones soldadas Nivel 2',
        descripcion_trabajo: 'Soldadura de conexiones en columnas C-8 a C-12. Proceso SMAW.',
        fecha_inicio: new Date('2026-03-17T08:00:00Z'),
        fecha_fin: new Date('2026-03-17T14:00:00Z'),
        estado: 'VIGENTE',
        epp_requerido: '["Careta de soldador","Guantes de carnaza","Peto de cuero","Polainas"]',
        medidas_control: 'Extintor PQS 6kg a 3m. Manta ignífuga en nivel inferior. Vigía de fuego asignado.',
        checklist_previo: true,
        solicitado_por: USER_ADMIN, solicitante_nombre: 'Ing. Miguel Ángel Torres',
        autorizado_por: USER_INSPECTOR, autorizador_nombre: 'Ing. Samuel Moreno',
      },
    ],
  });
  console.log('  ✅ 3 permisos de trabajo creados');

  // ── Capacitaciones ──────────────────────────────────────────────────────
  const cap1 = await prisma.capacitacion.create({
    data: {
      tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
      codigo: 'CAP-2026-001', titulo: 'Trabajo en Alturas — DC3',
      tipo: 'DC3', instructor: 'Ing. Samuel Moreno (Cert. STyPS)',
      fecha: new Date('2026-03-05'), duracion_horas: 8,
      ubicacion: 'Aula de capacitación, Obra Torre Norte',
      contenido: 'Normativa NOM-009-STPS. Uso correcto de arnés. Puntos de anclaje. Rescate en alturas.',
      validez_meses: 12, estado: 'COMPLETADA',
    },
  });

  const cap2 = await prisma.capacitacion.create({
    data: {
      tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
      codigo: 'CAP-2026-002', titulo: 'Inducción de Seguridad en Obra',
      tipo: 'INDUCCION', instructor: 'Lic. Ana Sofía Rivera',
      fecha: new Date('2026-03-01'), duracion_horas: 4,
      ubicacion: 'Oficina de obra',
      contenido: 'Política HSE. Reglas cardinales. Uso de EPP básico. Recorrido de seguridad.',
      validez_meses: null, estado: 'COMPLETADA',
    },
  });

  const cap3 = await prisma.capacitacion.create({
    data: {
      tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
      codigo: 'CAP-2026-003', titulo: 'Simulacro de Evacuación Sísmica',
      tipo: 'SIMULACRO', instructor: 'Protección Civil Municipal',
      fecha: new Date('2026-03-20'), duracion_horas: 2,
      ubicacion: 'Toda la obra',
      contenido: 'Rutas de evacuación. Puntos de reunión. Protocolo de conteo de personal.',
      validez_meses: 6, estado: 'PROGRAMADA',
    },
  });

  console.log('  ✅ 3 capacitaciones creadas');

  // ── Registros de asistencia ─────────────────────────────────────────────
  const asistentes = [
    { nombre: 'Juan Pérez López', aprobado: true, cal: 92 },
    { nombre: 'Carlos Martínez Ruiz', aprobado: true, cal: 88 },
    { nombre: 'Roberto Sánchez Luna', aprobado: true, cal: 95 },
    { nombre: 'José Luis Hernández Mora', aprobado: true, cal: 90 },
    { nombre: 'Pedro González Soto', aprobado: false, cal: 58 },
    { nombre: 'Miguel Ángel Torres Vega', aprobado: true, cal: 97 },
  ];

  for (const a of asistentes) {
    await prisma.registroCapacitacion.create({
      data: {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        capacitacion_id: cap1.id_capacitacion,
        empleado_id: USER_ADMIN, // Referencia simbólica
        empleado_nombre: a.nombre,
        asistio: true, calificacion: a.cal, aprobado: a.aprobado,
        observaciones: a.aprobado ? null : 'Requiere re-evaluación',
      },
    });
  }

  // Asistencia a inducción
  for (const a of asistentes.slice(0, 4)) {
    await prisma.registroCapacitacion.create({
      data: {
        tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID,
        capacitacion_id: cap2.id_capacitacion,
        empleado_id: USER_ADMIN,
        empleado_nombre: a.nombre,
        asistio: true, calificacion: 100, aprobado: true,
      },
    });
  }

  console.log('  ✅ 10 registros de capacitación creados');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🛡️  Seed de Seguridad / HSE completado');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

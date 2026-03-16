import { PrismaClient } from '@prisma/client';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Finanzas — Seed de datos de prueba
 *
 * Usa los mismos UUIDs del Tenant Alfa y Proyecto Torre que los demás módulos.
 * ---------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

// ─── UUIDs Compartidos (Consistentes con Auth y Compras) ────────────────────
const TENANT_ALFA_ID = '11111111-aaaa-bbbb-cccc-111111111111';
const PROYECTO_TORRE_ID = '33333333-aaaa-bbbb-cccc-333333333333';
const PROYECTO_PUENTE_ID = '44444444-aaaa-bbbb-cccc-444444444444';
const USUARIO_ADMIN_ID = '99999999-aaaa-bbbb-cccc-999999999999';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  💰 Seed: Módulo Finanzas (Tesorería y Flujo de Caja)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ─── 1. Limpiar datos previos (orden de dependencias) ───────────────────
  console.log('\n🧹 Limpiando datos previos...');
  await prisma.programaPagos.deleteMany({});
  await prisma.movimientoPresupuestal.deleteMany({});
  await prisma.presupuestoAsignado.deleteMany({});

  // ─── 2. Presupuestos del Proyecto Torre Alfa ────────────────────────────
  console.log('\n📊 Creando Presupuestos Asignados...');

  const presMateriales = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_TORRE_ID,
      codigo: 'PRES-2026-T1-MAT',
      descripcion: 'Presupuesto de Materiales — Torre Alfa Nivel 1-10',
      monto_autorizado: 15000000.00, // $15M MXN
      monto_ejercido: 3200000.00,
      monto_comprometido: 1800000.00,
      monto_disponible: 10000000.00, // 15M - 3.2M - 1.8M = 10M
      capitulo: 'MATERIALES',
      estatus: 'ACTIVO',
    },
  });

  const presManoObra = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_TORRE_ID,
      codigo: 'PRES-2026-T1-MO',
      descripcion: 'Presupuesto de Mano de Obra — Torre Alfa',
      monto_autorizado: 8000000.00, // $8M MXN
      monto_ejercido: 2500000.00,
      monto_comprometido: 500000.00,
      monto_disponible: 5000000.00, // 8M - 2.5M - 0.5M = 5M
      capitulo: 'MANO_OBRA',
      estatus: 'ACTIVO',
    },
  });

  const presSubcontratos = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_TORRE_ID,
      codigo: 'PRES-2026-T1-SUB',
      descripcion: 'Presupuesto de Subcontratos — Instalaciones Eléctricas e Hidrosanitarias',
      monto_autorizado: 5000000.00, // $5M MXN
      monto_ejercido: 0,
      monto_comprometido: 0,
      monto_disponible: 5000000.00,
      capitulo: 'SUBCONTRATOS',
      estatus: 'ACTIVO',
    },
  });

  console.log('  ✅ 3 presupuestos creados para Torre Alfa');

  // ─── 3. Presupuestos del Proyecto Puente ────────────────────────────────
  const presPuenteMat = await prisma.presupuestoAsignado.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_PUENTE_ID,
      codigo: 'PRES-2026-P1-MAT',
      descripcion: 'Presupuesto de Materiales — Puente Vehicular Norte',
      monto_autorizado: 25000000.00, // $25M MXN
      monto_ejercido: 7800000.00,
      monto_comprometido: 3200000.00,
      monto_disponible: 14000000.00,
      capitulo: 'MATERIALES',
      estatus: 'ACTIVO',
    },
  });

  console.log('  ✅ 1 presupuesto creado para Puente Norte');

  // ─── 4. Movimientos Presupuestales (Historial) ──────────────────────────
  console.log('\n📝 Creando Movimientos Presupuestales...');

  await prisma.movimientoPresupuestal.createMany({
    data: [
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presMateriales.id_presupuesto,
        tipo: 'COMPROMISO',
        concepto: 'Compromiso por OC de cemento CEMEX — Colado losa nivel 5',
        monto: 1800000.00,
        referencia_modulo: 'compras',
        referencia_entidad: 'OrdenCompra',
        referencia_codigo: 'OC-2026-T1-001',
        usuario_id: USUARIO_ADMIN_ID,
        notas: 'Fondos congelados automáticamente al emitir OC.',
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presMateriales.id_presupuesto,
        tipo: 'EJERCIDO',
        concepto: 'Pago factura CEMEX — Entrega parcial (30 toneladas)',
        monto: 1600000.00,
        referencia_modulo: 'compras',
        referencia_entidad: 'OrdenCompra',
        referencia_codigo: 'OC-2025-T1-089',
        usuario_id: USUARIO_ADMIN_ID,
        notas: 'Pago procesado vía transferencia SPEI.',
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presMateriales.id_presupuesto,
        tipo: 'EJERCIDO',
        concepto: 'Pago factura Acero de México — Varilla 3/8',
        monto: 1600000.00,
        referencia_modulo: 'compras',
        referencia_entidad: 'OrdenCompra',
        referencia_codigo: 'OC-2025-T1-076',
        usuario_id: USUARIO_ADMIN_ID,
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presManoObra.id_presupuesto,
        tipo: 'EJERCIDO',
        concepto: 'Nómina quincenal — Cuadrilla de estructura (15-28 Feb)',
        monto: 850000.00,
        usuario_id: USUARIO_ADMIN_ID,
        notas: 'Pago a destajistas certificados.',
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presManoObra.id_presupuesto,
        tipo: 'COMPROMISO',
        concepto: 'Contrato mano de obra — Acabados piso 3-5',
        monto: 500000.00,
        usuario_id: USUARIO_ADMIN_ID,
      },
    ],
  });

  console.log('  ✅ 5 movimientos presupuestales registrados');

  // ─── 5. Programa de Pagos ───────────────────────────────────────────────
  console.log('\n📅 Creando Programa de Pagos...');

  await prisma.programaPagos.createMany({
    data: [
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presMateriales.id_presupuesto,
        concepto: 'Pago estimación #3 — CEMEX concretos',
        beneficiario: 'CEMEX CONCRETOS S.A. DE C.V.',
        monto_programado: 950000.00,
        fecha_programada: new Date('2026-03-20'),
        estado: 'PROGRAMADO',
        metodo_pago: 'TRANSFERENCIA',
        banco: 'BBVA México',
        referencia_modulo: 'compras',
        referencia_entidad: 'OrdenCompra',
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presManoObra.id_presupuesto,
        concepto: 'Nómina quincenal — 1ra quincena Marzo 2026',
        beneficiario: 'Cuadrilla Estructura (Varios)',
        monto_programado: 750000.00,
        fecha_programada: new Date('2026-03-15'),
        estado: 'PAGADO',
        monto_pagado: 750000.00,
        fecha_pago_real: new Date('2026-03-15'),
        metodo_pago: 'TRANSFERENCIA',
        banco: 'Banorte',
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_TORRE_ID,
        presupuesto_id: presSubcontratos.id_presupuesto,
        concepto: 'Anticipo 30% — Instalaciones eléctricas piso 1-3',
        beneficiario: 'ELECTROINSTALACIONES DEL NORTE S.A.',
        monto_programado: 600000.00,
        fecha_programada: new Date('2026-04-01'),
        estado: 'PENDIENTE',
        metodo_pago: 'CHEQUE',
      },
      {
        tenant_id: TENANT_ALFA_ID,
        proyecto_id: PROYECTO_PUENTE_ID,
        presupuesto_id: presPuenteMat.id_presupuesto,
        concepto: 'Pago concreto premezclado — Pila 4',
        beneficiario: 'HOLCIM APASCO S.A. DE C.V.',
        monto_programado: 2100000.00,
        fecha_programada: new Date('2026-03-25'),
        estado: 'PROGRAMADO',
        metodo_pago: 'TRANSFERENCIA',
        banco: 'HSBC México',
      },
    ],
  });

  console.log('  ✅ 4 pagos programados');

  // ─── 6. Resumen Final ───────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Seed de Finanzas completado exitosamente');
  console.log('  📊 Presupuestos: 4 (3 Torre + 1 Puente)');
  console.log('  📝 Movimientos: 5 (compromisos y ejercidos)');
  console.log('  📅 Pagos programados: 4');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de Finanzas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

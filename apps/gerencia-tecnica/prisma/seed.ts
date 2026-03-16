import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Módulo: Gerencia Técnica
 * Script: Sembrado de datos de prueba (Seed)
 *
 * ⚠️ NOTA: Este script usa PrismaClient directamente (bypass RLS).
 *    Esto es CORRECTO y EXCLUSIVO para el script de seed.
 *    En ejecución normal, TODO acceso DEBE ir por createTenantContext().
 *
 *    El usuario de PostgreSQL que ejecuta esto (postgres) es superuser,
 *    por lo que RLS (FORCE) no le aplica.
 * ---------------------------------------------------------------------------
 */

const prisma = new PrismaClient();

// IDs fijos para facilitar las pruebas de desarrollo
// En un entorno real, estos vendrían del módulo Admin / App Shell.
const TENANT_ALFA_ID = '11111111-aaaa-bbbb-cccc-111111111111';
const TENANT_BETA_ID = '22222222-aaaa-bbbb-cccc-222222222222';
const PROYECTO_TORRE_ID = '33333333-aaaa-bbbb-cccc-333333333333';
const PROYECTO_PLAZA_ID = '44444444-aaaa-bbbb-cccc-444444444444';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🌱 SEED: Módulo Gerencia Técnica');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ─── Limpiar datos existentes (idempotente) ─────────────────────────────
  await prisma.concepto.deleteMany({});
  await prisma.presupuestoBase.deleteMany({});
  await prisma.insumo.deleteMany({});
  console.log('[SEED] 🗑️  Datos previos limpiados.');

  // ═══════════════════════════════════════════════════════════════════════
  // TENANT 1: Constructora Alfa S.A. — Proyecto: Torre Alfa 100
  // ═══════════════════════════════════════════════════════════════════════

  // Insumos del Tenant 1
  const insumosCemento = await prisma.insumo.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      clave: 'MAT-CEM-01',
      descripcion: 'Cemento Portland Gris CPC 40 RS (50 kg)',
      unidad_medida: 'TON',
      tipo_insumo: 'MATERIAL',
      costo_base: 3200.50,
    },
  });

  const insumosVarilla = await prisma.insumo.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      clave: 'MAT-VAR-01',
      descripcion: 'Varilla corrugada #4 (1/2") Grado 42',
      unidad_medida: 'TON',
      tipo_insumo: 'MATERIAL',
      costo_base: 18500.00,
    },
  });

  const insumosObrero = await prisma.insumo.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      clave: 'MO-ALB-01',
      descripcion: 'Albañil de primera categoría',
      unidad_medida: 'JOR',
      tipo_insumo: 'MANO_DE_OBRA',
      costo_base: 650.00,
    },
  });

  const insumoRetro = await prisma.insumo.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      clave: 'EQ-RET-01',
      descripcion: 'Retroexcavadora CAT 420F2 (incluye operador)',
      unidad_medida: 'HR',
      tipo_insumo: 'EQUIPO',
      costo_base: 1200.00,
    },
  });

  console.log(`[SEED] ✅ Tenant Alfa: ${4} insumos creados.`);

  // Presupuesto Base del Tenant 1
  const presupuestoAlfa = await prisma.presupuestoBase.create({
    data: {
      tenant_id: TENANT_ALFA_ID,
      proyecto_id: PROYECTO_TORRE_ID,
      version: 1,
      estado: 'BORRADOR',
      importe_total: 2_500_000.00,
      conceptos: {
        create: [
          {
            tenant_id: TENANT_ALFA_ID,
            proyecto_id: PROYECTO_TORRE_ID,
            clave: 'PREL-001',
            descripcion: 'Trazo y nivelación del terreno',
            unidad_medida: 'M2',
            cantidad: 2500,
            precio_unitario: 18.50,
            importe: 46_250.00,
          },
          {
            tenant_id: TENANT_ALFA_ID,
            proyecto_id: PROYECTO_TORRE_ID,
            clave: 'PREL-002',
            descripcion: 'Excavación a cielo abierto en material tipo II',
            unidad_medida: 'M3',
            cantidad: 800,
            precio_unitario: 145.00,
            importe: 116_000.00,
          },
          {
            tenant_id: TENANT_ALFA_ID,
            proyecto_id: PROYECTO_TORRE_ID,
            clave: 'EST-001',
            descripcion: 'Cimentación a base de zapatas aisladas de concreto f\'c=250 kg/cm²',
            unidad_medida: 'M3',
            cantidad: 120,
            precio_unitario: 4500.00,
            importe: 540_000.00,
          },
        ],
      },
    },
  });

  console.log(`[SEED] ✅ Tenant Alfa: Presupuesto creado con 3 conceptos.`);

  // ═══════════════════════════════════════════════════════════════════════
  // TENANT 2: Edificaciones Beta LLC — Proyecto: Plaza Beta
  // ═══════════════════════════════════════════════════════════════════════

  await prisma.insumo.create({
    data: {
      tenant_id: TENANT_BETA_ID,
      clave: 'MAT-CEM-01', // Misma clave, diferente tenant -> Permitido por uq_insumo_tenant_clave
      descripcion: 'Cemento Blanco Especial (25 kg)',
      unidad_medida: 'BTO',
      tipo_insumo: 'MATERIAL',
      costo_base: 385.00,
    },
  });

  await prisma.insumo.create({
    data: {
      tenant_id: TENANT_BETA_ID,
      clave: 'SUB-IMP-01',
      descripcion: 'Subcontrato de impermeabilización de azoteas',
      unidad_medida: 'M2',
      tipo_insumo: 'SUBCONTRATO',
      costo_base: 280.00,
    },
  });

  console.log(`[SEED] ✅ Tenant Beta: ${2} insumos creados.`);

  const presupuestoBeta = await prisma.presupuestoBase.create({
    data: {
      tenant_id: TENANT_BETA_ID,
      proyecto_id: PROYECTO_PLAZA_ID,
      version: 1,
      estado: 'EN_REVISION',
      importe_total: 8_000_000.00,
    },
  });

  console.log(`[SEED] ✅ Tenant Beta: Presupuesto creado (sin conceptos aún).`);

  // ═══════════════════════════════════════════════════════════════════════
  // RESUMEN PARA PRUEBAS
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📋 IDs PARA PRUEBAS (Usar en Headers HTTP)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  TENANT ALFA (Constructora):  ${TENANT_ALFA_ID}`);
  console.log(`  PROYECTO TORRE ALFA 100:     ${PROYECTO_TORRE_ID}`);
  console.log(`  ──────────────────────────────────────────────────`);
  console.log(`  TENANT BETA (Edificaciones): ${TENANT_BETA_ID}`);
  console.log(`  PROYECTO PLAZA BETA:         ${PROYECTO_PLAZA_ID}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  Ejemplo de petición con cURL:');
  console.log(`  curl -H "X-Tenant-Id: ${TENANT_ALFA_ID}" http://localhost:3001/api/v1/gerencia-tecnica/insumos`);
  console.log('\n  ✅ Seed completado con éxito.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Auth — Seed de Datos de Desarrollo
 *
 * PROPÓSITO:
 * Crear los mismos tenants, proyectos y usuarios que ya existen en el seed
 * de Gerencia Técnica y Compras, pero ahora con credenciales reales
 * para poder hacer login con JWT.
 *
 * USUARIOS DE PRUEBA:
 * ┌─────────────────────────────────┬─────────────┬──────────────────┐
 * │ Email                           │ Password    │ Rol              │
 * ├─────────────────────────────────┼─────────────┼──────────────────┤
 * │ admin@alfa.bocam.com            │ Admin.2026  │ admin, super     │
 * │ residente@alfa.bocam.com        │ Res.2026    │ resident         │
 * │ comprador@alfa.bocam.com        │ Comp.2026   │ procurement      │
 * │ admin@beta.bocam.com            │ Admin.2026  │ admin            │
 * └─────────────────────────────────┴─────────────┴──────────────────┘
 * ---------------------------------------------------------------------------
 */

import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

// UUIDs consistentes con los seeds de Gerencia Técnica y Compras
const TENANT_ALFA_ID = '11111111-aaaa-bbbb-cccc-111111111111';
const TENANT_BETA_ID = '22222222-aaaa-bbbb-cccc-222222222222';
const PROYECTO_ALFA_1 = '33333333-aaaa-bbbb-cccc-333333333333';
const PROYECTO_ALFA_2 = '44444444-aaaa-bbbb-cccc-444444444444';
const PROYECTO_BETA_1 = '55555555-aaaa-bbbb-cccc-555555555555';

async function main() {
  console.log('🌱 Auth Seed: Iniciando siembra de datos de identidad...\n');

  // ─── 1. Crear Tenants ──────────────────────────────────────────────────
  const tenantAlfa = await prisma.tenant.upsert({
    where: { id_tenant: TENANT_ALFA_ID },
    update: {},
    create: {
      id_tenant: TENANT_ALFA_ID,
      nombre: 'Constructora Alfa S.A.',
      rfc: 'CAL260315ABC',
      logo_url: 'https://placehold.co/200x50/221253/ffffff?text=ALFA+CONSTRUCTORA',
      primary_color: '221.2 83.2% 53.3%',
      plan: 'PROFESIONAL',
    },
  });
  console.log(`  ✅ Tenant: ${tenantAlfa.nombre}`);

  const tenantBeta = await prisma.tenant.upsert({
    where: { id_tenant: TENANT_BETA_ID },
    update: {},
    create: {
      id_tenant: TENANT_BETA_ID,
      nombre: 'Desarrollos Beta Corp.',
      rfc: 'DBC260315XYZ',
      logo_url: 'https://placehold.co/200x50/065f46/ffffff?text=BETA+CORP',
      primary_color: '160 84% 39%',
      plan: 'BASICO',
    },
  });
  console.log(`  ✅ Tenant: ${tenantBeta.nombre}`);

  // ─── 2. Crear Proyectos ────────────────────────────────────────────────
  const proyAlfa1 = await prisma.proyecto.upsert({
    where: { id_proyecto: PROYECTO_ALFA_1 },
    update: {},
    create: {
      id_proyecto: PROYECTO_ALFA_1,
      tenant_id: TENANT_ALFA_ID,
      codigo_centro_costos: 'CC-2026-GUA-01',
      nombre_oficial: 'Planta de Tratamiento Guadalajara Norte',
      tipo_contrato: 'PRECIOS_UNITARIOS',
      moneda_base: 'MXN',
      estatus: 'CONSTRUCCION',
    },
  });
  console.log(`  ✅ Proyecto: ${proyAlfa1.nombre_oficial}`);

  const proyAlfa2 = await prisma.proyecto.upsert({
    where: { id_proyecto: PROYECTO_ALFA_2 },
    update: {},
    create: {
      id_proyecto: PROYECTO_ALFA_2,
      tenant_id: TENANT_ALFA_ID,
      codigo_centro_costos: 'CC-2026-MTY-02',
      nombre_oficial: 'Puente Vehicular Monterrey Sur',
      tipo_contrato: 'PRECIO_ALZADO',
      moneda_base: 'MXN',
      estatus: 'ADJUDICADO',
    },
  });
  console.log(`  ✅ Proyecto: ${proyAlfa2.nombre_oficial}`);

  const proyBeta1 = await prisma.proyecto.upsert({
    where: { id_proyecto: PROYECTO_BETA_1 },
    update: {},
    create: {
      id_proyecto: PROYECTO_BETA_1,
      tenant_id: TENANT_BETA_ID,
      codigo_centro_costos: 'CC-2026-CDMX-01',
      nombre_oficial: 'Torre Corporativa Reforma 222',
      tipo_contrato: 'EPC',
      moneda_base: 'MXN',
      estatus: 'CONSTRUCCION',
    },
  });
  console.log(`  ✅ Proyecto: ${proyBeta1.nombre_oficial}`);

  // ─── 3. Crear Usuarios ────────────────────────────────────────────────
  // Admin Alfa (Superintendencia - Acceso a todos los proyectos del tenant)
  const passAdmin = await bcrypt.hash('Admin.2026', BCRYPT_ROUNDS);
  const adminAlfa = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: TENANT_ALFA_ID, email: 'admin@alfa.bocam.com' } },
    update: {},
    create: {
      tenant_id: TENANT_ALFA_ID,
      email: 'admin@alfa.bocam.com',
      password_hash: passAdmin,
      nombre: 'Gerardo M. (Admin)',
      rol_global: ['admin', 'superintendent'],
      limite_aprobacion_financiera: 5000000,
      proyectos_acceso: {
        create: [
          { proyecto_id: PROYECTO_ALFA_1 },
          { proyecto_id: PROYECTO_ALFA_2 },
        ],
      },
    },
  });
  console.log(`  ✅ Usuario: ${adminAlfa.email} [admin, superintendent]`);

  // Residente Alfa (Solo acceso a Guadalajara)
  const passRes = await bcrypt.hash('Res.2026', BCRYPT_ROUNDS);
  const residenteAlfa = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: TENANT_ALFA_ID, email: 'residente@alfa.bocam.com' } },
    update: {},
    create: {
      tenant_id: TENANT_ALFA_ID,
      email: 'residente@alfa.bocam.com',
      password_hash: passRes,
      nombre: 'Carlos R. (Residente GDL)',
      rol_global: ['resident'],
      limite_aprobacion_financiera: 0,
      proyectos_acceso: {
        create: [
          { proyecto_id: PROYECTO_ALFA_1, rol_proyecto: 'residente_frente' },
        ],
      },
    },
  });
  console.log(`  ✅ Usuario: ${residenteAlfa.email} [resident → Solo GDL]`);

  // Comprador Alfa (Nivel Tenant - ve todos los proyectos)
  const passComp = await bcrypt.hash('Comp.2026', BCRYPT_ROUNDS);
  const compradorAlfa = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: TENANT_ALFA_ID, email: 'comprador@alfa.bocam.com' } },
    update: {},
    create: {
      tenant_id: TENANT_ALFA_ID,
      email: 'comprador@alfa.bocam.com',
      password_hash: passComp,
      nombre: 'Laura P. (Procuración)',
      rol_global: ['procurement'],
      limite_aprobacion_financiera: 50000,
      proyectos_acceso: {
        create: [
          { proyecto_id: PROYECTO_ALFA_1 },
          { proyecto_id: PROYECTO_ALFA_2 },
        ],
      },
    },
  });
  console.log(`  ✅ Usuario: ${compradorAlfa.email} [procurement]`);

  // Admin Beta (Organización separada — NUNCA debe ver datos de Alfa)
  const adminBeta = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: TENANT_BETA_ID, email: 'admin@beta.bocam.com' } },
    update: {},
    create: {
      tenant_id: TENANT_BETA_ID,
      email: 'admin@beta.bocam.com',
      password_hash: passAdmin,
      nombre: 'Roberto S. (Admin Beta)',
      rol_global: ['admin'],
      limite_aprobacion_financiera: 2000000,
      proyectos_acceso: {
        create: [
          { proyecto_id: PROYECTO_BETA_1 },
        ],
      },
    },
  });
  console.log(`  ✅ Usuario: ${adminBeta.email} [admin → Beta Corp]`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🌱 Auth Seed: COMPLETADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  📋 Credenciales de prueba:');
  console.log('  ┌────────────────────────────────┬────────────┐');
  console.log('  │ Email                          │ Password   │');
  console.log('  ├────────────────────────────────┼────────────┤');
  console.log('  │ admin@alfa.bocam.com           │ Admin.2026 │');
  console.log('  │ residente@alfa.bocam.com       │ Res.2026   │');
  console.log('  │ comprador@alfa.bocam.com       │ Comp.2026  │');
  console.log('  │ admin@beta.bocam.com           │ Admin.2026 │');
  console.log('  └────────────────────────────────┴────────────┘\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

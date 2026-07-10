/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Ventas — Seed de clientes reales para Centro de Costos
 *
 * NO se ejecuta automáticamente (no está enganchado a `prisma db seed`).
 * A diferencia de `prisma/seed.ts` (demo, destructivo — hace deleteMany),
 * este script es IDEMPOTENTE: usa upsert por (tenant_id, codigo_cliente),
 * seguro de correr más de una vez y seguro de correr sobre datos reales
 * existentes.
 *
 * Los RFC son PLACEHOLDER (no se proveyeron RFCs reales para estos 51
 * clientes) — deben corregirse manualmente vía el catálogo de Clientes
 * antes de usarlos en facturación real.
 *
 * Uso:
 *   TENANT_ID=<uuid-del-tenant-real> npx ts-node prisma/seed-clientes-centro-costos.ts
 * ---------------------------------------------------------------------------
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const CLIENTES: Array<{ codigo_cliente: string; razon_social: string }> = [
  { codigo_cliente: '000', razon_social: 'HUBI/BOCAM' },
  { codigo_cliente: '001', razon_social: 'ARCELORMITTAL LAS TRUCHAS' },
  { codigo_cliente: '002', razon_social: 'ARCELORMITTAL LAZARO CARDENAS' },
  { codigo_cliente: '003', razon_social: 'ARCELORMITTAL SERMMOSA' },
  { codigo_cliente: '004', razon_social: 'SERSSINSA' },
  { codigo_cliente: '005', razon_social: 'CFE DIVISION CENTRO OCCIDENTE' },
  { codigo_cliente: '006', razon_social: 'ASIPONA' },
  { codigo_cliente: '007', razon_social: 'LC TERMINAL PORTUARIA DE CONTENEDORES' },
  { codigo_cliente: '008', razon_social: 'LC MULTIPOURPOSE TERMINAL' },
  { codigo_cliente: '009', razon_social: 'PEMEX REFINACION' },
  { codigo_cliente: '010', razon_social: 'YELIMAR' },
  { codigo_cliente: '011', razon_social: 'SINCI' },
  { codigo_cliente: '012', razon_social: 'RODENSA' },
  { codigo_cliente: '013', razon_social: 'Corporacion del Balsas S.A. de C.V.' },
  { codigo_cliente: '014', razon_social: 'APM TERMINALS LAZARO CARDENAS' },
  { codigo_cliente: '015', razon_social: 'ARCELORMITTAL MEXICO SA DE CV' },
  { codigo_cliente: '016', razon_social: 'AGROINDUSTRIAS DEL BALSAS' },
  { codigo_cliente: '017', razon_social: 'IMHOTEP' },
  { codigo_cliente: '018', razon_social: 'Instalaciones Termicas y Civiles (Jose Acevedo)' },
  { codigo_cliente: '019', razon_social: 'SEDENA' },
  { codigo_cliente: '020', razon_social: 'SECRETARÍA DE LA DEFENSA NACIONAL DIRECCIONES GENERAL DE INGENIEROS' },
  { codigo_cliente: '021', razon_social: 'CFE DISTRIBUCION' },
  { codigo_cliente: '022', razon_social: 'CFE GENERACION IV CARBON II' },
  { codigo_cliente: '023', razon_social: 'TALIVIC' },
  { codigo_cliente: '024', razon_social: 'ACISA' },
  { codigo_cliente: '025', razon_social: 'ICAVE' },
  { codigo_cliente: '026', razon_social: 'CONTECON MANZANILLO, S.A. DE C.V.' },
  { codigo_cliente: '027', razon_social: 'ITC' },
  { codigo_cliente: '028', razon_social: 'CAPALAC' },
  { codigo_cliente: '029', razon_social: 'TALLER' },
  { codigo_cliente: '030', razon_social: 'OFICINA' },
  { codigo_cliente: '031', razon_social: 'CENTRO DIESEL DEL SURESTE S.A. DE C.V.' },
  { codigo_cliente: '032', razon_social: 'COMISION ESTATAL DEL AGUA Y GESTION DE CUENCAS' },
  { codigo_cliente: '033', razon_social: 'CFE TRANSMISIÓN' },
  { codigo_cliente: '034', razon_social: 'SIDRE' },
  { codigo_cliente: '035', razon_social: 'GRUPO DIJFA' },
  { codigo_cliente: '036', razon_social: 'LC LOGISTICS GPS' },
  { codigo_cliente: '037', razon_social: 'PIBSA' },
  { codigo_cliente: '038', razon_social: 'PEMEX LOGISTICA' },
  { codigo_cliente: '039', razon_social: 'OBRAS CIVILES YMARITIMAS' },
  { codigo_cliente: '040', razon_social: 'RYA' },
  { codigo_cliente: '041', razon_social: 'LUIS ANGEL' },
  { codigo_cliente: '042', razon_social: 'ESC. PRIM. FED. MÁRTIRES DE LA NACION' },
  { codigo_cliente: '043', razon_social: 'MUEBLES RIO DE JANEIRO' },
  { codigo_cliente: '044', razon_social: 'COFIRATRAN' },
  { codigo_cliente: '045', razon_social: 'TPP' },
  { codigo_cliente: '046', razon_social: 'SSA' },
  { codigo_cliente: '047', razon_social: 'IPG' },
  { codigo_cliente: '048', razon_social: 'PEDRO TAFOLLA' },
  { codigo_cliente: '049', razon_social: 'INDI' },
  { codigo_cliente: '050', razon_social: 'WALLMART' },
];

async function main() {
  const tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    console.error('❌ Falta TENANT_ID. Uso: TENANT_ID=<uuid> npx ts-node prisma/seed-clientes-centro-costos.ts');
    process.exit(1);
  }

  console.log(`🌱 Seed idempotente de clientes de Centro de Costos — tenant ${tenantId}`);

  for (const c of CLIENTES) {
    await prisma.cliente.upsert({
      where: { tenant_id_codigo_cliente: { tenant_id: tenantId, codigo_cliente: c.codigo_cliente } },
      update: { razon_social: c.razon_social },
      create: {
        tenant_id: tenantId,
        codigo_cliente: c.codigo_cliente,
        razon_social: c.razon_social,
        // RFC placeholder — corregir manualmente antes de usar en facturación real.
        rfc_tax_id: `PEND${c.codigo_cliente}`,
        estatus: 'ACTIVO',
      },
    });
    console.log(`  ✅ ${c.codigo_cliente} — ${c.razon_social}`);
  }

  console.log(`\n✅ ${CLIENTES.length} clientes sembrados/actualizados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

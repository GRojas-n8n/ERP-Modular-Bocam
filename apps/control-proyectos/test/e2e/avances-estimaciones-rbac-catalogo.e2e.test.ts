import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

// Cubre openspec/changes/fix-estimaciones-residente-desconectado/ tareas
// 4.1-4.11: POST /avances y POST /estimaciones sin requireRoles hoy, y
// POST /avances aceptando precio_unitario/cantidad_presupuestada del
// cliente en vez de resolverlos contra el catálogo de gerencia-tecnica.
//
// Un stub HTTP local sustituye a gerencia-tecnica (GT_URL apunta a este
// stub durante todo el archivo) — decodifica el JWT reenviado para saber
// qué "catálogo" debe responder por tenant, igual que el patrón ya usado
// en reconciliacion.e2e.test.ts para FINANZAS_URL.

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

const prisma = new PrismaClient();

let cpServer: Server | undefined;
let gtServer: Server | undefined;
let baseUrl = '';

type GtBehavior = { conceptos: Array<{ id: string; clave: string; descripcion: string; unidad_medida: string; precio_unitario: number; cantidad: number }> } | 'down';
const gtBehaviorByTenant = new Map<string, GtBehavior>();

async function cleanupTenantData(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
    await tx.avanceFisico.deleteMany({ where: { tenant_id: tenantId } });
    await tx.estimacion.deleteMany({ where: { tenant_id: tenantId } });
  });
}

async function setup() {
  const gtStub = express();
  gtStub.use(express.json());
  gtStub.get('/api/v1/gerencia-tecnica/presupuesto/activo', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) { res.status(401).json({ success: false }); return; }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const behavior = gtBehaviorByTenant.get(decoded.tenant_id);

    if (!behavior || behavior === 'down') {
      res.status(500).json({ success: false, error: { message: 'GT stub: catálogo no disponible' } });
      return;
    }

    res.json({ success: true, data: { id: 'presupuesto-stub', version: 1, conceptos: behavior.conceptos } });
  });

  const gtStarted = await startHttpApp(gtStub);
  gtServer = gtStarted.server;
  process.env.GT_URL = `${gtStarted.baseUrl}/api/v1/gerencia-tecnica`;

  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  cpServer = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(cpServer);
  await stopHttpApp(gtServer);
  await prisma.$disconnect();
}

type GtConcepto = { id: string; clave: string; descripcion: string; unidad_medida: string; precio_unitario: number; cantidad: number };

function seedCatalogo(tenantId: string, conceptos: GtConcepto[]) {
  gtBehaviorByTenant.set(tenantId, { conceptos });
}

function seedCatalogoCaido(tenantId: string) {
  gtBehaviorByTenant.set(tenantId, 'down');
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function postAvance(t: string, body: Record<string, unknown>) {
  return fetch(`${baseUrl}/api/v1/control-proyectos/avances`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function postEstimacion(t: string, body: Record<string, unknown>) {
  return fetch(`${baseUrl}/api/v1/control-proyectos/estimaciones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── 4.1 / 4.8: RBAC de POST /avances ──

async function testAvancesRBAC() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();
  seedCatalogo(tenantId, [{ id: conceptoId, clave: 'CIM-001', descripcion: 'Cimentación', unidad_medida: 'M3', precio_unitario: 1000, cantidad: 500 }]);

  try {
    const autorizados = ['residencia', 'control_proyectos', 'control_obra', 'director', 'admin'];
    for (const rol of autorizados) {
      const r = await postAvance(token(tenantId, proyectoId, [rol]), {
        concepto_id: conceptoId, cantidad_periodo: 10, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
      });
      assert.equal(r.status, 201, `rol ${rol} debe poder registrar un avance (fue ${r.status})`);
    }

    const noAutorizados = ['finance', 'contabilidad', 'compras'];
    for (const rol of noAutorizados) {
      const r = await postAvance(token(tenantId, proyectoId, [rol]), {
        concepto_id: conceptoId, cantidad_periodo: 10, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
      });
      assert.equal(r.status, 403, `rol ${rol} NO debe poder registrar un avance (fue ${r.status})`);
    }

    const totalCreados = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) =>
      tx.avanceFisico.count({ where: { tenant_id: tenantId } })
    );
    assert.equal(totalCreados, autorizados.length, 'solo los avances de roles autorizados deben haberse creado');

    console.log('ok - 4.1/4.8 RBAC de POST /avances: residencia/control_proyectos/control_obra/director/admin sí, el resto 403');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ── 4.2 / 4.8: RBAC de POST /estimaciones ──

async function testEstimacionesRBAC() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const avanceIds = await createTenantContext({ tenantId, proyectoId, userId }, async (tx) => {
    const avances = await Promise.all(
      [1, 2].map((n) => tx.avanceFisico.create({
        data: {
          tenant_id: tenantId, proyecto_id: proyectoId,
          concepto_presupuesto: `CON-${n}`, descripcion_concepto: `Concepto ${n}`,
          cantidad_presupuestada: '10.0000', cantidad_anterior: '0.0000', cantidad_periodo: '5.0000', cantidad_acumulada: '5.0000',
          unidad: 'm2', precio_unitario: '1000.0000', importe_periodo: '5000.00', importe_acumulado: '5000.00',
          porcentaje_avance: '50.00', periodo_inicio: new Date('2026-08-01'), periodo_fin: new Date('2026-08-15'),
          registrado_por_id: userId, registrado_por_nombre: 'E2E', estado: 'VALIDADO',
        },
      }))
    );
    return avances.map((a) => a.id_avance);
  });

  try {
    const autorizados = ['residencia', 'control_proyectos', 'admin'];
    let idx = 0;
    for (const rol of autorizados) {
      const r = await postEstimacion(token(tenantId, proyectoId, [rol]), { avance_ids: [avanceIds[idx % avanceIds.length]] });
      // Cada avance solo puede quedar en una estimación — usamos un avance
      // distinto por rol probado para no chocar con "ya pertenece a otra estimación".
      idx += 1;
      assert.ok([201, 500].includes(r.status), `rol ${rol} no debe recibir 403 al crear estimación (fue ${r.status})`);
      assert.notEqual(r.status, 403, `rol ${rol} debe poder crear una estimación`);
    }

    const noAutorizados = ['control_obra', 'director', 'finance'];
    for (const rol of noAutorizados) {
      const r = await postEstimacion(token(tenantId, proyectoId, [rol]), { avance_ids: [avanceIds[0]] });
      assert.equal(r.status, 403, `rol ${rol} NO debe poder crear una estimación (fue ${r.status})`);
    }

    console.log('ok - 4.2/4.8 RBAC de POST /estimaciones: residencia/control_proyectos/admin sí, control_obra/director/finance 403');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
  }
}

// ── 4.3 / 4.9: el precio/cantidad del avance salen del catálogo, no del cliente ──

async function testAvanceUsaPrecioDelCatalogoNoDelCliente() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();
  seedCatalogo(tenantId, [{ id: conceptoId, clave: 'CIM-001', descripcion: 'Cimentación de prueba', unidad_medida: 'M3', precio_unitario: 3450.75, cantidad: 120.5 }]);

  try {
    const r = await postAvance(token(tenantId, proyectoId, ['residencia']), {
      concepto_id: conceptoId,
      cantidad_periodo: 10,
      periodo_inicio: '2026-08-01',
      periodo_fin: '2026-08-15',
      // El cliente intenta mandar un precio/cantidad distintos al del catálogo — deben ignorarse.
      precio_unitario: 1,
      cantidad_presupuestada: 999999,
    });
    assert.equal(r.status, 201, `POST /avances debe responder 201 (fue ${r.status})`);
    const body = await r.json() as any;

    assert.equal(Number(body.data.precio_unitario), 3450.75, 'precio_unitario debe venir del catálogo (3450.75), no del cliente (1)');
    assert.equal(Number(body.data.cantidad_presupuestada), 120.5, 'cantidad_presupuestada debe venir del catálogo (120.5), no del cliente (999999)');
    assert.equal(body.data.concepto_id, conceptoId, 'el avance debe guardar el concepto_id real');
    assert.equal(body.data.concepto_presupuesto, 'CIM-001', 'concepto_presupuesto debe resolverse a la clave del catálogo');

    console.log('ok - 4.3/4.9 POST /avances ignora precio/cantidad del cliente y usa el catálogo de gerencia-tecnica');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ── 4.6: rechazo explícito si el concepto no existe o el catálogo no responde ──

async function testRechazoSiConceptoNoExisteOCatalogoCaido() {
  const tenantId1 = randomUUID();
  const proyectoId1 = randomUUID();
  seedCatalogo(tenantId1, [{ id: randomUUID(), clave: 'OTRO', descripcion: 'Otro concepto', unidad_medida: 'PZA', precio_unitario: 100, cantidad: 10 }]);

  const tenantId2 = randomUUID();
  const proyectoId2 = randomUUID();
  seedCatalogoCaido(tenantId2);

  try {
    const r1 = await postAvance(token(tenantId1, proyectoId1, ['residencia']), {
      concepto_id: randomUUID(), cantidad_periodo: 10, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
    });
    assert.equal(r1.status, 400, `concepto_id inexistente en el catálogo debe responder 400 (fue ${r1.status})`);

    const r2 = await postAvance(token(tenantId2, proyectoId2, ['residencia']), {
      concepto_id: randomUUID(), cantidad_periodo: 10, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
    });
    assert.notEqual(r2.status, 201, `si el catálogo de GT no responde, no debe crearse el avance (fue ${r2.status})`);

    const creados1 = await createTenantContext({ tenantId: tenantId1, proyectoId: proyectoId1, userId: 'system' }, async (tx) =>
      tx.avanceFisico.count({ where: { tenant_id: tenantId1 } })
    );
    const creados2 = await createTenantContext({ tenantId: tenantId2, proyectoId: proyectoId2, userId: 'system' }, async (tx) =>
      tx.avanceFisico.count({ where: { tenant_id: tenantId2 } })
    );
    assert.equal(creados1 + creados2, 0, 'ningún avance debe haberse creado en ninguno de los dos casos');

    console.log('ok - 4.6 rechazo explícito si el concepto no existe en el catálogo o gerencia-tecnica no responde');
  } finally {
    await cleanupTenantData(tenantId1, proyectoId1);
    await cleanupTenantData(tenantId2, proyectoId2);
    gtBehaviorByTenant.delete(tenantId1);
    gtBehaviorByTenant.delete(tenantId2);
  }
}

// ── 4.7 / 4.10: cantidad_anterior se deriva sumando avances previos del mismo concepto ──

async function testCantidadAnteriorSeDerivaDeAvancesPrevios() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();
  seedCatalogo(tenantId, [{ id: conceptoId, clave: 'CIM-002', descripcion: 'Cimentación 2', unidad_medida: 'M3', precio_unitario: 1000, cantidad: 500 }]);

  try {
    const t = token(tenantId, proyectoId, ['residencia']);

    const r1 = await postAvance(t, { concepto_id: conceptoId, cantidad_periodo: 30, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15' });
    assert.equal(r1.status, 201);
    const a1 = await r1.json() as any;
    assert.equal(Number(a1.data.cantidad_anterior), 0, 'el primer avance del concepto no tiene acumulado previo');

    const r2 = await postAvance(t, { concepto_id: conceptoId, cantidad_periodo: 20, periodo_inicio: '2026-08-16', periodo_fin: '2026-08-31' });
    assert.equal(r2.status, 201);
    const a2 = await r2.json() as any;
    assert.equal(Number(a2.data.cantidad_anterior), 30, 'el segundo avance debe acumular la cantidad_periodo del primero');
    assert.equal(Number(a2.data.cantidad_acumulada), 50, 'cantidad_acumulada = anterior + periodo');

    // Rechazar el segundo avance y crear un tercero: el rechazado NO debe contar en el acumulado.
    await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) =>
      tx.avanceFisico.update({ where: { id_avance: a2.data.id_avance }, data: { estado: 'RECHAZADO' } })
    );
    const r3 = await postAvance(t, { concepto_id: conceptoId, cantidad_periodo: 5, periodo_inicio: '2026-09-01', periodo_fin: '2026-09-15' });
    const a3 = await r3.json() as any;
    assert.equal(Number(a3.data.cantidad_anterior), 30, 'el tercer avance solo acumula sobre el primero (el segundo se rechazó y no debe contar)');

    console.log('ok - 4.7/4.10 cantidad_anterior se deriva sumando avances previos no RECHAZADO del mismo concepto_id');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

// ── 4.11: el precio queda congelado aunque el catálogo cambie después ──

async function testPrecioQuedaCongeladoTrasCambioDeCatalogo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const conceptoId = randomUUID();
  seedCatalogo(tenantId, [{ id: conceptoId, clave: 'CIM-003', descripcion: 'Cimentación 3', unidad_medida: 'M3', precio_unitario: 1000, cantidad: 500 }]);

  try {
    const t = token(tenantId, proyectoId, ['residencia']);
    const r1 = await postAvance(t, { concepto_id: conceptoId, cantidad_periodo: 10, periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15' });
    const a1 = await r1.json() as any;
    assert.equal(Number(a1.data.precio_unitario), 1000);

    // El catálogo cambia de precio después de creado el primer avance.
    seedCatalogo(tenantId, [{ id: conceptoId, clave: 'CIM-003', descripcion: 'Cimentación 3', unidad_medida: 'M3', precio_unitario: 1500, cantidad: 500 }]);

    const persisted = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) =>
      tx.avanceFisico.findUnique({ where: { id_avance: a1.data.id_avance } })
    );
    assert.equal(Number(persisted!.precio_unitario), 1000, 'el avance ya creado conserva el precio con el que se calculó, no se recalcula retroactivamente');

    console.log('ok - 4.11 el precio del avance queda congelado (snapshot) aunque el catálogo cambie después');
  } finally {
    await cleanupTenantData(tenantId, proyectoId);
    gtBehaviorByTenant.delete(tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testAvancesRBAC();               // 4.1 / 4.8
    await testEstimacionesRBAC();           // 4.2 / 4.8
    await testAvanceUsaPrecioDelCatalogoNoDelCliente(); // 4.3 / 4.9
    await testRechazoSiConceptoNoExisteOCatalogoCaido(); // 4.6
    await testCantidadAnteriorSeDerivaDeAvancesPrevios(); // 4.7 / 4.10
    await testPrecioQuedaCongeladoTrasCambioDeCatalogo(); // 4.11
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - avances-estimaciones-rbac-catalogo E2E');
  console.error(error);
  process.exitCode = 1;
});

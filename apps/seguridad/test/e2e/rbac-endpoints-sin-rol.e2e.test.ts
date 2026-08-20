import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

// ─────────────────────────────────────────────────────────────────────────────
// Cierre por rol del servicio de Seguridad (ver
// openspec/changes/rbac-seguridad-endpoints-sin-rol)
//
// 19 de las 20 rutas de apps/seguridad/src/main.ts no exigian ningun rol: solo
// requireProjectAccess(). Cualquier sesion JWT valida con acceso al proyecto
// podia reportar/cerrar incidentes, autorizar permisos de trabajo de alto
// riesgo, programar capacitaciones y gestionar EPP. La unica protegida era
// GET /resumen-dashboard.
//
// El rechazo por rol ocurre en el middleware requireRoles(...), antes de tocar
// la base de datos, asi que estos casos no necesitan Postgres.
// ─────────────────────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let seguridadServer: Server | undefined;
let seguridadBaseUrl = '';

const TENANT = 'tenant-rbac-seguridad';
const PROYECTO = 'proyecto-rbac-seguridad';

async function setup() {
  const seguridadModule = await import('../../src/main');
  const started = await startHttpApp(seguridadModule.app);
  seguridadServer = started.server;
  seguridadBaseUrl = started.baseUrl;
}

function tokenConRoles(userId: string, roles: string[]): string {
  return signTenantToken({
    userId,
    tenantId: TENANT,
    proyectoId: PROYECTO,
    roles,
    projects: [PROYECTO],
  });
}

async function llamar(method: string, path: string, roles: string[], body?: unknown) {
  const token = tokenConRoles(`user-${roles.join('-')}`, roles);
  const puedeLlevarBody = method !== 'GET' && method !== 'HEAD';
  return fetch(`${seguridadBaseUrl}/api/v1/seguridad/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: puedeLlevarBody && body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Las 19 rutas de negocio del modulo. GET /resumen-dashboard ya estaba
// protegida (superintendent, admin) y no cambia — no esta en esta lista.
const RUTAS: Array<[string, string]> = [
  ['GET',   'incidentes'],
  ['POST',  'incidentes'],
  ['PATCH', 'incidentes/inc-1/investigar'],
  ['PATCH', 'incidentes/inc-1/cerrar'],
  ['GET',   'inspecciones'],
  ['POST',  'inspecciones'],
  ['GET',   'permisos'],
  ['POST',  'permisos'],
  ['PATCH', 'permisos/per-1/autorizar'],
  ['PATCH', 'permisos/per-1/cerrar'],
  ['GET',   'capacitaciones'],
  ['GET',   'capacitaciones/cap-1'],
  ['POST',  'capacitaciones'],
  ['PATCH', 'capacitaciones/cap-1/completar'],
  ['GET',   'dashboard'],
  ['GET',   'epp'],
  ['POST',  'epp'],
  ['PATCH', 'epp/epp-1/estado'],
];

async function testRolNoAutorizadoBloqueaLas19Rutas() {
  for (const [method, path] of RUTAS) {
    const response = await llamar(method, path, ['warehouse'], {});
    assert.equal(response.status, 403, `${method} ${path} no bloqueo al rol warehouse`);
    const payload = await response.json();
    assert.equal(payload.error.code, 'AUTH_FORBIDDEN', `${method} ${path} no devolvio AUTH_FORBIDDEN`);
  }
  console.log(`ok - seguridad bloquea las 18 rutas a un rol sin acceso (${RUTAS.length}/${RUTAS.length})`);
}

// No-regresion: seguridad_hse, superintendent y admin deben pasar el gate de
// rol. Se tolera cualquier respuesta distinta de 403 — sin Postgres, el
// handler de negocio puede fallar mas adelante (400/404/500), lo que importa
// es que el rol no sea el motivo del rechazo.
async function testRolesAutorizadosNoSonBloqueados() {
  for (const rol of ['seguridad_hse', 'superintendent', 'admin']) {
    for (const [method, path] of RUTAS) {
      const response = await llamar(method, path, [rol], {});
      assert.notEqual(
        response.status,
        403,
        `${method} ${path} rechazo al rol ${rol}: rompe el acceso legitimo al modulo`
      );
    }
  }
  console.log('ok - seguridad no bloquea a seguridad_hse/superintendent/admin en ninguna de las 18 rutas');
}

// El chequeo que existia en PATCH /permisos/:id/autorizar era manual
// (roles.includes('hse_manager')), un rol huerfano fuera del catalogo
// canonico (packages/roles). Confirma que el rol correcto del catalogo
// (seguridad_hse) ahora pasa el gate via requireRoles(...).
async function testAutorizarPermisoUsaRolCanonico() {
  const bloqueado = await llamar('PATCH', 'permisos/per-1/autorizar', ['warehouse'], {});
  assert.equal(bloqueado.status, 403);
  const payloadBloqueado = await bloqueado.json();
  assert.equal(payloadBloqueado.error.code, 'AUTH_FORBIDDEN');

  const permitido = await llamar('PATCH', 'permisos/per-1/autorizar', ['seguridad_hse'], {});
  assert.notEqual(permitido.status, 403, 'seguridad_hse debe poder autorizar permisos de trabajo');

  console.log('ok - autorizar permiso usa el rol canonico seguridad_hse via requireRoles');
}

async function testResumenDashboardSigueProtegido() {
  const bloqueado = await llamar('GET', 'resumen-dashboard', ['seguridad_hse'], undefined);
  assert.equal(bloqueado.status, 403, 'resumen-dashboard no debe abrirse a seguridad_hse (fuera de alcance, no cambia)');

  const permitido = await llamar('GET', 'resumen-dashboard', ['superintendent'], undefined);
  assert.notEqual(permitido.status, 403);

  console.log('ok - resumen-dashboard sigue exigiendo superintendent/admin, sin cambios');
}

async function main() {
  await setup();

  try {
    await testRolNoAutorizadoBloqueaLas19Rutas();
    await testRolesAutorizadosNoSonBloqueados();
    await testAutorizarPermisoUsaRolCanonico();
    await testResumenDashboardSigueProtegido();
  } finally {
    await stopHttpApp(seguridadServer);
  }
}

void main().catch((error) => {
  console.error('not ok - seguridad rbac-endpoints-sin-rol E2E');
  console.error(error);
  process.exitCode = 1;
});

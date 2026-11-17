/**
 * Tests de integración de la herramienta de purga de proyectos.
 * Spec: openspec/changes/purga-proyectos-demo-produccion/
 *
 * Requiere Docker y el contenedor local `bocam-postgres` (docker-compose.yml de
 * desarrollo). Crea una base DESECHABLE `purga_test` clonada (TEMPLATE) del esquema
 * real de `bocam_erp` y la elimina al terminar. NUNCA toca `bocam_erp` ni producción.
 * Si Docker/Postgres no están disponibles, los tests se omiten.
 *
 * Uso: node --test scripts/ops/purga-proyecto/purga-proyecto.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CONTENEDOR = process.env.PURGA_TEST_CONTENEDOR || 'bocam-postgres';
const DB_TEMPLATE = process.env.PURGA_TEST_TEMPLATE || 'bocam_erp';
const DB = 'purga_test';
const SQL_FILE = path.join(__dirname, 'purga-proyecto.sql');
const SH_FILE = path.join(__dirname, 'purga-proyecto.sh');
const SH = process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\sh.exe' : 'sh';

// UUIDs fijos para poder razonar sobre los datos.
const T1 = '11111111-1111-4111-8111-111111111111';
const T2 = '22222222-2222-4222-8222-222222222222';
const PA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'; // proyecto A (T1) — se purga
const PB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'; // proyecto B (T1) — debe quedar intacto
const PC = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'; // proyecto C (T2) — debe quedar intacto

function docker(args, input) {
  return spawnSync('docker', args, { input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function psql(sql, { user = 'postgres', db = DB, vars = {}, file = false } = {}) {
  const args = ['exec', '-i', CONTENEDOR, 'psql', '-X', '-q', '-A', '-t', '-F', '|', '-U', user, '-d', db, '-v', 'ON_ERROR_STOP=1'];
  for (const [k, v] of Object.entries(vars)) args.push('-v', `${k}=${v}`);
  args.push('-f', '-');
  const r = docker(args, file ? fs.readFileSync(sql, 'utf8') : sql);
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function q(sql) {
  const r = psql(sql);
  assert.equal(r.code, 0, `SQL falló: ${r.err}\n${sql}`);
  return r.out;
}

function purga({ tenant = T1, codigos, confirmar = '', ejecutar = 0, esquemas = 'auth,sint', user = 'postgres' } = {}) {
  return psql(SQL_FILE, {
    file: true, user,
    vars: { tenant, codigos, confirmar, ejecutar: String(ejecutar), esquemas },
  });
}

function dockerDisponible() {
  const r = docker(['exec', CONTENEDOR, 'psql', '-U', 'postgres', '-Atc', 'select 1', '-d', DB_TEMPLATE]);
  return r.status === 0;
}

const DISPONIBLE = dockerDisponible();
const opts = { skip: DISPONIBLE ? false : 'Docker o el contenedor bocam-postgres no están disponibles' };

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ESQUEMA_SINTETICO = `
DROP SCHEMA IF EXISTS sint CASCADE; CREATE SCHEMA sint;
-- padre con proyecto_id; hijos con cada tipo de FK; nieto RESTRICT colgando de un hijo CASCADE
CREATE TABLE sint.padre (id uuid PRIMARY KEY, proyecto_id uuid NOT NULL, tenant_id uuid NOT NULL);
CREATE TABLE sint.hijo_restrict (id uuid PRIMARY KEY, padre_id uuid NOT NULL REFERENCES sint.padre(id) ON DELETE RESTRICT, tenant_id uuid NOT NULL);
CREATE TABLE sint.nieto_restrict (id uuid PRIMARY KEY, hijo_id uuid NOT NULL REFERENCES sint.hijo_restrict(id) ON DELETE RESTRICT);
CREATE TABLE sint.hijo_cascade (id uuid PRIMARY KEY, padre_id uuid NOT NULL REFERENCES sint.padre(id) ON DELETE CASCADE);
CREATE TABLE sint.nieto_de_cascade (id uuid PRIMARY KEY, hijo_id uuid NOT NULL REFERENCES sint.hijo_cascade(id) ON DELETE RESTRICT);
CREATE TABLE sint.hijo_setnull (id uuid PRIMARY KEY, padre_id uuid REFERENCES sint.padre(id) ON DELETE SET NULL);
CREATE TABLE sint.archivos (id uuid PRIMARY KEY, proyecto_id uuid NOT NULL, tenant_id uuid NOT NULL, ruta_archivo text NOT NULL);
`;

function u(n) { return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`; }

function sembrar() {
  q(ESQUEMA_SINTETICO);
  q(`
    DELETE FROM auth.proyectos WHERE tenant_id IN ('${T1}', '${T2}');
    DELETE FROM auth.tenants WHERE id_tenant IN ('${T1}', '${T2}');
    INSERT INTO auth.tenants (id_tenant, nombre) VALUES ('${T1}', 'Tenant 1 purga'), ('${T2}', 'Tenant 2 purga');
    INSERT INTO auth.proyectos (id_proyecto, tenant_id, codigo_centro_costos, nombre_oficial) VALUES
      ('${PA}', '${T1}', 'CIB2026001001', 'Proyecto A (se purga)'),
      ('${PB}', '${T1}', 'CIB2026001002', 'Proyecto B (intacto)'),
      ('${PC}', '${T2}', 'CIB2026001001', 'Proyecto C otro tenant (intacto)');
  `);
  // Para cada proyecto: 2 padres, con hijos de todos los tipos, nietos y archivos.
  const filas = [];
  const proyectos = [[PA, T1, 1], [PB, T1, 2], [PC, T2, 3]];
  for (const [proy, ten, k] of proyectos) {
    for (let i = 1; i <= 2; i++) {
      const base = k * 1000 + i * 100;
      filas.push(`INSERT INTO sint.padre VALUES ('${u(base)}', '${proy}', '${ten}');`);
      filas.push(`INSERT INTO sint.hijo_restrict VALUES ('${u(base + 1)}', '${u(base)}', '${ten}');`);
      filas.push(`INSERT INTO sint.nieto_restrict VALUES ('${u(base + 2)}', '${u(base + 1)}');`);
      filas.push(`INSERT INTO sint.hijo_cascade VALUES ('${u(base + 3)}', '${u(base)}');`);
      filas.push(`INSERT INTO sint.nieto_de_cascade VALUES ('${u(base + 4)}', '${u(base + 3)}');`);
      filas.push(`INSERT INTO sint.hijo_setnull VALUES ('${u(base + 5)}', '${u(base)}');`);
      filas.push(`INSERT INTO sint.archivos VALUES ('${u(base + 6)}', '${proy}', '${ten}', '/data/${k}/${i}/doc.pdf');`);
    }
  }
  q(filas.join('\n'));
}

function foto() {
  // Conteos por tabla sintética + proyectos: detecta cualquier cambio inesperado.
  return q(`
    SELECT 'padre|'||proyecto_id||'|'||count(*) FROM sint.padre GROUP BY proyecto_id
    UNION ALL SELECT 'archivos|'||proyecto_id||'|'||count(*) FROM sint.archivos GROUP BY proyecto_id
    UNION ALL SELECT 'hijo_restrict|'||count(*) FROM sint.hijo_restrict
    UNION ALL SELECT 'nieto_restrict|'||count(*) FROM sint.nieto_restrict
    UNION ALL SELECT 'hijo_cascade|'||count(*) FROM sint.hijo_cascade
    UNION ALL SELECT 'nieto_de_cascade|'||count(*) FROM sint.nieto_de_cascade
    UNION ALL SELECT 'hijo_setnull|'||count(*)||'|nulos='||count(*) FILTER (WHERE padre_id IS NULL) FROM sint.hijo_setnull
    UNION ALL SELECT 'proyectos|'||count(*) FROM auth.proyectos WHERE id_proyecto IN ('${PA}','${PB}','${PC}')
    ORDER BY 1;
  `);
}

test.before(() => {
  if (!DISPONIBLE) return;
  docker(['exec', CONTENEDOR, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `DROP DATABASE IF EXISTS ${DB}`]);
  const r = docker(['exec', CONTENEDOR, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `CREATE DATABASE ${DB} TEMPLATE ${DB_TEMPLATE}`]);
  assert.equal(r.status, 0, `no se pudo clonar ${DB_TEMPLATE} (¿hay conexiones abiertas a esa base?): ${r.stderr}`);
});

test.after(() => {
  if (!DISPONIBLE) return;
  docker(['exec', CONTENEDOR, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `DROP DATABASE IF EXISTS ${DB}`]);
});

test.beforeEach(() => { if (DISPONIBLE) sembrar(); });

// ─── Casos ───────────────────────────────────────────────────────────────────

test('purgar A elimina todas sus filas (RESTRICT, CASCADE, nieto tras CASCADE) y deja B y el otro tenant idénticos', opts, () => {
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1 });
  assert.equal(r.code, 0, r.err);

  const filasA = q(`SELECT (SELECT count(*) FROM sint.padre WHERE proyecto_id='${PA}') + (SELECT count(*) FROM sint.archivos WHERE proyecto_id='${PA}')`);
  assert.equal(filasA, '0', 'no debe quedar ninguna fila de A con proyecto_id');
  assert.equal(q(`SELECT count(*) FROM auth.proyectos WHERE id_proyecto='${PA}'`), '0', 'el proyecto A ya no existe en auth.proyectos');
  assert.equal(q(`SELECT count(*) FROM sint.hijo_restrict WHERE padre_id IN ('${u(1100)}','${u(1200)}')`), '0');
  assert.equal(q(`SELECT count(*) FROM sint.nieto_de_cascade WHERE id IN ('${u(1104)}','${u(1204)}')`), '0', 'el nieto RESTRICT colgado de un hijo CASCADE también se elimina');

  const despues = foto();
  // Lo único que cambia son las filas de A: se comparan las filas de B y C por prefijo de proyecto.
  const lineasB = (s) => s.split('\n').filter((l) => l.includes(PB) || l.includes(PC));
  assert.deepEqual(lineasB(despues), lineasB(antes), 'B y el otro tenant permanecen idénticos');
  assert.equal(q(`SELECT count(*) FROM sint.padre WHERE proyecto_id IN ('${PB}','${PC}')`), '4');
});

test('SET NULL: los hijos con FK SET NULL de otros proyectos no se borran, quedan con padre nulo', opts, () => {
  // Un hijo_setnull de B apunta a un padre de A: al purgar A queda huérfano lógico (NULL), no se elimina.
  q(`INSERT INTO sint.hijo_setnull VALUES ('${u(9001)}', '${u(1100)}');`);
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1 });
  assert.equal(r.code, 0, r.err);
  assert.equal(q(`SELECT count(*) FROM sint.hijo_setnull WHERE id='${u(9001)}' AND padre_id IS NULL`), '1');
});

test('el dry-run no cambia nada y reporta filas por tabla', opts, () => {
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', ejecutar: 0 });
  assert.equal(r.code, 0, r.err);
  assert.equal(foto(), antes, 'la base queda exactamente igual');
  assert.match(r.out, /^MODO\|DRY-RUN$/m);
  assert.match(r.out, /^FILAS\|sint\.padre\|2$/m, 'reporta las filas que se eliminarían de sint.padre');
  assert.match(r.out, /^FILAS\|sint\.nieto_de_cascade\|2$/m, 'incluye las eliminadas por CASCADE');
  assert.match(r.out, /^PROYECTO\|CIB2026001001\|Proyecto A \(se purga\)\|/m);
});

test('el manifiesto lista las rutas de archivos de las filas eliminadas, sin borrar archivos', opts, () => {
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1 });
  assert.equal(r.code, 0, r.err);
  const archivos = r.out.split('\n').filter((l) => l.startsWith('ARCHIVO|')).map((l) => l.split('|')[1]).sort();
  assert.deepEqual(archivos, ['/data/1/1/doc.pdf', '/data/1/2/doc.pdf']);
});

test('rechaza la ejecución cuando la conexión no es superusuario (RLS podría ocultar filas)', opts, () => {
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1, user: 'local_app' });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /PURGA_SIN_SUPERUSUARIO/);
  assert.equal(foto(), antes);
});

test('rechaza --confirmar que no coincide exactamente con los códigos (faltante o sobrante)', opts, () => {
  const antes = foto();
  const a = purga({ codigos: 'CIB2026001001,CIB2026001002', confirmar: 'CIB2026001001', ejecutar: 1 });
  assert.notEqual(a.code, 0);
  assert.match(a.err, /PURGA_CONFIRMACION_NO_COINCIDE/);
  const b = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001,CIB2026001002', ejecutar: 1 });
  assert.notEqual(b.code, 0);
  assert.match(b.err, /PURGA_CONFIRMACION_NO_COINCIDE/);
  assert.equal(foto(), antes);
});

test('rechaza un código inexistente en el tenant (aunque exista en otro tenant)', opts, () => {
  const antes = foto();
  const r = purga({ tenant: T1, codigos: 'CIB2026001001,CIB2026009999', confirmar: 'CIB2026001001,CIB2026009999', ejecutar: 1 });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /PURGA_CODIGO_INEXISTENTE.*CIB2026009999/);
  assert.equal(foto(), antes);
});

test('rechaza más de 10 proyectos por corrida', opts, () => {
  const codigos = Array.from({ length: 11 }, (_, i) => `X${i}`).join(',');
  const r = purga({ codigos, confirmar: codigos, ejecutar: 1 });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /PURGA_DEMASIADOS_PROYECTOS/);
});

test('un fallo a mitad del borrado revierte todo (transacción única)', opts, () => {
  // El trigger dispara al borrar sint.padre, que se borra DESPUÉS de todos sus hijos:
  // cuando falla ya hubo borrados previos que el rollback debe deshacer.
  q(`
    CREATE FUNCTION sint.falla() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fallo simulado'; END $$;
    CREATE TRIGGER t_falla BEFORE DELETE ON sint.padre FOR EACH ROW EXECUTE FUNCTION sint.falla();
  `);
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1 });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /fallo simulado/);
  assert.equal(foto(), antes, 'los hijos ya borrados antes del fallo se restauran: nada queda a medias');
  assert.equal(q(`SELECT count(*) FROM auth.proyectos WHERE id_proyecto='${PA}'`), '1');
});

test('la verificación posterior detecta que la purga afectaría a OTRO proyecto y revierte', opts, () => {
  // Una fila de B con FK RESTRICT a un padre de A: para borrar el padre de A habría que borrar
  // datos de B. La purga debe abortar en la verificación y no borrar nada.
  q(`
    CREATE TABLE sint.dependiente (id uuid PRIMARY KEY, proyecto_id uuid NOT NULL, padre_id uuid NOT NULL REFERENCES sint.padre(id) ON DELETE RESTRICT);
    INSERT INTO sint.dependiente VALUES ('${u(9101)}', '${PB}', '${u(1100)}');
  `);
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1 });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /PURGA_VERIFICACION_FALLIDA/);
  assert.equal(foto(), antes, 'rollback completo');
  assert.equal(q(`SELECT count(*) FROM sint.dependiente WHERE proyecto_id='${PB}'`), '1', 'la fila de B sigue existiendo');
});

test('aborta ante una FK compuesta antes de borrar nada', opts, () => {
  q(`
    DROP SCHEMA IF EXISTS compuesta CASCADE; CREATE SCHEMA compuesta;
    CREATE TABLE compuesta.p (a int, b int, proyecto_id uuid NOT NULL, PRIMARY KEY (a, b));
    CREATE TABLE compuesta.h (id int PRIMARY KEY, a int, b int, FOREIGN KEY (a, b) REFERENCES compuesta.p (a, b) ON DELETE RESTRICT);
    INSERT INTO compuesta.p VALUES (1, 1, '${PA}');
  `);
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1, esquemas: 'auth,sint,compuesta' });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /PURGA_FK_COMPUESTA/);
  assert.equal(foto(), antes);
  q('DROP SCHEMA compuesta CASCADE');
});

test('aborta ante un ciclo de FKs antes de borrar nada', opts, () => {
  q(`
    DROP SCHEMA IF EXISTS ciclo CASCADE; CREATE SCHEMA ciclo;
    CREATE TABLE ciclo.a (id int PRIMARY KEY, proyecto_id uuid NOT NULL, b_id int);
    CREATE TABLE ciclo.b (id int PRIMARY KEY, a_id int REFERENCES ciclo.a(id) ON DELETE RESTRICT);
    ALTER TABLE ciclo.a ADD FOREIGN KEY (b_id) REFERENCES ciclo.b(id) ON DELETE RESTRICT;
  `);
  const antes = foto();
  const r = purga({ codigos: 'CIB2026001001', confirmar: 'CIB2026001001', ejecutar: 1, esquemas: 'auth,sint,ciclo' });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /PURGA_CICLO_FK/);
  assert.equal(foto(), antes);
  q('DROP SCHEMA ciclo CASCADE');
});

// ─── Wrapper (guardas de respaldo y confirmación) ─────────────────────────────

function wrapper(args, env = {}) {
  const psqlCmd = `docker exec -i ${CONTENEDOR} psql -U postgres -d ${DB}`;
  const r = spawnSync(SH, [SH_FILE, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PSQL_CMD: psqlCmd,
      PGRESTORE_LIST_CMD: `docker exec -i ${CONTENEDOR} pg_restore --list`,
      PURGA_ESQUEMAS: 'auth,sint',
      PURGA_SALIDA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'purga-salida-')),
      ...env,
    },
  });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' };
}

function respaldoValido() {
  // Un dump real (formato custom) de la base desechable, capturado como binario.
  const f = path.join(os.tmpdir(), `respaldo-purga-${Date.now()}.dump`);
  const r = spawnSync('docker', ['exec', CONTENEDOR, 'pg_dump', '-Fc', '-U', 'postgres', '-d', DB], { maxBuffer: 256 * 1024 * 1024 });
  assert.equal(r.status, 0, String(r.stderr));
  assert.ok(r.stdout.length > 1000, 'el dump de prueba no debe estar vacío');
  fs.writeFileSync(f, r.stdout);
  return f;
}

test('wrapper: sin --ejecutar corre solo dry-run y no exige respaldo', opts, () => {
  const r = wrapper(['--tenant', T1, '--codigos', 'CIB2026001001']);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /DRY-RUN/);
});

test('wrapper: --ejecutar sin --respaldo se rechaza y no borra nada', opts, () => {
  const antes = foto();
  const r = wrapper(['--tenant', T1, '--codigos', 'CIB2026001001', '--confirmar', 'CIB2026001001', '--ejecutar']);
  assert.notEqual(r.code, 0);
  assert.match(r.err + r.out, /respaldo/i);
  assert.equal(foto(), antes);
});

test('wrapper: respaldo con más de 24 h se rechaza', opts, () => {
  const f = respaldoValido();
  const hace2dias = new Date(Date.now() - 2 * 24 * 3600 * 1000);
  fs.utimesSync(f, hace2dias, hace2dias);
  const antes = foto();
  const r = wrapper(['--tenant', T1, '--codigos', 'CIB2026001001', '--confirmar', 'CIB2026001001', '--respaldo', f, '--ejecutar']);
  assert.notEqual(r.code, 0);
  assert.match(r.err + r.out, /24/);
  assert.equal(foto(), antes);
  fs.rmSync(f, { force: true });
});

test('wrapper: respaldo que no pasa pg_restore --list se rechaza', opts, () => {
  const f = path.join(os.tmpdir(), `respaldo-corrupto-${Date.now()}.dump`);
  fs.writeFileSync(f, 'esto no es un dump de postgres');
  const antes = foto();
  const r = wrapper(['--tenant', T1, '--codigos', 'CIB2026001001', '--confirmar', 'CIB2026001001', '--respaldo', f, '--ejecutar']);
  assert.notEqual(r.code, 0);
  assert.match(r.err, /pg_restore --list/, 'debe fallar por la verificación del respaldo, no por otra causa');
  assert.equal(foto(), antes);
  fs.rmSync(f, { force: true });
});

test('wrapper: con respaldo válido y confirmación correcta ejecuta, escribe manifiesto y bitácora', opts, () => {
  const f = respaldoValido();
  const salida = fs.mkdtempSync(path.join(os.tmpdir(), 'purga-salida-'));
  const r = wrapper(['--tenant', T1, '--codigos', 'CIB2026001001', '--confirmar', 'CIB2026001001', '--respaldo', f, '--ejecutar'], { PURGA_SALIDA_DIR: salida });
  assert.equal(r.code, 0, r.err + r.out);
  assert.equal(q(`SELECT count(*) FROM auth.proyectos WHERE id_proyecto='${PA}'`), '0');
  const archivos = fs.readdirSync(salida);
  assert.ok(archivos.some((a) => a.startsWith('purga-archivos-')), 'manifiesto de archivos generado');
  const bitacora = archivos.find((a) => a.endsWith('.md'));
  assert.ok(bitacora, 'bitácora generada');
  const md = fs.readFileSync(path.join(salida, bitacora), 'utf8');
  assert.match(md, /CIB2026001001/);
  assert.match(md, /SHA-256/);
  assert.doesNotMatch(md, /Proyecto A \(se purga\)/, 'la bitácora no incluye nombres de proyecto (datos de negocio)');
  fs.rmSync(f, { force: true });
});

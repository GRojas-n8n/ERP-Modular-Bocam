const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CONTAINER = process.env.PURGA_TEST_CONTENEDOR || 'bocam-postgres';
const DBS = ['purga_md_compras', 'purga_md_finanzas', 'purga_md_auth'];
const AUTH = 'purga_md_auth';
const SH = process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\sh.exe' : 'sh';
const SCRIPT = path.join(__dirname, 'purga-proyecto-multidb.sh');
const T1 = '11111111-1111-4111-8111-111111111111';
const T2 = '22222222-2222-4222-8222-222222222222';
const PA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PC = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function docker(args, options = {}) {
  return spawnSync('docker', args, { encoding: options.binary ? null : 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function sql(db, statement) {
  const r = docker(['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', db, '-v', 'ON_ERROR_STOP=1', '-Atc', statement]);
  assert.equal(r.status, 0, `${db}: ${r.stderr}`);
  return (r.stdout || '').trim();
}

function resetDatabases() {
  for (const db of DBS) {
    docker(['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `DROP DATABASE IF EXISTS ${db}`]);
    const r = docker(['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `CREATE DATABASE ${db}`]);
    assert.equal(r.status, 0, String(r.stderr));
  }

  sql(AUTH, `
    CREATE TABLE proyectos (
      id_proyecto uuid PRIMARY KEY,
      tenant_id uuid NOT NULL,
      codigo_centro_costos text NOT NULL,
      nombre_oficial text NOT NULL,
      estatus text NOT NULL DEFAULT 'ABIERTO'
    );
    CREATE TABLE user_project_access (
      id uuid PRIMARY KEY,
      tenant_id uuid NOT NULL,
      proyecto_id uuid NOT NULL REFERENCES proyectos(id_proyecto) ON DELETE CASCADE
    );
    INSERT INTO proyectos VALUES
      ('${PA}','${T1}','A-PRUEBA','Proyecto A','ABIERTO'),
      ('${PB}','${T1}','B-REAL','Proyecto B','EN EJECUCIÓN'),
      ('${PC}','${T2}','C-OTRO','Proyecto C','ABIERTO');
    INSERT INTO user_project_access VALUES
      ('00000000-0000-4000-8000-000000000001','${T1}','${PA}'),
      ('00000000-0000-4000-8000-000000000002','${T1}','${PB}'),
      ('00000000-0000-4000-8000-000000000003','${T2}','${PC}');
  `);

  sql('purga_md_compras', `
    CREATE TABLE ordenes (
      id uuid PRIMARY KEY,
      tenant_id uuid NOT NULL,
      proyecto_id uuid NOT NULL,
      ruta_archivo text
    );
    CREATE TABLE partidas (
      id uuid PRIMARY KEY,
      orden_id uuid NOT NULL REFERENCES ordenes(id) ON DELETE RESTRICT
    );
    INSERT INTO ordenes VALUES
      ('10000000-0000-4000-8000-000000000001','${T1}','${PA}','/data/a.pdf'),
      ('10000000-0000-4000-8000-000000000002','${T1}','${PB}','/data/b.pdf'),
      ('10000000-0000-4000-8000-000000000003','${T2}','${PC}','/data/c.pdf');
    INSERT INTO partidas VALUES
      ('11000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001'),
      ('11000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002'),
      ('11000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003');
  `);

  sql('purga_md_finanzas', `
    CREATE TABLE presupuestos (
      id uuid PRIMARY KEY,
      tenant_id uuid NOT NULL,
      proyecto_id uuid NOT NULL,
      monto numeric NOT NULL
    );
    INSERT INTO presupuestos VALUES
      ('20000000-0000-4000-8000-000000000001','${T1}','${PA}',10),
      ('20000000-0000-4000-8000-000000000002','${T1}','${PB}',20),
      ('20000000-0000-4000-8000-000000000003','${T2}','${PC}',30);
  `);
}

function runWrapper(args, extraEnv = {}) {
  return spawnSync(SH, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      CONTENEDOR_PG: CONTAINER,
      PURGA_BASES: DBS.join(' '),
      PURGA_BASE_AUTH: AUTH,
      PURGA_SALIDA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'purga-md-out-')),
      ...extraEnv,
    },
    maxBuffer: 64 * 1024 * 1024,
  });
}

function backupDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'purga-md-backup-'));
  for (const db of DBS) {
    const r = docker(['exec', CONTAINER, 'pg_dump', '-Fc', '-U', 'postgres', '-d', db], { binary: true });
    assert.equal(r.status, 0, String(r.stderr));
    fs.writeFileSync(path.join(dir, `${db}.dump`), r.stdout);
  }
  const globals = docker(['exec', CONTAINER, 'pg_dumpall', '--globals-only', '-U', 'postgres']);
  assert.equal(globals.status, 0, globals.stderr);
  fs.writeFileSync(path.join(dir, 'globals.sql'), globals.stdout);
  return dir;
}

const available = docker(['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-Atc', 'select 1']).status === 0;
const opts = { skip: available ? false : 'PostgreSQL local no disponible' };

test.beforeEach(() => { if (available) resetDatabases(); });
test.after(() => {
  if (!available) return;
  for (const db of DBS) docker(['exec', CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `DROP DATABASE IF EXISTS ${db}`]);
});

test('dry-run recorre todas las bases y no modifica datos', opts, () => {
  const r = runWrapper(['--tenant', T1, '--codigos', 'A-PRUEBA']);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /DRY-RUN multidatabase terminado/);
  assert.match(r.stdout, /purga_md_compras/);
  assert.equal(sql(AUTH, `select count(*) from proyectos where id_proyecto='${PA}'`), '1');
  assert.equal(sql('purga_md_compras', `select count(*) from ordenes where proyecto_id='${PA}'`), '1');
  assert.equal(sql('purga_md_finanzas', `select count(*) from presupuestos where proyecto_id='${PA}'`), '1');
});

test('ejecución real exige respaldo completo y elimina solo A en todas las bases', opts, () => {
  const backup = backupDir();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'purga-md-real-'));
  const r = runWrapper([
    '--tenant', T1,
    '--codigos', 'A-PRUEBA',
    '--confirmar', 'A-PRUEBA',
    '--respaldo-dir', backup,
    '--mantenimiento-confirmado',
    '--respaldo-fuera-vps-confirmado',
    '--ejecutar',
  ], { PURGA_SALIDA_DIR: out, PURGA_BITACORA_DIR: out });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(sql(AUTH, `select count(*) from proyectos where id_proyecto='${PA}'`), '0');
  assert.equal(sql(AUTH, `select count(*) from proyectos where id_proyecto in ('${PB}','${PC}')`), '2');
  assert.equal(sql('purga_md_compras', `select count(*) from ordenes where proyecto_id='${PA}'`), '0');
  assert.equal(sql('purga_md_compras', 'select count(*) from partidas'), '2');
  assert.equal(sql('purga_md_finanzas', `select count(*) from presupuestos where proyecto_id='${PA}'`), '0');
  assert.equal(sql('purga_md_finanzas', `select count(*) from presupuestos where proyecto_id in ('${PB}','${PC}')`), '2');
  assert.ok(fs.readdirSync(out).some((f) => f.endsWith('-purga-multidb.md')));
});

test('ejecución real rechaza un conjunto incompleto de respaldos', opts, () => {
  const backup = backupDir();
  fs.rmSync(path.join(backup, 'purga_md_finanzas.dump'));
  const r = runWrapper([
    '--tenant', T1,
    '--codigos', 'A-PRUEBA',
    '--confirmar', 'A-PRUEBA',
    '--respaldo-dir', backup,
    '--mantenimiento-confirmado',
    '--respaldo-fuera-vps-confirmado',
    '--ejecutar',
  ]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /Respaldo faltante/);
  assert.equal(sql(AUTH, `select count(*) from proyectos where id_proyecto='${PA}'`), '1');
});

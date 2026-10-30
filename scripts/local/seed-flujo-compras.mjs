#!/usr/bin/env node
// Seed reproducible del flujo de compras (GT → Residencia → Compras → GT → OC) para el
// entorno LOCAL. Ver openspec/changes/seed-local-flujo-compras-a-finanzas y LOCAL.md.
//
// - Todo se siembra por las APIs reales (vía nginx de app-shell), con el JWT del rol que
//   cada endpoint exige. Así se disparan los mismos eventos de RabbitMQ que en producción.
// - Solo dos pasos usan SQL directo como bocam_admin: limpiar el tenant de pruebas y
//   restaurar su admin local (no hay API para crear el primer admin).
// - NO escribe nada en Finanzas: lo que haya allí llega solo por el flujo.
//
// Uso (lo llama scripts/local/iretum-local.ps1 seed-compras):
//   node scripts/local/seed-flujo-compras.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const API = 'http://localhost:8080';
const MAILPIT = 'http://localhost:8025';
const TENANT = '8e07a7ac-8157-4e5d-8499-e985a9fcdbfc'; // tenant por defecto del frontend
const COMPOSE = ['compose', '-f', 'docker-compose.local.yml', '--env-file', '.env.local'];

const BASES = [
  'bocam_auth', 'bocam_gerencia_tecnica', 'bocam_compras', 'bocam_finanzas', 'bocam_personal',
  'bocam_seguridad', 'bocam_ventas', 'bocam_contabilidad', 'bocam_calidad', 'bocam_almacen',
  'bocam_control_proyectos',
];

// ── Datos de prueba ────────────────────────────────────────────────────────────

const USUARIOS = {
  gt:        { email: 'gt@iretum.local',        password: 'Gt.Local.2026',   nombre: 'Ing. Laura Mendoza (Gerencia Técnica)', roles: ['gerencia_tecnica'] },
  residente: { email: 'residente@iretum.local', password: 'Res.Local.2026',  nombre: 'Ing. Carlos Ruiz (Residente de Obra)',  roles: ['residencia'] },
  compras:   { email: 'compras@iretum.local',   password: 'Comp.Local.2026', nombre: 'Lic. Andrea Torres (Compras)',          roles: ['procurement'] },
  finanzas:  { email: 'finanzas@iretum.local',  password: 'Fin.Local.2026',  nombre: 'C.P. Jorge Salas (Finanzas)',           roles: ['finanzas'] },
};
const ADMIN = { email: 'admin@iretum.local', password: 'Local.2026' };
const LIMITE_APROBACION = { gerencia_tecnica: 2000000, finanzas: 500000 }; // MXN

// [clave, descripción, unidad, tipo, costo base MXN]
const INSUMOS = [
  ['MAT-CEM-01',  'Cemento gris CPC 30R, saco de 50 kg',                      'SACO',  'MATERIAL',     245],
  ['MAT-ARE-01',  'Arena de río cribada',                                     'M3',    'MATERIAL',     420],
  ['MAT-GRA-01',  'Grava triturada de 3/4"',                                  'M3',    'MATERIAL',     460],
  ['MAT-VAR-38',  'Varilla corrugada 3/8" fy=4200 kg/cm2',                    'KG',    'MATERIAL',     23.5],
  ['MAT-VAR-12',  'Varilla corrugada 1/2" fy=4200 kg/cm2',                    'KG',    'MATERIAL',     23.0],
  ['MAT-ALM-18',  'Alambre recocido cal. 18',                                 'KG',    'MATERIAL',     32],
  ['MAT-CON-250', 'Concreto premezclado f\'c=250 kg/cm2, T.M.A. 3/4", rev. 12', 'M3',  'MATERIAL',     2450],
  ['MAT-CON-200', 'Concreto premezclado f\'c=200 kg/cm2, T.M.A. 3/4", rev. 10', 'M3',  'MATERIAL',     2280],
  ['MAT-CON-100', 'Concreto hecho en obra f\'c=100 kg/cm2',                   'M3',    'MATERIAL',     1900],
  ['MAT-TRI-16',  'Triplay de pino de 16 mm (1.22 x 2.44 m)',                 'HOJA',  'MATERIAL',     620],
  ['MAT-BLK-15',  'Block hueco de concreto 15x20x40 cm',                      'PZA',   'MATERIAL',     14.5],
  ['MAT-MAL-66',  'Malla electrosoldada 6x6-10/10',                           'M2',    'MATERIAL',     38],
  ['MAT-ACE-A36', 'Perfil de acero estructural A36 (IPR / PTR)',              'KG',    'MATERIAL',     34],
  ['MAT-TUB-CON', 'Tubo conduit PVC pesado de 3/4", tramo de 3 m',            'TRAMO', 'MATERIAL',     42],
  ['MAT-CAB-12',  'Cable THW-LS cal. 12 AWG',                                 'M',     'MATERIAL',     12.8],
  ['MO-CUA-ALB',  'Cuadrilla: oficial albañil + peón',                        'JOR',   'MANO_DE_OBRA', 1450],
  ['MO-CUA-FIE',  'Cuadrilla: oficial fierrero + ayudante',                   'JOR',   'MANO_DE_OBRA', 1500],
  ['MO-CUA-CIM',  'Cuadrilla: carpintero de obra negra + ayudante',           'JOR',   'MANO_DE_OBRA', 1480],
  ['MO-CUA-EST',  'Cuadrilla: montador estructural + soldador',               'JOR',   'MANO_DE_OBRA', 1800],
  ['MO-CUA-ELE',  'Cuadrilla: electricista + ayudante',                       'JOR',   'MANO_DE_OBRA', 1550],
  ['MO-TOP',      'Brigada de topografía con estación total',                 'JOR',   'MANO_DE_OBRA', 2800],
  ['EQ-RETRO',    'Retroexcavadora 416 con operador',                         'HR',    'EQUIPO',       850],
  ['EQ-VIB',      'Vibrador para concreto a gasolina',                        'HR',    'EQUIPO',       65],
  ['EQ-GRUA',     'Grúa telescópica de 20 t con operador',                    'HR',    'EQUIPO',       1650],
  ['EQ-REVOL',    'Revolvedora de 1 saco',                                    'HR',    'EQUIPO',       75],
];

// [clave, descripción, unidad, cantidad, capítulo, nombre capítulo, APU: [[insumo, cantidad por unidad]]]
const CONCEPTOS = [
  ['PRE-001', 'Trazo y nivelación de terreno con equipo topográfico', 'M2', 2400, 'PRE', 'Preliminares',
    [['MO-TOP', 0.004], ['MAT-CEM-01', 0.002]]],
  ['PRE-002', 'Excavación con maquinaria en material tipo II, hasta 1.50 m de profundidad', 'M3', 860, 'PRE', 'Preliminares',
    [['EQ-RETRO', 0.08], ['MO-CUA-ALB', 0.01]]],
  ['CIM-001', 'Plantilla de concreto f\'c=100 kg/cm2 de 5 cm de espesor', 'M2', 420, 'CIM', 'Cimentación',
    [['MAT-CON-100', 0.055], ['EQ-REVOL', 0.02], ['MO-CUA-ALB', 0.03]]],
  ['CIM-002', 'Acero de refuerzo fy=4200 kg/cm2 en zapatas y contratrabes, incluye habilitado y amarre', 'KG', 18500, 'CIM', 'Cimentación',
    [['MAT-VAR-38', 0.45], ['MAT-VAR-12', 0.60], ['MAT-ALM-18', 0.03], ['MO-CUA-FIE', 0.0045]]],
  ['CIM-003', 'Concreto premezclado f\'c=250 kg/cm2 en zapatas y contratrabes, incluye vibrado', 'M3', 310, 'CIM', 'Cimentación',
    [['MAT-CON-250', 1.03], ['EQ-VIB', 0.25], ['MO-CUA-ALB', 0.12]]],
  ['EST-001', 'Cimbra de madera acabado aparente en columnas', 'M2', 640, 'EST', 'Estructura',
    [['MAT-TRI-16', 0.15], ['MO-CUA-CIM', 0.08]]],
  ['EST-002', 'Concreto premezclado f\'c=250 kg/cm2 en columnas, incluye vibrado', 'M3', 95, 'EST', 'Estructura',
    [['MAT-CON-250', 1.04], ['EQ-VIB', 0.4], ['MO-CUA-ALB', 0.2]]],
  ['EST-003', 'Suministro y montaje de estructura metálica de acero A36 para nave industrial', 'KG', 42000, 'EST', 'Estructura',
    [['MAT-ACE-A36', 1.05], ['MO-CUA-EST', 0.0025], ['EQ-GRUA', 0.004]]],
  ['ALB-001', 'Muro de block hueco de concreto 15x20x40 cm asentado con mortero cemento-arena 1:4', 'M2', 1350, 'ALB', 'Albañilería',
    [['MAT-BLK-15', 12.5], ['MAT-CEM-01', 0.12], ['MAT-ARE-01', 0.018], ['MO-CUA-ALB', 0.085]]],
  ['ALB-002', 'Aplanado de mortero cemento-arena 1:4 en muros, acabado fino', 'M2', 2100, 'ALB', 'Albañilería',
    [['MAT-CEM-01', 0.09], ['MAT-ARE-01', 0.022], ['MO-CUA-ALB', 0.07]]],
  ['PIS-001', 'Firme de concreto f\'c=200 kg/cm2 de 15 cm con malla electrosoldada 6x6-10/10', 'M2', 2200, 'PIS', 'Pisos',
    [['MAT-CON-200', 0.157], ['MAT-MAL-66', 1.05], ['EQ-VIB', 0.03], ['MO-CUA-ALB', 0.05]]],
  ['INS-001', 'Salida eléctrica de alumbrado con tubo conduit PVC y cable THW-LS cal. 12', 'SAL', 140, 'INS', 'Instalaciones',
    [['MAT-TUB-CON', 3], ['MAT-CAB-12', 18], ['MO-CUA-ELE', 0.35]]],
];
const FACTOR_SOBRECOSTO = 1.28; // indirectos + financiamiento + utilidad

// RFC de prueba con formato de persona moral; correos en .test (dominio que nunca resuelve).
const PROVEEDORES = {
  aceros: {
    rfc_tax_id: 'AVB150310KQ1', razon_social: 'Aceros y Varillas del Bajío, S.A. de C.V.',
    email_contacto: 'ventas@aceros-bajio.test', telefono: '4421234501', ciudad: 'Querétaro',
    tipo_ubicacion: 'LOCAL', entrega_en_sitio: true, estatus_credito: 'ACTIVO',
    ofrece_credito: true, dias_credito: 30, limite_credito: 500000,
    tipo_proveedor: 'NACIONAL', calificacion_desempeno: 4.6, dias_entrega: 4,
  },
  concretos: {
    rfc_tax_id: 'CAC120518T27', razon_social: 'Concretos y Agregados del Centro, S.A. de C.V.',
    email_contacto: 'pedidos@concretos-centro.test', telefono: '4421234502', ciudad: 'Querétaro',
    tipo_ubicacion: 'LOCAL', entrega_en_sitio: true, estatus_credito: 'ACTIVO',
    ofrece_credito: true, dias_credito: 15, limite_credito: 800000,
    tipo_proveedor: 'NACIONAL', calificacion_desempeno: 4.8, dias_entrega: 1,
  },
  ferretera: {
    rfc_tax_id: 'FMC180905HN4', razon_social: 'Ferretera y Materiales La Cantera, S.A. de C.V.',
    email_contacto: 'cotizaciones@lacantera.test', telefono: '4271234503', ciudad: 'San Juan del Río',
    tipo_ubicacion: 'LOCAL', entrega_en_sitio: false, estatus_credito: 'ACTIVO',
    ofrece_credito: false, dias_credito: null, limite_credito: null,
    tipo_proveedor: 'NACIONAL', calificacion_desempeno: 4.1, dias_entrega: 2,
  },
  electrica: {
    rfc_tax_id: 'DEI110222PZ8', razon_social: 'Distribuidora Eléctrica Industrial del Norte, S.A. de C.V.',
    email_contacto: 'ventas@dein-norte.test', telefono: '8181234504', ciudad: 'Monterrey',
    tipo_ubicacion: 'FORANEO', entrega_en_sitio: true, estatus_credito: 'ACTIVO',
    ofrece_credito: true, dias_credito: 45, limite_credito: 300000,
    tipo_proveedor: 'NACIONAL', calificacion_desempeno: 4.3, dias_entrega: 7,
  },
};

// ── Utilidades ────────────────────────────────────────────────────────────────

let yaLimpio = false; // para el mensaje de error si auth bloquea a media corrida
const log = (m) => console.log(m);
const paso = (m) => console.log(`\n==> ${m}`);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const redondear = (n) => Math.round(n * 100) / 100;

function fallar(m) {
  console.error(`\n[seed] ERROR: ${m}`);
  process.exit(1);
}

function leerEnvLocal() {
  const vars = {};
  for (const linea of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) vars[m[1]] = m[2].trim();
  }
  return vars;
}

function docker(args, input) {
  const r = spawnSync('docker', args, { encoding: 'utf8', input });
  if (r.status !== 0) throw new Error(`docker ${args.slice(0, 6).join(' ')} … falló:\n${r.stderr || r.stdout}`);
  return r.stdout;
}

function psql(base, sql) {
  const admin = leerEnvLocal().LOCAL_DB_ADMIN_USER;
  return docker([...COMPOSE, 'exec', '-T', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-qtA', '-U', admin, '-d', base], sql);
}

async function api(metodo, ruta, token, cuerpo) {
  const resp = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const texto = await resp.text();
  let json;
  try { json = JSON.parse(texto); } catch { json = { raw: texto }; }
  if (!resp.ok || json.success === false) {
    const msg = json.message || json.error?.message || json.error || texto;
    throw new Error(`${metodo} ${ruta} → HTTP ${resp.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
  }
  return json.data;
}

async function login({ email, password }, proyectoId) {
  try {
    const d = await api('POST', '/api/v1/auth/login', null, {
      email, password, tenant_id: TENANT, ...(proyectoId ? { proyecto_id: proyectoId } : {}),
    });
    return d.access_token;
  } catch (e) {
    // auth limita a 10 logins / 15 min por IP y cada corrida hace 5: caben 2 corridas seguidas.
    // Localmente el contador vive en memoria del contenedor auth (sin REDIS_URL).
    if (String(e.message).includes('HTTP 429')) {
      fallar('auth bloqueó el login (límite de 10 logins cada 15 min; cada corrida usa 5).\n' +
        (yaLimpio ? '  El tenant de pruebas quedó a medias: vuelve a correr el seed cuando se libere.\n' : '  No se borró nada.\n') +
        '  Espera 15 minutos, o reinicia el contador local con:  docker restart iretum-local-auth');
    }
    throw e;
  }
}

function fechaEnDias(dias) {
  const f = new Date();
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
}

// ── 1. Guardas de entorno local ───────────────────────────────────────────────

function verificarEntornoLocal() {
  paso('Verificando que todo apunta al entorno local');
  const hostApi = new URL(API).hostname;
  if (!['localhost', '127.0.0.1'].includes(hostApi)) fallar(`la API ${API} no es local.`);

  const ver = spawnSync('node', ['scripts/local/verificar-env-local.mjs', '.env.local', 'docker-compose.local.yml'], { encoding: 'utf8' });
  process.stdout.write(ver.stdout);
  if (ver.status !== 0) { process.stderr.write(ver.stderr); fallar('verificar-env-local.mjs bloqueó la ejecución.'); }

  const id = docker([...COMPOSE, 'ps', '-q', 'postgres']).trim();
  if (!id) fallar('el contenedor postgres de iretum-local no está corriendo (¿iretum-local.ps1 up?).');
  const [nombre, proyecto] = docker(['inspect', '-f', '{{.Name}}|{{index .Config.Labels "com.docker.compose.project"}}', id]).trim().split('|');
  if (nombre !== '/iretum-local-postgres' || proyecto !== 'iretum-local') {
    fallar(`el contenedor de base es "${nombre}" del proyecto "${proyecto}", no iretum-local-postgres.`);
  }
  log(`[seed] OK: API ${API} y base en ${nombre.slice(1)} (proyecto ${proyecto}).`);
}

// ── 2. Limpieza del tenant de pruebas ─────────────────────────────────────────

const SQL_LIMPIEZA = `
DO $$
DECLARE t record; n bigint; pendientes int; avanzo boolean; pasada int := 0;
BEGIN
  LOOP
    pasada := pasada + 1; pendientes := 0; avanzo := false;
    FOR t IN
      SELECT c.table_name FROM information_schema.columns c
      JOIN information_schema.tables tb ON tb.table_schema = c.table_schema AND tb.table_name = c.table_name
      WHERE c.table_schema = 'public' AND c.column_name = 'tenant_id' AND tb.table_type = 'BASE TABLE'
    LOOP
      BEGIN
        EXECUTE format('DELETE FROM public.%I WHERE tenant_id::text = %L', t.table_name, '${TENANT}');
        GET DIAGNOSTICS n = ROW_COUNT;
        IF n > 0 THEN avanzo := true; END IF;
      EXCEPTION WHEN foreign_key_violation THEN
        pendientes := pendientes + 1;
      END;
    END LOOP;
    EXIT WHEN pendientes = 0 OR NOT avanzo OR pasada >= 15;
  END LOOP;
  IF pendientes > 0 THEN
    RAISE EXCEPTION 'quedaron % tabla(s) con filas del tenant de pruebas', pendientes;
  END IF;
END $$;`;

const SQL_RESTANTES = `
SELECT coalesce(sum(cnt), 0) FROM (
  SELECT (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I where tenant_id::text = %L', c.table_name, '${TENANT}'), false, true, '')))[1]::text::int AS cnt
  FROM information_schema.columns c
  JOIN information_schema.tables tb ON tb.table_schema = c.table_schema AND tb.table_name = c.table_name
  WHERE c.table_schema = 'public' AND c.column_name = 'tenant_id' AND tb.table_type = 'BASE TABLE'
) s;`;

async function limpiarTenant() {
  paso(`Limpiando SOLO el tenant de pruebas ${TENANT} en ${BASES.length} bases`);
  for (const base of BASES) {
    psql(base, SQL_LIMPIEZA);
    const quedan = Number(psql(base, SQL_RESTANTES).trim());
    if (quedan !== 0) fallar(`${base} conserva ${quedan} fila(s) del tenant tras la limpieza.`);
    log(`  ${base}: limpio`);
  }
  psql('bocam_auth', readFileSync('docker/local/sql/seed-usuario-local.sql', 'utf8'));
  log('  bocam_auth: admin local restaurado (admin@iretum.local)');
  try { await fetch(`${MAILPIT}/api/v1/messages`, { method: 'DELETE' }); log('  mailpit: bandeja vaciada'); } catch { /* opcional */ }
}

// ── 3. Base: cliente, centro de costos, usuarios ──────────────────────────────

async function crearBase(tokenAdmin) {
  paso('Ventas → cliente; Auth → centro de costos y usuarios por rol (como admin)');

  const cliente = await api('POST', '/api/v1/ventas/clientes', tokenAdmin, {
    rfc_tax_id: 'DLQ190704MX3', razon_social: 'Desarrolladora Logística Querétaro, S.A.P.I. de C.V.',
    email_contacto: 'proyectos@dlq.test', telefono: '4421239900', codigo_cliente: '049',
  });
  log(`  Cliente: ${cliente.razon_social}`);

  const anio = new Date().getFullYear();
  const proyecto = await api('POST', '/api/v1/auth/admin/proyectos', tokenAdmin, {
    nombre_oficial: 'Bodega Industrial Logística Querétaro Norte — Nave A',
    tipo_contrato: 'PRECIOS_UNITARIOS', moneda_base: 'MXN', estatus: 'EN EJECUCIÓN',
    empresa_grupo: 'CIB', anio_centro_costos: anio, cliente_id: cliente.id_cliente, codigo_cliente: '049',
    monto_total_vendido: 18500000, periodo_ejecucion: 8, periodo_ejecucion_unidad: 'MESES',
    fecha_programada_inicio: `${anio}-11-03`, fecha_programada_fin: `${anio + 1}-06-30`,
  });
  log(`  Centro de costos: ${proyecto.codigo_centro_costos} — ${proyecto.nombre_oficial}`);

  for (const u of Object.values(USUARIOS)) {
    await api('POST', '/api/v1/auth/admin/users', tokenAdmin, {
      email: u.email, password: u.password, nombre: u.nombre, roles: u.roles, proyecto_ids: [proyecto.id_proyecto],
      // Finanzas valida este límite al registrar un pago de OC (POST /finanzas/pagos-oc).
      limite_aprobacion: LIMITE_APROBACION[u.roles[0]] ?? 0,
    });
    log(`  Usuario: ${u.email} [${u.roles.join(', ')}]`);
  }

  const tokens = {};
  for (const [k, u] of Object.entries(USUARIOS)) tokens[k] = await login(u, proyecto.id_proyecto);
  return { proyecto, tokens };
}

// ── 4. Gerencia Técnica: insumos, catálogo, APU, aprobación ───────────────────

async function cargarGerenciaTecnica(proyecto, { gt }) {
  paso('Gerencia Técnica → insumos, catálogo de conceptos, APU (explosión) y aprobación');
  const imp = await api('POST', '/api/v1/gerencia-tecnica/insumos/importar-lote', gt, {
    insumos: INSUMOS.map(([clave, descripcion, unidad_medida, tipo_insumo, costo_base]) => ({ clave, descripcion, unidad_medida, tipo_insumo, costo_base })),
  });
  log(`  Insumos: ${JSON.stringify(imp)}`);

  const costo = new Map(INSUMOS.map(([c, , , tipo, cb]) => [c, { tipo, cb }]));
  const conceptosBody = CONCEPTOS.map(([clave, descripcion, unidad_medida, cantidad, capitulo_clave, capitulo_nombre, apu]) => ({
    clave, descripcion, unidad_medida, cantidad, capitulo_clave, capitulo_nombre,
    precio_unitario: redondear(apu.reduce((s, [ins, q]) => s + q * costo.get(ins).cb, 0) * FACTOR_SOBRECOSTO),
  }));
  const presupuesto = await api('POST', '/api/v1/gerencia-tecnica/presupuestos', gt, {
    proyecto_id: proyecto.id_proyecto, version: 1, conceptos: conceptosBody,
  });
  log(`  Catálogo: ${presupuesto.conceptos.length} conceptos, importe $${Number(presupuesto.importe_total).toLocaleString('es-MX')}`);

  const apu = await api('POST', '/api/v1/gerencia-tecnica/composicion-apu', gt, {
    composiciones: CONCEPTOS.map(([clave, , , , , , insumos]) => ({
      concepto_clave: clave,
      insumos: insumos.map(([ins, q]) => ({ clave_insumo: ins, tipo_insumo: costo.get(ins).tipo, cantidad: q, rendimiento: q > 0 ? redondear(1 / q) : 0, costo_unitario: costo.get(ins).cb })),
    })),
  });
  log(`  APU: ${apu.vinculados} vínculos concepto-insumo, ${apu.omitidos} omitidos`);
  if (apu.omitidos > 0) fallar('la composición APU omitió insumos; revisa claves.');

  await api('PATCH', `/api/v1/gerencia-tecnica/presupuestos/${presupuesto.id}/aprobar`, gt);
  log('  Presupuesto APROBADO (crea SaldoPartida y publica gerencia_tecnica.saldo_partida_creado)');

  const insumos = await api('GET', '/api/v1/gerencia-tecnica/insumos', gt);
  return {
    insumoId: new Map(insumos.map((i) => [i.clave, i.id])),
    conceptoId: new Map(presupuesto.conceptos.map((c) => [c.clave, c.id])),
  };
}

// ── 5. Compras: proveedores ───────────────────────────────────────────────────

async function crearProveedores({ compras }) {
  paso('Compras → 4 proveedores');
  const ids = {};
  for (const [k, { dias_entrega, ...p }] of Object.entries(PROVEEDORES)) {
    const creado = await api('POST', '/api/v1/compras/proveedores', compras, p);
    ids[k] = creado.id_proveedor;
    log(`  ${p.razon_social} (${p.rfc_tax_id}) — ${p.ofrece_credito ? `crédito ${p.dias_credito} días` : 'contado'}, entrega ~${dias_entrega} días`);
  }
  return ids;
}

// ── 6. Requisiciones a–d ──────────────────────────────────────────────────────

function cantidadPresupuestada(claveConcepto, claveInsumo) {
  const c = CONCEPTOS.find(([k]) => k === claveConcepto);
  const q = c[6].find(([ins]) => ins === claveInsumo)[1];
  return redondear(c[3] * q);
}

async function crearRequisicion(t, cat, codigo, claveConcepto, items, extra = {}) {
  return api('POST', '/api/v1/compras/requisiciones', t.residente, {
    codigo, concepto_id: cat.conceptoId.get(claveConcepto), prioridad: extra.prioridad || 'NORMAL', tipo: 'NORMAL',
    direccion_entrega: 'Carretera Querétaro–San Luis Potosí km 22.5, Parque Industrial Norte, Lote 14, Qro.',
    observaciones: extra.observaciones || 'Favor de indicar tiempo de entrega y condiciones de pago.',
    observaciones_internas: extra.internas || null,
    items: items.map(([claveInsumo, cantidad, marca, detalle]) => ({
      insumo_id: cat.insumoId.get(claveInsumo), cantidad,
      cantidad_presupuestada: cantidadPresupuestada(claveConcepto, claveInsumo),
      concepto_origen_id: cat.conceptoId.get(claveConcepto),
      especificacion_marca_modelo: marca || null, especificacion_detalle: detalle || null,
    })),
  });
}

/** Aprueba la req, invita a cotizar, registra respuestas y captura el cuadro (queda en BORRADOR). */
async function cotizar(t, req, provIds, invitados, respuestas) {
  await api('PATCH', `/api/v1/compras/requisiciones/${req.id_requisicion}/aprobar`, t.compras);
  const sol = await api('POST', `/api/v1/compras/requisiciones/${req.id_requisicion}/solicitud-cotizacion`, t.compras, {
    proveedores_ids: invitados.map((k) => provIds[k]), dias_habiles: 3,
    notas: 'Cotizar con entrega en obra. Indicar vigencia de precios.', proyecto_nombre: 'Bodega Industrial Logística Querétaro Norte',
  });
  for (const scp of sol.proveedores) {
    const k = Object.keys(provIds).find((x) => provIds[x] === scp.proveedor_id);
    const respondio = Boolean(respuestas[k]);
    await api('PUT', `/api/v1/compras/requisiciones/${req.id_requisicion}/solicitud-cotizacion/proveedores/${scp.id_scp}`, t.compras, {
      estado: respondio ? 'RESPONDIO' : 'DECLINO',
      notas_proveedor: respondio ? `Cotización recibida. Entrega ${PROVEEDORES[k].dias_entrega} días.` : 'No maneja el material solicitado.',
    });
  }

  const cuadro = await api('POST', '/api/v1/compras/comparativas', t.compras, { requisicion_id: req.id_requisicion });
  const insumoDeItem = new Map(req.items.map((i) => [i.id_item, i.insumo_id]));
  await api('PUT', `/api/v1/compras/comparativas/${cuadro.id_cuadro}/cotizaciones`, t.compras, {
    proveedores: Object.entries(respuestas).map(([k, precios]) => ({
      nombre: PROVEEDORES[k].razon_social,
      precios: req.items.map((item, idx) => ({
        insumo_id: insumoDeItem.get(item.id_item), precio: precios[idx],
        fecha_entrega_estimada: fechaEnDias(PROVEEDORES[k].dias_entrega),
        especificacion_ofrecida: item.especificacion_marca_modelo ? `Ofrece ${item.especificacion_marca_modelo} o equivalente certificado` : null,
      })),
    })),
  });
  return cuadro;
}

/** Residencia evalúa y firma; GT evalúa (decisiones[proveedor] = ['C'|'NC', comentario] por renglón) y finaliza. */
async function evaluarYAprobar(t, cuadroId, req, provIds, { primera, segunda, decisionesGT, veredicto }) {
  await api('PATCH', `/api/v1/compras/comparativas/${cuadroId}/enviar-evaluacion`, t.compras);
  const cuadro = await api('GET', `/api/v1/compras/comparativas/${cuadroId}`, t.residente);
  await api('PATCH', `/api/v1/compras/comparativas/${cuadroId}/evaluar`, t.residente, {
    evaluaciones: cuadro.detalles.map((d) => ({ detalle_id: d.id_detalle, evaluacion_tecnica: 'C' })),
  });
  await api('PUT', `/api/v1/compras/comparativas/${cuadroId}/seleccion`, t.residente, {
    primera_opcion_proveedor_id: provIds[primera], ...(segunda ? { segunda_opcion_proveedor_id: provIds[segunda] } : {}),
  });
  await api('POST', `/api/v1/compras/comparativas/${cuadroId}/firmar`, t.residente, {
    veredicto_residente: veredicto, proveedores_sugeridos: [primera, segunda].filter(Boolean).map((k) => provIds[k]),
  });
  await api('PATCH', `/api/v1/compras/comparativas/${cuadroId}/enviar-gt`, t.residente);

  const ordenInsumos = req.items.map((i) => i.insumo_id);
  await api('PATCH', `/api/v1/compras/comparativas/${cuadroId}/evaluar-gt`, t.gt, {
    evaluaciones: cuadro.detalles.map((d) => {
      const k = Object.keys(provIds).find((x) => provIds[x] === d.proveedor_id);
      const [valor, comentario] = decisionesGT[k][ordenInsumos.indexOf(d.insumo_id)];
      return { detalle_id: d.id_detalle, aprobacion_gt: valor, ...(comentario ? { comentario_gt: comentario } : {}) };
    }),
  });
  return api('PATCH', `/api/v1/compras/comparativas/${cuadroId}/revisar-gt`, t.gt, {
    comentario_gt_general: 'Selección por precio, crédito y tiempo de entrega.',
  });
}

async function esperarEspejoFinanzas(t, conceptoId, clave) {
  for (let i = 0; i < 30; i++) {
    try {
      const p = await api('GET', `/api/v1/finanzas/presupuestos/por-concepto/${conceptoId}`, t.finanzas);
      log(`  Finanzas ya tiene el presupuesto de ${clave} (llegó por evento): $${Number(p.monto_autorizado).toLocaleString('es-MX')}`);
      return;
    } catch { await dormir(1000); }
  }
  fallar(`Finanzas no recibió el presupuesto de ${clave} en 30 s (¿RabbitMQ / evento saldo_partida_creado?).`);
}

async function sembrarRequisiciones(t, cat, prov) {
  const resultado = {};

  paso('Caso a) requisición recién creada (Residencia)');
  const a = await crearRequisicion(t, cat, 'REQ-LOCAL-A', 'PIS-001', [
    ['MAT-CON-200', 120, 'Premezclado rev. 10 cm', 'Colado de firme en eje 1–6; bombeo incluido'],
    ['MAT-MAL-66', 800, 'Malla 6x6-10/10 en rollo', 'Rollos de 2.5 x 40 m'],
  ], { observaciones: 'Firme de nave, primera etapa.' });
  resultado.a = { req: a };
  log(`  ${a.codigo} creada`);

  paso('Caso b) cotizaciones capturadas y cuadro sin firmar');
  const b = await crearRequisicion(t, cat, 'REQ-LOCAL-B', 'ALB-001', [
    ['MAT-BLK-15', 6000, 'Block 15x20x40 resistencia 50 kg/cm2', 'Con certificado de calidad'],
    ['MAT-CEM-01', 150, 'CPC 30R', null],
    ['MAT-ARE-01', 22, null, 'Arena cribada, libre de arcilla'],
  ]);
  const cuadroB = await cotizar(t, b, prov, ['ferretera', 'concretos', 'aceros', 'electrica'], {
    ferretera: [14.20, 238, 410],
    concretos: [13.90, 232, 395],
    aceros:    [15.10, 241, 430],
  });
  resultado.b = { req: b, cuadro: cuadroB };
  log(`  ${b.codigo}: 4 invitados (1 declinó), cuadro ${cuadroB.codigo} en BORRADOR con 3 cotizaciones`);

  paso('Caso c) cuadro firmado por Residencia y aprobado por GT, compra dividida a 2 proveedores');
  const c = await crearRequisicion(t, cat, 'REQ-LOCAL-C', 'CIM-002', [
    ['MAT-VAR-38', 4000, 'Varilla corrugada grado 42', 'Norma NMX-B-506; certificado de molino'],
    ['MAT-VAR-12', 5000, 'Varilla corrugada grado 42', 'Norma NMX-B-506; certificado de molino'],
    ['MAT-ALM-18', 300, null, 'Alambre recocido en rollo'],
  ], { prioridad: 'URGENTE', internas: 'Necesario antes del colado de zapatas Z-1 a Z-12.' });
  const cuadroC = await cotizar(t, c, prov, ['aceros', 'ferretera', 'concretos'], {
    aceros:    [22.40, 21.90, 36.50],
    ferretera: [24.10, 23.60, 29.80],
  });
  const cuadroCAprobado = await evaluarYAprobar(t, cuadroC.id_cuadro, c, prov, {
    primera: 'aceros', segunda: 'ferretera',
    veredicto: 'Ambos proveedores cumplen especificación técnica. Se recomienda Aceros del Bajío por certificado de molino.',
    decisionesGT: {
      aceros:    [['C'], ['C'], ['NC', 'Alambre 22% más caro que La Cantera; se compra a La Cantera.']],
      ferretera: [['NC', 'Varilla más cara y sin crédito.'], ['NC', 'Varilla más cara y sin crédito.'], ['C']],
    },
  });
  resultado.c = { req: c, cuadro: cuadroCAprobado };
  const ganadoresC = cuadroCAprobado.detalles.filter((d) => d.es_ganador).map((d) => d.proveedor.razon_social);
  log(`  ${c.codigo}: cuadro ${cuadroCAprobado.codigo} ${cuadroCAprobado.estado}; ganadores: ${[...new Set(ganadoresC)].join(' + ')}`);

  paso('Caso d) OC generada y enviada por la API de Compras');
  const d = await crearRequisicion(t, cat, 'REQ-LOCAL-D', 'CIM-003', [
    ['MAT-CON-250', 120, 'Premezclado f\'c=250 rev. 12 cm', 'Con bomba pluma; colado de zapatas Z-1 a Z-12'],
  ], { prioridad: 'URGENTE' });
  const cuadroD = await cotizar(t, d, prov, ['concretos', 'ferretera'], {
    concretos: [2380],
    ferretera: [2490],
  });
  const cuadroDAprobado = await evaluarYAprobar(t, cuadroD.id_cuadro, d, prov, {
    primera: 'concretos', segunda: 'ferretera',
    veredicto: 'Concretos del Centro garantiza bombeo y entrega en 24 h.',
    decisionesGT: {
      concretos: [['C']],
      ferretera: [['NC', 'Precio mayor y no garantiza bombeo.']],
    },
  });
  await esperarEspejoFinanzas(t, cat.conceptoId.get('CIM-003'), 'CIM-003');
  const lote = await api('POST', `/api/v1/compras/comparativas/${cuadroD.id_cuadro}/convertir-oc`, t.compras, {});
  for (const oc of lote.ordenes_compra) log(`  OC ${oc.codigo}: ${oc.estado}, total $${oc.total.toLocaleString('es-MX')}`);
  if (lote.advertencias) log(`  Advertencias: ${lote.advertencias.join(' | ')}`);
  const envio = await api('POST', '/api/v1/compras/ordenes-compra/enviar-correo', t.compras, {
    ids_orden: lote.ordenes_compra.map((o) => o.id_orden),
  });
  log(`  Envío: ${envio.enviadas.length} enviada(s), ${envio.fallidas.length} fallida(s)${envio.fallidas.length ? ` → ${envio.fallidas.map((f) => f.motivo).join('; ')}` : ''}`);
  if (envio.fallidas.length) fallar('el envío de la OC falló (¿Mailpit arriba?).');
  resultado.d = { req: d, cuadro: cuadroDAprobado, ocs: lote.ordenes_compra };
  return resultado;
}

// ── 7. Resumen ────────────────────────────────────────────────────────────────

async function resumen(proyecto, t, r) {
  await dormir(3000); // eventos asíncronos de la OC (partida_comprometida, oc_creada)
  paso('Resumen');
  const reqs = await api('GET', '/api/v1/compras/requisiciones', t.compras);
  const estadoReq = new Map(reqs.map((x) => [x.codigo, x.estado]));
  const cuadros = await api('GET', '/api/v1/compras/comparativas', t.compras);
  const estadoCuadro = new Map(cuadros.map((x) => [x.id_cuadro, x]));

  log(`\nCentro de costos: ${proyecto.codigo_centro_costos} (${proyecto.id_proyecto})`);
  log('\nUsuarios (tenant "Constructora Local (pruebas)"):');
  for (const u of [ADMIN, ...Object.values(USUARIOS)]) log(`  ${u.email.padEnd(24)} ${u.password}`);

  log('\nRequisiciones:');
  for (const k of ['a', 'b', 'c', 'd']) {
    const { req, cuadro, ocs } = r[k];
    const cc = cuadro ? estadoCuadro.get(cuadro.id_cuadro) : null;
    log(`  ${k}) ${req.codigo.padEnd(12)} req=${estadoReq.get(req.codigo)}${cc ? `  cuadro=${cc.codigo} ${cc.estado}` : ''}${ocs ? `  OC=${ocs.map((o) => `${o.codigo} ${o.estado}`).join(', ')}` : ''}`);
  }

  const f = psql('bocam_finanzas', `
    select 'presupuestos_asignados', count(*) from presupuestos_asignados where tenant_id::text = '${TENANT}'
    union all select 'movimientos_presupuestales', count(*) from movimientos_presupuestales where tenant_id::text = '${TENANT}'
    union all select 'proyectos_finanzas', count(*) from proyectos_finanzas where tenant_id::text = '${TENANT}'
    union all select 'pagos_oc', count(*) from pagos_oc where tenant_id::text = '${TENANT}';`);
  log('\nLo que llegó SOLO a Finanzas (filas del tenant, solo lectura):');
  for (const l of f.trim().split(/\r?\n/)) { const [tabla, n] = l.split('|'); log(`  ${tabla.padEnd(28)} ${n}`); }
  log(`\nCorreos capturados: ${MAILPIT}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

verificarEntornoLocal();
// El admin entra ANTES de limpiar: si auth ya bloqueó los logins, se aborta sin borrar nada.
// Su JWT sigue valiendo tras la limpieza (seed-usuario-local.sql lo recrea con el mismo id).
const tokenAdmin = await login(ADMIN);
await limpiarTenant();
yaLimpio = true;
const { proyecto, tokens } = await crearBase(tokenAdmin);
const catalogo = await cargarGerenciaTecnica(proyecto, tokens);
const proveedores = await crearProveedores(tokens);
const resultado = await sembrarRequisiciones(tokens, catalogo, proveedores);
await resumen(proyecto, tokens, resultado);
log('\n[seed] Listo.');

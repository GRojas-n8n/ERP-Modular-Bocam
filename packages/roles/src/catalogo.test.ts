/**
 * Test guardián del catálogo de roles.
 *
 * Recorre el código real de los 13 servicios y del menú del app-shell, extrae
 * cada rol mencionado, y falla si alguno no está en el catálogo. Es lo que
 * impide que el selector de alta de usuarios y los `requireRoles` vuelvan a
 * derivar por separado: agregar un rol nuevo en un servicio sin declararlo aquí
 * rompe la suite.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROLES, ROLES_VALIDOS, ROLES_ASIGNABLES, esRolValido, etiquetaDeRol } from './index';

const RAIZ = join(__dirname, '..', '..', '..');
const APPS = join(RAIZ, 'apps');

/** Roles exigidos por un servicio, vía `requireRoles(...)` o `rolesAutorizados = [...]`. */
function rolesExigidosPorBackend(): Map<string, string[]> {
  const porRol = new Map<string, string[]>();

  for (const app of readdirSync(APPS, { withFileTypes: true })) {
    if (!app.isDirectory() || app.name === 'app-shell') continue;
    const src = join(APPS, app.name, 'src');
    if (!existsSync(src)) continue;

    for (const archivo of readdirSync(src)) {
      if (!archivo.endsWith('.ts') || archivo.endsWith('.test.ts')) continue;
      const texto = readFileSync(join(src, archivo), 'utf8');

      const bloques = [
        ...texto.matchAll(/requireRoles\(([^)]*)\)/g),
        ...texto.matchAll(/rolesAutorizados\s*=\s*\[([^\]]*)\]/g),
      ];

      for (const bloque of bloques) {
        for (const [, rol] of bloque[1].matchAll(/'([a-z_]+)'/g)) {
          const dueños = porRol.get(rol) ?? [];
          if (!dueños.includes(app.name)) dueños.push(app.name);
          porRol.set(rol, dueños);
        }
      }
    }
  }

  return porRol;
}

/** Roles que el menú del app-shell usa para decidir qué módulos mostrar. */
function rolesDelMenu(): Set<string> {
  const layout = readFileSync(join(APPS, 'app-shell', 'src', 'components', 'Layout.tsx'), 'utf8');
  const encontrados = new Set<string>();
  for (const bloque of layout.matchAll(/roles:\s*\[([^\]]*)\]/g)) {
    for (const [, rol] of bloque[1].matchAll(/'([a-z_]+)'/g)) encontrados.add(rol);
  }
  return encontrados;
}

test('el barrido encuentra código real, no cadena vacía', () => {
  const backend = rolesExigidosPorBackend();
  assert.ok(backend.size >= 10, `solo se encontraron ${backend.size} roles en apps/*/src — ¿cambió la estructura?`);
  assert.ok(rolesDelMenu().size >= 10, 'no se encontraron roles en Layout.tsx');
});

test('todo rol exigido por un servicio está en el catálogo', () => {
  const huerfanos: string[] = [];
  for (const [rol, servicios] of rolesExigidosPorBackend()) {
    if (!esRolValido(rol)) huerfanos.push(`${rol} (exigido por ${servicios.join(', ')})`);
  }
  assert.deepEqual(
    huerfanos,
    [],
    `Roles exigidos por el backend que no están en el catálogo:\n  ${huerfanos.join('\n  ')}\n` +
      'Agrégalos a packages/roles/src/index.ts, o corrige el requireRoles si es una errata.'
  );
});

test('todo rol del menú está en el catálogo', () => {
  const huerfanos = [...rolesDelMenu()].filter(r => !esRolValido(r));
  assert.deepEqual(
    huerfanos,
    [],
    `Roles usados en el menú que no están en el catálogo: ${huerfanos.join(', ')}`
  );
});

test('todo rol asignable puede seleccionarse al crear un usuario', () => {
  // El bug original: el backend exigía warehouse, control_proyectos y director,
  // y el selector de Administración no los ofrecía — no había forma de dar de
  // alta un almacenista sin convertirlo en admin.
  const asignables = new Set(ROLES_ASIGNABLES.map(r => r.id));
  const faltantes: string[] = [];

  for (const [rol, servicios] of rolesExigidosPorBackend()) {
    const def = ROLES.find(r => r.id === rol);
    if (def?.estado === 'alias') continue; // los alias no se ofrecen a propósito
    if (!asignables.has(rol)) faltantes.push(`${rol} (exigido por ${servicios.join(', ')})`);
  }

  assert.deepEqual(
    faltantes,
    [],
    `Roles que el backend exige pero no se pueden asignar desde Administración:\n  ${faltantes.join('\n  ')}`
  );
});

test('los alias declaran un rol canónico que existe', () => {
  for (const rol of ROLES) {
    if (rol.estado !== 'alias') continue;
    assert.ok(rol.canonico, `el alias ${rol.id} no declara canonico`);
    assert.ok(esRolValido(rol.canonico!), `el alias ${rol.id} apunta a ${rol.canonico}, que no existe`);
    const destino = ROLES.find(r => r.id === rol.canonico);
    assert.notEqual(destino?.estado, 'alias', `el alias ${rol.id} apunta a otro alias`);
  }
});

test('ningún alias catalogado quedó huérfano de backend', () => {
  // Simétrico al guardián de 'sin-backend': si un alias ya no aparece en
  // ningún requireRoles real, dejó de ser "sinónimo histórico aún exigido" y
  // debe retirarse del catálogo en el mismo cambio que lo retira del backend,
  // no quedar como nota desactualizada (ver rbac-migracion-alias-resident-technical-compras).
  const backend = rolesExigidosPorBackend();
  const huerfanos: string[] = [];

  for (const rol of ROLES) {
    if (rol.estado !== 'alias') continue;
    if (!backend.get(rol.id)?.length) huerfanos.push(rol.id);
  }

  assert.deepEqual(
    huerfanos,
    [],
    `Alias catalogados que ningún requireRoles real exige ya:\n  ${huerfanos.join('\n  ')}\n` +
      'Retíralos de packages/roles/src/index.ts en vez de dejarlos como alias huérfano.'
  );
});

test('no hay ids repetidos y todos tienen etiqueta', () => {
  assert.equal(new Set(ROLES_VALIDOS).size, ROLES_VALIDOS.length, 'hay ids de rol repetidos');
  for (const rol of ROLES) {
    assert.ok(rol.label.trim().length > 0, `el rol ${rol.id} no tiene etiqueta`);
    assert.equal(etiquetaDeRol(rol.id), rol.label);
  }
  assert.equal(etiquetaDeRol('rol-inventado'), 'rol-inventado', 'un rol no catalogado debe devolver su id');
});

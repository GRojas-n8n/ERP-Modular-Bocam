/**
 * El alta de usuarios aceptaba cualquier cadena como rol (`z.array(z.string())`),
 * así que una errata se guardaba sin ruido y reaparecía días después como un 403
 * inexplicable en el módulo del usuario.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearUsuarioSchema, actualizarUsuarioSchema } from './admin-users.schema';

const base = { email: 'a@b.com', password: 'x', nombre: 'Prueba' };

test('rechaza un rol inventado al crear, y lo nombra en el mensaje', () => {
  const r = crearUsuarioSchema.safeParse({ ...base, roles: ['finanzs'] });
  assert.equal(r.success, false);
  assert.match(r.error!.issues[0].message, /finanzs/);
});

test('acepta los roles que el backend exige y antes no eran asignables', () => {
  for (const rol of ['warehouse', 'control_proyectos', 'director']) {
    const r = crearUsuarioSchema.safeParse({ ...base, roles: [rol] });
    assert.equal(r.success, true, `${rol} deberia poder asignarse`);
  }
});

test('no ofrece alias históricos al crear un usuario nuevo', () => {
  // 'resident' abre Compras pero no Personal ni Control de Proyectos: asignarlo
  // a alguien nuevo produce accesos distintos segun el endpoint.
  const r = crearUsuarioSchema.safeParse({ ...base, roles: ['resident'] });
  assert.equal(r.success, false);
});

test('sí acepta alias al editar, para no bloquear usuarios que ya los traen', () => {
  const r = actualizarUsuarioSchema.safeParse({ nombre: 'Nuevo nombre', roles: ['resident'] });
  assert.equal(r.success, true);
});

test('roles sigue siendo opcional', () => {
  assert.equal(crearUsuarioSchema.safeParse(base).success, true);
  assert.equal(actualizarUsuarioSchema.safeParse({ activo: false }).success, true);
});

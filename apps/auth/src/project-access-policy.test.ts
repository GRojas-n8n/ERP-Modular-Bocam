import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAutoAssignedUserIds } from './project-access-policy';

test('resolveAutoAssignedUserIds incluye usuarios con rol gerencia-tecnica', () => {
  const users = [
    { id_usuario: 'user-gt', rol_global: ['gerencia_tecnica'], activo: true },
  ];

  assert.deepEqual(resolveAutoAssignedUserIds(users), ['user-gt']);
});

test('resolveAutoAssignedUserIds sigue incluyendo admin y superintendent', () => {
  const users = [
    { id_usuario: 'user-admin', rol_global: ['admin'], activo: true },
    { id_usuario: 'user-super', rol_global: ['superintendent'], activo: true },
  ];

  assert.deepEqual(
    resolveAutoAssignedUserIds(users).sort(),
    ['user-admin', 'user-super'].sort()
  );
});

test('resolveAutoAssignedUserIds excluye roles fuera de la lista blanca', () => {
  const users = [
    { id_usuario: 'user-compras', rol_global: ['compras'], activo: true },
    { id_usuario: 'user-residente', rol_global: ['residente'], activo: true },
  ];

  assert.deepEqual(resolveAutoAssignedUserIds(users), []);
});

test('resolveAutoAssignedUserIds excluye usuarios inactivos aunque tengan rol elegible', () => {
  const users = [
    { id_usuario: 'user-gt-inactivo', rol_global: ['gerencia_tecnica'], activo: false },
  ];

  assert.deepEqual(resolveAutoAssignedUserIds(users), []);
});

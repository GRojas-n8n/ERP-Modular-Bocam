import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, resolveActiveProjectId } from './login-policy';

test('normalizeEmail trims and lowercases corporate emails', () => {
  assert.equal(normalizeEmail('  User.Name@Bocam.COM.MX  '), 'user.name@bocam.com.mx');
});

test('resolveActiveProjectId rejects projects outside user scope', () => {
  const user = {
    proyectos_acceso: [{ proyecto_id: 'proj-001' }, { proyecto_id: 'proj-002' }],
  };

  assert.throws(
    () => resolveActiveProjectId(user, 'proj-x'),
    /AUTH_PROJECT_FORBIDDEN/
  );
});

test('resolveActiveProjectId falls back to first authorized project', () => {
  const user = {
    proyectos_acceso: [{ proyecto_id: 'proj-001' }, { proyecto_id: 'proj-002' }],
  };

  assert.equal(resolveActiveProjectId(user), 'proj-001');
});

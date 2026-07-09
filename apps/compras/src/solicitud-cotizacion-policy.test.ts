import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProyectoIdParaSolicitud } from './solicitud-cotizacion-policy';

const TENANT_A = '11111111-1111-1111-1111-111111111111';
const PROYECTO_A = '22222222-2222-2222-2222-222222222222';
const PROYECTO_SESION_DISTINTO = '99999999-9999-9999-9999-999999999999';

test('resolveProyectoIdParaSolicitud usa el proyecto_id de la requisicion, no el de la sesion', () => {
  const requisicion = { tenant_id: TENANT_A, proyecto_id: PROYECTO_A };

  const resultado = resolveProyectoIdParaSolicitud(requisicion, TENANT_A);

  assert.equal(resultado, PROYECTO_A);
  assert.notEqual(resultado, PROYECTO_SESION_DISTINTO);
});

test('resolveProyectoIdParaSolicitud ignora un proyecto_id vacio en la sesion (no lo recibe como parametro)', () => {
  // La función ni siquiera acepta el proyecto_id de sesión como argumento —
  // solo puede devolver el de la requisición. Este test documenta esa garantía.
  const requisicion = { tenant_id: TENANT_A, proyecto_id: PROYECTO_A };

  const resultado = resolveProyectoIdParaSolicitud(requisicion, TENANT_A);

  assert.equal(resultado, PROYECTO_A);
});

test('resolveProyectoIdParaSolicitud lanza error si la requisicion no existe', () => {
  assert.throws(
    () => resolveProyectoIdParaSolicitud(null, TENANT_A),
    /REQUISICION_NOT_FOUND/
  );
});

test('resolveProyectoIdParaSolicitud lanza error si la requisicion es de otro tenant', () => {
  const requisicion = { tenant_id: 'otro-tenant', proyecto_id: PROYECTO_A };

  assert.throws(
    () => resolveProyectoIdParaSolicitud(requisicion, TENANT_A),
    /REQUISICION_NOT_FOUND/
  );
});

test('resolveProyectoIdParaSolicitud lanza error si el proyecto_id de la requisicion no es un UUID valido', () => {
  const requisicion = { tenant_id: TENANT_A, proyecto_id: '' };

  assert.throws(
    () => resolveProyectoIdParaSolicitud(requisicion, TENANT_A),
    /REQUISICION_PROYECTO_INVALIDO/
  );
});

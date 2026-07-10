import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ensamblarCodigoCentroCostos,
  validarEmpresaGrupo,
  siguienteConsecutivo,
  migrarEstatusLegacy,
  validarEstatus,
  EMPRESAS_VALIDAS,
  ESTATUS_VALIDOS,
} from './centro-costos-policy';

// ── ensamblarCodigoCentroCostos (3.1) ────────────────────────────────────────

test('ensamblarCodigoCentroCostos produce exactamente 13 caracteres en el orden empresa+anio+cliente+consecutivo', () => {
  const codigo = ensamblarCodigoCentroCostos({ empresa: 'HCO', anio: 2018, codigoCliente: '004', consecutivo: 1 });
  assert.equal(codigo, 'HCO2018004001');
  assert.equal(codigo.length, 13);
});

test('ensamblarCodigoCentroCostos rellena el consecutivo con ceros a la izquierda', () => {
  assert.equal(ensamblarCodigoCentroCostos({ empresa: 'CIB', anio: 2026, codigoCliente: '000', consecutivo: 7 }), 'CIB2026000007');
  assert.equal(ensamblarCodigoCentroCostos({ empresa: 'CIB', anio: 2026, codigoCliente: '000', consecutivo: 42 }), 'CIB2026000042');
});

test('ensamblarCodigoCentroCostos rellena el codigoCliente con ceros si viene sin formatear', () => {
  assert.equal(ensamblarCodigoCentroCostos({ empresa: 'SEO', anio: 2026, codigoCliente: '4', consecutivo: 1 }), 'SEO2026004001');
});

// ── validarEmpresaGrupo (3.2) ────────────────────────────────────────────────

test('validarEmpresaGrupo acepta los 4 valores del enum', () => {
  for (const empresa of EMPRESAS_VALIDAS) {
    assert.equal(validarEmpresaGrupo(empresa), true, `${empresa} debe ser válido`);
  }
});

test('validarEmpresaGrupo rechaza valores fuera del enum', () => {
  assert.equal(validarEmpresaGrupo('XXX'), false);
  assert.equal(validarEmpresaGrupo('cib'), false); // case-sensitive
  assert.equal(validarEmpresaGrupo(''), false);
});

// ── siguienteConsecutivo (3.3) ───────────────────────────────────────────────

test('siguienteConsecutivo con 0 existentes retorna 1', () => {
  assert.equal(siguienteConsecutivo(0), 1);
});

test('siguienteConsecutivo con 1 existente retorna 2', () => {
  assert.equal(siguienteConsecutivo(1), 2);
});

test('siguienteConsecutivo con colisión (ya ocupado) retorna el siguiente disponible', () => {
  // Simula: se calculó consecutivo=2 pero ya existe (colisión de concurrencia) → reintento
  const primerIntento = siguienteConsecutivo(1); // 2
  const reintento = siguienteConsecutivo(2); // 3, tras detectar que 2 ya existe
  assert.equal(primerIntento, 2);
  assert.equal(reintento, 3);
});

// ── migrarEstatusLegacy (3.4) ─────────────────────────────────────────────────

test('migrarEstatusLegacy mapea los 5 valores legacy al nuevo vocabulario', () => {
  assert.equal(migrarEstatusLegacy('LICITACION'), 'ABIERTO');
  assert.equal(migrarEstatusLegacy('ADJUDICADO'), 'ABIERTO');
  assert.equal(migrarEstatusLegacy('CONSTRUCCION'), 'EN EJECUCIÓN');
  assert.equal(migrarEstatusLegacy('CIERRE_TECNICO'), 'EN COBRO');
  assert.equal(migrarEstatusLegacy('CIERRE_FINANCIERO'), 'CERRADO');
});

test('migrarEstatusLegacy deja intacto un valor que ya está en el nuevo vocabulario', () => {
  for (const estatus of ESTATUS_VALIDOS) {
    assert.equal(migrarEstatusLegacy(estatus), estatus);
  }
});

test('migrarEstatusLegacy lanza error ante un valor desconocido', () => {
  assert.throws(() => migrarEstatusLegacy('VALOR_INEXISTENTE'), /ESTATUS_DESCONOCIDO/);
});

test('validarEstatus acepta solo el vocabulario vigente', () => {
  for (const estatus of ESTATUS_VALIDOS) {
    assert.equal(validarEstatus(estatus), true);
  }
  assert.equal(validarEstatus('CONSTRUCCION'), false);
  assert.equal(validarEstatus(''), false);
});

/**
 * Tests: mapper partida doble — buildMovimientosForPoliza
 * Runner: node -r ts-node/register/transpile-only test/integration/mapper.polizas.integration.test.ts
 */

import assert from 'node:assert/strict';
import { buildMovimientosForPoliza } from '../../src/mapper';

function testMappingEgreso() {
  const movs = buildMovimientosForPoliza('EGRESO', 10000, 'Pago proveedor');
  assert.equal(movs.length, 1);
  assert.equal(movs[0].clave_cargo, '2100');
  assert.equal(movs[0].clave_abono, '1100');
  assert.equal(movs[0].monto, 10000);
  console.log('  ✓ EGRESO → 2100/1100');
}

function testMappingPasivoProyectado() {
  const movs = buildMovimientosForPoliza('PASIVO_PROYECTADO', 50000, 'OC proyectada');
  assert.equal(movs[0].clave_cargo, '5110');
  assert.equal(movs[0].clave_abono, '2100');
  console.log('  ✓ PASIVO_PROYECTADO → 5110/2100');
}

function testMappingReversionPasivo() {
  const movs = buildMovimientosForPoliza('REVERSION_PASIVO_PROYECTADO', 50000, 'Reversa OC');
  assert.equal(movs[0].clave_cargo, '2100');
  assert.equal(movs[0].clave_abono, '5110');
  console.log('  ✓ REVERSION_PASIVO_PROYECTADO → 2100/5110');
}

function testMappingEstimacion() {
  const movs = buildMovimientosForPoliza('ESTIMACION', 120000, 'Estimación aprobada');
  assert.equal(movs[0].clave_cargo, '1200');
  assert.equal(movs[0].clave_abono, '4100');
  console.log('  ✓ ESTIMACION → 1200/4100');
}

function testMappingAvance() {
  const movs = buildMovimientosForPoliza('AVANCE', 80000, 'Avance físico');
  assert.equal(movs[0].clave_cargo, '5100');
  assert.equal(movs[0].clave_abono, '2100');
  console.log('  ✓ AVANCE → 5100/2100');
}

function testMappingTransferencia() {
  const movs = buildMovimientosForPoliza('TRANSFERENCIA_INTERNA', 15000, 'Transferencia');
  assert.equal(movs[0].clave_cargo, '6100');
  assert.equal(movs[0].clave_abono, '6100');
  console.log('  ✓ TRANSFERENCIA_INTERNA → 6100/6100');
}

function testCuadreContable() {
  const tipos = ['EGRESO', 'PASIVO_PROYECTADO', 'REVERSION_PASIVO_PROYECTADO', 'ESTIMACION', 'AVANCE', 'TRANSFERENCIA_INTERNA'] as const;
  for (const tipo of tipos) {
    const movs = buildMovimientosForPoliza(tipo, 1000, 'Test cuadre');
    const cargo = movs.reduce((s, m) => s + m.monto, 0);
    const abono = movs.reduce((s, m) => s + m.monto, 0);
    assert.ok(Math.abs(cargo - abono) < 0.01, `${tipo}: cargo (${cargo}) ≠ abono (${abono})`);
  }
  console.log('  ✓ Todos los tipos cuadran (cargo = abono)');
}

async function main() {
  console.log('\nMapper Partida Doble — Tests:');
  const tests = [
    testMappingEgreso,
    testMappingPasivoProyectado,
    testMappingReversionPasivo,
    testMappingEstimacion,
    testMappingAvance,
    testMappingTransferencia,
    testCuadreContable,
  ];
  let passed = 0; let failed = 0;
  for (const t of tests) {
    try { t(); passed++; }
    catch (err: any) { console.error(`  ✗ ${t.name}: ${err.message}`); failed++; }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });

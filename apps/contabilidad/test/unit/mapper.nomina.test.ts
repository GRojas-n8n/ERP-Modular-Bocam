import assert from 'node:assert/strict';
import { buildMovimientosForPoliza } from '../../src/mapper';

function main() {
  // MANO_OBRA: cargo 5100 (Costos Directos) / abono 2200 (Nómina por Pagar)
  const nominaMovs = buildMovimientosForPoliza('MANO_OBRA', 62500, 'Nómina S22 — 15 empleados');
  assert.equal(nominaMovs.length, 1);
  assert.equal(nominaMovs[0]!.clave_cargo, '5100');
  assert.equal(nominaMovs[0]!.clave_abono, '2200');
  assert.equal(nominaMovs[0]!.monto, 62500);
  const sumaCargoNomina = nominaMovs.reduce((s, m) => s + m.monto, 0);
  const sumaAbonoNomina = nominaMovs.reduce((s, m) => s + m.monto, 0);
  assert.equal(sumaCargoNomina, sumaAbonoNomina, 'MANO_OBRA cuadra');
  console.log('ok 1 - MANO_OBRA: 5100 cargo / 2200 abono, cuadrado');

  // PAGO_NOMINA: cargo 2200 (Nómina por Pagar) / abono 1100 (Bancos)
  const pagoMovs = buildMovimientosForPoliza('PAGO_NOMINA', 62500, 'Pago nómina S22');
  assert.equal(pagoMovs.length, 1);
  assert.equal(pagoMovs[0]!.clave_cargo, '2200');
  assert.equal(pagoMovs[0]!.clave_abono, '1100');
  assert.equal(pagoMovs[0]!.monto, 62500);
  const sumaCargoPage = pagoMovs.reduce((s, m) => s + m.monto, 0);
  const sumaAbonoPago = pagoMovs.reduce((s, m) => s + m.monto, 0);
  assert.equal(sumaCargoPage, sumaAbonoPago, 'PAGO_NOMINA cuadra');
  console.log('ok 2 - PAGO_NOMINA: 2200 cargo / 1100 abono, cuadrado');

  // Ciclo contable: MANO_OBRA abre pasivo, PAGO_NOMINA lo cierra
  // 5100 débito (gasto reconocido) ← MANO_OBRA
  // 2200 crédito (pasivo creado)   ← MANO_OBRA
  // 2200 débito  (pasivo cancelado) ← PAGO_NOMINA
  // 1100 crédito (salida banco)    ← PAGO_NOMINA
  assert.equal(nominaMovs[0]!.clave_abono, pagoMovs[0]!.clave_cargo,
    'La cuenta abonada en MANO_OBRA (2200) es la que se carga en PAGO_NOMINA — ciclo cierra');
  console.log('ok 3 - ciclo cierra: 2200 pasivo abierto en MANO_OBRA y cerrado en PAGO_NOMINA');

  console.log('ok - mapper nomina: MANO_OBRA + PAGO_NOMINA cuadran y cierran ciclo');
}

try {
  main();
} catch (e) {
  console.error('not ok - mapper nomina');
  console.error(e);
  process.exitCode = 1;
}

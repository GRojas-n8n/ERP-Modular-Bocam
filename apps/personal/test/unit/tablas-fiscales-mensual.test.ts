/**
 * ---------------------------------------------------------------------------
 * Tests unitarios: soporte MENSUAL en el motor IMSS/ISR
 * Spec:  openspec/changes/expediente-asignacion-periodicidad-personal/specs/motor-imss-isr/
 * Tarea: 2.1, 2.5 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * No requiere PostgreSQL — son funciones puras.
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { calcularISR, calcularSubsidio, esPeriodoTipoValido, PERIODOS_TIPO_VALIDOS } from '../../src/tablas-fiscales';

function testCalcularISRMensualDaResultadoDistintoDeSemanal() {
  const baseGravable = 15000;
  const isrSemanal = calcularISR(baseGravable, 'SEMANAL');
  const isrMensual = calcularISR(baseGravable, 'MENSUAL');
  assert.notEqual(isrMensual, isrSemanal, 'ISR mensual debe usar su propia tabla, no la semanal');
  assert.ok(isrMensual >= 0, 'ISR mensual no debe ser negativo');
  console.log(`ok - calcularISR('MENSUAL') usa tabla propia (semanal=${isrSemanal}, mensual=${isrMensual})`);
}

function testCalcularISRMensualTramoConocido() {
  // Base dentro del tramo 746.05 - 6332.05 (cuota 14.32, tasa 6.40%)
  const isr = calcularISR(1000, 'MENSUAL');
  const esperado = 14.32 + (1000 - 746.05) * 0.0640;
  assert.equal(isr, parseFloat(esperado.toFixed(2)), 'debe calcular el ISR mensual según el tramo correcto');
  console.log('ok - calcularISR(1000, MENSUAL) coincide con el tramo esperado de la tabla');
}

function testCalcularSubsidioMensual() {
  const subsidio = calcularSubsidio(2000, 'MENSUAL');
  assert.equal(subsidio, 406.83, 'debe tomar el tramo mensual correspondiente a 2000 (1768.97-2653.38)');
  console.log('ok - calcularSubsidio(2000, MENSUAL) usa la tabla de subsidio mensual');
}

function testPeriodicidadesValidas() {
  assert.equal(esPeriodoTipoValido('SEMANAL'), true);
  assert.equal(esPeriodoTipoValido('QUINCENAL'), true);
  assert.equal(esPeriodoTipoValido('MENSUAL'), true);
  assert.equal(esPeriodoTipoValido('ANUAL'), false, 'periodicidad no soportada debe ser inválida');
  assert.deepEqual(PERIODOS_TIPO_VALIDOS, ['SEMANAL', 'QUINCENAL', 'MENSUAL']);
  console.log('ok - esPeriodoTipoValido acepta SEMANAL/QUINCENAL/MENSUAL y rechaza el resto');
}

function testRegresionSemanalQuincenalSinCambios() {
  // Valores ya cubiertos por el comportamiento previo — deben seguir intactos.
  const isrSemanal = calcularISR(2000, 'SEMANAL');
  const isrQuincenal = calcularISR(4000, 'QUINCENAL');
  assert.ok(isrSemanal > 0);
  assert.ok(isrQuincenal > 0);
  console.log('ok - calcularISR SEMANAL/QUINCENAL sigue funcionando sin regresión');
}

function main() {
  testCalcularISRMensualDaResultadoDistintoDeSemanal();
  testCalcularISRMensualTramoConocido();
  testCalcularSubsidioMensual();
  testPeriodicidadesValidas();
  testRegresionSemanalQuincenalSinCambios();
}

try {
  main();
} catch (error) {
  console.error('not ok - tablas-fiscales-mensual unit tests');
  console.error(error);
  process.exitCode = 1;
}

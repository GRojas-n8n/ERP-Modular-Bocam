process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

import assert from 'node:assert/strict';

async function testColisionConversacionIdEntreTenants(): Promise<void> {
  const { getConversacion, guardarTurno } = await import('../../src/session-store');

  const conversacionIdColisionada = 'colision-forzada-0000-0000-000000000001';
  const tenantA = `tenant-a-${Date.now()}`;
  const tenantB = `tenant-b-${Date.now()}`;

  await guardarTurno(tenantA, conversacionIdColisionada, [
    { role: 'user', content: 'Mensaje secreto del tenant A' },
  ]);

  const historialTenantB = await getConversacion(tenantB, conversacionIdColisionada);
  assert.equal(historialTenantB, null, 'El tenant B no debe ver el historial del tenant A aunque el conversacion_id coincida');

  const historialTenantA = await getConversacion(tenantA, conversacionIdColisionada);
  assert.ok(historialTenantA, 'El tenant A sí debe recuperar su propio historial');
  assert.equal(historialTenantA?.[0]?.content, 'Mensaje secreto del tenant A');

  console.log('ok - colision de conversacion_id entre tenants no comparte historial');
}

async function testConversacionInexistenteDevuelveNull(): Promise<void> {
  const { getConversacion } = await import('../../src/session-store');
  const resultado = await getConversacion('tenant-x', 'no-existe-0000-0000-000000000000');
  assert.equal(resultado, null);
  console.log('ok - conversacion inexistente devuelve null');
}

async function main() {
  await testColisionConversacionIdEntreTenants();
  await testConversacionInexistenteDevuelveNull();
  process.exit(0);
}

main().catch((err) => {
  console.error('not ok -', err);
  process.exit(1);
});

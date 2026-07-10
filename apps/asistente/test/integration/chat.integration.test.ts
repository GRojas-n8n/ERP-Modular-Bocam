// Estas pruebas llaman a la API real de Claude (modelo claude-fable-5) — no son
// deterministas ni gratis. Ver openspec/changes/asistente-ia-agente-conversacional
// tasks 8.1-8.3, 5.3 (requieren el loop de tool-use real) y 8.4/8.5 (aislamiento
// y rate limit, minimizados para no depender de respuestas de Claude).
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-chat-it';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.COMPRAS_URL = 'http://127.0.0.1:9501/api/v1/compras';
process.env.FINANZAS_URL = 'http://127.0.0.1:9502/api/v1/finanzas';
process.env.CONTROL_OBRA_URL = 'http://127.0.0.1:9503/api/v1/control-obra';
process.env.PERSONAL_URL = 'http://127.0.0.1:9504/api/v1/personal';
process.env.SEGURIDAD_URL = 'http://127.0.0.1:9505/api/v1/seguridad';
process.env.CALIDAD_URL = 'http://127.0.0.1:9506/api/v1/calidad';
process.env.GERENCIA_TECNICA_URL = 'http://127.0.0.1:9507/api/v1/gerencia-tecnica';

import assert from 'node:assert/strict';
import express from 'express';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

async function fakeService(port: number, path: string, data: unknown): Promise<Server> {
  const app = express();
  app.get(path, (_req, res) => res.json({ success: true, data }));
  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

async function testCombinarDosServicios(baseUrl: string, token: string): Promise<void> {
  const resp = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ mensaje: '¿cómo va el avance físico y el presupuesto ejercido de la obra?' }),
  });
  const json = await resp.json();

  assert.equal(resp.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.parcial, false);
  assert.match(json.data.respuesta, /6[0-9]%|62/); // avance_pct: 62
  assert.match(json.data.respuesta, /3,?200,?000|3\.2/i); // monto_ejercido

  console.log('ok - 8.1 pregunta combinando 2 servicios responde con datos consolidados de ambos');
}

async function testFueraDeDominio(baseUrl: string, token: string): Promise<void> {
  const resp = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ mensaje: '¿cuál es la capital de Francia?' }),
  });
  const json = await resp.json();

  assert.equal(resp.status, 200);
  assert.equal(json.data.parcial, false);
  assert.deepEqual(json.data.servicios_fallidos, []);
  assert.match(json.data.respuesta.toLowerCase(), /erp|operativ/);

  console.log('ok - 8.2 pregunta fuera de dominio responde sin invocar tools');
}

async function testContextoEntreTurnos(baseUrl: string, token: string): Promise<void> {
  const resp1 = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ mensaje: '¿cuál es el presupuesto ejercido de la obra?' }),
  });
  const json1 = await resp1.json();
  assert.equal(resp1.status, 200);

  const resp2 = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mensaje: '¿y a cuánto asciende el presupuesto total autorizado?',
      conversacion_id: json1.data.conversacion_id,
    }),
  });
  const json2 = await resp2.json();

  assert.equal(resp2.status, 200);
  assert.equal(json2.data.conversacion_id, json1.data.conversacion_id);
  assert.match(json2.data.respuesta, /5,?000,?000|5\.0? ?m/i); // presupuesto_autorizado

  console.log('ok - 8.3 segundo mensaje usa el contexto del primero en la misma conversacion_id');
}

async function testAislamientoMultiTenant(baseUrl: string): Promise<void> {
  const tokenTenantA = signTenantToken({
    userId: 'user-a', tenantId: `tenant-a-${Date.now()}`, proyectoId: 'proy-a', roles: ['admin'],
  });
  const tokenTenantB = signTenantToken({
    userId: 'user-b', tenantId: `tenant-b-${Date.now()}`, proyectoId: 'proy-b', roles: ['admin'],
  });

  const respA = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tokenTenantA}` },
    body: JSON.stringify({ mensaje: 'Recuerda esta palabra clave para más adelante: MURCIELAGO47' }),
  });
  const jsonA = await respA.json();
  assert.equal(respA.status, 200);

  const respB = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tokenTenantB}` },
    body: JSON.stringify({
      mensaje: '¿cuál era la palabra clave que te pedí recordar hace un momento?',
      conversacion_id: jsonA.data.conversacion_id, // mismo conversacion_id, tenant distinto
    }),
  });
  const jsonB = await respB.json();

  assert.equal(respB.status, 200);
  assert.ok(
    !jsonB.data.respuesta.includes('MURCIELAGO47'),
    'El tenant B no debe poder continuar ni leer el historial del tenant A aunque reutilice su conversacion_id',
  );

  console.log('ok - 8.4 conversacion_id de un tenant no es continuable desde otro tenant');
}

async function testRateLimitSinLlamarClaude(baseUrl: string): Promise<void> {
  const token = signTenantToken({
    userId: 'user-rl', tenantId: `tenant-rl-${Date.now()}`, proyectoId: 'proy-rl', roles: ['admin'],
  });

  // 20 requests inválidas (sin `mensaje`) — cada una cuenta para el rate
  // limiter pero responde 400 en el propio handler ANTES de llamar a Claude.
  for (let i = 0; i < 20; i++) {
    const resp = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    assert.equal(resp.status, 400, `request ${i + 1}/20 debía fallar validación (400), no rate limit`);
  }

  // La 21ª debe ser rechazada por el rate limiter (429) antes de llegar al handler.
  const resp21 = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
  assert.equal(resp21.status, 429);

  console.log('ok - 8.5 tenant que excede 20 mensajes/15min recibe 429 sin llegar a invocar Claude');
}

async function testAuditoriaAntesDeResponder(baseUrl: string, token: string): Promise<void> {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '));
    originalLog(...args);
  };

  try {
    const resp = await fetch(`${baseUrl}/api/v1/asistente/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ mensaje: '¿cuál es el avance físico de la obra?' }),
    });
    assert.equal(resp.status, 200);
  } finally {
    console.log = originalLog;
  }

  const huboAuditoria = logs.some((l) => l.includes('asistente.chat.ok') || l.includes('asistente.chat.sin-tools'));
  assert.ok(huboAuditoria, 'El evento de auditoría debe emitirse (vía console.log síncrono) antes de que el handler termine de responder');

  console.log('ok - 5.3 el evento de auditoría se emite antes de devolver la respuesta al usuario');
}

async function main() {
  await fakeService(9502, '/api/v1/finanzas/dashboard', {
    presupuesto_autorizado: 5000000,
    monto_ejercido: 3200000,
  });
  await fakeService(9503, '/api/v1/control-obra/resumen-dashboard', {
    avance_pct: 62,
  });

  const { app } = await import('../../src/main');
  const { server, baseUrl } = await startHttpApp(app);

  const token = signTenantToken({
    userId: 'user-it', tenantId: `tenant-it-${Date.now()}`, proyectoId: 'proy-it', roles: ['admin'],
  });

  try {
    await testCombinarDosServicios(baseUrl, token);
    await testFueraDeDominio(baseUrl, token);
    await testContextoEntreTurnos(baseUrl, token);
    await testAislamientoMultiTenant(baseUrl);
    await testAuditoriaAntesDeResponder(baseUrl, token);
    await testRateLimitSinLlamarClaude(baseUrl);
  } finally {
    await stopHttpApp(server);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('not ok -', err);
  process.exit(1);
});

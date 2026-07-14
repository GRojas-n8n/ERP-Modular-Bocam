/**
 * Tests de Integración: comportamiento de subida de PDF en leer-cotizacion (multer)
 * Spec:  openspec/changes/actualizar-multer-v2-seguridad/
 * Tarea: 1.5 del tasks.md — fija el comportamiento actual (multer 1.x) que la
 * actualización a 2.x NO debe alterar (ver specs/carga-archivos-multer).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * No requiere: PostgreSQL ni RabbitMQ (asistente no usa BD) ni la API real de
 * Anthropic — se levanta un mock HTTP local y se apunta el SDK vía
 * ANTHROPIC_BASE_URL (el SDK lo lee de env cuando el cliente no pasa baseURL).
 * El mock captura el body recibido, lo que permite verificar que el PDF válido
 * llegó como req.file.buffer (memoryStorage): el base64 dentro del request a la
 * API debe ser exactamente los bytes subidos, sin pasar por disco.
 */

process.env.JWT_SECRET        = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-fake-key-multer-it';
process.env.REDIS_URL         = process.env.REDIS_URL || 'redis://localhost:6379';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const LIMIT_BYTES = 10 * 1024 * 1024; // límite hardcodeado del endpoint (10 MB)

let server: Server | undefined;
let baseUrl = '';

// ── Mock local de la API de Anthropic ────────────────────────────────────────
let anthropicMock: Server | undefined;
let capturedBodies: any[] = [];

async function startAnthropicMock(): Promise<void> {
  const mock = express();
  mock.use(express.json({ limit: '50mb' }));
  mock.post('/v1/messages', (req, res) => {
    capturedBodies.push(req.body);
    res.json({
      id: 'msg_mock_multer_it',
      type: 'message',
      role: 'assistant',
      model: 'claude-sonnet-4-6',
      content: [{ type: 'text', text: '{"renglones":[]}' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 1, output_tokens: 1 },
    });
  });
  anthropicMock = await new Promise<Server>((resolve) => {
    const s = mock.listen(0, () => resolve(s));
  });
  const port = (anthropicMock.address() as AddressInfo).port;
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
}

async function setup() {
  await startAnthropicMock();
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await stopHttpApp(anthropicMock);
}

function token() {
  return signTenantToken({
    userId: randomUUID(),
    tenantId: randomUUID(), // tenant distinto por request → no roza el rate limit (10/15min)
    proyectoId: randomUUID(),
    roles: ['procurement'],
  });
}

function postCotizacion(bytes: Uint8Array, filename: string, mime: string) {
  const form = new FormData();
  form.append('cotizacion', new Blob([bytes], { type: mime }), filename);
  form.append('proveedor_nombre', 'Proveedor Prueba Multer');
  return fetch(`${baseUrl}/api/v1/asistente/leer-cotizacion`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
    body: form,
  });
}

// multer 1.x con diskStorage escribe archivos temporales de 32 hex chars sin
// extensión en os.tmpdir(); memoryStorage no debe crear ninguno.
function snapshotMulterTmpFiles(): Set<string> {
  return new Set(fs.readdirSync(os.tmpdir()).filter((f) => /^[a-f0-9]{32}$/.test(f)));
}

// ── 1: PDF válido → 200, buffer en memoria (no disco) ──

async function testPdfValidoBufferEnMemoria() {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3]);
  capturedBodies = [];
  const tmpBefore = snapshotMulterTmpFiles();

  const r = await postCotizacion(bytes, 'cotizacion.pdf', 'application/pdf');
  assert.equal(r.status, 200, 'PDF válido debe aceptarse (200)');
  const body = await r.json() as any;
  assert.equal(body.success, true);
  assert.deepEqual(body.data, { renglones: [] });

  // El buffer completo debe haber llegado al request de la API tal cual
  // (req.file.buffer → base64), lo que prueba memoryStorage vivo:
  assert.equal(capturedBodies.length, 1, 'la API de IA debe recibir exactamente 1 request');
  const doc = capturedBodies[0].messages[0].content.find((c: any) => c.type === 'document');
  assert.ok(doc, 'el request a la API debe incluir el documento PDF');
  assert.equal(doc.source.type, 'base64');
  assert.equal(doc.source.media_type, 'application/pdf');
  assert.equal(doc.source.data, Buffer.from(bytes).toString('base64'),
    'el base64 enviado a la API debe ser exactamente los bytes subidos (req.file.buffer)');

  const tmpAfter = snapshotMulterTmpFiles();
  const nuevos = [...tmpAfter].filter((f) => !tmpBefore.has(f));
  assert.deepEqual(nuevos, [], 'memoryStorage no debe escribir archivos temporales de multer a disco');

  console.log('ok - PDF válido sube con éxito y queda como req.file.buffer sin escribir a disco (asistente)');
}

// ── 2: tipo no permitido (no-PDF) → 400, sin llamar a la API ──

async function testTipoNoPermitido() {
  const bytes = new Uint8Array([0x4d, 0x5a]);
  capturedBodies = [];

  const r = await postCotizacion(bytes, 'malicioso.exe', 'application/octet-stream');
  assert.equal(r.status, 400, 'mimetype no-PDF debe rechazarse (400)');
  const body = await r.json() as any;
  assert.equal(body.success, false);
  assert.match(body.message, /Solo se aceptan archivos PDF/);
  assert.equal(capturedBodies.length, 0, 'el archivo rechazado no debe llegar a la API de IA');

  console.log('ok - tipo no permitido (no-PDF) se rechaza sin llamar a la API (asistente)');
}

// ── 3: archivo que excede el límite de 10 MB → 413, sin llamar a la API ──

async function testExcedeLimiteTamano() {
  const bytes = new Uint8Array(LIMIT_BYTES + 1024);
  bytes.set([0x25, 0x50, 0x44, 0x46]); // magic bytes de PDF, el límite se evalúa por tamaño
  capturedBodies = [];

  const r = await postCotizacion(bytes, 'grande.pdf', 'application/pdf');
  assert.equal(r.status, 413, 'archivo que excede 10 MB debe rechazarse (413, LIMIT_FILE_SIZE)');
  const body = await r.json() as any;
  assert.equal(body.success, false);
  assert.match(body.message, /supera el límite de 10 MB/);
  assert.equal(capturedBodies.length, 0, 'el archivo que excede el límite no debe llegar a la API de IA');

  console.log('ok - archivo que excede el límite de tamaño se rechaza sin llamar a la API (asistente)');
}

async function main() {
  await setup();
  try {
    await testPdfValidoBufferEnMemoria();
    await testTipoNoPermitido();
    await testExcedeLimiteTamano();
  } finally {
    await teardown();
  }
}

// El router de chat (importado por main.ts) puede dejar clientes con
// reconexión activa manteniendo vivo el event loop — salida explícita.
void main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('not ok - leer-cotizacion-upload-multer integration tests');
    console.error(error);
    process.exit(1);
  });

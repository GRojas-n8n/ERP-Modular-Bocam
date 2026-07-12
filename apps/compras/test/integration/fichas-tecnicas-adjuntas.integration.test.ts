/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: resolveFichasTecnicasAdjuntas — adjuntos de fichas
 * técnicas para el correo de Solicitud de Cotización
 * Spec:  openspec/changes/adjuntos-requisicion-invitacion-cotizar/
 * Tareas: 2.1-2.3 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * No requiere PostgreSQL — stub HTTP local en vez de Gerencia Técnica real.
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { resolveFichasTecnicasAdjuntas } from '../../src/fichas-tecnicas-adjuntas';

let gtServer: Server | undefined;
let gtBaseUrl = '';

async function stopGt() {
  await stopHttpApp(gtServer);
  gtServer = undefined;
}

// ── Test 2.1: fichas existentes se resuelven como adjuntos con nombre y bytes correctos ──

async function testFichasExistentesSeResuelvenComoAdjuntos() {
  const insumoId = randomUUID();
  const fichaId = randomUUID();
  const contenido = Buffer.from('%PDF-1.4 contenido de prueba');

  const gtStub = express();
  gtStub.get(`/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas`, (_req, res) => {
    res.json({ success: true, data: [{ id_ficha: fichaId, nombre_doc: 'ficha-prueba.pdf', mime_type: 'application/pdf' }] });
  });
  gtStub.get(`/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas/${fichaId}/descargar`, (_req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.send(contenido);
  });
  const started = await startHttpApp(gtStub);
  gtServer = started.server;
  gtBaseUrl = `${started.baseUrl}/api/v1/gerencia-tecnica`;

  try {
    const adjuntos = await resolveFichasTecnicasAdjuntas({
      gtUrl: gtBaseUrl,
      insumoIds: [insumoId],
    });

    assert.equal(adjuntos.length, 1);
    assert.equal(adjuntos[0].filename, 'ficha-prueba.pdf');
    assert.equal(adjuntos[0].contentType, 'application/pdf');
    assert.ok(adjuntos[0].content.equals(contenido), 'el contenido del adjunto debe coincidir con los bytes descargados');

    console.log('ok - 2.1 fichas existentes se resuelven como adjuntos con nombre y bytes correctos');
  } finally {
    await stopGt();
  }
}

// ── Test 2.2: GT caído no bloquea — retorna lista vacía ──

async function testGtCaidoNoBloquea() {
  const insumoId = randomUUID();
  // No se levanta ningún stub — gtBaseUrl apunta a un puerto sin servidor.
  const adjuntos = await resolveFichasTecnicasAdjuntas({
    gtUrl: 'http://127.0.0.1:1/api/v1/gerencia-tecnica',
    insumoIds: [insumoId],
    timeoutMs: 500,
  });

  assert.deepEqual(adjuntos, []);
  console.log('ok - 2.2 GT caído no bloquea — resolveFichasTecnicasAdjuntas retorna []');
}

// ── Test 2.3: insumo sin ninguna ficha técnica no agrega adjuntos ──

async function testInsumoSinFichasNoAgregaAdjuntos() {
  const insumoId = randomUUID();

  const gtStub = express();
  gtStub.get(`/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas`, (_req, res) => {
    res.json({ success: true, data: [] });
  });
  const started = await startHttpApp(gtStub);
  gtServer = started.server;
  gtBaseUrl = `${started.baseUrl}/api/v1/gerencia-tecnica`;

  try {
    const adjuntos = await resolveFichasTecnicasAdjuntas({
      gtUrl: gtBaseUrl,
      insumoIds: [insumoId],
    });

    assert.deepEqual(adjuntos, []);
    console.log('ok - 2.3 insumo sin ninguna ficha técnica no agrega adjuntos');
  } finally {
    await stopGt();
  }
}

// ── Test 2.4: GT caído con varios insumos no escala linealmente (paralelo) ──
// Regresión del hallazgo de code review en PR #43: la versión original
// resolvía insumo por insumo de forma secuencial, por lo que con GT caído
// el tiempo total era insumoIds.length * timeoutMs — contradiciendo el
// spec ("el envío no se bloquea"). Con 5 insumos y timeout de 300ms, la
// versión secuencial tardaría >=1500ms; en paralelo debe tardar ~300ms.

async function testGtCaidoConVariosInsumosNoEscalaLinealmente() {
  const insumoIds = Array.from({ length: 5 }, () => randomUUID());
  const timeoutMs = 300;

  const inicio = Date.now();
  const adjuntos = await resolveFichasTecnicasAdjuntas({
    gtUrl: 'http://127.0.0.1:1/api/v1/gerencia-tecnica',
    insumoIds,
    timeoutMs,
  });
  const duracionMs = Date.now() - inicio;

  assert.deepEqual(adjuntos, []);
  assert.ok(
    duracionMs < timeoutMs * insumoIds.length,
    `con ${insumoIds.length} insumos y timeout ${timeoutMs}ms, la resolución en paralelo debe tardar mucho menos que ${timeoutMs * insumoIds.length}ms secuencial (tardó ${duracionMs}ms)`,
  );

  console.log(`ok - 2.4 GT caído con ${insumoIds.length} insumos no escala linealmente (tardó ${duracionMs}ms, no ~${timeoutMs * insumoIds.length}ms)`);
}

async function main() {
  try {
    await testFichasExistentesSeResuelvenComoAdjuntos();          // 2.1
    await testGtCaidoNoBloquea();                                   // 2.2
    await testInsumoSinFichasNoAgregaAdjuntos();                    // 2.3
    await testGtCaidoConVariosInsumosNoEscalaLinealmente();         // 2.4
  } finally {
    await stopGt();
  }
}

void main().catch((error) => {
  console.error('not ok - fichas-tecnicas-adjuntas integration tests');
  console.error(error);
  process.exitCode = 1;
});

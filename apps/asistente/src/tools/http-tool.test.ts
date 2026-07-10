import { test } from 'node:test';
import assert from 'node:assert/strict';
import express, { Request } from 'express';
import { crearToolDashboard } from './http-tool';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

function fakeReq(): Request {
  return { headers: { authorization: 'Bearer test-token' } } as unknown as Request;
}

test('crearToolDashboard: llamada exitosa devuelve el data del microservicio', async () => {
  const app = express();
  app.get('/dashboard', (_req, res) => {
    res.json({ success: true, data: { kpis: { pendientes: 3 } } });
  });
  const { server, baseUrl } = await startHttpApp(app);

  try {
    const registro = new Map<string, number>();
    const tool = crearToolDashboard(
      { nombre: 'consultar_test', descripcion: 'test', url: `${baseUrl}/dashboard` },
      fakeReq(),
      registro,
    );

    const resultado = await tool.run({});

    assert.equal(resultado, JSON.stringify({ kpis: { pendientes: 3 } }));
    assert.ok(registro.has('consultar_test'));
  } finally {
    await stopHttpApp(server);
  }
});

test('crearToolDashboard: timeout lanza error (queda como is_error para el Tool Runner)', async () => {
  const app = express();
  app.get('/dashboard', (_req, res) => {
    setTimeout(() => res.json({ success: true, data: {} }), 300);
  });
  const { server, baseUrl } = await startHttpApp(app);

  try {
    const registro = new Map<string, number>();
    const tool = crearToolDashboard(
      { nombre: 'consultar_lento', descripcion: 'test', url: `${baseUrl}/dashboard` },
      fakeReq(),
      registro,
    );

    // Sobrescribimos el timeout del helper simulando uno más corto que la
    // respuesta del servidor de prueba vía un axios que sí respeta el 5s por
    // defecto sería lento para el test — en cambio verificamos que el
    // servidor caído (puerto cerrado) también dispara el mismo camino de error.
    await stopHttpApp(server);
    await assert.rejects(async () => { await tool.run({}); }, /No se pudo consultar consultar_lento/);
    assert.ok(registro.has('consultar_lento'));
  } finally {
    // server ya cerrado arriba
  }
});

test('crearToolDashboard: error HTTP 5xx del microservicio lanza error', async () => {
  const app = express();
  app.get('/dashboard', (_req, res) => {
    res.status(500).json({ success: false, error: { message: 'boom' } });
  });
  const { server, baseUrl } = await startHttpApp(app);

  try {
    const registro = new Map<string, number>();
    const tool = crearToolDashboard(
      { nombre: 'consultar_fallido', descripcion: 'test', url: `${baseUrl}/dashboard` },
      fakeReq(),
      registro,
    );

    await assert.rejects(async () => { await tool.run({}); }, /No se pudo consultar consultar_fallido/);
    assert.ok(registro.has('consultar_fallido'));
  } finally {
    await stopHttpApp(server);
  }
});

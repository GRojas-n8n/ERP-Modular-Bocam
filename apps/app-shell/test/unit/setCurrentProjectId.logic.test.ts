/**
 * Tests unitarios: TenantContext — lógica de setCurrentProjectId
 *
 * Verifica el comportamiento de la función sin depender de React ni DOM.
 * La lógica bajo prueba (extraída de TenantContext.tsx):
 *
 *   async function setCurrentProjectId(projectId) {
 *     try {
 *       const result = await switchProjectApi(projectId);
 *       if (result?.data?.access_token) {
 *         setTokens(result.data.access_token, getRefreshToken());
 *       }
 *     } catch {
 *       return; // si falla el switch, NO se actualiza el estado
 *     }
 *     setState(prev => ({ ...prev, currentProjectId: projectId }));
 *   }
 *
 * Runner: node -r ts-node/register/transpile-only test/unit/setCurrentProjectId.logic.test.ts
 */

import assert from 'node:assert/strict';

// ── Extracción de la lógica a testear ────────────────────────────────────────

type SwitchResult = { data: { access_token: string } } | null;

async function runSetCurrentProjectId(opts: {
  projectId: string;
  switchProjectApi: (id: string) => Promise<SwitchResult>;
  setTokens: (token: string, refresh: string) => void;
  getRefreshToken: () => string;
  setState: (fn: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
}) {
  const { projectId, switchProjectApi, setTokens, getRefreshToken, setState } = opts;
  try {
    const result = await switchProjectApi(projectId);
    if (result?.data?.access_token) {
      setTokens(result.data.access_token, getRefreshToken());
    }
  } catch {
    return; // si el switch falla, no cambia currentProjectId
  }
  setState(prev => ({ ...prev, currentProjectId: projectId }));
}

// ── Test 4.1: switch fallido → currentProjectId NO cambia ────────────────────
async function testSwitchFallidoNoActualizaEstado() {
  const calls: string[] = [];
  let currentProjectId = 'proyecto-A';

  await runSetCurrentProjectId({
    projectId: 'proyecto-B',
    switchProjectApi: async () => { throw new Error('Network error'); },
    setTokens:        () => { calls.push('setTokens'); },
    getRefreshToken:  () => 'refresh-token',
    setState:         (fn) => {
      calls.push('setState');
      const next = fn({ currentProjectId });
      currentProjectId = next.currentProjectId as string;
    },
  });

  assert.equal(currentProjectId, 'proyecto-A', 'currentProjectId NO debe cambiar si el switch falla');
  assert.ok(!calls.includes('setTokens'), 'setTokens NO debe llamarse si el switch falla');
  assert.ok(!calls.includes('setState'),  'setState NO debe llamarse si el switch falla');

  console.log('  ✓ switch fallido → currentProjectId no cambia (no setState, no setTokens)');
}

// ── Test 4.2: switch exitoso → JWT actualizado ANTES que currentProjectId ─────
async function testJwtActualizadoAntesQueEstado() {
  const callOrder: string[] = [];
  let currentProjectId = 'proyecto-A';

  await runSetCurrentProjectId({
    projectId: 'proyecto-B',
    switchProjectApi: async () => ({
      data: { access_token: 'nuevo-jwt-proyecto-B' },
    }),
    setTokens: (token) => {
      callOrder.push('setTokens');
      assert.equal(token, 'nuevo-jwt-proyecto-B', 'setTokens recibe el nuevo JWT');
      // En este punto currentProjectId aún debe ser 'proyecto-A'
      assert.equal(currentProjectId, 'proyecto-A',
        'JWT se actualiza ANTES de que currentProjectId cambie');
    },
    getRefreshToken: () => 'refresh-token',
    setState: (fn) => {
      callOrder.push('setState');
      const next = fn({ currentProjectId });
      currentProjectId = next.currentProjectId as string;
    },
  });

  assert.equal(currentProjectId, 'proyecto-B', 'currentProjectId debe actualizarse a proyecto-B');
  assert.deepEqual(callOrder, ['setTokens', 'setState'],
    'setTokens debe llamarse ANTES que setState');

  console.log('  ✓ JWT actualizado antes que currentProjectId (orden: setTokens → setState)');
}

// ── Test 4.3: switch sin access_token → estado actualiza igualmente ───────────
async function testSwitchSinTokenActualizaEstado() {
  // Si la API devuelve éxito pero sin access_token, el estado sí debe actualizarse
  // (no hay razón para bloquear el switch si la respuesta fue exitosa)
  const calls: string[] = [];
  let currentProjectId = 'proyecto-A';

  await runSetCurrentProjectId({
    projectId: 'proyecto-B',
    switchProjectApi: async () => null, // respuesta vacía, no es un error
    setTokens: () => { calls.push('setTokens'); },
    getRefreshToken: () => 'refresh-token',
    setState: (fn) => {
      calls.push('setState');
      const next = fn({ currentProjectId });
      currentProjectId = next.currentProjectId as string;
    },
  });

  assert.equal(currentProjectId, 'proyecto-B',
    'Estado actualiza incluso si la respuesta no trae access_token');
  assert.ok(!calls.includes('setTokens'),
    'setTokens NO se llama si no hay access_token en la respuesta');
  assert.ok(calls.includes('setState'), 'setState sí se llama');

  console.log('  ✓ switch sin access_token → estado actualiza, setTokens no se llama');
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nsetCurrentProjectId — Tests de lógica (sin React):');
  const tests = [
    testSwitchFallidoNoActualizaEstado,
    testJwtActualizadoAntesQueEstado,
    testSwitchSinTokenActualizaEstado,
  ];
  let passed = 0;
  let failed = 0;
  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${test.name}: ${err.message}`);
      failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });

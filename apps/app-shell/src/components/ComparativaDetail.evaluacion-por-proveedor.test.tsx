import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fix-evaluacion-tecnica-por-proveedor. Reproduce el bug
 * real de producción (2026-07-13, usuario con rol residencia, cuadro con 3
 * proveedores): el panel de evaluación técnica simple solo permitía
 * capturar una decisión C/NC/DA/? por renglón, colapsando los 3 proveedores
 * a uno solo — el backend nunca recibía evaluación para los otros 2.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Residente de Prueba', role: ['residencia'] } }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

const patch = vi.fn((_url: string, _body: { evaluaciones: any[] }) => Promise.resolve({ data: { data: {} } }));
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: (url: string, body: { evaluaciones: any[] }) => patch(url, body),
  },
}));

const PROV_A = 'prov-1';
const PROV_B = 'prov-2';
const PROV_C = 'prov-3';

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_EVALUACION_TECNICA',
    revision: 'A',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [
      { id: PROV_A, nombre: 'Proveedor Uno' },
      { id: PROV_B, nombre: 'Proveedor Dos' },
      { id: PROV_C, nombre: 'Proveedor Tres' },
    ],
    lineas: [
      {
        id: 'linea-1',
        insumo_id: null,
        detalle_req_id: 'detreq-1',
        insumo_clave: '—',
        insumo_descripcion: 'Mini Split Inverter de 1 Tonelada',
        insumo_unidad: 'pza',
        cantidad: 1,
        precios: { [PROV_A]: '8500', [PROV_B]: '8700', [PROV_C]: '8600' },
        fechasEntrega: {},
        ganador: null,
        evaluacion_tecnica: 'PENDIENTE',
        evaluacionesPorProveedor: {
          [PROV_A]: { id_detalle: 'detalle-a', evaluacion_tecnica: 'PENDIENTE' },
          [PROV_B]: { id_detalle: 'detalle-b', evaluacion_tecnica: 'PENDIENTE' },
          [PROV_C]: { id_detalle: 'detalle-c', evaluacion_tecnica: 'PENDIENTE' },
        },
      } as any,
    ],
    lineas_detalle: [],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

async function abrirPanel() {
  fireEvent.click(await screen.findByRole('button', { name: /Registrar Evaluación Técnica/i }));
  await screen.findByText('Evaluación Técnica');
}

describe('ComparativaDetail — evaluación técnica por proveedor (panel simple)', () => {
  it('muestra un grupo de controles C/NC/DA/? por cada proveedor del renglón, no uno solo', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await abrirPanel();
    const panel = within(screen.getByTestId('eval-panel'));

    expect(panel.getByText('Proveedor Uno')).toBeInTheDocument();
    expect(panel.getByText('Proveedor Dos')).toBeInTheDocument();
    expect(panel.getByText('Proveedor Tres')).toBeInTheDocument();

    // Un grupo de botones C/NC/DA/? por proveedor -> 3 botones "C", no 1.
    expect(panel.getAllByRole('button', { name: 'C' })).toHaveLength(3);
    expect(panel.getAllByRole('button', { name: 'NC' })).toHaveLength(3);
  });

  it('al guardar, envía una evaluación por cada (renglón, proveedor) — 3 entradas, no 1', async () => {
    const onUpdate = vi.fn();
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="compras"
      />
    );

    await abrirPanel();

    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_A}-C`));
    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_B}-NC`));
    fireEvent.change(screen.getByTestId(`eval-comentario-linea-1-${PROV_B}`), { target: { value: 'No cumple voltaje requerido' } });
    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_C}-DA`));
    fireEvent.change(screen.getByTestId(`eval-comentario-linea-1-${PROV_C}`), { target: { value: 'Desviación aceptada por precio' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Evaluación/i }));

    await waitFor(() => expect(patch).toHaveBeenCalled());
    const body = patch.mock.calls.at(-1)![1];
    expect(body.evaluaciones).toHaveLength(3);
    expect(body.evaluaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({ detalle_id: 'detalle-a', evaluacion_tecnica: 'C' }),
      expect.objectContaining({ detalle_id: 'detalle-b', evaluacion_tecnica: 'NC', comentario_tecnico: 'No cumple voltaje requerido' }),
      expect.objectContaining({ detalle_id: 'detalle-c', evaluacion_tecnica: 'DA', comentario_tecnico: 'Desviación aceptada por precio' }),
    ]));
  });
});

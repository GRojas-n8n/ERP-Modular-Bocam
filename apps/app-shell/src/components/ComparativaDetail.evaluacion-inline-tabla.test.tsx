import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/evaluacion-tecnica-inline-tabla-comparativa. El
 * Residente pidió (2026-07-13, prueba real en producción) evaluar C/NC/DA/?
 * por proveedor directamente en "TABLA DE COTIZACIONES", sin abrir el modal
 * "Registrar Evaluación Técnica →" — mismo patrón que ya usa la matriz por
 * especificación (sub-fila siempre visible, alineada bajo cada columna de
 * proveedor).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Residente de Prueba', role: ['residencia'] } }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

const patch = vi.fn((_url: string, _body: { evaluaciones: any[] }) => Promise.resolve({ data: { data: {} } }));
const post = vi.fn((_url: string, _body: { evaluaciones: any[] }) => Promise.resolve({ data: { data: { revision_label: 'B' } } }));
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    post: (url: string, body: any) => post(url, body),
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: (url: string, body: any) => patch(url, body),
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

describe('ComparativaDetail — evaluación técnica inline en Tabla de Cotizaciones', () => {
  beforeEach(() => {
    patch.mockClear();
    post.mockClear();
  });

  it('muestra un bloque C/NC/DA/? por proveedor sin ningún clic previo, sin modal', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={true}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    // No hay botón de modal — la evaluación ya está visible.
    expect(screen.queryByRole('button', { name: /Registrar Evaluación Técnica/i })).not.toBeInTheDocument();

    // Un bloque por proveedor -> 3 botones "C", uno por cada uno de los 3 proveedores.
    expect(screen.getByTestId(`eval-btn-linea-1-${PROV_A}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`eval-btn-linea-1-${PROV_B}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`eval-btn-linea-1-${PROV_C}-C`)).toBeInTheDocument();
  });

  it('guardar una línea sin "?" (todas C/NC/DA) llama a PATCH /evaluar solo con esa línea', async () => {
    const onUpdate = vi.fn();
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_A}-C`));
    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_B}-NC`));
    fireEvent.change(screen.getByTestId(`eval-comentario-linea-1-${PROV_B}`), { target: { value: 'No cumple voltaje requerido' } });
    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_C}-DA`));
    fireEvent.change(screen.getByTestId(`eval-comentario-linea-1-${PROV_C}`), { target: { value: 'Desviación aceptada por precio' } });

    fireEvent.click(screen.getByTestId('eval-guardar-linea-linea-1'));

    await waitFor(() => expect(patch).toHaveBeenCalled());
    expect(post).not.toHaveBeenCalled();
    const body = patch.mock.calls.at(-1)![1];
    expect(body.evaluaciones).toHaveLength(3);
    expect(body.evaluaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({ detalle_id: 'detalle-a', evaluacion_tecnica: 'C' }),
      expect.objectContaining({ detalle_id: 'detalle-b', evaluacion_tecnica: 'NC', comentario_tecnico: 'No cumple voltaje requerido' }),
      expect.objectContaining({ detalle_id: 'detalle-c', evaluacion_tecnica: 'DA', comentario_tecnico: 'Desviación aceptada por precio' }),
    ]));
  });

  it('marcar "?" oculta el guardado individual de esa línea y muestra el botón agregado', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    expect(screen.getByTestId('eval-guardar-linea-linea-1')).toBeInTheDocument();
    expect(screen.queryByTestId('eval-guardar-agregado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_A}-?`));

    expect(screen.queryByTestId('eval-guardar-linea-linea-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('eval-guardar-agregado')).toBeInTheDocument();
  });

  it('el botón agregado envía en una sola llamada todas las evaluaciones pendientes de varias líneas', async () => {
    const comp = buildComparativa({
      lineas: [
        buildComparativa().lineas[0],
        {
          id: 'linea-2',
          insumo_id: null,
          detalle_req_id: 'detreq-2',
          insumo_clave: '—',
          insumo_descripcion: 'Cable THW calibre 12',
          insumo_unidad: 'm',
          cantidad: 100,
          precios: { [PROV_A]: '15' },
          fechasEntrega: {},
          ganador: null,
          evaluacion_tecnica: 'PENDIENTE',
          evaluacionesPorProveedor: {
            [PROV_A]: { id_detalle: 'detalle-d', evaluacion_tecnica: 'PENDIENTE' },
          },
        } as any,
      ],
    });

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={comp}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="residente"
      />
    );

    await waitFor(() => expect(screen.getByText('Cable THW calibre 12')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_A}-C`));
    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_B}-?`));
    fireEvent.change(screen.getByTestId(`eval-pregunta-linea-1-${PROV_B}`), { target: { value: '¿Qué marca ofrece?' } });
    fireEvent.click(screen.getByTestId(`eval-btn-linea-1-${PROV_C}-C`));
    fireEvent.click(screen.getByTestId(`eval-btn-linea-2-${PROV_A}-?`));
    fireEvent.change(screen.getByTestId(`eval-pregunta-linea-2-${PROV_A}`), { target: { value: '¿Certificado NOM?' } });

    fireEvent.click(screen.getByTestId('eval-guardar-agregado'));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(patch).not.toHaveBeenCalled();
    const [url, body] = post.mock.calls[0];
    expect(url).toContain('revision-con-preguntas');
    expect(body.evaluaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({ detalle_id: 'detalle-a', evaluacion_tecnica: 'C' }),
      expect.objectContaining({ detalle_id: 'detalle-b', evaluacion_tecnica: '?', pregunta_residente: '¿Qué marca ofrece?' }),
      expect.objectContaining({ detalle_id: 'detalle-c', evaluacion_tecnica: 'C' }),
      expect.objectContaining({ detalle_id: 'detalle-d', evaluacion_tecnica: '?', pregunta_residente: '¿Certificado NOM?' }),
    ]));
  });
});

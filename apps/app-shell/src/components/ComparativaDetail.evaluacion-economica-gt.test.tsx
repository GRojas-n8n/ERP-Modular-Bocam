import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/evaluacion-economica-gt-por-proveedor. Gerencia Técnica evalúa
 * económicamente C/NC/DA/? por proveedor directamente en "TABLA DE COTIZACIONES" (mismo
 * patrón que la evaluación técnica del Residente), viendo costo, días de suministro y
 * condiciones de crédito por proveedor — sin abrir un modal.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'GT de Prueba', role: ['gerencia_tecnica'] } }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

const patch = vi.fn((_url: string, _body: any) => Promise.resolve({ data: { data: {} } }));
const post = vi.fn((_url: string, _body: any) => Promise.resolve({ data: { data: { revision_label: 'B' } } }));
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
    estado: 'EN_APROBACION_GT',
    revision: 'A',
    fecha_firma: '2026-07-01T00:00:00.000Z',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [
      { id: PROV_A, nombre: 'Proveedor Uno', ofrece_credito: true, dias_credito: 30 },
      { id: PROV_B, nombre: 'Proveedor Dos', ofrece_credito: false, dias_credito: null },
      { id: PROV_C, nombre: 'Proveedor Tres', ofrece_credito: true, dias_credito: 15 },
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
        fechasEntrega: { [PROV_A]: '2026-07-20', [PROV_B]: '2026-07-11', [PROV_C]: null },
        ganador: null,
        evaluacion_tecnica: 'C',
        evaluacionesPorProveedor: {
          [PROV_A]: { id_detalle: 'detalle-a', evaluacion_tecnica: 'C' },
          [PROV_B]: { id_detalle: 'detalle-b', evaluacion_tecnica: 'C' },
          [PROV_C]: { id_detalle: 'detalle-c', evaluacion_tecnica: 'NC' },
        },
        aprobacion_gt: 'PENDIENTE',
        aprobacionesGtPorProveedor: {
          [PROV_A]: { id_detalle: 'detalle-a', aprobacion_gt: 'PENDIENTE' },
          [PROV_B]: { id_detalle: 'detalle-b', aprobacion_gt: 'PENDIENTE' },
          [PROV_C]: { id_detalle: 'detalle-c', aprobacion_gt: 'PENDIENTE' },
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

describe('ComparativaDetail — evaluación económica GT inline en Tabla de Cotizaciones', () => {
  beforeEach(() => {
    patch.mockClear();
    post.mockClear();
  });

  it('muestra costo, días de suministro, crédito y controles C/NC/DA/? por proveedor, sin modal', async () => {
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

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: /Revisar y Aprobar/i })).not.toBeInTheDocument();

    // Proveedor A: 19 días de suministro (20 jul - 1 jul), crédito 30 días, evaluable
    expect(screen.getByText('19 días de suministro')).toBeInTheDocument();
    expect(screen.getByText('Crédito 30 días')).toBeInTheDocument();
    expect(screen.getByTestId(`gt-btn-linea-1-${PROV_A}-C`)).toBeInTheDocument();

    // Proveedor B: sin crédito
    expect(screen.getByText('Sin crédito')).toBeInTheDocument();

    // Proveedor C: rechazado técnicamente (NC) — fuera del alcance de GT, sin controles
    expect(screen.getByText('🔒 Rechazado técnica')).toBeInTheDocument();
    expect(screen.queryByTestId(`gt-btn-linea-1-${PROV_C}-C`)).not.toBeInTheDocument();
  });

  it('guardar una línea sin "?" llama a PATCH /evaluar-gt solo con los proveedores evaluables', async () => {
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

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_A}-C`));
    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_B}-NC`));
    fireEvent.change(screen.getByTestId(`gt-comentario-linea-1-${PROV_B}`), { target: { value: 'Precio elevado' } });

    fireEvent.click(screen.getByTestId('gt-guardar-linea-linea-1'));

    await waitFor(() => expect(patch).toHaveBeenCalled());
    expect(post).not.toHaveBeenCalled();
    const body = patch.mock.calls.at(-1)![1];
    expect(body.evaluaciones).toHaveLength(2);
    expect(body.evaluaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({ detalle_id: 'detalle-a', aprobacion_gt: 'C' }),
      expect.objectContaining({ detalle_id: 'detalle-b', aprobacion_gt: 'NC', comentario_gt: 'Precio elevado' }),
    ]));
  });

  it('marcar "?" oculta el guardado individual y muestra el botón agregado de GT', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    expect(screen.getByTestId('gt-guardar-linea-linea-1')).toBeInTheDocument();
    expect(screen.queryByTestId('gt-guardar-agregado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_A}-?`));

    expect(screen.queryByTestId('gt-guardar-linea-linea-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('gt-guardar-agregado')).toBeInTheDocument();
  });

  it('el botón agregado envía una sola llamada a revision-con-preguntas-gt con las evaluaciones pendientes', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_A}-C`));
    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_B}-?`));
    fireEvent.change(screen.getByTestId(`gt-pregunta-linea-1-${PROV_B}`), { target: { value: '¿Puede bajar el precio?' } });

    fireEvent.click(screen.getByTestId('gt-guardar-agregado'));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(patch).not.toHaveBeenCalled();
    const [url, body] = post.mock.calls[0];
    expect(url).toContain('revision-con-preguntas-gt');
    expect(body.evaluaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({ detalle_id: 'detalle-a', aprobacion_gt: 'C' }),
      expect.objectContaining({ detalle_id: 'detalle-b', aprobacion_gt: '?', pregunta_gt: '¿Puede bajar el precio?' }),
    ]));
  });

  it('el botón de finalizar GT está deshabilitado mientras falte evaluar un proveedor', async () => {
    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={vi.fn()}
        modo="compras"
      />
    );

    await waitFor(() => expect(screen.getByText('Mini Split Inverter de 1 Tonelada')).toBeInTheDocument());

    // Solo evalúa proveedor A — falta B (C ya está excluido por rechazo técnico)
    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_A}-C`));

    expect(screen.getByTestId('gt-finalizar')).toBeDisabled();

    fireEvent.click(screen.getByTestId(`gt-btn-linea-1-${PROV_B}-C`));

    expect(screen.getByTestId('gt-finalizar')).not.toBeDisabled();
  });
});

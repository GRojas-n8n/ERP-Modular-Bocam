import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ControlObraView } from './ControlObraView';

/**
 * Ver openspec/changes/accion-directa-reconocer-alerta/.
 * "Reconocer" pasa a un clic sin modal; "Agregar nota" abre el modal
 * existente para reconocer con nota; "Ignorar" no cambia (sigue exigiendo
 * justificación de 20+ caracteres vía modal).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'tenant-1' },
    user: { id: 'user-1', name: 'CP de Prueba', role: ['control_proyectos'] },
    currentProjectId: 'proyecto-1',
  }),
}));

const ALERTA_1 = { id: 'alerta-1', tipo: 'SOBRE_COSTO_PROYECTADO', severidad: 'CRITICA', titulo: 'EAC supera presupuesto', descripcion: 'desc-1', estado: 'ACTIVA', nota_cp: null, created_at: '2026-08-01T00:00:00.000Z', concepto_id: null };
const ALERTA_2 = { id: 'alerta-2', tipo: 'RETRASO_CRITICO', severidad: 'CRITICA', titulo: 'SPI bajo', descripcion: 'desc-2', estado: 'ACTIVA', nota_cp: null, created_at: '2026-08-01T00:00:00.000Z', concepto_id: null };

function defaultGetImpl(url: string): Promise<any> {
  if (url === '/api/v1/control-proyectos/alertas') return Promise.resolve({ data: { data: [ALERTA_1, ALERTA_2] } });
  if (url === '/api/v1/control-proyectos/bitacoras') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/avances') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/estimaciones') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/dashboard-obra') return Promise.reject(new Error('no dashboard en test'));
  return Promise.resolve({ data: { data: [] } });
}

const { getMock, patchMock } = vi.hoisted(() => ({
  getMock: vi.fn((_url: string): Promise<any> => Promise.resolve({ data: { data: [] } })),
  patchMock: vi.fn((_url: string, _body?: unknown): Promise<any> => Promise.resolve({ data: { data: {} } })),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: patchMock,
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

let resolvePatch: ((v: any) => void) | null = null;

beforeEach(() => {
  getMock.mockReset();
  getMock.mockImplementation(defaultGetImpl);
  patchMock.mockReset();
  resolvePatch = null;
  patchMock.mockImplementation(() => Promise.resolve({ data: { data: {} } }));
});

describe('ControlObraView — Reconocer alerta en un clic (1.1-1.2)', () => {
  it('clic en "Reconocer" envía el PATCH .../reconocer con nota_cp vacío sin abrir modal', async () => {
    render(<ControlObraView activeSubView="alertas" />);

    fireEvent.click((await screen.findAllByRole('button', { name: 'Reconocer' }))[0]);

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/control-proyectos/alertas/alerta-1/reconocer', { nota_cp: '' }));
    expect(screen.queryByText('Reconocer alerta')).not.toBeInTheDocument();
  });

  it('mientras la petición está en curso, el botón de esa alerta muestra carga y las demás siguen interactuables', async () => {
    patchMock.mockImplementation(() => new Promise(resolve => { resolvePatch = resolve; }));
    render(<ControlObraView activeSubView="alertas" />);

    const botonesReconocer = await screen.findAllByRole('button', { name: /Reconocer/i });
    fireEvent.click(botonesReconocer[0]);

    expect(await screen.findByRole('button', { name: 'Guardando...' })).toBeInTheDocument();
    // La segunda alerta sigue con su botón "Reconocer" normal, sin bloquearse.
    expect(screen.getAllByRole('button', { name: 'Reconocer' })).toHaveLength(1);

    resolvePatch?.({ data: { data: {} } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Guardando...' })).not.toBeInTheDocument());
  });
});

function getModal(titulo: string): HTMLElement {
  const el = screen.getByText(titulo).closest('.p-6');
  if (!el) throw new Error(`No se encontró el modal "${titulo}"`);
  return el as HTMLElement;
}

describe('ControlObraView — Agregar nota al reconocer (2.1)', () => {
  it('abre el modal en modo reconocer y envía la nota capturada', async () => {
    render(<ControlObraView activeSubView="alertas" />);

    fireEvent.click((await screen.findAllByRole('button', { name: 'Agregar nota' }))[0]);
    const modal = getModal('Reconocer alerta');

    fireEvent.change(within(modal).getByPlaceholderText(/Nota para el expediente/i), { target: { value: 'Revisado con el residente' } });
    fireEvent.click(within(modal).getByRole('button', { name: 'Reconocer' }));

    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/control-proyectos/alertas/alerta-1/reconocer', { nota_cp: 'Revisado con el residente' }));
  });
});

describe('ControlObraView — Ignorar sigue exigiendo justificación (3.1)', () => {
  it('abre el modal con justificación obligatoria y no tiene camino de un clic', async () => {
    render(<ControlObraView activeSubView="alertas" />);

    fireEvent.click((await screen.findAllByRole('button', { name: 'Ignorar' }))[0]);
    const modal = getModal('Ignorar alerta');

    const botonConfirmar = within(modal).getByRole('button', { name: 'Ignorar' });
    expect(botonConfirmar).toBeDisabled();

    fireEvent.change(within(modal).getByPlaceholderText(/Justificación requerida/i), { target: { value: 'corta' } });
    expect(botonConfirmar).toBeDisabled();

    fireEvent.change(within(modal).getByPlaceholderText(/Justificación requerida/i), { target: { value: 'Justificación suficientemente larga' } });
    expect(botonConfirmar).not.toBeDisabled();

    fireEvent.click(botonConfirmar);
    await waitFor(() => expect(patchMock).toHaveBeenCalledWith('/api/v1/control-proyectos/alertas/alerta-1/ignorar', { nota_cp: 'Justificación suficientemente larga' }));
  });
});

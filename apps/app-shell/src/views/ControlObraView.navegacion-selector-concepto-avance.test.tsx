import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ControlObraView } from './ControlObraView';

/**
 * Ver openspec/changes/navegacion-selector-concepto-avance/.
 * Navegación de teclado (flechas + Enter) y conceptos recientes en el
 * selector de concepto del panel "Registrar Avance".
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'tenant-1' },
    user: { id: 'user-1', name: 'CP de Prueba', role: ['control_proyectos'] },
    currentProjectId: 'proyecto-1',
  }),
}));

const CONCEPTO_1 = { id: 'concepto-1', clave: 'CIM-001', descripcion: 'Cimentación de prueba', unidad_medida: 'M3', precio_unitario: 1500, cantidad: 200 };
const CONCEPTO_2 = { id: 'concepto-2', clave: 'CIM-002', descripcion: 'Acero de refuerzo', unidad_medida: 'KG', precio_unitario: 25, cantidad: 500 };
const CONCEPTO_3 = { id: 'concepto-3', clave: 'CIM-003', descripcion: 'Cimbra metálica', unidad_medida: 'M2', precio_unitario: 80, cantidad: 300 };

function defaultGetImpl(url: string): Promise<any> {
  if (url === '/api/v1/control-proyectos/bitacoras') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/avances') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/estimaciones') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/dashboard-obra') return Promise.reject(new Error('no dashboard en test'));
  if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') {
    return Promise.resolve({ data: { data: { id: 'presupuesto-1', conceptos: [CONCEPTO_1, CONCEPTO_2, CONCEPTO_3] } } });
  }
  return Promise.resolve({ data: { data: [] } });
}

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn((_url: string): Promise<any> => Promise.resolve({ data: { data: [] } })),
  postMock: vi.fn((_url: string, _body?: unknown): Promise<any> => Promise.reject(new Error('POST no configurado en este test'))),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

beforeEach(() => {
  getMock.mockReset();
  getMock.mockImplementation(defaultGetImpl);
  postMock.mockReset();
  postMock.mockImplementation((url: string, body: any) => {
    if (url === '/api/v1/control-proyectos/avances') {
      return Promise.resolve({ data: { data: { id_avance: 'av-1', concepto_id: body.concepto_id, estado: 'PENDIENTE' } } });
    }
    return Promise.reject(new Error(`POST inesperado: ${url}`));
  });
});

async function abrirPanel() {
  render(<ControlObraView activeSubView="avances" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
  return screen.findByPlaceholderText(/Buscar concepto/i);
}

describe('ControlObraView — navegación de teclado en el selector de concepto (1.1)', () => {
  it('ArrowDown resalta la siguiente opción y Enter la confirma', async () => {
    const buscador = await abrirPanel();

    // Parte del primer renglón (CIM-001) resaltado por defecto; un ArrowDown
    // mueve el resaltado al segundo renglón (CIM-002).
    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'Enter' });

    expect(await screen.findByText('CIM-002')).toBeInTheDocument();
  });

  it('ArrowDown dos veces y Enter selecciona la tercera opción', async () => {
    const buscador = await abrirPanel();

    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'Enter' });

    expect(await screen.findByText('CIM-003')).toBeInTheDocument();
  });

  it('ArrowUp en la primera opción no cambia el resaltado (sin wrap-around)', async () => {
    const buscador = await abrirPanel();

    fireEvent.keyDown(buscador, { key: 'ArrowUp' });
    fireEvent.keyDown(buscador, { key: 'Enter' });

    expect(await screen.findByText('CIM-001')).toBeInTheDocument();
  });

  it('ArrowDown en la última opción no avanza más allá (sin wrap-around)', async () => {
    const buscador = await abrirPanel();

    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'Enter' });

    expect(await screen.findByText('CIM-003')).toBeInTheDocument();
  });

  it('la navegación respeta el filtro de búsqueda activo', async () => {
    const buscador = await abrirPanel();

    fireEvent.change(buscador, { target: { value: 'Acero' } });
    fireEvent.keyDown(buscador, { key: 'ArrowDown' });
    fireEvent.keyDown(buscador, { key: 'Enter' });

    expect(await screen.findByText('CIM-002')).toBeInTheDocument();
  });
});

describe('ControlObraView — conceptos recientes en el selector de concepto (2.1)', () => {
  it('sin capturas previas no hay sección "Recientes"', async () => {
    await abrirPanel();
    expect(screen.queryByText('Recientes')).not.toBeInTheDocument();
  });

  it('un concepto recién usado aparece en "Recientes" al reabrir el selector con búsqueda vacía', async () => {
    const buscador = await abrirPanel();

    fireEvent.click(screen.getByRole('button', { name: /CIM-001/i }));
    fireEvent.change(await screen.findByLabelText(/Cant\. periodo/i), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByText('Recientes')).toBeInTheDocument();
  });

  it('escribir en la búsqueda oculta la sección "Recientes"', async () => {
    const buscador = await abrirPanel();

    fireEvent.click(screen.getByRole('button', { name: /CIM-001/i }));
    fireEvent.change(await screen.findByLabelText(/Cant\. periodo/i), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    await screen.findByText('Recientes');

    fireEvent.change(screen.getByPlaceholderText(/Buscar concepto/i), { target: { value: 'Acero' } });

    expect(screen.queryByText('Recientes')).not.toBeInTheDocument();
  });
});

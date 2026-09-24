import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminView } from './AdminView';

/**
 * Ver openspec/changes/centro-costos-confirmar-y-editar-consecutivo/, tareas 4.x.
 * El alta de un Centro de Costos normal muestra el código COMPLETO con el
 * consecutivo sugerido (editable) y pide confirmación antes de guardar.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    refreshUser: vi.fn(),
    currentProjectId: 'proyecto-1',
    user: { id: 'u1', name: 'Admin', role: ['admin'], projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PROYECTO = { id_proyecto: 'proyecto-1', codigo_centro_costos: 'TCN-2024', nombre_oficial: 'Torre Corporativa Norte', tipo_contrato: 'PRECIOS_UNITARIOS', moneda_base: 'MXN', estatus: 'ABIERTO', activo: true };
const CLIENTE = { id_cliente: 'cli-1', razon_social: 'SERSSINSA', codigo_cliente: '004' };
const URL_SIGUIENTE = '/api/v1/auth/admin/proyectos/siguiente-consecutivo';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: getMock,
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  ventasApi: { getClientes: vi.fn(() => Promise.resolve({ data: { data: [CLIENTE] } })) },
}));

function respuestaSiguiente(consecutivo: number) {
  return Promise.resolve({
    data: { success: true, data: { consecutivo, codigo_centro_costos: `HCO2026004${String(consecutivo).padStart(3, '0')}` } },
  });
}

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
  getMock.mockImplementation((url: string) => {
    if (url === URL_SIGUIENTE) return respuestaSiguiente(3);
    if (url === '/api/v1/auth/admin/proyectos') return Promise.resolve({ data: { data: [PROYECTO] } });
    return Promise.resolve({ data: { data: [] } });
  });
  postMock.mockImplementation(() => Promise.resolve({ data: { data: { id_proyecto: 'nuevo' } } }));
});

/** Abre el modal de alta y llena empresa, cliente y nombre. */
async function abrirYLlenarAlta() {
  render(<AdminView activeSubView="proyectos" />);
  fireEvent.click(await screen.findByRole('button', { name: '+ Nuevo Proyecto' }));
  await screen.findByText('Nuevo Centro de Costos');

  const selects = document.querySelectorAll('select');
  fireEvent.change(selects[0], { target: { value: 'HCO' } }); // Empresa
  await waitFor(() => expect(selects[1].querySelectorAll('option').length).toBeGreaterThan(1)); // clientes cargados
  fireEvent.change(document.querySelectorAll('select')[1], { target: { value: CLIENTE.id_cliente } }); // Cliente

  fireEvent.change(screen.getByPlaceholderText('Proyecto Guadalajara 2026'), { target: { value: 'Contrato de prueba' } });
  await waitFor(() => expect(screen.getByLabelText('Consecutivo')).toHaveValue(3));
}

function clicCrear() {
  fireEvent.click(screen.getByRole('button', { name: 'Crear Centro de Costos' }));
}

describe('AdminView — alta de Centro de Costos con código completo y confirmación', () => {
  it('al elegir empresa, año y cliente consulta el siguiente consecutivo y muestra el código completo con el consecutivo editable', async () => {
    await abrirYLlenarAlta();

    expect(getMock).toHaveBeenCalledWith(URL_SIGUIENTE, expect.objectContaining({
      params: expect.objectContaining({ empresa_grupo: 'HCO', cliente_id: CLIENTE.id_cliente, codigo_cliente: '004' }),
    }));
    expect(screen.getByText(/^HCO\d{4}004$/)).toBeInTheDocument(); // prefijo fijo: empresa + año + cliente
    expect(screen.getByLabelText('Consecutivo')).toHaveValue(3);
  });

  it('"Crear Centro de Costos" muestra la confirmación con el código final y NO envía nada todavía', async () => {
    await abrirYLlenarAlta();
    clicCrear();

    expect(await screen.findByText('¿Crear este Centro de Costos?')).toBeInTheDocument();
    expect(screen.getByTestId('codigo-final')).toHaveTextContent(/^HCO\d{4}004003$/);
    expect(postMock).not.toHaveBeenCalled();
  });

  it('"Modificar" cierra la confirmación sin crear nada, conserva los datos y enfoca el consecutivo', async () => {
    await abrirYLlenarAlta();
    clicCrear();
    await screen.findByText('¿Crear este Centro de Costos?');

    fireEvent.click(screen.getByRole('button', { name: 'Modificar' }));

    await waitFor(() => expect(screen.queryByText('¿Crear este Centro de Costos?')).not.toBeInTheDocument());
    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Proyecto Guadalajara 2026')).toHaveValue('Contrato de prueba');
    expect(screen.getByLabelText('Consecutivo')).toHaveFocus();
  });

  it('"Aceptar y guardar" envía el consecutivo confirmado', async () => {
    await abrirYLlenarAlta();
    clicCrear();
    await screen.findByText('¿Crear este Centro de Costos?');

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y guardar' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(postMock).toHaveBeenCalledWith('/api/v1/auth/admin/proyectos', expect.objectContaining({
      empresa_grupo: 'HCO', cliente_id: CLIENTE.id_cliente, codigo_cliente: '004', consecutivo_centro_costos: 3,
    }));
  });

  it('si el usuario cambia el consecutivo a 10, se muestra 010 y se envía 10', async () => {
    await abrirYLlenarAlta();
    fireEvent.change(screen.getByLabelText('Consecutivo'), { target: { value: '10' } });

    clicCrear();
    await screen.findByText('¿Crear este Centro de Costos?');
    expect(screen.getByTestId('codigo-final')).toHaveTextContent(/^HCO\d{4}004010$/);

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y guardar' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/auth/admin/proyectos', expect.objectContaining({ consecutivo_centro_costos: 10 })));
  });

  it('un consecutivo fuera de 1–999 bloquea el guardado y no muestra la confirmación', async () => {
    await abrirYLlenarAlta();
    fireEvent.change(screen.getByLabelText('Consecutivo'), { target: { value: '1000' } });

    clicCrear();

    expect(await screen.findByText(/consecutivo.*entre 1 y 999/i)).toBeInTheDocument();
    expect(screen.queryByText('¿Crear este Centro de Costos?')).not.toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('409 ADMIN_CODIGO_DUPLICADO: avisa, actualiza el sugerido y vuelve a pedir confirmación (no guarda otro valor en silencio)', async () => {
    postMock.mockImplementationOnce(() => Promise.reject({
      response: { status: 409, data: { success: false, error: { code: 'ADMIN_CODIGO_DUPLICADO', message: 'Ese consecutivo ya está asignado a otro Centro de Costos.', consecutivo_sugerido: 4 } } },
    }));
    await abrirYLlenarAlta();
    clicCrear();
    await screen.findByText('¿Crear este Centro de Costos?');
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y guardar' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/ya fue tomado|ya está asignado/i)).toBeInTheDocument();
    // vuelve a pedir confirmación con el nuevo sugerido (004)
    expect(await screen.findByText('¿Crear este Centro de Costos?')).toBeInTheDocument();
    expect(screen.getByTestId('codigo-final')).toHaveTextContent(/^HCO\d{4}004004$/);
    expect(postMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y guardar' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(2));
    expect(postMock).toHaveBeenLastCalledWith('/api/v1/auth/admin/proyectos', expect.objectContaining({ consecutivo_centro_costos: 4 }));
  });

  it('si cambia el año tras editar el consecutivo, se vuelve a sugerir y se avisa que el valor anterior se descartó', async () => {
    await abrirYLlenarAlta();
    fireEvent.change(screen.getByLabelText('Consecutivo'), { target: { value: '10' } });
    expect(screen.getByLabelText('Consecutivo')).toHaveValue(10);

    const llamadasAntes = getMock.mock.calls.filter(([u]) => u === URL_SIGUIENTE).length;
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2027' } });

    await waitFor(() => expect(getMock.mock.calls.filter(([u]) => u === URL_SIGUIENTE).length).toBeGreaterThan(llamadasAntes));
    await waitFor(() => expect(screen.getByLabelText('Consecutivo')).toHaveValue(3));
    expect(screen.getByText(/se descartó/i)).toBeInTheDocument();
  });

  it('un Centro de Costos ESPECIAL no consulta consecutivo ni pide esta confirmación (sin cambios)', async () => {
    render(<AdminView activeSubView="proyectos" />);
    fireEvent.click(await screen.findByRole('button', { name: '+ Nuevo Proyecto' }));
    await screen.findByText('Nuevo Centro de Costos');

    fireEvent.click(screen.getByLabelText(/Centro de Costos especial/));
    fireEvent.change(document.querySelectorAll('select')[0], { target: { value: 'OFICINA' } });
    fireEvent.change(screen.getByPlaceholderText('OFICINA-CDMX'), { target: { value: 'OFICINA-CDMX' } });
    fireEvent.change(screen.getByPlaceholderText('Proyecto Guadalajara 2026'), { target: { value: 'Oficina central' } });

    clicCrear();

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('¿Crear este Centro de Costos?')).not.toBeInTheDocument();
    expect(getMock.mock.calls.some(([u]) => u === URL_SIGUIENTE)).toBe(false);
  });
});

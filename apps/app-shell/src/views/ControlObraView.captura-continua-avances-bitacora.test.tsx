import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ControlObraView } from './ControlObraView';

/**
 * Ver openspec/changes/captura-continua-avances-bitacora/.
 *
 * Los paneles "Registrar Avance" y "Nueva Bitácora" se cerraban por
 * completo tras cada guardado exitoso, obligando a reabrirlos para capturar
 * el siguiente avance/entrada de la misma sesión. Ahora permanecen abiertos.
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

function defaultGetImpl(url: string): Promise<any> {
  if (url === '/api/v1/control-proyectos/bitacoras') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/avances') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/estimaciones') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/dashboard-obra') return Promise.reject(new Error('no dashboard en test'));
  if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') {
    return Promise.resolve({ data: { data: { id: 'presupuesto-1', conceptos: [CONCEPTO_1, CONCEPTO_2] } } });
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
  postMock.mockImplementation(() => Promise.reject(new Error('POST no configurado en este test')));
});

describe('ControlObraView — Registrar Avance permanece abierto tras guardar (1.1-1.3)', () => {
  let avanceSeq = 0;
  beforeEach(() => {
    avanceSeq = 0;
    postMock.mockImplementation((url: string, body: any) => {
      if (url === '/api/v1/control-proyectos/avances') {
        avanceSeq += 1;
        return Promise.resolve({
          data: {
            data: {
              id_avance: `av-${avanceSeq}`,
              concepto_id: body.concepto_id,
              concepto_presupuesto: body.concepto_id === CONCEPTO_1.id ? CONCEPTO_1.clave : CONCEPTO_2.clave,
              cantidad_periodo: body.cantidad_periodo,
              estado: 'PENDIENTE',
            },
          },
        });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });
  });

  it('el panel sigue abierto tras guardar, limpia la captura y muestra confirmación inline', async () => {
    render(<ControlObraView activeSubView="avances" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));
    fireEvent.change(await screen.findByLabelText(/Cant\. periodo/i), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances', expect.objectContaining({ concepto_id: 'concepto-1' })));

    // El panel sigue abierto: el título del panel sigue visible.
    expect(screen.getByText('Registrar Avance Físico')).toBeInTheDocument();
    // La confirmación inline aparece con el concepto y cantidad guardados.
    expect(await screen.findByText(/Avance guardado: CIM-001/i)).toBeInTheDocument();
    // El selector de concepto vuelve a su estado vacío (buscador visible, sin tarjeta seleccionada).
    expect(await screen.findByPlaceholderText(/Buscar concepto/i)).toBeInTheDocument();
    // La cantidad capturada se limpió.
    expect((screen.getByLabelText(/Cant\. periodo/i) as HTMLInputElement).value).toBe('');
  });

  it('permite capturar un segundo avance de otro concepto sin reabrir el panel', async () => {
    render(<ControlObraView activeSubView="avances" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));
    fireEvent.change(await screen.findByLabelText(/Cant\. periodo/i), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));

    // Sin reabrir el panel: seleccionar el segundo concepto directamente.
    fireEvent.click(await screen.findByRole('button', { name: /CIM-002/i }));
    fireEvent.change(await screen.findByLabelText(/Cant\. periodo/i), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances', expect.objectContaining({ concepto_id: 'concepto-2', cantidad_periodo: 15 })));
    expect(postMock).toHaveBeenCalledTimes(2);
  });

  it('la acción "Cerrar" del panel cierra sin enviar ningún avance adicional', async () => {
    render(<ControlObraView activeSubView="avances" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));

    fireEvent.click(await screen.findByRole('button', { name: /Cerrar panel/i }));

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Registrar Avance Físico')).not.toBeInTheDocument();
  });
});

describe('ControlObraView — Nueva Bitácora permanece abierta tras guardar (2.1-2.3)', () => {
  let bitacoraSeq = 0;
  beforeEach(() => {
    bitacoraSeq = 0;
    postMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/bitacoras') {
        bitacoraSeq += 1;
        return Promise.resolve({ data: { data: { id_bitacora: `bit-${bitacoraSeq}`, numero_entrada: bitacoraSeq } } });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });
  });

  it('el panel sigue abierto tras guardar, conserva el frente de trabajo y muestra confirmación inline', async () => {
    render(<ControlObraView activeSubView="bitacoras" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Nueva Bitácora' }));
    fireEvent.change(await screen.findByPlaceholderText(/Ej: Frente 1/i), { target: { value: 'Frente 1 - Cimentación' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe las actividades/i), { target: { value: 'Colado de zapatas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Bitácora' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/bitacoras', expect.objectContaining({ frente_trabajo: 'Frente 1 - Cimentación' })));

    expect(screen.getByRole('heading', { name: 'Nueva Bitácora' })).toBeInTheDocument();
    expect(await screen.findByText(/Entrada #1 guardada/i)).toBeInTheDocument();
    expect((screen.getByPlaceholderText(/Ej: Frente 1/i) as HTMLInputElement).value).toBe('Frente 1 - Cimentación');
    expect((screen.getByPlaceholderText(/Describe las actividades/i) as HTMLTextAreaElement).value).toBe('');
  });

  it('permite capturar una segunda entrada para el mismo frente sin reabrir el panel ni reseleccionarlo', async () => {
    render(<ControlObraView activeSubView="bitacoras" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Nueva Bitácora' }));
    fireEvent.change(await screen.findByPlaceholderText(/Ej: Frente 1/i), { target: { value: 'Frente 1 - Cimentación' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe las actividades/i), { target: { value: 'Colado de zapatas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Bitácora' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText(/Describe las actividades/i), { target: { value: 'Armado de castillos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Bitácora' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/bitacoras', expect.objectContaining({ frente_trabajo: 'Frente 1 - Cimentación', actividades_realizadas: 'Armado de castillos' })));
    expect(postMock).toHaveBeenCalledTimes(2);
  });

  it('la acción "Cerrar" del panel cierra sin enviar ninguna entrada', async () => {
    render(<ControlObraView activeSubView="bitacoras" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Nueva Bitácora' }));
    fireEvent.change(await screen.findByPlaceholderText(/Ej: Frente 1/i), { target: { value: 'Frente 1' } });

    fireEvent.click(await screen.findByRole('button', { name: /Cerrar panel/i }));

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Nueva Bitácora' })).not.toBeInTheDocument();
  });
});

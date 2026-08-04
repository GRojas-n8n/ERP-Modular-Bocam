import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ControlObraView } from './ControlObraView';

/**
 * Ver openspec/changes/fix-estimaciones-residente-desconectado/ (tareas 6.1-6.6).
 *
 * El formulario "Registrar Avance Físico" de ControlObraView usaba texto
 * libre para el concepto y campos editables de precio/cantidad
 * presupuestada — mismo defecto de datos no confiables que se corrigió en
 * ResidenciaView. `POST /avances` ahora exige `concepto_id` y resuelve
 * precio/cantidad del catálogo server-side, así que este formulario debe
 * actualizarse al mismo contrato o queda roto.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'tenant-1' },
    user: { id: 'user-1', name: 'CP de Prueba', role: ['control_proyectos'] },
    currentProjectId: 'proyecto-1',
  }),
}));

const CONCEPTO = { id: 'concepto-1', clave: 'CIM-001', descripcion: 'Cimentación de prueba', unidad_medida: 'M3', precio_unitario: 1500, cantidad: 200 };

function defaultGetImpl(url: string): Promise<any> {
  if (url === '/api/v1/control-proyectos/bitacoras') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/avances') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/estimaciones') return Promise.resolve({ data: { data: [] } });
  if (url === '/api/v1/control-proyectos/dashboard-obra') return Promise.reject(new Error('no dashboard en test'));
  if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') {
    return Promise.resolve({ data: { data: { id: 'presupuesto-1', conceptos: [CONCEPTO] } } });
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

describe('ControlObraView — Registrar Avance Físico usa el catálogo (6.2-6.6)', () => {
  it('el formulario usa un selector de concepto del catálogo, no un campo de texto libre', async () => {
    render(<ControlObraView activeSubView="avances" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));

    expect(await screen.findByPlaceholderText(/Buscar concepto/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ej: CIM-001/i)).not.toBeInTheDocument();
  });

  it('ya no hay campos editables de precio unitario ni cantidad presupuestada', async () => {
    render(<ControlObraView activeSubView="avances" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    await screen.findByPlaceholderText(/Buscar concepto/i);

    expect(screen.queryByPlaceholderText('1500')).not.toBeInTheDocument();
    expect(screen.queryByText(/Cant\. presupuestada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^P\.U\.$/i)).not.toBeInTheDocument();
  });

  it('registrar un avance válido envía concepto_id (sin precio/cantidad manuales) y lo agrega a la lista sin recargar', async () => {
    postMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/avances') {
        return Promise.resolve({
          data: {
            data: {
              id_avance: 'av-nuevo', concepto_id: 'concepto-1', concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Cimentación de prueba',
              cantidad_periodo: 8, cantidad_acumulada: 8, unidad: 'M3', porcentaje_avance: 4, importe_periodo: 12000, estado: 'PENDIENTE',
            },
          },
        });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });

    render(<ControlObraView activeSubView="avances" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));

    const cantidadInput = await screen.findByLabelText(/Cant\. periodo/i);
    fireEvent.change(cantidadInput, { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances', expect.objectContaining({
      concepto_id: 'concepto-1',
      cantidad_periodo: 8,
    })));
    const sentBody = postMock.mock.calls.find((c: any[]) => c[0] === '/api/v1/control-proyectos/avances')?.[1];
    expect(sentBody).not.toHaveProperty('precio_unitario');
    expect(sentBody).not.toHaveProperty('cantidad_presupuestada');
    expect(sentBody).not.toHaveProperty('concepto_presupuesto');

    // No hace falta un GET de recarga completa — el avance ya viene en la respuesta del POST.
    expect(await screen.findByText('CIM-001')).toBeInTheDocument();
  });
});

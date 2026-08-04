import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/fix-estimaciones-residente-desconectado/ (tareas 5.1-5.13).
 *
 * La pestaña "Estimaciones" no estaba conectada a ningún backend real en
 * producción (lista siempre vacía, formulario "Nueva Estimación" no
 * persistía nada). Este archivo cubre el reemplazo: carga real de
 * estimaciones/avances, registro de avance físico por concepto del
 * catálogo (sin precio/cantidad manuales), y creación de estimación
 * agrupando avances propios ya VALIDADO.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: {
      id: 'user-1',
      name: 'Residente de Prueba',
      role: ['residencia'],
      projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const CONCEPTO = { id: 'concepto-1', clave: 'CIM-001', descripcion: 'Cimentación de prueba', unidad_medida: 'M3', precio_unitario: 1500, cantidad: 200 };

const AVANCE_VALIDADO = {
  id_avance: 'av-1', concepto_id: 'concepto-1', concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Cimentación de prueba',
  cantidad_presupuestada: 200, cantidad_anterior: 0, cantidad_periodo: 30, cantidad_acumulada: 30,
  unidad: 'M3', precio_unitario: 1500, importe_periodo: 45000, importe_acumulado: 45000, porcentaje_avance: 15,
  periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15', estado: 'VALIDADO', estimacion_id: null,
};

const AVANCE_PENDIENTE = {
  id_avance: 'av-2', concepto_id: 'concepto-1', concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Cimentación de prueba',
  cantidad_presupuestada: 200, cantidad_anterior: 30, cantidad_periodo: 10, cantidad_acumulada: 40,
  unidad: 'M3', precio_unitario: 1500, importe_periodo: 15000, importe_acumulado: 60000, porcentaje_avance: 20,
  periodo_inicio: '2026-08-16', periodo_fin: '2026-08-31', estado: 'PENDIENTE', estimacion_id: null,
};

const ESTIMACION = {
  id_estimacion: 'est-1', numero_estimacion: 1, codigo: 'EST-2026-001',
  periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
  subtotal: 45000, iva: 7200, total_neto: 51120, estado: 'BORRADOR', notas: null,
  avances: [{ id_avance: 'av-0', concepto_presupuesto: 'CIM-000', importe_periodo: 45000, porcentaje_avance: 100 }],
};

function defaultGetImpl(url: string): Promise<any> {
  if (url === '/api/v1/control-proyectos/estimaciones') {
    return Promise.resolve({ data: { data: [ESTIMACION] } });
  }
  if (url === '/api/v1/control-proyectos/avances') {
    return Promise.resolve({ data: { data: [AVANCE_VALIDADO, AVANCE_PENDIENTE] } });
  }
  if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') {
    return Promise.resolve({ data: { data: { id: 'presupuesto-1', conceptos: [CONCEPTO] } } });
  }
  if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
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

describe('ResidenciaView — Estimaciones conectadas a control-proyectos (5.1/5.3)', () => {
  it('carga estimaciones y avances reales al activar la pestaña (ya no queda fijo en [])', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);

    await waitFor(() => expect(getMock).toHaveBeenCalledWith('/api/v1/control-proyectos/estimaciones'));
    expect(getMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances');
    expect(await screen.findByText('EST-2026-001')).toBeInTheDocument();
    expect((await screen.findAllByText('CIM-001')).length).toBeGreaterThan(0);
  });

  it('ya no muestra el formulario "Nueva Estimación" ni el botón "Enviar a revisión"', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    expect(screen.queryByText('Nueva Estimación')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Enviar a revisión/i })).not.toBeInTheDocument();
  });

  it('si falla la carga muestra un estado de error distinguible de "sin datos", con botón de reintentar', async () => {
    getMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/estimaciones' || url === '/api/v1/control-proyectos/avances') {
        return Promise.reject(new Error('network down'));
      }
      return defaultGetImpl(url);
    });

    render(<ResidenciaView activeSubView="estimaciones" />);

    expect(await screen.findByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.queryByText('Sin estimaciones registradas')).not.toBeInTheDocument();
  });
});

describe('ResidenciaView — Registrar avance físico (5.7-5.10)', () => {
  it('el registro de avance usa un selector de concepto del catálogo, no texto libre', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    expect(await screen.findByPlaceholderText(/Buscar concepto/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ej: CIM-001/i)).not.toBeInTheDocument();
  });

  it('registrar un avance válido envía concepto_id (sin precio/cantidad manuales) y lo agrega a la lista', async () => {
    postMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/avances') {
        return Promise.resolve({
          data: {
            data: {
              id_avance: 'av-nuevo', concepto_id: 'concepto-1', concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Cimentación de prueba',
              cantidad_presupuestada: 200, cantidad_anterior: 40, cantidad_periodo: 5, cantidad_acumulada: 45,
              unidad: 'M3', precio_unitario: 1500, importe_periodo: 7500, importe_acumulado: 67500, porcentaje_avance: 22.5,
              periodo_inicio: '2026-09-01', periodo_fin: '2026-09-15', estado: 'PENDIENTE', estimacion_id: null,
            },
          },
        });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });

    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));
    fireEvent.change(await screen.findByLabelText(/Cantidad del periodo/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances', expect.objectContaining({
      concepto_id: 'concepto-1',
      cantidad_periodo: 5,
    })));
    const sentBody = postMock.mock.calls.find((c: any[]) => c[0] === '/api/v1/control-proyectos/avances')?.[1];
    expect(sentBody).not.toHaveProperty('precio_unitario');
    expect(sentBody).not.toHaveProperty('cantidad_presupuestada');
    expect(sentBody).not.toHaveProperty('concepto_presupuesto');
  });

  it('si POST /avances falla por red, conserva los datos capturados y permite reintentar', async () => {
    let attempt = 0;
    postMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/avances') {
        attempt += 1;
        if (attempt === 1) return Promise.reject(new Error('network down'));
        return Promise.resolve({
          data: {
            data: {
              id_avance: 'av-reintento', concepto_id: 'concepto-1', concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Cimentación de prueba',
              cantidad_presupuestada: 200, cantidad_anterior: 40, cantidad_periodo: 5, cantidad_acumulada: 45,
              unidad: 'M3', precio_unitario: 1500, importe_periodo: 7500, importe_acumulado: 67500, porcentaje_avance: 22.5,
              periodo_inicio: '2026-09-01', periodo_fin: '2026-09-15', estado: 'PENDIENTE', estimacion_id: null,
            },
          },
        });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });

    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
    fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));
    const cantidadInput = await screen.findByLabelText(/Cantidad del periodo/i);
    fireEvent.change(cantidadInput, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    // El formulario sigue abierto con el dato capturado — no se perdió.
    expect(await screen.findByDisplayValue('5')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(2));
  });
});

describe('ResidenciaView — Crear estimación desde avances validados (5.11-5.13)', () => {
  it('agrupar avances validados envía avance_ids y agrega la estimación en BORRADOR', async () => {
    postMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/estimaciones') {
        return Promise.resolve({
          data: {
            data: {
              id_estimacion: 'est-nueva', numero_estimacion: 2, codigo: 'EST-2026-002',
              periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
              subtotal: 45000, iva: 7200, total_neto: 51120, estado: 'BORRADOR', notas: null,
            },
          },
        });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });

    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    const checkbox = await screen.findByRole('checkbox', { name: /CIM-001/i });
    fireEvent.click(checkbox);
    fireEvent.click(await screen.findByRole('button', { name: /Crear Estimación/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/estimaciones', { avance_ids: ['av-1'] }));
    expect(await screen.findByText('EST-2026-002')).toBeInTheDocument();
  });

  it('sin avances VALIDADO disponibles, no se puede iniciar la creación de una estimación', async () => {
    getMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/avances') {
        return Promise.resolve({ data: { data: [AVANCE_PENDIENTE] } });
      }
      return defaultGetImpl(url);
    });

    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    const crearBtn = screen.queryByRole('button', { name: /Crear Estimación/i });
    if (crearBtn) {
      expect(crearBtn).toBeDisabled();
    }
    expect(screen.getByText(/avances? validad[oa]s?/i)).toBeInTheDocument();
  });
});

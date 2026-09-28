import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/avances-residencia-por-estimacion/ (tareas 3.1-3.4).
 * Totales contratado/estimado/cobrado/restante, avances agrupados por
 * concepto y registro de avances por estimación (lote).
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: {
      id: 'user-1',
      name: 'Residente de Prueba',
      role: ['residencia'],
      projects: [{ id: 'proyecto-1', name: 'Hutchinson', code: 'HUT', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const CONCEPTO = { id: 'concepto-1', clave: 'CAN-001', descripcion: 'Canalización de prueba', unidad_medida: 'ML', precio_unitario: 100, cantidad: 500 };

function avance(id: string, periodo: [string, string], cant: number, extra: Record<string, unknown> = {}) {
  return {
    id_avance: id, concepto_id: 'concepto-1', concepto_presupuesto: 'CAN-001', descripcion_concepto: 'Canalización de prueba',
    cantidad_presupuestada: 500, cantidad_anterior: 0, cantidad_periodo: cant, cantidad_acumulada: cant,
    unidad: 'ML', precio_unitario: 100, importe_periodo: cant * 100, importe_acumulado: cant * 100, porcentaje_avance: 10,
    periodo_inicio: periodo[0], periodo_fin: periodo[1], estado: 'VALIDADO', estimacion_id: null, estimacion_referencia_id: null,
    ...extra,
  };
}

const AV_1 = avance('av-1', ['2026-08-01', '2026-08-15'], 50, { estimacion_id: 'est-1' });
const AV_2 = avance('av-2', ['2026-08-16', '2026-08-31'], 30);

const ESTIMACION = {
  id_estimacion: 'est-1', numero_estimacion: 1, codigo: 'EST-2026-001',
  periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
  subtotal: 5000, iva: 800, total_neto: 5680, estado: 'FACTURADA', notas: null,
  avances: [{ id_avance: 'av-1', concepto_presupuesto: 'CAN-001', importe_periodo: 5000, porcentaje_avance: 10 }],
};

const TOTALES = { contratado: 50000, estimado: 5000, cobrado: 3000, restante: 47000, parcial: false };

function getImpl(totales: unknown) {
  return (url: string): Promise<any> => {
    if (url === '/api/v1/control-proyectos/estimaciones') return Promise.resolve({ data: { data: [ESTIMACION] } });
    if (url === '/api/v1/control-proyectos/avances') return Promise.resolve({ data: { data: [AV_1, AV_2] } });
    if (url === '/api/v1/control-proyectos/estimaciones/totales') return Promise.resolve({ data: { data: totales } });
    if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') return Promise.resolve({ data: { data: { id: 'p1', conceptos: [CONCEPTO] } } });
    if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
    return Promise.resolve({ data: { data: [] } });
  };
}

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn((_url: string): Promise<any> => Promise.resolve({ data: { data: [] } })),
  postMock: vi.fn((_url: string, _body?: unknown): Promise<any> => Promise.reject(new Error('POST no configurado'))),
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
  getMock.mockImplementation(getImpl(TOTALES));
  postMock.mockReset();
  postMock.mockImplementation(() => Promise.reject(new Error('POST no configurado')));
});

const money = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

describe('Totales contratado / estimado / cobrado / restante', () => {
  it('muestra las cuatro tarjetas con los valores de /estimaciones/totales', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    await waitFor(() => expect(screen.getByTestId('total-contratado')).toHaveTextContent(money(50000)));
    expect(getMock).toHaveBeenCalledWith('/api/v1/control-proyectos/estimaciones/totales');
    expect(screen.getByTestId('total-estimado')).toHaveTextContent(money(5000));
    expect(screen.getByTestId('total-cobrado')).toHaveTextContent(money(3000));
    expect(screen.getByTestId('total-restante')).toHaveTextContent(money(47000));
  });

  it('con parcial:true muestra "—" en contratado y restante y avisa dato parcial', async () => {
    getMock.mockImplementation(getImpl({ contratado: null, estimado: 5000, cobrado: 3000, restante: null, parcial: true }));
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    await waitFor(() => expect(screen.getByTestId('total-estimado')).toHaveTextContent(money(5000)));
    expect(screen.getByTestId('total-contratado')).toHaveTextContent('—');
    expect(screen.getByTestId('total-restante')).toHaveTextContent('—');
    expect(screen.getByText(/dato parcial/i)).toBeInTheDocument();
  });
});

describe('Avances agrupados por concepto', () => {
  it('un concepto con varios avances aparece en una sola fila, con detalle expandible', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    expect(screen.getAllByRole('row').filter(r => r.textContent?.includes('Canalización de prueba'))).toHaveLength(1);

    // Acumulado del concepto = 50 + 30
    expect(screen.getByText(/80 \/ 500 ML/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ver detalle Canalización de prueba/i }));
    expect(await screen.findByRole('checkbox', { name: /CAN-001 — av-2/i })).toBeInTheDocument();
    expect(screen.getAllByRole('row').filter(r => r.textContent?.includes('Canalización de prueba'))).toHaveLength(1);
  });
});

describe('Registrar avance por estimación', () => {
  it('prellena los conceptos de la estimación y envía POST /avances/lote', async () => {
    postMock.mockImplementation((url: string) => {
      if (url === '/api/v1/control-proyectos/avances/lote') {
        return Promise.resolve({ data: { data: [avance('av-nuevo', ['2026-08-01', '2026-08-15'], 45, { estado: 'PENDIENTE', estimacion_referencia_id: 'est-1' })] } });
      }
      return Promise.reject(new Error(`POST inesperado: ${url}`));
    });

    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    fireEvent.click(await screen.findByRole('button', { name: /Registrar por Estimación/i }));
    fireEvent.change(await screen.findByLabelText(/Estimación de referencia/i), { target: { value: 'est-1' } });

    // Cantidad prellenada = lo estimado (50) del concepto en esa estimación; editable.
    const input = await screen.findByLabelText(/Cantidad CAN-001/i) as HTMLInputElement;
    expect(input.value).toBe('50');
    fireEvent.change(input, { target: { value: '45' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avances' }));
    fireEvent.click(await screen.findByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances/lote', {
      estimacion_referencia_id: 'est-1',
      items: [{ concepto_id: 'concepto-1', cantidad_periodo: 45 }],
    }));
  });

  it('si falla el lote conserva las cantidades capturadas para reintentar', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    fireEvent.click(await screen.findByRole('button', { name: /Registrar por Estimación/i }));
    fireEvent.change(await screen.findByLabelText(/Estimación de referencia/i), { target: { value: 'est-1' } });
    fireEvent.change(await screen.findByLabelText(/Cantidad CAN-001/i), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Avances' }));
    fireEvent.click(await screen.findByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByDisplayValue('45')).toBeInTheDocument();
  });
});

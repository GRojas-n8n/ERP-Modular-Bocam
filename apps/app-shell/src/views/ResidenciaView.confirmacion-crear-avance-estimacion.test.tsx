import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Guardar Avance" y "Crear Estimación" ejecutaban el POST directo desde el
 * onClick, sin ninguna confirmación ni referencia al proyecto activo. Ahora
 * deben pasar primero por un diálogo no descartable (ni con clic afuera ni
 * con Escape) que muestra el proyecto activo, y solo llamar al backend si el
 * usuario confirma.
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
    return Promise.resolve({ data: { data: [AVANCE_VALIDADO] } });
  }
  if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') {
    return Promise.resolve({ data: { data: { id: 'presupuesto-1', conceptos: [CONCEPTO] } } });
  }
  if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
  return Promise.resolve({ data: { data: [] } });
}

const NUEVO_AVANCE = {
  id_avance: 'av-nuevo', concepto_id: 'concepto-1', concepto_presupuesto: 'CIM-001', descripcion_concepto: 'Cimentación de prueba',
  cantidad_presupuestada: 200, cantidad_anterior: 30, cantidad_periodo: 5, cantidad_acumulada: 35,
  unidad: 'M3', precio_unitario: 1500, importe_periodo: 7500, importe_acumulado: 52500, porcentaje_avance: 17.5,
  periodo_inicio: '2026-09-01', periodo_fin: '2026-09-15', estado: 'PENDIENTE', estimacion_id: null,
};

const NUEVA_ESTIMACION = {
  id_estimacion: 'est-nueva', numero_estimacion: 2, codigo: 'EST-2026-002',
  periodo_inicio: '2026-08-01', periodo_fin: '2026-08-15',
  subtotal: 45000, iva: 7200, total_neto: 51120, estado: 'BORRADOR', notas: null,
};

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
  postMock.mockImplementation((url: string) => {
    if (url === '/api/v1/control-proyectos/avances') return Promise.resolve({ data: { data: NUEVO_AVANCE } });
    if (url === '/api/v1/control-proyectos/estimaciones') return Promise.resolve({ data: { data: NUEVA_ESTIMACION } });
    return Promise.reject(new Error(`POST inesperado: ${url}`));
  });
});

async function abrirYLlenarFormularioAvance() {
  render(<ResidenciaView activeSubView="estimaciones" />);
  await screen.findByText('EST-2026-001');

  fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));
  fireEvent.click(await screen.findByRole('button', { name: /CIM-001/i }));
  fireEvent.change(await screen.findByLabelText(/Cantidad del periodo/i), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar Avance' }));
}

describe('ResidenciaView — confirmación de proyecto activo al registrar Avance Físico', () => {
  it('el panel de alta muestra el proyecto activo en su subtítulo', async () => {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Avance' }));

    expect(await screen.findByText(/Proyecto: Torre Corporativa Norte/)).toBeInTheDocument();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirYLlenarFormularioAvance();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/avances', expect.anything()));
  });

  it('cancelar el diálogo no registra el avance', async () => {
    await abrirYLlenarFormularioAvance();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('un clic fuera del diálogo (overlay) no lo cierra ni registra el avance', async () => {
    await abrirYLlenarFormularioAvance();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });

  it('la tecla Escape no cierra el diálogo ni registra el avance', async () => {
    await abrirYLlenarFormularioAvance();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});

describe('ResidenciaView — confirmación de proyecto activo al crear Estimación', () => {
  async function seleccionarYCrearEstimacion() {
    render(<ResidenciaView activeSubView="estimaciones" />);
    await screen.findByText('EST-2026-001');

    const checkbox = await screen.findByRole('checkbox', { name: /CIM-001/i });
    fireEvent.click(checkbox);
    fireEvent.click(await screen.findByRole('button', { name: /Crear Estimación/i }));
  }

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await seleccionarYCrearEstimacion();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/control-proyectos/estimaciones', { avance_ids: ['av-1'] }));
  });

  it('cancelar el diálogo no crea la estimación', async () => {
    await seleccionarYCrearEstimacion();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni crea la estimación', async () => {
    await seleccionarYCrearEstimacion();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});

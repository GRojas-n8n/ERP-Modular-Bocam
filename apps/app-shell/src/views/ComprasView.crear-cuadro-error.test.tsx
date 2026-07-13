import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/fix-crear-cuadro-comparativo-500 — tareas 3.2/3.3.
 * Si POST /comparativas falla, el usuario debe ver un error explícito y NO
 * quedar dentro de un cuadro comparativo fantasma (id local que no existe en
 * el backend) — antes, un catch silencioso dejaba entrar igual, y todas las
 * acciones posteriores fallaban sin ningún aviso.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['procurement'] },
  }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

const requisicionMock = {
  id_requisicion: 'req-1',
  codigo: 'REQ-0001',
  fecha_solicitud: '2026-07-13',
  solicitante_nombre: 'Residente Prueba',
  estado: 'APROBADA',
  tipo: 'IMPREVISTO',
  items: [],
};

let postComparativaResult: 'ok' | 'error' = 'ok';

const solicitudMock = {
  id_solicitud: 'sol-1',
  dias_habiles: 3,
  fecha_solicitud: '2026-07-13T00:00:00.000Z',
  fecha_limite: '2026-07-16T00:00:00.000Z',
  dias_habiles_restantes: 1,
  alerta_plazo: false,
  notas: null,
  proveedores: [
    { id_scp: 'scp-1', proveedor_id: 'p1', proveedor: { razon_social: 'Proveedor Uno' }, estado: 'RESPONDIO', pdf_nombre: null, notas_proveedor: null, fecha_respuesta: '2026-07-13T00:00:00.000Z' },
  ],
};

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [requisicionMock] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/requisiciones/req-1/solicitud-cotizacion') return Promise.resolve({ data: { data: solicitudMock } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/compras/comparativas') {
        if (postComparativaResult === 'error') {
          return Promise.reject({ response: { data: { message: 'La marca/modelo excede el límite permitido.' } } });
        }
        return Promise.resolve({ data: { data: { id_cuadro: 'cuadro-real-1' } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

describe('ComprasView — error al crear el Cuadro Comparativo', () => {
  it('si POST /comparativas falla, muestra un error y no abre ningún cuadro', async () => {
    postComparativaResult = 'error';
    notify.mockClear();
    render(<ComprasView activeSubView="requisiciones" />);

    const boton = await screen.findByRole('button', { name: /Iniciar comparativa|Crear Cuadro Comparativo/i });
    fireEvent.click(boton);

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })));
    expect(screen.queryByText(/Sin proveedores/i)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Iniciar comparativa|Crear Cuadro Comparativo/i })).toBeInTheDocument();
  });

  it('si POST /comparativas responde bien, abre el cuadro con el id real del backend', async () => {
    postComparativaResult = 'ok';
    notify.mockClear();
    render(<ComprasView activeSubView="requisiciones" />);

    const boton = await screen.findByRole('button', { name: /Iniciar comparativa|Crear Cuadro Comparativo/i });
    fireEvent.click(boton);

    await waitFor(() => expect(screen.getByText('REQ-0001')).toBeInTheDocument());
    expect(notify).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });
});

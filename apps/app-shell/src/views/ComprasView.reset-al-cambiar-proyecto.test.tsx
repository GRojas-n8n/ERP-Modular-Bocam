import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/fix-estado-detalle-al-cambiar-proyecto. Reproduce el
 * bug real de producción (2026-07-13, usuario con rol residencia): al
 * cambiar de proyecto activo mientras se tenía abierto el detalle de un
 * cuadro comparativo, la vista se quedaba atorada mostrando (o intentando
 * mostrar) el cuadro del proyecto anterior en vez de volver a la lista de
 * requisiciones del proyecto nuevo.
 */

let currentProjectId = 'proyecto-A';

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    get currentProjectId() { return currentProjectId; },
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['procurement'] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const requisicionMock = {
  id_requisicion: 'req-proyecto-a',
  codigo: 'REQ-A-0001',
  fecha_solicitud: '2026-07-13',
  solicitante_nombre: 'Residente Prueba',
  estado: 'APROBADA',
  tipo: 'NORMAL',
  items: [],
};

const comparativaMock = {
  id_cuadro: 'comp-proyecto-a',
  requisicion_id: 'req-proyecto-a',
  estado: 'BORRADOR',
  detalles: [],
};

vi.mock('../lib/api', () => ({
  default: {
    // El backend real filtra por proyecto activo (confirmado en logs de
    // producción) — la requisición/cuadro del proyecto A no existe en la
    // respuesta cuando el proyecto activo es B, igual que en producción.
    get: vi.fn((url: string) => {
      const esProyectoA = currentProjectId === 'proyecto-A';
      if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: esProyectoA ? [requisicionMock] : [] } });
      if (url === '/api/v1/compras/catalog/insumos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/compras/comparativas') return Promise.resolve({ data: { data: esProyectoA ? [comparativaMock] : [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

describe('ComprasView — limpia el detalle abierto al cambiar de proyecto activo', () => {
  it('vuelve a la lista de requisiciones tras cambiar de proyecto, no se queda en el detalle del proyecto anterior', async () => {
    currentProjectId = 'proyecto-A';
    const { rerender } = render(<ComprasView activeSubView="requisiciones" />);

    const botonContinuar = await screen.findByRole('button', { name: /Iniciar comparativa|Crear Cuadro Comparativo|Continuar comparativa/i });
    fireEvent.click(botonContinuar);

    // Confirma que sí entramos al detalle antes de cambiar de proyecto.
    await waitFor(() => expect(screen.getByText('REQ-A-0001')).toBeInTheDocument());

    // Cambiar de proyecto activo — mismo patrón que el switch-project real.
    currentProjectId = 'proyecto-B';
    rerender(<ComprasView activeSubView="requisiciones" />);

    // Debe volver a la lista de requisiciones del proyecto nuevo (vacía en este caso,
    // con su señal positiva de "Sin requisiciones activas") — no quedarse en una
    // pantalla en blanco atorada intentando mostrar el detalle del proyecto anterior.
    await waitFor(() => expect(screen.getByText('Sin requisiciones activas')).toBeInTheDocument());
    expect(screen.queryByText('REQ-A-0001')).not.toBeInTheDocument();
  });
});

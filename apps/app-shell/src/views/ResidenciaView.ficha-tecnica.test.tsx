import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/adjuntos-requisicion-invitacion-cotizar — tarea 3.1.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ tenant: { id: 'bocam-real', name: 'Constructora Bocam' }, currentProjectId: 'proyecto-1' }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const INSUMO_ID = 'insumo-ficha-1';
const CONCEPTO_ID = 'concepto-1';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn((url: string) => {
    if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
    if (url === '/api/v1/compras/requisiciones') return Promise.resolve({ data: { data: [] } });
    if (url === '/api/v1/gerencia-tecnica/presupuesto/activo') {
      return Promise.resolve({
        data: { data: { conceptos: [{ id: CONCEPTO_ID, clave: 'CONC-1', descripcion: 'Cimentación', unidad_medida: 'M3' }] } },
      });
    }
    if (url === '/api/v1/gerencia-tecnica/insumos/explosion') {
      return Promise.resolve({
        data: {
          data: [{
            id: INSUMO_ID, clave: 'MAT-001', descripcion: 'Varilla 3/8',
            unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', cantidad_presupuestada: 10, activo: true,
          }],
        },
      });
    }
    return Promise.resolve({ data: { data: [] } });
  }),
  postMock: vi.fn((url: string, _body?: unknown, _config?: unknown) => {
    if (url === '/api/v1/compras/requisiciones') {
      return Promise.resolve({ data: { data: { id_requisicion: 'req-1', codigo: 'REQ-TEST-1', items: [] } } });
    }
    return Promise.resolve({ data: { data: {} } });
  }),
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

describe('ResidenciaView — ficha técnica al crear una requisición', () => {
  it('permite adjuntar una ficha técnica por insumo y la sube tras crear la requisición', async () => {
    render(<ResidenciaView activeSubView="requisiciones" />);

    fireEvent.click(await screen.findByRole('button', { name: /Nueva Requisición/i }));

    fireEvent.click(await screen.findByRole('button', { name: /CONC-1/i }));

    fireEvent.click(await screen.findByRole('button', { name: /MAT-001/i }));

    const fichaInput = await screen.findByTestId(`ficha-tecnica-${INSUMO_ID}`) as HTMLInputElement;
    const file = new File(['contenido de prueba'], 'ficha-varilla.pdf', { type: 'application/pdf' });
    fireEvent.change(fichaInput, { target: { files: [file] } });

    fireEvent.click(await screen.findByRole('button', { name: /Generar Requisición/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/compras/requisiciones', expect.anything()));

    await waitFor(() => {
      const fichaCall = postMock.mock.calls.find(([url]) => url === `/api/v1/gerencia-tecnica/insumos/${INSUMO_ID}/fichas`);
      expect(fichaCall).toBeTruthy();
    });
    const fichaCall = postMock.mock.calls.find(([url]) => url === `/api/v1/gerencia-tecnica/insumos/${INSUMO_ID}/fichas`)!;
    const formData = fichaCall[1] as unknown as FormData;
    expect(formData.get('archivo')).toBe(file);
    expect(formData.get('nombre_doc')).toBe('ficha-varilla.pdf');
  });
});

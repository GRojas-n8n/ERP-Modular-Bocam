import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos/, tarea 3.
 * Subir una Ficha Técnica de insumo debe pedir confirmación de destino
 * antes de enviar el PDF al backend.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['gerencia_tecnica'], projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const INSUMO = { id: 'insumo-1', clave: 'CFM001', descripcion: 'Tubo Conduit PVC', unidad_medida: 'M', tipo_insumo: 'MATERIAL', costo_base: 65, activo: true, cantidad_presupuestada: 10 };

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn(() => Promise.resolve({ data: { data: null } })) }));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/gerencia-tecnica/insumos/explosion') return Promise.resolve({ data: { data: [INSUMO] } });
      if (url.includes('/fichas')) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

describe('InsumosView — confirmación antes de subir Ficha Técnica', () => {
  it('seleccionar un PDF muestra el diálogo; cancelar no envía nada al backend', async () => {
    render(<InsumosView activeSubView="insumos" />);

    fireEvent.click(await screen.findByText('📎 Fichas'));
    await screen.findByText('Fichas Técnicas');

    const inputFicha = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    const archivo = new File(['contenido'], 'ficha-tubo-conduit.pdf', { type: 'application/pdf' });
    fireEvent.change(inputFicha, { target: { files: [archivo] } });

    await screen.findByText('Confirmar carga de archivo');
    expect(screen.getByText('ficha-tubo-conduit.pdf')).toBeInTheDocument();
    expect(screen.getByText('Gerencia Técnica → Ficha Técnica')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar carga de archivo')).not.toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('confirmar el diálogo sí envía el archivo al backend', async () => {
    render(<InsumosView activeSubView="insumos" />);

    fireEvent.click(await screen.findByText('📎 Fichas'));
    await screen.findByText('Fichas Técnicas');

    const inputFicha = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    const archivo = new File(['contenido'], 'ficha-tubo-conduit.pdf', { type: 'application/pdf' });
    fireEvent.change(inputFicha, { target: { files: [archivo] } });

    await screen.findByText('Confirmar carga de archivo');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/gerencia-tecnica/insumos/insumo-1/fichas',
      expect.any(FormData),
      expect.any(Object)
    ));
  });
});

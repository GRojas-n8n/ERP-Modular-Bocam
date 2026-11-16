import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComprasView } from './ComprasView';

/**
 * Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos/, tarea 5.
 * Subir un documento a un proveedor debe pedir confirmación de destino
 * antes de enviarlo al backend.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['procurement'], projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const PROVEEDOR = { id_proveedor: 'prov-1', razon_social: 'Materiales del Norte S.A.', rfc: 'MDN800101AB1', estatus: 'ACTIVO' };

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn(() => Promise.resolve({ data: { data: { id_doc: 'doc-1' } } })) }));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/compras/proveedores') return Promise.resolve({ data: { data: [PROVEEDOR] } });
      if (url.includes('/documentos')) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  comprasApi: {},
}));

describe('ComprasView — confirmación antes de subir documento de Proveedor', () => {
  it('seleccionar archivo muestra el diálogo; cancelar no envía nada al backend', async () => {
    render(<ComprasView activeSubView="proveedores" />);

    fireEvent.click(await screen.findByText('📎 Docs'));
    await screen.findByText('Documentos del Proveedor');

    const inputArchivo = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    const archivo = new File(['contenido'], 'csd-materiales-del-norte.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });

    await screen.findByText('Confirmar carga de archivo');
    expect(screen.getByText('csd-materiales-del-norte.pdf')).toBeInTheDocument();
    expect(screen.getByText('Compras → Proveedores')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar carga de archivo')).not.toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('confirmar el diálogo sí envía el documento al backend', async () => {
    render(<ComprasView activeSubView="proveedores" />);

    fireEvent.click(await screen.findByText('📎 Docs'));
    await screen.findByText('Documentos del Proveedor');

    const inputArchivo = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    const archivo = new File(['contenido'], 'csd-materiales-del-norte.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });

    await screen.findByText('Confirmar carga de archivo');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      `/api/v1/compras/proveedores/${PROVEEDOR.id_proveedor}/documentos`,
      expect.any(FormData),
      expect.any(Object)
    ));
  });
});

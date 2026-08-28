import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos/.
 *
 * Al seleccionar un archivo de Catálogo de Obra, Explosión de Insumos o
 * APU, iRetum debe pedir confirmación (archivo + destino + proyecto
 * activo) antes de parsearlo. Cancelar no debe abrir ningún panel de
 * preview ni invocar el parser.
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

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: null } })),
    post: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

function archivoDeTexto(nombre: string) {
  return new File(['contenido'], nombre, { type: 'text/csv' });
}

describe('InsumosView — confirmación de destino antes de subir (Catálogo/Explosión/APU)', () => {
  it('Catálogo: seleccionar archivo muestra el diálogo con nombre, destino y proyecto activo', async () => {
    render(<InsumosView activeSubView="catalogo" />);

    const inputCatalogo = document.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;
    fireEvent.change(inputCatalogo, { target: { files: [archivoDeTexto('catalogo_torre_norte.csv')] } });

    await screen.findByText('Confirmar carga de archivo');
    expect(screen.getByText('catalogo_torre_norte.csv')).toBeInTheDocument();
    expect(screen.getByText('Gerencia Técnica → Catálogo de Obra')).toBeInTheDocument();
    expect(screen.getByText(/Torre Corporativa Norte/)).toBeInTheDocument();
  });

  it('Explosión de Insumos: cancelar el diálogo no abre ningún panel de preview', async () => {
    render(<InsumosView activeSubView="insumos" />);

    const inputExplosion = document.querySelectorAll('input[type="file"]')[2] as HTMLInputElement;
    fireEvent.change(inputExplosion, { target: { files: [archivoDeTexto('explosion_torre_norte.csv')] } });

    await screen.findByText('Confirmar carga de archivo');
    expect(screen.getByText('Gerencia Técnica → Explosión de Insumos')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar carga de archivo')).not.toBeInTheDocument();
    expect(screen.queryByText('Vista previa — Explosión de Insumos')).not.toBeInTheDocument();
  });

  it('APU: muestra el destino correcto en el diálogo', async () => {
    render(<InsumosView activeSubView="insumos" />);

    const inputAPU = document.querySelectorAll('input[type="file"]')[1] as HTMLInputElement;
    fireEvent.change(inputAPU, { target: { files: [archivoDeTexto('apu_torre_norte.csv')] } });

    await screen.findByText('Confirmar carga de archivo');
    expect(screen.getByText('Gerencia Técnica → Análisis de Precios Unitarios')).toBeInTheDocument();
  });
});

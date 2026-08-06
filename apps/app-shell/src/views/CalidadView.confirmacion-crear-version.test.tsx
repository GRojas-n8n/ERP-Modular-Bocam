import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CalidadView } from './CalidadView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Crear Versión" ejecutaba el POST directo desde el onClick, sin ninguna
 * confirmación ni referencia al proyecto activo. Ahora debe pasar primero por
 * un diálogo no descartable (ni con clic afuera ni con Escape) que muestra el
 * proyecto activo, y solo llamar al backend si el usuario confirma.
 *
 * Nota: "Crear Documento" (mismo módulo) no se pudo cubrir con un test de UI
 * completo porque el formulario nunca expone un input para `responsable_id`,
 * campo que la validación exige — el botón nunca pasa la validación en la UI
 * real. Es un bug preexistente ajeno a este change (fuera de alcance, sin
 * spec de bug-fix); el wrapper de confirmación se aplicó igual al handler
 * para mantener el mismo patrón, pero queda sin cobertura de integración.
 */

const DOCUMENTO = {
  id_documento: 'doc-1', codigo: 'PRO-2026-001', titulo: 'Procedimiento de prueba', tipo: 'PROCEDIMIENTO',
  descripcion: null, responsable_id: 'user-1', estado_actual: 'VIGENTE', version_actual: '1.0',
  proyecto_id: 'proj-001', created_at: '2026-08-01', _count: { versiones: 1 },
};

const DOCUMENTO_DETALLE = { ...DOCUMENTO, versiones: [] };

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proj-001',
    user: {
      id: 'user-1',
      name: 'Usuario de Prueba',
      role: ['calidad'],
      projects: [{ id: 'proj-001', name: 'Torre Corporativa Norte', code: 'TCN-2024', status: 'En curso' }],
    },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/calidad/dashboard') return Promise.resolve({ data: { data: null } });
      if (url === '/api/v1/calidad/documentos') return Promise.resolve({ data: { data: [DOCUMENTO] } });
      if (url === '/api/v1/calidad/documentos/doc-1') return Promise.resolve({ data: { data: DOCUMENTO_DETALLE } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function abrirDetalleYLlenarNuevaVersion() {
  render(<CalidadView activeSubView="documentos" />);

  fireEvent.click(await screen.findByText('PRO-2026-001'));
  fireEvent.click(await screen.findByRole('button', { name: /Nueva Versión/i }));

  fireEvent.change(await screen.findByPlaceholderText('1.0'), { target: { value: '2.0' } });
  fireEvent.change(screen.getByPlaceholderText('Describe los cambios realizados en esta versión...'), { target: { value: 'Actualización de prueba' } });

  fireEvent.click(screen.getByRole('button', { name: 'Crear Versión' }));
}

describe('CalidadView — confirmación de proyecto activo al crear Versión de documento', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirDetalleYLlenarNuevaVersion();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/calidad/documentos/doc-1/versiones',
      expect.anything(),
      expect.anything()
    ));
  });

  it('cancelar el diálogo no crea la versión', async () => {
    await abrirDetalleYLlenarNuevaVersion();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni crea la versión', async () => {
    await abrirDetalleYLlenarNuevaVersion();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});

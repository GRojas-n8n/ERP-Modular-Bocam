import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CalidadView } from './CalidadView';

function dialogoConfirmacion(): HTMLElement {
  const overlay = document.querySelector('.fixed.inset-0.z-\\[60\\]');
  if (!overlay) throw new Error('No se encontró el diálogo de confirmación');
  return overlay as HTMLElement;
}

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "→ Crear NC" (crear No Conformidad desde un hallazgo de auditoría)
 * ejecutaba el POST directo desde el onClick, sin ninguna confirmación ni
 * referencia al proyecto activo. Ahora debe pasar primero por un diálogo no
 * descartable (ni con clic afuera ni con Escape) que muestra el proyecto
 * activo, y solo llamar al backend si el usuario confirma.
 */

const AUDITORIA = {
  id_auditoria: 'aud-1', codigo: 'AUD-2026-001', titulo: 'Auditoría de prueba',
  estado: 'EN_CURSO', auditor_lider_id: 'user-1', _count: { hallazgos: 1 },
};

const HALLAZGO = {
  id_hallazgo: 'hall-1', descripcion: 'Hallazgo de prueba', tipo: 'MAYOR',
  proceso_afectado: 'Compras', estado: 'ABIERTO', nc_id: null,
};

const AUDITORIA_DETALLE = { ...AUDITORIA, hallazgos: [HALLAZGO] };

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
      if (url === '/api/v1/calidad/auditorias') return Promise.resolve({ data: { data: [AUDITORIA] } });
      if (url === '/api/v1/calidad/auditorias/aud-1') return Promise.resolve({ data: { data: AUDITORIA_DETALLE } });
      if (url === '/api/v1/calidad/documentos') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/calidad/dashboard') return Promise.resolve({ data: { data: null } });
      return Promise.resolve({ data: { data: null } });
    }),
    post: postMock,
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function abrirAuditoriaYClicCrearNC() {
  render(<CalidadView activeSubView="auditorias" />);

  fireEvent.click(await screen.findByText('AUD-2026-001'));
  fireEvent.click(await screen.findByRole('button', { name: '→ Crear NC' }));
}

describe('CalidadView — confirmación de proyecto activo al crear NC desde hallazgo', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirAuditoriaYClicCrearNC();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(within(dialogoConfirmacion()).getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/api/v1/calidad/auditorias/aud-1/hallazgos/hall-1/crear-nc',
      expect.anything()
    ));
  });

  it('cancelar el diálogo no crea la NC', async () => {
    await abrirAuditoriaYClicCrearNC();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(within(dialogoConfirmacion()).getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('un clic fuera del diálogo (overlay) no lo cierra ni crea la NC', async () => {
    await abrirAuditoriaYClicCrearNC();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    const overlay = document.querySelector('.absolute.inset-0.bg-black\\/50');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});

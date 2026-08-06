import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResidenciaView } from './ResidenciaView';

/**
 * Ver openspec/changes/confirmacion-proyecto-en-altas. Antes de este change,
 * "Guardar asistencia" (registro manual masivo de asistencia de una
 * cuadrilla) ejecutaba el POST directo desde el onClick, sin ninguna
 * confirmación ni referencia al proyecto activo. Ahora debe pasar primero
 * por un diálogo no descartable (ni con clic afuera ni con Escape) que
 * muestra el proyecto activo, y solo llama al backend si el usuario
 * confirma.
 *
 * Nota: el registro individual por clic ("toggle" de presente/ausente por
 * empleado en la lista del día) se dejó deliberadamente FUERA de esta
 * confirmación — es una acción de un solo clic, de alta frecuencia (se
 * puede repetir decenas de veces por día por cuadrilla), con actualización
 * optimista de UI; agregar un diálogo por cada toggle contradice el
 * requirement de "no agregar fricción a flujos de alta frecuente" del
 * design.md de este change.
 */

const CUADRILLA = {
  id_cuadrilla: 'cuad-1', nombre: 'Cuadrilla Norte', codigo: 'CUA-01',
  miembros: [{ id_empleado: 'emp-1', nombre: 'Juan', apellido_paterno: 'Pérez', puesto: 'Fierrero', modo_asistencia: 'JORNADA_COMPLETA' }],
};

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));

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

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/asistencia') return Promise.resolve({ data: { data: [] } });
      if (url === '/api/v1/personal/cuadrillas') return Promise.resolve({ data: { data: [CUADRILLA] } });
      if (url === '/api/v1/control-proyectos/dashboard/residente') return Promise.reject(new Error('no dashboard en test'));
      return Promise.resolve({ data: { data: [] } });
    }),
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: {} } })),
  },
}));

async function abrirModalYGuardar() {
  render(<ResidenciaView activeSubView="asistencia" />);

  fireEvent.click(await screen.findByText(/Manual CUA-01/i));
  fireEvent.click(await screen.findByRole('button', { name: /Guardar asistencia/i }));
}

describe('ResidenciaView — confirmación de proyecto activo al guardar asistencia manual masiva', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('no llama al backend hasta que el usuario confirma en el diálogo con el proyecto activo', async () => {
    await abrirModalYGuardar();

    expect(postMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/personal/asistencia/bulk', expect.anything()));
  });

  it('cancelar el diálogo no guarda la asistencia', async () => {
    await abrirModalYGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(postMock).not.toHaveBeenCalled();
  });

  it('la tecla Escape no cierra el diálogo ni guarda la asistencia', async () => {
    await abrirModalYGuardar();
    await screen.findByText('Proyecto activo: Torre Corporativa Norte');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(postMock).not.toHaveBeenCalled();
    expect(screen.getByText('Proyecto activo: Torre Corporativa Norte')).toBeInTheDocument();
  });
});

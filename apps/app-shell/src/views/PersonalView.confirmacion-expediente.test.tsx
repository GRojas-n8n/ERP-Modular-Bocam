import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos/, tarea 4.
 * Subir un documento al expediente de un empleado debe pedir confirmación
 * de destino antes de enviarlo al backend.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['personal_rh'], projects: [{ id: 'proyecto-1', name: 'Torre Corporativa Norte', code: 'TCN-2024' }] },
  }),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));

const empleadoMock = {
  id_empleado: 'emp-existente-1', numero_empleado: 'EMP-010',
  nombre: 'Ana', apellido_paterno: 'García', apellido_materno: 'López',
  rfc: 'GALA800101AB1', curp: 'GALA800101MDFRPN01', nss: '12345678901',
  puesto: 'Albañil', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 320,
};

const dashboardMock = {
  resumen: { total_empleados: 1, empleados_activos: 1, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn(() => Promise.resolve({ data: { data: null } })) }));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [empleadoMock] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      if (url.includes('/config-deducciones')) return Promise.resolve({ data: { data: {} } });
      if (url.includes('/documentos')) return Promise.resolve({ data: { data: [] } });
      if (url.includes('/residentes')) return Promise.resolve({ data: { data: [] } });
      if (url.includes('/credencial')) return Promise.resolve({ data: { data: null } });
      if (url.includes('/frente-trabajo')) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: postMock,
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

describe('PersonalView — confirmación antes de subir documento al expediente', () => {
  it('seleccionar archivo y hacer clic en "Subir documento" muestra el diálogo; cancelar no envía nada', async () => {
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Deducciones' }));
    await screen.findByText('Expediente');

    const inputArchivo = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    const archivo = new File(['contenido'], 'ine-ana-garcia.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByRole('button', { name: /Subir documento/i }));

    await screen.findByText('Confirmar carga de archivo');
    expect(screen.getByText('ine-ana-garcia.pdf')).toBeInTheDocument();
    expect(screen.getByText('Personal → Empleados (expediente)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('Confirmar carga de archivo')).not.toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('confirmar el diálogo sí envía el documento al backend', async () => {
    render(<PersonalView activeSubView="empleados" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Deducciones' }));
    await screen.findByText('Expediente');

    const inputArchivo = document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    const archivo = new File(['contenido'], 'ine-ana-garcia.pdf', { type: 'application/pdf' });
    fireEvent.change(inputArchivo, { target: { files: [archivo] } });
    fireEvent.click(screen.getByRole('button', { name: /Subir documento/i }));

    await screen.findByText('Confirmar carga de archivo');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      `/api/v1/personal/empleados/${empleadoMock.id_empleado}/documentos`,
      expect.any(FormData),
      expect.any(Object)
    ));
  });
});

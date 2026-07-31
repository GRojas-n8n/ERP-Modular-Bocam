import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalView } from './PersonalView';

/**
 * Ver openspec/changes/fix-imprimir-lote-credenciales-sin-aviso.
 * Antes, si el backend excluía a todos (o parte) de los empleados
 * seleccionados por no pertenecer al proyecto activo, el frontend abría una
 * hoja de impresión en blanco/incompleta sin avisar nada al usuario.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['personal_rh'] },
  }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,fake')) },
}));

vi.mock('../lib/credencialesPrint', () => ({
  construirHojaCredenciales: vi.fn(() => '<html></html>'),
}));

const empleado1 = {
  id_empleado: 'emp-1', numero_empleado: 'EMP-001', nombre: 'Juan', apellido_paterno: 'Pérez',
  puesto: 'Fierrero', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 350, cuadrilla: null,
};
const empleado2 = {
  id_empleado: 'emp-2', numero_empleado: 'EMP-002', nombre: 'Pedro', apellido_paterno: 'González',
  puesto: 'Albañil', categoria: 'OBRERO', estado: 'ACTIVO', salario_diario: 320, cuadrilla: null,
};

const dashboardMock = {
  resumen: { total_empleados: 2, empleados_activos: 2, cuadrillas_activas: 0, asignaciones_activas: 0 },
  asistencia_hoy: { presentes: 0, ausentes: 0, pct_asistencia: 0 },
  ultima_prenomina: null,
  alertas: [],
};

let imprimirLoteResult: { credenciales: unknown[]; excluidos: string[] } = { credenciales: [], excluidos: [] };

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados') return Promise.resolve({ data: { data: [empleado1, empleado2] } });
      if (url === '/api/v1/personal/dashboard') return Promise.resolve({ data: { data: dashboardMock } });
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/personal/empleados/credenciales/imprimir-lote') {
        return Promise.resolve({ data: { data: imprimirLoteResult } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    put: vi.fn(() => Promise.resolve({ data: { data: null } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
    delete: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function seleccionarPrimerEmpleadoYClickImprimir() {
  render(<PersonalView activeSubView="empleados" />);
  await screen.findByText('EMP-001');

  const checkboxes = screen.getAllByRole('checkbox');
  // checkboxes[0] es "seleccionar todos"; el primer empleado es checkboxes[1].
  fireEvent.click(checkboxes[1]);

  const botonImprimir = await screen.findByRole('button', { name: /Imprimir credenciales/i });
  fireEvent.click(botonImprimir);
}

describe('PersonalView — imprimir credenciales en lote', () => {
  it('si ningún empleado seleccionado es elegible, no abre ventana y avisa con notify de error', async () => {
    imprimirLoteResult = { credenciales: [], excluidos: ['emp-1'] };
    notify.mockClear();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    await seleccionarPrimerEmpleadoYClickImprimir();

    await waitFor(() => expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', title: expect.stringMatching(/pertenece al proyecto activo/i) }),
    ));
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('si hay exclusión parcial, abre la hoja con los elegibles y además avisa cuántos quedaron fuera', async () => {
    imprimirLoteResult = {
      credenciales: [{
        empleado: { id_empleado: 'emp-1', numero_empleado: 'EMP-001', nombre: 'Juan', apellido_paterno: 'Pérez', puesto: 'Fierrero', categoria: 'OBRERO', contacto_emergencia: null },
        token: 'tok-abc', emitida_en: new Date().toISOString(), foto_documento_id: null,
      }],
      excluidos: ['emp-2'],
    };
    notify.mockClear();
    const fakeWindow = { document: { write: vi.fn(), close: vi.fn() } };
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeWindow as any);

    await seleccionarPrimerEmpleadoYClickImprimir();

    await waitFor(() => expect(openSpy).toHaveBeenCalled());
    expect(fakeWindow.document.write).toHaveBeenCalled();
    await waitFor(() => expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', title: expect.stringMatching(/1 empleado\(s\) excluido/i) }),
    ));

    openSpy.mockRestore();
  });
});

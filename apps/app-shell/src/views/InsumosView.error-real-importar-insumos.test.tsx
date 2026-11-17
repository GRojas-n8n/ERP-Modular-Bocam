import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ExcelJS from 'exceljs';
import { InsumosView } from './InsumosView';

/**
 * Ver openspec/changes/fix-500-importar-apu-explosion-filas-boilerplate/.
 * `handleConfirmarInsumos` leía `err.response?.data?.message`, pero el
 * backend devuelve el mensaje bajo `error.message` — el toast solo mostraba
 * el texto genérico de Axios, ocultando la causa real de un fallo.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 'bocam-real', name: 'Constructora Bocam' },
    currentProjectId: 'proyecto-1',
    user: { id: 'user-1', name: 'Usuario de Prueba', role: ['gerencia_tecnica'] },
  }),
}));

const { notifyMock } = vi.hoisted(() => ({ notifyMock: vi.fn() }));
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify: notifyMock }),
}));

const MENSAJE_REAL_BACKEND = 'Ningún insumo válido en el lote. Omitidos: 3.';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: null } })),
    post: vi.fn((url: string) => {
      if (url === '/api/v1/gerencia-tecnica/insumos/importar-lote') {
        return Promise.reject({ response: { data: { error: { message: MENSAJE_REAL_BACKEND } } } });
      }
      return Promise.resolve({ data: { data: null } });
    }),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
}));

async function construirArchivoAPU(): Promise<File> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet');
  ws.addRow(['', 'Clave:', '2.1.1']);
  ws.addRow(['', 'CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'RENDIMIENTO', 'COSTO UNITARIO']);
  ws.addRow(['Mano de obra']);
  ws.addRow(['', 'HBD001', 'CABO DE OFICIOS', 'JOR', 0.1, '', 1323.72]);
  const buffer = await wb.xlsx.writeBuffer();
  return new File([buffer], 'apu-prueba.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

describe('InsumosView — mensaje de error real al fallar la importación de insumos', () => {
  it('muestra error.message del backend en vez del texto genérico de la petición', async () => {
    render(<InsumosView activeSubView="insumos" />);

    const archivo = await construirArchivoAPU();
    const inputAPU = document.querySelectorAll('input[type="file"]')[1] as HTMLInputElement;
    fireEvent.change(inputAPU, { target: { files: [archivo] } });

    // Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos: la
    // selección de archivo ahora pide confirmar destino antes de parsear.
    await screen.findByText('Confirmar carga de archivo');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    // Timeout ampliado: parsear un .xlsx real vía ExcelJS/FileReader es más
    // pesado que una espera de UI típica, y esta prueba puede quedar lenta
    // bajo carga si corre junto a todo el suite en paralelo.
    await screen.findByText('Vista previa — Importación APU', {}, { timeout: 5000 });
    fireEvent.click(await screen.findByRole('button', { name: /Confirmar \(\d+ insumos\)/ }, { timeout: 5000 }));

    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: MENSAJE_REAL_BACKEND })
    ));
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComparativaDetail } from './ComparativaDetail';
import type { ComparativaLocal } from './ComparativaDetail';

/**
 * Ver openspec/changes/fix-emparejamiento-pdf-cotizacion. Reproduce el bug
 * real de producción (2026-07-13, requisición 80ffce1d): "Aplicar al
 * cuadro" reportaba éxito genérico aunque el emparejamiento por substring de
 * 10 caracteres no encontrara ningún renglón, dejando la tabla sin precios.
 */

vi.mock('../context/TenantContext', () => ({
  useTenant: () => ({ user: { id: 'user-1', name: 'Compras de Prueba', role: ['procurement'] } }),
}));

const notify = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ notify }),
}));

let renglonesMock: { renglones: { descripcion: string; unidad: string; cantidad: number; precio_unitario: number }[] } = { renglones: [] };

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: {} } })),
    post: vi.fn(() => Promise.resolve({ data: { data: renglonesMock } })),
    put: vi.fn(() => Promise.resolve({ data: { data: { pdf_nombre: 'cotizacion.pdf', updated_at: '2026-07-13T00:00:00.000Z' } } })),
    patch: vi.fn(() => Promise.resolve({ data: { data: null } })),
  },
  asistenteApi: {
    leerCotizacionPDF: () => Promise.resolve({ data: { data: renglonesMock } }),
  },
  comprasApi: {
    subirCotizacionPdf: () => Promise.resolve({ data: { data: { pdf_nombre: 'cotizacion.pdf', updated_at: '2026-07-13T00:00:00.000Z' } } }),
  },
}));

function buildComparativa(overrides: Partial<ComparativaLocal> = {}): ComparativaLocal {
  return {
    id: 'cuadro-1',
    codigo: 'CC-TEST-1',
    requisicion_id: 'req-1',
    estado: 'EN_PROCESO',
    revision: 'A',
    primera_opcion_proveedor_id: null,
    segunda_opcion_proveedor_id: null,
    proveedores: [{ id: 'prov-1', nombre: 'Proveedor Uno' }],
    lineas: [{
      id: 'linea-1',
      insumo_id: 'insumo-1',
      insumo_clave: '—',
      insumo_descripcion: 'Mini Split Inverter de 1 Tonelada (12,000 BTU) a 220V',
      insumo_unidad: 'pza',
      cantidad: 1,
      precios: {},
      fechasEntrega: {},
      ganador: null,
      evaluacion_tecnica: 'PENDIENTE',
    }],
    lineas_detalle: [],
    anotaciones_spec: [],
    evaluaciones_especificacion: [],
    ordenes_compra: [],
    ...overrides,
  } as unknown as ComparativaLocal;
}

async function subirPdf(file: File) {
  fireEvent.click(await screen.findByTitle('Subir cotización PDF'));
  const input = document.querySelector('input[type="file"][accept="application/pdf"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  await screen.findByText(/Revisión de cotización PDF|renglón/i);
}

describe('ComparativaDetail — emparejamiento de renglones de PDF con líneas del cuadro', () => {
  it('aplica el precio aunque la descripción del PDF no comparta prefijo con la línea (caso real de producción)', async () => {
    renglonesMock = { renglones: [{ descripcion: 'Minisplit Inverter 1 Ton 220V', unidad: 'pza', cantidad: 1, precio_unitario: 8500 }] };
    const onUpdate = vi.fn();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="compras"
      />
    );

    await subirPdf(new File(['contenido'], 'cotizacion.pdf', { type: 'application/pdf' }));
    fireEvent.click(await screen.findByRole('button', { name: /Aplicar al cuadro/i }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    const lineasActualizadas = onUpdate.mock.calls.at(-1)![0].lineas;
    expect(lineasActualizadas[0].precios['prov-1']).toBe('8500');
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('avisa con warning y no aplica ningún precio cuando ninguna línea logra emparejar', async () => {
    renglonesMock = { renglones: [{ descripcion: 'Cemento gris 50kg', unidad: 'bulto', cantidad: 10, precio_unitario: 250 }] };
    const onUpdate = vi.fn();

    render(
      <ComparativaDetail
        requisicionFolio="REQ-TEST-1"
        comparativa={buildComparativa()}
        insumos={[]}
        isDemo={false}
        onBack={vi.fn()}
        onUpdate={onUpdate}
        modo="compras"
      />
    );

    await subirPdf(new File(['contenido'], 'cotizacion.pdf', { type: 'application/pdf' }));
    fireEvent.click(await screen.findByRole('button', { name: /Aplicar al cuadro/i }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    const lineasActualizadas = onUpdate.mock.calls.at(-1)![0].lineas;
    expect(lineasActualizadas[0].precios['prov-1']).toBeUndefined();
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning', title: 'Cotización aplicada parcialmente' }));
  });
});

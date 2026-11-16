import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EgresoMultiproveedorModal } from './EgresoMultiproveedorModal';

/**
 * openspec: pantalla-egreso-multiproveedor (M10). Un egreso liquida OCs de varios proveedores del proyecto: la
 * pantalla agrupa por proveedor, precarga el saldo, calcula el total en vivo, no deja exceder el saldo y envía solo
 * { oc_id, monto_aplicado } (el servidor resuelve proveedor, código y saldos). Nunca consulta Compras (F9).
 */

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));
vi.mock('../../lib/api', () => ({ default: { get: getMock, post: postMock } }));

const OCS = [
  { oc_id: 'a0000000-0000-4000-8000-000000000001', oc_codigo: 'OC-001', proveedor_id: 'p1', proveedor_nombre: 'Aceros del Norte', total: 1000, pagado: 0, saldo: 1000, estado: 'POR_PAGAR' },
  { oc_id: 'a0000000-0000-4000-8000-000000000002', oc_codigo: 'OC-002', proveedor_id: 'p1', proveedor_nombre: 'Aceros del Norte', total: 800, pagado: 300, saldo: 500, estado: 'PAGO_PARCIAL' },
  { oc_id: 'a0000000-0000-4000-8000-000000000003', oc_codigo: 'OC-003', proveedor_id: 'p2', proveedor_nombre: 'Eléctrica Baja', total: 250.5, pagado: 0, saldo: 250.5, estado: 'POR_PAGAR' },
];
const CUENTAS = [{ id_cuenta: 'c0000000-0000-4000-8000-000000000001', alias: 'Operación', banco: 'BBVA', saldo: 100000 }];

function montar(onRegistrado = vi.fn()) {
  render(
    <EgresoMultiproveedorModal abierto cuentas={CUENTAS} proyectoNombre="Torre Norte" proyectoColor="bg-emerald-500"
      onCerrar={vi.fn()} onRegistrado={onRegistrado} />,
  );
  return onRegistrado;
}

function llenarEncabezado() {
  fireEvent.change(screen.getByLabelText('Cuenta *'), { target: { value: CUENTAS[0].id_cuenta } });
  fireEvent.change(screen.getByLabelText('Referencia *'), { target: { value: 'SPEI-77' } });
  fireEvent.change(screen.getByLabelText('Concepto *'), { target: { value: 'Pago semanal' } });
}

describe('EgresoMultiproveedorModal', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockClear();
    getMock.mockImplementation(() => Promise.resolve({ data: { data: OCS } }));
  });

  it('agrupa por proveedor y solo consulta Finanzas', async () => {
    montar();
    expect(await screen.findByText('Aceros del Norte')).toBeInTheDocument();
    expect(screen.getByText('Eléctrica Baja')).toBeInTheDocument();
    expect(getMock).toHaveBeenCalledWith('/api/v1/finanzas/ocs-por-pagar');
    expect(getMock.mock.calls.every(([url]) => !String(url).includes('/compras/'))).toBe(true);
  });

  it('precarga el saldo, suma en vivo y envía 3 OCs de 2 proveedores con oc_id y monto', async () => {
    const onRegistrado = montar();
    fireEvent.click(await screen.findByLabelText('Seleccionar OC-001'));
    fireEvent.click(screen.getByLabelText('Seleccionar OC-002'));
    fireEvent.click(screen.getByLabelText('Seleccionar OC-003'));
    expect(screen.getByLabelText('Monto OC-002')).toHaveValue(500);
    fireEvent.change(screen.getByLabelText('Monto OC-001'), { target: { value: '400' } });
    expect(screen.getByTestId('egreso-total').textContent).toContain('1,150.50');
    expect(screen.getByText(/3 OCs · 2 proveedores/)).toBeInTheDocument();

    llenarEncabezado();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Pago' }));
    const dialogo = document.querySelector('.fixed.inset-0.z-\\[60\\]') as HTMLElement;
    fireEvent.click(within(dialogo).getByText('Confirmar'));

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    const [url, body] = postMock.mock.calls[0] as unknown as [string, any];
    expect(url).toBe('/api/v1/finanzas/pagos-oc');
    expect(body).toMatchObject({ fuente: 'CUENTA_BANCARIA', cuenta_id: CUENTAS[0].id_cuenta, tipo_pago: 'TRANSFERENCIA', referencia: 'SPEI-77' });
    expect(body.detalles).toEqual([
      { oc_id: OCS[0].oc_id, monto_aplicado: 400 },
      { oc_id: OCS[1].oc_id, monto_aplicado: 500 },
      { oc_id: OCS[2].oc_id, monto_aplicado: 250.5 },
    ]);
    await waitFor(() => expect(onRegistrado).toHaveBeenCalledWith('SPEI-77', 1150.5));
  });

  it('un monto mayor al saldo o sin OCs seleccionadas no llega al backend', async () => {
    montar();
    llenarEncabezado();
    fireEvent.click(await screen.findByRole('button', { name: 'Registrar Pago' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Selecciona al menos una OC');

    fireEvent.click(screen.getByLabelText('Seleccionar OC-002'));
    fireEvent.change(screen.getByLabelText('Monto OC-002'), { target: { value: '500.01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Pago' }));
    expect(screen.getByRole('alert')).toHaveTextContent('excede su saldo');
    expect(postMock).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del error del servidor (formato único de Finanzas)', async () => {
    postMock.mockImplementationOnce(() => Promise.reject({ response: { data: { error: { code: 'FIN_SALDO_INSUFICIENTE', message: 'Saldo insuficiente en la cuenta.' } } } }));
    montar();
    fireEvent.click(await screen.findByLabelText('Seleccionar OC-003'));
    llenarEncabezado();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Pago' }));
    fireEvent.click(within(document.querySelector('.fixed.inset-0.z-\\[60\\]') as HTMLElement).getByText('Confirmar'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Saldo insuficiente en la cuenta.');
  });
});

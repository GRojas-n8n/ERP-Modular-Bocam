import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CuentasPorCobrarSeccion } from './CuentasPorCobrarSeccion';
import { NominasPorPagarSeccion } from './NominasPorPagarSeccion';

/** openspec: pantalla-egreso-multiproveedor (M10): cobro de estimaciones y pago de nómina desde Finanzas. */

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(() => Promise.resolve({ data: { data: null } })),
}));
vi.mock('../../lib/api', () => ({ default: { get: getMock, post: postMock } }));

const CUENTAS = [{ id_cuenta: 'c0000000-0000-4000-8000-000000000001', alias: 'Operación', banco: 'BBVA', saldo: 50000 }];
const confirmar = () => fireEvent.click(within(document.querySelector('.fixed.inset-0.z-\\[60\\]') as HTMLElement).getByText('Confirmar'));

describe('CuentasPorCobrarSeccion', () => {
  beforeEach(() => {
    postMock.mockClear();
    getMock.mockImplementation(() => Promise.resolve({ data: { data: [
      { id_cxc: 'x1', codigo: 'EST-007', concepto: 'Est', monto: 11600, cobrado: 0, saldo: 11600, fecha_vencimiento: '2026-01-01T00:00:00Z', estado: 'POR_COBRAR' },
    ] } }));
  });

  it('marca la vencida, precarga el saldo y registra el cobro con cuenta y folio', async () => {
    const onCambio = vi.fn();
    render(<CuentasPorCobrarSeccion cuentas={CUENTAS} proyectoNombre="Torre" proyectoColor="bg-emerald-500" onCambio={onCambio} />);
    expect(await screen.findByText(/vencida/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Registrar cobro/i }));
    expect(screen.getByLabelText('Monto *')).toHaveValue(11600);
    fireEvent.change(screen.getByLabelText('Monto *'), { target: { value: '11600.01' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Registrar cobro/i }).at(-1)!);
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona la cuenta');
    fireEvent.change(screen.getByLabelText('Cuenta que recibe *'), { target: { value: CUENTAS[0].id_cuenta } });
    fireEvent.change(screen.getByLabelText('Folio del depósito *'), { target: { value: 'DEP-1' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Registrar cobro/i }).at(-1)!);
    expect(screen.getByRole('alert')).toHaveTextContent('excede el saldo');
    fireEvent.change(screen.getByLabelText('Monto *'), { target: { value: '5000' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Registrar cobro/i }).at(-1)!);
    confirmar();
    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/finanzas/cuentas-por-cobrar/x1/cobros',
      expect.objectContaining({ cuenta_id: CUENTAS[0].id_cuenta, folio: 'DEP-1', monto: 5000 })));
    await waitFor(() => expect(onCambio).toHaveBeenCalled());
  });
});

describe('NominasPorPagarSeccion', () => {
  beforeEach(() => {
    postMock.mockClear();
    getMock.mockImplementation(() => Promise.resolve({ data: { data: [
      { prenomina_id: 'n1', codigo: 'NOM-45', periodo_inicio: '2026-11-02T00:00:00Z', periodo_fin: '2026-11-08T00:00:00Z', total_neto: 18000, total_empleados: 9 },
    ] } }));
  });

  it('paga la nómina desde la cuenta elegida con referencia', async () => {
    const onCambio = vi.fn();
    render(<NominasPorPagarSeccion cuentas={CUENTAS} proyectoNombre="Torre" proyectoColor="bg-emerald-500" onCambio={onCambio} />);
    fireEvent.click(await screen.findByRole('button', { name: /Pagar nómina/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /Pagar nómina/i }).at(-1)!);
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona la cuenta');
    fireEvent.change(screen.getByLabelText('Cuenta de pago *'), { target: { value: CUENTAS[0].id_cuenta } });
    fireEvent.change(screen.getByLabelText('Referencia *'), { target: { value: 'SPEI-NOM-45' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Pagar nómina/i }).at(-1)!);
    confirmar();
    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/api/v1/finanzas/nominas-por-pagar/n1/pagar',
      expect.objectContaining({ cuenta_id: CUENTAS[0].id_cuenta, referencia: 'SPEI-NOM-45' })));
    await waitFor(() => expect(onCambio).toHaveBeenCalled());
  });
});

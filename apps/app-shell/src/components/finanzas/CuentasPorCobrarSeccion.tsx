import React, { useEffect, useState } from 'react';
import { Button, ConfirmCriticalActionDialog, EmptyStatePanel, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@bocam/ui-core';
import api from '../../lib/api';
import { CLASE_CAMPO, CLASE_ETIQUETA, type CuentaBancaria, formatoMoneda, hoyIso, mensajeDeError, montoValido } from './comun';

/**
 * Cuentas por cobrar (estimaciones aprobadas) y registro de cobros a una cuenta bancaria.
 * Endpoints: GET /api/v1/finanzas/cuentas-por-cobrar y POST /cuentas-por-cobrar/:id/cobros.
 * openspec: pantalla-egreso-multiproveedor (M10), sobre cuentas-por-cobrar-estimaciones (M4).
 */

interface CuentaPorCobrar {
  id_cxc: string;
  codigo: string;
  concepto: string;
  monto: number;
  cobrado: number;
  saldo: number;
  fecha_vencimiento: string;
  estado: string;
}

interface Props {
  cuentas: CuentaBancaria[];
  proyectoNombre: string;
  proyectoColor: string;
  onCambio: () => void;
}

export const CuentasPorCobrarSeccion: React.FC<Props> = ({ cuentas, proyectoNombre, proyectoColor, onCambio }) => {
  const [filas, setFilas] = useState<CuentaPorCobrar[]>([]);
  const [activa, setActiva] = useState<CuentaPorCobrar | null>(null);
  const [form, setForm] = useState({ cuenta_id: '', folio: '', monto: '', fecha_cobro: hoyIso() });
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => api.get('/api/v1/finanzas/cuentas-por-cobrar')
    .then((r) => setFilas(r.data?.data ?? []))
    .catch(() => setFilas([]));

  useEffect(() => { void cargar(); }, []);

  const abrir = (cxc: CuentaPorCobrar) => {
    setActiva(cxc);
    setForm({ cuenta_id: '', folio: '', monto: cxc.saldo.toFixed(2), fecha_cobro: hoyIso() });
    setError(null);
  };

  const solicitar = () => {
    if (!activa) return;
    const m = montoValido(form.monto);
    const motivo = !form.cuenta_id ? 'Selecciona la cuenta que recibe el cobro.'
      : !form.folio.trim() ? 'El folio del depósito es obligatorio.'
      : m === null ? 'El monto debe ser mayor a cero con máximo 2 decimales.'
      : m > activa.saldo + 1e-9 ? `El cobro excede el saldo por cobrar (${formatoMoneda(activa.saldo)}).`
      : null;
    setError(motivo);
    if (!motivo) setConfirmar(true);
  };

  const registrar = async () => {
    if (!activa) return;
    setConfirmar(false);
    setGuardando(true);
    try {
      await api.post(`/api/v1/finanzas/cuentas-por-cobrar/${activa.id_cxc}/cobros`, {
        cuenta_id: form.cuenta_id, folio: form.folio.trim(), monto: montoValido(form.monto), fecha_cobro: form.fecha_cobro,
      });
      setActiva(null);
      await cargar();
      onCambio();
    } catch (e) {
      setError(mensajeDeError(e, 'Error al registrar el cobro.'));
    } finally {
      setGuardando(false);
    }
  };

  const vencida = (f: CuentaPorCobrar) => new Date(f.fecha_vencimiento) < new Date();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest">Cuentas por cobrar</h2>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimaciones aprobadas pendientes de cobro al cliente</p>
      </div>
      {filas.length === 0 ? (
        <EmptyStatePanel title="Sin cuentas por cobrar" description="Las estimaciones aprobadas aparecerán aquí para registrar su cobro." />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Estimación</TableHeader>
                <TableHeader>Vence</TableHeader>
                <TableHeader className="text-right">Monto</TableHeader>
                <TableHeader className="text-right">Cobrado</TableHeader>
                <TableHeader className="text-right">Saldo</TableHeader>
                <TableHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((f) => (
                <TableRow key={f.id_cxc}>
                  <TableCell className="font-mono text-xs">{f.codigo}</TableCell>
                  <TableCell className={vencida(f) ? 'text-xs font-bold text-red-600' : 'text-xs'}>
                    {new Date(f.fecha_vencimiento).toLocaleDateString('es-MX')}{vencida(f) ? ' · vencida' : ''}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatoMoneda(f.monto)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatoMoneda(f.cobrado)}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-700">{formatoMoneda(f.saldo)}</TableCell>
                  <TableCell className="text-right">
                    <Button className="rounded-lg border border-border px-3 py-1 text-[10px] font-black uppercase" onClick={() => abrir(f)}>
                      Registrar cobro
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setActiva(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-sm font-bold uppercase tracking-widest">Cobro de {activa.codigo}</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">Saldo por cobrar: {formatoMoneda(activa.saldo)}</p>
            {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className={CLASE_ETIQUETA} htmlFor="cobro-cuenta">Cuenta que recibe *</label>
                <select id="cobro-cuenta" className={CLASE_CAMPO} value={form.cuenta_id} onChange={(e) => setForm((x) => ({ ...x, cuenta_id: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {cuentas.map((c) => <option key={c.id_cuenta} value={c.id_cuenta}>{c.alias} · {c.banco}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={CLASE_ETIQUETA} htmlFor="cobro-folio">Folio del depósito *</label>
                  <input id="cobro-folio" className={`${CLASE_CAMPO} font-mono`} value={form.folio} onChange={(e) => setForm((x) => ({ ...x, folio: e.target.value }))} />
                </div>
                <div>
                  <label className={CLASE_ETIQUETA} htmlFor="cobro-monto">Monto *</label>
                  <input id="cobro-monto" type="number" step="0.01" className={`${CLASE_CAMPO} text-right font-mono`} value={form.monto} onChange={(e) => setForm((x) => ({ ...x, monto: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={CLASE_ETIQUETA} htmlFor="cobro-fecha">Fecha *</label>
                <input id="cobro-fecha" type="date" className={CLASE_CAMPO} value={form.fecha_cobro} onChange={(e) => setForm((x) => ({ ...x, fecha_cobro: e.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1 rounded-xl bg-emerald-600 text-xs font-black uppercase text-white hover:bg-emerald-700" disabled={guardando} onClick={solicitar}>
                {guardando ? 'Guardando...' : 'Registrar cobro'}
              </Button>
              <Button className="flex-1 rounded-xl border border-border text-xs font-black uppercase" onClick={() => setActiva(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmCriticalActionDialog
        open={confirmar}
        dismissible={false}
        title={`¿Registrar cobro de ${activa?.codigo ?? ''} por ${formatoMoneda(montoValido(form.monto) ?? 0)}?`}
        projectName={proyectoNombre}
        projectColorDot={proyectoColor}
        confirmDisabled={guardando}
        onConfirm={() => void registrar()}
        onCancel={() => setConfirmar(false)}
      />
    </div>
  );
};

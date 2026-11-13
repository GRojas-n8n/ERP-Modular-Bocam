import React, { useEffect, useState } from 'react';
import { Button, ConfirmCriticalActionDialog, EmptyStatePanel, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@bocam/ui-core';
import api from '../../lib/api';
import { CLASE_CAMPO, CLASE_ETIQUETA, type CuentaBancaria, formatoMoneda, hoyIso, mensajeDeError } from './comun';

/**
 * Nóminas autorizadas por RH pendientes de pago. Finanzas las paga desde una cuenta bancaria y Personal las marca
 * PAGADAS al recibir finanzas.nomina_pagada. Endpoints: GET /api/v1/finanzas/nominas-por-pagar y
 * POST /nominas-por-pagar/:prenominaId/pagar. openspec: pantalla-egreso-multiproveedor (M10), sobre
 * nomina-pagada-por-finanzas (M9).
 */

interface NominaPorPagar {
  prenomina_id: string;
  codigo: string;
  periodo_inicio: string | null;
  periodo_fin: string | null;
  total_neto: number;
  total_empleados: number;
}

interface Props {
  cuentas: CuentaBancaria[];
  proyectoNombre: string;
  proyectoColor: string;
  onCambio: () => void;
}

const fecha = (v: string | null) => (v ? new Date(v).toLocaleDateString('es-MX') : '—');

export const NominasPorPagarSeccion: React.FC<Props> = ({ cuentas, proyectoNombre, proyectoColor, onCambio }) => {
  const [filas, setFilas] = useState<NominaPorPagar[]>([]);
  const [activa, setActiva] = useState<NominaPorPagar | null>(null);
  const [form, setForm] = useState({ cuenta_id: '', referencia: '', fecha_pago: hoyIso() });
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => api.get('/api/v1/finanzas/nominas-por-pagar')
    .then((r) => setFilas(r.data?.data ?? []))
    .catch(() => setFilas([]));

  useEffect(() => { void cargar(); }, []);

  const abrir = (n: NominaPorPagar) => {
    setActiva(n);
    setForm({ cuenta_id: '', referencia: '', fecha_pago: hoyIso() });
    setError(null);
  };

  const solicitar = () => {
    const motivo = !form.cuenta_id ? 'Selecciona la cuenta de la que sale la nómina.'
      : !form.referencia.trim() ? 'La referencia del pago es obligatoria.'
      : null;
    setError(motivo);
    if (!motivo) setConfirmar(true);
  };

  const pagar = async () => {
    if (!activa) return;
    setConfirmar(false);
    setGuardando(true);
    try {
      await api.post(`/api/v1/finanzas/nominas-por-pagar/${activa.prenomina_id}/pagar`, {
        cuenta_id: form.cuenta_id, referencia: form.referencia.trim(), fecha_pago: form.fecha_pago,
      });
      setActiva(null);
      await cargar();
      onCambio();
    } catch (e) {
      setError(mensajeDeError(e, 'Error al pagar la nómina.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest">Nómina por pagar</h2>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prenóminas autorizadas por RH; Finanzas registra el pago</p>
      </div>
      {filas.length === 0 ? (
        <EmptyStatePanel title="Sin nóminas por pagar" description="Las prenóminas autorizadas aparecerán aquí para registrar su pago." />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nómina</TableHeader>
                <TableHeader>Periodo</TableHeader>
                <TableHeader className="text-right">Empleados</TableHeader>
                <TableHeader className="text-right">Neto</TableHeader>
                <TableHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((n) => (
                <TableRow key={n.prenomina_id}>
                  <TableCell className="font-mono text-xs">{n.codigo}</TableCell>
                  <TableCell className="text-xs">{fecha(n.periodo_inicio)} – {fecha(n.periodo_fin)}</TableCell>
                  <TableCell className="text-right text-xs">{n.total_empleados}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold">{formatoMoneda(Number(n.total_neto))}</TableCell>
                  <TableCell className="text-right">
                    <Button className="rounded-lg border border-border px-3 py-1 text-[10px] font-black uppercase" onClick={() => abrir(n)}>
                      Pagar nómina
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
            <h2 className="mb-1 text-sm font-bold uppercase tracking-widest">Pago de {activa.codigo}</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">{activa.total_empleados} empleados · neto {formatoMoneda(Number(activa.total_neto))}</p>
            {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className={CLASE_ETIQUETA} htmlFor="nomina-cuenta">Cuenta de pago *</label>
                <select id="nomina-cuenta" className={CLASE_CAMPO} value={form.cuenta_id} onChange={(e) => setForm((x) => ({ ...x, cuenta_id: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {cuentas.map((c) => <option key={c.id_cuenta} value={c.id_cuenta}>{c.alias} · {c.banco} · {formatoMoneda(Number(c.saldo))}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={CLASE_ETIQUETA} htmlFor="nomina-referencia">Referencia *</label>
                  <input id="nomina-referencia" className={`${CLASE_CAMPO} font-mono`} value={form.referencia} onChange={(e) => setForm((x) => ({ ...x, referencia: e.target.value }))} />
                </div>
                <div>
                  <label className={CLASE_ETIQUETA} htmlFor="nomina-fecha">Fecha *</label>
                  <input id="nomina-fecha" type="date" className={CLASE_CAMPO} value={form.fecha_pago} onChange={(e) => setForm((x) => ({ ...x, fecha_pago: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1 rounded-xl bg-emerald-600 text-xs font-black uppercase text-white hover:bg-emerald-700" disabled={guardando} onClick={solicitar}>
                {guardando ? 'Guardando...' : 'Pagar nómina'}
              </Button>
              <Button className="flex-1 rounded-xl border border-border text-xs font-black uppercase" onClick={() => setActiva(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmCriticalActionDialog
        open={confirmar}
        dismissible={false}
        title={`¿Pagar ${activa?.codigo ?? ''} por ${formatoMoneda(Number(activa?.total_neto ?? 0))}?`}
        projectName={proyectoNombre}
        projectColorDot={proyectoColor}
        confirmDisabled={guardando}
        onConfirm={() => void pagar()}
        onCancel={() => setConfirmar(false)}
      />
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Button, ConfirmCriticalActionDialog } from '@bocam/ui-core';
import api from '../../lib/api';
import {
  CLASE_CAMPO, CLASE_ETIQUETA, type CuentaBancaria, formatoMoneda, hoyIso, mensajeDeError, montoValido, redondear2,
} from './comun';

/**
 * Egreso multiproveedor: un cheque, transferencia o SPEI liquida OCs de varios proveedores (cualquier giro) del
 * proyecto activo. Las OCs salen de GET /api/v1/finanzas/ocs-por-pagar (solo Finanzas; sin llamadas a Compras, F9).
 * El servidor recalcula saldos, proveedor y código: la pantalla solo envía oc_id y monto_aplicado.
 * openspec: pantalla-egreso-multiproveedor (M10).
 */

export interface OcPorPagar {
  oc_id: string;
  oc_codigo: string;
  proveedor_id: string;
  proveedor_nombre: string | null;
  total: number;
  pagado: number;
  saldo: number;
  estado: string;
}

interface Props {
  abierto: boolean;
  cuentas: CuentaBancaria[];
  proyectoNombre: string;
  proyectoColor: string;
  onCerrar: () => void;
  onRegistrado: (referencia: string, total: number) => void;
}

const TIPOS = [
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'SPEI', label: 'SPEI' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'EFECTIVO', label: 'Efectivo' },
];

export const EgresoMultiproveedorModal: React.FC<Props> = ({ abierto, cuentas, proyectoNombre, proyectoColor, onCerrar, onRegistrado }) => {
  const [ocs, setOcs] = useState<OcPorPagar[]>([]);
  const [cargando, setCargando] = useState(false);
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [encabezado, setEncabezado] = useState({
    fuente: 'CUENTA_BANCARIA' as 'ANTICIPO' | 'CUENTA_BANCARIA',
    cuenta_id: '',
    tipo_pago: 'TRANSFERENCIA',
    referencia: '',
    concepto: '',
    fecha_pago: hoyIso(),
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setSeleccion({});
    setError(null);
    setCargando(true);
    api.get('/api/v1/finanzas/ocs-por-pagar')
      .then((r) => setOcs(r.data?.data ?? []))
      .catch((e) => setError(mensajeDeError(e, 'No se pudieron cargar las OCs por pagar.')))
      .finally(() => setCargando(false));
  }, [abierto]);

  const porProveedor = useMemo(() => {
    const grupos = new Map<string, { nombre: string; ocs: OcPorPagar[] }>();
    for (const oc of ocs) {
      const g = grupos.get(oc.proveedor_id) ?? { nombre: oc.proveedor_nombre || 'Proveedor sin nombre', ocs: [] };
      g.ocs.push(oc);
      grupos.set(oc.proveedor_id, g);
    }
    return [...grupos.entries()];
  }, [ocs]);

  const elegidas = ocs.filter((oc) => seleccion[oc.oc_id] !== undefined);
  const total = redondear2(elegidas.reduce((s, oc) => s + (montoValido(seleccion[oc.oc_id]) ?? 0), 0));
  const proveedores = new Set(elegidas.map((oc) => oc.proveedor_id)).size;

  const alternar = (oc: OcPorPagar) => setSeleccion((s) => {
    const n = { ...s };
    if (n[oc.oc_id] !== undefined) delete n[oc.oc_id];
    else n[oc.oc_id] = oc.saldo.toFixed(2);
    return n;
  });

  const validar = (): string | null => {
    if (elegidas.length === 0) return 'Selecciona al menos una OC.';
    for (const oc of elegidas) {
      const m = montoValido(seleccion[oc.oc_id]);
      if (m === null) return `El monto de ${oc.oc_codigo} debe ser mayor a cero con máximo 2 decimales.`;
      if (m > oc.saldo + 1e-9) return `El monto de ${oc.oc_codigo} excede su saldo (${formatoMoneda(oc.saldo)}).`;
    }
    if (encabezado.fuente === 'CUENTA_BANCARIA' && !encabezado.cuenta_id) return 'Selecciona la cuenta bancaria.';
    if (!encabezado.referencia.trim()) return 'La referencia (folio del cheque o transferencia) es obligatoria.';
    if (!encabezado.concepto.trim()) return 'El concepto es obligatorio.';
    return null;
  };

  const solicitarConfirmacion = () => {
    const motivo = validar();
    setError(motivo);
    if (!motivo) setConfirmar(true);
  };

  const registrar = async () => {
    setConfirmar(false);
    setGuardando(true);
    setError(null);
    try {
      await api.post('/api/v1/finanzas/pagos-oc', {
        fuente: encabezado.fuente,
        cuenta_id: encabezado.fuente === 'CUENTA_BANCARIA' ? encabezado.cuenta_id : undefined,
        tipo_pago: encabezado.tipo_pago,
        referencia: encabezado.referencia.trim(),
        concepto: encabezado.concepto.trim(),
        fecha_pago: encabezado.fecha_pago,
        detalles: elegidas.map((oc) => ({ oc_id: oc.oc_id, monto_aplicado: montoValido(seleccion[oc.oc_id]) })),
      });
      onRegistrado(encabezado.referencia.trim(), total);
      setEncabezado((e) => ({ ...e, referencia: '', concepto: '' }));
    } catch (e) {
      setError(mensajeDeError(e, 'Error al registrar el egreso.'));
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCerrar}>
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-foreground">Registrar egreso a proveedores</h2>
          <p className="mb-4 text-[11px] text-muted-foreground">Un pago puede liquidar OCs de varios proveedores del proyecto {proyectoNombre}.</p>

          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <label className={CLASE_ETIQUETA} htmlFor="egreso-fuente">Fuente *</label>
              <select id="egreso-fuente" className={CLASE_CAMPO} value={encabezado.fuente}
                onChange={(e) => setEncabezado((x) => ({ ...x, fuente: e.target.value as 'ANTICIPO' | 'CUENTA_BANCARIA' }))}>
                <option value="CUENTA_BANCARIA">Cuenta bancaria</option>
                <option value="ANTICIPO">Anticipo del proyecto</option>
              </select>
            </div>
            {encabezado.fuente === 'CUENTA_BANCARIA' && (
              <div>
                <label className={CLASE_ETIQUETA} htmlFor="egreso-cuenta">Cuenta *</label>
                <select id="egreso-cuenta" className={CLASE_CAMPO} value={encabezado.cuenta_id}
                  onChange={(e) => setEncabezado((x) => ({ ...x, cuenta_id: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {cuentas.map((c) => <option key={c.id_cuenta} value={c.id_cuenta}>{c.alias} · {c.banco} · {formatoMoneda(Number(c.saldo))}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={CLASE_ETIQUETA} htmlFor="egreso-tipo">Tipo de pago *</label>
              <select id="egreso-tipo" className={CLASE_CAMPO} value={encabezado.tipo_pago}
                onChange={(e) => setEncabezado((x) => ({ ...x, tipo_pago: e.target.value }))}>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={CLASE_ETIQUETA} htmlFor="egreso-referencia">Referencia *</label>
              <input id="egreso-referencia" className={`${CLASE_CAMPO} font-mono`} placeholder="TRF-2026-001" value={encabezado.referencia}
                onChange={(e) => setEncabezado((x) => ({ ...x, referencia: e.target.value }))} />
            </div>
            <div>
              <label className={CLASE_ETIQUETA} htmlFor="egreso-fecha">Fecha de pago *</label>
              <input id="egreso-fecha" type="date" className={CLASE_CAMPO} value={encabezado.fecha_pago}
                onChange={(e) => setEncabezado((x) => ({ ...x, fecha_pago: e.target.value }))} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className={CLASE_ETIQUETA} htmlFor="egreso-concepto">Concepto *</label>
              <input id="egreso-concepto" className={CLASE_CAMPO} placeholder="Pago materiales factura F-001" value={encabezado.concepto}
                onChange={(e) => setEncabezado((x) => ({ ...x, concepto: e.target.value }))} />
            </div>
          </div>

          <div className="mt-5">
            <p className={CLASE_ETIQUETA}>OCs por pagar</p>
            {cargando ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Cargando OCs...</p>
            ) : ocs.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No hay OCs por pagar en este proyecto.</p>
            ) : (
              <div className="space-y-3">
                {porProveedor.map(([id, g]) => (
                  <div key={id} className="rounded-xl border border-border/60">
                    <p className="border-b border-border/60 bg-muted/40 px-3 py-2 text-xs font-black uppercase tracking-widest">{g.nombre}</p>
                    <table className="w-full text-xs">
                      <tbody>
                        {g.ocs.map((oc) => {
                          const marcada = seleccion[oc.oc_id] !== undefined;
                          return (
                            <tr key={oc.oc_id} className="border-b border-border/30 last:border-0">
                              <td className="w-8 px-3 py-2">
                                <input type="checkbox" aria-label={`Seleccionar ${oc.oc_codigo}`} checked={marcada} onChange={() => alternar(oc)} />
                              </td>
                              <td className="px-2 py-2 font-mono">{oc.oc_codigo}</td>
                              <td className="px-2 py-2 text-right text-muted-foreground">Total {formatoMoneda(oc.total)}</td>
                              <td className="px-2 py-2 text-right font-bold">Saldo {formatoMoneda(oc.saldo)}</td>
                              <td className="w-36 px-3 py-2">
                                <input type="number" min="0.01" step="0.01" max={oc.saldo} aria-label={`Monto ${oc.oc_codigo}`} disabled={!marcada}
                                  className={`${CLASE_CAMPO} text-right font-mono disabled:opacity-40`} value={seleccion[oc.oc_id] ?? ''}
                                  onChange={(e) => setSeleccion((s) => ({ ...s, [oc.oc_id]: e.target.value }))} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {elegidas.length} OC{elegidas.length !== 1 ? 's' : ''} · {proveedores} proveedor{proveedores !== 1 ? 'es' : ''}
            </span>
            <span data-testid="egreso-total" className="font-mono text-lg font-black text-emerald-700">{formatoMoneda(total)}</span>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1 rounded-xl bg-emerald-600 text-xs font-black uppercase text-white hover:bg-emerald-700" disabled={guardando} onClick={solicitarConfirmacion}>
              {guardando ? 'Guardando...' : 'Registrar Pago'}
            </Button>
            <Button className="flex-1 rounded-xl border border-border text-xs font-black uppercase" onClick={onCerrar}>Cancelar</Button>
          </div>
        </div>
      </div>

      <ConfirmCriticalActionDialog
        open={confirmar}
        dismissible={false}
        title={`¿Registrar egreso por ${formatoMoneda(total)}?`}
        projectName={proyectoNombre}
        projectColorDot={proyectoColor}
        confirmDisabled={guardando}
        onConfirm={() => void registrar()}
        onCancel={() => setConfirmar(false)}
      />
    </>
  );
};

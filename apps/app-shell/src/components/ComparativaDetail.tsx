import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SectionBadge,
  cn,
} from '@bocam/ui-core';
import {
  IconArrowLeft,
  IconCheckCircle2,
  IconPackage,
  IconPlus,
  IconScale,
  IconSearch,
  IconX,
} from './Icons';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Componente: ComparativaDetail — Tabla comparativa de cotizaciones
 * Flujo: Requisición APROBADA → comparar hasta 3 proveedores → autorizar → OC
 * ---------------------------------------------------------------------------
 */

// ─── Interfaces exportadas ────────────────────────────────────────────────────

export interface CotizacionLinea {
  id: string;
  insumo_id: string;
  insumo_clave: string;
  insumo_descripcion: string;
  insumo_unidad: string;
  cantidad: number;
  precios: Record<string, string>; // provId -> precio string
  ganador: string | null;          // provId del ganador
}

export interface ProveedorComp {
  id: string;
  nombre: string;
}

export interface ComparativaLocal {
  id: string;
  requisicion_id: string;
  estado: 'BORRADOR' | 'EN_PROCESO' | 'AUTORIZADA';
  proveedores: ProveedorComp[];
  lineas: CotizacionLinea[];
  ordenes_compra: { codigo: string; proveedor_nombre: string; total: number }[];
}

// ─── Colores por proveedor (A, B, C) ─────────────────────────────────────────
const PROV_COLORS = [
  { chip: 'border-blue-500/20 bg-blue-500/10 text-blue-700',   col: '#1d4ed8', btn: 'bg-blue-500/10 hover:bg-blue-500 text-blue-700 hover:text-white', win: 'bg-blue-500 text-white' },
  { chip: 'border-violet-500/20 bg-violet-500/10 text-violet-700', col: '#7c3aed', btn: 'bg-violet-500/10 hover:bg-violet-500 text-violet-700 hover:text-white', win: 'bg-violet-500 text-white' },
  { chip: 'border-teal-500/20 bg-teal-500/10 text-teal-700',   col: '#0d9488', btn: 'bg-teal-500/10 hover:bg-teal-500 text-teal-700 hover:text-white', win: 'bg-teal-500 text-white' },
];

const ESTADO_STYLE: Record<string, string> = {
  BORRADOR:   'border-slate-500/20 bg-slate-500/10 text-slate-600',
  EN_PROCESO: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
  AUTORIZADA: 'border-green-500/20 bg-green-500/10 text-green-600',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Insumo { id: string; clave: string; descripcion: string; unidad: string; }

interface Props {
  requisicionFolio: string;
  comparativa: ComparativaLocal;
  insumos: Insumo[];
  isDemo: boolean;
  onBack: () => void;
  onUpdate: (updated: ComparativaLocal) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const ComparativaDetail: React.FC<Props> = ({
  requisicionFolio, comparativa: comp, insumos, isDemo, onBack, onUpdate,
}) => {
  // ── Local state ─────────────────────────────────────────────────────────────
  const [newProvNombre, setNewProvNombre] = useState('');
  const [showAddProv, setShowAddProv] = useState(false);
  const [addLineaOpen, setAddLineaOpen] = useState(false);
  const [addLineaSearch, setAddLineaSearch] = useState('');
  const [addLineaDropdown, setAddLineaDropdown] = useState(false);
  const [addLineaInsumoId, setAddLineaInsumoId] = useState('');
  const [addLineaInsumoLabel, setAddLineaInsumoLabel] = useState('');
  const [addLineaInsumoUnidad, setAddLineaInsumoUnidad] = useState('');
  const [addLineaCantidad, setAddLineaCantidad] = useState('');
  const [autorizando, setAutorizando] = useState(false);

  const addLineaRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown de búsqueda al hacer clic afuera
  useEffect(() => {
    if (!addLineaDropdown) return;
    const handler = (e: MouseEvent) => {
      if (addLineaRef.current && !addLineaRef.current.contains(e.target as Node)) {
        setAddLineaDropdown(false);
      }
    };
    setTimeout(() => window.addEventListener('mousedown', handler), 0);
    return () => window.removeEventListener('mousedown', handler);
  }, [addLineaDropdown]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const lineaSuggestions = useMemo(() => {
    const existing = new Set(comp.lineas.map(l => l.insumo_id));
    const available = insumos.filter(i => !existing.has(i.id));
    const q = addLineaSearch.toLowerCase();
    if (!q) return available.slice(0, 6);
    return available.filter(i =>
      i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [insumos, addLineaSearch, comp.lineas]);

  const getTotalProveedor = (provId: string) =>
    comp.lineas.reduce((sum, l) => {
      const p = parseFloat(l.precios[provId] || '0') || 0;
      return sum + p * l.cantidad;
    }, 0);

  const getTotalGanador = () =>
    comp.lineas.reduce((sum, l) => {
      if (!l.ganador) return sum;
      const p = parseFloat(l.precios[l.ganador] || '0') || 0;
      return sum + p * l.cantidad;
    }, 0);

  const canAuthorize =
    comp.lineas.length > 0 &&
    comp.proveedores.length > 0 &&
    comp.lineas.every(l => l.ganador !== null) &&
    comp.estado !== 'AUTORIZADA';

  const locked = comp.estado === 'AUTORIZADA';

  const formatMXN = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAddProveedor = () => {
    if (!newProvNombre.trim() || comp.proveedores.length >= 3) return;
    onUpdate({
      ...comp,
      estado: 'EN_PROCESO',
      proveedores: [
        ...comp.proveedores,
        { id: `pv-${Date.now()}`, nombre: newProvNombre.trim() },
      ],
    });
    setNewProvNombre('');
    setShowAddProv(false);
  };

  const handleRemoveProveedor = (provId: string) => {
    onUpdate({
      ...comp,
      proveedores: comp.proveedores.filter(p => p.id !== provId),
      lineas: comp.lineas.map(l => ({
        ...l,
        precios: Object.fromEntries(Object.entries(l.precios).filter(([k]) => k !== provId)),
        ganador: l.ganador === provId ? null : l.ganador,
      })),
    });
  };

  const handleUpdatePrecio = (lineaId: string, provId: string, value: string) => {
    onUpdate({
      ...comp,
      lineas: comp.lineas.map(l =>
        l.id === lineaId
          ? { ...l, precios: { ...l.precios, [provId]: value }, ganador: l.ganador }
          : l
      ),
    });
  };

  const handleSetGanador = (lineaId: string, provId: string) => {
    if (locked) return;
    onUpdate({
      ...comp,
      lineas: comp.lineas.map(l =>
        l.id === lineaId
          ? { ...l, ganador: l.ganador === provId ? null : provId }
          : l
      ),
    });
  };

  const handleAddLinea = () => {
    if (!addLineaInsumoId || !addLineaCantidad) return;
    const insumo = insumos.find(i => i.id === addLineaInsumoId);
    if (!insumo) return;
    const newLinea: CotizacionLinea = {
      id: `lin-${Date.now()}`,
      insumo_id: insumo.id,
      insumo_clave: insumo.clave,
      insumo_descripcion: insumo.descripcion,
      insumo_unidad: insumo.unidad,
      cantidad: Number(addLineaCantidad),
      precios: {},
      ganador: null,
    };
    onUpdate({ ...comp, estado: 'EN_PROCESO', lineas: [...comp.lineas, newLinea] });
    setAddLineaInsumoId('');
    setAddLineaInsumoLabel('');
    setAddLineaInsumoUnidad('');
    setAddLineaCantidad('');
    setAddLineaSearch('');
    setAddLineaOpen(false);
  };

  const handleRemoveLinea = (lineaId: string) => {
    onUpdate({ ...comp, lineas: comp.lineas.filter(l => l.id !== lineaId) });
  };

  const handleAutorizar = async () => {
    if (!canAuthorize) return;
    setAutorizando(true);
    try {
      if (isDemo) {
        // Agrupar líneas ganadoras por proveedor
        const grupos: Record<string, { nombre: string; total: number }> = {};
        comp.lineas.forEach(l => {
          if (!l.ganador) return;
          const prov = comp.proveedores.find(p => p.id === l.ganador)!;
          const precio = parseFloat(l.precios[l.ganador] || '0') || 0;
          if (!grupos[l.ganador]) grupos[l.ganador] = { nombre: prov.nombre, total: 0 };
          grupos[l.ganador].total += precio * l.cantidad;
        });
        const ocs = Object.entries(grupos).map(([, v], i) => ({
          codigo: `OC-2024-0${50 + i}`,
          proveedor_nombre: v.nombre,
          total: v.total,
        }));
        onUpdate({ ...comp, estado: 'AUTORIZADA', ordenes_compra: ocs });
      } else {
        const resp = await api.post(`/api/v1/compras/comparativas/${comp.id}/convertir-oc`, {});
        const ocs = resp.data.data?.ordenes_compra || [];
        onUpdate({ ...comp, estado: 'AUTORIZADA', ordenes_compra: ocs });
      }
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setAutorizando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          className="h-auto gap-2 p-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent"
        >
          <IconArrowLeft className="h-4 w-4" />
          Requisiciones
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
          {requisicionFolio}
        </span>
        <SectionBadge className={cn('rounded-lg px-2.5 py-1 text-[9px]', ESTADO_STYLE[comp.estado] || ESTADO_STYLE.BORRADOR)}>
          {comp.estado.replace('_', ' ')}
        </SectionBadge>
      </div>

      {/* Sección: Proveedores ─────────────────────────────────────────────── */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight">
              <IconScale className="h-4 w-4 text-amber-500" />
              Proveedores en comparativa
              <span className="text-[10px] font-medium normal-case text-muted-foreground">
                ({comp.proveedores.length} / 3)
              </span>
            </CardTitle>
            {comp.proveedores.length < 3 && !locked && (
              <Button
                onClick={() => setShowAddProv(!showAddProv)}
                variant="outline"
                className="h-auto rounded-xl border-emerald-500/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/5"
              >
                <IconPlus className="h-3 w-3" /> Agregar proveedor
              </Button>
            )}
          </div>

          {/* Add proveedor input */}
          {showAddProv && (
            <div className="mt-3 flex items-center gap-2">
              <Input
                className="h-9 flex-1 rounded-xl text-xs"
                placeholder="Nombre del proveedor (ej. CEMEX México SA de CV)..."
                value={newProvNombre}
                onChange={e => setNewProvNombre(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddProveedor(); if (e.key === 'Escape') { setShowAddProv(false); setNewProvNombre(''); } }}
                autoFocus
              />
              <Button
                onClick={handleAddProveedor}
                disabled={!newProvNombre.trim()}
                className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500"
              >
                Agregar
              </Button>
              <Button
                onClick={() => { setShowAddProv(false); setNewProvNombre(''); }}
                variant="ghost"
                className="h-9 w-9 rounded-xl p-0"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {comp.proveedores.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Sin proveedores — agrega al menos uno para comenzar la comparativa.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {comp.proveedores.map((prov, i) => {
                const c = PROV_COLORS[i] || PROV_COLORS[0];
                return (
                  <div key={prov.id} className={cn('flex items-center gap-2 rounded-xl border px-3 py-2', c.chip)}>
                    <span className="text-[11px] font-black">{String.fromCharCode(65 + i)}</span>
                    <span className="text-xs font-semibold">{prov.nombre}</span>
                    {!locked && (
                      <button
                        onClick={() => handleRemoveProveedor(prov.id)}
                        className="ml-1 text-current opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Cotizaciones ───────────────────────────────────────────── */}
      {comp.proveedores.length > 0 && (
        <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
          <div className="border-b border-border/30 px-6 py-4">
            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Tabla de Cotizaciones</h3>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Ingresa los precios por material · Selecciona el ganador por renglón (A, B o C)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: `${420 + comp.proveedores.length * 140}px` }}>
              <thead>
                <tr className="border-b border-border/30 bg-muted/30">
                  <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground w-[220px]">
                    Material
                  </th>
                  <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16">
                    Cant.
                  </th>
                  <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground w-12">
                    UM
                  </th>
                  {comp.proveedores.map((prov, i) => {
                    const c = PROV_COLORS[i] || PROV_COLORS[0];
                    return (
                      <th key={prov.id} className="px-3 py-3 text-right text-[9px] font-black uppercase tracking-widest w-36"
                        style={{ color: c.col }}>
                        {String.fromCharCode(65 + i)} · {prov.nombre.split(' ').slice(0, 2).join(' ')}
                      </th>
                    );
                  })}
                  <th className="px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-amber-600 w-28">
                    Ganador
                  </th>
                  {!locked && <th className="px-2 py-3 w-8" />}
                </tr>
              </thead>

              <tbody>
                {comp.lineas.map(linea => (
                  <tr key={linea.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    {/* Material */}
                    <td className="px-5 py-3">
                      <div className="text-[10px] font-black text-emerald-700">{linea.insumo_clave}</div>
                      <div className="text-xs text-foreground max-w-[200px] truncate">{linea.insumo_descripcion}</div>
                    </td>

                    {/* Cantidad */}
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold text-foreground">{linea.cantidad}</span>
                    </td>

                    {/* Unidad */}
                    <td className="px-3 py-3 text-center">
                      <span className="text-[10px] text-muted-foreground">{linea.insumo_unidad}</span>
                    </td>

                    {/* Precios por proveedor */}
                    {comp.proveedores.map((prov, i) => {
                      const c = PROV_COLORS[i] || PROV_COLORS[0];
                      const precio = parseFloat(linea.precios[prov.id] || '0') || 0;
                      const subtotal = precio * linea.cantidad;
                      return (
                        <td key={prov.id} className="px-2 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={cn(
                              'w-28 rounded-lg border bg-background px-2 py-1.5 text-right text-xs font-bold transition-colors focus:outline-none',
                              locked
                                ? 'border-transparent bg-transparent text-foreground cursor-default'
                                : 'border-border/40 focus:border-emerald-500'
                            )}
                            placeholder="—"
                            value={linea.precios[prov.id] || ''}
                            onChange={e => !locked && handleUpdatePrecio(linea.id, prov.id, e.target.value)}
                            readOnly={locked}
                          />
                          {precio > 0 && (
                            <div className="mt-0.5 text-[9px] text-muted-foreground text-right">
                              ={' '}{subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Ganador */}
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-1">
                        {comp.proveedores.map((prov, i) => {
                          const c = PROV_COLORS[i] || PROV_COLORS[0];
                          const isWinner = linea.ganador === prov.id;
                          const hasPrecio = !!(linea.precios[prov.id] && parseFloat(linea.precios[prov.id]) > 0);
                          return (
                            <button
                              key={prov.id}
                              onClick={() => hasPrecio && handleSetGanador(linea.id, prov.id)}
                              disabled={!hasPrecio || locked}
                              title={isWinner ? `Ganador: ${prov.nombre}` : hasPrecio ? `Seleccionar ${prov.nombre}` : 'Sin precio'}
                              className={cn(
                                'h-7 w-7 rounded-lg text-[10px] font-black transition-all shadow-sm',
                                isWinner
                                  ? c.win
                                  : hasPrecio && !locked
                                  ? c.btn
                                  : 'cursor-not-allowed opacity-25 bg-muted'
                              )}
                            >
                              {String.fromCharCode(65 + i)}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Eliminar renglón */}
                    {!locked && (
                      <td className="px-2 py-3">
                        <button
                          onClick={() => handleRemoveLinea(linea.id)}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <IconX className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Fila de totales */}
                {comp.lineas.length > 0 && (
                  <tr className="border-t-2 border-border/40 bg-muted/30">
                    <td colSpan={3} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Total estimado
                    </td>
                    {comp.proveedores.map((prov, i) => {
                      const c = PROV_COLORS[i] || PROV_COLORS[0];
                      const total = getTotalProveedor(prov.id);
                      return (
                        <td key={prov.id} className="px-2 py-3 text-right">
                          <span className="text-sm font-black" style={{ color: total > 0 ? c.col : undefined }}>
                            {total > 0 ? formatMXN(total) : '—'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      {comp.lineas.every(l => l.ganador !== null) && (
                        <div className="text-sm font-black text-amber-600">{formatMXN(getTotalGanador())}</div>
                      )}
                    </td>
                    {!locked && <td />}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: Agregar material + Autorizar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/30 px-6 py-4">
            {/* Agregar material */}
            {!locked && (
              !addLineaOpen ? (
                <Button
                  onClick={() => setAddLineaOpen(true)}
                  variant="ghost"
                  className="h-auto px-0 py-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-transparent hover:text-emerald-500"
                >
                  <IconPlus className="h-3.5 w-3.5" /> Agregar material
                </Button>
              ) : (
                <div className="flex flex-1 items-end gap-2 mr-4 flex-wrap">
                  {/* Búsqueda de insumo */}
                  <div ref={addLineaRef} className="relative min-w-[220px] flex-1">
                    {addLineaInsumoId ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                        <span className="text-xs font-bold text-emerald-700 truncate">{addLineaInsumoLabel}</span>
                        <button
                          type="button"
                          onClick={() => { setAddLineaInsumoId(''); setAddLineaInsumoLabel(''); setAddLineaInsumoUnidad(''); }}
                          className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <IconX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className="w-full rounded-xl border border-border/40 bg-background py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none"
                          placeholder="Buscar material del catálogo..."
                          value={addLineaSearch}
                          onFocus={() => setAddLineaDropdown(true)}
                          onChange={e => { setAddLineaSearch(e.target.value); setAddLineaDropdown(true); }}
                        />
                        {addLineaDropdown && lineaSuggestions.length > 0 && (
                          <div className="absolute bottom-full z-50 mb-1 w-full rounded-xl border border-border/40 bg-card shadow-xl">
                            {lineaSuggestions.map(ins => (
                              <button
                                key={ins.id}
                                type="button"
                                onMouseDown={() => {
                                  setAddLineaInsumoId(ins.id);
                                  setAddLineaInsumoLabel(`${ins.clave} — ${ins.descripcion}`);
                                  setAddLineaInsumoUnidad(ins.unidad);
                                  setAddLineaSearch('');
                                  setAddLineaDropdown(false);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 first:rounded-t-xl last:rounded-b-xl"
                              >
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700">{ins.clave}</span>
                                <span className="flex-1 truncate text-xs">{ins.descripcion}</span>
                                <span className="shrink-0 text-[9px] text-muted-foreground">{ins.unidad}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      placeholder="Cant."
                      value={addLineaCantidad}
                      onChange={e => setAddLineaCantidad(e.target.value)}
                    />
                  </div>

                  {addLineaInsumoUnidad && (
                    <span className="text-[10px] text-muted-foreground">{addLineaInsumoUnidad}</span>
                  )}

                  <Button
                    onClick={handleAddLinea}
                    disabled={!addLineaInsumoId || !addLineaCantidad}
                    className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500"
                  >
                    Agregar
                  </Button>
                  <Button
                    onClick={() => { setAddLineaOpen(false); setAddLineaInsumoId(''); setAddLineaInsumoLabel(''); setAddLineaCantidad(''); setAddLineaSearch(''); }}
                    variant="ghost"
                    className="h-9 w-9 rounded-xl p-0"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              )
            )}

            {/* Botón Autorizar */}
            {!locked && (
              <Button
                onClick={handleAutorizar}
                disabled={!canAuthorize || autorizando}
                className={cn(
                  'ml-auto rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all',
                  canAuthorize
                    ? 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-400 active:scale-[0.98]'
                    : 'cursor-not-allowed bg-muted text-muted-foreground shadow-none'
                )}
              >
                {autorizando ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generando OC...
                  </>
                ) : (
                  <>
                    <IconCheckCircle2 className="h-4 w-4" />
                    Autorizar → OC
                  </>
                )}
              </Button>
            )}

            {locked && (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-600">
                <IconCheckCircle2 className="h-5 w-5" />
                Comparativa autorizada — OC generadas
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Empty state: proveedores agregados pero sin materiales */}
      {comp.lineas.length === 0 && comp.proveedores.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <IconPackage className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Sin materiales — agrega los insumos a cotizar
          </p>
        </div>
      )}

      {/* Órdenes de Compra Generadas ──────────────────────────────────────── */}
      {comp.ordenes_compra.length > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-tight text-green-700">
              <IconCheckCircle2 className="h-5 w-5" />
              Órdenes de Compra Generadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {comp.ordenes_compra.map(oc => (
              <div
                key={oc.codigo}
                className="flex items-center justify-between rounded-xl border border-green-500/20 bg-background px-4 py-3"
              >
                <div>
                  <div className="text-xs font-black text-green-700">{oc.codigo}</div>
                  <div className="text-[11px] text-muted-foreground">{oc.proveedor_nombre}</div>
                </div>
                <div className="text-sm font-black text-foreground">
                  {oc.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Total comprometido</span>
              <span className="text-base font-black text-green-700">
                {comp.ordenes_compra.reduce((s, oc) => s + oc.total, 0)
                  .toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

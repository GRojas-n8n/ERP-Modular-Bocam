/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Gerencia Técnica — Catálogo de Obra (Presupuesto Base)
 *
 * Importación desde OPUS:
 *   - Acepta Excel (.xlsx, .xls) y CSV (.csv, .txt)
 *   - Mapeo automático de columnas (CLAVE, DESCRIPCION, UNIDAD, CANTIDAD, P.U., IMPORTE)
 *   - Vista previa antes de confirmar
 *   - POST a /api/v1/gerencia-tecnica/presupuestos
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';
import {
  IconBriefcase,
  IconSearch,
  IconAlertCircle,
  IconRefreshCw,
  IconDownload,
  IconLayers,
  IconFileText,
  IconX,
  IconCheckCircle2,
  IconInfo,
} from '../components/Icons';
import { cn } from '../lib/utils';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Concepto {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

interface Presupuesto {
  id: string;
  proyecto_id: string;
  version: number;
  estado: 'BORRADOR' | 'EN_REVISION' | 'LIBERADO' | 'CONGELADO';
  importe_total: number;
  conceptos: Concepto[];
  created_at: string;
}

interface ConceptoPreview {
  clave: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
  _valido: boolean;
  _error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR:    'bg-amber-500/10 text-amber-600 border-amber-500/20',
  EN_REVISION: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  LIBERADO:    'bg-green-500/10 text-green-600 border-green-500/20',
  CONGELADO:   'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

/**
 * Parsea un número que puede venir en formato mexicano (1.234,56) o americano (1,234.56)
 */
function parsearNumero(valor: string | number | undefined): number {
  if (valor === undefined || valor === null || valor === '') return 0;
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
  const s = String(valor).trim();
  // Si tiene coma como separador decimal (1.234,56)
  if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  // Formato americano o sin separadores
  return parseFloat(s.replace(/,/g, '')) || 0;
}

/**
 * Normaliza nombres de columna a una clave interna
 * Mapea variaciones de OPUS: CLAVE/CONCEPTO, DESCRIPCION/NOMBRE, UNIDAD/U.M., P.U./PRECIO UNITARIO
 */
function mapearColumna(nombre: string): string | null {
  const n = nombre.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  if (['CLAVE', 'CONCEPTO', 'CODIGO', 'COD', 'PARTIDA', 'CLAVECONT'].includes(n)) return 'clave';
  if (['DESCRIPCION', 'DESCRIPCION', 'NOMBRE', 'CONCEPTO', 'DESC', 'TRABAJOS'].includes(n)) return 'descripcion';
  if (['UNIDAD', 'UM', 'UNIDADMEDIDA', 'UNID', 'UDM', 'UNIDADDEMEDIDA'].includes(n)) return 'unidad_medida';
  if (['CANTIDAD', 'CANT', 'VOLUMEN', 'QUANT'].includes(n)) return 'cantidad';
  if (['PU', 'PRECIOUNITARIO', 'PRECIO', 'COSTODIRECTO', 'COSTOUNITARIO', 'TARIFA'].includes(n)) return 'precio_unitario';
  if (['IMPORTE', 'TOTAL', 'MONTO', 'SUBTOTAL', 'COSTOINDIRECTO', 'IMPORTETOTAL'].includes(n)) return 'importe';
  return null;
}

/**
 * Convierte filas de datos brutos (objeto clave→valor) a ConceptoPreview
 */
function normalizarFila(row: Record<string, string | number>): ConceptoPreview {
  const mapeado: Record<string, string | number> = {};
  for (const [col, val] of Object.entries(row)) {
    const clave = mapearColumna(col);
    if (clave && !(clave in mapeado)) mapeado[clave] = val;
  }

  const clave = String(mapeado.clave ?? '').trim();
  const descripcion = String(mapeado.descripcion ?? '').trim();
  const unidad_medida = String(mapeado.unidad_medida ?? '').trim().toUpperCase();
  const cantidad = parsearNumero(mapeado.cantidad as string);
  const precio_unitario = parsearNumero(mapeado.precio_unitario as string);
  let importe = parsearNumero(mapeado.importe as string);

  // Si el importe no viene o es 0 pero hay cantidad y precio, calcularlo
  if (importe === 0 && cantidad > 0 && precio_unitario > 0) {
    importe = cantidad * precio_unitario;
  }

  const _valido = Boolean(clave && descripcion && unidad_medida && cantidad > 0 && precio_unitario > 0);
  const errores: string[] = [];
  if (!clave) errores.push('sin clave');
  if (!descripcion) errores.push('sin descripción');
  if (!unidad_medida) errores.push('sin unidad');
  if (cantidad <= 0) errores.push('cantidad inválida');
  if (precio_unitario <= 0) errores.push('precio inválido');

  return {
    clave,
    descripcion,
    unidad_medida: unidad_medida || 'PZA',
    cantidad,
    precio_unitario,
    importe,
    _valido,
    _error: errores.length ? errores.join(', ') : undefined,
  };
}

/**
 * Detecta si una fila es de encabezado o de estructura (títulos de partida, totales, etc.)
 * OPUS incluye filas de nivel que no son conceptos individuales
 */
function esFilaEstructural(row: Record<string, string | number>): boolean {
  const values = Object.values(row).map(v => String(v ?? '').trim());
  const textos = values.filter(v => v.length > 0);
  if (textos.length <= 1) return true; // Filas casi vacías
  // Si la clave es solo números (ej: "1", "1.1", "1.1.1") podría ser partida
  // Pero si tiene precio > 0 sí es concepto → no es estructural
  return false;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const InsumosView: React.FC = () => {
  const { tenant, currentProjectId } = useTenant();
  const { notify } = useNotification();

  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');

  // Import state
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [panelImport, setPanelImport] = useState(false);
  const [panelGuia,   setPanelGuia]   = useState(false);
  const [importando,  setImportando]  = useState(false);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [preview, setPreview] = useState<ConceptoPreview[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const validRows   = useMemo(() => preview.filter(r => r._valido), [preview]);
  const invalidRows = useMemo(() => preview.filter(r => !r._valido), [preview]);
  const totalImporte = useMemo(() => validRows.reduce((s, r) => s + r.importe, 0), [validRows]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tenant?.id === 'iretum-demo') {
        setPresupuesto(null);
        return;
      }
      const res = await api.get('/api/v1/gerencia-tecnica/presupuestos');
      const lista: Presupuesto[] = res.data.data || [];
      setPresupuesto(lista.length > 0 ? lista[0] : null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión con el módulo de Gerencia Técnica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const conceptosFiltrados = useMemo(() => {
    if (!presupuesto) return [];
    if (!search.trim()) return presupuesto.conceptos;
    const q = search.toLowerCase();
    return presupuesto.conceptos.filter(c =>
      c.clave.toLowerCase().includes(q) ||
      c.descripcion.toLowerCase().includes(q) ||
      c.unidad_medida.toLowerCase().includes(q)
    );
  }, [presupuesto, search]);

  const importeFiltrado = useMemo(
    () => conceptosFiltrados.reduce((s, c) => s + Number(c.importe), 0),
    [conceptosFiltrados]
  );

  // ── Leer y parsear archivo ─────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombre(file.name);
    setParseError(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let wb: XLSX.WorkBook;

        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'csv' || ext === 'txt') {
          // CSV: leer como texto y convertir con XLSX
          wb = XLSX.read(data as string, { type: 'string' });
        } else {
          // Excel: leer como ArrayBuffer
          wb = XLSX.read(data as ArrayBuffer, { type: 'array' });
        }

        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];

        // Convertir a array de objetos (primera fila = headers)
        const rawRows: Record<string, string | number>[] = XLSX.utils.sheet_to_json(ws, {
          defval: '',
          raw: false,
        });

        if (rawRows.length === 0) {
          setParseError('El archivo está vacío o no tiene filas de datos.');
          return;
        }

        // Verificar que al menos una columna reconocida existe
        const primeraFila = rawRows[0];
        const columnasReconocidas = Object.keys(primeraFila).filter(k => mapearColumna(k) !== null);
        if (columnasReconocidas.length < 2) {
          setParseError(
            `No se reconocieron columnas del formato OPUS.\n` +
            `Columnas detectadas: ${Object.keys(primeraFila).join(', ')}\n` +
            `Columnas esperadas: CLAVE, DESCRIPCION, UNIDAD, CANTIDAD, P.U., IMPORTE`
          );
          return;
        }

        // Normalizar filas
        const conceptos = rawRows
          .filter(row => !esFilaEstructural(row))
          .map(row => normalizarFila(row))
          .filter(c => c.clave !== '' || c.descripcion !== ''); // quitar filas completamente vacías

        if (conceptos.length === 0) {
          setParseError('No se encontraron conceptos válidos en el archivo.');
          return;
        }

        setPreview(conceptos);
        setPanelImport(true);
      } catch (err: any) {
        setParseError(`Error al leer el archivo: ${err.message}`);
      }
    };

    if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }

    // Reset input para poder re-seleccionar el mismo archivo
    e.target.value = '';
  };

  // ── Confirmar importación → POST ───────────────────────────────────────────
  const handleConfirmarImport = async () => {
    if (validRows.length === 0) return;
    if (!currentProjectId) {
      notify({ type: 'error', title: 'Sin proyecto activo', message: 'Selecciona un proyecto antes de importar.' });
      return;
    }

    setImportando(true);
    try {
      const payload = {
        proyecto_id: currentProjectId,
        version: presupuesto ? presupuesto.version + 1 : 1,
        conceptos: validRows.map(c => ({
          clave: c.clave,
          descripcion: c.descripcion,
          unidad_medida: c.unidad_medida,
          cantidad: c.cantidad,
          precio_unitario: c.precio_unitario,
        })),
      };

      await api.post('/api/v1/gerencia-tecnica/presupuestos', payload);

      notify({
        type: 'success',
        title: 'Catálogo importado',
        message: `${validRows.length} conceptos importados correctamente.`,
        duration: 5000,
      });

      setPanelImport(false);
      setPreview([]);
      setArchivoNombre('');
      void fetchData();
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error al importar',
        message: err.response?.data?.message || err.message,
        duration: 6000,
      });
    } finally {
      setImportando(false);
    }
  };

  // ── Estado vacío ──────────────────────────────────────────────────────────
  const renderVacio = () => (
    <div className="flex flex-col items-center justify-center h-[500px] gap-6 text-center px-8">
      <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
        <IconFileText className="h-10 w-10 text-primary opacity-60" />
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-foreground">Sin catálogo cargado</p>
        <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
          Exporta el <strong>PRESUPUESTO</strong> desde OPUS en formato Excel (.xlsx) o CSV y súbelo aquí.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
        >
          <IconDownload className="h-4 w-4" />
          Importar desde OPUS
        </button>
        <button
          onClick={() => setPanelGuia(true)}
          className="px-6 py-3 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-muted/80 active:scale-95 transition-all flex items-center gap-2"
        >
          <IconInfo className="h-4 w-4" />
          ¿Cómo exportar?
        </button>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Input oculto para selección de archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

        {/* ── Encabezado ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Gerencia Técnica
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 shadow-inner">
                <IconBriefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                  Catálogo de Obra
                </h1>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Conceptos de obra · Presupuesto base del proyecto
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              className="p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-all shadow-sm active:scale-90"
              title="Refrescar"
            >
              <IconRefreshCw className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
            </button>
            <button
              onClick={() => setPanelGuia(true)}
              className="flex items-center gap-2 px-4 py-3 border border-border/60 bg-card text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-muted/60 active:scale-95 transition-all"
            >
              <IconInfo className="h-4 w-4" />
              ¿Cómo exportar?
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            >
              <IconDownload className="h-4 w-4" />
              Importar OPUS
            </button>
          </div>
        </div>

        {/* ── Error de parseo (mensaje inline) ── */}
        {parseError && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
            <IconAlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">Error al leer el archivo</p>
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{parseError}</p>
            </div>
            <button onClick={() => setParseError(null)} className="text-muted-foreground hover:text-foreground">
              <IconX className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Stats del presupuesto ── */}
        {presupuesto && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Conceptos', value: presupuesto.conceptos.length.toString(), color: 'text-foreground' },
              { label: 'Importe Total',   value: formatMXN(Number(presupuesto.importe_total)), color: 'text-primary' },
              { label: 'Versión',         value: `v${presupuesto.version}`,               color: 'text-foreground' },
              { label: 'Estado',          value: presupuesto.estado,                       color: 'text-foreground', badge: true },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                {stat.badge ? (
                  <span className={cn('mt-2 inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider', ESTADO_BADGE[stat.value] || ESTADO_BADGE.BORRADOR)}>
                    {stat.value}
                  </span>
                ) : (
                  <p className={cn('mt-1 text-xl font-black tracking-tighter truncate', stat.color)}>{stat.value}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Barra de búsqueda ── */}
        {presupuesto && (
          <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
            <div className="relative flex-1 group">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por clave, descripción o unidad..."
                className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent rounded-xl text-xs font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-background transition-all"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 px-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {conceptosFiltrados.length} conceptos
              </span>
              <span className="text-sm font-black text-primary tracking-tighter">
                {formatMXN(importeFiltrado)}
              </span>
            </div>
          </div>
        )}

        {/* ── Tabla principal ── */}
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-6">
              <div className="h-12 w-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
                Cargando catálogo...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center max-w-md mx-auto gap-6">
              <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
                <IconAlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="font-black text-base text-foreground uppercase tracking-tighter">Error de conexión</h3>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Reintentar
              </button>
            </div>
          ) : !presupuesto ? (
            renderVacio()
          ) : conceptosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <IconLayers className="h-16 w-16 text-muted-foreground opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                Sin resultados para "{search}"
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clave</th>
                    <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Descripción</th>
                    <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Unidad</th>
                    <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Cantidad</th>
                    <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">P.U.</th>
                    <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {conceptosFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-black text-primary tracking-tighter text-sm whitespace-nowrap">{c.clave}</td>
                      <td className="px-6 py-4 max-w-sm">
                        <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{c.descripcion}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block rounded-lg bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                          {c.unidad_medida}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-foreground">
                        {Number(c.cantidad).toLocaleString('es-MX', { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm text-foreground">
                        {formatMXN(Number(c.precio_unitario))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-black text-sm text-primary">{formatMXN(Number(c.importe))}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border/60 bg-muted/20">
                    <td colSpan={5} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      Total {search ? `(filtrado)` : `(${conceptosFiltrados.length} conceptos)`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-black text-base text-primary">{formatMXN(importeFiltrado)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Vista previa de importación                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={panelImport}
        onClose={() => { setPanelImport(false); setPreview([]); setArchivoNombre(''); }}
        title="Vista previa — Importación de Catálogo"
        subtitle={archivoNombre}
        accentColor="emerald"
        maxWidthClassName="max-w-5xl"
      >
        <div className="space-y-6 pb-28">

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">{validRows.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Listos para importar</p>
            </div>
            <div className={cn('rounded-2xl p-4 text-center border', invalidRows.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
              <p className={cn('text-2xl font-black', invalidRows.length > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{invalidRows.length}</p>
              <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', invalidRows.length > 0 ? 'text-amber-600/70' : 'text-muted-foreground')}>Se omitirán</p>
            </div>
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-sm font-black text-primary truncate">{formatMXN(totalImporte)}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary/70 mt-1">Importe total</p>
            </div>
          </div>

          {/* Advertencia de filas con error */}
          {invalidRows.length > 0 && (
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex gap-3">
              <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">{invalidRows.length} filas con datos incompletos serán ignoradas</p>
                <p className="text-[10px] text-amber-600/80 mt-1">
                  {invalidRows.slice(0, 3).map(r => `"${r.clave || r.descripcion || '?'}" (${r._error})`).join(' · ')}
                  {invalidRows.length > 3 && ` · y ${invalidRows.length - 3} más`}
                </p>
              </div>
            </div>
          )}

          {/* Tabla de vista previa */}
          <div className="rounded-2xl border border-border/40 overflow-hidden">
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                  <tr className="border-b border-border/40">
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estado</th>
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Clave</th>
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Descripción</th>
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Unidad</th>
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Cantidad</th>
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">P.U.</th>
                    <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {preview.map((row, i) => (
                    <tr key={i} className={cn(
                      'transition-colors',
                      row._valido
                        ? 'hover:bg-emerald-500/[0.03]'
                        : 'bg-amber-500/5 opacity-60'
                    )}>
                      <td className="px-4 py-2.5 text-center">
                        {row._valido
                          ? <IconCheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          : <span className="text-[9px] text-amber-600 font-bold" title={row._error}>omitir</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 font-black text-primary whitespace-nowrap">{row.clave || '—'}</td>
                      <td className="px-4 py-2.5 max-w-xs">
                        <span className="font-semibold text-foreground line-clamp-1">{row.descripcion || '—'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-black uppercase text-muted-foreground">
                          {row.unidad_medida || '?'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-foreground">
                        {row.cantidad > 0 ? row.cantidad.toLocaleString('es-MX', { maximumFractionDigits: 4 }) : <span className="text-amber-500">?</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-foreground">
                        {row.precio_unitario > 0 ? formatMXN(row.precio_unitario) : <span className="text-amber-500">?</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-black text-primary">
                        {row.importe > 0 ? formatMXN(row.importe) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur border-t border-border/40 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Se importarán <strong className="text-foreground">{validRows.length}</strong> conceptos · Total <strong className="text-primary">{formatMXN(totalImporte)}</strong>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setPanelImport(false); setPreview([]); setArchivoNombre(''); }}
              className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
            >
              Cancelar
            </button>
            <SubmitButton
              label={`Confirmar importación (${validRows.length} conceptos)`}
              loading={importando}
              color="emerald"
              onClick={handleConfirmarImport}
            />
          </div>
        </div>
      </SlidePanel>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Guía de exportación desde OPUS                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={panelGuia}
        onClose={() => setPanelGuia(false)}
        title="Cómo exportar desde OPUS"
        subtitle="Catálogo de Obra · Presupuesto Base"
        accentColor="sky"
        maxWidthClassName="max-w-2xl"
      >
        <div className="space-y-8 pb-10 text-sm">

          {/* Qué archivo usar */}
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">
              ¿Cuál de los 3 archivos de OPUS debo usar?
            </h3>
            <div className="space-y-3">
              {[
                {
                  nombre: '1. PRESUPUESTO',
                  usar: true,
                  desc: 'Contiene todos los conceptos de obra con clave, descripción, unidad, cantidad y precio unitario. Es el archivo que necesitas para cargar el catálogo.',
                },
                {
                  nombre: '2. ANÁLISIS DE PRECIOS UNITARIOS (APU)',
                  usar: false,
                  desc: 'Desglosa el costo de cada precio unitario en materiales, mano de obra y equipo. No es necesario para la carga inicial del catálogo.',
                },
                {
                  nombre: '3. EXPLOSIÓN DE INSUMOS',
                  usar: false,
                  desc: 'Lista consolidada de todos los materiales, mano de obra y equipo con sus cantidades totales. Se usará en el futuro para el catálogo de insumos.',
                },
              ].map(f => (
                <div key={f.nombre} className={cn(
                  'rounded-xl border p-4 flex gap-3',
                  f.usar
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border/30 bg-muted/20 opacity-70'
                )}>
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    f.usar ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    {f.usar
                      ? <IconCheckCircle2 className="h-4 w-4" />
                      : <IconX className="h-4 w-4" />
                    }
                  </div>
                  <div>
                    <p className="font-black text-xs text-foreground">{f.nombre}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pasos para exportar */}
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">
              Pasos para exportar el PRESUPUESTO desde OPUS
            </h3>
            <ol className="space-y-3">
              {[
                'Abre tu proyecto en OPUS.',
                'Ve al menú: Archivo → Exportar (o desde la barra de herramientas).',
                'Selecciona el reporte "Presupuesto".',
                'En el formato de salida, elige Excel (.xlsx) o CSV — NO imprimir a PDF.',
                'Guarda el archivo en tu computadora.',
                'Regresa aquí y haz clic en "Importar OPUS" para seleccionar el archivo.',
              ].map((paso, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{paso}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Formato esperado */}
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">
              Formato de columnas esperado
            </h3>
            <div className="rounded-xl bg-muted/40 border border-border/30 overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/60">
                    <th className="px-4 py-2.5 font-black text-muted-foreground">Columna en OPUS</th>
                    <th className="px-4 py-2.5 font-black text-muted-foreground">Alternativas reconocidas</th>
                    <th className="px-4 py-2.5 font-black text-muted-foreground">¿Requerida?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {[
                    { col: 'CLAVE', alts: 'CONCEPTO, CODIGO, PARTIDA', req: 'Sí' },
                    { col: 'DESCRIPCION', alts: 'NOMBRE, TRABAJOS', req: 'Sí' },
                    { col: 'UNIDAD', alts: 'U.M., UNIDAD DE MEDIDA', req: 'Sí' },
                    { col: 'CANTIDAD', alts: 'CANT, VOLUMEN', req: 'Sí' },
                    { col: 'P.U.', alts: 'PRECIO UNITARIO, COSTO DIRECTO', req: 'Sí' },
                    { col: 'IMPORTE', alts: 'TOTAL, MONTO', req: 'No (se calcula)' },
                  ].map(row => (
                    <tr key={row.col}>
                      <td className="px-4 py-2.5 font-black text-foreground">{row.col}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.alts}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          'text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                          row.req === 'Sí'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {row.req}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nota sobre PDFs */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
            <IconInfo className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700">Los archivos PDF no son importables</p>
              <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                Los PDFs son reportes impresos que no contienen datos estructurados. Para importar el catálogo debes exportar desde OPUS directamente a Excel (.xlsx) o CSV — no a PDF.
              </p>
            </div>
          </div>

          <button
            onClick={() => { setPanelGuia(false); fileInputRef.current?.click(); }}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <IconDownload className="h-4 w-4" />
            Seleccionar archivo para importar
          </button>
        </div>
      </SlidePanel>
    </>
  );
};

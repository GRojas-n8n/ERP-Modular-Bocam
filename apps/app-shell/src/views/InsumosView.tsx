/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Gerencia Técnica — Catálogo de Obra + Catálogo de Insumos
 *
 * Tab 1 — Catálogo de Obra:
 *   Importación del PRESUPUESTO OPUS (Excel/CSV). Vista previa + POST.
 *
 * Tab 2 — Insumos:
 *   Visualización y carga masiva del catálogo de insumos unitarios.
 *   Soporta dos fuentes de OPUS:
 *     a) ANÁLISIS DE PRECIOS UNITARIOS (APU) — extrae insumos por sección.
 *     b) EXPLOSIÓN DE INSUMOS — importación tabular directa.
 *   → POST /api/v1/gerencia-tecnica/insumos/importar-lote
 * ---------------------------------------------------------------------------
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { parseCsvOrExcelFileComoFilas } from '../lib/csvImport';
import api from '../lib/api';
import { useArrowKeyNav } from '../hooks/useArrowKeyNav';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';
import { TableScrollShadow } from '../components/TableScrollShadow';
import { ControlPresupuestalTabla } from '../components/ControlPresupuestalTabla';
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
  IconPackage,
  IconActivity,
} from '../components/Icons';
import { cn } from '../lib/utils';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface FichaTecnicaInsumo {
  id_ficha: string;
  nombre_doc: string;
  proveedor_ref?: string | null;
  mime_type: string;
  tamano_bytes: number;
  subido_por: string;
  created_at: string;
}

type ActiveTab = 'catalogo' | 'insumos' | 'control-costos' | 'control-presupuestal' | 'transferencias' | 'trazabilidad';

type TipoInsumo = 'MATERIAL' | 'MANO_DE_OBRA' | 'EQUIPO' | 'SUBCONTRATO' | 'INDIRECTO';

interface Concepto {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
  precio_actual: number | null;
  delta_pct: number | null;
}

interface Presupuesto {
  id: string;
  proyecto_id: string;
  version: number;
  estado: 'BORRADOR' | 'EN_REVISION' | 'APROBADO' | 'LIBERADO' | 'CONGELADO';
  importe_total: number;
  aprobado_por?: string | null;
  fecha_aprobacion?: string | null;
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

interface SaldoResumen {
  concepto_id: string;
  concepto_clave: string;
  concepto_desc: string;
  monto_aprobado: number;
  monto_comprometido: number;
  monto_ejercido: number;
  monto_en_proceso: number;
  monto_disponible: number;
  estado_tope: 'LIBRE' | 'LIMITADO' | 'BLOQUEADO' | 'SUSPENDIDO';
  pct_ejecutado: number;
}

interface InsumoData {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  tipo_insumo: TipoInsumo;
  costo_base: number;
  activo: boolean;
}

interface InsumoPreview {
  clave: string;
  descripcion: string;
  unidad_medida: string;
  tipo_insumo: TipoInsumo;
  costo_base: number;
  _valido: boolean;
  _error?: string;
}

/** Ítem de composición APU devuelto por GET /conceptos/:id/composicion */
interface ComposicionItemData {
  id: string;
  insumo_id: string;      // UUID del insumo en el catálogo — requerido para requisiciones
  tipo_insumo: TipoInsumo;
  cantidad: number;       // cantidad del insumo por UNIDAD de concepto
  rendimiento: number;
  costo_unitario: number; // precio del insumo al momento del APU
  subtotal: number;       // cantidad × costo_unitario (por unidad de concepto)
  insumo: {
    clave: string;
    descripcion: string;
    unidad_medida: string;
    tipo_insumo: TipoInsumo;
    costo_base: number;
  };
}

/** Ítem del panel Pre-Requisición GT — copia editable de un ítem de take-off */
interface PreReqItem {
  insumo_id: string;
  clave: string;
  descripcion: string;
  tipo_insumo: TipoInsumo;
  unidad: string;
  cantidad: number;          // editable por el GT
  cantidad_original: number; // cantidad calculada por el take-off — referencia para señalar excedente
  notas: string;
  incluido: boolean;         // checkbox — default true si cantidad_total > 0
}

type PreReqFiltroTipo = 'TODOS' | 'MATERIAL' | 'EQUIPO' | 'SERVICIO' | 'MANO_OBRA';

/** Un insumo dentro de la composición APU de un concepto. */
interface InsumoComposicion {
  clave_insumo: string;
  tipo_insumo: TipoInsumo;
  cantidad: number;
  rendimiento: number;
  costo_unitario: number;
}

/** Composición APU de un concepto: lista de insumos con cantidad y rendimiento. */
interface ComposicionConcepto {
  concepto_clave: string;    // Clave del concepto en el presupuesto (ej. "1", "2.3")
  insumos: InsumoComposicion[];
}

/** Resultado completo del parser APU: insumos planos + composiciones por concepto. */
interface APUParseResult {
  insumos: InsumoPreview[];
  composiciones: ComposicionConcepto[];
}

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoInsumo, string> = {
  MATERIAL:    'Material',
  MANO_DE_OBRA:'Mano de Obra',
  EQUIPO:      'Equipo',
  SUBCONTRATO: 'Subcontrato',
  INDIRECTO:   'Indirecto',
};

const TIPO_COLOR: Record<TipoInsumo, string> = {
  MATERIAL:    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  MANO_DE_OBRA:'bg-blue-500/10   text-blue-700   border-blue-500/20',
  EQUIPO:      'bg-amber-500/10  text-amber-700  border-amber-500/20',
  SUBCONTRATO: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  INDIRECTO:   'bg-muted/500/10  text-muted-foreground  border-slate-500/20',
};

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR:    'bg-amber-500/10 text-amber-600 border-amber-500/20',
  EN_REVISION: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  APROBADO:    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  LIBERADO:    'bg-green-500/10 text-green-600 border-green-500/20',
  CONGELADO:   'bg-muted/500/10 text-muted-foreground border-slate-500/20',
};

// ─── Helpers compartidos ──────────────────────────────────────────────────────

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

/**
 * Parsea un número que puede venir en varios formatos de exportación OPUS:
 *   - Con símbolo de moneda: "$5,325.85"  → 5325.85
 *   - Americano con comas:   "5,325.85"   → 5325.85
 *   - Europeo con puntos:    "1.234,56"   → 1234.56
 *   - Sin separadores:       "5325.85"    → 5325.85
 */
function parsearNumero(valor: string | number | undefined): number {
  if (valor === undefined || valor === null || valor === '') return 0;
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
  const s = String(valor).trim().replace(/[$€£¥\s%]/g, '');
  if (s === '' || s === '-') return 0;
  if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(s.replace(/,/g, '')) || 0;
}

/**
 * Normaliza nombres de columna a clave interna.
 * Mapea variaciones de OPUS: CLAVE/CONCEPTO, DESCRIPCION, UNIDAD, P.U., IMPORTE…
 */
function mapearColumna(nombre: string): string | null {
  const n = nombre.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  if (['CLAVE', 'CONCEPTO', 'CODIGO', 'COD', 'PARTIDA', 'CLAVECONT'].includes(n)) return 'clave';
  if (['DESCRIPCION', 'NOMBRE', 'DESC', 'TRABAJOS'].includes(n)) return 'descripcion';
  if (['UNIDAD', 'UM', 'UNIDADMEDIDA', 'UNID', 'UDM', 'UNIDADDEMEDIDA'].includes(n)) return 'unidad_medida';
  if (['CANTIDAD', 'CANT', 'VOLUMEN', 'QUANT'].includes(n)) return 'cantidad';
  if (['PU', 'PRECIOUNITARIO', 'PRECIO', 'COSTODIRECTO', 'COSTOUNITARIO', 'TARIFA'].includes(n)) return 'precio_unitario';
  if (['IMPORTE', 'TOTAL', 'MONTO', 'SUBTOTAL', 'COSTOINDIRECTO', 'IMPORTETOTAL'].includes(n)) return 'importe';
  return null;
}

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
  if (importe === 0 && cantidad > 0 && precio_unitario > 0) importe = cantidad * precio_unitario;
  const _valido = Boolean(clave && descripcion && unidad_medida && cantidad > 0 && precio_unitario > 0);
  const errores: string[] = [];
  if (!clave) errores.push('sin clave');
  if (!descripcion) errores.push('sin descripción');
  if (!unidad_medida) errores.push('sin unidad');
  if (cantidad <= 0) errores.push('cantidad inválida');
  if (precio_unitario <= 0) errores.push('precio inválido');
  return {
    clave, descripcion, unidad_medida: unidad_medida || 'PZA',
    cantidad, precio_unitario, importe,
    _valido,
    _error: errores.length ? errores.join(', ') : undefined,
  };
}

function esFilaEstructural(row: Record<string, string | number>): boolean {
  const values = Object.values(row).map(v => String(v ?? '').trim());
  const textos = values.filter(v => v.length > 0);
  if (textos.length <= 1) return true;
  const clavePar  = Object.entries(row).find(([k]) => mapearColumna(k) === 'clave');
  const unidadPar = Object.entries(row).find(([k]) => mapearColumna(k) === 'unidad_medida');
  if (clavePar) {
    const claveVal  = String(clavePar[1]    ?? '').trim();
    const unidadVal = String(unidadPar?.[1] ?? '').trim();
    if (/^\d+(\.\d+)*$/.test(claveVal) && unidadVal === '') return true;
  }
  return false;
}

function esCapituloNormalizado(c: ConceptoPreview): boolean {
  if (/^\d+(\.\d+)*$/.test(c.clave) && c.cantidad === 0 && c.precio_unitario === 0) return true;
  return false;
}

// ─── Parser: APU — Análisis de Precios Unitarios ─────────────────────────────
//
// El APU de OPUS tiene una estructura jerárquica:
//   [Encabezados de empresa - saltar]
//   "ANALISIS DEL TOTAL DE LOS PRECIOS UNITARIOS"
//   "Clave: X" → inicio de concepto
//     "Material" → inicio de sección
//       "CLAVE DESCRIPCION UNIDAD CANTIDAD Rendimiento COSTO UNITARIO TOTAL"
//       [filas de insumos]
//       "Total de Material: X"
//     "Mano de obra" → siguiente sección
//       [filas de insumos — con sub-filas "Rendimiento / JOR"]
//       "Total de Mano de obra: Y"
//     "Herramienta" → INDIRECTO
//     "Equipo costo horario" → EQUIPO
//   "Clave: X+1" → siguiente concepto
//
// Extrae insumos únicos (por clave) de todas las secciones.
// ─────────────────────────────────────────────────────────────────────────────
function parsearArchivoAPU(rawRows: (string | number)[][]): APUParseResult {
  // Infiere tipo de insumo desde prefijo de clave OPUS (sección "Auxiliar")
  function inferirTipoAPU(clave: string): TipoInsumo {
    const c = clave.toUpperCase();
    if (/^(CAM|EQ|MAQ|EXCAV|BOMB|GRUA|COMP|VIBR|SOLD|TORNO|RETRO)/.test(c)) return 'EQUIPO';
    if (/^(CFAP|JOR|MO|OFIC|PEO|ALB|ELEC|PLOM|PINT|CARP|AYU)/.test(c))      return 'MANO_DE_OBRA';
    if (/^(HH|HS|HER|HERRA)/.test(c))                                         return 'INDIRECTO';
    return 'MATERIAL'; // CFM, CIM, etc.
  }

  // Extrae la clave de concepto de un array de celdas buscando el patrón
  // "Clave: X" (mismo cell) o "Clave:" (cell N) + valor (cell N+1).
  // IMPORTANTE: el dos puntos es OBLIGATORIO — evita falsos positivos con "CLAVE"
  // en filas de encabezado de tabla (CLAVE | DESCRIPCION | UNIDAD | ...).
  function extraerClaveConcepto(celdas: string[]): string | null {
    for (let i = 0; i < celdas.length; i++) {
      const cell = celdas[i];
      // El dos puntos debe estar presente para distinguir "Clave: 5" de la
      // columna de encabezado "CLAVE".
      if (!/clave\s*:/i.test(cell)) continue;
      // Caso 1: "Clave: 1" o "Clave:1" en la misma celda
      const m = cell.match(/clave\s*:\s*(.+)/i);
      if (m && m[1].trim()) return m[1].trim();
      // Caso 2: la celda dice sólo "Clave:" (con dos puntos, sin valor tras él)
      // → el valor está en la siguiente celda no vacía de la misma fila
      if (/^clave\s*:\s*$/i.test(cell)) {
        const nextVal = celdas.slice(i + 1).find(c => c.trim() !== '');
        if (nextVal?.trim()) return nextVal.trim();
      }
    }
    return null;
  }

  const insumoMap     = new Map<string, InsumoPreview>();
  const composicionMap = new Map<string, ComposicionConcepto>(); // clave_concepto → composición

  let tipoActual: TipoInsumo | null = null;
  let enAuxiliar      = false;
  let headerDetectado = false; // se resetea al inicio de cada concepto

  // Clave del concepto actual (extraída de "Clave: X")
  let conceptoClave: string | null = null;

  // Posiciones de columna — defaults para OPUS Excel (col 0 vacía)
  let colClave         = 1;
  let colDescripcion   = 2;
  let colUnidad        = 3;
  let colCantidad      = 4;
  let colRendimiento   = 5;
  let colCostoUnitario = 6;

  for (const fila of rawRows) {
    const celdas = fila.map(c => String(c ?? '').trim());
    const noVacias = celdas.filter(c => c !== '');
    if (noVacias.length === 0) continue;

    // Primera celda no vacía — robusta ante columnas vacías al inicio
    const firstNonEmpty = noVacias[0] ?? '';

    // ── Inicio de nuevo concepto → resetear estado ────────────────────────────
    // Detecta "ANALISIS DEL TOTAL..." y "ANALISIS DEL PRECIO UNITARIO..."
    // Incluye variante con tilde (ANÁLISIS) y sin ella.
    if (/^an[aá]lisis\s+del\s+(total|precio)/i.test(firstNonEmpty)) {
      // La clave del concepto puede estar en otra celda de esta misma fila
      const claveEnFila = extraerClaveConcepto(celdas);
      if (claveEnFila) conceptoClave = claveEnFila;
      headerDetectado = false; tipoActual = null; enAuxiliar = false;
      continue;
    }

    // Detectar "Clave: X" en CUALQUIER celda de la fila.
    // OPUS puede poner "Clave:" en columna B y el valor en columna D.
    // Condición de trigger: la celda debe contener "clave:" (con dos puntos)
    // para NO confundirla con la columna de encabezado "CLAVE" (sin dos puntos).
    if (celdas.some(c => /clave\s*:/i.test(c))) {
      const clave = extraerClaveConcepto(celdas);
      if (clave !== null) {
        conceptoClave = clave;
        headerDetectado = false; tipoActual = null; enAuxiliar = false;
        continue;
      }
    }

    // ── Skip metadatos del concepto ───────────────────────────────────────────
    if (/^descripci[oó]n?/i.test(firstNonEmpty)) continue; // "Descripción"
    if (/^unidad\s*:/i.test(firstNonEmpty)) continue;       // "Unidad: M3 / Cantidad: ..."

    // ── Detectar encabezado de tabla de insumos (CLAVE + DESCRIPCION) ─────────
    if (!headerDetectado) {
      const norm = celdas.map(c => c.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z]/g, ''));
      const iCl  = norm.findIndex(c => c === 'CLAVE' || c === 'CODIGO');
      const iDe  = norm.findIndex(c => c.startsWith('DESCRIPCION') || c === 'DESC');
      if (iCl >= 0 && iDe >= 0) {
        colClave       = iCl;
        colDescripcion = iDe;
        const iU  = norm.findIndex(c => c === 'UNIDAD' || c === 'UM' || c === 'UNIDADMEDIDA');
        if (iU  >= 0) colUnidad = iU;
        const iCa = norm.findIndex(c => c === 'CANTIDAD' || c === 'CANT');
        if (iCa >= 0) colCantidad = iCa;
        const iRe = norm.findIndex(c => c === 'RENDIMIENTO' || c.startsWith('RENDIM'));
        if (iRe >= 0) colRendimiento = iRe;
        const iCo = celdas.findIndex(c => /costo\s*unit/i.test(c) || /costo\s*dir/i.test(c));
        if (iCo >= 0) colCostoUnitario = iCo;
        headerDetectado = true;
      }
      continue;
    }

    // ── Detectar secciones de tipo (no resetean headerDetectado) ──────────────
    if (/^material(es)?$/i.test(firstNonEmpty))    { tipoActual = 'MATERIAL';    enAuxiliar = false; continue; }
    if (/^mano\s+de\s+obra$/i.test(firstNonEmpty)) { tipoActual = 'MANO_DE_OBRA'; enAuxiliar = false; continue; }
    if (/^herramienta(s)?$/i.test(firstNonEmpty))  { tipoActual = 'INDIRECTO';   enAuxiliar = false; continue; }
    if (/^equipo/i.test(firstNonEmpty))            { tipoActual = 'EQUIPO';      enAuxiliar = false; continue; }
    if (/^subcontrat/i.test(firstNonEmpty))        { tipoActual = 'SUBCONTRATO'; enAuxiliar = false; continue; }
    if (/^auxiliar/i.test(firstNonEmpty))          { tipoActual = null; enAuxiliar = true; continue; }

    // ── Skip filas de totales / resumen ──────────────────────────────────────
    if (/^total\s+de\s+/i.test(firstNonEmpty))          continue;
    if (/^rendimiento\s*\//i.test(firstNonEmpty))        continue;
    if (/^costo\s+(directo|unitario)/i.test(firstNonEmpty)) continue;
    if (/^precio\s+unitario/i.test(firstNonEmpty))       continue;
    if (/^indirectos/i.test(firstNonEmpty))              continue;
    if (/^subtotal/i.test(firstNonEmpty))                continue;
    if (/^financiamiento/i.test(firstNonEmpty))          continue;
    if (/^utilidad/i.test(firstNonEmpty))                continue;
    if (/^cargos\s+adicionales/i.test(firstNonEmpty))    continue;
    if (/^\*\*/.test(firstNonEmpty))                     continue;
    if (/^cantidad\s+\S/i.test(firstNonEmpty))           continue;

    // ── Procesar fila de insumo ───────────────────────────────────────────────
    const clave = celdas[colClave] ?? '';
    const desc  = celdas[colDescripcion] ?? '';
    let unidad  = celdas[colUnidad] ?? '';

    if (!clave || clave.length < 2) continue;
    if (/^\d+(\.\d+)*$/.test(clave)) continue;
    if (/^(total|suma|sub)/i.test(clave)) continue;

    const tipo: TipoInsumo = enAuxiliar ? inferirTipoAPU(clave) : (tipoActual ?? 'MATERIAL');

    // Cantidad y rendimiento (para la composición)
    const cantidad    = parsearNumero(celdas[colCantidad]);
    const rendimiento = parsearNumero(celdas[colRendimiento]);

    // Costo unitario con fallback al primer número > 0 desde col 4
    let costoBase = parsearNumero(celdas[colCostoUnitario]);
    if (costoBase === 0) {
      for (let i = 4; i < celdas.length; i++) {
        const v = parsearNumero(celdas[i]);
        if (v > 0) { costoBase = v; break; }
      }
    }

    // Default de unidad por tipo
    if (!unidad) {
      if (tipo === 'MANO_DE_OBRA') unidad = 'JOR';
      else if (tipo === 'EQUIPO')  unidad = 'HORA';
    }

    const claveNorm = clave.toUpperCase().trim();

    // ── Catálogo plano (único por clave) ─────────────────────────────────────
    if (!insumoMap.has(claveNorm)) {
      const errores: string[] = [];
      if (!desc)           errores.push('sin descripción');
      if (costoBase === 0) errores.push('sin costo unitario');
      insumoMap.set(claveNorm, {
        clave:         claveNorm,
        descripcion:   desc || '(sin descripción)',
        unidad_medida: (unidad || 'PZA').toUpperCase(),
        tipo_insumo:   tipo,
        costo_base:    costoBase,
        _valido:       Boolean(clave && desc),
        _error:        errores.length ? errores.join(', ') : undefined,
      });
    }

    // ── Composición por concepto ──────────────────────────────────────────────
    if (conceptoClave) {
      const ck = conceptoClave.trim().toUpperCase();
      if (!composicionMap.has(ck)) {
        composicionMap.set(ck, { concepto_clave: conceptoClave.trim(), insumos: [] });
      }
      // Un insumo puede aparecer en múltiples conceptos; dentro de uno solo una vez
      const comp = composicionMap.get(ck)!;
      if (!comp.insumos.find(i => i.clave_insumo === claveNorm)) {
        comp.insumos.push({ clave_insumo: claveNorm, tipo_insumo: tipo, cantidad, rendimiento, costo_unitario: costoBase });
      }
    }
  }

  // ── Diagnóstico en consola si no se generaron composiciones ─────────────────
  // Abre F12 → Consola en el navegador para ver qué filas detectó el parser.
  if (composicionMap.size === 0 && insumoMap.size > 0) {
    console.warn(
      `[APU Parser] ⚠️ ${insumoMap.size} insumos encontrados PERO 0 composiciones.\n` +
      'El parser no pudo identificar filas "Clave: X" en el archivo.\n' +
      'Revisa las primeras 50 filas del archivo a continuación:'
    );
    rawRows.slice(0, 50).forEach((row, i) => {
      const nonEmpty = row.map(c => String(c ?? '').trim()).filter(Boolean);
      if (nonEmpty.length > 0) {
        console.log(`  Fila ${String(i).padStart(2, '0')}: ${nonEmpty.join(' | ')}`);
      }
    });
    console.info(
      '[APU Parser] 💡 Busca en las filas de arriba el texto "Clave" o el número de partida ' +
      'que precede a cada grupo de insumos. Ese es el patrón que necesita el parser.'
    );
  } else if (composicionMap.size > 0) {
    console.log(
      `[APU Parser] ✅ ${composicionMap.size} composiciones detectadas:`,
      Array.from(composicionMap.keys())
    );
  }

  return {
    insumos:       Array.from(insumoMap.values()),
    composiciones: Array.from(composicionMap.values()),
  };
}

// ─── Parser: Explosión de Insumos ─────────────────────────────────────────────
//
// Formato OPUS "LISTADO DE INSUMOS" — verificado contra exportación real BOCAM:
//
//   [Filas de encabezado empresa/obra → saltar]
//   "LISTADO DE INSUMOS"                              ← título de sección
//   CLAVE | DESCRIPCION Y ESPECIFICACION TECNICA | UNIDAD | CANTIDAD | COSTO UNITARIO | IMPORTE | PORCENTAJE
//   Material                        $54,328.13  39.19%   ← fila de sección (no insumo)
//   CFM001 | TUBO CONDUIT PVC 2'' | M | 13.44 | $65.00 | $873.60 | 0.63%
//   ...
//   Mano de Obra                    $35,278.17  25.45%   ← siguiente sección
//   CFAP001 | CABO DE OFICIALES | JOR | ...
//   Herramienta                     $3,527.82   2.54%    → tipo INDIRECTO
//   HH | HERRAMIENTA MENOR | (%)mo | ...
//   Equipo                          $45,509.60  32.82%   → tipo EQUIPO
//   CAM001 | CAMIONETA F-350 | HORA | ...
//   [fila total final]
//
// Reglas clave:
//   - La cabecera de columnas aparece UNA SOLA VEZ.  Tras detectarla,
//     las filas de sección solo cambian tipoActual (sin resetear el modo).
//   - "DESCRIPCION Y ESPECIFICACION TECNICA" → startsWith('DESCRIPCION').
//   - La primera celda no vacía se usa para detectar secciones (robustez
//     ante desplazamientos de columna en distintas versiones de OPUS).
//   - Herramienta → INDIRECTO  /  Equipo → EQUIPO.
// ─────────────────────────────────────────────────────────────────────────────
function parsearArchivoExplosion(rawRows: (string | number)[][]): InsumoPreview[] {
  const insumoMap = new Map<string, InsumoPreview>();
  let tipoActual: TipoInsumo = 'MATERIAL';
  let headerDetectado = false; // una vez true, nunca regresa

  // Posiciones de columna; defaults válidos para el formato BOCAM verificado:
  //   Col 0: CLAVE · Col 1: DESCRIPCION Y... · Col 2: UNIDAD · Col 4: COSTO UNITARIO
  let colClave         = 0;
  let colDescripcion   = 1;
  let colUnidad        = 2;
  let colCostoUnitario = 4;

  for (const fila of rawRows) {
    const celdas = fila.map(c => String(c ?? '').trim());
    const noVacias = celdas.filter(c => c !== '');
    if (noVacias.length === 0) continue;

    // Primera celda con contenido — usada para detectar nombres de sección
    const firstNonEmpty = noVacias[0] ?? '';

    // ── FASE 1: Buscar encabezado de columnas ───────────────────────────────
    if (!headerDetectado) {
      const norm = celdas.map(c =>
        c.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z]/g, '')
      );
      const iClave = norm.findIndex(c => c === 'CLAVE' || c === 'CODIGO');
      // "DESCRIPCION Y ESPECIFICACION TECNICA" → "DESCRIPCIONYESPECIFICACIONTECNICA"
      // → usamos startsWith para que coincida con cualquier variante
      const iDesc = norm.findIndex(c => c.startsWith('DESCRIPCION') || c === 'DESC');
      if (iClave >= 0 && iDesc >= 0) {
        colClave       = iClave;
        colDescripcion = iDesc;
        const iU = norm.findIndex(c => c === 'UNIDAD' || c === 'UM');
        if (iU >= 0) colUnidad = iU;
        // Detectar columna de costo: "COSTO UNITARIO" / "PRECIO UNITARIO" / "COSTO DIRECTO"
        const iCosto = celdas.findIndex(c =>
          /costo\s*unit/i.test(c) || /precio\s*unit/i.test(c) || /costo\s*dir/i.test(c)
        );
        if (iCosto >= 0) colCostoUnitario = iCosto;
        headerDetectado = true;
      }
      // Saltear cualquier fila antes de que aparezca el encabezado
      continue;
    }

    // ── FASE 2: Filas después del encabezado ───────────────────────────────

    // Detectar nombre de sección → solo actualizar tipoActual, NO resetear modo
    if (/^material(es)?$/i.test(firstNonEmpty))                        { tipoActual = 'MATERIAL';    continue; }
    if (/^mano\s+de\s+obra$/i.test(firstNonEmpty))                     { tipoActual = 'MANO_DE_OBRA'; continue; }
    if (/^herramienta/i.test(firstNonEmpty))                           { tipoActual = 'INDIRECTO';   continue; }
    if (/^equipo/i.test(firstNonEmpty))                                { tipoActual = 'EQUIPO';      continue; }
    if (/^subcontrat/i.test(firstNonEmpty))                            { tipoActual = 'SUBCONTRATO'; continue; }

    // Extraer datos de insumo
    const clave  = celdas[colClave]         ?? '';
    const desc   = celdas[colDescripcion]   ?? '';
    const unidad = celdas[colUnidad]        ?? '';
    const precio = parsearNumero(celdas[colCostoUnitario]);

    // Saltear filas sin clave, con clave numérica pura o de totales/resumen
    if (!clave) continue;
    if (/^\d+(\.\d+)*$/.test(clave)) continue;
    if (/^(total|suma|importe|resumen|listado)/i.test(clave)) continue;

    const claveNorm = clave.toUpperCase().trim();

    if (!insumoMap.has(claveNorm)) {
      const errores: string[] = [];
      if (!desc)        errores.push('sin descripción');
      if (!unidad)      errores.push('sin unidad');
      if (precio === 0) errores.push('sin costo unitario');

      insumoMap.set(claveNorm, {
        clave:         claveNorm,
        descripcion:   desc || '(sin descripción)',
        unidad_medida: (unidad || 'PZA').toUpperCase(),
        tipo_insumo:   tipoActual,
        costo_base:    precio,
        _valido:       Boolean(clave && desc && unidad),
        _error:        errores.length ? errores.join(', ') : undefined,
      });
    }
  }

  return Array.from(insumoMap.values());
}


// ─── Leer archivo Excel/CSV como array de arrays ──────────────────────────────
function leerArchivoComoRawRows(
  file: File,
  onSuccess: (rows: (string | number)[][]) => void,
  onError: (msg: string) => void
): void {
  parseCsvOrExcelFileComoFilas(file)
    .then(rows => onSuccess(rows))
    .catch((e: any) => onError(`Error al leer el archivo: ${e.message}`));
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export const InsumosView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant, currentProjectId, user } = useTenant();
  const { notify } = useNotification();
  const rolesUsuario: string[] = user?.role ?? [];
  const puedeAprobar = rolesUsuario.some(r => ['gerencia_tecnica', 'admin'].includes(r));

  const activeTab: ActiveTab = (activeSubView as ActiveTab) || 'catalogo';

  // ── Estado Tab 1: Catálogo de Obra ────────────────────────────────────────
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [panelImport, setPanelImport] = useState(false);
  const [panelGuia,   setPanelGuia]   = useState(false);
  const [importando,  setImportando]  = useState(false);
  const [aprobando,   setAprobando]   = useState(false);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [preview, setPreview]         = useState<ConceptoPreview[]>([]);
  const [parseError, setParseError]   = useState<string | null>(null);

  // ── Estado: Saldo por partida ─────────────────────────────────────────────
  const [saldoMap, setSaldoMap] = useState<Record<string, SaldoResumen>>({});
  const [saldoPanelConcepto, setSaldoPanelConcepto] = useState<SaldoResumen | null>(null);

  // ── Estado Tab: Transferencias ────────────────────────────────────────────
  interface Transferencia {
    id: string;
    tipo: string;
    concepto_origen_clave: string;
    concepto_origen_desc: string;
    concepto_destino_clave: string;
    concepto_destino_desc: string;
    monto: number;
    justificacion: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'REVERTIDA';
    solicitado_por_nombre: string;
    aprobado_por_nombre?: string;
    motivo_rechazo?: string;
    created_at: string;
  }
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loadingTrans, setLoadingTrans] = useState(false);
  const [modalRechazo, setModalRechazo] = useState<{ id: string } | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [modalNuevaTrans, setModalNuevaTrans] = useState(false);
  const [nuevaTrans, setNuevaTrans] = useState({ concepto_origen_id: '', concepto_destino_id: '', monto: '', justificacion: '' });
  const [enviandoTrans, setEnviandoTrans] = useState(false);

  // ── Estado Tab: Trazabilidad ──────────────────────────────────────────────
  interface TrazabilidadConcepto {
    concepto_id: string; clave: string; descripcion: string;
    monto_presupuestado: number; monto_comprado: number; monto_consumido: number;
    semaforo: string; pct_comprado: number; pct_consumido: number;
  }
  const [trazabilidad, setTrazabilidad] = useState<TrazabilidadConcepto[]>([]);
  const [loadingTraz, setLoadingTraz]   = useState(false);
  const [trazParcial, setTrazParcial]   = useState(false);
  const [trazExpanded, setTrazExpanded] = useState<Set<string>>(new Set());

  // ── Estado Tab 2: Insumos ─────────────────────────────────────────────────
  const fileInputAPURef       = useRef<HTMLInputElement>(null);
  const fileInputExplosionRef = useRef<HTMLInputElement>(null);
  const [insumos, setInsumos]             = useState<InsumoData[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [errorInsumos, setErrorInsumos]   = useState<string | null>(null);
  const [searchInsumos, setSearchInsumos] = useState('');
  const [filtroTipo, setFiltroTipo]       = useState<TipoInsumo | ''>('');
  const [panelAPU,       setPanelAPU]     = useState(false);
  const [panelExplosion, setPanelExplosion] = useState(false);
  const [importandoInsumos, setImportandoInsumos] = useState(false);
  const [archivoNombreInsumo, setArchivoNombreInsumo] = useState('');
  const [previewInsumos, setPreviewInsumos] = useState<InsumoPreview[]>([]);
  const [parseErrorInsumos, setParseErrorInsumos] = useState<string | null>(null);
  // Composiciones APU: solo disponibles cuando se importa un APU (no Explosión)
  const [previewComposiciones, setPreviewComposiciones] = useState<ComposicionConcepto[]>([]);

  // ── Estado: Take-off / Panel de Composición APU ────────────────────────────
  const [panelTakeoff,         setPanelTakeoff]         = useState(false);
  const [conceptoTakeoff,      setConceptoTakeoff]      = useState<Concepto | null>(null);
  const [composicionItems,     setComposicionItems]     = useState<ComposicionItemData[]>([]);
  const [loadingComposicion,   setLoadingComposicion]   = useState(false);
  const [cantidadTakeoff,      setCantidadTakeoff]      = useState<number>(0);
  // ── Estado: Panel Pre-Requisición GT ─────────────────────────────────────
  const [showPreReqPanel,      setShowPreReqPanel]      = useState(false);
  const [preReqItems,          setPreReqItems]          = useState<PreReqItem[]>([]);
  const [preReqFiltroTipo,     setPreReqFiltroTipo]     = useState<PreReqFiltroTipo>('TODOS');
  const [preReqPrioridad,      setPreReqPrioridad]      = useState<'NORMAL' | 'ALTA' | 'URGENTE'>('ALTA');
  const [preReqObservaciones,  setPreReqObservaciones]  = useState('');
  const [enviandoPreReq,       setEnviandoPreReq]       = useState(false);

  // ── Estado: Control de Costos WBS ────────────────────────────────────────
  interface CostosWbsRow {
    concepto_id: string;
    clave: string;
    descripcion: string;
    unidad_medida: string;
    presupuesto: number;
    comprometido: number;
    pagado: number;
    pct_economico: number | null;
    pct_fisico: number | null;
    semaforo: 'verde' | 'amarillo' | 'rojo' | 'sin_dato';
    categorias: { nombre: string; comprometido: number; pagado: number }[];
    requisiciones: { folio: string; estado: string; monto: number }[];
  }
  const [costosWbs, setCostosWbs] = useState<CostosWbsRow[]>([]);
  const [costosLoading, setCostosLoading] = useState(false);
  const [costosExpandedId, setCostosExpandedId] = useState<string | null>(null);
  const [costosFiltroCategoria, setCostosFiltroCategoria] = useState('');
  const [costosFiltroDes, setCostosFiltroDes] = useState(false);
  const [costosCategoriasDisp, setCostosCategoriasDisp] = useState<string[]>([]);

  // ── Estado Tab 4: Control Presupuestal ───────────────────────────────────
  interface PartidaCP {
    concepto_id: string; clave: string; descripcion: string;
    categoria_predominante: string | null;
    presupuestado: number; comprometido: number; pagado: number;
    disponible: number; pct_ejercido: number;
  }
  interface ReporteCP {
    proyectoId: string; presupuesto_id: string | null;
    total_presupuestado: number; total_comprometido: number;
    total_pagado: number; total_disponible: number; pct_ejercido: number;
    parcial: boolean; advertencias: string[];
    partidas: PartidaCP[];
    sin_partida_comprometido: number; sin_partida_pagado: number;
  }
  const [cpData, setCpData] = useState<ReporteCP | null>(null);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);
  const [cpCategoria, setCpCategoria] = useState('');
  const [cpExporting, setCpExporting] = useState<'PDF' | 'XLSX' | null>(null);

  // ── Estado: Dashboard GT ──────────────────────────────────────────────────
  interface GtDash {
    pendientes_revision: number;
    en_evaluacion_tecnica: number;
    aprobados_este_mes: number;
    monto_comprometido: number;
    alertas: Array<{ comparativa_id: string; folio: string; proyecto: string; dias_en_espera: number; mensaje: string }>;
    parcial: boolean;
  }
  const [gtDash, setGtDash] = useState<GtDash | null>(null);

  const loadControlPresupuestal = async () => {
    if (!currentProjectId) return;
    setCpLoading(true);
    setCpError(null);
    try {
      const params = cpCategoria ? `?categoria=${cpCategoria}` : '';
      const res = await api.get(`/api/v1/gerencia-tecnica/reportes/control-presupuestal${params}`);
      setCpData(res.data.data ?? res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Error al cargar reporte.';
      setCpError(msg);
    } finally {
      setCpLoading(false);
    }
  };

  const exportarCP = async (formato: 'PDF' | 'XLSX') => {
    setCpExporting(formato);
    try {
      const resp = await api.post(
        '/api/v1/gerencia-tecnica/reportes/control-presupuestal/export',
        { formato, categoria: cpCategoria || undefined },
        { responseType: 'blob' }
      );
      const ext = formato === 'PDF' ? 'pdf' : 'xlsx';
      const url = URL.createObjectURL(resp.data as Blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `control-presupuestal.${ext}`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
    } catch {
      notify({ type: 'error', title: 'Error al exportar', message: 'No se pudo generar el archivo.' });
    } finally {
      setCpExporting(null);
    }
  };

  const loadCostosWbs = async () => {
    if (!currentProjectId) return;
    setCostosLoading(true);
    try {
      const res = await api.get(`/api/v1/gerencia-tecnica/proyectos/${currentProjectId}/costos-wbs`);
      const raw: any[] = res.data?.data?.conceptos ?? [];
      const rows: CostosWbsRow[] = raw.map((c: any) => ({
        concepto_id: c.id,
        clave: c.clave,
        descripcion: c.descripcion,
        unidad_medida: c.unidad_medida,
        presupuesto: Number(c.presupuesto ?? 0),
        comprometido: Number(c.comprometido ?? 0),
        pagado: Number(c.pagado ?? 0),
        pct_economico: c.pct_economico ?? null,
        pct_fisico: null,
        semaforo: c.semaforo === 'ambar' ? 'amarillo' : (c.semaforo ?? 'sin_dato'),
        categorias: [],
        requisiciones: [],
      }));
      setCostosWbs(rows);
      setCostosCategoriasDisp([]);
    } catch { /* silencioso */ }
    finally { setCostosLoading(false); }
  };

  // ── Estado: Fichas técnicas de insumo ────────────────────────────────────
  const [insumoFichasId,   setInsumoFichasId]   = useState<string | null>(null);
  const [fichasInsumo,     setFichasInsumo]     = useState<FichaTecnicaInsumo[]>([]);
  const [loadingFichasIns, setLoadingFichasIns] = useState(false);
  const [uploadingFichaIns, setUploadingFichaIns] = useState(false);
  const fichaInsFileRef = useRef<HTMLInputElement>(null);

  const fetchFichasInsumo = async (id: string) => {
    setLoadingFichasIns(true);
    try {
      const resp = await api.get(`/api/v1/gerencia-tecnica/insumos/${id}/fichas`);
      setFichasInsumo(resp.data.data ?? []);
    } catch (_) { setFichasInsumo([]); }
    finally { setLoadingFichasIns(false); }
  };

  const handleFichaInsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !insumoFichasId) return;
    setUploadingFichaIns(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      fd.append('nombre_doc', file.name);
      await api.post(`/api/v1/gerencia-tecnica/insumos/${insumoFichasId}/fichas`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify({ type: 'success', title: 'Ficha subida', message: file.name });
      await fetchFichasInsumo(insumoFichasId);
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al subir', message: err.response?.data?.message ?? err.message });
    } finally { setUploadingFichaIns(false); }
  };

  const handleFichaInsDelete = async (fichaId: string) => {
    if (!insumoFichasId) return;
    try {
      await api.delete(`/api/v1/gerencia-tecnica/insumos/${insumoFichasId}/fichas/${fichaId}`);
      setFichasInsumo(prev => prev.filter(f => f.id_ficha !== fichaId));
      notify({ type: 'success', title: 'Ficha eliminada', message: '' });
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al eliminar', message: err.response?.data?.message ?? err.message });
    }
  };

  // ── Derivados Tab 1 ───────────────────────────────────────────────────────
  const validRows    = useMemo(() => preview.filter(r => r._valido), [preview]);
  const invalidRows  = useMemo(() => preview.filter(r => !r._valido), [preview]);
  const totalImporte = useMemo(() => validRows.reduce((s, r) => s + r.importe, 0), [validRows]);

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

  // ── Derivados Tab 2 ───────────────────────────────────────────────────────
  const insumosFiltrados = useMemo(() => {
    let lista = insumos;
    if (filtroTipo) lista = lista.filter(i => i.tipo_insumo === filtroTipo);
    if (searchInsumos.trim()) {
      const q = searchInsumos.toLowerCase();
      lista = lista.filter(i =>
        i.clave.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [insumos, filtroTipo, searchInsumos]);

  // ── Navegación con teclado en los 3 paneles de catálogo ─────────────────
  // Ver openspec/changes/navegacion-teclado-catalogos.
  useArrowKeyNav({
    enabled: !!insumoFichasId,
    items: insumosFiltrados,
    currentId: insumoFichasId,
    getId: (i) => i.id,
    onNavigate: (i) => setInsumoFichasId(i.id),
  });

  useArrowKeyNav({
    enabled: !!conceptoTakeoff,
    items: conceptosFiltrados,
    currentId: conceptoTakeoff?.id ?? null,
    getId: (c) => c.id,
    onNavigate: (c) => handleAbrirTakeoff(c),
  });

  useArrowKeyNav({
    enabled: !!saldoPanelConcepto,
    items: conceptosFiltrados,
    currentId: saldoPanelConcepto?.concepto_id ?? null,
    getId: (c) => c.id,
    onNavigate: (c) => {
      const saldo = saldoMap[c.id];
      if (saldo) setSaldoPanelConcepto(saldo);
    },
  });

  const insumosPorTipo = useMemo(() => {
    const counts: Partial<Record<TipoInsumo, number>> = {};
    for (const i of insumos) counts[i.tipo_insumo] = (counts[i.tipo_insumo] ?? 0) + 1;
    return counts;
  }, [insumos]);

  const validPreviewInsumos   = useMemo(() => previewInsumos.filter(r => r._valido), [previewInsumos]);
  const invalidPreviewInsumos = useMemo(() => previewInsumos.filter(r => !r._valido), [previewInsumos]);

  // ── Derivados: Take-off ───────────────────────────────────────────────────
  /** Cada ítem de composición multiplicado por la cantidad a ejecutar */
  const takeoffItems = useMemo(() =>
    composicionItems.map(item => ({
      ...item,
      cantidad_total:  item.cantidad * cantidadTakeoff,
      subtotal_total:  item.cantidad * cantidadTakeoff * item.costo_unitario,
    })),
    [composicionItems, cantidadTakeoff]
  );

  /** Costo total agrupado por tipo */
  const takeoffPorTipo = useMemo(() => {
    const result: Partial<Record<TipoInsumo, number>> = {};
    for (const item of takeoffItems) {
      result[item.tipo_insumo] = (result[item.tipo_insumo] ?? 0) + item.subtotal_total;
    }
    return result;
  }, [takeoffItems]);

  const takeoffTotal = useMemo(() =>
    takeoffItems.reduce((s, i) => s + i.subtotal_total, 0),
    [takeoffItems]
  );

  /** Costo unitario derivado de la composición (debe ≈ precio_unitario del concepto) */
  const costoDirectoUnitario = useMemo(() =>
    composicionItems.reduce((s, i) => s + i.subtotal, 0),
    [composicionItems]
  );

  /** Ítems del panel Pre-Req filtrados por tipo */
  const preReqItemsFiltrados = useMemo(() => {
    if (preReqFiltroTipo === 'TODOS') return preReqItems;
    const mapFiltro: Record<PreReqFiltroTipo, TipoInsumo | null> = {
      TODOS: null,
      MATERIAL: 'MATERIAL',
      EQUIPO:   'EQUIPO',
      SERVICIO: 'SUBCONTRATO',
      MANO_OBRA:'MANO_DE_OBRA',
    };
    const tipoTarget = mapFiltro[preReqFiltroTipo];
    if (!tipoTarget) return preReqItems;
    return preReqItems.filter(i => i.tipo_insumo === tipoTarget);
  }, [preReqItems, preReqFiltroTipo]);

  const preReqIncludedCount = useMemo(
    () => preReqItems.filter(i => i.incluido).length,
    [preReqItems]
  );

  // ── Fetch Tab 1 ───────────────────────────────────────────────────────────
  const fetchPresupuesto = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tenant?.id === 'iretum-demo') { setPresupuesto(null); return; }
      const res = await api.get('/api/v1/gerencia-tecnica/presupuestos');
      const lista: Presupuesto[] = res.data.data || [];
      setPresupuesto(lista.length > 0 ? lista[0] : null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión con Gerencia Técnica.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaldoPartidas = async () => {
    try {
      if (tenant?.id === 'iretum-demo') return;
      const res = await api.get('/api/v1/gerencia-tecnica/partidas/resumen');
      const lista: SaldoResumen[] = res.data.data || [];
      const map: Record<string, SaldoResumen> = {};
      for (const s of lista) map[s.concepto_id] = s;
      setSaldoMap(map);
    } catch {
      // saldo no crítico — tabla sigue funcionando sin él
    }
  };

  const fetchTransferencias = async (estado?: string) => {
    if (tenant?.id === 'iretum-demo') { setTransferencias([]); return; }
    setLoadingTrans(true);
    try {
      const url = '/api/v1/gerencia-tecnica/transferencias-partida' + (estado ? `?estado=${estado}` : '');
      const res = await api.get(url);
      setTransferencias(res.data.data?.transferencias || []);
    } catch {
      setTransferencias([]);
    } finally {
      setLoadingTrans(false);
    }
  };

  const aprobarTransferencia = async (id: string) => {
    try {
      await api.patch(`/api/v1/gerencia-tecnica/transferencias-partida/${id}/aprobar`);
      notify({ type: 'success', title: 'Transferencia aprobada', message: 'Los saldos se ajustaron automáticamente.' });
      void fetchTransferencias();
      void fetchSaldoPartidas();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Error al aprobar transferencia.' });
    }
  };

  const rechazarTransferencia = async () => {
    if (!modalRechazo) return;
    try {
      await api.patch(`/api/v1/gerencia-tecnica/transferencias-partida/${modalRechazo.id}/rechazar`, { motivo_rechazo: motivoRechazo });
      notify({ type: 'success', title: 'Transferencia rechazada' });
      setModalRechazo(null);
      setMotivoRechazo('');
      void fetchTransferencias();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Error al rechazar transferencia.' });
    }
  };

  const solicitarTransferencia = async () => {
    setEnviandoTrans(true);
    try {
      await api.post('/api/v1/gerencia-tecnica/transferencias-partida', {
        tipo: 'INTERNA',
        concepto_origen_id:  nuevaTrans.concepto_origen_id || undefined,
        concepto_destino_id: nuevaTrans.concepto_destino_id,
        monto:               parseFloat(nuevaTrans.monto),
        justificacion:       nuevaTrans.justificacion,
      });
      notify({ type: 'success', title: 'Transferencia solicitada', message: 'Pendiente de aprobación del director.' });
      setModalNuevaTrans(false);
      setNuevaTrans({ concepto_origen_id: '', concepto_destino_id: '', monto: '', justificacion: '' });
      void fetchTransferencias();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Error al solicitar transferencia.' });
    } finally {
      setEnviandoTrans(false);
    }
  };

  const handleAprobarPresupuesto = async () => {
    if (!presupuesto) return;
    setAprobando(true);
    try {
      await api.patch(`/api/v1/gerencia-tecnica/presupuestos/${presupuesto.id}/aprobar`);
      notify({ title: 'Presupuesto aprobado — la composición APU queda bloqueada.', type: 'success' });
      void fetchPresupuesto();
    } catch (err: any) {
      notify({ title: err.response?.data?.message || 'Error al aprobar presupuesto.', type: 'error' });
    } finally {
      setAprobando(false);
    }
  };

  // ── Exportar Presupuesto Excel ────────────────────────────────────────────
  const exportarPresupuestoExcel = async () => {
    if (!presupuesto || presupuesto.conceptos.length === 0) return;
    try {
      const body = {
        version: presupuesto.version,
        estado: presupuesto.estado,
        importe_total: Number(presupuesto.importe_total),
        conceptos: presupuesto.conceptos.map(c => ({
          clave: c.clave,
          descripcion: c.descripcion,
          unidad_medida: c.unidad_medida,
          cantidad: c.cantidad,
          precio_unitario: c.precio_unitario,
          importe: c.importe,
          precio_actual: c.precio_actual,
          delta_pct: c.delta_pct,
        })),
      };
      const resp = await api.post('/api/v1/reportes/presupuesto-excel', { presupuesto: body }, { responseType: 'blob' });
      const url = URL.createObjectURL(resp.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Presupuesto-v${presupuesto.version}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
    } catch {
      notify({ type: 'error', title: 'Error al exportar', message: 'No se pudo conectar con el servicio de reportes.' });
    }
  };

  // ── Fetch Tab 2 ───────────────────────────────────────────────────────────
  const fetchInsumos = async () => {
    setLoadingInsumos(true);
    setErrorInsumos(null);
    try {
      if (tenant?.id === 'iretum-demo') { setInsumos([]); return; }
      const res = await api.get('/api/v1/gerencia-tecnica/insumos');
      setInsumos(res.data.data || []);
    } catch (err: any) {
      setErrorInsumos(err.response?.data?.message || 'Error al obtener catálogo de insumos.');
    } finally {
      setLoadingInsumos(false);
    }
  };

  useEffect(() => { void fetchPresupuesto(); }, [currentProjectId]);
  useEffect(() => {
    if (presupuesto?.estado === 'APROBADO' || presupuesto?.estado === 'LIBERADO' || presupuesto?.estado === 'CONGELADO') {
      void fetchSaldoPartidas();
    }
  }, [presupuesto?.id, presupuesto?.estado]);
  useEffect(() => { if (activeTab === 'insumos') void fetchInsumos(); }, [activeTab, currentProjectId]);
  useEffect(() => { if (activeTab === 'control-costos') void loadCostosWbs(); }, [activeTab, currentProjectId]);
  useEffect(() => { if (activeTab === 'control-presupuestal') void loadControlPresupuestal(); }, [activeTab, currentProjectId]);
  useEffect(() => { if (activeTab === 'transferencias') void fetchTransferencias(); }, [activeTab, currentProjectId]);
  useEffect(() => { if (activeTab === 'trazabilidad') void fetchTrazabilidad(); }, [activeTab, currentProjectId]);
  useEffect(() => {
    if (tenant?.id === 'iretum-demo') return;
    api.get('/api/v1/gerencia-tecnica/dashboard').then(r => setGtDash(r.data?.data ?? null)).catch(() => {});
  }, [tenant?.id, currentProjectId]);

  // ── Abrir panel de Take-off para un concepto ──────────────────────────────
  const handleAbrirTakeoff = async (concepto: Concepto) => {
    setConceptoTakeoff(concepto);
    setCantidadTakeoff(Number(concepto.cantidad)); // default = cantidad presupuestada
    setComposicionItems([]);
    setPanelTakeoff(true);
    setLoadingComposicion(true);
    try {
      const res = await api.get(`/api/v1/gerencia-tecnica/conceptos/${concepto.id}/composicion`);
      setComposicionItems(res.data.data || []);
    } catch (_) {
      setComposicionItems([]);
    } finally {
      setLoadingComposicion(false);
    }
  };

  // ── Preparar Pre-Requisición GT: abrir panel de revisión ─────────────────
  const handlePrepararRequisicion = () => {
    if (!conceptoTakeoff || cantidadTakeoff <= 0 || takeoffItems.length === 0) return;

    // Poblar preReqItems desde takeoffItems — solo ítems con insumo_id vinculado
    const items: PreReqItem[] = takeoffItems
      .filter(item => item.insumo_id)
      .map(item => {
        const cantOrig = Number(item.cantidad_total.toFixed(4));
        return {
          insumo_id:         item.insumo_id,
          clave:             item.insumo.clave,
          descripcion:       item.insumo.descripcion,
          tipo_insumo:       item.tipo_insumo,
          unidad:            item.insumo.unidad_medida,
          cantidad:          cantOrig,
          cantidad_original: cantOrig,
          notas:             `APU ${conceptoTakeoff!.clave}: ${item.cantidad} × ${cantidadTakeoff} ${conceptoTakeoff!.unidad_medida}`,
          incluido:          item.cantidad_total > 0,
        };
      });

    setPreReqItems(items);
    setPreReqFiltroTipo('TODOS');
    setPreReqPrioridad('ALTA');
    setPreReqObservaciones(
      `Take-off APU · ${conceptoTakeoff.clave} · ${conceptoTakeoff.descripcion} · ${cantidadTakeoff} ${conceptoTakeoff.unidad_medida}`
    );
    // Cerrar panel take-off y abrir pre-req (clean swap)
    setPanelTakeoff(false);
    setShowPreReqPanel(true);
  };

  // ── Enviar Pre-Requisición a Compras ──────────────────────────────────────
  const handleEnviarPreReq = async () => {
    const itemsIncluidos = preReqItems.filter(i => i.incluido);

    if (itemsIncluidos.length === 0) {
      notify({ type: 'error', title: 'Sin ítems seleccionados', message: 'Selecciona al menos un ítem para continuar.', duration: 5000 });
      return;
    }
    const itemsSinCantidad = itemsIncluidos.filter(i => i.cantidad <= 0);
    if (itemsSinCantidad.length > 0) {
      notify({ type: 'error', title: 'Cantidades inválidas', message: 'Ajusta la cantidad de todos los ítems seleccionados.', duration: 5000 });
      return;
    }

    // Demo mode — simulación
    if (tenant?.id === 'iretum-demo') {
      notify({
        type: 'success',
        title: 'Pre-requisición enviada (demo)',
        message: `REQ-DEMO-001 · ${itemsIncluidos.length} ítem${itemsIncluidos.length !== 1 ? 's' : ''} · Compras la recibirá para cotizar.`,
        duration: 8000,
      });
      setShowPreReqPanel(false);
      setPreReqItems([]);
      setComposicionItems([]);
      setConceptoTakeoff(null);
      return;
    }

    setEnviandoPreReq(true);
    try {
      const res = await api.post('/api/v1/compras/requisiciones', {
        tipo: 'NORMAL',
        prioridad: preReqPrioridad,
        observaciones: preReqObservaciones,
        items: itemsIncluidos.map(item => ({
          insumo_id: item.insumo_id,
          cantidad: item.cantidad,
          notas: item.notas || undefined,
        })),
      });
      const reqGenerada = res.data.data;
      notify({
        type: 'success',
        title: 'Requisición enviada a Compras',
        message: `${reqGenerada.codigo} · ${itemsIncluidos.length} ítem${itemsIncluidos.length !== 1 ? 's' : ''} · Compras la recibirá para cotizar.`,
        duration: 8000,
      });
      setShowPreReqPanel(false);
      setPreReqItems([]);
      setComposicionItems([]);
      setConceptoTakeoff(null);
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error al enviar requisición',
        message: err.response?.data?.message || err.message,
        duration: 6000,
      });
    } finally {
      setEnviandoPreReq(false);
    }
  };

  // ── Fetch Trazabilidad ────────────────────────────────────────────────────
  const fetchTrazabilidad = async () => {
    if (!currentProjectId) return;
    setLoadingTraz(true);
    try {
      const r = await api.get('/api/v1/gerencia-tecnica/trazabilidad/resumen');
      setTrazabilidad(r.data?.data ?? []);
      setTrazParcial(r.data?.parcial ?? false);
    } catch {
      setTrazabilidad([]);
    } finally {
      setLoadingTraz(false);
    }
  };

  // ── Leer Catálogo de Obra (Tab 1) ─────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombre(file.name);
    setParseError(null);

    parseCsvOrExcelFileComoFilas(file)
      .then(allRowsRaw => {
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(30, allRowsRaw.length); i++) {
          const fila = allRowsRaw[i];
          const reconocidas = fila.filter(
            cell => typeof cell === 'string' && mapearColumna(cell) !== null
          );
          if (reconocidas.length >= 2) { headerRowIndex = i; break; }
        }

        if (headerRowIndex === -1) {
          const primeraFila = allRowsRaw[0] ?? [];
          setParseError(
            `No se reconocieron columnas del formato OPUS.\n` +
            `Columnas detectadas: ${primeraFila.join(', ')}\n` +
            `Columnas esperadas: CLAVE, DESCRIPCION, UNIDAD, CANTIDAD, P.U., IMPORTE`
          );
          return;
        }

        // Equivalente a sheet_to_json(ws, {defval:'', raw:false, range: headerRowIndex}):
        // la fila en headerRowIndex se usa como encabezados, cada fila siguiente se
        // convierte a objeto con esas llaves.
        const encabezados = allRowsRaw[headerRowIndex];
        const rawRows: Record<string, string>[] = allRowsRaw.slice(headerRowIndex + 1).map(fila => {
          const obj: Record<string, string> = {};
          encabezados.forEach((clave, i) => { obj[clave] = fila[i] ?? ''; });
          return obj;
        });

        if (rawRows.length === 0) {
          setParseError('El archivo está vacío o no tiene filas de datos.');
          return;
        }

        const primeraFila = rawRows[0];
        const columnasReconocidas = Object.keys(primeraFila).filter(k => mapearColumna(k) !== null);
        if (columnasReconocidas.length < 2) {
          setParseError(
            `No se reconocieron columnas del formato OPUS.\n` +
            `Columnas: ${Object.keys(primeraFila).join(', ')}`
          );
          return;
        }

        const conceptos = rawRows
          .filter(row => !esFilaEstructural(row))
          .map(row => normalizarFila(row))
          .filter(c => c.clave !== '' || c.descripcion !== '')
          .filter(c => !esCapituloNormalizado(c));

        if (conceptos.length === 0) {
          setParseError('No se encontraron conceptos válidos en el archivo.');
          return;
        }

        setPreview(conceptos);
        setPanelImport(true);
      })
      .catch((err: any) => setParseError(`Error al leer el archivo: ${err.message}`));
    e.target.value = '';
  };

  // ── Confirmar Importación Catálogo (Tab 1) ────────────────────────────────
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
          clave: c.clave, descripcion: c.descripcion, unidad_medida: c.unidad_medida,
          cantidad: c.cantidad, precio_unitario: c.precio_unitario,
        })),
      };
      await api.post('/api/v1/gerencia-tecnica/presupuestos', payload);
      notify({ type: 'success', title: 'Catálogo importado', message: `${validRows.length} conceptos importados.`, duration: 5000 });
      setPanelImport(false);
      setPreview([]);
      setArchivoNombre('');
      void fetchPresupuesto();
    } catch (err: any) {
      notify({ type: 'error', title: 'Error al importar', message: err.response?.data?.message || err.message, duration: 6000 });
    } finally {
      setImportando(false);
    }
  };

  // ── Leer archivo APU (Tab 2) ──────────────────────────────────────────────
  const handleFileAPU = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombreInsumo(file.name);
    setParseErrorInsumos(null);
    setPreviewComposiciones([]); // limpiar composiciones anteriores
    leerArchivoComoRawRows(
      file,
      (rows) => {
        const resultado = parsearArchivoAPU(rows);
        if (resultado.insumos.length === 0) {
          setParseErrorInsumos(
            'No se encontraron insumos en el archivo APU.\n' +
            'Verifica que el archivo sea la exportación "ANÁLISIS DE PRECIOS UNITARIOS" de OPUS.'
          );
          return;
        }
        setPreviewInsumos(resultado.insumos);
        setPreviewComposiciones(resultado.composiciones);
        setPanelAPU(true);
      },
      (msg) => setParseErrorInsumos(msg)
    );
    e.target.value = '';
  };

  // ── Leer archivo Explosión de Insumos (Tab 2) ─────────────────────────────
  const handleFileExplosion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombreInsumo(file.name);
    setParseErrorInsumos(null);
    setPreviewComposiciones([]); // Explosión no genera composiciones
    leerArchivoComoRawRows(
      file,
      (rows) => {
        const extraidos = parsearArchivoExplosion(rows);
        if (extraidos.length === 0) {
          setParseErrorInsumos(
            'No se encontraron insumos en el archivo.\n' +
            'Verifica que el archivo sea la "EXPLOSIÓN DE INSUMOS" de OPUS.'
          );
          return;
        }
        setPreviewInsumos(extraidos);
        setPanelExplosion(true);
      },
      (msg) => setParseErrorInsumos(msg)
    );
    e.target.value = '';
  };

  // ── Confirmar Importación de Insumos (Tab 2) ──────────────────────────────
  const handleConfirmarInsumos = async () => {
    if (validPreviewInsumos.length === 0) return;
    setImportandoInsumos(true);
    try {
      // 1. Importar catálogo plano de insumos
      const res = await api.post('/api/v1/gerencia-tecnica/insumos/importar-lote', {
        insumos: validPreviewInsumos.map(i => ({
          clave: i.clave,
          descripcion: i.descripcion,
          unidad_medida: i.unidad_medida,
          tipo_insumo: i.tipo_insumo,
          costo_base: i.costo_base,
        })),
      });
      const { creados, actualizados, omitidos } = res.data.data;

      // 2. Importar composiciones APU (solo si el parser extrajo composiciones)
      // El backend resuelve el presupuesto del proyecto activo (del JWT)
      // internamente — el frontend NO necesita conocer el presupuesto_id.
      let compMsg = '';
      if (previewComposiciones.length > 0) {
        try {
          const resComp = await api.post(
            '/api/v1/gerencia-tecnica/composicion-apu',
            { composiciones: previewComposiciones }
          );
          const { vinculados, actualizados: compAct, omitidos: compOmit } = resComp.data.data;
          const total = vinculados + compAct;
          compMsg = total > 0
            ? ` · ${total} relaciones APU vinculadas`
            : ` · APU importado (${compOmit} vínculos omitidos — claves sin coincidencia)`;
        } catch (compErr: any) {
          const msg = compErr?.response?.data?.error?.message || compErr?.message || '';
          if (msg.toLowerCase().includes('presupuesto')) {
            compMsg = ' · sin presupuesto — importa primero el Catálogo de Obra';
          } else {
            compMsg = ' · composición APU no guardada (reintenta)';
          }
        }
      }

      notify({
        type: 'success',
        title: 'Insumos importados',
        message: `${creados} nuevos · ${actualizados} actualizados${omitidos > 0 ? ` · ${omitidos} omitidos` : ''}${compMsg}`,
        duration: 6000,
      });
      setPanelAPU(false);
      setPanelExplosion(false);
      setPreviewInsumos([]);
      setPreviewComposiciones([]);
      setArchivoNombreInsumo('');
      void fetchInsumos();
    } catch (err: any) {
      notify({
        type: 'error',
        title: 'Error al importar insumos',
        message: err.response?.data?.message || err.message,
        duration: 6000,
      });
    } finally {
      setImportandoInsumos(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inputs ocultos */}
      <input ref={fileInputRef}       type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileChange} />
      <input ref={fileInputAPURef}    type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileAPU} />
      <input ref={fileInputExplosionRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileExplosion} />

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
                  {activeTab === 'catalogo' ? 'Catálogo de Obra' : activeTab === 'control-costos' ? 'Control de Costos' : activeTab === 'control-presupuestal' ? 'Control Presupuestal' : activeTab === 'transferencias' ? 'Transferencias' : 'Insumos'}
                </h1>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {activeTab === 'catalogo'
                    ? 'Conceptos de obra · Presupuesto base del proyecto'
                    : activeTab === 'control-costos'
                    ? 'Acumulados por partida · Comprometido vs. Presupuesto'
                    : activeTab === 'control-presupuestal'
                    ? 'Presupuestado vs. Comprometido vs. Pagado por partida'
                    : activeTab === 'transferencias'
                    ? 'Movimientos de presupuesto entre partidas · Aprobación requerida'
                    : 'Catálogo maestro de insumos · Materiales, M.O., Equipo'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => activeTab === 'catalogo' ? fetchPresupuesto() : fetchInsumos()}
              className="p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/60 transition-all shadow-sm active:scale-90"
              title="Refrescar"
            >
              <IconRefreshCw className={cn('h-4 w-4 text-muted-foreground', (loading || loadingInsumos) && 'animate-spin')} />
            </button>

            {activeTab === 'catalogo' && (
              <>
                <button
                  onClick={() => setPanelGuia(true)}
                  className="flex items-center gap-2 px-4 py-3 border border-border/60 bg-card text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-muted/60 active:scale-95 transition-all"
                >
                  <IconInfo className="h-4 w-4" />
                  ¿Cómo exportar?
                </button>
                {presupuesto && presupuesto.conceptos.length > 0 && tenant?.id !== 'iretum-demo' && (
                  <button
                    onClick={exportarPresupuestoExcel}
                    className="flex items-center gap-2 px-4 py-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 active:scale-95 transition-all"
                    title="Descargar presupuesto como Excel"
                  >
                    <IconDownload className="h-4 w-4" />
                    Exportar Excel
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  <IconDownload className="h-4 w-4" />
                  Importar OPUS
                </button>
              </>
            )}

            {activeTab === 'insumos' && (
              <>
                <button
                  onClick={() => fileInputExplosionRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  <IconLayers className="h-4 w-4" />
                  Importar Explosión
                </button>
                <button
                  onClick={() => fileInputAPURef.current?.click()}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  <IconDownload className="h-4 w-4" />
                  Importar APU
                </button>
              </>
            )}
          </div>
        </div>


        {/* ── Dashboard GT ─────────────────────────────────────────────────── */}
        {gtDash && (
          <div className="space-y-4">
            {gtDash.parcial && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2">
                <IconAlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Datos parcialmente disponibles — Compras no responde</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Pendientes GT',      value: gtDash.pendientes_revision,    color: gtDash.pendientes_revision > 0 ? 'text-red-600' : 'text-foreground',   bg: gtDash.pendientes_revision > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-card border-border/30' },
                { label: 'En evaluación téc.', value: gtDash.en_evaluacion_tecnica,  color: 'text-amber-600', bg: 'bg-amber-500/5 border-amber-500/20' },
                { label: 'Aprobados este mes', value: gtDash.aprobados_este_mes,     color: 'text-emerald-700', bg: 'bg-emerald-500/5 border-emerald-500/20' },
                { label: 'Monto comprometido', value: `$${gtDash.monto_comprometido.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`, color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
              ].map(k => (
                <div key={k.label} className={cn('rounded-2xl border p-4', k.bg)}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</p>
                  <p className={cn('mt-1 text-2xl font-black leading-tight', k.color)}>{k.value}</p>
                </div>
              ))}
            </div>
            {gtDash.alertas.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  {gtDash.alertas.length} cuadro{gtDash.alertas.length !== 1 ? 's' : ''} en espera
                </p>
                {gtDash.alertas.map(a => (
                  <div key={a.comparativa_id} className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2">
                    <span className="text-xs font-bold text-amber-800">{a.folio} — {a.proyecto}</span>
                    <span className="shrink-0 text-[10px] font-black text-amber-700">{a.dias_en_espera}d esperando</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Error de parseo ── */}
        {(parseError || parseErrorInsumos) && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
            <IconAlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">Error al leer el archivo</p>
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                {parseError || parseErrorInsumos}
              </p>
            </div>
            <button onClick={() => { setParseError(null); setParseErrorInsumos(null); }} className="text-muted-foreground hover:text-foreground">
              <IconX className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: CATÁLOGO DE OBRA                                            */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'catalogo' && (
          <>
            {presupuesto && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Conceptos', value: presupuesto.conceptos.length.toString(), color: 'text-foreground' },
                  { label: 'Importe Total',   value: formatMXN(Number(presupuesto.importe_total)), color: 'text-primary' },
                  { label: 'Versión',         value: `v${presupuesto.version}`, color: 'text-foreground' },
                  { label: 'Estado',          value: presupuesto.estado, color: 'text-foreground', badge: true },
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

            {presupuesto && presupuesto.estado === 'BORRADOR' && puedeAprobar && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-3">
                <p className="text-xs text-amber-700 font-semibold">
                  Este presupuesto está en <strong>BORRADOR</strong>. Apruébalo para congelar los precios y evitar modificaciones.
                </p>
                <button
                  onClick={handleAprobarPresupuesto}
                  disabled={aprobando}
                  className="shrink-0 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {aprobando ? 'Aprobando...' : 'Aprobar Presupuesto'}
                </button>
              </div>
            )}

            {presupuesto && (
              <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
                <div className="relative flex-1 group">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por clave, descripción o unidad..."
                    className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent rounded-xl text-xs font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-background transition-all"
                  />
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 px-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {conceptosFiltrados.length} conceptos
                  </span>
                  <span className="text-sm font-black text-primary tracking-tighter">{formatMXN(importeFiltrado)}</span>
                </div>
              </div>
            )}

            <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-6">
                  <div className="h-12 w-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Cargando catálogo...</p>
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
                  <button onClick={fetchPresupuesto} className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                    Reintentar
                  </button>
                </div>
              ) : !presupuesto ? (
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
              ) : conceptosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                  <IconLayers className="h-16 w-16 text-muted-foreground opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                    Sin resultados para "{search}"
                  </p>
                </div>
              ) : (
                <TableScrollShadow>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/30">
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clave</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Descripción</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Unidad</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Cantidad</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">P.U.</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">P. Actual</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Δ%</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Importe</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Saldo</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">APU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {conceptosFiltrados.map((c) => {
                        const saldo = saldoMap[c.id];
                        const esBloqueado = saldo?.estado_tope === 'BLOQUEADO';
                        return (
                        <tr key={c.id} className={cn('hover:bg-primary/[0.02] transition-colors group', esBloqueado && 'bg-red-500/[0.04] hover:bg-red-500/[0.07]')}>
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
                          <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                            {c.precio_actual != null ? formatMXN(c.precio_actual) : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {c.delta_pct != null ? (
                              <span className={cn(
                                'text-xs font-black',
                                c.delta_pct > 0 ? 'text-red-600' : c.delta_pct < 0 ? 'text-emerald-600' : 'text-muted-foreground'
                              )}>
                                {c.delta_pct > 0 ? '+' : ''}{c.delta_pct}%
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/40">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-black text-sm text-primary">{formatMXN(Number(c.importe))}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {saldo ? (
                              <button
                                onClick={() => setSaldoPanelConcepto(saldo)}
                                className="group/saldo inline-flex flex-col items-end gap-0.5"
                                title="Ver desglose de saldo"
                              >
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border',
                                  saldo.estado_tope === 'LIBRE'     && 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
                                  saldo.estado_tope === 'LIMITADO'  && 'bg-amber-500/10  text-amber-700  border-amber-500/20',
                                  saldo.estado_tope === 'BLOQUEADO' && 'bg-red-500/10    text-red-700    border-red-500/20',
                                  saldo.estado_tope === 'SUSPENDIDO'&& 'bg-muted/40      text-muted-foreground border-border/40',
                                )}>
                                  {esBloqueado && <span>🔒</span>}
                                  {saldo.estado_tope}
                                </span>
                                <span className="font-mono text-xs font-bold text-foreground group-hover/saldo:underline">
                                  {formatMXN(Number(saldo.monto_disponible))}
                                </span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/30">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleAbrirTakeoff(c)}
                              title="Ver composición APU y calcular take-off"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500/20 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <IconActivity className="h-3 w-3" />
                              APU
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/60 bg-muted/20">
                        <td colSpan={9} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                          Total {search ? `(filtrado)` : `(${conceptosFiltrados.length} conceptos)`}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-black text-base text-primary">{formatMXN(importeFiltrado)}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </TableScrollShadow>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: INSUMOS                                                      */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'insumos' && (
          <>
            {/* Stats por tipo */}
            {insumos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(['MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'SUBCONTRATO', 'INDIRECTO'] as TipoInsumo[]).map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setFiltroTipo(filtroTipo === tipo ? '' : tipo)}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition-all active:scale-95',
                      filtroTipo === tipo
                        ? TIPO_COLOR[tipo] + ' shadow-sm'
                        : 'border-border/40 bg-card hover:bg-muted/40'
                    )}
                  >
                    <p className="text-lg font-black text-foreground">{insumosPorTipo[tipo] ?? 0}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{TIPO_LABEL[tipo]}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Barra de búsqueda + total */}
            {insumos.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
                <div className="relative flex-1 group">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="text" value={searchInsumos} onChange={e => setSearchInsumos(e.target.value)}
                    placeholder="Buscar por clave o descripción..."
                    className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-transparent rounded-xl text-xs font-semibold focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-background transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 px-2">
                  {filtroTipo && (
                    <button
                      onClick={() => setFiltroTipo('')}
                      className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-foreground"
                    >
                      <IconX className="h-3.5 w-3.5" />
                      {TIPO_LABEL[filtroTipo]}
                    </button>
                  )}
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {insumosFiltrados.length} insumos
                  </span>
                </div>
              </div>
            )}

            {/* Tabla de insumos */}
            <div className="bg-card rounded-3xl border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
              {loadingInsumos ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-6">
                  <div className="h-12 w-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Cargando insumos...</p>
                </div>
              ) : errorInsumos ? (
                <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center gap-6">
                  <IconAlertCircle className="h-16 w-16 text-destructive opacity-30" />
                  <div>
                    <h3 className="font-black text-base text-foreground uppercase tracking-tighter">Error de conexión</h3>
                    <p className="text-muted-foreground mt-2 text-xs">{errorInsumos}</p>
                  </div>
                  <button onClick={fetchInsumos} className="px-6 py-3 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                    Reintentar
                  </button>
                </div>
              ) : insumos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-6 text-center px-8">
                  <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <IconLayers className="h-10 w-10 text-primary opacity-60" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-foreground">Catálogo de insumos vacío</p>
                    <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                      Importa el <strong>APU</strong> (Análisis de Precios Unitarios) o la <strong>Explosión de Insumos</strong> desde OPUS para poblar este catálogo.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => fileInputAPURef.current?.click()}
                      className="px-6 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <IconDownload className="h-4 w-4" />
                      Importar APU
                    </button>
                    <button
                      onClick={() => fileInputExplosionRef.current?.click()}
                      className="px-6 py-3 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-muted/80 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <IconLayers className="h-4 w-4" />
                      Importar Explosión
                    </button>
                  </div>
                </div>
              ) : insumosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                  <IconSearch className="h-16 w-16 text-muted-foreground opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                    Sin resultados para "{searchInsumos}"
                  </p>
                </div>
              ) : (
                <TableScrollShadow>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/30">
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clave</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Descripción</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Unidad</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tipo</th>
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Costo Base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {insumosFiltrados.map((ins) => (
                        <tr key={ins.id} className="hover:bg-primary/[0.02] transition-colors">
                          <td className="px-6 py-3.5 font-black text-primary tracking-tighter text-sm whitespace-nowrap">{ins.clave}</td>
                          <td className="px-6 py-3.5 max-w-sm">
                            <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{ins.descripcion}</span>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className="inline-block rounded-lg bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                              {ins.unidad_medida}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={cn('inline-block rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider', TIPO_COLOR[ins.tipo_insumo])}>
                              {TIPO_LABEL[ins.tipo_insumo]}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right font-mono font-black text-sm text-primary">
                            {formatMXN(Number(ins.costo_base))}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => { setInsumoFichasId(ins.id); fetchFichasInsumo(ins.id); }}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-2 py-1 text-[9px] font-bold text-indigo-600 hover:bg-indigo-500/20 transition-colors"
                              title="Ver fichas técnicas"
                            >
                              📎 Fichas
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/60 bg-muted/20">
                        <td colSpan={4} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                          {filtroTipo || searchInsumos ? `Filtrado: ${insumosFiltrados.length}` : `Total: ${insumos.length} insumos`}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {Object.entries(insumosPorTipo).map(([t, n]) => `${n} ${TIPO_LABEL[t as TipoInsumo]}`).join(' · ')}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </TableScrollShadow>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: CONTROL DE COSTOS                                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'control-costos' && (
          <div className="space-y-6 px-4 md:px-8 pb-12">
            {costosLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/10 border-t-indigo-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Calculando acumulados...</p>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                {(() => {
                  const totalPres = costosWbs.reduce((s, r) => s + r.presupuesto, 0);
                  const totalComp = costosWbs.reduce((s, r) => s + r.comprometido, 0);
                  const totalPag = costosWbs.reduce((s, r) => s + r.pagado, 0);
                  const enRiesgo = costosWbs.filter(r => r.semaforo === 'rojo').length;
                  const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                  return (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        { label: 'Presupuesto Total', value: fmt(totalPres), color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                        { label: 'Comprometido',     value: fmt(totalComp), color: 'text-amber-600',  bg: 'bg-amber-500/10' },
                        { label: 'Pagado',           value: fmt(totalPag),  color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                        { label: 'Partidas en Riesgo', value: String(enRiesgo), color: 'text-red-600', bg: 'bg-red-500/10' },
                      ].map(kpi => (
                        <div key={kpi.label} className="rounded-2xl border border-border/30 bg-card p-5">
                          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                            <span className={`text-lg font-black ${kpi.color}`}>$</span>
                          </div>
                          <div className={`mb-0.5 text-xl font-black tracking-tighter ${kpi.color}`}>{kpi.value}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className="rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    value={costosFiltroCategoria}
                    onChange={e => setCostosFiltroCategoria(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {costosCategoriasDisp.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={costosFiltroDes}
                      onChange={e => setCostosFiltroDes(e.target.checked)}
                      className="h-3.5 w-3.5 rounded"
                    />
                    Solo con desviación
                  </label>
                  <button
                    onClick={() => loadCostosWbs()}
                    className="ml-auto flex items-center gap-1.5 rounded-xl border border-border/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/40"
                  >
                    Actualizar
                  </button>
                </div>

                {/* Tabla WBS */}
                <TableScrollShadow className="rounded-2xl border border-border/30 bg-card shadow-sm">
                  <table className="w-full min-w-[900px] text-xs">
                    <thead className="border-b border-border/30 bg-muted/20">
                      <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clave</th>
                        <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción</th>
                        <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Presupuesto</th>
                        <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comprometido</th>
                        <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pagado</th>
                        <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">% Económico</th>
                        <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Semáforo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {costosWbs
                        .filter(r => {
                          if (costosFiltroCategoria && !r.categorias.some(c => c.nombre === costosFiltroCategoria)) return false;
                          if (costosFiltroDes && r.semaforo !== 'rojo' && r.semaforo !== 'amarillo') return false;
                          return true;
                        })
                        .map(row => {
                          const isExp = costosExpandedId === row.concepto_id;
                          const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                          const sem = {
                            verde:   { label: '🟢', cls: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20' },
                            amarillo:{ label: '🟡', cls: 'text-amber-700 bg-amber-500/10 border-amber-500/20' },
                            rojo:    { label: '🔴', cls: 'text-red-700 bg-red-500/10 border-red-500/20' },
                            sin_dato:{ label: '⚪', cls: 'text-muted-foreground bg-muted/30 border-border/30' },
                          }[row.semaforo];
                          return (
                            <>
                              <tr
                                key={row.concepto_id}
                                className="cursor-pointer hover:bg-muted/20 transition-colors"
                                onClick={() => setCostosExpandedId(isExp ? null : row.concepto_id)}
                              >
                                <td className="px-5 py-3 font-mono text-[10px] font-black text-indigo-700">{row.clave}</td>
                                <td className="max-w-[250px] truncate px-5 py-3 text-xs font-medium">{row.descripcion}</td>
                                <td className="px-5 py-3 text-right font-mono text-xs font-bold">{fmt(row.presupuesto)}</td>
                                <td className="px-5 py-3 text-right font-mono text-xs font-bold text-amber-700">{fmt(row.comprometido)}</td>
                                <td className="px-5 py-3 text-right font-mono text-xs font-bold text-emerald-700">{fmt(row.pagado)}</td>
                                <td className="px-5 py-3 text-center text-xs font-black">
                                  {row.pct_economico != null ? `${row.pct_economico.toFixed(1)}%` : '—'}
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-black ${sem.cls}`}>
                                    {sem.label}
                                  </span>
                                </td>
                              </tr>
                              {isExp && (
                                <tr key={`${row.concepto_id}-exp`} className="bg-muted/10">
                                  <td colSpan={7} className="px-8 py-4">
                                    <div className="space-y-3">
                                      {row.categorias.length > 0 && (
                                        <div>
                                          <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Desglose por categoría</p>
                                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                            {row.categorias.map(cat => (
                                              <div key={cat.nombre} className="flex items-center justify-between rounded-xl border border-border/30 bg-card px-3 py-2">
                                                <span className="text-[10px] font-bold text-foreground">{cat.nombre}</span>
                                                <div className="flex gap-3 text-[10px]">
                                                  <span className="text-amber-700">{fmt(cat.comprometido)}</span>
                                                  <span className="text-emerald-700">{fmt(cat.pagado)}</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {row.requisiciones.length > 0 && (
                                        <div>
                                          <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Requisiciones vinculadas</p>
                                          <div className="space-y-1">
                                            {row.requisiciones.map(req => (
                                              <div key={req.folio} className="flex items-center justify-between rounded-xl border border-border/20 bg-card px-3 py-2">
                                                <span className="font-mono text-[10px] font-black text-indigo-700">{req.folio}</span>
                                                <span className="text-[9px] text-muted-foreground">{req.estado}</span>
                                                <span className="font-mono text-[10px] font-bold text-amber-700">{fmt(req.monto)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {row.categorias.length === 0 && row.requisiciones.length === 0 && (
                                        <p className="text-[10px] text-muted-foreground">Sin requisiciones vinculadas a esta partida.</p>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      {costosWbs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-xs text-muted-foreground">
                            Sin datos de costos. Crea requisiciones con partida asignada para ver acumulados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </TableScrollShadow>
              </>
            )}
          </div>
        )}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CONTROL PRESUPUESTAL                                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'control-presupuestal' && (
          <div className="space-y-6 px-4 md:px-8 pb-12">
            {/* Banner datos parciales (6.5) */}
            {cpData?.parcial && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-[11px] font-bold text-amber-700">Datos parciales</p>
                  <p className="text-[10px] text-amber-600">{cpData.advertencias.join(' · ')}</p>
                </div>
              </div>
            )}

            {/* Filtro + exportar (6.3 + 6.6) */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={cpCategoria}
                onChange={e => { setCpCategoria(e.target.value); }}
                className="rounded-xl border border-border/50 bg-card px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todas las categorías</option>
                <option value="MATERIAL">Material</option>
                <option value="MANO_DE_OBRA">Mano de obra</option>
                <option value="EQUIPO">Equipo</option>
                <option value="SUBCONTRATO">Subcontrato</option>
                <option value="INDIRECTO">Indirecto</option>
              </select>
              <button
                onClick={() => void loadControlPresupuestal()}
                disabled={cpLoading}
                className="rounded-xl border border-border/50 bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted/50 disabled:opacity-50"
              >
                {cpLoading ? 'Cargando…' : 'Actualizar'}
              </button>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => void exportarCP('PDF')}
                  disabled={!cpData || !!cpExporting}
                  className="rounded-xl border border-border/50 bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted/50 disabled:opacity-40"
                >
                  {cpExporting === 'PDF' ? 'Generando…' : 'Exportar PDF'}
                </button>
                <button
                  onClick={() => void exportarCP('XLSX')}
                  disabled={!cpData || !!cpExporting}
                  className="rounded-xl border border-border/50 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-40"
                >
                  {cpExporting === 'XLSX' ? 'Generando…' : 'Exportar Excel'}
                </button>
              </div>
            </div>

            {cpLoading && (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-xs text-muted-foreground">Cargando reporte…</p>
              </div>
            )}

            {cpError && !cpLoading && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center">
                <p className="text-sm font-bold text-destructive">{cpError}</p>
              </div>
            )}

            {/* KPI totales (6.2) */}
            {cpData && !cpLoading && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: 'Presupuestado', val: cpData.total_presupuestado, color: 'text-foreground' },
                    { label: 'Comprometido',  val: cpData.total_comprometido,  color: 'text-amber-600' },
                    { label: 'Pagado',        val: cpData.total_pagado,         color: 'text-emerald-600' },
                    { label: 'Disponible',    val: cpData.total_disponible,     color: cpData.total_disponible < 0 ? 'text-destructive' : 'text-indigo-600' },
                    { label: '% Ejercido',    val: null, pct: cpData.pct_ejercido, color: 'text-primary' },
                  ].map(k => (
                    <div key={k.label} className="rounded-2xl border border-border/30 bg-card p-4 text-center">
                      <p className={`text-lg font-black ${k.color}`}>
                        {k.pct !== undefined ? `${k.pct}%` : formatMXN(k.val!)}
                      </p>
                      <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tabla de partidas con drill-down de movimientos (6.2 + 6.4 + trazabilidad-partida-gt-cp) */}
                <ControlPresupuestalTabla
                  partidas={cpData.partidas}
                  sinPartidaComprometido={cpData.sin_partida_comprometido}
                  sinPartidaPagado={cpData.sin_partida_pagado}
                />
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: Transferencias entre Partidas                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'transferencias' && (
          <div className="space-y-6 px-4 md:px-8 pb-12">
            {/* Header + acciones */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Transferencias de Partida</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Mueve presupuesto entre partidas cuando una llega a su tope</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchTransferencias()}
                  className="p-2 rounded-lg border border-border/60 bg-card hover:bg-muted/60 transition-all"
                  title="Refrescar"
                >
                  <IconRefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', loadingTrans && 'animate-spin')} />
                </button>
                <button
                  onClick={() => setModalNuevaTrans(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  + Nueva Transferencia
                </button>
              </div>
            </div>

            {/* Lista de transferencias */}
            {loadingTrans ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-[10px]">Cargando...</div>
            ) : transferencias.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <span className="text-4xl">↔️</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin transferencias</p>
                <p className="text-[10px] text-muted-foreground/60">Las solicitudes de movimiento de presupuesto aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transferencias.map(t => {
                  const isPendiente = t.estado === 'PENDIENTE';
                  const isAdmin = user?.role?.includes('admin') || user?.role?.includes('director');
                  return (
                    <div key={t.id} className={cn(
                      'rounded-2xl border p-4 space-y-3 transition-all',
                      isPendiente ? 'border-amber-500/30 bg-amber-500/5' :
                      t.estado === 'APROBADA' ? 'border-emerald-500/20 bg-emerald-500/5' :
                      'border-red-500/20 bg-red-500/5'
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest',
                              isPendiente ? 'bg-amber-500/20 text-amber-700' :
                              t.estado === 'APROBADA' ? 'bg-emerald-500/20 text-emerald-700' :
                              'bg-red-500/20 text-red-700'
                            )}>
                              {t.estado}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString('es-MX')}</span>
                          </div>
                          <p className="text-[11px] font-bold text-foreground">
                            {t.concepto_origen_clave !== 'N/A' ? t.concepto_origen_clave : 'Bolsa general'}
                            {' → '}
                            {t.concepto_destino_clave}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.concepto_destino_desc}</p>
                          <p className="text-sm font-black text-foreground font-mono">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(t.monto)}
                          </p>
                        </div>
                        {isPendiente && isAdmin && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => void aprobarTransferencia(t.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => { setModalRechazo({ id: t.id }); setMotivoRechazo(''); }}
                              className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-700 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-border/30 pt-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Justificación</p>
                        <p className="text-[10px] text-foreground/80 line-clamp-2">{t.justificacion}</p>
                      </div>
                      {t.solicitado_por_nombre && (
                        <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
                          <span>Solicitó: <strong>{t.solicitado_por_nombre}</strong></span>
                          {t.aprobado_por_nombre && <span>{t.estado === 'APROBADA' ? 'Aprobó' : 'Rechazó'}: <strong>{t.aprobado_por_nombre}</strong></span>}
                        </div>
                      )}
                      {t.motivo_rechazo && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-700 mb-0.5">Motivo de rechazo</p>
                          <p className="text-[10px] text-red-600/80">{t.motivo_rechazo}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Trazabilidad ──────────────────────────────────────────── */}
        {activeTab === 'trazabilidad' && (
          <div className="space-y-6 px-4 md:px-8 pb-12">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Trazabilidad — Presupuestado · Comprado · Consumido</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">Triángulo de trazabilidad por partida del presupuesto base</p>
              </div>
              <button
                onClick={() => void fetchTrazabilidad()}
                className="p-2 rounded-lg border border-border/60 bg-card hover:bg-muted/60 transition-all"
                title="Refrescar"
              >
                <IconRefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', loadingTraz && 'animate-spin')} />
              </button>
            </div>

            {trazParcial && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex gap-2 items-center">
                <IconAlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-semibold">Datos incompletos — algún servicio no respondió. Refrescar para reintentar.</p>
              </div>
            )}

            {loadingTraz ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-[10px]">Cargando trazabilidad...</div>
            ) : trazabilidad.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <IconActivity className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Sin datos de presupuesto</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">Carga el catálogo de obra y aprueba un presupuesto para ver la trazabilidad.</p>
              </div>
            ) : (
              <TableScrollShadow className="rounded-2xl border border-border/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/40">
                    <tr>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-8"></th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Clave / Descripción</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Presupuestado</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Comprado</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Consumido</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trazabilidad.map(c => {
                      const expanded = trazExpanded.has(c.concepto_id);
                      const semaforoColor = c.semaforo === 'VERDE' ? 'bg-emerald-500' : c.semaforo === 'AMARILLO' ? 'bg-amber-400' : c.semaforo === 'ROJO' ? 'bg-red-500' : 'bg-muted-foreground/30';
                      return (
                        <tr
                          key={c.concepto_id}
                          onClick={() => setTrazExpanded(prev => { const n = new Set(prev); expanded ? n.delete(c.concepto_id) : n.add(c.concepto_id); return n; })}
                          className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {expanded ? '▾' : '▸'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-black text-primary text-[10px]">{c.clave}</span>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{c.descripcion}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[10px] text-foreground">{formatMXN(c.monto_presupuestado)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono text-[10px] text-foreground">{formatMXN(c.monto_comprado)}</span>
                            {c.pct_comprado > 0 && <span className="ml-1 text-[9px] text-muted-foreground">({c.pct_comprado}%)</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono text-[10px] text-foreground">{formatMXN(c.monto_consumido)}</span>
                            {c.pct_consumido > 0 && <span className="ml-1 text-[9px] text-muted-foreground">({c.pct_consumido}%)</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', semaforoColor)} title={c.semaforo} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableScrollShadow>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Vista previa — Importación de Catálogo de Obra              */}
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

          <div className="rounded-2xl border border-border/40 overflow-hidden">
            <TableScrollShadow className="max-h-[480px] overflow-y-auto">
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
                    <tr key={i} className={cn('transition-colors', row._valido ? 'hover:bg-emerald-500/[0.03]' : 'bg-amber-500/5 opacity-60')}>
                      <td className="px-4 py-2.5 text-center">
                        {row._valido
                          ? <IconCheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          : <span className="text-[9px] text-amber-600 font-bold" title={row._error}>omitir</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 font-black text-primary whitespace-nowrap">{row.clave || '—'}</td>
                      <td className="px-4 py-2.5 max-w-xs"><span className="font-semibold text-foreground line-clamp-1">{row.descripcion || '—'}</span></td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-black uppercase text-muted-foreground">{row.unidad_medida || '?'}</span>
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
            </TableScrollShadow>
          </div>
        </div>

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
            <SubmitButton label={`Confirmar (${validRows.length} conceptos)`} loading={importando} color="emerald" onClick={handleConfirmarImport} />
          </div>
        </div>
      </SlidePanel>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Vista previa — Importación APU / Explosión de Insumos       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {[
        {
          isOpen: panelAPU,
          onClose: () => { setPanelAPU(false); setPreviewInsumos([]); setPreviewComposiciones([]); setArchivoNombreInsumo(''); },
          title: 'Vista previa — Importación APU',
          subtitle: 'Análisis de Precios Unitarios · OPUS',
          mostrarComposicion: true,
        },
        {
          isOpen: panelExplosion,
          onClose: () => { setPanelExplosion(false); setPreviewInsumos([]); setPreviewComposiciones([]); setArchivoNombreInsumo(''); },
          title: 'Vista previa — Explosión de Insumos',
          subtitle: 'Catálogo consolidado de insumos · OPUS',
          mostrarComposicion: false,
        },
      ].map(({ isOpen, onClose, title, subtitle, mostrarComposicion }) => {
        // Cuántos conceptos del APU coinciden con el presupuesto cargado
        const clavesEnPresupuesto = new Set(
          (presupuesto?.conceptos ?? []).map(c => c.clave.trim().toUpperCase())
        );
        const composicionesVinculables = previewComposiciones.filter(
          c => clavesEnPresupuesto.has(c.concepto_clave.trim().toUpperCase())
        ).length;

        return (
        <SlidePanel
          key={title}
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          subtitle={archivoNombreInsumo || subtitle}
          accentColor="emerald"
          maxWidthClassName="max-w-5xl"
        >
          <div className="space-y-6 pb-28">
            {/* Resumen por tipo */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {(['MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'SUBCONTRATO', 'INDIRECTO'] as TipoInsumo[]).map(tipo => {
                const n = previewInsumos.filter(i => i.tipo_insumo === tipo).length;
                if (n === 0) return null;
                return (
                  <div key={tipo} className={cn('rounded-2xl border p-3 text-center', TIPO_COLOR[tipo])}>
                    <p className="text-xl font-black">{n}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-70">{TIPO_LABEL[tipo]}</p>
                  </div>
                );
              })}
            </div>

            {/* Resumen válidos / omitidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-2xl font-black text-emerald-600">{validPreviewInsumos.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Listos para importar</p>
              </div>
              <div className={cn('rounded-2xl p-4 text-center border', invalidPreviewInsumos.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                <p className={cn('text-2xl font-black', invalidPreviewInsumos.length > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{invalidPreviewInsumos.length}</p>
                <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', invalidPreviewInsumos.length > 0 ? 'text-amber-600/70' : 'text-muted-foreground')}>Se omitirán</p>
              </div>
            </div>

            {invalidPreviewInsumos.length > 0 && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex gap-3">
                <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700">{invalidPreviewInsumos.length} insumos con datos incompletos serán ignorados</p>
                  <p className="text-[10px] text-amber-600/80 mt-1">
                    {invalidPreviewInsumos.slice(0, 3).map(r => `"${r.clave}" (${r._error})`).join(' · ')}
                    {invalidPreviewInsumos.length > 3 && ` · y ${invalidPreviewInsumos.length - 3} más`}
                  </p>
                </div>
              </div>
            )}

            {/* ── Banner de Composición APU (solo panel APU) ──────────────── */}
            {mostrarComposicion && (
              <div className={cn(
                'rounded-2xl border p-4 flex gap-3',
                previewComposiciones.length > 0
                  ? (presupuesto ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-amber-500/5 border-amber-500/20')
                  : 'bg-rose-500/5 border-rose-500/20'
              )}>
                <IconLayers className={cn(
                  'h-5 w-5 shrink-0 mt-0.5',
                  previewComposiciones.length > 0
                    ? (presupuesto ? 'text-indigo-500' : 'text-amber-500')
                    : 'text-rose-500'
                )} />
                <div className="flex-1">
                  {previewComposiciones.length > 0 ? (
                    <>
                      <p className={cn('text-xs font-bold', presupuesto ? 'text-indigo-700' : 'text-amber-700')}>
                        {previewComposiciones.length} APUs detectados
                        {presupuesto && composicionesVinculables > 0 && (
                          <> · <span className="font-black">{composicionesVinculables} coinciden</span> con el presupuesto</>
                        )}
                        {presupuesto && composicionesVinculables === 0 && (
                          <> · <span className="text-amber-600">0 coinciden</span> (verifica las claves del presupuesto)</>
                        )}
                      </p>
                      <p className={cn('text-[10px] mt-1', presupuesto ? 'text-indigo-600/70' : 'text-amber-600/70')}>
                        {presupuesto
                          ? `Al confirmar, se guardarán las relaciones insumo→concepto del APU (${previewComposiciones.reduce((s, c) => s + c.insumos.length, 0)} vínculos totales).`
                          : 'Sin presupuesto cargado. Importa el "Catálogo de Obra" primero para que los APUs se vinculen con los conceptos.'
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-rose-700">
                        0 composiciones detectadas — el parser no identificó grupos "Clave: X"
                      </p>
                      <p className="text-[10px] text-rose-600/80 mt-1">
                        Abre <strong>F12 → Consola</strong> y verás las primeras filas del archivo.
                        Comparte ese diagnóstico para que podamos adaptar el parser al formato de tu OPUS.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tabla de vista previa */}
            <div className="rounded-2xl border border-border/40 overflow-hidden">
              <TableScrollShadow className="max-h-[480px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                    <tr className="border-b border-border/40">
                      <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estado</th>
                      <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Clave</th>
                      <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Descripción</th>
                      <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Unidad</th>
                      <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tipo</th>
                      <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Costo Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {previewInsumos.map((row, i) => (
                      <tr key={i} className={cn('transition-colors', row._valido ? 'hover:bg-emerald-500/[0.03]' : 'bg-amber-500/5 opacity-60')}>
                        <td className="px-4 py-2.5 text-center">
                          {row._valido
                            ? <IconCheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                            : <span className="text-[9px] text-amber-600 font-bold" title={row._error}>omitir</span>
                          }
                        </td>
                        <td className="px-4 py-2.5 font-black text-primary whitespace-nowrap">{row.clave}</td>
                        <td className="px-4 py-2.5 max-w-xs"><span className="font-semibold text-foreground line-clamp-1">{row.descripcion}</span></td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-black uppercase text-muted-foreground">{row.unidad_medida}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider', TIPO_COLOR[row.tipo_insumo])}>
                            {TIPO_LABEL[row.tipo_insumo]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-black text-primary">
                          {row.costo_base > 0 ? formatMXN(row.costo_base) : <span className="text-amber-500">?</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScrollShadow>
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex gap-3">
              <IconInfo className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-700 leading-relaxed">
                <strong>Insumos duplicados</strong>: si ya existe un insumo con la misma clave, se actualizarán sus datos (descripción, unidad, costo). No se crean duplicados.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur border-t border-border/40 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{validPreviewInsumos.length}</strong> insumos a importar
              {invalidPreviewInsumos.length > 0 && <> · <span className="text-amber-600">{invalidPreviewInsumos.length} se omitirán</span></>}
              {mostrarComposicion && composicionesVinculables > 0 && presupuesto && (
                <> · <span className="text-indigo-600 font-bold">{composicionesVinculables} APUs vinculables</span></>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <SubmitButton
                label={`Confirmar (${validPreviewInsumos.length} insumos)`}
                loading={importandoInsumos}
                color="emerald"
                onClick={handleConfirmarInsumos}
              />
            </div>
          </div>
        </SlidePanel>
        );
      })}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Take-off — Composición APU + Calculadora de materiales      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={panelTakeoff}
        onClose={() => { setPanelTakeoff(false); setComposicionItems([]); setConceptoTakeoff(null); }}
        title={`Take-off · ${conceptoTakeoff?.clave ?? ''}`}
        subtitle={conceptoTakeoff?.descripcion ?? 'Composición APU'}
        accentColor="indigo"
        maxWidthClassName="max-w-5xl"
      >
        {conceptoTakeoff && (<>
          <div className="space-y-6 pb-28">

            {/* ── Datos del concepto ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Unidad', value: conceptoTakeoff.unidad_medida },
                { label: 'Cant. presupuestada', value: Number(conceptoTakeoff.cantidad).toLocaleString('es-MX', { maximumFractionDigits: 4 }) },
                { label: 'Precio Unitario', value: formatMXN(Number(conceptoTakeoff.precio_unitario)) },
              ].map(d => (
                <div key={d.label} className="rounded-2xl border border-border/40 bg-muted/30 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{d.label}</p>
                  <p className="mt-1 text-base font-black text-foreground truncate">{d.value}</p>
                </div>
              ))}
            </div>

            {/* ── Calculadora ── */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-3">
                Cantidad a ejecutar ({conceptoTakeoff.unidad_medida})
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={cantidadTakeoff === 0 ? '' : cantidadTakeoff}
                  onChange={e => setCantidadTakeoff(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-40 px-4 py-3 bg-background border border-indigo-500/30 rounded-xl text-xl font-black text-indigo-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all text-right"
                />
                <span className="text-sm font-bold text-indigo-600">{conceptoTakeoff.unidad_medida}</span>
                <div className="ml-auto text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Costo total estimado</p>
                  <p className="text-2xl font-black text-indigo-700">{formatMXN(takeoffTotal)}</p>
                  {costoDirectoUnitario > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatMXN(costoDirectoUnitario)} / {conceptoTakeoff.unidad_medida} (directo APU)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Cards resumen por tipo ── */}
            {composicionItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['MATERIAL', 'MANO_DE_OBRA', 'EQUIPO', 'INDIRECTO'] as TipoInsumo[]).map(tipo => {
                  const monto = takeoffPorTipo[tipo];
                  if (!monto) return null;
                  return (
                    <div key={tipo} className={cn('rounded-2xl border p-4', TIPO_COLOR[tipo])}>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{TIPO_LABEL[tipo]}</p>
                      <p className="text-lg font-black mt-1">{formatMXN(monto)}</p>
                      <p className="text-[9px] opacity-60 mt-0.5">
                        {takeoffTotal > 0 ? `${((monto / takeoffTotal) * 100).toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Tabla de composición ── */}
            {loadingComposicion ? (
              <div className="flex items-center justify-center h-48 gap-4">
                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Cargando composición APU…</p>
              </div>
            ) : composicionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-5 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <IconPackage className="h-7 w-7 text-indigo-500 opacity-60" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-foreground">Sin composición APU</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Este concepto no tiene composición guardada. Ve a la pestaña <strong>Insumos</strong> y vuelve a importar el APU — ahora el sistema guardará la composición automáticamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/40 overflow-hidden">
                <TableScrollShadow>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/40">
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tipo</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Clave</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Descripción</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">U</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Cant/U</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Cant Total</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Costo U</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {takeoffItems.map((item, idx) => (
                        <tr key={idx} className={cn('transition-colors hover:bg-indigo-500/[0.02]', TIPO_COLOR[item.tipo_insumo].includes('emerald') ? 'bg-emerald-500/[0.01]' : '')}>
                          <td className="px-4 py-3">
                            <span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider', TIPO_COLOR[item.tipo_insumo])}>
                              {TIPO_LABEL[item.tipo_insumo]}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-black text-primary text-xs whitespace-nowrap">{item.insumo.clave}</td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="font-semibold text-foreground line-clamp-2 leading-tight">{item.insumo.descripcion}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase text-muted-foreground">{item.insumo.unidad_medida}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                            {item.cantidad.toLocaleString('es-MX', { maximumFractionDigits: 4 })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn(
                              'font-mono font-black',
                              cantidadTakeoff > 0 ? 'text-indigo-700' : 'text-muted-foreground'
                            )}>
                              {cantidadTakeoff > 0
                                ? item.cantidad_total.toLocaleString('es-MX', { maximumFractionDigits: 4 })
                                : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-foreground">
                            {formatMXN(item.costo_unitario)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn('font-mono font-black', cantidadTakeoff > 0 ? 'text-indigo-700' : 'text-muted-foreground')}>
                              {cantidadTakeoff > 0 ? formatMXN(item.subtotal_total) : formatMXN(item.subtotal)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/60 bg-muted/20">
                        <td colSpan={7} className="px-4 py-3 text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {cantidadTakeoff > 0 ? `Total para ${cantidadTakeoff} ${conceptoTakeoff.unidad_medida}` : 'Costo directo por unidad'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono font-black text-indigo-700">
                            {cantidadTakeoff > 0 ? formatMXN(takeoffTotal) : formatMXN(costoDirectoUnitario)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </TableScrollShadow>
              </div>
            )}

            {/* ── Nota take-off ── */}
            {composicionItems.length > 0 && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex gap-3">
                <IconInfo className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-700 leading-relaxed">
                  <strong>Take-off de insumos:</strong> la columna "Cant Total" es la cantidad de cada insumo necesaria para ejecutar {cantidadTakeoff > 0 ? `${cantidadTakeoff} ${conceptoTakeoff.unidad_medida}` : 'la cantidad indicada'}. Usa <strong>Preparar Requisición →</strong> para revisar ítems, ajustar cantidades y enviar a Compras.
                </p>
              </div>
            )}
          </div>

          {/* ── Barra inferior: Preparar Requisición → ── */}
          {composicionItems.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur border-t border-border/40 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">
                  {takeoffItems.filter(i => i.insumo_id).length} ítem
                  {takeoffItems.filter(i => i.insumo_id).length !== 1 ? 's' : ''} en take-off
                  {' · '}
                  {cantidadTakeoff > 0
                    ? formatMXN(takeoffTotal)
                    : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">
                  {cantidadTakeoff > 0
                    ? `${cantidadTakeoff} ${conceptoTakeoff.unidad_medida} · Clave ${conceptoTakeoff.clave}`
                    : 'Ingresa una cantidad para calcular'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPanelTakeoff(false); setComposicionItems([]); setConceptoTakeoff(null); }}
                  className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                >
                  Cerrar
                </button>
                <SubmitButton
                  label={`Preparar Requisición (${takeoffItems.filter(i => i.insumo_id).length} ítems) →`}
                  loading={false}
                  color="violet"
                  onClick={handlePrepararRequisicion}
                />
              </div>
            </div>
          )}
          </>
        )}
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
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">¿Cuál de los 3 archivos de OPUS debo usar?</h3>
            <div className="space-y-3">
              {[
                {
                  nombre: '1. PRESUPUESTO → pestaña "Catálogo de Obra"',
                  usar: true,
                  desc: 'Contiene todos los conceptos de obra con clave, descripción, unidad, cantidad y precio unitario.',
                },
                {
                  nombre: '2. ANÁLISIS DE PRECIOS UNITARIOS (APU) → pestaña "Insumos"',
                  usar: true,
                  desc: 'Desglosa el costo de cada precio unitario en materiales, mano de obra y equipo. Se usa para poblar el catálogo de insumos.',
                },
                {
                  nombre: '3. EXPLOSIÓN DE INSUMOS → pestaña "Insumos"',
                  usar: true,
                  desc: 'Lista consolidada de todos los materiales, mano de obra y equipo. Alternativa más simple al APU para poblar el catálogo de insumos.',
                },
              ].map(f => (
                <div key={f.nombre} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <IconCheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-black text-xs text-foreground">{f.nombre}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">Pasos para exportar desde OPUS</h3>
            <ol className="space-y-3">
              {[
                'Abre tu proyecto en OPUS.',
                'Ve al menú: Archivo → Exportar (o barra de herramientas).',
                'Selecciona el reporte: Presupuesto, APU, o Explosión de Insumos.',
                'En formato de salida, elige Excel (.xlsx) — NO PDF.',
                'Guarda el archivo y súbelo en la pestaña correspondiente.',
              ].map((paso, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{paso}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
            <IconInfo className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700">Los archivos PDF no son importables</p>
              <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                Los PDFs son reportes impresos sin datos estructurados. Exporta siempre a Excel (.xlsx) o CSV desde OPUS.
              </p>
            </div>
          </div>
        </div>
      </SlidePanel>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Pre-Requisición — Revisar y Enviar                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <SlidePanel
        isOpen={showPreReqPanel}
        onClose={() => { setShowPreReqPanel(false); setPreReqItems([]); }}
        title="Pre-Requisición — Revisar y Enviar"
        subtitle={conceptoTakeoff ? `${conceptoTakeoff.clave} · ${conceptoTakeoff.descripcion}` : 'Take-off GT'}
        accentColor="violet"
        maxWidthClassName="max-w-3xl"
      >
        <div className="flex flex-col gap-6 pb-36">

          {/* ── Acciones masivas ── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setPreReqItems(prev => prev.map(p => ({ ...p, incluido: true })))}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-500/40 text-violet-700 bg-violet-500/10 hover:bg-violet-500/20 transition-all"
              >
                ✓ Seleccionar todo
              </button>
              <button
                onClick={() => setPreReqItems(prev => prev.map(p => ({ ...p, incluido: false })))}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-border/60 text-muted-foreground hover:bg-muted transition-all"
              >
                ✗ Deseleccionar todo
              </button>
            </div>
            {preReqItems.some(i => i.incluido && i.cantidad > i.cantidad_original) && (
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                ⚠ {preReqItems.filter(i => i.incluido && i.cantidad > i.cantidad_original).length} excedente(s)
              </span>
            )}
          </div>

          {/* ── Filtro por tipo ── */}
          <div className="flex gap-2 flex-wrap">
            {(['TODOS', 'MATERIAL', 'EQUIPO', 'SERVICIO', 'MANO_OBRA'] as PreReqFiltroTipo[]).map(tab => {
              const labels: Record<PreReqFiltroTipo, string> = {
                TODOS: 'Todos', MATERIAL: 'Material', EQUIPO: 'Equipo', SERVICIO: 'Servicio', MANO_OBRA: 'Mano Obra',
              };
              const counts: Record<PreReqFiltroTipo, number> = {
                TODOS: preReqItems.length,
                MATERIAL: preReqItems.filter(i => i.tipo_insumo === 'MATERIAL').length,
                EQUIPO:   preReqItems.filter(i => i.tipo_insumo === 'EQUIPO').length,
                SERVICIO: preReqItems.filter(i => i.tipo_insumo === 'SUBCONTRATO').length,
                MANO_OBRA:preReqItems.filter(i => i.tipo_insumo === 'MANO_DE_OBRA').length,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setPreReqFiltroTipo(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all',
                    preReqFiltroTipo === tab
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'border-border/60 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {labels[tab]} {counts[tab] > 0 && <span className="ml-1 opacity-70">({counts[tab]})</span>}
                </button>
              );
            })}
          </div>

          {/* ── Lista de ítems ── */}
          <div className="space-y-2">
            {preReqItemsFiltrados.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No hay ítems de este tipo en el take-off.</p>
            )}
            {preReqItemsFiltrados.map((item) => {
              const globalIdx = preReqItems.findIndex(i => i.insumo_id === item.insumo_id);
              return (
                <div
                  key={item.insumo_id}
                  className={cn(
                    'rounded-xl border p-4 flex gap-3 items-start transition-all',
                    item.incluido ? 'border-violet-500/30 bg-violet-500/5' : 'border-border/40 bg-muted/30 opacity-50'
                  )}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.incluido}
                    onChange={() => setPreReqItems(prev => prev.map((p, i) => i === globalIdx ? { ...p, incluido: !p.incluido } : p))}
                    className="mt-1 h-4 w-4 rounded border-border accent-violet-500 cursor-pointer shrink-0"
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground">{item.clave}</span>
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', TIPO_COLOR[item.tipo_insumo])}>
                        {TIPO_LABEL[item.tipo_insumo]}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug">{item.descripcion}</p>
                    {/* Notas */}
                    <input
                      type="text"
                      placeholder="Notas (opcional)"
                      value={item.notas}
                      disabled={!item.incluido}
                      onChange={e => setPreReqItems(prev => prev.map((p, i) => i === globalIdx ? { ...p, notas: e.target.value } : p))}
                      className="mt-2 w-full text-[10px] bg-transparent border-b border-border/40 focus:border-violet-400 outline-none text-muted-foreground placeholder:text-muted-foreground/50 py-0.5 disabled:cursor-not-allowed"
                    />
                  </div>
                  {/* Cantidad + indicador excedente */}
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.cantidad}
                      disabled={!item.incluido}
                      onChange={e => setPreReqItems(prev => prev.map((p, i) => i === globalIdx ? { ...p, cantidad: Number(e.target.value) } : p))}
                      className={cn(
                        'w-24 text-right text-xs font-bold bg-background border rounded-lg px-2 py-1 outline-none disabled:opacity-40 disabled:cursor-not-allowed',
                        item.incluido && item.cantidad > item.cantidad_original
                          ? 'border-amber-500/60 focus:border-amber-500'
                          : 'border-border/60 focus:border-violet-400'
                      )}
                    />
                    <span className="text-[9px] text-muted-foreground uppercase">{item.unidad}</span>
                    {item.incluido && item.cantidad > item.cantidad_original && (
                      <span className="text-[8px] font-black text-amber-600 bg-amber-500/10 rounded px-1.5 py-0.5 whitespace-nowrap">
                        ↑ {((item.cantidad - item.cantidad_original) / item.cantidad_original * 100).toFixed(0)}% sobre APU
                      </span>
                    )}
                    {item.incluido && item.cantidad_original > 0 && (
                      <span className="text-[8px] text-muted-foreground/60">orig: {item.cantidad_original}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Prioridad y observaciones ── */}
          <div className="space-y-4 rounded-xl border border-border/40 p-4 bg-muted/20">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Prioridad</p>
              <div className="flex gap-2">
                {(['NORMAL', 'ALTA', 'URGENTE'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPreReqPrioridad(p)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all',
                      preReqPrioridad === p
                        ? p === 'URGENTE' ? 'bg-red-500 text-white border-red-500'
                          : p === 'ALTA' ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-border/60 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Observaciones</p>
              <textarea
                rows={3}
                value={preReqObservaciones}
                onChange={e => setPreReqObservaciones(e.target.value)}
                className="w-full text-xs bg-background border border-border/60 rounded-lg px-3 py-2 focus:border-violet-400 outline-none resize-none text-foreground"
              />
            </div>
          </div>
        </div>

        {/* ── Footer fijo ── */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur border-t border-border/40 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-foreground">
              {preReqIncludedCount} de {preReqItems.length} ítems incluidos
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">
              {preReqIncludedCount === 0 ? 'Selecciona al menos un ítem' : `Prioridad: ${preReqPrioridad}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowPreReqPanel(false); setPreReqItems([]); }}
              className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
            >
              Cancelar
            </button>
            <SubmitButton
              label={preReqIncludedCount === 0 ? 'Selecciona al menos un ítem' : `Enviar Requisición a Compras (${preReqIncludedCount})`}
              loading={enviandoPreReq}
              color="emerald"
              onClick={handleEnviarPreReq}
            />
          </div>
        </div>
      </SlidePanel>

      {/* ── Input oculto para upload de fichas desde InsumosView ───────────── */}
      <input
        ref={fichaInsFileRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFichaInsUpload}
      />

      {/* ── Panel: Fichas Técnicas del Insumo ───────────────────────────────── */}
      <SlidePanel
        isOpen={!!insumoFichasId}
        onClose={() => { setInsumoFichasId(null); setFichasInsumo([]); }}
        title="Fichas Técnicas"
        subtitle={insumosFiltrados.find(i => i.id === insumoFichasId)?.descripcion ?? ''}
        accentColor="indigo"
        maxWidthClassName="max-w-lg"
      >
        <div className="space-y-4 pb-10">
          <button
            onClick={() => fichaInsFileRef.current?.click()}
            disabled={uploadingFichaIns}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-500/10 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
          >
            {uploadingFichaIns ? 'Subiendo...' : '📎 Subir ficha técnica'}
          </button>

          {loadingFichasIns ? (
            <div className="flex items-center justify-center py-8 text-[10px] text-muted-foreground">Cargando...</div>
          ) : fichasInsumo.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="text-3xl">📂</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin fichas técnicas</p>
              <p className="text-[10px] text-muted-foreground/60">Sube el primer documento con el botón de arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fichasInsumo.map(f => (
                <div key={f.id_ficha} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background px-4 py-3">
                  <span className="text-xl">{f.mime_type === 'application/pdf' ? '📄' : f.mime_type.startsWith('image/') ? '🖼️' : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{f.nombre_doc}</div>
                    {f.proveedor_ref && <div className="text-[9px] text-muted-foreground">{f.proveedor_ref}</div>}
                    <div className="text-[9px] text-muted-foreground/60">{(f.tamano_bytes / 1024).toFixed(0)} KB · {new Date(f.created_at).toLocaleDateString('es-MX')}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/v1/gerencia-tecnica/insumos/${insumoFichasId}/fichas/${f.id_ficha}/descargar`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors"
                      title="Descargar"
                    >
                      ⬇
                    </a>
                    <button
                      onClick={() => handleFichaInsDelete(f.id_ficha)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SlidePanel>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PANEL: Desglose de Saldo por Partida                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Nueva Transferencia                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modalNuevaTrans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl border border-border/60 shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div>
              <h3 className="text-base font-black uppercase tracking-tighter text-foreground">Nueva Transferencia de Partida</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Solicitar mover presupuesto entre partidas · Requiere aprobación del director</p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Partida Origen (concepto_id)</p>
                <select
                  value={nuevaTrans.concepto_origen_id}
                  onChange={e => setNuevaTrans(p => ({ ...p, concepto_origen_id: e.target.value }))}
                  className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2.5 focus:border-primary outline-none text-foreground"
                >
                  <option value="">Bolsa general del proyecto</option>
                  {Object.values(saldoMap).map(s => (
                    <option key={s.concepto_id} value={s.concepto_id}>
                      {s.concepto_clave} — {s.concepto_desc.substring(0, 50)} (disp: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(s.monto_disponible)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Partida Destino *</p>
                <select
                  value={nuevaTrans.concepto_destino_id}
                  onChange={e => setNuevaTrans(p => ({ ...p, concepto_destino_id: e.target.value }))}
                  className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2.5 focus:border-primary outline-none text-foreground"
                >
                  <option value="">Selecciona partida destino</option>
                  {Object.values(saldoMap).filter(s => s.concepto_id !== nuevaTrans.concepto_origen_id).map(s => (
                    <option key={s.concepto_id} value={s.concepto_id}>
                      {s.concepto_clave} — {s.concepto_desc.substring(0, 50)} ({s.estado_tope})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Monto a transferir (MXN) *</p>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={nuevaTrans.monto}
                  onChange={e => setNuevaTrans(p => ({ ...p, monto: e.target.value }))}
                  placeholder="0.00"
                  className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2.5 focus:border-primary outline-none text-foreground"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                  Justificación técnica * <span className="text-[9px] text-muted-foreground/60">(mínimo 50 caracteres)</span>
                </p>
                <textarea
                  rows={4}
                  value={nuevaTrans.justificacion}
                  onChange={e => setNuevaTrans(p => ({ ...p, justificacion: e.target.value }))}
                  placeholder="Explica la razón técnica y gerencial de la transferencia..."
                  className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2.5 focus:border-primary outline-none resize-none text-foreground"
                />
                <p className={cn('text-[9px] mt-1', nuevaTrans.justificacion.length >= 50 ? 'text-emerald-600' : 'text-muted-foreground/60')}>
                  {nuevaTrans.justificacion.length}/50 caracteres mínimos
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setModalNuevaTrans(false)}
                className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => void solicitarTransferencia()}
                disabled={enviandoTrans || !nuevaTrans.concepto_destino_id || !nuevaTrans.monto || nuevaTrans.justificacion.trim().length < 50}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviandoTrans ? 'Enviando...' : 'Solicitar Transferencia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Rechazar Transferencia                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modalRechazo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl border border-border/60 shadow-2xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-base font-black uppercase tracking-tighter text-foreground">Rechazar Transferencia</h3>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Motivo de rechazo *</p>
              <textarea
                rows={4}
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                placeholder="Explica por qué se rechaza la transferencia..."
                className="w-full text-xs bg-background border border-border/60 rounded-xl px-3 py-2.5 focus:border-red-400 outline-none resize-none text-foreground"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalRechazo(null)}
                className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => void rechazarTransferencia()}
                disabled={motivoRechazo.trim().length === 0}
                className="px-5 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      <SlidePanel
        isOpen={!!saldoPanelConcepto}
        onClose={() => setSaldoPanelConcepto(null)}
        title={`Saldo · ${saldoPanelConcepto?.concepto_clave ?? ''}`}
        subtitle={saldoPanelConcepto?.concepto_desc ?? 'Desglose de partida'}
        accentColor={
          saldoPanelConcepto?.estado_tope === 'BLOQUEADO' ? 'red' :
          saldoPanelConcepto?.estado_tope === 'LIMITADO'  ? 'amber' : 'emerald'
        }
        maxWidthClassName="max-w-lg"
      >
        {saldoPanelConcepto && (() => {
          const s = saldoPanelConcepto;
          const aprobado    = Number(s.monto_aprobado);
          const comprometido = Number(s.monto_comprometido);
          const ejercido    = Number(s.monto_ejercido);
          const enProceso   = Number(s.monto_en_proceso);
          const disponible  = Number(s.monto_disponible);
          const pctDisp = aprobado > 0 ? Math.max(0, Math.round((disponible / aprobado) * 100)) : 0;
          const badgeClass =
            s.estado_tope === 'BLOQUEADO' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
            s.estado_tope === 'LIMITADO'  ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
            'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
          const barColor =
            s.estado_tope === 'BLOQUEADO' ? 'bg-red-500' :
            s.estado_tope === 'LIMITADO'  ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <div className="space-y-5 pb-8">
              {/* Estado badge */}
              <div className="flex items-center justify-between">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border', badgeClass)}>
                  {s.estado_tope === 'BLOQUEADO' && '🔒 '}
                  {s.estado_tope}
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {pctDisp}% disponible
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="h-3 rounded-full bg-muted/40 overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pctDisp}%` }} />
              </div>

              {/* Desglose */}
              <div className="divide-y divide-border/30 rounded-2xl border border-border/40 overflow-hidden">
                {[
                  { label: 'Presupuesto aprobado', value: aprobado,     color: 'text-foreground',       bold: true },
                  { label: 'Ejercido (pagado)',     value: ejercido,    color: 'text-violet-700',       bold: false },
                  { label: 'Comprometido (OCs)',    value: comprometido, color: 'text-blue-700',        bold: false },
                  { label: 'En proceso (Reqs)',     value: enProceso,   color: 'text-amber-700',        bold: false },
                  { label: 'Disponible',            value: disponible,  color: s.estado_tope === 'BLOQUEADO' ? 'text-red-700' : s.estado_tope === 'LIMITADO' ? 'text-amber-700' : 'text-emerald-700', bold: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3 bg-card hover:bg-muted/20">
                    <span className="text-[11px] text-muted-foreground">{row.label}</span>
                    <span className={cn('font-mono text-sm', row.color, row.bold && 'font-black')}>{formatMXN(row.value)}</span>
                  </div>
                ))}
              </div>

              {s.estado_tope === 'BLOQUEADO' && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">Partida bloqueada</p>
                  <p className="text-xs text-red-600/80">
                    Esta partida ha agotado su presupuesto. Para generar nuevas órdenes de compra es necesario
                    solicitar una transferencia presupuestal.
                  </p>
                </div>
              )}

              {s.estado_tope === 'LIMITADO' && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Presupuesto limitado</p>
                  <p className="text-xs text-amber-600/80">
                    Quedan menos del 20% de los recursos disponibles en esta partida. Las órdenes de compra
                    se generarán con advertencia.
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </SlidePanel>
    </>
  );
};

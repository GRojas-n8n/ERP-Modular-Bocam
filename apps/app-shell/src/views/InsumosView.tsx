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
  IconPackage,
  IconActivity,
} from '../components/Icons';
import { cn } from '../lib/utils';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ActiveTab = 'catalogo' | 'insumos';

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
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = evt.target?.result;
      const ext  = file.name.split('.').pop()?.toLowerCase();
      const wb   = ext === 'csv' || ext === 'txt'
        ? XLSX.read(data as string, { type: 'string' })
        : XLSX.read(data as ArrayBuffer, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
        header: 1,
        defval: '',
        raw: false,
      });
      onSuccess(rows as (string | number)[][]);
    } catch (e: any) {
      onError(`Error al leer el archivo: ${e.message}`);
    }
  };
  if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
    reader.readAsText(file, 'UTF-8');
  } else {
    reader.readAsArrayBuffer(file);
  }
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

  useEffect(() => { void fetchPresupuesto(); }, []);
  useEffect(() => { if (activeTab === 'insumos') void fetchInsumos(); }, [activeTab]);

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

  // ── Leer Catálogo de Obra (Tab 1) ─────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoNombre(file.name);
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const wb  = (ext === 'csv' || ext === 'txt')
          ? XLSX.read(data as string, { type: 'string' })
          : XLSX.read(data as ArrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];

        const allRowsRaw: (string | number)[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1, defval: '', raw: false,
        });

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

        const rawRows: Record<string, string | number>[] = XLSX.utils.sheet_to_json(ws, {
          defval: '', raw: false, range: headerRowIndex,
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
      } catch (err: any) {
        setParseError(`Error al leer el archivo: ${err.message}`);
      }
    };
    if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
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
                  {activeTab === 'catalogo' ? 'Catálogo de Obra' : 'Insumos'}
                </h1>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {activeTab === 'catalogo'
                    ? 'Conceptos de obra · Presupuesto base del proyecto'
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
                  Explosión
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
                <div className="overflow-x-auto">
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
                        <th className="px-6 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">APU</th>
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
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/60 bg-muted/20">
                        <td colSpan={8} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
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
                <div className="overflow-x-auto">
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
                </div>
              )}
            </div>
          </>
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
            </div>
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
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
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
              </div>
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
                <div className="overflow-x-auto">
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
                </div>
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
    </>
  );
};

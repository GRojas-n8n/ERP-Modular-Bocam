import React, { useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Button,
  Card,
  CardContent,
  FormField,
  Input,
  Select,
  Textarea,
  cn,
} from '@bocam/ui-core';
import { IconClock, IconPlus, IconSearch, IconShoppingCart, IconX } from '../../components/Icons';
import { SlidePanel, SubmitButton } from '../../components/SlidePanel';

interface ReqResidenteItem {
  id: string;
  insumo_id: string | null;
  cantidad: number;
  notas: string | null;
  descripcion_libre: string | null;
  unidad_libre: string | null;
  es_imprevisto: boolean;
  especificacion_marca_modelo?: string | null;
  especificacion_detalle?: string | null;
}

interface ReqResidente {
  id: string;
  folio: string;
  fecha: string;
  estado: string;
  tipo?: string;
  prioridad: string;
  observaciones?: string;
  concepto_id?: string | null;
  concepto_clave?: string | null;
  concepto_descripcion?: string | null;
  items?: ReqResidenteItem[];
}

interface ConceptoSimple {
  id: string;
  clave: string;
  descripcion: string;
  unidad_medida: string;
  precio_unitario?: number;
  cantidad_presupuestada?: number;
}

interface MaterialTakeoff {
  insumo_id: string;
  clave: string;
  descripcion: string;
  unidad: string;
  cantidad_unitaria: number; // por unidad de concepto (del APU)
  cantidad_total: number;    // cantidad_unitaria × cantidadTakeoff
}

interface ImprevistoItem {
  descripcion_libre: string;
  unidad_libre: string;
  cantidad: string;
  notas: string;
  justificacion: string;
  especificacion_marca_modelo: string;
  especificacion_detalle: string;
}

/** Insumo del catálogo GT — para flujo "Por Insumo" */
interface InsumoReq {
  insumo_id: string;
  clave: string;
  descripcion: string;
  tipo_insumo: 'MATERIAL' | 'EQUIPO' | 'MANO_DE_OBRA' | 'SUBCONTRATO' | 'INDIRECTO';
  unidad_medida: string;
  cantidad_presupuestada?: number; // del endpoint explosión GT
}

/** Insumo seleccionado con cantidad ingresada por el Residente */
interface InsumoSeleccionado extends InsumoReq {
  cantidad: number;
  notas: string;
  es_excedente?: boolean;
  especificaciones: string[];
  justificacion: string;
  especificacion_marca_modelo: string;
  especificacion_detalle: string;
  // Ficha técnica opcional, subida al insumo (GT) tras crear la requisición —
  // ver openspec/changes/adjuntos-requisicion-invitacion-cotizar.
  fichaTecnica?: File | null;
}

const UNIDADES_REQ = ['PZA', 'SAC', 'M3', 'M2', 'ML', 'KG', 'TON', 'LT', 'CUB', 'DIA', 'SEM', 'MES', 'PTO', 'JGO'];

const REQ_ESTADO_BADGE: Record<string, { cls: string; label: string }> = {
  PENDIENTE: { cls: 'bg-amber-500/10 text-amber-600',   label: 'Pendiente'  },
  APROBADA:  { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Aprobada' },
  COMPRADA:  { cls: 'bg-sky-500/10 text-sky-600',        label: 'Comprada'  },
  BORRADOR:  { cls: 'bg-zinc-500/10 text-zinc-500',      label: 'Borrador'  },
  RECHAZADA: { cls: 'bg-red-500/10 text-red-600',        label: 'Rechazada' },
};

/**
 * Tab "Requisiciones" de Residencia de Obra — solicitudes de compra del
 * residente (por insumo, desde APU, o imprevisto) — ver
 * openspec/changes/split-residencia-view-tabs.
 *
 * `conceptos` (catálogo de partidas del presupuesto) es una copia local
 * propia de este tab — EstimacionesTab tiene la suya, independiente. Ver
 * design.md Decisión 3.
 */
export const RequisicionesTab: React.FC<{ active: boolean }> = ({ active }) => {
  const { tenant } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';

  const [reqsResidente, setReqsResidente] = useState<ReqResidente[]>([]);
  const [expandedReqIds, setExpandedReqIds] = useState<Set<string>>(new Set());
  // Edición post-creación de especificación técnica (marca/modelo + detalle) —
  // única fuente de verdad, ver capability especificacion-tecnica-fuente-unica
  const [editingSpecItemId, setEditingSpecItemId] = useState<string | null>(null);
  const [editingSpecDraft, setEditingSpecDraft] = useState<{ marca: string; detalle: string }>({ marca: '', detalle: '' });
  const [savingSpecItemId, setSavingSpecItemId] = useState<string | null>(null);
  const [showReqPanel, setShowReqPanel] = useState(false);
  const [reqTipo, setReqTipo] = useState<'INSUMO' | 'APU' | 'IMPREVISTO'>('INSUMO');
  const [reqPrioridad, setReqPrioridad] = useState('MEDIA');
  const [reqNotas, setReqNotas] = useState('');
  const [reqNotasInternas, setReqNotasInternas] = useState('');
  const [reqDireccionEntrega, setReqDireccionEntrega] = useState('');
  const [generandoReq, setGenerandoReq] = useState(false);
  // Partida del catálogo — obligatoria para INSUMO e IMPREVISTO
  const [reqConceptoId, setReqConceptoId] = useState<string | null>(null);
  const [reqConceptoSearch2, setReqConceptoSearch2] = useState('');

  // Take-off APU (tipo NORMAL)
  const [conceptos, setConceptos] = useState<ConceptoSimple[]>([]);
  const [conceptoSearch, setConceptoSearch] = useState('');
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<ConceptoSimple | null>(null);
  const [cantidadTakeoff, setCantidadTakeoff] = useState('');
  const [materialesTakeoff, setMaterialesTakeoff] = useState<MaterialTakeoff[]>([]);
  const [loadingComposicion, setLoadingComposicion] = useState(false);
  // IMPREVISTO items
  const [itemsImprevisto, setItemsImprevisto] = useState<ImprevistoItem[]>([
    { descripcion_libre: '', unidad_libre: 'PZA', cantidad: '', notas: '', justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' },
  ]);

  const [sinPresupuesto, setSinPresupuesto] = useState(false);

  // Por Insumo state
  const [insumosAll,           setInsumosAll]           = useState<InsumoReq[]>([]);
  const [insumoSearch,         setInsumoSearch]         = useState('');
  const [insumoTabTipo,        setInsumoTabTipo]        = useState<'MATERIAL' | 'EQUIPO' | 'SERVICIO'>('MATERIAL');
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([]);
  const [loadingInsumos,       setLoadingInsumos]       = useState(false);
  const [specInputs,           setSpecInputs]           = useState<Record<number, string>>({});
  // IDs de insumos del APU de la partida seleccionada — null = sin filtro (IMPREVISTO o sin partida)
  const [insumosDePartidaIds,  setInsumosDePartidaIds]  = useState<Set<string> | null>(null);
  const [loadingInsumosPartida,setLoadingInsumosPartida]= useState(false);
  const insumoByIdResidente = useMemo(
    () => new Map(insumosAll.map(i => [i.insumo_id, i])),
    [insumosAll]
  );
  const toggleReqExpandedResidente = (reqId: string) => {
    setExpandedReqIds(prev => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId); else next.add(reqId);
      return next;
    });
  };

  const startEditingSpec = (item: ReqResidenteItem) => {
    setEditingSpecItemId(item.id);
    setEditingSpecDraft({
      marca: item.especificacion_marca_modelo ?? '',
      detalle: item.especificacion_detalle ?? '',
    });
  };

  const cancelEditingSpec = () => {
    setEditingSpecItemId(null);
    setEditingSpecDraft({ marca: '', detalle: '' });
  };

  const saveEditingSpec = async (reqId: string, itemId: string) => {
    setSavingSpecItemId(itemId);
    try {
      await api.put(
        `/api/v1/compras/requisiciones/${reqId}/items/${itemId}/especificacion-simple`,
        { especificacion_marca_modelo: editingSpecDraft.marca, especificacion_detalle: editingSpecDraft.detalle }
      );
      setReqsResidente(prev => prev.map(r => r.id !== reqId ? r : {
        ...r,
        items: r.items?.map(it => it.id !== itemId ? it : {
          ...it,
          especificacion_marca_modelo: editingSpecDraft.marca || null,
          especificacion_detalle: editingSpecDraft.detalle || null,
        }),
      }));
      cancelEditingSpec();
    } catch (err) {
      console.error('Error al guardar especificación', err);
    } finally {
      setSavingSpecItemId(null);
    }
  };

  // ── Carga de requisiciones, conceptos e insumos (cuando se activa el tab) ─
  useEffect(() => {
    if (!active || isDemo) return;
    const loadReqs = async () => {
      setLoadingInsumos(true);
      try {
        const [reqRes, presRes, insumosRes] = await Promise.allSettled([
          api.get('/api/v1/compras/requisiciones'),
          api.get('/api/v1/gerencia-tecnica/presupuesto/activo'),
          api.get('/api/v1/gerencia-tecnica/insumos/explosion'),
        ]);
        if (reqRes.status === 'fulfilled') {
          const raw: any[] = reqRes.value.data?.data || [];
          setReqsResidente(raw.map(r => ({
            id:           r.id_requisicion ?? r.id,
            folio:        r.codigo ?? r.folio,
            fecha:        r.fecha_solicitud ?? r.fecha,
            estado:       r.estado,
            tipo:         r.tipo,
            prioridad:    r.prioridad,
            observaciones: r.observaciones,
            concepto_id:  r.concepto_id ?? null,
            concepto_clave: r.concepto_clave ?? null,
            concepto_descripcion: r.concepto_descripcion ?? null,
            items: Array.isArray(r.items) ? r.items.map((it: any) => ({
              id: it.id_item ?? it.id,
              insumo_id: it.insumo_id ?? null,
              cantidad: Number(it.cantidad ?? 0),
              notas: it.notas ?? null,
              descripcion_libre: it.descripcion_libre ?? null,
              unidad_libre: it.unidad_libre ?? null,
              es_imprevisto: Boolean(it.es_imprevisto),
              especificacion_marca_modelo: it.especificacion_marca_modelo ?? null,
              especificacion_detalle: it.especificacion_detalle ?? null,
            })) : [],
          })));
        }
        if (presRes.status === 'fulfilled') {
          const pres = presRes.value.data?.data;
          const conceptosRaw: any[] = pres?.conceptos ?? [];
          setConceptos(conceptosRaw.map((c: any) => ({
            id:           c.id,
            clave:        c.clave,
            descripcion:  c.descripcion,
            unidad_medida: c.unidad_medida,
          })));
          setSinPresupuesto(false);
        } else {
          setSinPresupuesto(true);
        }
        if (insumosRes.status === 'fulfilled') {
          const raw: any[] = insumosRes.value.data?.data || [];
          setInsumosAll(raw
            .filter((i: any) => i.activo !== false)
            .map((i: any) => ({
              insumo_id:              i.id,
              clave:                  i.clave,
              descripcion:            i.descripcion,
              tipo_insumo:            i.tipo_insumo,
              unidad_medida:          i.unidad_medida,
              cantidad_presupuestada: i.cantidad_presupuestada != null ? Number(i.cantidad_presupuestada) : undefined,
            }))
          );
        }
      } catch { /* silencioso */ }
      finally { setLoadingInsumos(false); }
    };
    loadReqs();
  }, [active, isDemo]);

  // ── Cargar composición al seleccionar concepto ────────────────────────────
  useEffect(() => {
    if (!conceptoSeleccionado) { setMaterialesTakeoff([]); return; }
    const fetchComposicion = async () => {
      setLoadingComposicion(true);
      try {
        const res = await api.get(`/api/v1/gerencia-tecnica/conceptos/${conceptoSeleccionado.id}/composicion`);
        const items: any[] = res.data?.data ?? [];
        const materiales = items
          .filter(ci => ci.tipo_insumo === 'MATERIAL' && ci.insumo_id)
          .map(ci => ({
            insumo_id:        ci.insumo_id,
            clave:            ci.insumo?.clave ?? '',
            descripcion:      ci.insumo?.descripcion ?? '',
            unidad:           ci.insumo?.unidad_medida ?? '',
            cantidad_unitaria: Number(ci.cantidad),
            cantidad_total:   Number(ci.cantidad) * (parseFloat(cantidadTakeoff) || 0),
          }));
        setMaterialesTakeoff(materiales);
      } catch { setMaterialesTakeoff([]); }
      finally { setLoadingComposicion(false); }
    };
    fetchComposicion();
  }, [conceptoSeleccionado]);

  // ── Cargar IDs de la composición al seleccionar partida en modo INSUMO ──────
  useEffect(() => {
    if (!reqConceptoId || reqTipo !== 'INSUMO') { setInsumosDePartidaIds(null); return; }
    let cancelled = false;
    const fetch = async () => {
      setLoadingInsumosPartida(true);
      try {
        const res = await api.get(`/api/v1/gerencia-tecnica/conceptos/${reqConceptoId}/composicion`);
        const items: any[] = res.data?.data ?? [];
        if (!cancelled) {
          const ids = new Set(items.map((ci: any) => ci.insumo_id).filter(Boolean) as string[]);
          setInsumosDePartidaIds(ids.size > 0 ? ids : null);
        }
      } catch {
        if (!cancelled) setInsumosDePartidaIds(null);
      } finally {
        if (!cancelled) setLoadingInsumosPartida(false);
      }
    };
    void fetch();
    return () => { cancelled = true; };
  }, [reqConceptoId, reqTipo]);

  // ── Recalcular totales cuando cambia la cantidad ──────────────────────────
  useEffect(() => {
    const qty = parseFloat(cantidadTakeoff) || 0;
    setMaterialesTakeoff(prev => prev.map(m => ({ ...m, cantidad_total: +(m.cantidad_unitaria * qty).toFixed(4) })));
  }, [cantidadTakeoff]);

  const resetReqPanel = () => {
    setReqTipo('INSUMO');
    setReqPrioridad('MEDIA');
    setReqNotas('');
    setReqNotasInternas('');
    setReqDireccionEntrega('');
    setReqConceptoId(null);
    setReqConceptoSearch2('');
    setConceptoSearch('');
    setConceptoSeleccionado(null);
    setCantidadTakeoff('');
    setMaterialesTakeoff([]);
    setItemsImprevisto([{ descripcion_libre: '', unidad_libre: 'PZA', cantidad: '', notas: '', justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' }]);
    setInsumoSearch('');
    setInsumoTabTipo('MATERIAL');
    setInsumosSeleccionados([]);
    setSpecInputs({});
  };

  const conceptosFiltrados = conceptoSearch.trim()
    ? conceptos.filter(c =>
        c.clave.toLowerCase().includes(conceptoSearch.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(conceptoSearch.toLowerCase())
      )
    : conceptos;

  const handleGenerarRequisicion = async () => {
    if (reqTipo === 'INSUMO') {
      // ── Flujo Por Insumo ──────────────────────────────────────────────────
      if (insumosSeleccionados.length === 0) {
        notify({ type: 'error', title: 'Sin ítems seleccionados', message: 'Agrega al menos un insumo del catálogo.' }); return;
      }
      const sinCantidad = insumosSeleccionados.filter(i => !(i.cantidad > 0));
      if (sinCantidad.length > 0) {
        notify({ type: 'error', title: 'Cantidades inválidas', message: 'Ingresa la cantidad de todos los ítems.' }); return;
      }
      const sinJustificacion = insumosSeleccionados.filter(i => {
        const excede = i.cantidad_presupuestada != null && i.cantidad > i.cantidad_presupuestada;
        return excede && !i.justificacion.trim();
      });
      if (sinJustificacion.length > 0) {
        notify({ type: 'error', title: 'Justificación requerida', message: `${sinJustificacion.map(i => i.clave).join(', ')} excede el presupuesto — escribe la justificación.` }); return;
      }
      if (isDemo) {
        notify({ type: 'success', title: 'Requisición creada (demo)',
          message: `${insumosSeleccionados.length} ítem${insumosSeleccionados.length !== 1 ? 's' : ''} · Prioridad ${reqPrioridad}`,
          duration: 6000 });
        setShowReqPanel(false); resetReqPanel(); return;
      }
      try {
        setGenerandoReq(true);
        const itemsConExcedente = insumosSeleccionados.filter(
          i => i.cantidad_presupuestada != null && i.cantidad > i.cantidad_presupuestada
        );
        const observacionesBase = reqNotas || undefined;
        const observacionesFinal = itemsConExcedente.length > 0
          ? `${observacionesBase ? observacionesBase + ' · ' : ''}⚠ EXCEDENTE en ${itemsConExcedente.length} ítem(s): ${itemsConExcedente.map(i => `${i.clave} (pres: ${i.cantidad_presupuestada} → sol: ${i.cantidad})`).join(', ')}`
          : observacionesBase;
        const res = await api.post('/api/v1/compras/requisiciones', {
          tipo: 'NORMAL',
          concepto_id: reqConceptoId,
          prioridad: reqPrioridad,
          observaciones: observacionesFinal,
          observaciones_internas: reqNotasInternas || undefined,
          direccion_entrega: reqDireccionEntrega || undefined,
          items: insumosSeleccionados.map(i => {
            const excede = i.cantidad_presupuestada != null && i.cantidad > i.cantidad_presupuestada;
            return {
              insumo_id:                   i.insumo_id,
              clave:                       i.clave,
              cantidad:                    i.cantidad,
              cantidad_presupuestada:      i.cantidad_presupuestada ?? null,
              concepto_origen_id:          null,
              justificacion:               excede ? i.justificacion : null,
              especificacion_marca_modelo: i.especificacion_marca_modelo || undefined,
              especificacion_detalle:      i.especificacion_detalle || undefined,
              notas: excede
                ? `EXCEDENTE: presupuesto ${i.cantidad_presupuestada} ${i.unidad_medida}, solicitado ${i.cantidad} ${i.unidad_medida}`
                : (i.notas || undefined),
            };
          }),
        });
        const r = res.data.data;
        // guardar especificaciones técnicas por ítem (best-effort)
        const itemsConSpecs = insumosSeleccionados.filter(i => i.especificaciones.length > 0);
        if (itemsConSpecs.length > 0 && Array.isArray(r.items)) {
          await Promise.allSettled(
            itemsConSpecs.map(async (insumo) => {
              const backendItem = (r.items as any[]).find((bi: any) => bi.insumo_id === insumo.insumo_id);
              if (!backendItem) return;
              await api.put(
                `/api/v1/compras/requisiciones/${r.id_requisicion}/items/${backendItem.id_item}/especificaciones`,
                { especificaciones: insumo.especificaciones }
              );
            })
          );
        }
        // subir fichas técnicas adjuntas por insumo (best-effort) — ver
        // openspec/changes/adjuntos-requisicion-invitacion-cotizar
        const itemsConFicha = insumosSeleccionados.filter(i => i.fichaTecnica);
        if (itemsConFicha.length > 0) {
          await Promise.allSettled(
            itemsConFicha.map(async (insumo) => {
              const fd = new FormData();
              fd.append('archivo', insumo.fichaTecnica as File);
              fd.append('nombre_doc', (insumo.fichaTecnica as File).name);
              await api.post(`/api/v1/gerencia-tecnica/insumos/${insumo.insumo_id}/fichas`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            })
          );
        }
        notify({ type: 'success', title: 'Requisición creada',
          message: `${r.codigo ?? r.id} · ${insumosSeleccionados.length} ítem${insumosSeleccionados.length !== 1 ? 's' : ''} · Procurement la revisará.`,
          duration: 7000 });
        setShowReqPanel(false); resetReqPanel();
        const fresh = await api.get('/api/v1/compras/requisiciones');
        const raw: any[] = fresh.data?.data || [];
        setReqsResidente(raw.map(r2 => ({
          id: r2.id_requisicion ?? r2.id, folio: r2.codigo ?? r2.folio,
          fecha: r2.fecha_solicitud ?? r2.fecha, estado: r2.estado,
          tipo: r2.tipo, prioridad: r2.prioridad, observaciones: r2.observaciones,
          concepto_id: r2.concepto_id ?? null,
          concepto_clave: r2.concepto_clave ?? null,
          concepto_descripcion: r2.concepto_descripcion ?? null,
        })));
      } catch (err: any) {
        notify({ type: 'error', title: 'Error al crear requisición', message: err.response?.data?.message || err.message });
      } finally { setGenerandoReq(false); }

    } else if (reqTipo === 'APU') {
      // ── Flujo Desde APU ───────────────────────────────────────────────────
      if (!conceptoSeleccionado) {
        notify({ type: 'error', title: 'Selecciona un concepto APU', message: '' }); return;
      }
      const qty = parseFloat(cantidadTakeoff);
      if (!qty || qty <= 0) {
        notify({ type: 'error', title: 'Ingresa una cantidad válida', message: '' }); return;
      }
      const materiales = materialesTakeoff.filter(m => m.cantidad_total > 0);
      if (materiales.length === 0) {
        notify({ type: 'error', title: 'Sin materiales en la composición', message: 'Este concepto no tiene insumos de tipo MATERIAL.' }); return;
      }
      if (isDemo) {
        notify({ type: 'success', title: 'Requisición generada (demo)',
          message: `${conceptoSeleccionado.clave} · ${materiales.length} material${materiales.length !== 1 ? 'es' : ''} · Prioridad ${reqPrioridad}`,
          duration: 6000 });
        setShowReqPanel(false); resetReqPanel(); return;
      }
      try {
        setGenerandoReq(true);
        const res = await api.post('/api/v1/compras/requisiciones', {
          tipo: 'NORMAL',
          concepto_id: conceptoSeleccionado.id,
          prioridad: reqPrioridad,
          observaciones: `Take-off APU · ${conceptoSeleccionado.clave} · ${conceptoSeleccionado.descripcion} · ${qty} ${conceptoSeleccionado.unidad_medida}${reqNotas ? ' · ' + reqNotas : ''}`,
          observaciones_internas: reqNotasInternas || undefined,
          direccion_entrega: reqDireccionEntrega || undefined,
          items: materiales.map(m => ({
            insumo_id:              m.insumo_id,
            clave:                  m.clave,
            cantidad:               m.cantidad_total,
            cantidad_presupuestada: m.cantidad_total,          // take-off = cantidad presupuestada
            concepto_origen_id:     conceptoSeleccionado.id,  // vínculo al APU
            justificacion:          null,
            notas: `APU ${conceptoSeleccionado.clave}: ${m.cantidad_unitaria} × ${qty} ${conceptoSeleccionado.unidad_medida}`,
          })),
        });
        const r = res.data.data;
        const folio = r.codigo ?? r.id;
        notify({ type: 'success', title: 'Requisición creada',
          message: `${folio} · ${materiales.length} material${materiales.length !== 1 ? 'es' : ''} · Procurement la revisará.`,
          duration: 7000 });
        setShowReqPanel(false); resetReqPanel();
        // refrescar lista
        const fresh = await api.get('/api/v1/compras/requisiciones');
        const raw: any[] = fresh.data?.data || [];
        setReqsResidente(raw.map(r2 => ({
          id: r2.id_requisicion ?? r2.id, folio: r2.codigo ?? r2.folio,
          fecha: r2.fecha_solicitud ?? r2.fecha, estado: r2.estado,
          tipo: r2.tipo, prioridad: r2.prioridad, observaciones: r2.observaciones,
          concepto_id: r2.concepto_id ?? null,
          concepto_clave: r2.concepto_clave ?? null,
          concepto_descripcion: r2.concepto_descripcion ?? null,
        })));
      } catch (err: any) {
        notify({ type: 'error', title: 'Error al crear requisición', message: err.response?.data?.message || err.message });
      } finally { setGenerandoReq(false); }

    } else {
      // ── Flujo IMPREVISTO ──────────────────────────────────────────────────
      // IMPREVISTO
      const validos = itemsImprevisto.filter(i => i.descripcion_libre.trim() && i.cantidad);
      if (validos.length === 0) {
        notify({ type: 'error', title: 'Agrega al menos un ítem con descripción y cantidad', message: '' }); return;
      }
      const sinJustif = validos.filter(i => !i.justificacion.trim());
      if (sinJustif.length > 0) {
        notify({ type: 'error', title: 'Justificación requerida', message: `${sinJustif.length} ítem(s) sin justificación — todos los imprevistos deben explicar el motivo.` }); return;
      }
      if (isDemo) {
        notify({ type: 'success', title: 'Req. Imprevisto creada (demo)',
          message: `${validos.length} ítem${validos.length !== 1 ? 's' : ''} · Prioridad ${reqPrioridad}` });
        setShowReqPanel(false); resetReqPanel(); return;
      }
      try {
        setGenerandoReq(true);
        const res = await api.post('/api/v1/compras/requisiciones', {
          tipo: 'IMPREVISTO',
          concepto_id: reqConceptoId,
          prioridad: reqPrioridad,
          observaciones: reqNotas || undefined,
          observaciones_internas: reqNotasInternas || undefined,
          direccion_entrega: reqDireccionEntrega || undefined,
          items: validos.map(i => ({
            descripcion_libre:           i.descripcion_libre,
            unidad_libre:                i.unidad_libre || 'PZA',
            cantidad:                    Number(i.cantidad),
            cantidad_presupuestada:      null,
            concepto_origen_id:          null,
            justificacion:               i.justificacion,
            notas:                       i.notas || undefined,
            es_imprevisto:               true,
            especificacion_marca_modelo: i.especificacion_marca_modelo || undefined,
            especificacion_detalle:      i.especificacion_detalle || undefined,
          })),
        });
        const r = res.data.data;
        notify({ type: 'success', title: 'Req. Imprevisto enviada',
          message: `${r.codigo ?? r.id} · Procurement la revisará antes de cotizar.`,
          duration: 7000 });
        setShowReqPanel(false); resetReqPanel();
        const fresh = await api.get('/api/v1/compras/requisiciones');
        const raw: any[] = fresh.data?.data || [];
        setReqsResidente(raw.map(r2 => ({
          id: r2.id_requisicion ?? r2.id, folio: r2.codigo ?? r2.folio,
          fecha: r2.fecha_solicitud ?? r2.fecha, estado: r2.estado,
          tipo: r2.tipo, prioridad: r2.prioridad, observaciones: r2.observaciones,
          concepto_id: r2.concepto_id ?? null,
          concepto_clave: r2.concepto_clave ?? null,
          concepto_descripcion: r2.concepto_descripcion ?? null,
        })));
      } catch (err: any) {
        notify({ type: 'error', title: 'Error al crear requisición', message: err.response?.data?.message || err.message });
      } finally { setGenerandoReq(false); }
    }
  };

  return (
    <>
      {active && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total',      value: isDemo ? '—' : String(reqsResidente.length),                                               cls: 'text-foreground'  },
            { label: 'Pendientes', value: isDemo ? '—' : String(reqsResidente.filter(r => r.estado === 'PENDIENTE').length),         cls: 'text-amber-600'   },
            { label: 'Aprobadas',  value: isDemo ? '—' : String(reqsResidente.filter(r => r.estado === 'APROBADA').length),          cls: 'text-emerald-600' },
            { label: 'Imprevistos',value: isDemo ? '—' : String(reqsResidente.filter(r => r.tipo === 'IMPREVISTO').length),          cls: 'text-orange-600'  },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className={cn('mt-1 text-xl font-black', k.cls)}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-4">
          {/* Header con botón nueva req */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tus solicitudes de compra para este frente de obra
            </p>
            <Button
              size="sm"
              onClick={() => setShowReqPanel(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black"
            >
              <IconPlus className="mr-1.5 h-3.5 w-3.5" />
              Nueva Requisición
            </Button>
          </div>

          {isDemo ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
              <IconShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground">Demo — usa "Nueva Requisición" para simular</p>
              <p className="mt-1 text-xs text-muted-foreground">
                En producción verás aquí todas las solicitudes que hayas enviado a Compras.
              </p>
            </div>
          ) : reqsResidente.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-12 text-center">
              <IconShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-bold text-muted-foreground">Sin requisiciones activas</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Crea una desde un concepto APU o como imprevisto de obra.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {reqsResidente.map(req => {
                const badge = REQ_ESTADO_BADGE[req.estado] ?? { cls: 'bg-zinc-500/10 text-zinc-500', label: req.estado };
                return (
                  <Card key={req.id} className="border-border/40">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-black text-indigo-700">
                          {req.folio}
                        </span>
                        {req.tipo === 'IMPREVISTO' && (
                          <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[9px] font-black text-orange-700">
                            Imprevisto
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black', badge.cls)}>
                          <IconClock className="h-3 w-3" />
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(req.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      {req.concepto_clave && (
                        <p className="text-[10px] font-mono text-indigo-600 truncate">
                          [{req.concepto_clave}] {req.concepto_descripcion}
                        </p>
                      )}
                      {req.observaciones && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{req.observaciones}</p>
                      )}
                      {!!req.items?.length && (
                        <div className="rounded-xl border border-border/40 bg-muted/20">
                          <button
                            type="button"
                            onClick={() => toggleReqExpandedResidente(req.id)}
                            className="flex w-full items-center justify-between px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                          >
                            <span>Ver {req.items.length} ítem{req.items.length === 1 ? '' : 's'}</span>
                            <span>{expandedReqIds.has(req.id) ? '▲' : '▼'}</span>
                          </button>
                          {expandedReqIds.has(req.id) && (
                            <div className="space-y-2 border-t border-border/40 px-3 py-2.5">
                              {req.items.map(item => {
                                const insumo = item.insumo_id ? insumoByIdResidente.get(item.insumo_id) : undefined;
                                const nombre = item.es_imprevisto
                                  ? (item.descripcion_libre || 'Descripción libre no capturada')
                                  : (insumo ? `[${insumo.clave}] ${insumo.descripcion}` : (item.insumo_id ? 'Insumo no encontrado en catálogo' : '—'));
                                const unidad = item.es_imprevisto ? item.unidad_libre : insumo?.unidad_medida;
                                const puedeEditarSpec = req.estado === 'PENDIENTE' || req.estado === 'APROBADA';
                                const editandoEsteItem = editingSpecItemId === item.id;
                                return (
                                  <div key={item.id} className="text-[10px] leading-snug">
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-foreground">{nombre}</span>
                                      <span className="shrink-0 font-mono text-muted-foreground">{item.cantidad} {unidad || ''}</span>
                                    </div>
                                    {editandoEsteItem ? (
                                      <div className="mt-1 space-y-1">
                                        <input
                                          type="text"
                                          placeholder="Marca / Modelo ref."
                                          value={editingSpecDraft.marca}
                                          maxLength={200}
                                          onChange={e => setEditingSpecDraft(prev => ({ ...prev, marca: e.target.value }))}
                                          className="w-full text-[10px] bg-background border border-border/40 rounded-lg px-2 py-1 focus:border-indigo-400 outline-none"
                                        />
                                        <textarea
                                          placeholder="Detalle técnico"
                                          value={editingSpecDraft.detalle}
                                          onChange={e => setEditingSpecDraft(prev => ({ ...prev, detalle: e.target.value }))}
                                          rows={2}
                                          className="w-full text-[10px] bg-background border border-border/40 rounded-lg px-2 py-1 focus:border-indigo-400 outline-none resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={cancelEditingSpec}
                                            className="text-[9px] font-bold text-muted-foreground hover:text-foreground"
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            type="button"
                                            disabled={savingSpecItemId === item.id}
                                            onClick={() => saveEditingSpec(req.id, item.id)}
                                            className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                                          >
                                            {savingSpecItemId === item.id ? 'Guardando…' : 'Guardar'}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start justify-between gap-2">
                                        {(item.especificacion_marca_modelo || item.especificacion_detalle) ? (
                                          <p className="text-muted-foreground">
                                            {[item.especificacion_marca_modelo, item.especificacion_detalle].filter(Boolean).join(' — ')}
                                          </p>
                                        ) : <span />}
                                        {puedeEditarSpec && (
                                          <button
                                            type="button"
                                            onClick={() => startEditingSpec(item)}
                                            className="shrink-0 text-[9px] font-bold text-indigo-600 hover:text-indigo-700"
                                          >
                                            Editar
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {item.notas && <p className="italic text-muted-foreground">{item.notas}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Prioridad: <strong>{req.prioridad}</strong></span>
                        {req.estado === 'PENDIENTE' && (
                          <span className="text-amber-600">⏳ Esperando aprobación</span>
                        )}
                        {req.estado === 'APROBADA' && (
                          <span className="text-emerald-600">✓ En cotización</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <SlidePanel
        isOpen={showReqPanel}
        onClose={() => { setShowReqPanel(false); resetReqPanel(); }}
        title="Nueva Requisición"
        subtitle={
          reqTipo === 'IMPREVISTO' ? 'Imprevisto de obra — texto libre'
          : reqTipo === 'APU' ? 'Desde APU — take-off de composición'
          : 'Por Insumo — selección del catálogo'
        }
        accentColor={reqTipo === 'IMPREVISTO' ? 'amber' : 'indigo'}
      >
        <div className="space-y-5">

          {/* ── Partida del catálogo (obligatoria para INSUMO / IMPREVISTO) ── */}
          {reqTipo !== 'APU' && (() => {
            const conceptoReq = conceptos.find(c => c.id === reqConceptoId) ?? null;
            const filtrados2 = reqConceptoSearch2.trim()
              ? conceptos.filter(c => `${c.clave} ${c.descripcion}`.toLowerCase().includes(reqConceptoSearch2.toLowerCase()))
              : conceptos;
            return (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Partida del catálogo <span className="text-red-500">*</span>
                </p>
                {conceptoReq ? (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/5 px-3 py-2">
                    <div>
                      <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider">{conceptoReq.clave}</p>
                      <p className="text-xs font-bold text-foreground/80">{conceptoReq.descripcion}</p>
                    </div>
                    <button type="button" onClick={() => setReqConceptoId(null)}
                      className="ml-2 text-muted-foreground hover:text-red-500">
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar partida por clave o descripción..."
                        value={reqConceptoSearch2}
                        onChange={e => setReqConceptoSearch2(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border/60 rounded-lg focus:border-indigo-400 outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {filtrados2.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground py-2 text-center">
                          {conceptos.length === 0 ? 'Sin catálogo de obra — importa en Gerencia Técnica' : 'Sin coincidencias'}
                        </p>
                      ) : filtrados2.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setReqConceptoId(c.id); setReqConceptoSearch2(''); }}
                          className="w-full flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2 text-left hover:border-indigo-400/40 hover:bg-indigo-500/5 transition-all"
                        >
                          <span className="text-[10px] font-mono text-indigo-600 shrink-0">{c.clave}</span>
                          <span className="text-xs truncate text-foreground/80">{c.descripcion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Selector tipo — 3 opciones */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'INSUMO',    label: '📦 Por Insumo',  sub: 'Del catálogo de materiales, equipo y servicios' },
              { value: 'APU',       label: '📋 Desde APU',   sub: 'Calcula materiales desde el catálogo de obra'   },
              { value: 'IMPREVISTO',label: '⚠️ Imprevisto',  sub: 'Material fuera del presupuesto APU'             },
            ].map(opt => {
              const isActive = reqTipo === opt.value;
              const activeClass = opt.value === 'IMPREVISTO'
                ? 'border-orange-500/40 bg-orange-500/10 shadow-sm'
                : 'border-indigo-500/40 bg-indigo-500/10 shadow-sm';
              const activeTextClass = opt.value === 'IMPREVISTO' ? 'text-orange-700' : 'text-indigo-700';
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReqTipo(opt.value as 'INSUMO' | 'APU' | 'IMPREVISTO')}
                  className={cn(
                    'flex flex-col items-start rounded-xl border px-3 py-3 text-left transition-all',
                    isActive ? activeClass : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <span className={cn('text-xs font-black', isActive ? activeTextClass : 'text-foreground')}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{opt.sub}</span>
                </button>
              );
            })}
          </div>

          {/* ── Por Insumo: catálogo filtrado ── */}
          {reqTipo === 'INSUMO' && (
            <div className="space-y-4">
              {/* Tabs de tipo */}
              <div className="flex gap-2">
                {(['MATERIAL', 'EQUIPO', 'SERVICIO'] as const).map(tab => {
                  const tabLabels = { MATERIAL: '🧱 Material', EQUIPO: '🏗 Equipo', SERVICIO: '🔧 Servicio' };
                  const typeMap = { MATERIAL: 'MATERIAL', EQUIPO: 'EQUIPO', SERVICIO: 'SUBCONTRATO' };
                  const count = insumosAll
                    .filter(i => i.tipo_insumo === typeMap[tab])
                    .filter(i => !insumosDePartidaIds || insumosDePartidaIds.has(i.insumo_id))
                    .length;
                  return (
                    <button
                      key={tab}
                      onClick={() => { setInsumoTabTipo(tab); setInsumoSearch(''); }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all',
                        insumoTabTipo === tab
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'border-border/60 text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {tabLabels[tab]}
                      {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Búsqueda */}
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por clave o descripción..."
                  value={insumoSearch}
                  onChange={e => setInsumoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border/60 rounded-lg focus:border-indigo-400 outline-none"
                />
              </div>

              {/* Catálogo filtrado */}
              {loadingInsumos || loadingInsumosPartida ? (
                <div className="text-center py-4">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" />
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {loadingInsumosPartida ? 'Cargando insumos de la partida...' : 'Cargando catálogo...'}
                  </p>
                </div>
              ) : (() => {
                const typeMap: Record<'MATERIAL' | 'EQUIPO' | 'SERVICIO', string> = {
                  MATERIAL: 'MATERIAL', EQUIPO: 'EQUIPO', SERVICIO: 'SUBCONTRATO',
                };
                const tipoTarget = typeMap[insumoTabTipo];
                const porPartida = insumosAll
                  .filter(i => !insumosDePartidaIds || insumosDePartidaIds.has(i.insumo_id));
                const filtrados = porPartida
                  .filter(i => i.tipo_insumo === tipoTarget)
                  .filter(i => {
                    if (!insumoSearch.trim()) return true;
                    const q = insumoSearch.toLowerCase();
                    return i.clave.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q);
                  })
                  .filter(i => !insumosSeleccionados.find(s => s.insumo_id === i.insumo_id))
                  .slice(0, 15);
                const totalDeTipo = porPartida.filter(i => i.tipo_insumo === tipoTarget).length;
                if (totalDeTipo === 0) {
                  return (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] text-amber-700">
                      {insumosDePartidaIds
                        ? <>Esta partida no tiene insumos de tipo <strong>{insumoTabTipo}</strong> en su APU. Prueba con otro tipo o usa <strong>Imprevisto</strong>.</>
                        : <>Este proyecto no tiene insumos de tipo {insumoTabTipo} en el catálogo. Usa la opción <strong>Imprevisto</strong>.</>
                      }
                    </div>
                  );
                }
                if (filtrados.length === 0 && insumoSearch) {
                  return <p className="text-[10px] text-muted-foreground text-center py-3">Sin coincidencias en el catálogo.</p>;
                }
                return (
                  <div className="rounded-xl border border-border/40 overflow-hidden max-h-48 overflow-y-auto">
                    {filtrados.map((insumo, i) => (
                      <button
                        key={insumo.insumo_id}
                        type="button"
                        onClick={() => {
                          const cantDefault = insumo.cantidad_presupuestada ?? 0;
                          setInsumosSeleccionados(prev => [...prev, { ...insumo, cantidad: cantDefault, notas: '', especificaciones: [], justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' }]);
                          setInsumoSearch('');
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-indigo-500/5 transition-colors',
                          i % 2 === 0 ? 'bg-muted/10' : 'bg-transparent'
                        )}
                      >
                        <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-black text-indigo-700 shrink-0">{insumo.clave}</span>
                        <span className="flex-1 text-xs text-foreground leading-snug">{insumo.descripcion}</span>
                        {(insumo.cantidad_presupuestada ?? 0) > 0 && (
                          <span className="text-[9px] text-emerald-600 font-bold shrink-0">
                            Pres: {insumo.cantidad_presupuestada} {insumo.unidad_medida}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground shrink-0">{insumo.unidad_medida}</span>
                        <span className="text-[9px] text-indigo-500 font-black shrink-0">+ Agregar</span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Ítems seleccionados */}
              {insumosSeleccionados.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Ítems a requisitar ({insumosSeleccionados.length})
                  </p>
                  {insumosSeleccionados.map((item, idx) => {
                    const excedente = item.cantidad_presupuestada != null && item.cantidad > item.cantidad_presupuestada;
                    const pctExcedente = excedente
                      ? ((item.cantidad - item.cantidad_presupuestada!) / item.cantidad_presupuestada! * 100).toFixed(0)
                      : null;
                    return (
                      <div
                        key={item.insumo_id}
                        className={cn(
                          'flex flex-col rounded-xl border',
                          excedente
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : 'border-indigo-500/20 bg-indigo-500/5'
                        )}
                      >
                        {/* fila principal: descripción + cantidad + eliminar */}
                        <div className="flex items-start gap-3 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono text-muted-foreground">{item.clave}</p>
                            <p className="text-xs font-semibold text-foreground truncate">{item.descripcion}</p>
                            {excedente && (
                              <p className="text-[9px] text-amber-600 mt-0.5">
                                ⚠ Excede presupuesto — pres: {item.cantidad_presupuestada} {item.unidad_medida}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-0.5">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Cant."
                              value={item.cantidad || ''}
                              onChange={e => setInsumosSeleccionados(prev => prev.map((p, i) => i === idx ? { ...p, cantidad: Number(e.target.value) } : p))}
                              className={cn(
                                'w-20 text-right text-xs font-bold bg-background border rounded-lg px-2 py-1 focus:border-indigo-400 outline-none',
                                excedente ? 'border-amber-500/60' : 'border-border/60'
                              )}
                            />
                            <span className="text-[9px] text-muted-foreground">{item.unidad_medida}</span>
                            {pctExcedente && (
                              <span className="text-[8px] font-black text-amber-600 bg-amber-500/10 rounded px-1.5 py-0.5 whitespace-nowrap">
                                ↑ {pctExcedente}% sobre pres.
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setInsumosSeleccionados(prev => prev.filter((_, i) => i !== idx))}
                            className="text-muted-foreground hover:text-red-500 shrink-0 mt-0.5"
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* ── Justificación de excedente (obligatoria) ── */}
                        {excedente && (
                          <div className="px-4 pb-2 pt-1 border-t border-amber-500/20">
                            <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-amber-600">
                              Justificación del excedente <span className="text-red-500">*</span>
                            </p>
                            <textarea
                              rows={2}
                              placeholder="Explica el motivo por el que se requiere más cantidad de lo presupuestado…"
                              value={item.justificacion}
                              onChange={e => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, justificacion: e.target.value } : p))}
                              className={cn(
                                'w-full resize-none rounded-lg border px-2.5 py-1.5 text-[10px] outline-none placeholder:text-muted-foreground/60',
                                item.justificacion.trim()
                                  ? 'border-amber-400/60 focus:border-amber-500 bg-background'
                                  : 'border-red-400/60 bg-red-500/5 focus:border-red-500'
                              )}
                            />
                          </div>
                        )}
                        {/* ── Especificaciones técnicas por partida ── */}
                        <div className="px-4 pb-3 pt-1 border-t border-indigo-500/10 space-y-1.5">
                          {item.especificaciones.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {item.especificaciones.map((spec, si) => (
                                <span key={si} className="flex items-center gap-1 text-[9px] bg-indigo-500/10 text-indigo-700 rounded-full px-2 py-0.5 max-w-[240px]">
                                  <span className="truncate">{spec}</span>
                                  <button
                                    type="button"
                                    onClick={() => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx
                                      ? { ...p, especificaciones: p.especificaciones.filter((_, xi) => xi !== si) }
                                      : p))}
                                    className="shrink-0 hover:text-red-500"
                                  >
                                    <IconX className="h-2.5 w-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            placeholder="+ Especificación técnica (Enter para agregar)"
                            value={specInputs[idx] ?? ''}
                            maxLength={500}
                            onChange={e => setSpecInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && specInputs[idx]?.trim()) {
                                e.preventDefault();
                                const val = specInputs[idx].trim();
                                setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx
                                  ? { ...p, especificaciones: [...p.especificaciones, val] }
                                  : p));
                                setSpecInputs(prev => ({ ...prev, [idx]: '' }));
                              }
                            }}
                            className="w-full text-[10px] bg-background border border-border/40 rounded-lg px-2.5 py-1.5 focus:border-indigo-400 outline-none placeholder:text-muted-foreground/60"
                          />
                          <input
                            type="text"
                            placeholder="Marca / Modelo ref. (opcional)"
                            value={item.especificacion_marca_modelo}
                            maxLength={200}
                            onChange={e => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, especificacion_marca_modelo: e.target.value } : p))}
                            className="w-full text-[10px] bg-background border border-border/40 rounded-lg px-2.5 py-1.5 focus:border-indigo-400 outline-none placeholder:text-muted-foreground/60"
                          />
                          <textarea
                            rows={2}
                            placeholder="Especificaciones técnicas detalladas (opcional)"
                            value={item.especificacion_detalle}
                            onChange={e => setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, especificacion_detalle: e.target.value } : p))}
                            className="w-full resize-none text-[10px] bg-background border border-border/40 rounded-lg px-2.5 py-1.5 focus:border-indigo-400 outline-none placeholder:text-muted-foreground/60"
                          />
                          <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="shrink-0">📎 Ficha técnica (opcional):</span>
                            <input
                              type="file"
                              data-testid={`ficha-tecnica-${item.insumo_id}`}
                              onChange={e => {
                                const file = e.target.files?.[0] ?? null;
                                setInsumosSeleccionados(prev => prev.map((p, pi) => pi === idx ? { ...p, fichaTecnica: file } : p));
                              }}
                              className="flex-1 text-[10px] text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[9px] file:font-black file:text-indigo-700"
                            />
                          </label>
                          {item.fichaTecnica && (
                            <p className="text-[9px] text-emerald-600 truncate">✓ {item.fichaTecnica.name}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {insumosAll.length === 0 && !loadingInsumos && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] text-amber-700">
                  Este proyecto no tiene insumos en el catálogo. Usa la opción <strong>Imprevisto</strong>.
                </div>
              )}
            </div>
          )}

          {/* ── APU: búsqueda de concepto APU ── */}
          {reqTipo === 'APU' && (
            <div className="space-y-4">
              {/* Concepto seleccionado */}
              {/* Concepto seleccionado — chip compacto */}
              {conceptoSeleccionado && (
                <div className="flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider mb-0.5">Concepto seleccionado</p>
                    <p className="text-xs font-black text-indigo-800">{conceptoSeleccionado.clave} — {conceptoSeleccionado.descripcion}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{conceptoSeleccionado.unidad_medida}</p>
                  </div>
                  <button type="button" onClick={() => { setConceptoSeleccionado(null); setMaterialesTakeoff([]); setCantidadTakeoff(''); }}
                    className="ml-3 text-muted-foreground hover:text-red-500 shrink-0">
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Lista de partidas APU — siempre visible */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Partidas del presupuesto ({conceptos.length})
                  </p>
                  {conceptoSeleccionado && (
                    <span className="text-[9px] text-indigo-600 font-semibold">Seleccionado ↑</span>
                  )}
                </div>
                {/* Buscador */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 text-xs"
                    placeholder="Filtrar por clave o descripción..."
                    value={conceptoSearch}
                    onChange={e => setConceptoSearch(e.target.value)}
                  />
                </div>
                {/* Listado scrollable */}
                <div className="rounded-xl border border-border/40 overflow-hidden max-h-52 overflow-y-auto">
                  {conceptosFiltrados.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-muted-foreground">
                      {conceptoSearch
                        ? 'Sin partidas que coincidan con la búsqueda'
                        : sinPresupuesto
                          ? 'Sin presupuesto activo — importa el catálogo en Gerencia Técnica'
                          : 'No hay partidas en el presupuesto activo'}
                    </div>
                  ) : (
                    conceptosFiltrados.map((c, ci) => {
                      const isSelected = conceptoSeleccionado?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setConceptoSeleccionado(null); setMaterialesTakeoff([]); setCantidadTakeoff('');
                            } else {
                              setConceptoSeleccionado(c); setConceptoSearch('');
                            }
                          }}
                          className={cn(
                            'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors',
                            ci % 2 === 0 ? 'bg-muted/20' : 'bg-transparent',
                            isSelected
                              ? 'bg-indigo-500/15 border-l-2 border-indigo-500'
                              : 'hover:bg-muted/60'
                          )}
                        >
                          <span className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-black shrink-0',
                            isSelected ? 'bg-indigo-500/20 text-indigo-700' : 'bg-indigo-500/10 text-indigo-600'
                          )}>{c.clave}</span>
                          <span className="flex-1 text-xs text-foreground leading-snug">{c.descripcion}</span>
                          <span className="shrink-0 text-[9px] text-muted-foreground">{c.unidad_medida}</span>
                          {isSelected && <span className="shrink-0 text-[9px] font-black text-indigo-600">✓</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cantidad a ejecutar */}
              {conceptoSeleccionado && (
                <FormField label={`Cantidad a ejecutar (${conceptoSeleccionado.unidad_medida})`} required>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={cantidadTakeoff}
                    onChange={e => setCantidadTakeoff(e.target.value)}
                  />
                </FormField>
              )}

              {/* Materiales del take-off */}
              {loadingComposicion && (
                <div className="text-center py-4">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" />
                  <p className="mt-2 text-[10px] text-muted-foreground">Cargando composición APU...</p>
                </div>
              )}
              {!loadingComposicion && materialesTakeoff.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Materiales a requisitar
                    </p>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-black text-indigo-700">
                      {materialesTakeoff.length} insumo{materialesTakeoff.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/40 overflow-hidden">
                    {materialesTakeoff.map((m, i) => (
                      <div key={m.insumo_id}
                        className={cn('flex items-center justify-between gap-3 px-4 py-2.5 text-xs',
                          i % 2 === 0 ? 'bg-muted/20' : 'bg-transparent'
                        )}>
                        <div className="flex-1 min-w-0">
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 mr-2">{m.clave}</span>
                          <span className="text-foreground truncate">{m.descripcion}</span>
                        </div>
                        <span className={cn('shrink-0 font-black text-right',
                          (parseFloat(cantidadTakeoff) || 0) > 0 ? 'text-indigo-700' : 'text-muted-foreground'
                        )}>
                          {(parseFloat(cantidadTakeoff) || 0) > 0
                            ? `${m.cantidad_total.toFixed(4)} ${m.unidad}`
                            : '—'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                  {!cantidadTakeoff && (
                    <p className="text-[10px] text-muted-foreground text-center">Ingresa la cantidad para ver los totales</p>
                  )}
                </div>
              )}
              {!loadingComposicion && conceptoSeleccionado && materialesTakeoff.length === 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[10px] text-amber-700">
                  Este concepto no tiene insumos de tipo MATERIAL en su composición APU.
                  Si necesitas materiales no catalogados, usa el tipo <strong>Imprevisto</strong>.
                </div>
              )}
            </div>
          )}

          {/* ── IMPREVISTO: texto libre ── */}
          {reqTipo === 'IMPREVISTO' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Materiales a solicitar <span className="text-red-500">*</span>
                </p>
                <button type="button"
                  onClick={() => setItemsImprevisto(prev => [...prev, { descripcion_libre: '', unidad_libre: 'PZA', cantidad: '', notas: '', justificacion: '', especificacion_marca_modelo: '', especificacion_detalle: '' }])}
                  className="flex items-center gap-1 text-[10px] font-black text-orange-600 hover:text-orange-500"
                >
                  <IconPlus className="h-3 w-3" /> Agregar ítem
                </button>
              </div>
              {itemsImprevisto.map((item, idx) => (
                <Card key={idx} className="border-orange-500/20 bg-orange-500/5 shadow-none">
                  <CardContent className="relative p-4 space-y-3">
                    {itemsImprevisto.length > 1 && (
                      <button type="button"
                        onClick={() => setItemsImprevisto(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-red-500">
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <FormField label="Descripción del material" required>
                      <Input
                        placeholder="Ej: Tabique rojo recocido 7×14×28 cm"
                        value={item.descripcion_libre}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], descripcion_libre: e.target.value }; return n;
                        })}
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Unidad">
                        <Select value={item.unidad_libre} onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], unidad_libre: e.target.value }; return n;
                        })}>
                          {UNIDADES_REQ.map(u => <option key={u} value={u}>{u}</option>)}
                        </Select>
                      </FormField>
                      <FormField label="Cantidad" required>
                        <Input type="number" placeholder="0"
                          value={item.cantidad}
                          onChange={e => setItemsImprevisto(prev => {
                            const n = [...prev]; n[idx] = { ...n[idx], cantidad: e.target.value }; return n;
                          })}
                        />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Notas (frente, área)">
                        <Input className="text-xs" placeholder="Ej: Frente Nivel 12 eje A-B"
                          value={item.notas}
                          onChange={e => setItemsImprevisto(prev => {
                            const n = [...prev]; n[idx] = { ...n[idx], notas: e.target.value }; return n;
                          })}
                        />
                      </FormField>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-orange-600">
                        Justificación <span className="text-red-500">*</span>
                      </p>
                      <textarea
                        rows={2}
                        placeholder="Ej: Retroexcavadora reventó puesta a tierra — reposición urgente"
                        value={item.justificacion}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], justificacion: e.target.value }; return n;
                        })}
                        className={cn(
                          'w-full resize-none rounded-lg border px-2.5 py-1.5 text-[10px] outline-none placeholder:text-muted-foreground/60',
                          item.justificacion.trim()
                            ? 'border-orange-400/40 focus:border-orange-500 bg-background'
                            : 'border-red-400/60 bg-red-500/5 focus:border-red-500'
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      <Input
                        placeholder="Marca / Modelo ref. (opcional)"
                        value={item.especificacion_marca_modelo}
                        maxLength={200}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], especificacion_marca_modelo: e.target.value }; return n;
                        })}
                        className="text-[10px]"
                      />
                      <Textarea
                        rows={2}
                        placeholder="Especificaciones técnicas detalladas (opcional)"
                        value={item.especificacion_detalle}
                        onChange={e => setItemsImprevisto(prev => {
                          const n = [...prev]; n[idx] = { ...n[idx], especificacion_detalle: e.target.value }; return n;
                        })}
                        className="min-h-[50px] text-[10px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-[10px] text-orange-700">
                ⚠️ Los imprevistos quedan etiquetados para reportes de desviación presupuestal. Procurement los revisará antes de cotizar.
              </div>
            </div>
          )}

          {/* Prioridad y notas comunes */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prioridad">
              <Select value={reqPrioridad} onChange={e => setReqPrioridad(e.target.value)}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta — urgente</option>
              </Select>
            </FormField>
            <div />
          </div>

          <FormField label="Notas para Proveedores">
            <Textarea className="min-h-[70px]"
              placeholder="Instrucciones, certificaciones, consideraciones para el proveedor..."
              value={reqNotas}
              onChange={e => setReqNotas(e.target.value)}
            />
            <p className="mt-1 text-[9px] text-muted-foreground">
              Se verán en la Solicitud de Cotización y pueden llegar a los proveedores.
            </p>
          </FormField>

          <FormField label="Notas internas para Compras">
            <Textarea className="min-h-[70px]"
              placeholder="Solo lo ve Compras — no se envía a proveedores..."
              value={reqNotasInternas}
              onChange={e => setReqNotasInternas(e.target.value)}
            />
            <p className="mt-1 text-[9px] text-muted-foreground">
              🔒 Confidencial — nunca se comparte con proveedores.
            </p>
          </FormField>

          <FormField label="Dirección de entrega">
            <Input
              value={reqDireccionEntrega}
              onChange={e => setReqDireccionEntrega(e.target.value)}
              placeholder="Ej. Almacén de obra — Av. Industria 245, Parque Industrial..."
            />
            <p className="mt-1 text-[9px] text-muted-foreground">
              Se incluye en el correo de Solicitud de Cotización que Compras envía a los proveedores.
            </p>
          </FormField>

          <div className="border-t border-border/40 pt-4">
            <SubmitButton
              label={
                (reqTipo !== 'APU' && !reqConceptoId) ? 'Selecciona la partida del catálogo'
                : reqTipo === 'IMPREVISTO' ? 'Enviar Imprevisto a Compras'
                : reqTipo === 'APU' ? 'Generar Requisición APU'
                : insumosSeleccionados.length === 0 ? 'Selecciona al menos un insumo'
                : `Generar Requisición (${insumosSeleccionados.length} ítem${insumosSeleccionados.length !== 1 ? 's' : ''})`
              }
              loading={generandoReq}
              color={reqTipo === 'IMPREVISTO' ? 'amber' : 'indigo'}
              onClick={handleGenerarRequisicion}
            />
          </div>
        </div>
      </SlidePanel>
    </>
  );
};

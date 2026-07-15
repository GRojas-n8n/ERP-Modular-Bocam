import React, { useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import { useTenant } from '../context/TenantContext';
import { useNotification } from '../context/NotificationContext';
import { DEMO_EMPLEADOS, DEMO_CUADRILLAS, DEMO_PRENOMINAS } from '../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  EmptyStatePanel,
  SectionBadge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooterBar,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@bocam/ui-core';
import {
  IconAlertCircle,
  IconBriefcase,
  IconCheckCircle2,
  IconClock,
  IconDownload,
  IconPlus,
  IconShieldCheck,
  IconUpload,
  IconUsers,
  IconWallet,
} from '../components/Icons';
import { SlidePanel, SubmitButton } from '../components/SlidePanel';
import { TableScrollShadow } from '../components/TableScrollShadow';
import { descargarPlantillaXlsx, leerColumnaCsv, parseCsvOrExcelFile } from '../lib/csvImport';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Vista: Personal / RRHH - Empleados, Cuadrillas y Pre-Nomina
 * ---------------------------------------------------------------------------
 */

interface Empleado {
  id_empleado: string;
  numero_empleado: string;
  nombre: string;
  apellido_paterno: string;
  puesto: string;
  categoria: string;
  estado: string;
  salario_diario: number;
  certificaciones?: string;
  cuadrilla?: { nombre: string; codigo: string } | null;
  modo_asistencia?: string;
  tipo_jornada?: string;
  hora_entrada_programada?: string | null;
  hora_salida_programada?: string | null;
  horas_jornada?: number;
}

interface Cuadrilla {
  id_cuadrilla: string;
  nombre: string;
  codigo: string;
  especialidad: string;
  capataz_nombre?: string;
  estado: string;
  _count?: { miembros: number };
}

interface PreNomina {
  id_prenomina: string;
  codigo: string;
  periodo_tipo: string;
  periodo_inicio: string;
  periodo_fin: string;
  total_neto: number;
  total_empleados: number;
  estado: string;
  requiere_recalculo?: boolean;
}

interface PreNominaDetalle {
  id_detalle: string;
  empleado_id: string;
  origen_dias: string;
  dias_trabajados: number;
  salario_base: number;
  monto_horas_extra: number;
  deduccion_imss: number;
  deduccion_isr: number;
  horas_normales?: number | null;
  monto_he_doble?: number;
  monto_he_triple?: number;
  origen_horas?: string;
  otras_deducciones: number;
  total_percepciones: number;
  total_deducciones: number;
  neto_a_pagar: number;
  empleado?: { nombre: string; apellido_paterno: string; numero_empleado: string };
}

interface ConfigJornada {
  modo_asistencia: 'JORNADA_COMPLETA' | 'POR_HORAS';
  tipo_jornada: 'DIURNA' | 'NOCTURNA' | 'MIXTA';
  hora_entrada_programada: string;
  hora_salida_programada: string;
  horas_jornada: number;
}

interface ConfigDeducciones {
  aplica_imss: boolean;
  aplica_isr: boolean;
  aplica_infonavit: boolean;
  infonavit_num: string | null;
  infonavit_monto: number | null;
}

interface PaseAcceso {
  id: string;
  numero_pase: string;
  empleado_nombre: string;
  empleado_numero: string;
  puesto: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  area_acceso?: string;
}

const ALERTA_DIAS = 15; // días antes del vencimiento para alertar

function diasRestantes(fechaVenc: string): number {
  return Math.ceil((new Date(fechaVenc).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function urgenciaPase(dias: number): { label: string; className: string; dot: string } {
  if (dias < 0)  return { label: 'VENCIDO',    className: 'bg-red-500/10 text-red-600 border-red-500/20',       dot: 'bg-red-500' };
  if (dias <= 7) return { label: 'CRÍTICO',    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20', dot: 'bg-orange-500' };
  if (dias <= ALERTA_DIAS) return { label: 'POR VENCER', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500 animate-pulse' };
  return           { label: 'VIGENTE',    className: 'bg-green-500/10 text-green-600 border-green-500/20',   dot: 'bg-green-500' };
}

// Demo data para pases
const DEMO_PASES: PaseAcceso[] = [
  { id: '1', numero_pase: 'A-0142', empleado_nombre: 'Carlos Reyes López',     empleado_numero: 'EMP-001', puesto: 'Oficial',    fecha_emision: '2025-01-10', fecha_vencimiento: new Date(Date.now() + 3  * 86400000).toISOString().split('T')[0], area_acceso: 'Zona A' },
  { id: '2', numero_pase: 'A-0198', empleado_nombre: 'Martín Torres García',   empleado_numero: 'EMP-002', puesto: 'Albañil',    fecha_emision: '2025-01-10', fecha_vencimiento: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], area_acceso: 'Zona B' },
  { id: '3', numero_pase: 'A-0205', empleado_nombre: 'Jorge Mendoza Silva',    empleado_numero: 'EMP-003', puesto: 'Supervisor', fecha_emision: '2025-01-10', fecha_vencimiento: new Date(Date.now() - 2  * 86400000).toISOString().split('T')[0], area_acceso: 'General' },
  { id: '4', numero_pase: 'A-0210', empleado_nombre: 'Luis Hernández Ruiz',    empleado_numero: 'EMP-004', puesto: 'Técnico',    fecha_emision: '2025-02-01', fecha_vencimiento: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], area_acceso: 'Zona A' },
  { id: '5', numero_pase: 'A-0215', empleado_nombre: 'Roberto Castillo Díaz',  empleado_numero: 'EMP-005', puesto: 'Operador',   fecha_emision: '2025-02-01', fecha_vencimiento: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], area_acceso: 'Zona C' },
];

type TabId = 'empleados' | 'cuadrillas' | 'prenomina' | 'pases';

// ─── Importación masiva de Empleados (CSV/Excel) ──────────────────────────────
// Mismas reglas que POST /empleados en apps/personal/src/main.ts:74.
interface EmpleadoImportRow {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  nss: string;
  puesto: string;
  categoria: string;
  tipo_contrato: string;
  fecha_ingreso: string;
  salario_diario: string;
  telefono: string;
  email: string;
  _valido: boolean;
  _error?: string;
}

// Validación cliente-side equivalente a la del backend — solo para la vista
// previa; el backend re-valida y es la fuente de verdad del resultado.
function construirPreviewImportEmpleados(rows: Record<string, string>[]): EmpleadoImportRow[] {
  const ocurrenciasPorRfc = new Map<string, number>();
  rows.forEach(row => {
    const rfc = leerColumnaCsv(row, 'rfc');
    if (!rfc) return;
    ocurrenciasPorRfc.set(rfc, (ocurrenciasPorRfc.get(rfc) || 0) + 1);
  });

  return rows.map(row => {
    const nombre = leerColumnaCsv(row, 'nombre');
    const apellido_paterno = leerColumnaCsv(row, 'apellido_paterno');
    const apellido_materno = leerColumnaCsv(row, 'apellido_materno');
    const rfc = leerColumnaCsv(row, 'rfc');
    const curp = leerColumnaCsv(row, 'curp');
    const nss = leerColumnaCsv(row, 'nss');
    const puesto = leerColumnaCsv(row, 'puesto');
    const categoria = leerColumnaCsv(row, 'categoria');
    const tipo_contrato = leerColumnaCsv(row, 'tipo_contrato');
    const fecha_ingreso = leerColumnaCsv(row, 'fecha_ingreso');
    const salario_diario = leerColumnaCsv(row, 'salario_diario');
    const telefono = leerColumnaCsv(row, 'telefono');
    const email = leerColumnaCsv(row, 'email');

    const errores: string[] = [];
    if (!nombre) errores.push('sin nombre');
    if (!apellido_paterno) errores.push('sin apellido_paterno');
    if (!rfc) errores.push('sin rfc');
    if (!puesto) errores.push('sin puesto');
    if (!salario_diario) {
      errores.push('sin salario_diario');
    } else if (Number.isNaN(Number(salario_diario))) {
      errores.push('salario_diario no numérico');
    }
    if (rfc && (ocurrenciasPorRfc.get(rfc) || 0) > 1) {
      errores.push('RFC duplicado en el archivo');
    }

    return {
      nombre, apellido_paterno, apellido_materno, rfc, curp, nss, puesto,
      categoria, tipo_contrato, fecha_ingreso, salario_diario, telefono, email,
      _valido: errores.length === 0,
      _error: errores.length ? errores.join(', ') : undefined,
    };
  });
}

export const PersonalView: React.FC<{ activeSubView?: string }> = ({ activeSubView }) => {
  const { tenant, user } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';
  const activeTab: TabId = (activeSubView as TabId) || 'empleados';
  // Mismos roles que POST /empleados/importar-lote (apps/personal/src/main.ts).
  const puedeImportarEmpleados = (user?.role ?? []).some(r => ['personal_rh', 'admin'].includes(r));
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [prenominas, setPrenominas] = useState<PreNomina[]>([]);
  const [pases, setPases] = useState<PaseAcceso[]>([]);
  const [nominaDetalle, setNominaDetalle] = useState<{ pn: PreNomina; detalles: PreNominaDetalle[] } | null>(null);
  const [dashData, setDashData] = useState<{
    resumen: { total_empleados: number; empleados_activos: number; cuadrillas_activas: number; asignaciones_activas: number };
    asistencia_hoy: { presentes: number; ausentes: number; pct_asistencia: number };
    ultima_prenomina: { codigo: string; estado: string; total_neto: number; total_empleados: number } | null;
    alertas: Array<{ tipo: string; mensaje: string; severidad: string }>;
  } | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [generandoComplemento, setGenerandoComplemento] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configPanel, setConfigPanel] = useState<{ empleado: Empleado; config: ConfigDeducciones } | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [jornadaPanel, setJornadaPanel] = useState<{ empleado: Empleado; config: ConfigJornada } | null>(null);
  const [savingJornada, setSavingJornada] = useState(false);

  // ── Importación masiva de Empleados ───────────────────────────────────────
  const fileImportEmpleadosRef = useRef<HTMLInputElement>(null);
  const [panelImportarEmpleados, setPanelImportarEmpleados] = useState(false);
  const [archivoImportEmpleadosNombre, setArchivoImportEmpleadosNombre] = useState('');
  const [filasImportEmpleados, setFilasImportEmpleados] = useState<EmpleadoImportRow[]>([]);
  const [parseImportEmpleadosError, setParseImportEmpleadosError] = useState<string | null>(null);
  const [importandoEmpleados, setImportandoEmpleados] = useState(false);
  const [resultadoImportEmpleados, setResultadoImportEmpleados] = useState<{ creados: number; errores: { fila: number; motivo: string }[] } | null>(null);

  const handleImportEmpleadosFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setArchivoImportEmpleadosNombre(file.name);
    setParseImportEmpleadosError(null);
    setResultadoImportEmpleados(null);
    setPanelImportarEmpleados(true);

    try {
      const rows = await parseCsvOrExcelFile(file);
      setFilasImportEmpleados(construirPreviewImportEmpleados(rows));
    } catch (err: any) {
      setParseImportEmpleadosError(err.message || 'Error al leer el archivo.');
      setFilasImportEmpleados([]);
    }
  };

  const handleConfirmarImportEmpleados = async () => {
    setImportandoEmpleados(true);
    try {
      const registros = filasImportEmpleados.map(({
        nombre, apellido_paterno, apellido_materno, rfc, curp, nss, puesto,
        categoria, tipo_contrato, fecha_ingreso, salario_diario, telefono, email,
      }) => ({
        nombre, apellido_paterno, rfc, puesto,
        // Se envía tal cual (no Number() aquí): un valor no numérico
        // convertido a NaN se serializa como null en JSON, y el backend
        // lo reportaría como "obligatorio faltante" en vez de "no
        // numérico" — el backend ya valida y convierte con Number().
        salario_diario,
        ...(apellido_materno ? { apellido_materno } : {}),
        ...(curp ? { curp } : {}),
        ...(nss ? { nss } : {}),
        ...(categoria ? { categoria } : {}),
        ...(tipo_contrato ? { tipo_contrato } : {}),
        ...(fecha_ingreso ? { fecha_ingreso } : {}),
        ...(telefono ? { telefono } : {}),
        ...(email ? { email } : {}),
      }));
      const r = await api.post('/api/v1/personal/empleados/importar-lote', { registros });
      setResultadoImportEmpleados(r.data.data);
      if (r.data.data.creados > 0) {
        setEmpleados(prev => [...prev, ...r.data.data.empleados]);
      }
    } catch (err: any) {
      setParseImportEmpleadosError(err.response?.data?.error?.message || 'Error al importar el lote.');
    } finally {
      setImportandoEmpleados(false);
    }
  };

  const handleCerrarPanelImportarEmpleados = () => {
    setPanelImportarEmpleados(false);
    setArchivoImportEmpleadosNombre('');
    setFilasImportEmpleados([]);
    setParseImportEmpleadosError(null);
    setResultadoImportEmpleados(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (tenant?.id === 'iretum-demo') { setEmpleados(DEMO_EMPLEADOS as Empleado[]); setCuadrillas(DEMO_CUADRILLAS as Cuadrilla[]); setPrenominas(DEMO_PRENOMINAS as PreNomina[]); setPases(DEMO_PASES); return; }
        const [empRes, cuaRes, pnRes, pasesRes, dashRes] = await Promise.allSettled([
          api.get('/api/v1/personal/empleados'),
          api.get('/api/v1/personal/cuadrillas'),
          api.get('/api/v1/personal/prenominas'),
          api.get('/api/v1/personal/pases-acceso'),
          api.get('/api/v1/personal/dashboard'),
        ]);

        if (empRes.status === 'fulfilled') setEmpleados(empRes.value.data?.data || []);
        if (cuaRes.status === 'fulfilled') setCuadrillas(cuaRes.value.data?.data || []);
        if (pnRes.status === 'fulfilled') setPrenominas(pnRes.value.data?.data || []);
        if (pasesRes.status === 'fulfilled') setPases(pasesRes.value.data?.data || []);
        if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) setDashData(dashRes.value.data.data);
      } catch {
        setError('Error al conectar con el modulo de Personal.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      ACTIVO: 'border-green-500/20 bg-green-500/10 text-green-600',
      ACTIVA: 'border-green-500/20 bg-green-500/10 text-green-600',
      BAJA: 'border-red-500/20 bg-red-500/10 text-red-600',
      SUSPENDIDO: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
      BORRADOR: 'border-border bg-muted text-muted-foreground',
      CALCULADA: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
      AUTORIZADA: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600',
      PAGADA: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
    };

    return (
      <SectionBadge className={cn('rounded-full px-3 py-1 text-[10px]', map[estado] || '')}>
        {estado}
      </SectionBadge>
    );
  };

  const catBadge = (categoria: string) => {
    const map: Record<string, string> = {
      OBRERO: 'bg-amber-500/10 text-amber-700',
      TECNICO: 'bg-blue-500/10 text-blue-700',
      ADMINISTRATIVO: 'bg-indigo-500/10 text-indigo-700',
      SUPERVISOR: 'bg-emerald-500/10 text-emerald-700',
    };

    return (
      <SectionBadge className={cn('rounded-md px-2 py-0.5 text-[9px]', map[categoria] || 'bg-muted text-muted-foreground')}>
        {categoria}
      </SectionBadge>
    );
  };

  const pasesAlerta = pases.filter(p => diasRestantes(p.fecha_vencimiento) <= ALERTA_DIAS);
  const pasesVencidos = pases.filter(p => diasRestantes(p.fecha_vencimiento) < 0);

  const handleVerDetalle = async (pn: PreNomina) => {
    if (tenant?.id === 'iretum-demo') return;
    setLoadingDetalle(true);
    try {
      const r = await api.get(`/api/v1/personal/prenominas/${pn.id_prenomina}/detalle`);
      const d = (r.data as any)?.data;
      setNominaDetalle({ pn, detalles: d?.detalles ?? [] });
    } catch { /* silencioso */ } finally { setLoadingDetalle(false); }
  };

  const handleAbrirConfigJornada = (empleado: Empleado) => {
    setJornadaPanel({
      empleado,
      config: {
        modo_asistencia: (empleado.modo_asistencia as ConfigJornada['modo_asistencia']) ?? 'JORNADA_COMPLETA',
        tipo_jornada: (empleado.tipo_jornada as ConfigJornada['tipo_jornada']) ?? 'DIURNA',
        hora_entrada_programada: empleado.hora_entrada_programada ?? '07:00',
        hora_salida_programada: empleado.hora_salida_programada ?? '15:00',
        horas_jornada: Number(empleado.horas_jornada ?? 8),
      },
    });
  };

  const handleSaveConfigJornada = async () => {
    if (!jornadaPanel) return;
    setSavingJornada(true);
    try {
      await api.patch(`/api/v1/personal/empleados/${jornadaPanel.empleado.id_empleado}`, jornadaPanel.config);
      setEmpleados(prev => prev.map(e =>
        e.id_empleado === jornadaPanel.empleado.id_empleado
          ? { ...e, ...jornadaPanel.config }
          : e
      ));
      setJornadaPanel(null);
    } catch { /* silencioso */ } finally {
      setSavingJornada(false);
    }
  };

  const handleAbrirConfigDeducciones = async (empleado: Empleado) => {
    if (tenant?.id === 'iretum-demo') return;
    try {
      const r = await api.get(`/api/v1/personal/empleados/${empleado.id_empleado}/config-deducciones`);
      const raw = (r.data as any)?.data ?? {};
      setConfigPanel({
        empleado,
        config: {
          aplica_imss: raw.aplica_imss ?? true,
          aplica_isr: raw.aplica_isr ?? true,
          aplica_infonavit: raw.aplica_infonavit ?? false,
          infonavit_num: raw.infonavit_num ?? null,
          infonavit_monto: raw.infonavit_monto != null ? Number(raw.infonavit_monto) : null,
        },
      });
    } catch { /* silencioso */ }
  };

  const handleSaveConfigDeducciones = async () => {
    if (!configPanel) return;
    setSavingConfig(true);
    try {
      await api.put(`/api/v1/personal/empleados/${configPanel.empleado.id_empleado}/config-deducciones`, configPanel.config);
      setConfigPanel(null);
    } catch { /* silencioso */ } finally {
      setSavingConfig(false);
    }
  };

  const handleGenerarComplemento = async (pn: PreNomina) => {
    setGenerandoComplemento(true);
    try {
      await api.post('/api/v1/personal/complementos/calcular', { prenomina_id: pn.id_prenomina });
      // notify success handled below
    } catch (e: any) {
      console.warn('Complemento:', e.response?.data?.message);
    } finally { setGenerandoComplemento(false); }
  };

  // ── Exportación de prenomina ──────────────────────────────────────────────────
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
  };

  const buildPrenominaBody = (pn: PreNomina, detalles: PreNominaDetalle[]) => ({
    periodo: `${pn.codigo} (${new Date(pn.periodo_inicio).toLocaleDateString('es-MX')} – ${new Date(pn.periodo_fin).toLocaleDateString('es-MX')})`,
    empleados: detalles.map(d => ({
      nombre: d.empleado ? `${d.empleado.nombre} ${d.empleado.apellido_paterno}` : d.empleado_id.slice(0, 8),
      puesto: undefined,
      dias: d.dias_trabajados,
      salario_diario: Number(d.salario_base) / (d.dias_trabajados || 1),
      percepciones: Number(d.total_percepciones),
      imss: Number(d.deduccion_imss),
      isr: Number(d.deduccion_isr),
      otras_deducciones: Number(d.otras_deducciones),
      neto: Number(d.neto_a_pagar),
    })),
  });

  const exportarPrenominaPdf = async () => {
    if (!nominaDetalle) return;
    try {
      const body = buildPrenominaBody(nominaDetalle.pn, nominaDetalle.detalles);
      const resp = await api.post('/api/v1/reportes/prenomina-pdf', { prenomina: body }, { responseType: 'blob' });
      triggerDownload(resp.data as Blob, `${nominaDetalle.pn.codigo}.pdf`);
    } catch {
      notify({ type: 'error', title: 'Error al generar PDF', message: 'No se pudo conectar con el servicio de reportes.' });
    }
  };

  const exportarPrenominaExcel = async () => {
    if (!nominaDetalle) return;
    try {
      const body = buildPrenominaBody(nominaDetalle.pn, nominaDetalle.detalles);
      const resp = await api.post('/api/v1/reportes/prenomina-excel', { prenomina: body }, { responseType: 'blob' });
      triggerDownload(resp.data as Blob, `${nominaDetalle.pn.codigo}.xlsx`);
    } catch {
      notify({ type: 'error', title: 'Error al generar Excel', message: 'No se pudo conectar con el servicio de reportes.' });
    }
  };

  const activos = empleados.filter((empleado) => empleado.estado === 'ACTIVO').length;
  const certs = empleados.filter(
    (empleado) => empleado.certificaciones && empleado.certificaciones !== 'null'
  ).length;
  const nominaDiaria = empleados
    .filter((empleado) => empleado.estado === 'ACTIVO')
    .reduce((sum, empleado) => sum + Number(empleado.salario_diario), 0);

  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <SectionBadge className="border-violet-500/20 bg-violet-500/10 text-violet-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Recursos humanos
          </SectionBadge>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/5 bg-violet-500/10 shadow-inner">
              <IconUsers className="h-8 w-8 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                Recursos Humanos
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Recursos Humanos
                </p>
                <SectionBadge className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-600">
                  {activos} activos
                </SectionBadge>
                <SectionBadge className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
                  {certs} certificados
                </SectionBadge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'empleados' && puedeImportarEmpleados && (
            <>
              <input
                ref={fileImportEmpleadosRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImportEmpleadosFileChange}
              />
              <Button
                onClick={() => fileImportEmpleadosRef.current?.click()}
                className="rounded-2xl border border-border/60 bg-card text-xs font-black uppercase tracking-widest text-foreground shadow-sm hover:bg-muted/50"
              >
                <IconUpload className="h-4 w-4" />
                Importar CSV/Excel
              </Button>
              <button
                onClick={() => descargarPlantillaXlsx('plantilla_empleados.xlsx', [
                  { header: 'Nombre', ejemplo: 'Juan' },
                  { header: 'Apellido paterno', ejemplo: 'Pérez' },
                  { header: 'Apellido materno', ejemplo: 'García' },
                  { header: 'RFC', ejemplo: 'PEGJ900101AB1' },
                  { header: 'CURP', ejemplo: 'PEGJ900101HDFRRN01' },
                  { header: 'NSS', ejemplo: '12345678901' },
                  { header: 'Puesto', ejemplo: 'Albañil' },
                  { header: 'Categoría', ejemplo: 'Obra' },
                  { header: 'Tipo de contrato', ejemplo: 'PLANTA' },
                  { header: 'Fecha de ingreso', ejemplo: '2026-01-15' },
                  { header: 'Salario diario', ejemplo: '450.00' },
                  { header: 'Teléfono', ejemplo: '5512345678' },
                  { header: 'Email', ejemplo: 'juan.perez@ejemplo.com' },
                ])}
                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground shadow-sm hover:bg-muted/50"
              >
                <IconDownload className="h-4 w-4" />
                Descargar plantilla
              </button>
            </>
          )}
          <Button className="rounded-2xl bg-violet-600 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-violet-600/20 hover:bg-violet-500">
            <IconPlus className="h-4 w-4" />
            {activeTab === 'empleados'
              ? 'Nuevo Empleado'
              : activeTab === 'cuadrillas'
                ? 'Nueva Cuadrilla'
                : 'Calcular Nomina'}
          </Button>
        </div>
      </div>

      {/* ── Banner de alertas de pases ── */}
      {pasesAlerta.length > 0 && (
        <div
          className="w-full rounded-2xl border text-left"
          style={{
            borderColor: pasesVencidos.length > 0 ? 'hsl(0 72% 51% / 0.3)' : 'hsl(38 92% 50% / 0.3)',
            background: pasesVencidos.length > 0 ? 'hsl(0 72% 51% / 0.06)' : 'hsl(38 92% 50% / 0.06)',
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${pasesVencidos.length > 0 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <IconAlertCircle className={`h-4 w-4 ${pasesVencidos.length > 0 ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black uppercase tracking-wide ${pasesVencidos.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                {pasesVencidos.length > 0
                  ? `${pasesVencidos.length} pase${pasesVencidos.length > 1 ? 's' : ''} VENCIDO${pasesVencidos.length > 1 ? 'S' : ''} — Acceso bloqueado`
                  : `${pasesAlerta.length} pase${pasesAlerta.length > 1 ? 's' : ''} por vencer en menos de ${ALERTA_DIAS} días`
                }
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {pasesAlerta.map(p => p.empleado_nombre.split(' ')[0]).join(', ')} — Ver en «Pases de Acceso»
              </p>
            </div>
            <IconShieldCheck className={`h-4 w-4 shrink-0 ${pasesVencidos.length > 0 ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
        </div>
      )}


      {/* ── Dashboard KPIs ───────────────────────────────────────────────────── */}
      {dashData && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="rounded-2xl border-border/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empleados Activos</p>
              <p className="mt-1 text-3xl font-black text-foreground">{dashData.resumen.empleados_activos}</p>
              <p className="text-[10px] text-muted-foreground">de {dashData.resumen.total_empleados} en plantilla</p>
            </Card>
            <Card className={`rounded-2xl border p-4 ${dashData.asistencia_hoy.pct_asistencia < 70 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border/30'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asistencia Hoy</p>
              <p className={`mt-1 text-3xl font-black ${dashData.asistencia_hoy.pct_asistencia < 70 ? 'text-amber-700' : 'text-foreground'}`}>
                {dashData.asistencia_hoy.pct_asistencia}%
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${dashData.asistencia_hoy.pct_asistencia}%` }} />
              </div>
            </Card>
            <Card className="rounded-2xl border-border/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Presentes Hoy</p>
              <p className="mt-1 text-3xl font-black text-emerald-600">{dashData.asistencia_hoy.presentes}</p>
              <p className="text-[10px] text-muted-foreground">{dashData.asistencia_hoy.ausentes} ausentes</p>
            </Card>
            {dashData.ultima_prenomina ? (
              <Card className={`rounded-2xl border p-4 ${dashData.ultima_prenomina.estado === 'PENDIENTE' ? 'border-amber-500/20 bg-amber-500/5' : 'border-border/30'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Última Nómina</p>
                <p className={`mt-1 text-sm font-black ${dashData.ultima_prenomina.estado === 'PENDIENTE' ? 'text-amber-700' : 'text-foreground'}`}>
                  {dashData.ultima_prenomina.codigo}
                </p>
                <p className="text-[10px] text-muted-foreground">{dashData.ultima_prenomina.estado} · {dashData.ultima_prenomina.total_empleados} emp.</p>
              </Card>
            ) : (
              <Card className="rounded-2xl border-border/30 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Última Nómina</p>
                <p className="mt-1 text-sm font-black text-muted-foreground">Sin pre-nóminas</p>
              </Card>
            )}
          </div>

          {dashData.alertas.length > 0 && (
            <div className="space-y-2">
              {dashData.alertas.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${a.severidad === 'critica' ? 'border-red-500/30 bg-red-500/5 text-red-700' : 'border-amber-500/30 bg-amber-500/5 text-amber-700'}`}>
                  <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-bold">{a.mensaje}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <Card className="border-border/40">
          <CardContent className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/10 border-t-violet-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Cargando plantilla...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 p-12 text-center">
            <IconAlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-destructive">
              Modulo Offline
            </h3>
            <p className="text-xs font-medium text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeTab === 'empleados' && (
            <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
              <TableContainer>
                <Table className="min-w-[840px]">
                  <TableHeader>
                    <tr>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Cuadrilla</TableHead>
                      <TableHead className="text-right">S. Diario</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Config.</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {empleados.map((empleado) => (
                      <TableRow key={empleado.id_empleado} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-xs font-black text-violet-600">
                              {empleado.nombre.charAt(0)}
                              {empleado.apellido_paterno.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground">
                                {empleado.nombre} {empleado.apellido_paterno}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                {empleado.numero_empleado}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground/80">
                          {empleado.puesto}
                        </TableCell>
                        <TableCell>{catBadge(empleado.categoria)}</TableCell>
                        <TableCell>
                          {empleado.cuadrilla ? (
                            <SectionBadge className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                              {empleado.cuadrilla.codigo}
                            </SectionBadge>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground/50">
                              Sin asignar
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold text-foreground">
                          {formatCurrency(Number(empleado.salario_diario))}
                        </TableCell>
                        <TableCell className="text-center">{estadoBadge(empleado.estado)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-0.5 items-center">
                            <button
                              onClick={() => handleAbrirConfigJornada(empleado)}
                              className="text-[9px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-700 hover:underline"
                              title="Configurar jornada laboral"
                            >
                              Jornada
                            </button>
                            <button
                              onClick={() => handleAbrirConfigDeducciones(empleado)}
                              className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 hover:underline"
                              title="Configurar deducciones IMSS/ISR/INFONAVIT"
                            >
                              Deducciones
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {empleados.length > 0 ? (
                <TableFooterBar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {empleados.length} empleados registrados
                  </span>
                  <SectionBadge className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] text-violet-600">
                    Nomina diaria: {formatCurrency(nominaDiaria)}
                  </SectionBadge>
                </TableFooterBar>
              ) : null}
            </Card>
          )}

          {activeTab === 'cuadrillas' && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cuadrillas.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-3">
                  <EmptyStatePanel
                    icon={<IconUsers className="h-12 w-12 text-muted-foreground/20" />}
                    title="Sin cuadrillas registradas"
                  />
                </div>
              ) : (
                cuadrillas.map((cuadrilla) => (
                  <Card
                    key={cuadrilla.id_cuadrilla}
                    className="group relative overflow-hidden border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 opacity-50" />
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                            {cuadrilla.codigo}
                          </span>
                          <h3 className="mt-0.5 text-sm font-bold text-foreground">
                            {cuadrilla.nombre}
                          </h3>
                        </div>
                        {estadoBadge(cuadrilla.estado)}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <IconBriefcase className="h-3.5 w-3.5" />
                          <span>{cuadrilla.especialidad}</span>
                        </div>
                        {cuadrilla.capataz_nombre ? (
                          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                            <IconShieldCheck className="h-3.5 w-3.5" />
                            <span>
                              Capataz:{' '}
                              <strong className="text-foreground">{cuadrilla.capataz_nombre}</strong>
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                          <IconUsers className="h-3.5 w-3.5" />
                          <span>
                            <strong className="text-base text-foreground">
                              {cuadrilla._count?.miembros || 0}
                            </strong>{' '}
                            miembros
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'pases' && (
            <Card className="overflow-hidden rounded-3xl border-border/40 shadow-xl">
              <TableContainer>
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <tr>
                      <TableHead># Pase</TableHead>
                      <TableHead>Trabajador</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead className="text-center">Vencimiento</TableHead>
                      <TableHead className="text-center">Días Restantes</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {pases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <IconShieldCheck className="h-12 w-12 text-muted-foreground opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                              Sin pases registrados
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...pases]
                        .sort((a, b) => diasRestantes(a.fecha_vencimiento) - diasRestantes(b.fecha_vencimiento))
                        .map((pase) => {
                          const dias = diasRestantes(pase.fecha_vencimiento);
                          const urgencia = urgenciaPase(dias);
                          return (
                            <TableRow key={pase.id} className="group">
                              <TableCell>
                                <span className="font-mono font-black text-sm text-violet-600">{pase.numero_pase}</span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm font-bold text-foreground">{pase.empleado_nombre}</div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{pase.empleado_numero}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium text-muted-foreground">{pase.puesto}</TableCell>
                              <TableCell>
                                <SectionBadge className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                                  {pase.area_acceso || '—'}
                                </SectionBadge>
                              </TableCell>
                              <TableCell className="text-center text-sm font-bold text-foreground">
                                {new Date(pase.fecha_vencimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-mono font-black text-sm ${dias < 0 ? 'text-red-600' : dias <= 7 ? 'text-orange-600' : dias <= ALERTA_DIAS ? 'text-amber-600' : 'text-green-600'}`}>
                                  {dias < 0 ? `−${Math.abs(dias)}` : dias} días
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <SectionBadge className={cn('rounded-full border px-3 py-1 text-[10px] font-black', urgencia.className)}>
                                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', urgencia.dot)} />
                                  {urgencia.label}
                                </SectionBadge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {pases.length > 0 && (
                <TableFooterBar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {pases.length} pases registrados
                  </span>
                  <div className="flex items-center gap-3">
                    {pasesVencidos.length > 0 && (
                      <SectionBadge className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] text-red-600">
                        {pasesVencidos.length} vencidos
                      </SectionBadge>
                    )}
                    {pasesAlerta.filter(p => diasRestantes(p.fecha_vencimiento) >= 0).length > 0 && (
                      <SectionBadge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] text-amber-600">
                        {pasesAlerta.filter(p => diasRestantes(p.fecha_vencimiento) >= 0).length} por vencer
                      </SectionBadge>
                    )}
                  </div>
                </TableFooterBar>
              )}
            </Card>
          )}

          {activeTab === 'prenomina' && (
            <div className="space-y-4">
              {prenominas.length === 0 ? (
                <EmptyStatePanel
                  icon={<IconWallet className="h-12 w-12 text-muted-foreground/20" />}
                  title="Sin pre-nominas"
                  description='Usa el boton "Calcular Nomina" para generar la primera.'
                />
              ) : (
                prenominas.map((prenomina) => (
                  <Card
                    key={prenomina.id_prenomina}
                    className="group relative overflow-hidden border-border/40 transition-all hover:shadow-xl"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500 opacity-50" />
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-3">
                            <span className="text-xl font-black tracking-tighter text-violet-600">
                              {prenomina.codigo}
                            </span>
                            {estadoBadge(prenomina.estado)}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconClock className="h-3.5 w-3.5" />
                              {prenomina.periodo_tipo}
                            </span>
                            <span>
                              {new Date(prenomina.periodo_inicio).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                              })}{' '}
                              -{' '}
                              {new Date(prenomina.periodo_fin).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconUsers className="h-3.5 w-3.5" />
                              {prenomina.total_empleados} empleados
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black tracking-tighter text-foreground">
                            {formatCurrency(Number(prenomina.total_neto))}
                          </div>
                          <p className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                            NETO A PAGAR
                          </p>
                        </div>
                      </div>
                      {prenomina.requiere_recalculo && (
                        <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                            ⚠ Requiere recálculo — tasas desactualizadas
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleVerDetalle(prenomina)}
                        className="mt-2 w-full rounded-lg border border-border/40 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/40 transition-colors"
                      >
                        Ver desglose por empleado →
                      </button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
      {/* ── Importación masiva de Empleados (CSV/Excel) ─────────────────────── */}
      <SlidePanel
        isOpen={panelImportarEmpleados}
        onClose={handleCerrarPanelImportarEmpleados}
        title={resultadoImportEmpleados ? 'Resultado de la importación' : 'Vista previa — Importación de Empleados'}
        subtitle={archivoImportEmpleadosNombre}
        accentColor="violet"
        maxWidthClassName="max-w-4xl"
      >
        <div className="space-y-6 pb-28">
          {parseImportEmpleadosError ? (
            <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 flex gap-3">
              <IconAlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-destructive">{parseImportEmpleadosError}</p>
            </div>
          ) : resultadoImportEmpleados ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{resultadoImportEmpleados.creados}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Empleados creados</p>
                </div>
                <div className={cn('rounded-2xl p-4 text-center border', resultadoImportEmpleados.errores.length > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                  <p className={cn('text-2xl font-black', resultadoImportEmpleados.errores.length > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{resultadoImportEmpleados.errores.length}</p>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', resultadoImportEmpleados.errores.length > 0 ? 'text-amber-600/70' : 'text-muted-foreground')}>Filas con error</p>
                </div>
              </div>

              {resultadoImportEmpleados.errores.length > 0 && (
                <div className="rounded-2xl border border-border/40 overflow-hidden">
                  <TableScrollShadow className="max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                        <tr className="border-b border-border/40">
                          <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fila</th>
                          <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Motivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {resultadoImportEmpleados.errores.map((e, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 font-black text-amber-600">{e.fila}</td>
                            <td className="px-4 py-2.5 text-foreground">{e.motivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableScrollShadow>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{filasImportEmpleados.filter(f => f._valido).length}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mt-1">Listos para importar</p>
                </div>
                <div className={cn('rounded-2xl p-4 text-center border', filasImportEmpleados.some(f => !f._valido) ? 'bg-amber-500/10 border-amber-500/20' : 'bg-muted/30 border-border/30')}>
                  <p className={cn('text-2xl font-black', filasImportEmpleados.some(f => !f._valido) ? 'text-amber-600' : 'text-muted-foreground')}>{filasImportEmpleados.filter(f => !f._valido).length}</p>
                  <p className={cn('text-[9px] font-black uppercase tracking-widest mt-1', filasImportEmpleados.some(f => !f._valido) ? 'text-amber-600/70' : 'text-muted-foreground')}>Con error</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 overflow-hidden">
                <TableScrollShadow className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                      <tr className="border-b border-border/40">
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estado</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">RFC</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nombre</th>
                        <th className="px-4 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Puesto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filasImportEmpleados.map((row, i) => (
                        <tr key={i} className={cn('transition-colors', row._valido ? 'hover:bg-emerald-500/[0.03]' : 'bg-amber-500/5 opacity-60')}>
                          <td className="px-4 py-2.5 text-center">
                            {row._valido
                              ? <IconCheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                              : <span className="text-[9px] text-amber-600 font-bold" title={row._error}>error</span>
                            }
                          </td>
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.rfc || '—'}</td>
                          <td className="px-4 py-2.5 font-bold text-foreground">{row.nombre} {row.apellido_paterno}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.puesto || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollShadow>
              </div>
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-card/95 backdrop-blur border-t border-border/40 flex items-center justify-end gap-3">
          {resultadoImportEmpleados || parseImportEmpleadosError ? (
            <button
              onClick={handleCerrarPanelImportarEmpleados}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                onClick={handleCerrarPanelImportarEmpleados}
                className="px-5 py-2.5 rounded-xl border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarImportEmpleados}
                disabled={importandoEmpleados || filasImportEmpleados.length === 0}
                className="px-6 py-3 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {importandoEmpleados ? 'Importando...' : `Importar ${filasImportEmpleados.length} registro${filasImportEmpleados.length === 1 ? '' : 's'}`}
              </button>
            </>
          )}
        </div>
      </SlidePanel>

      {/* ── Panel Config. Jornada ───────────────────────────────────────────── */}
      <SlidePanel
        isOpen={!!jornadaPanel}
        onClose={() => setJornadaPanel(null)}
        title={jornadaPanel ? `Jornada — ${jornadaPanel.empleado.nombre} ${jornadaPanel.empleado.apellido_paterno}` : ''}
        subtitle={jornadaPanel?.empleado.puesto}
        accentColor="violet"
      >
        {jornadaPanel && (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Define cómo se registra y calcula la asistencia de este empleado.
            </p>

            {/* Modo de asistencia */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modo de asistencia</label>
              <div className="flex gap-2">
                {(['JORNADA_COMPLETA', 'POR_HORAS'] as const).map(modo => (
                  <button
                    key={modo}
                    onClick={() => setJornadaPanel(prev => prev ? { ...prev, config: { ...prev.config, modo_asistencia: modo } } : prev)}
                    className={cn(
                      'flex-1 rounded-xl border py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors',
                      jornadaPanel.config.modo_asistencia === modo
                        ? 'border-violet-500 bg-violet-500/10 text-violet-700'
                        : 'border-border/40 text-muted-foreground hover:bg-muted/40'
                    )}
                  >
                    {modo === 'JORNADA_COMPLETA' ? 'Jornada Completa' : 'Por Horas'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {jornadaPanel.config.modo_asistencia === 'JORNADA_COMPLETA'
                  ? 'Pago por día completo. Solo registra Presente/Ausente.'
                  : 'Registra hora de entrada y salida. Calcula HE automáticamente.'}
              </p>
            </div>

            {/* Tipo de jornada (siempre visible) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de jornada</label>
              <select
                value={jornadaPanel.config.tipo_jornada}
                onChange={e => setJornadaPanel(prev => prev ? { ...prev, config: { ...prev.config, tipo_jornada: e.target.value as ConfigJornada['tipo_jornada'] } } : prev)}
                className="w-full rounded-xl border border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="DIURNA">Diurna (06:00–20:00)</option>
                <option value="NOCTURNA">Nocturna (20:00–06:00)</option>
                <option value="MIXTA">Mixta</option>
              </select>
            </div>

            {/* Campos POR_HORAS */}
            {jornadaPanel.config.modo_asistencia === 'POR_HORAS' && (
              <div className="space-y-4 rounded-xl border border-border/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horario programado</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Hora de entrada</label>
                    <input
                      type="time"
                      value={jornadaPanel.config.hora_entrada_programada}
                      onChange={e => setJornadaPanel(prev => prev ? { ...prev, config: { ...prev.config, hora_entrada_programada: e.target.value } } : prev)}
                      className="w-full rounded-lg border border-border/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Hora de salida</label>
                    <input
                      type="time"
                      value={jornadaPanel.config.hora_salida_programada}
                      onChange={e => setJornadaPanel(prev => prev ? { ...prev, config: { ...prev.config, hora_salida_programada: e.target.value } } : prev)}
                      className="w-full rounded-lg border border-border/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">Horas de jornada normal</label>
                  <input
                    type="number"
                    min="1" max="24" step="0.5"
                    value={jornadaPanel.config.horas_jornada}
                    onChange={e => setJornadaPanel(prev => prev ? { ...prev, config: { ...prev.config, horas_jornada: parseFloat(e.target.value) || 8 } } : prev)}
                    className="w-full rounded-lg border border-border/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Horas extra calculadas a partir de este umbral. Tarifa: ${jornadaPanel.empleado.salario_diario} ÷ {jornadaPanel.config.horas_jornada}h = ${(Number(jornadaPanel.empleado.salario_diario) / jornadaPanel.config.horas_jornada).toFixed(2)}/h
                  </p>
                </div>
              </div>
            )}

            <SubmitButton
              label={savingJornada ? 'Guardando…' : 'Guardar configuración'}
              loading={savingJornada}
              color="violet"
              onClick={handleSaveConfigJornada}
            />
          </div>
        )}
      </SlidePanel>

      {/* ── Panel Config. Deducciones ───────────────────────────────────────── */}
      <SlidePanel
        isOpen={!!configPanel}
        onClose={() => setConfigPanel(null)}
        title={configPanel ? `Deducciones — ${configPanel.empleado.nombre} ${configPanel.empleado.apellido_paterno}` : ''}
        subtitle={configPanel?.empleado.puesto}
        accentColor="indigo"
      >
        {configPanel && (
          <div className="space-y-6">
            <p className="text-xs text-muted-foreground">
              Configura qué deducciones aplican a este empleado. Los cambios afectan el próximo cálculo de pre-nómina.
            </p>
            <div className="space-y-4">
              {/* IMSS */}
              <div className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-foreground">IMSS</p>
                  <p className="text-[10px] text-muted-foreground">Cuotas obreras: Enf. Mat. · Inv. Vida · CEV</p>
                </div>
                <button
                  onClick={() => setConfigPanel(prev => prev ? { ...prev, config: { ...prev.config, aplica_imss: !prev.config.aplica_imss } } : prev)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    configPanel.config.aplica_imss ? 'bg-indigo-600' : 'bg-muted'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    configPanel.config.aplica_imss ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
              {/* ISR */}
              <div className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-foreground">ISR</p>
                  <p className="text-[10px] text-muted-foreground">Impuesto Sobre la Renta (Art. 96 LISR)</p>
                </div>
                <button
                  onClick={() => setConfigPanel(prev => prev ? { ...prev, config: { ...prev.config, aplica_isr: !prev.config.aplica_isr } } : prev)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    configPanel.config.aplica_isr ? 'bg-indigo-600' : 'bg-muted'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    configPanel.config.aplica_isr ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
              {/* INFONAVIT */}
              <div className="rounded-xl border border-border/40 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">INFONAVIT</p>
                    <p className="text-[10px] text-muted-foreground">Descuento por crédito hipotecario</p>
                  </div>
                  <button
                    onClick={() => setConfigPanel(prev => prev ? {
                      ...prev,
                      config: { ...prev.config, aplica_infonavit: !prev.config.aplica_infonavit, infonavit_num: null, infonavit_monto: null }
                    } : prev)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      configPanel.config.aplica_infonavit ? 'bg-indigo-600' : 'bg-muted'
                    )}
                  >
                    <span className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      configPanel.config.aplica_infonavit ? 'translate-x-6' : 'translate-x-1'
                    )} />
                  </button>
                </div>
                {configPanel.config.aplica_infonavit && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Número de crédito</label>
                      <input
                        type="text"
                        value={configPanel.config.infonavit_num ?? ''}
                        onChange={e => setConfigPanel(prev => prev ? { ...prev, config: { ...prev.config, infonavit_num: e.target.value } } : prev)}
                        className="mt-1 w-full rounded-lg border border-border/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ej. 1234567890"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monto por período ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={configPanel.config.infonavit_monto ?? ''}
                        onChange={e => setConfigPanel(prev => prev ? { ...prev, config: { ...prev.config, infonavit_monto: parseFloat(e.target.value) || null } } : prev)}
                        className="mt-1 w-full rounded-lg border border-border/40 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <SubmitButton
              label={savingConfig ? 'Guardando…' : 'Guardar configuración'}
              loading={savingConfig}
              color="indigo"
              onClick={handleSaveConfigDeducciones}
            />
          </div>
        )}
      </SlidePanel>

      {/* ── Modal Detalle de Pre-Nómina ─────────────────────────────────────── */}
      {nominaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border/40 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tighter">Desglose — {nominaDetalle.pn.codigo}</h3>
                <p className="text-[10px] text-muted-foreground">{nominaDetalle.detalles.length} empleados · {nominaDetalle.pn.periodo_tipo}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerarComplemento(nominaDetalle.pn)}
                  disabled={generandoComplemento}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {generandoComplemento ? 'Generando…' : 'Generar Complemento Salarial'}
                </button>
                {nominaDetalle.detalles.length > 0 && !isDemo && (
                  <>
                    <button
                      onClick={exportarPrenominaPdf}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted"
                      title="Descargar pre-nómina como PDF"
                    >
                      <IconDownload className="h-3 w-3" />PDF
                    </button>
                    <button
                      onClick={exportarPrenominaExcel}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted"
                      title="Descargar pre-nómina como Excel"
                    >
                      <IconDownload className="h-3 w-3" />Excel
                    </button>
                  </>
                )}
                <button onClick={() => setNominaDetalle(null)} className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase text-muted-foreground hover:bg-muted">
                  Cerrar
                </button>
              </div>
            </div>
            {loadingDetalle ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500/10 border-t-violet-600" />
              </div>
            ) : (
              <TableScrollShadow>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/30">
                      {['Empleado', 'Origen', 'Días / Hrs', 'HE Doble', 'HE Triple', 'Sueldo Base', 'H.Extra', 'IMSS', 'ISR', 'Otro', 'Percepciones', 'Deducciones', 'Neto'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nominaDetalle.detalles.map((d) => (
                      <tr key={d.id_detalle} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium">
                          {d.empleado ? `${d.empleado.nombre} ${d.empleado.apellido_paterno}` : d.empleado_id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-0.5">
                            <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-black', d.origen_dias === 'ASISTENCIA' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700')}>
                              {d.origen_dias}
                            </span>
                            {d.origen_horas && d.origen_horas === 'ESTIMADO' && (
                              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-600">ESTIMADO</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {d.horas_normales != null
                            ? <span>{d.horas_normales}h</span>
                            : d.dias_trabajados
                          }
                        </td>
                        <td className="px-3 py-2 text-right text-violet-700">
                          {d.monto_he_doble ? `$${d.monto_he_doble.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-violet-700">
                          {d.monto_he_triple ? `$${d.monto_he_triple.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">${d.salario_base.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right">${d.monto_horas_extra.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-red-600">${d.deduccion_imss.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-red-600">${d.deduccion_isr.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-red-600">${d.otras_deducciones.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-semibold">${d.total_percepciones.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right text-red-600 font-semibold">${d.total_deducciones.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-black text-emerald-700">${d.neto_a_pagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScrollShadow>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

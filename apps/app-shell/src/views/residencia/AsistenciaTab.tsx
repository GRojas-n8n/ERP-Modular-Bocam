import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import api from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { useNotification } from '../../context/NotificationContext';
import { DEMO_ASISTENCIA, DEMO_CUADRILLAS } from '../../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmCriticalActionDialog,
  EmptyStatePanel,
  FormField,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  getProjectColor,
} from '@bocam/ui-core';
import { IconQrCode } from '../../components/Icons';
import { fmtDate, Modal } from './shared';

type AsistenciaEstado = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADA' | 'INCAPACIDAD';

interface RegistroAsistencia {
  id: string;
  id_registro?: string;
  empleado_id: string;
  fecha: string;
  cuadrilla_id: string | null;
  cuadrilla_nombre: string;
  empleado_nombre: string;
  puesto: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  horas_normales: number | null;
  horas_extra_dia: number | null;
  origen_horas: string;
  estado: AsistenciaEstado;
  tipo_registro: 'QR' | 'MANUAL' | null;
  horas_extra?: number;
  modo_asistencia?: string;
}

interface CuadrillaReal {
  id_cuadrilla: string;
  nombre: string;
  codigo: string;
  miembros: { id_empleado: string; nombre: string; apellido_paterno: string; puesto: string; modo_asistencia?: string; hora_salida_programada?: string | null }[];
}

interface BulkCheck {
  empleado_id: string;
  nombre: string;
  puesto: string;
  modo_asistencia: string;
  estado: 'PRESENTE' | 'AUSENTE';
  horas_extra: string;
  hora_entrada: string;
  hora_salida: string;
}

const ASIS_BADGE: Record<AsistenciaEstado, { cls: string; label: string }> = {
  PRESENTE:    { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Presente'   },
  AUSENTE:     { cls: 'bg-red-500/10 text-red-600',         label: 'Ausente'    },
  JUSTIFICADA: { cls: 'bg-amber-500/10 text-amber-600',     label: 'Justificada'},
  INCAPACIDAD: { cls: 'bg-sky-500/10 text-sky-600',         label: 'Incapacidad'},
};

/**
 * Tab "Asistencia" de Residencia de Obra — control QR y registro manual —
 * ver openspec/changes/split-residencia-view-tabs.
 */
export const AsistenciaTab: React.FC<{ active: boolean }> = ({ active }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';
  const currentProjectName = user?.projects?.find(p => p.id === currentProjectId)?.name || 'proyecto activo';
  const currentProjectColor = getProjectColor(currentProjectId);

  const [asistencia, setAsistencia] = useState<RegistroAsistencia[]>([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().slice(0, 10));
  const [cuadrillaFiltro, setCuadrillaFiltro] = useState('all');
  const [cuadrillas, setCuadrillas] = useState<CuadrillaReal[]>([]);
  const [qrModal, setQrModal] = useState<{ id: string; nombre: string } | null>(null);
  const [bulkChecks, setBulkChecks] = useState<BulkCheck[]>([]);
  const [guardandoBulk, setGuardandoBulk] = useState(false);
  const [confirmGuardarBulk, setConfirmGuardarBulk] = useState(false);

  // ─ Escaneo real de credencial (cámara) ──────────────────────────────────────
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);
  const scanStreamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  useEffect(() => {
    if (isDemo) setAsistencia(DEMO_ASISTENCIA as RegistroAsistencia[]);
  }, [isDemo]);

  // ── Carga de asistencia + cuadrillas cuando se activa el tab ────────────
  useEffect(() => {
    if (!active || isDemo) return;
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const hace7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const fetchAsistencia = async () => {
      try {
        const [asisRes, cuaRes] = await Promise.allSettled([
          api.get('/api/v1/personal/asistencia', { params: { fecha_inicio: hace7, fecha_fin: fechaHoy } }),
          api.get('/api/v1/personal/cuadrillas'),
        ]);
        if (asisRes.status === 'fulfilled') setAsistencia((asisRes.value.data as any)?.data ?? []);
        if (cuaRes.status === 'fulfilled') setCuadrillas((cuaRes.value.data as any)?.data ?? []);
      } catch { /* silencioso */ }
    };
    void fetchAsistencia();
  }, [active, isDemo]);

  const asistenciaFiltrada = asistencia.filter(a =>
    a.fecha === fechaFiltro && (cuadrillaFiltro === 'all' || a.cuadrilla_id === cuadrillaFiltro)
  );
  const kpiAsistencia = {
    presentes: asistenciaFiltrada.filter(a => a.estado === 'PRESENTE').length,
    ausentes: asistenciaFiltrada.filter(a => a.estado === 'AUSENTE').length,
    incapacidades: asistenciaFiltrada.filter(a => a.estado === 'INCAPACIDAD' || a.estado === 'JUSTIFICADA').length,
  };

  const handleRegistrarManual = async (registro: RegistroAsistencia) => {
    const nuevoEstado: AsistenciaEstado = registro.estado === 'AUSENTE' ? 'PRESENTE' : 'AUSENTE';
    // Actualizar UI optimista
    setAsistencia(prev => prev.map(a =>
      a.id === registro.id
        ? { ...a, estado: nuevoEstado, hora_entrada: nuevoEstado === 'PRESENTE' ? new Date().toTimeString().slice(0, 5) : null, tipo_registro: 'MANUAL' }
        : a
    ));
    if (!isDemo) {
      try {
        await api.post('/api/v1/personal/asistencia/registro', {
          empleado_id: registro.empleado_id ?? registro.id,
          fecha: fechaFiltro || new Date().toISOString().slice(0, 10),
          estado: nuevoEstado,
          tipo_registro: 'MANUAL',
        });
      } catch { /* silencioso — UI ya actualizada */ }
    }
    if (nuevoEstado === 'PRESENTE') {
      notify({ type: 'success', title: 'Asistencia registrada', message: `${registro.empleado_nombre} — registro manual` });
    }
  };

  const handleAbrirManualQR = (cuadrilla: CuadrillaReal) => {
    const horaDefEntrada = new Date().toTimeString().slice(0, 5);
    const checks: BulkCheck[] = cuadrilla.miembros
      .filter(m => m)
      .map(m => ({
        empleado_id: m.id_empleado,
        nombre: `${m.nombre} ${m.apellido_paterno}`,
        puesto: m.puesto,
        modo_asistencia: m.modo_asistencia ?? 'JORNADA_COMPLETA',
        estado: 'PRESENTE',
        horas_extra: '0',
        hora_entrada: horaDefEntrada,
        hora_salida: m.hora_salida_programada ?? '',
      }));
    setBulkChecks(checks);
    setQrModal({ id: cuadrilla.id_cuadrilla, nombre: cuadrilla.nombre });
  };

  // ── Escaneo real de credencial (cámara) ──────────────────────────────────────
  const detenerCamara = () => {
    if (scanLoopRef.current) { cancelAnimationFrame(scanLoopRef.current); scanLoopRef.current = null; }
    if (scanStreamRef.current) { scanStreamRef.current.getTracks().forEach(t => t.stop()); scanStreamRef.current = null; }
  };

  const handleCerrarScanner = () => {
    detenerCamara();
    setScanModalOpen(false);
    setScanResult(null);
  };

  const obtenerUbicacion = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 4000 }
      );
    });

  const procesarTokenEscaneado = async (token: string) => {
    detenerCamara();
    setScanBusy(true);
    try {
      const ubicacion = await obtenerUbicacion();
      const r = await api.post('/api/v1/personal/asistencia/escanear', {
        token, lat: ubicacion?.lat, lng: ubicacion?.lng,
      });
      const registro = (r.data as any)?.data;
      const esSalida = !!registro?.hora_salida;
      setScanResult({ ok: true, mensaje: esSalida ? 'Salida registrada' : 'Entrada registrada' });
    } catch (e: any) {
      setScanResult({ ok: false, mensaje: e.response?.data?.error?.message || 'No se pudo registrar la asistencia' });
    } finally {
      setScanBusy(false);
    }
  };

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      scanStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const tick = () => {
        const video = videoRef.current;
        const canvas = scanCanvasRef.current;
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code?.data?.startsWith('BOCAM:CRED:')) {
              void procesarTokenEscaneado(code.data.slice('BOCAM:CRED:'.length));
              return;
            }
          }
        }
        scanLoopRef.current = requestAnimationFrame(tick);
      };
      scanLoopRef.current = requestAnimationFrame(tick);
    } catch {
      setScanResult({ ok: false, mensaje: 'No se pudo acceder a la cámara. Revisa los permisos del navegador.' });
    }
  };

  const reiniciarScanner = () => {
    setScanResult(null);
    void iniciarCamara();
  };

  useEffect(() => {
    if (scanModalOpen) void iniciarCamara();
    return () => detenerCamara();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanModalOpen]);

  const handleGuardarBulk = () => {
    if (!qrModal || bulkChecks.length === 0) return;
    setConfirmGuardarBulk(true);
  };

  const guardarBulk = async () => {
    setConfirmGuardarBulk(false);
    if (!qrModal || bulkChecks.length === 0) return;
    setGuardandoBulk(true);
    try {
      await api.post('/api/v1/personal/asistencia/bulk', {
        fecha: fechaFiltro,
        cuadrilla_id: qrModal.id,
        registros: bulkChecks.map(b => {
          if (b.modo_asistencia === 'POR_HORAS') {
            return {
              empleado_id: b.empleado_id,
              hora_entrada: b.hora_entrada || undefined,
              hora_salida: b.hora_salida  || undefined,
            };
          }
          return {
            empleado_id: b.empleado_id,
            estado: b.estado,
            horas_extra: parseFloat(b.horas_extra) || 0,
          };
        }),
      });
      // Refrescar asistencia del día
      const r = await api.get('/api/v1/personal/asistencia', {
        params: { fecha_inicio: fechaFiltro, fecha_fin: fechaFiltro, cuadrilla_id: qrModal.id },
      });
      setAsistencia(prev => {
        const nuevos: RegistroAsistencia[] = (r.data as any)?.data ?? [];
        const otrosDias = prev.filter(a => a.fecha !== fechaFiltro || a.cuadrilla_id !== qrModal.id);
        return [...otrosDias, ...nuevos];
      });
      notify({ type: 'success', title: 'Asistencia registrada', message: `${bulkChecks.length} empleados · ${fechaFiltro}` });
      setQrModal(null);
    } catch (e: any) {
      notify({ type: 'error', title: 'Error al guardar asistencia', message: e.response?.data?.message || e.message });
    } finally {
      setGuardandoBulk(false);
    }
  };

  return (
    <>
      {active && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Presentes',     value: kpiAsistencia.presentes,     sub: 'hoy',             cls: 'text-emerald-600' },
            { label: 'Ausentes',      value: kpiAsistencia.ausentes,       sub: 'sin justificar',  cls: 'text-red-500'     },
            { label: 'Incapacidades', value: kpiAsistencia.incapacidades,  sub: 'con justificante', cls: 'text-sky-600'    },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className={cn('mt-1 text-xl font-black', k.cls)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {active && (
        <div className="flex flex-col gap-4">
          {/* Controles */}
          <Card>
            <CardContent className="flex flex-wrap items-end gap-4 pt-4 pb-4 px-4">
              <FormField label="Fecha">
                <Input
                  type="date"
                  value={fechaFiltro}
                  onChange={e => setFechaFiltro(e.target.value)}
                  className="w-44"
                />
              </FormField>
              <FormField label="Cuadrilla">
                <Select value={cuadrillaFiltro} onChange={e => setCuadrillaFiltro(e.target.value)} className="w-56">
                  <option value="all">Todas las cuadrillas</option>
                  {(isDemo ? DEMO_CUADRILLAS : cuadrillas).map(c => (
                    <option key={c.id_cuadrilla} value={c.id_cuadrilla}>{c.nombre}</option>
                  ))}
                </Select>
              </FormField>
              <div className="flex flex-wrap gap-2">
                {!isDemo && (
                  <Button
                    size="sm"
                    onClick={() => setScanModalOpen(true)}
                    className="text-[10px] gap-1 bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    <IconQrCode className="h-3 w-3" />
                    Escanear credencial
                  </Button>
                )}
                {!isDemo && cuadrillas
                  .filter(c => cuadrillaFiltro === 'all' || c.id_cuadrilla === cuadrillaFiltro)
                  .map(c => (
                    <Button
                      key={`manual-${c.id_cuadrilla}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleAbrirManualQR(c)}
                      className="text-[10px] gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/5"
                    >
                      ✏ Manual {(c as any).codigo}
                    </Button>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">
                Registros del {fmtDate(fechaFiltro)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Cuadrilla</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asistenciaFiltrada.map(reg => {
                      const badge = ASIS_BADGE[reg.estado] ?? ASIS_BADGE['PRESENTE'];
                      const sinSalida = reg.modo_asistencia === 'POR_HORAS' && reg.hora_entrada && !reg.hora_salida;
                      return (
                        <TableRow key={reg.id}>
                          <TableCell className="text-xs font-medium">{reg.empleado_nombre}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.puesto}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{reg.cuadrilla_nombre}</TableCell>
                          <TableCell className="font-mono text-xs">{reg.hora_entrada ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {reg.hora_salida ?? (sinSalida
                              ? <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black text-amber-600">Sin salida</span>
                              : '—'
                            )}
                          </TableCell>
                          <TableCell>
                            {reg.tipo_registro ? (
                              <span className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                reg.tipo_registro === 'QR' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-zinc-500/10 text-zinc-500'
                              )}>
                                {reg.tipo_registro}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                              {badge.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            {(reg.estado === 'AUSENTE' || reg.estado === 'PRESENTE') && (
                              <Button
                                size="sm" variant="ghost"
                                className="text-[10px] h-6 px-2 text-muted-foreground"
                                onClick={() => handleRegistrarManual(reg)}
                              >
                                {reg.estado === 'AUSENTE' ? 'Registrar entrada' : 'Marcar salida'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {asistenciaFiltrada.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <EmptyStatePanel title="Sin registros para la fecha y cuadrilla seleccionadas" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmCriticalActionDialog
        open={confirmGuardarBulk}
        dismissible={false}
        title="¿Guardar esta asistencia?"
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmDisabled={guardandoBulk}
        onConfirm={() => void guardarBulk()}
        onCancel={() => setConfirmGuardarBulk(false)}
      />

      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title="Asistencia de Cuadrilla">
        {qrModal && (
          <div className="flex flex-col gap-4">
                <div className="text-center pb-1">
                  <p className="text-xs font-bold text-foreground">{qrModal.nombre} — {fmtDate(fechaFiltro)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Marca la asistencia de cada integrante y guarda</p>
                </div>
                {bulkChecks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">Esta cuadrilla no tiene miembros asignados.</p>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                    {bulkChecks.map((bc, idx) => (
                      <div key={bc.empleado_id} className="rounded-xl border border-border/40 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-black text-indigo-600">
                            {bc.nombre.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{bc.nombre}</div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground">{bc.puesto}</span>
                              {bc.modo_asistencia === 'POR_HORAS' && (
                                <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-black text-violet-600">Por horas</span>
                              )}
                            </div>
                          </div>
                          {bc.modo_asistencia !== 'POR_HORAS' && (
                            <>
                              <button
                                onClick={() => setBulkChecks(prev => prev.map((b, i) =>
                                  i === idx ? { ...b, estado: b.estado === 'PRESENTE' ? 'AUSENTE' : 'PRESENTE' } : b
                                ))}
                                className={cn(
                                  'rounded-full px-3 py-1 text-[10px] font-black transition-colors',
                                  bc.estado === 'PRESENTE'
                                    ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                )}
                              >
                                {bc.estado}
                              </button>
                              <input
                                type="number" min="0" max="12" step="0.5"
                                value={bc.horas_extra}
                                onChange={e => setBulkChecks(prev => prev.map((b, i) =>
                                  i === idx ? { ...b, horas_extra: e.target.value } : b
                                ))}
                                className="w-16 rounded-lg border border-border/40 px-2 py-1 text-center text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="HE" title="Horas extra"
                              />
                            </>
                          )}
                        </div>
                        {bc.modo_asistencia === 'POR_HORAS' && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Entrada</label>
                              <input
                                type="time"
                                value={bc.hora_entrada}
                                onChange={e => setBulkChecks(prev => prev.map((b, i) => i === idx ? { ...b, hora_entrada: e.target.value } : b))}
                                className="w-full rounded-lg border border-border/40 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Salida</label>
                              <input
                                type="time"
                                value={bc.hora_salida}
                                onChange={e => setBulkChecks(prev => prev.map((b, i) => i === idx ? { ...b, hora_salida: e.target.value } : b))}
                                className="w-full rounded-lg border border-border/40 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-[10px] text-muted-foreground">
                    {bulkChecks.filter(b => b.estado === 'PRESENTE').length}/{bulkChecks.length} presentes
                  </span>
                  <Button
                    className="text-xs bg-indigo-600 hover:bg-indigo-500"
                    onClick={handleGuardarBulk}
                    disabled={guardandoBulk || bulkChecks.length === 0}
                  >
                    {guardandoBulk ? 'Guardando…' : 'Guardar asistencia'}
                  </Button>
                </div>
          </div>
        )}
      </Modal>

      <Modal open={scanModalOpen} onClose={handleCerrarScanner} title="Escanear Credencial">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full overflow-hidden rounded-2xl border-2 border-border bg-black">
            <video ref={videoRef} className="w-full aspect-square object-cover" muted playsInline />
            <canvas ref={scanCanvasRef} className="hidden" />
            {scanBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <p className="text-xs font-bold uppercase tracking-widest text-white">Procesando…</p>
              </div>
            )}
          </div>

          {scanResult ? (
            <div className={cn(
              'w-full rounded-xl border px-4 py-3 text-center',
              scanResult.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' : 'border-red-500/30 bg-red-500/10 text-red-700'
            )}>
              <p className="text-sm font-bold">{scanResult.mensaje}</p>
              <Button className="mt-3 text-xs" onClick={reiniciarScanner}>Escanear otro</Button>
            </div>
          ) : (
            <p className="text-center text-[11px] text-muted-foreground">
              Apunta la cámara al código QR de la credencial del empleado. Se registra automáticamente entrada o salida.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

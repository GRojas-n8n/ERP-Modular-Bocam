import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useTenant } from '../../context/TenantContext';
import { useNotification } from '../../context/NotificationContext';
import { DEMO_PRENOMINAS_RESIDENCIA, DEMO_COMPLEMENTOS_RESIDENCIA } from '../../lib/demoData';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmCriticalActionDialog,
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
import { TableScrollShadow } from '../../components/TableScrollShadow';
import { fmt$, fmtDate, Modal } from './shared';

type NominaEstado = 'BORRADOR' | 'CALCULADA' | 'AUTORIZADA' | 'PAGADA';

interface PrenominaDetalleEmpleado {
  id_detalle: string;
  empleado_id: string;
  total_percepciones: number;
  total_deducciones: number;
  neto_a_pagar: number;
  empleado: { nombre: string; apellido_paterno: string; numero_empleado: string; puesto: string };
}
interface Prenomina {
  id_prenomina: string;
  codigo: string;
  periodo_tipo: string;
  periodo_inicio: string;
  periodo_fin: string;
  total_percepciones: number;
  total_deducciones: number;
  total_neto: number;
  total_empleados: number;
  estado: NominaEstado;
  revisado_por_residencia: boolean;
  revisado_at: string | null;
  detalles?: PrenominaDetalleEmpleado[];
}

type ComplementoEstado = 'BORRADOR' | 'AUTORIZADA';
interface Complemento {
  id_complemento: string;
  codigo: string;
  periodo_tipo: string;
  periodo_inicio: string;
  periodo_fin: string;
  total_complemento: number;
  estado: ComplementoEstado;
  revisado_por_residencia: boolean;
  revisado_at: string | null;
}

const NOM_BADGE: Record<NominaEstado, { cls: string; label: string }> = {
  BORRADOR:    { cls: 'bg-zinc-500/10 text-zinc-500',       label: 'Borrador'    },
  CALCULADA:   { cls: 'bg-amber-500/10 text-amber-600',     label: 'Calculada'   },
  AUTORIZADA:  { cls: 'bg-emerald-500/10 text-emerald-600', label: 'Autorizada'  },
  PAGADA:      { cls: 'bg-sky-500/10 text-sky-600',         label: 'Pagada'      },
};

/**
 * Tab "Nómina" de Residencia de Obra — aprobación de prenómina y revisión de
 * complemento salarial — ver openspec/changes/split-residencia-view-tabs.
 *
 * A diferencia de los demás tabs, `prenominas`/`complementos` se cargan una
 * sola vez al montar (no gateado por `active`) — replica el comportamiento
 * original, en el que esta carga corría junto con `dashData` sin depender de
 * qué tab estuviera activo. Ver design.md Decisión 6.
 */
export const NominaTab: React.FC<{ active: boolean }> = ({ active }) => {
  const { tenant, user, currentProjectId } = useTenant();
  const { notify } = useNotification();
  const isDemo = tenant?.id === 'iretum-demo';
  const currentProjectName = user?.projects?.find(p => p.id === currentProjectId)?.name || 'proyecto activo';
  const currentProjectColor = getProjectColor(currentProjectId);

  const [prenominas, setPrenominas] = useState<Prenomina[]>([]);
  const [nominaDetalle, setNominaDetalle] = useState<Prenomina | null>(null);
  const [confirmAprobar, setConfirmAprobar] = useState<Prenomina | null>(null);
  const [marcandoRevisado, setMarcandoRevisado] = useState(false);
  const [complementos, setComplementos] = useState<Complemento[]>([]);
  const [confirmRevisarComplemento, setConfirmRevisarComplemento] = useState<Complemento | null>(null);
  const [marcandoRevisadoComplemento, setMarcandoRevisadoComplemento] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setPrenominas(DEMO_PRENOMINAS_RESIDENCIA as Prenomina[]);
      setComplementos(DEMO_COMPLEMENTOS_RESIDENCIA as Complemento[]);
      return;
    }
    const fetchData = async () => {
      try {
        const [nomRes, compRes] = await Promise.allSettled([
          api.get('/api/v1/personal/prenominas'),
          api.get('/api/v1/personal/complementos'),
        ]);
        if (nomRes.status === 'fulfilled') {
          setPrenominas((nomRes.value.data as any)?.data ?? []);
        }
        if (compRes.status === 'fulfilled') {
          setComplementos((compRes.value.data as any)?.data ?? []);
        }
      } catch { /* silencioso */ }
    };
    void fetchData();
  }, [isDemo]);

  const kpiNomina = {
    pendientesRevision: prenominas.filter(p => p.estado === 'CALCULADA' && !p.revisado_por_residencia).length,
    porAutorizar: prenominas.filter(p => p.estado === 'CALCULADA').reduce((s, p) => s + p.total_neto, 0),
    empleados: prenominas.find(p => p.estado === 'CALCULADA')?.total_empleados ?? 0,
  };

  // Marca la prenómina como revisada por Residencia — NO autoriza el pago.
  // /autorizar sigue siendo exclusivo de personal_rh/admin (separación de
  // funciones, ver specs/features/01-revision-nomina-residencia.md D2).
  const handleMarcarRevisado = async () => {
    if (!confirmAprobar) return;
    if (isDemo) {
      setPrenominas(prev => prev.map(p =>
        p.id_prenomina === confirmAprobar.id_prenomina
          ? { ...p, revisado_por_residencia: true, revisado_at: new Date().toISOString() }
          : p
      ));
      notify({
        type: 'success',
        title: 'Nómina marcada como revisada (demo)',
        message: `${confirmAprobar.codigo} · ${fmt$(confirmAprobar.total_neto)} · ${confirmAprobar.total_empleados} empleados`,
        duration: 6000,
      });
      setConfirmAprobar(null);
      setNominaDetalle(null);
      return;
    }
    try {
      setMarcandoRevisado(true);
      const res = await api.patch(`/api/v1/personal/prenominas/${confirmAprobar.id_prenomina}/marcar-revisado`, {});
      const actualizada = (res.data as any)?.data as Prenomina;
      setPrenominas(prev => prev.map(p => p.id_prenomina === actualizada.id_prenomina ? actualizada : p));
      notify({
        type: 'success',
        title: 'Nómina marcada como revisada',
        message: `${actualizada.codigo} · ${fmt$(actualizada.total_neto)} · ${actualizada.total_empleados} empleados`,
        duration: 6000,
      });
    } catch (err: any) {
      notify({ type: 'error', title: 'No se pudo marcar como revisada', message: err?.response?.data?.error?.message || err.message });
    } finally {
      setMarcandoRevisado(false);
      setConfirmAprobar(null);
      setNominaDetalle(null);
    }
  };

  // Mismo patrón que handleMarcarRevisado, para Complemento Salarial.
  const handleMarcarRevisadoComplemento = async () => {
    if (!confirmRevisarComplemento) return;
    if (isDemo) {
      setComplementos(prev => prev.map(c =>
        c.id_complemento === confirmRevisarComplemento.id_complemento
          ? { ...c, revisado_por_residencia: true, revisado_at: new Date().toISOString() }
          : c
      ));
      notify({
        type: 'success',
        title: 'Complemento marcado como revisado (demo)',
        message: `${confirmRevisarComplemento.codigo} · ${fmt$(confirmRevisarComplemento.total_complemento)}`,
        duration: 6000,
      });
      setConfirmRevisarComplemento(null);
      return;
    }
    try {
      setMarcandoRevisadoComplemento(true);
      const res = await api.patch(`/api/v1/personal/complementos/${confirmRevisarComplemento.id_complemento}/marcar-revisado`, {});
      const actualizado = (res.data as any)?.data as Complemento;
      setComplementos(prev => prev.map(c => c.id_complemento === actualizado.id_complemento ? actualizado : c));
      notify({
        type: 'success',
        title: 'Complemento marcado como revisado',
        message: `${actualizado.codigo} · ${fmt$(actualizado.total_complemento)}`,
        duration: 6000,
      });
    } catch (err: any) {
      notify({ type: 'error', title: 'No se pudo marcar como revisado', message: err?.response?.data?.error?.message || err.message });
    } finally {
      setMarcandoRevisadoComplemento(false);
      setConfirmRevisarComplemento(null);
    }
  };

  return (
    <>
      {active && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: 'Por Revisar',  value: kpiNomina.pendientesRevision,  sub: 'prenóminas sin revisar', cls: 'text-amber-600'   },
            { label: 'Monto a Autorizar', value: fmt$(kpiNomina.porAutorizar), sub: 'total neto en calculada', cls: 'text-foreground' },
            { label: 'Empleados',    value: kpiNomina.empleados,           sub: 'en próxima nómina',      cls: 'text-indigo-600' },
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Aprobación de Prenómina
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Empleados</TableHead>
                    <TableHead className="text-right">Total Percepciones</TableHead>
                    <TableHead className="text-right">Deducciones</TableHead>
                    <TableHead className="text-right">Total Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prenominas.map(pn => {
                    const badge = NOM_BADGE[pn.estado];
                    return (
                      <TableRow key={pn.id_prenomina}>
                        <TableCell className="font-mono text-xs font-semibold">{pn.codigo}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(pn.periodo_inicio)}<br />
                          <span className="text-[10px]">al {fmtDate(pn.periodo_fin)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{pn.periodo_tipo}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs">{pn.total_empleados}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{fmt$(pn.total_percepciones)}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums text-red-500">-{fmt$(pn.total_deducciones)}</TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums">{fmt$(pn.total_neto)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className={cn('w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold', badge.cls)}>
                              {badge.label}
                            </span>
                            {pn.estado === 'CALCULADA' && (
                              <span className={cn('text-[10px]', pn.revisado_por_residencia ? 'text-emerald-600' : 'text-amber-600')}>
                                {pn.revisado_por_residencia ? 'Revisada' : 'Sin revisar'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm" variant="ghost"
                              className="text-[10px] h-6 px-2 text-muted-foreground"
                              onClick={() => setNominaDetalle(pn)}
                            >
                              Ver detalle
                            </Button>
                            {pn.estado === 'CALCULADA' && !pn.revisado_por_residencia && (
                              <Button
                                size="sm"
                                className="text-[10px] h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => setConfirmAprobar(pn)}
                              >
                                Marcar revisado
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {active && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-widest">
              Complemento Salarial
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {complementos.length === 0 ? (
              <p className="px-4 py-6 text-xs text-muted-foreground">Sin complementos salariales en este periodo.</p>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead className="text-right">Total Complemento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complementos.map(c => (
                      <TableRow key={c.id_complemento}>
                        <TableCell className="font-mono text-xs font-semibold">{c.codigo}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(c.periodo_inicio)}<br />
                          <span className="text-[10px]">al {fmtDate(c.periodo_fin)}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold tabular-nums">{fmt$(c.total_complemento)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className={cn('w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              c.estado === 'AUTORIZADA' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-500')}>
                              {c.estado === 'AUTORIZADA' ? 'Autorizada' : 'Borrador'}
                            </span>
                            {c.estado === 'BORRADOR' && (
                              <span className={cn('text-[10px]', c.revisado_por_residencia ? 'text-emerald-600' : 'text-amber-600')}>
                                {c.revisado_por_residencia ? 'Revisado' : 'Sin revisar'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.estado === 'BORRADOR' && !c.revisado_por_residencia && (
                            <Button
                              size="sm"
                              className="text-[10px] h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => setConfirmRevisarComplemento(c)}
                            >
                              Marcar revisado
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      <Modal open={!!nominaDetalle} onClose={() => setNominaDetalle(null)} title="Detalle de Prenómina">
        {nominaDetalle && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-muted-foreground">Código</p><p className="font-mono font-semibold">{nominaDetalle.codigo}</p></div>
              <div><p className="text-muted-foreground">Periodo</p><p className="font-semibold">{fmtDate(nominaDetalle.periodo_inicio)} – {fmtDate(nominaDetalle.periodo_fin)}</p></div>
              <div><p className="text-muted-foreground">Total Percepciones</p><p className="font-semibold">{fmt$(nominaDetalle.total_percepciones)}</p></div>
              <div><p className="text-muted-foreground">Deducciones</p><p className="font-semibold text-red-500">-{fmt$(nominaDetalle.total_deducciones)}</p></div>
            </div>
            <TableScrollShadow className="rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Empleado</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Puesto</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {(nominaDetalle.detalles ?? []).map((d) => (
                    <tr key={d.id_detalle} className="border-t border-border">
                      <td className="px-3 py-2">{d.empleado.nombre} {d.empleado.apellido_paterno} <span className="text-muted-foreground">({d.empleado.numero_empleado})</span></td>
                      <td className="px-3 py-2 text-muted-foreground">{d.empleado.puesto}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">{fmt$(d.neto_a_pagar)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/20 font-bold">
                    <td className="px-3 py-2">Total Neto</td>
                    <td className="px-3 py-2 text-right tabular-nums">{nominaDetalle.total_empleados}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{fmt$(nominaDetalle.total_neto)}</td>
                  </tr>
                </tbody>
              </table>
            </TableScrollShadow>
            {nominaDetalle.estado === 'CALCULADA' && !nominaDetalle.revisado_por_residencia && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                onClick={() => { setNominaDetalle(null); setConfirmAprobar(nominaDetalle); }}
              >
                Marcar revisado
              </Button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmCriticalActionDialog
        open={!!confirmAprobar}
        title={`¿Marcar como revisada la prenómina ${confirmAprobar?.codigo ?? ''}?`}
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmLabel={marcandoRevisado ? 'Guardando…' : 'Confirmar revisión'}
        onConfirm={handleMarcarRevisado}
        onCancel={() => setConfirmAprobar(null)}
      >
        {confirmAprobar && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
            <p className="text-xs text-muted-foreground">
              {confirmAprobar.total_empleados} empleados · {fmt$(confirmAprobar.total_neto)} neto
            </p>
            <p className="mt-2 text-xs text-amber-600 font-medium">
              Esta acción NO autoriza el pago — solo habilita a Personal/RH para autorizarlo.
            </p>
          </div>
        )}
      </ConfirmCriticalActionDialog>

      <ConfirmCriticalActionDialog
        open={!!confirmRevisarComplemento}
        title={`¿Marcar como revisado el complemento ${confirmRevisarComplemento?.codigo ?? ''}?`}
        projectName={currentProjectName}
        projectColorDot={currentProjectColor.dot}
        confirmLabel={marcandoRevisadoComplemento ? 'Guardando…' : 'Confirmar revisión'}
        onConfirm={handleMarcarRevisadoComplemento}
        onCancel={() => setConfirmRevisarComplemento(null)}
      >
        {confirmRevisarComplemento && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
            <p className="text-xs text-muted-foreground">
              {fmt$(confirmRevisarComplemento.total_complemento)} de complemento salarial
            </p>
            <p className="mt-2 text-xs text-amber-600 font-medium">
              Esta acción NO autoriza el pago — solo habilita a Personal/RH para autorizarlo.
            </p>
          </div>
        )}
      </ConfirmCriticalActionDialog>
    </>
  );
};

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Control de Proyectos (CP)
 * Puerto: 3013
 *
 * Responsabilidades:
 * 1. EVM por partida y global (CPI, SPI, EAC, VAC).
 * 2. Curva S programada vs. real.
 * 3. Alertas predictivas automáticas (motor + job 24h).
 * 4. Proyección de cierre y flujo de caja mensual.
 * 5. Suscriptor de eventos RabbitMQ de los demás módulos.
 *
 * CP NO bloquea operaciones. Solo informa y alerta.
 * CP NO llama a otros módulos en tiempo real. Solo lee eventos.
 * ---------------------------------------------------------------------------
 */

import express, { Request, Response } from 'express';
import basePrisma, { createTenantContext } from './db';
import { createAuthMiddleware, requireEnv, requireProjectAccess, requireRoles } from '../../../packages/auth-middleware/src';
import { createEventBus, BocamEvent } from '../../../packages/event-bus/src';
import {
  createObservabilityMiddleware,
  initSentry,
  logError,
  logInfo,
} from '../../../packages/observability/src';

initSentry(process.env.SENTRY_DSN || '', 'control-proyectos');

const eventBus = createEventBus('control-proyectos');
export const app = express();
app.use(express.json());
app.use(createObservabilityMiddleware('control-proyectos'));

const PORT = process.env.PORT || 3013;
const JWT_SECRET = requireEnv('JWT_SECRET');

app.use(createAuthMiddleware({ jwtSecret: JWT_SECRET, excludePaths: ['/health'] }));
app.use(requireProjectAccess());

// ─── Helpers ─────────────────────────────────────────────────────────────────

function semaforo(cpi: number, spi: number): 'VERDE' | 'AMARILLO' | 'ROJO' {
  if (cpi >= 0.95 && spi >= 0.95) return 'VERDE';
  if (cpi >= 0.85 && spi >= 0.80) return 'AMARILLO';
  return 'ROJO';
}

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ─── Motor de alertas ─────────────────────────────────────────────────────────

async function upsertAlerta(
  tenantId: string,
  proyectoId: string,
  tipo: string,
  conceptoId: string | null,
  opts: {
    severidad: string;
    titulo: string;
    descripcion: string;
    datos: Record<string, unknown>;
  }
): Promise<void> {
  const existing = await basePrisma.alertaProyecto.findFirst({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, tipo, concepto_id: conceptoId ?? undefined, estado: { in: ['ACTIVA', 'RECONOCIDA'] } },
  });
  if (existing) {
    await basePrisma.alertaProyecto.update({
      where: { id: existing.id },
      data: { titulo: opts.titulo, descripcion: opts.descripcion, datos: opts.datos as any, severidad: opts.severidad, updated_at: new Date() },
    });
  } else {
    await basePrisma.alertaProyecto.create({
      data: {
        id: undefined,
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        concepto_id: conceptoId,
        tipo,
        severidad: opts.severidad,
        titulo: opts.titulo,
        descripcion: opts.descripcion,
        datos: opts.datos as any,
        estado: 'ACTIVA',
      },
    });
  }
}

async function resolverAlertaSiExiste(tenantId: string, proyectoId: string, tipo: string, conceptoId: string | null): Promise<void> {
  await basePrisma.alertaProyecto.updateMany({
    where: { tenant_id: tenantId, proyecto_id: proyectoId, tipo, concepto_id: conceptoId ?? undefined, estado: { in: ['ACTIVA', 'RECONOCIDA'] } },
    data: { estado: 'RESUELTA', resuelta_en: new Date() },
  });
}

async function calcularAlertas(tenantId: string, proyectoId: string): Promise<void> {
  try {
    const partidas = await basePrisma.programacionObra.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });

    for (const p of partidas) {
      const cpi = p.cpi ? Number(p.cpi) : null;
      const spi = p.spi ? Number(p.spi) : null;
      const bac = Number(p.bac);
      const eac = p.eac ? Number(p.eac) : null;

      // SOBRE_COSTO_PROYECTADO: CPI < 0.9
      if (cpi !== null && cpi < 0.9 && eac !== null) {
        const vac = bac - eac;
        const pctSobre = bac > 0 ? Math.abs(vac / bac) * 100 : 0;
        await upsertAlerta(tenantId, proyectoId, 'SOBRE_COSTO_PROYECTADO', p.concepto_id, {
          severidad: 'CRITICA',
          titulo: `Sobrecosto proyectado en ${p.concepto_clave}`,
          descripcion: `CPI ${cpi.toFixed(3)}. EAC proyectado supera presupuesto en $${Math.abs(vac).toLocaleString('es-MX')} (${pctSobre.toFixed(1)}% sobre presupuesto).`,
          datos: { cpi, eac, bac, vac, pct_sobre: pctSobre },
        });
      } else if (cpi !== null && cpi >= 0.9) {
        await resolverAlertaSiExiste(tenantId, proyectoId, 'SOBRE_COSTO_PROYECTADO', p.concepto_id);
      }

      // RETRASO_CRITICO: SPI < 0.8 y fecha_fin_plan próxima (30 días)
      if (spi !== null && spi < 0.8 && p.fecha_fin_plan) {
        const diasRestantes = Math.ceil((new Date(p.fecha_fin_plan).getTime() - Date.now()) / 86400000);
        if (diasRestantes <= 30 && diasRestantes >= 0) {
          const diasRetraso = spi > 0 ? Math.round((1 / spi - 1) * diasRestantes) : 0;
          await upsertAlerta(tenantId, proyectoId, 'RETRASO_CRITICO', p.concepto_id, {
            severidad: 'CRITICA',
            titulo: `Retraso crítico en ${p.concepto_clave}`,
            descripcion: `Partida ${p.concepto_clave} tiene SPI ${spi.toFixed(3)}. Riesgo de no terminar en fecha. Retraso proyectado: ${diasRetraso} días.`,
            datos: { spi, dias_retraso: diasRetraso, fecha_fin_plan: p.fecha_fin_plan },
          });
        }
      } else if (spi !== null && spi >= 0.8) {
        await resolverAlertaSiExiste(tenantId, proyectoId, 'RETRASO_CRITICO', p.concepto_id);
      }
    }
  } catch (err) {
    // Motor de alertas no es crítico — falla silenciosa en logs
    console.error('[CP] calcularAlertas error:', err);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/dashboard', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const [proyeccion, alertasActivas, partidas] = await Promise.all([
      basePrisma.proyeccionCierre.findFirst({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { fecha_calculo: 'desc' },
      }),
      basePrisma.alertaProyecto.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId, estado: { in: ['ACTIVA', 'RECONOCIDA'] } },
        orderBy: [{ severidad: 'asc' }, { created_at: 'desc' }],
        take: 10,
      }),
      basePrisma.programacionObra.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
      }),
    ]);

    const criticas = alertasActivas.filter(a => a.severidad === 'CRITICA').length;
    const warnings = alertasActivas.filter(a => a.severidad === 'WARN').length;
    const bloqueadas = partidas.filter(p => p.estado === 'ATRASADA').length;

    const cpiGlobal = proyeccion ? Number(proyeccion.cpi) : null;
    const spiGlobal = proyeccion ? Number(proyeccion.spi) : null;
    const vacGlobal = proyeccion ? Number(proyeccion.vac) : null;
    const semaforoGlobal = cpiGlobal !== null && spiGlobal !== null
      ? semaforo(cpiGlobal, spiGlobal)
      : 'AMARILLO';

    res.json({
      success: true,
      data: {
        proyecto_id: proyectoId,
        resumen_evm: {
          cpi: cpiGlobal,
          spi: spiGlobal,
          vac: vacGlobal,
          semaforo: semaforoGlobal,
          fecha_corte: proyeccion?.fecha_calculo ?? null,
        },
        alertas_activas: {
          criticas,
          warnings,
          top_alertas: alertasActivas.slice(0, 5).map(a => ({
            id: a.id,
            tipo: a.tipo,
            titulo: a.titulo,
            severidad: a.severidad,
            estado: a.estado,
            created_at: a.created_at,
          })),
        },
        partidas_atrasadas: bloqueadas,
        fecha_fin_proyectada: proyeccion?.fecha_fin_proyectada ?? null,
        dias_retraso: proyeccion && proyeccion.fecha_fin_plan && proyeccion.fecha_fin_proyectada
          ? Math.max(0, Math.ceil((new Date(proyeccion.fecha_fin_proyectada).getTime() - new Date(proyeccion.fecha_fin_plan).getTime()) / 86400000))
          : null,
        sin_programacion: partidas.length === 0,
      },
    });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.dashboard.error', 'Error en dashboard CP', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/evm', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const [proyeccion, partidas] = await Promise.all([
      basePrisma.proyeccionCierre.findFirst({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { fecha_calculo: 'desc' },
      }),
      basePrisma.programacionObra.findMany({
        where: { tenant_id: tenantId, proyecto_id: proyectoId },
        orderBy: { concepto_clave: 'asc' },
      }),
    ]);

    const porPartida = partidas.map(p => {
      const cpi = p.cpi ? Number(p.cpi) : null;
      const spi = p.spi ? Number(p.spi) : null;
      const bac = Number(p.bac);
      const eac = p.eac ? Number(p.eac) : null;
      const sobreCosto = eac !== null ? eac - bac : null;
      const sem = cpi !== null && spi !== null ? semaforo(cpi, spi) : 'AMARILLO';
      return {
        concepto_id: p.concepto_id,
        concepto_clave: p.concepto_clave,
        descripcion: p.descripcion,
        estado: p.estado,
        pct_avance_real: Number(p.pct_avance_real),
        bac,
        cpi,
        spi,
        eac,
        sobre_costo_proyectado: sobreCosto,
        semaforo: sem,
      };
    });

    res.json({
      success: true,
      data: {
        proyecto_id: proyectoId,
        fecha_corte: proyeccion?.fecha_calculo ?? new Date().toISOString().split('T')[0],
        global: proyeccion ? {
          bac: Number(proyeccion.bac),
          pv: Number(proyeccion.pv),
          ev: Number(proyeccion.ev),
          ac: Number(proyeccion.ac),
          cpi: Number(proyeccion.cpi),
          spi: Number(proyeccion.spi),
          cv: Number(proyeccion.cv),
          sv: Number(proyeccion.sv),
          eac: Number(proyeccion.eac),
          etc: Number(proyeccion.etc),
          vac: Number(proyeccion.vac),
          fecha_fin_plan: proyeccion.fecha_fin_plan,
          fecha_fin_proyectada: proyeccion.fecha_fin_proyectada,
          semaforo: semaforo(Number(proyeccion.cpi), Number(proyeccion.spi)),
        } : null,
        por_partida: porPartida,
        sin_datos: partidas.length === 0,
      },
    });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.evm.error', 'Error en EVM', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CURVA S
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/curva-s', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const partidas = await basePrisma.programacionObra.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });

    if (partidas.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          error: 'SIN_PROGRAMACION',
          mensaje: 'Cargue la programación de obra para ver la Curva S',
        },
      });
      return;
    }

    // Agregar curvas por semana usando BAC de cada partida como peso
    const semanaMap = new Map<string, { pv_mxn: number; bac_total: number }>();

    for (const p of partidas) {
      const curva = p.curva_programada as Array<{ semana: string; pct_acumulado: number }>;
      if (!Array.isArray(curva)) continue;
      const bac = Number(p.bac);
      for (const punto of curva) {
        const existing = semanaMap.get(punto.semana) ?? { pv_mxn: 0, bac_total: 0 };
        existing.pv_mxn += (punto.pct_acumulado / 100) * bac;
        existing.bac_total += bac;
        semanaMap.set(punto.semana, existing);
      }
    }

    const bacTotal = partidas.reduce((sum, p) => sum + Number(p.bac), 0);
    const periodos = Array.from(semanaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, v]) => ({
        semana,
        pv_acumulado_pct: bacTotal > 0 ? (v.pv_mxn / bacTotal) * 100 : 0,
        pv_acumulado_mxn: v.pv_mxn,
      }));

    // Partidas críticas: SPI < 0.85
    const partidasCriticas = partidas
      .filter(p => p.spi !== null && Number(p.spi) < 0.85)
      .map(p => ({
        concepto_clave: p.concepto_clave,
        spi: Number(p.spi),
        cpi: p.cpi ? Number(p.cpi) : null,
      }));

    res.json({
      success: true,
      data: {
        proyecto_id: proyectoId,
        periodos,
        hoy: isoWeek(new Date()),
        partidas_criticas: partidasCriticas,
      },
    });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.curva-s.error', 'Error en Curva S', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROYECCIÓN DE FLUJO DE CAJA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/proyeccion-flujo', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const partidas = await basePrisma.programacionObra.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
    });

    if (partidas.length === 0) {
      res.json({ success: true, data: { meses: [], meses_con_deficit: [], reserva_recomendada: 0 } });
      return;
    }

    // Agrupar egresos proyectados por mes basado en la programación
    const mesMap = new Map<string, { egresos: number; partidas: string[] }>();

    for (const p of partidas) {
      if (!p.fecha_inicio_plan || !p.fecha_fin_plan) continue;
      const bac = Number(p.bac);
      const inicio = new Date(p.fecha_inicio_plan);
      const fin = new Date(p.fecha_fin_plan);
      const meses: string[] = [];
      const cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
      while (cur <= fin) {
        meses.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
        cur.setMonth(cur.getMonth() + 1);
      }
      if (meses.length === 0) continue;
      const montoPorMes = bac / meses.length;
      for (const mes of meses) {
        const entry = mesMap.get(mes) ?? { egresos: 0, partidas: [] };
        entry.egresos += montoPorMes;
        if (!entry.partidas.includes(p.concepto_clave)) entry.partidas.push(p.concepto_clave);
        mesMap.set(mes, entry);
      }
    }

    const meses = Array.from(mesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, v]) => {
        const egresos = Math.round(v.egresos);
        const ingresos = Math.round(egresos * 0.85); // estimación: 85% de cobranza diferida
        return {
          periodo,
          egresos_proyectados: egresos,
          ingresos_proyectados: ingresos,
          flujo_neto: ingresos - egresos,
          partidas_activas: v.partidas,
          confianza: 'ALTA' as const,
        };
      });

    const mesesConDeficit = meses.filter(m => m.flujo_neto < 0).map(m => m.periodo);
    const reservaRecomendada = meses
      .filter(m => m.flujo_neto < 0)
      .reduce((sum, m) => sum + Math.abs(m.flujo_neto), 0);

    res.json({
      success: true,
      data: { meses, meses_con_deficit: mesesConDeficit, reserva_recomendada: Math.round(reservaRecomendada) },
    });
  } catch (error: any) {
    logError(req, 'control-proyectos', 'cp.proyeccion-flujo.error', 'Error en proyección de flujo', { error_message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROGRAMACIÓN DE OBRA (Gantt)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/programacion', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;

    const data = await basePrisma.programacionObra.findMany({
      where: { tenant_id: tenantId, proyecto_id: proyectoId },
      orderBy: [{ estado: 'asc' }, { fecha_inicio_plan: 'asc' }],
    });

    res.json({
      success: true,
      data: data.map(p => ({
        ...p,
        pct_avance_real: Number(p.pct_avance_real),
        bac: Number(p.bac),
        cpi: p.cpi ? Number(p.cpi) : null,
        spi: p.spi ? Number(p.spi) : null,
        eac: p.eac ? Number(p.eac) : null,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/v1/control-proyectos/programacion',
  requireRoles('admin', 'control_proyectos', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId, proyectoId } = req.securityContext;
      const items = req.body as Array<{
        concepto_id: string;
        concepto_clave?: string;
        descripcion?: string;
        fecha_inicio_plan: string;
        fecha_fin_plan: string;
        bac?: number;
        curva_programada: Array<{ semana: string; pct_acumulado: number }>;
      }>;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(422).json({ success: false, error: { code: 'ITEMS_REQUERIDOS', message: 'Se requiere al menos un ítem de programación' } });
        return;
      }

      const errores: string[] = [];
      for (const item of items) {
        if (!item.concepto_id) { errores.push('concepto_id es requerido'); continue; }
        if (!item.fecha_inicio_plan || !item.fecha_fin_plan) { errores.push(`${item.concepto_id}: fechas requeridas`); continue; }
        if (!Array.isArray(item.curva_programada) || item.curva_programada.length === 0) {
          errores.push(`${item.concepto_id}: curva_programada requerida`);
          continue;
        }
        const ultimo = item.curva_programada[item.curva_programada.length - 1];
        if (ultimo.pct_acumulado !== 100) {
          errores.push(`${item.concepto_id}: La curva debe terminar en 100%`);
        }
      }

      if (errores.length > 0) {
        res.status(422).json({ success: false, error: { code: 'VALIDACION', message: errores.join('; ') } });
        return;
      }

      const results = await Promise.all(items.map(item =>
        basePrisma.programacionObra.upsert({
          where: { tenant_id_proyecto_id_concepto_id: { tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: item.concepto_id } },
          create: {
            tenant_id: tenantId,
            proyecto_id: proyectoId,
            concepto_id: item.concepto_id,
            concepto_clave: item.concepto_clave ?? item.concepto_id,
            descripcion: item.descripcion ?? '',
            fecha_inicio_plan: new Date(item.fecha_inicio_plan),
            fecha_fin_plan: new Date(item.fecha_fin_plan),
            curva_programada: item.curva_programada,
            bac: item.bac ?? 0,
            estado: 'PENDIENTE',
          },
          update: {
            concepto_clave: item.concepto_clave ?? item.concepto_id,
            descripcion: item.descripcion ?? '',
            fecha_inicio_plan: new Date(item.fecha_inicio_plan),
            fecha_fin_plan: new Date(item.fecha_fin_plan),
            curva_programada: item.curva_programada,
            bac: item.bac ?? 0,
          },
        })
      ));

      logInfo(req, 'control-proyectos', 'cp.programacion.cargada', 'Programación cargada', { total: results.length });
      res.status(201).json({ success: true, data: { total: results.length, items: results.map(r => r.concepto_id) } });
    } catch (error: any) {
      logError(req, 'control-proyectos', 'cp.programacion.error', 'Error al cargar programación', { error_message: error.message });
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALERTAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/api/v1/control-proyectos/alertas', async (req: Request, res: Response) => {
  try {
    const { tenantId, proyectoId } = req.securityContext;
    const estado = req.query.estado as string | undefined;
    const severidad = req.query.severidad as string | undefined;

    const alertas = await basePrisma.alertaProyecto.findMany({
      where: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        ...(estado ? { estado } : { estado: { in: ['ACTIVA', 'RECONOCIDA'] } }),
        ...(severidad ? { severidad } : {}),
      },
      orderBy: [{ severidad: 'asc' }, { created_at: 'desc' }],
    });

    res.json({ success: true, data: alertas });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/v1/control-proyectos/alertas/:id/reconocer',
  requireRoles('admin', 'control_proyectos', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.securityContext;
      const { nota_cp } = req.body;

      const alerta = await basePrisma.alertaProyecto.findFirst({
        where: { id: req.params.id, tenant_id: tenantId },
      });
      if (!alerta) { res.status(404).json({ success: false, message: 'Alerta no encontrada' }); return; }
      if (alerta.estado !== 'ACTIVA') {
        res.status(422).json({ success: false, error: { code: 'ESTADO_INVALIDO', message: 'Solo se pueden reconocer alertas ACTIVAS' } });
        return;
      }

      const updated = await basePrisma.alertaProyecto.update({
        where: { id: alerta.id },
        data: { estado: 'RECONOCIDA', nota_cp: nota_cp ?? null },
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

app.patch('/api/v1/control-proyectos/alertas/:id/ignorar',
  requireRoles('admin', 'director'),
  async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.securityContext;
      const { nota_cp } = req.body;

      if (!nota_cp || String(nota_cp).length < 20) {
        res.status(422).json({ success: false, error: { code: 'JUSTIFICACION_REQUERIDA', message: 'Se requiere justificación de al menos 20 caracteres para ignorar una alerta' } });
        return;
      }

      const alerta = await basePrisma.alertaProyecto.findFirst({
        where: { id: req.params.id, tenant_id: tenantId },
      });
      if (!alerta) { res.status(404).json({ success: false, message: 'Alerta no encontrada' }); return; }

      const updated = await basePrisma.alertaProyecto.update({
        where: { id: alerta.id },
        data: { estado: 'IGNORADA', nota_cp },
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'control-proyectos', port: PORT }));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVENT SUBSCRIBERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Registro liviano — sin tabla de proyección nueva en este change (ver
// design.md de evento-centro-costos-creado, Decisión 3).
export async function handleCentroCostosCreadoEvent(event: BocamEvent<{ codigo_centro_costos: string }>): Promise<void> {
  const { tenant_id, proyecto_id } = event.context;
  console.log(JSON.stringify({
    action: 'control_proyectos.event.centro_costos_creado.registrado',
    correlation_id: event.context?.correlation_id,
    tenant_id,
    proyecto_id,
    codigo_centro_costos: event.payload?.codigo_centro_costos,
  }));
}

async function initEventSubscribers(): Promise<void> {
  try {
    await eventBus.connect();

    // Avance físico validado → actualiza ProgramacionObra + recalcula EVM
    await eventBus.subscribe<{
      concepto_id: string;
      pct_avance: number;
      ev_acumulado?: number;
      ac_acumulado?: number;
    }>('control_obra.avance_fisico_validado', async (event) => {
      const { tenant_id, proyecto_id } = event.context;
      const { concepto_id, pct_avance, ev_acumulado, ac_acumulado } = event.payload;
      try {
        const prog = await basePrisma.programacionObra.findFirst({
          where: { tenant_id, proyecto_id, concepto_id },
        });
        if (!prog) return;

        const bac = Number(prog.bac);
        const pct = Math.min(100, pct_avance);
        const ev = ev_acumulado ?? (pct / 100) * bac;
        const ac = ac_acumulado ?? ev;
        const cpi = ac > 0 ? ev / ac : null;
        const pv = bac * (pct / 100);
        const spi = pv > 0 ? ev / pv : null;
        const eac = cpi && cpi > 0 ? bac / cpi : null;

        const nuevoEstado = pct >= 100 ? 'COMPLETADA' : pct > 0 ? 'EN_CURSO' : prog.estado;
        const fechaInicio = pct > 0 && !prog.fecha_inicio_real ? new Date() : prog.fecha_inicio_real;
        const fechaFin = pct >= 100 && !prog.fecha_fin_real ? new Date() : prog.fecha_fin_real;

        await basePrisma.programacionObra.update({
          where: { id: prog.id },
          data: {
            pct_avance_real: pct,
            cpi: cpi !== null ? cpi : undefined,
            spi: spi !== null ? spi : undefined,
            eac: eac !== null ? eac : undefined,
            estado: nuevoEstado,
            fecha_inicio_real: fechaInicio ?? undefined,
            fecha_fin_real: fechaFin ?? undefined,
          },
        });

        // Recalcular alertas después de actualizar EVM
        await calcularAlertas(tenant_id, proyecto_id);
      } catch (err) {
        console.error('[CP] avance_fisico_validado error:', err);
      }
    });

    // Partida bloqueada → crear alerta PARTIDA_BLOQUEADA
    await eventBus.subscribe<{
      concepto_id: string;
      concepto_clave: string;
      estado_tope: string;
    }>('gerencia_tecnica.partida_bloqueada', async (event) => {
      const { tenant_id, proyecto_id } = event.context;
      const { concepto_id, concepto_clave, estado_tope } = event.payload;
      try {
        await upsertAlerta(tenant_id, proyecto_id, 'PARTIDA_BLOQUEADA', concepto_id, {
          severidad: 'CRITICA',
          titulo: `Partida ${concepto_clave} bloqueada (${estado_tope})`,
          descripcion: `La partida ${concepto_clave} ha alcanzado su tope presupuestal. Estado: ${estado_tope}. Las requisiciones asociadas quedarán bloqueadas hasta que se apruebe una transferencia.`,
          datos: { concepto_clave, estado_tope },
        });
      } catch (err) {
        console.error('[CP] partida_bloqueada error:', err);
      }
    });

    // Transferencia aprobada → recalcular alertas de tope en origen y destino
    await eventBus.subscribe<{
      concepto_origen_id: string;
      concepto_destino_id: string;
      monto: number;
    }>('gerencia_tecnica.transferencia_partida_aprobada', async (event) => {
      const { tenant_id, proyecto_id } = event.context;
      const { concepto_origen_id, concepto_destino_id } = event.payload;
      try {
        // Resolver alerta de bloqueo en el destino si existe
        await resolverAlertaSiExiste(tenant_id, proyecto_id, 'PARTIDA_BLOQUEADA', concepto_destino_id);
        await calcularAlertas(tenant_id, proyecto_id);
      } catch (err) {
        console.error('[CP] transferencia_aprobada error:', err);
      }
    });

    // Centro de costos creado → registro liviano (auditoría/log)
    await eventBus.subscribe<{ codigo_centro_costos: string }>('auth.centro_costos_creado', handleCentroCostosCreadoEvent);

    console.log('[CP] Suscriptores de eventos activos');
  } catch (err) {
    // RabbitMQ no disponible en dev/test → arranque silencioso
    console.warn('[CP] RabbitMQ no disponible, suscriptores desactivados:', (err as Error).message);
  }
}

// Job nocturno: recalcular alertas cada 24h
function initJobNocturno(): void {
  const MS_24H = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      // Obtener combinaciones únicas (tenant, proyecto) con programación activa
      const activos = await basePrisma.$queryRaw<Array<{ tenant_id: string; proyecto_id: string }>>`
        SELECT DISTINCT tenant_id, proyecto_id FROM programacion_obra
      `;
      for (const { tenant_id, proyecto_id } of activos) {
        await calcularAlertas(tenant_id, proyecto_id);
      }
      console.log(`[CP] Job nocturno: alertas recalculadas para ${activos.length} proyectos`);
    } catch (err) {
      console.error('[CP] Job nocturno error:', err);
    }
  }, MS_24H);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOTSTRAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[CP] Control de Proyectos escuchando en puerto ${PORT}`);
  });
  initEventSubscribers().catch(console.error);
  initJobNocturno();
}

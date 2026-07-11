import { Router, Request, Response } from 'express';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { requireRoles } from '../../../../packages/auth-middleware/src';
import { logError, logInfo, buildForwardHeaders } from '../../../../packages/observability/src';
import { SYSTEM_ALERTAS_PREDICTIVAS } from '../prompts';
import type { AlertasPredictivas, AlertaPredictiva } from '../types';

const router = Router();

interface CapituloGasto {
  nombre: string;
  presupuesto_autorizado: number;
  monto_ejercido: number;
  avance_fisico_pct: number;
  puntos_historicos?: Array<{ fecha: string; monto_acumulado: number }>;
}

function calcularRiesgo(cap: CapituloGasto): { enRiesgo: boolean; diasParaCrisis: number | null } {
  const { presupuesto_autorizado, monto_ejercido, avance_fisico_pct } = cap;
  if (presupuesto_autorizado <= 0) return { enRiesgo: false, diasParaCrisis: null };

  const pctEjercido = (monto_ejercido / presupuesto_autorizado) * 100;
  const desviacion = pctEjercido - avance_fisico_pct;

  if (desviacion <= 5) return { enRiesgo: false, diasParaCrisis: null };

  let diasParaCrisis: number | null = null;
  const puntos = cap.puntos_historicos;
  if (puntos && puntos.length >= 3) {
    const sorted = [...puntos].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const n = sorted.length;
    const first = sorted[0]!;
    const last = sorted[n - 1]!;
    const diasTotales = (new Date(last.fecha).getTime() - new Date(first.fecha).getTime()) / 86400000;
    if (diasTotales > 0) {
      const tasaDiaria = (last.monto_acumulado - first.monto_acumulado) / diasTotales;
      const montoRestante = presupuesto_autorizado - monto_ejercido;
      if (tasaDiaria > 0) diasParaCrisis = Math.round(montoRestante / tasaDiaria);
    }
  }

  return { enRiesgo: true, diasParaCrisis };
}

function buildClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    timeout: Number(process.env.ANTHROPIC_TIMEOUT_MS ?? 30000),
  });
}

router.get(
  '/api/v1/asistente/alertas-predictivas',
  requireRoles('superintendent', 'admin', 'finance'),
  async (req: Request, res: Response) => {
    try {
      const headers = buildForwardHeaders(req, { Authorization: req.headers.authorization ?? '' });
      const FINANZAS_URL     = process.env.FINANZAS_URL     ?? 'http://finanzas:3004/api/v1/finanzas';
      // Migrado a control-proyectos (openspec: fusionar-control-obra-a-control-proyectos)
      const CONTROL_PROYECTOS_URL = process.env.CONTROL_PROYECTOS_URL ?? 'http://control-proyectos:3013/api/v1/control-proyectos';

      const [rFinanzas, rControlObra] = await Promise.allSettled([
        axios.get(`${FINANZAS_URL}/capitulos-gasto`, { headers, timeout: 6000 }),
        axios.get(`${CONTROL_PROYECTOS_URL}/resumen-dashboard`, { headers, timeout: 6000 }),
      ]);

      const avanceFisico: number =
        rControlObra.status === 'fulfilled'
          ? (rControlObra.value.data?.data?.avance_pct as number | undefined) ?? 0
          : 0;

      const capitulos: CapituloGasto[] =
        rFinanzas.status === 'fulfilled'
          ? ((rFinanzas.value.data?.data ?? []) as CapituloGasto[])
          : [];

      const capitulosConRiesgo = capitulos
        .map((cap) => {
          const capConAvance = { ...cap, avance_fisico_pct: cap.avance_fisico_pct ?? avanceFisico };
          const riesgo = calcularRiesgo(capConAvance);
          return { cap: capConAvance, ...riesgo };
        })
        .filter((c) => c.enRiesgo);

      if (capitulosConRiesgo.length === 0) {
        const result: AlertasPredictivas = { alertas: [], proyecto_saludable: true };
        logInfo(req, 'asistente', 'asistente.alertas-predictivas.sano', 'Proyecto sin alertas predictivas', {});
        return res.json({ success: true, data: result });
      }

      const payload = capitulosConRiesgo.map(({ cap, diasParaCrisis }) => ({
        capitulo: cap.nombre,
        presupuesto_autorizado: cap.presupuesto_autorizado,
        monto_ejercido: cap.monto_ejercido,
        avance_fisico_pct: cap.avance_fisico_pct,
        pct_ejercido: Math.round((cap.monto_ejercido / cap.presupuesto_autorizado) * 100),
        dias_para_crisis: diasParaCrisis,
      }));

      const anthropic = buildClient();
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [SYSTEM_ALERTAS_PREDICTIVAS],
        messages: [
          {
            role: 'user',
            content: `Capítulos en riesgo:\n\n${JSON.stringify(payload, null, 2)}\n\nGenera las alertas.`,
          },
        ],
      });

      const raw = message.content[0];
      if (raw.type !== 'text') throw new Error('Respuesta inesperada de Claude.');

      let alertas: AlertaPredictiva[] = [];
      try {
        const parsed = JSON.parse(raw.text) as { alertas: AlertaPredictiva[] };
        alertas = parsed.alertas ?? [];
      } catch {
        const jsonMatch = raw.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as { alertas: AlertaPredictiva[] };
          alertas = parsed.alertas ?? [];
        }
      }

      logInfo(req, 'asistente', 'asistente.alertas-predictivas.ok', 'Alertas predictivas generadas', {
        alertas: alertas.length,
        model: message.model,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens: message.usage.cache_creation_input_tokens,
        cache_read_input_tokens: message.usage.cache_read_input_tokens,
      });

      const result: AlertasPredictivas = { alertas, proyecto_saludable: false };
      return res.json({ success: true, data: result });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isTimeout = msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('timed out');
      logError(req, 'asistente', 'asistente.alertas-predictivas.error', 'Error generando alertas predictivas', { error_message: msg });
      return res.status(isTimeout ? 503 : 500).json({
        success: false,
        message: isTimeout ? 'El servicio de IA no respondió a tiempo. Intenta de nuevo.' : msg,
      });
    }
  },
);

export default router;

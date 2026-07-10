import { Router, Request, Response } from 'express';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { requireRoles } from '../../../../packages/auth-middleware/src';
import { logError, logInfo, buildForwardHeaders } from '../../../../packages/observability/src';
import { SYSTEM_RESUMEN_EJECUTIVO } from '../prompts';
import type { ResumenEjecutivo } from '../types';

const router = Router();

function buildClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    timeout: Number(process.env.ANTHROPIC_TIMEOUT_MS ?? 30000),
  });
}

router.get(
  '/api/v1/asistente/resumen-ejecutivo',
  requireRoles('superintendent', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const headers = buildForwardHeaders(req, { Authorization: req.headers.authorization ?? '' });
      const COMPRAS_URL      = process.env.COMPRAS_URL      ?? 'http://compras:3002/api/v1/compras';
      const FINANZAS_URL     = process.env.FINANZAS_URL     ?? 'http://finanzas:3004/api/v1/finanzas';
      const CONTROL_OBRA_URL = process.env.CONTROL_OBRA_URL ?? 'http://control-obra:3005/api/v1/control-obra';
      const PERSONAL_URL     = process.env.PERSONAL_URL     ?? 'http://personal:3006/api/v1/personal';
      const SEGURIDAD_URL    = process.env.SEGURIDAD_URL    ?? 'http://seguridad:3007/api/v1/seguridad';
      const CALIDAD_URL      = process.env.CALIDAD_URL      ?? 'http://calidad:3009/api/v1/calidad';

      const modulosNombres = ['compras', 'finanzas', 'control-obra', 'personal', 'seguridad', 'calidad'];

      const [r1, r2, r3, r4, r5, r6] = await Promise.allSettled([
        axios.get(`${COMPRAS_URL}/resumen-dashboard`,       { headers, timeout: 6000 }),
        axios.get(`${FINANZAS_URL}/dashboard`,              { headers, timeout: 6000 }),
        axios.get(`${CONTROL_OBRA_URL}/resumen-dashboard`,  { headers, timeout: 6000 }),
        axios.get(`${PERSONAL_URL}/resumen-dashboard`,      { headers, timeout: 6000 }),
        axios.get(`${SEGURIDAD_URL}/resumen-dashboard`,     { headers, timeout: 6000 }),
        axios.get(`${CALIDAD_URL}/resumen-dashboard`,       { headers, timeout: 6000 }),
      ]);

      const results = [r1, r2, r3, r4, r5, r6];
      const modulosConError: string[] = [];
      const kpis: Record<string, unknown> = {};

      results.forEach((r, i) => {
        const nombre = modulosNombres[i]!;
        if (r.status === 'fulfilled') {
          kpis[nombre] = r.value.data?.data ?? r.value.data;
        } else {
          modulosConError.push(nombre);
          kpis[nombre] = null;
        }
      });

      const kpisJson = JSON.stringify(kpis, null, 2);
      const modulosErrorTexto = modulosConError.length > 0
        ? `\n\nNota: Los siguientes módulos no estaban disponibles: ${modulosConError.join(', ')}.`
        : '';

      const anthropic = buildClient();
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: [SYSTEM_RESUMEN_EJECUTIVO],
        messages: [
          {
            role: 'user',
            content: `Aquí están los KPIs actuales de la obra:\n\n${kpisJson}${modulosErrorTexto}\n\nGenera el resumen ejecutivo.`,
          },
        ],
      });

      const raw = message.content[0];
      if (raw.type !== 'text') throw new Error('Respuesta inesperada de Claude.');

      logInfo(req, 'asistente', 'asistente.resumen-ejecutivo.ok', 'Resumen ejecutivo generado', {
        modulos_con_error: modulosConError.length,
        model: message.model,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens: message.usage.cache_creation_input_tokens,
        cache_read_input_tokens: message.usage.cache_read_input_tokens,
      });

      const result: ResumenEjecutivo = {
        resumen: raw.text,
        modulos_con_error: modulosConError,
        generado_en: new Date().toISOString(),
      };

      return res.json({ success: true, data: result });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isTimeout = msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('timed out');
      logError(req, 'asistente', 'asistente.resumen-ejecutivo.error', 'Error generando resumen ejecutivo', { error_message: msg });
      return res.status(isTimeout ? 503 : 500).json({
        success: false,
        message: isTimeout ? 'El servicio de IA no respondió a tiempo. Intenta de nuevo.' : msg,
      });
    }
  },
);

export default router;

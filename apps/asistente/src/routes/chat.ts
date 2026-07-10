import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireRoles } from '../../../../packages/auth-middleware/src';
import { logError, logInfo } from '../../../../packages/observability/src';
import { SYSTEM_CHAT } from '../prompts';
import { crearToolsChat } from '../tools';
import { getConversacion, guardarTurno, crearConversacionId } from '../session-store';
import { extraerInvocacionesTools, construirParcial } from '../chat-turno';
import type { MensajeConversacion } from '../types';

const router = Router();

// Ver openspec/changes/asistente-ia-agente-conversacional design D5/design 3.5:
// timeout total del turno (encadena varias llamadas ida-y-vuelta con Claude
// más ejecución de tools), independiente del timeout individual de cada tool.
const TURNO_TIMEOUT_MS = 45000;

function buildClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    timeout: Number(process.env.ANTHROPIC_TIMEOUT_MS ?? 60000),
  });
}

// Migration Plan (design.md): desplegar restringido a 'admin' primero, validar
// costo real y tasa de degradación parcial una semana en producción, luego
// ampliar a 'superintendent' | 'finance' | 'gerencia_tecnica' (tasks 7.3-7.5).
router.post(
  '/api/v1/asistente/chat',
  requireRoles('admin'),
  async (req: Request, res: Response) => {
    const { mensaje, conversacion_id: conversacionIdEntrante } = (req.body ?? {}) as {
      mensaje?: string;
      conversacion_id?: string;
    };

    if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
      return res.status(400).json({ success: false, message: 'Se requiere el campo mensaje.' });
    }

    const tenantId = req.securityContext!.tenantId;
    const conversacionId = conversacionIdEntrante || crearConversacionId();

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), TURNO_TIMEOUT_MS);

    try {
      // D3: el historial se recupera por tenant_id (del JWT) + conversacion_id.
      // Si el conversacion_id no existe para ESTE tenant (nunca existió, expiró,
      // o pertenece a otro tenant), getConversacion devuelve null y se trata
      // como conversación nueva — sin exponer datos de otro tenant.
      const historialPrevio = conversacionIdEntrante
        ? await getConversacion(tenantId, conversacionIdEntrante)
        : null;

      const historial: MensajeConversacion[] = [...(historialPrevio ?? []), { role: 'user', content: mensaje }];

      const registroTiemposMs = new Map<string, number>();
      const anthropic = buildClient();
      const tools = crearToolsChat(req, registroTiemposMs);

      const runner = anthropic.beta.messages.toolRunner(
        {
          model: 'claude-fable-5',
          max_tokens: 1536,
          system: [SYSTEM_CHAT],
          messages: historial,
          tools,
          betas: ['server-side-fallback-2026-06-01'],
          fallbacks: [{ model: 'claude-opus-4-8' }],
        },
        { signal: controller.signal },
      );

      const finalMessage = await runner.runUntilDone();
      clearTimeout(timeoutHandle);

      // D6/3.7: un stop_reason "refusal" no debe leerse como texto normal —
      // se maneja explícitamente antes de tocar `content`.
      if (finalMessage.stop_reason === 'refusal') {
        logInfo(req, 'asistente', 'asistente.chat.refusal', 'Claude rechazó responder al mensaje', {
          conversacion_id: conversacionId,
        });
        return res.json({
          success: true,
          data: {
            conversacion_id: conversacionId,
            respuesta: 'No puedo responder a esa solicitud.',
            parcial: false,
            servicios_fallidos: [],
          },
        });
      }

      const mensajesFinales = runner.params.messages as MensajeConversacion[];
      // Solo los mensajes generados EN ESTE turno (a partir de donde arrancó
      // el historial que enviamos) — si se usa el historial completo, un
      // turno sin tools nuevas re-reporta las tools de turnos anteriores en
      // la auditoría y en `parcial`.
      const mensajesDeEsteTurno = mensajesFinales.slice(historial.length);
      const invocaciones = extraerInvocacionesTools(mensajesDeEsteTurno);
      const { parcial, servicios_fallidos } = construirParcial(invocaciones);

      await guardarTurno(tenantId, conversacionId, mensajesFinales);

      const bloqueTexto = finalMessage.content.find((c) => c.type === 'text');
      const respuesta = bloqueTexto && bloqueTexto.type === 'text' ? bloqueTexto.text : '';

      const tiempos: Record<string, number> = Object.fromEntries(registroTiemposMs);

      if (invocaciones.length > 0) {
        logInfo(req, 'asistente', 'asistente.chat.ok', 'Turno de chat con invocación de tools', {
          conversacion_id: conversacionId,
          tools_invocadas: invocaciones.map((i) => i.nombre),
          tiempos_respuesta_ms: tiempos,
          parcial,
          servicios_fallidos,
        });
      } else {
        logInfo(req, 'asistente', 'asistente.chat.sin-tools', 'Turno de chat resuelto sin invocar ninguna tool', {
          conversacion_id: conversacionId,
        });
      }

      return res.json({
        success: true,
        data: { conversacion_id: conversacionId, respuesta, parcial, servicios_fallidos },
      });
    } catch (error: unknown) {
      clearTimeout(timeoutHandle);
      const msg = error instanceof Error ? error.message : String(error);
      const isTimeout =
        controller.signal.aborted || msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('timed out') || msg.toLowerCase().includes('abort');
      logError(req, 'asistente', 'asistente.chat.error', 'Error en el turno de chat', {
        conversacion_id: conversacionId,
        error_message: msg,
      });
      return res.status(isTimeout ? 503 : 500).json({
        success: false,
        message: isTimeout ? 'El asistente no respondió a tiempo. Intenta de nuevo.' : msg,
      });
    }
  },
);

export default router;

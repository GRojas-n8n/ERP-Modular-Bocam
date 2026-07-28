import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { getAccessToken } from '../lib/api';
import { IconMessageCircle, IconSend, IconX, IconAlertCircle } from './Icons';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Widget de chat flotante — asistente conversacional (tool-use dinámico)
 *
 * Ver openspec/changes/asistente-ia-agente-conversacional. El historial vive
 * únicamente en el estado de este componente (useState) — se pierde al
 * recargar la página, igual que el TTL de 30 min de la sesión en Redis del
 * backend.
 *
 * Ver openspec/changes/streaming-progreso-asistente-ia: /chat responde como
 * stream SSE (frames `tool_start`/`final`/`error`), consumido con fetch()
 * nativo (no axios/EventSource — EventSource no puede mandar el header
 * Authorization: Bearer que este endpoint requiere) para mostrar en tiempo
 * real qué módulo del ERP se está consultando.
 * ---------------------------------------------------------------------------
 */

// Migration Plan (design.md): rollout restringido a 'admin' primero — ampliar
// a 'superintendent' | 'finance' | 'gerencia_tecnica' junto con el backend
// (apps/asistente/src/routes/chat.ts) una vez validado costo/calidad en prod.
const ROLES_AUTORIZADOS = ['admin'];

interface MensajeUI {
  rol: 'usuario' | 'asistente';
  texto: string;
  parcial?: boolean;
  serviciosFallidos?: string[];
}

export const ChatAsistente: React.FC = () => {
  const { user } = useTenant();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduloConsultando, setModuloConsultando] = useState<string | null>(null);
  const conversacionIdRef = useRef<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  const userRoles: string[] = user?.role ?? [];
  const autorizado = userRoles.some((r) => ROLES_AUTORIZADOS.includes(r));
  if (!autorizado) return null;

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;

    setMensajes((prev) => [...prev, { rol: 'usuario', texto }]);
    setInput('');
    setCargando(true);
    setError(null);
    setModuloConsultando(null);

    try {
      const token = getAccessToken();
      const baseURL = import.meta.env.VITE_API_URL || '';
      const resp = await fetch(`${baseURL}/api/v1/asistente/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mensaje: texto,
          ...(conversacionIdRef.current ? { conversacion_id: conversacionIdRef.current } : {}),
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('No se pudo obtener respuesta del asistente. Intenta de nuevo.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let final: { conversacion_id?: string; respuesta?: string; parcial?: boolean; servicios_fallidos?: string[] } | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (!frame.startsWith('data: ')) continue;
          const evento = JSON.parse(frame.slice('data: '.length));
          if (evento.type === 'tool_start') {
            setModuloConsultando(evento.modulo);
          } else if (evento.type === 'final') {
            final = evento;
          } else if (evento.type === 'error') {
            throw new Error(evento.message || 'No se pudo obtener respuesta del asistente. Intenta de nuevo.');
          }
        }
      }

      if (!final) {
        throw new Error('El asistente no devolvió ninguna respuesta.');
      }

      conversacionIdRef.current = final.conversacion_id ?? conversacionIdRef.current;
      setMensajes((prev) => [
        ...prev,
        {
          rol: 'asistente',
          texto: final!.respuesta ?? '',
          parcial: final!.parcial ?? false,
          serviciosFallidos: final!.servicios_fallidos ?? [],
        },
      ]);
    } catch (err: any) {
      setError(err?.message || 'No se pudo obtener respuesta del asistente. Intenta de nuevo.');
    } finally {
      setCargando(false);
      setModuloConsultando(null);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="Asistente IA"
        >
          <IconMessageCircle className="h-6 w-6" />
        </button>
      )}

      {abierto && (
        <div className="w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)] bg-background border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              <IconMessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-black uppercase tracking-tight">Asistente IA</span>
            </div>
            <button onClick={() => setAbierto(false)} className="text-muted-foreground hover:text-foreground">
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {mensajes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Pregúntame sobre el avance, presupuesto, compras, personal, seguridad o calidad de tu obra.
              </p>
            )}
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.rol === 'usuario'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-foreground'
                  }`}
                >
                  {m.texto}
                  {m.rol === 'asistente' && m.parcial && (
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5">
                      <IconAlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        Respuesta parcial — no se pudo consultar: {(m.serviciosFallidos ?? []).join(', ') || 'uno o más módulos'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs text-muted-foreground bg-muted/40 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {moduloConsultando ? `Consultando ${moduloConsultando}…` : 'Analizando tu pregunta…'}
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div ref={finRef} />
          </div>

          <div className="border-t border-border/60 p-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe tu pregunta…"
              rows={1}
              disabled={cargando}
              className="flex-1 resize-none rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={enviar}
              disabled={cargando || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
              title="Enviar"
            >
              <IconSend className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

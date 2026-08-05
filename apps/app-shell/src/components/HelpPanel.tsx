import React from 'react';
import { SlidePanel } from './SlidePanel';
import { getModuleHelp } from '../help';
import type { HelpBlock, HelpSection } from '../help';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Componente: HelpPanel - Panel lateral de ayuda contextual por módulo
 * openspec/changes/ayuda-contextual-por-modulo
 *
 * Resuelve el contenido desde help/index.ts (HELP_BY_VIEW) por viewId y lo
 * renderiza dentro del mismo SlidePanel que ya usa el resto de la app. La
 * sección cuyo id coincide con activeSubView se abre expandida.
 * ---------------------------------------------------------------------------
 */

interface HelpPanelProps {
  viewId: string;
  activeSubView?: string;
  isOpen: boolean;
  onClose: () => void;
}

const colorEstado: Record<string, string> = {
  verde: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  ambar: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  rojo: 'bg-red-500/10 text-red-700 border-red-500/30',
  azul: 'bg-sky-500/10 text-sky-700 border-sky-500/30',
  gris: 'bg-muted text-muted-foreground border-border',
};

const HelpBlockView: React.FC<{ bloque: HelpBlock }> = ({ bloque }) => {
  switch (bloque.tipo) {
    case 'parrafo':
      return <p className="text-xs text-muted-foreground leading-relaxed">{bloque.texto}</p>;

    case 'pasos':
      return (
        <div>
          {bloque.titulo && (
            <p className="font-black text-[11px] uppercase tracking-widest text-foreground mb-2">{bloque.titulo}</p>
          )}
          <ol className="space-y-2">
            {bloque.items.map((paso, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'lista':
      return (
        <div>
          {bloque.titulo && (
            <p className="font-black text-[11px] uppercase tracking-widest text-foreground mb-2">{bloque.titulo}</p>
          )}
          <div className="space-y-2">
            {bloque.items.map((item) => (
              <div key={item.termino} className="rounded-xl border border-border/40 p-3">
                <p className="text-xs font-bold text-foreground">{item.termino}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'estados':
      return (
        <div>
          {bloque.titulo && (
            <p className="font-black text-[11px] uppercase tracking-widest text-foreground mb-2">{bloque.titulo}</p>
          )}
          <div className="space-y-2">
            {bloque.items.map((item) => (
              <div
                key={item.estado}
                className={`rounded-xl border p-3 flex gap-3 items-start ${colorEstado[item.color] ?? colorEstado.gris}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest shrink-0">{item.estado}</span>
                <span className="text-[11px] leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'aviso':
      return (
        <div
          className={
            bloque.nivel === 'atencion'
              ? 'rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3'
              : 'rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex gap-3'
          }
        >
          <div>
            <p className={bloque.nivel === 'atencion' ? 'text-xs font-bold text-amber-700' : 'text-xs font-bold text-sky-700'}>
              {bloque.titulo}
            </p>
            <p className={bloque.nivel === 'atencion' ? 'text-[11px] text-amber-600/80 mt-1 leading-relaxed' : 'text-[11px] text-sky-600/80 mt-1 leading-relaxed'}>
              {bloque.texto}
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const HelpSectionView: React.FC<{ seccion: HelpSection; abierta: boolean }> = ({ seccion, abierta }) => (
  <details open={abierta} className="rounded-xl border border-border/40 overflow-hidden">
    <summary className="cursor-pointer select-none px-4 py-3 font-black text-xs uppercase tracking-widest text-foreground bg-muted/30 hover:bg-muted/50">
      {seccion.titulo}
    </summary>
    <div className="p-4 space-y-4">
      <p className="text-[11px] text-muted-foreground italic">{seccion.proposito}</p>
      {seccion.bloques.map((bloque, i) => (
        <HelpBlockView key={i} bloque={bloque} />
      ))}
    </div>
  </details>
);

export const HelpPanel: React.FC<HelpPanelProps> = ({ viewId, activeSubView, isOpen, onClose }) => {
  const help = getModuleHelp(viewId);

  if (!help) {
    return null;
  }

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={`Ayuda — ${help.titulo}`}
      subtitle={help.queHace.split('.')[0]}
      accentColor={help.accentColor}
      maxWidthClassName="max-w-2xl"
    >
      <div className="space-y-8 pb-10 text-sm">
        <section className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{help.queHace}</p>
          {help.rolesTipicos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {help.rolesTipicos.map((rol) => (
                <span
                  key={rol}
                  className="rounded-full border border-border/40 bg-muted/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  {rol}
                </span>
              ))}
            </div>
          )}
        </section>

        {help.flujo.length > 0 && (
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">Flujo del proceso</h3>
            <ol className="space-y-3">
              {help.flujo.map((paso, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{paso}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {help.conectaCon.length > 0 && (
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">Se conecta con</h3>
            <div className="space-y-2">
              {help.conectaCon.map((c) => (
                <div key={c.modulo} className="rounded-xl border border-border/40 p-3">
                  <p className="text-xs font-bold text-foreground">{c.modulo}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{c.via}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {help.secciones.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-1">Secciones del módulo</h3>
            {help.secciones.map((seccion) => (
              <HelpSectionView key={seccion.id} seccion={seccion} abierta={seccion.id === activeSubView} />
            ))}
          </section>
        )}

        {help.erroresComunes.length > 0 && (
          <section>
            <h3 className="font-black text-xs uppercase tracking-widest text-foreground mb-4">Errores comunes</h3>
            <div className="space-y-3">
              {help.erroresComunes.map((error, i) => (
                <div key={i} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-xs font-bold text-red-700">{error.sintoma}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    <span className="font-bold">Causa:</span> {error.causa}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    <span className="font-bold">Solución:</span> {error.solucion}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </SlidePanel>
  );
};

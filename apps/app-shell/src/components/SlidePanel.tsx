import React from 'react';
import {
  Button,
  FormField,
  Input,
  Select,
  SideSheet,
  Textarea,
  cn,
  formControlClassName,
} from '@bocam/ui-core';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Componente: SlidePanel - Panel lateral deslizable tipo drawer
 * ---------------------------------------------------------------------------
 */

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  accentColor = 'sky',
  children,
}) => {
  const colors: Record<string, { gradient: string }> = {
    sky: { gradient: 'from-sky-500 via-cyan-500 to-sky-500' },
    emerald: { gradient: 'from-emerald-500 via-teal-500 to-emerald-500' },
    violet: { gradient: 'from-violet-500 via-purple-500 to-violet-500' },
    amber: { gradient: 'from-amber-500 via-orange-500 to-amber-500' },
    indigo: { gradient: 'from-indigo-500 via-blue-500 to-indigo-500' },
  };
  const c = colors[accentColor] || colors.sky;

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={subtitle}
      topSlot={<div className={cn('h-1 w-full bg-gradient-to-r', c.gradient)} />}
      closeAriaLabel="Cerrar panel"
    >
      {children}
    </SideSheet>
  );
};

export { FormField, Input, Select, Textarea };

export const inputClass = formControlClassName;
export const textareaClass = cn(formControlClassName, 'min-h-[100px] resize-none');
export const selectClass = cn(formControlClassName, 'cursor-pointer appearance-none');

interface SubmitButtonProps {
  loading?: boolean;
  label: string;
  color?: string;
  onClick?: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  label,
  color = 'sky',
  onClick,
}) => {
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-600 text-white shadow-xl shadow-sky-600/20 hover:bg-sky-500',
    emerald: 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500',
    violet: 'bg-violet-600 text-white shadow-xl shadow-violet-600/20 hover:bg-violet-500',
    amber: 'bg-amber-600 text-white shadow-xl shadow-amber-600/20 hover:bg-amber-500',
    indigo: 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500',
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'h-auto w-full rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest active:scale-[0.98]',
        colorMap[color] || colorMap.sky
      )}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Guardando...
        </>
      ) : (
        label
      )}
    </Button>
  );
};

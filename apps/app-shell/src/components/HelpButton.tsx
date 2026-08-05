import React from 'react';
import { Button } from '@bocam/ui-core';
import { IconHelpCircle } from './Icons';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Componente: HelpButton - Botón "?" que abre la ayuda contextual del módulo
 * openspec/changes/ayuda-contextual-por-modulo
 * ---------------------------------------------------------------------------
 */

interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ onClick, className }) => (
  <Button
    type="button"
    variant="outline"
    size="icon"
    onClick={onClick}
    aria-label="Ayuda del módulo"
    title="Ayuda del módulo"
    className={className}
  >
    <IconHelpCircle className="h-4 w-4" />
  </Button>
);

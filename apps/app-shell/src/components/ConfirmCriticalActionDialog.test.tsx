import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmCriticalActionDialog } from '@bocam/ui-core';

describe('ConfirmCriticalActionDialog', () => {
  it('no ejecuta onConfirm hasta que el usuario confirma explícitamente', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmCriticalActionDialog
        open
        title="¿Aprobar esta Orden de Compra?"
        projectName="Torre Corporativa Norte"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(/Torre Corporativa Norte/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancelar no dispara onConfirm', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmCriticalActionDialog
        open
        title="¿Aprobar esta Orden de Compra?"
        projectName="Torre Corporativa Norte"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('no renderiza nada cuando open es false', () => {
    const { container } = render(
      <ConfirmCriticalActionDialog
        open={false}
        title="X"
        projectName="Y"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('respeta confirmDisabled para gatear la confirmación (ej. veredicto incompleto)', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmCriticalActionDialog
        open
        title="Firmar evaluación"
        projectName="Torre Corporativa Norte"
        confirmDisabled
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

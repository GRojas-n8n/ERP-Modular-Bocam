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

  it('sin dismissible explícito, un clic en el overlay cancela (comportamiento actual sin cambios)', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <ConfirmCriticalActionDialog
        open
        title="¿Aprobar esta Orden de Compra?"
        projectName="Torre Corporativa Norte"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(container.querySelector('.absolute.inset-0')!);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('con dismissible={false}, un clic en el overlay NO cierra ni cancela el diálogo', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <ConfirmCriticalActionDialog
        open
        dismissible={false}
        title="Crear Requisición"
        projectName="Torre Corporativa Norte"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(container.querySelector('.absolute.inset-0')!);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('Crear Requisición')).toBeInTheDocument();
  });

  it('con dismissible={false}, la tecla Escape NO cierra ni cancela el diálogo', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmCriticalActionDialog
        open
        dismissible={false}
        title="Crear Requisición"
        projectName="Torre Corporativa Norte"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('Crear Requisición')).toBeInTheDocument();
  });

  it('sin dismissible explícito, la tecla Escape cancela (comportamiento actual sin cambios)', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmCriticalActionDialog
        open
        title="¿Aprobar esta Orden de Compra?"
        projectName="Torre Corporativa Norte"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

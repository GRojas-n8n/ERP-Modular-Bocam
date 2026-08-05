import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpButton } from './HelpButton';

describe('HelpButton', () => {
  it('renderiza un botón de ayuda accesible y dispara onClick', () => {
    const onClick = vi.fn();
    render(<HelpButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: /ayuda/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

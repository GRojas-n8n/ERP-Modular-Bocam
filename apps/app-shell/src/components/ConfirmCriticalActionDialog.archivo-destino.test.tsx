import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfirmCriticalActionDialog } from '@bocam/ui-core';

/**
 * Ver openspec/changes/modal-confirmacion-antes-de-subir-archivos/.
 *
 * ConfirmCriticalActionDialog (packages/ui-core) ya se usa en 16+ lugares
 * para confirmar altas críticas mostrando el proyecto activo. Este change
 * le agrega props opcionales fileName/destination para reusarlo también
 * antes de procesar una carga de archivo (Catálogo, Explosión, APU,
 * Fichas Técnicas, Usuarios, Empleados, Proveedores), sin romper los usos
 * existentes que no las pasan.
 */

describe('ConfirmCriticalActionDialog — props de archivo (fileName/destination)', () => {
  it('muestra fileName y destination cuando se pasan', () => {
    render(
      <ConfirmCriticalActionDialog
        open
        title="Confirmar carga"
        projectName="Torre Corporativa Norte"
        fileName="explosion_torre_norte.xlsx"
        destination="Gerencia Técnica → Explosión de Insumos"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('explosion_torre_norte.xlsx')).toBeInTheDocument();
    expect(screen.getByText('Gerencia Técnica → Explosión de Insumos')).toBeInTheDocument();
    expect(screen.getByText(/Torre Corporativa Norte/)).toBeInTheDocument();
  });

  it('sin fileName/destination, el diálogo se comporta igual que antes (no rompe usos existentes de alta)', () => {
    render(
      <ConfirmCriticalActionDialog
        open
        title="¿Aprobar orden de compra?"
        projectName="Torre Corporativa Norte"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('¿Aprobar orden de compra?')).toBeInTheDocument();
    expect(screen.getByText(/Torre Corporativa Norte/)).toBeInTheDocument();
    expect(screen.queryByText(/\.xlsx/)).not.toBeInTheDocument();
  });
});

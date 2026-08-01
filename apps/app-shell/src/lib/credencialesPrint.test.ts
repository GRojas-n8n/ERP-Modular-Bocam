import { describe, expect, it } from 'vitest';
import { construirHojaSoloQR } from './credencialesPrint';

/**
 * Ver openspec/changes/descarga-qr-empleados-filtrada.
 * Hoja de solo QR: alternativa compacta a construirHojaCredenciales, sin foto,
 * sin reverso, sin contacto de emergencia — solo QR + nombre + número.
 */

describe('construirHojaSoloQR', () => {
  const items = [
    { numeroEmpleado: 'EMP-001', nombre: 'Juan Pérez', qrDataUrl: 'data:image/png;base64,fakeqr1' },
    { numeroEmpleado: 'EMP-002', nombre: 'Pedro González', qrDataUrl: 'data:image/png;base64,fakeqr2' },
  ];

  it('incluye el QR, nombre y número de cada empleado seleccionado', () => {
    const html = construirHojaSoloQR(items, 'Constructora Bocam', '#163a5c');

    expect(html).toContain('data:image/png;base64,fakeqr1');
    expect(html).toContain('EMP-001');
    expect(html).toContain('Juan Pérez');
    expect(html).toContain('data:image/png;base64,fakeqr2');
    expect(html).toContain('EMP-002');
    expect(html).toContain('Pedro González');
  });

  it('NO incluye foto, reverso ni contacto de emergencia', () => {
    const html = construirHojaSoloQR(items, 'Constructora Bocam', '#163a5c');

    expect(html).not.toContain('contacto');
    expect(html).not.toContain('emergencia');
    expect(html).not.toContain('class="photo"');
    expect(html).not.toContain('class="back"');
  });

  it('escapa caracteres HTML del nombre para evitar inyección', () => {
    const html = construirHojaSoloQR(
      [{ numeroEmpleado: 'EMP-003', nombre: '<script>alert(1)</script>', qrDataUrl: 'data:image/png;base64,x' }],
      'Constructora Bocam', '#163a5c',
    );

    expect(html).not.toContain('<script>alert(1)</script>');
  });
});

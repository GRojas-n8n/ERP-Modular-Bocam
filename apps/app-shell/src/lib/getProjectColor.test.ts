import { describe, expect, it } from 'vitest';
import { getProjectColor } from '@bocam/ui-core';

describe('getProjectColor', () => {
  it('devuelve siempre el mismo color para el mismo projectId', () => {
    const first = getProjectColor('proj-001');
    const second = getProjectColor('proj-001');
    expect(second).toEqual(first);
  });

  it('distribuye distintos projectId sobre la paleta', () => {
    const colors = ['proj-001', 'proj-002', 'proj-003'].map(id => getProjectColor(id).name);
    expect(new Set(colors).size).toBeGreaterThan(1);
  });

  it('devuelve un color por defecto estable para projectId vacío', () => {
    expect(getProjectColor(null)).toEqual(getProjectColor(undefined));
    expect(getProjectColor(undefined)).toEqual(getProjectColor(''));
  });
});

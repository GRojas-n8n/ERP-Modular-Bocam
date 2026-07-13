import { describe, expect, it } from 'vitest';
import { emparejarRenglonesConLineas, normalizarTexto, tokenizar } from './cotizacion-pdf-match';

interface LineaTest { id: string; insumo_descripcion: string; }
interface RenglonTest { descripcion: string; precio_unitario: string; }

describe('normalizarTexto', () => {
  it('pasa a minúsculas y quita acentos', () => {
    expect(normalizarTexto('Válvula ELÉCTRICA')).toBe('valvula electrica');
  });
});

describe('tokenizar', () => {
  it('descarta tokens de longitud <= 2', () => {
    expect(tokenizar('Mini Split de 1 Tonelada a 220V')).toEqual(['mini', 'split', 'tonelada', '220v']);
  });
});

describe('emparejarRenglonesConLineas', () => {
  it('reproduce el bug real de producción: empareja aunque las cadenas no compartan prefijo (2026-07-13, requisición 80ffce1d)', () => {
    const lineas: LineaTest[] = [
      { id: 'l1', insumo_descripcion: 'Mini Split Inverter de 1 Tonelada (12,000 BTU) a 220V' },
    ];
    const renglones: RenglonTest[] = [
      { descripcion: 'Minisplit Inverter 1 Ton 220V', precio_unitario: '8500' },
    ];

    const resultado = emparejarRenglonesConLineas(lineas, renglones);

    expect(resultado.get('l1')).toBe(renglones[0]);
  });

  it('empareja aunque las palabras estén en distinto orden', () => {
    const lineas: LineaTest[] = [{ id: 'l1', insumo_descripcion: 'Split Inverter Mini 1 Tonelada' }];
    const renglones: RenglonTest[] = [{ descripcion: 'Mini Split Inverter de 1 Tonelada', precio_unitario: '100' }];

    const resultado = emparejarRenglonesConLineas(lineas, renglones);

    expect(resultado.get('l1')).toBe(renglones[0]);
  });

  it('no empareja cuando no hay ninguna palabra significativa en común', () => {
    const lineas: LineaTest[] = [{ id: 'l1', insumo_descripcion: 'Mini Split Inverter 1 Tonelada' }];
    const renglones: RenglonTest[] = [{ descripcion: 'Cemento gris 50kg', precio_unitario: '250' }];

    const resultado = emparejarRenglonesConLineas(lineas, renglones);

    expect(resultado.get('l1')).toBeNull();
  });

  it('empareja cada línea con su renglón correspondiente cuando hay varias', () => {
    const lineas: LineaTest[] = [
      { id: 'l1', insumo_descripcion: 'Mini Split Inverter 1 Tonelada 220V' },
      { id: 'l2', insumo_descripcion: 'Cemento gris tipo CPC 30R bulto 50kg' },
    ];
    const renglones: RenglonTest[] = [
      { descripcion: 'Cemento CPC 30R 50kg gris', precio_unitario: '250' },
      { descripcion: 'Minisplit Inverter 1 Ton 220V', precio_unitario: '8500' },
    ];

    const resultado = emparejarRenglonesConLineas(lineas, renglones);

    expect(resultado.get('l1')).toBe(renglones[1]);
    expect(resultado.get('l2')).toBe(renglones[0]);
  });

  it('ignora acentos y mayúsculas al emparejar', () => {
    const lineas: LineaTest[] = [{ id: 'l1', insumo_descripcion: 'VÁLVULA de compuerta acero' }];
    const renglones: RenglonTest[] = [{ descripcion: 'valvula compuerta ACERO 2"', precio_unitario: '300' }];

    const resultado = emparejarRenglonesConLineas(lineas, renglones);

    expect(resultado.get('l1')).toBe(renglones[0]);
  });
});

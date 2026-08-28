import { describe, expect, it } from 'vitest';
import { parsearArchivoAPU, parsearArchivoExplosion } from './InsumosView';

/**
 * Ver openspec/changes/fix-500-importar-apu-explosion-filas-boilerplate/.
 *
 * Reproduce con filas sintéticas (mismo patrón que los archivos reales de
 * OPUS que causaban 500) el bug: una fila de firma/pie de página, con el
 * mismo texto repetido en todas las columnas por celdas combinadas, se
 * colaba como insumo con clave/unidad_medida de ~31 caracteres — supera
 * VarChar(20) de unidad_medida y tumbaba POST /insumos/importar-lote.
 */

const FIRMA = 'L.A.E. IVONNE OBREGON GUTIERREZ'; // 31 caracteres — excede VarChar(20)
const TITULO_REPETIDO = 'ANÁLISIS DETALLADO DE PRECIOS UNITARIOS'; // 39 caracteres — excede VarChar(20)

describe('parsearArchivoAPU', () => {
  const HEADER_ROW = ['', 'CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'RENDIMIENTO', 'COSTO UNITARIO'];

  it('descarta la fila de firma al final del reporte (no la agrega como insumo)', () => {
    const rows: (string | number)[][] = [
      ['', 'Clave:', 'Clave:', '2.1.1', '2.1.1'],
      HEADER_ROW,
      ['Mano de obra'],
      ['', 'HBD001', 'CABO DE OFICIOS', 'JOR', '0.1', '', 1323.72],
      Array(7).fill(FIRMA),
      Array(7).fill('REPRESENTANTE LEGAL'), // 19 caracteres — dentro de rango, pero igual no es un insumo real
    ];

    const { insumos } = parsearArchivoAPU(rows);

    expect(insumos.some(i => i.clave === FIRMA.toUpperCase())).toBe(false);
    expect(insumos.find(i => i.clave === 'HBD001')).toBeDefined();
  });

  it('descarta el título del reporte repetido a media hoja sin disparador de nuevo concepto', () => {
    const rows: (string | number)[][] = [
      ['', 'Clave:', 'Clave:', '2.1.1', '2.1.1'],
      HEADER_ROW,
      ['Mano de obra'],
      ['', 'HBD001', 'CABO DE OFICIOS', 'JOR', '0.1', '', 1323.72],
      Array(7).fill(TITULO_REPETIDO),
      ['', 'HBD005', 'OFICIAL ALBAÑIL', 'JOR', '1.0', '', 1193.77],
    ];

    const { insumos } = parsearArchivoAPU(rows);

    expect(insumos.some(i => i.unidad_medida === TITULO_REPETIDO.toUpperCase())).toBe(false);
    expect(insumos.map(i => i.clave)).toEqual(['HBD001', 'HBD005']);
  });

  it('sigue importando insumos reales con clave y unidad dentro de rango', () => {
    const rows: (string | number)[][] = [
      ['', 'Clave:', 'Clave:', '2.1.1', '2.1.1'],
      HEADER_ROW,
      ['Mano de obra'],
      ['', 'HBD001', 'CABO DE OFICIOS', 'JOR', '0.1', '', 1323.72],
    ];

    const { insumos } = parsearArchivoAPU(rows);

    expect(insumos).toEqual([
      expect.objectContaining({ clave: 'HBD001', descripcion: 'CABO DE OFICIOS', unidad_medida: 'JOR', costo_base: 1323.72 }),
    ]);
  });

  it('extrae la clave real del concepto ("2.1.1") aunque "Clave:" esté duplicada en celdas combinadas', () => {
    const rows: (string | number)[][] = [
      // "Clave:" repetida en 3 celdas (combinación) antes de llegar al valor real
      ['Clave:', 'Clave:', 'Clave:', '2.1.1', '2.1.1'],
      HEADER_ROW,
      ['Mano de obra'],
      ['', 'HBD001', 'CABO DE OFICIOS', 'JOR', '0.1', '', 1323.72],
    ];

    const { composiciones } = parsearArchivoAPU(rows);

    expect(composiciones).toHaveLength(1);
    expect(composiciones[0].concepto_clave).toBe('2.1.1');
  });
});

describe('parsearArchivoExplosion', () => {
  const HEADER_ROW = ['', 'CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'COSTO UNITARIO'];

  it('descarta la fila de firma al final del listado (no la agrega como insumo)', () => {
    const rows: (string | number)[][] = [
      HEADER_ROW,
      ['', 'MATG-001', 'ACERO ESTRUCTURAL HABILITADO EN MOLDE', 'KG', '6867.7268', 32.23],
      Array(6).fill(FIRMA),
      Array(6).fill('REPRESENTANTE LEGAL'),
    ];

    const insumos = parsearArchivoExplosion(rows);

    expect(insumos.some(i => i.clave === FIRMA.toUpperCase())).toBe(false);
    expect(insumos.find(i => i.clave === 'MATG-001')).toBeDefined();
  });

  it('sigue importando insumos reales con clave y unidad dentro de rango', () => {
    const rows: (string | number)[][] = [
      HEADER_ROW,
      ['', 'MATG-001', 'ACERO ESTRUCTURAL HABILITADO EN MOLDE', 'KG', '6867.7268', 32.23],
    ];

    const insumos = parsearArchivoExplosion(rows);

    expect(insumos).toEqual([
      expect.objectContaining({ clave: 'MATG-001', unidad_medida: 'KG', costo_base: 32.23 }),
    ]);
  });
});

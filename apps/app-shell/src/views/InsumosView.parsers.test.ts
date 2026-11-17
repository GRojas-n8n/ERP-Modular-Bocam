import { describe, expect, it } from 'vitest';
import { parsearArchivoAPU, parsearArchivoExplosion } from './InsumosView';

/**
 * Tests unitarios directos sobre los parsers de OPUS (funciones puras,
 * exportadas para esto). Spec:
 * openspec/changes/advertir-columnas-no-detectadas-parser-gt/
 *
 * Cubre `columnasNoConfirmadas`: cuando el encabezado real del archivo no
 * trae un nombre de columna secundaria reconocible (Unidad, Cantidad,
 * Rendimiento, Costo Unitario), el parser seguía leyendo esa columna desde
 * una posición por defecto SIN avisar — este es el mecanismo que ahora lo
 * hace visible.
 */

describe('parsearArchivoAPU — columnasNoConfirmadas', () => {
  it('encabezado completo: columnasNoConfirmadas vacío', () => {
    const rows: (string | number)[][] = [
      ['Clave: 1.1'],
      ['CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'RENDIMIENTO', 'COSTO UNITARIO'],
      ['Material'],
      ['CFM001', 'Tubo PVC', 'M', '10', '1', '65'],
    ];

    const resultado = parsearArchivoAPU(rows);

    expect(resultado.insumos).toHaveLength(1);
    expect(resultado.insumos[0].clave).toBe('CFM001');
    expect(resultado.columnasNoConfirmadas).toEqual([]);
  });

  it('encabezado sin columna de Costo Unitario reconocible', () => {
    const rows: (string | number)[][] = [
      ['Clave: 1.1'],
      ['CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'RENDIMIENTO', 'IMPORTE'],
      ['Material'],
      ['CFM001', 'Tubo PVC', 'M', '10', '1', '65'],
    ];

    const resultado = parsearArchivoAPU(rows);

    expect(resultado.columnasNoConfirmadas).toContain('Costo Unitario');
  });

  it('encabezado sin columna de Rendimiento reconocible', () => {
    const rows: (string | number)[][] = [
      ['Clave: 1.1'],
      ['CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'COSTO UNITARIO'],
      ['Material'],
      ['CFM001', 'Tubo PVC', 'M', '10', '65'],
    ];

    const resultado = parsearArchivoAPU(rows);

    expect(resultado.columnasNoConfirmadas).toContain('Rendimiento');
  });

  it('el encabezado se repite por cada concepto — la misma columna no confirmada no se duplica', () => {
    const rows: (string | number)[][] = [
      ['Clave: 1.1'],
      ['CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'RENDIMIENTO', 'IMPORTE'],
      ['Material'],
      ['CFM001', 'Tubo PVC', 'M', '10', '1', '65'],
      ['Clave: 1.2'],
      ['CLAVE', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD', 'RENDIMIENTO', 'IMPORTE'],
      ['Material'],
      ['CFM002', 'Codo PVC', 'PZA', '5', '1', '20'],
    ];

    const resultado = parsearArchivoAPU(rows);

    expect(resultado.columnasNoConfirmadas.filter(c => c === 'Costo Unitario')).toHaveLength(1);
  });
});

describe('parsearArchivoExplosion — columnasNoConfirmadas', () => {
  it('encabezado completo: columnasNoConfirmadas vacío', () => {
    const rows: (string | number)[][] = [
      ['CLAVE', 'DESCRIPCION Y ESPECIFICACION TECNICA', 'UNIDAD', 'CANTIDAD', 'COSTO UNITARIO', 'IMPORTE', 'PORCENTAJE'],
      ['CFM001', 'Tubo PVC', 'M', '13.44', '65', '873.6', '0.63%'],
    ];

    const resultado = parsearArchivoExplosion(rows);

    expect(resultado.insumos).toHaveLength(1);
    expect(resultado.insumos[0].clave).toBe('CFM001');
    expect(resultado.columnasNoConfirmadas).toEqual([]);
  });

  it('encabezado sin columna de Unidad reconocible', () => {
    const rows: (string | number)[][] = [
      ['CLAVE', 'DESCRIPCION', 'UNIDADES', 'CANTIDAD', 'COSTO UNITARIO'],
      ['CFM001', 'Tubo PVC', 'M', '13.44', '65'],
    ];

    const resultado = parsearArchivoExplosion(rows);

    expect(resultado.columnasNoConfirmadas).toContain('Unidad');
  });

  it('no regresión: valores extraídos idénticos al comportamiento esperado con encabezado completo', () => {
    const rows: (string | number)[][] = [
      ['CLAVE', 'DESCRIPCION Y ESPECIFICACION TECNICA', 'UNIDAD', 'CANTIDAD', 'COSTO UNITARIO', 'IMPORTE', 'PORCENTAJE'],
      ['Material'],
      ['CFM001', 'Tubo conduit PVC 2"', 'M', '13.44', '65.00', '873.60', '0.63%'],
      ['Mano de Obra'],
      ['CFAP001', 'Cabo de oficiales', 'JOR', '2', '350', '700', '0.5%'],
    ];

    const resultado = parsearArchivoExplosion(rows);

    expect(resultado.insumos).toEqual([
      expect.objectContaining({ clave: 'CFM001', descripcion: 'Tubo conduit PVC 2"', unidad_medida: 'M', tipo_insumo: 'MATERIAL', costo_base: 65 }),
      expect.objectContaining({ clave: 'CFAP001', descripcion: 'Cabo de oficiales', unidad_medida: 'JOR', tipo_insumo: 'MANO_DE_OBRA', costo_base: 350 }),
    ]);
  });
});

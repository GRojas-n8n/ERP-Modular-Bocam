import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { descargarPlantillaXlsx, parseCsvOrExcelFile, parseCsvOrExcelFileComoFilas } from './csvImport';

/**
 * Ver openspec/changes/migrar-xlsx-a-exceljs. Paridad de comportamiento del
 * motor de lectura/escritura tras reemplazar xlsx (SheetJS, con CVEs sin
 * parche) por exceljs + papaparse.
 */

async function construirXlsxDeEjemplo(): Promise<File> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Hoja1');
  ws.addRow(['RAZÓN SOCIAL', 'CANTIDAD', 'FECHA', 'NOTA']);
  ws.addRow(['Constructora Bocam SA de CV', 42, new Date('2026-01-15T00:00:00Z'), null]);
  const buffer = await wb.xlsx.writeBuffer();
  return new File([buffer as BlobPart], 'ejemplo.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('parseCsvOrExcelFile — .xlsx', () => {
  it('devuelve arreglo de objetos usando la primera fila como llaves', async () => {
    const file = await construirXlsxDeEjemplo();
    const rows = await parseCsvOrExcelFile(file);

    expect(rows).toHaveLength(1);
    expect(rows[0]['RAZÓN SOCIAL']).toBe('Constructora Bocam SA de CV');
  });

  it('convierte valores numéricos a texto', async () => {
    const file = await construirXlsxDeEjemplo();
    const rows = await parseCsvOrExcelFile(file);

    expect(rows[0]['CANTIDAD']).toBe('42');
  });

  it('convierte celdas vacías a cadena vacía, no null/undefined', async () => {
    const file = await construirXlsxDeEjemplo();
    const rows = await parseCsvOrExcelFile(file);

    expect(rows[0]['NOTA']).toBe('');
  });

  it('convierte una celda de fecha a texto (no deja un objeto Date)', async () => {
    const file = await construirXlsxDeEjemplo();
    const rows = await parseCsvOrExcelFile(file);

    expect(typeof rows[0]['FECHA']).toBe('string');
    expect(rows[0]['FECHA']).not.toBe('');
  });
});

describe('parseCsvOrExcelFile — .csv / .txt', () => {
  const csvTexto = 'RAZÓN SOCIAL,CANTIDAD,NOTA\nConstructora Bocam SA de CV,42,\n';

  it('.csv devuelve el mismo resultado observable que el .xlsx equivalente', async () => {
    const file = new File([csvTexto], 'ejemplo.csv', { type: 'text/csv' });
    const rows = await parseCsvOrExcelFile(file);

    expect(rows).toHaveLength(1);
    expect(rows[0]['RAZÓN SOCIAL']).toBe('Constructora Bocam SA de CV');
    expect(rows[0]['CANTIDAD']).toBe('42');
    expect(rows[0]['NOTA']).toBe('');
  });

  it('.txt delimitado por comas se trata igual que .csv', async () => {
    const file = new File([csvTexto], 'ejemplo.txt', { type: 'text/plain' });
    const rows = await parseCsvOrExcelFile(file);

    expect(rows).toHaveLength(1);
    expect(rows[0]['RAZÓN SOCIAL']).toBe('Constructora Bocam SA de CV');
  });
});

describe('parseCsvOrExcelFileComoFilas — modo header:1 (usado por InsumosView.tsx)', () => {
  it('devuelve un arreglo de arreglos, la fila de encabezados incluida como primer elemento', async () => {
    const file = await construirXlsxDeEjemplo();
    const filas = await parseCsvOrExcelFileComoFilas(file);

    expect(filas).toHaveLength(2);
    expect(filas[0]).toEqual(['RAZÓN SOCIAL', 'CANTIDAD', 'FECHA', 'NOTA']);
    expect(filas[1][0]).toBe('Constructora Bocam SA de CV');
    expect(filas[1][1]).toBe('42');
  });

  it('convierte celda vacía a cadena vacía dentro del arreglo, no null/undefined', async () => {
    const file = await construirXlsxDeEjemplo();
    const filas = await parseCsvOrExcelFileComoFilas(file);

    expect(filas[1][3]).toBe('');
  });

  it('funciona igual para .csv', async () => {
    const csvTexto = 'CLAVE,DESCRIPCION,UNIDAD\nA-001,Cemento gris,TON\n';
    const file = new File([csvTexto], 'ejemplo.csv', { type: 'text/csv' });
    const filas = await parseCsvOrExcelFileComoFilas(file);

    expect(filas[0]).toEqual(['CLAVE', 'DESCRIPCION', 'UNIDAD']);
    expect(filas[1]).toEqual(['A-001', 'Cemento gris', 'TON']);
  });
});

describe('descargarPlantillaXlsx', () => {
  it('genera un .xlsx con encabezados y fila de ejemplo, legible por exceljs', async () => {
    const urls: string[] = [];
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    let blobCapturado: Blob | null = null;
    URL.createObjectURL = ((blob: Blob) => {
      blobCapturado = blob;
      const url = 'blob:test-url';
      urls.push(url);
      return url;
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = (() => {}) as typeof URL.revokeObjectURL;

    try {
      await descargarPlantillaXlsx('plantilla-clientes.xlsx', [
        { header: 'razon_social', ejemplo: 'Constructora Bocam SA de CV' },
        { header: 'rfc' },
      ]);

      expect(blobCapturado).not.toBeNull();
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('No se pudo leer el blob de prueba.'));
        reader.readAsArrayBuffer(blobCapturado!);
      });
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.worksheets[0];

      expect(ws.getRow(1).getCell(1).value).toBe('razon_social');
      expect(ws.getRow(1).getCell(2).value).toBe('rfc');
      expect(ws.getRow(2).getCell(1).value).toBe('Constructora Bocam SA de CV');
      expect(ws.getRow(2).getCell(2).value == null || ws.getRow(2).getCell(2).value === '').toBe(true);
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });
});

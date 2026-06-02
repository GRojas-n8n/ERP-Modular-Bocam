import ExcelJS from 'exceljs';
import type { Response } from 'express';

export interface ConceptoPresupuesto {
  clave: string;
  descripcion: string;
  unidad_medida?: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
  precio_actual?: number | null;
  delta_pct?: number | null;
}

export interface PresupuestoData {
  version: number | string;
  proyecto?: string;
  tenant_nombre?: string;
  estado?: string;
  importe_total?: number;
  conceptos: ConceptoPresupuesto[];
}

export async function generatePresupuestoExcel(data: PresupuestoData, res: Response): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'iretum ERP — Bocam';
  wb.created = new Date();

  const ws = wb.addWorksheet('Presupuesto', { pageSetup: { orientation: 'landscape' } });

  // ── Título ────────────────────────────────────────────────────────────────────
  ws.mergeCells('A1:H1');
  ws.getCell('A1').value = data.tenant_nombre ?? 'Constructora';
  ws.getCell('A1').font = { size: 14, bold: true };

  ws.mergeCells('A2:H2');
  ws.getCell('A2').value = `PRESUPUESTO — Versión ${data.version}${data.proyecto ? ` | Proyecto: ${data.proyecto}` : ''}${data.estado ? ` | Estado: ${data.estado}` : ''}`;
  ws.getCell('A2').font = { size: 10, color: { argb: 'FF555555' } };

  ws.addRow([]);

  // ── Encabezados ───────────────────────────────────────────────────────────────
  const colDefs = [
    { header: 'Clave',           key: 'clave',          width: 12 },
    { header: 'Descripción',     key: 'descripcion',    width: 45 },
    { header: 'Unidad',          key: 'unidad',         width: 10 },
    { header: 'Cantidad',        key: 'cantidad',       width: 12 },
    { header: 'P. Unit. (orig)', key: 'p_orig',         width: 15 },
    { header: 'P. Unit. (act.)', key: 'p_actual',       width: 15 },
    { header: 'Δ%',              key: 'delta',          width: 9  },
    { header: 'Importe',         key: 'importe',        width: 15 },
  ];

  ws.columns = colDefs.map(c => ({ width: c.width }));

  const headerRow = ws.addRow(colDefs.map(c => c.header));
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
  });

  const moneyFmt  = '$#,##0.00';
  const pctFmt    = '0.00"%"';
  let totalImporte = 0;

  // ── Filas de conceptos ────────────────────────────────────────────────────────
  data.conceptos.forEach((c, idx) => {
    totalImporte += c.importe;

    const row = ws.addRow([
      c.clave,
      c.descripcion,
      c.unidad_medida ?? '',
      c.cantidad,
      c.precio_unitario,
      c.precio_actual ?? null,
      c.delta_pct ?? null,
      c.importe,
    ]);

    row.height = 16;
    const bg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF5F5F5';

    row.eachCell((cell, colNum) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      if (colNum === 4) {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
      } else if ([5, 6, 8].includes(colNum)) {
        cell.numFmt = moneyFmt;
        cell.alignment = { horizontal: 'right' };
      } else if (colNum === 7) {
        if (cell.value !== null && cell.value !== undefined) {
          cell.numFmt = pctFmt;
          cell.alignment = { horizontal: 'right' };
          const val = Number(cell.value);
          if (val > 0)       cell.font = { color: { argb: 'FF27AE60' } };
          else if (val < 0)  cell.font = { color: { argb: 'FFE74C3C' } };
        }
      }
    });

    // Importe en negrita
    row.getCell(8).font = { bold: true };
  });

  // ── Fila de total ─────────────────────────────────────────────────────────────
  const totRow = ws.addRow(['', 'TOTAL', '', '', '', '', '', totalImporte]);
  totRow.height = 18;
  totRow.eachCell((cell, colNum) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECF0F1' } };
    cell.border = { top: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
    if (colNum === 8) {
      cell.numFmt = moneyFmt;
      cell.alignment = { horizontal: 'right' };
    }
  });

  // ── Freeze header ─────────────────────────────────────────────────────────────
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  // ── Auto-filter en encabezados ────────────────────────────────────────────────
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to:   { row: 4, column: 8 },
  };

  await wb.xlsx.write(res);
}

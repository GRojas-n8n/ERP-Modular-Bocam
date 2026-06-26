import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import type { Response } from 'express';

export interface PartidaCPExport {
  concepto_id:            string;
  clave:                  string;
  descripcion:            string;
  categoria_predominante: string | null;
  presupuestado:          number;
  comprometido:           number;
  pagado:                 number;
  disponible:             number;
  pct_ejercido:           number;
}

export interface ControlPresupuestalData {
  proyectoId:              string;
  presupuesto_id:          string | null;
  total_presupuestado:     number;
  total_comprometido:      number;
  total_pagado:            number;
  total_disponible:        number;
  pct_ejercido:            number;
  parcial:                 boolean;
  advertencias:            string[];
  partidas:                PartidaCPExport[];
  sin_partida_comprometido?: number;
  sin_partida_pagado?:       number;
  proyecto_nombre?:          string;
  fecha_reporte?:            string;
}

const MXN = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const PCT = (n: number) => `${n}%`;

// ─── PDF ─────────────────────────────────────────────────────────────────────
export function generateControlPresupuestalPdf(data: ControlPresupuestalData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });

  const COLS = {
    clave:    36,
    desc:     120,
    cat:      300,
    presup:   370,
    comp:     440,
    pag:      510,
    disp:     580,
    pct:      650,
  };

  // Encabezado
  doc.fontSize(14).font('Helvetica-Bold').text('REPORTE DE CONTROL PRESUPUESTAL', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(
    `Proyecto: ${data.proyecto_nombre ?? data.proyectoId} | Fecha: ${data.fecha_reporte ?? new Date().toLocaleDateString('es-MX')}`,
    { align: 'center' }
  );
  if (data.parcial) {
    doc.moveDown(0.3).fontSize(9).fillColor('orange')
      .text(`⚠ Datos parciales: ${data.advertencias.join('; ')}`, { align: 'center' });
    doc.fillColor('black');
  }
  doc.moveDown(0.5);

  // Totales
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text(`Presupuestado: ${MXN(data.total_presupuestado)}  |  Comprometido: ${MXN(data.total_comprometido)}  |  Pagado: ${MXN(data.total_pagado)}  |  Disponible: ${MXN(data.total_disponible)}  |  % Ejercido: ${PCT(data.pct_ejercido)}`, { align: 'center' });
  doc.moveDown(0.5);

  // Header de tabla
  const rowY = () => doc.y;
  doc.font('Helvetica-Bold').fontSize(8);
  doc.text('Clave',         COLS.clave,  rowY(), { width: 78,  continued: true });
  doc.text('Descripción',   COLS.desc,   rowY(), { width: 174, continued: true });
  doc.text('Categoría',     COLS.cat,    rowY(), { width: 64,  continued: true });
  doc.text('Presupuestado', COLS.presup, rowY(), { width: 64,  continued: true, align: 'right' });
  doc.text('Comprometido',  COLS.comp,   rowY(), { width: 64,  continued: true, align: 'right' });
  doc.text('Pagado',        COLS.pag,    rowY(), { width: 64,  continued: true, align: 'right' });
  doc.text('Disponible',    COLS.disp,   rowY(), { width: 64,  continued: true, align: 'right' });
  doc.text('% Ejerce',      COLS.pct,    rowY(), { width: 40,  align: 'right' });
  doc.moveTo(36, rowY()).lineTo(760, rowY()).stroke();
  doc.moveDown(0.2);

  doc.font('Helvetica').fontSize(7.5);
  for (const p of data.partidas) {
    if (doc.y > 510) {
      doc.addPage({ size: 'A4', layout: 'landscape', margin: 36 });
    }
    const y = rowY();
    const isRisk = p.comprometido > p.presupuestado * 0.9;
    if (isRisk) doc.fillColor('#fef9c3');
    doc.rect(36, y - 2, 724, 13).fill();
    doc.fillColor(isRisk ? '#92400e' : 'black');

    doc.text(p.clave,                              COLS.clave,  y, { width: 78  });
    doc.text(p.descripcion.slice(0, 55),           COLS.desc,   y, { width: 174 });
    doc.text(p.categoria_predominante ?? '—',      COLS.cat,    y, { width: 64  });
    doc.text(MXN(p.presupuestado),                 COLS.presup, y, { width: 64,  align: 'right' });
    doc.text(MXN(p.comprometido),                  COLS.comp,   y, { width: 64,  align: 'right' });
    doc.text(MXN(p.pagado),                        COLS.pag,    y, { width: 64,  align: 'right' });
    doc.text(MXN(p.disponible),                    COLS.disp,   y, { width: 64,  align: 'right' });
    doc.text(PCT(p.pct_ejercido),                  COLS.pct,    y, { width: 40,  align: 'right' });
    doc.fillColor('black').moveDown(0.1);
  }

  // Fila sin partida si aplica
  const sp = (data.sin_partida_pagado ?? 0) + (data.sin_partida_comprometido ?? 0);
  if (sp > 0) {
    doc.moveDown(0.3).font('Helvetica-Oblique').fontSize(7.5).fillColor('#6b7280');
    doc.text(`[Sin partida asignada] — Comprometido: ${MXN(data.sin_partida_comprometido ?? 0)}  Pagado: ${MXN(data.sin_partida_pagado ?? 0)}`, 36);
    doc.fillColor('black');
  }

  return doc;
}

// ─── XLSX ────────────────────────────────────────────────────────────────────
export async function generateControlPresupuestalExcel(data: ControlPresupuestalData, res: Response): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'iretum ERP — Bocam';
  wb.created = new Date();

  const ws = wb.addWorksheet('Control Presupuestal', { pageSetup: { orientation: 'landscape' } });

  // Título
  ws.mergeCells('A1:I1');
  ws.getCell('A1').value = 'REPORTE DE CONTROL PRESUPUESTAL';
  ws.getCell('A1').font = { size: 13, bold: true };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  ws.mergeCells('A2:I2');
  ws.getCell('A2').value = `Proyecto: ${data.proyecto_nombre ?? data.proyectoId} | Fecha: ${data.fecha_reporte ?? new Date().toLocaleDateString('es-MX')}`;
  ws.getCell('A2').font = { size: 9, color: { argb: 'FF555555' } };
  ws.getCell('A2').alignment = { horizontal: 'center' };

  if (data.parcial) {
    ws.mergeCells('A3:I3');
    ws.getCell('A3').value = `⚠ Datos parciales: ${data.advertencias.join('; ')}`;
    ws.getCell('A3').font = { size: 9, color: { argb: 'FFB45309' } };
  }

  ws.addRow([]);

  // Columnas
  ws.columns = [
    { header: 'Clave',          key: 'clave',          width: 14 },
    { header: 'Descripción',    key: 'descripcion',    width: 42 },
    { header: 'Categoría',      key: 'categoria',      width: 16 },
    { header: 'Presupuestado',  key: 'presupuestado',  width: 18 },
    { header: 'Comprometido',   key: 'comprometido',   width: 18 },
    { header: 'Pagado',         key: 'pagado',         width: 18 },
    { header: 'Disponible',     key: 'disponible',     width: 18 },
    { header: '% Ejercido',     key: 'pct_ejercido',   width: 12 },
    { header: 'Estado',         key: 'estado',         width: 12 },
  ];

  // Header row style
  const headerRow = ws.lastRow ?? ws.getRow(5);
  ws.getRow(ws.rowCount).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a5f' } };
    cell.alignment = { horizontal: 'center' };
  });

  const mxnFmt = '"$"#,##0.00';
  const pctFmt = '0"%"';

  for (const p of data.partidas) {
    const isRisk = p.comprometido > p.presupuestado * 0.9;
    const row = ws.addRow({
      clave:         p.clave,
      descripcion:   p.descripcion,
      categoria:     p.categoria_predominante ?? '—',
      presupuestado: p.presupuestado,
      comprometido:  p.comprometido,
      pagado:        p.pagado,
      disponible:    p.disponible,
      pct_ejercido:  p.pct_ejercido,
      estado:        isRisk ? 'En riesgo' : p.pct_ejercido >= 100 ? 'Completado' : 'Normal',
    });

    ['presupuestado', 'comprometido', 'pagado', 'disponible'].forEach((k) => {
      row.getCell(k).numFmt = mxnFmt;
    });
    row.getCell('pct_ejercido').numFmt = pctFmt;

    if (isRisk) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
      });
    }
  }

  // Fila sin partida
  if ((data.sin_partida_pagado ?? 0) + (data.sin_partida_comprometido ?? 0) > 0) {
    const sinRow = ws.addRow({
      clave:         '[Sin partida]',
      descripcion:   'Pagos/OCs sin concepto WBS asignado',
      categoria:     '—',
      presupuestado: 0,
      comprometido:  data.sin_partida_comprometido ?? 0,
      pagado:        data.sin_partida_pagado ?? 0,
      disponible:    0,
      pct_ejercido:  0,
      estado:        'Sin clasificar',
    });
    sinRow.eachCell((cell) => {
      cell.font = { italic: true, color: { argb: 'FF6B7280' } };
    });
    ['comprometido', 'pagado'].forEach((k) => { sinRow.getCell(k).numFmt = mxnFmt; });
  }

  // Fila de totales
  ws.addRow({});
  const totRow = ws.addRow({
    clave:         'TOTALES',
    descripcion:   '',
    categoria:     '',
    presupuestado: data.total_presupuestado,
    comprometido:  data.total_comprometido,
    pagado:        data.total_pagado,
    disponible:    data.total_disponible,
    pct_ejercido:  data.pct_ejercido,
    estado:        '',
  });
  totRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  });
  ['presupuestado', 'comprometido', 'pagado', 'disponible'].forEach((k) => { totRow.getCell(k).numFmt = mxnFmt; });
  totRow.getCell('pct_ejercido').numFmt = pctFmt;

  await wb.xlsx.write(res);
}

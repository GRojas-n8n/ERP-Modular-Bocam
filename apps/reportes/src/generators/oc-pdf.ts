import PDFDocument from 'pdfkit';

export interface OcItem {
  descripcion: string;
  unidad?: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

export interface OcData {
  numero: string;
  fecha?: string;
  proyecto?: string;
  proveedor: string;
  proveedor_rfc?: string;
  proveedor_direccion?: string;
  items: OcItem[];
  subtotal: number;
  iva: number;
  total: number;
  aprobado_por?: string;
  tenant_nombre?: string;
  condiciones_pago?: string;
  notas?: string;
}

const GRAY  = '#555555';
const BLACK = '#111111';
const LIGHT = '#f5f5f5';
const COL_WIDTHS = [220, 55, 55, 80, 80]; // desc, unidad, cant, precio, importe

function fmt(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateOcPdf(oc: OcData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

  // ── Encabezado ───────────────────────────────────────────────────────────────
  doc.fontSize(18).font('Helvetica-Bold').fillColor(BLACK)
     .text(oc.tenant_nombre ?? 'Constructora', 50, 50);
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
     .text('ORDEN DE COMPRA', 50, 74);

  doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK)
     .text(`OC: ${oc.numero}`, 400, 50, { align: 'right', width: 145 });
  doc.font('Helvetica').fillColor(GRAY)
     .text(`Fecha: ${oc.fecha ?? new Date().toLocaleDateString('es-MX')}`, 400, 65, { align: 'right', width: 145 });
  if (oc.proyecto) {
    doc.text(`Proyecto: ${oc.proyecto}`, 400, 80, { align: 'right', width: 145 });
  }

  doc.moveTo(50, 105).lineTo(562, 105).strokeColor('#cccccc').stroke();

  // ── Proveedor ────────────────────────────────────────────────────────────────
  let y = 115;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(GRAY).text('PROVEEDOR', 50, y);
  y += 14;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK).text(oc.proveedor, 50, y);
  y += 13;
  if (oc.proveedor_rfc) {
    doc.fontSize(9).font('Helvetica').fillColor(GRAY).text(`RFC: ${oc.proveedor_rfc}`, 50, y);
    y += 12;
  }
  if (oc.proveedor_direccion) {
    doc.fontSize(9).font('Helvetica').fillColor(GRAY).text(oc.proveedor_direccion, 50, y, { width: 260 });
    y += 24;
  }
  if (oc.condiciones_pago) {
    doc.fontSize(9).font('Helvetica').fillColor(GRAY)
       .text(`Condiciones de pago: ${oc.condiciones_pago}`, 50, y);
    y += 12;
  }

  y += 10;
  doc.moveTo(50, y).lineTo(562, y).strokeColor('#cccccc').stroke();
  y += 8;

  // ── Tabla encabezado ─────────────────────────────────────────────────────────
  doc.rect(50, y, 512, 18).fill(LIGHT);
  const headers = ['Descripción', 'Unidad', 'Cant.', 'P. Unit.', 'Importe'];
  let x = 50;
  headers.forEach((h, i) => {
    const align = i >= 2 ? 'right' : 'left';
    doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK)
       .text(h, x + 3, y + 4, { width: COL_WIDTHS[i] - 6, align });
    x += COL_WIDTHS[i];
  });
  y += 18;

  // ── Filas de ítems ───────────────────────────────────────────────────────────
  oc.items.forEach((item, idx) => {
    if (idx % 2 === 0) doc.rect(50, y, 512, 18).fill('#fafafa');
    x = 50;
    const row = [
      item.descripcion,
      item.unidad ?? '—',
      String(item.cantidad),
      `$${fmt(item.precio_unitario)}`,
      `$${fmt(item.importe)}`,
    ];
    row.forEach((cell, i) => {
      const align = i >= 2 ? 'right' : 'left';
      doc.fontSize(8).font('Helvetica').fillColor(BLACK)
         .text(cell, x + 3, y + 4, { width: COL_WIDTHS[i] - 6, align, lineBreak: false });
      x += COL_WIDTHS[i];
    });
    y += 18;
  });

  doc.moveTo(50, y).lineTo(562, y).strokeColor('#cccccc').stroke();
  y += 8;

  // ── Totales ──────────────────────────────────────────────────────────────────
  const totals: [string, number][] = [
    ['Subtotal', oc.subtotal],
    ['IVA (16%)', oc.iva],
    ['TOTAL', oc.total],
  ];
  totals.forEach(([label, val], i) => {
    const bold = i === 2;
    doc.fontSize(bold ? 10 : 9)
       .font(bold ? 'Helvetica-Bold' : 'Helvetica')
       .fillColor(BLACK)
       .text(label, 370, y, { width: 110, align: 'right' })
       .text(`$${fmt(val)}`, 490, y, { width: 72, align: 'right' });
    y += bold ? 16 : 14;
  });

  y += 20;

  // ── Notas ────────────────────────────────────────────────────────────────────
  if (oc.notas) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GRAY).text('NOTAS:', 50, y);
    y += 12;
    doc.fontSize(9).font('Helvetica').fillColor(BLACK).text(oc.notas, 50, y, { width: 512 });
    y += 30;
  }

  // ── Firma ────────────────────────────────────────────────────────────────────
  if (y < 620) {
    y = Math.max(y, 580);
    doc.moveTo(350, y).lineTo(510, y).strokeColor(BLACK).stroke();
    doc.fontSize(9).font('Helvetica').fillColor(GRAY)
       .text(oc.aprobado_por ? `Autorizado por: ${oc.aprobado_por}` : 'Firma de autorización', 340, y + 5, { width: 175, align: 'center' });
  }

  return doc;
}

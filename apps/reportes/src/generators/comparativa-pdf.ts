import PDFDocument from 'pdfkit';

export interface ComparativaLinea {
  descripcion: string;
  unidad?: string;
  cantidad: number;
  precios: Record<string, number>; // proveedor_id → precio_unitario
  importes: Record<string, number>; // proveedor_id → importe
}

export interface ComparativaData {
  titulo: string;
  fecha?: string;
  proyecto?: string;
  proveedores: Array<{ id: string; nombre: string }>;
  lineas: ComparativaLinea[];
  totales: Record<string, number>; // proveedor_id → total
  ganador_id?: string;
  tenant_nombre?: string;
}

const GRAY     = '#555555';
const BLACK    = '#111111';
const LIGHT    = '#f5f5f5';
const GANADOR  = '#d4edda'; // verde claro

function fmt(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateComparativaPdf(data: ComparativaData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 40, size: 'LETTER', layout: 'landscape' });

  const provs = data.proveedores ?? [];
  const pageW = 752; // landscape letter

  // ── Encabezado ───────────────────────────────────────────────────────────────
  doc.fontSize(16).font('Helvetica-Bold').fillColor(BLACK)
     .text(data.tenant_nombre ?? 'Constructora', 40, 40);
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
     .text('CUADRO COMPARATIVO DE PRECIOS', 40, 60);

  doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK)
     .text(data.titulo, 40, 80, { width: pageW - 80 });
  doc.fontSize(9).font('Helvetica').fillColor(GRAY)
     .text(`Fecha: ${data.fecha ?? new Date().toLocaleDateString('es-MX')}${data.proyecto ? `  |  Proyecto: ${data.proyecto}` : ''}`, 40, 95);

  doc.moveTo(40, 112).lineTo(pageW - 40, 112).strokeColor('#cccccc').stroke();

  // Calcular anchos de columna dinámicamente
  const descW = 180;
  const cantW = 45;
  const provW = provs.length > 0 ? Math.floor((pageW - 80 - descW - cantW) / provs.length) : 80;
  const totalRowW = descW + cantW + provW * provs.length;

  let y = 120;

  // ── Encabezado de tabla ──────────────────────────────────────────────────────
  doc.rect(40, y, totalRowW, 20).fill(LIGHT);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK)
     .text('Descripción', 43, y + 5, { width: descW - 6 })
     .text('Cant.', 43 + descW, y + 5, { width: cantW - 4, align: 'right' });

  provs.forEach((prov, i) => {
    const px = 43 + descW + cantW + i * provW;
    const isWinner = prov.id === data.ganador_id;
    if (isWinner) doc.rect(40 + descW + cantW + i * provW, y, provW, 20).fill(GANADOR);
    doc.fontSize(7).font('Helvetica-Bold').fillColor(BLACK)
       .text(prov.nombre, px, y + 5, { width: provW - 4, align: 'center', lineBreak: false });
    if (isWinner) {
      doc.fontSize(6).fillColor('#155724').text('✓ GANADOR', px, y + 13, { width: provW - 4, align: 'center' });
    }
  });

  y += 20;

  // ── Filas de líneas ──────────────────────────────────────────────────────────
  (data.lineas ?? []).forEach((linea, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
    doc.rect(40, y, totalRowW, 18).fill(bg);

    doc.fontSize(8).font('Helvetica').fillColor(BLACK)
       .text(linea.descripcion, 43, y + 4, { width: descW - 6, lineBreak: false })
       .text(`${linea.cantidad} ${linea.unidad ?? ''}`, 43 + descW, y + 4, { width: cantW - 4, align: 'right', lineBreak: false });

    provs.forEach((prov, i) => {
      const px = 43 + descW + cantW + i * provW;
      const importe = linea.importes?.[prov.id];
      const isWinner = prov.id === data.ganador_id;
      if (isWinner) doc.rect(40 + descW + cantW + i * provW, y, provW, 18).fill('#f0fff4');
      doc.fontSize(8).font('Helvetica').fillColor(BLACK)
         .text(importe !== undefined ? `$${fmt(importe)}` : '—', px, y + 4, { width: provW - 4, align: 'right', lineBreak: false });
    });

    y += 18;
  });

  // Línea separadora totales
  doc.moveTo(40, y).lineTo(40 + totalRowW, y).strokeColor('#cccccc').stroke();
  y += 4;

  // ── Fila de totales ──────────────────────────────────────────────────────────
  doc.rect(40, y, totalRowW, 20).fill(LIGHT);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK)
     .text('TOTAL', 43, y + 5, { width: descW - 6 });

  provs.forEach((prov, i) => {
    const px = 43 + descW + cantW + i * provW;
    const total = data.totales?.[prov.id];
    const isWinner = prov.id === data.ganador_id;
    if (isWinner) doc.rect(40 + descW + cantW + i * provW, y, provW, 20).fill(GANADOR);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK)
       .text(total !== undefined ? `$${fmt(total)}` : '—', px, y + 5, { width: provW - 4, align: 'right', lineBreak: false });
  });

  return doc;
}

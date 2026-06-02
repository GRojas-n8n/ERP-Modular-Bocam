import PDFDocument from 'pdfkit';

export interface EmpleadoPrenomina {
  nombre: string;
  puesto?: string;
  dias: number;
  salario_diario: number;
  percepciones: number;
  imss: number;
  isr: number;
  otras_deducciones?: number;
  neto: number;
}

export interface PrenominaData {
  periodo: string;
  proyecto?: string;
  tenant_nombre?: string;
  empleados: EmpleadoPrenomina[];
}

const GRAY  = '#555555';
const BLACK = '#111111';
const LIGHT = '#f5f5f5';

function fmt(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Anchos de columna: nombre, puesto, días, sal.diario, percepciones, IMSS, ISR, otras, neto
const COLS = [130, 90, 35, 60, 70, 55, 55, 55, 62];
const HDRS = ['Nombre', 'Puesto', 'Días', 'S. Diario', 'Percepciones', 'IMSS', 'ISR', 'Otras Ded.', 'Neto'];

export function generatePrenominaPdf(data: PrenominaData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 40, size: 'LETTER', layout: 'landscape' });

  const pageW = 752;

  // ── Encabezado ───────────────────────────────────────────────────────────────
  doc.fontSize(16).font('Helvetica-Bold').fillColor(BLACK)
     .text(data.tenant_nombre ?? 'Constructora', 40, 40);
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
     .text('PRE-NÓMINA', 40, 60);

  doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK)
     .text(`Período: ${data.periodo}`, 40, 78);
  if (data.proyecto) {
    doc.fontSize(9).font('Helvetica').fillColor(GRAY)
       .text(`Proyecto: ${data.proyecto}`, 40, 92);
  }

  doc.moveTo(40, 108).lineTo(pageW - 40, 108).strokeColor('#cccccc').stroke();

  let y = 116;

  // ── Encabezado de tabla ──────────────────────────────────────────────────────
  doc.rect(40, y, 672, 18).fill(LIGHT);
  let x = 40;
  HDRS.forEach((h, i) => {
    const align = i >= 2 ? 'right' : 'left';
    doc.fontSize(7).font('Helvetica-Bold').fillColor(BLACK)
       .text(h, x + 2, y + 5, { width: COLS[i] - 4, align, lineBreak: false });
    x += COLS[i];
  });
  y += 18;

  // ── Filas de empleados ───────────────────────────────────────────────────────
  let totPercepciones = 0, totImss = 0, totIsr = 0, totOtras = 0, totNeto = 0;

  data.empleados.forEach((emp, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
    doc.rect(40, y, 672, 17).fill(bg);

    const otras = emp.otras_deducciones ?? 0;
    totPercepciones += emp.percepciones;
    totImss += emp.imss;
    totIsr += emp.isr;
    totOtras += otras;
    totNeto += emp.neto;

    const cells = [
      emp.nombre,
      emp.puesto ?? '—',
      String(emp.dias),
      `$${fmt(emp.salario_diario)}`,
      `$${fmt(emp.percepciones)}`,
      `$${fmt(emp.imss)}`,
      `$${fmt(emp.isr)}`,
      `$${fmt(otras)}`,
      `$${fmt(emp.neto)}`,
    ];

    x = 40;
    cells.forEach((cell, i) => {
      const align = i >= 2 ? 'right' : 'left';
      doc.fontSize(7.5).font('Helvetica').fillColor(BLACK)
         .text(cell, x + 2, y + 4, { width: COLS[i] - 4, align, lineBreak: false });
      x += COLS[i];
    });
    y += 17;
  });

  // ── Totales ──────────────────────────────────────────────────────────────────
  doc.moveTo(40, y).lineTo(712, y).strokeColor('#cccccc').stroke();
  y += 3;

  doc.rect(40, y, 672, 18).fill(LIGHT);
  const totCells = [
    'TOTALES', '', '', '',
    `$${fmt(totPercepciones)}`,
    `$${fmt(totImss)}`,
    `$${fmt(totIsr)}`,
    `$${fmt(totOtras)}`,
    `$${fmt(totNeto)}`,
  ];
  x = 40;
  totCells.forEach((cell, i) => {
    const align = i >= 2 ? 'right' : 'left';
    doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK)
       .text(cell, x + 2, y + 4, { width: COLS[i] - 4, align, lineBreak: false });
    x += COLS[i];
  });

  y += 28;
  doc.fontSize(8).font('Helvetica').fillColor(GRAY)
     .text(`Total empleados: ${data.empleados.length}`, 40, y);

  return doc;
}

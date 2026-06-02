import ExcelJS, { Cell } from 'exceljs';
import type { Response } from 'express';
import type { EmpleadoPrenomina, PrenominaData } from './prenomina-pdf';

export async function generatePrenominaExcel(data: PrenominaData, res: Response): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'iretum ERP — Bocam';
  wb.created = new Date();

  const ws = wb.addWorksheet('Prenomina', { pageSetup: { orientation: 'landscape' } });

  // ── Título ────────────────────────────────────────────────────────────────────
  ws.mergeCells('A1:I1');
  ws.getCell('A1').value = data.tenant_nombre ?? 'Constructora';
  ws.getCell('A1').font = { size: 14, bold: true };

  ws.mergeCells('A2:I2');
  ws.getCell('A2').value = `PRE-NÓMINA — Período: ${data.periodo}${data.proyecto ? ` | Proyecto: ${data.proyecto}` : ''}`;
  ws.getCell('A2').font = { size: 10, color: { argb: 'FF555555' } };

  ws.addRow([]);

  // ── Encabezados ───────────────────────────────────────────────────────────────
  const headerRow = ws.addRow([
    'Nombre', 'Puesto', 'Días', 'Salario Diario',
    'Percepciones', 'IMSS', 'ISR', 'Otras Deducciones', 'Neto a Pagar',
  ]);
  headerRow.eachCell((cell: Cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    };
  });
  headerRow.height = 20;

  const moneyFmt = '$#,##0.00';
  let totPerc = 0, totImss = 0, totIsr = 0, totOtras = 0, totNeto = 0;

  // ── Filas de empleados ────────────────────────────────────────────────────────
  data.empleados.forEach((emp: EmpleadoPrenomina, idx: number) => {
    const otras = emp.otras_deducciones ?? 0;
    totPerc  += emp.percepciones;
    totImss  += emp.imss;
    totIsr   += emp.isr;
    totOtras += otras;
    totNeto  += emp.neto;

    const row = ws.addRow([
      emp.nombre,
      emp.puesto ?? '',
      emp.dias,
      emp.salario_diario,
      emp.percepciones,
      emp.imss,
      emp.isr,
      otras,
      emp.neto,
    ]);

    row.height = 16;
    const bg = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF5F5F5';
    row.eachCell((cell: Cell, colNumber: number) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      if (colNumber >= 4) {
        cell.numFmt = moneyFmt;
        cell.alignment = { horizontal: 'right' };
      }
    });
    // Neto en negrita
    row.getCell(9).font = { bold: true };
  });

  // ── Fila de totales ───────────────────────────────────────────────────────────
  const totRow = ws.addRow([
    'TOTALES', '', '', '',
    totPerc, totImss, totIsr, totOtras, totNeto,
  ]);
  totRow.height = 18;
  totRow.eachCell((cell: Cell, colNumber: number) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECF0F1' } };
    if (colNumber >= 5) {
      cell.numFmt = moneyFmt;
      cell.alignment = { horizontal: 'right' };
    }
    cell.border = { top: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
  });

  // ── Anchos de columna ─────────────────────────────────────────────────────────
  ws.columns = [
    { width: 30 }, // nombre
    { width: 20 }, // puesto
    { width: 8  }, // días
    { width: 14 }, // sal. diario
    { width: 15 }, // percepciones
    { width: 12 }, // IMSS
    { width: 12 }, // ISR
    { width: 16 }, // otras
    { width: 14 }, // neto
  ];

  // ── Freeze header row ─────────────────────────────────────────────────────────
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  await wb.xlsx.write(res);
}

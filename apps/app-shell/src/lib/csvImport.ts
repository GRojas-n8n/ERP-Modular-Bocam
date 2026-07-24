import ExcelJS from 'exceljs';
import Papa from 'papaparse';

const PALABRAS_CONECTORAS = new Set(['de', 'del', 'la', 'el', 'los', 'las']);

function normalizarEncabezado(texto: string): string {
  const sinAcentos = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  const palabras = sinAcentos
    .split(/[\s_-]+/)
    .filter(p => p.length > 0 && !PALABRAS_CONECTORAS.has(p));
  return palabras.join('_');
}

/**
 * Busca en `row` la primera columna cuyo encabezado, normalizado (sin
 * acentos, en minúsculas, espacios/guiones equivalentes a "_", sin
 * palabras conectoras como "de"/"del"), coincida con alguno de `alias`
 * (también normalizados). Reutilizable por cualquier import masivo
 * (Clientes, Proveedores, Empleados) — un encabezado natural en español
 * ("RAZÓN SOCIAL", "Fecha de Ingreso") empareja igual que su forma
 * snake_case exacta.
 */
export function leerColumnaCsv(row: Record<string, string>, ...alias: string[]): string {
  const aliasNormalizados = alias.map(normalizarEncabezado);
  for (const key of Object.keys(row)) {
    if (aliasNormalizados.includes(normalizarEncabezado(key))) {
      return String(row[key] ?? '').trim();
    }
  }
  return '';
}

/**
 * Convierte el valor de una celda de exceljs a texto plano, replicando el
 * efecto de `raw:false` de la librería anterior: números y fechas se
 * devuelven como texto, celdas vacías como cadena vacía (nunca
 * null/undefined). Fórmulas devuelven su resultado calculado; texto
 * enriquecido concatena sus fragmentos.
 */
function celdaATexto(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  if (typeof valor === 'object') {
    if ('richText' in valor) return valor.richText.map(r => r.text).join('');
    if ('text' in valor) return String((valor as { text: unknown }).text ?? '');
    if ('result' in valor) return celdaATexto((valor as { result: ExcelJS.CellValue }).result);
    if ('error' in valor) return '';
    return '';
  }
  return String(valor);
}

function hojaAObjetos(ws: ExcelJS.Worksheet): Record<string, string>[] {
  const encabezados: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumero) => {
    encabezados[colNumero] = celdaATexto(cell.value);
  });

  const filas: Record<string, string>[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const obj: Record<string, string> = {};
    let tieneValor = false;
    for (let c = 1; c < encabezados.length; c++) {
      const clave = encabezados[c];
      if (!clave) continue;
      const valor = celdaATexto(row.getCell(c).value);
      if (valor !== '') tieneValor = true;
      obj[clave] = valor;
    }
    if (tieneValor) filas.push(obj);
  }
  return filas;
}

function hojaAArregloDeArreglos(ws: ExcelJS.Worksheet): string[][] {
  // `row.cellCount` refleja la última celda con valor de ESA fila — una celda
  // vacía al final de una fila la excluiría en vez de devolver ''. Se usa el
  // ancho de la hoja completa para que todas las filas tengan la misma
  // longitud, igual que `sheet_to_json({header:1, defval:''})`.
  const anchoHoja = ws.columnCount;
  const filas: string[][] = [];
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const arr: string[] = [];
    for (let c = 1; c <= anchoHoja; c++) {
      arr.push(celdaATexto(row.getCell(c).value));
    }
    filas.push(arr);
  }
  return filas;
}

function leerArchivoComoTexto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsText(file, 'UTF-8');
  });
}

function leerArchivoComoArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

async function parseCsvTexto(texto: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(texto, {
      header: true,
      skipEmptyLines: true,
      complete: (resultado) => {
        const encabezados = resultado.meta.fields ?? [];
        const filas = resultado.data.map(fila => {
          const obj: Record<string, string> = {};
          for (const encabezado of encabezados) {
            obj[encabezado] = fila[encabezado] ?? '';
          }
          return obj;
        });
        resolve(filas);
      },
      error: (error: Error) => reject(error),
    });
  });
}

/**
 * Parsea un archivo CSV o Excel a un arreglo de objetos, usando la primera
 * fila como nombres de columna (mismo motor que ya usa InsumosView.tsx para
 * leer presupuestos OPUS). Reutilizable por cualquier import masivo
 * (Clientes, Proveedores, Empleados) — no asume un shape de columnas fijo.
 */
export async function parseCsvOrExcelFile(file: File): Promise<Record<string, string>[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'txt') {
    const texto = await leerArchivoComoTexto(file);
    return parseCsvTexto(texto);
  }
  const buffer = await leerArchivoComoArrayBuffer(file);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  return hojaAObjetos(ws);
}

/**
 * Igual que `parseCsvOrExcelFile`, pero devuelve un arreglo de arreglos
 * (una fila = un arreglo de valores de celda), incluida la fila de
 * encabezados como primer elemento — usado por InsumosView.tsx para leer
 * presupuestos OPUS con formato de columnas fijo por posición.
 */
export async function parseCsvOrExcelFileComoFilas(file: File): Promise<string[][]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'txt') {
    const texto = await leerArchivoComoTexto(file);
    return new Promise((resolve, reject) => {
      Papa.parse<string[]>(texto, {
        header: false,
        skipEmptyLines: true,
        complete: (resultado) => resolve(resultado.data),
        error: (error: Error) => reject(error),
      });
    });
  }
  const buffer = await leerArchivoComoArrayBuffer(file);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  return hojaAArregloDeArreglos(ws);
}

/**
 * Genera y descarga un .xlsx con una fila de encabezados + una fila de
 * ejemplo. Reutilizable por cualquier pantalla de carga masiva (Clientes,
 * Proveedores, Empleados) — cada vista pasa exactamente los mismos alias
 * que ya usa en su `construirPreviewImport*`, así que la plantilla nunca
 * puede desincronizarse del conjunto de columnas que el parser reconoce.
 */
export async function descargarPlantillaXlsx(
  nombreArchivo: string,
  columnas: { header: string; ejemplo?: string }[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Plantilla');
  ws.addRow(columnas.map(c => c.header));
  ws.addRow(columnas.map(c => c.ejemplo ?? ''));

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

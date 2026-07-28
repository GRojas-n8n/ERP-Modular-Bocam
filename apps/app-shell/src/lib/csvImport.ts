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

// Cada cuántas filas se cede el control al event loop mientras se procesa un
// .xlsx con `onFila` (ver openspec/changes/feedback-en-vivo-carga-masiva
// design.md D2) — permite que React pinte el progreso conforme se validan
// lotes de filas, sin bloquear la UI durante todo el archivo.
const LOTE_CESION_XLSX = 25;

async function hojaAObjetos(
  ws: ExcelJS.Worksheet,
  onFila?: (fila: Record<string, string>, indice: number) => void,
): Promise<Record<string, string>[]> {
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
    if (tieneValor) {
      const indice = filas.length;
      filas.push(obj);
      onFila?.(obj, indice);
      if (onFila && indice % LOTE_CESION_XLSX === LOTE_CESION_XLSX - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
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

/**
 * Parsea CSV fila por fila con `step` (streaming real de Papa Parse) en vez
 * de `complete` (modo batch) — cada fila se entrega a `onFila` apenas se
 * parsea. Recibe el `File` directamente (no un string ya leído): Papa Parse
 * lee archivos File/Blob en chunks vía FileReader y cede el control al
 * event loop entre chunks, así que `step` se dispara en turnos reales del
 * event loop y React puede pintar el progreso conforme llega — a
 * diferencia de parsear un string ya materializado en memoria, donde
 * `step` corre de un tirón sin ceder el control aunque exista el callback.
 * Ver openspec/changes/feedback-en-vivo-carga-masiva design.md.
 */
async function parseCsvArchivo(
  file: File,
  onFila?: (fila: Record<string, string>, indice: number) => void,
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const filas: Record<string, string>[] = [];
    let encabezados: string[] = [];
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      // Sin esto, Papa Parse lee un archivo pequeño/mediano completo en un
      // solo chunk de FileReader y `step` corre de un tirón igual que con un
      // string — un chunk chico fuerza lecturas incrementales reales incluso
      // para los archivos de cientos/pocos miles de filas típicos de este
      // proyecto (ver openspec/changes/feedback-en-vivo-carga-masiva).
      chunkSize: 64 * 1024,
      step: (resultado) => {
        if (encabezados.length === 0) encabezados = resultado.meta.fields ?? [];
        const obj: Record<string, string> = {};
        for (const encabezado of encabezados) {
          obj[encabezado] = resultado.data[encabezado] ?? '';
        }
        const indice = filas.length;
        filas.push(obj);
        onFila?.(obj, indice);
      },
      complete: () => resolve(filas),
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
/**
 * `onFila`, si se pasa, se invoca conforme cada fila se procesa — en CSV es
 * streaming real (Papa Parse `step`); en XLSX la lectura del buffer sigue
 * siendo de una sola pasada (limitación de `exceljs` en navegador, ver
 * design.md), pero la construcción del arreglo de filas cede el control al
 * event loop cada 25 filas para que la UI pueda pintar el progreso.
 */
export async function parseCsvOrExcelFile(
  file: File,
  onFila?: (fila: Record<string, string>, indice: number) => void,
): Promise<Record<string, string>[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'txt') {
    return parseCsvArchivo(file, onFila);
  }
  const buffer = await leerArchivoComoArrayBuffer(file);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  return hojaAObjetos(ws, onFila);
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

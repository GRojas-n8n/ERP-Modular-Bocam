import * as XLSX from 'xlsx';

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
 * Parsea un archivo CSV o Excel a un arreglo de objetos, usando la primera
 * fila como nombres de columna (mismo motor XLSX que ya usa InsumosView.tsx
 * para leer presupuestos OPUS). Reutilizable por cualquier import masivo
 * (Clientes, Proveedores, Empleados) — no asume un shape de columnas fijo.
 */
export function parseCsvOrExcelFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const wb = ext === 'csv' || ext === 'txt'
          ? XLSX.read(data as string, { type: 'string' })
          : XLSX.read(data as ArrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
          defval: '',
          raw: false,
        });
        resolve(rows);
      } catch (e: any) {
        reject(new Error(`Error al leer el archivo: ${e.message}`));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));

    if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Genera y descarga un .xlsx con una fila de encabezados + una fila de
 * ejemplo. Reutilizable por cualquier pantalla de carga masiva (Clientes,
 * Proveedores, Empleados) — cada vista pasa exactamente los mismos alias
 * que ya usa en su `construirPreviewImport*`, así que la plantilla nunca
 * puede desincronizarse del conjunto de columnas que el parser reconoce.
 */
export function descargarPlantillaXlsx(
  nombreArchivo: string,
  columnas: { header: string; ejemplo?: string }[]
): void {
  const encabezados = columnas.map(c => c.header);
  const ejemplo = columnas.map(c => c.ejemplo ?? '');
  const ws = XLSX.utils.aoa_to_sheet([encabezados, ejemplo]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
  XLSX.writeFile(wb, nombreArchivo);
}

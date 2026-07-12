import * as XLSX from 'xlsx';

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

// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Tablas SAT/IMSS 2025 — actualizar en enero de cada ejercicio fiscal.
// Fuente: DOF 2024-12-27 (tablas ISR Art. 96 LISR) y ACUERDO CONASAMI 2025 (UMA).
// -----------------------------------------------------------------------------

export const UMA_DIARIO_2025 = 113.14;

// ── ISR Semanal 2025 (SAT) ────────────────────────────────────────────────
interface TramoISR { li: number; ls: number; cuota: number; tasa: number; }

export const ISR_TABLA_SEMANAL_2025: TramoISR[] = [
  { li: 0.01,    ls: 172.92,   cuota: 0.00,    tasa: 0.0192 },
  { li: 172.93,  ls: 1467.87,  cuota: 3.32,    tasa: 0.0640 },
  { li: 1467.88, ls: 2578.12,  cuota: 86.26,   tasa: 0.1088 },
  { li: 2578.13, ls: 2994.12,  cuota: 206.82,  tasa: 0.1600 },
  { li: 2994.13, ls: 3584.62,  cuota: 273.48,  tasa: 0.1792 },
  { li: 3584.63, ls: 7230.69,  cuota: 379.07,  tasa: 0.2136 },
  { li: 7230.70, ls: 11371.00, cuota: 1157.73, tasa: 0.2352 },
  { li: 11371.01,ls: 16030.77, cuota: 2131.55, tasa: 0.3000 },
  { li: 16030.78,ls: 30576.92, cuota: 3529.44, tasa: 0.3200 },
  { li: 30576.93,ls: 40788.46, cuota: 8173.69, tasa: 0.3400 },
  { li: 40788.47,ls: Infinity,  cuota: 11645.15,tasa: 0.3500 },
];

// ── ISR Quincenal 2025 (SAT) ──────────────────────────────────────────────
export const ISR_TABLA_QUINCENAL_2025: TramoISR[] = [
  { li: 0.01,    ls: 371.83,   cuota: 0.00,    tasa: 0.0192 },
  { li: 371.84,  ls: 3153.45,  cuota: 7.14,    tasa: 0.0640 },
  { li: 3153.46, ls: 5539.56,  cuota: 185.27,  tasa: 0.1088 },
  { li: 5539.57, ls: 6429.88,  cuota: 444.77,  tasa: 0.1600 },
  { li: 6429.89, ls: 7699.34,  cuota: 586.90,  tasa: 0.1792 },
  { li: 7699.35, ls: 15534.34, cuota: 814.44,  tasa: 0.2136 },
  { li: 15534.35,ls: 24445.35, cuota: 2488.39, tasa: 0.2352 },
  { li: 24445.36,ls: 34452.42, cuota: 4582.45, tasa: 0.3000 },
  { li: 34452.43,ls: 65669.38, cuota: 7584.08, tasa: 0.3200 },
  { li: 65669.39,ls: 87628.46, cuota: 17570.40,tasa: 0.3400 },
  { li: 87628.47,ls: Infinity,  cuota: 25040.13,tasa: 0.3500 },
];

// ── Subsidio al Empleo Semanal 2025 ──────────────────────────────────────
interface TramoSubsidio { li: number; ls: number; subsidio: number; }

export const SUBSIDIO_SEMANAL_2025: TramoSubsidio[] = [
  { li: 0,       ls: 1092.89, subsidio: 143.45 },
  { li: 1092.90, ls: 1732.99, subsidio: 143.45 },
  { li: 1733.00, ls: 2316.44, subsidio: 143.45 },
  { li: 2316.45, ls: 2677.73, subsidio: 104.00 },
  { li: 2677.74, ls: 2904.00, subsidio: 63.12  },
  { li: 2904.01, ls: 3341.30, subsidio: 30.92  },
  { li: 3341.31, ls: Infinity, subsidio: 0      },
];

// ── Funciones de Cálculo ──────────────────────────────────────────────────

export function calcularISR(baseGravable: number, periodoTipo: string): number {
  const tabla = periodoTipo === 'QUINCENAL' ? ISR_TABLA_QUINCENAL_2025 : ISR_TABLA_SEMANAL_2025;
  if (baseGravable <= 0) return 0;
  const tramo = tabla.find(t => baseGravable >= t.li && baseGravable <= t.ls);
  if (!tramo) return 0;
  const isrBruto = tramo.cuota + (baseGravable - tramo.li) * tramo.tasa;
  return Math.max(0, parseFloat(isrBruto.toFixed(2)));
}

export function calcularSubsidio(percepciones: number, periodoTipo: string): number {
  let subsidioSemanal = 0;
  const subsidioBase = SUBSIDIO_SEMANAL_2025.find(t => percepciones >= t.li && percepciones <= t.ls);
  subsidioSemanal = subsidioBase?.subsidio ?? 0;
  if (periodoTipo === 'QUINCENAL') return parseFloat((subsidioSemanal * 15 / 7).toFixed(2));
  return subsidioSemanal;
}

export function calcularIMSS(
  sbc: number,
  diasTrabajados: number,
  uma: number = UMA_DIARIO_2025
): { emProp: number; iv: number; cev: number; total: number } {
  const emProp  = Math.max(0, (sbc - 3 * uma) * diasTrabajados * 0.0040);
  const iv      = sbc * diasTrabajados * 0.00625;
  const cev     = sbc * diasTrabajados * 0.01125;
  const total   = parseFloat((emProp + iv + cev).toFixed(2));
  return {
    emProp: parseFloat(emProp.toFixed(2)),
    iv:     parseFloat(iv.toFixed(2)),
    cev:    parseFloat(cev.toFixed(2)),
    total,
  };
}

export function calcularHorasExtra(
  horasExtra: number,
  diasEnSemana: number,
  salarioDiario: number
): { monto: number; exento: number } {
  if (horasExtra <= 0) return { monto: 0, exento: 0 };
  const salarioHora  = salarioDiario / 8;
  const semanas      = Math.max(1, Math.round(diasEnSemana / 7));
  const heMaxDoble   = 9 * semanas;         // primeras 9h/semana al 200%
  const heDoble      = Math.min(horasExtra, heMaxDoble);
  const heTriple     = Math.max(0, horasExtra - heMaxDoble);
  const montoDoble   = heDoble  * salarioHora * 2.0;
  const montoTriple  = heTriple * salarioHora * 3.0;
  const monto        = parseFloat((montoDoble + montoTriple).toFixed(2));
  const exento       = parseFloat((monto * 0.50).toFixed(2)); // 50% exento ISR art. 93
  return { monto, exento };
}

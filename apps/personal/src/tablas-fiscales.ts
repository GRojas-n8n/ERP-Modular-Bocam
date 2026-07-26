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

// ── ISR Mensual 2025 (SAT, Art. 96 LISR) ──────────────────────────────────
export const ISR_TABLA_MENSUAL_2025: TramoISR[] = [
  { li: 0.01,      ls: 746.04,     cuota: 0.00,     tasa: 0.0192 },
  { li: 746.05,    ls: 6332.05,    cuota: 14.32,    tasa: 0.0640 },
  { li: 6332.06,   ls: 11128.01,   cuota: 371.83,   tasa: 0.1088 },
  { li: 11128.02,  ls: 12935.82,   cuota: 893.63,   tasa: 0.1600 },
  { li: 12935.83,  ls: 15487.71,   cuota: 1182.88,  tasa: 0.1792 },
  { li: 15487.72,  ls: 31236.49,   cuota: 1640.18,  tasa: 0.2136 },
  { li: 31236.50,  ls: 49233.00,   cuota: 5004.12,  tasa: 0.2352 },
  { li: 49233.01,  ls: 93993.90,   cuota: 9236.89,  tasa: 0.3000 },
  { li: 93993.91,  ls: 125325.20,  cuota: 22665.17, tasa: 0.3200 },
  { li: 125325.21, ls: 375975.61,  cuota: 32691.18, tasa: 0.3400 },
  { li: 375975.62, ls: Infinity,   cuota: 117912.32,tasa: 0.3500 },
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

// ── Subsidio al Empleo Mensual 2025 (Decreto) ─────────────────────────────
export const SUBSIDIO_MENSUAL_2025: TramoSubsidio[] = [
  { li: 0.01,    ls: 1768.96, subsidio: 407.02 },
  { li: 1768.97, ls: 2653.38, subsidio: 406.83 },
  { li: 2653.39, ls: 3472.84, subsidio: 406.62 },
  { li: 3472.85, ls: 3537.87, subsidio: 392.77 },
  { li: 3537.88, ls: 4446.15, subsidio: 382.46 },
  { li: 4446.16, ls: 4717.18, subsidio: 354.23 },
  { li: 4717.19, ls: 5335.42, subsidio: 324.87 },
  { li: 5335.43, ls: 6224.67, subsidio: 294.63 },
  { li: 6224.68, ls: 7113.90, subsidio: 253.54 },
  { li: 7113.91, ls: 7382.33, subsidio: 217.61 },
  { li: 7382.34, ls: Infinity, subsidio: 0      },
];

export const PERIODOS_TIPO_VALIDOS = ['SEMANAL', 'QUINCENAL', 'MENSUAL'] as const;
export type PeriodoTipo = typeof PERIODOS_TIPO_VALIDOS[number];

export function esPeriodoTipoValido(periodoTipo: string): periodoTipo is PeriodoTipo {
  return (PERIODOS_TIPO_VALIDOS as readonly string[]).includes(periodoTipo);
}

// ── Funciones de Cálculo ──────────────────────────────────────────────────

function tablaISRPor(periodoTipo: string): TramoISR[] {
  if (periodoTipo === 'QUINCENAL') return ISR_TABLA_QUINCENAL_2025;
  if (periodoTipo === 'MENSUAL')   return ISR_TABLA_MENSUAL_2025;
  return ISR_TABLA_SEMANAL_2025;
}

export function calcularISR(baseGravable: number, periodoTipo: string): number {
  const tabla = tablaISRPor(periodoTipo);
  if (baseGravable <= 0) return 0;
  const tramo = tabla.find(t => baseGravable >= t.li && baseGravable <= t.ls);
  if (!tramo) return 0;
  const isrBruto = tramo.cuota + (baseGravable - tramo.li) * tramo.tasa;
  return Math.max(0, parseFloat(isrBruto.toFixed(2)));
}

export function calcularSubsidio(percepciones: number, periodoTipo: string): number {
  if (periodoTipo === 'MENSUAL') {
    const tramo = SUBSIDIO_MENSUAL_2025.find(t => percepciones >= t.li && percepciones <= t.ls);
    return tramo?.subsidio ?? 0;
  }
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

// ── Helpers de jornada POR_HORAS ─────────────────────────────────────────────

export function calcularHorasTrabajadas(horaEntrada: string, horaSalida: string): number {
  const [hE, mE] = horaEntrada.split(':').map(Number);
  const [hS, mS] = horaSalida.split(':').map(Number);
  let minEntrada = hE * 60 + mE;
  let minSalida  = hS * 60 + mS;
  if (minSalida <= minEntrada) minSalida += 24 * 60; // turno nocturno
  return parseFloat(((minSalida - minEntrada) / 60).toFixed(2));
}

export function calcularHorasDesglose(
  horasTrabajadas: number,
  horasJornada: number
): { horas_normales: number; horas_extra_dia: number } {
  const horas_normales  = parseFloat(Math.min(horasTrabajadas, horasJornada).toFixed(2));
  const horas_extra_dia = parseFloat(Math.max(0, horasTrabajadas - horasJornada).toFixed(2));
  return { horas_normales, horas_extra_dia };
}

export function calcularMontoHEPorSemana(
  heAcumSemana: number,
  tarifaHora: number
): { monto_doble: number; monto_triple: number } {
  const heDoble  = Math.min(heAcumSemana, 9);
  const heTriple = Math.max(0, heAcumSemana - 9);
  return {
    monto_doble:  parseFloat((heDoble  * tarifaHora * 2).toFixed(2)),
    monto_triple: parseFloat((heTriple * tarifaHora * 3).toFixed(2)),
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

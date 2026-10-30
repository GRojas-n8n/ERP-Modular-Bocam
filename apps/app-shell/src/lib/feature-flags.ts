/**
 * Banderas de funcionalidad del app-shell, fijadas al construir (variables VITE_*).
 * Todas apagadas por defecto: solo el valor exacto "true" las enciende.
 */
export const FLAGS = {
  /**
   * Panel "Inteligencia Financiera" de FinanzasView. Sus textos son fijos (no salen
   * del backend); queda oculto hasta que use datos reales. Ver
   * openspec/changes/fix-encabezados-tablas-finanzas-y-panel-inteligencia.
   */
  inteligenciaFinanciera: import.meta.env.VITE_FLAG_INTELIGENCIA_FINANCIERA === 'true',
} as const;

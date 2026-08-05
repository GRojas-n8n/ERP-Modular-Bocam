import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * viewId 'contabilidad' no tiene subItems en el nav (Layout.tsx), aunque
 * la vista tiene tabs internos propios (polizas/conciliacion/reportes) —
 * se documentan como bloques dentro del contenido general, no como
 * HelpSection, para no violar el guard de cobertura del registro.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const contabilidad: ModuleHelp = {
  viewId: 'contabilidad',
  titulo: 'Contabilidad',
  accentColor: 'indigo',
  queHace:
    'Es un módulo "consumidor": no crea operaciones de obra ni de compras, solo escucha los eventos de Compras, Finanzas y Control de Obra y los traduce automáticamente a pólizas contables en partida doble, asociadas a su CFDI cuando aplica.',
  rolesTipicos: ['contabilidad (nav)', 'finanzas (rol real que exige el API — ver aviso)'],
  flujo: [
    'Compras emite una OC → Contabilidad registra un pasivo proyectado.',
    'Finanzas paga esa OC o una estimación → Contabilidad registra el egreso y solicita/concilia el CFDI correspondiente.',
    'Control de Obra valida un avance/estimación → Contabilidad registra la póliza de estimación asociada.',
    'Con la información acumulada, se generan los reportes financieros (Balanza de Comprobación, Estado de Resultados, Balance General).',
  ],
  conectaCon: [
    { modulo: 'Compras', via: 'Escucha OrdenCompraEmitida para registrar el pasivo proyectado' },
    { modulo: 'Finanzas', via: 'Escucha el evento de pago realizado para registrar el egreso y conciliar' },
    { modulo: 'Control de Obra / Residencia', via: 'Escucha estimaciones aprobadas para su póliza correspondiente' },
    { modulo: 'Integración SAT externa', via: 'Solicita y valida el CFDI asociado a cada egreso cuando aplica' },
  ],
  secciones: [],
  erroresComunes: [
    {
      sintoma: 'No aparece el desglose de cargo/abono al abrir una póliza',
      causa: 'Las pólizas anteriores al 29 de junio de 2026 son "de partida simple" (previas al corte a partida doble) y no tienen movimientos desglosados.',
      solucion: 'Es esperado en pólizas viejas — no reportar como error. Las pólizas nuevas sí muestran el detalle completo.',
    },
    {
      sintoma: 'La Balanza de Comprobación aparece marcada como "Descuadrada"',
      causa: 'El total de cargos no coincide con el total de abonos del periodo consultado — es una señal de un problema contable real, no un bug de la interfaz.',
      solucion: 'Revisa las pólizas del periodo para identificar el asiento descuadrado antes de cerrar el reporte.',
    },
    {
      sintoma: 'No se encuentra un botón para "conciliar" en la pestaña Conciliación',
      causa: 'Esa pestaña es solo informativa — la acción de conciliar ocurre dentro del detalle expandido de cada póliza en la pestaña Pólizas.',
      solucion: 'Abre la póliza específica en Pólizas y expande su detalle para conciliar el CFDI o el movimiento bancario.',
    },
    {
      sintoma: 'Un usuario con el rol de menú "contabilidad" recibe error 403 al usar el módulo',
      causa: 'El backend valida el rol real "finanzas" (o admin/superintendent) para todos los endpoints de Contabilidad — el nav y el API no siempre exigen el mismo nombre de rol.',
      solucion: 'Confirma con Administración que el usuario tenga asignado el rol "finanzas" además de (o en vez de) "contabilidad".',
    },
  ],
};

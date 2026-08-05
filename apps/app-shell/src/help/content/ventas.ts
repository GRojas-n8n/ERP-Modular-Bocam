import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * viewId 'ventas' no tiene subItems en el nav (Layout.tsx), aunque la
 * vista tiene tabs internos propios (Clientes/Cotizaciones/Facturas) —
 * se documentan como bloque general, no como HelpSection.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const ventas: ModuleHelp = {
  viewId: 'ventas',
  titulo: 'Ventas',
  accentColor: 'blue',
  queHace:
    'Gestión comercial: clientes, cotizaciones y facturas. Cuando una cotización se acepta, Ventas es el origen del vínculo comercial que da de alta un proyecto de obra en Gerencia Técnica.',
  rolesTipicos: ['ventas'],
  flujo: [
    'Se da de alta al cliente (por captura o importación masiva CSV/Excel).',
    'Se genera una cotización para ese cliente.',
    'Al aceptarse la cotización, el sistema emite un evento con el monto de contrato y la fecha de aceptación.',
    'Gerencia Técnica escucha ese evento y crea el Proyecto de Obra Vinculado, que arranca sin presupuesto y evoluciona a medida que avanza la obra hasta cerrarse cuando se paga la última estimación.',
    'Las facturas se administran de forma independiente sobre los clientes ya dados de alta.',
  ],
  conectaCon: [
    { modulo: 'Gerencia Técnica', via: 'Escucha ventas.cotizacion_aceptada para crear el proyecto vinculado a esa cotización' },
    { modulo: 'Administración', via: 'Requiere que el cliente tenga código de cliente asignado para poder darle Centro de Costos' },
  ],
  secciones: [],
  erroresComunes: [
    {
      sintoma: 'Un proyecto no aparece vinculado a ninguna cotización en Gerencia Técnica',
      causa: 'El proyecto se creó manualmente en vez de originarse desde una cotización aceptada en Ventas — no todo proyecto tiene vínculo comercial.',
      solucion: 'No asumas que todo proyecto viene de una cotización; verifica el origen antes de buscarlo como "vinculado".',
    },
    {
      sintoma: 'La importación masiva de clientes marca filas como inválidas',
      causa: 'El código de cliente debe tener exactamente 3 dígitos, o el RFC/razón social están vacíos, o el RFC se repite dentro del mismo archivo.',
      solucion: 'Corrige el archivo según el detalle de la fila marcada antes de reintentar la importación.',
    },
    {
      sintoma: 'Administración no puede dar de alta el Centro de Costos de un cliente nuevo',
      causa: 'El cliente no tiene un código de cliente (3 dígitos) asignado todavía en Ventas.',
      solucion: 'Asigna el código de cliente en Ventas antes de intentar el alta de Centro de Costos en Administración.',
    },
  ],
};

import type { ModuleHelp } from '../types';

/**
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * viewId 'finanzas' no tiene subItems en el nav (Layout.tsx), aunque la
 * vista internamente se organiza en secciones apiladas (no un switch de
 * tabs) — se documentan como bloques dentro del contenido general, no
 * como HelpSection, para no violar el guard de cobertura del registro.
 * openspec/changes/ayuda-contextual-por-modulo
 */
export const finanzas: ModuleHelp = {
  viewId: 'finanzas',
  titulo: 'Finanzas',
  accentColor: 'amber',
  queHace:
    'Es la tesorería del proyecto: custodia el presupuesto autorizado por capítulo, valida en tiempo real si hay fondos suficientes para que Compras emita una Orden de Compra, y registra los pagos de esas OC (por anticipo o cuenta bancaria).',
  rolesTipicos: ['finanzas'],
  flujo: [
    'Se crea al menos un Presupuesto Asignado por capítulo (Materiales, Mano de Obra, Subcontratos, Equipos, Indirectos) — sin esto, Compras no puede verificar suficiencia y no puede emitir OC.',
    'Cada vez que Compras intenta generar una OC, Finanzas responde en tiempo real si hay saldo disponible en la partida correspondiente.',
    'Al emitirse la OC, el monto queda comprometido (disponible baja, comprometido sube) aunque todavía no se haya pagado.',
    'Cuando llega el momento de pagar, se registra el pago contra la OC (por Anticipo o por Cuenta Bancaria), validando que haya saldo suficiente en la fuente elegida.',
    'El pago dispara un evento que Contabilidad usa para conciliar la póliza correspondiente.',
  ],
  conectaCon: [
    { modulo: 'Compras', via: 'Responde de forma síncrona la suficiencia presupuestal antes de que se emita cada OC' },
    { modulo: 'Contabilidad', via: 'Emite el evento de pago realizado que dispara el registro contable y la conciliación' },
    { modulo: 'Gerencia Técnica', via: 'Comparte el mismo SaldoPartida — lo que GT ve comprometido/ejercido es lo mismo que valida Finanzas' },
    { modulo: 'Residencia', via: 'Recibe el evento de estimación aprobada para programar su pago' },
  ],
  secciones: [],
  erroresComunes: [
    {
      sintoma: 'Compras no puede emitir ninguna OC en un proyecto nuevo',
      causa: 'No existe todavía ningún Presupuesto Asignado por capítulo para ese proyecto — sin presupuesto cargado, no hay contra qué validar suficiencia.',
      solucion: 'Crea al menos un presupuesto por capítulo en este módulo antes de que Compras intente emitir la primera OC.',
    },
    {
      sintoma: 'Un pago se rechaza al intentar registrarlo',
      causa: 'La fuente elegida (Anticipo o Cuenta Bancaria) no tiene saldo suficiente para cubrir el monto, o falta algún dato obligatorio (referencia, concepto, OC o monto).',
      solucion: 'Verifica el saldo disponible de la fuente antes de registrar el pago, y confirma que el UUID de la OC copiado desde Compras sea el correcto.',
    },
    {
      sintoma: 'Se captura mal el ID de la Orden de Compra al registrar un pago',
      causa: 'El campo de OC en el formulario de pago se captura manualmente (UUID copiado desde Compras) — no hay selector con búsqueda.',
      solucion: 'Copia el UUID directamente desde la vista de Órdenes de Compra en el módulo Compras para evitar errores de captura.',
    },
  ],
};

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
    'Es la tesorería del proyecto: custodia el presupuesto autorizado por capítulo, valida si hay fondos para que Compras emita una Orden de Compra, paga OCs de varios proveedores con un solo egreso, cobra las estimaciones aprobadas y paga la nómina autorizada por RH.',
  rolesTipicos: ['finanzas'],
  flujo: [
    'Se crea al menos un Presupuesto Asignado por capítulo (Materiales, Mano de Obra, Subcontratos, Equipos, Indirectos) — sin esto, Compras no puede verificar suficiencia y no puede emitir OC.',
    'Al emitirse la OC, el monto queda comprometido y la OC aparece como "por pagar" en este módulo.',
    'Registrar Pago abre la lista de OCs por pagar del proyecto agrupadas por proveedor: marca las que liquida el cheque o la transferencia (pueden ser de proveedores de distinto giro), ajusta el monto de cada una (precargado con su saldo) y elige la cuenta o el anticipo.',
    'Cada estimación aprobada aparece en Cuentas por cobrar; al recibir el depósito del cliente se registra el cobro en la cuenta que lo recibe.',
    'Cada nómina autorizada por RH aparece en Nómina por pagar; al pagarla desde una cuenta, Personal la marca como PAGADA.',
    'Cada pago y cobro genera su póliza en Contabilidad.',
  ],
  conectaCon: [
    { modulo: 'Compras', via: 'Responde la suficiencia presupuestal antes de cada OC y recibe las OCs emitidas como pendientes de pago' },
    { modulo: 'Contabilidad', via: 'Recibe los egresos, cobros y pagos de nómina para generar pólizas y abrir la conciliación bancaria' },
    { modulo: 'Gerencia Técnica', via: 'Comparte el mismo SaldoPartida — lo que GT ve comprometido/ejercido es lo mismo que valida Finanzas' },
    { modulo: 'Residencia', via: 'La estimación aprobada llega como cuenta por cobrar; al cobrarse completa pasa a FACTURADA' },
    { modulo: 'Personal', via: 'Las nóminas autorizadas llegan para su pago; al pagarlas, Personal las marca PAGADAS' },
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
      causa: 'La cuenta o el anticipo no tienen saldo suficiente, el monto de una OC excede su saldo, o la referencia ya se usó en otro egreso.',
      solucion: 'Revisa el mensaje del rechazo: indica la causa exacta (saldo, OC o referencia). Ajusta el monto o elige otra cuenta.',
    },
    {
      sintoma: 'Una OC no aparece en la lista de OCs por pagar',
      causa: 'La OC es de otro proyecto, ya está pagada por completo, o fue cancelada.',
      solucion: 'Cambia al proyecto de la OC. Un egreso solo puede liquidar OCs del proyecto activo.',
    },
  ],
};

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Modulo: Auth (IAM) — Bitacora de auditoria de tenant
 *
 * Allowlist de event_type de bocam.events que se persisten en
 * TenantAuditLog, y la logica pura para resolver el id de entidad de cada
 * uno a partir del payload del evento. Ver
 * openspec/changes/auditoria-acciones-tenant.
 * ---------------------------------------------------------------------------
 */

// event_type -> campo del payload que identifica la entidad de negocio.
export const TENANT_AUDIT_EVENT_ENTITY_FIELD: Record<string, string> = {
  'compras.comparativa_aprobada_gt': 'cuadro_id',
  'compras.oc_creada':               'oc_id',
  'compras.oc_cancelada':            'oc_id',
  'finanzas.pago_registrado':        'id_pago',
  'finanzas.oc_pagada_total':        'oc_id',
  'finanzas.oc_pagada_parcial':      'oc_id',
};

export function isTenantAuditEventAllowed(eventType: string): boolean {
  return Object.prototype.hasOwnProperty.call(TENANT_AUDIT_EVENT_ENTITY_FIELD, eventType);
}

export function extractTenantAuditEntityId(eventType: string, payload: unknown): string | null {
  const field = TENANT_AUDIT_EVENT_ENTITY_FIELD[eventType];
  if (!field) return null;
  const value = (payload as Record<string, unknown> | null)?.[field];
  return typeof value === 'string' ? value : null;
}

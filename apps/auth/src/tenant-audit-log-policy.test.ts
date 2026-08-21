import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTenantAuditEventAllowed,
  extractTenantAuditEntityId,
} from './tenant-audit-log-policy';

test('isTenantAuditEventAllowed acepta los event_type de la allowlist', () => {
  assert.equal(isTenantAuditEventAllowed('compras.oc_creada'), true);
  assert.equal(isTenantAuditEventAllowed('compras.oc_cancelada'), true);
  assert.equal(isTenantAuditEventAllowed('compras.comparativa_aprobada_gt'), true);
  assert.equal(isTenantAuditEventAllowed('finanzas.pago_registrado'), true);
  assert.equal(isTenantAuditEventAllowed('finanzas.oc_pagada_total'), true);
  assert.equal(isTenantAuditEventAllowed('finanzas.oc_pagada_parcial'), true);
});

test('isTenantAuditEventAllowed rechaza un event_type fuera de la allowlist', () => {
  assert.equal(isTenantAuditEventAllowed('compras.requisicion_aprobada'), false);
  assert.equal(isTenantAuditEventAllowed('gerencia_tecnica.partida_bloqueada'), false);
  assert.equal(isTenantAuditEventAllowed(''), false);
});

test('extractTenantAuditEntityId toma el campo correcto por event_type', () => {
  assert.equal(extractTenantAuditEntityId('compras.oc_creada', { oc_id: 'oc-1', codigo: 'OC-001' }), 'oc-1');
  assert.equal(extractTenantAuditEntityId('compras.comparativa_aprobada_gt', { cuadro_id: 'cuadro-1' }), 'cuadro-1');
  assert.equal(extractTenantAuditEntityId('finanzas.pago_registrado', { id_pago: 'pago-1' }), 'pago-1');
});

test('extractTenantAuditEntityId retorna null si el evento no está en la allowlist', () => {
  assert.equal(extractTenantAuditEntityId('compras.requisicion_aprobada', { requisicion_id: 'req-1' }), null);
});

test('extractTenantAuditEntityId retorna null si el payload no trae el campo esperado', () => {
  assert.equal(extractTenantAuditEntityId('compras.oc_creada', { codigo: 'OC-001' }), null);
  assert.equal(extractTenantAuditEntityId('compras.oc_creada', null), null);
  assert.equal(extractTenantAuditEntityId('compras.oc_creada', { oc_id: 12345 }), null);
});

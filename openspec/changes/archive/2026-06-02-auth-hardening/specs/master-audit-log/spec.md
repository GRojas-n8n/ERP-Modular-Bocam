# Spec: Master Audit Log

## CA-1 — Registro automático en todas las operaciones master
- Toda llamada a `/master/*` genera un registro en `MasterAuditLog`, sea exitosa o fallida.
- Los campos mínimos requeridos: `accion`, `entity_type`, `status_code`, `ip_address`, `created_at`.

## CA-2 — Registro de intentos no autorizados
- Un intento con `MASTER_SECRET` incorrecto genera un registro con `accion: 'UNAUTHORIZED_ATTEMPT'`, `status_code: 401`.
- Este registro es particularmente importante para detectar ataques.

## CA-3 — Payload sanitizado
- El campo `payload` contiene el body de la request con campos sensibles omitidos.
- Nunca se registra el valor del header `Authorization`, passwords, ni tokens.
- Para `CREATE_TENANT`: solo `{ nombre, rfc, plan }`.
- Para `UPDATE_TENANT`: solo los campos enviados en el PATCH.

## CA-4 — Escritura best-effort
- Si la escritura en `MasterAuditLog` falla (BD caída), la respuesta al cliente ya fue enviada y el error de log se ignora silenciosamente.
- El audit log NO bloquea ni revierte operaciones de negocio.

## CA-5 — Endpoint de consulta
- `GET /api/v1/master/audit-log` requiere `MASTER_SECRET` y `masterReadLimiter`.
- Filtros opcionales: `desde` (ISO date), `hasta`, `accion`, `entity_id`.
- Default: últimas 24 horas.
- Máximo 200 registros por respuesta (ordenados por `created_at DESC`).
- La propia consulta queda registrada con `accion: 'GET_AUDIT_LOG'`.

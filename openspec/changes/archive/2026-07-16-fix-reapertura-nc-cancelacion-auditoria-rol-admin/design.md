## Context

`packages/auth-middleware/src/types.ts` define `SecurityContext.roles:
string[]` — nunca hubo un campo `rol` singular en este tipo. El JWT
middleware (`middleware.ts:146`) copia `decoded.roles || []` al
`securityContext`, así que un usuario admin real llega con `roles:
['admin']` (o `['admin', ...otros]`), nunca con un campo `rol` separado.
`apps/calidad/src/main.ts` es el único módulo del repo que intenta leer
`rol` singular de `securityContext` (verificado con grep: los demás 24
usos de `req.securityContext` en el mismo archivo destructuran
`tenantId`/`userId`/`proyectoId` correctamente).

## Goals / Non-Goals

**Goals:**
- Que un usuario con rol `admin` pueda reabrir una NC cerrada y cancelar
  una auditoría — hoy no puede, nadie puede.

**Non-Goals:**
- No se audita el resto del archivo `main.ts` en busca de otros usos
  incorrectos de `securityContext` — el grep ya confirmó que estos son los
  únicos dos lugares que leen `rol` singular.
- No se cambia el modelo de permisos (sigue siendo "solo admin" para estas
  dos acciones) — solo se corrige cómo se verifica.

## Decisions

- **Usar `roles.includes('admin')` en vez de introducir un `rol` singular
  derivado**: es el patrón que ya usa el resto del repo (ver
  `auth-middleware/middleware.ts:215`,
  `hasTenantAccess = roles.some(role => tenantLevelRoles.includes(role))`)
  — consistente, no requiere tocar `auth-middleware` ni el JWT.
- **No se toca el parámetro `rol` de `validarTransicionNC`** (línea 200 de
  `main.ts`, pasa el `rol` undefined a la función): se confirmó por
  lectura que ese parámetro no se usa dentro de la función (dead
  parameter, ver `main.ts:48-78`) — no afecta ningún gate real, así que
  queda fuera de alcance para no tocar código que no está roto.

## Risks / Trade-offs

- **[Riesgo] Ninguno significativo** — el fix reduce el alcance del bug
  (de "nadie puede" a "solo admin puede", que es el comportamiento
  documentado y esperado desde el commit original). Sin cambio de
  contrato de API, sin migración.

## Migration Plan

1. Confirmar que `testReaperturaAdmin` (ya existente) reproduce el bug en
   rojo contra el código actual — confirmado 2026-07-16 (`403 !== 200`).
2. Agregar test de integración para el gate de cancelación de auditoría
   (`workflow-auditoria.integration.test.ts`), en rojo contra el código
   actual.
3. Fix de los 2 gates en `main.ts`.
4. Ambos tests en verde. `tsc --noEmit` en `calidad`.
5. PR, merge, redeploy VPS de `calidad` (sin migración).

**Rollback**: revertir el commit — el fix no toca esquema ni datos, sin
riesgo de estado inconsistente.

## Open Questions

(ninguna)

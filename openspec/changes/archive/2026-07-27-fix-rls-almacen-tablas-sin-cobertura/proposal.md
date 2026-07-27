## Why

Auditoría de todos los microservicios (2026-07-26, continuando el barrido de `personal`,
`compras` y `gerencia-tecnica`) encontró que `almacen` es el otro servicio restante sin
ninguna política RLS (`apps/almacen/prisma/rls-policies.sql` no existía), misma
decisión de 2026-07-11 nunca cerrada.

Auditoría de código encontró un IDOR real y acotado: `PATCH /api/v1/almacen/
inventario/:id` (`apps/almacen/src/main.ts`) hacía `prisma.itemInventario.update({
where: { id } })` sin verificar `tenant_id`/`proyecto_id`, y la respuesta devolvía la
fila completa actualizada. Cualquier usuario con rol `admin`/`superintendent`/
`procurement`/`warehouse` de cualquier tenant que conociera o adivinara el UUID de un
ítem de inventario podía leerlo y corromper `stock_minimo`/`ubicacion` de otro tenant en
una sola petición.

De los 13 sitios de acceso a datos revisados en el servicio (2 tablas,
`inventario_almacen` y `movimientos_almacen`), este es el único sin protección — el
resto ya filtra `tenant_id`+`proyecto_id` explícitamente, incluido el consumidor de
eventos RabbitMQ.

## What Changes

- Habilitar y forzar RLS en `inventario_almacen` y `movimientos_almacen` (tenant +
  proyecto).
- Fix de código: `PATCH /inventario/:id` verifica ahora explícitamente que el ítem
  pertenece al tenant/proyecto de la sesión antes de actualizar, respondiendo `404`
  explícito si no.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `despliegue-completo-microservicios`: implementa el requisito de cobertura de RLS ya
  existente para este servicio, y agrega un escenario nuevo al requisito de "el código
  no SHALL depender exclusivamente de RLS" — un endpoint de escritura que devuelve la
  fila completa mutada combina lectura y escritura en un solo ataque (exfiltra y
  corrompe a la vez), caso no cubierto explícitamente por los escenarios existentes
  (que solo ilustraban lecturas).

## Impact

- **Código**: `apps/almacen/prisma/rls-policies.sql` (nuevo), `apps/almacen/src/main.ts`
  (1 endpoint), nuevo test de integración.
- **Infra**: aplicado contra `bocam_almacen` en producción. Sin cambio de rol de
  conexión.
- **Riesgo de regresión**: nulo — el servicio no tiene datos reales en producción
  todavía (0 filas en ambas tablas), verificado antes y después.

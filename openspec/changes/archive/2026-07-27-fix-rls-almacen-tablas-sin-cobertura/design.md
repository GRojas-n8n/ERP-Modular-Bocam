## Context

`apps/almacen/prisma/rls-policies.sql` no existía. `apps/almacen/src/db.ts` ya fija
correctamente los 3 GUCs — el servicio está "listo para RLS" sin cambios de plomería.
Auditoría completa de `main.ts` (543 líneas, 2 modelos, 13 sitios de acceso a datos)
encontró 12 de 13 correctamente filtrados por `tenant_id`+`proyecto_id`, incluido el
consumidor de eventos RabbitMQ (`handleOcRecibidaTotal`/`Parcial`, deriva tenancy del
envelope confiable del event bus). El único gap: `PATCH /inventario/:id`.

## Goals / Non-Goals

**Goals:** cerrar el único gap real con el mismo rigor que los fixes previos de la
sesión, pese a ser un servicio pequeño y sin datos reales todavía.

**Non-Goals:** no se audita ningún otro servicio; `almacen` y `contabilidad` cierran la
lista completa de 2026-07-11 (`control-proyectos`, `almacen`, `contabilidad`).

## Decisions

**Convención SQL**: idéntica a la elegida para `contabilidad` en el mismo barrido
(`current_tenant_id()`/`current_proyecto_id()`, cuerpo plpgsql que falla cerrado) —
ningún motivo para introducir una tercera variante entre dos servicios que se resuelven
en la misma sesión.

**Ambas tablas reciben `tenant_id AND proyecto_id`** — evidencia: la unicidad de `clave`
en `inventario_almacen` ya se valida por proyecto en código (mensaje 409 explícito "en
este proyecto"), y ambos únicos índices de `movimientos_almacen` son
`[tenant_id, proyecto_id, ...]`.

**Fix de código**: `findFirst({ where: { id, tenant_id, proyecto_id } })` antes del
`update`, reemplazando el `update` directo — replica el idioma `err.status = 404` /
`throw` / `catch` ya usado en `POST /inventario` del mismo archivo (línea 122-124), no
introduce un patrón nuevo.

## Risks / Trade-offs

Ninguno significativo — el servicio no tiene datos reales en producción (0 filas en
ambas tablas), confirmado antes y después de aplicar. Verificado igual con datos
sintéticos dentro de transacciones `ROLLBACK`, y con un ítem real creado y limpiado
durante el smoke test post-deploy.

## Migration Plan

1. Capturar estado rojo (ownership, conteos — ambos en 0).
2. Escribir y aplicar `apps/almacen/prisma/rls-policies.sql`.
3. Verificar en verde con datos sintéticos en transacción `ROLLBACK`: cross-tenant y
   cross-proyecto ambos bloqueados, `UPDATE` cross-proyecto afecta 0 filas.
4. Fix de código en `PATCH /inventario/:id`. `tsc --noEmit` limpio.
5. Test de integración nuevo, commiteado sin ejecutar (sin Postgres local).
6. Commit + push; rebuild/restart `bocam-vps-almacen`; smoke test end-to-end con un
   ítem real creado vía la API (tenant A) y atacado vía PATCH (tenant B) — confirmado
   `404` y datos intactos; ítem de prueba limpiado tras la verificación.

## Open Questions

Ninguna.

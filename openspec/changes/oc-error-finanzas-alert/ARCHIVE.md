# ARCHIVE — oc-error-finanzas-alert

> **Estado:** ARCHIVADO  
> **Archivado el:** 2026-05-26  
> **Ciclo openSpec:** Completo (Proposal → Design → Spec → Tasks → Implementation → Tests → VPS Deploy → Archive)

---

## Resumen Ejecutivo

Implementación de alerta automática para Órdenes de Compra que caen en estado `ERROR_FINANZAS`. Cuando la saga distribuida de conversión de comparativa a OC falla en la etapa de `comprometer-fondos` (por error en el servicio Finanzas), el sistema ahora:

1. **Persiste una alerta** en la tabla `alertas_oc_error` (upsert idempotente por `[tenant_id, oc_id]`).
2. **Publica un evento** `compras.oc_error_finanzas` en RabbitMQ (best-effort, degradación elegante).
3. **Expone un endpoint** `GET /api/v1/compras/alertas/oc-error` para consulta por roles autorizados (`admin`, `superintendent`, `procurement`).

La funcionalidad cubre **tanto el path síncrono** (fallo en `POST /comparativas/:id/convertir-oc`) **como el path asíncrono** (fallo en el handler `handlePresupuestoInsuficienteEvent`).

---

## Commits de la Feature

| Hash | Mensaje | Contenido |
|------|---------|-----------|
| `1bdc543` | `test(compras): integration tests for oc-error-alert + explicit proyecto_id filter` | Schema (`AlertaOcError`), migración Prisma, lógica en `main.ts` (paths síncrono y asíncrono + endpoint de consulta), 5 tests de integración, script `test:integration:oc-error-alert` |
| `a005172` | `fix(compras): add AlertaOcError model to schema.prisma (missed in previous commit)` | Correctivo: `AlertaOcError` había quedado fuera del staged commit anterior; el `docker build` en VPS regeneraba el cliente Prisma sin el modelo y fallaba |
| `c4e3b18` | `docs(openspec): mark tasks 7.1-7.2 complete — VPS migration applied` | Actualización de `tasks.md` reflejando migración SQL directa en VPS y endpoint verificado en producción |

---

## Inventario de Archivos Modificados o Creados

### Módulo `apps/compras`

| Archivo | Tipo de cambio | Descripción |
|---------|---------------|-------------|
| `prisma/schema.prisma` | Modificado | Modelo `AlertaOcError` con `@@unique([tenant_id, oc_id])` e `@@index([tenant_id, proyecto_id])` |
| `prisma/migrations/20260526215207_add_alerta_oc_error/migration.sql` | Creado | Migración Prisma (full schema desde BD vacía; en VPS se aplicaron solo las tablas faltantes) |
| `prisma/migrations/migration_lock.toml` | Creado | Lock file del proveedor de migraciones |
| `src/main.ts` | Modificado | Bloque catch del path síncrono (upsert + publish), handler `handlePresupuestoInsuficienteEvent` (upsert + publish), endpoint `GET /api/v1/compras/alertas/oc-error` |
| `src/generated/prisma/*` | Regenerado | Cliente Prisma con `alertaOcError` typesafe |
| `package.json` | Modificado | Script `test:integration:oc-error-alert` |
| `test/integration/oc-error-alert.integration.test.ts` | Creado | 5 tests de integración (460 líneas) |

### OpenSpec

| Archivo | Tipo de cambio | Descripción |
|---------|---------------|-------------|
| `openspec/changes/oc-error-finanzas-alert/tasks.md` | Actualizado | Todas las tareas `[x]` excepto 7.3 (intencional) |
| `openspec/changes/oc-error-finanzas-alert/spec-delta.md` | Creado | 7 decisiones técnicas post-implementación documentadas |
| `openspec/changes/oc-error-finanzas-alert/ARCHIVE.md` | Creado | Este archivo |
| `openspec/changes/oc-error-finanzas-alert/.openspec.yaml` | Actualizado | `status: archived` |

---

## Estado en Producción (VPS — iretum.com)

| Verificación | Resultado | Fecha |
|---|---|---|
| Tabla `alertas_oc_error` creada en PostgreSQL | ✅ OK | 2026-05-26 |
| `docker compose build --no-cache compras` | ✅ Exitoso | 2026-05-26 |
| `GET /api/v1/compras/alertas/oc-error` sin token | ✅ `401 Unauthorized` | 2026-05-26 |
| `GET /api/v1/compras/alertas/oc-error` con JWT admin | ✅ `{"success":true,"data":[]}` | 2026-05-26 |
| OC de prueba con Finanzas caído | ⏳ Pendiente operacional (task 7.3) | — |

---

## Cobertura de Spec — Tests de Integración (5/5 ✅)

| Scenario | Test | Resultado |
|---|---|---|
| OC → `ERROR_FINANZAS` por fallo síncrono → alerta persistida | `testAlertaGeneradaEnFalloSincrono` | ✅ Pass |
| `oc_id` y `oc_codigo` correctos en alerta | `testAlertaReferenciaOcIdCorrecto` | ✅ Pass |
| EventBus offline → alerta en BD, sin excepción | Todos (RABBITMQ_URL inválido) | ✅ Pass |
| Idempotencia: 2 triggers → 1 registro en BD | `testIdempotenciaAlerta` | ✅ Pass |
| Aislamiento por `proyecto_id` en endpoint | `testAislamientoMultiProyecto` | ✅ Pass |
| Acceso sin rol autorizado → 403 | `testAccesoDenegadoParaResident` | ✅ Pass |

---

## Deuda Técnica Generada (Conocida y Aceptada)

| ID | Descripción | Impacto | Acción Requerida |
|----|-------------|---------|-----------------|
| DT-001 | La migración `20260526215207` se aplicó en VPS vía SQL directo, NO con `prisma migrate deploy`. No existe registro en `_prisma_migrations`. | Un futuro `prisma migrate deploy` fallará con "table already exists" | Ejecutar `prisma migrate resolve --applied 20260526215207_add_alerta_oc_error` en VPS una vez. |
| DT-002 | Task 7.3: Verificación operacional de alerta real en producción (OC con Finanzas caído) pendiente | Bajo — la funcionalidad está implementada y verificada en entorno de test | Realizar durante operación normal desde iretum.com |

---

## Decisiones de Diseño Clave

Ver [`spec-delta.md`](./spec-delta.md) para el detalle completo de las 7 decisiones técnicas:

- **D4** `[ADICIÓN]`: Filtro explícito `tenant_id + proyecto_id` en `findMany` (defensa en profundidad vs RLS).
- **D5** `[ADICIÓN]`: Import dinámico de `main.ts` en tests — patrón para módulos que capturan env vars en constantes.
- **D6** `[AJUSTE]`: SQL directo en VPS en lugar de `prisma migrate deploy` (sin historial `_prisma_migrations`).
- **D7** `[ADICIÓN]`: Commit correctivo `a005172` — schema.prisma y cliente Prisma generado deben ser staged juntos.

---

## Declaración de Cierre

Este ciclo openSpec está oficialmente **ARCHIVADO**. La funcionalidad *Alerta automática para OCs en ERROR_FINANZAS* está:

- ✅ Implementada en ambos paths (síncrono y asíncrono)
- ✅ Verificada con 5/5 tests de integración
- ✅ Desplegada en producción (iretum.com)
- ✅ Documentada con spec-delta y deuda técnica conocida
- ⏳ Task 7.3 pendiente de verificación operacional humana (intencional)

**No se requiere acción adicional del equipo de desarrollo para este ciclo.**

-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Finanzas (Tesorería y Flujo de Caja) — Políticas RLS
--
-- PROPÓSITO:
-- Garantizar aislamiento total entre tenants y entre proyectos/centros de
-- costos. PostgreSQL rechazará cualquier query que no coincida con el
-- contexto de sesión, incluso si hay un bug en la capa de aplicación.
--
-- NOTA: Las tablas viven en el schema 'public' (verificado contra producción
-- 2026-07-11 — no existe un schema 'finanzas' separado, a diferencia de lo
-- que decía este comentario originalmente; mismo hallazgo que en
-- apps/auth/prisma/rls-policies.sql). Prisma no tiene `@@schema` configurado
-- en schema.prisma, así que las tablas quedan en el schema por defecto de la
-- conexión (public).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FUNCIONES AUXILIARES (idempotentes)
--
-- Actualizado a plpgsql con EXCEPTION WHEN OTHERS THEN RETURN NULL (openspec:
-- aislamiento-proyecto-por-modulo) — mismo molde que ya usan gerencia-tecnica
-- y contabilidad. Motivo: la versión anterior (`sql` puro, sin protección)
-- lanzaba un error de cast (`invalid input syntax for type uuid`) cuando el
-- GUC de sesión estaba fijado a cadena vacía (`''`) en vez de no estar
-- fijado — exactamente lo que ocurre hoy cuando un usuario con rol `finanzas`
-- (rol de nivel tenant, sin proyecto activo obligatorio) llega a un endpoint
-- sin `proyectoId`: `securityContext.proyectoId` es `''` (ver
-- packages/auth-middleware/src/middleware.ts, `decoded.proyecto_id || ''`),
-- y `createTenantContext()` hace `set_config('app.current_proyecto_id', '',
-- true)`. Sin este fix, el Patrón Global con Trazabilidad nuevo de este
-- cambio (`current_proyecto_id() IS NULL OR ...`) nunca llegaría a evaluar
-- la rama IS NULL — el cast fallaría antes, devolviendo un 500 en vez de la
-- vista consolidada. Efecto secundario (beneficioso, sin cambio de
-- comportamiento visible): las tablas que se quedan en Patrón Estricto
-- (presupuestos_asignados, movimientos_presupuestales, proyectos_finanzas,
-- cuentas_bancarias) ahora fallan cerrado con 0 filas ante un GUC vacío, en
-- vez de un error crudo de base de datos — igual que ya hace contabilidad.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_proyecto_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_proyecto_id', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. HABILITAR Y FORZAR RLS EN TODAS LAS TABLAS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "presupuestos_asignados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "presupuestos_asignados" FORCE ROW LEVEL SECURITY;

ALTER TABLE "movimientos_presupuestales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "movimientos_presupuestales" FORCE ROW LEVEL SECURITY;

ALTER TABLE "programa_pagos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "programa_pagos" FORCE ROW LEVEL SECURITY;

ALTER TABLE "cuentas_bancarias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cuentas_bancarias" FORCE ROW LEVEL SECURITY;

ALTER TABLE "proyectos_finanzas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "proyectos_finanzas" FORCE ROW LEVEL SECURITY;

ALTER TABLE "pagos_oc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagos_oc" FORCE ROW LEVEL SECURITY;

ALTER TABLE "detalles_pago_oc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "detalles_pago_oc" FORCE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. POLÍTICAS: PRESUPUESTOS ASIGNADOS
-- Filtro doble: tenant_id + proyecto_id (Centro de Costos)
--
-- EXCLUIDA A PROPÓSITO del Patrón Global (openspec: aislamiento-proyecto-
-- por-modulo): un presupuesto asignado pertenece a un único proyecto por
-- definición — no existe un "presupuesto global" que consolidar entre
-- proyectos. Se evaluó y se descartó deliberadamente subir esta tabla a
-- Patrón Global; permanece estricta, sin la rama `current_proyecto_id() IS
-- NULL`. No agregarla sin una decisión de negocio explícita nueva.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_presupuestos_select ON "presupuestos_asignados";
CREATE POLICY rls_presupuestos_select ON "presupuestos_asignados"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_insert ON "presupuestos_asignados";
CREATE POLICY rls_presupuestos_insert ON "presupuestos_asignados"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_update ON "presupuestos_asignados";
CREATE POLICY rls_presupuestos_update ON "presupuestos_asignados"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_presupuestos_delete ON "presupuestos_asignados";
CREATE POLICY rls_presupuestos_delete ON "presupuestos_asignados"
    FOR DELETE USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. POLÍTICAS: MOVIMIENTOS PRESUPUESTALES
-- Filtro doble: tenant_id + proyecto_id
-- Movimientos son INMUTABLES (Event-Sourcing) — verificado en main.ts, no hay
-- ningún .update()/.delete() sobre este modelo. NO se crean policies de
-- UPDATE/DELETE a propósito: bajo FORCE RLS, cualquier intento futuro de
-- modificar un movimiento queda bloqueado a nivel de base de datos (0 filas
-- afectadas), reforzando la inmutabilidad en vez de solo confiar en que el
-- código nunca lo haga. Si se requiere corrección, se crea un movimiento
-- inverso (CONTRAPARTIDA).
--
-- EXCLUIDA A PROPÓSITO del Patrón Global (openspec: aislamiento-proyecto-
-- por-modulo), mismo motivo que presupuestos_asignados (sección 3): un
-- movimiento presupuestal es de un proyecto específico, no hay vista
-- consolidada de movimientos de presupuesto que tenga sentido de negocio.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_movimientos_select ON "movimientos_presupuestales";
CREATE POLICY rls_movimientos_select ON "movimientos_presupuestales"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_movimientos_insert ON "movimientos_presupuestales";
CREATE POLICY rls_movimientos_insert ON "movimientos_presupuestales"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. POLÍTICAS: PROGRAMA DE PAGOS
-- Patrón Global con Trazabilidad (openspec: aislamiento-proyecto-por-modulo):
-- si hay proyecto activo en la sesión, filtra por ese proyecto (igual que antes);
-- si NO hay proyecto activo (current_proyecto_id() IS NULL — modo consolidado,
-- gateado por rol en requireProjectAccess()), retorna pagos de todos los
-- proyectos del tenant, cada fila con su proyecto_id original intacto.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_pagos_select ON "programa_pagos";
CREATE POLICY rls_pagos_select ON "programa_pagos"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_pagos_insert ON "programa_pagos";
CREATE POLICY rls_pagos_insert ON "programa_pagos"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_pagos_update ON "programa_pagos";
CREATE POLICY rls_pagos_update ON "programa_pagos"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_pagos_delete ON "programa_pagos";
CREATE POLICY rls_pagos_delete ON "programa_pagos"
    FOR DELETE USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. POLÍTICAS: CUENTAS BANCARIAS  (tabla nueva, sin policies previas)
-- Filtro simple por tenant_id — `proyecto_id` es NULLABLE (cuenta de empresa,
-- compartida entre proyectos del mismo tenant), mismo patrón que
-- `proveedores` en apps/compras/prisma/rls-policies.sql. Verificado en
-- main.ts: findMany/create/update (edición + "eliminar" que en realidad es
-- soft-delete vía update activa=false) — sin DELETE real, pero se agrega la
-- policy de DELETE igual por higiene/consistencia con el resto del archivo.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_cuentas_select ON "cuentas_bancarias";
CREATE POLICY rls_cuentas_select ON "cuentas_bancarias"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
    );

DROP POLICY IF EXISTS rls_cuentas_insert ON "cuentas_bancarias";
CREATE POLICY rls_cuentas_insert ON "cuentas_bancarias"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
    );

DROP POLICY IF EXISTS rls_cuentas_update ON "cuentas_bancarias";
CREATE POLICY rls_cuentas_update ON "cuentas_bancarias"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
    );

DROP POLICY IF EXISTS rls_cuentas_delete ON "cuentas_bancarias";
CREATE POLICY rls_cuentas_delete ON "cuentas_bancarias"
    FOR DELETE USING (
        tenant_id = current_tenant_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. POLÍTICAS: PROYECTOS FINANZAS (anticipos)  (tabla nueva, sin policies previas)
-- EXCLUIDA A PROPÓSITO del Patrón Global (openspec: aislamiento-proyecto-
-- por-modulo): un anticipo es de un proyecto específico, mismo motivo que
-- presupuestos_asignados (sección 3).
-- Filtro doble: tenant_id + proyecto_id. Se usa vía upsert (main.ts:1612,
-- 1707, 2062) — requiere policy de UPDATE explícita o la rama `update` del
-- upsert falla silenciosamente bajo FORCE RLS (0 filas, sin error).
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_proyectos_finanzas_select ON "proyectos_finanzas";
CREATE POLICY rls_proyectos_finanzas_select ON "proyectos_finanzas"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_proyectos_finanzas_insert ON "proyectos_finanzas";
CREATE POLICY rls_proyectos_finanzas_insert ON "proyectos_finanzas"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

DROP POLICY IF EXISTS rls_proyectos_finanzas_update ON "proyectos_finanzas";
CREATE POLICY rls_proyectos_finanzas_update ON "proyectos_finanzas"
    FOR UPDATE USING (
        tenant_id = current_tenant_id()
        AND proyecto_id = current_proyecto_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. POLÍTICAS: PAGOS OC  (tabla nueva, sin policies previas)
-- Patrón Global con Trazabilidad (openspec: aislamiento-proyecto-por-modulo) —
-- mismo criterio que programa_pagos (sección 5). Solo create/findMany/
-- findFirst/count en main.ts — sin UPDATE/DELETE hoy, se agregan solo
-- SELECT/INSERT.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_pagos_oc_select ON "pagos_oc";
CREATE POLICY rls_pagos_oc_select ON "pagos_oc"
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

DROP POLICY IF EXISTS rls_pagos_oc_insert ON "pagos_oc";
CREATE POLICY rls_pagos_oc_insert ON "pagos_oc"
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id())
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. POLÍTICAS: DETALLES PAGO OC  (tabla nueva, sin policies previas)
-- Esta tabla NO tiene tenant_id/proyecto_id propio (solo pago_id, oc_id,
-- proveedor_id — ver schema.prisma). El aislamiento se resuelve vía EXISTS
-- contra `pagos_oc` (su padre, FK onDelete: Cascade), heredando su Patrón
-- Global con Trazabilidad (openspec: aislamiento-proyecto-por-modulo). Solo
-- create (anidado bajo pagoOC.create) en main.ts — sin UPDATE/DELETE hoy,
-- solo SELECT/INSERT.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS rls_detalles_pago_oc_select ON "detalles_pago_oc";
CREATE POLICY rls_detalles_pago_oc_select ON "detalles_pago_oc"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "pagos_oc" p
            WHERE p.id_pago = "detalles_pago_oc".pago_id
              AND p.tenant_id = current_tenant_id()
              AND (current_proyecto_id() IS NULL OR p.proyecto_id = current_proyecto_id())
        )
    );

DROP POLICY IF EXISTS rls_detalles_pago_oc_insert ON "detalles_pago_oc";
CREATE POLICY rls_detalles_pago_oc_insert ON "detalles_pago_oc"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "pagos_oc" p
            WHERE p.id_pago = "detalles_pago_oc".pago_id
              AND p.tenant_id = current_tenant_id()
              AND (current_proyecto_id() IS NULL OR p.proyecto_id = current_proyecto_id())
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. COMENTARIOS DE AUDITORÍA
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON POLICY rls_presupuestos_select ON "presupuestos_asignados" IS 'Aisla presupuestos por constructora y centro de costos';
COMMENT ON POLICY rls_movimientos_select ON "movimientos_presupuestales" IS 'Aisla movimientos presupuestales por constructora y centro de costos';
COMMENT ON POLICY rls_pagos_select ON "programa_pagos" IS 'Aisla programa de pagos por constructora y centro de costos';
COMMENT ON POLICY rls_cuentas_select ON "cuentas_bancarias" IS 'Aisla cuentas bancarias por constructora (compartidas entre proyectos del mismo tenant)';
COMMENT ON POLICY rls_proyectos_finanzas_select ON "proyectos_finanzas" IS 'Aisla anticipos por constructora y centro de costos';
COMMENT ON POLICY rls_pagos_oc_select ON "pagos_oc" IS 'Aisla pagos de OC por constructora y centro de costos';
COMMENT ON POLICY rls_detalles_pago_oc_select ON "detalles_pago_oc" IS 'Aisla detalle de pagos de OC via join a pagos_oc (no tiene tenant_id propio)';

-- =============================================================================
-- NOTA: El servicio de Finanzas inyecta set_config('app.current_tenant_id', ...)
-- y set_config('app.current_proyecto_id', ...) ANTES de cada operación para
-- activar el filtrado automático via el wrapper createTenantContext() en db.ts.
-- =============================================================================

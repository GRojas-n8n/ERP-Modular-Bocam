-- ---------------------------------------------------------------------------
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Clasificación: Estrictamente Confidencial.
-- ---------------------------------------------------------------------------
-- Módulo: Contabilidad
-- Script: Políticas RLS (Row-Level Security)
--
-- HISTORIA: contabilidad quedó explícitamente sin RLS en 2026-07-11
-- (fix-rls-bypass-bocam-admin, "higiene: solo ownership + cambio de rol").
-- Este script la cierra (fix-rls-contabilidad-tablas-sin-cobertura,
-- 2026-07-26/27), motivado por un hallazgo CRÍTICO: GET /api/v1/contabilidad/
-- asientos (apps/contabilidad/src/main.ts) hacía `findMany()` sin ningún
-- `where` — cualquier usuario autenticado con rol admin/finance/superintendent
-- de CUALQUIER tenant leía el libro contable completo de TODOS los tenants,
-- sin necesitar conocer ningún ID. Confirmado con datos reales en producción
-- antes de este fix.
--
-- Convención: current_tenant_id()/current_proyecto_id() (nombre mayoritario
-- en el repo — finanzas y compras las llaman así) con el cuerpo plpgsql de
-- gerencia-tecnica (EXCEPTION WHEN OTHERS THEN RETURN NULL) en vez del
-- ::UUID sin protección de finanzas/compras — un GUC vacío falla cerrado
-- (0 filas) en vez de lanzar un error de cast.
--
-- NOTA IMPORTANTE: cuentas_contables NO recibe RLS — ver sección 3.
-- ---------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FUNCIONES AUXILIARES DE CONTEXTO (idempotentes)
-- ═══════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. HABILITAR Y FORZAR RLS — 4 TABLAS TENANT+PROYECTO
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables FORCE ROW LEVEL SECURITY;

ALTER TABLE conciliaciones_fiscales ENABLE ROW LEVEL SECURITY;
ALTER TABLE conciliaciones_fiscales FORCE ROW LEVEL SECURITY;

ALTER TABLE conciliaciones_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE conciliaciones_bancarias FORCE ROW LEVEL SECURITY;

ALTER TABLE movimientos_poliza ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_poliza FORCE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. cuentas_contables — EXCLUIDA A PROPÓSITO, NO TOCAR
--
-- Catálogo global de cuentas contables (plan de cuentas), compartido entre
-- TODOS los tenants: no tiene columna tenant_id, su unicidad es @@unique([clave])
-- global. Habilitar RLS aquí sin una política (porque no hay tenant_id que
-- filtrar) equivale, bajo FORCE ROW LEVEL SECURITY, a un deny-all: rompería
-- TODO join `movimientoPoliza.findMany({ include: { cuenta: ... } })` y los
-- reportes de balanza/estado de resultados que hacen JOIN contra esta tabla.
-- Si una auditoría futura encuentra esta tabla "sin RLS" y la lista junto a
-- las demás como drift, NO es drift — es la exclusión intencional documentada
-- aquí. No agregar ENABLE ROW LEVEL SECURITY a cuentas_contables.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. POLÍTICAS DE AISLAMIENTO
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── ASIENTOS CONTABLES (Patrón Global con Trazabilidad) ────────────────────
-- Evidencia de scoping por proyecto: @@unique([tenant_id, proyecto_id,
-- folio_poliza]) — el folio de póliza es una serie por proyecto.
-- Actualizado a Patrón Global (openspec: aislamiento-proyecto-por-modulo,
-- tarea 1.2): los asientos registran el efecto contable de pagos que ya son
-- globales en Finanzas (programa_pagos, pagos_oc) — mantener esta tabla
-- estricta rompería la trazabilidad justo donde más importa. Si hay proyecto
-- activo en la sesión, sigue filtrando por ese proyecto igual que antes.
DROP POLICY IF EXISTS rls_asientos_contables_context ON asientos_contables;
CREATE POLICY rls_asientos_contables_context ON asientos_contables
    FOR ALL
    USING (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()))
    WITH CHECK (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()));

-- ─── CONCILIACIONES FISCALES (CFDI/SAT) — Patrón Estricto, SIN cambio ───────
-- Evaluada y excluida a propósito del Patrón Global (openspec: aislamiento-
-- proyecto-por-modulo, tarea 1.2): un CFDI se emite contra una operación de
-- un proyecto puntual (una OC, una factura) — no existe una "conciliación
-- fiscal global" real. Permanece estricta.
DROP POLICY IF EXISTS rls_conciliaciones_fiscales_context ON conciliaciones_fiscales;
CREATE POLICY rls_conciliaciones_fiscales_context ON conciliaciones_fiscales
    FOR ALL
    USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())
    WITH CHECK (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id());

-- ─── CONCILIACIONES BANCARIAS (Patrón Global con Trazabilidad) ──────────────
-- Actualizado a Patrón Global (openspec: aislamiento-proyecto-por-modulo,
-- tarea 1.2): `cuentas_bancarias` en Finanzas ya es Catálogo Compartido (la
-- cuenta es de la empresa, no de un proyecto) — conciliar un estado de
-- cuenta que mezcla movimientos de varios proyectos es inherentemente una
-- operación cross-proyecto.
DROP POLICY IF EXISTS rls_conciliaciones_bancarias_context ON conciliaciones_bancarias;
CREATE POLICY rls_conciliaciones_bancarias_context ON conciliaciones_bancarias
    FOR ALL
    USING (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()))
    WITH CHECK (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()));

-- ─── MOVIMIENTOS DE PÓLIZA (Patrón Global con Trazabilidad) ─────────────────
-- La tabla hija referencia cuenta_id -> cuentas_contables (catálogo global,
-- sin RLS por diseño — ver sección 3). El JOIN sigue funcionando porque el
-- filtro RLS aplica solo sobre movimientos_poliza, no sobre cuentas_contables.
-- Actualizado a Patrón Global (openspec: aislamiento-proyecto-por-modulo,
-- tarea 1.2): hija directa de asientos_contables (mismo tenant_id/
-- proyecto_id) — debe seguir al padre para no fragmentar una póliza entre
-- modos distintos.
DROP POLICY IF EXISTS rls_movimientos_poliza_context ON movimientos_poliza;
CREATE POLICY rls_movimientos_poliza_context ON movimientos_poliza
    FOR ALL
    USING (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()))
    WITH CHECK (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()));

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. COMENTARIOS DE AUDITORÍA
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON POLICY rls_asientos_contables_context ON asientos_contables IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Contabilidad.';
COMMENT ON POLICY rls_conciliaciones_fiscales_context ON conciliaciones_fiscales IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Contabilidad.';
COMMENT ON POLICY rls_conciliaciones_bancarias_context ON conciliaciones_bancarias IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Contabilidad.';
COMMENT ON POLICY rls_movimientos_poliza_context ON movimientos_poliza IS
    'Aislamiento Multi-Tenant + Multi-Proyecto. Módulo: Contabilidad.';

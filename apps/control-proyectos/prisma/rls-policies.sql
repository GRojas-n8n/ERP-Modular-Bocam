-- =============================================================================
-- Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
-- Módulo: Control de Proyectos (fusión de control-obra + control-proyectos)
-- Archivo: rls-policies.sql
--
-- Cubre las 7 tablas del schema fusionado (openspec:
-- fusionar-control-obra-a-control-proyectos, tarea 3). Reemplaza la tarea
-- 3.4 (control-obra) y deja obsoleta la 4.3 (control-proyectos "sin
-- políticas") de openspec/changes/fix-rls-bypass-bocam-admin/tasks.md.
--
-- Todas las tablas aíslan por tenant_id + proyecto_id (una sola política
-- combinada con AND, no dos separadas — ver hallazgo de personal/seguridad
-- en fix-rls-bypass-bocam-admin tarea 3.5/3.6: dos políticas PERMISSIVE se
-- combinan con OR en Postgres, no con AND).
-- =============================================================================

ALTER TABLE programacion_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecciones_cierre ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitacoras_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE avances_fisicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales_consumidos_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE mano_obra_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_evm_procesados ENABLE ROW LEVEL SECURITY;

ALTER TABLE programacion_obra FORCE ROW LEVEL SECURITY;
ALTER TABLE alertas_proyecto FORCE ROW LEVEL SECURITY;
ALTER TABLE proyecciones_cierre FORCE ROW LEVEL SECURITY;
ALTER TABLE bitacoras_obra FORCE ROW LEVEL SECURITY;
ALTER TABLE avances_fisicos FORCE ROW LEVEL SECURITY;
ALTER TABLE estimaciones FORCE ROW LEVEL SECURITY;
ALTER TABLE materiales_consumidos_obra FORCE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_seguimiento FORCE ROW LEVEL SECURITY;
ALTER TABLE mano_obra_proyecto FORCE ROW LEVEL SECURITY;
ALTER TABLE pagos_evm_procesados FORCE ROW LEVEL SECURITY;

-- Programación de obra (Gantt/Curva S) — SELECT/INSERT/UPDATE
-- (findMany/findFirst, upsert, update desde recalcularEVMPorAvanceValidado)
DROP POLICY IF EXISTS isolation_programacion_obra ON programacion_obra;
CREATE POLICY isolation_programacion_obra ON programacion_obra
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Alertas predictivas — SELECT/INSERT/UPDATE (upsertAlerta, resolverAlertaSiExiste,
-- PATCH .../reconocer, PATCH .../ignorar)
DROP POLICY IF EXISTS isolation_alertas_proyecto ON alertas_proyecto;
CREATE POLICY isolation_alertas_proyecto ON alertas_proyecto
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Proyecciones de cierre (snapshot EVM) — SELECT/INSERT/UPDATE.
-- NOTA: ningún código de este repo escribe esta tabla hoy (solo findFirst
-- en /dashboard y /evm) — se le concede INSERT/UPDATE de forma preventiva
-- para no bloquear un futuro job de snapshot bajo RLS, pero es un gap
-- documentado (no verificado con datos reales, la tabla está vacía en
-- producción).
DROP POLICY IF EXISTS isolation_proyecciones_cierre ON proyecciones_cierre;
CREATE POLICY isolation_proyecciones_cierre ON proyecciones_cierre
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Bitácoras de obra (migrado de control-obra) — SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS isolation_bitacoras_obra ON bitacoras_obra;
CREATE POLICY isolation_bitacoras_obra ON bitacoras_obra
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Avances físicos (migrado de control-obra) — SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS isolation_avances_fisicos ON avances_fisicos;
CREATE POLICY isolation_avances_fisicos ON avances_fisicos
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Estimaciones (migrado de control-obra) — SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS isolation_estimaciones ON estimaciones;
CREATE POLICY isolation_estimaciones ON estimaciones
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Materiales consumidos en obra (migrado de control-obra) — solo
-- SELECT/INSERT (findMany, findUnique, create; sin UPDATE/DELETE en el
-- código real, ver apps/control-proyectos/src/main.ts)
DROP POLICY IF EXISTS isolation_materiales_consumidos_obra ON materiales_consumidos_obra;
CREATE POLICY isolation_materiales_consumidos_obra ON materiales_consumidos_obra
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Seguimiento de OC → concepto (openspec: fix-evm-costos-reales) —
-- SELECT/INSERT/UPDATE (subscribers de compras.oc_creada/oc_cancelada y de
-- finanzas.pago_registrado rama OrdenCompra)
DROP POLICY IF EXISTS isolation_ordenes_compra_seguimiento ON ordenes_compra_seguimiento;
CREATE POLICY isolation_ordenes_compra_seguimiento ON ordenes_compra_seguimiento
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Acumulador de mano de obra pagada por proyecto (openspec:
-- fix-evm-costos-reales) — SELECT/INSERT/UPDATE (subscriber de
-- finanzas.pago_registrado rama PreNomina, job nocturno de snapshot)
DROP POLICY IF EXISTS isolation_mano_obra_proyecto ON mano_obra_proyecto;
CREATE POLICY isolation_mano_obra_proyecto ON mano_obra_proyecto
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

-- Idempotencia de pagos aplicados al EVM (openspec: fix-evm-costos-reales) —
-- SELECT/INSERT (dedupe por id_pago, sin UPDATE/DELETE en el código real)
DROP POLICY IF EXISTS isolation_pagos_evm_procesados ON pagos_evm_procesados;
CREATE POLICY isolation_pagos_evm_procesados ON pagos_evm_procesados
  USING (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  )
  WITH CHECK (
    tenant_id::text = current_setting('app.current_tenant_id', true)
    AND proyecto_id::text = current_setting('app.current_proyecto_id', true)
  );

## Context

El módulo `contabilidad` (puerto 3008) genera `AsientoContable` en partida simple desde 6 eventos de dominio. Tiene modelos de conciliación fiscal (CFDI/SAT) y bancaria ya operativos. No existe `ContabilidadView.tsx` ni catálogo de cuentas. El sistema es multi-tenant con aislamiento por `tenant_id + proyecto_id`. Cutoff de partida doble: **2026-06-29** — asientos anteriores no reciben movimientos.

## Goals / Non-Goals

**Goals:**
- Agregar `CuentaContable` + `MovimientoPoliza` al schema de contabilidad.
- Mapper hardcoded `tipo_poliza → [MovimientoPoliza]` para todos los tipos de póliza.
- Extender los 6 handlers existentes para crear movimientos junto con el asiento.
- Agregar 2 nuevos handlers: `control_obra.estimacion_aprobada` y `control_obra.avance_fisico_validado`.
- 4 endpoints de reportes + 1 endpoint de dashboard.
- `ContabilidadView.tsx` con 3 tabs (Pólizas, Conciliación, Reportes).
- Proxy nginx + vite para `/api/v1/contabilidad`.

**Non-Goals:**
- Migración retroactiva de asientos anteriores al cutoff.
- Catálogo de cuentas configurable desde UI (hardcoded en seed SQL).
- Timbrado SAT / DIOT / balanza de comprobación exportable en este change.
- Módulo de nómina (no tiene evento de dominio aún).

## Decisions

### D1 — Schema: AsientoContable como cabecera, MovimientoPoliza como líneas

**Decisión:** `AsientoContable` permanece como cabecera (folio, tipo, monto_total, estatus, conciliaciones). `MovimientoPoliza` son las líneas hijas (cuenta_id, cargo, abono, orden).

**Alternativa descartada:** Agregar campos cargo/abono directamente al `AsientoContable`. No escala porque una póliza tiene ≥2 líneas (principio de partida doble: suma cargos = suma abonos).

**Rationale:** Modelo relacional estándar 1-N. Permite agregar por cuenta para reportes sin romper el schema existente.

---

### D2 — Mapper hardcoded por tipo_poliza

**Decisión:** Función `buildMovimientosForPoliza(tipo, context)` en `contabilidad/src/mapper.ts`. Devuelve `[{clave_cargo, clave_abono, monto, descripcion}]`. Las claves se resuelven a `CuentaContable.id_cuenta` en tiempo de escritura.

**Alternativa descartada:** Configuración dinámica por tenant desde UI. Requiere UI de setup, validaciones y mantenimiento. Para un cliente único (Bocam), es sobreingeniería en esta etapa.

**Rationale:** Más rápido de implementar, testeable con unit tests directos, fácil de auditar.

---

### D3 — Seed del catálogo de cuentas vía migración Prisma

**Decisión:** El catálogo se siembra en una migración SQL manual (`prisma/migrations/xxx_seed_cuentas.sql`) ejecutada una sola vez. No usa `prisma db seed` para evitar re-ejecuciones accidentales.

**Cuentas principales (constructora SAT-compatible):**
```
1100 Bancos                    (ACTIVO, DEUDORA)
1200 Cuentas por Cobrar        (ACTIVO, DEUDORA)
1300 Inventarios               (ACTIVO, DEUDORA)
1400 Anticipos a Proveedores   (ACTIVO, DEUDORA)
2100 Cuentas por Pagar         (PASIVO, ACREEDORA)
2300 IVA Trasladado por Pagar  (PASIVO, ACREEDORA)
3100 Capital Social            (CAPITAL, ACREEDORA)
3200 Utilidades Retenidas      (CAPITAL, ACREEDORA)
4100 Ingresos por Contratos    (INGRESO, ACREEDORA)
5100 Costo Directo de Obra     (COSTO, DEUDORA)
5110 Materiales                (COSTO, DEUDORA)
5120 Mano de Obra              (COSTO, DEUDORA)
5130 Maquinaria y Equipo       (COSTO, DEUDORA)
5140 Subcontratos              (COSTO, DEUDORA)
6100 Gastos de Administración  (GASTO, DEUDORA)
```

---

### D4 — Cutoff via constante de módulo

**Decisión:** Constante `PARTIDA_DOBLE_CUTOFF = new Date('2026-06-29T00:00:00Z')` en `main.ts`. Cada handler verifica `fecha_poliza >= PARTIDA_DOBLE_CUTOFF` antes de crear movimientos. Asientos anteriores quedan sin movimientos (partida simple).

**Rationale:** Evita migración retroactiva compleja. El contador acepta que el historial previo al cutoff es partida simple.

---

### D5 — Reportes via SQL agregado (sin ORM)

**Decisión:** Los 4 reportes usan `prisma.$queryRaw` con SQL directo para las agregaciones (SUM cargo/abono por cuenta, agrupado por tipo). No usar `groupBy` de Prisma Client porque no soporta JOINs complejos multi-nivel.

**Rationale:** Performance y control total sobre los cálculos contables. Los reportes son read-only, no mutan estado.

---

### D6 — Frontend: un único ContabilidadView con 3 tabs

**Decisión:** Una sola vista `ContabilidadView.tsx` con tabs internos. No rutas separadas por tab.

**Rationale:** Consistente con el patrón de otras vistas del sistema (FinanzasView, ComprasView).

## Risks / Trade-offs

**[Riesgo] Suma cargo ≠ suma abono en pólizas complejas** → Mitigation: El mapper valida `sum(cargo) === sum(abono)` antes de persistir. Si no cuadra, lanza error y el asiento queda sin movimientos (no bloquea el flujo de negocio).

**[Riesgo] CuentaContable no existe al momento del primer evento** → Mitigation: El seed se ejecuta en la migración Prisma antes del deploy. Si falla el lookup de cuenta, el handler loggea warn y crea el asiento sin movimientos (graceful degradation).

**[Riesgo] control_obra.avance_fisico_validado no tiene cuenta clara** (¿material? ¿subcontrato?) → Mitigation: En v1 se mapea siempre a `5100-Costo Directo de Obra` / `2100-Cuentas por Pagar`. Se puede refinar con contexto del payload en iteración futura.

**[Trade-off] Sin migración retroactiva** → Los reportes solo cubren desde el cutoff. El contador necesita los reportes anteriores por separado. Aceptado: Bocam tiene contabilidad externa hasta el cutoff.

## Migration Plan

1. Deploy de la migración Prisma (crea tablas `cuentas_contables` + `movimientos_poliza`).
2. Ejecutar seed SQL de catálogo de cuentas.
3. Deploy del servicio contabilidad con handlers extendidos.
4. Verificar en logs que los primeros eventos post-cutoff generan movimientos.
5. **Rollback**: Las 2 tablas nuevas son aditivas. Si se hace rollback, los handlers existentes siguen funcionando sin movimientos (backward-compatible).

## Open Questions

- ¿El catálogo de cuentas es compartido por todos los tenants o por tenant? → **Decisión: compartido** (mismo catálogo para todos los proyectos de Bocam). Si en el futuro hay multi-empresa, se revisa.
- ¿Los reportes necesitan exportación PDF/Excel en este change? → **Fuera de alcance v1**: los datos se renderizan en tabla HTML. Excel/PDF en change separado.

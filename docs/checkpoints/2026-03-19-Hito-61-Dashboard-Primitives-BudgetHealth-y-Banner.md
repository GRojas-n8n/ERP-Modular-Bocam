# Checkpoint: Dashboard primitives de presupuesto y banner operativo

**Fecha:** 2026-03-19  
**Responsable:** Codex  
**Estado:** Completado

---

## 1. Objetivo

Homogeneizar los bloques ejecutivos que todavia seguian locales dentro del shell, especialmente:

- resumen / salud presupuestal
- banners operativos de estado

La meta fue decidir con evidencia real si estos bloques ya merecian subir a `@bocam/ui-core`.

---

## 2. Cambios realizados

### Nuevas primitives en `@bocam/ui-core`

Se agregaron en:

- [packages/ui-core/src/index.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/src/index.tsx)

Primitives nuevas:

- `ProgressRing`
- `BudgetHealthCard`
- `OperationalBanner`

Estas piezas cubren:

- visualizacion compacta de porcentaje ejecutivo
- resumen presupuestal con chart embebido por slot
- banner operativo reusable con badge, titulo, descripcion y acciones

### Refactor de `DashboardView`

Se actualizo:

- [apps/app-shell/src/views/DashboardView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/DashboardView.tsx)

Cambios principales:

- el bloque local de consumo presupuestal ahora usa `BudgetHealthCard`
- el anillo local de porcentaje fue absorbido por `ProgressRing`
- el banner oscuro de identidad / seguridad ahora usa `OperationalBanner`
- `Sparkline` se mantiene local porque todavia no hay suficiente evidencia de patron transversal estable para subirlo a `ui-core`

---

## 3. Decision de arquitectura visual

### Si merecen quedar en `ui-core`

- `MetricCard`
- `ProgressRing`
- `BudgetHealthCard`
- `OperationalBanner`

Razon:

- ya tienen patron repetible de dashboard
- no dependen de un modulo especifico
- encapsulan lenguaje visual reutilizable del shell

### Aun deben quedarse locales

- `Sparkline`
- composicion de actividad reciente
- mosaicos de modulos / proyectos

Razon:

- todavia no hay suficiente repeticion estable
- siguen demasiado acoplados a `DashboardView`

---

## 4. Validacion

Comandos ejecutados:

```powershell
npx tsc --noEmit -p packages/ui-core/tsconfig.json
npx tsc --noEmit -p apps/app-shell/tsconfig.app.json
```

Resultado:

- ambos comandos pasaron en verde

---

## 5. Resultado

El shell ya no depende de implementaciones locales para los bloques ejecutivos mas importantes del dashboard. Con este hito, `@bocam/ui-core` ya incorpora primitives reales de dashboard y no solo componentes base de layout, formularios o tablas.

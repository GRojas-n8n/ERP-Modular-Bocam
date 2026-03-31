# Checkpoint: Inicio de imports explicitos desde la capa dashboard

**Fecha:** 2026-03-19  
**Responsable:** Codex  
**Estado:** Completado

---

## 1. Objetivo

Comenzar la transicion desde el barrel general `@bocam/ui-core` hacia imports explicitos de la subcapa `dashboard/`, sin romper compatibilidad del shell.

---

## 2. Cambios realizados

### Alias de resolucion

Se agrego soporte explicito para el subpath:

- [apps/app-shell/tsconfig.app.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/tsconfig.app.json)
- [apps/app-shell/vite.config.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/vite.config.ts)

Nuevo alias:

- `@bocam/ui-core/dashboard`

### Vistas migradas

Se actualizaron:

- [apps/app-shell/src/views/DashboardView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/DashboardView.tsx)
- [apps/app-shell/src/views/FinanzasView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/FinanzasView.tsx)

Ahora estas vistas importan desde:

- `@bocam/ui-core/dashboard`

Primitives cubiertas:

- `MetricCard`
- `BudgetHealthCard`
- `OperationalBanner`

---

## 3. Resultado arquitectonico

El barrel general:

- se mantiene por compatibilidad
- ya no es el destino recomendado para nuevas vistas o vistas refactorizadas que consuman primitives ejecutivas

La nueva recomendacion queda asi:

- base UI -> `@bocam/ui-core`
- dashboard primitives -> `@bocam/ui-core/dashboard`

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

## 5. Siguiente paso sugerido

Continuar la misma transicion en cualquier vista nueva o en futuras refactorizaciones del shell, evitando reintroducir imports de primitives ejecutivas desde el barrel general.

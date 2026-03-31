# Checkpoint: Auditoria de imports de dashboard layer

**Fecha:** 2026-03-19  
**Responsable:** Codex  
**Estado:** Completado

---

## 1. Objetivo

Verificar que las primitives ejecutivas ya no entren por el barrel general `@bocam/ui-core` y que la transicion a `@bocam/ui-core/dashboard` este realmente aplicada en el shell.

---

## 2. Hallazgo

Se auditaron los imports del App Shell y el uso de:

- `MetricCard`
- `BudgetHealthCard`
- `OperationalBanner`
- `ProgressRing`

Resultado:

- no quedan imports incorrectos de primitives ejecutivas desde `@bocam/ui-core`
- las unicas vistas que hoy consumen esa capa son:
  - [apps/app-shell/src/views/DashboardView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/DashboardView.tsx)
  - [apps/app-shell/src/views/FinanzasView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/FinanzasView.tsx)

Ambas ya importan correctamente desde:

- `@bocam/ui-core/dashboard`

---

## 3. Implicacion

La regla queda vigente para futuras migraciones:

- primitives base -> `@bocam/ui-core`
- primitives ejecutivas de dashboard -> `@bocam/ui-core/dashboard`

El barrel general se mantiene solo como compatibilidad y transicion.

---

## 4. Verificacion realizada

Revision por busqueda dirigida de imports y usos dentro de:

- `apps/app-shell/src/components`
- `apps/app-shell/src/views`

No fue necesario cambiar codigo adicional en esta pasada.

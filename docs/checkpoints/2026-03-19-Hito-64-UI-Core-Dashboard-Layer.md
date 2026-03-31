# Checkpoint: ui-core con subcapa explicita de dashboard

**Fecha:** 2026-03-19  
**Responsable:** Codex  
**Estado:** Completado

---

## 1. Objetivo

Materializar en codigo la decision de arquitectura visual:

- separar primitives base
- separar primitives de dashboard
- mantener compatibilidad total con los imports actuales del shell

---

## 2. Estructura nueva

Se creo esta organizacion en `@bocam/ui-core`:

- [packages/ui-core/src/primitives.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/src/primitives.tsx)
- [packages/ui-core/src/dashboard/index.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/src/dashboard/index.tsx)
- [packages/ui-core/src/index.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/ui-core/src/index.tsx)

### `primitives.tsx`

Contiene la base del design system:

- `cn`
- `Button`
- `Card`
- `FormField`, `Input`, `Textarea`, `Select`
- `SideSheet`
- `Table*`
- `EmptyStatePanel`
- `BrandMark`
- `SectionBadge`

### `dashboard/index.tsx`

Contiene las primitives ejecutivas:

- `MetricCard`
- `ProgressRing`
- `BudgetHealthCard`
- `OperationalBanner`

### `index.tsx`

Ahora funciona como barrel:

- re-exporta `primitives`
- re-exporta `dashboard`

Con esto no fue necesario cambiar imports del shell.

---

## 3. Resultado arquitectonico

La libreria ya separa claramente:

- primitives base del design system
- primitives de dashboard / resumen ejecutivo

Esto mejora:

- orden interno de `ui-core`
- mantenibilidad
- descubribilidad de componentes
- escalabilidad futura sin forzar todavia un paquete aparte

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

## 5. Conclusion

`MetricCard`, `ProgressRing`, `BudgetHealthCard` y `OperationalBanner` ya justificaban una capa explicita de dashboard dentro de `@bocam/ui-core`. La reorganizacion quedo aplicada sin ruptura para el App Shell.

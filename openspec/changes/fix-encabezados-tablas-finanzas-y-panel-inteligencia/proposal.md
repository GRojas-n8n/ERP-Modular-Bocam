## Why

En Finanzas (vista de proyecto), los títulos de la tabla "Presupuestos asignados" se apilan verticalmente en la primera columna, y el panel "Inteligencia financiera" muestra textos fijos inventados (Materiales al 85%, "recuperación de $3,712.58 por cancelación de OC") que no salen de ningún dato. Lo primero hace ilegible la posición presupuestal; lo segundo le muestra a Finanzas información falsa como si fuera real.

## What Changes

- **Bug de encabezado:** `FinanzasView.tsx` usa invertidos los componentes de `@bocam/ui-core`. `TableHead` (que renderiza `<th>`) se usa como contenedor del encabezado y `TableHeader` (que renderiza `<thead>`) como cada título. El DOM resultante es `<th><tr><thead>Código</thead><thead>…</thead></tr></th>`: una sola celda con 7 grupos de encabezado apilados. Se corrige a `TableHeader > TableRow > TableHead`, la misma estructura que usan las filas (`TableBody > TableRow > TableCell`), con títulos de montos alineados a la derecha.
- El mismo error está en la tabla "Pagos de OCs" de la misma vista; se corrige igual.
- **Panel "Inteligencia financiera":** se oculta detrás de la bandera `inteligenciaFinanciera` (nuevo `src/lib/feature-flags.ts`), **desactivada por defecto**. Se enciende solo con `VITE_FLAG_INTELIGENCIA_FINANCIERA=true` en el build. El código del panel no se borra.
- Sin cambios de backend ni de `@bocam/ui-core`.

## Capabilities

### New Capabilities
- `vista-finanzas-tablas-y-paneles`: estructura de columnas de las tablas de la vista de Finanzas y regla de no mostrar paneles con datos que no provienen del backend.

### Modified Capabilities
<!-- Ninguna: dashboard-entrada-finanzas no define requisitos sobre estas tablas ni sobre el panel. -->

## Impact

- `apps/app-shell/src/views/FinanzasView.tsx`
- `apps/app-shell/src/lib/feature-flags.ts` (nuevo)
- Tests nuevos en `apps/app-shell/src/views/`.
- Fuera de alcance (anotado, no corregido): otros textos y porcentajes fijos de la misma vista, como "Impacto en caja 65%".

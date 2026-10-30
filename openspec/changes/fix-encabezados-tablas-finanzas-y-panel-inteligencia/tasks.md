## 1. Tests que reproducen el problema

- [x] 1.1 Test de estructura: `thead > tr > th` con 7 títulos en Presupuestos asignados, `th` de montos alineados a la derecha y 7 `td` por fila (debe fallar antes del fix)
- [x] 1.2 Test de estructura de Pagos de OCs: mismo número de `th` que de `td` (debe fallar antes del fix)
- [x] 1.3 Test del panel: oculto con la bandera apagada y visible con la bandera encendida (debe fallar antes del fix)

## 2. Corrección

- [x] 2.1 `FinanzasView.tsx`: `TableHeader > TableRow > TableHead` en las dos tablas
- [x] 2.2 `src/lib/feature-flags.ts` con `inteligenciaFinanciera` apagada por defecto
- [x] 2.3 Envolver el panel "Inteligencia financiera" en la bandera, sin borrar su código
- [x] 2.4 Tests del change y suite de app-shell en verde; typecheck y build sin errores

## 3. Verificación

- [x] 3.1 Reconstruir app-shell en el entorno local y verificar en localhost:8080 con `finanzas@iretum.local`

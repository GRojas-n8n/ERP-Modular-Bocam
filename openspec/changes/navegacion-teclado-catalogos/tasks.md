## 1. Hook reutilizable

- [x] 1.1 Test: con una lista de 5 items y el 3ro activo, `ArrowDown`
      navega al 4to y `ArrowUp` navega al 2do (usar `@testing-library/react`
      + `fireEvent.keyDown` sobre `window`, o `renderHook`)
- [x] 1.2 Test: en el primer item, `ArrowUp` no dispara `onNavigate`; en el
      último, `ArrowDown` no dispara `onNavigate`
- [x] 1.3 Test: si `document.activeElement` es un `input`/`textarea`/`select`,
      las flechas no disparan `onNavigate`
- [x] 1.4 Test: si `currentId` no existe en `items` (ej. cambió el filtro),
      no dispara `onNavigate` ni lanza error
- [x] 1.5 Test: `enabled=false` (panel cerrado) no registra el listener —
      las flechas no hacen nada aunque haya `items`/`currentId`
- [x] 1.6 Crear `apps/app-shell/src/hooks/useArrowKeyNav.ts` (genérico,
      firma documentada en design.md)
- [x] 1.7 Verificar que los tests 1.1-1.5 pasan

## 2. Integración en `InsumosView.tsx`

- [x] 2.1 Panel de fichas técnicas: integrar `useArrowKeyNav` sobre
      `insumosFiltrados` / `insumoFichasId`
- [x] 2.2 Panel de take-off/APU: integrar sobre `conceptosFiltrados` /
      `conceptoTakeoff`
- [x] 2.3 Panel de saldo de partida: integrar sobre `conceptosFiltrados`,
      mapeando cada concepto navegado al `SaldoResumen` correspondiente
      (misma lógica que ya usa el `onClick` que abre el panel hoy)
- [x] 2.4 Confirmar que los 3 paneles no interfieren entre sí (nunca hay más
      de uno abierto a la vez, así que no debería haber colisión de
      listeners, pero verificar explícitamente)

## 3. Verificación end-to-end

- [x] 3.1 Manual: abrir fichas técnicas de un insumo, presionar `ArrowDown`
      varias veces, confirmar que recorre la tabla en orden
- [x] 3.2 Manual: con un filtro de búsqueda activo, confirmar que la
      navegación respeta solo los renglones visibles
- [x] 3.3 Manual: confirmar que las flechas no hacen nada en los extremos
      de la lista (primer/último renglón)
- [x] 3.4 Manual: si el panel tiene un buscador de texto, confirmar que
      escribir y mover el cursor con flechas dentro de ese campo sigue
      funcionando normalmente
- [x] 3.5 Ejecutar la suite de tests de `apps/app-shell` para descartar
      regresiones

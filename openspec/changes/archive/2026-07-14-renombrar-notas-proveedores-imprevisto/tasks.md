## 1. Test que fija el comportamiento esperado (primero, en rojo)

- [x] 1.1 Test Playwright E2E en `apps/app-shell/e2e/` (mismo patrón de login/seed que los
      E2E existentes): como Residente, abrir "Nueva Requisición", seleccionar tipo
      IMPREVISTO y asertar que (a) existe el FormField "Notas para Proveedores", (b) NO
      existe un FormField común titulado exactamente "Justificación" (el campo por ítem
      "Justificación *" sí existe), y (c) la leyenda "pueden llegar a los proveedores" es
      visible. Correrlo contra el código actual y confirmar que FALLA (rojo).

## 2. Fix

- [x] 2.1 `apps/app-shell/src/views/ResidenciaView.tsx` (~línea 2347): eliminar los tres
      condicionales `reqTipo === 'IMPREVISTO'` del FormField común de notas — etiqueta
      fija "Notas para Proveedores", placeholder fijo de proveedores, leyenda de
      advertencia visible siempre.

## 3. Verificación

- [x] 3.1 Test de 1.1 en verde contra el código corregido.
- [x] 3.2 `tsc -b` en `apps/app-shell` limpio (gap conocido: el CI no valida este build).
- [x] 3.3 Verificación visual en entorno local: crear requisición IMPREVISTO como
      Residente y confirmar etiqueta + leyenda; confirmar que el flujo normal (POR
      CATÁLOGO) no cambió.

## 4. Cierre

- [x] 4.1 PR contra main (branch `fix/`), CI verde, merge.
- [x] 4.2 Redeploy manual de `app-shell` en VPS (compose build + up -d) y smoke 200.
      → Hecho 2026-07-14: PR #66 mergeado (squash 1ec49e1) con CI verde; contenedor
      bocam-vps-app-shell recreado 16:21 UTC, healthy; https://iretum.com → 200.

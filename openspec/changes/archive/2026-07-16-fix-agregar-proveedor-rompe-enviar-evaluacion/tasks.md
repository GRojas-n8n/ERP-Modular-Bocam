## 1. Test que reproduce el bug (primero, en rojo)

- [x] 1.1 Nuevo `apps/app-shell/src/components/ComparativaDetail.agregar-proveedor-preserva-estado.test.tsx`:
      montar `ComparativaDetail` en `modo="compras"` con un cuadro
      `estado: 'BORRADOR'` y `proveedoresCatalogo` con 1 item; simular
      clic en "Agregar proveedor" + selección del item del catálogo;
      verificar que `onUpdate` se llama con `estado: 'BORRADOR'` (no
      `'EN_PROCESO'`). Confirmado en rojo contra el código actual
      (`expected 'EN_PROCESO' to be 'BORRADOR'`).
- [x] 1.2 Mismo archivo, segundo caso: `handleAddLinea` (agregar línea
      manualmente) tampoco SHALL cambiar `estado`. Confirmado en rojo
      contra el código actual (mismo error).

## 2. Fix

- [x] 2.1 `apps/app-shell/src/components/ComparativaDetail.tsx`:
      `handleAddProveedorFromCatalog` — quitar `estado: 'EN_PROCESO'` del
      objeto pasado a `onUpdate`.
- [x] 2.2 `apps/app-shell/src/components/ComparativaDetail.tsx`:
      `handleAddLinea` — mismo quite.

## 3. Verificación

- [x] 3.1 Los 2 tests nuevos en verde.
- [x] 3.2 `npm run build` (`tsc -b && vite build`) en `apps/app-shell` limpio.
- [x] 3.3 Suite de tests de `ComparativaDetail.*.test.tsx` existente sigue
      en verde (sin regresión): 10 archivos, 26 tests, todos en verde.

## 4. Cierre

- [x] 4.1 PR contra `main`, CI verde, merge.
      → PR #73 mergeado (squash `c1e41a5`).
- [x] 4.2 Redeploy VPS de `app-shell` (build + `up -d`, sin migración).
      → Hecho 2026-07-16: build limpio, contenedor recreado, healthy, smoke
      `https://iretum.com/` → HTTP 200.

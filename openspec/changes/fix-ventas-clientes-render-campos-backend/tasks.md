## 1. Test que reproduce el bug

- [x] 1.1 Escribir test de componente en
      `apps/app-shell/src/views/VentasView.clientes-campos-backend.test.tsx`:
      mockear `ventasApi.getClientes()` para devolver un registro con el
      shape real del backend (`id_cliente`, `rfc_tax_id`, `razon_social`,
      `email_contacto`, `telefono`, `estatus` — SIN `nombre`/`rfc`) y
      renderizar `VentasView` en el tab Clientes. Debe fallar en rojo
      contra el código actual (`TypeError: Cannot read properties of
      undefined (reading 'toLowerCase')` al filtrar).
- [x] 1.2 Test: con ese mismo mock, la tabla debe mostrar la razón
      social y el RFC reales (no "undefined" ni un crash).

## 2. Fix

- [x] 2.1 En `VentasView.tsx`, dentro de `fetchData` (rama
      `t === 'clientes'`), normalizar cada registro de
      `r.data.data` al shape de la interfaz `Cliente` existente
      (`id ← id_cliente`, `nombre ← razon_social`, `rfc ← rfc_tax_id`,
      `email ← email_contacto`) antes de `setClientes(...)` — ver
      Decisión D1 de design.md. No se toca la interfaz `Cliente`, el
      filtro `clientesFiltrados` ni el render de la tabla.
- [x] 2.2 Ejecutar los tests de 1.1-1.2 y confirmar que pasan en verde.

## 3. Verificación de regresión

- [x] 3.1 Ejecutar `tsc -b` limpio en `app-shell`. Limpio.
- [x] 3.2 Ejecutar la suite completa de vitest de `app-shell` y confirmar
      0 regresiones (en particular, que `DEMO_CLIENTES` — modo demo —
      sigue renderizando igual, ya que no pasa por la normalización
      nueva). 31/31 ok.

## 4. Verificación E2E (bloqueaba PR #44)

- [ ] 4.1 Re-correr `apps/app-shell/test/e2e/clientes-importar-lote.e2e.spec.ts`
      (de `carga-masiva-clientes-ventas`, PR #44) contra este fix aplicado
      sobre esa branch, y confirmar que pasa en verde — era el bloqueo
      original que motivó este change.

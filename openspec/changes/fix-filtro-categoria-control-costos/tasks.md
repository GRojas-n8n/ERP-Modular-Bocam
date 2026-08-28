## 1. Test que reproduce el bug

- [x] 1.1 Escribir test (RTL) sobre la pestaña "Control de Costos" de `InsumosView` que falle contra el código actual: verificar que no existe ningún `<select>` de categoría de gasto en esa pestaña (hoy existe pero solo con la opción "Todas las categorías")
- [x] 1.2 Escribir test de que el filtro "Solo con desviación" sigue funcionando correctamente (muestra solo filas con semáforo amarillo/rojo al activarse)
- [x] 1.3 Confirmar que el test de 1.1 falla contra el código actual (reproduce el bug antes del fix)

## 2. Fix

- [x] 2.1 Eliminar el `<select>` de categoría y su bloque JSX en la pestaña "Control de Costos" (`InsumosView.tsx`)
- [x] 2.2 Eliminar el estado `costosFiltroCategoria` y `costosCategoriasDisp`, y la línea `setCostosCategoriasDisp([])` en `loadCostosWbs`
- [x] 2.3 Eliminar el campo `categorias` de la interfaz `CostosWbsRow` y su asignación fija a `[]` en el mapeo de `loadCostosWbs`
- [x] 2.4 Eliminar la condición de filtrado por `categorias` en el `.filter()` de la tabla, dejando solo la condición de `costosFiltroDes`
- [x] 2.5 Verificar que los tests de 1.1 y 1.2 pasan

## 3. Verificación

- [x] 3.1 Correr `run-app-shell` y confirmar visualmente que la pestaña "Control de Costos" ya no muestra el selector de categoría, y que "Solo con desviación" sigue funcionando
- [x] 3.2 Confirmar que el suite completo de tests de `app-shell` sigue en verde

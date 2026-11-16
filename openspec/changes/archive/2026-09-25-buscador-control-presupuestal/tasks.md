## 1. Búsqueda en ControlPresupuestalTabla

- [x] 1.1 Escribir tests que reproduzcan el comportamiento esperado: filtrado por clave, filtrado por descripción, combinación con filtro de categoría, comportamiento de la fila "[Sin partida]", y estado vacío sin resultados
- [x] 1.2 Agregar campo de búsqueda (input controlado) en `ControlPresupuestalTabla.tsx`
- [x] 1.3 Implementar el filtrado client-side combinando búsqueda + categoría sobre los datos ya cargados
- [x] 1.4 Implementar el estado vacío ("no hay partidas que coincidan con el filtro")
- [x] 1.5 Verificar que los tests de 1.1 pasan

## 2. Verificación manual

- [x] 2.1 Correr `run-app-shell` y probar la búsqueda desde la pestaña "Presupuesto por Partida" en Control de Obra
- [x] 2.2 Probar la búsqueda desde la pestaña "Control Presupuestal" en Insumos
- [x] 2.3 Confirmar que el suite completo de tests de `app-shell` sigue en verde

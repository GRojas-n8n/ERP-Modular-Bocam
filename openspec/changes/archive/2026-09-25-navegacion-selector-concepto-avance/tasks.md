## 1. Navegación de teclado

- [x] 1.1 Escribir tests: `ArrowDown`/`ArrowUp` resaltan la siguiente/anterior opción, `Enter` confirma la opción resaltada, sin wrap-around en los límites, y el resaltado respeta el filtro de búsqueda activo
- [x] 1.2 Implementar `highlightedIndex` (estado local) y el manejo de teclado en el selector de concepto (`ControlObraView.tsx`, panel "Registrar Avance")
- [x] 1.3 Reiniciar `highlightedIndex` a `0` cuando cambia el texto de búsqueda
- [x] 1.4 Verificar que los tests de 1.1 pasan

## 2. Conceptos recientes

- [x] 2.1 Escribir tests: un concepto usado aparece en "Recientes" al reabrir el selector con búsqueda vacía; escribir en la búsqueda oculta "Recientes"; sin capturas previas, no hay sección "Recientes"
- [x] 2.2 Implementar el estado `conceptosRecientes` (máx. 5, más reciente primero) y actualizarlo al confirmar cada avance
- [x] 2.3 Renderizar la sección "Recientes" antes de la lista completa cuando la búsqueda está vacía
- [x] 2.4 Verificar que los tests de 2.1 pasan

## 3. Verificación manual

- [x] 3.1 Correr `run-app-shell` y probar la navegación de teclado (flechas + Enter) en el selector de concepto
- [x] 3.2 Probar que, tras capturar 2-3 avances con el panel abierto (ver `captura-continua-avances-bitacora`), los conceptos recientes aparecen correctamente
- [x] 3.3 Confirmar que el suite completo de tests de `app-shell` sigue en verde

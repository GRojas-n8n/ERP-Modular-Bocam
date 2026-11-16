## 1. Panel "Registrar Avance"

- [x] 1.1 Escribir tests (RTL) que reproduzcan el comportamiento actual y el esperado: tras guardar exitosamente, el panel sigue abierto, el selector de concepto y cantidad/periodo quedan vacíos, y aparece una confirmación inline con el concepto/periodo guardado
- [x] 1.2 Escribir test de que un segundo avance puede capturarse y enviarse sin reabrir el panel
- [x] 1.3 Escribir test de que la acción "Cerrar" cierra el panel sin enviar ningún avance
- [x] 1.4 Modificar el handler de éxito de guardado en `ControlObraView.tsx` (pestaña Avances Físicos) para limpiar solo los campos de captura en vez de cerrar el panel, y mostrar la confirmación inline
- [x] 1.5 Agregar/renombrar la acción "Cerrar" del panel para el cierre explícito
- [x] 1.6 Verificar que los tests de 1.1-1.3 pasan

## 2. Panel "Nueva Entrada" de Bitácora

- [x] 2.1 Escribir tests (RTL) que reproduzcan el comportamiento actual y el esperado: tras guardar exitosamente, el panel sigue abierto, el frente de trabajo seleccionado se conserva, los demás campos de la entrada quedan vacíos, y aparece una confirmación inline con el número de entrada guardado
- [x] 2.2 Escribir test de que una segunda entrada para el mismo frente puede capturarse y enviarse sin reabrir el panel ni reseleccionar el frente
- [x] 2.3 Escribir test de que la acción "Cerrar" cierra el panel sin enviar ninguna entrada
- [x] 2.4 Modificar el handler de éxito de guardado en `ControlObraView.tsx` (pestaña Bitácora) para limpiar solo los campos de la entrada en vez de cerrar el panel, conservando el frente de trabajo seleccionado, y mostrar la confirmación inline
- [x] 2.5 Agregar/renombrar la acción "Cerrar" del panel para el cierre explícito
- [x] 2.6 Verificar que los tests de 2.1-2.3 pasan

## 3. Verificación manual

- [x] 3.1 Correr `run-app-shell` y probar en el navegador el flujo de capturar 2-3 avances seguidos sin reabrir el panel
- [x] 3.2 Probar en el navegador el flujo de capturar 2-3 entradas de bitácora seguidas para el mismo frente sin reabrir el panel
- [x] 3.3 Confirmar que el suite completo de tests de `app-shell` sigue en verde (`ControlObraView.*.test.tsx` y relacionados)

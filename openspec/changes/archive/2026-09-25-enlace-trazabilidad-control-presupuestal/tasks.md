## 1. ControlPresupuestalTabla — acción "Ver en Trazabilidad"

- [x] 1.1 Escribir test de que la acción "Ver en Trazabilidad" no se renderiza cuando no se pasa `onVerTrazabilidad`
- [x] 1.2 Escribir test de que, al pasarse `onVerTrazabilidad`, la acción aparece en cada fila y al hacer clic invoca el callback con el `concepto_id` correcto
- [x] 1.3 Agregar el prop opcional `onVerTrazabilidad?: (conceptoId: string) => void` y el botón/acción por fila en `ControlPresupuestalTabla.tsx`
- [x] 1.4 Verificar que los tests de 1.1-1.2 pasan

## 2. InsumosView — pestañas Control Presupuestal y Control de Costos

- [x] 2.1 Agregar prop `onSubNavigate?: (sub: string) => void` a `InsumosView` y wirearlo desde `App.tsx` (`onSubNavigate={setCurrentSubView}`)
- [x] 2.2 Pasar `onVerTrazabilidad` a `ControlPresupuestalTabla` desde la pestaña "Control Presupuestal", que llama a `onSubNavigate('trazabilidad')` y guarda el `concepto_id` en un nuevo estado `trazPendingExpand`
- [x] 2.3 Agregar la misma acción "Ver en Trazabilidad" por fila en la tabla de "Control de Costos" (JSX inline, mismo comportamiento)
- [x] 2.4 Escribir test de que, tras el salto, la fila correspondiente en Trazabilidad queda expandida cuando la partida existe en los datos cargados
- [x] 2.5 Escribir test de que, si la partida no existe en Trazabilidad, no se expande ninguna fila y no hay error visible

## 3. Pestaña Trazabilidad — expansión automática

- [x] 3.1 Implementar la lógica: al activarse la pestaña "Trazabilidad" (o al recibir datos), si `trazPendingExpand` coincide con un `concepto_id` cargado, agregarlo a `trazExpanded` y limpiar `trazPendingExpand`
- [x] 3.2 Verificar que los tests de 2.4-2.5 pasan

## 4. Verificación manual

- [x] 4.1 Correr `run-app-shell` y probar el salto desde Control Presupuestal a Trazabilidad
- [x] 4.2 Probar el salto desde Control de Costos a Trazabilidad
- [x] 4.3 Confirmar que `ControlObraView` (Presupuesto por Partida) no muestra la acción "Ver en Trazabilidad"
- [x] 4.4 Confirmar que el suite completo de tests de `app-shell` sigue en verde

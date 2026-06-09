# Spec — Cuadro Comparativo con Especificaciones y Anotaciones

## Criterios de Aceptación

### Especificaciones en la matriz

1. **CA-01**: En el cuadro comparativo, cada partida tiene un bloque de sub-filas bajo su encabezado, una por cada especificación capturada en la req. Estas sub-filas muestran el texto de la especificación en la columna de descripción.

2. **CA-02**: Las sub-filas de especificaciones son de solo lectura en el cuadro — no son editables desde aquí (se editaron en la req). Tienen fondo visual diferenciado (más claro o con borde izq de color) para distinguirlas de las filas de partidas.

3. **CA-03**: Los cuadros comparativos creados antes de esta funcionalidad (sin `detalle_req_id`) cargan sin errores. Si no hay specs vinculadas, el cuadro se muestra igual que antes (sin sub-filas).

### Anotaciones por celda [especificación × proveedor]

4. **CA-04**: En cada celda de la intersección [sub-fila de spec × columna de proveedor], el Residente puede agregar una anotación tipo "pregunta". Al hacer click en la celda aparece un pequeño popover con campo de texto y botón "Guardar consulta".

5. **CA-05**: Una celda con pregunta sin respuesta muestra el ícono `?` en color ámbar. Una celda con pregunta respondida muestra `✓` en color verde. Una celda sin anotación está vacía.

6. **CA-06**: Compras puede ver las preguntas del Residente en las celdas y agregar una anotación tipo "respuesta" en la misma celda. El flujo es: Residente pregunta → Compras responde → celda muestra `✓`.

7. **CA-07**: Las anotaciones no afectan la evaluación C/NC/DA/? a nivel de partida. Son información adicional independiente del proceso de aprobación.

### Compatibilidad con evaluación existente

8. **CA-08**: La evaluación C/NC/DA/? por partida (de `comparativa-evaluacion-v2`) continúa funcionando igual. No se modifica ni la lógica de firma ni el estado LOCKED.

9. **CA-09**: Las anotaciones por spec son visibles en modo LOCKED (solo lectura), pero no se pueden agregar nuevas anotaciones cuando el cuadro está LOCKED.

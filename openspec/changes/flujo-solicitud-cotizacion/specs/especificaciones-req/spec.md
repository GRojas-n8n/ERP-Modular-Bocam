# Spec — Especificaciones por Partida en Requisición

## Criterios de Aceptación

1. **CA-01**: En el formulario de creación y edición de requisición, cada partida muestra una sección "Especificaciones requeridas" con un input de texto y botón "Agregar".

2. **CA-02**: Al agregar una especificación, aparece como un chip/tag con el texto y un botón × para eliminar. El usuario puede agregar tantas como necesite.

3. **CA-03**: Las especificaciones se persisten por partida (no a nivel de req completa). Si el usuario elimina una partida, sus specs se eliminan en cascada.

4. **CA-04**: Al recargar el formulario de edición de una req existente, las specs guardadas aparecen como chips en el estado inicial.

5. **CA-05**: Una req sin especificaciones (chips vacíos) es válida — las specs son opcionales.

6. **CA-06**: El texto de cada especificación permite hasta 500 caracteres. Intentar agregar más de 500 caracteres muestra validación inline.

7. **CA-07**: En el resumen de la req (vista de solo lectura en ComprasView), las specs de cada partida se muestran como lista bajo el nombre del insumo.

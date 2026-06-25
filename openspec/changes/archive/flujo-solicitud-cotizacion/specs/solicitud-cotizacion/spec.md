# Spec — Solicitud de Cotización y Seguimiento

## Criterios de Aceptación

### Creación de solicitud

1. **CA-01**: En ComprasView, al abrir una req en estado PENDIENTE, el botón "Enviar Solicitud de Cotización" aparece visible para roles `procurement` y `admin`. No aparece para `resident` ni `superintendent`.

2. **CA-02**: El panel de solicitud muestra un buscador de proveedores del catálogo (igual al picker de ComparativaDetail). Se pueden seleccionar múltiples proveedores. Debe seleccionarse al menos 1 para poder confirmar.

3. **CA-03**: El selector de plazo ofrece solo dos opciones: 3 días hábiles / 5 días hábiles. La `fecha_limite` se calcula sumando días L-V a la fecha de creación.

4. **CA-04**: Al confirmar, el sistema registra la solicitud y muestra el panel de estado inmediatamente. No es necesario salir y volver.

5. **CA-05**: Solo puede existir una solicitud activa por req. Si ya existe, el botón dice "Ver Solicitud de Cotización" y abre el panel de estado (no el panel de creación).

### Estado por proveedor

6. **CA-06**: El panel de estado muestra una fila por cada proveedor con: nombre, estado (PENDIENTE / RESPONDIO / DECLINO), fecha de respuesta (vacía si PENDIENTE), y acciones según estado.

7. **CA-07**: Para un proveedor PENDIENTE, las acciones son: "Subir cotización" (abre selector de archivo — acepta PDF, JPG, PNG) y "Marcar como Declinó".

8. **CA-08**: Al subir un PDF, el estado cambia a RESPONDIO y la fecha de respuesta se registra automáticamente con la hora actual.

9. **CA-09**: Al marcar como Declinó, el estado cambia a DECLINO. Se puede dejar una nota (campo opcional).

10. **CA-10**: El PDF subido es descargable haciendo click en el nombre del archivo en la fila del proveedor.

### Alertas de plazo

11. **CA-11**: Si `fecha_limite < fecha_actual` y hay al menos 1 proveedor en estado PENDIENTE, el panel muestra un banner naranja: "⚠ Plazo vencido — [N] proveedor(es) sin respuesta. Realiza seguimiento telefónico."

12. **CA-12**: En el listado de requisiciones de ComprasView, las reqs con plazo vencido muestran un badge naranja `⚠` junto al nombre.

13. **CA-13**: La sección "Alertas de Cotización" muestra una tabla con: nombre de req, código, proveedor pendiente, días de retraso.

### Creación de cuadro comparativo

14. **CA-14**: El botón "Crear Cuadro Comparativo" aparece en el panel de solicitud cuando al menos 1 proveedor tiene estado RESPONDIO.

15. **CA-15**: Al crear el cuadro desde este botón, las partidas de la req y sus especificaciones se auto-populan en el cuadro. Compras no necesita re-capturar esa información.

16. **CA-16**: Los proveedores que respondieron (RESPONDIO) se agregan automáticamente como columnas del cuadro comparativo.

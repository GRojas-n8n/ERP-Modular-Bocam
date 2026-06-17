## Why

El flujo de compras hoy termina en "OC Emitida" — no hay registro de entrega real. Esto deja al almacén sin inventario actualizado, a Control de Obra sin visibilidad de qué materiales ya llegaron al frente, y a las OC bloqueadas en estado EMITIDA indefinidamente.

## What Changes

- Nueva tabla `recepciones_oc` con sus líneas `recepcion_lineas_oc` en el módulo `compras`.
- Endpoint para registrar una recepción (parcial o total) contra una OC EMITIDA o PARCIALMENTE_RECIBIDA.
- Endpoint para listar recepciones de una OC.
- Transición automática de estado de la OC: `EMITIDA → PARCIALMENTE_RECIBIDA → RECIBIDA_TOTAL` según porcentaje recibido por línea.
- Registro de discrepancias por línea (cantidad recibida ≠ cantidad pedida en la OC).
- Evento `compras.oc_recibida_total` publicado en RabbitMQ cuando la OC se cierra completamente.
- Panel "Recepciones" en ComprasView: tabla de recepciones registradas por OC y formulario de nueva recepción.
- Sección de resumen de recepciones en la vista de OC existente (badges de estado por línea).

## Capabilities

### New Capabilities

- `recepcion-oc`: Registro de recepciones parciales o totales contra una OC — formulario con líneas, cantidades recibidas, discrepancias, fecha y receptor; actualización automática de estado de la OC.
- `ciclo-vida-oc`: Máquina de estados de la OC post-emisión — transiciones EMITIDA → PARCIALMENTE_RECIBIDA → RECIBIDA_TOTAL, reglas de transición, y evento de cierre.

### Modified Capabilities

_(ninguna — no cambia el comportamiento de capacidades ya especificadas)_

## Impact

- **`apps/compras`**: schema Prisma (2 tablas nuevas), 3–4 endpoints nuevos, publicación de evento.
- **`apps/app-shell`**: ComprasView — nuevo sub-panel "Recepciones" en el detalle de OC; badges de estado por línea en la tabla de OC; formulario de nueva recepción.
- **Sin impacto** en otros módulos en esta fase (Control de Obra consumirá el evento en una fase posterior).

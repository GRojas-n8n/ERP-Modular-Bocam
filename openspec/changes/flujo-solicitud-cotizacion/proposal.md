# Proposal — Flujo Completo de Solicitud de Cotización

## Why

El flujo actual de compras tiene dos brechas críticas:

1. **Sin especificaciones técnicas en la requisición.** El Residente captura insumos con cantidad y unidad, pero no puede indicar qué debe cumplir ese material (resistencia, norma, acabado, etc.). Compras recibe la req sin saber exactamente qué pedir a los proveedores, y los proveedores no saben qué ofertar.

2. **Sin trazabilidad del proceso de cotización.** Compras contacta proveedores por WhatsApp/teléfono/email sin ningún registro en el sistema. No hay fecha límite formal, no hay alerta cuando un proveedor no responde, no hay PDF archivado de cada cotización recibida. El cuadro comparativo se construye manualmente desde cero, sin relación explícita con la req ni con el proceso de solicitud.

## What Changes

### Capacidades nuevas

1. **Especificaciones por partida en la req** — El Residente, al crear o editar una requisición, puede agregar N especificaciones por partida (ej: "Resistencia mínima f'c=250 kg/cm²", "Norma NMX-C-407", "Color gris"). Estas viajan con la req a lo largo de todo el flujo.

2. **Solicitud de Cotización formal** — Compras, al recibir una req PENDIENTE, selecciona proveedores del catálogo, elige plazo (3 o 5 días hábiles) y registra la solicitud. El sistema genera el listado de materiales + especificaciones en un formato copiable (v1 sin email — Compras lo envía por su canal preferido).

3. **Alerta por plazo vencido** — Si transcurren los días hábiles acordados y no todos los proveedores han respondido, el sistema muestra una alerta en ComprasView para que el gestor realice el seguimiento telefónico.

4. **Registro de respuestas** — Compras marca el estado de cada proveedor (RESPONDIO / DECLINO / PENDIENTE) y puede subir el PDF de la cotización recibida. Un proveedor marcado DECLINO o PDF adjunto activa el estado de respuesta.

5. **Cuadro comparativo derivado** — Al crear el cuadro comparativo desde una req con solicitud, las partidas y especificaciones se auto-popuplan. Compras solo captura precios y condiciones.

6. **Anotaciones por especificación en el cuadro** — El Residente, al evaluar el cuadro comparativo, puede colocar `?` en una celda [especificación × proveedor] y escribir su pregunta de aclaración. Compras registra la respuesta del proveedor sobre esa especificación puntual.

### Capacidades modificadas

- `GET /compras/requisiciones/:id` — incluye `especificaciones` por detalle en el payload
- `POST /compras/comparativas` — acepta `requisicion_id` para auto-popular lineas y especificaciones
- `GET /compras/comparativas/:id` — incluye especificaciones por partida
- ComparativaDetail — matriz muestra especificaciones como sub-filas bajo cada partida; evaluación C/NC/DA/? se mantiene a nivel partida, con capa adicional de anotación a nivel especificación

## Lo que NO entra en esta versión (fase 2)

- Envío automático por email a proveedores (requiere integración SMTP/SendGrid)
- Portal de proveedor para que ingrese su cotización directamente al sistema
- Comparación automática de precios vía OCR del PDF
- Base de datos maestra de materiales con especificaciones precargadas (descrita por el usuario como "v2 eventual")

## Impact

| Módulo | Impacto |
|---|---|
| `compras` schema | 3 nuevas tablas |
| `compras` backend | 6 nuevos endpoints, 2 modificados |
| `app-shell` ResidenciaView | Inputs de especificaciones en req |
| `app-shell` ComprasView | Panel de solicitud de cotización + alertas |
| `app-shell` ComparativaDetail | Sub-filas de specs + anotaciones por celda |

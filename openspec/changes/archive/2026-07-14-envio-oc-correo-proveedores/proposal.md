## Why

El flujo requisición → cotización → comparativa → Orden de Compra (OC) ya
funciona de punta a punta en producción hasta el momento en que se genera la
OC (`POST /comparativas/:id/convertir-oc`, capability `multi-oc-generacion`).
A partir de ahí, Compras no tiene forma de notificar al proveedor ganador
dentro de iRetum: solo puede descargar el PDF de la OC (`exportarOcPdf`) y
reenviarlo manualmente por fuera del sistema. Esto rompe la paridad con el
flujo de Solicitud de Cotización, que sí envía correo real al proveedor
(capability `solicitud-cotizacion-proveedores`), y bloquea probar el flujo
completo con usuarios reales en producción hoy.

De paso, la misma auditoría encontró que `Requisicion.estado` nunca llega a
`COMPRADA` en ningún código de producción al convertir un cuadro en OC — solo
existe en datos demo y en un test. El frontend (`ComprasView.tsx`) sí
consulta ese estado, así que una requisición con OC ya generada se sigue
mostrando como si no lo estuviera.

## What Changes

- Nueva vista en Compras: lista de Órdenes de Compra generadas con selección
  múltiple (checkboxes), para elegir una o varias y enviarlas por correo a
  sus proveedores en un solo paso.
- Nuevo endpoint en `apps/compras` que, dado un array de `id_orden`, arma y
  envía un correo por proveedor (agrupando las OCs seleccionadas del mismo
  proveedor en un solo correo) usando el transporte SMTP ya configurado en
  `mailer.ts`. Envío best-effort igual que en Solicitud de Cotización: un
  fallo de correo no revierte la OC ya creada.
- Nueva plantilla de correo HTML para Orden de Compra (análoga a
  `rfq-email-template.html`), con el PDF de cada OC adjunto (reutiliza el
  generador de PDF existente de `exportarOcPdf` / `/api/v1/reportes/oc-pdf`).
- Marcador de "enviada" por OC (fecha + destinatarios) visible en la lista,
  para que Compras sepa qué OCs ya se notificaron y evite reenvíos
  accidentales sin bloquear un reenvío manual explícito.
- Fix: al ejecutar `convertir-oc`, actualizar `Requisicion.estado` a
  `COMPRADA` cuando todos sus renglones quedaron cubiertos por las OCs
  generadas del lote.

## Capabilities

### New Capabilities
- `envio-oc-proveedor`: envío de Órdenes de Compra por correo a proveedores,
  incluyendo la vista de selección múltiple en Compras, el agrupamiento por
  proveedor, la plantilla de correo con PDF adjunto, y el estado de envío
  visible por OC.

### Modified Capabilities
- `multi-oc-generacion`: al convertir un cuadro comparativo en OCs, el
  sistema también actualiza `Requisicion.estado` a `COMPRADA` cuando todos
  sus renglones quedan cubiertos por el lote generado.

## Impact

- **Backend (`apps/compras`)**: nuevo endpoint de envío (p.ej.
  `POST /api/v1/compras/ordenes-compra/enviar-correo`), nueva función en
  `mailer.ts` (o módulo hermano) para el correo de OC, ajuste en el handler
  de `convertir-oc` (`main.ts:2277-2465`) para setear `Requisicion.estado`.
  Reutiliza el generador de PDF de OC ya existente en `apps/reportes`.
- **Frontend (`apps/app-shell`)**: nueva sección/vista dentro de
  `ComprasView.tsx` (o componente nuevo) para listar OCs con checkboxes y
  disparar el envío; nueva llamada en `lib/api.ts`.
- **Sin cambios de schema cruzados**: todo dentro del microservicio
  `compras`, sin cross-service en frontend. Reutiliza el SMTP ya configurado
  en producción (confirmado en `.env` del VPS).

## Why

Durante las pruebas de campo del 2026-07-08 se reveló, pregunta tras pregunta del
usuario de Compras, que el flujo de "Solicitud de Cotización" (RFQ) estaba
funcionalmente incompleto: Compras aprobaba requisiciones sin ver qué se pedía,
enviaba cotizaciones a proveedores sin ninguna notificación real (no existía envío
de correo en todo el sistema), no había forma de distinguir notas internas de notas
para el proveedor, no había forma de invitar a otros proveedores si los primeros no
respondían, y los nombres de los proveedores invitados aparecían como `"—"` por un
vínculo de datos roto. Cada hallazgo llevó al siguiente durante la misma sesión de
pruebas, así que se documentan juntos como una sola capability que evolucionó
incrementalmente.

## What Changes

- **Visibilidad de la requisición:** las tarjetas de requisición en Compras y en
  Residencia ahora muestran el detalle expandible de items (insumo, cantidad,
  especificaciones, notas) — antes solo se veía folio/estado/prioridad. Se agrega
  `Requisicion.solicitante_nombre` (snapshot del JWT) para dejar de mostrar el UUID
  crudo del solicitante.
- **Separación de notas:** se agrega `Requisicion.observaciones_internas` — notas
  exclusivas para Compras que nunca se envían a proveedores, distintas de
  `observaciones` (notas que sí se comparten). El panel de Solicitud de Cotización
  muestra ambas, claramente diferenciadas.
- **Envío real de correo a proveedores:** nuevo módulo `apps/compras/src/mailer.ts`
  (Nodemailer + SMTP real) — al crear/editar una Solicitud de Cotización se envía un
  correo HTML a cada proveedor seleccionado con email registrado, incluyendo folio,
  plazo, todos los items con especificaciones, y las notas para proveedores.
- **Dos plantillas de correo:** tema claro (tarjeta minimalista) y tema oscuro
  (industrial, con callout de "formato PDF obligatorio" y tabla de partidas
  ampliada) — Compras elige el tema al enviar. Ambas con header de doble logo
  (Iretum + logo real de Constructora Bocam, descargado de bocam.com.mx).
- **`Requisicion.direccion_entrega`:** nuevo campo capturado por el Residente al
  crear la requisición, mostrado en el correo de RFQ.
- **Editar proveedores de una solicitud ya enviada:** antes no había forma de
  volver a abrir el selector de proveedores una vez creada la solicitud. Se agrega
  un botón que la reabre, con diff en el backend (agrega/quita sin borrar el
  progreso de los proveedores que se mantienen) y correo solo a los proveedores
  nuevos.
- **Fix de datos:** `SolicitudCotizacionProveedor` nunca tuvo una relación Prisma
  real hacia `Proveedor` — el nombre del proveedor invitado siempre se mostraba como
  `"—"`. Se agrega la relación.

## Capabilities

### New Capabilities
- `solicitud-cotizacion-proveedores`: Todo el ciclo de vida de la Solicitud de
  Cotización — visibilidad de la requisición para Compras, notas
  internas/proveedor, envío de correo real, edición de proveedores invitados.

## Impact

- `apps/compras/prisma/schema.prisma` — `Requisicion.solicitante_nombre`,
  `Requisicion.observaciones_internas`, `Requisicion.direccion_entrega`,
  `SolicitudCotizacionProveedor.proveedor` (relación)
- `apps/compras/src/main.ts` — endpoints de requisiciones y solicitud-cotización
- `apps/compras/src/mailer.ts` — nuevo módulo de envío de correo
- `apps/compras/src/logo-base64.ts`, `logo-bocam-base64.ts` — assets embebidos
- `apps/app-shell/src/views/ComprasView.tsx`, `ResidenciaView.tsx`
- `docker-compose.vps.yml` — variables `SMTP_HOST/PORT/USER/PASS/FROM`
- Migraciones aplicadas en `bocam_compras` (3 columnas nuevas)

## Nota SDD

*Este change se implementó y desplegó fuera del flujo SDD estándar (sin spec previo,
sin tests-first, sin PR) durante una sesión continua de pruebas de campo en vivo,
respondiendo pregunta por pregunta del usuario real. Se documenta retroactivamente
al cierre de la sesión.*

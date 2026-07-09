## Context

El módulo de Compras ya tenía el modelo de datos para `SolicitudCotizacion` /
`SolicitudCotizacionProveedor` (upload manual de PDF de respuesta), pero el flujo
completo — desde que Compras ve la requisición hasta que el proveedor recibe la
invitación — tenía huecos que solo se revelaron probando con usuarios reales el
mismo día del lanzamiento. No existía ninguna infraestructura de correo en el
proyecto (se confirmó por búsqueda exhaustiva: cero referencias a nodemailer/SMTP
en todo el monorepo antes de este change).

## Goals / Non-Goals

**Goals:**
- Compras puede ver toda la información de la requisición (items, especificaciones,
  notas) antes de aprobar o cotizar.
- Los proveedores reciben un correo real y profesional con la información completa.
- Compras puede corregir la lista de proveedores invitados sin perder el progreso
  de los que ya respondieron.

**Non-Goals:**
- No se implementa un portal web para que el proveedor responda en línea — la
  respuesta sigue siendo por correo/PDF subido manualmente por Compras.
- No se generan PDFs adjuntos en el correo saliente (el contenido va inline en el
  HTML) — quedó fuera de alcance por tiempo.
- No se automatiza el reenvío/recordatorio a proveedores que no han respondido
  dentro del plazo — Compras debe decidir manualmente cuándo reenviar.

## Decisions

- **Nodemailer + SMTP real de la empresa (`procuracion@bocam.com.mx`), no un
  servicio transaccional (SendGrid/SES/etc.).** Se ofrecieron ambas opciones al
  usuario; se decidió por el SMTP existente por rapidez (no requiere alta de cuenta
  nueva). Trade-off aceptado: menor entregabilidad/deliverability que un servicio
  transaccional dedicado, y una dependencia en la disponibilidad del hosting de
  correo de Bocam.
- **Logos embebidos como adjuntos CID, no como `<img src="https://...">` remoto.**
  Los clientes de correo (especialmente Outlook) bloquean o no cargan imágenes
  remotas por default; el adjunto CID se renderiza siempre sin depender de que el
  destinatario "permita imágenes".
- **Dos temas de correo en vez de uno solo.** El usuario pidió explícitamente un
  tema oscuro industrial después de ya tener uno claro en producción — en vez de
  reemplazar, se ofrecen ambos con un selector, ya que no había razón de negocio
  para forzar uno solo y el claro ya estaba validado con un envío real.
  `Condiciones_Pago` se excluyó del tema oscuro por decisión explícita del usuario
  ("las impone cada proveedor").
- **`observaciones` (para proveedores) y `observaciones_internas` (solo Compras)
  como columnas separadas, no un solo campo con un flag.** Permite queries simples
  y dejar clarísimo en el código cuál se envía a terceros — reduce el riesgo de
  fuga de información confidencial por error futuro.
- **Editar proveedores hace diff (agrega/quita) en vez de borrar-y-recrear.** El
  comportamiento original (upsert destructivo) hubiera borrado el PDF/estado de
  cualquier proveedor que ya hubiera respondido si Compras solo quería *agregar*
  uno más — un bug de pérdida de datos silenciosa que se detectó antes de que
  ocurriera en producción real (en el momento del fix, todos los proveedores
  invitados seguían en `PENDIENTE`).
- **Solo se envía correo a proveedores nuevos al editar**, no un reenvío a todos —
  evita spamear a quien ya fue invitado cada vez que Compras ajusta el plazo o las
  notas.
- **`proyecto_nombre` se manda desde el frontend en el body del request**, no se
  resuelve con una llamada B2B a Auth. Sigue el mismo patrón ya usado en
  `POST /proveedores/:id/calificaciones` (fallback a `proyecto_id` truncado si no
  se manda) — evita agregar una nueva dependencia cross-servicio para un dato
  puramente cosmético del saludo del correo.

## Risks / Trade-offs

- [Riesgo] SMTP de hosting compartido (`mail.bocam.com.mx`) puede tener límites de
  envío/hora no documentados, o marcar como spam en volumen. → Mitigación: no
  aplicada (fuera de alcance); a vigilar si el volumen de RFQs crece.
- [Riesgo] El logo de Bocam se descargó de `bocam.com.mx` con verificación TLS
  deshabilitada (`curl -k`) porque el certificado del sitio no es válido para ese
  host. → Mitigación: el archivo se embebió una sola vez como base64 en el código
  fuente (`logo-bocam-base64.ts`) — no hay dependencia de red en producción.
- [Riesgo] `direccion_entrega` y notas internas son campos de texto libre sin
  validación — un Residente podría dejarlos vacíos. → Mitigación: ambos son
  opcionales por diseño, se ocultan en el correo si están vacíos.

## Migration Plan

1. Prisma: agregar columnas (`solicitante_nombre`, `observaciones_internas`,
   `direccion_entrega` en `Requisicion`; relación `proveedor` en
   `SolicitudCotizacionProveedor`) — `prisma db push` en `bocam_compras`, sin
   pérdida de datos (todas nullable / la relación no requiere columna nueva).
2. Configurar `SMTP_HOST/PORT/USER/PASS/FROM` reales en `.env` del VPS (secretos,
   no committeados).
3. Deploy de `compras` y `app-shell`.
4. Verificación end-to-end con envíos reales de prueba (confirmados con
   `emails.enviados: 1` en la respuesta del endpoint).

**Rollback:** revertir los commits de este change; las columnas nuevas son
aditivas y nullable, no rompen el código anterior si se revierte el deploy.

## Open Questions

- ¿Se debe agregar un mecanismo de recordatorio automático a proveedores sin
  responder cerca del plazo límite? No resuelto — quedó fuera de alcance.
- ¿Vale la pena migrar a un servicio transaccional de correo si el volumen de RFQs
  crece? No resuelto — decisión pendiente de datos de uso real.

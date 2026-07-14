## Context

`apps/compras` ya expone `GET /api/v1/compras/ordenes-compra` (lista plana de
todas las OCs del proyecto activo, con `proveedor` incluido) y
`GET /api/v1/compras/ordenes-compra/:id` (detalle con items reales, cantidades
y precios ya resueltos desde BD — no reconstruidos en el frontend). Hoy ningún
componente de UI usa el listado agregado; el único endpoint hoy consumido
(`getOrdenesCompra`) solo alimenta KPIs del dashboard (`useDashboardData.ts`).

La descarga de PDF de OC existente (`exportarOcPdf` en `ComprasView.tsx`)
vive dentro de `ComparativaDetail` y reconstruye el payload del PDF en el
cliente a partir del estado de la comparativa (`comp.lineas`, heurística por
`proveedor_nombre`). Ese camino es frágil para reutilizar en un envío
server-side por lote: el backend debe poder generar el mismo PDF sin depender
del estado de React ni de la comparativa que originó la OC.

El envío de correo de Solicitud de Cotización (`apps/compras/src/mailer.ts`)
ya resuelve el patrón de transporte SMTP, plantillas HTML con logos embebidos
(cid) y envío best-effort — se reutiliza la misma infraestructura.

## Goals / Non-Goals

**Goals:**
- Vista nueva en Compras: listado de TODAS las OCs del proyecto activo (no
  anidada dentro de una comparativa), con selección múltiple y acción
  "Enviar por correo".
- Un correo por proveedor, con el o los PDFs de las OCs seleccionadas de ese
  proveedor adjuntos (si Compras selecciona 2 OCs del mismo proveedor, se
  reciben en un solo correo con 2 PDFs adjuntos).
- Registro de envío (fecha + destinatario) persistido y visible en la lista,
  sin bloquear reenvío manual posterior.
- Corregir que `Requisicion.estado` llegue a `COMPRADA` cuando `convertir-oc`
  cubre todos los renglones del lote.

**Non-Goals:**
- No se agrega tracking de apertura/lectura de correo (fuera de alcance).
- No se rediseña el flujo de aprobación de la OC (`BORRADOR → … → EMITIDA`):
  el envío por correo es una acción disponible sobre OCs ya `EMITIDA` (u
  otros estados post-aprobación), no cambia esos estados.
- No se reemplaza `exportarOcPdf` (descarga individual manual) — sigue
  existiendo para uso puntual; el nuevo flujo es aditivo.
- No se construye un motor de plantillas de correo genérico ni un editor
  visual — se sigue el mismo patrón de `mailer.ts` (funciones que devuelven
  HTML), tema único (no claro/oscuro como en RFQ, ver Decisión 4).

## Decisions

**1. El PDF se genera server-side, en `apps/compras`, llamando a
`apps/reportes` backend-to-backend** — igual patrón ya permitido en
CLAUDE.md para datos que no pueden proyectarse. `apps/compras` arma el mismo
payload `{ oc: { numero, proveedor, items, subtotal, iva, total } }` que hoy
arma el frontend, pero a partir de los datos ya resueltos por
`GET /ordenes-compra/:id` (fuente única de verdad, no heurística de
`comp.lineas`). Se llama a `POST /api/v1/reportes/oc-pdf` con
`responseType: 'arraybuffer'` y el buffer resultante se adjunta al correo.
Alternativa descartada: mover la generación de PDF a `apps/compras` — se
descarta porque duplicaría `generateOcPdf` (ya vive en `apps/reportes`,
usado también por otros flujos) y violaría independencia de módulo.

**2. Endpoint único, agrupa por proveedor:**
`POST /api/v1/compras/ordenes-compra/enviar-correo` recibe
`{ ids_orden: string[] }`. El handler agrupa las OCs encontradas por
`proveedor_id`, genera un PDF por OC, y llama una vez a
`enviarOrdenCompraEmail` por proveedor con la lista de PDFs adjuntos.
Alternativa descartada: un correo por OC aunque compartan proveedor — genera
spam innecesario al proveedor y no es lo que pidió el usuario ("selecciona
una o varias para que se envíen").

**3. Envío best-effort por proveedor, respuesta detallada por OC** — mismo
patrón que RFQ: un proveedor sin `email_contacto` o un fallo SMTP no revierte
nada ni bloquea el envío a los demás proveedores del lote. La respuesta
reporta `{ enviadas: [...], fallidas: [...] }` con motivo por proveedor.

**4. Plantilla de correo de OC: una sola versión (sin tema claro/oscuro)** —
a diferencia de RFQ, se simplifica a un único tema (claro, reutilizando
`buildHtmlClaro` como base visual) para reducir alcance; Compras no elige
tema al enviar OC, solo selecciona y confirma. Si se requiere paridad visual
completa con RFQ más adelante, es un cambio aditivo sin romper este.

**5. Nuevos campos en `OrdenCompra`: `enviada_proveedor_at DateTime?` y
`enviada_proveedor_email String?`** (última vez enviada y a qué correo) en
vez de una tabla de historial de envíos — un badge "Enviada el {fecha}" en
la lista cubre la necesidad descrita por el usuario sin modelar historial
completo de reenvíos, que no se pidió.

**6. Fix de `Requisicion.estado = 'COMPRADA'` vive en el mismo handler de
`convertir-oc`** (`main.ts:2277-2465`, capability `multi-oc-generacion`), no
en un listener de evento aparte — la conversión ya corre dentro de una
transacción/flujo síncrono que conoce exactamente qué renglones de la
requisición quedaron cubiertos por el lote generado, evitar un evento
asíncrono separado que tendría que re-derivar esa cobertura.

## Risks / Trade-offs

- **[Riesgo] Llamada backend-to-backend a `apps/reportes` puede fallar o
  ser lenta con muchas OCs seleccionadas** → Mitigación: generar los PDFs en
  paralelo con `Promise.allSettled` (igual patrón que degradación parcial ya
  usado en el chat del asistente); una OC cuyo PDF falla se reporta como
  fallida sin bloquear las demás.
- **[Riesgo] Proveedor con OCs de dos proyectos distintos seleccionadas en
  la misma acción** → Mitigación: el endpoint filtra por `proyecto_id` activo
  igual que el resto de `compras` (vía `createTenantContext`), así que un
  envío nunca mezcla OCs de otro proyecto silenciosamente.
- **[Trade-off] Un solo tema de correo (Decisión 4)** → aceptado
  explícitamente para no inflar el alcance; se puede ampliar después sin
  romper el contrato del endpoint.

## Migration Plan

- Migración Prisma aditiva (2 columnas nullable en `OrdenCompra`) — sin
  downtime, sin backfill necesario (`enviada_proveedor_at` nulo = "nunca
  enviada").
- Sin flag de rollout: es una capability nueva y aislada (no toca código de
  aprobación/generación de OC existente salvo el fix puntual de
  `Requisicion.estado`, que es aditivo — solo agrega un `update` cuando antes
  no había ninguno).
- Deploy: rebuild `apps/compras` (migración + endpoint) y `apps/app-shell`
  (vista nueva), igual patrón manual vía SSH ya usado en esta sesión.

## Open Questions

- ¿La vista de "Órdenes de Compra" nueva reemplaza en el futuro al listado
  que hoy solo alimenta el dashboard, o queda como pantalla independiente
  dentro de `ComprasView`? Para este change se asume pantalla/tab
  independiente dentro de `ComprasView` (no se toca `useDashboardData.ts`).

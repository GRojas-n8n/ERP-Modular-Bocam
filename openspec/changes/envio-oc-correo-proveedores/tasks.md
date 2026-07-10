## 1. Schema

- [x] 1.1 Migración Prisma en `apps/compras/prisma/schema.prisma`: agregar
      `enviada_proveedor_at DateTime?` y `enviada_proveedor_email String?` a
      `OrdenCompra`. Migración aditiva, sin backfill.

## 2. Backend — generación de PDF y correo de OC

- [x] 2.1 Test unitario: dado un `OrdenCompra` con items (desde el shape que
      retorna `GET /ordenes-compra/:id`), la función que arma el payload
      `{ oc: { numero, proveedor, items, subtotal, iva, total } }` produce el
      mismo formato que hoy consume `apps/reportes` `/oc-pdf`.
- [x] 2.2 Crear en `apps/compras/src/mailer.ts` (o módulo hermano
      `mailer-oc.ts`) la función `enviarOrdenCompraEmail(proveedor, ordenes,
      pdfsAdjuntos)` — reutiliza `getTransporter()`/`escapeHtml`/logos cid
      existentes, un solo tema visual (Decisión 4 de `design.md`), asunto
      con código(s) de OC, cuerpo con código/fecha/totales por OC.
- [x] 2.3 Test: `enviarOrdenCompraEmail` con 1 OC adjunta — verifica asunto,
      destinatario, y que el PDF se adjunta correctamente.
- [x] 2.4 Test: `enviarOrdenCompraEmail` con 2 OCs del mismo proveedor —
      verifica un solo correo con 2 adjuntos y ambos códigos en el cuerpo.
- [x] 2.5 Test: SMTP no configurado o rechaza conexión — la función retorna
      `{ enviado: false, error }` sin lanzar excepción (mismo contrato que
      `enviarSolicitudCotizacionEmail`).

## 3. Backend — endpoint de envío

- [x] 3.1 Test de integración: `POST /api/v1/compras/ordenes-compra/enviar-correo`
      con `{ ids_orden: [...] }` de un solo proveedor → 1 llamada a
      `apps/reportes` por OC, 1 correo enviado, `enviada_proveedor_at`
      actualizado en las OCs correspondientes.
- [x] 3.2 Test de integración: `ids_orden` de 2 proveedores distintos → 2
      correos enviados (uno por proveedor), cada uno solo con los adjuntos
      de su propio proveedor.
- [x] 3.3 Test: proveedor sin `email_contacto` en el lote → se reporta como
      fallido en la respuesta, el resto del lote se envía igual (best-effort,
      ver spec `envio-oc-proveedor`).
- [x] 3.4 Test: falla la llamada a `/oc-pdf` para una OC del lote → esa OC se
      reporta fallida, las demás (incluso del mismo proveedor si su PDF sí
      generó) se procesan igual — usar `Promise.allSettled` para las llamadas
      de generación de PDF en paralelo (ver Risks de `design.md`).
- [x] 3.5 Test: `ids_orden` incluye una OC de otro proyecto (no el activo en
      `securityContext`) → esa OC se excluye del envío sin error 500. **Hallazgo
      de seguridad durante este test**: el rol de conexión a BD de producción
      (`bocam_admin`) es superusuario con `BYPASSRLS`, por lo que las políticas
      RLS de TODO el módulo no aplican realmente hoy — se corrigió este
      endpoint con filtro explícito `tenant_id`/`proyecto_id` en el `where` de
      Prisma (no solo RLS). El resto de endpoints de `compras`/`gerencia-tecnica`
      que dependen solo de RLS quedan con el mismo riesgo — requiere spec de
      bug-fix aparte, fuera del alcance de este change.
- [x] 3.6 Implementar `POST /api/v1/compras/ordenes-compra/enviar-correo`
      (`requireRoles('procurement', 'admin')`) en `apps/compras/src/main.ts`:
      agrupar por `proveedor_id`, generar PDFs en paralelo, enviar un correo
      por proveedor, persistir `enviada_proveedor_at`/`enviada_proveedor_email`
      por OC enviada exitosamente, responder `{ enviadas: [...], fallidas: [...] }`.

## 4. Backend — fix Requisicion.estado = COMPRADA

- [x] 4.1 Test: `convertir-oc` genera OCs que cubren el 100% de los renglones
      de la requisición de origen → `Requisicion.estado` queda `COMPRADA`
      (ver spec `multi-oc-generacion` delta). (Implementado como test unitario
      de la función pura `requisicionQuedoCubiertaPorLote` extraída del
      handler — replicar el handler completo en un test de integración
      exigiría mockear Finanzas+GT+RabbitMQ+Postgres; la lógica de cobertura
      en sí es pura y se verifica aislada.)
- [x] 4.2 Test: una OC del lote queda en `ERROR_FINANZAS` → `Requisicion.estado`
      NO se actualiza a `COMPRADA`.
- [x] 4.3 Test: renglón ganador sin `detalle_req_id` → conversión de OC no
      falla, actualización de estado se omite de forma segura para esa
      requisición.
- [x] 4.4 Implementar el cálculo de cobertura y el `update` de
      `Requisicion.estado` dentro del handler de `convertir-oc`
      (`main.ts:2277-2465`).

## 5. Frontend — listado de Órdenes de Compra

- [x] 5.1 Agregar `enviarOrdenesCompraCorreo(idsOrden)` en
      `apps/app-shell/src/lib/api.ts` —
      `POST /api/v1/compras/ordenes-compra/enviar-correo`.
- [x] 5.2 Nueva sección/tab "Órdenes de Compra" dentro de `ComprasView.tsx`
      (o componente nuevo) que consume `comprasApi.getOrdenesCompra` (ya
      existe, hoy solo usado por el dashboard) y renderiza tabla con
      checkbox por fila, código, proveedor, fecha, estado, total, e
      indicador "Enviada el {fecha}" / "No enviada". Agregado como nuevo
      subItem de navegación en `Layout.tsx` (roles compras/procurement/
      superintendent).
- [x] 5.3 Botón "Enviar por correo" habilitado solo con ≥1 fila seleccionada,
      llama a `enviarOrdenesCompraCorreo` y muestra resultado (enviadas vs.
      fallidas) vía el sistema de notificaciones Toast existente.
- [x] 5.4 Reenvío: seleccionar una OC ya marcada como enviada y confirmar de
      nuevo NO está bloqueado por la UI (permitir reenvío manual explícito,
      ver spec).
- [x] 5.5 Test (RTL) del listado: selección múltiple, envío exitoso actualiza
      el indicador "Enviada el {fecha}" sin recargar la página completa.

## 6. Verificación

- [x] 6.1 Ejecutar todos los tests nuevos (backend unitarios + integración,
      frontend RTL) y confirmar que pasan; `tsc --noEmit` limpio en
      `apps/compras` y `apps/app-shell`. 15/15 unit tests + 5/5 integración
      (Postgres aislado en Docker, con RLS aplicado) + 21/21 vitest
      (suite completa de app-shell, sin regresiones) + tsc limpio en ambos.
- [ ] 6.2 Verificación manual en navegador: generar una OC real (o usar una
      existente en staging/demo), enviarla desde el nuevo listado, confirmar
      recepción del correo con PDF adjunto correcto.
      **PENDIENTE** — requiere backend completo (12 microservicios) levantado
      con datos reales y SMTP real; no hay navegador automatizado disponible
      en este entorno. Queda para verificación del usuario en `npm run dev` o
      en el VPS tras el deploy.
- [x] 6.3 Confirmar que la descarga individual existente (`exportarOcPdf`
      dentro de `ComparativaDetail`) sigue funcionando sin cambios
      (no-regresión, ver Non-Goals de `design.md`).

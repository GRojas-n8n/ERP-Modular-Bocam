## 1. Schema compras — Tablas de recepción

- [x] 1.1 Agregar modelo `RecepcionOC` en `apps/compras/prisma/schema.prisma`: `id_recepcion` (UUID PK), `tenant_id`, `proyecto_id`, `orden_id` (FK → OrdenCompra), `fecha_recepcion` (DateTime default now), `recibido_por` (UUID), `notas` (Text nullable), `created_at` (DateTime default now). `@@index([tenant_id, orden_id])`
- [x] 1.2 Agregar modelo `RecepcionOCItem`: `id_recepcion_item` (UUID PK), `tenant_id`, `proyecto_id`, `recepcion_id` (FK → RecepcionOC onDelete Cascade), `orden_item_id` (UUID — referencia externa a OrdenCompraItem), `cantidad_recibida` (Decimal 18,4), `nota_discrepancia` (Text nullable). `@@index([tenant_id, recepcion_id])`
- [x] 1.3 Ejecutar `npx prisma migrate dev --name add_recepcion_oc` en `apps/compras` — BD local no disponible; migración se aplica en VPS (task 10.1)
- [x] 1.4 Regenerar cliente Prisma: `npx prisma generate` en `apps/compras` — generado exitosamente (Prisma v5.22.0)

## 2. Backend compras — Lógica de acumulados y estado

- [x] 2.1 Implementar función auxiliar `calcularEstadoOC(orderId, prisma)` que suma `cantidad_recibida` por `orden_item_id` en todas las `RecepcionOCItem` de la OC y determina si el estado debe ser `PARCIALMENTE_RECIBIDA` o `RECIBIDA` comparando con `OrdenCompraItem.cantidad`

## 3. Backend compras — Endpoint POST recepción

- [x] 3.1 Implementar `POST /api/v1/compras/ordenes-compra/:id/recepciones` — roles: `procurement`, `admin`; validar que la OC existe y tiene estado `EMITIDA` o `PARCIALMENTE_RECIBIDA` (400 si no); validar que `cantidad_recibida` de cada ítem no supera la cantidad pendiente (400 si no); crear `RecepcionOC` + `RecepcionOCItem` dentro de `createTenantContext`; llamar `calcularEstadoOC` y actualizar `OrdenCompra.estado`; si el nuevo estado es `RECIBIDA`, publicar evento `compras.oc_recibida_total` (best-effort); responder 201 con la recepción creada incluyendo sus items

## 4. Backend compras — Endpoint GET recepciones

- [x] 4.1 Implementar `GET /api/v1/compras/ordenes-compra/:id/recepciones` — roles: `procurement`, `admin`, `superintendent`, `gerencia_tecnica`, `finance`; devolver array de recepciones ordenadas por `fecha_recepcion` desc, cada una con sus items

## 5. Backend compras — Ampliar GET orden con acumulados

- [x] 5.1 Implementar `GET /api/v1/compras/ordenes-compra/:id` (nuevo endpoint) que incluye en cada item: `cantidad_acumulada_recibida` y `porcentaje_recibido`. También ampliado `GET /comparativas/:id` para incluir `ordenes_compra` vinculadas via `requisicion_id` con acumulados.

## 6. Backend compras — Evento

- [x] 6.1 Publicar `compras.oc_recibida_total` dentro del handler POST de recepción, envuelto en try/catch silencioso; payload: `{ id_orden, codigo, proveedor_id, total: Number(total), proyecto_id }`

## 7. Frontend — Badges de estado en lista de OC

- [x] 7.1 En `ComparativaDetail.tsx`, agregar `OC_ESTADO_STYLE` con mapeo para `PARCIALMENTE_RECIBIDA` (badge ámbar, texto "En recepción") y `RECIBIDA` (badge verde, texto "Recibida ✓") en cada tarjeta de OC

## 8. Frontend — Panel de recepciones en detalle de OC

- [x] 8.1 `GET /comparativas/:id` ahora incluye `ordenes_compra` con acumulados; `ComparativaDetail` fetcha datos frescos al montar vía `useEffect` (ocFetchedRef) y propaga vía `onUpdate`
- [x] 8.2 En la tarjeta de cada OC, tabla de ítems con columnas `Cant. pedida`, `Recibido` y `%` con color según estado (0% gris, parcial ámbar, 100% verde)

## 9. Frontend — Formulario nueva recepción

- [x] 9.1 Botón "Recibir" (IconPackage) visible en la tarjeta de OC cuando estado es `EMITIDA` o `PARCIALMENTE_RECIBIDA` y rol es `procurement`/`admin`
- [x] 9.2 `SideSheet` de nueva recepción: campo fecha (default hoy), campo notas, tabla de líneas con `cantidad_recibida` editable (default = pendiente) y `nota_discrepancia` por línea
- [x] 9.3 Al submit, `POST /ordenes-compra/:id/recepciones`; en éxito, cierra panel y refresca OC data vía `GET /comparativas/:id` + `onUpdate`

## 10. Deploy y verificación

- [ ] 10.1 Migrar en VPS: `docker exec bocam-vps-compras npx prisma migrate deploy`
- [ ] 10.2 Rebuild imagen compras y restart: `docker compose -f docker-compose.vps.yml up -d --build compras`
- [ ] 10.3 No es necesario rebuild de app-shell si ya está publicado (el frontend se sirve como build estático — verificar si se requiere rebuild del app-shell también)
- [ ] 10.4 Verificar: registrar una recepción parcial desde ComprasView y confirmar que la OC cambia a `PARCIALMENTE_RECIBIDA`
- [ ] 10.5 Verificar: registrar segunda recepción que completa todas las líneas y confirmar que la OC cambia a `RECIBIDA`
- [ ] 10.6 Verificar: el evento `compras.oc_recibida_total` aparece en los logs del contenedor al cerrar la OC

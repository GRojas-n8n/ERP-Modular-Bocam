# Tasks — Flujo Completo de Solicitud de Cotización

## 1. Schema compras — Tablas nuevas

- [ ] 1.1 Agregar modelo `EspecificacionDetalleReq` en `apps/compras/prisma/schema.prisma` (ver design.md D1)
- [ ] 1.2 Agregar modelo `SolicitudCotizacion` en `apps/compras/prisma/schema.prisma` (ver design.md D2, D3)
- [ ] 1.3 Agregar modelo `SolicitudCotizacionProveedor` en `apps/compras/prisma/schema.prisma`
- [ ] 1.4 Agregar modelo `AnotacionEspecificacion` en `apps/compras/prisma/schema.prisma` (ver design.md D6)
- [ ] 1.5 Agregar campo `detalle_req_id String? @db.Uuid` al modelo `ComparativaLinea` (ver design.md D5)
- [ ] 1.6 Ejecutar `npx prisma migrate dev --name add_solicitud_cotizacion_y_specs` en `apps/compras`
- [ ] 1.7 Regenerar cliente Prisma: `npx prisma generate` en `apps/compras`

## 2. Configuración multer para PDFs de cotización

- [ ] 2.1 Agregar `COTIZACIONES_UPLOAD_DIR` a `apps/compras/src/main.ts` (default `/tmp/cotizaciones`)
- [ ] 2.2 Configurar instancia `multerCotizaciones` en `main.ts`: `dest: COTIZACIONES_UPLOAD_DIR/_tmp`, `limits.fileSize: 20MB`, `fileFilter` para `.pdf .jpg .jpeg .png`
- [ ] 2.3 Agregar volume `vps_cotizaciones_uploads:/data/compras/cotizaciones` al servicio `compras` en `docker-compose.vps.yml`
- [ ] 2.4 Declarar `vps_cotizaciones_uploads:` en la sección `volumes:` global de `docker-compose.vps.yml`
- [ ] 2.5 Agregar `COTIZACIONES_UPLOAD_DIR: /data/compras/cotizaciones` en bloque `environment:` de `compras` en `docker-compose.vps.yml`

## 3. Backend compras — Especificaciones de req

- [ ] 3.1 Implementar `PUT /api/v1/compras/requisiciones/:reqId/detalles/:detalleId/especificaciones` — roles: `resident`, `admin`; valida que la req esté en estado BORRADOR o PENDIENTE; reemplaza todas las specs del detalle con el array recibido (`[{ descripcion, orden }]`); devuelve las specs actualizadas
- [ ] 3.2 Extender `GET /api/v1/compras/requisiciones/:reqId` para incluir `especificaciones: []` en cada item de `detalles` — leftJoin con `EspecificacionDetalleReq` ordenado por `orden`

## 4. Backend compras — Solicitud de Cotización

- [ ] 4.1 Implementar `POST /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion` — roles: `procurement`, `admin`; body: `{ proveedores_ids: string[], dias_habiles: 3|5, notas?: string }`; calcula `fecha_limite` sumando días hábiles (L-V) a `fecha_solicitud`; upsert en `SolicitudCotizacion` + crea un `SolicitudCotizacionProveedor` PENDIENTE por cada proveedor; devuelve 201 con la solicitud completa
- [ ] 4.2 Implementar `GET /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion` — roles: `procurement`, `admin`, `superintendent`; devuelve solicitud con sus proveedores y estado de cada uno; calcula `dias_habiles_restantes` y `alerta_plazo` (bool)
- [ ] 4.3 Implementar `PUT /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId` — roles: `procurement`, `admin`; acepta multipart/form-data; campos: `estado` (RESPONDIO|DECLINO), `notas_proveedor?`; si hay archivo: `fs.renameSync` a ruta final `<UPLOAD_DIR>/<tenantId>/<solicitudId>/<scpId><ext>`; actualiza registro; si `estado=RESPONDIO` establece `fecha_respuesta`
- [ ] 4.4 Implementar `GET /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId/pdf` — roles: `procurement`, `admin`, `superintendent`, `resident`; `res.download()` con `pdf_nombre`
- [ ] 4.5 Implementar `GET /api/v1/compras/alertas/cotizacion-pendiente` — roles: `procurement`, `admin`, `superintendent`; devuelve requisiciones con `SolicitudCotizacion.fecha_limite < NOW()` y al menos 1 `SolicitudCotizacionProveedor.estado = PENDIENTE`; incluye nombre req, código, días de retraso, proveedores pendientes

## 5. Backend compras — ComparativaLinea desde req

- [ ] 5.1 Modificar `POST /api/v1/compras/comparativas` para aceptar `requisicion_id?: string` opcional en el body; si se provee: leer detalles + especificaciones de la req y crear `ComparativaLinea` por cada detalle (con `detalle_req_id` + `especificaciones_requeridas` = specs concatenadas con `\n`)
- [ ] 5.2 Extender `GET /api/v1/compras/comparativas/:id` para incluir en cada linea: `detalle_req_id`, `especificaciones: [{ id_especificacion, descripcion, orden }]` (desde `EspecificacionDetalleReq` si `detalle_req_id` existe)

## 6. Backend compras — Anotaciones por especificación

- [ ] 6.1 Implementar `POST /api/v1/compras/comparativas/:id/anotaciones-spec` — roles: `resident`, `procurement`, `admin`; body: `{ especificacion_id, proveedor_id, tipo: 'pregunta'|'respuesta', texto }`; crea `AnotacionEspecificacion`
- [ ] 6.2 Extender `GET /api/v1/compras/comparativas/:id` para incluir `anotaciones_spec: []` en el payload de respuesta

## 7. Frontend ResidenciaView — Especificaciones en req

- [ ] 7.1 En el componente de creación/edición de requisición en `ResidenciaView`, agregar sección "Especificaciones" por cada partida (debajo del campo de unidad/cantidad)
- [ ] 7.2 Implementar UI de chips/tags: input de texto + botón "Agregar" → crea chip con la especificación; los chips tienen botón ×; el orden es editable (drag o flechas arriba/abajo)
- [ ] 7.3 Al guardar la req (o en modo auto-save por partida), llamar `PUT /compras/requisiciones/:reqId/detalles/:detalleId/especificaciones` con el array actual
- [ ] 7.4 Al cargar una req existente, mostrar las specs guardadas como chips (estado inicial desde `GET /compras/requisiciones/:reqId`)

## 8. Frontend ComprasView — Panel de Solicitud de Cotización

- [ ] 8.1 En el panel de detalle de una req PENDIENTE en `ComprasView`, agregar botón "Enviar Solicitud de Cotización" (accentColor `blue`) visible solo para roles `procurement`/`admin`
- [ ] 8.2 Al hacer click, abrir `SlidePanel` con: selector multi-proveedor desde catálogo, selector de plazo (3 días / 5 días hábiles), campo notas opcional, botón confirmar
- [ ] 8.3 Al confirmar, llamar `POST /compras/requisiciones/:reqId/solicitud-cotizacion`; al éxito mostrar el panel de estado de la solicitud
- [ ] 8.4 Renderizar el panel de estado de solicitud: tabla con columna Proveedor, Estado (chip PENDIENTE/RESPONDIO/DECLINO), Fecha respuesta, acciones
- [ ] 8.5 Por proveedor PENDIENTE: botón "Subir cotización" (input file oculto → multipart PUT) y botón "Marcar como Declinó"
- [ ] 8.6 Mostrar `fecha_limite` y días restantes; si `alerta_plazo = true` mostrar banner naranja "⚠ Plazo vencido — N proveedores pendientes"
- [ ] 8.7 Cuando al menos 1 proveedor tiene estado RESPONDIO: habilitar botón "Crear Cuadro Comparativo" que llama `POST /compras/comparativas` con `requisicion_id`

## 9. Frontend ComprasView — Alerta en listado de requisiciones

- [ ] 9.1 En la lista de requisiciones de `ComprasView`, agregar indicador visual (badge naranja `⚠`) en las filas con `alerta_plazo = true` (dato viene del GET de la solicitud o del endpoint de alertas)
- [ ] 9.2 Agregar tab o sección "Alertas de Cotización" que consume `GET /compras/alertas/cotizacion-pendiente` y muestra tabla con req, proveedor, días de retraso

## 10. Frontend ComparativaDetail — Specs como sub-filas

- [ ] 10.1 Modificar la interfaz `ComparativaLocal` en `ComparativaDetail.tsx` para incluir en `lineas_detalle`: `especificaciones?: { id_especificacion: string; descripcion: string; orden: number }[]` y `anotaciones_spec?: AnotacionSpec[]`
- [ ] 10.2 En la tabla comparativa, bajo el encabezado de cada partida (antes del precio), renderizar las especificaciones como sub-filas de solo lectura con fondo ligeramente diferenciado
- [ ] 10.3 En cada sub-fila de spec, por cada columna de proveedor, renderizar el ícono de anotación si existe una para esa [spec × proveedor] (ícono `?` si es pregunta sin respuesta, ícono `✓` si tiene respuesta)
- [ ] 10.4 Al hacer click en una celda [spec × proveedor], abrir un popover/mini-panel con: la pregunta existente (si hay), campo para nueva pregunta (Residente) o campo para respuesta (Compras), botón guardar → llama `POST /compras/comparativas/:id/anotaciones-spec`

## 11. Integración y verificación en VPS

- [ ] 11.1 `docker exec bocam-vps-compras npx prisma migrate deploy` — aplica la migración de 4 tablas nuevas + campo `detalle_req_id`
- [ ] 11.2 Build y restart de `compras` en VPS: `docker compose build --no-cache compras && docker compose up -d --no-deps compras`
- [ ] 11.3 Build y restart de `app-shell` en VPS
- [ ] 11.4 Verificar: `residente@bocam.com` puede agregar specs a una req y se guardan
- [ ] 11.5 Verificar: `compras@bocam.com` puede crear solicitud de cotización para una req
- [ ] 11.6 Verificar: subir PDF de proveedor cambia estado a RESPONDIO
- [ ] 11.7 Verificar: crear cuadro comparativo desde req auto-popula partidas con specs
- [ ] 11.8 Verificar: el Residente puede colocar anotación en celda [spec × proveedor]
- [ ] 11.9 Verificar: req con fecha_limite vencida aparece en alerta

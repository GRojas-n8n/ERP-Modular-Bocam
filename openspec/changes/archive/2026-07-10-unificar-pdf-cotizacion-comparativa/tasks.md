## 1. Schema (apps/compras)

- [x] 1.1 Agregar modelo `ComparativaProveedorArchivo` (tabla nueva e independiente de
      `ComparativaDetalle`, ver design.md decisión #3) a `apps/compras/prisma/schema.prisma`,
      con relación a `CuadroComparativo` y `@@unique([cuadro_id, proveedor_id])`
- [x] 1.2 Generar y aplicar la migración de Prisma (aditiva, tabla nueva, sin backfill)
- [x] 1.3 Regenerar el cliente de Prisma (`npx prisma generate`) para `apps/compras`

## 2. Frontend — prepoblado de proveedores en el cuadro comparativo

- [x] 2.1 Test: al crear un cuadro nuevo para una requisición con `SolicitudCotizacion`
      enviada a N proveedores, `openComparativa` siembra `newComp.proveedores` con esos N
      proveedores (tope 3)
- [x] 2.2 Test: al crear un cuadro nuevo para una requisición sin `SolicitudCotizacion`,
      `newComp.proveedores` queda vacío (comportamiento actual, sin regresión)
- [x] 2.3 Implementar en `openComparativa` (`apps/app-shell/src/views/ComprasView.tsx`,
      rama de creación de cuadro nuevo) un `GET /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion`
      y sembrar `proveedores` desde la respuesta antes de hacer `setComparativas`
- [x] 2.4 Verificar que los tests 2.1 y 2.2 pasan

## 3. Backend — persistencia del PDF al aplicar cotización

- [x] 3.1 Test: subir un PDF y aplicar la cotización crea una fila en
      `ComparativaProveedorArchivo` con `pdf_nombre`/`pdf_ruta`/`pdf_mime` para
      `(cuadro_id, proveedor_id)`
- [x] 3.2 Test: subir un PDF, revisar renglones, pero NO aplicar la cotización — no persiste
      ningún archivo en disco ni en base de datos
- [x] 3.3 Test: reemplazar un PDF ya aplicado (segunda subida para el mismo proveedor) hace
      `upsert` — elimina el archivo anterior en disco y actualiza la fila existente en vez de
      duplicarla
- [x] 3.4 Test: guardar cotizaciones (`PUT .../cotizaciones`, reemplazo completo de
      `ComparativaDetalle`) para el mismo cuadro NO borra la fila de
      `ComparativaProveedorArchivo` ya persistida (regresión clave que motivó la tabla
      separada)
- [x] 3.5 Implementar endpoint `PUT /api/v1/compras/comparativas/:compId/proveedores/:provId/cotizacion-pdf`
      (multer + `fs.renameSync`, mismo patrón que el endpoint que se recorta en la sección 4;
      `upsert` por `(cuadro_id, proveedor_id)`), protegido con
      `requireRoles('procurement', 'admin')`
- [x] 3.6 Extender `GET /api/v1/compras/comparativas/:id` para incluir
      `comparativaProveedorArchivo.findMany({ where: { cuadro_id: id } })` en la respuesta
- [x] 3.7 Verificar que los tests 3.1-3.4 pasan

## 4. Backend — retiro del upload en Solicitud de Cotización

- [x] 4.1 Test: `PUT /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId`
      con `estado` y `notas_proveedor` sigue funcionando sin campo `archivo`
- [x] 4.2 Test: el mismo endpoint, si recibe un archivo en el campo `archivo`, lo ignora sin
      error (no hay middleware de carga en la ruta)
- [x] 4.3 Retirar `cotizacionesMulter.single('archivo')` y el bloque de manejo de `req.file`
      (líneas ~837-846 y limpieza en catch ~867) del handler en `apps/compras/src/main.ts`,
      conservando `estado`/`notas_proveedor`
- [x] 4.4 Verificar que los tests 4.1-4.2 pasan y que no hay regresión en tests existentes de
      `solicitud-cotizacion-policy.test.ts`

## 5. Frontend — ComparativaDetail.tsx

- [x] 5.1 Actualizar `handleAplicarCotizacion` para enviar el PDF original al nuevo endpoint
      `.../cotizacion-pdf` en el mismo flujo de aplicar (antes o justo después de aplicar los
      precios), manejando el estado de carga/error de esa llamada adicional
- [x] 5.2 Extender el manejo de error 503 de `handlePdfFileChange` (línea ~727-729) para
      permitir captura manual de precios y aplicar igualmente el PDF como respaldo cuando el
      servicio de IA no responde
- [x] 5.3 Mostrar en la UI (columna o ícono por proveedor) si ya existe un PDF aplicado y
      recuperable, con opción de verlo/descargarlo

## 6. Frontend — ComprasView.tsx

- [x] 6.1 Eliminar el botón "Subir PDF" / "Re-subir PDF" (líneas ~2499-2520), el input de
      archivo asociado y la ref `scpFileRef`
- [x] 6.2 Eliminar el handler `handleUploadScpPdf` (líneas ~880-893) y cualquier llamada al
      endpoint recortado en la sección 4 (se agregó `handleMarcarRespondio` con JSON plano,
      ya que la marca "Respondió" antes iba empaquetada con la subida de PDF)
- [x] 6.3 Verificar que el panel "Solicitud de Cotización" sigue permitiendo marcar
      `estado`/`notas_proveedor` sin el control de archivo

## 7. Verificación end-to-end

- [x] 7.1 Flujo completo verificado vía tests de integración (3.1-3.4): crear cuadro →
      proveedor prepoblado (test 2.1/2.3) → subir PDF → aplicar cotización → PDF persistido y
      visible (`archivos_proveedor` en `GET /comparativas/:id`) → sobrevive a un guardado
      posterior de cotizaciones (test 3.4). No se realizó verificación manual en navegador —
      requeriría levantar app-shell + servicios dependientes.
- [x] 7.2 Confirmado por lectura de código: el panel de Solicitud de Cotización
      (`ComprasView.tsx`) ya no tiene input de archivo ni botones de subida — solo
      "Respondió"/"Declinó" y el link de solo lectura al PDF histórico si existe.
- [x] 7.3 Suite completa ejecutada: `apps/compras` (7 archivos de integración + policy test,
      todos verdes) y `apps/app-shell` (`vitest run`, 9/9 tests verdes, `tsc --noEmit` sin
      errores en ambos paquetes).

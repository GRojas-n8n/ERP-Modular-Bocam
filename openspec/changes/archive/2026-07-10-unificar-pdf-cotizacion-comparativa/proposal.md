## Why

Hoy existen dos pantallas donde Compras puede subir el PDF de cotización de un proveedor
("Solicitud de Cotización" y "Continuar Comparativa"), con comportamiento distinto y sin
vínculo entre ellas: la primera solo archiva el PDF, la segunda lo procesa con IA pero lo
descarta sin guardarlo. Además, el cuadro comparativo obliga a Compras a re-agregar a mano
proveedores que ya fueron invitados en la Solicitud de Cotización de la misma requisición,
porque `CuadroComparativo` no se prepobla desde `SolicitudCotizacion`. Esto genera confusión
sobre dónde subir cada PDF y trabajo duplicado. Se unifica el flujo: un solo lugar para subir
el PDF (el cuadro comparativo, donde ya vive la extracción por IA) y auto-poblado de
proveedores desde la solicitud ya enviada.

## What Changes

- Al crear el cuadro comparativo (`openComparativa` en `ComprasView.tsx`), el frontend
  prepobla localmente la lista de proveedores con los ya invitados en la `SolicitudCotizacion`
  de esa requisición (consultando el mismo endpoint que ya usa el panel de Solicitud de
  Cotización), en vez de arrancar con la lista vacía. Sin cambios de schema ni backend para
  esta parte.
- **BREAKING**: se elimina el botón "Subir PDF" / "Re-subir PDF" del panel "Solicitud de
  Cotización" en `ComprasView.tsx`, junto con su handler (`handleUploadScpPdf`) y el input
  de archivo asociado. Compras deja de poder subir un PDF de cotización desde esa pantalla.
- El endpoint `PUT /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId`
  deja de aceptar el archivo del PDF (se retira esa responsabilidad); conserva `estado` y
  `notas_proveedor`, que sí siguen siendo su responsabilidad.
- El PDF subido en "Continuar Comparativa" (extracción por IA) ahora se persiste: al aplicar
  la cotización extraída (`handleAplicarCotizacion`), el sistema guarda el archivo original en
  una tabla nueva y dedicada (`ComparativaProveedorArchivo`, una fila por proveedor dentro del
  cuadro) — no en `ComparativaDetalle`, porque esa tabla se borra y recrea por completo cada
  vez que Compras guarda precios, y perdería el archivo. Antes de aplicar (mientras el usuario
  solo está revisando renglones extraídos), el PDF no se persiste.

## Capabilities

### New Capabilities
(ninguna — este cambio modifica capacidades existentes, no introduce una nueva)

### Modified Capabilities
- `solicitud-cotizacion-proveedores`: se retira la responsabilidad de subir/conservar el PDF
  de cotización desde esta pantalla; el requirement "Compras SHALL poder modificar los
  proveedores invitados... sin perder el estado ni el PDF" se actualiza porque el PDF ya no
  vive en `SolicitudCotizacionProveedor` gestionado desde este panel.
- `cotizacion-compras-ux`: el Paso 2 ("Iniciar / continuar la comparativa") cambia de
  "Agrega proveedores (nombre, contacto)" manual a auto-poblado desde la Solicitud de
  Cotización ya enviada, con opción de agregar proveedores adicionales del catálogo si se
  necesita cotizar con alguien no invitado originalmente.

## Impact

- **Backend** (`apps/compras`): `src/main.ts` — handler
  `PUT .../solicitud-cotizacion/proveedores/:scpId` (retiro de upload de archivo), nuevo
  endpoint `PUT /comparativas/:compId/proveedores/:provId/cotizacion-pdf`, extensión de
  `GET /comparativas/:id` para incluir los archivos asociados. `prisma/schema.prisma` — nuevo
  modelo `ComparativaProveedorArchivo`; migración aditiva (tabla nueva, sin tocar tablas
  existentes).
- **Frontend** (`apps/app-shell`): `src/views/ComprasView.tsx` (retiro de botón/handler de
  subida de PDF en el panel de Solicitud de Cotización; prepoblado local de proveedores desde
  la Solicitud de Cotización al crear el comparativo), `src/components/ComparativaDetail.tsx`
  (envío del PDF al aplicar cotización, no solo al extraer; mostrar PDF ya aplicado por
  proveedor).
- **Sin cambios** en `apps/asistente` (la extracción por IA vía `leer-cotizacion.ts` no
  cambia de contrato, solo cambia qué hace el frontend con el archivo después).
- Datos existentes: los PDFs ya archivados en `SolicitudCotizacionProveedor.pdf_ruta` de
  solicitudes pasadas no se migran automáticamente; quedan como registro histórico de solo
  lectura si el campo se conserva en el schema.

## Context

Confirmado en código (`apps/compras/src/main.ts:806-872`): el endpoint
`PUT /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion/proveedores/:scpId` hace dos
cosas a la vez — (a) actualiza `estado` (`RESPONDIO`/`DECLINO`/`PENDIENTE`) y
`notas_proveedor`, y (b) opcionalmente recibe un archivo (`cotizacionesMulter.single('archivo')`)
que guarda como `pdf_nombre`/`pdf_ruta`/`pdf_mime` en `SolicitudCotizacionProveedor`. Solo (b)
se retira; (a) es necesario para que Compras marque manualmente si un proveedor respondió o
declinó, y no tiene relación con el cuadro comparativo.

El cuadro comparativo (`POST /api/v1/compras/comparativas`, `main.ts:2575-2650`) hoy crea
`ComparativaDetalle` solo a partir de los items de la requisición, con `proveedores: []`. No
consulta `SolicitudCotizacion`. `ComparativaDetalle` (schema línea ~345-379) no tiene columnas
de archivo hoy — solo `precio_ofertado`.

## Goals / Non-Goals

**Goals:**
- Un único lugar (cuadro comparativo) para subir el PDF de cotización de un proveedor.
- El cuadro comparativo arranca con los proveedores ya invitados en la Solicitud de
  Cotización de esa requisición, sin captura manual redundante.
- El PDF aplicado a una cotización queda persistido y trazable (auditoría).

**Non-Goals:**
- No se migra automáticamente el histórico de PDFs ya archivados en
  `SolicitudCotizacionProveedor.pdf_ruta` de solicitudes anteriores a este cambio.
- No se toca el endpoint de extracción por IA (`apps/asistente/src/routes/leer-cotizacion.ts`);
  su contrato de entrada/salida no cambia.
- No se retira la capacidad de Compras de marcar `estado`/`notas_proveedor` de un proveedor
  invitado — solo se retira la parte de archivo de ese mismo endpoint.
- No se agrega comunicación nueva entre microservicios; el flujo `app-shell → asistente` ya
  existe.

## Decisions

### 1. Prepoblado de proveedores: solo en el cliente, sin tocar `ComparativaDetalle`
**Corregido tras revisar el código real** (ver nota al final de esta sección). En
`ComparativaDetail`/`ComprasView`, la lista `proveedores` que ve Compras SIEMPRE se deriva
de `ComparativaDetalle` (`normalizeComp` en `ComprasView.tsx:418-458`, vía `Map` de
`proveedor_id → razon_social` sacado de `detalles`) — nunca se lee de una tabla de
"proveedores del cuadro" separada. Y `ComparativaDetalle.precio_ofertado` es
`Decimal` **no nullable** — no se puede crear una fila de "proveedor sin precio todavía".
Además, `PUT /api/v1/compras/comparativas/:id/cotizaciones` (`main.ts:2663-2742`) hace un
reemplazo completo: `deleteMany` de todos los `ComparativaDetalle` del cuadro y los recrea
desde cero a partir de TODO el payload `proveedores` que manda el cliente en ese momento —
solo se ejecuta cuando Compras guarda/envía a evaluación, no en cada edición. Por eso, agregar
proveedores manualmente hoy (`handleAddProveedorFromCatalog`, `ComparativaDetail.tsx:682`) es
puramente estado local de React (`onUpdate` → `setComparativas`) hasta que se guarda: si el
usuario recarga la página antes de capturar un precio, ese proveedor agregado a mano
desaparece. Es un comportamiento ya aceptado en el producto, no una regresión.

Dado esto, el prepoblado se implementa **solo en el frontend**, replicando ese mismo patrón:
- En `openComparativa` (`ComprasView.tsx:718-753`), al crear un cuadro nuevo (rama `else`,
  hoy `proveedores: []`), se hace `GET /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion`
  (mismo endpoint que ya usa `loadSolicitud`) y se siembra `newComp.proveedores` con los
  proveedores invitados (`{ id: proveedor_id, nombre: proveedor_nombre }`), tope de 3 (mismo
  límite que ya aplica `handleAddProveedorFromCatalog`).
- Si la requisición no tiene Solicitud de Cotización todavía, `proveedores` queda vacío, igual
  que hoy.
- **No se toca schema ni ningún endpoint backend para esta parte** — cero riesgo de romper el
  flujo de reemplazo completo de `ComparativaDetalle`.
- Compras conserva la capacidad de agregar proveedores adicionales del catálogo general para
  casos no cubiertos por la invitación original.

> Nota: la versión anterior de esta decisión proponía prepoblar vía backend creando
> `ComparativaDetalle` con `precio_ofertado: null` desde el handler `POST /comparativas`. Se
> descubrió al leer `main.ts` y `ComprasView.tsx` con detalle que esa columna no es nullable y
> que la lista de proveedores no se persiste de forma independiente — se descartó esa ruta.

### 2. Endpoint de Solicitud de Cotización: se retira solo el upload, se conserva el resto
En `PUT .../solicitud-cotizacion/proveedores/:scpId` se elimina el middleware
`cotizacionesMulter.single('archivo')` y el bloque `if (req.file) {...}` (líneas 837-846); se
elimina también el manejo de limpieza de archivo temporal en catch (línea 867). El endpoint
sigue aceptando `estado` y `notas_proveedor` en el body, sin `archivo`. Las columnas
`pdf_nombre`/`pdf_ruta`/`pdf_mime` de `SolicitudCotizacionProveedor` se conservan en el schema
(no se borran) para no perder el histórico ya archivado, pero deja de haber forma de escribir
en ellas desde este endpoint hacia adelante.

### 3. Persistencia del PDF en el comparativo: tabla nueva, NO columnas en `ComparativaDetalle`
**Corregido tras revisar el código real.** Guardar `pdf_ruta`/`pdf_nombre`/`pdf_mime` como
columnas de `ComparativaDetalle` es inseguro dado el reemplazo completo de la decisión #1: la
primera vez que Compras vuelva a guardar cotizaciones de OTRO insumo/proveedor (cualquier
`PUT .../cotizaciones`), el `deleteMany` borraría también las filas con el PDF ya aplicado, y
el recreate solo repone lo que el cliente mande en ese payload — perdiendo el archivo si el
cliente no lo reenvía en cada guardado posterior.

En su lugar se crea un modelo nuevo, independiente de `ComparativaDetalle` y por tanto inmune
a su ciclo de borrado/recreación:

```prisma
model ComparativaProveedorArchivo {
  id_archivo   String   @id @default(uuid()) @db.Uuid
  tenant_id    String   @db.Uuid
  proyecto_id  String   @db.Uuid
  cuadro_id    String   @db.Uuid
  proveedor_id String   @db.Uuid
  pdf_nombre   String   @db.VarChar(255)
  pdf_ruta     String   @db.Text
  pdf_mime     String   @db.VarChar(100)
  updated_at   DateTime @updatedAt

  cuadro CuadroComparativo @relation(fields: [cuadro_id], references: [id_cuadro], onDelete: Cascade)

  @@unique([cuadro_id, proveedor_id])
  @@index([tenant_id, cuadro_id])
  @@map("comparativas_proveedores_archivos")
}
```

Guardado vía nuevo endpoint backend
`PUT /api/v1/compras/comparativas/:compId/proveedores/:provId/cotizacion-pdf` (multipart,
mismo patrón de `multer` + `fs.renameSync` que el endpoint que se está recortando), invocado
por el frontend en `handleAplicarCotizacion` — el archivo se envía al backend recién cuando el
usuario confirma "Aplicar cotización" sobre los renglones ya revisados, no en el momento de
`handlePdfFileChange` (que solo llama a `asistenteApi.leerCotizacionPDF` para la extracción,
sin persistir nada). Un `upsert` por `(cuadro_id, proveedor_id)` reemplaza el archivo si ya
había uno para ese proveedor en ese cuadro.

`GET /api/v1/compras/comparativas/:id` (`main.ts:2097-2234`) se extiende para incluir estos
archivos (`comparativaProveedorArchivo.findMany({ where: { cuadro_id: id } })`) en la
respuesta, y el frontend los asocia a cada proveedor por `proveedor_id` para mostrar el ícono
de "PDF disponible".

- **Alternativa descartada**: columnas en `ComparativaDetalle` (ver arriba — inseguro por el
  reemplazo completo).
- **Alternativa descartada**: persistir el PDF automáticamente en el momento de la
  extracción (antes de que el usuario revise/edite). Se descarta porque generaría archivos
  huérfanos en disco por cada intento de extracción que el usuario descarte sin aplicar.
- **Alternativa descartada**: guardar el PDF en `SolicitudCotizacionProveedor` en vez de una
  tabla propia del comparativo. Se descarta porque rompería la decisión #1 (el comparativo no
  siempre tiene una `SolicitudCotizacionProveedor` correspondiente) y mezclaría de nuevo las
  dos entidades que se está buscando desacoplar de la UI.

### 4. Migración de datos
Migración de schema (Prisma) puramente aditiva: una tabla nueva (`ComparativaProveedorArchivo`),
sin tocar ninguna tabla existente. No requiere backfill — comparativos existentes simplemente
no tienen filas ahí hasta que alguien suba/aplique un PDF desde el flujo nuevo.

## Risks / Trade-offs

- **[Riesgo]** Compras pierde la posibilidad de subir un PDF "de respaldo" sin pasar por la
  extracción de IA (p. ej. si el servicio `asistente` está caído, hoy no podría archivar el
  PDF en la Solicitud de Cotización como plan B).
  → **Mitigación**: el mensaje de error ya existente en `handlePdfFileChange`
    (`ComparativaDetail.tsx:727-729`, status 503 "El servicio de IA no está disponible")
    debe extenderse para permitir subir y aplicar el PDF sin extracción automática cuando la
    IA no responde (renglones vacíos, el usuario captura precios a mano y el PDF se persiste
    igual al aplicar).
- **[Riesgo]** Un comparativo creado antes de este cambio, cuyos proveedores ya fueron
  agregados manualmente sin relación a una Solicitud de Cotización, no se ve afectado — pero
  si Compras reabre esa Solicitud de Cotización en la pantalla vieja, ya no podrá subir ahí un
  PDF adicional para un proveedor que respondió tarde.
  → **Mitigación**: documentar en release notes que, desde este cambio, todo PDF de
    cotización (nuevo o de respaldo) se sube exclusivamente desde el cuadro comparativo.
- **[Riesgo]** Cambio de contrato en el endpoint `PUT .../solicitud-cotizacion/proveedores/:scpId`
  (deja de aceptar `archivo`) es **BREAKING** para cualquier cliente que dependa de ese campo.
  → **Mitigación**: es un endpoint interno de `app-shell`, no hay clientes externos; se
    actualiza el frontend en el mismo cambio.

## Open Questions
Ninguna — decisiones de producto ya confirmadas con el usuario (alcance combinado,
eliminación completa del botón viejo, persistencia del PDF nuevo).

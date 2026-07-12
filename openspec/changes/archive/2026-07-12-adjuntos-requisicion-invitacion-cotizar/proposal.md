## Why

Bocam pidió que el Residente pueda adjuntar fichas técnicas al crear una
requisición, y que esos documentos lleguen automáticamente en el correo
de invitación a cotizar que Compras envía a los proveedores. Investigado
el sistema existente: **ya hay un sistema de fichas técnicas por insumo**
(`FichaTecnicaInsumo` en `apps/gerencia-tecnica`, con endpoints de
upload/lectura/descarga/borrado, usado hoy desde el sidesheet de
`ComparativaDetail.tsx` en modo Compras). El gap real no es construir un
sistema nuevo — es que **el rol Residente nunca tuvo permiso para usarlo**:
`ROLES_FICHAS_UPLOAD = ['procurement', 'gerencia_tecnica', 'admin']` y
`ROLES_FICHAS_LECTURA` (que sí incluye `'resident'` pero no `'residencia'`,
el string real que usa el rol — mismo patrón de bug que
`fix-acceso-residente-evaluacion-tecnica`, verificado contra
`AdminView.tsx`) — el Residente nunca pudo subir ni ver fichas, en ningún
punto del sistema, y el formulario de creación de requisición nunca tuvo
un input de archivo.

Y el correo de invitación a cotizar (`enviarSolicitudCotizacionEmail`)
hoy solo adjunta los logos inline — nunca adjunta ningún documento del
lado del comprador.

## What Changes

- `apps/gerencia-tecnica`: `ROLES_FICHAS_UPLOAD` y `ROLES_FICHAS_LECTURA`
  ganan `'residencia'` (además de `'resident'`, que se conserva) — el
  Residente puede subir y ver fichas técnicas por insumo, mismos
  endpoints ya existentes (`POST/GET/DELETE
  /api/v1/gerencia-tecnica/insumos/:id/fichas`), sin cambios de schema ni
  de lógica.
- `apps/app-shell` (`ResidenciaView.tsx`, flujo "Requisición Normal"): cada
  insumo seleccionado en el carrito gana un input de archivo opcional
  (ficha técnica). Los archivos se suben al insumo correspondiente
  (endpoint de GT ya existente) justo después de crear la requisición,
  best-effort, mismo patrón que ya usa el guardado de especificaciones
  técnicas por ítem.
- `apps/compras`: `enviarCorreosSolicitudCotizacion` consulta (B2B, best
  effort) las fichas técnicas de cada insumo de la requisición en GT y las
  adjunta al correo de invitación de cada proveedor —
  `enviarSolicitudCotizacionEmail` gana un parámetro de adjuntos
  adicionales.

## Capabilities

### New Capabilities
- `fichas-tecnicas-acceso-residente`: el rol Residente puede subir y
  consultar fichas técnicas por insumo (mismos endpoints de GT ya
  existentes, hoy restringidos a Compras/GT/Admin).

### Modified Capabilities
- `solicitud-cotizacion-proveedores`: el correo de invitación a cotizar
  gana adjuntos con las fichas técnicas de los insumos de la requisición.

## Impact

- **Backend GT (`apps/gerencia-tecnica`)**: `src/main.ts`
  (`ROLES_FICHAS_UPLOAD`, `ROLES_FICHAS_LECTURA` ~línea 894-895). Sin
  cambios de schema.
- **Backend Compras (`apps/compras`)**: `src/main.ts`
  (`enviarCorreosSolicitudCotizacion` ~línea 99), `src/mailer.ts`
  (`enviarSolicitudCotizacionEmail` ~línea 421, nuevo parámetro de
  adjuntos).
- **Frontend (`apps/app-shell`)**: `ResidenciaView.tsx` (flujo "Requisición
  Normal" de creación — input de archivo por insumo + upload post-creación).
- **Fuera de alcance explícito**: los flujos "Desde APU" e "Imprevisto" de
  creación de requisición no ganan input de ficha técnica en este change
  (Desde APU usa materiales de una composición ya catalogada; Imprevisto
  no tiene `insumo_id` de catálogo al que atar la ficha — ver Non-Goals en
  design.md).
- Sin cambios de schema en ningún microservicio — se reutiliza
  `FichaTecnicaInsumo` (GT) tal cual existe hoy.

## Context

`FichaTecnicaInsumo` (`apps/gerencia-tecnica/prisma/schema.prisma:321-334`)
ya modela exactamente "documentos de especificación vinculados a un
insumo del catálogo" — el concepto que Bocam llama "ficha técnica". Los
endpoints (`POST/GET/DELETE
/api/v1/gerencia-tecnica/insumos/:id/fichas[...]`) ya existen y ya se usan
desde `ComparativaDetail.tsx` (sidesheet de fichas, visible solo en modo
Compras — `!isResidenteMode`). El frontend llama a GT **directamente**
(`api.get/post/delete('/api/v1/gerencia-tecnica/...')`, enrutado por el
nginx de `app-shell` al contenedor de GT), no a través de un proxy en
Compras — así que el rol del usuario autenticado debe estar en
`ROLES_FICHAS_UPLOAD`/`ROLES_FICHAS_LECTURA` directamente.

Verificado: `ROLES_FICHAS_UPLOAD = ['procurement', 'gerencia_tecnica',
'admin']` y `ROLES_FICHAS_LECTURA` incluye `'resident'` pero no
`'residencia'` — el string real que `AdminView.tsx` asigna a un Residente
(mismo mismatch documentado en
`fix-acceso-residente-evaluacion-tecnica`). Resultado: un Residente real
nunca pudo ver ni subir fichas técnicas, en ningún punto del sistema —
coincide exactamente con lo que Bocam reporta como faltante.

`ResidenciaView.tsx`, flujo "Requisición Normal" (~línea 691-742), ya
tiene un patrón establecido de "crear requisición, luego enriquecer items
por separado, best-effort": después de `POST /requisiciones`, hace un
`Promise.allSettled` guardando especificaciones técnicas por ítem via
`PUT .../items/:itemId/especificaciones`. Las fichas técnicas se atan a
`insumo_id` (no a `id_item` de la requisición), así que ni siquiera
necesitan esperar la respuesta de creación — pero se sigue el mismo
patrón por consistencia y porque las fichas típicamente se suben junto
con las especificaciones del mismo insumo.

## Goals / Non-Goals

**Goals:**
- Que el Residente pueda subir una ficha técnica por insumo al armar una
  requisición "Normal" (selección desde catálogo).
- Que esas fichas (y cualquier otra ya subida antes para ese insumo, por
  cualquier rol) lleguen adjuntas al correo de invitación a cotizar de
  cada proveedor seleccionado.

**Non-Goals:**
- No se agrega input de ficha técnica a los flujos "Desde APU" (los
  materiales vienen de una composición ya definida, no de selección
  manual insumo por insumo) ni "Imprevisto" (`insumo_id` es null — no hay
  a qué insumo atar la ficha). Si Bocam lo pide después, es una extensión
  natural del mismo patrón.
- No se crea ninguna tabla nueva — se reutiliza `FichaTecnicaInsumo` tal
  cual.
- No se limita cuántas fichas puede tener un insumo ni se cambia el
  límite de tamaño existente (`FICHAS_MAX_SIZE_MB`, si existe, o el
  default de multer en GT) — fuera de alcance.
- No se bloquea el envío del correo si GT no responde o si una ficha no
  se puede descargar — degradación con gracia (ver D2).

## Decisions

### D1 — Agregar 'residencia' a los roles existentes, no crear una ruta nueva
Se agrega `'residencia'` a `ROLES_FICHAS_UPLOAD` y `ROLES_FICHAS_LECTURA`
en `apps/gerencia-tecnica/src/main.ts`, conservando `'resident'` (legacy,
no se sabe si algún dato/integración externa lo asume). Cero cambios de
lógica — los endpoints ya hacen exactamente lo que se necesita.
Alternativa descartada: crear un endpoint espejo en `compras` que proxee
a GT — innecesario, el frontend ya llama a GT directamente para este
mismo propósito desde Compras; no hay razón para que el Residente use un
camino distinto.

### D2 — Adjuntar fichas al correo vía llamada B2B best-effort, sin bloquear el envío
`enviarCorreosSolicitudCotizacion` (`apps/compras/src/main.ts`), que ya
hace una llamada B2B a GT para el catálogo de insumos
(`axios.get(`${GT_URL}/insumos`, ...)`, línea ~120), agrega una llamada
más: para cada `insumo_id` único de los ítems de la requisición,
`GET ${GT_URL}/insumos/:id/fichas` y luego, por cada ficha,
`GET ${GT_URL}/insumos/:id/fichas/:fid/descargar` (`responseType:
'arraybuffer'`) para obtener los bytes. Si GT no responde o una descarga
falla, esa ficha específica se omite (no se adjunta) y el correo se envía
igual — mismo principio de degradación con gracia que ya usa el catálogo
de insumos en esta misma función (`.catch(() => [] as any[])`).
Alternativa descartada: que el frontend descargue las fichas y las suba
como parte del payload de `POST /solicitud-cotizacion` — innecesario
round-trip extra; el backend ya tiene todo lo que necesita (`insumo_id`
por ítem) para resolverlas él mismo, igual que ya resuelve el catálogo de
insumos.

### D3 — `enviarSolicitudCotizacionEmail` recibe los adjuntos ya resueltos, no insumo_ids
La función de `mailer.ts` no sabe nada de GT ni de fichas técnicas —
recibe un array de adjuntos ya resueltos
(`{ filename, content: Buffer, contentType }[]`) y los concatena al array
existente de logos inline. Mantiene la separación de responsabilidades ya
establecida en el archivo (mailer = solo construcción/envío de HTML +
adjuntos, sin lógica de negocio).

## Risks / Trade-offs

- **[Riesgo] Correos más pesados si un insumo tiene muchas fichas
  grandes** → Mitigación: mismo riesgo que ya existe para el PDF de
  cotización (`COTIZACIONES_MAX_SIZE_MB=20` por archivo); no se agrega un
  límite nuevo en este change — si se vuelve un problema real, es un
  ajuste de configuración simple después.
- **[Riesgo] Llamada B2B adicional a GT en el flujo de envío de correos
  (ya hace 2 llamadas: requisición+proveedores vía Prisma, catálogo de
  insumos vía HTTP)** → Mitigación: mismo patrón de timeout corto (5s,
  igual que la llamada de catálogo existente) + degradación con gracia;
  no bloquea el flujo si falla.

## Migration Plan

- Sin cambios de schema en ningún microservicio.
- Branch `feat/adjuntos-requisicion-invitacion-cotizar`.
- Deploy: `apps/gerencia-tecnica`, `apps/compras` y `apps/app-shell`
  requieren rebuild/restart manual del contenedor correspondiente en el
  VPS tras mergear (sin CI/CD).
- Rollback: revertir el commit — cambio aditivo (permisos + adjuntos),
  sin riesgo de datos.

## Open Questions

- Ninguna abierta.

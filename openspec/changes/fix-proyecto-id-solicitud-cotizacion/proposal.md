## Why

Un Residente creó una requisición, Compras la autorizó y la asignó a 3
proveedores, y al enviar la Solicitud de Cotización el backend devolvió:
`Invalid prisma.solicitudCotizacion.create() invocation: Inconsistent column
data: Error creating UUID, invalid length: expected length 32 for simple
format, found 0`.

Causa raíz confirmada en `apps/compras/src/main.ts:645-719`
(`POST /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion`): el handler
lee la requisición con `select: { id_requisicion: true, tenant_id: true }`
(sin `proyecto_id`) y, al crear la `SolicitudCotizacion`, usa
`proyectoId` de `req.securityContext` (el "proyecto activo" de la sesión del
usuario) en vez del `proyecto_id` real de la requisición. `procurement` es un
rol "tenant-level" en `requireProjectAccess()` — no requiere que su proyecto
activo coincida con ninguno en particular, así que el middleware no detecta el
problema. Si el usuario de Compras no tiene un proyecto activo válido en su
sesión (`proyecto_id: ''` en el JWT — como ocurrió tras un borrado reciente de
proyectos en esta misma sesión de trabajo), ese string vacío se escribe
directamente en el `create()`, y Prisma lo rechaza por no ser un UUID válido.

Este es un bug de diseño independiente del incidente puntual que lo hizo
visible: incluso con datos sanos, si un usuario de Compras (rol tenant-level,
con acceso a varios proyectos) tiene seleccionado un proyecto activo distinto
al de la requisición que está procesando, el código escribiría el
`proyecto_id` **equivocado**, no solo vacío.

## What Changes

- El endpoint `POST /api/v1/compras/requisiciones/:reqId/solicitud-cotizacion`
  SHALL derivar `proyecto_id` de la requisición ya cargada en el propio
  handler, nunca del "proyecto activo" de la sesión del usuario.
- Se agrega validación explícita: si el `proyecto_id` resuelto no es un UUID
  válido, el endpoint responde 400 en vez de dejar que Prisma falle con un
  error interno de formato.

## Capabilities

### Modified Capabilities
- `solicitud-cotizacion-proveedores`: se agrega el requisito de que el
  `proyecto_id` de la Solicitud de Cotización SHALL siempre coincidir con el
  de la requisición de origen, sin importar el proyecto activo del usuario
  que la envía.

## Impact

- `apps/compras/src/main.ts`: SELECT de la requisición (agrega `proyecto_id`),
  creación de `SolicitudCotizacion` (usa el `proyecto_id` resuelto), y la
  llamada a `enviarCorreosSolicitudCotizacion` (mismo bug: releía la
  requisición para armar el correo usando el `proyectoId` de sesión, afectado
  por la misma política RLS de `requisiciones`)
- `apps/compras/src/solicitud-cotizacion-policy.ts` (nuevo, función pura) +
  `apps/compras/src/solicitud-cotizacion-policy.test.ts` (nuevo, test que
  reproduce el bug — ver `design.md` para por qué es un test unitario y no de
  integración con BD real)

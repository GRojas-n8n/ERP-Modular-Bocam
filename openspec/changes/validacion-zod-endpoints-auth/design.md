## Context

Hoy cada endpoint de `apps/auth/src/main.ts` valida su entrada a mano. Por ejemplo,
login normaliza y chequea `email`/`password`/`tenant_id` con `if` sueltos
(`normalizedEmail`, `normalizedTenantId`), y otros endpoints (`admin/users`,
`admin/proyectos`, `master/tenants`) tienen su propio criterio de qué campos son
obligatorios, con distinto nivel de rigor. No hay ningún lugar central que declare
la forma esperada de cada payload.

## Goals / Non-Goals

**Goals:**
- Establecer un patrón reusable (schema Zod + helper de respuesta 400) que se pueda
  copiar tal cual a los otros 12 microservicios en changes de seguimiento.
- Cubrir el 100% de los endpoints de escritura de `auth`, el microservicio de mayor
  riesgo por ser el punto de entrada de autenticación y administración de tenants.
- No cambiar el contrato de éxito de ningún endpoint — un payload que hoy es válido
  SHALL seguir siendo válido después de este cambio.

**Non-Goals:**
- No se valida `req.query` en este change (ningún endpoint de escritura de `auth`
  depende de query params para datos sensibles).
- No se migran los 12 microservicios restantes — eso es trabajo de seguimiento
  explícitamente fuera de alcance (ver proposal.md, Impact).
- No se cambia ningún comportamiento de negocio (reglas de `login-policy.ts`,
  `project-access-policy.ts`, etc.) — Zod solo reemplaza los chequeos de forma/tipo,
  no la lógica de negocio que ya vive en esos módulos.

## Decisions

**1. Un archivo de schema por endpoint en `apps/auth/src/validation/`, no un
archivo gigante.** Alternativa: un solo `schemas.ts` con todos los schemas. Se
prefiere un archivo por endpoint (`login.schema.ts`, `register.schema.ts`, etc.)
porque es más fácil de copiar como plantilla al migrar otro microservicio endpoint
por endpoint, y mantiene el diff de cada tarea de `tasks.md` acotado a un archivo.

**2. Helper `parseOrRespond(schema, req.body, res)` compartido dentro de
`apps/auth`, no un paquete nuevo todavía.** Se evalúa extraerlo a
`packages/validation` solo cuando un segundo microservicio lo necesite (ver
Open Questions) — crear un paquete compartido antes de tener un segundo consumidor
sería especular sobre una interfaz que todavía no se ha probado en un caso real
distinto.

**3. Respuesta 400 con la forma estándar de error del proyecto**
(`success: false`, `error.code: 'VALIDATION_ERROR'`, `error.message`, y un array de
`error.details` con `{ field, message }` por cada issue de Zod) — consistente con
el formato ya usado en las respuestas 401 de `auth-middleware` y 429 de los rate
limiters.

**4. `safeParse`, no `parse` con try/catch.** `safeParse` evita depender de manejo
de excepciones para el camino esperado (una entrada inválida no es una condición
excepcional, es una respuesta HTTP normal), consistente con cómo ya se maneja el
resto de validación manual en el archivo (retornos tempranos, no excepciones).

## Risks / Trade-offs

- [Riesgo] Un schema demasiado estricto podría rechazar un payload que el frontend
  hoy envía y que technically funcionaba (ej. un campo opcional que el frontend
  manda como `null` en vez de omitirlo) → Mitigación: los schemas se derivan
  leyendo el código actual de `apps/app-shell` que arma cada request, no solo el
  handler del backend; se agrega un test de integración por endpoint con un payload
  real capturado de la UI.
- [Trade-off] Este change solo cubre `auth` — mientras no se migren los otros 12
  servicios, el proyecto queda con dos patrones de validación conviviendo (Zod en
  `auth`, manual en el resto) → aceptado como punto de partida incremental, mismo
  enfoque que ya funcionó para cerrar el drift de RLS servicio por servicio.

## Open Questions

- ¿Cuándo se justifica extraer el helper `parseOrRespond` a un paquete compartido
  (`packages/validation`)? Propuesta: en el change que migre el segundo
  microservicio, no antes.

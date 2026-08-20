## Why

Una auditoría de seguridad (2026-08-06) encontró que `zod` no es dependencia en
ningún `package.json` del repositorio — la validación de entrada en los 13
microservicios es manual y ad-hoc (`if (!campo) { ... }` por endpoint), sin un
contrato central que garantice que todo campo recibido tenga el tipo y la forma
esperada antes de tocar Prisma. Esto no abre inyección SQL (Prisma parametriza
todo), pero sí deja huecos reales: campos que deberían ser string y llegan como
objeto, campos opcionales que no se normalizan igual en dos endpoints distintos,
y validaciones que dependen de que cada desarrollador recuerde repetir el mismo
chequeo. `auth` es el microservicio de mayor riesgo si un endpoint acepta un shape
inesperado (login, registro, alta de usuarios/tenants), así que se propone como
piloto del patrón antes de extenderlo al resto de microservicios.

## What Changes

- **NUEVA** dependencia `zod` en `apps/auth`.
- Se define un schema Zod por cada uno de los endpoints de escritura de `auth`
  (`POST /login`, `POST /register`, `POST /refresh`, `POST /switch-project`,
  `POST /admin/users`, `PATCH /admin/users/:id`, `POST /admin/proyectos`,
  `PATCH /admin/proyectos/:id`, `POST /master/tenants`, `PATCH /master/tenants/:id`)
  que reemplaza los chequeos manuales existentes, validando `req.body` (y `req.params`
  donde aplique) antes de cualquier llamada a Prisma.
- Un `safeParse` fallido SHALL responder 400 con un código de error estándar y el
  detalle de qué campo falló, sin cambiar el contrato de éxito existente.
- **Fuera de alcance de este change:** los otros 12 microservicios. Se documenta el
  patrón aquí (schemas + helper de respuesta 400) para que el rollout al resto siga
  el mismo enfoque que se usó con RLS drift — un change por servicio, incremental,
  no todos a la vez (ver Impact).

## Capabilities

### New Capabilities
- `validacion-entrada-zod`: contrato de validación de entrada con Zod para los
  endpoints de escritura de `auth`, como referencia del patrón a extender al resto
  de microservicios en changes de seguimiento.

### Modified Capabilities
*(ninguna — los endpoints existentes no cambian su contrato de éxito, solo se
  vuelven más estrictos ante entradas inválidas que hoy podrían pasar sin chequeo
  completo)*

## Impact

- **Modificado:** `apps/auth/src/main.ts` (10 endpoints de escritura) +
  `apps/auth/package.json` (dependencia `zod`).
- **Nuevo:** `apps/auth/src/validation/` (schemas Zod, uno por endpoint, más un
  helper `parseOrRespond` para la respuesta 400 estándar).
- **Sin cambios en:** frontend (los payloads válidos ya cumplían la forma esperada;
  solo se formaliza la validación del lado servidor), otros microservicios, schema
  de base de datos.
- **Seguimiento fuera de este change:** aplicar el mismo patrón a los otros 12
  microservicios, priorizando los que reciben datos de mayor riesgo (compras,
  finanzas, contabilidad) — cada uno como su propio change, igual que se hizo con
  los fixes de drift de RLS.

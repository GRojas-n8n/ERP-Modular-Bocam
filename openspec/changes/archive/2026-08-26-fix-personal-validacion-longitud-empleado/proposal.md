## Why

Al probar el alta de un empleado nuevo en `iretum.com` con el rol `personal_rh`
(verificación manual de `aislamiento-proyecto-por-modulo`, tarea 7.4), el alta
falló con:

```
Invalid `prisma.empleado.create()` invocation: The provided value for the
column is too long for the column's type. Column: (not available)
```

Causa: `apps/personal/prisma/schema.prisma` declara columnas `VarChar`
angostas para varios campos de texto del modelo `Empleado` (`rfc` VARCHAR(13),
`curp` VARCHAR(18), `nss` VARCHAR(11), `telefono` VARCHAR(20), `puesto`
VARCHAR(100), `contacto_emergencia_nombre` VARCHAR(200),
`contacto_emergencia_telefono` VARCHAR(30),
`contacto_emergencia_parentesco` VARCHAR(50)), pero:

- `POST /api/v1/personal/empleados`, `PATCH /api/v1/personal/empleados/:id` y
  `POST /api/v1/personal/empleados/importar-lote` toman estos campos de
  `req.body` sin validar longitud antes de pasarlos a Prisma.
- Los `<Input>` de RFC/CURP/NSS/teléfono/etc. en `PersonalView.tsx` no tienen
  `maxLength` — nada impide escribir un valor más largo del que la columna
  acepta.
- El catch de los tres endpoints responde `error.message` crudo al cliente
  (`PER_INTERNAL_ERROR`), filtrando el mensaje interno de Prisma/Postgres en
  vez de un error claro y accionable.

El resultado es un 500 con un mensaje que no dice qué campo falló ("Column:
(not available)" es una limitación conocida de Prisma con este tipo de error
de Postgres) — el usuario no puede corregir el dato sin adivinar.

## What Changes

- `POST /api/v1/personal/empleados`, `PATCH /api/v1/personal/empleados/:id` y
  `POST /api/v1/personal/empleados/importar-lote` SHALL validar con Zod la
  longitud máxima de cada campo de texto contra el límite real de su columna
  en `schema.prisma`, antes de tocar Prisma. Se sigue el patrón ya establecido
  en `apps/auth` (`parseOrRespond` + schemas por endpoint;
  ver `openspec/changes/archive/2026-08-20-validacion-zod-endpoints-auth`).
- El alta individual y la edición responden `400 VALIDATION_ERROR` con el
  campo y el límite excedido cuando corresponde. La importación masiva reporta
  el error por fila (mismo mecanismo que ya usa para "RFC duplicado" y
  "salario_diario debe ser numérico"), sin abortar el resto del lote.
- Los `<Input>` de RFC, CURP, NSS, teléfono, puesto, contacto de emergencia
  (nombre/teléfono/parentesco) en el formulario de alta y edición de
  `PersonalView.tsx` SHALL tener `maxLength` igual al límite real de la
  columna, para que el usuario vea el límite mientras escribe, no después de
  enviar.
- Los tres endpoints dejan de responder `error.message` crudo en errores
  inesperados (`PER_INTERNAL_ERROR`) — el mensaje genérico ya usado en el
  resto del servicio.

## Out of scope

- No se valida el *formato* de RFC/CURP/NSS (regex de estructura oficial) —
  solo longitud. Formato es un cambio de negocio aparte.
- No se migran otros endpoints de `personal` (cuadrillas, asistencia, nómina)
  a Zod — el patrón queda listo para replicarse, pero esto se limita al alta/
  edición/importación de empleados, que es donde está el bug reportado.
- No se cambia `salario_diario` (columna `Decimal`, no `VarChar` — otra clase
  de error, ya validado por separado en la importación masiva).

## Capabilities

### Modified Capabilities
- `alta-individual-empleado`: el alta y edición de empleado validan longitud
  de campos antes de escribir a la base de datos, con un error claro en vez
  de un 500 con mensaje críptico.

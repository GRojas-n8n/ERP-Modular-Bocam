## Why

El campo `contacto_emergencia` de Empleado es un único texto libre (VARCHAR(200))
donde RH captura, sin estructura, una mezcla de nombre/teléfono/parentesco. En
una emergencia real, alguien tiene que llamar a ese número — si el dato está
mezclado en un solo campo de texto libre, se pierde tiempo extrayendo el
teléfono correcto y no hay garantía de que exista uno. El campo debe dividirse
en tres campos estructurados: nombre, teléfono y parentesco.

## What Changes

- Se agregan 3 columnas nuevas nullable en `personal.empleados`:
  `contacto_emergencia_nombre`, `contacto_emergencia_telefono`,
  `contacto_emergencia_parentesco` (todas `VARCHAR`, sin validación de formato,
  igual de permisivas que el `telefono` propio del empleado hoy).
- La columna legacy `contacto_emergencia` (VARCHAR(200)) se conserva sin
  eliminar — no se hace DROP COLUMN. Se deja de escribir y de leer desde el
  código de aplicación una vez completado este change.
- Migración de datos: el valor actual de `contacto_emergencia` (si existe) se
  copia tal cual a `contacto_emergencia_nombre` en la misma migración, para no
  perder el dato ya capturado. `contacto_emergencia_telefono` y
  `contacto_emergencia_parentesco` quedan `NULL` — no hay forma confiable de
  parsear un texto libre en teléfono/parentesco, así que NO se intenta.
- `POST /api/v1/personal/empleados` y `PATCH /api/v1/personal/empleados/:id`
  aceptan los 3 campos nuevos en vez de `contacto_emergencia`. **BREAKING**: el
  body ya no acepta el campo `contacto_emergencia` (se ignora si se envía).
- Los formularios de alta y edición de empleado en `PersonalView.tsx`
  reemplazan el input único "Contacto de emergencia" por tres inputs: Nombre,
  Teléfono, Parentesco.
- La hoja de impresión de credenciales (`credencialesPrint.ts`) muestra
  nombre + teléfono del contacto de emergencia (el parentesco no se imprime
  por espacio en la credencial física).

## Capabilities

### New Capabilities
- `contacto-emergencia-empleado`: campos estructurados (nombre, teléfono,
  parentesco) del contacto de emergencia de un Empleado — almacenamiento,
  aceptación en alta/edición, y consumo en la impresión de credenciales.

### Modified Capabilities
- `alta-individual-empleado`: el panel de alta expone
  `contacto_emergencia_nombre`, `contacto_emergencia_telefono`,
  `contacto_emergencia_parentesco` en vez de `contacto_emergencia`.
- `edicion-datos-empleado`: el panel de edición precarga y actualiza los
  mismos 3 campos nuevos en vez de `contacto_emergencia`.

## Impact

- `apps/personal/prisma/schema.prisma` + nueva migración Prisma (3 columnas
  nuevas, `contacto_emergencia` se conserva).
- `apps/personal/src/main.ts`: alta (`POST /empleados`), edición
  (`PATCH /empleados/:id`), y el mapeo de salida que hoy expone
  `contacto_emergencia` (línea ~2111).
- `apps/app-shell/src/views/PersonalView.tsx`: formularios de alta y edición
  (interfaces `NuevoEmpleadoForm`/estado de edición, `FormField`s), y el tipo
  del empleado usado en la lista.
- `apps/app-shell/src/lib/credencialesPrint.ts`: el tipo de entrada y el
  render del reverso de la credencial.
- Tests existentes que referencian `contacto_emergencia`:
  `PersonalView.editar-empleado.test.tsx`,
  `PersonalView.imprimir-lote-credenciales.test.tsx`.

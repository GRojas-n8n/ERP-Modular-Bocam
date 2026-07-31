## Why

Hoy es posible dar de alta a un empleado (`alta-individual-empleado`) y configurar su
jornada o deducciones, pero no existe ninguna forma de corregir sus datos generales
(nombre, RFC, CURP, NSS, puesto, salario diario, teléfono, email, contacto de
emergencia) una vez creado. Cualquier error de captura en el alta —muy común con
RFC/CURP tecleados a mano— queda permanente, obligando a RH a dar de baja y crear un
empleado nuevo, lo que rompe el historial de asistencia, nómina y expediente ya
asociado a ese `id_empleado`.

## What Changes

- Extender `PATCH /api/v1/personal/empleados/:id` en `apps/personal/src/main.ts` para
  aceptar también los campos generales del empleado (`nombre`, `apellido_paterno`,
  `apellido_materno`, `rfc`, `curp`, `nss`, `puesto`, `salario_diario`, `telefono`,
  `email`, `contacto_emergencia`), con las mismas validaciones que ya usa el alta
  (`POST /api/v1/personal/empleados`): presencia de los campos obligatorios
  (`nombre`, `apellido_paterno`, `rfc`, `puesto`, `salario_diario`) cuando se
  envían, y unicidad de `rfc` dentro del tenant (excluyendo al propio empleado que
  se edita, para no auto-rechazarlo). El alta actual no valida formato de
  RFC/CURP/NSS, así que la edición tampoco introduce esa validación nueva — mismo
  nivel de rigor. Los campos de jornada (`modo_asistencia`, `tipo_jornada`,
  horarios) que ya acepta el endpoint se mantienen sin cambios.
- Agregar botón "Editar" en cada fila de la tabla de Empleados en
  `PersonalView.tsx`, junto a los botones existentes "Jornada" y "Deducciones".
- Agregar un panel de edición (`SlidePanel`) que reutiliza el layout del formulario de
  "Nuevo Empleado", mostrado precargado con los datos actuales del empleado
  seleccionado.
- Al guardar, el sistema llama al `PATCH` extendido y refresca la fila del empleado en
  la lista sin recargar toda la tabla.
- Restringir el nuevo uso del endpoint a los roles `personal_rh` y `admin`, igual que
  el resto de endpoints de empleado (el endpoint ya usa `requireRoles('personal_rh',
  'admin')`, no cambia).

## Capabilities

### New Capabilities
- `edicion-datos-empleado`: botón "Editar" en la tabla de Empleados, panel
  precargado con los datos del empleado, y el flujo de guardar/validar/refrescar
  contra el `PATCH` extendido.

### Modified Capabilities
- (ninguna — `alta-individual-empleado`, `config-jornada-empleado` y
  `config-deducciones-empleado` no cambian sus requisitos; el endpoint `PATCH` se
  extiende con campos nuevos pero su contrato de jornada existente no cambia)

## Impact

- **Backend:** `apps/personal/src/main.ts` — handler de
  `PATCH /api/v1/personal/empleados/:id` (línea ~288) y sus validaciones.
- **Frontend:** `apps/app-shell/src/views/PersonalView.tsx` — tabla de Empleados,
  nuevo estado de panel de edición, nuevo handler de guardado.
- **Tests:** tests backend (Supertest) que reproducen primero la ausencia de la
  capability (PATCH con campos generales rechazados/ignorados hoy), luego el fix;
  tests frontend (`PersonalView.editar-empleado.test.tsx`) siguiendo el patrón de
  `PersonalView.nuevo-empleado.test.tsx`.
- **Sin cambios de esquema de BD** — los campos ya existen en la tabla `Empleado`.

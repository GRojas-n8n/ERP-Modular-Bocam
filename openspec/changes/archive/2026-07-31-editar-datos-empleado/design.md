## Context

`apps/personal/src/main.ts` ya tiene `PATCH /api/v1/personal/empleados/:id` (línea
~288), pero solo desestructura y actualiza campos de jornada
(`modo_asistencia`, `tipo_jornada`, `hora_entrada_programada`,
`hora_salida_programada`, `horas_jornada`). Cualquier otro campo enviado en el body
(por ejemplo `nombre` o `rfc`) hoy se ignora en silencio — el update de Prisma
nunca lo incluye.

El alta (`POST /api/v1/personal/empleados`, línea ~100) solo valida presencia de
campos obligatorios; no valida formato de RFC/CURP/NSS ni atrapa explícitamente el
choque de unicidad de `rfc` (`@@unique([tenant_id, rfc])` en el schema) — un RFC
duplicado hoy provoca una excepción de Prisma que cae al catch genérico y responde
500 con `PER_INTERNAL_ERROR`. Este comportamiento es una limitación conocida y
preexistente, no algo que este change deba arreglar (fuera de alcance).

`PersonalView.tsx` ya tiene el patrón completo para esto: `nuevoEmpleadoForm`
(estado + campos + validación de obligatorios en el frontend, líneas ~1693-1741) y
el patrón de panel-por-fila con `jornadaPanel`/`configPanel` (líneas 336-338,
670-696) para precargar y editar un registro puntual.

## Goals / Non-Goals

**Goals:**
- Permitir editar los campos generales de un empleado ya existente desde la UI.
- Reutilizar el `PATCH` existente (no crear un endpoint nuevo) para no duplicar la
  ruta de actualización de empleado.
- Mantener el mismo nivel de validación que el alta (ni más laxo ni más estricto),
  para no introducir una inconsistencia entre "crear" y "editar".

**Non-Goals:**
- No se agrega validación de formato de RFC/CURP/NSS (regex) — eso es una mejora
  separada que también aplicaría al alta y a la carga masiva; mezclarla aquí amplía
  el alcance de este change.
- No se toca `estado`/baja (`PATCH .../baja` ya cubre eso), ni `config-deducciones`,
  ni `numero_empleado` (autogenerado, inmutable).
- No se cambia el contrato de los campos de jornada que el endpoint ya acepta.

## Decisions

**D1 — Extender el PATCH existente en vez de crear uno nuevo.**
El endpoint ya es "actualizar campos parciales de un empleado" con el mismo
`requireRoles('personal_rh', 'admin')` y el mismo patrón de
`...(campo !== undefined ? { campo } : {})` que necesitamos para los campos
generales. Crear un segundo endpoint (`PUT /empleados/:id/datos-generales`, por
ejemplo) duplicaría la búsqueda del empleado y el chequeo de tenant sin ganar
nada. Alternativa descartada: endpoint separado — se descarta por duplicación
innecesaria.

**D2 — Validar solo lo que el alta ya valida.**
Si se enviaron `nombre`, `apellido_paterno`, `rfc`, `puesto` o `salario_diario`
como parte del PATCH, no pueden llegar vacíos (mismo mensaje `PER_MISSING_FIELDS`
que usa el alta). Antes de hacer el `update`, si se envía `rfc` y es distinto al
actual, se verifica que no exista otro empleado del mismo tenant con ese RFC
(`prisma.empleado.findFirst({ where: { tenant_id, rfc, NOT: { id_empleado: id } } })`)
y se responde 400 `PER_RFC_DUPLICADO` en vez de dejar que reviente como 500. Esto
es una mejora pequeña y de bajo riesgo sobre el comportamiento del alta (no baja el
rigor, lo sube ligeramente solo en el camino de edición) y evita que RH reciba un
error genérico de servidor al corregir un RFC mal capturado.

**D3 — Un solo panel de edición reutilizando el layout de "Nuevo Empleado".**
En vez de crear un formulario distinto, `handleAbrirEditarEmpleado(empleado)`
llena un estado `editarEmpleadoForm` (mismo shape que `nuevoEmpleadoForm`) con los
valores actuales del empleado y abre un `SlidePanel` con los mismos campos ya
existentes en el panel de alta. Alternativa descartada: editar campos inline en la
tabla — se descarta porque la tabla de Empleados ya está saturada de columnas y
acciones (ver botones "Jornada"/"Deducciones" existentes), y el patrón de
`SlidePanel` por fila ya es el establecido en esta vista.

**D4 — Refresco optimista de la fila, no recarga completa de la tabla.**
Igual que `handleSaveConfigJornada` (línea 687-693), al recibir 200 del PATCH se
actualiza el empleado dentro del array local (`setEmpleados` mapeando por
`id_empleado`) en vez de volver a pedir toda la lista. Consistente con el patrón
ya usado para jornada.

## Risks / Trade-offs

- **[Riesgo] Un PATCH parcial mal armado podría sobreescribir campos con
  `undefined`/vacío sin querer** → Mitigación: el spread condicional
  `...(campo !== undefined ? {...} : {})` ya usado en el endpoint solo incluye
  campos explícitamente enviados; el frontend solo envía el form completo
  precargado, así que un campo que el usuario no tocó igual viaja con su valor
  actual (no con `undefined`).
- **[Riesgo] Cambiar el RFC de un empleado con historial de nómina/asistencia ya
  generado podría generar inconsistencia de reportes históricos (que referencian
  el RFC en el momento del pago, no el `id_empleado`)** → Mitigación: fuera de
  alcance de este change; se documenta como limitación conocida en `tasks.md` para
  que RH sepa que corregir el RFC no reescribe reportes/recibos ya emitidos.
- **[Trade-off] No agregar validación de formato ahora deja RFC/CURP/NSS con
  errores tipográficos silenciosos** → Aceptado conscientemente (Non-Goal D2) para
  no ampliar el alcance; queda como candidato a change futuro que toque alta +
  edición + carga masiva a la vez.

## Migration Plan

- Sin migración de base de datos (los campos ya existen en `Empleado`).
- Deploy normal del microservicio `personal` (build → migrate si aplica → up -d) y
  del `app-shell` frontend. Sin cambios de contrato hacia otros microservicios ni
  eventos nuevos en `bocam.events`.
- Rollback: revertir el commit del PATCH extendido y del panel de edición; el
  endpoint vuelve a ignorar los campos generales sin dejar datos corruptos (los
  updates ya aplicados quedan como estaban, no hay estado intermedio inválido).

## Open Questions

- Ninguna abierta — alcance acotado a extender el PATCH existente + un panel de
  edición siguiendo patrones ya establecidos en el mismo archivo.

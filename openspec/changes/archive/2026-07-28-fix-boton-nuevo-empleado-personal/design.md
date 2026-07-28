## Context

`PersonalView.tsx` ya usa el patrón `SlidePanel` (`../components/SlidePanel`)
para paneles de detalle/formulario: `panelImportarEmpleados` (import
masivo), `jornadaPanel` (config de jornada), `configPanel` (config de
deducciones). Cada uno sigue el mismo esquema: un `useState` con el
estado del panel (`null`/`false` cuando está cerrado), un `SlidePanel`
con `isOpen={...}`, un formulario controlado, y un handler `handleGuardarX`
que llama al servicio API, actualiza estado local y cierra el panel. El
alta individual de empleado debe seguir ese mismo patrón en vez de
introducir un componente de modal nuevo.

El endpoint backend `POST /api/v1/personal/empleados`
(`apps/personal/src/main.ts:100`) ya existe, valida
`nombre/apellido_paterno/rfc/puesto/salario_diario` como obligatorios, y
no requiere ningún rol especial (a diferencia de otros endpoints de
Personal que exigen `personal_rh`/`admin` — este es intencionalmente
abierto a cualquier usuario autenticado del tenant, igual que hoy).

## Goals / Non-Goals

**Goals:**
- Conectar el botón "+ Nuevo Empleado" a un `SlidePanel` con formulario
  de alta individual, reutilizando el patrón existente en el archivo.
- Validar los 5 campos obligatorios en cliente antes de enviar.
- Refrescar `empleados` (recargar la lista) tras un alta exitosa.
- Cubrir el bug con un test que falle en `main` (botón sin acción) y
  pase tras el fix.

**Non-Goals:**
- No se toca el endpoint de backend ni sus reglas de validación.
- No se agrega edición de empleado (ya existe vía `PATCH .../:id` y
  paneles de config separados) — solo alta.
- No se introduce una librería de formularios (react-hook-form, etc.);
  se sigue el patrón `useState` simple ya usado en el resto del archivo.

## Decisions

- **Reutilizar `SlidePanel` en vez de un modal nuevo** — consistencia
  visual y de comportamiento (cierre con click fuera/Esc) con el resto
  de la vista; evita introducir un segundo patrón de overlay.
- **Estado del panel como objeto de formulario controlado**
  (`nuevoEmpleadoPanel: boolean` + `nuevoEmpleadoForm: {...}`), igual que
  `jornadaPanel`/`configPanel`, no como campos sueltos, para poder
  resetear todo el formulario con una sola asignación al cerrar/abrir.
- **Validación de obligatorios en cliente antes del POST** — evita un
  round-trip innecesario y dado que el backend ya responde
  `PER_MISSING_FIELDS` con 400, el cliente replica esa misma lista de
  campos para dar feedback inmediato; el error del backend se sigue
  mostrando tal cual si de todos modos ocurre (p. ej. condición de
  carrera con otro campo).
- **Recarga completa de la lista de empleados tras alta exitosa** (no
  inserción optimista en el array local) — el backend calcula
  `numero_empleado` server-side; recargar evita mostrar un registro con
  datos parciales/desincronizados del real.

## Risks / Trade-offs

- [El backend no aplica `requireRoles` en este POST, así que cualquier
  usuario autenticado del tenant puede dar de alta empleados] → Fuera de
  alcance de este bug-fix (es el comportamiento actual de producción);
  si se decide restringir por rol, requiere spec aparte que toque el
  backend.
- [Formulario con muchos campos opcionales puede sentirse largo en un
  `SlidePanel` angosto] → Igual que `panelImportarEmpleados`, se acepta
  el mismo ancho estándar ya usado en la vista; no es un rediseño de UX.

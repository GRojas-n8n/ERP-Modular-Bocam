## Context

`ConfirmCriticalActionDialog` (`packages/ui-core/src/primitives.tsx:349-429`) ya es genérico: acepta
`variant: 'default' | 'destructive'`, `projectName`, `projectColorDot`, `title`, `description`,
`children`, `confirmLabel`/`cancelLabel` y siempre pinta "Proyecto activo: {projectName}" arriba del
título. Las 6 acciones críticas ya lo usan con `variant='destructive'` o `variant='default'` según el
caso. No hace falta ningún cambio en `ui-core` — este change es de consumo, no de componente nuevo.

Los handlers de alta identificados en la auditoría (`handleSubmitRequisicion`, `handleGuardarNuevoEmpleado`,
`handleSaveActivo`, `handleCrearEstimacion`, registro de avance físico) hoy llaman a `api.post(...)`
directo desde el evento de submit del formulario/panel, sin ningún paso intermedio. `currentProjectId`
y el nombre/color del proyecto activo ya están disponibles en cada vista vía `useTenant()`
(`apps/app-shell/src/context/TenantContext.tsx`), que es la misma fuente que usan las 6 vistas que
ya implementan `ConfirmCriticalActionDialog` — no hay que resolver de nuevo "cuál es el proyecto activo".

## Goals / Non-Goals

**Goals:**
- Insertar un paso de confirmación explícita (mostrando el proyecto activo) entre "el usuario
  termina de llenar el formulario de alta" y "la petición POST de creación se envía al backend",
  en los módulos listados en la propuesta.
- Reutilizar `ConfirmCriticalActionDialog` con `variant='default'` — sin fork de componente.
- Mantener cada `handleGuardar*`/`handleCrear*` como la única fuente de verdad del payload: el
  diálogo solo gatea *cuándo* se llama a `api.post`, no construye el payload de nuevo.
- Mostrar el proyecto activo también de forma pasiva en el subtítulo del `SlidePanel` de alta,
  usando el prop `subtitle` ya existente (sin cambiar el contrato de `SlidePanel`).

**Non-Goals:**
- No se modifica `confirmacion-accion-critica-proyecto` ni las 6 acciones que ya cubre.
- No se agrega confirmación a ediciones/actualizaciones de registros existentes — solo a la
  creación de un registro nuevo (alta). Editar no es el problema que reporta el usuario.
- No se toca el backend. El hallazgo de `apps/almacen/src/main.ts` (POST activos confía en
  `proyecto_id` del body) se resuelve en un bug-fix aparte, no en este change.
- No se crea un wrapper/interceptor global de `api.post` — no existe hoy un choke point único, y
  crear uno sería refactorizar código legacy no cubierto por spec.

## Decisions

**1. Reutilizar `ConfirmCriticalActionDialog` con `variant='default'`, no crear un componente nuevo.**
Alternativa considerada: nuevo componente `ConfirmCreateInProjectDialog`. Se descarta porque el
componente actual ya soporta el caso (mismo layout, mismo indicador de proyecto, variante no
destructiva ya soportada) — duplicarlo violaría el requirement existente de "un solo componente
compartido para confirmaciones de proyecto" y añadiría mantenimiento sin beneficio.

**2. El diálogo se muestra al hacer clic en el botón final de "Guardar/Crear", interceptando el
submit — no al abrir el panel de alta.** Alternativa considerada: mostrar la confirmación al abrir
el `SlidePanel`. Se descarta porque en ese momento el usuario aún no decidió los datos del
registro; confirmar el proyecto antes de llenar el formulario no previene el error real (usuario
cambia de proyecto a medio llenado, o ya tenía el panel abierto de antes). Confirmar justo antes
de enviar es el punto donde rectificar realmente evita el registro mal ubicado.

**3. Cobertura por módulo, no un wrapper transversal.** Cada handler de alta se modifica
individualmente para abrir el diálogo antes de llamar `api.post`. Se descarta un wrapper genérico
sobre `api.post` porque el repo no tiene hoy un choke point único para altas (cada vista arma su
propio payload y maneja su propio estado de carga/error), y crear uno sería refactor de código
legacy fuera del alcance de un spec de UX puntual (regla del proyecto: no refactorizar sin spec
dedicado).

**4. El subtítulo del `SlidePanel` de alta es complementario, no sustituto del diálogo.** Refuerza
visualmente el proyecto activo mientras se llena el formulario (útil si el usuario cambia de
proyecto con el panel ya abierto), pero no reemplaza la confirmación explícita porque no requiere
ninguna acción del usuario y podría pasar desapercibido.

**5. El diálogo de alta no debe poder descartarse por accidente (clic en overlay / Escape).**
`ConfirmCriticalActionDialog` hoy trata el clic en el overlay (`primitives.tsx:400`) y la tecla
Escape (`primitives.tsx:385-392`) como cancelación silenciosa — aceptable para acciones críticas
porque cancelar ahí es seguro (no ejecuta la acción destructiva), pero no cumple el requisito
explícito del usuario de que la confirmación de alta sea "imposible de ignorar". Se agrega un
nuevo prop opcional `dismissible?: boolean` (default `true`) a `ConfirmCriticalActionDialogProps`:
con `dismissible={false}`, el componente ignora el clic en overlay y la tecla Escape, y solo se
resuelve con clic explícito en "Confirmar" o "Cancelar". Las 6 acciones críticas existentes no
pasan este prop y conservan su comportamiento actual (default `true`, sin cambios). Los usos
nuevos de este change pasan `dismissible={false}`. Alternativa descartada: crear una variante de
componente separada solo para esto — no se justifica un segundo componente por una sola diferencia
de comportamiento configurable con un prop.

## Risks / Trade-offs

- [Fricción adicional en flujos de alta frecuente, ej. captura masiva de empleados uno por uno] →
  Mitigación: el diálogo es una sola confirmación por alta (igual que las 6 acciones críticas ya
  aceptadas por el usuario final); si en el futuro se reporta que es demasiada fricción para un
  módulo específico, se ajusta con un spec de seguimiento — no se resuelve preventivamente aquí.
- [Inconsistencia si se agregan nuevos formularios de alta a futuro sin pasar por este patrón] →
  Mitigación: el requirement de spec exige explícitamente reutilizar el componente compartido;
  revisiones de código futuras deben verificar contra este spec.
- [Confundir esta confirmación con la de `confirmacion-accion-critica-proyecto`] → Mitigación:
  textos y `variant='default'` (no destructivo) distintos; el spec nuevo documenta explícitamente
  que son capabilities separadas.

## Migration Plan

Cambio de frontend puro, sin migración de datos ni de infraestructura. Se despliega como parte del
build normal de `app-shell`. Rollback: revertir el PR (no hay estado persistido nuevo).

## Open Questions

Ninguna bloqueante — se decidió variant y punto de interceptación arriba. Si al implementar
aparece un formulario de alta con un patrón de submit distinto (ej. multi-paso), se resuelve caso
por caso siguiendo la misma decisión #2 (confirmar justo antes del POST final).

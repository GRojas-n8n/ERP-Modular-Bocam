## Context

`accionarAlerta()` (`ControlObraView.tsx:594-603`) ya hace un solo `PATCH` a `/api/v1/control-proyectos/alertas/:id/:accion` con `{ nota_cp: notaCP }`, sin importar si `accion` es `reconocer` o `ignorar`. El modal (`ControlObraView.tsx:1580-1611`) es hoy el único punto de entrada a esa función, compartido por ambas acciones. El botón "Reconocer" en la tarjeta de alerta (línea 1168-1173) hoy solo abre el modal.

## Goals / Non-Goals

**Goals:**
- Reducir "Reconocer" (el caso común, sin dato requerido) a un clic.
- Conservar la posibilidad de dejar una nota al reconocer, para cuando sí aporta valor, sin que sea el camino por defecto.
- No tocar el flujo de "Ignorar", que sí requiere justificación.

**Non-Goals:**
- No se cambia el backend ni el modelo `AlertaProyecto`.
- No se agrega deshacer ("undo") al reconocimiento directo — reconocer ya era una acción de bajo riesgo (no bloquea nada, ver `control-proyectos-modulo`, "CP no bloquea operaciones").

## Decisions

- **"Reconocer" llama directo a la API, no abre modal:** el botón invoca una nueva función `reconocerDirecto(alerta)` que hace el mismo `PATCH ... /reconocer` con `nota_cp: ''`, actualiza el estado de carga por alerta (para no bloquear el resto de la lista mientras una alerta se procesa) y refresca la lista al terminar.
- **Acción secundaria "Agregar nota" para reconocer con contexto:** un enlace de texto pequeño junto al botón "Reconocer" (no otro botón del mismo peso visual, para no reintroducir la ambigüedad de dos botones iguales) abre el modal existente en modo `reconocer`, igual que hoy. Alternativa descartada: quitar por completo la opción de nota al reconocer — se descarta porque el modelo de datos (`nota_cp`) ya contempla dejar nota también al reconocer, y eliminar la opción sería una regresión de funcionalidad, no solo un cambio de flujo.
- **Estado de carga por alerta, no global:** se cambia `enviandoAlerta` (hoy boolean único) por un `Set<string>` de IDs de alerta en proceso, para permitir reconocer una alerta directo mientras otra sigue con su modal de "Ignorar" abierto sin que se bloqueen entre sí.

## Risks / Trade-offs

- [Riesgo] Un clic accidental en "Reconocer" ya no tiene el modal como paso de confirmación → Mitigación: reconocer no es una acción destructiva ni bloqueante (la alerta puede reabrirse si la condición persiste, ver "Alerta se resuelve automáticamente" y el ciclo de vida `ACTIVA → RECONOCIDA` en `control-proyectos-modulo`); el costo de un reconocimiento accidental es bajo y no irreversible en la práctica (el director puede volver a intervenir).
- [Trade-off] Cambiar `enviandoAlerta` de boolean a `Set<string>` toca la lógica existente de deshabilitado de botones en el modal de "Ignorar" — se revisa que esa condición siga funcionando igual para esa alerta específica.

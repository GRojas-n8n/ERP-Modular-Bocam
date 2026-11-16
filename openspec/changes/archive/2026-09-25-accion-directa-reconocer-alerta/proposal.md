## Why

En la pestaña "Alertas" de `ControlObraView`, los botones "Reconocer" e "Ignorar" abren el mismo modal (`ControlObraView.tsx:1580-1611`), aunque solo "Ignorar" requiere justificación (nota mínima de 20 caracteres, `notaCP.length < 20` en la condición de deshabilitado, línea 1602). "Reconocer" no tiene ningún requisito de datos — su nota es explícitamente opcional (placeholder "Nota para el expediente (opcional)..."). Obligar al usuario a abrir un modal y hacer un clic adicional para confirmar una acción que no necesita ningún dato es una fricción evitable en una tarea frecuente (hay alertas automáticas que se generan periódicamente, ver `control-proyectos-modulo`).

## What Changes

- El botón "Reconocer" de una alerta ejecuta la acción directamente (`PATCH /api/v1/control-proyectos/alertas/:id/reconocer` con `nota_cp` vacío), sin abrir modal, en un clic.
- Se agrega una acción secundaria, discreta, para reconocer *con* nota (para el caso donde el usuario sí quiere dejar contexto en el expediente) — abre el mismo modal que hoy, pero solo para este caso opcional.
- El botón "Ignorar" no cambia: sigue abriendo el modal con el campo de justificación obligatoria (mínimo 20 caracteres), porque esa acción sí requiere el dato.
- Se agrega retroalimentación inmediata (estado de carga en el botón "Reconocer" mientras se envía) para que el usuario sepa que la acción se procesó sin necesidad de un modal que se cierre.

## Capabilities

### New Capabilities
- `alertas-control-obra-acciones`: documenta las acciones disponibles sobre una alerta activa en la pestaña "Alertas" de `ControlObraView` (Reconocer directo, Reconocer con nota, Ignorar con justificación obligatoria) — hoy sin spec propio.

### Modified Capabilities
(ninguna)

## Impact

- Código afectado: `apps/app-shell/src/views/ControlObraView.tsx` (pestaña "Alertas": botón "Reconocer", función `accionarAlerta`, modal de alertas).
- No cambia el contrato de `PATCH /api/v1/control-proyectos/alertas/:id/reconocer` ni `/ignorar` — ambos ya aceptan `nota_cp` opcional/requerido según el caso; solo cambia cuándo el frontend abre el modal antes de llamarlos.
- No afecta el modelo de datos `AlertaProyecto` (`control-proyectos-modulo`).

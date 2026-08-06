## Why

Hoy, cuando un usuario da de alta un registro nuevo (requisición, activo, empleado, avance
físico, estimación, etc.) en cualquier módulo del app-shell, el POST se dispara directo al hacer
clic en "Guardar", sin ningún punto donde el sistema le muestre en qué proyecto activo está a
punto de crear ese registro. En un ERP multi-proyecto donde el usuario cambia de proyecto activo
frecuentemente, esto genera riesgo real de que un registro se cree en el proyecto equivocado sin
que el usuario lo note hasta después. El sistema ya resuelve este mismo problema para acciones
críticas/destructivas (`confirmacion-accion-critica-proyecto`), pero esa confirmación excluye
deliberadamente los formularios de alta. Se necesita una verificación equivalente — más ligera,
pensada para no destructivas — específica para el momento de crear un registro nuevo.

## What Changes

- Antes de ejecutar el POST de creación de un registro nuevo, el sistema muestra al usuario el
  nombre del proyecto activo y le da la oportunidad explícita de cancelar/rectificar antes de que
  el registro se guarde.
- Se reutiliza el componente compartido de confirmación (`packages/ui-core`, el mismo usado por
  `confirmacion-accion-critica-proyecto`) con una variante no destructiva/informativa, en vez de
  crear un segundo componente de diálogo con propósito similar.
- El panel de alta (`SlidePanel`) de cada formulario de creación muestra el nombre del proyecto
  activo en su subtítulo mientras el usuario llena el formulario, como refuerzo visual pasivo
  adicional a la confirmación explícita.
- Cobertura inicial: alta de Requisición en Compras, alta de Empleado en Personal, alta de Activo
  en Almacén, y registro de Avance Físico / creación de Estimación en Control de Obra / Residencia.
  (Las Órdenes de Compra no se crean manualmente — se generan automáticamente al firmar un Cuadro
  Comparativo, ver `ciclo-vida-oc`; no hay formulario de alta que cubrir ahí.) Otros formularios de
  alta detectados durante la implementación se agregan a la misma cobertura si siguen el mismo
  patrón de handler (`handleGuardar*`/`handleCrear*` → `api.post` directo).
- No se modifica el comportamiento de `confirmacion-accion-critica-proyecto`: esta es una
  confirmación distinta, de menor severidad, para un conjunto de acciones distinto (altas, no
  acciones destructivas/irreversibles).

## Capabilities

### New Capabilities
- `confirmacion-proyecto-en-altas`: confirmación del proyecto activo antes de crear un registro
  nuevo en cualquier formulario de alta del app-shell, con posibilidad de cancelar/rectificar
  antes de que la petición de creación se envíe al backend.

### Modified Capabilities
(ninguna — no cambia el comportamiento de especificación de `confirmacion-accion-critica-proyecto`
ni de otras capabilities existentes; solo se le agrega al SlidePanel de alta el uso del prop
`subtitle` ya soportado, sin cambiar su contrato)

## Impact

- **Frontend (`apps/app-shell`)**: `ComprasView.tsx` (alta de Requisición y OC manual),
  `PersonalView.tsx` (alta de Empleado), `AlmacenView.tsx` (alta de Activo),
  `ResidenciaView.tsx` (registrar Avance Físico, crear Estimación), y cualquier otro handler de
  alta con el mismo patrón.
- **`packages/ui-core`**: se reutiliza `ConfirmCriticalActionDialog` (o se le agrega una variante
  no destructiva si el componente actual no la soporta) — sin romper su uso existente en las 6
  acciones críticas ya cubiertas.
- **Sin cambios de backend**: los endpoints de creación ya derivan el `proyecto_id` del
  `securityContext` (JWT), no del body — esta capability es puramente de UX/frontend. (El hallazgo
  de `apps/almacen/src/main.ts` que sí confía en `proyecto_id` del body es un bug de seguridad
  aparte, fuera de alcance de este change.)

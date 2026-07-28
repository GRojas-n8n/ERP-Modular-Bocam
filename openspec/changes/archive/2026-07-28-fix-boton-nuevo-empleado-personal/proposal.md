## Why

En el módulo de Personal (RRHH), pestaña Empleados, el botón **"+ Nuevo
Empleado"** no tiene manejador `onClick` y no existe ningún modal o
formulario de alta individual en `PersonalView.tsx`. El usuario hace clic
y no pasa nada — no hay forma de dar de alta un empleado uno por uno desde
la UI (solo existe la carga masiva por Excel/CSV). El backend
(`POST /api/v1/personal/empleados`) ya está completo y funcional; el gap
es exclusivamente de frontend.

## What Changes

- Agregar un modal de alta individual de empleado en `PersonalView.tsx`
  con los campos que acepta `POST /api/v1/personal/empleados`:
  obligatorios (`nombre`, `apellido_paterno`, `rfc`, `puesto`,
  `salario_diario`) y opcionales (`apellido_materno`, `curp`, `nss`,
  `categoria`, `tipo_contrato`, `fecha_ingreso`, `telefono`, `email`,
  `contacto_emergencia`).
- Conectar el botón "+ Nuevo Empleado" (visible solo cuando
  `activeTab === 'empleados'`) para abrir ese modal.
- Validar en el cliente los campos obligatorios antes de enviar, y
  mostrar el error del backend (`PER_MISSING_FIELDS`, u otro) si la
  petición falla.
- Al crear con éxito, cerrar el modal, refrescar la lista de empleados y
  mostrar confirmación.

## Capabilities

### New Capabilities
- `alta-individual-empleado`: alta de un empleado desde un modal en la UI
  de Personal, consumiendo el endpoint existente
  `POST /api/v1/personal/empleados`.

### Modified Capabilities
(ninguna — el endpoint de backend no cambia, solo se conecta la UI que
faltaba)

## Impact

- **Frontend:** `apps/app-shell/src/views/PersonalView.tsx` — nuevo
  estado de modal, formulario, llamada a la API y refresco de lista.
- **Backend:** sin cambios (`apps/personal/src/main.ts:100` ya cubre el
  caso).
- **Tests:** nuevo test que reproduce el bug (botón sin acción / modal
  ausente) y prueba el flujo de alta exitosa y de validación de campos
  obligatorios.

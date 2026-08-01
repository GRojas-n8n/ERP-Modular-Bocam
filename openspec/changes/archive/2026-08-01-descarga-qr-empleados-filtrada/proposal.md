## Why

RH necesita repartir QR de credencial a grupos grandes de empleados (por ejemplo, todo un frente de trabajo o los empleados de un residente específico) sin tener que imprimir la hoja completa de credenciales (foto + reverso + HSE). Hoy el único flujo existente (`imprimir-lote`) siempre arma la hoja completa de credenciales y solo permite seleccionar empleados marcando checkboxes uno por uno en la tabla, sin poder acotar el listado por residente, cuadrilla/frente de trabajo, categoría o nombre antes de elegir.

## What Changes

- Se agrega, dentro del panel de selección de credenciales de `PersonalView`, una barra de filtros previos a la selección: por residente asignado (vigente), por cuadrilla/frente de trabajo, por categoría (`categoria` del empleado, usada como "área"), y por nombre/número de empleado (texto libre). El proyecto se toma del proyecto activo global — no se agrega selector de proyecto en esta pantalla.
- Se agrega una acción "Descargar QR" (independiente del botón existente "Imprimir credenciales") que genera una hoja PDF/imprimible con **solo** el QR + nombre + número de empleado por cada seleccionado (sin foto, sin reverso, sin datos HSE) — reutilizando el mismo token de `CredencialEmpleado` (`BOCAM:CRED:{token}`), emitiendo una credencial nueva automáticamente si el empleado no tiene una activa, igual que hace hoy `imprimir-lote`.
- El endpoint backend existente `POST /api/v1/personal/empleados/credenciales/imprimir-lote` se reutiliza sin cambios de contrato para obtener los tokens; el nuevo layout de "solo QR" se arma en el frontend a partir de la misma respuesta.
- Los filtros (residente, cuadrilla/frente, categoría) se resuelven client-side sobre los datos ya cargados en `PersonalView` (empleados, asignaciones de frente, asignaciones de residente) — no se requiere un endpoint de filtrado nuevo en el backend.

## Capabilities

### New Capabilities
(ninguna — se extiende la capability existente)

### Modified Capabilities
- `credencial-empleado`: se agrega un requirement para filtrar el listado de empleados por residente/cuadrilla-frente/categoría/nombre antes de seleccionar para impresión o descarga, y un requirement para generar una hoja de **solo QR** (sin foto/reverso) como alternativa a la hoja de credencial completa, sobre el mismo conjunto de empleados seleccionados.

## Impact

- Frontend: `apps/app-shell/src/views/PersonalView.tsx` (barra de filtros sobre `seleccionCredenciales`, nuevo botón "Descargar QR"), `apps/app-shell/src/lib/credencialesPrint.ts` (nueva función `construirHojaSoloQR` análoga a `construirHojaCredenciales`).
- Backend: `POST /api/v1/personal/empleados/credenciales/imprimir-lote` se reutiliza sin cambios de contrato. `GET /api/v1/personal/empleados` (apps/personal/src/main.ts) se extiende de forma aditiva para incluir, por empleado, su frente de trabajo activo y su residente vigente — necesarios para los filtros, y ausentes hoy del listado bulk (solo se cargaban por empleado individual).
- No hay cambios de esquema de base de datos ni eventos nuevos.

## Why

La pestaña "Estimaciones" del módulo Residente (`ResidenciaView.tsx`) no está conectada a ningún backend real en producción: la lista siempre se muestra vacía y el formulario "Nueva Estimación" no persiste nada fuera de modo demo. El Residente cree que está registrando avance/estimación y no ocurre nada. Además, los dos endpoints que deberían respaldar esta pantalla (`POST /avances`, `POST /estimaciones`) no tienen ninguna restricción de rol hoy, aunque el spec `avances-y-estimaciones` ya exige que solo roles autorizados los usen — cualquier usuario autenticado del tenant puede crearlos hoy sin importar su rol. `POST /avances` tampoco valida `precio_unitario`/`cantidad_presupuestada` contra el catálogo de conceptos real: los toma tal cual del cliente, lo cual compromete la confiabilidad de los KPIs que se calculan a partir de estimaciones (medibles, rastreables y acumulables por decisión de negocio).

## What Changes

- **Backend (`control-proyectos`)**: agregar `requireRoles('residencia', 'control_proyectos', 'control_obra', 'director', 'admin')` a `POST /api/v1/control-proyectos/avances` y `requireRoles('residencia', 'control_proyectos', 'admin')` a `POST /api/v1/control-proyectos/estimaciones` — ninguno de los dos tiene hoy control de rol.
- **Backend (`control-proyectos`)**: `POST /avances` deja de aceptar `precio_unitario`/`cantidad_presupuestada`/`clave`/`descripción`/`unidad_medida` del cliente; los resuelve consultando el catálogo de conceptos de `gerencia-tecnica` por `concepto_id`, y deriva `cantidad_anterior` sumando los avances previos del mismo concepto. **BREAKING (contrato de API)**: el body de `POST /avances` cambia de `concepto_presupuesto` (string) a `concepto_id` (UUID); ya no acepta precio/cantidad manuales.
- **Backend (`control-proyectos`)**: migración de schema — nueva columna `concepto_id` (UUID, nullable, sin backfill histórico) en `AvanceFisico`, para trazabilidad real contra el catálogo (hoy solo hay un match por string frágil).
- **Backend (`gerencia-tecnica`)**: ampliar el `select` de `GET /presupuesto/activo` para incluir `precio_unitario` y `cantidad` de cada concepto (campos que el modelo `Concepto` ya tiene).
- **Frontend (`app-shell`, `ResidenciaView.tsx`)**: reemplazar la pestaña "Estimaciones" no funcional por un flujo real de 2 pasos que sí corresponde al contrato del backend:
  - Registrar avance físico eligiendo un concepto del catálogo (`POST /avances`), sin campos editables de precio/cantidad presupuestada.
  - Crear una estimación agrupando avances propios ya `VALIDADO` (`POST /estimaciones` con `avance_ids`).
  - Listar estimaciones y avances reales (`GET /estimaciones`, `GET /avances`) en vez del arreglo fijo en `[]`.
- **BREAKING (UI)**: se elimina el formulario "Nueva Estimación" actual (campos frente/periodo/descripción) y el botón "Enviar a revisión" — ninguno de los dos corresponde a un endpoint real; `PATCH /estimaciones/:id/aprobar` ya acepta el estado `BORRADOR` directamente, así que no se necesita un paso intermedio de "enviar a revisión".
- **Frontend (`app-shell`, `ControlObraView.tsx`)**: hallazgo de la investigación de llamadores existentes (tasks 1.1) — esta vista ya tiene un formulario funcional de "Avances Físicos" que llama a `POST /avances` con el contrato viejo (`concepto_presupuesto` en texto libre, `precio_unitario`/`cantidad_presupuestada`/`cantidad_anterior` manuales). Se actualiza al mismo tiempo que `ResidenciaView` para usar el selector de concepto del catálogo, porque el cambio de contrato del backend rompe este formulario si no se actualiza junto con él.
- El nombre de rol `control_obra`, que se asumió obsoleto en la primera versión de este proposal, resultó ser un rol real todavía en uso en varios microservicios (`personal`, `contabilidad`, `almacen`, `gerencia-tecnica`, `compras`) y en el propio menú de `app-shell` (`Layout.tsx:126-127`) — se conserva como rol válido junto a `control_proyectos`, no se corrige/elimina.

## Capabilities

### New Capabilities
- `estimaciones-avance-fisico-residente`: pantalla del Residente (app-shell) para registrar avance físico por concepto y crear estimaciones agrupando sus propios avances validados, sustituyendo el formulario no funcional actual.
- `avance-fisico-control-obra`: formulario de Avances Físicos de `ControlObraView` (app-shell) usando el mismo selector de concepto del catálogo, sin precio/cantidad manuales.

### Modified Capabilities
- `avances-y-estimaciones`: el requirement "Registro de avance físico por concepto" pasa de "usuario autorizado"/rol implícito a exigir explícitamente `requireRoles('residencia', 'control_proyectos', 'control_obra', 'director', 'admin')`, resolver `concepto_id`/`precio_unitario`/`cantidad_presupuestada` contra el catálogo de `gerencia-tecnica` en vez de aceptarlos del cliente, y derivar `cantidad_anterior` server-side. El requirement "Estimación de facturación agrupando avances validados" pasa a exigir explícitamente `requireRoles('residencia', 'control_proyectos', 'admin')`.

## Impact

- `apps/control-proyectos/src/main.ts` — endpoints `POST /avances` (línea ~606) y `POST /estimaciones` (línea ~785).
- `apps/control-proyectos/prisma/schema.prisma` — nueva columna `concepto_id` en `AvanceFisico` + migración.
- `apps/gerencia-tecnica/src/main.ts` — `GET /presupuesto/activo` (línea ~227-259), ampliar `select` de conceptos.
- `apps/app-shell/src/views/ResidenciaView.tsx` — pestaña Estimaciones: carga inicial (línea ~486), `handleSubmitEstimacion` (línea ~677), `handleEnviarRevision` (línea ~704) y el bloque JSX del formulario/tabla (líneas ~1365-1456, ~1783-1829).
- `apps/app-shell/src/views/ControlObraView.tsx` — formulario de Avances Físicos: `handleSubmitAvance` (línea ~528-550) y el campo de texto libre de concepto (línea ~1417).
- `openspec/specs/avances-y-estimaciones/spec.md` — delta de requirements.
- Tests nuevos en `apps/control-proyectos` (rol requerido en ambos POST, resolución del concepto contra el catálogo, derivación de `cantidad_anterior`), `apps/gerencia-tecnica` (nuevo campo en el `select`) y `apps/app-shell` (flujo de captura real en ambas vistas, ausencia del formulario/botón viejos en Residente).
- No afecta a `finanzas`/`contabilidad`: los eventos `control_obra.avance_fisico_validado` y `control_obra.estimacion_aprobada` no cambian de nombre ni payload.
- `apps/app-shell/src/views/ControlObraView.presupuesto-partida.test.tsx` ya existe como test de esa vista — revisar si cubre el formulario de Avances Físicos y si queda roto por el cambio de contrato.

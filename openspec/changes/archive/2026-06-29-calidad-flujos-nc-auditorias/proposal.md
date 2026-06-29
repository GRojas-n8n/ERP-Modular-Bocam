## Why

El módulo de calidad tiene el schema de No Conformidades y Auditorías Internas ya creado, pero los flujos de trabajo ISO 9001:2015 no están completos: el backend acepta cualquier transición de estado sin validar las precondiciones que exige la norma, falta el endpoint para cambiar estado de auditorías y hallazgos, no existe el puente hallazgo→NC, y el frontend no expone causa raíz, acciones correctivas ni botones de workflow. El dashboard tampoco alerta sobre vencimientos.

## What Changes

- **Validaciones de transición NC**: el endpoint `PATCH /calidad/no-conformidades/:id` aplica la máquina de estados ISO (ABIERTA→EN_ANALISIS→ACCION_CORRECTIVA→EN_VERIFICACION→CERRADA) con precondiciones en cada transición.
- **Campo `verificado_por` + `fecha_verificacion`** en `AccionCorrectiva`: permite registrar quién y cuándo verificó la eficacia de la acción.
- **Campo `nc_id`** en `HallazgoAuditoria`: traza la NC generada desde un hallazgo.
- **Nuevo endpoint `PATCH /calidad/auditorias/:id`**: transiciones de estado PROGRAMADA→EN_CURSO→COMPLETADA.
- **Nuevo endpoint `PATCH /calidad/auditorias/:id/hallazgos/:hid`**: actualiza estado de hallazgo (ABIERTO→EN_SEGUIMIENTO→CERRADO) y campo `evidencia`.
- **Nuevo endpoint `POST /calidad/auditorias/:id/hallazgos/:hid/crear-nc`**: convierte un hallazgo en NoConformidad, guarda el `nc_id` en el hallazgo.
- **Dashboard ampliado**: `GET /calidad/dashboard` incluye NCs vencidas, acciones vencidas, hallazgos MAYOR sin NC, auditorías en curso.
- **Frontend NC detail**: sección de causa raíz editable, sección de acciones correctivas (ver + agregar + cambiar estado), indicador visual de vencimiento.
- **Frontend Auditoría detail**: botones de cambio de estado de auditoría, estado editable por hallazgo, botón "Convertir a NC" en hallazgos MAYOR.

## Capabilities

### New Capabilities

- `workflow-nc`: Máquina de estados validada para NoConformidad con precondiciones ISO 9001 § 10.2 en cada transición.
- `workflow-auditoria`: Transiciones de estado para AuditoriaInterna y Hallazgos, con endpoint de cierre de hallazgo.
- `hallazgo-a-nc`: Conversión de HallazgoAuditoria en NoConformidad con trazabilidad bidireccional (`nc_id` en hallazgo).
- `dashboard-calidad`: KPIs de vencimiento y alertas ISO — NCs vencidas, acciones vencidas, hallazgos MAYOR pendientes, auditorías en curso.
- `calidad-view-workflows`: Completar `CalidadView.tsx` — NC detail con causa raíz + acciones, Auditoría detail con workflow y conversión hallazgo→NC.

### Modified Capabilities

- `no-conformidades`: El endpoint PATCH ahora valida transiciones y precondiciones. `AccionCorrectiva` agrega campos `verificado_por` y `fecha_verificacion`.

## Impact

- **`apps/calidad/prisma/schema.prisma`**: 2 campos nuevos en modelos existentes + migración.
- **`apps/calidad/src/main.ts`**: validaciones en PATCH NC, 3 endpoints nuevos (PATCH auditoria, PATCH hallazgo, POST crear-nc), dashboard ampliado.
- **`apps/app-shell/src/views/CalidadView.tsx`**: secciones nuevas en NC detail y Auditoría detail (~200 líneas adicionales).
- **Sin nuevas dependencias** — todo usa Prisma + Express existentes.
- **Tests**: 2 archivos de integración nuevos (workflow NC + conversión hallazgo→NC).

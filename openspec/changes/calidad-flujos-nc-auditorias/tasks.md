## 1. Schema — campos nuevos en modelos existentes

- [ ] 1.1 Agregar `nc_id String? @db.Uuid` al modelo `HallazgoAuditoria` en `apps/calidad/prisma/schema.prisma`
- [ ] 1.2 Agregar `verificado_por String? @db.Uuid` y `fecha_verificacion DateTime?` al modelo `AccionCorrectiva` en el mismo schema
- [ ] 1.3 Generar y ejecutar migración Prisma (`prisma migrate dev --name nc-auditoria-workflow-fields`)

## 2. Workflow NC — validaciones de transición en backend

- [ ] 2.1 Extraer función `validarTransicionNC(estadoActual, estadoNuevo, acciones, rol)` en `apps/calidad/src/main.ts` que retorna `{ ok: true } | { ok: false, codigo: string }` según las precondiciones ISO
- [ ] 2.2 Actualizar `PATCH /api/v1/calidad/no-conformidades/:id` para llamar `validarTransicionNC` antes de persistir; retornar 422 con el código de error si falla
- [ ] 2.3 Agregar soporte a `reabrir: true` en el body del PATCH (solo rol `admin`) para forzar regreso a `ABIERTA` limpiando `fecha_cierre`
- [ ] 2.4 Actualizar `PATCH /api/v1/calidad/no-conformidades/:id/acciones/:aid` para poblar `verificado_por` y `fecha_verificacion` automáticamente cuando `estado = "VERIFICADA"`

## 3. Endpoints nuevos de auditoría

- [ ] 3.1 Implementar `PATCH /api/v1/calidad/auditorias/:id` con máquina de estados (PROGRAMADA→EN_CURSO→COMPLETADA, cualquier→CANCELADA solo admin) y campo `observaciones` opcional
- [ ] 3.2 Implementar `PATCH /api/v1/calidad/auditorias/:id/hallazgos/:hid` que actualiza `estado` y `evidencia` del hallazgo, validando que el `hid` pertenezca a la auditoría `id`
- [ ] 3.3 Implementar `POST /api/v1/calidad/auditorias/:id/hallazgos/:hid/crear-nc` que crea `NoConformidad` con `fuente="AUDITORIA"`, guarda `nc_id` en el hallazgo e implementa idempotencia (409 si ya existe)

## 4. Dashboard ampliado

- [ ] 4.1 Actualizar `GET /api/v1/calidad/dashboard` para agregar con `Promise.all`: `ncs_vencidas`, `acciones_vencidas`, `hallazgos_mayor_sin_nc`, `auditorias_en_curso`, `auditorias_programadas`
- [ ] 4.2 Agregar lógica de `alertas` al dashboard: construir array con ítems `NC_VENCIDA` y `HALLAZGO_MAYOR_SIN_NC` cuando sus contadores sean > 0

## 5. Tests de integración

- [ ] 5.1 Crear `apps/calidad/test/integration/workflow-nc.integration.test.ts` con tests para: transición libre, transición bloqueada por precondición, cierre exitoso con verificacion, reapertura solo admin
- [ ] 5.2 Crear `apps/calidad/test/integration/hallazgo-a-nc.integration.test.ts` con tests para: conversión exitosa, idempotencia (segunda llamada retorna 409), hallazgo no encontrado

## 6. Frontend — NC detail con causa raíz y acciones

- [ ] 6.1 Agregar sección "Causa Raíz" en el SlidePanel de NC en `CalidadView.tsx`: textarea con valor actual, botón "Editar/Guardar" que llama PATCH con `{ causa_raiz }`
- [ ] 6.2 Agregar sección "Acciones Correctivas" en el mismo panel: lista de acciones con badge de estado coloreado, descripción y fecha compromiso
- [ ] 6.3 Agregar formulario inline "+ Agregar acción" en la sección de acciones: campos descripción, responsable, fecha compromiso; llama POST `/acciones`
- [ ] 6.4 Hacer badge de estado de cada acción clicable: selector de estado (PENDIENTE→EN_PROCESO→COMPLETADA→VERIFICADA) que llama PATCH `/acciones/:aid`
- [ ] 6.5 Agregar indicador visual de vencimiento en header del detail: badge rojo "VENCIDA" si `fecha_limite < hoy && estado ≠ CERRADA`
- [ ] 6.6 Deshabilitar botones de transición de NC con tooltip cuando precondición no cumplida (ej. botón "EN_VERIFICACION" disabled si no hay acciones COMPLETADAS, con title explicativo)

## 7. Frontend — Auditoría detail con workflow y hallazgo→NC

- [ ] 7.1 Agregar botones de cambio de estado en el SlidePanel de auditoría: "Iniciar" (PROGRAMADA→EN_CURSO), "Completar" (EN_CURSO→COMPLETADA), cada uno llama PATCH `/auditorias/:id`
- [ ] 7.2 Hacer badge de estado de cada hallazgo clicable: selector (ABIERTO, EN_SEGUIMIENTO, CERRADO) que llama PATCH `/auditorias/:id/hallazgos/:hid`
- [ ] 7.3 Agregar botón "→ Crear NC" en hallazgos con `nc_id = null`: llama POST `.../crear-nc`; reemplaza el botón por badge con código de NC tras éxito
- [ ] 7.4 Mostrar badge "NC: NC-XXXX" con acción de navegar al tab NCs cuando hallazgo tiene `nc_id` asignado

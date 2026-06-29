## Context

El módulo calidad (puerto 3009) tiene schema completo para NC, AccionCorrectiva, AuditoriaInterna y HallazgoAuditoria. El CRUD básico existe. El `PATCH /no-conformidades/:id` acepta cualquier `estado` sin validar precondiciones. No existe `PATCH /auditorias/:id` ni `PATCH /auditorias/:id/hallazgos/:hid`. `CalidadView.tsx` (1193 líneas) tiene listas y creación pero el panel de detalle NC no muestra acciones correctivas ni causa raíz editable. El panel de auditoría no tiene botones de workflow.

## Goals / Non-Goals

**Goals:**
- Máquina de estados validada en PATCH NC con precondiciones por transición.
- 3 endpoints nuevos: PATCH auditoría, PATCH hallazgo, POST hallazgo→NC.
- Migración Prisma: `nc_id` en HallazgoAuditoria, `verificado_por`+`fecha_verificacion` en AccionCorrectiva.
- Dashboard con 4 KPIs adicionales de vencimiento/alerta.
- Frontend NC detail completo (causa raíz + acciones con estados).
- Frontend Auditoría detail completo (workflow + hallazgo→NC).

**Non-Goals:**
- Notificaciones por correo o push al vencer una NC.
- Informe formal de auditoría (PDF/Word).
- Módulo de revisión por la dirección (ISO 9001 § 9.3) — change separado.
- Cambios al workflow de documentos del SGC.

## Decisions

### D1 — Máquina de estados en el backend, no en el frontend

**Decisión:** El PATCH NC valida la transición en el servidor. El cliente solo envía `{ estado: "EN_ANALISIS" }` y el servidor rechaza con 422 si no se cumplen las precondiciones.

**Precondiciones por transición:**
```
ABIERTA → EN_ANALISIS        : sin precondición (libre)
EN_ANALISIS → ACCION_CORRECTIVA : require causa_raiz en body o ya existente en BD
ACCION_CORRECTIVA → EN_VERIFICACION : require ≥1 AccionCorrectiva.estado = COMPLETADA
EN_VERIFICACION → CERRADA    : require ≥1 AccionCorrectiva.estado = VERIFICADA
* → ABIERTA (reabrir)        : solo rol admin; NC pasa a ABIERTA con nota
```

**Rationale:** Centralizar la lógica en el server garantiza que la norma se cumpla independientemente del cliente (API directa, móvil, etc.).

---

### D2 — Campo `nc_id` en HallazgoAuditoria es nullable, sin FK constraint rígida

**Decisión:** `nc_id String? @db.Uuid` — almacena el UUID de la NC generada pero sin FK Prisma (los modelos viven en la misma BD de calidad, pero la relación es débil para simplificar).

**Rationale:** Evita cascadas no deseadas si se elimina la NC. El frontend verifica `nc_id != null` para mostrar el enlace a la NC. Si en el futuro se necesita integridad referencial se agrega la FK en una migración separada.

---

### D3 — Conversión hallazgo→NC es idempotente

**Decisión:** `POST /auditorias/:id/hallazgos/:hid/crear-nc` verifica si `hallazgo.nc_id` ya existe. Si ya tiene NC asociada, retorna 409 con el id_nc existente (no crea duplicado).

**Rationale:** El auditor puede hacer doble clic o reintentar. La idempotencia evita NCs duplicadas.

---

### D4 — Dashboard usa consultas paralelas con `Promise.all`

**Decisión:** Los 4 KPIs nuevos del dashboard (NCs vencidas, acciones vencidas, hallazgos MAYOR sin NC, auditorías en curso) se calculan con `Promise.all` de 4 `prisma.count()` para minimizar latencia.

**Rationale:** Cada count es O(índice). Con los índices existentes (`tenant_id, estado`) son queries rápidas. No se necesita SQL raw.

---

### D5 — Frontend: NC detail amplía el SlidePanel existente sin refactorizar

**Decisión:** El panel de detalle de NC ya existe en `NoConformidadesView`. Se agregan dos secciones colapsables dentro del mismo SlidePanel: "Causa Raíz" (textarea + botón guardar) y "Acciones Correctivas" (lista + formulario inline + botones de estado por acción).

**Rationale:** Respetar el patrón visual existente. Refactorizar el SlidePanel en componentes separados queda fuera de scope.

## Risks / Trade-offs

**[Riesgo] NC en estado intermedio bloquea al usuario** → Mitigation: El endpoint acepta `reabrir: true` en el body (solo admin) para forzar regreso a ABIERTA con nota de auditoría.

**[Riesgo] Hallazgo convertido a NC pero NC luego eliminada** → Mitigation: `nc_id` es nullable sin FK. Si la NC se elimina (no hay endpoint de delete NC actualmente), el campo queda huérfano pero no rompe nada. Se verifica en frontend con `nc_id != null`.

**[Trade-off] Sin notificaciones de vencimiento** → El dashboard muestra las alertas pero no envía email/push. Aceptado para esta iteración.

## Migration Plan

1. Migración Prisma: agregar `nc_id?` a `hallazgos_auditoria` y `verificado_por?`+`fecha_verificacion?` a `acciones_correctivas`.
2. Deploy del servicio calidad con lógica nueva (backward compatible — nuevos campos son opcionales).
3. Verificar en producción que NCs existentes siguen funcionando (ningún estado se invalida retroactivamente).
4. **Rollback**: Los campos nuevos son opcionales. Revertir el deploy sin migración rollback funciona; la migración de campos nullable no requiere rollback de datos.

## Open Questions

- ¿Quién puede verificar una AccionCorrectiva? ¿Solo el `responsable_id` de la NC o cualquier rol `calidad`/`admin`? → **Decisión: cualquier rol calidad/admin** por simplicidad. Se puede restringir en iteración futura.
- ¿Los hallazgos MENOR/OBSERVACION pueden convertirse en NC? → **Decisión: cualquier tipo de hallazgo puede generar NC** — el sistema no restringe, es decisión del auditor.

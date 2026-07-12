## Context

`control-obra` (puerto 3005, 4 modelos: `BitacoraObra`, `AvanceFisico`,
`MaterialConsumidoObra`, `Estimacion`) y `control-proyectos` (puerto 3013, 3
modelos: `ProgramacionObra`, `AlertaProyecto`, `ProyeccionCierre`) son hoy
microservicios y bases de datos separados (`bocam_control_obra` /
`bocam_control_proyectos`), pero el acoplamiento real entre ambos ya es
mínimo:

- La única integración es asíncrona: `control-proyectos` se suscribe a
  `control_obra.avance_fisico_validado` (`apps/control-proyectos/src/main.ts:652-697`)
  para recalcular CPI/SPI/EAC de `ProgramacionObra` — no hay llamadas HTTP
  entre los dos servicios, no hay FK cruzada.
- El frontend ya los trata como un solo módulo: un único ítem de
  navegación "Control de Obra" (`Layout.tsx:125-139`) con 9 sub-tabs, y un
  único componente real (`ControlObraView.tsx`, 1471 líneas) que llama a
  las APIs de ambos backends en la misma pantalla.
  `ControlProyectosView.tsx` (598 líneas) existe pero es inalcanzable desde
  cualquier ruta de navegación — código muerto.
- `finanzas` y `contabilidad` consumen 2 eventos de `control-obra`
  (`estimacion_aprobada`, `avance_fisico_validado`) por RabbitMQ — no
  tienen ninguna dependencia HTTP ni de base de datos.
- `gerencia-tecnica` (trazabilidad/triángulo) y `asistente` (2 tools) hacen
  llamadas HTTP fail-soft/directas a rutas específicas de
  `/api/v1/control-obra/*`.
- `control-obra` nunca tuvo `rls-policies.sql` aplicado en producción
  (mismo hallazgo que compras/gerencia-tecnica/auth/finanzas, ver
  `openspec/changes/fix-rls-bypass-bocam-admin/`), y `control-proyectos`
  está listado en ese mismo change como "sin políticas, solo cambio de
  rol" — pendiente de verificar si eso sigue siendo cierto tras la fusión.

Contexto completo de la investigación (eventos, consumidores, specs
existentes) documentado en la conversación que originó este change; los
hallazgos clave se citan en las Decisiones de abajo.

## Goals / Non-Goals

**Goals:**
- Un solo microservicio, una sola base de datos, un solo puerto para todo
  lo que hoy vive en `control-obra` + `control-proyectos`.
- Cero cambios de comportamiento observable para `finanzas` y
  `contabilidad` (mismos nombres de evento, mismo payload).
- Cero pérdida de datos históricos (bitácoras, avances, estimaciones,
  materiales consumidos).
- RLS real aplicado sobre las 7 tablas del schema fusionado, cerrando de
  raíz el hallazgo de seguridad pendiente en `control-obra`.
- Frontend, `asistente` y `gerencia-tecnica` actualizados para apuntar al
  backend fusionado sin romper ninguna de las pantallas/tools que hoy
  funcionan.

**Non-Goals:**
- No se rediseña el modelo de datos de EVM/Curva S ni el algoritmo de
  cálculo de alertas predictivas — se mueve tal cual.
- No se agregan capacidades nuevas de negocio (esto es consolidación, no
  una feature).
- No se toca el contrato de los 2 eventos con consumidores externos
  (`finanzas`, `contabilidad`) más allá de qué proceso los publica.
- No se decide en este change qué pasa con los otros 5 módulos pendientes
  de `fix-rls-bypass-bocam-admin` (`personal`, `seguridad`, `calidad`,
  `ventas`, y el resto) — siguen su propio curso.

## Decisions

### 1. Servicio destino: `control-proyectos` absorbe a `control-obra` (no al revés)

`control-proyectos` es el nombre que el negocio quiere que sobreviva
(instrucción explícita del usuario: "solo debe existir el módulo de
Control de Proyectos"). Técnicamente también es la opción de menor
esfuerzo: `control-proyectos` es el consumidor de eventos (más fácil
convertir un `subscribe` en llamada de función que al revés), y ya no
tiene ninguna llamada HTTP saliente que reapuntar.

### 2. Prefijo de rutas: todo bajo `/api/v1/control-proyectos/*`, con alias temporal

Los 17 endpoints de `control-obra` se mueven literalmente (mismo path
suffix, mismo método, mismo handler) bajo el nuevo prefijo. Ejemplo:
`GET /api/v1/control-obra/bitacoras` → `GET /api/v1/control-proyectos/bitacoras`.

**Alternativa considerada y descartada**: mantener `/api/v1/control-obra/*`
intacto dentro del proceso fusionado (evita tocar los 6 archivos
consumidores). Se descarta porque el nombre `control-obra` no debe seguir
apareciendo en ningún contrato público — es exactamente lo que el negocio
pidió eliminar — y porque los 6 archivos a tocar están todos en este mismo
repo, bajo control directo (no hay terceros externos consumiendo la API).

**Mitigación de riesgo de corte**: durante el rollout (ver Migration Plan),
el servicio fusionado expone temporalmente AMBOS prefijos
(`/api/v1/control-obra/*` como alias 307/redirect interno hacia el handler
de `/api/v1/control-proyectos/*`) durante una sola sesión de despliegue,
hasta confirmar que los 6 consumidores ya actualizados funcionan en
producción. El alias se retira en la tarea de cierre del change — no queda
como deuda técnica permanente.

### 3. Los 3 endpoints de dashboard NO se fusionan en uno solo

`control-obra` expone `dashboard`, `resumen-dashboard` y
`dashboard/residente`; `control-proyectos` expone su propio `dashboard`
(EVM). Los 4 quedan como 4 endpoints distintos bajo el nuevo prefijo
(`dashboard-obra`, `resumen-dashboard`, `dashboard/residente`, `dashboard`
para EVM) — **no** se intenta unificarlos en una sola respuesta en este
change. Motivo: `endpoint-dashboard-control-obra/spec.md` documenta un
contrato de respuesta específico (semáforo WBS, B2B fail-soft a Finanzas)
que varios consumidores (`DashboardView.tsx`, `ResidenciaView.tsx`,
`asistente`) ya dependen tal cual; cambiar el shape es un rediseño de
producto, fuera de alcance de una consolidación de infraestructura.
`GET /api/v1/control-obra/dashboard` (el documentado en el spec) se
renombra a `GET /api/v1/control-proyectos/dashboard-obra` para no chocar
con el `dashboard` EVM ya existente de `control-proyectos`.

### 4. Recálculo EVM: de evento interno a llamada de función directa

El handler que hoy corre en `control-proyectos/src/main.ts:652-697` al
recibir `control_obra.avance_fisico_validado` se convierte en una función
(`recalcularEVMPorAvanceValidado(...)`) invocada directamente desde el
mismo handler HTTP que valida un avance (`PATCH .../avances/:id/validar`),
en la misma transacción Prisma. Se sigue **publicando** el evento
`control_obra.avance_fisico_validado` hacia RabbitMQ después de confirmar
la transacción (para no romper a `finanzas`/`contabilidad`), pero ya no se
**re-consume** internamente — evita una vuelta redundante por la cola
dentro del mismo proceso.

### 5. Migración de datos: dump/restore de las 4 tablas, tal cual

Se migran las 4 tablas de `bocam_control_obra` a `bocam_control_proyectos`
manteniendo nombre de tabla (`bitacoras_obra`, `avances_fisicos`,
`materiales_consumidos_obra`, `estimaciones`), columnas y UUIDs
idénticos — `pg_dump --data-only --table=<tabla>` desde `bocam_control_obra`
seguido de `psql < dump` contra `bocam_control_proyectos` (después de crear
las tablas ahí vía el schema.prisma fusionado). Se mantiene
`bocam_control_obra` intacta (sin dropear) como backup de solo lectura
durante al menos 7 días después del corte, antes de decidir su eliminación
final en una tarea separada fuera de este change.

**Riesgo de FK cruzada**: `AvanceFisico.estimacion_id` referencia
`Estimacion.id_estimacion` dentro de la misma base — se preserva sin
cambios porque ambas tablas migran juntas al mismo destino.

### 6. RLS: aplicar sobre las 7 tablas fusionadas, reemplaza tareas 3.4 y 4.3

Se genera un solo `rls-policies.sql` para `control-proyectos` cubriendo los
3 modelos preexistentes (`ProgramacionObra`, `AlertaProyecto`,
`ProyeccionCierre` — todos con `tenant_id`+`proyecto_id`) y los 4 nuevos
(mismo patrón que `apps/finanzas/prisma/rls-policies.sql` ya corregido:
verificar primero el schema real en prod antes de asumir el prefijo del
comentario del archivo, auditar el código real de
`apps/control-proyectos/src/main.ts` para detectar UPDATE/DELETE antes de
omitir políticas). Esto reemplaza la tarea 3.4
(`control-obra`, ya no existirá como servicio) y dejará obsoleta la tarea
4.3 (`control-proyectos` "sin políticas") de
`openspec/changes/fix-rls-bypass-bocam-admin/tasks.md`, que se actualiza
para apuntar a este change en vez de listarse como pendiente aparte.

### 7. Limpieza de frontend: eliminar código muerto, no solo repuntar

Se elimina `ControlProyectosView.tsx` y el case `'control-proyectos'` en
`App.tsx` (confirmado sin ninguna ruta de navegación que lo alcance) en vez
de dejarlos como código muerto adicional. `ControlObraView.tsx` conserva su
nombre de archivo/componente en este change (renombrarlo es un cambio
cosmético de bajo valor que puede hacerse aparte) pero todas sus llamadas a
`/api/v1/control-obra/*` y `/api/v1/control-proyectos/*` se consolidan
contra el nuevo prefijo único.

## Risks / Trade-offs

- **[Riesgo] Downtime o inconsistencia durante la ventana de migración de
  datos** (avances/estimaciones creados en `control-obra` justo antes del
  corte no aparecen en `control-proyectos`) → Mitigación: ventana de
  mantenimiento corta explícita (ver Migration Plan), congelar escrituras
  en `control-obra` (draining) antes del dump final, verificar conteo de
  filas antes/después por tabla.
- **[Riesgo] Los 6 consumidores externos (asistente x2, app-shell x2,
  gerencia-tecnica, y el propio `ControlObraView.tsx`) se actualizan mal y
  quedan apuntando a rutas que ya no existen** → Mitigación: alias temporal
  de rutas (Decisión 2) + checklist explícito de los 6 archivos en
  `tasks.md` + smoke test de cada uno contra producción antes de retirar el
  alias.
- **[Riesgo] `gerencia-tecnica` usa `CONTROL_OBRA_URL` con default
  `http://localhost:3005` cuando la env var no está seteada en el compose
  del VPS** (hallazgo de la investigación: `docker-compose.vps.yml` no
  define `CONTROL_OBRA_URL` para `gerencia-tecnica`, solo para `asistente`)
  → esto significa que `trazabilidad/triangulo` probablemente ya está
  fallando en fail-soft (`parcial: true`) en producción HOY, antes de este
  change. Mitigación: aprovechar este change para agregar
  `CONTROL_PROYECTOS_URL` explícito al compose de `gerencia-tecnica` y
  verificar que el B2B deja de estar en modo `parcial`.
- **[Riesgo] `estimacion_creada` y `bitacora_firmada` sin consumidores
  hoy, pero podría haber un consumidor externo no descubierto** (ej. un
  script de reporting fuera del repo) → Mitigación: se dejan de publicar
  solo después de confirmar en logs de RabbitMQ de producción (`rabbitmqctl
  list_bindings` o UI de management) que no hay colas activas ligadas a
  esas routing keys antes del corte.
- **[Trade-off] El alias temporal de rutas (Decisión 2) agrega código que
  se retira en la misma sesión de despliegue** — complejidad extra
  aceptada a cambio de una migración sin ventana de error dura si algún
  consumidor no se actualizó a tiempo.

## Migration Plan

1. Implementar el merge de schema + endpoints + RLS en `control-proyectos`
   en una rama, sin tocar producción todavía (tasks 1-2).
2. Actualizar los 6 consumidores externos en la misma rama, apuntando al
   nuevo prefijo (tasks 3).
3. Desplegar `control-proyectos` fusionado a producción con el alias
   temporal activo (Decisión 2) — `control-obra` sigue corriendo en
   paralelo, sin recibir escrituras nuevas todavía.
4. Ventana de corte: pausar escrituras en `control-obra` (feature flag o
   simplemente anunciar la ventana), dump final de las 4 tablas, restore en
   `control-proyectos`, verificar conteos.
5. Apagar el contenedor `bocam-vps-control-obra`, dejar la base
   `bocam_control_obra` intacta como backup.
6. Smoke test de los 6 consumidores + las 4 vistas de frontend contra
   producción real.
7. Retirar el alias temporal de rutas.
8. Actualizar `openspec/changes/fix-rls-bypass-bocam-admin/tasks.md`
   (tareas 3.4 y 4.3) para reflejar que quedaron resueltas por este change.
9. **Rollback**: si algo falla después del paso 5, `bocam_control_obra` y
   el `Dockerfile`/imagen de `control-obra` siguen intactos — se puede
   revertir el `.env`/compose y volver a levantar el contenedor viejo sin
   pérdida de datos, siempre que el rollback ocurra antes de que
   `control-proyectos` fusionado reciba escrituras nuevas post-corte (si ya
   las recibió, hay que reconciliar manualmente esas filas nuevas hacia
   `control-obra` antes de revertir — caso a evitar minimizando la ventana
   entre pasos 4 y 6).

### 8. Retrofit: todo el código preexistente de `control-proyectos` pasa a usar `createTenantContext`

Hallazgo durante la implementación (tarea 2): `apps/control-proyectos/src/main.ts`
ya define `createTenantContext` en `db.ts` (idéntico al patrón de los demás
módulos, hace `set_config('app.current_tenant_id'/'app.current_proyecto_id'/
'app.current_user_id', ...)` dentro de una transacción), pero **ningún**
endpoint ni suscriptor existente lo usa — todos llaman a `basePrisma`
directo y filtran `tenant_id`/`proyecto_id` explícitamente en el `where` de
cada query, sin depender de RLS. Hoy es inofensivo porque
`control-proyectos` no tiene RLS activo. La Decisión 6 de este mismo
documento planea activar RLS real sobre las 7 tablas fusionadas — si eso se
hace sin retrofitear el código existente, cada endpoint/suscriptor de
`control-proyectos` (dashboard, EVM, curva-S, proyección de flujo,
programación, alertas, y los 3 suscriptores de eventos:
`control_obra.avance_fisico_validado`, `gerencia_tecnica.partida_bloqueada`,
`gerencia_tecnica.transferencia_partida_aprobada`) dejaría de ver ninguna
fila bajo `FORCE ROW LEVEL SECURITY`, porque la sesión nunca tiene seteada
`app.current_tenant_id`/`app.current_proyecto_id` — fallo silencioso (0
filas, sin error), exactamente el Riesgo 1 ya documentado arriba pero
aplicado a código que hoy funciona.

**Decisión**: envolver TODAS las queries preexistentes de
`control-proyectos` (no solo las movidas de `control-obra`) en
`createTenantContext` como parte de la tarea 2 de este change, antes de
activar RLS en la tarea 3. Se agrega como tarea 2.10 en `tasks.md`. Esto
amplía el alcance original ("mover código de control-obra tal cual") para
incluir retrofitear el código ya existente de `control-proyectos` — necesario
para que la Decisión 6 (RLS real sobre las 7 tablas) sea segura de aplicar.

## Open Questions

- ¿Se necesita un aviso a los usuarios (residentes, superintendentes) sobre
  la ventana de mantenimiento, o el corte puede hacerse fuera de horario
  laboral de Bocam sin aviso formal?
- ¿`bocam_control_obra` se dropea a los 7 días automáticamente o requiere
  aprobación manual explícita? (este change no lo decide, solo dejarla
  intacta — la decisión de borrado final queda para una tarea/change
  separado).

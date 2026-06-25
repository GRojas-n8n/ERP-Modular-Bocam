## Context

El módulo `compras` gestiona el ciclo completo de requisición → cuadro comparativo → OC. El cuadro comparativo (`CuadroComparativo`) ya tiene estado machine y un componente frontend `ComparativaDetail.tsx` (2,148 líneas). La evaluación técnica del Residente existe pero tiene tres defectos: (1) el Residente ve los precios, (2) no hay espacio para capturar specs en la req, y (3) el bloqueo no tiene auditoría ni es exclusivo del admin.

El schema de `compras` incluye: `requisiciones_compras`, `req_detalles`, `cuadros_comparativos`, `comparativa_detalles`, `comparativa_lineas`. Las migraciones están en producción.

## Goals / Non-Goals

**Goals:**
- Capturar especificaciones técnicas por renglón durante la creación de la requisición
- Renderizar la vista del cuadro comparativo diferenciada por rol: Compras ve precios, Residente no
- Implementar el comportamiento "?" → pregunta en renglón → nueva revisión del cuadro
- Agregar sección de veredicto general + sugerencia de proveedor al pie del cuadro antes de la firma
- Implementar estado `FIRMADO_BLOQUEADO` + desbloqueo exclusivo por admin con tabla de auditoría
- Dar acceso al Residente a sus cuadros pendientes de evaluación desde `ResidenciaView`

**Non-Goals:**
- Base de datos de materiales con especificaciones predefinidas (versión futura)
- Modificar el flujo GT ni la generación de OC
- Cambiar el sistema de alertas de cotización pendiente (ya funciona)
- Portal externo para proveedores

## Decisions

### D1 — Especificaciones en `req_detalles` vs. tabla nueva

**Decisión:** Agregar campos `especificacion_marca_modelo` (VarChar 200, nullable) y `especificacion_detalle` (Text, nullable) directamente a `req_detalles`.

**Alternativa descartada:** Nueva tabla `req_linea_especificaciones` con relación 1:N.

**Razón:** Las specs son 1:1 por renglón en esta versión. Añadir una tabla nueva crea join innecesario. Si la versión futura requiere múltiples specs estructuradas por renglón, se puede migrar. El costo de la migración futura es bajo comparado con la complejidad que añadiría hoy.

---

### D2 — Vista diferenciada del cuadro: prop `modo` vs. componente separado

**Decisión:** Agregar una prop `modo: 'compras' | 'residente'` a `ComparativaDetail`. En modo `residente`: columnas de precio ocultas, totales ocultos, ganador oculto, tabla simplificada con una columna de evaluación por proveedor que muestra solo "lo que el proveedor ofrece" (especificación técnica, no precio).

**Alternativa descartada:** Componente `ComparativaDetailResidente` separado.

**Razón:** El componente comparte mucha lógica (estado machine, fichas técnicas, firma). Duplicar el componente crea deuda de mantenimiento. Una prop de modo es el patrón estándar del codebase.

**Cómo ocultar precios en el backend:** El endpoint `GET /comparativas/:id` devolverá los precios siempre (Compras los necesita), pero el frontend simplemente no los renderizará en modo `residente`. No se necesita cambio de backend para ocultar precios — es responsabilidad del frontend presentar la información correcta según el rol. Esta decisión se basa en que el backend ya valida roles y el JWT siempre viaja con el rol.

---

### D3 — Comportamiento del "?" y nueva revisión

**Decisión:** Cuando el Residente guarda una evaluación con al menos un renglón marcado "?" junto con su texto de pregunta, se llama un nuevo endpoint `POST /comparativas/:id/revision-con-preguntas`. Este endpoint:
1. Guarda las evaluaciones parciales (C/NC/DA/? por renglón con preguntas)
2. Crea una nueva revisión del cuadro (copia el cuadro con `revision` incrementado, `estado: 'BORRADOR'`, `revision_padre_id` apuntando al original)
3. Transiciona el cuadro original a estado `REVISION_SOLICITADA` (nuevo estado)

**Compras** ve los renglones con "?" y sus preguntas, responde en la columna de esa partida (nuevo campo `respuesta_proveedor` en `comparativa_detalles`), y re-envía a evaluación.

**Alternativa descartada:** Usar el mecanismo de `aclaraciones` ya existente.

**Razón:** El mecanismo de aclaraciones actual es por celda (insumo × proveedor). El nuevo comportamiento es por renglón completo y genera una revisión formal del documento. Son semánticas distintas.

---

### D4 — Estado `FIRMADO_BLOQUEADO` vs. campo booleano `bloqueado`

**Decisión:** Agregar `FIRMADO_BLOQUEADO` como nuevo valor válido del estado del cuadro (no un campo booleano separado).

**Razón:** El estado machine actual controla permisos y UI por estado. Añadir `FIRMADO_BLOQUEADO` como estado es consistente con ese patrón y permite que `requireRoles` y la lógica de renderizado existentes apliquen sin cambios estructurales. Un campo booleano paralelo crearía estados inconsistentes (ej. `estado: 'BORRADOR', bloqueado: true`).

---

### D5 — Auditoría de desbloqueo: tabla nueva vs. campos en cuadro

**Decisión:** Nueva tabla `auditoria_desbloqueo_comparativa` con campos: `id` (UUID PK), `tenant_id`, `cuadro_id`, `desbloqueado_por` (UUID), `timestamp_desbloqueo` (DateTime), `justificacion` (Text), `@@index([tenant_id, cuadro_id])`.

**Razón:** Un cuadro puede ser bloqueado y desbloqueado más de una vez (el admin puede necesitar corregir, re-bloquear, volver a desbloquear). Guardar el historial en la tabla de auditoría es la única forma de mantener el registro completo. Campos en el cuadro solo guardarían el último evento.

---

### D6 — Veredicto del Residente: campos en `cuadros_comparativos`

**Decisión:** Agregar a `cuadros_comparativos`: `veredicto_residente` (Text, nullable), `proveedores_sugeridos` (Text[], nullable — array de UUIDs en PostgreSQL o JSON string para Prisma). Ambos campos son obligatorios para poder firmar.

**Razón:** El veredicto y la sugerencia son parte del documento comparativo firmado. Deben persistir junto con el cuadro, no como evento separado.

---

### D7 — Acceso del Residente desde ResidenciaView

**Decisión:** Agregar tab `evaluacion` en `ResidenciaView` que consume el mismo endpoint existente `GET /comparativas/pendientes-evaluacion`. Al abrir un cuadro, renderiza `ComparativaDetail` con `modo='residente'`.

**Razón:** No requiere nuevo endpoint. El endpoint ya filtra por rol en el backend (devuelve solo los cuadros del proyecto del usuario).

## Risks / Trade-offs

- **[Riesgo] Cuadros existentes sin specs en req_detalles:** Los campos `especificacion_marca_modelo` y `especificacion_detalle` serán nullable, así que cuadros anteriores cargan sin error. En la UI aparecerán vacíos. → Mitigación: el frontend muestra "Sin especificaciones" en lugar de crash.

- **[Riesgo] Estado `REVISION_SOLICITADA` no existe en el frontend:** Debe agregarse a `ESTADO_STYLE` y al stepper, o cuadros en ese estado mostrarán badge vacío. → Mitigación: incluir en tasks.

- **[Trade-off] Precios no se filtran en backend:** Un usuario técnico que accede directamente a la API con su JWT puede ver precios. Se acepta este riesgo porque el sistema no es un tender público — es un ERP interno con usuarios de confianza. La separación de datos en el frontend es suficiente para el caso de uso.

- **[Riesgo] Array de UUIDs `proveedores_sugeridos` en Prisma:** Prisma no tiene tipo nativo para arrays en PostgreSQL en todos los contextos. Usar `String[]` con `@db.Uuid[]` o serializar como JSON string. → Mitigación: usar `String` con serialización JSON y parsear en el frontend.

- **[Riesgo] Migración en producción con cuadros en vuelo:** La migración agrega columnas nullable, lo que es seguro en PostgreSQL (no bloquea tabla). El nuevo estado `REVISION_SOLICITADA` y `FIRMADO_BLOQUEADO` son aditivos. → Sin rollback especial necesario.

## Migration Plan

1. Migración `compras`: agregar campos a `req_detalles`, nuevos campos a `cuadros_comparativos`, nueva tabla `auditoria_desbloqueo_comparativa`.
2. Migración `compras`: agregar campo `respuesta_proveedor` a `comparativa_detalles` (pregunta/respuesta de la revisión "?").
3. Deploy backend con nuevos endpoints y estados.
4. Deploy frontend con `ComparativaDetail` modo residente + tab evaluación en ResidenciaView.
5. Los cuadros existentes en `LOCKED` o `EVALUADO_TECNICAMENTE` no se migran — el nuevo estado `FIRMADO_BLOQUEADO` aplica solo a cuadros que se firmen a partir de este deploy.

## Open Questions

- ¿El `veredicto_residente` es texto libre o tiene opciones predefinidas? → **Decisión por defecto: texto libre.** Si el equipo quiere opciones, se puede agregar en la siguiente iteración.
- ¿Cuántas revisiones puede tener un cuadro? → Sin límite explícito, pero el sistema ya maneja revisiones con `revision_padre_id`. Se acepta la cadena indefinida.
- ¿El desbloqueo por admin regresa el cuadro a qué estado? → `EN_EVALUACION_TECNICA`, para que el Residente pueda re-evaluar. Compras no necesita intervenir si el contenido del cuadro no cambia.

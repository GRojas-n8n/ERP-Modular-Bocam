## Context

Verificado en producción antes de diseñar: **21 `CuadroComparativo` existen,
pero 0 `ComparativaDetalle`, 0 `EspecificacionDetalleReq`, 0 evaluaciones
capturadas.** No hay datos reales de evaluación técnica que migrar — todos
los cuadros existentes están en etapas previas a la evaluación. Esto elimina
la necesidad de backfill: el cambio se puede desplegar limpio.

El ciclo de revisión por letra (`CuadroComparativo.revision`, A→B→C...) ya
existe y funciona (`revision-con-preguntas` + `responder-preguntas` +
`nueva-revision`, ver `apps/compras/src/main.ts:4754-5271`). Este change NO
rediseña ese mecanismo — lo extiende para operar a nivel característica en
vez de a nivel renglón completo, y corrige que hoy no clona las anotaciones
por especificación entre revisiones.

## Goals / Non-Goals

**Goals:**
- Veredicto C/NC/DA/? por característica individual
  (`EspecificacionDetalleReq`) × proveedor, con pregunta/respuesta amarrada
  a esa combinación exacta.
- El veredicto de renglón sigue existiendo (`ComparativaDetalle.evaluacion_tecnica`)
  pero se vuelve un valor calculado, no capturado a mano, cuando el renglón
  tiene especificaciones.
- El ciclo de revisión por letra sigue funcionando igual para el Residente,
  ahora basado en preguntas a nivel característica.
- La Requisición queda registrada con el `CuadroComparativo`/`revision` que
  la cerró al firmar.

**Non-Goals:**
- No se toca `nueva-revision` (camino manual de Compras) ni su
  comportamiento.
- No se modifica la lógica de bloqueo del endpoint `firmar` — solo se agrega
  el registro final en `Requisicion`.
- No se migra ni se unifica `AnotacionEspecificacion` ni
  `AclaracionComparativa` — quedan como deuda técnica separada (ambas ya
  desacopladas del flujo formal C/NC/DA/? según sus propios comentarios en
  el schema).
- No se hace backfill de datos — no hay evaluaciones reales en producción
  hoy (verificado).

## Decisions

**1. Nuevo modelo `EvaluacionEspecificacion`, no reutilizar
`AnotacionEspecificacion`.** `AnotacionEspecificacion` es un log de texto
libre append-only (`tipo: pregunta|respuesta`, múltiples filas por par,
sin relación FK real, sin veredicto). El ciclo de revisión necesita un
patrón "1 fila = 1 estado actual por triple", igual al que ya usa
`ComparativaDetalle` (`pregunta_residente`/`respuesta_compras` como campos
sobrescribibles, no un log). Replicar ese patrón probado a nivel
característica es más simple y consistente que forzar el modelo de log a
servir dos propósitos.
```prisma
model EvaluacionEspecificacion {
  id_evaluacion      String   @id @default(uuid()) @db.Uuid
  tenant_id           String   @db.Uuid
  proyecto_id         String   @db.Uuid
  cuadro_id           String   @db.Uuid
  especificacion_id   String   @db.Uuid
  proveedor_id        String   @db.Uuid
  evaluacion_tecnica  String   @default("PENDIENTE") // PENDIENTE | C | NC | DA | ?
  comentario_tecnico  String?  @db.Text
  pregunta_residente  String?  @db.Text
  respuesta_compras   String?  @db.Text
  creado_por          String   @db.Uuid
  updated_at          DateTime @updatedAt

  cuadro         CuadroComparativo         @relation(fields: [cuadro_id], references: [id_cuadro], onDelete: Cascade)
  especificacion EspecificacionDetalleReq  @relation(fields: [especificacion_id], references: [id_especificacion])
  proveedor      Proveedor                 @relation(fields: [proveedor_id], references: [id_proveedor])

  @@unique([cuadro_id, especificacion_id, proveedor_id])
  @@index([tenant_id, cuadro_id])
}
```
Corrige de paso un gap existente: `AnotacionEspecificacion.especificacion_id`
es un UUID suelto sin `@relation` — la tabla nueva sí declara la FK real.

**2. Rollup de renglón: función pura `calcularVeredictoRenglon`.**
```ts
function calcularVeredictoRenglon(evaluaciones: string[]): string {
  if (evaluaciones.length === 0) return 'PENDIENTE'; // sin especificaciones -> fallback legacy, no aplica esta función
  if (evaluaciones.includes('PENDIENTE')) return 'PENDIENTE';
  if (evaluaciones.includes('NC')) return 'NC';
  if (evaluaciones.includes('?')) return '?';
  if (evaluaciones.includes('DA')) return 'DA';
  return 'C';
}
```
Prioridad peor-caso confirmada con el usuario: `PENDIENTE > NC > ? > DA > C`.
Se ejecuta en el backend cada vez que se escribe una `EvaluacionEspecificacion`
de ese renglón (mismo `cuadro_id`+`insumo_id` vía `especificacion.detalle_id`
→ `RequisicionItem` → `ComparativaLinea.insumo_id`), y el resultado se
persiste en `ComparativaDetalle.evaluacion_tecnica` del renglón
correspondiente — así el endpoint `firmar` (`main.ts:4673-4686`) sigue
funcionando sin ningún cambio de lógica.

**3. Endpoint nuevo `PATCH .../evaluar-especificaciones`, el legacy
`PATCH .../evaluar` se restringe.** Mismo shape de payload que el existente
(`evaluaciones: [{..., evaluacion_tecnica, comentario_tecnico,
pregunta_residente}]`) pero keyed por `especificacion_id`+`proveedor_id` en
vez de `detalle_id`. El endpoint legacy `evaluar` (`main.ts:3019+`) gana una
validación: si el `insumo_id` del `detalle_id` tiene especificaciones
capturadas (`EspecificacionDetalleReq` vía `ComparativaLinea.detalle_req_id`
→ `RequisicionItem`), rechaza con 400
`EVALUACION_POR_ESPECIFICACION_REQUERIDA` — evita dos fuentes de verdad para
el mismo renglón. Si NO tiene especificaciones, sigue funcionando igual que
hoy (fallback legacy).

**4. `revision-con-preguntas` pasa a validar y clonar a nivel
característica.** La condición "al menos un `?` con pregunta" se mueve de
`evaluaciones` (payload de renglón) a las filas de `EvaluacionEspecificacion`
del cuadro. Al crear el cuadro de la revisión siguiente, además de clonar
`ComparativaDetalle`/`ComparativaLinea` (ya lo hace), se clonan también las
`EvaluacionEspecificacion` — reset a `PENDIENTE` salvo las marcadas `?`, que
heredan `pregunta_residente` (mismo patrón que ya usa para
`ComparativaDetalle`, línea `main.ts:5176`). Esto corrige el gap actual
donde las anotaciones por especificación quedan huérfanas en el cuadro
`SUPERSEDIDO`.

**5. `responder-preguntas` escribe `respuesta_compras` en
`EvaluacionEspecificacion`, no en `ComparativaDetalle`.** El payload pasa de
`{detalle_id, respuesta_compras}` a `{especificacion_id, proveedor_id,
respuesta_compras}`. `ComparativaDetalle.pregunta_residente`/
`respuesta_compras` quedan como campos legacy (solo relevantes para
renglones sin especificaciones, vía el camino de fallback del punto 3).

**6. Cierre de Requisición: campos nuevos, escritos en `firmar`.**
```prisma
model Requisicion {
  // ...
  cuadro_comparativo_cierre_id String? @db.Uuid
  revision_cierre               String? @db.VarChar(5)
}
```
`CuadroComparativo.requisicion_id` es obligatorio en el schema pero no tiene
FK declarada hacia `Requisicion` — al final de `firmar` (tras `estado:
'FIRMADO_BLOQUEADO'`), se usa `prisma.requisicion.updateMany({ where:
{id_requisicion: cuadro.requisicion_id}, data: { cuadro_comparativo_cierre_id:
cuadro.id_cuadro, revision_cierre: cuadro.revision } })` — `updateMany` en
vez de `update` para no fallar si la referencia no corresponde a ninguna fila
real. No afecta
`Requisicion.estado` (ese campo lo maneja el change
`envio-oc-correo-proveedores`, ya implementado, sin relación con este).

**7. Frontend: una matriz característica × proveedor por partida.**
Confirmado con el usuario el layout exacto: por cada renglón/partida
(insumo) del cuadro, la evaluación se presenta como una matriz independiente,
encabezada por la descripción de la partida (`ComparativaLinea` /
`especificaciones_requeridas` a nivel partida, ya existente). Dentro de esa
matriz:
- **Columna 1 (fija, izquierda):** una fila por característica técnica —
  `EspecificacionDetalleReq.descripcion`, ordenadas por `orden`. N filas para
  N características, tal como las capturó el Residente en la requisición.
- **Columnas 2..N (una por proveedor):** encabezadas con la razón social del
  proveedor cotizante.
- **Celda [característica_i, proveedor_j]:** el veredicto `C`/`NC`/`DA`/`?`
  que el Residente asigna ahí — corresponde 1:1 a una fila de
  `EvaluacionEspecificacion(cuadro_id, especificacion_id=i, proveedor_id=j)`.
  Al marcar `?` en una celda, aparece un textarea obligatorio para
  `pregunta_residente` de esa celda exacta.

En `ComparativaDetail.tsx`, la fila de renglón (hoy con botones `EVAL_BTNS`
directos, ~línea 2227-2233) pasa a ser un encabezado de matriz de solo
lectura (descripción de la partida + badge con el veredicto de renglón
calculado), seguido de la matriz característica × proveedor descrita arriba
— cada celda con sus propios botones `EVAL_BTNS`. La vista de Compras
(`!isResidenteMode`) muestra la misma matriz para responder: junto a cada
celda marcada `?`, la pregunta del Residente y un campo para
`respuesta_compras` (equivalente al bloque de "responder todas las preguntas
pendientes" que hoy existe a nivel renglón, línea ~1923-1934, pero iterando
`EvaluacionEspecificacion` en vez de `ComparativaDetalle`). Renglones sin
especificaciones capturadas siguen mostrando los botones `EVAL_BTNS`
directos, sin matriz (camino legacy).

## Risks / Trade-offs

- **[Riesgo] Doble fuente de verdad si el fallback legacy y el nuevo
  endpoint coexisten mal.** → Mitigación: el endpoint legacy `evaluar`
  rechaza explícitamente (400) si el renglón tiene especificaciones (Decisión
  3) — un renglón está siempre en un solo camino, nunca ambos.
  Determinístico por presencia/ausencia de especificaciones, no por elección
  del usuario.
- **[Riesgo] Rollup mal sincronizado si falla a mitad de una transacción por
  lote.** → Mitigación: el cálculo y la escritura del veredicto de renglón
  ocurren dentro de la misma transacción Prisma (`createTenantContext`) que
  escribe las `EvaluacionEspecificacion` del lote — atómico, sin estado
  intermedio inconsistente visible.
- **[Trade-off] `AnotacionEspecificacion`/`AclaracionComparativa` quedan sin
  tocar, generando 3 sistemas de anotación coexistiendo** (la nueva
  `EvaluacionEspecificacion`, más las dos legacy). Aceptado explícitamente
  para no inflar el alcance — deuda técnica documentada, no resuelta aquí.

## Migration Plan

- Migración Prisma aditiva: nueva tabla `EvaluacionEspecificacion`, 2 columnas
  nuevas nullable en `Requisicion`. Sin backfill (0 datos reales que migrar,
  verificado en producción).
- Sin flag de rollout — es un endpoint nuevo (`evaluar-especificaciones`) más
  una restricción nueva en uno legacy; los cuadros ya `FIRMADO_BLOQUEADO`
  (si los hubiera) no se re-evalúan, quedan como están.
- Deploy: rebuild `apps/compras` (migración + endpoints) y `apps/app-shell`
  (UI de evaluación rediseñada), mismo patrón manual vía SSH ya usado en
  esta sesión.

## Open Questions

- ¿Vale la pena, en un change posterior, consolidar
  `AnotacionEspecificacion`/`AclaracionComparativa` dentro de
  `EvaluacionEspecificacion` para no mantener 3 sistemas de anotación? Fuera
  de alcance aquí, queda anotado para el roadmap.

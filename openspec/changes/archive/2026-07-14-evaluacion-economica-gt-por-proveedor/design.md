## Context

`ComparativaDetalle` (`apps/compras/prisma/schema.prisma:383-421`) ya es naturalmente
`(línea, proveedor)` — `precio_ofertado` y `fecha_entrega_estimada` existen por proveedor
por renglón. `aprobacion_gt` también es una columna de esa tabla (por proveedor), pero el
frontend nunca la usa por proveedor: `PATCH .../revisar-gt`
(`apps/compras/src/main.ts:3637-3717`) recibe `aprobaciones[]` keyed por `detalle_id`, y el
panel de GT (`showGTPanel`, `ComparativaDetail.tsx`) construye ese payload desde
`gtForm`, keyed solo por `linea.id` — que en `ComprasView.normalizeComp` es el
`id_detalle` del **primer** proveedor visto al agrupar (mismo patrón de bug ya corregido
para `evaluacion_tecnica` en `fix-evaluacion-tecnica-por-proveedor`). Los otros
proveedores de cada renglón nunca reciben `aprobacion_gt`.

Además, `revisar-gt` mezcla dos responsabilidades en una sola llamada: guarda las
aprobaciones Y transiciona el cuadro a `APROBADO_GT`/`RECHAZADO_GT` de inmediato, sin gate
de "todos evaluados" (a diferencia del flujo técnico, donde guardar — `PATCH .../evaluar`
— y finalizar — `POST .../firmar`, con gate `todasEvaluadas` — son acciones separadas).

`revision-con-preguntas` (`main.ts:5563-5721`) es el único mecanismo de "?" hoy — SIEMPRE
clona el cuadro en `estado: 'BORRADOR'`, reseteando toda evaluación a `PENDIENTE`. Esto es
correcto para el "?" del Residente (necesita que Compras/proveedor aclare algo antes de
poder evaluar), pero NO sirve para el "?" de GT: el usuario confirmó que la evaluación
técnica ya aprobada por el Residente debe conservarse — la pregunta de GT es sobre el
aspecto económico, no técnico.

## Goals / Non-Goals

**Goals:**
- GT evalúa C/NC/DA/? por `(línea, proveedor)`, viendo costo y días de suministro
  estimados por proveedor, mismo patrón de UI ya validado para la evaluación técnica
  (`evaluacion-tecnica-inline-tabla-comparativa`).
- Guardar evaluaciones de GT y finalizar (`APROBADO_GT`) son acciones separadas, con gate
  de "todos evaluados" — igual que el flujo técnico.
- Un "?" de GT crea una nueva revisión que hereda la evaluación técnica del Residente y
  arranca directo en aprobación GT, sin reiniciar el ciclo completo.

**Non-Goals:**
- No se toca el flujo de evaluación técnica del Residente, salvo la herencia de sus datos
  hacia la revisión nueva de GT.
- No se resuelve el caso de preguntas simultáneas del Residente y de GT en revisiones
  distintas — se asume secuencial (técnica completa primero, siempre).
- No se migra el dato histórico de `aprobacion_gt` — se mantiene compatibilidad de lectura
  con los valores legacy `APROBADO`/`RECHAZADO`, mismo patrón que `evaluacion_tecnica`.

## Decisions

### D1: `aprobacion_gt` adopta el vocabulario C/NC/DA/? sin migración destructiva

Mismo patrón exacto que `evaluacion_tecnica` (`schema.prisma:398-400`): la columna sigue
siendo `String`, sin cambio de tipo. Las escrituras nuevas usan
`PENDIENTE | C | NC | DA | ?`; los valores legacy `APROBADO`/`RECHAZADO` de cuadros ya
evaluados se mapean en frontend a `C`/`NC` respectivamente para lectura, igual que ya
hace `ComparativaDetail.tsx` para `evaluacion_tecnica` (`v === 'APROBADO' ? 'C' : ...`).
La regla existente "GT no puede aprobar un renglón que el Residente rechazó" se conserva,
adaptada: GT no puede marcar `C` en un proveedor cuya `evaluacion_tecnica` sea `NC`.

### D2: Separar guardado de evaluaciones GT de la finalización del cuadro

Nuevo endpoint `PATCH /comparativas/:id/evaluar-gt` — mismo contrato que
`PATCH .../evaluar` de la evaluación técnica: recibe `evaluaciones: { detalle_id,
aprobacion_gt, comentario_gt }[]`, actualiza esos `ComparativaDetalle` sin transicionar el
estado del cuadro. Requiere `cuadro.estado === 'EN_APROBACION_GT'`.

`PATCH .../revisar-gt` se conserva como la acción de **finalizar** (equivalente a
`/firmar` del Residente): ya no recibe `aprobaciones[]` en el body — solo
`comentario_gt_general` opcional — y exige que **todos** los `ComparativaDetalle` del
cuadro tengan `aprobacion_gt` distinto de `PENDIENTE`/`?` antes de transicionar (gate
`todasEvaluadasGT`, calculado en backend igual que `todasEvaluadas` se calcula en frontend
para la firma). Si algún proveedor de algún renglón sigue `PENDIENTE`/`?`, responde 400.
Determina `APROBADO_GT` si hay al menos un `C`/`DA` por renglón entre los proveedores
evaluados (replicando la regla actual "al menos uno aprobado"), `RECHAZADO_GT` si todos
son `NC`.

**Alternativa descartada**: mantener un solo endpoint que guarda y finaliza a la vez.
Descartada porque impide guardar progreso parcial entre proveedores/renglones sin forzar
la decisión final del cuadro — el mismo problema que ya se resolvió para la evaluación
técnica.

### D3: Costo y días de suministro visibles por proveedor en el panel de GT

Se reutiliza el patrón de sub-fila inline ya implementado en
`evaluacion-tecnica-inline-tabla-comparativa` — un bloque C/NC/DA/? por proveedor,
alineado bajo la columna de cada proveedor en "TABLA DE COTIZACIONES" — para
consistencia de UX entre Residente y GT, en vez de reintroducir un modal aparte
(`showGTPanel` se retira igual que se retiró `showEvalPanel`).

Costo: ya existe (`linea.precios[prov.id]`), se muestra directamente en la sub-fila de GT.

Días de suministro: no existe como campo — se calcula
`diasSuministro = Math.round((fecha_entrega_estimada - comp.fecha_firma) / 86400000)`,
usando `fecha_firma` (cuándo el Residente bloqueó su evaluación técnica) como referencia,
porque es el momento en que el ciclo de aprobación económica realmente arranca para ese
proveedor — más estable que "días desde hoy" (cambiaría cada vez que alguien abre el
cuadro) y no depende de una fecha de emisión de OC que todavía no existe en esta etapa.

**Alternativa descartada**: agregar un campo `dias_entrega` capturado directamente por
Compras al cotizar. Descartada por ahora — duplicaría información con
`fecha_entrega_estimada` y requeriría mantener ambos sincronizados; calcular la derivada
es más simple y suficiente para lo que GT necesita ver.

Crédito: nuevos campos `ofrece_credito` (`Boolean`) y `dias_credito` (`Int?`, solo
relevante si `ofrece_credito`) en el modelo `Proveedor` (`schema.prisma:18-49`), junto a
`estatus_credito`/`limite_credito` que ya existen ahí — confirmado con el usuario que es
un atributo fijo del proveedor en su catálogo, no algo que Compras capture por cotización.
Se muestra en la sub-fila de GT junto a costo y días de suministro (ej. "Crédito 30 días"
o "Sin crédito"), leído directamente de `comp.proveedores[i]` (ya incluye los datos del
proveedor). El formulario de alta/edición de Proveedores en `ComprasView.tsx` (junto a los
campos de `estatus_credito`/`limite_credito` ya existentes ahí) gana los inputs
correspondientes.

### D4: Revisión con pregunta de GT hereda la evaluación técnica

Nuevo endpoint `POST /comparativas/:id/revision-con-preguntas-gt`, análogo a
`revision-con-preguntas` pero con una diferencia central: el cuadro clonado **no** resetea
`evaluacion_tecnica`/`comentario_tecnico` a `PENDIENTE` — los copia tal cual del cuadro
original — y nace en `estado: 'EN_APROBACION_GT'` (no `BORRADOR`), listo para que GT
retome directo la evaluación económica una vez respondida la pregunta. `aprobacion_gt` sí
se resetea a `PENDIENTE` en el cuadro nuevo (es lo que se está re-evaluando), preservando
`pregunta_gt` para los proveedores marcados "?" (mismo patrón que
`pregunta_residente` se preserva hoy).

¿Quién responde `pregunta_gt`? Se asigna a **Compras** (`respuesta_gt`), mismo rol que
responde `pregunta_residente` hoy — Compras es quien tiene el canal de comunicación con
el proveedor para aclarar términos comerciales (precio, plazo, condiciones), que es el
tipo de duda económica que GT plantearía. La alternativa de que el Residente responda se
descarta porque el Residente ya completó y firmó su parte; involucrarlo de nuevo
contradice el objetivo explícito de este change (no pedirle re-trabajo).

**Alternativa descartada**: reutilizar `revision-con-preguntas` con un parámetro que
decida si resetea o no la evaluación técnica. Se descarta a favor de un endpoint separado
porque las precondiciones de estado son distintas (`EN_EVALUACION_TECNICA` vs
`EN_APROBACION_GT`) y mezclar ambos casos en un solo endpoint con flags aumenta el riesgo
de que un cambio futuro rompa uno de los dos flujos sin darse cuenta.

## Risks / Trade-offs

- **[Riesgo]** Nuevo campo `pregunta_gt`/`respuesta_gt` en `ComparativaDetalle` duplica
  estructuralmente `pregunta_residente`/`respuesta_compras` — dos pares de columnas
  similares en la misma tabla.
  **[Mitigación]** Aceptable: son conceptualmente distintos (uno es del Residente sobre
  técnica, el otro de GT sobre economía) y mantenerlos separados evita acoplar sus
  ciclos de vida (una revisión de GT no debe interferir con el estado de
  `pregunta_residente` de la revisión técnica ya cerrada).
- **[Riesgo]** El cálculo de días de suministro usa `fecha_firma`, que es `null` para
  cuadros que aún no se firmaron — pero GT solo actúa cuando `estado === EN_APROBACION_GT`,
  que requiere firma previa (`FIRMADO_BLOQUEADO` → `EN_APROBACION_GT`), así que
  `fecha_firma` siempre está poblada en el momento en que este cálculo se ejecuta.
  **[Mitigación]** Ninguna necesaria — la precondición del estado ya lo garantiza.
- **[Riesgo]** La regla "GT no puede marcar C en un proveedor que el Residente marcó NC"
  debe re-validarse también en el endpoint nuevo `evaluar-gt`, no solo en el de
  finalización — de lo contrario se podría guardar una combinación inválida antes de
  finalizar.
  **[Mitigación]** `evaluar-gt` valida esta regla por cada `detalle_id` del payload, igual
  que hoy la valida `revisar-gt`.

## Migration Plan

Cambios de schema aditivos (nuevas columnas `pregunta_gt`/`respuesta_gt`, nullable, sin
tocar columnas existentes) — migración de Prisma estándar, sin backfill necesario.
`aprobacion_gt` no cambia de tipo (sigue `String`), así que no requiere migración de datos.
Despliegue: backend primero (nuevos endpoints conviven con `revisar-gt` mientras se
actualiza), luego frontend. Cuadros ya en `APROBADO_GT`/`RECHAZADO_GT` no se ven
afectados — el cambio solo aplica a cuadros que lleguen a `EN_APROBACION_GT` después del
despliegue.

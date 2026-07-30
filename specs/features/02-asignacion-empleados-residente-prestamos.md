# Feature — Asignación de empleados a Residente, préstamos por día y vista de equipo

> Feature nuevo sobre módulo legacy `apps/personal` (puerto 3006) + tab nuevo en
> `apps/app-shell/src/views/ResidenciaView.tsx`. Ubicación: `specs/features/`
> según `specs/README.md` — feature sobre legacy, no módulo nuevo.

> **Estado: propuesto, sin implementar.** Este spec documenta el diseño
> discutido y su verificación contra el código real (`apps/personal/src/main.ts`,
> `apps/personal/prisma/schema.prisma`). No confirmar completado hasta que
> exista código + tests en verde + migración aplicada.

## 1. Contexto

El Residente necesita saber cuánta gente tiene a su cargo por categoría y
detectar cuándo alguno de sus empleados está compartido con otro proyecto.
La idea original de resolverlo formando `Cuadrilla`s (entidad existente,
dirigida por capataz, ver `apps/personal/prisma/schema.prisma:92-112` y el
tab "Cuadrillas" de `PersonalView.tsx`) se descartó: los Residentes no piden
personal por cuadrilla estructural, piden personal de acuerdo a los trabajos
del proyecto que atienden, y ese personal se comparte por días de la semana
entre proyectos.

El diseño acordado en su lugar:

1. Cada empleado tiene un **residente principal** — quién lo tiene a su
   cargo por defecto.
2. Cuando un empleado va a trabajar días sueltos a otra obra (mismo u otro
   residente), esos días deben cargarse a la nómina de **esa** obra, no a la
   del residente principal.
3. Caso raro pero real: una obra se pausa indefinidamente por causas ajenas
   a la constructora y su personal se reparte temporalmente entre otras
   obras activas, hasta que la obra pausada se reactiva.
4. Al cierre de periodo, el residente principal debe ver en su nómina
   **solo** a quienes de verdad trabajaron con él ese periodo — no a quien
   estuvo prestado o repartido en otro lado.

Auditoría del código real (`apps/personal`) encontró que la mayoría de la
infraestructura para esto **ya existe pero está desconectada**, y encontró
un bug de doble pago que este feature expondría con más frecuencia si no se
corrige primero (ver 2.2).

Modelos ya existentes y relevantes (`apps/personal/prisma/schema.prisma`):

| Modelo | Qué hace hoy | Lo que le falta para este feature |
|---|---|---|
| `AsignacionResidente` (líneas 373-387) | empleado ↔ residente, con `fecha_inicio`/`fecha_fin` | No garantiza "un solo principal a la vez" (ver 2.1) |
| `AsignacionFrente` (líneas 120-141) | empleado ↔ proyecto ↔ frente, con fechas y `estado` | No distingue asignación estructural de préstamo puntual |
| `RegistroAsistencia` (líneas 224-251) | asistencia diaria con `proyecto_id` propio | Ya soporta día-a-día por proyecto, no requiere cambios |
| `Cuadrilla` (líneas 92-112) | agrupación estructural por capataz | No se toca — coexiste, no se reemplaza |

Endpoints ya existentes (`apps/personal/src/main.ts`):

- `POST/DELETE/GET /api/v1/personal/empleados/:id/residentes` (líneas
  1690-1774) — alta/baja/listado de `AsignacionResidente`.
- `GET /api/v1/personal/mis-empleados` (líneas 1776-1794) —
  `requireRoles('residencia')`, devuelve los empleados del residente
  autenticado (via `AsignacionResidente` activa).
- `calcular()` de PreNomina (líneas ~630-790) — ya agrupa
  `dias_trabajados` filtrando `RegistroAsistencia` por `proyecto_id` del
  periodo, y ya **salta** (no genera detalle) a un empleado con 0 días
  reales (línea 741, modo `JORNADA_COMPLETA`) — esto es exactamente lo que
  hace que "solo aparezcan quienes trabajaron ahí" funcione, siempre que el
  bug de 2.2 esté corregido.

## 2. Problemas confirmados (deben resolverse como prerequisito)

Bug-fixes sobre código legacy — requieren su propio ciclo spec-corto → test
que reproduce el bug → fix (regla CLAUDE.md), documentados aquí porque el
feature nuevo hereda ambos si no se resuelven primero.

### 2.1 — `AsignacionResidente` no distingue un "principal" entre varios vigentes

> **Corrección tras revisar el spec original:** esto NO es un bug. El
> requisito original (`openspec/changes/archive/2026-07-26-expediente-asignacion-periodicidad-personal/specs/asignacion-residente-empleado/spec.md`)
> dice explícitamente: *"Un empleado puede tener más de una asignación
> vigente simultánea"*, con un escenario de test dedicado a confirmarlo, y
> el test `testAsignarMultiplesResidentes`
> (`apps/personal/test/integration/asignacion-residente-empleado.integration.test.ts:79-104`)
> ya pasa afirmando justo eso. Cerrar automáticamente la asignación previa
> al crear una nueva (el "fix" propuesto originalmente en esta sección)
> rompería ese requisito y ese test — no procede sin una decisión de
> negocio explícita que reemplace el spec original, y esa decisión no se
> ha tomado. **No se implementa.**

`POST /api/v1/personal/empleados/:id/residentes` (línea 1704) permite,
a propósito, que un empleado tenga varias `AsignacionResidente` vigentes
al mismo tiempo — sirve para personal compartido entre residentes por
diseño. El gap real para este feature no es "se permiten varios", es que
no hay forma de marcar **cuál de ellos es el principal** para efectos de
"a cargo de quién está por default" (contexto del feature, sección 1).

**Ajuste (adición, no fix):** agregar `es_principal: Boolean @default(true)`
a `AsignacionResidente`. Al crear una asignación nueva con `es_principal: true`
(default), el backend pone `es_principal: false` en cualquier otra
asignación vigente del mismo empleado — sin tocar `fecha_fin` ni cerrarlas,
ambas siguen vigentes y visibles en `/mis-empleados` de sus respectivos
residentes, exactamente como hoy. Solo cambia cuál se considera "principal"
para la vista de equipo (sección 5) y para saber a quién pertenece por
default un empleado nuevo. Esto es aditivo: no rompe
`testAsignarMultiplesResidentes` ni ningún otro escenario del spec
original.

### 2.2 — `calcular()` puede pagar el periodo completo a un empleado que no puso un pie en ese proyecto

`calcular()`, rama `JORNADA_COMPLETA` (línea 738-750): un empleado sigue
"elegible" en un proyecto mientras tenga `AsignacionFrente` con
`estado: 'ACTIVA'` ahí (sin importar fechas — `obtenerEmpleadoIdsDelProyecto`,
línea 522-530, filtra solo por `estado`, no compara `fecha_inicio`/`fecha_fin`
contra el periodo calculado). Si ese empleado, elegible pero prestado 100%
del periodo a otra obra, no tiene **ningún** `RegistroAsistencia` en el
proyecto de origen durante el periodo, cae en el `else` de la línea 743-745:

```ts
} else {
  diasTrabajados = diasPeriodo; origenDias = 'ESTIMADO';
}
```

Es decir: sin evidencia de asistencia, el sistema **asume que trabajó el
periodo completo ahí**. Si el proyecto que lo recibió también le calcula
nómina por asistencia real, el empleado cobra dos veces el mismo periodo.
Este es el mismo bug documentado en `[[hallazgo-nomina-doble-pago-multiproyecto]]`
(memoria, 2026-07-26) — ese fix acotó la lista de elegibles por
`AsignacionFrente`/`Cuadrilla`, pero no tocó este fallback `ESTIMADO`, que
sigue activo para cualquier empleado que siga "elegible" sin asistencia.

**Por qué este feature lo empeora:** hoy el fallback `ESTIMADO` es
principalmente un riesgo teórico (nadie mueve gente entre proyectos sin
tocar su `AsignacionFrente`). Con préstamos y repartos por pausa (secciones
3 y 4), mover gente de un proyecto a otro **sin cerrar su elegibilidad de
origen** pasa a ser la operación central del feature — así que el bug se
activaría en el camino feliz, no en un caso raro.

> **Completado (bug-fix cycle):** `obtenerEmpleadoIdsDelProyecto` ahora
> recibe una `fechaReferencia` (default: `new Date()`) y excluye del
> `AsignacionFrente.findMany` cualquier fila con `fecha_fin` anterior a esa
> fecha (`OR: [{ fecha_fin: null }, { fecha_fin: { gte: fechaReferencia } }]`).
> `calcular()` le pasa `periodo_inicio` como referencia — una asignación que
> terminó antes de que el periodo empezara deja de ser elegible ahí. Test:
> `apps/personal/test/integration/prenomina-elegibilidad-asignacion-vencida.integration.test.ts`
> (rojo confirmado antes del fix, verde después; suite completa de
> integración de `apps/personal` corrida sin regresiones). Esto es más
> simple que lo planeado originalmente abajo — no depende de que un futuro
> flujo de préstamo recuerde también cambiar `estado`, basta con que la
> `AsignacionFrente` tenga `fecha_fin` correcta, que ya es un campo que
> `POST /api/v1/personal/asignaciones` acepta hoy.

**Fix aplicado:** `obtenerEmpleadoIdsDelProyecto` ya no depende únicamente
de `estado`. El flujo de préstamo (sección 3) puede simplemente poner
`fecha_fin` en la `AsignacionFrente` de origen al crear el préstamo — no
necesita además tocar `estado` para que deje de ser elegible ahí, aunque
seguir dejando `estado: 'ACTIVA'` no causa el bug (la fecha ya lo filtra).

## 3. Feature nuevo — Préstamo de empleado a otro proyecto (por rango de fechas)

Cubre el caso 2 del contexto: días sueltos en otra obra, mismo u otro
residente.

- El préstamo **no toca** `AsignacionResidente` — el residente principal no
  cambia porque alguien vaya unos días a otra obra. Prestar y reasignar el
  principal son operaciones independientes.
- Un préstamo es una fila `AsignacionFrente` nueva en el proyecto destino,
  acotada a `fecha_inicio`/`fecha_fin` del préstamo, con un campo nuevo
  `es_prestamo: Boolean @default(false)` en `true` — para que la UI pueda
  distinguir "está aquí porque pertenece a esta cuadrilla/frente" de "está
  aquí prestado unos días" sin ambigüedad (ver D1).
- Al crear el préstamo, el backend debe truncar (`fecha_fin`) cualquier
  `AsignacionFrente` `ACTIVA` del mismo empleado en **otro** proyecto que se
  solape con el rango de fechas del préstamo — ya es suficiente para que
  `obtenerEmpleadoIdsDelProyecto` (fix 2.2) deje de listarlo ahí, sin
  necesitar tocar `estado`.
- Terminado el préstamo, el empleado **no vuelve solo** a estar elegible en
  el proyecto de origen — alguien (RH, ver D3) debe crear explícitamente la
  `AsignacionFrente` de reactivación. No hay reactivación automática (ver
  D2 para el porqué).

Endpoint nuevo: `POST /api/v1/personal/empleados/:id/prestamo`
(`requireRoles(['personal_rh', 'admin'])`), body
`{ proyecto_destino_id, frente_trabajo, fecha_inicio, fecha_fin, turno?, horas_diarias? }`.

## 4. Feature nuevo — Reparto temporal por pausa de obra

Cubre el caso 3 del contexto (raro, pero ya ocurrió). Es el mismo mecanismo
de la sección 3 (préstamo), sin la restricción de fecha_fin obligatoria:

- `fecha_fin` puede quedar `null` (indefinido) mientras la obra pausada no
  tenga fecha de reactivación conocida.
- Al reactivarse la obra pausada, cerrar las `AsignacionFrente` de préstamo
  en los proyectos que recibieron gente (mismo patrón: `estado` +
  `fecha_fin`) y crear las `AsignacionFrente` de reactivación en el
  proyecto original — un movimiento por empleado, no una operación masiva
  automática (ver D2).
- No se distingue a nivel de modelo entre "préstamo corto planeado" y
  "reparto por pausa" — mismo campo `es_prestamo: true`, la diferencia es
  operativa (fecha_fin poblada vs. null), no estructural.

No se propone un endpoint de "pausar proyecto" que reparta automáticamente
a todo el personal — cada movimiento se registra empleado por empleado con
el endpoint de la sección 3, aunque en la práctica RH los dispare en lote
desde el frontend. Justificación en D2.

## 5. Feature nuevo — Vista "Mi equipo" en ResidenciaView

Endpoint nuevo: `GET /api/v1/personal/mis-empleados/resumen`
(`requireRoles('residencia')`). Reusa la misma fuente que `/mis-empleados`
(`AsignacionResidente` activa del `userId` autenticado) y le agrega, por
empleado:

- `categoria` (ya existe en `Empleado.categoria`).
- `compartido: boolean` — `true` si el empleado tiene una `AsignacionFrente`
  `ACTIVA` hoy cuyo `proyecto_id` es distinto del `proyectoId` activo de la
  sesión del residente que consulta (`req.securityContext.proyectoId`).
- `proyecto_actual_id` / `proyecto_actual_nombre` — a qué proyecto está
  cargando su asistencia hoy, cuando `compartido` es `true` (útil para que
  el residente sepa "está con fulano en la otra obra").

Respuesta: `{ por_categoria: [{ categoria, total, empleados: [{ id_empleado, nombre, numero_empleado, compartido, proyecto_actual_id, proyecto_actual_nombre }] }] }`.

Frontend (`apps/app-shell/src/views/ResidenciaView.tsx`):

- Nuevo tab `'equipo'` en `TabId` (línea 61), agregado junto a
  `'estimaciones' | 'nomina' | 'asistencia' | 'requisiciones'`.
- Sección nueva siguiendo el patrón existente de bloques
  `{activeTab === '...' && (...)}` (líneas 1259+): tarjetas por categoría
  con el total, y dentro de cada una la lista de empleados con un badge
  "Compartido con [proyecto]" cuando `compartido === true`.
- Dato demo: agregar `DEMO_MI_EQUIPO_RESIDENCIA` a
  `apps/app-shell/src/lib/demoData.ts` siguiendo la forma de la respuesta
  real, mismo patrón que `DEMO_PRENOMINAS_RESIDENCIA` (ver spec 01).

> **Actualización (post-decisión de negocio):** se decidió retirar la
> formación de cuadrillas estructurales como mecanismo de organización de
> personal — el modelo pasa a ser 100% asignación a Residente + `AsignacionFrente`
> por proyecto (este spec). El retiro del tab "Cuadrillas" de `PersonalView.tsx`
> y de la dependencia de `Cuadrilla` en la elegibilidad de nómina se cubre en
> `specs/features/03-retirar-cuadrillas-formales.md`, que depende de que la
> sección 5 de este spec ("Mi equipo") exista primero como reemplazo
> funcional.

## 6. Decisiones de diseño

**D1 — ¿Tabla nueva para "préstamo" o reusar `AsignacionFrente`?**

**Decisión: reusar `AsignacionFrente`**, agregando el campo
`es_prestamo: Boolean @default(false)`.

Razones:
- `AsignacionFrente` ya es exactamente "empleado ↔ proyecto ↔ rango de
  fechas", que es toda la forma que un préstamo necesita.
- `calcular()` y `obtenerEmpleadoIdsDelProyecto` ya leen `AsignacionFrente`
  para decidir elegibilidad — un préstamo modelado ahí funciona con la
  nómina sin tocar el motor de cálculo.
- Una tabla nueva duplicaría esa lógica de elegibilidad en dos lugares
  (`AsignacionFrente` y la tabla nueva), con el riesgo de que
  `calcular()` solo mire una de las dos.
- El costo es que un listado crudo de `AsignacionFrente` mezcla
  asignaciones estructurales largas con préstamos de días — por eso el
  campo `es_prestamo` explícito, no inferido por duración.

**D2 — ¿Reactivación automática al terminar el préstamo/pausa?**

**Decisión: no. Reactivación manual y explícita.**

Razones:
- El fix del bug 2.2 depende de que "elegible en un proyecto" sea siempre
  una decisión explícita (`estado: ACTIVA` puesto a propósito). Si el
  sistema reactivara solo al llegar `fecha_fin`, se necesitaría un job
  programado tocando `estado` en producción — más superficie de fallo
  silencioso (si el job no corre, nadie se entera hasta la próxima
  nómina) que un paso manual que RH hace al ver que la obra ya reabrió.
- Los repartos por pausa (sección 4) no tienen `fecha_fin` conocida de
  antemano — no hay "cuándo" para que un job dispare la reactivación.
- Se evaluó una alternativa (inferir "sin asistencia en nadie ⇒ modo
  legacy, estimar" vs "con asistencia en otros ⇒ este empleado sí está
  ausente de verdad") para arreglar 2.2 sin tocar `AsignacionFrente`; se
  descartó por frágil: una obra completamente pausada (cero asistencia
  para *nadie* ese periodo) haría que la heurística caiga otra vez en
  `ESTIMADO` para todos, el escenario exacto que se quiere evitar.

**D3 — ¿Quién puede crear un préstamo o reparto?**

**Decisión: `personal_rh` y `admin` únicamente**, igual que
`AsignacionResidente` (línea 1690) y `AsignacionFrente` hoy. El Residente
solo lee (`/mis-empleados/resumen`), no puede mover gente hacia o desde su
propia obra.

Razones:
- Mismo patrón de separación de funciones que D2 del spec 01
  (`[[hallazgo-nomina-tab-residencia-desconectada-backend]]`): mover
  personal entre proyectos tiene impacto de nómina y de asistencia en dos
  obras a la vez — no es una decisión unilateral de un solo residente,
  aunque en la práctica sea el residente quien avisa a RH que necesita
  gente.
- Evita el conflicto de interés obvio: si un residente pudiera prestarse
  gente a sí mismo desde otra obra, podría inflar su propia cuadrilla sin
  que el otro residente se entere a tiempo.

## 7. Casos borde

- Empleado miembro formal de una `Cuadrilla` (`Empleado.cuadrilla_id`)
  cuya `Cuadrilla.proyecto_id` es el proyecto de origen del préstamo: la
  pertenencia a `Cuadrilla` lo hace elegible en ese proyecto
  **independientemente** de `AsignacionFrente` (ver
  `obtenerEmpleadoIdsDelProyecto`, línea 523-530, unión de ambas fuentes).
  Cerrar solo su `AsignacionFrente` no lo saca de elegibilidad. Mientras
  `Cuadrilla` siga teniendo datos activos (hasta que se resuelva
  `specs/features/03-retirar-cuadrillas-formales.md`), el endpoint de
  préstamo debe rechazar con error explícito si el empleado tiene
  `cuadrilla_id` activo en el proyecto de origen ("primero debe salir de
  la cuadrilla estructural"), no fallar en silencio. Una vez removido el
  fallback de `Cuadrilla` (spec 03), este caso borde deja de aplicar.
- Dos préstamos simultáneos al mismo empleado con fechas que se solapan
  (dos proyectos distintos, mismo rango) — rechazar con 409, un empleado
  no puede tener dos proyectos "elegibles vía préstamo" el mismo día.
- Préstamo cuyo rango no se solapa con ninguna `AsignacionFrente` `ACTIVA`
  de origen (ej. el empleado no tenía asignación formal en ningún lado
  todavía) — crear el préstamo igual, sin nada que cerrar.
- Empleado sin `AsignacionResidente` activa (nunca se le asignó un
  residente principal) — no aparece en ningún `/mis-empleados/resumen`;
  gestionar huérfanos de este tipo queda fuera de alcance (sección 8), pero
  RH debe poder detectarlos en `PersonalView.tsx` (fuera de este spec).
- Empleado prestado el 100% del periodo — sigue apareciendo en
  `/mis-empleados/resumen` de su residente principal (el préstamo no toca
  `AsignacionResidente`), marcado `compartido: true`, pero **no** debe
  generar `PreNominaDetalle` en la nómina del proyecto de origen ese
  periodo (ya cubierto por el fix 2.2).
- Cambio de residente principal (`AsignacionResidente` nueva) a mitad de
  periodo de nómina — no debe alterar a qué proyecto se carga la nómina ya
  calculada; el residente principal es bookkeeping de "a cargo de quién
  está", no de "quién cobra dónde".

## 8. Fuera de alcance

- Reconocimiento facial u otras features de asistencia — no relacionado.
- Retirar el tab "Cuadrillas" de `PersonalView.tsx` o el fallback de
  `Cuadrilla` en `obtenerEmpleadoIdsDelProyecto` — cubierto en
  `specs/features/03-retirar-cuadrillas-formales.md`, que depende de que
  este spec (sección 5) esté implementado primero.
- Endpoint de "pausar proyecto" que reparta personal en lote
  automáticamente — cada movimiento se registra individualmente con el
  endpoint de préstamo (sección 3), aunque el frontend pueda ofrecer
  selección múltiple para dispararlos en lote sin ser un endpoint distinto.
- Gestión de empleados huérfanos (sin `AsignacionResidente` nunca
  asignada) — RH los ve en `PersonalView.tsx`, no en este feature.
- Modo `POR_HORAS` de `calcular()` (líneas 698-736): tiene su propio
  fallback estimado (`hayEstimado`, línea 703-725) con la misma forma de
  riesgo que 2.2, pero no fue auditado en detalle aquí — si se detecta el
  mismo bug ahí, requiere su propio bug-fix cycle.

## 9. Tests requeridos

Bug-fix cycle (2.2): el test que reproduce el bug se escribe primero. 2.1 ya
no es un bug-fix (ver corrección arriba) — sus tests son de feature nuevo,
van con la sección 5.

- `apps/personal`: test de que `POST .../residentes` con `es_principal: true`
  (default) desmarca como principal cualquier otra asignación vigente del
  mismo empleado, sin cerrarla (`fecha_fin` sigue `null`) — confirma que
  `testAsignarMultiplesResidentes` sigue en verde sin cambios (2.1).
- `apps/personal`: test que reproduce el doble pago de 2.2 — empleado
  elegible en proyecto A sin `RegistroAsistencia` ahí, con asistencia real
  en proyecto B — confirma que, tras el fix, A no le genera
  `PreNominaDetalle` ese periodo.
- `apps/personal`: test de `POST .../prestamo` — crea `AsignacionFrente`
  en destino con `es_prestamo: true` y cierra (`estado` + `fecha_fin`) la
  `AsignacionFrente` de origen que se solapa.
- `apps/personal`: test de rechazo cuando el empleado es miembro de una
  `Cuadrilla` activa en el proyecto de origen del préstamo.
- `apps/personal`: test de rechazo (409) de dos préstamos solapados para
  el mismo empleado.
- `apps/personal`: test de `GET /mis-empleados/resumen` — agrupa por
  categoría y marca `compartido: true` cuando la `AsignacionFrente` activa
  del empleado apunta a un proyecto distinto del de la sesión.
- `apps/personal`: test de que `POST .../prestamo` y `POST .../residentes`
  rechazan roles distintos de `personal_rh`/`admin` (403) — D3.
- `apps/app-shell`: test del tab "Mi equipo" en `ResidenciaView.tsx` —
  renderiza tarjetas por categoría y el badge de compartido sin crashear
  con `detalles: []` o `por_categoria: []`.

## 10. Orden de implementación sugerido

1. Fix 2.2 (respetar `fecha_fin` en `obtenerEmpleadoIdsDelProyecto`) —
   **completado** — sin esto, construir préstamos reintroduce el bug de
   doble pago en el camino feliz.
2. Campo `es_principal` en `AsignacionResidente` (2.1, adición no
   destructiva) — desbloquea que "compartido" tenga sentido en la vista de
   equipo.
3. Migración Prisma: `es_prestamo` en `AsignacionFrente`.
4. Endpoint `POST .../prestamo` (sección 3) con las validaciones de la
   sección 7 (Cuadrilla activa, solape de fechas).
5. Reparto por pausa (sección 4) — mismo endpoint, sin cambios de código
   adicionales, solo `fecha_fin: null`.
6. Endpoint `GET /mis-empleados/resumen` (sección 5).
7. Tab "Mi equipo" en `ResidenciaView.tsx` + datos demo.

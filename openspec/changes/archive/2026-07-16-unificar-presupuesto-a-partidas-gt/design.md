## Context

**Estado actual (verificado en código, no solo en specs):**

- `apps/gerencia-tecnica/prisma/schema.prisma`: `Concepto` (partida real,
  `clave`/`descripcion`/`cantidad`/`precio_unitario`) hijo de
  `PresupuestoBase`. Al aprobar el presupuesto
  (`apps/gerencia-tecnica/src/main.ts:814-886`), se hace `upsert` de un
  `SaldoPartida` por cada `Concepto` (`monto_aprobado = precio_unitario ×
  cantidad`, `estado_tope = 'LIBRE'`). **No se publica ningún evento** en
  este paso hoy.
- `apps/finanzas/prisma/schema.prisma:25-52`: `PresupuestoAsignado` —
  bolsa por `(tenant_id, proyecto_id, codigo)`, con `capitulo` de texto
  libre (`MATERIALES|MANO_OBRA|SUBCONTRATOS|EQUIPOS|INDIRECTOS`, default
  `MATERIALES`). Sin `concepto_id`. Se crea a mano vía `POST
  /api/v1/finanzas/presupuestos` (`apps/finanzas/src/main.ts:224-289`).
- `apps/compras/src/main.ts:2672-2934` (`convertir-oc`): exige
  `presupuesto_id` en el body (400 si falta, línea 2679-2684); calcula
  `conceptoId` desde `Requisicion.concepto_id` (línea 2747-2754) SOLO
  para el gate de GT (líneas 2790-2817); compromete **dos veces en
  paralelo**: `POST {FINANZAS_URL}/comprometer-fondos` con
  `presupuesto_id` (línea 2877-2883) y `POST
  {GT_URL}/partidas/:concepto_id/comprometer` (línea 2910-2921) — sin
  relación entre ambos montos salvo que por construcción son el mismo
  total de la OC.
- `apps/finanzas/prisma/schema.prisma:193-213`: `DetallePagoOC` **ya
  tiene** `concepto_id`/`concepto_clave` desnormalizados (comentario:
  "Trazabilidad WBS... para reportes sin B2B") — el nivel de pago
  aplicado YA se trackea por partida; solo el nivel de autorización
  (`PresupuestoAsignado`) no.
- `apps/personal`: `PreNomina`/`PreNominaDetalle` — cero referencias a
  presupuesto o partida. `openspec/specs/nomina-a-contabilidad/spec.md`
  ya define y (según ese spec) ya está implementado que Personal publica
  `personal.nomina_autorizada` y `personal.nomina_pagada` con
  `payload.total_neto` y `context.proyecto_id` — Contabilidad los
  consume para pólizas, pero **nadie más los consume hoy**.

## Goals / Non-Goals

**Goals:**
- Que exista una única fuente de verdad para "cuánto presupuesto tiene
  esta partida y cuánto lleva comprometido/ejercido": `SaldoPartida` en
  GT.
- Que Finanzas deje de requerir captura manual de un presupuesto para
  partidas que ya tienen `Concepto`/`SaldoPartida` en GT.
- Que generar una OC no requiera que el usuario elija manualmente un
  presupuesto — se resuelve por la partida real de la requisición.
- Que la nómina (fiscal + complementaria) tenga un techo presupuestal
  real a nivel proyecto, reusando los eventos que Personal ya publica.

**Non-Goals:**
- No se prorratea el gasto de nómina entre partidas (decisión ya tomada
  con el usuario: bolsón a nivel proyecto).
- No se toca el schema ni la lógica de `SaldoPartida` en GT más allá de:
  (a) agregar la publicación de un evento al crearlo, (b) quitar el
  compromiso de nómina de su ciclo de vida documentado. La tabla y su
  gate de bloqueo/transferencia ya son correctos y quedan intactos.
- No se toca `ProyectoFinanzas` (anticipo) — es fuente de pago, ortogonal
  al techo presupuestal por partida.
- No se automatiza la creación de presupuestos para capítulos que no
  tienen partida asociable (p. ej. gastos administrativos generales sin
  `Concepto`) — fuera de alcance; si aparece ese caso real, es un change
  aparte.
- No se migra `MovimientoPresupuestal`/`ProgramaPagos` histórico — siguen
  apuntando a su `presupuesto_id` original tal cual, solo cambia cómo se
  crean y pueblan los `PresupuestoAsignado` **nuevos**.

## Decisions

### 1. `PresupuestoAsignado` gana `concepto_id`/`concepto_clave` (nullable, desnormalizado)

Mismo patrón ya usado en el repo (`Requisicion.concepto_id`,
`DetallePagoOC.concepto_id`): UUID sin FK cruzada. `concepto_id != null`
significa "este presupuesto ES una partida real de GT, sincronizada, no
editable a mano". `concepto_id == null` sigue significando "bolsa a nivel
proyecto" — que es exactamente el caso de `capitulo = 'MANO_OBRA'` hoy.

**Alternativa descartada**: reemplazar `PresupuestoAsignado` por una
tabla nueva y migrar todo. Descartada porque `MovimientoPresupuestal` y
`ProgramaPagos` tienen FK real a `presupuesto_id` — romper esa relación
para todo el historial es mucho más riesgoso que agregar una columna
nullable a la tabla existente.

### 2. Sincronización por evento, no por API call directa desde GT

Al aprobar `PresupuestoBase` (`apps/gerencia-tecnica/src/main.ts:834-872`),
GT publica un evento nuevo `gerencia_tecnica.saldo_partida_creado` (uno
por lote de conceptos, con array de partidas) en el mismo `Promise.all`
donde ya hace el `upsert`. Finanzas se suscribe y hace `upsert` de un
`PresupuestoAsignado` por partida:
- `concepto_id`, `concepto_clave` ← del payload
- `monto_autorizado` ← `monto_aprobado` del payload
- `capitulo` ← se infiere de `categoria_predominante` si el evento la
  incluye, o queda en un capítulo genérico `OBRA` nuevo si no aplica
  (ver Open Questions — GT no calcula `categoria_predominante` en el
  momento de aprobar, solo el reporte de control presupuestal lo hace on
  the fly)
- `codigo` ← `concepto_clave` (o `CONCEPTO-{clave}` si colisiona con el
  formato `PRES-*` existente)
- `estatus = 'ACTIVO'`

**Por qué evento y no llamada B2B síncrona**: aprobar un presupuesto con
N conceptos ya crea N `SaldoPartida` en una sola transacción lógica; que
además dependa de que Finanzas esté arriba y responda para completar la
aprobación acoplaría la disponibilidad de dos servicios en una operación
que hoy es puramente interna a GT. El patrón evento-consumidor
best-effort (con reintentos/DLQ si aplica) ya es el estándar del repo
(ver `nomina-a-contabilidad`, `evento-centro-costos-creado`).

**Alternativa descartada**: que Finanzas llame a GT bajo demanda
(`GET /partidas/:concepto_id/saldo`) en vez de mantener copia local. Se
descarta porque Finanzas necesita su propia fila `presupuesto_id` para
que `MovimientoPresupuestal`/`ProgramaPagos` (FK real) sigan
funcionando sin rediseñar esas dos tablas también.

### 3. GT sigue siendo la única fuente de verdad para el GATE de bloqueo; Finanzas es espejo de lectura/pago

El gate que decide si una OC se puede emitir sigue siendo
exclusivamente `SaldoPartida.estado_tope` en GT (código ya existente,
líneas 2790-2817 de `compras/src/main.ts`, sin cambios). Tras emitir la
OC, Compras sigue llamando `POST {GT_URL}/partidas/:concepto_id/comprometer`
(sin cambios) — y ese mismo commit dispara (vía el evento
`gerencia_tecnica.partida_bloqueada` ya existente, o uno nuevo de
"comprometido" si se prefiere no sobrecargar el de bloqueo) la
actualización del espejo en Finanzas. **La llamada directa
`POST {FINANZAS_URL}/comprometer-fondos` que hoy hace Compras
(línea 2877-2883) se elimina** del flujo de `convertir-oc` — ya no hace
falta, el espejo se actualiza por evento igual que la creación.

Esto es lo que de verdad resuelve el riesgo de desincronización del Why:
antes había dos POST independientes desde Compras (uno pudo fallar sin
que el otro se enterara); ahora hay un solo commit real (GT) y un espejo
derivado de él.

### 4. `POST /presupuestos` (Finanzas) se restringe a capítulo `MANO_OBRA`

Para los 4 capítulos ligados a obra, la creación pasa a ser
exclusivamente automática (decisión 2). El endpoint manual **sigue
existiendo** pero valida `capitulo === 'MANO_OBRA'`; si se pide crear
`MATERIALES`/`SUBCONTRATOS`/`EQUIPOS`/`INDIRECTOS` a mano, responde 422
con mensaje explicando que esos presupuestos se sincronizan
automáticamente desde el presupuesto de obra aprobado en Gerencia
Técnica. No se elimina el endpoint (evita romper integraciones/scripts
existentes que sí crean `MANO_OBRA`).

### 5. `convertir-oc` resuelve `presupuesto_id` automáticamente por partida

`apps/compras/src/main.ts` ya calcula `conceptoId` desde la requisición
(línea 2747-2754) antes de necesitar `presupuesto_id`. Cambia el orden:
primero resolver `conceptoId`; si existe, buscar el
`PresupuestoAsignado` de Finanzas con ese `concepto_id` (nuevo endpoint
`GET /api/v1/finanzas/presupuestos/por-concepto/:conceptoId`) y usarlo
como `presupuesto_id` — el body deja de exigirlo. Si la requisición NO
tiene `concepto_id` (caso legado o excepcional), se conserva el
comportamiento actual (requiere `presupuesto_id` en el body, con el
selector manual del frontend como fallback) — no se rompe ese camino.

### 6. Presupuesto de Mano de Obra a nivel proyecto — conectar nómina

Se reutiliza el `PresupuestoAsignado` con `capitulo = 'MANO_OBRA'`
(`concepto_id = null`) tal cual existe hoy — **no es una tabla nueva**,
es el mismo modelo, solo que ahora algo lo consume. Finanzas se
suscribe a los eventos ya existentes:
- `personal.nomina_autorizada` → busca el `PresupuestoAsignado` ACTIVO
  con `capitulo = 'MANO_OBRA'` del `proyecto_id` del evento, crea
  `MovimientoPresupuestal` tipo `COMPROMISO` por `total_neto`
  (`referencia_modulo: 'personal'`, `referencia_entidad: 'PreNomina'`,
  `referencia_id: prenomina_id`), actualiza `monto_comprometido`.
- `personal.nomina_pagada` → mismo presupuesto, `MovimientoPresupuestal`
  tipo `EJERCIDO`, mueve el monto de `comprometido` a `ejercido`.
- Si no existe un `PresupuestoAsignado` `MANO_OBRA` activo para ese
  proyecto: se registra el movimiento igual (best-effort, no bloquea la
  nómina — la nómina nunca debe fallar por falta de presupuesto,
  Non-Goal implícito) pero se emite una alerta/log para que Finanzas cree
  el presupuesto de mano de obra.

Es capacidad nueva (`presupuesto-mano-obra-proyecto`) porque hoy este
enlace NO EXISTE — el capítulo `MANO_OBRA` existe en el schema pero
nunca se conecta a la nómina real.

### 7. Migración de `PresupuestoAsignado` existentes en producción

Los `PresupuestoAsignado` reales ya creados con capítulos ligados a obra
(no `MANO_OBRA`) **no se borran ni se migran automáticamente** — quedan
como están (su `MovimientoPresupuestal`/`ProgramaPagos` histórico sigue
siendo válido). Un script de un solo uso (uno por tenant/proyecto real en
prod, revisado a mano) marca `estatus = 'CERRADO'` en esos presupuestos
legacy **solo si** ya existe un `SaldoPartida` sincronizado para las
mismas partidas del proyecto (evita cerrar un presupuesto legacy que
sigue siendo la única cobertura real de un proyecto sin `PresupuestoBase`
aprobado en GT todavía). Proyectos sin presupuesto de obra aprobado en GT
siguen operando con su `PresupuestoAsignado` legacy hasta que se apruebe
uno.

## Risks / Trade-offs

- **[Riesgo] Proyectos reales que hoy usan `PresupuestoAsignado` legacy
  sin tener nunca un `PresupuestoBase` aprobado en GT quedarían sin poder
  generar OC** si se fuerza la resolución automática sin fallback. →
  Mitigación: decisión 5 conserva el flujo manual como fallback cuando no
  hay `concepto_id`; el script de migración (decisión 7) no cierra
  presupuestos legacy sin partida sincronizada equivalente.
- **[Riesgo] Evento `gerencia_tecnica.saldo_partida_creado` no llega a
  Finanzas** (RabbitMQ caído, patrón best-effort ya usado en todo el
  repo) → el presupuesto por partida no aparece en Finanzas, la OC cae al
  fallback manual (que fallará porque no hay presupuesto que elegir). →
  Mitigación: agregar un endpoint idempotente de resync manual (`POST
  /api/v1/finanzas/presupuestos/sync-partida/:conceptoId`, backend-to-backend
  desde GT o disparable a mano) para el caso de evento perdido — mismo
  patrón que ya existe para otros eventos del repo con reconciliación
  manual.
- **[Riesgo] Nómina sin presupuesto `MANO_OBRA` creado** → decisión 6 ya
  lo resuelve como best-effort no bloqueante, con alerta.
- **[Riesgo] Este change toca 4 servicios a la vez** (finanzas, compras,
  gerencia-tecnica, app-shell) → mitigación: orden de despliegue
  definido en Migration Plan, cada pieza es aditiva/tolerante a que la
  siguiente no esté desplegada todavía (feature flags implícitos: si
  Finanzas no tiene el endpoint nuevo, Compras cae al flujo manual
  existente sin romperse).

## Migration Plan

1. **GT**: agregar evento `gerencia_tecnica.saldo_partida_creado` al
   aprobar presupuesto (aditivo, no rompe nada existente). Actualizar
   spec `presupuesto-tope-partida` (quitar filas de nómina del ciclo de
   vida). Desplegar primero — no depende de nadie.
2. **Finanzas**: migración de schema (agregar `concepto_id`/`concepto_clave`
   nullable a `PresupuestoAsignado`, aditiva); nuevo subscriber de
   `gerencia_tecnica.saldo_partida_creado`; nuevos subscribers de
   `personal.nomina_autorizada`/`personal.nomina_pagada`; nuevo endpoint
   `GET /presupuestos/por-concepto/:conceptoId`; restringir `POST
   /presupuestos` a `MANO_OBRA`. Desplegar segundo.
3. **Compras**: `convertir-oc` resuelve `presupuesto_id` automático con
   fallback; quitar el POST directo a `comprometer-fondos` de Finanzas
   (el espejo ya se actualiza por evento vía GT). Desplegar tercero.
4. **app-shell**: simplificar/quitar el selector manual de presupuesto en
   `ComparativaDetail` cuando la requisición ya tiene partida. Desplegar
   último.
5. **Script de reconciliación** (decisión 7): correr manualmente contra
   producción después de que los 4 servicios estén desplegados y se haya
   verificado que el flujo nuevo funciona con al menos un proyecto real.

**Rollback**: cada paso es aditivo (columnas nullable, endpoints nuevos,
subscribers nuevos) — revertir el código de cada servicio a la versión
anterior es seguro en cualquier punto, no hay migración destructiva que
deshacer. El único paso no trivialmente reversible es el script de
reconciliación (decisión 7); por eso corre al final y solo cambia
`estatus`, nunca borra filas.

## Open Questions

(resueltas — ver decisiones 8 y 9 abajo, confirmadas con el usuario)

### 8. `capitulo` de una partida sincronizada = `categoria_predominante` calculada por GT

Hoy `categoria_predominante` de un `Concepto` solo se calcula on-the-fly
en `GET /reportes/control-presupuestal` (agrega por `ConceptoInsumo.tipo_insumo
× costo_unitario × cantidad`, ver `control-presupuestal-endpoint/spec.md:44-46`).
Este change **persiste** ese cálculo en `SaldoPartida` (columna nueva
`categoria_predominante`, calculada una vez al `upsert` en el mismo paso
de aprobación, mismo algoritmo que ya usa el reporte) y la incluye en el
payload de `gerencia_tecnica.saldo_partida_creado`. Finanzas mapea
`TipoInsumo` (`MATERIAL|MANO_DE_OBRA|EQUIPO|SUBCONTRATO|INDIRECTO`, catálogo
de GT) al `capitulo` de `PresupuestoAsignado`
(`MATERIALES|MANO_OBRA|SUBCONTRATOS|EQUIPOS|INDIRECTOS`) — mapeo 1:1 salvo
`MANO_DE_OBRA → MANO_OBRA` (mismo concepto, guion bajo distinto). Si un
`Concepto` no tiene ningún `ConceptoInsumo` (APU vacío, caso raro),
`categoria_predominante = null` y el `PresupuestoAsignado` sincronizado
cae en `capitulo = 'INDIRECTOS'` por default (no bloquea la sincronización).

### 9. Presupuestos sincronizados (`concepto_id != null`) son de solo lectura en Finanzas

`PATCH /api/v1/finanzas/presupuestos/:id` (si existe o se llegara a
agregar) SHALL rechazar con 422 cualquier intento de modificar
`monto_autorizado`, `descripcion` o `capitulo` cuando `concepto_id !=
null` — el mensaje debe indicar que la ampliación/transferencia se
solicita en Gerencia Técnica (`TransferenciaPartida`) y se refleja
automáticamente. Cualquier cambio real de monto en GT (transferencia
aprobada) dispara un nuevo evento de sincronización (mismo
`gerencia_tecnica.saldo_partida_creado` reusado como upsert, o uno
específico de transferencia si ya existe — ver
`transferencia-entre-partidas/spec.md`) que actualiza el espejo. Esto
evita que Finanzas y GT queden desincronizados por una edición manual de
un lado que el otro no ve.

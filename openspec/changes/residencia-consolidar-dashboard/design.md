## Context

`ResidenciaView.tsx` (`apps/app-shell/src/views/ResidenciaView.tsx`,
~3300 líneas) tiene 5 pestañas (`estimaciones` por defecto, `nomina`,
`equipo`, `asistencia`, `requisiciones`). Cuatro de ellas ya cargan sus
datos de forma perezosa, gateadas por `activeTab === '<tab>'`
(`estimaciones`: L597-600, `asistencia`: L603-618, `equipo`: L621-628,
`requisiciones`: L631+). Solo el `useEffect` de montaje (L529-559) es
incondicional: corre siempre, sin importar qué pestaña esté activa, y
hace 3 llamadas — `personal/prenominas`, `personal/complementos` (listas
completas) y `control-proyectos/dashboard/residente` (agregador).

`apps/control-proyectos/src/main.ts:1605` (`GET /dashboard/residente`) ya
es exactamente el patrón que `CLAUDE.md` describe como aceptable para
datos cruzados: agrega datos locales (`estimaciones_pendientes`) con una
llamada backend-to-backend a Compras (`requisiciones`,
`ordenes-compra`), usando `Promise.allSettled` + `timeout: 3000` +
`parcial: true` si la llamada falla. No llama a `personal`.

## Goals / Non-Goals

**Goals:**
- Que la carga inicial de `ResidenciaView` deje de depender de que
  `personal` esté arriba y responda rápido, sin perder los KPIs de
  nómina que hoy se muestran (aunque solo dentro de la pestaña Nómina).
- Extender el agregador ya existente en vez de crear uno nuevo — sigue
  el patrón ya validado (B2B + `Promise.allSettled` + `parcial`).
- Dejar la especificación de estos dos capabilities (`endpoint-
  dashboard-residentes`, `dashboard-entrada-residentes`) alineada con
  el código real, para que deje de describir una implementación que no
  existe (`control-obra`, `ResidentesView.tsx`,
  `evaluaciones_pendientes`).

**Non-Goals:**
- No se crea un servicio "residencia" ni un agregador único para las 31
  llamadas — la mayoría (asistencia QR/bulk, mi equipo, requisiciones
  CRUD, selector de insumos, subida de fichas, catálogo de conceptos)
  son lecturas/escrituras por pestaña legítimas, ya avaladas por specs
  existentes, y no caben en un endpoint de tipo `{ kpis, alertas,
  actividad_reciente }`.
- No se cambia el contrato del listado completo
  (`GET /api/v1/personal/prenominas` / `/complementos`) — sigue
  existiendo tal cual, solo se llama en otro momento (lazy, al abrir la
  pestaña) en vez de al montar la vista.
- No se toca `apps/personal` — el nuevo campo del agregador consume su
  endpoint de listado existente, sin cambios de ese lado.

## Decisions

**1. Extender `control-proyectos/dashboard/residente`, no crear un
agregador nuevo.**
Ya existe, ya tiene el patrón correcto de degradación, y ya se llama en
el mismo punto del ciclo de vida (montaje de `ResidenciaView`). Crear
un segundo endpoint sería duplicar lógica de agregación para el mismo
caso de uso.

**2. Los conteos de nómina se calculan en `personal` (vía su endpoint de
listado existente), filtrados en `control-proyectos` tras la
respuesta — no un endpoint de "conteo" nuevo en `personal`.**
Alternativa descartada: agregar `GET /api/v1/personal/prenominas/count`
en `personal`. Se descarta por alcance — el volumen de prenóminas y
complementos por proyecto es bajo (decenas, no miles), así que traer la
lista y contar en memoria (igual que ya hace `control-proyectos` con
`ordenes-compra` de Compras) es consistente con el patrón existente y no
justifica un endpoint nuevo en un servicio que esta propuesta declaró
fuera de alcance.

**3. Filtros de "pendiente" calcados de la lógica que ya usa el
frontend**, para no introducir un criterio nuevo:
- `prenominas_pendientes`: `estado === 'CALCULADA' && !revisado_por_residencia`
  (igual que `kpiNomina.pendientesRevision` en `ResidenciaView.tsx:763`).
- `complementos_pendientes`: `!revisado_por_residencia`
  (igual que el gate ya usado por `marcar-revisado` en
  `apps/personal/src/main.ts:2246`).

**4. La lista completa de nómina se vuelve lazy, gateada por
`activeTab === 'nomina'`, calcando literalmente el `useEffect` de
`asistencia`/`equipo`.**
No hay razón para tratar Nómina distinto a las otras 4 pestañas — es la
única que no seguía el patrón ya establecido en el mismo archivo.

**5. Las specs se corrigen para describir la implementación real, no
solo se les agregan los campos nuevos.**
Mantener la ruta/archivo/forma de respuesta incorrectos junto a los
campos nuevos dejaría la spec parcialmente mentirosa, que es peor que
no tenerla — alguien la seguiría para encontrar
`GET /api/v1/control-obra/dashboard/residente` y no existiría.

## Risks / Trade-offs

- [`personal` lento en la nueva llamada B2B ralentiza la carga del
  dashboard] → Mitigado por el mismo `timeout: 3000` + `Promise.allSettled`
  ya usado para Compras: si `personal` no responde a tiempo,
  `prenominas_pendientes`/`complementos_pendientes` quedan en `null` y
  `parcial: true`, sin bloquear el resto del panel.
- [El panel de KPIs de nómina mostraba antes datos siempre frescos —
  ahora depende de que `control-proyectos` haga bien el B2B] →
  Aceptado: es exactamente el mismo trade-off que ya existe hoy para
  `mis_requisiciones`/`ocs_por_recibir` (datos de Compras vistos a
  través de `control-proyectos`), no uno nuevo.
- [Mover la carga de nómina a lazy podría introducir un parpadeo de
  "cargando" al abrir la pestaña que antes no existía] → Mismo patrón
  ya visible hoy al abrir `asistencia`/`equipo`/`requisiciones`;
  consistente con el resto de la vista, no una regresión de UX nueva.

## Migration Plan

1. Backend: agregar `PERSONAL_URL` y la llamada B2B en
   `control-proyectos/dashboard/residente`, con `parcial` combinando el
   resultado de la llamada a Compras (ya existente) y la nueva a
   `personal` (si cualquiera de las dos falla, `parcial: true`).
2. Frontend: mover las 2 llamadas de nómina del montaje al
   `useEffect` gateado por `activeTab === 'nomina'`; el panel de KPIs
   superior pasa a leer `dashData.prenominas_pendientes` /
   `dashData.complementos_pendientes`.
3. Actualizar los dos specs afectados.
4. Verificar manualmente: cargar Residencia con `personal` apagado →
   el panel superior debe mostrar `parcial: true` sin bloquear
   Estimaciones/OCs; abrir la pestaña Nómina → debe seguir funcionando
   igual que antes (llamada directa a `personal`, ahora lazy).
5. Rollback: revertir el commit — no hay migración de datos ni cambio
   de esquema, es aditivo en el endpoint y un refactor de timing en el
   frontend.

## Open Questions

Ninguna — el alcance quedó acotado a la carga inicial; las llamadas
por pestaña quedan fuera deliberadamente (ver Non-Goals).

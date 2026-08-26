## Context

`ResidenciaView.tsx` (368–3311, ~2940 líneas de componente) es un único `React.FC<{ activeSubView?: string }>` que:

- Deriva `activeTab` de la prop `activeSubView` (`estimaciones | nomina | equipo | asistencia | requisiciones`).
- Mantiene un bloque de estado (`useState`) por tab, ya agrupado hoy con comentarios tipo `// ── Carga de asistencia + cuadrillas...` — la separación por tab ya existe *lógicamente*, solo no está separada en archivos.
- Tiene 4 `useEffect` de carga de datos, cada uno con guard `if (activeTab !== '<tab>' || isDemo) return;` — ya aislados por tab.
- Comparte entre tabs: `tenant`/`isDemo` (contexto), `loading` inicial, `helpOpen`, y `dashData` (KPIs que se muestran arriba de cualquier tab, independientes del tab activo).
- Tiene helpers/tipos usados por más de un tab (badges de estado, formateo, un modal genérico) definidos antes del componente (líneas 60–366).
- El tab `requisiciones` concentra la mayor complejidad (flujos "por insumo", "desde APU", "imprevisto", takeoff de materiales) y es, con probabilidad, el de mayor riesgo si se mueve mal.
- 6 archivos de test (`ResidenciaView.*.test.tsx`) ya cubren asistencia, estimaciones, equipo y nómina, y todos importan únicamente `{ ResidenciaView } from './ResidenciaView'` y renderizan el componente — no importan símbolos internos.

Esto es refactor puro de un módulo legacy: CLAUDE.md exige spec antes de tocarlo y prohíbe cambiar comportamiento sin justificarlo como bug-fix. Aquí no hay bug: es reorganización de archivos.

## Goals / Non-Goals

**Goals:**
- Que un cambio en un tab solo requiera tocar (y por tanto solo pueda romper) el archivo de ese tab.
- Cero cambio de comportamiento observable: mismas rutas de API, mismo render, mismos textos, mismo estado inicial.
- Mantener sin cambios el contrato público: `export const ResidenciaView: React.FC<{ activeSubView?: string }>` en `apps/app-shell/src/views/ResidenciaView.tsx`, para que `App.tsx` y los 6 tests existentes no requieran modificación.
- Extracción incremental, un tab a la vez, con la suite de tests como gate entre cada paso.

**Non-Goals:**
- No se optimiza performance (no se introduce `React.lazy`/code-splitting por tab en este cambio — puede proponerse después como cambio aparte).
- No se cambia el KPI header compartido (`dashData`) a su propio componente — queda en el orquestador. Extraerlo es una mejora adicional, no parte de este cambio.
- No se corrige ningún bug ni se toca lógica de negocio, validaciones, ni llamadas a API existentes.
- No se agregan tests nuevos por defecto — se reutilizan los 6 existentes como red de seguridad. Solo si al mover un tab se detecta que quedó sin ninguna cobertura, se marca como hallazgo (no se bloquea el refactor por eso, pero se documenta en `tasks.md`).

## Decisions

**1. Estructura de carpetas:** nuevo subdirectorio `apps/app-shell/src/views/residencia/` con:
- `shared.tsx` — tipos compartidos (`TabId`, `EstimacionEstado`, etc.), badges de estado, helpers de formato, el modal genérico (líneas ~60–366 actuales).
- `EstimacionesTab.tsx`, `NominaTab.tsx`, `AsistenciaTab.tsx`, `EquipoTab.tsx`, `RequisicionesTab.tsx` — un componente por tab, cada uno dueño de su propio estado, efectos, handlers y JSX.

  *Alternativa descartada:* convertir `ResidenciaView.tsx` en `ResidenciaView/index.tsx`. Se descarta porque no aporta nada sobre un subdirectorio hermano y complica el diff (git ve el archivo como borrado+creado en vez de modificado).

**2. `ResidenciaView.tsx` como orquestador delgado:** conserva `tenant`/`isDemo`, `loading` inicial, `helpOpen`, `dashData` (fetch y render del KPI header), la barra de navegación de tabs, y el `HelpPanel`. Renderiza `<EstimacionesTab isDemo={isDemo} />` etc. según `activeTab`.

  *Alternativa descartada:* pasar toda la lógica de fetch de `dashData` a cada tab. Se descarta porque `dashData` no depende del tab activo (se ve en todos), así que vive naturalmente en el orquestador.

**3. Estado tab-específico vive dentro del componente de ese tab, y los 5 tabs se montan siempre (nunca condicionalmente).** Hoy los 5 tabs son un único componente que **nunca se desmonta** — solo su JSX se oculta con `{activeTab === 'x' && (...)}`. Eso significa que el estado local de un tab (paneles abiertos, borradores de formulario, checkboxes de un bulk-check, búsqueda de un catálogo) **sobrevive** al cambiar de tab y volver, aunque los `useEffect` de *fetch* sí se re-disparan cada vez que ese tab se vuelve a activar (dependencia `[activeTab, isDemo]`).

  Si `ResidenciaView.tsx` incluyera `<EstimacionesTab />` solo cuando `activeTab === 'estimaciones'` (montaje condicional), React desmontaría el componente al salir del tab — perdiendo todo su estado local. Eso es un cambio de comportamiento real (ej. un residente llenando el panel de "Nueva Requisición", cambia de tab para revisar algo y pierde lo escrito), y viola el objetivo de cero cambio de comportamiento.

  **Decisión corregida:** los 5 `*Tab.tsx` se renderizan **siempre** (elemento siempre presente en el árbol), con una prop `active: boolean` (`activeTab === 'x'`):
  - Los hooks (`useState`, `useEffect`) del tab se declaran incondicionalmente, como en cualquier componente.
  - El *fetch* de datos se gatea igual que hoy pero contra `active` en vez de comparar `activeTab` contra un literal: `useEffect(() => { if (!active || isDemo) return; ...}, [active, isDemo])` — mismo disparo en cada activación, mismo comportamiento observable.
  - El JSX del tab termina con `if (!active) return null;` (después de declarar todos los hooks — válido en React, el componente sigue montado, solo no pinta nada), replicando el `{activeTab === 'x' && (...)}` de hoy pero preservando el estado porque el componente nunca se desmonta.

  *Riesgo de este approach:* si dos tabs comparten alguna pieza de estado que hoy no es obvia (por ejemplo, si cambiar de tab sin desmontar preservaba un valor). Mitigación: antes de mover cada tab, grep de cada variable de estado de ese bloque para confirmar que ningún otro bloque de tab la lee: si aparece fuera de su rango de líneas, se sube a `ResidenciaView.tsx` como prop compartida en vez de moverla.

  *Hallazgo de este grep aplicado a `conceptos` (catálogo de partidas):* tanto `estimaciones` como `requisiciones` leen y **sobrescriben por completo** el mismo estado `conceptos` en el archivo original, cada uno con su propio efecto gateado por su propio tab activo, con un mapeo ligeramente distinto (el de `estimaciones` incluye `precio_unitario`/`cantidad_presupuestada`; el de `requisiciones` no). Como cada tab siempre re-fetchea `conceptos` por completo en cuanto se activa (nunca lee el valor dejado por el otro tab — cada uno pisa la lista entera al montar/activarse), **no hay sincronización real entre ambos**: es seguro darle a cada tab su propia copia local de `conceptos` (mismo nombre de variable, dos módulos distintos) en vez de subirlo al orquestador. Esto se verificó leyendo cada uso de `conceptos`/`conceptoSeleccionado`/`materialesTakeoff` línea por línea antes de decidir.

**4. Orden de extracción — del tab más simple al más complejo,** para validar el patrón con bajo riesgo antes de tocar el más delicado:
`equipo` → `asistencia` (incluye escaneo QR) → `nomina` → `estimaciones` → `requisiciones` (el más grande y con más flujos).

**5. `shared.tsx` se extrae primero**, antes que cualquier tab, para que los 5 componentes de tab tengan de inmediato un lugar común de donde importar tipos/badges/helpers sin duplicarlos.

**6. La "carga inicial" (hoy un único `useEffect` en líneas ~528–559) se reparte así:** hoy ese efecto hace dos cosas a la vez — (a) en modo demo, siembra de un golpe `estimaciones`/`avances`/`prenominas`/`complementos`/`asistencia`/`equipoPorCategoria` desde constantes `DEMO_*`; (b) en modo real, dispara `Promise.allSettled` sobre `prenominas`, `complementos` y `dashboard/residente` juntos, y solo entonces apaga el spinner de página (`loading`).
  - `dashData` y `loading` se quedan en el orquestador (son del header, no de un tab). El orquestador dispara su propio fetch a `dashboard/residente` para `dashData`.
  - La siembra demo de cada tab se mueve al propio `*Tab.tsx`, en un efecto `useEffect(() => { if (isDemo) { ...seed... } }, [isDemo])` que corre una sola vez al montar (los tabs se montan siempre, ver Decisión 3) — mismo resultado visual que hoy.
  - `NominaTab` mueve su propio fetch de `prenominas`+`complementos` a un efecto propio sin gate de `active` (dispara una sola vez al montar, igual que hoy dispara sin importar qué tab esté activo).
  - **Trade-off aceptado:** al desacoplar el fetch de `dashData` del de `prenominas`/`complementos`, el spinner de página (`loading`) puede apagarse un poco antes que hoy (ya no espera a que las 3 llamadas junto con `Promise.allSettled` terminen). Esto es cosmético — no cambia ningún dato mostrado — y en el peor caso, si el usuario navega al tab Nómina en la ventana de unos cientos de ms mientras esa llamada sigue en vuelo, vería la tabla vacía brevemente en vez de ver el spinner de página completo. Se acepta este trade-off en vez de mantener el fetch de nómina acoplado al del header en el orquestador, porque lo segundo reintroduce exactamente el acoplamiento cross-tab que este cambio busca eliminar.

## Risks / Trade-offs

- **[Riesgo]** Mover un bloque de estado que en realidad se leía desde otro tab (acoplamiento oculto) → **[Mitigación]** grep por nombre de variable en todo el archivo antes de mover cada bloque; si hay lectura cruzada, esa pieza sube al orquestador como prop.
- **[Riesgo]** Duplicar helpers/badges en más de un tab por apuro → **[Mitigación]** `shared.tsx` se crea primero y es la única fuente; nada se redefine localmente en un `*Tab.tsx`.
- **[Riesgo]** Romper el import `{ ResidenciaView } from './ResidenciaView'` que usan `App.tsx` y los 6 tests → **[Mitigación]** el nombre, ruta y firma del export no cambian; es la primera verificación tras cada paso (`npm run build` del app-shell + suite de tests de `ResidenciaView`).
- **[Riesgo]** Un PR único con las 3311 líneas movidas de golpe reintroduce el mismo problema que se quiere resolver (revisar/revertir todo junto) → **[Mitigación]** una extracción de tab = un commit (idealmente un PR chico) independientemente verificable; ver orden en Decisión 4.
- **[Trade-off]** Queda `dashData`/KPI header sin extraer del orquestador, que seguirá teniendo unas ~300–400 líneas tras el refactor (fetch inicial + header + nav de tabs + wiring). Se acepta porque ya no concentra los 5 tabs y es sustancialmente más chico y de menor cambio que hoy.

## Migration Plan

1. Crear `views/residencia/shared.tsx` moviendo tipos/badges/helpers/modal genérico. `ResidenciaView.tsx` importa desde ahí. Build + tests.
2. Extraer `EquipoTab.tsx`. Build + tests (`ResidenciaView.mi-equipo.test.tsx` como gate directo).
3. Extraer `AsistenciaTab.tsx` (incluye lógica de cámara/QR). Build + tests (`ResidenciaView.confirmacion-guardar-asistencia-bulk.test.tsx`).
4. Extraer `NominaTab.tsx`. Build + tests (`ResidenciaView.marcar-revisado-nomina.test.tsx`, `ResidenciaView.confirmacion-aprobar-nomina.test.tsx`).
5. Extraer `EstimacionesTab.tsx`. Build + tests (`ResidenciaView.estimaciones-avance-fisico.test.tsx`, `ResidenciaView.confirmacion-crear-avance-estimacion.test.tsx`).
6. Extraer `RequisicionesTab.tsx` (último, mayor complejidad). Build + tests (`ResidenciaView.ficha-tecnica.test.tsx`).
7. Verificación final: suite completa de `apps/app-shell`, y smoke manual de los 5 tabs en el dashboard de Residencia (vía skill `run-app-shell`) antes de dar el cambio por cerrado.

**Rollback:** cada paso es un commit aislado de puro movimiento de código (sin cambios de comportamiento); revertir el último commit basta si un paso rompe algo. No hay migración de datos ni de infraestructura involucrada.

## Open Questions

- ¿Vale la pena, en un cambio futuro separado, extraer también el KPI header (`dashData`) a su propio componente? Se deja fuera de este cambio; no es parte del pedido ("partir la vista por tab").

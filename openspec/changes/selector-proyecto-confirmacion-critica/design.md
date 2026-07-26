## Context

`app-shell` es una SPA React 19 única que sirve todos los módulos; el usuario cambia de
"proyecto activo" (obra) desde un dropdown en el header (`apps/app-shell/src/components/Layout.tsx:513-573`).
`TenantContext.tsx` guarda `currentProjectId` en estado de React y, al cambiar
(`setCurrentProjectId`, línea 223), pide un JWT nuevo vía `switchProjectApi` **antes** de
actualizar el estado — esto ya es correcto y no se toca.

Hoy el indicador de proyecto activo es texto pequeño (`text-xs font-bold`, `bg-primary/10`,
igual para cualquier proyecto) en la esquina superior izquierda. Las acciones críticas ya
identificadas ejecutan directo sin ningún paso de confirmación:
- `ComprasView.tsx:1395` `handleAprobar` → `PATCH /api/v1/compras/requisiciones/:id/aprobar`,
  disparado desde el `onClick` de la línea 1923, sin modal previo.
- `ComparativaDetail.tsx:1350` `handleFirmar` → `POST /api/v1/compras/comparativas/:id/firmar`.
  Este caso **ya tiene** un modal de confirmación ad-hoc (líneas ~3112-3161) con advertencia de
  bloqueo permanente, pero sin mencionar el proyecto activo.
- Autorización/pago de nómina en `PersonalView.tsx` (acción referenciada en PR #87 histórico,
  rol `rh_manager`/`personal_rh`) — el handler exacto se localiza durante la implementación
  (tasks.md incluye tarea de descubrimiento) porque el nombre de función pudo cambiar desde
  entonces.

No existe hoy en `packages/ui-core` ningún primitivo de diálogo de confirmación
(`primitives.tsx` tiene `Button`, `Card`, `SideSheet`, `Table`, etc. pero no `Dialog`/`Modal`)
— cada vista que necesita confirmar algo (como `ComparativaDetail.tsx`) lo resuelve con su
propio modal inline.

## Goals / Non-Goals

**Goals:**
- Hacer que el proyecto activo sea reconocible de un vistazo, sin leer texto, y consistente
  en toda la SPA (mismo color para el mismo proyecto en cualquier vista).
- Forzar una confirmación explícita, con el nombre del proyecto activo en el texto, antes de
  las 3 acciones críticas identificadas (aprobar OC, firmar evaluación, autorizar/pagar nómina).
- Introducir un componente de confirmación reutilizable en `ui-core` para no duplicar el patrón
  ad-hoc que ya existe en `ComparativaDetail.tsx`.

**Non-Goals:**
- No se toca `TenantContext.tsx` ni `switchProjectApi` ni el mecanismo de JWT/scope de proyecto
  — ese mecanismo ya es seguro.
- No se añade confirmación a acciones no destructivas (navegación, filtros, formularios que aún
  no envían, exportar reportes, etc.).
- No se implementa aquí un selector de proyecto "obligatorio al iniciar sesión" (alternativa de
  diseño discutida y descartada para este change; el usuario puede seguir recordando el último
  proyecto activo).
- No se cambia el backend: ningún endpoint ni contrato de API se modifica.

## Decisions

**1. Color determinístico por proyecto, no asignado a mano.**
Se deriva un color de una paleta fija (6-8 tonos accesibles en light/dark) mediante un hash
simple y estable de `project.id` (ej. suma de char codes % tamaño de paleta). Alternativa
descartada: guardar un color por proyecto en la base de datos de `auth` — se rechaza porque
añade un campo de backend y una migración para un problema que es puramente de percepción
visual en el frontend; un hash determinístico da el mismo resultado (mismo proyecto → mismo
color siempre) sin tocar backend.

**2. Indicador de proyecto activo: banda de color + código, no solo dropdown de texto.**
Se mantiene el dropdown existente (`Layout.tsx`) como mecanismo de cambio, pero se le añade una
banda/borde de color (el color determinístico del proyecto activo) y se aumenta el tamaño/peso
visual del código del proyecto. Alternativa descartada: mover el selector a un modal de pantalla
completa en cada cambio — se rechaza porque agrega fricción a una acción frecuente (cambiar de
proyecto no es la acción riesgosa; actuar sin darse cuenta del proyecto sí lo es).

**3. Un componente de confirmación compartido en `ui-core`, no modales ad-hoc por vista.**
Se añade `ConfirmCriticalActionDialog` (o nombre equivalente) a `packages/ui-core/src/primitives.tsx`,
parametrizado con: título, descripción de la acción, nombre+color del proyecto activo, texto del
botón de confirmar. `ComparativaDetail.tsx` migra su modal ad-hoc existente a este componente
(en vez de mantener dos implementaciones del mismo patrón). Alternativa descartada: dejar el
modal de `ComparativaDetail.tsx` como está y solo agregarle el nombre del proyecto — se rechaza
porque `ComprasView.tsx` (aprobar OC) y `PersonalView.tsx` (nómina) necesitan el mismo patrón
desde cero, y duplicarlo en 3 vistas es peor que extraerlo una vez.

**4. Confirmación gateada por acción, no por rol ni por "modo multi-proyecto".**
La confirmación aparece siempre para las 3 acciones críticas, incluso si el usuario solo tiene
un proyecto asignado. Alternativa descartada: solo mostrarla cuando `user.projects.length > 1`
— se rechaza porque un usuario con un solo proyecto hoy puede tener dos mañana (alta de proyecto
nuevo), y condicionar el comportamiento de una vista a un valor que cambia con el tiempo es más
frágil que ser consistente siempre.

## Risks / Trade-offs

- [Riesgo: fricción percibida como molesta en flujos de alto volumen, ej. aprobar muchas OC
  seguidas] → Mitigación: el diálogo es un solo clic adicional (no un formulario), y se limita
  estrictamente a las 3 acciones ya identificadas como críticas/irreversibles — no se expande a
  aprobaciones de bajo riesgo.
- [Riesgo: colores determinísticos podrían coincidir visualmente entre dos proyectos si la
  paleta es corta y hay muchos proyectos activos] → Mitigación: el color es un refuerzo visual,
  no el único identificador — el código/nombre del proyecto sigue mostrándose en texto junto al
  color, tanto en el indicador del header como en el texto del diálogo de confirmación.
- [Riesgo: migrar el modal existente de `ComparativaDetail.tsx` a `ConfirmCriticalActionDialog`
  podría cambiar sutilmente su comportamiento actual (ej. el checkbox/validación de veredicto
  antes de habilitar "Firmar")] → Mitigación: tasks.md incluye una tarea explícita de verificar
  que las validaciones previas a firmar seguyen intactas después de la migración, con test de
  regresión antes de tocar el archivo.

## Migration Plan

No aplica migración de datos (cambio puramente de frontend, sin nuevas columnas ni tablas). El
despliegue es el ciclo normal: PR contra `main` → build de `app-shell` (`tsc -b`, no solo
`--noEmit`, según gotcha ya documentado) → verificación manual en navegador → deploy VPS del
contenedor de `app-shell`. Rollback: revertir el PR (no hay estado persistente nuevo que limpiar).

## Open Questions

- ¿El handler exacto de autorizar/pagar nómina en `PersonalView.tsx` sigue vigente con ese
  nombre, o cambió desde el PR #87 histórico? Se resuelve como tarea de descubrimiento en
  tasks.md antes de envolverlo con el diálogo de confirmación.
- ¿La paleta de colores determinísticos debe coincidir con la paleta de marca/tenant
  (`tenant.primaryColor`) o ser independiente? Por ahora se asume independiente (colores de
  proyecto son para distinguir entre sí, no para branding), a confirmar con QA visual manual.

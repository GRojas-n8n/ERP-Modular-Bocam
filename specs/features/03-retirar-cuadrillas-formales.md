# Refactor de legacy — Retirar formación de cuadrillas estructurales

> Refactor de legacy sobre `apps/personal` + `apps/app-shell`. Según
> `specs/README.md`, un refactor de legacy solo procede con spec explícito
> (tabla "Lo que NO funciona en iRetum" / fila "Refactor de legacy"). Este
> documento es ese spec.

> **Estado: propuesto, sin implementar.** Depende de
> `specs/features/02-asignacion-empleados-residente-prestamos.md` — no
> empezar este spec hasta que la sección 5 de ese spec ("Mi equipo") esté
> implementada, porque es el reemplazo funcional de lo que aquí se retira.

## 1. Contexto

Decisión de negocio (conversación con el usuario, 2026-07-29): la
formación de cuadrillas estructurales (`Cuadrilla`, dirigida por capataz,
ver `apps/personal/prisma/schema.prisma:92-112`) **ya no es el mecanismo**
para organizar personal. El modelo pasa a ser 100% asignación de empleado
a Residente + `AsignacionFrente` por proyecto, según
`specs/features/02-asignacion-empleados-residente-prestamos.md`.

Este NO es un bug — es retirar una entidad legacy que sigue en uso activo
hoy (nómina, asistencia, dashboards, UI de RH). Auditoría del código real
encontró que `Cuadrilla` está más enredada en el sistema de lo que parece
a simple vista: no es solo un tab de UI, es un fallback silencioso de
elegibilidad de nómina y el mecanismo principal de registrar asistencia en
lote. Retirarla sin reemplazo rompe ambos. Este spec documenta exactamente
qué depende de `Cuadrilla` hoy y en qué orden reemplazarlo.

## 2. Dependencias ocultas confirmadas (deben resolverse en este orden)

### 2.1 — Elegibilidad de nómina tiene fallback silencioso por `Cuadrilla`

`obtenerEmpleadoIdsDelProyecto` (`apps/personal/src/main.ts:519-539`) arma
la lista de empleados elegibles de un proyecto como la unión de (a)
`AsignacionFrente` `ACTIVA` en ese proyecto y (b) empleados cuya
`Cuadrilla.proyecto_id` coincide — comentario explícito en el código:
"fallback para quienes no tienen frente explícito". Esta lista alimenta
directamente a `calcular()` de PreNomina (línea 640-644): quien no está en
esta lista, no recibe nómina en ese proyecto.

**Riesgo:** si hoy existen empleados elegibles **solo** por (b) — miembros
de una `Cuadrilla` pero sin ninguna `AsignacionFrente` propia — remover el
fallback sin más los deja fuera de elegibilidad de nómina en cualquier
proyecto, silenciosamente. Nadie lo notaría hasta que falte alguien en una
nómina calculada.

**Antes de tocar código:** correr una auditoría de solo lectura contra la
base de datos real (no se puede saber cuántos casos hay sin consultarla)
que liste, por proyecto, empleados con `cuadrilla_id` activo y CERO
`AsignacionFrente` `ACTIVA` propia. Cada caso encontrado necesita una
`AsignacionFrente` creada a mano (RH decide frente/turno/horas reales, no
es inferible de los datos de `Cuadrilla`) antes de remover el fallback.

### 2.2 — Registro manual de asistencia en lote agrupa por `Cuadrilla`

`ResidenciaView.tsx`, tab "Asistencia": el selector "Cuadrilla"
(línea 1590-1596) y los botones "✏ Manual [código]" por cuadrilla
(línea 1609-1621, cada uno llama `handleAbrirManualQR`) son la forma
principal de marcar presente a varios empleados de un golpe hoy. Retirar
`Cuadrilla` sin reemplazo obliga a marcar asistencia uno por uno.

**Reemplazo:** agrupar por "mi equipo" (empleados con `AsignacionResidente`
activa hacia el residente autenticado — mismo dato que
`GET /api/v1/personal/mis-empleados` o el `/resumen` nuevo de spec 02) en
vez de por `Cuadrilla`. El botón de marcado en lote pasa a ser "Marcar
asistencia de mi equipo", sin selector de cuadrilla.

`RegistroAsistencia.cuadrilla_id` (`schema.prisma:229`) no se elimina del
modelo (ver D1) — el flujo nuevo simplemente deja de poblarlo (queda
`null` en registros creados desde este flujo en adelante).

### 2.3 — Dashboards muestran `cuadrillas_activas` como KPI

`apps/personal/src/main.ts:944-986` (dashboard general) y `:2102-2109`
(otro endpoint de resumen) cuentan `prisma.cuadrilla.count({ where: {
estado: 'ACTIVA' } })` como KPI `cuadrillas_activas`. Al dejar de crear
cuadrillas nuevas, ese número solo puede bajar (bajas) o quedar
congelado — deja de significar nada útil.

**Reemplazo:** KPI `empleados_con_residente_asignado` — cuenta de
`AsignacionResidente` con `fecha_fin: null`, agrupable por proyecto vía
join con `AsignacionFrente` activa del empleado si se necesita desglose
por obra.

### 2.4 — Columna "Cuadrilla" en la tabla de empleados de `PersonalView.tsx`

Línea ~1183 (header `<TableHead>Cuadrilla</TableHead>`) y 1220-1222
(`empleado.cuadrilla.codigo`) muestran la cuadrilla del empleado en el
listado de RH.

**Reemplazo:** columna "Residente" mostrando el residente principal
actual. Requiere que `GET /api/v1/personal/empleados` incluya la
`AsignacionResidente` activa de cada empleado (hoy no la incluye — el
`include` de la línea 90 solo trae `cuadrilla`).

## 3. Decisiones de diseño

**D1 — ¿Se borra el modelo `Cuadrilla` y sus tablas, o se deja inerte?**

**Decisión: se deja inerte, no se borra.** Se retira el *uso* (no se crean
cuadrillas nuevas, no se asignan miembros nuevos, sin UI de administración)
pero el modelo, la tabla y los datos existentes permanecen.

Razones:
- `RegistroAsistencia` históricos referencian `cuadrilla_id` — es dato de
  producción ya escrito, no hay necesidad real de borrarlo.
- Una migración destructiva (`DROP TABLE`) sobre datos de producción sin
  motivo operativo (nadie pidió liberar espacio, no hay conflicto de
  mantenimiento) es exactamente el tipo de acción irreversible que este
  proyecto evita salvo necesidad clara.
- Deja la puerta abierta a auditar histórico ("¿qué cuadrilla tenía este
  empleado en 2025?") sin reconstruir nada.
- Si con el tiempo se confirma que nadie consulta ese histórico, un spec
  de limpieza aparte puede revisitar el borrado — no es esta spec.

**D2 — ¿Se oculta el tab "Cuadrillas" de `PersonalView.tsx` o se deja
visible en modo solo-lectura?**

**Decisión: se oculta de la navegación.** `TabId` deja de incluir
`'cuadrillas'`, el botón "Nueva Cuadrilla" (línea 997-998) se retira, la
condición ternaria del botón principal (línea 995-999) se simplifica a
`'empleados' | 'prenomina' | 'pases'`.

Razones:
- Dejarlo visible en solo-lectura sin poder crear/editar genera la
  pregunta obvia de "¿por qué no puedo agregar gente aquí?" sin aportar
  nada que el tab "Mi equipo" (spec 02, sección 5) no cubra ya.
- RH ya no necesita administrar esta entidad activamente bajo el nuevo
  modelo — su punto de administración pasa a ser
  `POST /api/v1/personal/empleados/:id/residentes` (ya existente) y el
  endpoint de préstamo de spec 02.

**D3 — ¿Backfill automático o revisado por humano para los huérfanos de 2.1?**

**Decisión: revisado por humano, no automático.** Se propone un script de
auditoría (solo lectura) que **lista** los casos, no uno que los corrija
solo.

Razones:
- Inferir `frente_trabajo`, `turno` y `horas_diarias` correctos para una
  `AsignacionFrente` nueva no es mecánico — depende de contexto real de
  obra que no está codificado en los datos de `Cuadrilla` (`especialidad`
  de la cuadrilla no es lo mismo que `frente_trabajo` de una asignación).
- Un backfill automático con valores por defecto arriesga crear
  asignaciones formalmente correctas pero operativamente falsas (ej.
  turno incorrecto), que luego contaminan nómina real — el mismo tipo de
  riesgo que este spec entero busca evitar.

## 4. Casos borde

- Empleado con `Cuadrilla` activa pero sin `AsignacionFrente` ni
  `AsignacionResidente` — tras el retiro del fallback (2.1), deja de ser
  elegible en cualquier proyecto para nómina. Debe detectarse en la
  auditoría de 2.1/D3 antes de remover el fallback, no descubrirse en
  producción cuando falte alguien en una nómina calculada.
- Registros de asistencia históricos con `cuadrilla_id` poblado — deben
  seguir siendo legibles/reportables sin cambios; solo cambia cómo se
  genera un registro **nuevo** desde el flujo de marcado en lote (2.2).
- Un residente marca asistencia en lote a su equipo (spec 02) y alguno de
  ellos está prestado ese día a otro proyecto (`compartido: true` según
  spec 02 sección 5) — el flujo de marcado en lote debe advertirlo en vez
  de dejarlo marcar presente en el proyecto equivocado.
- Empleado dado de baja (`estado: BAJA`) que aún tiene `cuadrilla_id`
  poblado (línea 333 de `main.ts` limpia `cuadrilla_id` al dar de baja) —
  ya se limpia hoy, sin cambios necesarios aquí.

## 5. Fuera de alcance

- Borrado del modelo `Cuadrilla`/tabla `cuadrillas` o de
  `RegistroAsistencia.cuadrilla_id` — explícitamente diferido (D1).
- Backfill automático sin revisión humana de empleados huérfanos (D3).
- Rediseño de `capataz_id`/`capataz_nombre` como concepto de liderazgo de
  campo — si se necesita un "líder de equipo" bajo el nuevo modelo, es una
  decisión aparte, no cubierta aquí.
- Endpoints legacy `GET/POST /api/v1/personal/cuadrillas` y
  `POST /api/v1/personal/cuadrillas/:id/asignar` — se dejan de **llamar**
  desde el frontend nuevo, pero no se eliminan del backend (compatibilidad
  con datos/integraciones existentes).

## 6. Tests requeridos

- `apps/personal`: test de que `obtenerEmpleadoIdsDelProyecto` ya no
  incluye el fallback por `Cuadrilla` tras 2.1 — un empleado con
  `Cuadrilla` en el proyecto pero sin `AsignacionFrente` NO aparece como
  elegible.
- `apps/personal`: test de que el dashboard reporta
  `empleados_con_residente_asignado` basado en `AsignacionResidente`
  activa (2.3).
- `apps/app-shell`: test de que `ResidenciaView.tsx` ya no muestra el
  selector "Cuadrilla" ni los botones "✏ Manual [código]" en el tab de
  asistencia, y que el marcado en lote usa "mi equipo" (2.2).
- `apps/app-shell`: test de que el marcado en lote advierte (no bloquea
  silenciosamente ni deja pasar) cuando un empleado del equipo está
  `compartido: true` ese día.
- `apps/app-shell`: test de que `PersonalView.tsx` ya no tiene el tab
  "Cuadrillas" ni el botón "Nueva Cuadrilla" (D2), y que la columna de la
  tabla de empleados muestra el residente principal (2.4).
- `apps/personal`: test de regresión — `GET/POST /api/v1/personal/cuadrillas`
  siguen respondiendo 200/201 (no se borran del backend), confirmando que
  el retiro es solo de uso activo, no de disponibilidad del endpoint.

## 7. Orden de implementación sugerido

1. Confirmar que `specs/features/02-asignacion-empleados-residente-prestamos.md`
   sección 5 ("Mi equipo") está implementada — es el reemplazo funcional.
2. Auditoría de datos reales (2.1/D3): script de solo lectura contra
   producción, backfill manual revisado por humano de los huérfanos
   encontrados.
3. Remover el fallback de `Cuadrilla` en `obtenerEmpleadoIdsDelProyecto`
   (2.1) — solo después de que 2 confirme cero huérfanos pendientes.
4. Reemplazar agrupación de asistencia manual en `ResidenciaView.tsx`
   (2.2) por "mi equipo", con la advertencia de empleados compartidos.
5. Reemplazar KPI de dashboard (2.3).
6. Ocultar tab "Cuadrillas" y botón "Nueva Cuadrilla" en `PersonalView.tsx`,
   reemplazar columna por residente principal (2.4, D2).

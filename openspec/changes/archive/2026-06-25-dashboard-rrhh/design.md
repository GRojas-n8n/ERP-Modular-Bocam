## Context

El módulo de RRHH usa `apps/personal`. Maneja empleados, asistencia, nómina e incidencias. Todos los datos son nativos del microservicio. El dashboard de RRHH aplica a nivel tenant (toda la empresa), no por proyecto — a diferencia de los otros dashboards que filtran por `proyectoId`.

## Goals / Non-Goals

**Goals:** Dashboard operativo de RRHH con asistencia del día y alertas urgentes.
**Non-Goals:** Cálculo en tiempo real de nómina desde el dashboard (solo fecha del próximo corte).

## Decisions

### D1: Dashboard a nivel tenant, no proyecto
RRHH gestiona empleados de toda la empresa. El filtro es `tenantId`, no `proyectoId`. Si en el futuro se necesita por proyecto (obra), se agrega `proyectoId` opcional.

### D2: Asistencia del día calculada al momento
El count de presentes/ausentes se calcula en tiempo real contra los registros de asistencia del día actual — no se cachea para evitar datos desactualizados.

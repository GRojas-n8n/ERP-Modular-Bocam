## Context

`DashboardView.tsx` (vista estándar, roles no-ejecutivos) renderiza una tarjeta por proyecto en `user?.projects` y calcula su "Avance General" con `Math.min(35 + index * 20, 100)` — un valor sintético sin relación con datos reales.

El sistema ya tiene una fuente de avance real: `apps/control-proyectos`, tabla `avanceFisico` (ver capability `avance-fisico-control-obra`), consumida hoy por `GET /api/v1/control-proyectos/resumen-dashboard` (`main.ts:1579`). Pero ese endpoint:
- Está protegido con `requireRoles('superintendent', 'admin')` — roles distintos (más restringidos) que los que ven la vista estándar de "Mis Proyectos".
- Calcula el avance para **un solo proyecto** (el de `req.securityContext.proyectoId`, resuelto del proyecto activo/tenant actual), no para una lista de proyectos del usuario.

"Mis Proyectos" necesita avance para **varios** proyectos (todos los de `user.projects`) simultáneamente, sin forzar un cambio de proyecto activo por cada tarjeta.

## Goals / Non-Goals

**Goals:**
- Que cada tarjeta de "Mis Proyectos" muestre el avance físico real del proyecto correspondiente, o un estado explícito de "sin avances" si no hay datos.
- Reutilizar la misma fuente de datos (`avanceFisico` de `control-proyectos`) que ya usa `DashboardEjecutivo`, sin duplicar lógica de cálculo.

**Non-Goals:**
- No se rediseña el cálculo de avance físico en sí (sigue siendo el promedio de `porcentaje_avance` de `avanceFisico` con `estado: 'VALIDADO'`).
- No se toca `DashboardEjecutivo`, que ya funciona correctamente.
- No se implementa aquí ningún cambio a cómo se registran los avances (eso es `avance-fisico-control-obra`).

## Decisions

**Decisión 1 — Nuevo endpoint en `control-proyectos` para avance de múltiples proyectos, en vez de reusar `resumen-dashboard` tal cual.**
- Alternativa A (descartada): loopear el frontend llamando `resumen-dashboard` una vez por proyecto, cambiando el proyecto activo en cada llamada. Generaría N+1 requests, forzaría cambios de contexto de tenant/proyecto solo para leer un dato, y seguiría bloqueado por el rol `superintendent`/`admin`.
- Alternativa B (recomendada): agregar `GET /api/v1/control-proyectos/avance-resumen-multi?proyecto_ids=id1,id2,...` que, para cada `proyecto_id` recibido (validado contra los proyectos a los que el usuario autenticado tiene acceso), calcule `avance_pct` con la misma query de `resumen-dashboard` (`avanceFisico.aggregate` con `estado: 'VALIDADO'`), y devuelva un array `[{ proyecto_id, avance_pct, tiene_avances }]`. Permitir el rol de cualquier usuario que pueda ver el Dashboard estándar (no restringir a `superintendent`/`admin` como el endpoint ejecutivo).
- Alternativa C (descartada): que `gerencia-tecnica` o `app-shell` hagan backend-to-backend hacia `control-proyectos` para armar esto — innecesario, `control-proyectos` ya es dueño del dato y puede exponerlo directo sin intermediarios.

**Decisión 2 — `tiene_avances: boolean` explícito en la respuesta, en vez de inferir "sin datos" de `avance_pct === 0`.**
- Un proyecto puede legítimamente tener 0% de avance validado con avances *pendientes* de validar. Diferenciar "0% real" de "sin datos" evita ambigüedad en el frontend al decidir si mostrar "0%" o "Sin avances registrados".

**Decisión 3 — Frontend: reemplazar el cálculo síncrono por un fetch con estado de carga.**
- Mientras se resuelve el fetch, la tarjeta muestra un skeleton/placeholder (no un número), para no repetir el problema de mostrar un valor que parezca real sin serlo.

## Risks / Trade-offs

- [Riesgo] El nuevo endpoint multi-proyecto expone avance de proyectos por lote — hay que validar que el `proyecto_id` de cada uno esté dentro de los proyectos permitidos del usuario (mismo mecanismo de autorización que ya usa el resto de `control-proyectos`), para no filtrar avance de proyectos ajenos → Mitigación: reusar el middleware de resolución de tenant/proyecto existente, validando cada `proyecto_id` contra la lista de acceso del JWT antes de consultar.
- [Riesgo] Proyectos con muchos avances podrían hacer costosa la agregación por lote → Mitigación: el mismo `aggregate` ya se usa hoy sin problema de performance reportado; si la lista de proyectos por usuario crece mucho, evaluar paginación (fuera de alcance de este fix).

## Migration Plan

1. Agregar el endpoint nuevo en `control-proyectos` (sin tocar `resumen-dashboard`, que sigue sirviendo al Dashboard Ejecutivo).
2. Actualizar `DashboardView.tsx` para llamarlo al montar, mapeando `avance_pct`/`tiene_avances` por `proyecto_id` a cada tarjeta.
3. Quitar la fórmula `35 + index * 20`.
4. No requiere migración de datos ni rollback especial — es aditivo (nuevo endpoint) + una corrección de frontend.

## Open Questions

- ¿El endpoint nuevo debe vivir bajo `/control-proyectos/avance-resumen-multi` o conviene un nombre más genérico si en el futuro el Dashboard estándar necesita más KPIs por proyecto además de avance? (se deja como decisión de implementación, no bloquea el fix)

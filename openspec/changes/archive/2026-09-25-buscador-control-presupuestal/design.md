## Context

`ControlPresupuestalTabla` recibe como prop la lista de partidas ya cargada por el reporte `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` (o el equivalente de `control-proyectos` según la vista que lo invoque). Ya tiene un filtro de categoría (`select`) implementado como estado local del componente. El Catálogo de Obra y el Catálogo de Insumos del mismo módulo ya resuelven búsqueda de forma client-side sobre datos ya cargados, sin llamar al backend — este cambio sigue el mismo patrón.

## Goals / Non-Goals

**Goals:**
- Agregar un campo de texto que filtre las filas visibles por clave o descripción, combinado con el filtro de categoría existente.
- Mantener el comportamiento client-side (sin nueva llamada de red) para no introducir latencia ni cambios de contrato con el backend.

**Non-Goals:**
- No se agrega búsqueda server-side ni paginación.
- No se modifica el cálculo de `pct_ejercido`, alertas de riesgo, ni el resto de las columnas.

## Decisions

- **Filtro combinado (AND) entre búsqueda y categoría:** ambos criterios se aplican juntos sobre la misma lista en memoria, igual que el patrón ya usado en Catálogo de Insumos, para consistencia dentro del módulo.
- **Coincidencia por clave o descripción, case-insensitive, sin acentos estrictos:** se normaliza el texto de búsqueda y el de las filas (lowercase) antes de comparar, para tolerar mayúsculas/minúsculas igual que los otros buscadores del módulo.
- **La fila "[Sin partida]" participa en la búsqueda:** solo se muestra si coincide con el término (por ejemplo buscando "sin partida") o si no hay término activo, en vez de estar siempre fija al final.

## Risks / Trade-offs

- [Riesgo] Si la lista de partidas es muy grande, un filtro client-side ejecutado en cada tecleo podría sentirse lento → Mitigación: el volumen típico de partidas por proyecto es de decenas, no miles; no se requiere debounce para este alcance, pero queda como ajuste futuro simple si aparece un caso con más filas.

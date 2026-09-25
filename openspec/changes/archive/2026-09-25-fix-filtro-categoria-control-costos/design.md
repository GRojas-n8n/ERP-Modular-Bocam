## Context

`InsumosView.tsx` tiene una pestaña "Control de Costos" (tab `control-costos`) que consume `GET /api/v1/gerencia-tecnica/proyectos/:id/costos-wbs`. Ese endpoint (`apps/gerencia-tecnica/src/main.ts:1527-1611`) calcula `comprometido`/`pagado`/`semaforo` por concepto cruzando con Compras (`acumulado-por-concepto`), pero no calcula ni devuelve ningún desglose por categoría de gasto. El frontend, sin embargo, tiene un `<select>` de categoría cuyo estado (`costosCategoriasDisp`) nunca se puebla — queda como código muerto, probablemente un remanente de un intento previo no terminado.

Se evaluó implementar el desglose real (cruzando Compras → insumo → `categoria_gasto_id`, tabla ya existente desde la migración `add_categorias_gasto`), pero es un alcance mayor de tipo feature (agregación cross-service), no un bug-fix. El usuario decidió resolver esto como bug-fix acotado: retirar el control no funcional.

## Goals / Non-Goals

**Goals:**
- Eliminar de la UI un control que no puede funcionar con los datos actuales, evitando que el usuario pierda tiempo interactuando con un filtro sin efecto.
- Dejar registrado en spec que esta tabla no ofrece filtro por categoría, para que una futura propuesta de "desglose real por categoría" tenga un punto de partida claro (spec a modificar, no a crear desde cero).

**Non-Goals:**
- No se implementa el cálculo real de comprometido/pagado por categoría de gasto en el backend — queda fuera de este cambio.
- No se toca el filtro "Solo con desviación" ni el resto de la tabla (KPIs, semáforo, expansión de fila).

## Decisions

- **Eliminar en vez de ocultar:** se remueve el `<select>`, su estado y la lógica de filtrado asociada, en vez de solo ocultarlo condicionalmente, porque no hay ningún escenario en el que vaya a tener opciones — dejar el código muerto solo agrega confusión para el próximo desarrollador.
- **Se documenta como capability nueva, no como delta de una existente:** no existe spec previo para la pestaña "Control de Costos" de `InsumosView`; se crea `control-costos-wbs-filtros` para dejar constancia explícita del comportamiento correcto (solo filtro por desviación) en vez de dejarlo indocumentado.

## Risks / Trade-offs

- [Riesgo] Si en el futuro se decide implementar el desglose real por categoría, habrá que volver a agregar el `<select>` y su lógica → Mitigación: es una reintroducción simple de UI; el trabajo real está en el backend (agregación por categoría), que de todos modos no existe hoy.

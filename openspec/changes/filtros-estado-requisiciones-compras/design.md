## Context

`ComprasView.tsx` ya carga el array completo de `requisiciones` al montar. Cada tarjeta de req muestra un badge derivado del estado de la req + el estado de su comparativa asociada (lógica en `getEstadoCiclo`). El tab Requisiciones renderiza todas las reqs sin filtro. El estado del ciclo ya está calculado y disponible en memoria.

## Goals / Non-Goals

**Goals:**
- Chips de filtro rápido encima de la lista: "Todos", "Pendiente aprobación", "Lista para cotizar", "Cotizando", "Evaluado — pendiente GT", "En evaluación técnica"
- Un solo chip activo a la vez; "Todos" es el estado inicial
- Filtrado puramente client-side sobre el array ya cargado
- Chips visibles solo para el rol compras/procurement en el tab Requisiciones

**Non-Goals:**
- No añadir filtros a otros tabs (Catálogo, Almacén, etc.)
- No filtrar por otros criterios (prioridad, fecha, solicitante)
- No persistir el filtro seleccionado entre sesiones
- No paginación ni cambios al endpoint de requisiciones

## Decisions

**Derivar estado de filtro desde `getEstadoCiclo`**
La función `getEstadoCiclo(req, comparativas)` ya retorna un string de estado del ciclo. Los chips mapean directamente a los valores que esa función devuelve, evitando duplicar lógica. Alternativa rechazada: filtrar por `req.estado` directamente — no captura el estado del comparativo asociado.

**Estado local `filtroEstado: string`**
Un `useState<string>('todos')` en el componente controla qué chip está activo. El array `requisicoinesFiltradas` se deriva via `useMemo` aplicando el filtro. No se necesita contexto global ni reducer.

**Chips como botones inline, no dropdown**
Los 6 estados son pocos y sus labels son cortos — chips horizontales con scroll son más rápidos que un select. En mobile se hace scroll horizontal.

## Risks / Trade-offs

- [Riesgo] Si `getEstadoCiclo` cambia sus valores de retorno, los chips dejan de filtrar → Mitigación: los chips referencian constantes exportadas, no strings hardcoded
- [Trade-off] Chips visibles siempre aunque no haya reqs en ese estado → aceptable; los chips muestran count (N) para orientar al usuario

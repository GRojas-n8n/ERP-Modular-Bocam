## Context

`ComprasView.tsx` ya carga `requisiciones` y `comparativas` en su `useEffect` inicial. El nuevo endpoint `/dashboard` agrega esos counts en backend para no duplicar lógica en el frontend. El componente de chips de filtro (implementado en `filtros-estado-requisiciones-compras`) ya calcula counts por estado — el dashboard los muestra de forma más prominente en la sección de entrada.

## Goals / Non-Goals

**Goals:**
- Sección de dashboard visible al entrar a `/compras` antes de los tabs
- Endpoint único `/dashboard` que agrega todos los KPIs en una query eficiente
- Alertas accionables: cotizaciones vencidas con CTA directo a la req

**Non-Goals:**
- Gráficas de tendencia o históricos (futura iteración)
- Datos de otros módulos (Finanzas, GT) — solo datos de Compras

## Decisions

### D1: Endpoint dashboard suma counts en BD, no en frontend
El endpoint hace `COUNT` en Prisma agrupado por estado — más eficiente que cargar todas las REQs y contarlas en React.

### D2: Alertas = cotizaciones con plazo vencido
Ya existe `alerta_plazo` en `SolicitudCotizacion` — el dashboard simplemente los filtra.

## Risks / Trade-offs

- La sección de dashboard añade una request extra al cargar `/compras`. Mitigación: carga en paralelo con las demás requests del `useEffect`.

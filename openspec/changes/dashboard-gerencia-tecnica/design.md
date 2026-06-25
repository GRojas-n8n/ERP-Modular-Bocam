## Context

El módulo GT maneja cuadros comparativos. Los estados relevantes para el GT son: `EN_APROBACION_GT` (pendiente su revisión) y `EVALUADO_TECNICAMENTE` (listo para enviar a GT). El endpoint de dashboard agrega estos counts desde la BD de `compras` que ya contiene los cuadros — pero el servicio `gerencia-tecnica` necesita hacer una llamada HTTP interna a compras o proyectar via evento. Dado que los cuadros viven en la BD de Compras, el endpoint `/gerencia-tecnica/dashboard` puede consultar vía HTTP a Compras internamente (llamada backend-a-backend), o proyectar datos via RabbitMQ.

## Goals / Non-Goals

**Goals:** Dashboard de entrada para el GT con cuadros pendientes de acción.
**Non-Goals:** Histórico de aprobaciones, gráficas de tendencia.

## Decisions

### D1: GT dashboard consulta Compras vía HTTP interno
El microservicio `gerencia-tecnica` llama internamente a `http://compras:3002/api/v1/compras/comparativas/pendientes-gt` (endpoint ya existente) para obtener los cuadros. Esta es la excepción documentada al patrón: backend-a-backend está permitido; solo el frontend no puede cruzar servicios.

## Risks / Trade-offs

- Si Compras está caído, el dashboard de GT retorna datos parciales. Mitigación: retornar KPIs con valor 0 y `{ parcial: true }` en el response.

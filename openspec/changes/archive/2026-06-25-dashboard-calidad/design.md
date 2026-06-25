## Context

El módulo de Calidad maneja No Conformidades (NCs), auditorías y KPIs ISO 9001. Todos los datos son nativos del microservicio `calidad`. No necesita datos cruzados de otros servicios para su dashboard.

## Goals / Non-Goals

**Goals:** Dashboard ISO 9001 con NCs vencidas (alerta crítica) y KPIs del período.
**Non-Goals:** Historial de auditorías anteriores al período, integración con organismos certificadores.

## Decisions

### D1: Todo nativo — no cross-service
El dashboard de Calidad solo consulta la BD propia. Es el caso más simple — sin proyecciones RabbitMQ ni HTTP interno.

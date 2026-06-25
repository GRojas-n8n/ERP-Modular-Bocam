## ADDED Requirements

### Requirement: Frontend solo llama a su propio microservicio
Cada vista de módulo SHALL realizar llamadas HTTP únicamente al microservicio correspondiente a ese módulo. Está prohibido que la vista de un módulo llame directamente a la API de otro módulo.

#### Scenario: Vista de Compras sin cross-service
- **WHEN** `ComprasView.tsx` necesita mostrar datos
- **THEN** solo realiza fetch a `/api/v1/compras/*` — nunca a `/api/v1/finanzas/*`, `/api/v1/gerencia-tecnica/*`, etc.

#### Scenario: Dato cruzado requerido en un módulo
- **WHEN** el dashboard de Finanzas necesita mostrar el count de OCs pendientes de pago (dato origen: Compras)
- **THEN** el microservicio `finanzas` habrá proyectado ese dato a su propia BD vía evento RabbitMQ `compras.oc_creada`, y el frontend llama a `/api/v1/finanzas/dashboard` que lo retorna directamente

### Requirement: Datos cruzados solo vía RabbitMQ en backend
Cuando un microservicio necesita datos de otro módulo para su dashboard, SHALL suscribirse a los eventos relevantes del topic exchange `bocam.events` y proyectar esos datos en su propia BD.

#### Scenario: Finanzas proyecta OCs de Compras
- **WHEN** Compras publica `compras.oc_creada`
- **THEN** Finanzas actualiza su contador local de OCs pendientes de pago sin consultar la BD de Compras

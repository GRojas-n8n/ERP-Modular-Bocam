# System Patterns

- Arquitectura modular con soberania de datos por modulo
- Comunicacion entre modulos por APIs y eventos asincronos
- Aislamiento SaaS con `tenant_id` en todas las tablas no globales
- Tablas transaccionales ligadas a `proyecto_id` como centro de costos
- Validacion de JWT y RBAC antes de cualquier mutacion

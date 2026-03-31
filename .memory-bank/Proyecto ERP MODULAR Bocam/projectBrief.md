# Project Brief

- Proyecto: Proyecto ERP MODULAR Bocam
- Tipo: ERP SaaS multi-tenant y multi-proyecto
- Objetivo: construir una plataforma modular con aislamiento estricto por `tenant_id` y `proyecto_id`
- Stack principal: Node.js, TypeScript, PostgreSQL con RLS, Redis, RabbitMQ/Redis PubSub
- Restricciones clave: soberania de datos por modulo, integracion por API/eventos, RBAC obligatorio, cero credenciales hardcodeadas

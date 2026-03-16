# 🌍 SKILL GLOBAL: n8n Workflow Designer & Optimizer

> **Rol a Asumir:** Arquitecto de Automatizaciones Externas.
> **Skill Base Requerida:** `n8n-workflow-designer`, `n8n-workflow-optimizer`
> **Objetivo Principal:** Delegar procesos externos (facturación electrónica, WhatsApp, notificaciones push, scraping temporal) a flujos de n8n, protegiendo al NestJS Core de sobrecarga.

## Directivas Estrictas (Configuración BOCAM)

1. **El Core no asume tareas lentas:**
   - Tareas como generación pesada de PDFs, comunicación con el SAT (México) o correos masivos NO deben ejecutarse en el loop de Node.js del ERP. El ERP emite el webhook/evento y n8n lo consume.

2. **Seguridad en Webhooks hacia n8n:**
   - Los flujos de n8n no son públicos. Cualquier webhook expuesto por n8n debe validarse mediante Custom Headers (Ej: `X-Bocam-Secret`) o validación de JWT asimétrico.

3. **Pasarela de Re-ingreso (Callback):**
   - Cuando n8n termina una tarea (Ej: timbrado de factura), debe comunicarse de regreso al ERP a través de un endpoint API oficial validando su token de integración. N8N NUNCA escribe directo a la BD PostgreSQL.

4. **Mantenimiento y Resiliencia (Optimizador):**
   - Todos los flujos de n8n deben tener nodos de Error Trigger y Logging para centralizar fallas.
   - Usar Sub-workflows (`Execute Workflow`) para lógica repetitiva, reduciendo duplicidad visual de nodos.

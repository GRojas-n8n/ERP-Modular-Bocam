# 🧱 SKILL LOCAL: API Endpoint Engineer

> **Rol a Asumir:** Ingeniero Backend Especialista en Controladores de Módulo Autónomo.
> **Skill Base Requerida:** `api-endpoint-engineer`, `api-docs-writer`
> **Objetivo Principal:** Crear y diseñar endpoints seguros, fuertemente tipados, controlando validaciones, inyección de contexto Multi-Tenant y RBAC antes de invocar la Base de Datos.

## Directivas Estrictas (Configuración BOCAM)

1. **La Barrera de Entrada Inviolable:**
   - TODO Request HTTP que mute datos (POST, PUT, PATCH, DELETE) debe ser interceptado por un Middleware o Guard (NestJS) que verifique el Token JWT.
   - De ese token, se extraerán `tenant_id`, `user_id` y los `roles`. El `proyecto_id` puede venir del token o del Header explícito del cliente (si cambia de proyectos), pero DEBE ser verificado contra el RBAC.

2. **Inyección de Contexto al ORM:**
   - NUNCA llamarás a funciones del Repositorio/ORM mandando manualmente en un objeto JSON `where: { tenant_id: req... }`. Ese es un anti-patrón propenso a errores humanos.
   - En su lugar, el contexto (ej. `PrismaClient` con una extensión o una transacción de Postgres con `set_config('app.current_tenant_id', ...)`) debe inyectarse globalmente a través de la solicitud actual usando AsyncLocalStorage o similar.

3. **Arquitectura Contract-First (Generación de Documentos):**
   - El diseño del DTO (Data Transfer Object) de entrada y salida es OBLIGATORIO antes de programar lógica. Utilizar clases válidas con decoradores tipo `class-validator` y `class-transformer`.
   - Emite siempre respuestas tipadas en OpenAPI/Swagger.

4. **Reglas RESTful BOCAM:**
   - **Rutas Anónimas (Anti-Patrón):** `/api/compras` -> ERROR, ¿de qué módulo y proyecto es?
   - **Rutas Limpias:** `/api/v1/[modulo]/[entidad]`
   - Siempre incluye validaciones robustas y no expongas stack traces de errores al cliente. Envuelve todo en una clase estándar `ApiResponse` (con campos: `success`, `data`, `error`).

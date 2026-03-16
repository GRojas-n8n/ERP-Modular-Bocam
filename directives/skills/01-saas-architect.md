# 🌍 SKILL GLOBAL: SaaS Architect (Multi-Tenant & Multi-Proyecto)

> **Rol a Asumir:** Arquitecto de Base de Datos y Estructura Core.
> **Skill Base Requerida:** `saas-architect`
> **Objetivo Principal:** Diseñar la base de datos de los módulos asegurando la soberanía de datos y el aislamiento absoluto por cliente y centro de costos.

## Directivas Estrictas (Configuración BOCAM)

1. **La Doble Jerarquía Inquebrantable:**
   - TODO esquema de base de datos (Prisma/SQL), a excepción de catálogos globales sin dueño, DEBE incluir las columnas `tenant_id` (UUID).
   - TODA tabla transaccional o de movimientos operativos DEBE incluir la columna `proyecto_id` (UUID).

2. **Row-Level Security (RLS) Obligatorio:**
   - Nunca crearás una tabla sin acompañarla de su política RLS en PostgreSQL: `USING (tenant_id = current_setting('app.current_tenant_id')::UUID)`.

3. **Independencia del Módulo (Anti-Join):**
   - NUNCA usarás relaciones foráneas (`@relation` en Prisma o `FOREIGN KEY` en SQL) que intenten referenciar una tabla que pertenezca a OTRO módulo / microservicio.
   - En su lugar, almacenarás el `uuid` ajeno como un campo de texto/uuid simple (Ej: `proveedor_id UUID`) y confiarás en el Master Data Management (MDM).

4. **Migraciones (Prisma + Raw SQL):**
   - Siempre que diseñes un esquema en Prisma, recordarás que Prisma no soporta RLS nativamente. Toda migración generada por Prisma (`--create-only`) requerirá una inyección manual de Raw SQL para `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.

5. **Chain of Thought del Arquitecto:**
   - Antes de diseñar: "¿Este esquema pertenece a qué módulo?"
   - Durante: "¿Estos datos pertenecen a todos los proyectos del tenant o a uno específico?"
   - Después: "¿Añadí los índices compuestos de `(tenant_id, id)` y `(tenant_id, proyecto_id)` para optimizar búsquedas?"

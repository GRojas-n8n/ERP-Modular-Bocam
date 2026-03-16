# 🧱 SKILL LOCAL: SQL Query Engineer

> **Rol a Asumir:** Especialista del Motor RDBMS Multi-Tenant (PostgreSQL + RLS).
> **Skill Base Requerida:** `sql-query-engineer`
> **Objetivo Principal:** Diseñar reportes, vistas (Views) complejas de un solo módulo y lidiar con consultas RAW optimizadas donde el ORM no sea suficiente o eficiente.

## Directivas Estrictas (Configuración BOCAM)

1. **Aislamiento por Encima de Todo (RLS):**
   - Al ejecutar `Raw Queries` manuales, DEBES confiar y basarte en que las reglas de Row-Level Security están activas. Si descubres que es necesario bypassearlas para reportes globales de superadmin, deberás usar el rol `postgres` nativo y no el usuario de aplicación (`bocam_app_user`), previa validación estricta de RBAC SUPERADMIN.

2. **Anti-Patrón de Mutaciones con RAW:**
   - Se prioriza el uso del ORM (Prisma) para guardados (Inserts/Updates) que involucren validación tipo DTO, y solo se delegan al Query Engineer los `SELECTs` pesados como cálculos históricos de un centro de costos o cuadros comparativos masivos.

3. **Seguridad y Cero Credenciales:**
   - Evitar siempre los riesgos de Inyección SQL. No concatenar strings. Se usarán SIEMPRE sentencias parametrizadas (Prepared Statements -> `$1, $2, $3`).

4. **Views Materializadas:**
   - En módulos como "Finanzas" o "Programación", donde calcular el avance total del proyecto sea muy costoso, el Query Engineer buscará crear "Materialized Views" en Postgres y documentar el Trigger o el Cron de actualización, usando siempre la seguridad RLS al armar la vista base.

5. **Chain of Thought del Query Maker:**
   - "¿Cómo reescribo todo esto con JOINs SIN cruzar a tablas de otros módulos que teóricamente no existen en este microservicio?"
   - "Explicador en mano (EXPLAIN ANALYZE), ¿estoy utilizando mis índices compuestos `tenant_id` + `proyecto_id`?"

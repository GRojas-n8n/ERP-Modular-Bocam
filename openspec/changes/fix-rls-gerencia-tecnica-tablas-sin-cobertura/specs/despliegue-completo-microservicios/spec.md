## ADDED Requirements

### Requirement: Una tabla con columna proyecto_id no SHALL asumirse tenant+proyecto sin verificar cómo el código la consulta
Al decidir el alcance de una política RLS para una tabla tenant-scoped, la presencia de una columna `proyecto_id` en el schema no SHALL bastar por sí sola para elegir una política combinada `tenant_id AND proyecto_id` — SHALL verificarse primero si el código de aplicación realmente acota sus consultas al "proyecto actual" de la sesión, o si trata la tabla como un catálogo tenant-wide (listando/escribiendo filas de múltiples `proyecto_id` dentro del mismo tenant sin acotar a uno solo). En el segundo caso, la política SHALL ser solo `tenant_id`, aunque la columna `proyecto_id` exista como dato informativo de cada fila.

#### Scenario: Tabla con proyecto_id pero consultada de forma tenant-wide
- **WHEN** una tabla tiene columna `proyecto_id` pero el código la consulta con `WHERE tenant_id = ...` sin acotar por `proyecto_id` en sus operaciones de lectura/listado principales
- **THEN** la política RLS de esa tabla SHALL ser solo `tenant_id`; aplicar una política combinada `tenant_id AND proyecto_id` SHALL considerarse un error de diseño de la política, no una mejora de seguridad, porque rompe el listado tenant-wide que el código ya provee intencionalmente

#### Scenario: Tabla con proyecto_id consultada siempre acotada a un proyecto
- **WHEN** una tabla tiene columna `proyecto_id` y el código siempre la consulta junto con `tenant_id` y `proyecto_id` (ej. vía clave única compuesta)
- **THEN** la política RLS SHALL ser combinada `tenant_id AND proyecto_id`, igual que el resto de tablas de ese tipo en el mismo servicio

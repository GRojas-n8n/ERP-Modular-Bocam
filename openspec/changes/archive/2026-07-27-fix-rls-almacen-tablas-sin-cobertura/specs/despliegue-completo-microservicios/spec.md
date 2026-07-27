## MODIFIED Requirements

### Requirement: El código de aplicación no SHALL depender exclusivamente de RLS para el aislamiento en operaciones de alto riesgo
El código de aplicación SHALL verificar explícitamente que la fila resuelta por clave primaria pertenece al `tenant_id` (y `proyecto_id` cuando aplique) de la sesión antes de leerla completa o modificarla — ya sea incluyendo esas columnas en el `where` de la consulta, o verificando el resultado después de un `findFirst`/`findUnique` por PK antes de actuar sobre él. RLS SHALL seguir aplicándose como capa adicional, pero SHALL NOT ser la única capa de aislamiento para estas operaciones.

#### Scenario: Operación por PK sin verificación de tenant en el código
- **WHEN** un endpoint resuelve un recurso por su clave primaria (ej.
  `findUnique({ where: { id_cuadro } })`) sin incluir `tenant_id` en el `where` ni
  verificar el resultado después
- **THEN** SHALL tratarse como una vulnerabilidad de aislamiento cross-tenant activa
  si RLS no está aplicado en esa tabla, independientemente de si RLS "debería" estar
  cubriendo el caso

#### Scenario: Operación por PK con verificación explícita
- **WHEN** un endpoint resuelve un recurso por PK y verifica que `tenant_id` (y
  `proyecto_id` cuando aplique) coincide con la sesión antes de actuar sobre él
- **THEN** una fuga cross-tenant NO SHALL depender de que RLS esté correctamente
  configurado en todo momento — el aislamiento se mantiene aunque RLS se
  deshabilite accidentalmente en el futuro

#### Scenario: Endpoint de escritura que devuelve la fila completa mutada
- **WHEN** un endpoint de escritura (`update`/`upsert`) por PK sin verificación de tenant devuelve en la respuesta la fila completa recién modificada
- **THEN** SHALL tratarse como una vulnerabilidad de lectura Y escritura combinadas en una sola petición — el atacante no solo corrompe datos de otro tenant, también los exfiltra en la misma respuesta; bajo RLS sin el chequeo de código explícito, ese endpoint SHALL responder `404` explícito ante un recurso ajeno, no un `500` derivado de un error interno de la capa de datos (ej. `P2025` de Prisma)

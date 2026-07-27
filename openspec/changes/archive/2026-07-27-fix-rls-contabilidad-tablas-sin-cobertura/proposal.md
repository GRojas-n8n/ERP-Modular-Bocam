## Why

Auditoría de todos los microservicios (2026-07-26, continuando el barrido de `personal`,
`compras` y `gerencia-tecnica`) encontró que `contabilidad` es uno de los dos servicios
restantes sin ninguna política RLS (`apps/contabilidad/prisma/rls-policies.sql` no
existía), decisión de 2026-07-11 (`fix-rls-bypass-bocam-admin`, "higiene: solo ownership
+ cambio de rol") que nunca se cerró.

A diferencia de `personal`/`gerencia-tecnica` (defensa en profundidad pura), aquí se
encontró un **bug crítico activo**: `GET /api/v1/contabilidad/asientos`
(`apps/contabilidad/src/main.ts`) hacía `prisma.asientoContable.findMany()` **sin ningún
`where`**. Cualquier usuario autenticado con rol `admin`/`finance`/`superintendent` de
CUALQUIER tenant leía el libro contable completo de TODOS los tenants — peor que un IDOR
clásico, no requiere conocer ni adivinar ningún ID, basta con llamar al endpoint.
Confirmado con datos reales en producción antes del fix: 5 asientos de 2 tenants
distintos, todos visibles desde cualquier contexto de sesión.

Además, `proyecto_id` nunca se usaba como filtro explícito en ningún lookup de un solo
registro en todo el archivo (~12 sitios), pese a que `requireProjectAccess()` ya fija un
proyecto por sesión — una fuga cross-proyecto dentro del mismo tenant, generalizada.

## What Changes

- Habilitar y forzar RLS en `asientos_contables`, `conciliaciones_fiscales`,
  `conciliaciones_bancarias`, `movimientos_poliza` (tenant + proyecto). `cuentas_contables`
  se excluye a propósito — catálogo global sin `tenant_id`.
- **BREAKING (comportamiento, no contrato de API)**: `GET /asientos` agrega `where:
  {tenant_id, proyecto_id}` explícito — devuelve muchas menos filas que antes (el
  comportamiento correcto; antes fugaba todo).
- Fix de código en 3 sitios adicionales de mayor riesgo: conteo de idempotencia en
  `persistMovimientosIfEligible`, monitor de CFDIs pendientes de SAT (fugaba RFCs
  cross-proyecto), y resolución de conciliación bancaria/CFDI por `asiento_id`.
- El resto de los ~12 sitios tenant-only quedan cubiertos por la política RLS combinada,
  sin tocarse individualmente (mismo criterio usado en `compras` para sus tablas de menor
  riesgo).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `despliegue-completo-microservicios`: implementa el requisito de cobertura de RLS ya
  existente (agregado en el fix de `compras`) para este servicio, y agrega un requisito
  nuevo (ADDED) sobre que un middleware de autorización de proyecto no implica por sí
  solo aislamiento de datos por proyecto.

## Impact

- **Código**: `apps/contabilidad/prisma/rls-policies.sql` (nuevo),
  `apps/contabilidad/src/main.ts` (4 sitios), nuevo test de integración en
  `apps/contabilidad/test/integration/`.
- **Infra**: aplicado contra `bocam_contabilidad` en producción. Sin cambio de rol de
  conexión (`bocam_app` ya correcto).
- **Severidad**: crítica — mitigación de base de datos aplicada de inmediato, antes de
  escribir cualquier artefacto de este change, mismo criterio urgente usado con
  `cuadros_comparativos` en `compras`.

## Non-Goals / Seguimiento

Tres endpoints de callback SAT (`main.ts` — claim-dispatch, callback, failure-callback)
están exentos de autenticación JWT y protegidos solo por un secreto compartido global
(`x-bocam-secret`, comparación `!==` no constante en tiempo), tomando `tenant_id`/
`proyecto_id` directamente del body de la petición. RLS acota el radio de impacto (ya no
pueden tocar el proyecto equivocado) pero no resuelve que cualquiera con el secreto puede
actuar como cualquier tenant declarándolo en el body. Esto es un hallazgo de diseño de
autenticación separado, no se corrige en este change — seguimiento sugerido:
`fix-auth-callbacks-sat-secreto-compartido` (secreto por tenant o JWT de servicio,
comparación de tiempo constante, y derivar `tenant_id`/`proyecto_id` de la fila
`conciliaciones_fiscales` almacenada en vez de confiar en el body).

Tampoco se agrega paginación a `GET /asientos` — el endpoint sigue sin límite, ahora
correctamente acotado por tenant/proyecto pero potencialmente grande igual; es un
problema de rendimiento separado, no de seguridad.

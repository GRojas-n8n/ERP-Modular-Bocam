## Context

El sistema es SaaS multi-tenant y multi-proyecto: cada tenant (constructora) puede tener varios proyectos abiertos a la vez, dados de alta en Auth (`POST /api/v1/auth/admin/proyectos`, alta de centro de costos). Gerencia definió el comportamiento esperado por módulo:

- **Compras** y **Control de Proyectos**: estrictamente por proyecto, nunca mezclado, sin excepción de rol.
- **Finanzas** y **Contabilidad**: por proyecto y también de forma global/consolidada (nómina, pagos a proveedores, mantenimientos son operaciones del tenant completo), manteniendo trazabilidad por proyecto en cada registro.
- **Personal**: global (RH ve a todo el personal del tenant), pero cada empleado puede tener 2-3 asignaciones activas simultáneas a distintos proyectos, y eso debe quedar visible.

Antes de escribir una sola migración se auditaron los 5 `rls-policies.sql` completos (no solo un grep por el nombre de función que usa `gerencia-tecnica`, que fue el error de la ronda anterior de esta conversación). Hallazgo: **el aislamiento por proyecto a nivel de base de datos ya existe y está bien hecho en 3 de los 5 servicios**. El trabajo real es más angosto de lo que se planteó inicialmente.

### Inventario verificado (por archivo, no por suposición)

| Servicio | Tablas con RLS | Patrón usado hoy | ¿Coincide con la regla de negocio? |
|---|---|---|---|
| Compras | 21 | 17 Estricto (`tenant_id AND proyecto_id`) + 4 Catálogo Compartido (`proveedores`, `documentos_proveedor`, `solicitudes_cotizacion_proveedores`, `anotaciones_especificacion`) | Sí — solo falta cerrar la contradicción en el middleware de aplicación (ver abajo) |
| Control de Proyectos | 10 | 10 Estricto, `FORCE ROW LEVEL SECURITY`, una sola política combinada por tabla (evita el bug de políticas separadas — ver Decisión 3) | Sí, sin cambios |
| Personal | 14 | 5 Catálogo Compartido (`empleados`, `credenciales_empleado`, `documentos_empleado`, `asignaciones_residente`, `config_deducciones_empleados`) + 9 Estricto (`asignaciones_frente`, `cuadrillas`, `pre_nominas`, etc.) | Sí, sin cambios — ya distingue exactamente lo global de lo operativo-por-proyecto |
| Finanzas | 7 | 7 Estricto, **sin excepción alguna**, incluyendo `programa_pagos` y `pagos_oc` | **No** — impide la vista global que ahora se pide |
| Contabilidad | 4 | 4 Estricto, sin excepción | **No**, mismo problema que Finanzas (aunque menos crítico — ver Open Questions) |

El middleware `requireProjectAccess()` (`packages/auth-middleware/src/middleware.ts`) tiene su propia lista de "roles de nivel tenant" que se saltan la verificación de proyecto autorizado: `['admin', 'superintendent', 'finanzas', 'procurement']`. Esta lista es una decisión de acceso a nivel de aplicación, independiente de la RLS, y hoy contradice la regla de negocio en dos puntos: incluye `procurement` (Compras, que debe ser estricto) y no incluye `personal_rh` (Personal, que ya es global en sus queries).

## Goals / Non-Goals

**Goals:**
- Dar a Finanzas y Contabilidad una forma real de consultar de forma global/consolidada sin abrir una fuga de datos entre proyectos, preservando `proyecto_id` en cada fila para trazabilidad.
- Alinear `requireProjectAccess()` con la regla de negocio real por rol (quitar `procurement`, agregar `personal_rh`).
- Documentar los 3 patrones de aislamiento ya existentes como vocabulario común del proyecto, para que el próximo servicio nuevo no reinvente la clasificación tabla por tabla.
- Exponer trazabilidad de asignación multi-proyecto de Personal en la API, no solo en la base de datos.

**Non-Goals:**
- No se toca RLS de Compras ni Control de Proyectos — ya cumplen.
- No se toca `gerencia-tecnica` — quedó fuera de alcance de esta ronda (su patrón mixto, incluido el fallback histórico `IS NULL` en `presupuestos_base`/`conceptos`, se documentó y se dio por bueno en la conversación previa).
- No se decide aquí el modelo de permisos fino de "qué operaciones globales puede hacer cada usuario dentro de Finanzas/Contabilidad" (p. ej. quién autoriza una corrida de nómina consolidada) — eso es una spec de producto aparte; este cambio solo abre la capacidad técnica de que la consulta no se filtre a cero filas.
- No se crea un rol `contabilidad` nuevo — confirmado que las rutas de Contabilidad ya usan el rol `finanzas` (spec `control-acceso-rol-finanzas-contabilidad`), y ese rol ya es tenant-level.

## Decisions

### Decisión 1 — Tres patrones, no dos, formalizados con nombre

En vez de "RLS estricto vs. RLS global" (como se planteó al inicio de la conversación), el código ya usa tres:

1. **Patrón Estricto**: `USING (tenant_id = current_tenant_id() AND proyecto_id = current_proyecto_id())`. Para datos transaccionales que por definición pertenecen a un único proyecto (una requisición, una bitácora de obra, un presupuesto asignado).
2. **Patrón Global con Trazabilidad**: `USING (tenant_id = current_tenant_id() AND (current_proyecto_id() IS NULL OR proyecto_id = current_proyecto_id()))`. Para datos que necesitan una vista consolidada del tenant sin perder el dato de a qué proyecto pertenece cada fila. El modo "global" se activa cuando la aplicación deja `current_proyecto_id` sin asignar en la sesión — decisión que toma el código de aplicación, gateada por rol, no el usuario final directamente.
3. **Patrón Catálogo Compartido**: `USING (tenant_id = current_tenant_id())`, sin `proyecto_id` en absoluto (o, en el caso de `cuentas_contables` en Contabilidad, sin RLS en absoluto porque el catálogo es compartido incluso entre tenants). Para datos maestros reutilizados por varios proyectos: proveedores, empleados, catálogo de cuentas contables, cuentas bancarias de la empresa.

Alternativa considerada y descartada: una sola política estricta para todo, con el "modo global" resuelto solo en la capa de aplicación (agregando manualmente `OR proyecto_id IN (...)` en cada query de Finanzas/Contabilidad que necesite consolidar). Se descarta porque es exactamente el patrón que ya falló antes en Contabilidad — el propio archivo `rls-policies.sql` de Contabilidad documenta un incidente real: `GET /api/v1/contabilidad/asientos` hacía `findMany()` sin `where`, y antes de tener RLS, cualquier usuario autenticado leía el libro contable completo de todos los tenants. Confiar en que cada endpoint nuevo recuerde agregar el filtro correcto es precisamente el modo de falla que la RLS existe para prevenir.

### Decisión 2 — El modo global solo aplica a tablas de pago/operación, no a tablas de presupuesto

Dentro de Finanzas, no todas las tablas pasan a Patrón Global: `presupuestos_asignados`, `movimientos_presupuestales` y `proyectos_finanzas` (anticipos) se quedan en Patrón Estricto — un presupuesto es inherentemente de un proyecto, no existe un "presupuesto global" que consolidar. Solo `programa_pagos`, `pagos_oc` y `detalles_pago_oc` (que ya hereda de `pagos_oc` vía `EXISTS`) pasan a Patrón Global, porque ahí es donde vive la operación de negocio que gerencia describió como global: pagar nómina, proveedores, mantenimientos.

Para Contabilidad, la clasificación tabla por tabla (resuelta en tarea 1.2, ver Open Questions) sigue el mismo criterio: `asientos_contables` y `movimientos_poliza` pasan a Patrón Global porque registran el efecto contable de pagos que ya son globales en Finanzas — mantenerlos estrictos rompería la trazabilidad justo donde más importa. `conciliaciones_bancarias` pasa a Global porque las cuentas bancarias que concilia (`cuentas_bancarias` en Finanzas) ya son Catálogo Compartido, no de un proyecto. `conciliaciones_fiscales` (CFDI/SAT) se queda estricta — un CFDI es de una operación de un proyecto puntual, no existe el equivalente "fiscal global".

### Decisión 3 — Una sola política PERMISSIVE combinada, nunca dos separadas

Restricción de diseño no negociable para cualquier RLS nueva de este cambio: la condición de tenant y la de proyecto van **en una sola política**, combinadas con `AND` dentro del mismo `USING`/`WITH CHECK`. Postgres combina políticas PERMISSIVE múltiples sobre la misma tabla y comando con `OR`, no con `AND` — declararlas por separado (una política "solo tenant" y otra "solo proyecto") deja pasar cualquier fila que cumpla una sola de las dos condiciones. Esto ya causó una fuga real y documentada en este mismo repo (`fix-rls-bypass-bocam-admin`, `fix-rls-personal-tablas-nuevas`, verificado empíricamente contra Postgres real antes de corregirse). Las migraciones de este cambio deben seguir exactamente el molde ya usado en `apps/finanzas/prisma/rls-policies.sql` para las tablas de pago, solo agregando el `OR current_proyecto_id() IS NULL`.

### Decisión 4 — `procurement` sale de `tenantLevelRoles`, sin rol de reemplazo por ahora

Se retira `procurement` sin agregar un rol sustituto de "director de compras cross-proyecto". Si gerencia identifica que sí existe un caso de negocio real para eso, se agrega como una spec aparte con su propio nombre de rol explícito (p. ej. `procurement_director`) — no se reintroduce el bypass genérico bajo el nombre `procurement` para no repetir la misma ambigüedad que se está corrigiendo.

## Risks / Trade-offs

- **[Riesgo]** Usuarios con rol `procurement` que hoy dependen del acceso irrestricto (aunque sea sin saberlo) pierden esa capacidad al desplegar → **[Mitigación]** Antes de desplegar, correr un query de auditoría sobre `UserProjectAccess` para confirmar que todo usuario con rol `procurement` activo tiene asignado (`authorizedProjects`) cada proyecto en el que de verdad opera; comunicar el cambio al equipo de Compras antes del release.
- **[Riesgo]** Ampliar RLS a Patrón Global en tablas de pago sin un control de aplicación que decida *quién* puede pedir el modo global abre la puerta a que cualquier usuario con rol `finanzas` vea pagos de proyectos a los que no tiene asignación explícita → **[Mitigación]** El modo global se activa solo cuando el código de `createTenantContext()` deja `proyectoId` sin definir, y eso solo debe ocurrir en los endpoints explícitamente diseñados como "vista consolidada" (a inventariar en tasks.md) — no en los endpoints normales de Finanzas, que siguen pasando `proyectoId` siempre. La RLS es el respaldo, no el único control.
- **[Riesgo]** Migraciones de RLS en tablas con datos reales en producción (`programa_pagos`, `pagos_oc` ya tienen filas) → **[Mitigación]** `DROP POLICY IF EXISTS` + `CREATE POLICY` es una operación atómica de metadatos, no reescribe filas; no requiere downtime ni backfill. Aun así, se prueba primero contra una copia/staging con datos reales antes de aplicar en producción, igual que el resto de las migraciones RLS de este repo.
- **[Riesgo descubierto durante implementación, ya corregido]** La RLS por sí sola no basta: `GET /api/v1/contabilidad/asientos` filtraba `proyecto_id: proyectoId` explícitamente en el `where` de Prisma (el fix original del incidente de libro contable expuesto, antes de que existiera RLS). Con `proyectoId` vacío en modo global, ese filtro de aplicación habría bloqueado la consulta a 0 filas antes de que la RLS nueva pudiera actuar — la capacidad técnica de la base de datos no sirve si el endpoint sigue re-filtrando por su cuenta. → **Mitigación aplicada:** el filtro de `proyecto_id` en ese endpoint ahora es condicional (`...(proyectoId ? { proyecto_id: proyectoId } : {})`), dejando que la RLS resuelva el aislamiento cuando no hay proyecto activo. **Implicación para tasks.md 1.3 / futuras tareas:** cualquier endpoint adicional que se decida exponer en modo global debe auditarse por el mismo patrón — un `where: { proyecto_id: proyectoId }` explícito en el código de aplicación anula el modo global de la RLS aunque la política ya lo permita.
- **[Riesgo descubierto durante implementación, ya corregido]** `current_tenant_id()`/`current_proyecto_id()` en Finanzas eran funciones `sql` puras sin manejo de excepción: un GUC de sesión en cadena vacía (`''`) — el valor real que produce `securityContext.proyectoId` cuando un rol tenant-level opera sin proyecto activo — lanzaba un error de cast en vez de evaluar a `NULL`, rompiendo la rama `IS NULL` del modo global antes de que pudiera evaluarse siquiera. → **Mitigación aplicada:** se convirtieron a `plpgsql` con `EXCEPTION WHEN OTHERS THEN RETURN NULL`, igual que ya usa Contabilidad. Compras tiene el mismo patrón sin proteger y queda fuera de alcance de este cambio (ver Non-Goals) — riesgo latente que no empeora ni mejora con este cambio, documentado para una spec de higiene aparte.
- **[Trade-off]** No se resuelve en este cambio *qué endpoints* de Finanzas/Contabilidad deben ofrecer el modo global (eso es un Open Question) — este design.md deja la capacidad técnica lista, pero el catálogo exacto de "qué es global" se decide en tasks.md con el equipo de negocio antes de escribir el código de aplicación que la use.

## Migration Plan

1. Ajustar `tenantLevelRoles` en `packages/auth-middleware/src/middleware.ts` (quitar `procurement`, agregar `personal_rh`) — cambio de una línea, pero requiere correr la auditoría de `UserProjectAccess` mencionada arriba antes de desplegar.
2. Escribir y aplicar la migración RLS Patrón Global en las tablas de pago de Finanzas.
3. Clasificar tabla por tabla la RLS de Contabilidad (Open Question) y aplicar la migración correspondiente.
4. Exponer `proyecto_id` en `GET /api/v1/personal/empleados`.
5. Verificación en entorno real con datos del proyecto piloto (mismo patrón que ya siguen `fix-evm-costos-reales` y `alertas-volumen-ejecutado-contratado`): desplegar vía CI, confirmar en navegador que (a) un usuario `procurement` sin `authorizedProjects` para un proyecto B ya no puede leerlo ni con URL manipulada, y (b) un usuario `finanzas` sin proyecto activo sí ve pagos consolidados de todos los proyectos, cada uno con su `proyecto_id` visible.
6. `openspec archive aislamiento-proyecto-por-modulo` tras la verificación en producción.

## Open Questions

- ~~¿Cuáles de las 4 tablas de Contabilidad deben pasar a Patrón Global?~~ **Resuelto (tarea 1.2):** `asientos_contables` y `movimientos_poliza` (hija directa, mismo `tenant_id`/`proyecto_id`) → Patrón Global, para no fragmentar la trazabilidad de un pago global (Finanzas) del asiento contable que lo registra. `conciliaciones_bancarias` → Patrón Global, porque `cuentas_bancarias` en Finanzas ya es Catálogo Compartido (cuenta de la empresa, no de un proyecto) y una conciliación de estado de cuenta mezcla movimientos de varios proyectos por naturaleza. `conciliaciones_fiscales` (CFDI/SAT) → se queda en Patrón Estricto, sin cambio: un CFDI se emite contra una operación de un proyecto puntual, no existe una "conciliación fiscal global" real.
- ~~¿Qué endpoints exactos exponen el "modo global"?~~ **Resuelto (tarea 1.3):** no se agrega un query param ni un endpoint dedicado nuevo. El modo global se activa reutilizando el selector de proyecto activo ya existente en el frontend (`TenantContext`): cuando el usuario selecciona "Todos los proyectos" en vez de un proyecto puntual, `createTenantContext()` recibe `proyectoId: undefined` y la RLS Patrón Global responde consolidado sin que cada endpoint necesite lógica nueva. Roles habilitados: los mismos ya tenant-level en `requireProjectAccess()` (`finanzas`, `admin`, `superintendent`) — no se agregan roles nuevos.
- ¿Existe hoy algún usuario real con rol `procurement` que dependa del acceso cross-proyecto actual? Sigue abierto — bloquea el paso 1 del Migration Plan hasta confirmarse contra la base de datos real (tarea 1.1, pendiente por falta de acceso a un entorno con datos reales en esta sesión).

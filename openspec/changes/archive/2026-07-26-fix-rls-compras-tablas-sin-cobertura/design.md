## Context

`apps/compras/prisma/rls-policies.sql` (si existe) no cubre las 17 tablas
identificadas hoy con `relrowsecurity=false`: `aclaraciones_comparativa`,
`alertas_oc_error`, `anotaciones_especificacion`, `asignaciones_extra_concepto`,
`auditoria_desbloqueo_comparativa`, `calificaciones_proveedor`,
`comparativas_detalles`, `comparativas_lineas`,
`comparativas_proveedores_archivos`, `cuadros_comparativos`,
`documentos_proveedor`, `especificaciones_detalle_req`,
`evaluaciones_especificacion`, `recepcion_oc_items`, `recepciones_oc`,
`solicitudes_cotizacion`, `solicitudes_cotizacion_proveedores`. 5 tablas de
`compras` ya tienen RLS correcto (`ordenes_compra`, `ordenes_compra_items`,
`proveedores`, `requisiciones`, `requisiciones_items`), confirmadas desde el
change original de 2026-07-10/11 (`fix-rls-bypass-bocam-admin`).

Dos políticas huérfanas ya existen sobre `cuadros_comparativos` y
`comparativas_detalles` (`rls_cuadros_comparativos_context`,
`rls_comparativas_detalles_context`), usando funciones `current_tenant_id()`/
`current_proyecto_id()` en vez del patrón estándar
`current_setting('app.current_tenant_id', true)`. Estas funciones deben
verificarse: si existen y funcionan, podrían reusarse; si no, se descartan junto
con las políticas. En cualquier caso hay que `DROP POLICY` las huérfanas antes
de crear las nuevas con el nombre y patrón estándar (mismo criterio que se usó
al limpiar la política huérfana `tenant_isolation` de `personal` en
2026-07-11).

**Diferencia crítica con el fix de `personal`**: ahí las tablas estaban vacías
y el código ya filtraba tenant_id en todos los endpoints revisados — aplicar
RLS era puro backstop sin riesgo de romper nada. Aquí, `cuadros_comparativos`
(32 filas) y `comparativas_detalles` (36 filas) tienen datos reales, Y el
código NO filtra tenant_id — depende 100% de RLS. Esto significa que:
1. Aplicar RLS por sí solo YA cierra la fuga activa (una fila de otro tenant
   deja de ser visible/editable), pero
2. El código sigue siendo frágil: si en el futuro alguien vuelve a perder la
   política (como ya pasó dos veces: `personal` en 2026-07-26 y `compras` en
   algún punto no documentado), la fuga reaparece sin que nada en el código lo
   detecte. Por eso el fix de raíz en el código no es opcional aquí.

## Goals / Non-Goals

**Goals:**
- Cerrar la fuga activa en `cuadros_comparativos`/`comparativas_detalles` con
  la prioridad más alta: primero RLS (mitigación inmediata), luego el fix de
  código (raíz).
- Clasificar las 13 tablas restantes por nivel de riesgo (¿el código ya filtra
  tenant_id, o depende de RLS?) antes de decidir si necesitan también fix de
  código o solo la política.
- Verificar con cuidado extra dado que hay datos reales — no asumir que "aplicar
  RLS es seguro" sin comparar conteos de filas antes/después y hacer smoke test
  real, igual que se hizo en `personal` pero con más rigor porque aquí sí hay
  algo que perder.

**Non-Goals:**
- No se rediseña el modelo de datos de `compras` ni se cambian contratos de API
  observables — un cliente que ya filtraba correctamente por tenant no debería
  notar diferencia; solo un cliente que dependía (indebidamente) de la fuga
  cross-tenant vería un cambio de comportamiento (de "200 con datos ajenos" a
  "404").
- No se audita en este change ningún otro microservicio adicional a `compras`
  (`gerencia-tecnica` con su gap de menor severidad queda para un change
  aparte).

## Decisions

**Orden de trabajo: RLS primero, código después, por tabla priorizada.** Para
`cuadros_comparativos`/`comparativas_detalles`: aplicar la política en
producción tan pronto esté escrita y verificada (cierra la fuga activa lo antes
posible), y en paralelo/inmediatamente después escribir el fix de código. No
esperar a tener el fix de código completo para aplicar RLS — la mitigación de
base de datos es más rápida y de menor riesgo que tocar 15+ call sites de
lógica de negocio compleja (firma, bloqueo, revisiones).

**Fix de código: patrón "verificar después de findUnique por PK", no reescribir
a `findFirst` con where compuesto.** Cambiar `findUnique({ where: { id_cuadro:
id } })` a incluir `tenant_id` directamente en el `where` requeriría que
`id_cuadro` deje de ser la única parte de una clave, lo cual no es viable sin
tocar el schema (no es unique compuesta). En su lugar: mantener el
`findUnique`/`findFirst` por PK, y agregar inmediatamente después
`if (cuadro.tenant_id !== tenantId) throw 404` (mismo status que "no
encontrado", para no filtrar por respuesta si un recurso existe en otro
tenant). Este patrón ya es el usado correctamente en `documentoProveedor`/
`solicitudCotizacion` en el mismo archivo — replicar, no inventar uno nuevo.

**Clasificación de las 13 tablas restantes por auditoría de código, no por
suposición.** Cada una se revisa buscando sus `findMany`/`findFirst`/
`findUnique`/`update`/`delete` en `apps/compras/src/main.ts` y se clasifica:
- **Ya filtra explícito** (como `documentoProveedor`, `solicitudCotizacion`
  vistos en la auditoría previa): solo necesita la política RLS, sin cambio de
  código.
- **Depende 100% de RLS** (como `cuadroComparativo`/`comparativaDetalle`):
  necesita también el fix de verificación explícita.

**Test de integración reproduce el IDOR con HTTP real, no con set_config
directo.** A diferencia del test de `personal` (que probaba la política de
Postgres en aislamiento), aquí el bug vive en el código de aplicación — el test
correcto es: crear un cuadro en el tenant A vía la API, luego intentar leerlo/
modificarlo con un JWT válido del tenant B, y confirmar `404` (hoy sería `200`
con los datos de A, mientras RLS esté ausente Y el código sin el chequeo).

## Risks / Trade-offs

**[Riesgo] Aplicar `FORCE ROW LEVEL SECURITY` sobre tablas con datos reales
podría romper un endpoint que hoy funciona "por accidente" gracias a un
`app.current_tenant_id` mal seteado en algún code path no auditado.** →
Mitigación: antes de aplicar en producción, hacer smoke test con JWT real
sobre los endpoints de `cuadros_comparativos` más usados (listar, ver detalle,
evaluación técnica) comparando la respuesta antes y después; comparar conteo
total de filas vía `bocam_admin` (bypass) antes/después para descartar pérdida
de datos.

**[Riesgo] El fix de código (agregar el chequeo de tenant tras `findUnique`)
podría romper un flujo legítimo si algún caller interno pasa un `tenant_id` de
contexto distinto al esperado por error propio (no malicioso).** → Mitigación:
correr la suite existente de tests de `compras` relacionados con cuadros
comparativos/evaluación técnica antes de dar por cerrado el fix; el cambio de
comportamiento (404 en vez de 200 con datos ajenos) solo debería afectar a
quien ya estaba cruzando tenants indebidamente.

**[Trade-off] No se corrige en este change el resto de microservicios
(`gerencia-tecnica`).** Aceptado explícitamente por el usuario — `compras` es
más urgente por tener una fuga activa confirmada con datos reales, mientras que
`gerencia-tecnica` es solo defensa en profundidad (código ya filtra
correctamente).

## Migration Plan

1. Escribir/extender `apps/compras/prisma/rls-policies.sql` con las 17 tablas,
   `DROP POLICY` de las 2 huérfanas primero.
2. Escribir tests de integración HTTP que reproduzcan el IDOR en
   `cuadros_comparativos`/`comparativas_detalles` (rojo contra el código y BD
   actuales).
3. Aplicar la política de `cuadros_comparativos`/`comparativas_detalles` en
   producción primero (mitigación inmediata) — re-confirmar tests en verde a
   nivel de política (mismo mecanismo `set_config` + `ROLLBACK` usado en
   `personal`).
4. Escribir el fix de código (chequeo explícito de tenant) para
   `cuadroComparativo`/`comparativaDetalle`; confirmar el test HTTP de la tarea
   2 en verde.
5. Auditar y clasificar las 13 tablas restantes; aplicar sus políticas
   (agrupadas, no una por una si no hay hallazgos de código que las
   distingan); aplicar fix de código adicional solo donde el audit lo requiera.
6. Aplicar el resto de las políticas en producción, smoke test general,
   confirmar conteo de filas sin cambios.
7. Rollback por tabla: `ALTER TABLE <tabla> NO FORCE ROW LEVEL SECURITY;
   ALTER TABLE <tabla> DISABLE ROW LEVEL SECURITY;` si algo bloquea tráfico
   legítimo — el fix de código es independiente y no requiere rollback si RLS
   se desactiva temporalmente.

## Open Questions

- ¿Las funciones `current_tenant_id()`/`current_proyecto_id()` de las
  políticas huérfanas existen y son correctas, o son residuo de un intento
  descartado? Verificar antes de decidir si se reusan o se descartan junto con
  las políticas.
- ¿Existe el mismo patrón de "código depende 100% de RLS" en otros
  microservicios además de `gerencia-tecnica` (ya evaluado como de menor
  riesgo) y `compras`? No auditado en este change.

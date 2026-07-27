## Context

`apps/contabilidad/prisma/rls-policies.sql` no existía. `apps/contabilidad/src/db.ts`
ya fija correctamente los 3 GUCs (`app.current_tenant_id`, `app.current_proyecto_id`,
`app.current_user_id`) vía `set_config(..., true)` dentro de una transacción — el
servicio está "listo para RLS" sin cambios de plomería, igual que `personal`/`compras`/
`gerencia-tecnica`.

Auditoría completa de `main.ts` (5 modelos, ~30 lugares de acceso a datos) encontró:
- **GAP-1 crítico**: `GET /asientos` sin `where` — fuga total, no requiere IDs.
- **GAP-2 menor**: conteo de idempotencia sin `tenant_id`.
- **GAP-3 generalizado**: `proyecto_id` nunca filtrado en ~12 lookups de un solo
  registro, pese a `requireProjectAccess()`.
- **GAP-4 bajo riesgo**: 12 `.update()` por PK, todos precedidos por un `findFirst`
  tenant-scoped en la misma transacción — ya cumplen el requisito existente del spec de
  "verificar antes de actuar", quedan reforzados por `FORCE ROW LEVEL SECURITY`.
- Hallazgo separado, no RLS: callbacks SAT con secreto compartido global y `tenant_id`
  del body — ver Non-Goals del proposal.

## Goals / Non-Goals

**Goals:**
- Cerrar GAP-1 con la máxima urgencia posible — mitigación de base de datos antes de
  cualquier otro paso.
- Cerrar GAP-3 (la clase completa) vía política RLS combinada, con fix de código
  puntual solo en los 3 sitios de mayor riesgo real (listado que fuga RFCs, rutas de
  escritura de conciliación).
- Preservar `cuentas_contables` como catálogo global sin RLS, documentado
  explícitamente para no leerse como drift en el futuro.

**Non-Goals:**
- No se resuelve el problema de autenticación de los callbacks SAT (secreto
  compartido, no constante en tiempo, `tenant_id` del body) — es un hallazgo de diseño
  de auth, no de cobertura RLS. Documentado como seguimiento.
- No se pagina `GET /asientos`.
- No se tocan los 12 sitios de `.update()` por PK ya guardados (GAP-4) — cubiertos por
  RLS + el requisito ya existente del spec.

## Decisions

**Convención SQL**: `current_tenant_id()`/`current_proyecto_id()` (nombre mayoritario
en el repo — `finanzas`/`compras`) con cuerpo plpgsql `EXCEPTION WHEN OTHERS THEN
RETURN NULL` (de `gerencia-tecnica`) en vez del `::UUID` sin protección de
`finanzas`/`compras` — un GUC vacío falla cerrado (0 filas) en vez de lanzar un error de
cast que rompería toda consulta con contexto mal seteado.

**Clasificación de tablas**: las 4 tablas con `tenant_id` reciben política
`tenant_id AND proyecto_id` — evidencia decisiva:
`asientos_contables.@@unique([tenant_id, proyecto_id, folio_poliza])` (el folio de
póliza es una serie por proyecto), y las 3 restantes ya se escriben/consultan siempre
con ambos valores. `cuentas_contables` NO recibe RLS — no tiene `tenant_id`, es un
catálogo global (`@@unique([clave])`), y ponerle `ENABLE` sin política bajo `FORCE`
sería un deny-all que rompería todo `include: { cuenta }` (dashboard, reportes,
`GET /asientos/:id/movimientos`).

**El monitor SAT (`sat-pendientes`) se clasifica como bug de código, no como diseño
intencional** (análogo al caso de `proyectos_obra_vinculados` en gerencia-tecnica, pero
con la conclusión opuesta): a diferencia de un catálogo cuyo propósito ES listar
tenant-wide, este es un worklist operativo de registros que ya pertenecen a un proyecto
específico, y filtra RFCs de otros proyectos sin ninguna razón de negocio para hacerlo.
Se agrega `proyecto_id` explícito.

**GAP-3: RLS cierra la clase completa; 3 sitios de código, no los ~12** — mismo
criterio que `compras` aplicó a sus tablas de menor riesgo. Los 3 elegidos son los de
mayor impacto real: el monitor que fuga datos (lectura), y las dos rutas de escritura
(`resolveBankReconciliationTarget`, usado por conciliación bancaria en 3 call sites, y
`conciliar-cfdi`) donde un `proyecto_id` incorrecto podría reconciliar el asiento
equivocado. El resto queda como defensa en profundidad cubierta por RLS.

## Risks / Trade-offs

**[Riesgo] `GET /asientos` devuelve muchas menos filas tras el fix** — comportamiento
correcto (antes fugaba todo), documentado explícitamente en el proposal para que no se
lea como regresión.

**[Riesgo] Los callbacks SAT podrían no reenviar `proyecto_id` fielmente**, causando
`404` inesperados en la integración real con el adaptador SAT tras aplicar RLS —
mitigado probando el flujo `claim-dispatch`/`callback` con `proyecto_id` correcto e
incorrecto antes de dar por cerrada la verificación.

**[Riesgo] `ENABLE` accidental sobre `cuentas_contables`** rompería todo join contra
ella — mitigado con el comentario explícito en el SQL y una verificación de join real
tras aplicar.

## Migration Plan

1. Capturar estado rojo (ownership, conteos, `pg_policy`/`pg_proc` existentes) — sin
   huérfanos encontrados.
2. Escribir y aplicar `apps/contabilidad/prisma/rls-policies.sql` de inmediato —
   mitigación urgente antes de cualquier otro paso.
3. Verificar en verde con `BEGIN...ROLLBACK` contra datos reales de producción:
   cross-tenant y cross-proyecto dentro del mismo tenant ambos a 0 filas; join contra
   `cuentas_contables` sigue funcionando.
4. Smoke test con JWT real — confirmar `GET /asientos` ya solo devuelve el
   tenant/proyecto de la sesión, sin haber desplegado código nuevo (RLS solo).
5. Fix de código: `main.ts:1677` (GAP-1), `main.ts:110` (GAP-2), monitor SAT +
   `resolveBankReconciliationTarget`/`prevalidateBankReconciliation`/
   `reconcileBankMovement` (threading de `proyectoId`) + `conciliar-cfdi` (GAP-3
   parcial). `tsc --noEmit` limpio.
6. Test de integración nuevo (`rls-asientos-scope.integration.test.ts`) — escrito y
   commiteado, no ejecutado (sin Postgres local en esta sesión).
7. Commit + push; rebuild/restart de `bocam-vps-contabilidad`; confirmar healthy;
   smoke test contra el código ya desplegado (confirma el conteo exacto de filas y el
   monitor SAT ya scoped).

## Open Questions

Ninguna pendiente para este change. La pregunta de si el mismo patrón "código depende
100% de RLS" existe en las tablas que ya tenían RLS en otros servicios (ej.
`ordenCompra.findUnique` en `compras`) queda fuera de alcance, ya registrada en la
memoria de la sesión.

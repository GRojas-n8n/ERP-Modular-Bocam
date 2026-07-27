## Why

Auditoría de hoy (2026-07-26) contra `bocam-vps-postgres`, hecha para verificar si el
mismo drift ya cerrado en `personal` (ver
`openspec/changes/archive/2026-07-26-fix-rls-personal-tablas-nuevas`) existía en otros
microservicios, encontró que **17 tablas de `bocam_compras`** con columnas
`tenant_id`/`proyecto_id` tienen `relrowsecurity=false` — sin ninguna política RLS.

A diferencia de `personal` (donde el gap era solo defensa en profundidad porque el
código sí filtraba `tenant_id` en cada endpoint), aquí la lectura de
`apps/compras/src/main.ts` confirmó que **`cuadroComparativo` y `comparativaDetalle`
dependen 100% de RLS para el aislamiento**: 15+ sitios hacen `findUnique`/`update` solo
por PK (`where: { id_cuadro: id }`), sin `tenant_id` en el `where` y sin verificar
después que la fila pertenece al tenant de la sesión. Con RLS deshabilitado, esto es
una vulnerabilidad IDOR cross-tenant **activa hoy**, no teórica: cualquier usuario
autenticado de cualquier tenant/proyecto que conozca el UUID de un `cuadro_id` puede
leerlo y modificarlo completo — incluyendo firmarlo, bloquearlo o reabrirlo. Hay datos
reales en juego: 32 `cuadros_comparativos`, 36 `comparativas_detalles`.

Agrava el cuadro que existen **2 políticas RLS huérfanas** ya en la base
(`rls_cuadros_comparativos_context`, `rls_comparativas_detalles_context`), usando
funciones `current_tenant_id()`/`current_proyecto_id()` — un patrón distinto al
estándar del proyecto (`current_setting('app.current_tenant_id', true)`) — aplicadas
manualmente a producción en algún momento sin quedar en el repo, y nunca activadas
(`relrowsecurity=false`). Mismo fenómeno que ya se había encontrado y limpiado en
`personal` durante el change original de 2026-07-11.

Este bug-fix cierra la brecha en dos capas: RLS a nivel de base de datos (mitigación
inmediata, cierra la fuga incluso antes de tocar código) y un fix de raíz en el código
de `cuadroComparativo`/`comparativaDetalle` (para no repetir el error de depender
exclusivamente de RLS — la causa raíz que ya había motivado el change de 2026-07-10/11
y volvió a aparecer porque el código nunca se corrigió).

## What Changes

- Eliminar las 2 políticas RLS huérfanas (`rls_cuadros_comparativos_context`,
  `rls_comparativas_detalles_context`) antes de crear las correctas.
- Habilitar y forzar RLS con el patrón estándar del proyecto (una sola política por
  tabla, `tenant_id AND proyecto_id` combinados con `AND`, nunca dos políticas
  separadas) en las 17 tablas sin cobertura de `bocam_compras`, priorizando
  `cuadros_comparativos`/`comparativas_detalles` primero por ser la fuga activa
  confirmada.
- **BREAKING (a nivel de comportamiento, no de contrato de API)**: agregar
  verificación explícita de `tenant_id`/`proyecto_id` en cada uno de los 15+ call
  sites de `cuadroComparativo`/`comparativaDetalle` en `apps/compras/src/main.ts`, de
  modo que una petición cross-tenant por PK responda `404` de forma explícita y
  auditable, en vez de depender silenciosamente de que RLS esté bien configurado.
- Auditar las 13 tablas restantes de la lista de 17 para clasificar cada una como
  "ya filtra `tenant_id` explícito en código" (solo necesita la política RLS) vs
  "depende 100% de RLS" (necesita también el fix de código, mismo tratamiento que
  `cuadroComparativo`/`comparativaDetalle`).
- Tests de integración que reproduzcan el IDOR en rojo (tenant B lee/modifica un
  cuadro del tenant A por PK) antes del fix, y confirmen en verde después.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `despliegue-completo-microservicios`: se extiende el requisito existente de
  "base de datos inicializada con RLS aplicado" para cubrir explícitamente el caso de
  tablas agregadas después del despliegue inicial de un microservicio, y se agrega un
  requisito nuevo de que el código de aplicación no dependa exclusivamente de RLS para
  el aislamiento de tablas con alto riesgo/alta sensibilidad.

## Impact

- **Código**: `apps/compras/prisma/rls-policies.sql` (nuevo o extendido — verificar si
  ya existe), cambios en `apps/compras/src/main.ts` en los endpoints de
  `cuadroComparativo`/`comparativaDetalle` (y los que resulten del audit de las 13
  tablas restantes), nuevos tests de integración en `apps/compras/test/integration/`.
- **Infra**: aplicar SQL contra `bocam_compras` en el VPS de producción. Sin cambio de
  rol de conexión (`bocam_app` ya es el rol correcto, sin `BYPASSRLS`/`SUPERUSER`,
  confirmado en la auditoría).
- **Riesgo de regresión**: a diferencia de `personal` (tablas vacías), `compras` tiene
  datos reales en las tablas afectadas — el fix debe verificarse con cuidado (smoke
  test con JWT real, comparar conteos de filas antes/después) para no romper flujos en
  producción al forzar RLS sobre datos existentes.
- **Urgencia**: esta es una vulnerabilidad de seguridad activa, no solo un gap de
  higiene — priorizar sobre trabajo no relacionado.

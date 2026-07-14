## Context

Ver `proposal.md` para la investigación completa (logs + BD de producción). Puntos
técnicos clave para la implementación:

- `convertir-oc` (`apps/compras/src/main.ts:2669+`) construye `grupos` (por proveedor)
  iterando `comparativa.detalles` (ya filtrados por `es_ganador: true` en el `include` del
  query) y hace `if (!insumoId) continue;` — esto se elimina, y el loop pasa a incluir
  renglones con `detalle_req_id` en vez de `insumo_id`.
- `GrupoOcEmitido` (`requisicion-cobertura.ts`) y `requisicionQuedoCubiertaPorLote` derivan
  `detalle_req_id` a partir de `insumo_id` vía un Map — para renglones de texto libre no
  hay ese Map, así que `GrupoOcEmitido.detalles` pasa a llevar `detalle_req_id` de forma
  directa en vez de derivarlo.
- El evento `compras.oc_creada` y el array `gruposEmitidos` también usan `d.insumo_id`
  como clave para resolver cantidad — mismo ajuste.

## Goals / Non-Goals

**Goals:**
- Que un cuadro con al menos un renglón aprobado por GT pueda convertirse en OC sin
  intervención manual de "ganador", sea el renglón de catálogo o texto libre.

**Non-Goals:**
- No se resuelve la recepción de materiales (`RecepcionOCItem`) para ítems de texto
  libre — fuera de alcance de este fix (ya se recibe hoy por cantidad/id_item, no por
  insumo, así que no debería romperse, pero no se verifica a fondo ese camino aquí por
  tiempo).
- No se rediseña el flujo de selección de "primera/segunda opción" — se usa tal cual ya
  existe, solo se deriva `es_ganador` a partir de él automáticamente.

## Decisions

- **Regla de desempate cuando ni primera ni segunda opción aplican a un renglón:** menor
  `precio_ofertado` entre los aprobados (C/DA/APROBADO) de ese renglón — mismo criterio
  económico que ya usa el Gerente Técnico para decidir, evita depender de un criterio
  arbitrario (ej. orden de inserción).
- **Migración aditiva únicamente** (columnas nuevas nullable, ninguna se remueve) — cero
  riesgo de romper OCs ya emitidas con insumo_id, despliegue sin downtime.
- **Corrección del cuadro ya bloqueado en producción vía script de un solo uso**, no vía
  código permanente — es un caso puntual de datos ya inconsistentes previos al fix, no
  una regla de negocio a mantener en el código.

## Risks / Trade-offs

- **[Riesgo] La regla de auto-selección de ganador podría no coincidir con lo que
  Compras esperaría en un caso ambiguo** (ej. dos proveedores aprobados sin
  primera/segunda opción marcada para ese renglón específico) → Mitigación: se usa el
  mismo criterio (menor precio) que ya es el criterio económico implícito de todo el
  flujo; documentado explícitamente en el proposal para que Compras pueda auditar el
  resultado antes de enviar la OC al proveedor (el flujo de envío por correo sigue siendo
  una acción manual separada).
- **[Riesgo] Migración en producción bajo presión de tiempo** → Mitigación: migración
  puramente aditiva (nullable), sin backfill destructivo, revisada antes de aplicar.

## Migration Plan

1. Tests que reproducen ambos bugs (unit test de `requisicionQuedoCubiertaPorLote` con
   texto libre; integration test de `revisar-gt` verificando `es_ganador` automático;
   integration test de `convertir-oc` con renglón de texto libre) — en rojo contra el
   código actual.
2. Migración Prisma (`insumo_id` nullable + 3 columnas nuevas en `OrdenCompraItem`).
3. Fix de `revisar-gt` (auto-ganador) y `convertir-oc` (soporte texto libre) +
   `requisicion-cobertura.ts` + `orden-compra-pdf-payload.ts`.
4. Tests en verde. `tsc --noEmit` en `compras`.
5. Deploy: `prisma migrate deploy` + rebuild + restart de `compras` en VPS.
6. Corrección puntual del cuadro `CC-1784053191713` (script de un solo uso) + verificar
   que `convertir-oc` genera la OC correctamente para ese caso real.

**Rollback**: revertir el commit del código; la migración de esquema (columnas nuevas
nullable) puede quedarse sin revertir sin efecto — no rompe compatibilidad con el código
anterior si hubiera que volver atrás.

## Open Questions

(ninguna — decisiones confirmadas directamente con el usuario dueño del producto)

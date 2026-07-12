## Context

`ComparativaDetalle` (`apps/compras/prisma/schema.prisma:378+`) ya
representa exactamente "una línea del cuadro comparativo por
proveedor+insumo" — el nivel de partida correcto para esta fecha. Tiene un
campo `tiempo_entrega String? @db.VarChar(50)` pensado para esto, pero
nunca se conectó a la UI: `ComparativaDetail.tsx` declara
`tiempos: Record<string, string | null>` en `CotizacionLinea`, lo
inicializa vacío en `handleAddLinea`, lo muestra de solo lectura en la
tabla (`linea.tiempos?.[prov.id] ?? '—'`, línea ~1850) pero no existe
ningún `handleUpdateTiempo` ni input — y el payload de
`PUT .../cotizaciones` (`ComparativaDetail.tsx` línea ~986-992) solo envía
`insumo_id`/`precio`, nunca `tiempo_entrega`. Verificado con grep en todo
el repo: las únicas escrituras reales del campo son `prisma/seed.ts` (datos
demo) y un e2e test — ninguna dependencia de datos reales en producción.

## Goals / Non-Goals

**Goals:**
- Que Compras pueda capturar, por cada proveedor y cada partida, una
  fecha de entrega estimada real (no texto libre) al registrar precios de
  cotización.
- Que esa fecha se conserve al clonar el cuadro en una nueva revisión.

**Non-Goals:**
- No se propaga la fecha a `OrdenCompra`/`OrdenCompraItem` — la OC se
  genera desde el renglón ganador de `ComparativaDetalle`
  (`convertir-oc`), y hoy no copia `tiempo_entrega` a la OC; agregar eso
  es una extensión natural pero no fue pedida explícitamente en el punto
  C del roadmap. Se deja como pregunta abierta.
- No se cambia `SolicitudCotizacion.fecha_limite` (fecha límite para
  responder la invitación) — es un concepto distinto (deadline de
  respuesta, no fecha de entrega de material) y ya funciona
  correctamente; no forma parte de este bug/gap.
- No se agrega validación de que `fecha_entrega_estimada` sea posterior a
  hoy o a la fecha de la solicitud — Compras captura lo que el proveedor
  declaró, sin asumir buena fe en cuanto a factibilidad.

## Decisions

### D1 — Renombrar y retipar el campo existente, no agregar uno nuevo en paralelo
`tiempo_entrega` (`VARCHAR(50)`) → `fecha_entrega_estimada`
(`DateTime?`). Se descarta mantener ambos campos porque el campo viejo
nunca tuvo datos reales (confirmado por grep) — no hay nada que migrar ni
usuarios actuales que dependan de leerlo. Una migración de renombre+retipo
directa es más simple que introducir un campo paralelo y deprecar el
viejo.
Alternativa descartada: mantener `tiempo_entrega` como texto libre
adicional ("2 semanas", "15 días hábiles") junto a la fecha estructurada —
Bocam pidió explícitamente una fecha, no texto libre; mantener ambos
duplica la superficie de captura sin necesidad.

### D2 — Input de fecha nativo (`<input type="date">`), no un date-picker de librería
Consistente con el resto del formulario de cotizaciones (inputs HTML
nativos sin dependencias extra, ej. el input `type="number"` de precio en
la misma celda). Se coloca justo debajo del input de precio, en la misma
celda de la tabla, reemplazando el texto "—" que hoy nunca se llena.

### D3 — El campo vive en `ComparativaDetalle`, no en una tabla nueva
La granularidad pedida ("por partida") ya es exactamente el nivel de
`ComparativaDetalle` (una fila por proveedor × insumo). No se necesita una
tabla nueva ni una relación adicional — es agregar/retipar una columna en
un modelo que ya existe con la granularidad correcta.

## Risks / Trade-offs

- **[Riesgo] Cambio de tipo de columna (`VARCHAR` → fecha) en una tabla
  que puede tener filas existentes en producción con texto libre en
  `tiempo_entrega`** (aunque el flujo real de captura nunca lo llenó,
  podría haber sido poblado manualmente alguna vez) → Mitigación: la
  migración usa `DROP COLUMN` + `ADD COLUMN` (no hay conversión de texto a
  fecha posible de forma segura); se acepta la pérdida de esos valores de
  texto libre porque nunca fueron una fuente de verdad confiable (formato
  no estandarizado, "2 días" vs "5 días hábiles" vs vacío).
- **[Riesgo] Al generar la OC desde el renglón ganador, la fecha de
  entrega estimada capturada en el comparativo se pierde** (no se copia a
  `OrdenCompraItem`) → Aceptado como Non-Goal explícito de este change;
  documentado como pregunta abierta para un change futuro si Bocam lo
  pide.

## Migration Plan

- Migración Prisma real (`prisma migrate dev --name
  fecha_entrega_estimada_por_partida`) en `apps/compras/prisma/migrations/`,
  siguiendo la convención existente del directorio.
- Branch `feat/fecha-entrega-estimada-por-partida`.
- Deploy: backend (`apps/compras`) requiere `prisma migrate deploy` +
  rebuild/restart manual del contenedor en el VPS (sin CI/CD); frontend se
  despliega solo al mergear a `main`.
- Rollback: el campo nunca tuvo datos reales de producción, por lo que
  revertir el commit + una migración de reversión (recrear
  `tiempo_entrega` vacío) es seguro sin pérdida de datos de negocio.

## Open Questions

- ¿Debe la fecha de entrega estimada propagarse a `OrdenCompraItem` al
  generar la OC desde el renglón ganador? Fuera de alcance de este
  change — se deja como candidato a change futuro si Bocam lo confirma.

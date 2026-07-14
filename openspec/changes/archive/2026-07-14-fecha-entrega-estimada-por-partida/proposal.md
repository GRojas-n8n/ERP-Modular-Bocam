## Why

Bocam necesita saber, por cada partida (material/concepto) de un cuadro
comparativo, cuándo un proveedor la entregaría — no una fecha global para
toda la cotización. Hoy `ComparativaDetalle.tiempo_entrega` existe en el
schema como texto libre por línea+proveedor, pero **nunca se captura de
verdad**: el frontend no tiene ningún input para editarlo (`comp.lineas`
inicializa `tiempos: {}` y jamás se actualiza), así que el campo llega
siempre vacío al guardar cotizaciones y solo se muestra un placeholder
"—" en la UI. El dato que Bocam pide no existe en la práctica.

## What Changes

- `ComparativaDetalle.tiempo_entrega` (`String? @db.VarChar(50)`, texto
  libre) se reemplaza por `fecha_entrega_estimada` (`DateTime?`) — fecha
  estructurada, no texto libre. Sin dependientes reales (verificado: el
  campo nunca se popula desde el frontend; solo aparece en `seed.ts` y un
  e2e test, ambos actualizables como parte de este change).
- `PUT /api/v1/compras/comparativas/:id/cotizaciones` acepta
  `fecha_entrega_estimada` (ISO date string) por cada precio, en vez de
  `tiempo_entrega`.
- `ComparativaDetail.tsx`: se agrega un input de fecha editable por
  proveedor+línea en la Tabla de Cotizaciones (reemplaza el texto
  "—"/`linea.tiempos` que hoy es de solo lectura y nunca tiene valor),
  visible solo en modo Compras (`modo === 'compras'`), deshabilitado
  cuando el cuadro está bloqueado.
- Los dos flujos de "nueva revisión" (`nueva-revision`,
  `revision-con-preguntas`) que clonan `ComparativaDetalle` copian el
  campo renombrado sin cambios de lógica.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `cotizacion-compras-ux`: el Cuadro Comparativo gana un campo real de
  fecha de entrega estimada por partida y proveedor, capturado por
  Compras al registrar cada cotización.

## Impact

- **Backend (`apps/compras`)**: migración de schema (`ComparativaDetalle`),
  `PUT /comparativas/:id/cotizaciones` (`main.ts` ~línea 2966), los dos
  handlers de clonación de revisión (~línea 5111, ~línea 5462),
  `prisma/seed.ts`.
- **Frontend (`apps/app-shell`)**: `ComparativaDetail.tsx` (`CotizacionLinea.tiempos`
  → `fechasEntrega`, input de fecha en la tabla ~línea 1848, payload de
  guardar cotizaciones ~línea 986), `ComprasView.tsx` (normalización de
  `d.tiempo_entrega` → `d.fecha_entrega_estimada` ~línea 487).
- **Tests**: `apps/compras/test/e2e/reconciliacion.e2e.test.ts` (ajustar
  el campo usado en su seed de datos).
- Sin cambios de schema en otros microservicios — el dato vive únicamente
  en `compras` (no se propaga a `OrdenCompra`/`OrdenCompraItem` en este
  change; fuera de alcance, ver Open Questions en design.md).

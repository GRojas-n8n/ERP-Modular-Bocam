## Why

En `ComparativaDetail.tsx`, `handleAddProveedorFromCatalog` (agregar
proveedor manualmente desde el catálogo) y `handleAddLinea` (agregar un
ítem/línea manualmente) mutan `comp.estado` a `'EN_PROCESO'` en el estado
**local** del frontend. Este valor nunca lo usa ni lo entiende el backend
de `compras` (verificado con grep: cero ocurrencias de `EN_PROCESO` en
`apps/compras/src/`) — es una bandera puramente cliente-side sin
contraparte real.

El botón "Enviar a Evaluación Técnica →" (`showEnviarEvalBtn`) exige
`comp.estado === 'BORRADOR'` exacto. Como `estado` nunca vuelve a
`'BORRADOR'` tras agregar un proveedor o línea manualmente (nada lo
resetea), **el botón desaparece permanentemente para esa sesión de
edición** — Compras no puede enviar el cuadro a evaluación técnica sin
recargar la página, y al recargar pierde el proveedor/línea agregado
manualmente porque nunca se persistió en el backend (todo el guardado real
ocurre recién al hacer clic en "Enviar a Evaluación Técnica", vía `PUT
.../cotizaciones`).

Documentado como hallazgo colateral en el change `especificacion-ofrecida-proveedor`
(PR #67, 2026-07-14) y confirmado sin corregir hasta ahora.

## What Changes

- `apps/app-shell/src/components/ComparativaDetail.tsx`: quitar la
  mutación `estado: 'EN_PROCESO'` de `handleAddProveedorFromCatalog` y de
  `handleAddLinea` — el `estado` local deja de tocarse en ambos handlers,
  queda como el valor real que ya trae el cuadro (`BORRADOR` en el único
  camino donde estas acciones están habilitadas).
- No se toca el resto del código que ya trata `BORRADOR` y `EN_PROCESO`
  como equivalentes (`locked`, la sección de "Partidas de la Requisición",
  `showAutorizarLegacyBtn`) — sigue funcionando igual, simplemente ya no
  hay ningún camino que produzca `EN_PROCESO` desde el frontend. El valor
  de estado y su badge quedan en el código (posible legado de un workflow
  anterior) pero fuera de alcance de este fix — no se toca lo que no está
  roto.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `cotizacion-compras-ux`: agrega (delta ADDED) el requisito de que
  agregar un proveedor o una línea manualmente al Cuadro Comparativo NO
  SHALL alterar el `estado` local, para no bloquear acciones subsecuentes
  basadas en ese estado.

## Impact

- **Archivos afectados**: `apps/app-shell/src/components/ComparativaDetail.tsx`
  (2 handlers), nuevo test
  `ComparativaDetail.agregar-proveedor-preserva-estado.test.tsx`.
- Sin cambios de backend, sin cambios de API, sin migración.
- Requiere redeploy VPS de `app-shell` tras merge.

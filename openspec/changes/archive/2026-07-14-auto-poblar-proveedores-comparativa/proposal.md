## Why

El prepoblado de proveedores del Cuadro Comparativo desde la Solicitud de Cotización
(`SolicitudCotizacionProveedor`) ya fue especificado e implementado como "completo" en el
change archivado `2026-07-10-unificar-pdf-cotizacion-comparativa` (tarea 2.3), pero es una
**regresión no detectada**: el prepoblado solo escribe estado local de React en
`openComparativa` (`apps/app-shell/src/views/ComprasView.tsx:907-917`) cuando el cuadro se
crea por primera vez, y nunca se persiste al backend. Al recargar la página o reabrir el
cuadro en otra sesión, `comparativas` se recarga desde `GET /api/v1/compras/comparativas`
(`ComprasView.tsx:475`), cuyo `normalizeComp` (líneas 531-571) deriva `proveedores`
exclusivamente de `ComparativaDetalle` — filas que solo existen una vez que alguien capturó
un precio. El resultado: los proveedores prepoblados desaparecen, y la rama de "reabrir un
cuadro existente" (`if (existing)`, `ComprasView.tsx:887-896`) solo repuebla renglones
(`lineas`), nunca proveedores. Confirmado en producción (2026-07-13, usuario administrador):
al hacer clic en "Continuar comparativa" sobre una requisición con proveedores ya invitados
y marcados como `RESPONDIO`, la lista de proveedores del cuadro aparece vacía y hay que
volver a buscarlos y agregarlos a mano desde el catálogo general.

El propio `tasks.md` del change archivado admite en la tarea 7.1 que "no se realizó
verificación manual en navegador" — exactamente el tipo de brecha que dejó pasar esta
regresión (ver hallazgo similar en PR #37, donde un fix se dio por bueno con tests jsdom
sin probarlo con el rol/dato real).

## What Changes

- Repoblar `proveedores` desde `SolicitudCotizacionProveedor` cada vez que se abre un cuadro
  comparativo (creación **y** reapertura), no solo al crearlo por primera vez — cerrando la
  rama `if (existing)` de `openComparativa` que hoy no toca proveedores.
- Definir explícitamente qué proveedores se prepoblan: decidir si solo `RESPONDIO`, o
  también `PENDIENTE`/`DECLINO` con indicador visual (la spec vigente de
  `cotizacion-compras-ux` ya define badges de estado de respuesta por proveedor — este
  change debe quedar consistente con esa lógica, no duplicarla).
  Ver **design.md** para la decisión y su justificación.
- Definir el comportamiento cuando hay más de 3 proveedores elegibles (el cuadro comparativo
  tiene un tope de 3, `ComparativaDetail.tsx:825`).
- No se modifica el schema de Prisma: el fix es de flujo (cuándo/cómo se calcula
  `proveedores` para mostrar en UI), no una nueva tabla.

## Capabilities

### New Capabilities

(ninguna — este change corrige una regresión sobre una capability ya existente)

### Modified Capabilities

- `cotizacion-compras-ux`: el requirement ya existente "El cuadro comparativo SHALL
  prepoblarse con los proveedores ya invitados" (consolidado en
  `openspec/specs/cotizacion-compras-ux/spec.md:107-121`) queda subespecificado — no cubre
  el caso de reapertura de un cuadro ya creado. Este change lo corrige/completa.

## Impact

- **Frontend**: `apps/app-shell/src/views/ComprasView.tsx` (`openComparativa`, función
  `seedProveedoresDesdeSolicitud` ya existente, `loadSolicitud`).
- **Sin cambios de backend/schema** salvo que el design.md determine que hace falta un
  endpoint adicional para resolver el caso "cuadro ya tiene proveedores parciales por
  precios capturados + hay proveedores invitados nuevos sin capturar" (a decidir en design).
- Afecta el flujo real de Compras en producción (tenant Bocam) — es el paso que bloqueaba la
  prueba manual del usuario administrador sobre el flujo completo requisición→factura.

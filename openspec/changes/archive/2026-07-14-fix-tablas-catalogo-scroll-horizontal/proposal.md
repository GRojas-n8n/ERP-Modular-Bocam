## Why

Un usuario viendo "Catálogo de Obra" (Gerencia Técnica) el 2026-07-08 no se dio cuenta
de que la tabla tenía columnas ocultas hacia la derecha (Δ%, Importe, Saldo, APU) y
pensó que faltaba información. La tabla sí tiene `overflow-x-auto` funcional, pero el
scrollbar global (`apps/app-shell/src/index.css`) es de 5px, con track transparente y
color casi invisible — no hay ninguna señal de que se puede desplazar. Al auditar el
resto del frontend para el mismo patrón, se encontró un bug relacionado pero más
grave: varias tablas usan `overflow-hidden` en el wrapper en vez de `overflow-x-auto`,
combinado con `min-w-[...]px` en la tabla — eso **recorta** columnas sin ninguna forma
de alcanzarlas, ni siquiera con scroll.

## What Changes

- Se agrega una señal visual clara de scroll horizontal disponible (sombra/gradiente
  en el borde derecho cuando hay contenido oculto) a todas las tablas de catálogo del
  app-shell, reemplazando el scrollbar casi invisible como único indicador.
- Se corrigen los wrappers de tabla que usan `overflow-hidden` + `min-w-[...]px` (que
  recortan contenido sin acceso) cambiándolos a `overflow-x-auto` con la misma señal
  visual — mismo tratamiento que las tablas que ya funcionaban correctamente.
- No se modifica el contenido de las tablas (columnas, datos, orden) — solo el
  contenedor de scroll y su affordance visual.

## Capabilities

### New Capabilities
- `tabla-scroll-horizontal-affordance`: Toda tabla de catálogo/listado con columnas
  que puedan exceder el ancho visible SHALL permitir scroll horizontal y SHALL
  mostrar una señal visual de que hay contenido oculto cuando corresponda.

### Modified Capabilities
(ninguna — no existe spec previo que documente el comportamiento de scroll de estas
tablas; es una capacidad nueva formalizada a partir de un bug real)

## Impact

**Tablas rotas (overflow-hidden + min-w, recortan contenido sin acceso) — fix crítico:**
- `apps/app-shell/src/views/InsumosView.tsx` líneas 2173-2174 (Control de Costos WBS)
- `apps/app-shell/src/views/InsumosView.tsx` línea 2575 (Trazabilidad)
- `apps/app-shell/src/views/ComprasView.tsx` línea 1760 (proveedores)
- `apps/app-shell/src/views/ControlProyectosView.tsx` líneas 363, 431, 515
- `apps/app-shell/src/views/ResidenciaView.tsx` línea 1489 (nómina)
- `apps/app-shell/src/views/ContabilidadView.tsx` línea 280 (detalle de movimientos
  contables — sin ningún wrapper de scroll)

**Tablas funcionales que solo necesitan la señal visual:**
- `apps/app-shell/src/views/InsumosView.tsx` líneas 1825 (Catálogo de Obra — bug
  reportado), 2045, 2371, 2668, 2855, 3026
- `apps/app-shell/src/views/CalidadView.tsx` líneas 919, 1282
- `apps/app-shell/src/views/VentasView.tsx` líneas 254, 293, 334
- `apps/app-shell/src/views/ContabilidadView.tsx` líneas 227, 433 (corregido durante
  implementación: la auditoría original solo había listado la línea 433 de este
  archivo, pero hay una segunda tabla funcional en la línea 227)
- `apps/app-shell/src/views/PersonalView.tsx` línea 1104
- `apps/app-shell/src/views/ComparativaPrecios.tsx` línea 85
- `apps/app-shell/src/components/ComparativaDetail.tsx` líneas 1442, 1587, 2659

**Infraestructura compartida:**
- `apps/app-shell/src/index.css` líneas 126-132 (estilo global de scrollbar)
- `apps/app-shell/src/components/TableScrollShadow.tsx` (nuevo componente compartido)
- Infraestructura de testing nueva en `apps/app-shell` (Vitest + Testing Library no
  existían) y unificación de versiones de `react`/`react-dom`/`vite` en todo el
  monorepo vía `overrides` en el `package.json` raíz — ver `design.md` para el
  detalle de por qué fue necesario.

**Fuera de alcance (hallazgo durante implementación, no incluido en este change):**
- `packages/ui-core/src/primitives.tsx` tiene un componente compartido
  `TableContainer` con el mismo patrón (`overflow-x-auto` sin señal visual) usado
  en `AlmacenView.tsx`, `ControlObraView.tsx`, `FinanzasView.tsx`, `SeguridadView.tsx`
  y tablas adicionales en `ComprasView.tsx`/`PersonalView.tsx`/`ResidenciaView.tsx`
  distintas a las ya corregidas aquí. No se tocó por ser un paquete compartido con
  mayor radio de impacto no cubierto por el spec original — candidato a un change
  de seguimiento.

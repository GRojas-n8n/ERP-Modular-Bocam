## Context

`apps/app-shell` es la única SPA del sistema (micro-frontend único; los demás
"apps/<servicio>" son solo backend). Cada vista de módulo (`*View.tsx`) repite el
mismo patrón para tablas de catálogo: un `<div>` contenedor con fondo/borde/sombra
(`bg-card rounded-3xl border ... shadow-xl overflow-hidden`) que envuelve un segundo
`<div>` que debería tener `overflow-x-auto` y dentro un `<table className="w-full">`
con columnas de ancho fijo vía `px-6 py-4` por celda.

En la mayoría de las tablas el segundo `<div>` sí tiene `overflow-x-auto` (scroll
funcional), pero la única señal de que hay contenido oculto es el scrollbar nativo,
estilizado globalmente en `apps/app-shell/src/index.css` a 5px de ancho, track
transparente y thumb del mismo tono que el borde — visualmente casi imperceptible,
sobre todo en trackpads/touch donde el scrollbar puede no mostrarse hasta que el
usuario ya está desplazando. En un subconjunto de tablas (ver `proposal.md` →
Impact), el segundo `<div>` quedó con `overflow-hidden` en vez de `overflow-x-auto`
mientras la tabla fuerza `min-w-[...]px` — combinación que recorta columnas sin
ninguna vía de acceso, ni siquiera con scroll.

No existe ningún componente compartido para tablas en el codebase — cada vista
implementa su propio `<table>` inline. Introducir un componente no es una
abstracción prematura: el patrón ya se repite en ~19 ubicaciones documentadas en el
proposal, y corregir cada una por separado dejaría el mismo bug en la siguiente
tabla que alguien agregue.

## Goals / Non-Goals

**Goals:**
1. Toda tabla de catálogo con scroll horizontal disponible debe mostrar una señal
   visual (no solo el scrollbar nativo) de que hay columnas ocultas a la derecha, y
   de que ya no las hay al llegar al final.
2. Ninguna tabla debe recortar columnas sin acceso — todo `overflow-hidden` que
   envuelva una tabla con `min-w` forzado pasa a `overflow-x-auto`.
3. El fix no debe alterar datos, columnas ni el orden de las tablas — solo el
   contenedor de scroll y su affordance.

**Non-Goals:**
- No se rediseña la tabla en sí (columnas fijas/sticky, paginación, densidad) — eso
  queda fuera de este bug-fix.
- No se cambia el estilo global del scrollbar de toda la aplicación más allá de lo
  necesario para esta affordance (no es un rediseño visual del sistema).
- No se toca ninguna tabla que no aparezca en el inventario de `proposal.md` →
  Impact (evita tocar código no cubierto por este spec, por la regla de "no
  refactorizar legacy sin spec").

## Decisions

**D1 — Componente compartido `TableScrollShadow` (wrapper) en vez de arreglar cada
`<div className="overflow-x-auto">` por separado.**
Se crea `apps/app-shell/src/components/TableScrollShadow.tsx`: un wrapper que
recibe `children` (la tabla), aplica `overflow-x-auto`, y usa un `ref` + listener de
`scroll` + `ResizeObserver` para calcular si hay contenido oculto a la derecha
(`scrollWidth > clientWidth + scrollLeft`) y/o a la izquierda (`scrollLeft > 0`).
Cuando corresponde, renderiza una sombra/gradiente absoluto en el borde
correspondiente (`pointer-events-none`, `bg-gradient-to-l/r from-card/... to-transparent`).
Alternativa considerada — truco CSS puro con `background-attachment: local` y doble
`radial-gradient`: se descartó porque requiere que el color de fondo del gradiente
coincida exactamente con el fondo de cada contenedor (varía: `bg-card`, con bordes
redondeados y sombra ya existentes), y el tema tiene modo claro/oscuro vía variables
CSS (`hsl(var(--card))`) — la variante JS es más robusta y no depende de adivinar el
color de fondo en cada vista.

**D2 — El wrapper reemplaza el `<div className="overflow-x-auto">` existente
(tablas ya funcionales) y el `<div className="overflow-hidden">` roto (tablas que
recortan), con la misma API.**
Esto unifica el tratamiento: no hay dos rutas de código distintas para "tablas que
ya andaban" vs "tablas rotas" — todas terminan usando `TableScrollShadow`, así que
un futuro cambio a la affordance se aplica una sola vez.

**D3 — Ajuste menor y no invasivo al scrollbar global (`index.css`).**
Se aumenta levemente el contraste del thumb (color más sólido, no transparente) como
segunda señal — defensa en profundidad para cuando el usuario ya inició el scroll,
sin rediseñar el estilo del scrollbar de toda la aplicación (sigue siendo delgado y
discreto en el resto de la UI, como paneles laterales o listas largas que no son
tablas de catálogo).

**D4 — Fix de wrappers rotos es un cambio de una sola clase (`overflow-hidden` →
uso de `TableScrollShadow`), sin tocar `min-w` ni columnas.**
El recorte se resuelve solo habilitando el scroll; los anchos mínimos ya definidos
(`min-w-[900px]`, etc.) se mantienen tal cual, porque ya reflejan el ancho real
necesario para esas columnas.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| El wrapper con `ResizeObserver` se monta/desmonta muchas veces en vistas con tabs (ej. `InsumosView.tsx` tiene varias tablas en distintos tabs) y podría afectar performance | `ResizeObserver` se limpia en cleanup del `useEffect`; el cálculo es una comparación de tres números, sin costo relevante |
| Cambiar `overflow-hidden` a scroll en tablas que hoy "se ven bien" (recortadas pero sin verse rotas a simple vista) podría sorprender a usuarios acostumbrados al recorte | Es el comportamiento correcto — el recorte actual oculta datos reales (Δ%, Importe, Saldo, etc. en algunos casos); se documenta como fix, no como cambio de diseño |
| Tocar 19 archivos de vista aumenta el radio de un solo PR | Cambio mecánico y acotado (una clase + un import por tabla); se agrupan en un solo PR por ser el mismo fix repetido, no una migración de features distintas |

## Migration Plan

1. Crear `TableScrollShadow.tsx` con test unitario (detección de overflow
   izquierda/derecha).
2. Aplicar el wrapper primero en Catálogo de Obra (`InsumosView.tsx:1825` — el bug
   reportado) y verificar visualmente.
3. Aplicar al resto de tablas funcionales (affordance) y luego a las tablas rotas
   (overflow-hidden → wrapper), archivo por archivo, cada uno un commit atómico.
4. Ajuste de `index.css` (contraste del thumb) al final, por ser transversal.
5. **Rollback:** cada tabla usa el wrapper de forma independiente — revertir un
   archivo no afecta a los demás. No hay migración de datos ni cambios de backend.

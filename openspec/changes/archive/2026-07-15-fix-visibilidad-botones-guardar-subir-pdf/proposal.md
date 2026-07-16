## Why

Los botones de "Guardar" y las zonas de "Subir PDF / adjuntar" en varias vistas del
app-shell usan colores de bajo contraste (fondos `bg-muted/20`, `bg-indigo-500/5`,
texto `text-muted-foreground`, opacidad reducida indebidamente) que los hacen casi
invisibles tanto en tema claro como oscuro. El usuario reporta que pierde estos
botones "entre el entorno" al usar la app en producción, afectando flujos críticos
(Comparativa, Compras, Calidad, Admin, Insumos, Personal, Master).

## What Changes

- Botón "Guardar" (y variantes equivalentes de confirmación de guardado) pasa a
  usar verde sólido `#059669` con texto blanco y hover `#047857`, consistente en
  todas las vistas donde aparece.
- Botón/dropzone "Subir PDF" o "adjuntar archivo" conserva el patrón visual de
  caja punteada de arrastrar-y-soltar, pero con borde verde y texto verde oscuro
  reales (no gris sobre gris ni tinte sobre tinte), y fondo con tinte verde suave.
- No se centraliza en `packages/ui-core` en este change — se aplica el mismo par
  de clases Tailwind en cada instancia scattered ya identificada (fix de
  contraste puntual, no refactor de arquitectura de componentes).
- No cambia ningún comportamiento funcional (validaciones, flujos de guardado,
  lógica de subida de archivos) — es exclusivamente un fix visual de contraste.

## Capabilities

### New Capabilities
- `visibilidad-acciones-guardar-adjuntar`: define el contraste mínimo y la
  paleta requerida para botones de acción de guardado y de adjuntar/subir
  archivos en el app-shell, en tema claro y oscuro.

### Modified Capabilities
(ninguna — no existe spec previo que cubra el contraste de estos botones)

## Impact

- **Archivos afectados** (`apps/app-shell/src`): `views/ComprasView.tsx`,
  `components/ComparativaDetail.tsx`, `views/AdminView.tsx`,
  `views/CalidadView.tsx`, `views/MasterView.tsx`, `views/InsumosView.tsx`,
  `views/PersonalView.tsx`.
- Cambio puramente de clases Tailwind inline (color/borde/fondo/texto); sin
  cambios de props, de lógica de componentes ni de backend.
- Sin impacto en API, base de datos ni eventos RabbitMQ.

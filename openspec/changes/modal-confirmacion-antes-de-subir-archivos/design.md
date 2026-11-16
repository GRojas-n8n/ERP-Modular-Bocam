## Context

`ConfirmCriticalActionDialog` (`packages/ui-core/src/primitives.tsx:349-430`) ya es el componente
compartido usado por `confirmacion-accion-critica-proyecto` y `confirmacion-proyecto-en-altas`
para pedir confirmación explícita antes de una acción sensible, mostrando el proyecto activo y
bloqueando el diálogo contra clic-fuera/Escape. Los 7 flujos de carga de archivo (Catálogo,
Explosión de Insumos, APU, Fichas Técnicas, Usuarios, Empleados, Proveedores) hoy no pasan por
este componente — algunos suben directo, otros (Catálogo/Explosión/APU en
`apps/app-shell/src/views/InsumosView.tsx`) ya abren un `SlidePanel` de preview del contenido del
archivo, pero sin confirmar antes el destino.

## Goals / Non-Goals

**Goals:**
- Un único punto de confirmación reusado (no 7 modales distintos) que se inserta antes de procesar
  cualquier archivo seleccionado, mostrando: nombre de archivo, destino (módulo + tipo de carga) y
  proyecto activo.
- Cero cambios de backend: el diálogo solo antecede al flujo de subida que ya existe.

**Non-Goals:**
- No cubre la edición/omisión de filas dentro del archivo (eso es el change
  `preview-editable-catalogo-explosion-apu`, punto 6 de la lista original).
- No cambia qué proyecto está activo ni cómo se selecciona — solo lo muestra para confirmar.

## Decisions

- **Extender `ConfirmCriticalActionDialog` con props opcionales `fileName?: string` y
  `destination?: string`** en vez de crear un componente nuevo. Alternativa descartada: un modal
  de carga de archivo separado — duplicaría el overlay/bloqueo de interacción/manejo de
  Escape que `ConfirmCriticalActionDialog` ya implementa y que `confirmacion-proyecto-en-altas`
  ya especifica como requirement.
- **El diálogo se dispara en el `onChange` del `<input type="file">`, antes de invocar el parser**
  (`handleFileChange`/`handleFileAPU`/`handleFileExplosion` en `InsumosView.tsx`, y sus
  equivalentes en `AdminView.tsx`/`PersonalView.tsx`/`ComprasView.tsx`). Si el usuario cancela, se
  limpia el `<input>` (via `ref.current.value = ''`) y no se llama al parser.
- **Para Catálogo/Explosión/APU, el diálogo precede al `SlidePanel` existente** — no lo reemplaza.
  El `SlidePanel` sigue siendo el paso de revisión de contenido; este cambio agrega el paso previo
  de confirmar destino antes de siquiera parsear el archivo.

## Risks / Trade-offs

- [Riesgo] Un paso de confirmación extra en 7 flujos añade fricción a usuarios que suben archivos
  seguido y correctamente. → Mitigación: el diálogo es de un solo clic ("Confirmar"), sin campos
  que llenar, y solo aparece una vez por archivo seleccionado.
- [Riesgo] Duplicar lógica de "destino" (texto legible por módulo) en cada vista. → Mitigación:
  centralizar el texto de destino como constante por tipo de carga junto al propio `<input
  type="file">`, no en el componente compartido (el componente solo recibe el string ya armado).

## Migration Plan

Cambio de frontend puro, sin migración de datos. Se despliega junto al build normal de
`apps/app-shell`. No requiere rollback especial — revertir el commit restaura el comportamiento
de subida directa.

## Why

En el formulario "Nueva Requisición" del Residente (`ResidenciaView.tsx`), cuando el tipo
es IMPREVISTO el campo común de notas (`reqNotas`) se etiqueta **"Justificación"** con
placeholder "Motivo del imprevisto...", y además se le oculta la leyenda de advertencia
("Se verán en la Solicitud de Cotización y pueden llegar a los proveedores") que sí se
muestra para los demás tipos. El Residente razonablemente entiende ese campo como
justificación **interna** (control presupuestal, seguimiento de obra) — pero el dato se
guarda en `observaciones` de la requisición, Compras lo ve como "⚠ Consideraciones del
Residente (para proveedores)", **precarga las "Notas Adicionales" de la Solicitud de
Cotización** (`ComprasView.tsx` `handleOpenSolicitudPanel`) y de ahí viaja como
`notasProveedor` en el correo HTML que reciben los proveedores (`apps/compras/src/mailer.ts`).

Resultado: información interna (motivos de desviación presupuestal, errores de obra,
urgencias) puede llegar a proveedores sin que el Residente lo sepa. Reportado por el
usuario tras un caso real con una requisición imprevista.

La justificación interna del imprevisto **ya existe y es obligatoria por ítem**
(`item.justificacion`, campo "Justificación *" por cada material imprevisto), así que el
campo común no necesita cumplir ese rol — solo está mal etiquetado.

## What Changes

- En `apps/app-shell/src/views/ResidenciaView.tsx`, el campo común `reqNotas` del
  formulario de requisición IMPREVISTO deja de llamarse "Justificación":
  - Etiqueta: **"Notas para Proveedores"** (igual que en los demás tipos de requisición).
  - Placeholder: el mismo de los demás tipos ("Instrucciones, certificaciones,
    consideraciones para el proveedor...") — se elimina "Motivo del imprevisto...".
  - La leyenda de advertencia "Se verán en la Solicitud de Cotización y pueden llegar a
    los proveedores." se muestra **también** para IMPREVISTO (hoy está condicionada a
    `reqTipo !== 'IMPREVISTO'`).
- Sin cambios de backend, de modelo de datos ni de payload: `reqNotas` sigue mapeando a
  `observaciones` y `reqNotasInternas` a `observaciones_internas`. Es un cambio de
  presentación para alinear la etiqueta con el destino real del dato.
- Fuera de alcance (hallazgo anotado): `ComprasView.tsx` tiene su propio formulario de
  requisición con un campo "Notas / Justificación" y placeholder "Describe el motivo del
  imprevisto..." con la misma ambigüedad; y los datos ya capturados en requisiciones
  imprevistas existentes no se migran (Compras puede editarlos antes de enviar la
  solicitud). Si se quiere corregir el formulario de Compras, será otro change.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `residente-seleccion-insumos`: el formulario de requisición imprevista del Residente
  etiqueta el campo común de notas como "Notas para Proveedores" con su advertencia de
  visibilidad, en vez de "Justificación".

## Impact

- **Frontend**: `apps/app-shell/src/views/ResidenciaView.tsx` (una etiqueta, un
  placeholder y una condición de renderizado de la leyenda).
- **Sin impacto de backend/BD/API** — no cambia ningún contrato ni dato persistido.
- **Redeploy**: solo `app-shell` (build estático) tras el merge.

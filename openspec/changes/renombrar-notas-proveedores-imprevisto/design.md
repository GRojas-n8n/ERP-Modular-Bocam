## Context

`ResidenciaView.tsx` (~línea 2347) renderiza el campo común de notas del formulario
"Nueva Requisición":

```tsx
<FormField label={reqTipo === 'IMPREVISTO' ? 'Justificación' : 'Notas para Proveedores'}>
  <Textarea
    placeholder={reqTipo === 'IMPREVISTO' ? 'Motivo del imprevisto...' : 'Instrucciones, certificaciones, consideraciones para el proveedor...'}
    value={reqNotas} ... />
  {reqTipo !== 'IMPREVISTO' && (
    <p>Se verán en la Solicitud de Cotización y pueden llegar a los proveedores.</p>
  )}
</FormField>
```

Flujo real del dato (verificado 2026-07-14): `reqNotas` → `observaciones` de la
requisición → Compras lo muestra como "⚠ Consideraciones del Residente (para
proveedores)" → precarga `solicitudForm.notas` al abrir el panel de Solicitud de
Cotización → `notasProveedor` en el correo HTML a proveedores.

La justificación interna por ítem imprevisto (`item.justificacion`, obligatoria,
validada en el submit) es un campo distinto y no se toca.

## Goals / Non-Goals

**Goals:**
- Que el Residente sepa, al capturar, que ese campo es de cara a proveedores — misma
  etiqueta, placeholder y advertencia que en los demás tipos de requisición.

**Non-Goals:**
- No se cambia el modelo de datos, el payload ni ningún endpoint.
- No se toca el formulario de requisición propio de `ComprasView.tsx` (misma ambigüedad,
  anotada como hallazgo en el proposal — otro change si se decide).
- No se migran/limpian `observaciones` de requisiciones imprevistas ya existentes
  (Compras puede editar las notas antes de enviar la solicitud).

## Decisions

- **Eliminar los tres condicionales por `reqTipo === 'IMPREVISTO'` en ese FormField**
  (etiqueta, placeholder y leyenda) en lugar de inventar una etiqueta nueva tipo
  "Notas para Proveedores (opcional)": el formulario queda idéntico al de los demás
  tipos, que ya comunican bien el destino del dato. Menos ramas, cero ambigüedad.
- **No añadir un campo "Justificación general" nuevo**: la justificación obligatoria
  por ítem ya cubre control presupuestal/seguimiento; un campo general duplicado
  reintroduciría la confusión.

## Risks / Trade-offs

- **[Riesgo] Residentes habituados a escribir el motivo general del imprevisto en ese
  campo dejarán de tener dónde ponerlo** → Mitigación: existe "Notas internas para
  Compras" (`reqNotasInternas`, "Solo lo ve Compras — no se envía a proveedores") justo
  debajo, y la justificación por ítem es obligatoria; la advertencia visible guía al
  usuario a elegir el campo correcto.
- **[Trade-off] Requisiciones imprevistas históricas** conservan en `observaciones` texto
  que fue capturado como "justificación" — Compras ya lo ve marcado "para proveedores" y
  puede editarlo antes de enviar; no se hace limpieza retroactiva.

## Migration Plan

1. Test Playwright que reproduce el estado actual (etiqueta "Justificación" sin
   advertencia en IMPREVISTO) — debe fallar tras el fix, se escribe asertando el
   comportamiento NUEVO y se corre primero en rojo contra el código actual.
2. Cambio de etiqueta/placeholder/condición en `ResidenciaView.tsx`.
3. Test en verde + `tsc -b` de app-shell (gap conocido: CI no valida ese build).
4. PR → merge → redeploy manual de `app-shell` en VPS (compose build + up -d).

**Rollback**: revertir el commit (solo presentación).

## Open Questions

(ninguna)

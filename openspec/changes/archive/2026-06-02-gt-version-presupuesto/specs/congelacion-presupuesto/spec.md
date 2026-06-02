# Spec: Congelación de Presupuesto

## CA-1 — Estado inicial BORRADOR
- Todo presupuesto se crea con `estado = 'BORRADOR'`. Los conceptos pueden editarse y borrarse libremente.

## CA-2 — Aprobación irreversible
- `PATCH /presupuestos/:id/aprobar` transiciona a `APROBADO`. Registra `aprobado_por` y `fecha_aprobacion`.
- No existe endpoint para revertir a BORRADOR. Si se necesitan cambios, se crea nueva versión.
- Si el presupuesto ya está APROBADO → `409`.

## CA-3 — Bloqueo de edición de conceptos
- Intentar modificar o borrar un `ConceptoPresupuesto` cuyo presupuesto padre esté `APROBADO` → `409` con mensaje: "El presupuesto está aprobado y no puede modificarse. Crea una nueva versión si necesitas cambios."
- Los metadatos del presupuesto (nombre, descripción) sí pueden editarse aunque esté APROBADO.

## CA-4 — Visibilidad de estado en frontend
- Lista de presupuestos muestra badge por estado: BORRADOR (gris), APROBADO (verde).
- Botón "Aprobar" visible solo para BORRADOR + roles gerencia_tecnica/admin.
- Una vez aprobado, los botones de edición de conceptos se ocultan o deshabilitan.

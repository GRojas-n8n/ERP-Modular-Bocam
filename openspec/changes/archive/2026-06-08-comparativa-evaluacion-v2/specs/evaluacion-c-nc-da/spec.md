# Spec — Evaluación técnica C / NC / DA / ?

## Descripción

El Residente de Obra evalúa cada par (partida × proveedor) en el cuadro comparativo. Compras captura `valor_ofrecido_spec` sin responsabilidad técnica — su rol es transcribir lo que el proveedor ofrece. El Residente decide.

Valores válidos para `evaluacion_tecnica`:

- **PENDIENTE** — celda aún no evaluada (estado inicial).
- **C — Cumple** — cumplimiento total con las especificaciones requeridas.
- **NC — No Cumple** — discrepancia técnica que hace el material inaceptable. Requiere `comentario_tecnico` obligatorio explicando el rechazo.
- **DA — Desviación Aceptada** — existe una diferencia respecto a las especificaciones base, pero el Residente evalúa que no compromete el desempeño. Requiere `comentario_tecnico` que justifique la aceptación.
- **? — Información Insuficiente** — el Residente no puede evaluar con los datos actuales. Genera automáticamente una aclaración dirigida a Compras para que investiguen con el proveedor.

## Flujo del `?`

```
Residente marca celda como "?"
  → Backend crea AclaracionComparativa automáticamente
    { tipo: PREGUNTA, autor_id: residenteId, mensaje: comentario_tecnico }
  → Compras recibe la señal (celda destacada en su vista)
  → Compras investiga con el proveedor y actualiza valor_ofrecido_spec
  → Compras agrega respuesta: AclaracionComparativa { tipo: RESPUESTA }
  → Residente re-evalúa la celda como C / NC / DA
  → La aclaración se marca como resuelta automáticamente al re-evaluar
```

## Criterios de Aceptación

1. Un `ComparativaDetalle` en estado `PENDIENTE` solo puede evaluarse si el cuadro está en `EN_EVALUACION_TECNICA`.
2. Si se envía `evaluacion_tecnica = NC` o `DA`, el campo `comentario_tecnico` es obligatorio (backend retorna 400 si ausente).
3. Si se envía `evaluacion_tecnica = ?`, el campo `comentario_tecnico` es obligatorio y describe qué información falta. El backend crea automáticamente una `AclaracionComparativa` con ese texto como mensaje.
4. Si se envía `evaluacion_tecnica = C`, `comentario_tecnico` es opcional.
5. Si el cuadro está en `LOCKED`, cualquier intento de modificar `evaluacion_tecnica` retorna 403 `COMPARATIVA_LOCKED`.
6. El `valor_ofrecido_spec` puede actualizarse por Compras (`procurement`, `admin`) mientras el cuadro no esté LOCKED, incluso si el Residente ya marcó la celda como `?`. Actualizar `valor_ofrecido_spec` en una celda `?` envía una notificación implícita (la aclaración de respuesta la crea Compras manualmente).
7. Cuando el Residente re-evalúa una celda que estaba en `?` como C/NC/DA, el backend marca como `resuelta = true` todas las aclaraciones abiertas de esa celda automáticamente.

## Precondiciones para firmar (bloqueos)

El endpoint `POST /comparativas/:id/firmar` retorna 400 si:
- Algún detalle tiene `evaluacion_tecnica = PENDIENTE` → `EVALUACION_INCOMPLETA`
- Algún detalle tiene `evaluacion_tecnica = ?` → `EVALUACION_CON_PREGUNTAS_ABIERTAS`
- `primera_opcion_proveedor_id` es null → `PRIMERA_OPCION_REQUERIDA`
- El proveedor de primera opción tiene algún detalle con `evaluacion_tecnica = NC` → `SELECCION_INVALIDA_NC`

## Selección de proveedor

Al completar la evaluación, el Residente define su recomendación:
- `primera_opcion_proveedor_id` — obligatorio para firmar.
- `segunda_opcion_proveedor_id` — opcional.

Un proveedor seleccionado puede tener detalles `DA` pero ninguno `NC` ni `?`.

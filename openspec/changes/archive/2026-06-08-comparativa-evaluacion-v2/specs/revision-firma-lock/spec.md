# Spec — Revisiones, Firma Digital y Estado LOCKED

## Control de Versiones — Clonado Rev A → B → C

### Cuándo se crea una nueva revisión

Cuando hay cambios en los datos del cuadro que invalidan una evaluación en progreso (ej. un proveedor actualiza su cotización, o una aclaración revela un error en las especificaciones). El endpoint es `POST /api/v1/compras/comparativas/:id/nueva-revision`.

### Criterios de Aceptación — Revisiones

1. Solo se puede crear una nueva revisión si el cuadro original está en `EN_EVALUACION_TECNICA` o `LOCKED`. No se puede revisar un cuadro `CERRADO` o `SUPERSEDIDO`.
2. El backend clona: crea un nuevo `CuadroComparativo` con `revision = siguiente_letra` (A→B, B→C, etc.), `revision_padre_id = id_original`, `estado = BORRADOR`, copiando todos los `ComparativaDetalle` y `ComparativaLinea`. Los nuevos registros tienen nuevos UUIDs.
3. El cuadro original pasa a estado `SUPERSEDIDO` (inmutable, visible en historial).
4. La UI muestra un badge "Rev B" en el cuadro activo y permite navegar al historial de revisiones anteriores en modo solo lectura.
5. Roles que pueden crear revisión: `procurement`, `admin`.

## Firma Digital

### Propósito del mecanismo

La firma es un acto de responsabilidad explícita: el firmante acepta que revisó técnicamente cada renglón y que el documento es correcto. El sistema debe hacer imposible alegar desconocimiento posterior — "yo no dije que ese material cumplía" o "yo no requisité eso".

### Mecanismo de confirmación en UI (dos pasos obligatorios)

**Paso 1 — Resumen pre-firma (modal):**
Al hacer clic en "Firmar evaluación", el sistema despliega un modal no-dismissible (no se cierra con Escape ni con clic fuera) que muestra:

- Nombre completo del cuadro comparativo (código + requisición origen)
- Nombre del firmante tal como aparece en el sistema (del JWT)
- Tabla resumen de la evaluación:
  - Total de renglones evaluados
  - Conteo de C / NC / DA por proveedor
  - Proveedor seleccionado como 1ª opción
  - Proveedor seleccionado como 2ª opción (si aplica)
- Texto de advertencia visible en rojo: **"Esta acción es irreversible. Una vez firmada, la evaluación técnica no podrá modificarse por ningún usuario."**
- Checkbox obligatorio con el texto: **"Confirmo que revisé personalmente cada renglón de esta requisición y acepto responsabilidad técnica por esta evaluación."**
- El botón "Firmar y Bloquear" está deshabilitado hasta que el checkbox esté marcado.

**Paso 2 — Confirmación final:**
Al hacer clic en "Firmar y Bloquear" (habilitado solo tras el checkbox):
- Se llama `POST /comparativas/:id/firmar`
- Si la respuesta es exitosa: el modal se cierra, la vista del cuadro actualiza su estado a LOCKED y muestra el badge de firma.
- Si falla por alguna precondición (ej. alguien agregó un `?` entre que se abrió el modal y se confirmó): mostrar el error específico sin cerrar el modal.

### Endpoint: POST /api/v1/compras/comparativas/:id/firmar

Pre-condiciones que el backend valida (retorna 400 con código de error específico si fallan):
- El cuadro está en `EN_EVALUACION_TECNICA` → `ESTADO_INVALIDO_FIRMA`
- Ningún `ComparativaDetalle` tiene `evaluacion_tecnica = PENDIENTE` → `EVALUACION_INCOMPLETA`
- Ningún `ComparativaDetalle` tiene `evaluacion_tecnica = ?` → `EVALUACION_CON_PREGUNTAS_ABIERTAS`
- `primera_opcion_proveedor_id` no es null → `PRIMERA_OPCION_REQUERIDA`
- El proveedor de primera opción no tiene ningún detalle con `evaluacion_tecnica = NC` ni `?` → `SELECCION_INVALIDA_NC`

Si todas pasan, el backend ejecuta en una sola transacción:
1. `cuadro.firmado_por = req.securityContext.userId`
2. `cuadro.fecha_firma = new Date()`
3. `cuadro.estado = 'LOCKED'`
4. `logInfo(req, 'compras', 'compras.comparativa_firmada', ...)` con `cuadro_id`, `codigo`, `firmado_por`, `primera_opcion_proveedor_id` — registro auditable permanente.

Respuesta: 200 con el cuadro actualizado incluyendo `firmado_por` y `fecha_firma`.

Roles que pueden firmar: `resident`, `admin`.

## Estado LOCKED e Inmutabilidad

### Comportamiento en backend

Cualquier endpoint que intente modificar un cuadro `LOCKED` (PUT de detalles, PUT de líneas, PUT de selección, POST de aclaraciones) retorna 403 con `{ success: false, message: 'COMPARATIVA_LOCKED: El cuadro está firmado y es de solo lectura.' }`.

### Trigger de base de datos

```sql
CREATE OR REPLACE FUNCTION fn_prevent_locked_comparativa_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'LOCKED' THEN
    RAISE EXCEPTION 'cannot_modify_locked_comparativa: cuadro % está LOCKED', OLD.id_cuadro;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comparativa_locked
BEFORE UPDATE OR DELETE ON cuadros_comparativos
FOR EACH ROW EXECUTE FUNCTION fn_prevent_locked_comparativa_modification();
```

Este trigger actúa como failsafe: si un bug en el backend omite la validación, el motor de base de datos rechaza la operación igualmente.

### Detalles del LOCKED en UI

- Badge "LOCKED 🔒" visible en el header del cuadro con fecha y nombre del firmante.
- Todos los inputs de evaluación, valores de especificación y selección de proveedor quedan en modo solo lectura.
- Los botones de "Evaluar" y "Firmar" desaparecen.
- La UI muestra el badge de revisión activa (ej. "Rev B") con enlace al historial.

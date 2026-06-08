# Proposal — comparativa-evaluacion-v2

## Why

El cuadro comparativo actual tiene una evaluación técnica binaria (APROBADO/RECHAZADO) que no refleja la realidad de la ingeniería: un material puede cumplir parcialmente con variantes aceptables (Desviación Aceptada). Tampoco existe trazabilidad de qué valor técnico ofreció cada proveedor versus la especificación base, ni gestión de aclaraciones cuando hay datos ambiguos. Finalmente, el cuadro no tiene inmutabilidad legal una vez que el Residente evalúa: puede ser editado retroactivamente, lo que viola los principios ISO 9001 de integridad del registro.

## What Changes

### Evaluación técnica granular C / NC / DA

`ComparativaDetalle.evaluacion_tecnica` cambia de `PENDIENTE/APROBADO/RECHAZADO` a `PENDIENTE/C/NC/DA`:
- **C** (Cumple): cumplimiento total.
- **NC** (No Cumple): rechazo técnico con justificación.
- **DA** (Desviación Aceptada): variante admitida que no compromete el desempeño.

Se agrega `valor_ofrecido_spec` (Text) en `ComparativaDetalle`: el valor concreto que el proveedor ofrece para esa partida (ej. "Ø 2" cédula 40 A53").

### Selección de primera y segunda opción

`CuadroComparativo` recibe `primera_opcion_proveedor_id` y `segunda_opcion_proveedor_id` (UUID nullable). El Residente los define al concluir la evaluación técnica.

### Gestión de aclaraciones por celda

Nuevo modelo `AclaracionComparativa` con hilos por `(cuadro_id, insumo_id, proveedor_id)`. Cada mensaje tiene `tipo` = `PREGUNTA` | `RESPUESTA`, `autor_id`, `mensaje`, `created_at`. Una celda marcada como ambigua (?) muestra el contador de mensajes no resueltos.

### Control de versiones — clonado (Rev A → B → C)

Cuando el Residente o Compras detecta que hay aclaraciones que cambian datos ya ingresados, se crea una nueva revisión. El backend clona el `CuadroComparativo` completo (todos sus `ComparativaDetalle` y `ComparativaLinea`), incrementa el campo `revision` (A→B→C→D), y setea `revision_padre_id` al cuadro original. El cuadro padre queda en estado `SUPERSEDIDO` (solo lectura).

### Firma digital y estado LOCKED

`POST /comparativas/:id/firmar` — acción protegida. Solo el usuario con rol `resident` o `admin` asignado como evaluador puede ejecutarla. Captura `firmado_por` (userId del JWT) y `fecha_firma`. Cambia el estado a `LOCKED`.

### Inmutabilidad a nivel motor de base de datos

Trigger PostgreSQL `BEFORE UPDATE OR DELETE` en `cuadros_comparativos`: si `OLD.estado = 'LOCKED'`, lanza excepción `cannot_modify_locked_comparativa`. Esto garantiza que ningún código de aplicación (ni un bug, ni un script de mantenimiento) pueda alterar un cuadro firmado.

## Capabilities

**Modificada:** Evaluación técnica pasa de binaria a C/NC/DA con valor ofrecido.
**Nueva:** Gestión de aclaraciones por celda (renglón × proveedor).
**Nueva:** Control de versiones por clonado con cadena de revisiones.
**Nueva:** Firma digital y estado LOCKED con inmutabilidad en DB.
**Nueva:** Selección de primera y segunda opción de proveedor.

## Impact

- Migración de schema `compras`: cambio de valores en `evaluacion_tecnica` + nuevos campos en `CuadroComparativo` + nuevo modelo `AclaracionComparativa`.
- Trigger SQL nuevo (migración manual en VPS vía SQL directo como en `changes/oc-error-finanzas-alert`).
- Frontend `ComparativaDetail.tsx` y `ResidenciaView.tsx`: cambios significativos en la UI de evaluación.
- Sin impacto en otros módulos.
- **Requiere** `proveedores-catalogo-v2` completado antes del deploy (depende de la estructura de proveedor actualizada para mostrar info en la UI).

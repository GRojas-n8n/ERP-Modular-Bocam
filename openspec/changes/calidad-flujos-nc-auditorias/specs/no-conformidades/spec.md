## MODIFIED Requirements

### Requirement: Crear pago contra OC genera MovimientoPoliza en contabilidad

El endpoint `PATCH /api/v1/calidad/no-conformidades/:id` ahora SHALL aplicar la máquina de estados validada con precondiciones por transición (ver spec `workflow-nc`), en lugar de aceptar cualquier valor de `estado` libremente.

El endpoint también SHALL aceptar el campo `causa_raiz` en el body y guardarlo en la NC cuando se provee (independientemente de la transición de estado), para permitir documentar la causa raíz antes de realizar la transición formal a `ACCION_CORRECTIVA`.

`AccionCorrectiva` SHALL incluir los campos `verificado_por` (UUID nullable) y `fecha_verificacion` (DateTime nullable) que se populan automáticamente cuando el estado cambia a `VERIFICADA`.

#### Scenario: PATCH NC sin cambio de estado actualiza solo campos
- **WHEN** usuario hace `PATCH` con `{ causa_raiz: "Falta de procedimiento escrito" }` sin campo `estado`
- **THEN** la NC actualiza `causa_raiz` sin cambiar de estado y retorna 200

#### Scenario: PATCH NC con estado aplica validación de transición
- **WHEN** usuario hace `PATCH` con `{ estado: "EN_VERIFICACION" }` sobre NC en `ACCION_CORRECTIVA` sin acciones COMPLETADAS
- **THEN** retorna 422 con `NC_SIN_ACCIONES_COMPLETADAS`

#### Scenario: AccionCorrectiva VERIFICADA registra verificador
- **WHEN** `PATCH /no-conformidades/:id/acciones/:aid` recibe `{ estado: "VERIFICADA" }`
- **THEN** `AccionCorrectiva.verificado_por = req.userId` y `fecha_verificacion = now()`
- **THEN** la respuesta incluye `verificado_por` y `fecha_verificacion` en el objeto retornado

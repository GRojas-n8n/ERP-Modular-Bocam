## ADDED Requirements

### Requirement: Transiciones de estado NC con precondiciones ISO 9001

El sistema SHALL validar las precondiciones de cada transición al recibir `PATCH /api/v1/calidad/no-conformidades/:id` con un nuevo `estado`. Transiciones inválidas o sin precondiciones cumplidas deben retornar 422.

#### Scenario: Transición libre ABIERTA → EN_ANALISIS
- **WHEN** usuario con rol `calidad` o `admin` hace PATCH con `{ estado: "EN_ANALISIS" }` sobre NC en estado `ABIERTA`
- **THEN** la NC cambia a `EN_ANALISIS` y retorna 200

#### Scenario: Transición EN_ANALISIS → ACCION_CORRECTIVA requiere causa_raiz
- **WHEN** usuario hace PATCH con `{ estado: "ACCION_CORRECTIVA" }` y la NC no tiene `causa_raiz` registrada y el body tampoco la incluye
- **THEN** retorna 422 con código `NC_CAUSA_RAIZ_REQUERIDA`

#### Scenario: Transición EN_ANALISIS → ACCION_CORRECTIVA con causa_raiz en body
- **WHEN** usuario hace PATCH con `{ estado: "ACCION_CORRECTIVA", causa_raiz: "Falta de capacitación" }`
- **THEN** la NC guarda `causa_raiz` y cambia a `ACCION_CORRECTIVA`

#### Scenario: Transición ACCION_CORRECTIVA → EN_VERIFICACION requiere acción completada
- **WHEN** usuario hace PATCH con `{ estado: "EN_VERIFICACION" }` y ninguna `AccionCorrectiva` de la NC tiene `estado = COMPLETADA`
- **THEN** retorna 422 con código `NC_SIN_ACCIONES_COMPLETADAS`

#### Scenario: Transición EN_VERIFICACION → CERRADA requiere acción verificada
- **WHEN** usuario hace PATCH con `{ estado: "CERRADA" }` y ninguna `AccionCorrectiva` tiene `estado = VERIFICADA`
- **THEN** retorna 422 con código `NC_SIN_ACCIONES_VERIFICADAS`

#### Scenario: Cierre exitoso registra fecha_cierre
- **WHEN** la transición a `CERRADA` cumple precondiciones
- **THEN** la NC guarda `fecha_cierre = now()` y retorna 200

#### Scenario: Reapertura solo para admin
- **WHEN** usuario con rol `calidad` (no admin) hace PATCH con `{ estado: "ABIERTA" }` sobre NC cerrada
- **THEN** retorna 403 con código `NC_REABRIR_REQUIERE_ADMIN`

#### Scenario: Reapertura por admin
- **WHEN** usuario con rol `admin` hace PATCH con `{ estado: "ABIERTA", nota_reabrir: "Revisión solicitada por dirección" }`
- **THEN** la NC vuelve a `ABIERTA` y `fecha_cierre` se limpia a null

#### Scenario: Transición inválida rechazada
- **WHEN** usuario hace PATCH con `{ estado: "CERRADA" }` sobre NC en estado `ABIERTA` (saltando pasos)
- **THEN** retorna 422 con código `NC_TRANSICION_INVALIDA`

### Requirement: Verificación de AccionCorrectiva con trazabilidad

El sistema SHALL permitir actualizar una `AccionCorrectiva` a estado `VERIFICADA`, registrando `verificado_por` (userId del verificador) y `fecha_verificacion` (timestamp).

#### Scenario: Marcar acción como verificada
- **WHEN** usuario con rol `calidad` o `admin` hace PATCH en `/no-conformidades/:id/acciones/:aid` con `{ estado: "VERIFICADA" }`
- **THEN** la acción guarda `verificado_por = userId`, `fecha_verificacion = now()` y `estado = VERIFICADA`

#### Scenario: Campos de verificación no sobreescriben si ya están
- **WHEN** la acción ya tiene `verificado_por` y se hace PATCH con `{ estado: "VERIFICADA" }` nuevamente
- **THEN** retorna idempotente 200 sin sobrescribir `verificado_por` ni `fecha_verificacion`

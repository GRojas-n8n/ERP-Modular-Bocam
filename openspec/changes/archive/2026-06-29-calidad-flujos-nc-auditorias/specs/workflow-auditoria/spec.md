## ADDED Requirements

### Requirement: Cambio de estado de AuditoriaInterna

El sistema SHALL exponer `PATCH /api/v1/calidad/auditorias/:id` para transicionar el estado de una auditoría entre `PROGRAMADA`, `EN_CURSO`, `COMPLETADA` y `CANCELADA`.

#### Scenario: Iniciar auditoría programada
- **WHEN** usuario con rol `calidad` o `admin` hace PATCH con `{ estado: "EN_CURSO" }` sobre auditoría en `PROGRAMADA`
- **THEN** la auditoría cambia a `EN_CURSO` y retorna 200 con el objeto actualizado

#### Scenario: Completar auditoría en curso
- **WHEN** usuario hace PATCH con `{ estado: "COMPLETADA", observaciones: "..." }` sobre auditoría en `EN_CURSO`
- **THEN** la auditoría cambia a `COMPLETADA` y guarda las observaciones si se proveen

#### Scenario: Cancelar auditoría
- **WHEN** usuario con rol `admin` hace PATCH con `{ estado: "CANCELADA" }` sobre auditoría en cualquier estado no-terminal
- **THEN** la auditoría cambia a `CANCELADA`

#### Scenario: Transición inválida rechazada
- **WHEN** se intenta mover `COMPLETADA` → `EN_CURSO`
- **THEN** retorna 422 con código `AUD_TRANSICION_INVALIDA`

### Requirement: Actualizar estado de HallazgoAuditoria

El sistema SHALL exponer `PATCH /api/v1/calidad/auditorias/:id/hallazgos/:hid` para actualizar el estado de un hallazgo (`ABIERTO`, `EN_SEGUIMIENTO`, `CERRADO`) y su campo `evidencia`.

#### Scenario: Pasar hallazgo a EN_SEGUIMIENTO
- **WHEN** usuario con rol `calidad` o `admin` hace PATCH con `{ estado: "EN_SEGUIMIENTO" }`
- **THEN** el hallazgo actualiza su estado y retorna 200

#### Scenario: Cerrar hallazgo con evidencia
- **WHEN** usuario hace PATCH con `{ estado: "CERRADO", evidencia: "Foto de corrección aplicada" }`
- **THEN** el hallazgo guarda `evidencia` y cambia a `CERRADO`

#### Scenario: Hallazgo de otra auditoría rechazado
- **WHEN** el `hid` no pertenece a la auditoría indicada por `id`
- **THEN** retorna 404 con `HALLAZGO_NOT_FOUND`

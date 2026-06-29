## ADDED Requirements

### Requirement: Conversión de HallazgoAuditoria a NoConformidad

El sistema SHALL exponer `POST /api/v1/calidad/auditorias/:id/hallazgos/:hid/crear-nc` que crea una `NoConformidad` a partir de un hallazgo y guarda el `nc_id` resultante en el hallazgo para trazabilidad.

#### Scenario: Conversión exitosa de hallazgo a NC
- **WHEN** usuario con rol `calidad` o `admin` hace POST a `.../crear-nc` con `{ responsable_id?, fecha_limite? }`
- **THEN** se crea una `NoConformidad` con:
  - `fuente = "AUDITORIA"`
  - `titulo` derivado del hallazgo (`descripcion` truncada a 255 chars)
  - `descripcion` con el texto completo del hallazgo + proceso_afectado
  - `estado = "ABIERTA"`
  - `detectado_por = userId`
- **THEN** el hallazgo se actualiza con `nc_id = nc.id_nc`
- **THEN** retorna 201 con `{ nc: NoConformidad, hallazgo: HallazgoAuditoria }`

#### Scenario: Idempotencia — hallazgo ya tiene NC
- **WHEN** el hallazgo ya tiene `nc_id` asignado y se vuelve a llamar el endpoint
- **THEN** retorna 409 con código `HALLAZGO_YA_TIENE_NC` e incluye el `nc_id` existente en la respuesta

#### Scenario: Hallazgo no encontrado
- **WHEN** el `hid` no existe o no pertenece a la auditoría `id`
- **THEN** retorna 404 con `HALLAZGO_NOT_FOUND`

### Requirement: Campo nc_id en HallazgoAuditoria

El sistema SHALL agregar campo `nc_id String? @db.Uuid` al modelo `HallazgoAuditoria` en el schema de Prisma para almacenar la referencia a la NC generada.

#### Scenario: Hallazgo sin NC muestra nc_id null
- **WHEN** se consulta `GET /api/v1/calidad/auditorias/:id` y un hallazgo no tiene NC asociada
- **THEN** el hallazgo incluye `nc_id: null` en la respuesta

#### Scenario: Hallazgo con NC incluye nc_id en respuesta
- **WHEN** el hallazgo tiene NC asociada
- **THEN** el hallazgo incluye `nc_id: "<uuid>"` en la respuesta para que el frontend pueda enlazarlo
